// Supabase Edge Function proxy for Gemini API calls.
// The Gemini key lives server-side only, never in this codebase.

const API_URL = import.meta.env.PUBLIC_AI_API_URL;

export async function callAI(prompt: string, context: string): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    if (response.status === 429) {
      const data = await response.json();
      throw new Error(data.error || 'Rate limit reached. Please try again in a few minutes.');
    }

    if (!response.ok) return '';

    const data = await response.json();
    return data.result || '';
  } catch (err) {
    if (err instanceof Error && err.message.includes('Rate limit')) {
      throw err; // Re-throw rate limit errors so UI can show them
    }
    console.error('AI call error:', err);
    return '';
  }
}
