// Deterministic playbook logic. No Gemini calls.

// --- Decision badge ---

export type PlaybookDecision = 'go' | 'not-yet' | 'no-go';

interface QualificationScores {
  business_impact: number;
  frequency: number;
  baseline_measurability: number;
  data_readiness: number;
  boundary_clarity: number;
  pilotability: number;
}

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

export function calculateDecision(
  qualification: QualificationScores | null,
  boundaryDecisions: Array<{ choice: string }> | null,
): PlaybookDecision {
  if (!qualification) return 'not-yet';

  // Gate check
  for (const [key, threshold] of Object.entries(GATES)) {
    const score = (qualification as Record<string, number>)[key];
    if (typeof score === 'number' && score < threshold) {
      return 'no-go';
    }
  }

  // Boundary completion check: need at least 7 of 10
  const answeredBoundaries = boundaryDecisions?.filter(d => d.choice).length || 0;
  if (answeredBoundaries < 7) return 'not-yet';

  // Weighted score
  let totalWeighted = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = (qualification as Record<string, number>)[key];
    if (typeof score === 'number') {
      totalWeighted += score * weight;
      totalWeight += weight;
    }
  }
  const weightedScore = totalWeight > 0 ? totalWeighted / totalWeight : 0;

  if (weightedScore >= 3.5) return 'go';
  if (weightedScore >= 2.5) return 'not-yet';
  return 'no-go';
}

// --- Guardrails extraction ---

export function extractGuardrails(
  boundaryDecisions: Array<{ id: string; question: string; choice: string; detail: string; pilotImplication: Record<string, string> }> | null,
): string[] {
  if (!boundaryDecisions) return [];
  return boundaryDecisions
    .filter(d => d.choice === 'yes' || d.choice === 'partly')
    .map(d => {
      const implication = d.pilotImplication?.[d.choice];
      if (implication) return implication;
      return d.question;
    });
}

// --- Stop criteria extraction ---

export function extractStopCriteria(
  boundaryDecisions: Array<{ id: string; question: string; choice: string; detail: string }> | null,
): string[] {
  if (!boundaryDecisions) return [];

  const criteria: string[] = [];

  for (const d of boundaryDecisions) {
    if (!d.choice) continue;

    // Derive stop criteria from boundary decisions
    if (d.id === 'review-text' && d.choice === 'yes') {
      criteria.push('AI-generated text goes out without review');
    }
    if (d.id === 'numbers-deterministic' && d.choice === 'yes') {
      criteria.push('AI-generated numbers appear in outputs that should be deterministic');
    }
    if (d.id === 'data-local' && (d.choice === 'yes' || d.choice === 'partly')) {
      criteria.push('Confidential data is sent to an external API when it should not be');
    }
    if (d.id === 'access-permissions' && d.choice === 'yes') {
      criteria.push('System surfaces information to someone who should not see it');
    }
    if (d.id === 'approval-gate' && d.choice === 'yes') {
      criteria.push('Outputs leave the system without required approval');
    }
  }

  if (criteria.length === 0) {
    criteria.push('Critical errors in pilot outputs that cannot be caught by review');
    criteria.push('Team stops using the pilot within the first week');
  }

  return criteria;
}
