// This module calls a Hugging Face Space that proxies to the Gemini API.
// The API key lives on the HF Space as a secret, never in this codebase.

const HF_SPACE_URL = 'https://cantcomeupwithaname-adoption-eval-api.hf.space/gradio_api/call/predict';
const API_TOKEN = 'ae-2026-kw-pilot';

export async function analyseWorkflow(
  workflowName: string,
  painPoint: string,
  steps: Array<{ id: string; name: string; owner?: string; pain?: string }>,
): Promise<Record<string, { isCandidate: boolean; description: string }>> {
  const stepList = steps.map((s, i) => `${i + 1}. "${s.name}" (owner: ${s.owner || 'unknown'})${s.pain ? ` — pain: ${s.pain}` : ''}`).join('\n');

  const prompt = `Analyse this workflow and suggest interventions for each step.

Workflow: "${workflowName}"
Overall pain: "${painPoint}"

Steps:
${stepList}

For each step, respond with a JSON array where each element has:
- "id": the step id (s1, s2, etc.)
- "isCandidate": true if this step should change, false if it should stay as is
- "description": if isCandidate is true, describe what should change and how in plain language. If false, leave empty.

Focus on practical changes. Not every step needs to change. Be specific about what kind of automation or AI would help and what should stay with people. Use UK English, no em dashes.

Respond ONLY with the JSON array, no other text.`;

  try {
    const submitResponse = await fetch(HF_SPACE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [workflowName, 'all steps', painPoint, prompt, API_TOKEN],
      }),
    });

    if (!submitResponse.ok) return {};

    const { event_id } = await submitResponse.json();
    if (!event_id) return {};

    const resultResponse = await fetch(`${HF_SPACE_URL}/${event_id}`);
    if (!resultResponse.ok) return {};

    const text = await resultResponse.text();
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === 'event: complete' && lines[i + 1]?.startsWith('data: ')) {
        const rawData = JSON.parse(lines[i + 1].slice(6));
        const responseText = rawData[0] || '';
        // Extract JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const result: Record<string, { isCandidate: boolean; description: string }> = {};
          parsed.forEach((item: any, idx: number) => {
            const stepId = item.id || steps[idx]?.id || `s${idx + 1}`;
            result[stepId] = {
              isCandidate: !!item.isCandidate,
              description: item.description || '',
            };
          });
          return result;
        }
      }
    }
    return {};
  } catch (err) {
    console.error('Workflow analysis error:', err);
    return {};
  }
}

export async function analyseStep(
  stepName: string,
  stepPain: string,
  userDescription: string,
  workflowContext: string,
): Promise<string> {
  try {
    // Step 1: Submit the request and get an event ID
    const submitResponse = await fetch(HF_SPACE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [workflowContext, stepName, stepPain, userDescription, API_TOKEN],
      }),
    });

    if (!submitResponse.ok) {
      return `Analysis unavailable. Service returned status ${submitResponse.status}.`;
    }

    const { event_id } = await submitResponse.json();
    if (!event_id) {
      return 'Analysis unavailable. No event ID returned.';
    }

    // Step 2: Poll for the result using server-sent events
    const resultResponse = await fetch(`${HF_SPACE_URL}/${event_id}`);
    if (!resultResponse.ok) {
      return `Analysis unavailable. Result fetch returned status ${resultResponse.status}.`;
    }

    const text = await resultResponse.text();
    // Parse the SSE response — look for the "complete" event
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === 'event: complete' && lines[i + 1]?.startsWith('data: ')) {
        const data = JSON.parse(lines[i + 1].slice(6));
        return data[0] || 'No analysis generated. Try again.';
      }
    }

    return 'No analysis generated. Try again.';
  } catch (err) {
    console.error('Analysis error:', err);
    return 'Analysis unavailable. The service may be starting up. Try again in a moment.';
  }
}
