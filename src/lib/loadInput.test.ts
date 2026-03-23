import { describe, it, expect } from 'vitest';
import { loadInput } from './loadInput.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(__dirname, '../../examples');

describe('loadInput', () => {
  it('loads canonical format', async () => {
    const input = await loadInput(path.join(examplesDir, 'support-triage-workflow.example.json'));
    expect(input.workflow.name).toBe('support-triage');
    expect(input.workflow.steps).toHaveLength(2);
    expect(input.workflow.actors).toContain('support');
    expect(input.workflow.data_assets).toBeDefined();
    expect(input.workflow.success_metrics).toBeDefined();
  });

  it('normalises v0 flat format', async () => {
    const fs = await import('node:fs/promises');
    const tmpPath = path.join('/tmp', 'v0-test-input.json');
    await fs.writeFile(tmpPath, JSON.stringify({
      scenario: 'test',
      steps: [
        { id: 's1', name: 'step one', owner: 'alice' },
        { id: 's2', name: 'step two', owner: 'bob' },
      ],
    }));

    const input = await loadInput(tmpPath);
    expect(input.workflow.name).toBe('test');
    expect(input.workflow.steps).toHaveLength(2);
    expect(input.workflow.actors).toContain('alice');
    expect(input.workflow.actors).toContain('bob');
    expect(input.workflow.data_assets).toEqual([]);
    expect(input.workflow.success_metrics).toEqual(['cycle_time_reduction', 'quality_stability']);
  });
});
