import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { scoreOpportunity } from '../../../src/lib/scoreOpportunity';
import type { QualificationScores, QualificationResult } from '../../../src/types';
import { flagshipCases } from '../data/flagship-cases';

const CRITERIA: Array<{ key: string; label: string; gate: boolean }> = [
  { key: 'business_impact', label: 'Does it matter enough?', gate: false },
  { key: 'frequency', label: 'Does it happen often enough?', gate: false },
  { key: 'baseline_measurability', label: 'Can you measure how it works today?', gate: true },
  { key: 'data_readiness', label: 'Is the data in good enough shape?', gate: false },
  { key: 'boundary_clarity', label: 'Is it clear what should stay with people?', gate: true },
  { key: 'pilotability', label: 'Can you test this in 2-4 weeks?', gate: false },
];

const GATE_KEYS = ['boundary_clarity', 'baseline_measurability'];

const decisionColors: Record<string, { bg: string; fg: string }> = {
  proceed: { bg: '#dcfce7', fg: '#166534' },
  proceed_with_conditions: { bg: '#fef9c3', fg: '#854d0e' },
  defer: { bg: '#fee2e2', fg: '#991b1b' },
};

const decisionLabels: Record<string, string> = {
  proceed: 'Proceed',
  proceed_with_conditions: 'Proceed with conditions',
  defer: 'Defer',
};

function buildFeedback(scores: QualificationScores, result: QualificationResult): Array<{ text: string; href?: string }> {
  const feedback: Array<{ text: string; href?: string }> = [];
  const s = scores as Record<string, number | undefined>;

  if (result.decision === 'proceed') {
    feedback.push({ text: 'This workflow looks ready for a pilot. Move on to mapping the steps.' });
    return feedback;
  }

  if ((s.baseline_measurability ?? 3) < 3) {
    feedback.push({ text: 'You cannot measure how this works today. Without a baseline, you will not know if a pilot improved anything. Consider tracking the process manually for 1-2 weeks first.', href: 'resources/#baseline-measurability' });
  }
  if ((s.boundary_clarity ?? 3) < 3) {
    feedback.push({ text: 'It is not clear what should stay with people. Unclear boundaries make it hard to scope a safe pilot. Work through the mapping step to clarify this.', href: 'resources/#boundary-clarity' });
  }

  const weakAreas = CRITERIA.filter(c => !c.gate).filter(c => (s[c.key] ?? 3) < 3).sort((a, b) => ((s[a.key] ?? 3) as number) - ((s[b.key] ?? 3) as number));
  for (const weak of weakAreas) {
    const val = s[weak.key] ?? 3;
    if (weak.key === 'business_impact') feedback.push({ text: `Business impact scored ${(val as number).toFixed(1)}. If improving this workflow would not meaningfully affect time, cost or quality, consider prioritising a different one.`, href: 'resources/#business-impact' });
    else if (weak.key === 'frequency') feedback.push({ text: `This workflow runs infrequently (scored ${(val as number).toFixed(1)}). Automation gains multiply with frequency.`, href: 'resources/#frequency' });
    else if (weak.key === 'data_readiness') feedback.push({ text: `Data readiness scored ${(val as number).toFixed(1)}. Poor data quality means automation will amplify the mess. Consider a data cleanup pass before piloting.`, href: 'resources/#data-readiness' });
    else if (weak.key === 'pilotability') feedback.push({ text: `Pilotability scored ${(val as number).toFixed(1)}. This workflow may be hard to test in a small, time-boxed way. Look for a smaller slice you could isolate.`, href: 'resources/#pilotability' });
  }

  if (feedback.length === 0) feedback.push({ text: 'Scores are moderate across the board. This is workable but be deliberate about which conditions need to be met before starting a pilot.' });
  return feedback;
}

export default function QualificationForm() {
  const [scores, setScores] = useState<QualificationScores>({
    business_impact: 3, frequency: 3, baseline_measurability: 3,
    data_readiness: 3, boundary_clarity: 3, pilotability: 3,
  });
  const [workflowName, setWorkflowName] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState<number>(0);
  const [actors, setActors] = useState<string[]>([]);

  function loadFromState() {
    const state = loadState();
    if (state.qualification) setScores(state.qualification);
    if (state.workflow?.name) {
      setWorkflowName(state.workflow.name);
      setStepCount(state.workflow.steps?.length || 0);
      setActors(state.workflow.actors || []);
    }
    if (state.selectedCase) {
      setSelectedCase(state.selectedCase);
      const flagship = flagshipCases.find(c => c.id === state.selectedCase);
      if (flagship) setPainPoint(flagship.painPoint);
    }
  }

  useEffect(() => {
    loadFromState();
    // Sync when the questions component updates scores
    const handler = () => loadFromState();
    window.addEventListener('qualification-updated', handler);
    return () => window.removeEventListener('qualification-updated', handler);
  }, []);

  const result: QualificationResult = useMemo(() => scoreOpportunity(scores), [scores]);

  function handleChange(key: string, value: number) {
    const rounded = Math.round(value * 10) / 10;
    const next = { ...scores, [key]: rounded };
    setScores(next);
    saveState({ qualification: next as any });
    window.dispatchEvent(new Event('qualification-updated'));
  }

  const dc = decisionColors[result.decision] || decisionColors.defer;

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Workflow context */}
      {workflowName ? (
        <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: painPoint ? '0.75rem' : 0 }}>
            <div>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Scoring workflow</div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{workflowName}</div>
            </div>
            <span style={{ fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
              {selectedCase === 'custom' ? 'Your workflow' : 'Flagship case'}
            </span>
          </div>
          {painPoint && <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '0.75rem' }}>{painPoint}</div>}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '12px', color: '#999' }}>
            <span>{stepCount} steps</span>
            <span>{actors.length} roles involved</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.75rem 1rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', marginBottom: '1.5rem', fontSize: '13px', color: '#991b1b' }}>
          No workflow selected. <a href="2-select/" style={{ color: '#6830C4' }}>Go back to Step 2</a> to pick one.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Left: Sliders */}
        <div>
          {CRITERIA.map(({ key, label, gate }) => {
            const value = (scores as Record<string, number | undefined>)[key] ?? 3;
            const gateFailed = gate && (value as number) < 3;

            return (
              <div key={key} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                    {label}
                    {gate && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '13px', fontWeight: 700, color: gateFailed ? '#dc2626' : '#16a34a' }}>
                        {gateFailed ? '\u2717' : '\u2713'}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#6830C4' }}>{(value as number).toFixed(1)}</span>
                </div>
                <input
                  type="range" min={1} max={5} step={0.1} value={value}
                  style={{ width: '100%', accentColor: '#6830C4', cursor: 'pointer' }}
                  onInput={(e: Event) => handleChange(key, parseFloat((e.target as HTMLInputElement).value))}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Results */}
        <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#4a1f8a', textAlign: 'center' as const, marginBottom: '0.25rem' }}>
            {result.weighted_score.toFixed(1)}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' as const, marginBottom: '1.25rem' }}>
            Overall score (out of 5)
          </div>

          {/* Bar chart */}
          {CRITERIA.map(({ key, label }) => {
            const value = (scores as Record<string, number | undefined>)[key] ?? 3;
            const pct = ((value as number) / 5) * 100;
            return (
              <div key={key} style={{ marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#666' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{(value as number).toFixed(1)}</span>
                </div>
                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#6830C4', borderRadius: '3px', transition: 'width 0.2s' }} />
                </div>
              </div>
            );
          })}

          {/* Gates */}
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Gate status</div>
            {GATE_KEYS.map((key) => {
              const criterion = CRITERIA.find(c => c.key === key);
              const value = (scores as Record<string, number | undefined>)[key] ?? 0;
              const passed = (value as number) >= 3;
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', fontSize: '12px' }}>
                  <span style={{ color: '#666' }}>{criterion?.label}</span>
                  <span style={{ fontWeight: 700, color: passed ? '#16a34a' : '#dc2626' }}>{passed ? '\u2713 Pass' : '\u2717 Fail'}</span>
                </div>
              );
            })}
          </div>

          {/* Decision */}
          <div style={{ display: 'block', padding: '0.625rem 1rem', borderRadius: '100px', background: dc.bg, color: dc.fg, fontSize: '15px', fontWeight: 700, textAlign: 'center' as const, marginTop: '1.25rem' }}>
            {decisionLabels[result.decision]}
          </div>

          {/* Feedback */}
          <div style={{ marginTop: '1rem' }}>
            {buildFeedback(scores, result).map((item, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', padding: '0.5rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.5rem' }}>
                {item.text}
                {item.href && <span> <a href={item.href} style={{ color: '#6830C4', fontSize: '11px' }}>Learn more</a></span>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
