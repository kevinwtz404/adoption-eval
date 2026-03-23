import os
import json
import gradio as gr
import requests
from datetime import datetime, timedelta
from collections import defaultdict

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Simple rate limiting: max calls per IP per hour
RATE_LIMIT = 20
rate_tracker: dict[str, list[datetime]] = defaultdict(list)

SYSTEM_CONTEXT = """You are an AI adoption advisor embedded in a practical guide for evaluating AI adoption at the workflow level. Your job is to analyse a workflow step that a user wants to change and provide structured advice.

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
- Use UK English, no em dashes, no Oxford commas"""


def check_rate_limit(request: gr.Request) -> bool:
    """Simple rate limiting by IP."""
    if not request:
        return True
    ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    cutoff = now - timedelta(hours=1)
    rate_tracker[ip] = [t for t in rate_tracker[ip] if t > cutoff]
    if len(rate_tracker[ip]) >= RATE_LIMIT:
        return False
    rate_tracker[ip].append(now)
    return True


def analyse_step(
    workflow_context: str,
    step_name: str,
    step_pain: str,
    user_description: str,
    request: gr.Request = None,
) -> str:
    if not GEMINI_API_KEY:
        return "API key not configured on the server."

    if not check_rate_limit(request):
        return "Rate limit reached. Please try again later."

    if not user_description.strip():
        return "Please describe what you want to change about this step."

    prompt = f"""The user is evaluating a workflow called "{workflow_context}".

They are looking at a specific step:
- Step: "{step_name}"
- Current pain point: "{step_pain}"
- What they want to change: "{user_description}"

Analyse this and provide:
1. What kind of approach (AI or non-AI) fits here and why
2. What should stay with people in this step and why
3. What are the specific risks of this approach
4. What boundaries or controls would be needed
5. Any simpler alternatives they should consider first

Be concise and practical. Structure your response with clear headings."""

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                "system_instruction": {"parts": [{"text": SYSTEM_CONTEXT}]},
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1024,
                },
            },
            headers={"Content-Type": "application/json"},
            timeout=30,
        )

        if response.status_code != 200:
            return f"Analysis unavailable. API returned status {response.status_code}."

        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return text or "No analysis generated. Try again."

    except requests.Timeout:
        return "Analysis timed out. Try again."
    except Exception as e:
        return f"Analysis unavailable: {str(e)}"


demo = gr.Interface(
    fn=analyse_step,
    inputs=[
        gr.Textbox(label="Workflow context"),
        gr.Textbox(label="Step name"),
        gr.Textbox(label="Current pain"),
        gr.Textbox(label="What do you want to change?", lines=3),
    ],
    outputs=gr.Textbox(label="Analysis", lines=15),
    title="adoption-eval: Step Analysis",
    description="Analyses a workflow step and recommends an AI adoption approach.",
    allow_flagging="never",
)

if __name__ == "__main__":
    demo.launch()
