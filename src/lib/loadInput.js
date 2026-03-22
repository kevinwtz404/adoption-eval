import fs from 'node:fs/promises';

function normaliseWorkflowShape(data) {
  if (data?.workflow) return data;

  // Backward-compatible v0 examples: { scenario, steps }
  if (Array.isArray(data?.steps)) {
    const scenario = data.scenario || 'custom';
    return {
      workflow: {
        name: scenario,
        steps: data.steps,
        actors: [...new Set(data.steps.map((s) => s.owner).filter(Boolean))],
        data_assets: data.data_assets || [],
        success_metrics: data.success_metrics || ['cycle_time_reduction', 'quality_stability'],
      },
    };
  }

  return data;
}

export async function loadInput(inputPath) {
  const raw = await fs.readFile(inputPath, 'utf8');
  const parsed = JSON.parse(raw);
  return normaliseWorkflowShape(parsed);
}
