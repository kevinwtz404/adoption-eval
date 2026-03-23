import { describe, it, expect } from 'vitest';
import { evaluateReadiness } from './evaluateReadiness.js';
import type { WorkflowInput, ReadinessProfile } from '../types.js';

const input: WorkflowInput = {
  workflow: {
    name: 'support-triage',
    steps: [{ id: 's1', name: 'ticket intake' }],
    actors: ['support'],
    data_assets: ['tickets'],
    success_metrics: ['speed'],
  },
};

const baseProfile: ReadinessProfile = {
  overall_score: 70,
  domain_scores: { strategy: 72, governance: 70, data: 68, capability: 66, change_readiness: 65 },
  required_controls: ['human_review_required'],
  blocked_use_cases: [],
  roadmap_priorities: [],
};

describe('evaluateReadiness', () => {
  it('returns base scores with version tags when no profile provided', () => {
    const result = evaluateReadiness(input);
    expect(result.overall_score).toBe(67);
    expect(result.controls_required).toEqual([]);
    expect(result.notes).toEqual([]);
    expect(result.method_version).toBe('1.0');
    expect(result.schema_version).toBe('1.0');
  });

  it('applies no penalty when governance and data are above 60', () => {
    const result = evaluateReadiness(input, baseProfile);
    expect(result.overall_score).toBe(67);
    expect(result.controls_required).toEqual(['human_review_required']);
  });

  it('applies penalty for low governance', () => {
    const profile = { ...baseProfile, domain_scores: { ...baseProfile.domain_scores, governance: 50 } };
    const result = evaluateReadiness(input, profile);
    expect(result.overall_score).toBeLessThan(67);
    expect(result.notes.some((n) => n.includes('Governance'))).toBe(true);
  });

  it('applies heavier penalty for critically low governance', () => {
    const mild = { ...baseProfile, domain_scores: { ...baseProfile.domain_scores, governance: 55 } };
    const critical = { ...baseProfile, domain_scores: { ...baseProfile.domain_scores, governance: 35 } };
    const mildResult = evaluateReadiness(input, mild);
    const criticalResult = evaluateReadiness(input, critical);
    expect(criticalResult.overall_score).toBeLessThan(mildResult.overall_score);
  });

  it('applies penalty for low data score', () => {
    const profile = { ...baseProfile, domain_scores: { ...baseProfile.domain_scores, data: 45 } };
    const result = evaluateReadiness(input, profile);
    expect(result.notes.some((n) => n.includes('Data score'))).toBe(true);
  });

  it('applies penalty for low change readiness', () => {
    const profile = { ...baseProfile, domain_scores: { ...baseProfile.domain_scores, change_readiness: 40 } };
    const result = evaluateReadiness(input, profile);
    expect(result.notes.some((n) => n.includes('Change readiness'))).toBe(true);
  });

  it('flags blocked use case matches', () => {
    const profile = { ...baseProfile, blocked_use_cases: ['Fully autonomous customer communications'] };
    const customerInput: WorkflowInput = {
      workflow: { ...input.workflow, name: 'customer-outreach-automation' },
    };
    const result = evaluateReadiness(customerInput, profile);
    expect(result.notes.some((n) => n.includes('Blocked use case'))).toBe(true);
  });

  it('does not flag unrelated blocked use cases', () => {
    const profile = { ...baseProfile, blocked_use_cases: ['Fully autonomous customer communications'] };
    const result = evaluateReadiness(input, profile);
    expect(result.notes.some((n) => n.includes('Blocked use case'))).toBe(false);
  });
});
