import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { callAI } from '../data/api';
import LoadingDots from './LoadingDots';

interface PilotPlan {
  scope: string;
  successCriteria: string;
  stopCriteria: string;
  timeline: string;
  owner: string;
}

const TABS = [
  { id: 'scope', label: 'Scope', field: 'scope' as keyof PilotPlan },
  { id: 'success', label: 'Success', field: 'successCriteria' as keyof PilotPlan },
  { id: 'stop', label: 'Stop', field: 'stopCriteria' as keyof PilotPlan },
  { id: 'timeline', label: 'Timeline', field: 'timeline' as keyof PilotPlan },
  { id: 'owner', label: 'Owner', field: 'owner' as keyof PilotPlan },
];

const TAB_CONTENT: Record<string, { explanation: string; placeholder: string }> = {
  scope: {
    explanation: 'Pick the smallest meaningful slice you can test. One team, one process, one cycle. The goal is to learn, not to deploy. If the pilot goes wrong, the impact should be contained.',
    placeholder: 'What specific slice of the workflow will you test? Which team, which data, how many users?',
  },
  success: {
    explanation: 'Write down what success looks like before you start. Be specific and measurable. Include quality and control, not just speed. A pilot that is faster but less accurate or harder to trust is not a success.',
    placeholder: 'What specific improvements would make this worth scaling? What must not get worse?',
  },
  stop: {
    explanation: 'Define what would cause you to stop early. Write this down now so you are not rationalising problems when they appear. Think about error rates, boundary violations, user trust and cost.',
    placeholder: 'What would cause you to stop the pilot? What is the threshold for each?',
  },
  timeline: {
    explanation: 'Most useful pilots run 2-4 weeks. Shorter and you do not have enough data. Longer and you lose momentum. Build in a midpoint check-in so you can adjust or stop halfway through.',
    placeholder: 'How long will the pilot run? When is the midpoint check-in? When is the final evaluation?',
  },
  owner: {
    explanation: 'One person owns the pilot. Not a committee. They run it, collect data, report results and make the call at the end. They need authority to stop the pilot if something goes wrong.',
    placeholder: 'Which role owns this pilot? Do they have authority to pause or stop it?',
  },
};

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.375rem;font-weight:600;margin:1.25em 0 0.5em;">$1</h2>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\*   /gm, '<li>')
    .replace(/^\d+\.\s+/gm, '<li>')
    .replace(/<li>(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul style="padding-left:1.5rem;margin:0.5em 0;">${match}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin-top:1.25em;">')
    .replace(/\n/g, ' ')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

async function generateOverview(allData: any): Promise<string> {
  const prompt = `You are helping someone plan an AI pilot. Here is everything they have decided so far:

Workflow: ${allData.workflowName}
Pain point: ${allData.painPoint}
Redesign: ${allData.redesign}
Scope: ${allData.scope}
Success criteria: ${allData.successCriteria}
Stop criteria: ${allData.stopCriteria}
Timeline: ${allData.timeline}
Owner: ${allData.owner}
Boundary decisions: ${JSON.stringify(allData.boundaryDecisions)}
Components: ${JSON.stringify(allData.components)}

Produce a concise response with these exact four sections. Keep it short and practical. Use UK English, no em dashes. Do not assume specific tools, vendors or platforms. Do not name specific products. Keep questions open so the user can fill in what they actually use. Be realistic about technical feasibility.

## Pilot summary
2-3 sentences summarising what this pilot is testing, the approach and the key constraint. Do not repeat everything they said. Just the essence.

## Open questions
List the specific questions they still need to answer before building this. Focus on practical things: which systems they use, budget, who reviews daily, what data sources to connect, what tools to evaluate. Be specific to their workflow.

## Steps to get started
A short numbered list of what they need to do. Not a timeline. Just the sequence. Keep it to 5-7 steps.

## What success could look like
For each of the six evaluation dimensions (Time, Cost, Quality, Risk, Adoption, Control), give a realistic target range for this specific workflow. Be honest about which dimensions matter most and which matter less. Consider what error rates are acceptable given the context (e.g. a factual error in cold outreach is tolerable, a wrong number in a financial report is not). Keep each to one sentence.

## Analysis
A short analysis covering: recommended approach (one sentence), what stays with people (one sentence), key risks (2-3 bullet points), boundaries and controls (2-3 bullet points), simpler alternatives to consider before building with AI (2-3 bullet points).

IMPORTANT: Only produce these five sections. Keep the total response concise.`;

  return await callAI(prompt, allData.workflowName);
}

export default function PilotBuilder() {
  const [state, setState] = useState<any>(null);
  const [painPoint, setPainPoint] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [plan, setPlan] = useState<PilotPlan>({ scope: '', successCriteria: '', stopCriteria: '', timeline: '', owner: '' });
  const [activeTab, setActiveTab] = useState('scope');
  const [overview, setOverview] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    if (s.selectedCase) {
      const flagship = flagshipCases.find(c => c.id === s.selectedCase);
      if (flagship) {
        setPainPoint(flagship.painPoint);
        setDisplayName(flagship.title);
      }
    }
    if ((s as any).pilotPlan) setPlan((s as any).pilotPlan);
    if ((s as any).pilotOverview) setOverview((s as any).pilotOverview);
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
  const planComplete = planFields.filter(f => (f || '').trim()).length;
  const currentTab = TAB_CONTENT[activeTab];
  const currentField = TABS.find(t => t.id === activeTab)?.field || 'scope';

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateOverview({
      workflowName: (displayName || workflow.name),
      painPoint,
      redesign,
      scope: plan.scope,
      successCriteria: plan.successCriteria,
      stopCriteria: plan.stopCriteria,
      timeline: plan.timeline,
      owner: plan.owner,
      boundaryDecisions: boundaryDecisions.filter((d: any) => d.choice).map((d: any) => `${d.question}: ${d.choice}${d.detail ? ' — ' + d.detail : ''}`),
      components: redesignData?.components?.map((c: any) => `${c.name} (${c.type})`) || [],
    });
    setOverview(result);
    saveState({ pilotOverview: result } as any);
    setGenerating(false);
  }

  function buildMarkdownRoadmap(): string {
    let md = `# Pilot Plan: ${(displayName || workflow.name)}\n\n`;
    md += `## Pain point\n${painPoint || 'Custom workflow'}\n\n`;
    md += `## Current workflow\n`;
    (workflow.steps || []).forEach((s: any, i: number) => {
      md += `${i + 1}. ${s.name}${s.owner ? ` (${s.owner})` : ''}${s.pain ? ` — ${s.pain}` : ''}\n`;
    });
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
    md += `## Evaluation framework\n\n`;
    md += `After the pilot, evaluate across these six dimensions. Not all will be equally important for every pilot. The key rule: do not treat time savings alone as success. A pilot is only strong when improvements in time and cost do not degrade risk, control or quality.\n\n`;
    md += `### Time\nDid the workflow get faster? Measure cycle time end-to-end, not just the automated steps.\n\n`;
    md += `### Cost\nWhat did the pilot cost to run (API calls, tools, setup time) vs what did it save?\n\n`;
    md += `### Quality\nIs the output better or worse? Measure accuracy, consistency and error rate. Ask the people who use the output.\n\n`;
    md += `### Risk\nDid the pilot increase or decrease operational risk? Were there any boundary violations, near-misses or unexpected behaviours?\n\n`;
    md += `### Adoption\nDid the team actually use it? Was there friction? Did people trust it, work around it or ignore it?\n\n`;
    md += `### Control\nCan you trace what the system did and why? Can you audit it? Do you trust the boundaries held?\n\n`;
    md += `### Decision\nAfter measuring, choose one:\n- **Scale**: expand to more of the workflow, more teams or more volume\n- **Revise**: adjust boundaries, components or scope and run another iteration\n- **Stop**: document what you learned and move on. This is a valid outcome.\n\n`;
    return md;
  }

  function buildBrief(): string {
    let brief = `# AI Pilot Build Brief\n\n`;
    brief += `## Instructions\n`;
    brief += `This document contains everything needed to plan the implementation of an AI pilot. Upload this to an AI assistant (Claude, ChatGPT, etc.) and ask it to:\n\n`;
    brief += `1. Research specific tools, vendors and models that fit the requirements below\n`;
    brief += `2. Propose three implementation options: build from scratch, hybrid (custom + off-the-shelf) and fully off-the-shelf\n`;
    brief += `3. For each option, provide: specific tools/products, estimated cost, estimated effort, trade-offs\n`;
    brief += `4. Answer the open questions listed below based on the implementation options\n`;
    brief += `5. Produce a concrete implementation plan for the chosen option\n\n`;
    brief += `---\n\n`;
    brief += `## Workflow\n**${(displayName || workflow.name)}**\n\n${painPoint || ''}\n\n`;
    brief += `### Current steps\n`;
    (workflow.steps || []).forEach((s: any, i: number) => {
      brief += `${i + 1}. ${s.name}${s.owner ? ` (${s.owner})` : ''}${s.pain ? ` — ${s.pain}` : ''}\n`;
    });
    if (redesign) brief += `\n## Proposed redesign\n${redesign}\n`;
    if (redesignData?.components) {
      brief += `\n## Components\n`;
      redesignData.components.forEach((c: any) => {
        if (!c.name.startsWith('_')) brief += `- **${c.name}** (${c.type}): ${c.description}\n`;
      });
    }
    if (boundaryDecisions.length > 0) {
      brief += `\n## Boundary decisions (must be respected)\n`;
      boundaryDecisions.forEach((d: any) => {
        if (d.choice) {
          brief += `- ${d.question} **${d.choice}**${d.detail ? ` — ${d.detail}` : ''}\n`;
          if (d.pilotImplication?.[d.choice]) brief += `  - Implication: ${d.pilotImplication[d.choice]}\n`;
        }
      });
    }
    brief += `\n## Pilot parameters\n`;
    if (plan.scope) brief += `- **Scope:** ${plan.scope}\n`;
    if (plan.successCriteria) brief += `- **Success criteria:** ${plan.successCriteria}\n`;
    if (plan.stopCriteria) brief += `- **Stop criteria:** ${plan.stopCriteria}\n`;
    if (plan.timeline) brief += `- **Timeline:** ${plan.timeline}\n`;
    if (plan.owner) brief += `- **Owner:** ${plan.owner}\n`;
    if (overview) {
      brief += `\n## Pilot overview (generated)\n${overview}\n`;
    }
    brief += `\n## Evaluation framework\n\n`;
    brief += `After the pilot, evaluate across six dimensions. The key rule: do not treat time savings alone as success.\n\n`;
    brief += `- **Time**: Did the workflow get faster? Measure end-to-end cycle time.\n`;
    brief += `- **Cost**: What did the pilot cost vs what did it save?\n`;
    brief += `- **Quality**: Is the output better or worse? Accuracy, consistency, error rate.\n`;
    brief += `- **Risk**: Did operational risk increase or decrease? Any boundary violations?\n`;
    brief += `- **Adoption**: Did the team use it and trust it?\n`;
    brief += `- **Control**: Can you trace and audit what the system did?\n\n`;
    brief += `Decision after evaluation: **Scale** (expand), **Revise** (adjust and iterate) or **Stop** (document learnings and move on).\n`;
    return brief;
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Overview */}
      <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '0.25rem' }}>{(displayName || workflow.name)}</div>
        <div style={{ fontSize: '15px', color: '#999' }}>{planComplete} of 5 pilot details filled</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
        {TABS.map((tab, i) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.625rem 0.5rem', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              border: 'none', borderRight: i < TABS.length - 1 ? '1px solid #e0e0e0' : 'none',
              background: activeTab === tab.id ? '#6830C4' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#666',
            }}>
            {tab.label}{(plan[tab.field] as string || '').trim() ? ' \u2713' : ''}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '15px', lineHeight: '1.75', marginBottom: '1rem', color: '#666' }}>
          {currentTab?.explanation}
        </div>
        <textarea
          value={plan[currentField] as string || ''}
          onInput={(e) => updatePlan(currentField, (e.target as HTMLTextAreaElement).value)}
          placeholder={currentTab?.placeholder}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }}
        />
      </div>

      {/* Generate button */}
      {!overview && (
        <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
          <button onClick={handleGenerate}
            disabled={planComplete < 3 || generating}
            style={{
              padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '15px',
              fontFamily: 'inherit', fontWeight: 600, cursor: (planComplete < 3 || generating) ? 'default' : 'pointer',
              background: '#6830C4', color: '#fff', border: 'none',
              opacity: (planComplete < 3 || generating) ? 0.4 : 1,
            }}>
            {generating ? <LoadingDots text="Generating" /> : 'Generate pilot plan'}
          </button>
          {planComplete < 3 && <p style={{ fontSize: '15px', color: '#999', marginTop: '0.5rem' }}>Fill in at least 3 of 5 sections first.</p>}
        </div>
      )}

      {/* Generated overview */}
      {overview && (
        <div>
          <div
            style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem', marginBottom: '1.5rem', fontSize: '15px', lineHeight: '1.75' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(overview) }}
          />

          {/* Downloads */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
            <button onClick={() => download(buildMarkdownRoadmap(), `pilot-roadmap-${(displayName || workflow.name)}.md`, 'text/markdown')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#6830C4', color: '#fff', border: 'none' }}>
              Download roadmap (.md)
            </button>
            <button onClick={() => download(buildBrief(), `build-brief-${(displayName || workflow.name)}.md`, 'text/markdown')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#6830C4', border: '1px solid #6830C4' }}>
              Download build brief (.md)
            </button>
            <button onClick={() => { navigator.clipboard.writeText(buildBrief()); }}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#666', border: '1px solid #e0e0e0' }}>
              Copy build brief
            </button>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', fontSize: '15px', lineHeight: '1.75', color: '#666' }}>
            <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>How to use these files</div>
            <p><strong>Roadmap (.md)</strong> is a self-contained document you can share with your team, leadership or stakeholders. It includes the workflow, redesign, boundary decisions, pilot plan and evaluation framework. Open it in any text editor, Notion, Confluence or preview it on GitHub.</p>
            <p><strong>Build brief (.md)</strong> is designed to be uploaded to an AI assistant (Claude, ChatGPT or similar). It contains everything the assistant needs to research specific tools, propose implementation options and produce a concrete build plan. Upload the file, tell the assistant to read it and ask it to suggest three options: build from scratch, hybrid and off-the-shelf.</p>
            <p>Both files are in Markdown format. You can edit them in any text editor and they render nicely in most documentation tools.</p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => { setOverview(''); saveState({ pilotOverview: null } as any); }}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#6830C4', border: '1px solid #6830C4' }}>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
