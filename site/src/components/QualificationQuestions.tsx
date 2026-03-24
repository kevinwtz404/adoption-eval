import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import type { QualificationScores } from '../../../src/types';

interface Criterion {
  key: string;
  label: string;
  gate: boolean;
  question: string;
  anchors: string[];
  resourceLabel: string;
  resourceHref: string;
}

const CRITERIA: Criterion[] = [
  {
    key: 'business_impact', label: 'Impact: Does it matter enough?', gate: false,
    question: 'How much business impact would improving this workflow have? Think about time saved, cost reduced, quality improved or risk lowered.',
    anchors: [
      'Marginal impact. Nice to fix but nobody would notice if it stayed the same.',
      'Some impact. Would save a few hours a week or reduce minor friction.',
      'Meaningful impact. Would noticeably improve a team\'s capacity or output quality.',
      'Significant impact. Directly affects revenue, cost, compliance or customer experience.',
      'Critical impact. Leadership is actively asking for improvement in this area.',
    ],
    resourceLabel: '', resourceHref: '',
  },
  {
    key: 'frequency', label: 'Time: How much time does it eat?', gate: false,
    question: 'How much total time does this workflow consume? A process that runs often and takes real effort each time is where automation gains multiply fastest.',
    anchors: [
      'Minimal. Happens a few times a year and is quick each time — a few hours total per year.',
      'Modest. Runs monthly or takes a while each time — someone loses a day or two a month to it.',
      'Noticeable. Runs weekly or multiple times a month — it is a regular chunk of someone\'s job.',
      'Substantial. Runs several times a week and takes real effort each time — it shapes someone\'s whole role.',
      'Dominant. Runs daily or continuously — multiple people spend most of their time on this.',
    ],
    resourceLabel: 'Process selection checklist', resourceHref: 'https://www.processmaker.com/blog/select-business-processes-for-automation-a-comprehensive-checklist/',
  },
  {
    key: 'baseline_measurability', label: 'Baseline: Can you measure how it works today?', gate: true,
    question: 'Do you have a way to measure current performance? Without a baseline, you cannot tell whether a pilot actually improved anything. If you score below 3, consider deferring until you can establish a baseline.',
    anchors: [
      'No measurement at all. Nobody tracks how long this takes or how often it goes wrong.',
      'Anecdotal only. People have a sense it is slow or error-prone but no data.',
      'Rough metrics exist. You could estimate cycle time, error rate or volume from existing records.',
      'Good data available. Cycle time, throughput or quality are tracked, even if informally.',
      'Precise measurement. Detailed metrics are already in place and regularly reviewed.',
    ],
    resourceLabel: 'How do I establish a baseline?', resourceHref: 'resources/#baseline-measurability',
  },
  {
    key: 'data_readiness', label: 'Data: Is the data in good enough shape?', gate: false,
    question: 'How mature is the data that feeds this workflow? Poor data means any automation will amplify the mess, not fix it.',
    anchors: [
      'Not ready. Nobody has mapped out what data this workflow needs or where it lives.',
      'Known but messy. You know what data exists but it is scattered, outdated or hard to get at in the format you would need.',
      'Accessible and usable. The data is available in a consistent place and stays fresh enough for the workflow to run on.',
      'Well-understood. You can tell where the data came from, what it means and whether to trust it.',
      'Managed and protected. There are checks for quality, clear access rules and a log of who or what touches the data.',
    ],
    resourceLabel: 'Gartner\'s data readiness checklist', resourceHref: 'https://www.gartner.com/technology/media-products/reprints/nice/1-2MQGL3GC.html',
  },
  {
    key: 'boundary_clarity', label: 'Boundaries: Is it clear what should stay with people?', gate: true,
    question: 'Do you know which parts of this workflow need a person and which parts don\'t? Without clear boundaries you cannot scope what to automate. If you score below 3, work this out before piloting.',
    anchors: [
      'Unexamined. Nobody has broken this workflow into steps or asked which ones need human judgement.',
      'Partially mapped. You have a rough list of steps but have not agreed on which ones involve decisions, exceptions or sign-offs that need a person.',
      'Key boundaries identified. You can point to the main decision points and approval steps, even if edge cases are still fuzzy.',
      'Agreed and documented. The team agrees on which steps need a person, which could be automated, and what happens when something unexpected comes up.',
      'Tested in practice. You have already run parts of this workflow with reduced human involvement and know where people actually need to step in.',
    ],
    resourceLabel: 'HBR: Collaborative Intelligence', resourceHref: 'https://hbr.org/2018/07/collaborative-intelligence-humans-and-ai-are-joining-forces',
  },
  {
    key: 'pilotability', label: 'Pilot: Can you test this in a few weeks?', gate: false,
    question: 'Could you test this with a small group on a slice of the workflow within a few weeks? The easier it is to isolate a piece and measure the result, the faster you learn.',
    anchors: [
      'No clear slice. The workflow is too tangled to isolate a part — you would have to change everything at once or nothing.',
      'Slice exists but blocked. You can see a piece to test but you would need access, approvals or dependencies that are hard to get.',
      'Testable with effort. You could isolate a slice and a small group to test with, though it would take some setup and coordination.',
      'Ready to scope. There is an obvious slice, you have the access you need, and a small group willing to try it.',
      'Ready to go. You have a defined slice, a team, a way to compare before and after, and could start within days.',
    ],
    resourceLabel: 'The Lean Startup principles', resourceHref: 'https://theleanstartup.com/principles',
  },
];

export default function QualificationQuestions() {
  const [scores, setScores] = useState<QualificationScores>({
    business_impact: 3, frequency: 3, baseline_measurability: 3,
    data_readiness: 3, boundary_clarity: 3, pilotability: 3,
  });
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    const state = loadState();
    if (state.qualification) setScores(state.qualification);

    // Listen for changes from the scoring section below
    const handler = () => {
      const state = loadState();
      if (state.qualification) setScores(state.qualification);
    };
    window.addEventListener('qualification-updated', handler);
    return () => window.removeEventListener('qualification-updated', handler);
  }, []);

  function handleChange(key: string, value: number) {
    const rounded = Math.round(value * 10) / 10;
    const next = { ...scores, [key]: rounded };
    setScores(next);
    saveState({ qualification: next as any });
    window.dispatchEvent(new Event('qualification-updated'));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem', marginTop: '1.5rem' }}>
      {CRITERIA.map((c) => {
        const value = (scores as Record<string, number | undefined>)[c.key] ?? 3;
        const isExpanded = expandedKey === c.key;
        const gateFailed = c.gate && (value as number) < 3;

        return (
          <div key={c.key} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>
            <div
              onClick={() => setExpandedKey(isExpanded ? null : c.key)}
              style={{
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                {c.label}
                {c.gate && <span style={{ marginLeft: '0.5rem', fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4', fontWeight: 600 }}>gate</span>}
              </span>
              <span style={{ fontSize: '1.25rem', color: '#ccc', fontWeight: 400 }}>{isExpanded ? '\u2212' : '+'}</span>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.25rem' }}>
                <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.75', marginBottom: '1.25em' }}>{c.question}</p>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem', marginBottom: '1.25em' }}>
                  {c.anchors.map((anchor, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '14px', lineHeight: '1.6', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: '#6830C4', minWidth: '1.25em', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ color: '#666' }}>{anchor}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '1rem', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0', marginBottom: '1.25em' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Your score</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#6830C4' }}>{(value as number).toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min={1} max={5} step={0.1} value={value}
                    style={{ width: '100%', accentColor: '#6830C4', cursor: 'pointer' }}
                    onInput={(e: Event) => handleChange(c.key, parseFloat((e.target as HTMLInputElement).value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#ccc', marginTop: '0.25rem', padding: '0 2px' }}>
                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  </div>
                  {gateFailed && (
                    <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '0.5rem' }}>
                      This is a gate criterion. A score below 3 means the workflow is not ready to pilot yet.
                    </div>
                  )}
                </div>

                {c.resourceLabel && <a href={c.resourceHref} style={{ fontSize: '13px', color: '#6830C4' }}>{c.resourceLabel}</a>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
