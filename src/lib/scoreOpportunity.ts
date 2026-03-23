import type { QualificationScores, QualificationResult } from '../types.js';

const WEIGHTS: Record<string, number> = {
  business_impact: 0.25,
  frequency: 0.15,
  baseline_measurability: 0.15,
  data_readiness: 0.15,
  boundary_clarity: 0.15,
  pilotability: 0.15,
};

const GATES: Record<string, number> = {
  boundary_clarity: 3,
  baseline_measurability: 3,
};

export function scoreOpportunity(scores: QualificationScores): QualificationResult {
  const criteria: Record<string, { score: number; weight: number; weighted: number }> = {};
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = (scores as Record<string, number | undefined>)[key];
    if (typeof score === 'number') {
      const weighted = score * weight;
      criteria[key] = { score, weight, weighted };
      totalWeighted += weighted;
      totalWeight += weight;
    }
  }

  // Normalise if not all criteria were provided
  const weighted_score = totalWeight > 0
    ? Math.round((totalWeighted / totalWeight) * 100) / 100
    : 0;

  // Check gates
  const gate_failures: string[] = [];
  for (const [key, threshold] of Object.entries(GATES)) {
    const score = (scores as Record<string, number | undefined>)[key];
    if (typeof score === 'number' && score < threshold) {
      gate_failures.push(`${key} (${score}) is below gate threshold (${threshold})`);
    }
  }

  const gates_passed = gate_failures.length === 0;

  // Decision bands
  let decision: QualificationResult['decision'];
  if (!gates_passed) {
    decision = 'defer';
  } else if (weighted_score >= 4.0) {
    decision = 'proceed';
  } else if (weighted_score >= 3.0) {
    decision = 'proceed_with_conditions';
  } else {
    decision = 'defer';
  }

  return {
    weighted_score,
    criteria,
    gates_passed,
    gate_failures,
    decision,
  };
}
