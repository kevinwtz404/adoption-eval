// This module calls a Hugging Face Space that proxies to the Gemini API.
// The API key lives on the HF Space as a secret, never in this codebase.

const HF_SPACE_URL = 'https://cantcomeupwithaname-adoption-eval-api.hf.space/gradio_api/call/predict';
const API_TOKEN = 'ae-2026-kw-pilot';

export interface RedesignComponent {
  name: string;
  type: 'llm' | 'tool' | 'rag' | 'ml' | 'human' | 'deterministic';
  description: string;
  risks: string[];
  considerations: string[];
}

export interface RedesignResult {
  narrative: string;
  components: RedesignComponent[];
  boundaries: string[];
  confidentiality: string[];
  costFactors: string[];
  humanCheckpoints: string[];
}

async function callGemini(prompt: string, context: string): Promise<string> {
  try {
    const submitResponse = await fetch(HF_SPACE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [context, 'workflow analysis', '', prompt, API_TOKEN],
      }),
    });

    if (!submitResponse.ok) return '';

    const { event_id } = await submitResponse.json();
    if (!event_id) return '';

    const resultResponse = await fetch(`${HF_SPACE_URL}/${event_id}`);
    if (!resultResponse.ok) return '';

    const text = await resultResponse.text();
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === 'event: complete' && lines[i + 1]?.startsWith('data: ')) {
        const rawData = JSON.parse(lines[i + 1].slice(6));
        return rawData[0] || '';
      }
    }
    return '';
  } catch (err) {
    console.error('Gemini call error:', err);
    return '';
  }
}

export async function analyseWorkflow(
  workflowName: string,
  painPoint: string,
  steps: Array<{ id: string; name: string; owner?: string; pain?: string }>,
): Promise<RedesignResult | null> {
  const stepList = steps.map((s, i) => `${i + 1}. "${s.name}" (owner: ${s.owner || 'unknown'})${s.pain ? ` — pain: ${s.pain}` : ''}`).join('\n');

  const prompt = `Analyse this workflow and design an intervention.

Workflow: "${workflowName}"
Overall pain: "${painPoint}"

Current steps:
${stepList}

Respond with a JSON object (no other text) with this exact structure:
{
  "narrative": "A flowing description of the redesigned workflow in plain language. Describe how the work would flow from start to finish after the intervention. Be specific about what AI does, what stays with people and what is deterministic automation. Use UK English, no em dashes.",
  "components": [
    {
      "name": "short name for this component",
      "type": "one of: llm, tool, rag, ml, human, deterministic",
      "description": "what this component does in the redesigned workflow",
      "risks": ["specific risk 1", "specific risk 2"],
      "considerations": ["what to think about when building this"]
    }
  ],
  "boundaries": [
    "specific boundary or control needed, e.g. 'AI output must be reviewed before external use'"
  ],
  "confidentiality": [
    "specific data privacy or confidentiality consideration, e.g. 'salary data must not be accessible to the retrieval system', 'consider a local model for processing personal data', 'evaluate whether data can be sent to a cloud API'"
  ],
  "costFactors": [
    "specific cost consideration, e.g. 'LLM calls for each lead will add up at scale', 'a smaller model may work for the classification step'"
  ],
  "humanCheckpoints": [
    "specific point where a human must review or approve, e.g. 'CFO must approve the final report before distribution'"
  ]
}

Be practical and specific to this workflow. Not generic advice. Think about what data is involved, who should see what, what happens when things go wrong. Consider whether local models (like Ollama) would be more appropriate than cloud models for sensitive data.`;

  const responseText = await callGemini(prompt, workflowName);
  if (!responseText) return null;

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RedesignResult;
    }
  } catch (err) {
    console.error('Failed to parse redesign JSON:', err);
  }
  return null;
}

export async function analyseStep(
  stepName: string,
  stepPain: string,
  userDescription: string,
  workflowContext: string,
): Promise<string> {
  const prompt = `The user is evaluating a workflow called "${workflowContext}".

They are looking at a specific step:
- Step: "${stepName}"
- Current pain point: "${stepPain}"
- What they want to change: "${userDescription}"

Analyse this and provide:
1. What kind of approach (AI or non-AI) fits here and why
2. What should stay with people in this step and why
3. What are the specific risks of this approach
4. What boundaries or controls would be needed
5. Any simpler alternatives they should consider first

Be concise and practical. Structure your response with clear headings.`;

  return await callGemini(prompt, workflowContext) || 'Analysis unavailable. Try again.';
}
