import type { WorkflowInput, ReadinessProfile, ReadinessScore, QualificationResult, AssessmentResult } from '../types.js';
import { mapWorkflow } from './mapWorkflow.js';
import { evaluateReadiness } from './evaluateReadiness.js';
import { scoreOpportunity } from './scoreOpportunity.js';

function buildActions(
  readinessProfile: ReadinessProfile | null,
  evalResult: ReadinessScore,
  qualification: QualificationResult | null,
): string[] {
  const actions: string[] = [];

  // Inject roadmap priorities as prerequisites
  if (readinessProfile?.roadmap_priorities?.length) {
    for (const rp of readinessProfile.roadmap_priorities) {
      actions.push(`[prerequisite] ${rp.title} (owner: ${rp.owner}, horizon: ${rp.time_horizon}).`);
    }
  }

  // Inject required controls as setup actions
  if (readinessProfile?.required_controls?.length) {
    for (const ctrl of readinessProfile.required_controls) {
      actions.push(`[control] Confirm "${ctrl}" is in place before pilot launch.`);
    }
  }

  // Inject gate failure remediation actions
  if (qualification?.gate_failures?.length) {
    for (const failure of qualification.gate_failures) {
      actions.push(`[gate-failure] Resolve before proceeding: ${failure}.`);
    }
  }

  // Respond to readiness evaluation warnings
  if (evalResult.notes.some((n) => /governance/i.test(n))) {
    actions.push('[readiness] Establish governance review checkpoints before pilot.');
  }
  if (evalResult.notes.some((n) => /data/i.test(n))) {
    actions.push('[readiness] Audit data quality and privacy controls before pilot.');
  }
  if (evalResult.notes.some((n) => /change readiness/i.test(n))) {
    actions.push('[readiness] Plan change management and user onboarding support.');
  }
  if (evalResult.notes.some((n) => /blocked use case/i.test(n))) {
    actions.push('[readiness] Review blocked use case policy — request exception or defer workflow.');
  }

  // Qualification-driven actions
  if (qualification) {
    if (qualification.decision === 'defer') {
      actions.push('[qualification] Opportunity scored below threshold — revisit scoring criteria or defer.');
    } else if (qualification.decision === 'proceed_with_conditions') {
      actions.push('[qualification] Opportunity scored in conditional band — document conditions and review triggers.');
    }
  }

  // Standard actions
  actions.push(
    'Define pilot owner and weekly check-in cadence.',
    'Run pilot on one workflow slice for 2 weeks.',
    'Track quality, time saved, and error incidents weekly.',
    'Review controls compliance before expanding scope.',
  );

  return actions;
}

export function runAssessment(input: WorkflowInput, readinessProfile: ReadinessProfile | null = null): AssessmentResult {
  const map = mapWorkflow(input, readinessProfile);
  const evalResult = evaluateReadiness(input, readinessProfile);

  const qualification = input.workflow.qualification
    ? scoreOpportunity(input.workflow.qualification)
    : null;

  return {
    map,
    eval: evalResult,
    qualification,
    actions_next_30_days: buildActions(readinessProfile, evalResult, qualification),
    partial_allowed_by_default: true,
  };
}
