import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { mapWorkflow } from '../../../src/lib/mapWorkflow';
import type { WorkflowInput, Opportunity, OpportunityMap as OpportunityMapType } from '../../../src/types';

const PURPLE = '#6830C4';
const PURPLE_LIGHT = '#9b6bd4';

const borderColors = {
  must_stay_human: '#ef4444',
  should_automate: '#16a34a',
  could_automate: '#d97706',
  default: '#e5e7eb',
};

function getRowBorderColor(opp: Opportunity): string {
  if (opp.must_stay_human) return borderColors.must_stay_human;
  if (opp.should_automate) return borderColors.should_automate;
  if (opp.could_automate) return borderColors.could_automate;
  return borderColors.default;
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
  summary: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap' as const,
  } as const,
  summaryChip: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    background: `${color}12`,
    border: `1px solid ${color}33`,
    fontSize: 13,
    fontWeight: 600,
    color,
  }),
  row: (borderColor: string) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '14px 16px',
    marginBottom: 8,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: 10,
    fontSize: 13,
  }),
  stepName: {
    fontWeight: 600,
    color: '#1e1e2f',
    minWidth: 180,
    flexShrink: 0,
  } as const,
  owner: {
    color: '#6b7280',
    minWidth: 100,
    flexShrink: 0,
  } as const,
  rationale: {
    flex: 1,
    color: '#4b5563',
    lineHeight: 1.4,
  } as const,
  toggleCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    flexShrink: 0,
    alignItems: 'center',
  } as const,
  toggleLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center' as const,
  } as const,
  toggle: (active: boolean) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    background: active ? '#ef4444' : '#d1d5db',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background 0.15s',
    border: 'none',
    padding: 0,
  }),
  toggleKnob: (active: boolean) => ({
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    left: active ? 18 : 2,
    transition: 'left 0.15s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  }),
  toggleApproval: (active: boolean) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    background: active ? '#d97706' : '#d1d5db',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background 0.15s',
    border: 'none',
    padding: 0,
  }),
  badges: {
    display: 'flex',
    gap: 6,
    flexShrink: 0,
    flexWrap: 'wrap' as const,
    minWidth: 140,
  } as const,
  badge: (bg: string, fg: string) => ({
    padding: '2px 8px',
    borderRadius: 4,
    background: bg,
    color: fg,
    fontSize: 10,
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  }),
};

export default function OpportunityMapView() {
  const [workflow, setWorkflow] = useState<WorkflowInput['workflow'] | null>(null);
  const [stepOverrides, setStepOverrides] = useState<
    Record<string, { must_stay_human?: boolean; requires_approval?: boolean }>
  >({});

  useEffect(() => {
    const state = loadState();
    if (state.workflow) {
      setWorkflow(state.workflow);
      // Populate overrides from existing step flags
      const overrides: typeof stepOverrides = {};
      for (const step of state.workflow.steps) {
        overrides[step.id] = {
          must_stay_human: step.must_stay_human ?? false,
          requires_approval: step.requires_approval ?? false,
        };
      }
      setStepOverrides(overrides);
    }
  }, []);

  // Build effective workflow with overrides applied
  const effectiveWorkflow = useMemo(() => {
    if (!workflow) return null;
    return {
      ...workflow,
      steps: workflow.steps.map((s) => ({
        ...s,
        must_stay_human: stepOverrides[s.id]?.must_stay_human ?? s.must_stay_human ?? false,
        requires_approval: stepOverrides[s.id]?.requires_approval ?? s.requires_approval ?? false,
      })),
    };
  }, [workflow, stepOverrides]);

  const mapResult: OpportunityMapType | null = useMemo(() => {
    if (!effectiveWorkflow) return null;
    return mapWorkflow({ workflow: effectiveWorkflow });
  }, [effectiveWorkflow]);

  function toggleOverride(stepId: string, field: 'must_stay_human' | 'requires_approval') {
    setStepOverrides((prev) => {
      const current = prev[stepId] || {};
      const next = {
        ...prev,
        [stepId]: { ...current, [field]: !current[field] },
      };

      // Persist to localStorage
      if (workflow) {
        const updatedSteps = workflow.steps.map((s) => ({
          ...s,
          must_stay_human: next[s.id]?.must_stay_human ?? s.must_stay_human,
          requires_approval: next[s.id]?.requires_approval ?? s.requires_approval,
        }));
        saveState({ workflow: { ...workflow, steps: updatedSteps } });
      }
      return next;
    });
  }

  if (!workflow) {
    return (
      <div style={styles.container}>
        <div style={styles.heading}>Opportunity Map</div>
        <div style={styles.empty}>Complete Step 1 first</div>
      </div>
    );
  }

  const opps = mapResult?.opportunities || [];
  const total = opps.length;
  const shouldAutomate = opps.filter((o) => o.should_automate).length;
  const mustStayHuman = opps.filter((o) => o.must_stay_human).length;
  const couldAutomate = opps.filter((o) => o.could_automate && !o.should_automate && !o.must_stay_human).length;

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Opportunity Map</div>
      <div style={styles.subheading}>
        Step classification for <strong>{workflow.name}</strong>. Toggle overrides as needed.
      </div>

      <div style={styles.summary}>
        <span style={styles.summaryChip('#6b7280')}>
          {total} steps total
        </span>
        <span style={styles.summaryChip('#16a34a')}>
          {shouldAutomate} should automate
        </span>
        <span style={styles.summaryChip('#ef4444')}>
          {mustStayHuman} must stay human
        </span>
        {couldAutomate > 0 && (
          <span style={styles.summaryChip('#d97706')}>
            {couldAutomate} could automate
          </span>
        )}
      </div>

      {opps.map((opp) => {
        const stepData = effectiveWorkflow!.steps.find((s) => s.id === opp.step_id);
        const isHuman = stepOverrides[opp.step_id]?.must_stay_human ?? false;
        const isApproval = stepOverrides[opp.step_id]?.requires_approval ?? false;

        return (
          <div key={opp.step_id} style={styles.row(getRowBorderColor(opp))}>
            <div style={styles.stepName}>{opp.step_name}</div>
            <div style={styles.owner}>{stepData?.owner || '--'}</div>
            <div style={styles.badges}>
              {opp.could_automate && (
                <span style={styles.badge('#fef9c3', '#854d0e')}>could automate</span>
              )}
              {opp.should_automate && (
                <span style={styles.badge('#dcfce7', '#166534')}>should automate</span>
              )}
              {opp.must_stay_human && (
                <span style={styles.badge('#fee2e2', '#991b1b')}>must stay human</span>
              )}
            </div>
            <div style={styles.rationale}>{opp.rationale}</div>
            <div style={styles.toggleCol}>
              <span style={styles.toggleLabel}>Human</span>
              <button
                style={styles.toggle(isHuman)}
                onClick={() => toggleOverride(opp.step_id, 'must_stay_human')}
                aria-label={`Toggle must stay human for ${opp.step_name}`}
              >
                <div style={styles.toggleKnob(isHuman)} />
              </button>
            </div>
            <div style={styles.toggleCol}>
              <span style={styles.toggleLabel}>Approval</span>
              <button
                style={styles.toggleApproval(isApproval)}
                onClick={() => toggleOverride(opp.step_id, 'requires_approval')}
                aria-label={`Toggle requires approval for ${opp.step_name}`}
              >
                <div style={styles.toggleKnob(isApproval)} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
