import fs from 'node:fs/promises';
import type { WorkflowInput, WorkflowStep } from '../types.js';

function normaliseWorkflowShape(data: unknown): WorkflowInput {
  const d = data as Record<string, unknown>;

  if (d?.workflow) return d as unknown as WorkflowInput;

  // Backward-compatible v0 examples: { scenario, steps }
  const steps = d?.steps;
  if (Array.isArray(steps)) {
    const scenario = (d.scenario as string) || 'custom';
    const typedSteps = steps as WorkflowStep[];
    return {
      workflow: {
        name: scenario,
        steps: typedSteps,
        actors: [...new Set(typedSteps.map((s) => s.owner).filter((o): o is string => Boolean(o)))],
        data_assets: (d.data_assets as string[]) || [],
        success_metrics: (d.success_metrics as string[]) || ['cycle_time_reduction', 'quality_stability'],
      },
    };
  }

  return d as unknown as WorkflowInput;
}

export async function loadInput(inputPath: string): Promise<WorkflowInput> {
  const raw = await fs.readFile(inputPath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  return normaliseWorkflowShape(parsed);
}
