// This module calls a Hugging Face Space that proxies to the Gemini API.
// The API key lives on the HF Space as a secret, never in this codebase.

// TODO: Replace with your actual HF Space URL once deployed
const HF_SPACE_URL = 'https://YOUR_USERNAME-adoption-eval-api.hf.space/api/predict';

export async function analyseStep(
  stepName: string,
  stepPain: string,
  userDescription: string,
  workflowContext: string,
): Promise<string> {
  try {
    const response = await fetch(HF_SPACE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [workflowContext, stepName, stepPain, userDescription],
      }),
    });

    if (!response.ok) {
      return `Analysis unavailable. Service returned status ${response.status}.`;
    }

    const result = await response.json();
    return result?.data?.[0] || 'No analysis generated. Try again.';
  } catch (err) {
    console.error('Analysis error:', err);
    return 'Analysis unavailable. The service may be starting up. Try again in a moment.';
  }
}
