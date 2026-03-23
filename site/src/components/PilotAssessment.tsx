import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { loadState } from '../data/store';
import { runAssessment } from '../../../src/lib/runAssessment';
import type { WorkflowInput, AssessmentResult, ReadinessProfile } from '../../../src/types';

const PURPLE = '#6830C4';
const PURPLE_DARK = '#4a1f8a';

const actionCategoryColors: Record<string, { bg: string; fg: string }> = {
  prerequisite: { bg: '#e0e7ff', fg: '#3730a3' },
  control: { bg: '#fef9c3', fg: '#854d0e' },
  'gate-failure': { bg: '#fee2e2', fg: '#991b1b' },
  readiness: { bg: '#dbeafe', fg: '#1e40af' },
  qualification: { bg: '#f3e8ff', fg: '#6b21a8' },
};

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

function scoreColor(score: number): string {
  if (score >= 65) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function parseActionCategory(action: string): { category: string; text: string } {
  const match = action.match(/^\[([^\]]+)\]\s*(.*)/);
  if (match) return { category: match[1], text: match[2] };
  return { category: '', text: action };
}

function generateMarkdown(result: AssessmentResult): string {
  const lines: string[] = [];
  lines.push(`# Pilot Assessment: ${result.map.workflow}`);
  lines.push(`Generated: ${result.map.generated_at}\n`);

  lines.push(`## Overall Readiness: ${result.eval.overall_score}/100\n`);

  if (result.qualification) {
    const q = result.qualification;
    lines.push(`## Qualification`);
    lines.push(`- Weighted Score: ${q.weighted_score.toFixed(2)}`);
    lines.push(`- Decision: ${q.decision}`);
    lines.push(`- Gates Passed: ${q.gates_passed ? 'Yes' : 'No'}`);
    if (q.gate_failures.length) {
      lines.push(`- Gate Failures:`);
      q.gate_failures.forEach((f) => lines.push(`  - ${f}`));
    }
    lines.push('');
  }

  lines.push(`## Domain Scores`);
  for (const [k, v] of Object.entries(result.eval.domain_scores)) {
    lines.push(`- ${k.replace(/_/g, ' ')}: ${v}`);
  }
  lines.push('');

  lines.push(`## Opportunity Map`);
  for (const opp of result.map.opportunities) {
    const status = opp.must_stay_human ? 'HUMAN' : opp.should_automate ? 'AUTOMATE' : 'REVIEW';
    lines.push(`- [${status}] ${opp.step_name}: ${opp.rationale}`);
  }
  lines.push('');

  if (result.eval.controls_required.length) {
    lines.push(`## Controls Required`);
    result.eval.controls_required.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  lines.push(`## Action Plan (Next 30 Days)`);
  result.actions_next_30_days.forEach((a) => lines.push(`- ${a}`));

  return lines.join('\n');
}

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
  empty: {
    textAlign: 'center' as const,
    padding: 40,
    color: '#9ca3af',
    fontSize: 15,
    background: '#fafafa',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  } as const,
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: 24,
    marginBottom: 32,
  } as const,
  scoreCircle: (color: string) => ({
    width: 140,
    height: 140,
    borderRadius: '50%',
    border: `6px solid ${color}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  }),
  scoreValue: (color: string) => ({
    fontSize: 40,
    fontWeight: 800,
    color,
    lineHeight: 1,
  }),
  scoreLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  } as const,
  qualCard: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
  } as const,
  qualRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: 13,
  } as const,
  decisionBadge: (decision: string) => {
    const c = decisionColors[decision] || decisionColors.defer;
    return {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 13,
      fontWeight: 700,
    };
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e1e2f',
    marginBottom: 12,
    marginTop: 8,
  } as const,
  domainBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    fontSize: 13,
  } as const,
  domainLabel: {
    width: 160,
    color: '#374151',
    fontWeight: 500,
    flexShrink: 0,
  } as const,
  barTrack: {
    flex: 1,
    height: 14,
    background: '#e5e7eb',
    borderRadius: 7,
    overflow: 'hidden',
  } as const,
  barFill: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: scoreColor(pct),
    borderRadius: 7,
    transition: 'width 0.3s',
  }),
  barValue: {
    width: 36,
    textAlign: 'right' as const,
    fontWeight: 700,
    color: '#374151',
    fontSize: 13,
  } as const,
  actionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 14px',
    marginBottom: 6,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.4,
  } as const,
  actionTag: (category: string) => {
    const c = actionCategoryColors[category] || { bg: '#f3f4f6', fg: '#374151' };
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      background: c.bg,
      color: c.fg,
      fontSize: 10,
      fontWeight: 700,
      flexShrink: 0,
      marginTop: 1,
      textTransform: 'uppercase' as const,
    };
  },
  controlsList: {
    background: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '14px 18px',
    marginBottom: 24,
  } as const,
  controlItem: {
    fontSize: 13,
    color: '#854d0e',
    padding: '3px 0',
  } as const,
  buttonRow: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap' as const,
  } as const,
  btn: (bg: string) => ({
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 22px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  }),
  readinessSection: {
    marginTop: 32,
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
  } as const,
  textarea: {
    width: '100%',
    minHeight: 100,
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    boxSizing: 'border-box' as const,
    marginBottom: 8,
  } as const,
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  } as const,
};

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PilotAssessment() {
  const [workflow, setWorkflow] = useState<WorkflowInput['workflow'] | null>(null);
  const [qualification, setQualification] = useState<Record<string, number> | null>(null);
  const [readinessJson, setReadinessJson] = useState('');
  const [readinessProfile, setReadinessProfile] = useState<ReadinessProfile | null>(null);
  const [readinessError, setReadinessError] = useState('');

  useEffect(() => {
    const state = loadState();
    if (state.workflow) setWorkflow(state.workflow);
    if (state.qualification) setQualification(state.qualification);
  }, []);

  const result: AssessmentResult | null = useMemo(() => {
    if (!workflow) return null;
    const input: WorkflowInput = {
      workflow: {
        ...workflow,
        ...(qualification ? { qualification } : {}),
      },
    };
    return runAssessment(input, readinessProfile);
  }, [workflow, qualification, readinessProfile]);

  function applyReadinessProfile() {
    if (!readinessJson.trim()) {
      setReadinessProfile(null);
      setReadinessError('');
      return;
    }
    try {
      const parsed = JSON.parse(readinessJson);
      setReadinessProfile(parsed);
      setReadinessError('');
    } catch {
      setReadinessError('Invalid JSON. Please check the format.');
    }
  }

  function handleDownloadJson() {
    if (!result) return;
    downloadBlob(
      JSON.stringify(result, null, 2),
      `assessment-${result.map.workflow}.json`,
      'application/json',
    );
  }

  function handleDownloadMarkdown() {
    if (!result) return;
    downloadBlob(
      generateMarkdown(result),
      `assessment-${result.map.workflow}.md`,
      'text/markdown',
    );
  }

  if (!workflow) {
    return (
      <div style={styles.container}>
        <div style={styles.heading}>Pilot Assessment</div>
        <div style={styles.empty}>Complete Step 1 first</div>
      </div>
    );
  }

  if (!result) return null;

  const overall = result.eval.overall_score;
  const color = scoreColor(overall);

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Pilot Assessment</div>
      <div style={styles.subheading}>
        Full assessment results for <strong>{workflow.name}</strong>.
      </div>

      {/* Top section: score gauge + qualification */}
      <div style={styles.topGrid}>
        <div>
          <div style={styles.scoreCircle(color)}>
            <div style={styles.scoreValue(color)}>{overall}</div>
            <div style={styles.scoreLabel}>Readiness</div>
          </div>
        </div>
        <div style={styles.qualCard}>
          {result.qualification ? (
            <>
              <div style={styles.qualRow}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Qualification Score</span>
                <span style={{ fontWeight: 700, color: PURPLE_DARK, fontSize: 18 }}>
                  {result.qualification.weighted_score.toFixed(2)}
                </span>
              </div>
              <div style={styles.qualRow}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Decision</span>
                <span style={styles.decisionBadge(result.qualification.decision)}>
                  {decisionLabels[result.qualification.decision]}
                </span>
              </div>
              <div style={styles.qualRow}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Gates</span>
                <span style={{
                  fontWeight: 700,
                  color: result.qualification.gates_passed ? '#16a34a' : '#dc2626',
                }}>
                  {result.qualification.gates_passed ? 'All Passed' : 'Failed'}
                </span>
              </div>
              {result.qualification.gate_failures.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#991b1b' }}>
                  {result.qualification.gate_failures.map((f, i) => (
                    <div key={i}>{f}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: 14, padding: 16 }}>
              No qualification scores available. Complete Step 2 to see results.
            </div>
          )}
        </div>
      </div>

      {/* Domain scores */}
      <div style={styles.sectionTitle}>Domain Scores</div>
      {Object.entries(result.eval.domain_scores).map(([key, value]) => (
        <div key={key} style={styles.domainBar}>
          <div style={styles.domainLabel}>
            {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
          <div style={styles.barTrack}>
            <div style={styles.barFill(value)} />
          </div>
          <div style={styles.barValue}>{value}</div>
        </div>
      ))}

      {/* Controls required */}
      {result.eval.controls_required.length > 0 && (
        <>
          <div style={{ ...styles.sectionTitle, marginTop: 24 }}>Controls Required</div>
          <div style={styles.controlsList}>
            {result.eval.controls_required.map((ctrl, i) => (
              <div key={i} style={styles.controlItem}>{ctrl}</div>
            ))}
          </div>
        </>
      )}

      {/* Action plan */}
      <div style={{ ...styles.sectionTitle, marginTop: 24 }}>Action Plan (Next 30 Days)</div>
      {result.actions_next_30_days.map((action, i) => {
        const { category, text } = parseActionCategory(action);
        return (
          <div key={i} style={styles.actionItem}>
            {category && <span style={styles.actionTag(category)}>{category}</span>}
            <span style={{ flex: 1, color: '#374151' }}>{text || action}</span>
          </div>
        );
      })}

      {/* Download buttons */}
      <div style={styles.buttonRow}>
        <button style={styles.btn(PURPLE)} onClick={handleDownloadJson}>
          Download JSON
        </button>
        <button style={styles.btn(PURPLE_DARK)} onClick={handleDownloadMarkdown}>
          Download Markdown
        </button>
      </div>

      {/* Optional readiness profile */}
      <div style={styles.readinessSection}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Readiness Profile (optional)
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          Paste a readiness profile JSON to re-run the assessment with org-level context.
        </div>
        <textarea
          style={styles.textarea}
          value={readinessJson}
          onInput={(e: Event) =>
            setReadinessJson((e.target as HTMLTextAreaElement).value)
          }
          placeholder='{"overall_score": 68, "domain_scores": {"strategy": 70, ...}, "required_controls": [...], "blocked_use_cases": [...], "roadmap_priorities": [...]}'
        />
        {readinessError && <div style={styles.errorText}>{readinessError}</div>}
        <button
          style={styles.btn(PURPLE)}
          onClick={applyReadinessProfile}
        >
          Apply &amp; Re-run
        </button>
      </div>
    </div>
  );
}
