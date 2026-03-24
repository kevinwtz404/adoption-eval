import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';

export default function PilotBuilder() {
  const [state, setState] = useState<any>(null);
  const [painPoint, setPainPoint] = useState('');

  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.selectedCase) {
      const flagship = flagshipCases.find(c => c.id === s.selectedCase);
      if (flagship) setPainPoint(flagship.painPoint);
    }
  }, []);

  if (!state?.workflow) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '14px', color: '#991b1b' }}>
        No workflow data found. <a href="2-select/" style={{ color: '#6830C4' }}>Start from Step 2</a>.
      </div>
    );
  }

  const workflow = state.workflow;
  const qualification = state.qualification;
  const designs = state.designs || {};
  const boundaries = state.boundaries || {};
  const candidateSteps = (workflow.steps || []).filter((s: any) => designs[s.id]?.isCandidate);

  function buildMarkdownSummary(): string {
    let md = `# Pilot Plan: ${workflow.name}\n\n`;
    md += `## Workflow\n${painPoint || 'Custom workflow'}\n\n`;
    md += `### Steps\n`;
    (workflow.steps || []).forEach((s: any, i: number) => {
      md += `${i + 1}. ${s.name}${s.owner ? ` (${s.owner})` : ''}${s.pain ? ` — ${s.pain}` : ''}\n`;
    });

    if (qualification) {
      md += `\n## Qualification Score\n`;
      Object.entries(qualification).forEach(([key, val]) => {
        md += `- ${key.replace(/_/g, ' ')}: ${val}\n`;
      });
    }

    if (candidateSteps.length > 0) {
      md += `\n## Intervention Design\n`;
      candidateSteps.forEach((s: any) => {
        const d = designs[s.id];
        md += `\n### ${s.name}\n`;
        if (d.description) md += `- **Intervention:** ${d.description}\n`;
        if (d.notes) md += `- **Notes:** ${d.notes}\n`;
      });
    }

    if (Object.keys(boundaries).length > 0) {
      md += `\n## Boundaries and Controls\n`;
      Object.entries(boundaries).forEach(([stepId, items]: [string, any]) => {
        const step = (workflow.steps || []).find((s: any) => s.id === stepId);
        if (step && items.length > 0) {
          md += `\n### ${step.name}\n`;
          items.forEach((item: any) => {
            md += `- [${item.checked ? 'x' : ' '}] ${item.text}${item.notes ? ` — ${item.notes}` : ''}\n`;
          });
        }
      });
    }

    md += `\n## Next Steps\n`;
    md += `- [ ] Define pilot scope (smallest meaningful slice)\n`;
    md += `- [ ] Set success criteria (specific, measurable)\n`;
    md += `- [ ] Set stop criteria (when to halt the pilot)\n`;
    md += `- [ ] Assign pilot owner\n`;
    md += `- [ ] Set timeline (2-4 weeks recommended)\n`;
    md += `- [ ] Schedule midpoint check-in\n`;

    return md;
  }

  function buildJsonBrief(): string {
    return JSON.stringify({
      pilot_plan: {
        workflow: {
          name: workflow.name,
          steps: workflow.steps,
          pain_point: painPoint || null,
        },
        qualification: qualification || null,
        intervention: candidateSteps.map((s: any) => ({
          step: s.name,
          ...designs[s.id],
        })),
        boundaries: Object.entries(boundaries).map(([stepId, items]: [string, any]) => {
          const step = (workflow.steps || []).find((s: any) => s.id === stepId);
          return {
            step: step?.name,
            items: items.map((i: any) => ({ text: i.text, category: i.category, confirmed: i.checked, notes: i.notes })),
          };
        }).filter((b: any) => b.items.length > 0),
      },
      instructions: 'This is a pilot plan for an AI adoption project. Use this to generate implementation options, identify technical requirements and create a detailed build plan. Consider vendor-based solutions, low-code builds and custom implementations. For each AI component, suggest specific models, tools and architectures that fit the requirements and boundaries described.',
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

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Summary */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Pilot plan for</div>
        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '0.75rem' }}>{workflow.name}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6830C4' }}>{(workflow.steps || []).length}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>total steps</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6830C4' }}>{candidateSteps.length}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>steps changing</div>
          </div>
          <div style={{ padding: '0.75rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6830C4' }}>
              {Object.values(boundaries).flat().filter((b: any) => b.checked).length}/{Object.values(boundaries).flat().length}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>boundaries confirmed</div>
          </div>
        </div>

        {candidateSteps.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>Steps being changed:</div>
            {candidateSteps.map((s: any) => {
              const d = designs[s.id];
              return (
                <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {d?.description && <span style={{ color: '#666' }}> — {d.description}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Downloads */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
        <button
          onClick={() => download(buildMarkdownSummary(), `pilot-plan-${workflow.name}.md`, 'text/markdown')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#6830C4', color: '#fff', border: 'none' }}
        >
          Download Roadmap (Markdown)
        </button>
        <button
          onClick={() => download(buildJsonBrief(), `build-brief-${workflow.name}.json`, 'application/json')}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#6830C4', border: '1px solid #6830C4' }}
        >
          Download Build Brief (JSON)
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(buildJsonBrief()); }}
          style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#666', border: '1px solid #e0e0e0' }}
        >
          Copy Build Brief to Clipboard
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '0.75rem' }}>
        The build brief is designed to be pasted into an AI assistant (like Claude or ChatGPT) to get implementation options, vendor recommendations and technical architecture suggestions.
      </p>
    </div>
  );
}
