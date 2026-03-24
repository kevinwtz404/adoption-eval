import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { analyseWorkflow, type RedesignResult } from '../data/gemini';

interface WorkflowStep {
  id: string;
  name: string;
  owner?: string;
  pain?: string;
}

export default function InterventionDesigner() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [redesign, setRedesign] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }
    if ((state as any).redesign) {
      setRedesign((state as any).redesign);
    }
    if (state.selectedCase) {
      const flagship = flagshipCases.find(c => c.id === state.selectedCase);
      if (flagship) setPainPoint(flagship.painPoint);
      if (state.selectedCase === 'custom') setIsCustom(true);
    }
  }, []);

  function handleRedesignChange(value: string) {
    setRedesign(value);
    saveState({ redesign: value } as any);
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '15px', color: '#991b1b' }}>
        No workflow steps found. <a href="2-select/" style={{ color: '#6830C4' }}>Go back to Step 2</a> to select or define a workflow.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Two-column: current state / redesign */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: Current state */}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>Current state</div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '0.75rem' }}>{workflowName}</div>
            {painPoint && <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1rem' }}>{painPoint}</div>}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
              {steps.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < steps.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <span style={{ color: '#999', minWidth: '1.5em', fontSize: '15px' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: '15px' }}>{step.name}</div>
                    {step.owner && <div style={{ fontSize: '15px', color: '#999' }}>{step.owner}</div>}
                    {(step as any).pain && <div style={{ fontSize: '15px', color: '#999', fontStyle: 'italic' }}>{(step as any).pain}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Redesign */}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>Proposed redesign</div>

          {/* Generate button for custom workflows with no redesign yet */}
          {!redesign && isCustom && (
            <div style={{
              border: '2px solid #6830C4',
              borderRadius: '8px',
              background: 'rgba(104, 48, 196, 0.03)',
              padding: '2rem',
              textAlign: 'center' as const,
              marginBottom: '1rem',
            }}>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1.25rem' }}>
                Based on your workflow and pain points, we can generate a proposed redesign. You can edit everything afterwards.
              </p>
              <button
                onClick={async () => {
                  setGenerating(true);
                  const result = await analyseWorkflow(workflowName, painPoint, steps);
                  if (result) {
                    setRedesign(result.narrative);
                    saveState({
                      redesign: result.narrative,
                      redesignData: {
                        components: result.components,
                        boundaries: result.boundaries,
                        confidentiality: result.confidentiality,
                        costFactors: result.costFactors,
                        humanCheckpoints: result.humanCheckpoints,
                      },
                    } as any);
                  }
                  setGenerating(false);
                }}
                disabled={generating}
                style={{
                  padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '15px',
                  fontFamily: 'inherit', fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
                  background: '#6830C4', color: '#fff', border: 'none',
                  opacity: generating ? 0.6 : 1,
                }}
              >
                {generating ? 'Generating...' : 'Generate a redesign'}
              </button>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={() => setRedesign(' ')}
                  style={{ fontSize: '15px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  Write my own
                </button>
              </div>
            </div>
          )}

          {/* Helper text for people writing their own */}
          {!redesign && !isCustom && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75' }}>
                This is pre-filled based on the scenario you selected. Edit it to match what you think the redesigned workflow should look like.
              </p>
            </div>
          )}

          {/* The redesign text area */}
          {(redesign || !isCustom) && (
            <div>
              <textarea
                value={redesign}
                onInput={(e) => handleRedesignChange((e.target as HTMLTextAreaElement).value)}
                placeholder={"Describe how you want the workflow to work after the intervention. Think about:\n\n- What triggers the workflow?\n- What happens at each step?\n- Where does AI help and what does it do?\n- Where do people stay involved and why?\n- What is deterministic (same input, same output) vs generated?\n- Where are the handoffs between AI and people?"}
                rows={20}
                style={{
                  width: '100%', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px',
                  fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75',
                  background: '#fff',
                }}
              />
              <p style={{ fontSize: '15px', color: '#999', marginTop: '0.5rem', lineHeight: '1.75' }}>
                This redesign will be used in the next steps to identify boundaries and build your pilot plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
