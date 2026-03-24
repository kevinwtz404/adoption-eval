import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { analyseStep, analyseWorkflow } from '../data/gemini';

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

export default function InterventionDesigner() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [designs, setDesigns] = useState<Record<string, StepDesign>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [analysing, setAnalysing] = useState<string | null>(null);
  const [bulkAnalysing, setBulkAnalysing] = useState(false);
  const [hasBeenAnalysed, setHasBeenAnalysed] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }
    if ((state as any).designs) {
      setDesigns((state as any).designs);
    }
    if (state.selectedCase) {
      const flagship = flagshipCases.find(c => c.id === state.selectedCase);
      if (flagship) {
        setPainPoint(flagship.painPoint);
        setHasBeenAnalysed(true); // Flagship cases are pre-filled
      }
    }
    // Check if designs already exist (from a previous visit)
    if ((state as any).designs) {
      const hasAnyCandidate = Object.values((state as any).designs).some((d: any) => d.isCandidate);
      if (hasAnyCandidate) setHasBeenAnalysed(true);
    }
  }, []);

  function getDesign(stepId: string): StepDesign {
    return designs[stepId] || { isCandidate: false, description: '', notes: '' };
  }

  function updateDesign(stepId: string, field: keyof StepDesign, value: any) {
    const current = getDesign(stepId);
    const updated = { ...current, [field]: value };
    if (field === 'isCandidate' && !value) {
      updated.description = '';
      updated.notes = '';
    }
    const next = { ...designs, [stepId]: updated };
    setDesigns(next);
    saveState({ designs: next } as any);
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '15px', color: '#991b1b' }}>
        No workflow steps found. <a href="2-select/" style={{ color: '#6830C4' }}>Go back to Step 2</a> to select or define a workflow.
      </div>
    );
  }

  const candidates = steps.filter(s => getDesign(s.id).isCandidate);

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Context */}
      <div style={{ padding: '1rem 1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Designing intervention for</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '15px', color: '#666' }}>
            <span>{steps.length} steps</span>
            <span>{candidates.length} candidates for change</span>
          </div>
        </div>
        {painPoint && <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginTop: '0.75rem' }}>{painPoint}</div>}
      </div>

      {/* Bulk analysis prompt for custom workflows */}
      {!hasBeenAnalysed && steps.length > 0 && (
        <div style={{
          padding: '1.5rem',
          border: '1px solid #6830C4',
          borderRadius: '8px',
          background: 'rgba(104, 48, 196, 0.04)',
          marginBottom: '1.5rem',
          textAlign: 'center' as const,
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.5rem' }}>
            Ready to analyse your workflow?
          </div>
          <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1rem', maxWidth: '500px', margin: '0 auto 1rem' }}>
            We will review all your steps at once and suggest where changes could help. You can edit everything afterwards.
          </p>
          <button
            onClick={async () => {
              setBulkAnalysing(true);
              const suggestions = await analyseWorkflow(
                workflowName,
                painPoint || '',
                steps,
              );
              if (Object.keys(suggestions).length > 0) {
                const newDesigns: Record<string, StepDesign> = {};
                steps.forEach(s => {
                  const suggestion = suggestions[s.id];
                  newDesigns[s.id] = {
                    isCandidate: suggestion?.isCandidate || false,
                    description: suggestion?.description || '',
                    notes: '',
                  };
                });
                setDesigns(newDesigns);
                saveState({ designs: newDesigns } as any);
              }
              setHasBeenAnalysed(true);
              setBulkAnalysing(false);
            }}
            disabled={bulkAnalysing}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: '6px', fontSize: '15px',
              fontFamily: 'inherit', fontWeight: 600, cursor: bulkAnalysing ? 'wait' : 'pointer',
              background: '#6830C4', color: '#fff', border: 'none',
              opacity: bulkAnalysing ? 0.6 : 1,
            }}
          >
            {bulkAnalysing ? 'Analysing your workflow...' : 'Analyse all steps'}
          </button>
          <div style={{ marginTop: '0.75rem' }}>
            <button
              onClick={() => setHasBeenAnalysed(true)}
              style={{ fontSize: '15px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Skip and fill in manually
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
        {steps.map((step, i) => {
          const design = getDesign(step.id);
          const isExpanded = expandedStep === step.id;

          return (
            <div key={step.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>

              {/* Header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#999', fontSize: '15px', minWidth: '1.5em' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{step.name}</div>
                    {step.owner && <div style={{ fontSize: '15px', color: '#999' }}>{step.owner}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {design.isCandidate && (
                    <span style={{ fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4', fontWeight: 600 }}>
                      candidate
                    </span>
                  )}
                  {design.description && !design.isCandidate ? null : null}
                  <span style={{ fontSize: '1.25rem', color: '#ccc' }}>{isExpanded ? '\u2212' : '+'}</span>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.25rem' }}>

                  {(step as any).pain && (
                    <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1.25em', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', borderLeft: '3px solid #e0e0e0' }}>
                      <strong>Current pain:</strong> {(step as any).pain}
                    </div>
                  )}

                  {/* Candidate toggle */}
                  <div style={{ marginBottom: '1.25em' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.5rem' }}>Does this step need to change?</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateDesign(step.id, 'isCandidate', true)}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                          border: design.isCandidate ? '1px solid #6830C4' : '1px solid #e0e0e0',
                          background: design.isCandidate ? 'rgba(104, 48, 196, 0.06)' : '#fff',
                          color: design.isCandidate ? '#6830C4' : '#666',
                        }}
                      >Yes</button>
                      <button
                        onClick={() => updateDesign(step.id, 'isCandidate', false)}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                          border: !design.isCandidate ? '1px solid #6830C4' : '1px solid #e0e0e0',
                          background: !design.isCandidate ? 'rgba(104, 48, 196, 0.06)' : '#fff',
                          color: !design.isCandidate ? '#6830C4' : '#666',
                        }}
                      >No, keep as is</button>
                    </div>
                  </div>

                  {design.isCandidate && (
                    <div>
                      {/* Single description field */}
                      <div style={{ marginBottom: '1.25em' }}>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          What should change and how?
                        </label>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '0.5rem', lineHeight: '1.75' }}>
                          Describe what you want to happen differently at this step. You do not need to know the technical details.
                        </p>
                        <textarea
                          value={design.description}
                          onInput={(e) => updateDesign(step.id, 'description', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. I want this to happen automatically instead of someone doing it manually, with a human reviewing the result before it goes anywhere"
                          rows={4}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }}
                        />
                      </div>

                      {/* Notes */}
                      <div style={{ marginBottom: '1.25em' }}>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          Anything else to note?
                        </label>
                        <textarea
                          value={design.notes}
                          onInput={(e) => updateDesign(step.id, 'notes', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. Need to check data access permissions, this step is blocked by another team"
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75' }}
                        />
                      </div>

                      {/* AI Analysis */}
                      <div>
                        <button
                          onClick={async () => {
                            setAnalysing(step.id);
                            const result = await analyseStep(
                              step.name,
                              (step as any).pain || '',
                              design.description || 'No specific change described yet.',
                              workflowName,
                            );
                            setAnalyses(prev => ({ ...prev, [step.id]: result }));
                            setAnalysing(null);
                          }}
                          disabled={analysing === step.id}
                          style={{
                            padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '15px',
                            fontFamily: 'inherit', fontWeight: 600, cursor: analysing === step.id ? 'wait' : 'pointer',
                            background: '#6830C4', color: '#fff', border: 'none',
                            opacity: analysing === step.id ? 0.6 : 1,
                          }}
                        >
                          {analysing === step.id ? 'Analysing...' : 'Analyse this step'}
                        </button>

                        {analyses[step.id] && (
                          <div style={{
                            marginTop: '1rem', padding: '1rem', background: '#fafafa',
                            border: '1px solid #e0e0e0', borderRadius: '8px',
                            fontSize: '15px', lineHeight: '1.75', whiteSpace: 'pre-wrap' as const,
                          }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#6830C4', marginBottom: '0.5rem' }}>
                              AI Analysis
                            </div>
                            {analyses[step.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {candidates.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>Intervention summary</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
            {candidates.map(s => {
              const d = getDesign(s.id);
              return (
                <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '15px' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {d.description && <div style={{ color: '#666', marginTop: '0.25rem', lineHeight: '1.75' }}>{d.description}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
