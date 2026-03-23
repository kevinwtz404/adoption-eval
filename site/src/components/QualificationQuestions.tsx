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
    key: 'business_impact', label: '1. Does it matter enough?', gate: false,
    question: 'How much business impact would improving this workflow have? Think about time saved, cost reduced, quality improved or risk lowered.',
    anchors: [
      'Marginal impact. Nice to fix but nobody would notice if it stayed the same.',
      'Some impact. Would save a few hours a week or reduce minor friction.',
      'Meaningful impact. Would noticeably improve a team\'s capacity or output quality.',
      'Significant impact. Directly affects revenue, cost, compliance or customer experience.',
      'Critical impact. Leadership is actively asking for improvement in this area.',
    ],
    resourceLabel: 'How do I assess this?', resourceHref: 'resources/#business-impact',
  },
  {
    key: 'frequency', label: '2. Does it happen often enough?', gate: false,
    question: 'How frequently does this workflow run? Automation has more impact on high-frequency processes because the gains multiply.',
    anchors: [
      'Rarely. A few times a year at most.',
      'Occasionally. Monthly or less.',
      'Regularly. Weekly.',
      'Frequently. Multiple times per week.',
      'Constantly. Daily or multiple times per day.',
    ],
    resourceLabel: 'How do I assess this?', resourceHref: 'resources/#frequency',
  },
  {
    key: 'baseline_measurability', label: '3. Can you measure how it works today?', gate: true,
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
    key: 'data_readiness', label: '4. Is the data in good enough shape?', gate: false,
    question: 'What is the quality and accessibility of the data involved in this workflow? Poor data quality means any automation will amplify the mess, not fix it.',
    anchors: [
      'Data is a mess. Scattered, inconsistent, incomplete or inaccessible.',
      'Data exists but quality is poor. Lots of manual cleanup would be needed.',
      'Data is usable. Mostly structured, some gaps but workable.',
      'Data is good. Structured, accessible and reasonably clean.',
      'Data is excellent. Well-structured, consistently maintained and readily accessible.',
    ],
    resourceLabel: 'What does "good enough" data look like?', resourceHref: 'resources/#data-readiness',
  },
  {
    key: 'boundary_clarity', label: '5. Is it clear what should stay with people?', gate: true,
    question: 'Can you clearly identify which parts of this workflow require human judgement, accountability or approval? If you score below 3, the boundaries are too unclear to scope a safe pilot.',
    anchors: [
      'No idea. It is unclear where human judgement is needed vs where automation could work.',
      'Rough sense. You could guess but people would disagree.',
      'Main boundaries identifiable. You can point to the key human decision points even if details are fuzzy.',
      'Boundaries are clear. Most people involved would agree on what stays human.',
      'Obvious. It is immediately clear which parts need people and which do not.',
    ],
    resourceLabel: 'How do I figure out the boundaries?', resourceHref: 'resources/#boundary-clarity',
  },
  {
    key: 'pilotability', label: '6. Can you test this in 2-4 weeks?', gate: false,
    question: 'Can you run a small pilot on a slice of this workflow within 2-4 weeks? If the scope is too large, the dependencies too complex or the approvals too slow, it is harder to learn quickly.',
    anchors: [
      'Very difficult. Would need months of setup, multiple approvals or significant infrastructure.',
      'Challenging. Possible but would require significant effort to scope down.',
      'Feasible. You could carve out a meaningful slice to test within a month.',
      'Straightforward. A small pilot could be set up within 2 weeks.',
      'Easy. You could start a pilot this week with minimal setup.',
    ],
    resourceLabel: 'How do I scope a pilot?', resourceHref: 'resources/#pilotability',
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

                <a href={c.resourceHref} style={{ fontSize: '13px', color: '#6830C4' }}>{c.resourceLabel}</a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
