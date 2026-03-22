export function validateInput(data) {
  const issues = [];

  if (!data?.workflow?.name) issues.push('Missing workflow.name');
  if (!Array.isArray(data?.workflow?.steps) || data.workflow.steps.length === 0) issues.push('Missing workflow.steps[]');
  if (!Array.isArray(data?.workflow?.actors) || data.workflow.actors.length === 0) issues.push('Missing workflow.actors[]');
  if (!Array.isArray(data?.workflow?.data_assets)) issues.push('Missing workflow.data_assets[]');
  if (!Array.isArray(data?.workflow?.success_metrics)) issues.push('Missing workflow.success_metrics[]');

  return { valid: issues.length === 0, issues };
}
