import { callAI } from './api';

// --- Boundary suggestion ---

export interface BoundarySuggestion {
  id: string;
  choice: 'yes' | 'partly' | 'no';
  rationale: string;
}

export async function suggestBoundaryDefaults(
  workflowName: string,
  painPoint: string,
  redesign: string,
  components: Array<{ name: string; type: string; description: string }>,
): Promise<BoundarySuggestion[] | null> {
  const componentList = components
    .filter(c => !c.name.startsWith('_'))
    .map(c => `- ${c.name} (${c.type}): ${c.description}`)
    .join('\n');

  const prompt = `You are helping a non-technical operations lead set boundary decisions for an AI pilot.

Workflow: "${workflowName}"
Pain: "${painPoint}"

Proposed solution:
${redesign}

Components:
${componentList}

For each of these 10 boundary questions, suggest "yes", "partly" or "no" and explain why in one sentence.

Questions:
1. review-text: Should AI-generated text be reviewed by a person before it is used?
2. numbers-deterministic: Should all numbers and calculations come from deterministic sources only?
3. verify-retrieved: Should retrieved information be verified before it informs decisions?
4. data-local: Should the data in this workflow stay within your systems?
5. access-permissions: Should the system enforce existing access permissions?
6. model-size: Should we start with the smallest model that works?
7. scale-cost: Should we estimate costs at full scale before committing to the pilot?
8. approval-gate: Should a person approve outputs before they leave the system?
9. fallback: Should there be a manual fallback for every AI step?
10. transparency: Should it be clear to users when AI is involved?

Respond with a JSON array (no other text):
[
  { "id": "review-text", "choice": "yes", "rationale": "..." },
  ...
]

Be specific to this workflow. Default to the safer option when uncertain. Use UK English, no em dashes.`;

  const responseText = await callAI(prompt, workflowName);
  if (!responseText) return null;

  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as BoundarySuggestion[];
    }
  } catch (err) {
    console.error('Failed to parse boundary suggestions:', err);
  }
  return null;
}

// --- Full playbook generation ---

export interface PlaybookContent {
  costRange: string;
  whatWereTesting: string;
  howItWorks: string;
  guardrails: string[];
  risksAndMitigations: Array<{ risk: string; mitigation: string }>;
  twoWeekPlan: string;
  stopCriteria: string[];
  whatTheTeamNeedsToKnow: string;
  howWellMeasure: string;
}

export async function generatePlaybook(
  workflowName: string,
  painPoint: string,
  redesign: string,
  components: Array<{ name: string; type: string; description: string; risks: string[] }>,
  boundaryDecisions: Array<{ id: string; question: string; choice: string; detail: string }>,
  simplifiedInputs: {
    systemsStack: string[];
    technicalCapacity: string | null;
    budgetBand: string | null;
    buildPreference: string | null;
  },
  workflowSteps: Array<{ name: string; owner?: string }>,
  actors: string[],
): Promise<PlaybookContent | null> {
  const componentList = components
    .filter(c => !c.name.startsWith('_'))
    .map(c => `- ${c.name} (${c.type}): ${c.description}. Risks: ${c.risks.join(', ') || 'none identified'}`)
    .join('\n');

  const boundaryList = boundaryDecisions
    .filter(d => d.choice)
    .map(d => `- ${d.question} → ${d.choice}${d.detail ? ` (${d.detail})` : ''}`)
    .join('\n');

  const currentSteps = workflowSteps
    .map((s, i) => `${i + 1}. ${s.name} (${s.owner || 'unassigned'})`)
    .join('\n');

  const prompt = `Generate a complete pilot playbook for a non-technical operations lead.

WORKFLOW: "${workflowName}"
PAIN: "${painPoint}"

CURRENT STEPS:
${currentSteps}

PROPOSED SOLUTION:
${redesign}

COMPONENTS:
${componentList}

BOUNDARY DECISIONS:
${boundaryList}

TEAM CONTEXT:
- Systems: ${simplifiedInputs.systemsStack.join(', ') || 'not specified'}
- Technical capacity: ${simplifiedInputs.technicalCapacity || 'not specified'}
- Budget: ${simplifiedInputs.budgetBand || 'not specified'}
- Build preference: ${simplifiedInputs.buildPreference || 'not specified'}
- People involved: ${actors.join(', ') || 'not specified'}

Respond with a JSON object (no other text):
{
  "costRange": "estimated monthly cost range for the pilot, e.g. '$200-600/mo'. Base this on the components, build preference and budget band. Be realistic about API costs, tool subscriptions and any infrastructure.",
  "whatWereTesting": "One paragraph: what the pilot tests, why it matters, what will change. Written for someone who was not in the room when you evaluated the workflow.",
  "howItWorks": "Describe step by step: what the current process looks like, what changes with the intervention, what stays with people. Include which systems are involved. Keep it concrete.",
  "guardrails": ["plain-language rule 1", "plain-language rule 2", "..."],
  "risksAndMitigations": [
    { "risk": "specific risk description", "mitigation": "what catches or prevents it" }
  ],
  "twoWeekPlan": "A day-by-day checklist the pilot operator can follow without technical help. Week 1: configure, baseline, test controls. Week 2: operate, track, evaluate. Be specific about actions, not vague about phases. Format as markdown with ### Week 1 and ### Week 2 headings and bullet points for each day or task.",
  "stopCriteria": ["when to pull the plug, bullet 1", "bullet 2", "..."],
  "whatTheTeamNeedsToKnow": "Who is affected, what changes for them day-to-day, how to communicate the pilot. Practical, not HR-speak. Written for the pilot operator to share with their team.",
  "howWellMeasure": "For each of the 6 dimensions (Time, Cost, Quality, Risk, Adoption, Control), describe what to measure and what good looks like for this specific pilot. Include realistic targets. End with the rule: faster alone is not success. Then describe the three outcomes: Scale (controls hold, value achieved), Revise (value visible but adjustments needed), Stop (risk, low trust, weak impact)."
}

Be specific to this workflow. No generic advice. Use UK English, no em dashes.`;

  const responseText = await callAI(prompt, workflowName);
  if (!responseText) return null;

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PlaybookContent;
    }
  } catch (err) {
    console.error('Failed to parse playbook JSON:', err);
  }
  return null;
}
