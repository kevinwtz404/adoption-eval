import { describe, it, expect } from 'vitest';
import { validateInput } from './validateInput.js';

const validInput = {
  workflow: {
    name: 'test-workflow',
    steps: [{ id: 's1', name: 'step one', owner: 'ops' }],
    actors: ['ops'],
    data_assets: ['asset-a'],
    success_metrics: ['speed'],
  },
};

describe('validateInput', () => {
  it('accepts a valid workflow input', async () => {
    const result = await validateInput(validInput);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects input missing workflow', async () => {
    const result = await validateInput({ bad: true });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('workflow'))).toBe(true);
  });

  it('rejects input with empty steps', async () => {
    const result = await validateInput({
      workflow: { ...validInput.workflow, steps: [] },
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('steps'))).toBe(true);
  });

  it('rejects input missing actors', async () => {
    const { actors: _, ...noActors } = validInput.workflow;
    const result = await validateInput({ workflow: noActors });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('actors'))).toBe(true);
  });

  it('rejects input with empty workflow name', async () => {
    const result = await validateInput({
      workflow: { ...validInput.workflow, name: '' },
    });
    expect(result.valid).toBe(false);
  });

  it('accepts optional step fields', async () => {
    const result = await validateInput({
      workflow: {
        ...validInput.workflow,
        steps: [{
          id: 's1',
          name: 'step one',
          owner: 'ops',
          must_stay_human: true,
          requires_approval: true,
          tags: ['customer-facing'],
        }],
      },
    });
    expect(result.valid).toBe(true);
  });
});
