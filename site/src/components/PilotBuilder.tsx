import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';

interface PilotPlan {
  scope: string;
  successCriteria: string;
  stopCriteria: string;
  timeline: string;
  owner: string;
}

const TABS = [
  { id: 'scope', label: 'Scope', field: 'scope' as keyof PilotPlan },
  { id: 'success', label: 'Success criteria', field: 'successCriteria' as keyof PilotPlan },
  { id: 'stop', label: 'Stop criteria', field: 'stopCriteria' as keyof PilotPlan },
  { id: 'timeline', label: 'Timeline', field: 'timeline' as keyof PilotPlan },
  { id: 'owner', label: 'Owner', field: 'owner' as keyof PilotPlan },
];

const TAB_CONTENT: Record<string, { explanation: string; placeholder: string }> = {
  scope: {
    explanation: 'Pick the smallest meaningful slice of the workflow you can test. Not the whole thing. One team, one process, one time period. The goal is to learn, not to deploy. Ask: "If this pilot goes wrong, what is the worst that can happen?" If the answer is scary, the scope is too big.',
    placeholder: 'e.g. One monthly business review for the APAC business unit, using CRM and ERP data only',
  },
  success: {
    explanation: 'Before you start, write down what "success" looks like. Be specific. "It works" is not a criterion. "Reduces report assembly time from 5 days to 2 days without increasing error rate" is. Include criteria for control and quality, not just speed. A pilot that is faster but less accurate or less controllable is not a success.',
    placeholder: 'e.g. Assembly time drops from 5 days to 2 days. Error rate stays the same or improves. CFO asks fewer follow-up questions.',
  },
  stop: {
    explanation: 'Equally important: what would cause you to stop the pilot early? Define this before you start so you are not rationalising problems away when they appear. Examples: error rate exceeds a threshold, a boundary is violated, user trust drops, cost exceeds budget.',
    placeholder: 'e.g. Error rate exceeds 5%. A boundary is violated. Team refuses to use it. Cost exceeds budget by 20%.',
  },
  timeline: {
    explanation: 'Most useful pilots run 2-4 weeks. Shorter and you do not have enough data. Longer and you lose momentum and the conditions change. Build in a check-in at the midpoint. If things are not working at the halfway mark, you should know why and decide whether to adjust or stop.',
    placeholder: 'e.g. 3 weeks. Midpoint check-in after week 2. Final evaluation in week 4.',
  },
  owner: {
    explanation: 'One person owns the pilot. Not a committee. They are responsible for running it, collecting data, reporting results and making the call at the end. The pilot owner needs authority to stop the pilot if something goes wrong. Without this, problems get escalated instead of resolved.',
    placeholder: 'e.g. AI enablement lead or finance team lead. Must have authority to pause or stop the pilot.',
  },
};

export default function PilotBuilder() {
  const [state, setState] = useState<any>(null);
  const [painPoint, setPainPoint] = useState('');
  const [plan, setPlan] = useState<PilotPlan>({ scope: '', successCriteria: '', stopCriteria: '', timeline: '', owner: '' });
  const [activeTab, setActiveTab] = useState('scope');
  const [showOutputs, setShowOutputs] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.selectedCase) {
      const flagship = flagshipCases.find(c => c.id === s.selectedCase);
      if (flagship) setPainPoint(flagship.painPoint);
    }
    if ((s as any).pilotPlan) {
      setPlan((s as any).pilotPlan);
    }
  }, []);

  function updatePlan(field: keyof PilotPlan, value: string) {
    const updated = { ...plan, [field]: value };
    setPlan(updated);
    saveState({ pilotPlan: updated } as any);
  }

  if (!state?.workflow) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '15px', color: '#991b1b' }}>
        No workflow data found. <a href="2-select/" style={{ color: '#6830C4' }}>Start from Step 2</a>.
      </div>
    );
  }

  const workflow = state.workflow;
  const qualification = state.qualification;
  const redesign = (state as any).redesign || '';
  const redesignData = (state as any).redesignData;
  const boundaryDecisions = (state as any).boundaryDecisions || [];
  const planFields = [plan.scope, plan.successCriteria, plan.stopCriteria, plan.timeline, plan.owner];
  const planComplete = planFields.filter(f => f.trim()).length;

  function buildMarkdownSummary(): string {
    let md = `# Pilot Plan: ${workflow.name}\n\n`;
    md += `## Pain point\n${painPoint || 'Custom workflow'}\n\n`;
    md += `## Current workflow\n`;
    (workflow.steps || []).forEach((s: any, i: number) => {
      md += `${i + 1}. ${s.name}${s.owner ? ` (${s.owner})` : ''}${s.pain ? ` — ${s.pain}` : ''}\n`;
    });
    if (qualification) {
      md += `\n## Qualification\n`;
      Object.entries(qualification).forEach(([key, val]) => { md += `- ${key.replace(/_/g, ' ')}: ${val}\n`; });
    }
    if (redesign) md += `\n## Proposed redesign\n${redesign}\n`;
    if (boundaryDecisions.length > 0) {
      md += `\n## Boundary decisions\n`;
      boundaryDecisions.forEach((d: any) => {
        if (d.choice) md += `- **${d.question}** ${d.choice}${d.detail ? ` — ${d.detail}` : ''}\n`;
      });
    }
    md += `\n## Pilot plan\n`;
    if (plan.scope) md += `### Scope\n${plan.scope}\n\n`;
    if (plan.successCriteria) md += `### Success criteria\n${plan.successCriteria}\n\n`;
    if (plan.stopCriteria) md += `### Stop criteria\n${plan.stopCriteria}\n\n`;
    if (plan.timeline) md += `### Timeline\n${plan.timeline}\n\n`;
    if (plan.owner) md += `### Owner\n${plan.owner}\n\n`;
    return md;
  }

  function buildJsonBrief(): string {
    return JSON.stringify({
      pilot_plan: {
        workflow: { name: workflow.name, steps: workflow.steps, pain_point: painPoint || null },
        qualification: qualification || null,
        redesign: redesign || null,
        components: redesignData?.components || null,
        boundary_decisions: boundaryDecisions.filter((d: any) => d.choice).map((d: any) => ({
          question: d.question, decision: d.choice, detail: d.detail || null,
          implication: d.pilotImplication?.[d.choice] || null,
        })),
        pilot: { scope: plan.scope || null, success_criteria: plan.successCriteria || null, stop_criteria: plan.stopCriteria || null, timeline: plan.timeline || null, owner: plan.owner || null },
      },
      instructions: 'This is a pilot plan for an AI adoption project. Use this to generate implementation options, identify technical requirements and create a detailed build plan. Consider vendor-based solutions, low-code builds and custom implementations. For each AI component, suggest specific models, tools and architectures that fit the requirements and boundaries described. Respect all boundary decisions. Use UK English.',
    }, null, 2);
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const currentTab = TAB_CONTENT[activeTab];
  const currentField = TABS.find(t => t.id === activeTab)?.field || 'scope';

  return (
    <div>

      {/* Overview */}
      <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '0.25rem' }}>{workflow.name}</div>
        <div style={{ fontSize: '15px', color: '#999' }}>{planComplete} of 5 pilot details filled</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.625rem 0.5rem', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              border: 'none', borderRight: i < TABS.length - 1 ? '1px solid #e0e0e0' : 'none',
              background: activeTab === tab.id ? '#6830C4' : '#fff',
              color: activeTab === tab.id ? '#fff' : plan[tab.field].trim() ? '#333' : '#999',
            }}
          >
            {tab.label}{plan[tab.field].trim() ? ' \u2713' : ''}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '15px', lineHeight: '1.75', marginBottom: '1rem', color: '#666' }}>
          {currentTab.explanation}
        </div>
        <textarea
          value={plan[currentField]}
          onInput={(e) => updatePlan(currentField, (e.target as HTMLTextAreaElement).value)}
          placeholder={currentTab.placeholder}
          rows={3}
          style={{
            width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75',
          }}
        />
      </div>

      {/* Generate plan button */}
      {!showOutputs && (
        <div style={{ textAlign: 'center' as const }}>
          <button
            onClick={() => setShowOutputs(true)}
            disabled={planComplete < 3}
            style={{
              padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '15px',
              fontFamily: 'inherit', fontWeight: 600, cursor: planComplete < 3 ? 'default' : 'pointer',
              background: '#6830C4', color: '#fff', border: 'none',
              opacity: planComplete < 3 ? 0.4 : 1,
            }}
          >
            Generate pilot plan
          </button>
          {planComplete < 3 && (
            <p style={{ fontSize: '15px', color: '#999', marginTop: '0.5rem' }}>Fill in at least 3 of 5 details to generate your plan.</p>
          )}
        </div>
      )}

      {/* Outputs */}
      {showOutputs && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
            <button onClick={() => download(buildMarkdownSummary(), `pilot-plan-${workflow.name}.md`, 'text/markdown')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#6830C4', color: '#fff', border: 'none' }}>
              Download roadmap (Markdown)
            </button>
            <button onClick={() => download(buildJsonBrief(), `build-brief-${workflow.name}.json`, 'application/json')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#6830C4', border: '1px solid #6830C4' }}>
              Download build brief (JSON)
            </button>
            <button onClick={() => { navigator.clipboard.writeText(buildJsonBrief()); }}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#666', border: '1px solid #e0e0e0' }}>
              Copy build brief
            </button>
          </div>
          <p style={{ fontSize: '15px', color: '#999', marginTop: '0.75rem', lineHeight: '1.75' }}>
            The build brief is designed to be pasted into an AI assistant to get implementation options, vendor recommendations and architecture suggestions.
          </p>
        </div>
      )}
    </div>
  );
}
