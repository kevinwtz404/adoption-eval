import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import type { FlagshipCase } from '../data/flagship-cases';

const PURPLE = '#6830C4';
const PURPLE_LIGHT = '#9b6bd4';
const PURPLE_DARK = '#4a1f8a';

const contextColors: Record<string, string> = {
  Operational: '#2563eb',
  Revenue: '#059669',
  Creative: '#d97706',
  Finance: '#7c3aed',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 24,
  } as const,
  card: (selected: boolean) => ({
    border: `2px solid ${selected ? PURPLE : '#e5e7eb'}`,
    borderRadius: 12,
    padding: 20,
    cursor: 'pointer',
    background: selected ? '#f5f0ff' : '#fff',
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    boxShadow: selected ? `0 0 0 3px ${PURPLE}22` : '0 1px 3px rgba(0,0,0,0.06)',
  }) as const,
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e1e2f',
    marginBottom: 4,
  } as const,
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  } as const,
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
  } as const,
  buyer: {
    color: '#374151',
    fontWeight: 500,
  } as const,
  badge: (color: string) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    background: `${color}18`,
    color,
    fontSize: 11,
    fontWeight: 600,
  }),
  enterCard: (selected: boolean) => ({
    gridColumn: '1 / -1',
    border: `2px dashed ${selected ? PURPLE : '#d1d5db'}`,
    borderRadius: 12,
    padding: 20,
    cursor: 'pointer',
    background: selected ? '#f5f0ff' : '#fafafa',
    textAlign: 'center' as const,
    transition: 'border-color 0.15s, background 0.15s',
  }),
  form: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
  } as const,
  fieldGroup: {
    marginBottom: 16,
  } as const,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  } as const,
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as const,
  stepRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  } as const,
  removeBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  } as const,
  addBtn: {
    background: '#f3f4f6',
    color: PURPLE,
    border: `1px solid ${PURPLE}44`,
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  } as const,
  saveBtn: {
    background: PURPLE,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    marginTop: 8,
  } as const,
};

interface StepDraft {
  id: string;
  name: string;
  owner: string;
}

export default function CaseSelector() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Custom workflow form state
  const [workflowName, setWorkflowName] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([{ id: 's1', name: '', owner: '' }]);
  const [actors, setActors] = useState('');
  const [dataAssets, setDataAssets] = useState('');
  const [successMetrics, setSuccessMetrics] = useState('');

  useEffect(() => {
    const state = loadState();
    if (state.selectedCase) {
      setSelected(state.selectedCase);
      if (state.selectedCase === 'custom') {
        setShowForm(true);
        if (state.workflow) {
          setWorkflowName(state.workflow.name);
          setSteps(
            state.workflow.steps.map((s) => ({
              id: s.id,
              name: s.name,
              owner: s.owner || '',
            })),
          );
          setActors(state.workflow.actors?.join(', ') || '');
          setDataAssets(state.workflow.data_assets?.join(', ') || '');
          setSuccessMetrics(state.workflow.success_metrics?.join(', ') || '');
        }
      }
    }
  }, []);

  function selectFlagship(fc: FlagshipCase) {
    setSelected(fc.id);
    setShowForm(false);
    const { qualification, ...workflowData } = fc.workflow;
    saveState({
      selectedCase: fc.id,
      workflow: workflowData,
      qualification,
    });
  }

  function selectCustom() {
    setSelected('custom');
    setShowForm(true);
    saveState({ selectedCase: 'custom' });
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: `s${prev.length + 1}`, name: '', owner: '' },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index: number, field: keyof StepDraft, value: string) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  function saveCustom() {
    const csvToArray = (s: string) =>
      s.split(',').map((v) => v.trim()).filter(Boolean);
    const workflow = {
      name: workflowName || 'custom-workflow',
      steps: steps
        .filter((s) => s.name.trim())
        .map((s) => ({
          id: s.id,
          name: s.name.trim(),
          ...(s.owner.trim() ? { owner: s.owner.trim() } : {}),
        })),
      actors: csvToArray(actors),
      data_assets: csvToArray(dataAssets),
      success_metrics: csvToArray(successMetrics),
    };
    saveState({ selectedCase: 'custom', workflow });
  }

  return (
    <div style={styles.container}>
      <div style={styles.heading}>Choose a workflow to assess</div>
      <div style={styles.subheading}>
        Pick a flagship case or define your own workflow.
      </div>

      <div style={styles.grid}>
        {flagshipCases.map((fc) => (
          <div
            key={fc.id}
            style={styles.card(selected === fc.id)}
            onClick={() => selectFlagship(fc)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') selectFlagship(fc);
            }}
          >
            <div style={styles.cardTitle}>{fc.title}</div>
            <div style={styles.cardSubtitle}>{fc.subtitle}</div>
            <div style={styles.cardMeta}>
              <span style={styles.buyer}>{fc.buyer}</span>
              <span style={styles.badge(contextColors[fc.context] || '#6b7280')}>
                {fc.context}
              </span>
            </div>
          </div>
        ))}

        <div
          style={styles.enterCard(selected === 'custom')}
          onClick={selectCustom}
          role="button"
          tabIndex={0}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') selectCustom();
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>+</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>
            Enter your own
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Define a custom workflow to assess
          </div>
        </div>
      </div>

      {showForm && (
        <div style={styles.form}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e1e2f' }}>
            Define your workflow
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Workflow name</label>
            <input
              style={styles.input}
              type="text"
              value={workflowName}
              onInput={(e: Event) =>
                setWorkflowName((e.target as HTMLInputElement).value)
              }
              placeholder="e.g. customer-onboarding"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Steps</label>
            {steps.map((step, i) => (
              <div key={step.id} style={styles.stepRow}>
                <input
                  style={{ ...styles.input, width: 80, flexShrink: 0 }}
                  type="text"
                  value={step.id}
                  onInput={(e: Event) =>
                    updateStep(i, 'id', (e.target as HTMLInputElement).value)
                  }
                  placeholder="ID"
                />
                <input
                  style={{ ...styles.input, flex: 1 }}
                  type="text"
                  value={step.name}
                  onInput={(e: Event) =>
                    updateStep(i, 'name', (e.target as HTMLInputElement).value)
                  }
                  placeholder="Step name"
                />
                <input
                  style={{ ...styles.input, width: 120, flexShrink: 0 }}
                  type="text"
                  value={step.owner}
                  onInput={(e: Event) =>
                    updateStep(i, 'owner', (e.target as HTMLInputElement).value)
                  }
                  placeholder="Owner"
                />
                {steps.length > 1 && (
                  <button style={styles.removeBtn} onClick={() => removeStep(i)}>
                    X
                  </button>
                )}
              </div>
            ))}
            <button style={styles.addBtn} onClick={addStep}>
              + Add step
            </button>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Actors (comma-separated)</label>
            <input
              style={styles.input}
              type="text"
              value={actors}
              onInput={(e: Event) =>
                setActors((e.target as HTMLInputElement).value)
              }
              placeholder="e.g. ops, system, copilot"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Data assets (comma-separated)</label>
            <input
              style={styles.input}
              type="text"
              value={dataAssets}
              onInput={(e: Event) =>
                setDataAssets((e.target as HTMLInputElement).value)
              }
              placeholder="e.g. crm-records, docs, pipeline-data"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Success metrics (comma-separated)</label>
            <input
              style={styles.input}
              type="text"
              value={successMetrics}
              onInput={(e: Event) =>
                setSuccessMetrics((e.target as HTMLInputElement).value)
              }
              placeholder="e.g. time_saved, error_rate, accuracy"
            />
          </div>

          <button style={styles.saveBtn} onClick={saveCustom}>
            Save &amp; Continue
          </button>
        </div>
      )}
    </div>
  );
}
