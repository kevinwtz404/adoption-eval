import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { scoreOpportunity } from '../../../src/lib/scoreOpportunity';
import type { QualificationScores, QualificationResult } from '../../../src/types';

const PURPLE = '#6830C4';
const PURPLE_LIGHT = '#9b6bd4';
const PURPLE_DARK = '#4a1f8a';

const CRITERIA_LABELS: Record<string, string> = {
  business_impact: 'Business Impact',
  frequency: 'Frequency',
  baseline_measurability: 'Baseline Measurability',
  data_readiness: 'Data Readiness',
  boundary_clarity: 'Boundary Clarity',
  pilotability: 'Pilotability',
};

const GATE_KEYS = ['boundary_clarity', 'baseline_measurability'];

const decisionColors: Record<string, { bg: string; fg: string }> = {
  proceed: { bg: '#dcfce7', fg: '#166534' },
  proceed_with_conditions: { bg: '#fef9c3', fg: '#854d0e' },
  defer: { bg: '#fee2e2', fg: '#991b1b' },
};

const decisionLabels: Record<string, string> = {
  proceed: 'Proceed',
  proceed_with_conditions: 'Proceed with Conditions',
  defer: 'Defer',
};

const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
  } as const,
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e1e2f',
    marginBottom: 8,
  } as const,
  subheading: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  } as const,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 32,
  } as const,
  sliderGroup: {
    marginBottom: 20,
  } as const,
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  } as const,
  sliderValue: {
    fontSize: 15,
    fontWeight: 700,
    color: PURPLE,
  } as const,
  slider: {
    width: '100%',
    accentColor: PURPLE,
    cursor: 'pointer',
  } as const,
  gateIndicator: (passed: boolean) => ({
    display: 'inline-block',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 700,
    color: passed ? '#16a34a' : '#dc2626',
  }),
  resultsCard: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
  } as const,
  bigScore: {
    fontSize: 48,
    fontWeight: 800,
    color: PURPLE_DARK,
    textAlign: 'center' as const,
    marginBottom: 4,
  } as const,
  bigScoreLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center' as const,
    marginBottom: 20,
  } as const,
  criterionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: 13,
  } as const,
  criterionName: {
    fontWeight: 500,
    color: '#374151',
  } as const,
  criterionMeta: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    color: '#6b7280',
    fontSize: 12,
  } as const,
  decisionBadge: (decision: string) => {
    const c = decisionColors[decision] || decisionColors.defer;
    return {
      display: 'inline-block',
      padding: '6px 18px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 14,
      fontWeight: 700,
      textAlign: 'center' as const,
      marginTop: 16,
      width: '100%',
      boxSizing: 'border-box' as const,
    };
  },
  gatesSection: {
    marginTop: 16,
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  } as const,
  gateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    fontSize: 13,
  } as const,
};

export default function QualificationForm() {
  const [scores, setScores] = useState<QualificationScores>({
    business_impact: 3,
    frequency: 3,
    baseline_measurability: 3,
    data_readiness: 3,
    boundary_clarity: 3,
    pilotability: 3,
  });

  useEffect(() => {
    const state = loadState();
    if (state.qualification) {
      setScores(state.qualification);
    }
  }, []);

  const result: QualificationResult = useMemo(() => scoreOpportunity(scores), [scores]);

  function handleChange(key: string, value: number) {
    const next = { ...scores, [key]: value };
    setScores(next);
    saveState({ qualification: next as any });
  }

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Qualification Scoring</div>
      <div style={styles.subheading}>
        Rate each criterion from 1 (low) to 5 (high). Results update live.
      </div>

      <div style={styles.twoCol}>
        {/* Sliders */}
        <div>
          {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
            const value = (scores as Record<string, number | undefined>)[key] ?? 3;
            const isGate = GATE_KEYS.includes(key);
            const gatePassed = isGate ? (value as number) >= 3 : null;

            return (
              <div key={key} style={styles.sliderGroup}>
                <div style={styles.sliderLabel}>
                  <span>
                    {label}
                    {isGate && (
                      <span style={styles.gateIndicator(gatePassed!)}>
                        {gatePassed ? '\u2713' : '\u2717'}
                      </span>
                    )}
                  </span>
                  <span style={styles.sliderValue}>{value}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={value}
                  style={styles.slider}
                  onInput={(e: Event) =>
                    handleChange(key, parseInt((e.target as HTMLInputElement).value, 10))
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div style={styles.resultsCard}>
          <div style={styles.bigScore}>{result.weighted_score.toFixed(2)}</div>
          <div style={styles.bigScoreLabel}>Weighted Score (out of 5)</div>

          {Object.entries(result.criteria).map(([key, c]) => (
            <div key={key} style={styles.criterionRow}>
              <span style={styles.criterionName}>
                {CRITERIA_LABELS[key] || key}
              </span>
              <span style={styles.criterionMeta}>
                <span>Score: {c.score}</span>
                <span>Weight: {(c.weight * 100).toFixed(0)}%</span>
                <span style={{ fontWeight: 600, color: PURPLE }}>
                  {c.weighted.toFixed(2)}
                </span>
              </span>
            </div>
          ))}

          <div style={styles.gatesSection}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Gate Status
            </div>
            {GATE_KEYS.map((key) => {
              const value = (scores as Record<string, number | undefined>)[key] ?? 0;
              const passed = (value as number) >= 3;
              return (
                <div key={key} style={styles.gateRow}>
                  <span>{CRITERIA_LABELS[key]}</span>
                  <span style={{ fontWeight: 700, color: passed ? '#16a34a' : '#dc2626' }}>
                    {passed ? '\u2713 Pass' : '\u2717 Fail'} ({value})
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.decisionBadge(result.decision)}>
            {decisionLabels[result.decision]}
          </div>

          {result.gate_failures.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#991b1b' }}>
              {result.gate_failures.map((f, i) => (
                <div key={i} style={{ padding: '2px 0' }}>{f}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
