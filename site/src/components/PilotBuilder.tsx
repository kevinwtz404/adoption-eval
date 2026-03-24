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

export default function PilotBuilder() {
  const [state, setState] = useState<any>(null);
  const [painPoint, setPainPoint] = useState('');
  const [plan, setPlan] = useState<PilotPlan>({ scope: '', successCriteria: '', stopCriteria: '', timeline: '', owner: '' });

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

  function buildMarkdownSummary(): string {
    let md = `# Pilot Plan: ${workflow.name}\n\n`;
    md += `## Pain point\n${painPoint || 'Custom workflow'}\n\n`;

    md += `## Current workflow\n`;
    (workflow.steps || []).forEach((s: any, i: number) => {
      md += `${i + 1}. ${s.name}${s.owner ? ` (${s.owner})` : ''}${s.pain ? ` — ${s.pain}` : ''}\n`;
    });

    if (qualification) {
      md += `\n## Qualification\n`;
      Object.entries(qualification).forEach(([key, val]) => {
        md += `- ${key.replace(/_/g, ' ')}: ${val}\n`;
      });
    }

    if (redesign) {
      md += `\n## Proposed redesign\n${redesign}\n`;
    }

    if (boundaryDecisions.length > 0) {
      md += `\n## Boundary decisions\n`;
      boundaryDecisions.forEach((d: any) => {
        if (d.choice) {
          md += `- **${d.question}** ${d.choice}${d.detail ? ` — ${d.detail}` : ''}\n`;
          if (d.pilotImplication && d.pilotImplication[d.choice]) {
            md += `  - Implication: ${d.pilotImplication[d.choice]}\n`;
          }
        }
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
          question: d.question,
          decision: d.choice,
          detail: d.detail || null,
          implication: d.pilotImplication?.[d.choice] || null,
        })),
        pilot: {
          scope: plan.scope || null,
          success_criteria: plan.successCriteria || null,
          stop_criteria: plan.stopCriteria || null,
          timeline: plan.timeline || null,
          owner: plan.owner || null,
        },
      },
      instructions: 'This is a pilot plan for an AI adoption project. Use this to generate implementation options, identify technical requirements and create a detailed build plan. Consider vendor-based solutions, low-code builds and custom implementations. For each AI component, suggest specific models, tools and architectures that fit the requirements and boundaries described. Respect all boundary decisions. Use UK English.',
    }, null, 2);
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const answeredBoundaries = boundaryDecisions.filter((d: any) => d.choice).length;
  const planFields = [plan.scope, plan.successCriteria, plan.stopCriteria, plan.timeline, plan.owner];
  const planComplete = planFields.filter(f => f.trim()).length;

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Overview */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '0.5rem' }}>{workflow.name}</div>
        {painPoint && <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '0.75rem' }}>{painPoint}</div>}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '15px', color: '#999' }}>
          <span>{(workflow.steps || []).length} steps</span>
          <span>{answeredBoundaries} boundary decisions made</span>
          <span>{planComplete}/5 pilot details filled</span>
        </div>
      </div>

      {/* Pilot planning fields */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>Pilot scope</label>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '0.5rem' }}>What is the smallest meaningful slice you can test? One team, one report, one campaign cycle.</p>
          <textarea value={plan.scope} onInput={(e) => updatePlan('scope', (e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. One monthly business review for the APAC business unit, using CRM and ERP data only"
            rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>Success criteria</label>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '0.5rem' }}>What does success look like? Be specific and measurable. Include quality and control, not just speed.</p>
          <textarea value={plan.successCriteria} onInput={(e) => updatePlan('successCriteria', (e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. Assembly time drops from 5 days to 2 days. Error rate stays the same or improves. CFO asks fewer follow-up questions."
            rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>Stop criteria</label>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '0.5rem' }}>What would cause you to stop the pilot early? Define this now so you are not rationalising problems later.</p>
          <textarea value={plan.stopCriteria} onInput={(e) => updatePlan('stopCriteria', (e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. Error rate exceeds 5%. A boundary is violated. Team refuses to use it. Cost exceeds budget by 20%."
            rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>Timeline</label>
          <textarea value={plan.timeline} onInput={(e) => updatePlan('timeline', (e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. 3 weeks. Midpoint check-in after week 2. Final evaluation in week 4."
            rows={1} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>Pilot owner</label>
          <textarea value={plan.owner} onInput={(e) => updatePlan('owner', (e.target as HTMLTextAreaElement).value)}
            placeholder="e.g. Sarah Chen, FP&A lead. Has authority to pause or stop the pilot."
            rows={1} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }} />
        </div>
      </div>

      {/* Downloads */}
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
  );
}
