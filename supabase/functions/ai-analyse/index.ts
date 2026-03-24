import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_CONTEXT = `You are an AI adoption advisor embedded in a practical guide for evaluating AI adoption at the workflow level. Your job is to analyse a workflow step that a user wants to change and provide structured advice.

You understand the following AI paradigms and their risk profiles:

1. Rules and automation: Deterministic logic. If X then Y. Predictable, auditable, rigid. Best for: routing, validation, formatting, calculations. Not AI, but often the right answer.

2. RAG (retrieval-augmented generation): An LLM retrieves from a knowledge base before generating. Grounded in sources. Risks: source quality determines output, access control matters, citation does not guarantee correctness.

3. LLM as copilot: A language model supports a human. Drafts, summarises, explains. Human reviews everything. Risks: hallucination (plausible but wrong output), prompt sensitivity, inconsistency, knowledge cut-off dates, limited context windows.

4. Machine learning: Trained models for classification, scoring, prediction from data. Risks: bias in training data, data drift, black-box decisions.

5. LLM as agent: An LLM takes autonomous multi-step actions. Highest risk. Risks: loss of control, scope creep, compounding errors.

6. Hybrid: Deterministic core for critical logic (calculations, rules) combined with AI for language-rich parts (narrative, summaries). Risks: architectural complexity, boundary enforcement between deterministic and generative.

Important principles:
- Not every problem needs AI. Sometimes better processes, templates or simple automation solve it.
- A single workflow step often contains a mix of human work, deterministic work and AI work.
- The boundary between deterministic and generative is critical. An LLM can be asked to follow rules but it is probabilistic, not deterministic. A rules engine is always deterministic.
- AI is exceptionally good at routine work. The risk is letting it handle the parts where judgement, accountability or accuracy matter.
- Most useful AI adoption lives in the range where humans and AI share control, not full autonomy.

When responding:
- Be practical and specific to the user's description
- Use plain language, not jargon
- Be honest about risks and limitations
- Suggest what should stay with people and why
- If a simpler non-AI solution would work, say so
- Keep responses concise and structured
- Use UK English, no em dashes, no Oxford commas`;

const MAX_PAYLOAD_BYTES = 32_000; // ~32 KB
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_REQUESTS = 10;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");

  // Origin check (browser hygiene only — spoofable outside browsers).
  // Real abuse protection comes from rate limits + daily cap below.
  // For stronger control: add Turnstile or Supabase anon auth.
  const originAllowed =
    !allowedOrigin || origin.startsWith(allowedOrigin);

  const corsHeaders = {
    "Access-Control-Allow-Origin": originAllowed ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (!originAllowed) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only POST
  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  if (!originAllowed) {
    return errorResponse("Forbidden", 403);
  }

  // Payload size check
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return errorResponse("Payload too large", 413);
  }

  // Parse body
  let body: { prompt: string; context: string };
  try {
    const raw = await req.text();
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return errorResponse("Payload too large", 413);
    }
    body = JSON.parse(raw);
  } catch {
    return errorResponse("Invalid JSON", 400);
  }

  if (!body.prompt || typeof body.prompt !== "string") {
    return errorResponse("Missing 'prompt' field", 400);
  }
  if (!body.context || typeof body.context !== "string") {
    return errorResponse("Missing 'context' field", 400);
  }

  // Supabase client for rate limiting
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const clientIp = getClientIp(req);
  const now = new Date();

  // Per-IP rate limit
  const windowStart = new Date(
    now.getTime() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count: ipCount } = await supabase
    .from("usage_log")
    .select("*", { count: "exact", head: true })
    .eq("ip", clientIp)
    .gte("created_at", windowStart);

  if ((ipCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
    return errorResponse(
      "Rate limit reached. Please try again in a few minutes.",
      429
    );
  }

  // Daily global cap
  const dailyCap = parseInt(Deno.env.get("DAILY_CAP") || "500", 10);
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count: dailyCount } = await supabase
    .from("usage_log")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dayStart.toISOString());

  if ((dailyCount ?? 0) >= dailyCap) {
    return errorResponse("Daily usage limit reached. Try again tomorrow.", 429);
  }

  // Call Gemini
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return errorResponse("Service configuration error", 500);
  }

  let geminiResponse: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    geminiResponse = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
        contents: [{ parts: [{ text: body.prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return errorResponse("Analysis timed out. Try again.", 504);
    }
    return errorResponse("Analysis unavailable", 502);
  }

  if (!geminiResponse.ok) {
    return errorResponse("Analysis unavailable", 502);
  }

  let resultText: string;
  try {
    const data = await geminiResponse.json();
    resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis generated. Try again.";
  } catch {
    return errorResponse("Failed to parse response", 502);
  }

  // Log usage (non-blocking)
  supabase
    .from("usage_log")
    .insert({ ip: clientIp, endpoint: "ai-analyse", status: 200 })
    .then(() => {});

  return new Response(JSON.stringify({ result: resultText }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
});
