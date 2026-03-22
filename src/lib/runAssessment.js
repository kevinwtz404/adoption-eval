import { mapWorkflow } from './mapWorkflow.js';
import { evaluateReadiness } from './evaluateReadiness.js';

export function runAssessment(input, readinessProfile = null) {
  const map = mapWorkflow(input);
  const evalResult = evaluateReadiness(input, readinessProfile);

  const next30Days = [
    'Define pilot owner and weekly check-in cadence.',
    'Run pilot on one workflow slice for 2 weeks.',
    'Track quality, time saved, and error incidents weekly.',
    'Review controls compliance before expanding scope.',
  ];

  return {
    map,
    eval: evalResult,
    actions_next_30_days: next30Days,
    partial_allowed_by_default: true,
  };
}
