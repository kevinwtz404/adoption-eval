import type { WorkflowInput, ReadinessProfile, ReadinessScore } from '../types.js';

function computePenalty(readinessProfile: ReadinessProfile | null): { penalty: number; notes: string[] } {
  if (!readinessProfile) return { penalty: 0, notes: [] };

  let penalty = 0;
  const notes: string[] = [];
  const ds = readinessProfile.domain_scores;

  if (typeof ds.governance === 'number') {
    if (ds.governance < 40) {
      penalty += 12;
      notes.push('Governance score critically low: major review and approval gates required before any pilot.');
    } else if (ds.governance < 60) {
      penalty += 6;
      notes.push('Governance score < 60: increased review checkpoints required.');
    }
  }

  if (typeof ds.data === 'number') {
    if (ds.data < 40) {
      penalty += 12;
      notes.push('Data score critically low: data quality and privacy remediation required before pilot.');
    } else if (ds.data < 60) {
      penalty += 6;
      notes.push('Data score < 60: data quality and privacy controls required before scaling.');
    }
  }

  if (typeof ds.change_readiness === 'number' && ds.change_readiness < 50) {
    penalty += 4;
    notes.push('Change readiness score < 50: adoption friction risk is elevated.');
  }

  return { penalty, notes };
}

function checkBlockedUseCases(
  workflowName: string,
  blockedUseCases: string[],
): string[] {
  const notes: string[] = [];
  const nameLower = workflowName.toLowerCase();

  for (const blocked of blockedUseCases) {
    const blockedLower = blocked.toLowerCase();
    // Check if any significant words from the blocked use case appear in the workflow name
    const blockedWords = blockedLower.split(/\s+/).filter((w) => w.length > 3);
    const match = blockedWords.some((word) => nameLower.includes(word));
    if (match) {
      notes.push(`Blocked use case match: "${blocked}" — defer this workflow or request exception.`);
    }
  }

  return notes;
}

export function evaluateReadiness(input: WorkflowInput, readinessProfile: ReadinessProfile | null = null): ReadinessScore {
  const base: Record<string, number> = {
    workflow_clarity: 70,
    data_handling: 65,
    human_in_loop: 72,
    reliability_controls: 60,
    operational_fit: 68,
    adoption_readiness: 66,
  };

  const { penalty, notes } = computePenalty(readinessProfile);

  // Check for blocked use cases
  if (readinessProfile?.blocked_use_cases?.length) {
    const blockedNotes = checkBlockedUseCases(input.workflow.name, readinessProfile.blocked_use_cases);
    notes.push(...blockedNotes);
  }

  const domain_scores: Record<string, number> = Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, Math.max(0, v - penalty)])
  );

  const overall = Math.round(
    Object.values(domain_scores).reduce((a, b) => a + b, 0) / Object.values(domain_scores).length
  );

  return {
    workflow: input.workflow.name,
    overall_score: overall,
    domain_scores,
    controls_required: readinessProfile?.required_controls || [],
    notes,
  };
}
