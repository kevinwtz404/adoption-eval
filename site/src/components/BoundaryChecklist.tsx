import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { loadState } from '../data/store';
import { mapWorkflow } from '../../../src/lib/mapWorkflow';
import type { WorkflowInput, Opportunity } from '../../../src/types';

const PURPLE = '#6830C4';

interface ChecklistItem {
  id: string;
  label: string;
  category: 'human' | 'approval' | 'general';
}

const GENERAL_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Define deterministic vs generative components', category: 'general' },
  { label: 'Document disallowed actions', category: 'general' },
  { label: 'Specify enforcement mechanism (policy, architecture, or both)', category: 'general' },
];

const categoryColors: Record<string, { bg: string; fg: string }> = {
  human: { bg: '#fee2e2', fg: '#991b1b' },
  approval: { bg: '#fef9c3', fg: '#854d0e' },
  general: { bg: '#e0e7ff', fg: '#3730a3' },
};

const categoryLabels: Record<string, string> = {
  human: 'Human gate',
  approval: 'Approval gate',
  general: 'General',
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
  empty: {
    textAlign: 'center' as const,
    padding: 40,
    color: '#9ca3af',
    fontSize: 15,
    background: '#fafafa',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  } as const,
  progressBar: {
    marginBottom: 24,
  } as const,
  progressLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
  } as const,
  progressTrack: {
    width: '100%',
    height: 8,
    background: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  } as const,
  progressFill: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: pct === 100 ? '#16a34a' : PURPLE,
    borderRadius: 4,
    transition: 'width 0.3s ease',
  }),
  item: (checked: boolean) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
    marginBottom: 8,
    background: checked ? '#f0fdf4' : '#fff',
    border: `1px solid ${checked ? '#bbf7d0' : '#e5e7eb'}`,
    borderRadius: 10,
    transition: 'background 0.15s, border-color 0.15s',
    cursor: 'pointer',
  }),
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 1,
    accentColor: PURPLE,
    cursor: 'pointer',
    flexShrink: 0,
  } as const,
  itemLabel: (checked: boolean) => ({
    fontSize: 14,
    color: checked ? '#6b7280' : '#1e1e2f',
    textDecoration: checked ? 'line-through' : 'none',
    flex: 1,
    lineHeight: 1.4,
  }),
  categoryBadge: (category: string) => {
    const c = categoryColors[category] || categoryColors.general;
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      background: c.bg,
      color: c.fg,
      fontSize: 10,
      fontWeight: 600,
      flexShrink: 0,
      marginTop: 2,
    };
  },
};

export default function BoundaryChecklist() {
  const [workflow, setWorkflow] = useState<WorkflowInput['workflow'] | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const state = loadState();
    if (state.workflow) {
      setWorkflow(state.workflow);
    }
  }, []);

  const items: ChecklistItem[] = useMemo(() => {
    if (!workflow) return [];
    const result: ChecklistItem[] = [];
    const mapResult = mapWorkflow({ workflow });

    for (const opp of mapResult.opportunities) {
      if (opp.must_stay_human) {
        result.push({
          id: `human-${opp.step_id}`,
          label: `Human approval required for: ${opp.step_name}`,
          category: 'human',
        });
      }
    }

    // Check the original step data for requires_approval
    for (const step of workflow.steps) {
      if (step.requires_approval) {
        result.push({
          id: `approval-${step.id}`,
          label: `Approval gate needed at: ${step.name}`,
          category: 'approval',
        });
      }
    }

    // Add general boundary items
    GENERAL_ITEMS.forEach((item, i) => {
      result.push({ ...item, id: `general-${i}` });
    });

    return result;
  }, [workflow]);

  function toggleItem(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!workflow) {
    return (
      <div style={styles.container}>
        <div style={styles.heading}>Boundary Checklist</div>
        <div style={styles.empty}>Complete Step 1 first</div>
      </div>
    );
  }

  const confirmed = Object.values(checked).filter(Boolean).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Boundary Checklist</div>
      <div style={styles.subheading}>
        Confirm each boundary consideration before proceeding to pilot.
      </div>

      <div style={styles.progressBar}>
        <div style={styles.progressLabel}>
          <span>{confirmed} of {total} items confirmed</span>
          <span>{pct}%</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={styles.progressFill(pct)} />
        </div>
      </div>

      {items.map((item) => {
        const isChecked = !!checked[item.id];
        return (
          <div
            key={item.id}
            style={styles.item(isChecked)}
            onClick={() => toggleItem(item.id)}
          >
            <input
              type="checkbox"
              checked={isChecked}
              style={styles.checkbox}
              onChange={() => toggleItem(item.id)}
              onClick={(e: Event) => e.stopPropagation()}
            />
            <span style={styles.itemLabel(isChecked)}>{item.label}</span>
            <span style={styles.categoryBadge(item.category)}>
              {categoryLabels[item.category]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
