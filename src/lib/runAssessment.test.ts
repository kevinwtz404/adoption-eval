import { describe, it, expect } from 'vitest';
import { runAssessment } from './runAssessment.js';
import type { WorkflowInput, ReadinessProfile } from '../types.js';

const input: WorkflowInput = {
  workflow: {
    name: 'revops',
    steps: [{ id: 's1', name: 'lead qualification', owner: 'sdr' }],
    actors: ['sdr'],
    data_assets: ['crm'],
    success_metrics: ['velocity'],
  },
};

describe('runAssessment', () => {
  it('returns standard actions when no profile provided', () => {
    const result = runAssessment(input);
    expect(result.actions_next_30_days).toContain('Define pilot owner and weekly check-in cadence.');
    expect(result.actions_next_30_days.some((a) => a.includes('[prerequisite]'))).toBe(false);
    expect(result.actions_next_30_days.some((a) => a.includes('[control]'))).toBe(false);
  });

  it('injects roadmap priorities as prerequisites', () => {
    const profile: ReadinessProfile = {
      overall_score: 61,
      domain_scores: { governance: 70, data: 70 },
      required_controls: [],
      blocked_use_cases: [],
      roadmap_priorities: [
        { id: 'R-01', title: 'Define AI risk tiering', time_horizon: '30d', owner: 'Head of Ops' },
      ],
    };
    const result = runAssessment(input, profile);
    expect(result.actions_next_30_days[0]).toContain('[prerequisite]');
    expect(result.actions_next_30_days[0]).toContain('Define AI risk tiering');
  });

  it('injects required controls as setup actions', () => {
    const profile: ReadinessProfile = {
      overall_score: 70,
      domain_scores: { governance: 70, data: 70 },
      required_controls: ['pii_redaction_before_external_llm'],
      blocked_use_cases: [],
      roadmap_priorities: [],
    };
    const result = runAssessment(input, profile);
    expect(result.actions_next_30_days.some((a) => a.includes('[control]') && a.includes('pii_redaction'))).toBe(true);
  });

  it('injects governance readiness action when governance is low', () => {
    const profile: ReadinessProfile = {
      overall_score: 55,
      domain_scores: { governance: 50, data: 70 },
      required_controls: [],
      blocked_use_cases: [],
      roadmap_priorities: [],
    };
    const result = runAssessment(input, profile);
    expect(result.actions_next_30_days.some((a) => a.includes('[readiness]') && a.includes('governance'))).toBe(true);
  });

  it('injects data readiness action when data score is low', () => {
    const profile: ReadinessProfile = {
      overall_score: 55,
      domain_scores: { governance: 70, data: 50 },
      required_controls: [],
      blocked_use_cases: [],
      roadmap_priorities: [],
    };
    const result = runAssessment(input, profile);
    expect(result.actions_next_30_days.some((a) => a.includes('[readiness]') && a.includes('data quality'))).toBe(true);
  });

  it('injects change management action when change readiness is low', () => {
    const profile: ReadinessProfile = {
      overall_score: 55,
      domain_scores: { governance: 70, data: 70, change_readiness: 40 },
      required_controls: [],
      blocked_use_cases: [],
      roadmap_priorities: [],
    };
    const result = runAssessment(input, profile);
    expect(result.actions_next_30_days.some((a) => a.includes('change management'))).toBe(true);
  });

  it('includes map and eval in result', () => {
    const result = runAssessment(input);
    expect(result.map.workflow).toBe('revops');
    expect(result.eval.workflow).toBe('revops');
    expect(result.eval.overall_score).toBeGreaterThan(0);
  });

  it('returns null qualification when no scores provided', () => {
    const result = runAssessment(input);
    expect(result.qualification).toBeNull();
  });

  it('returns qualification result when scores provided', () => {
    const scoredInput: WorkflowInput = {
      workflow: {
        ...input.workflow,
        qualification: {
          business_impact: 4,
          frequency: 4,
          baseline_measurability: 4,
          data_readiness: 3,
          boundary_clarity: 4,
          pilotability: 4,
        },
      },
    };
    const result = runAssessment(scoredInput);
    expect(result.qualification).not.toBeNull();
    // 4*0.25 + 4*0.15 + 4*0.15 + 3*0.15 + 4*0.15 + 4*0.15 = 3.85
    expect(result.qualification!.decision).toBe('proceed_with_conditions');
    expect(result.actions_next_30_days.some((a) => a.includes('[qualification]') && a.includes('conditional'))).toBe(true);
  });

  it('injects gate failure actions when gates fail', () => {
    const failInput: WorkflowInput = {
      workflow: {
        ...input.workflow,
        qualification: {
          business_impact: 5,
          boundary_clarity: 2,
          baseline_measurability: 4,
        },
      },
    };
    const result = runAssessment(failInput);
    expect(result.qualification!.gates_passed).toBe(false);
    expect(result.actions_next_30_days.some((a) => a.includes('[gate-failure]'))).toBe(true);
    expect(result.actions_next_30_days.some((a) => a.includes('[qualification]') && a.includes('defer'))).toBe(true);
  });
});
