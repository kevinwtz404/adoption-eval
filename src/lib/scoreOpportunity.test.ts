import { describe, it, expect } from 'vitest';
import { scoreOpportunity } from './scoreOpportunity.js';

describe('scoreOpportunity', () => {
  it('computes weighted score with all criteria', () => {
    const result = scoreOpportunity({
      business_impact: 5,
      frequency: 4,
      baseline_measurability: 4,
      data_readiness: 3,
      boundary_clarity: 4,
      pilotability: 4,
    });
    // 5*0.25 + 4*0.15 + 4*0.15 + 3*0.15 + 4*0.15 + 4*0.15 = 1.25 + 0.6 + 0.6 + 0.45 + 0.6 + 0.6 = 4.1
    expect(result.weighted_score).toBe(4.1);
    expect(result.decision).toBe('proceed');
    expect(result.gates_passed).toBe(true);
  });

  it('returns proceed_with_conditions for score 3.0-3.9', () => {
    const result = scoreOpportunity({
      business_impact: 3,
      frequency: 3,
      baseline_measurability: 3,
      data_readiness: 3,
      boundary_clarity: 3,
      pilotability: 3,
    });
    expect(result.weighted_score).toBe(3);
    expect(result.decision).toBe('proceed_with_conditions');
  });

  it('returns defer for score below 3.0', () => {
    const result = scoreOpportunity({
      business_impact: 2,
      frequency: 2,
      baseline_measurability: 3,
      data_readiness: 2,
      boundary_clarity: 3,
      pilotability: 2,
    });
    expect(result.weighted_score).toBeLessThan(3);
    expect(result.decision).toBe('defer');
  });

  it('fails gate when boundary_clarity < 3', () => {
    const result = scoreOpportunity({
      business_impact: 5,
      frequency: 5,
      baseline_measurability: 5,
      data_readiness: 5,
      boundary_clarity: 2,
      pilotability: 5,
    });
    expect(result.gates_passed).toBe(false);
    expect(result.gate_failures).toHaveLength(1);
    expect(result.gate_failures[0]).toContain('boundary_clarity');
    expect(result.decision).toBe('defer');
  });

  it('fails gate when baseline_measurability < 3', () => {
    const result = scoreOpportunity({
      business_impact: 5,
      frequency: 5,
      baseline_measurability: 2,
      data_readiness: 5,
      boundary_clarity: 5,
      pilotability: 5,
    });
    expect(result.gates_passed).toBe(false);
    expect(result.gate_failures[0]).toContain('baseline_measurability');
    expect(result.decision).toBe('defer');
  });

  it('handles partial criteria gracefully', () => {
    const result = scoreOpportunity({
      business_impact: 4,
      boundary_clarity: 4,
    });
    // Only 2 criteria provided, normalised: (4*0.25 + 4*0.15) / (0.25+0.15) = 1.6/0.4 = 4.0
    expect(result.weighted_score).toBe(4);
    expect(result.gates_passed).toBe(true);
    expect(result.decision).toBe('proceed');
  });

  it('returns zero score with no criteria', () => {
    const result = scoreOpportunity({});
    expect(result.weighted_score).toBe(0);
    expect(result.decision).toBe('defer');
  });
});
