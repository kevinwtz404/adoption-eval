export function mapWorkflow(input) {
  const steps = input.workflow.steps || [];

  const opportunities = steps.map((step, idx) => {
    const name = step.name || `step-${idx + 1}`;
    const hasExternal = /email|customer|external/i.test(name);
    return {
      step_id: step.id || `s${idx + 1}`,
      step_name: name,
      could_automate: true,
      should_automate: !hasExternal,
      must_stay_human: hasExternal,
      rationale: hasExternal
        ? 'Customer-facing judgement and accountability needed.'
        : 'Repetitive/structured step with clear input-output pattern.',
    };
  });

  return {
    workflow: input.workflow.name,
    generated_at: new Date().toISOString(),
    opportunities,
  };
}
