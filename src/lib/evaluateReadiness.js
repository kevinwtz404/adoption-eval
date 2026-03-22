export function evaluateReadiness(input, readinessProfile = null) {
  const base = {
    workflow_clarity: 70,
    data_handling: 65,
    human_in_loop: 72,
    reliability_controls: 60,
    operational_fit: 68,
    adoption_readiness: 66,
  };

  const governance = readinessProfile?.domain_scores?.governance;
  const data = readinessProfile?.domain_scores?.data;

  let penalty = 0;
  const notes = [];

  if (typeof governance === 'number' && governance < 60) {
    penalty += 6;
    notes.push('Governance score < 60: increased review checkpoints required.');
  }

  if (typeof data === 'number' && data < 60) {
    penalty += 6;
    notes.push('Data score < 60: data quality and privacy controls required before scaling.');
  }

  const domain_scores = Object.fromEntries(
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
