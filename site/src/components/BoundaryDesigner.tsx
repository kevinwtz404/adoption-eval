import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';

interface StepDesign {
  isCandidate: boolean;
  description: string;
  notes: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  owner?: string;
  pain?: string;
}

interface BoundaryItem {
  id: string;
  text: string;
  category: string;
  checked: boolean;
  notes: string;
}

export default function BoundaryDesigner() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [designs, setDesigns] = useState<Record<string, StepDesign>>({});
  const [workflowName, setWorkflowName] = useState('');
  const [boundaries, setBoundaries] = useState<Record<string, BoundaryItem[]>>({});

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }
    if ((state as any).designs) {
      setDesigns((state as any).designs);
    }
    if ((state as any).boundaries) {
      setBoundaries((state as any).boundaries);
    }
  }, []);

  function getCandidateSteps(): WorkflowStep[] {
    return steps.filter(s => designs[s.id]?.isCandidate);
  }

  function generateBoundaries(step: WorkflowStep): BoundaryItem[] {
    const design = designs[step.id];
    if (!design) return [];

    const existing = boundaries[step.id];
    if (existing && existing.length > 0) return existing;

    const items: BoundaryItem[] = [];
    let id = 0;

    // Standard boundaries for any step being changed
    items.push({ id: `${step.id}-${id++}`, text: 'AI output must be reviewed by a human before it is used externally', category: 'approval', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Define what happens when the AI output is wrong or rejected', category: 'fallback', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Log all inputs and outputs for traceability', category: 'monitoring', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Assess whether a cloud model is acceptable or a local model is needed for data privacy', category: 'privacy', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Evaluate model size: does this step need a frontier model or would a smaller model work?', category: 'cost', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Test outputs against known-good examples before going live', category: 'quality', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Estimate cost at pilot scale and at full scale', category: 'cost', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Define what the system must never do (disallowed actions)', category: 'safety', checked: false, notes: '' });
    items.push({ id: `${step.id}-${id++}`, text: 'Confirm who is accountable for the output of this step', category: 'human', checked: false, notes: '' });

    return items;
  }

  function toggleCheck(stepId: string, itemId: string) {
    const items = boundaries[stepId] || generateBoundaries(steps.find(s => s.id === stepId)!);
    const updated = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const next = { ...boundaries, [stepId]: updated };
    setBoundaries(next);
    saveState({ boundaries: next } as any);
  }

  function updateNote(stepId: string, itemId: string, note: string) {
    const items = boundaries[stepId] || [];
    const updated = items.map(item =>
      item.id === itemId ? { ...item, notes: note } : item
    );
    const next = { ...boundaries, [stepId]: updated };
    setBoundaries(next);
    saveState({ boundaries: next } as any);
  }

  const candidateSteps = getCandidateSteps();

  if (candidateSteps.length === 0) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', fontSize: '14px', color: '#666', textAlign: 'center' as const }}>
        No steps have been marked as candidates for change. <a href="4-map/" style={{ color: '#6830C4' }}>Go back to the Map step</a> to design your intervention.
      </div>
    );
  }

  // Initialise boundaries for steps that don't have them yet
  candidateSteps.forEach(step => {
    if (!boundaries[step.id]) {
      const generated = generateBoundaries(step);
      if (generated.length > 0 && !boundaries[step.id]) {
        boundaries[step.id] = generated;
      }
    }
  });

  const totalItems = Object.values(boundaries).flat().length;
  const checkedItems = Object.values(boundaries).flat().filter(b => b.checked).length;

  const categoryLabels: Record<string, string> = {
    approval: 'Approval',
    fallback: 'Fallback',
    monitoring: 'Monitoring',
    human: 'Human',
    privacy: 'Privacy',
    quality: 'Quality',
    safety: 'Safety',
    cost: 'Cost',
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Progress */}
      <div style={{ padding: '1rem 1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Boundary checklist</div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          {checkedItems} of {totalItems} confirmed
        </div>
      </div>

      {/* Per-step checklists */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
        {candidateSteps.map(step => {
          const items = boundaries[step.id] || [];
          const design = designs[step.id];
          const stepChecked = items.filter(i => i.checked).length;

          return (
            <div key={step.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{step.name}</div>
                  {design?.description && <div style={{ fontSize: '15px', color: '#666', marginTop: '0.125rem', lineHeight: '1.75' }}>{design.description}</div>}
                </div>
                <span style={{ fontSize: '12px', color: '#999' }}>{stepChecked}/{items.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f5f5f5',
                  }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(step.id, item.id)}
                      style={{ accentColor: '#6830C4', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: item.checked ? '#999' : '#333', textDecoration: item.checked ? 'line-through' : 'none' }}>
                          {item.text}
                        </span>
                        <span style={{ fontSize: '10px', padding: '0.0625rem 0.375rem', borderRadius: '4px', background: '#f3f4f6', color: '#666', whiteSpace: 'nowrap' as const }}>
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={item.notes}
                        onInput={(e) => updateNote(step.id, item.id, (e.target as HTMLInputElement).value)}
                        placeholder="Add a note..."
                        style={{ width: '100%', marginTop: '0.375rem', padding: '0.25rem 0.5rem', border: '1px solid #f0f0f0', borderRadius: '4px', fontSize: '12px', fontFamily: 'inherit', color: '#666' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
