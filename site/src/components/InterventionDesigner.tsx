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
  const [userDescription, setUserDescription] = useState('');
  const [redesign, setRedesign] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }

    // Load redesign from localStorage
    if ((state as any).redesign) {
      setRedesign((state as any).redesign);
    }

    if (state.selectedCase && state.selectedCase !== 'custom') {
      const flagship = flagshipCases.find(c => c.id === state.selectedCase);
      if (flagship) {
        setPainPoint(flagship.painPoint);
        setUserDescription(flagship.userDescription || '');
        if (!(state as any).redesign && flagship.redesign) {
          setRedesign(flagship.redesign);
          saveState({ redesign: flagship.redesign, redesignData: flagship.redesignData } as any);
        }
      }
    }

    if (state.selectedCase === 'custom') {
      setIsCustom(true);
      // Load custom pain as the user description
      if (state.workflow?.name && !userDescription) {
        setPainPoint((state as any).customPain || '');
      }
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

      {/* 1. Current state */}
      <div style={{ marginBottom: '1.5rem' }}>
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

      {/* 2. What you want */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>What do you want to change?</div>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '0.75rem' }}>
          Describe in your own words what you want to be different. You do not need to know the technical solution. Just describe the outcome you are after.
        </p>
        <textarea
          value={userDescription}
          onInput={(e) => {
            const val = (e.target as HTMLTextAreaElement).value;
            setUserDescription(val);
            saveState({ userDescription: val } as any);
          }}
          placeholder="e.g. I want people to be able to ask a question and get an answer from our internal docs without searching 5 tools. The answer should show where it came from. If it is not sure, ask a person."
          rows={6}
          style={{
            width: '100%', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px',
            fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75',
            background: '#fff',
          }}
        />
      </div>

      {/* 3. Proposed solution */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>Proposed solution</div>

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
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1.25rem', maxWidth: '550px', margin: '0 auto 1.25rem' }}>
              Based on what you described above, we can generate a proposed solution. This will describe how the workflow could work with a combination of AI, automation and human checkpoints. You can edit everything afterwards.
            </p>
            <button
              onClick={async () => {
                setGenerating(true);
                const result = await analyseWorkflow(workflowName, userDescription || painPoint, steps);
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
              disabled={generating || !userDescription.trim()}
              style={{
                padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '15px',
                fontFamily: 'inherit', fontWeight: 600, cursor: (generating || !userDescription.trim()) ? 'default' : 'pointer',
                background: '#6830C4', color: '#fff', border: 'none',
                opacity: (generating || !userDescription.trim()) ? 0.4 : 1,
              }}
            >
              {generating ? 'Generating solution...' : 'Generate a solution'}
            </button>
            {!userDescription.trim() && (
              <p style={{ fontSize: '15px', color: '#999', marginTop: '0.75rem' }}>Describe what you want above first.</p>
            )}
          </div>
        )}

        {/* The solution text */}
        {redesign && (
          <div>
            <textarea
              value={redesign}
              onInput={(e) => handleRedesignChange((e.target as HTMLTextAreaElement).value)}
              rows={20}
              style={{
                width: '100%', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px',
                fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75',
                background: '#fff',
              }}
            />
            <p style={{ fontSize: '15px', color: '#999', marginTop: '0.75rem', lineHeight: '1.75' }}>
              This solution will be used in the next step to identify boundaries, risks and controls for your pilot.
            </p>
          </div>
        )}

        {/* Show pre-filled solution for flagship cases that haven't loaded yet */}
        {!redesign && !isCustom && (
          <p style={{ fontSize: '15px', color: '#999' }}>Loading solution...</p>
        )}
      </div>
    </div>
  );
}
