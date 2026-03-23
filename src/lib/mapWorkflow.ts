import type { WorkflowInput, WorkflowStep, ReadinessProfile, Opportunity, OpportunityMap } from '../types.js';

// Patterns that suggest a step should stay human
const HUMAN_REQUIRED_PATTERNS = [
  /customer/i,
  /external/i,
  /approval/i,
  /sign[\s-]?off/i,
  /compliance/i,
  /legal/i,
  /strategic/i,
  /negotiate/i,
  /escalat/i,
];

// Patterns that suggest a step is a good automation candidate
const AUTOMATION_PATTERNS = [
  /intake/i,
  /triage/i,
  /rout(e|ing)/i,
  /enrich/i,
  /validat/i,
  /format/i,
  /assembl/i,
  /classif/i,
  /tag/i,
  /extract/i,
  /normaliz/i,
  /deduplic/i,
  /monitor/i,
  /alert/i,
  /report/i,
  /summar/i,
];

// Owner roles that typically indicate human-required steps
const HUMAN_OWNER_PATTERNS = [
  /executive/i,
  /director/i,
  /legal/i,
  /compliance/i,
  /cfo/i,
  /cro/i,
  /vp/i,
];

function classifyStep(
  step: WorkflowStep,
  blockedUseCases: string[],
): Opportunity {
  const name = step.name || '';
  const tags = step.tags || [];
  const allText = [name, ...tags, step.owner || ''].join(' ');

  // Explicit annotations take priority
  if (step.must_stay_human === true) {
    return makeOpportunity(step, true, false, true, 'Explicitly marked as must-stay-human.');
  }

  // Check for blocked use case match
  for (const blocked of blockedUseCases) {
    const blockedWords = blocked.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (blockedWords.some((word) => allText.toLowerCase().includes(word))) {
      return makeOpportunity(step, false, false, true,
        `Blocked by org policy: "${blocked}".`);
    }
  }

  // Check human-required patterns
  const matchesHuman = HUMAN_REQUIRED_PATTERNS.some((p) => p.test(name));
  const humanOwner = step.owner ? HUMAN_OWNER_PATTERNS.some((p) => p.test(step.owner!)) : false;
  const requiresApproval = step.requires_approval === true;
  const hasHumanTag = tags.some((t) => /human|manual|review/i.test(t));

  if (requiresApproval || hasHumanTag) {
    return makeOpportunity(step, true, false, true,
      'Requires human approval or review.');
  }

  if (matchesHuman && humanOwner) {
    return makeOpportunity(step, true, false, true,
      'Customer-facing or high-judgement step with senior/specialist owner.');
  }

  if (matchesHuman) {
    return makeOpportunity(step, true, false, true,
      'Customer-facing judgement and accountability needed.');
  }

  if (humanOwner) {
    return makeOpportunity(step, true, true, false,
      'Senior/specialist owner — could automate with oversight, should review boundaries.');
  }

  // Check automation-friendly patterns
  const matchesAutomation = AUTOMATION_PATTERNS.some((p) => p.test(name));
  const hasStructuredIO = (step.inputs?.length || 0) > 0 && (step.outputs?.length || 0) > 0;

  if (matchesAutomation && hasStructuredIO) {
    return makeOpportunity(step, true, true, false,
      'Structured step with clear input-output pattern and automation-friendly name.');
  }

  if (matchesAutomation) {
    return makeOpportunity(step, true, true, false,
      'Repetitive/structured step with automation-friendly pattern.');
  }

  if (hasStructuredIO) {
    return makeOpportunity(step, true, true, false,
      'Clear input-output pattern suggests automation potential.');
  }

  // Default: could automate, but needs human assessment
  return makeOpportunity(step, true, true, false,
    'Repetitive/structured step with clear input-output pattern.');
}

function makeOpportunity(
  step: WorkflowStep,
  couldAutomate: boolean,
  shouldAutomate: boolean,
  mustStayHuman: boolean,
  rationale: string,
): Opportunity {
  return {
    step_id: step.id,
    step_name: step.name,
    could_automate: couldAutomate,
    should_automate: shouldAutomate,
    must_stay_human: mustStayHuman,
    rationale,
  };
}

export function mapWorkflow(input: WorkflowInput, readinessProfile: ReadinessProfile | null = null): OpportunityMap {
  const blockedUseCases = readinessProfile?.blocked_use_cases || [];

  const opportunities = input.workflow.steps.map((step) =>
    classifyStep(step, blockedUseCases)
  );

  return {
    workflow: input.workflow.name,
    generated_at: new Date().toISOString(),
    opportunities,
  };
}
