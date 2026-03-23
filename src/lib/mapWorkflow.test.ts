import { describe, it, expect } from 'vitest';
import { mapWorkflow } from './mapWorkflow.js';
import type { WorkflowInput, ReadinessProfile } from '../types.js';

function makeInput(steps: WorkflowInput['workflow']['steps']): WorkflowInput {
  return {
    workflow: {
      name: 'test',
      steps,
      actors: ['ops'],
      data_assets: [],
      success_metrics: [],
    },
  };
}

describe('mapWorkflow', () => {
  it('marks explicitly must_stay_human steps', () => {
    const input = makeInput([{ id: 's1', name: 'data entry', must_stay_human: true }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].must_stay_human).toBe(true);
    expect(result.opportunities[0].rationale).toContain('Explicitly marked');
  });

  it('marks steps with requires_approval as must-stay-human', () => {
    const input = makeInput([{ id: 's1', name: 'budget review', requires_approval: true }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].must_stay_human).toBe(true);
  });

  it('marks customer-facing steps as must-stay-human', () => {
    const input = makeInput([{ id: 's1', name: 'customer escalation' }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].must_stay_human).toBe(true);
  });

  it('marks legal/compliance steps as must-stay-human', () => {
    const input = makeInput([{ id: 's1', name: 'legal review' }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].must_stay_human).toBe(true);
  });

  it('marks automation-friendly steps as should-automate', () => {
    const input = makeInput([{ id: 's1', name: 'ticket intake' }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].should_automate).toBe(true);
    expect(result.opportunities[0].must_stay_human).toBe(false);
  });

  it('boosts rationale for steps with structured I/O', () => {
    const input = makeInput([{
      id: 's1', name: 'data enrichment',
      inputs: ['raw-lead'], outputs: ['enriched-lead'],
    }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].should_automate).toBe(true);
    expect(result.opportunities[0].rationale).toContain('input-output');
  });

  it('respects human tag on steps', () => {
    const input = makeInput([{ id: 's1', name: 'data processing', tags: ['human-review'] }]);
    const result = mapWorkflow(input);
    expect(result.opportunities[0].must_stay_human).toBe(true);
  });

  it('flags steps blocked by readiness profile', () => {
    const input = makeInput([{ id: 's1', name: 'autonomous outbound comms' }]);
    const profile: ReadinessProfile = {
      overall_score: 70,
      domain_scores: {},
      required_controls: [],
      blocked_use_cases: ['Fully autonomous outbound customer communications'],
      roadmap_priorities: [],
    };
    const result = mapWorkflow(input, profile);
    expect(result.opportunities[0].must_stay_human).toBe(true);
    expect(result.opportunities[0].rationale).toContain('Blocked by org policy');
  });

  it('handles senior owner with caution', () => {
    const input = makeInput([{ id: 's1', name: 'forecast assembly', owner: 'VP Finance' }]);
    const result = mapWorkflow(input);
    // VP owner but automation-friendly name — should automate with oversight
    expect(result.opportunities[0].should_automate).toBe(true);
    expect(result.opportunities[0].rationale).toContain('Senior');
  });

  it('includes workflow name, timestamp, and version tags', () => {
    const input = makeInput([{ id: 's1', name: 'step one' }]);
    const result = mapWorkflow(input);
    expect(result.workflow).toBe('test');
    expect(result.generated_at).toBeTruthy();
    expect(result.method_version).toBe('1.0');
    expect(result.schema_version).toBe('1.0');
  });
});
