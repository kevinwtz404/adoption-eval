// This module calls a Hugging Face Space that proxies to the Gemini API.
// The API key lives on the HF Space as a secret, never in this codebase.

const HF_SPACE_URL = 'https://cantcomeupwithaname-adoption-eval-api.hf.space/gradio_api/call/predict';
const API_TOKEN = 'ae-2026-kw-pilot';

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
