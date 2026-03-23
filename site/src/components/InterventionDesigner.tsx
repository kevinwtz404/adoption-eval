import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { analyseStep } from '../data/gemini';

const PARADIGMS = [
  { value: 'rules', label: 'Follow set rules', desc: 'Deterministic logic, automation, templates' },
  { value: 'rag', label: 'Find answers in documents', desc: 'Retrieval-augmented generation' },
  { value: 'llm-copilot', label: 'Draft, summarise or explain', desc: 'LLM as copilot, human reviews' },
  { value: 'ml', label: 'Classify, score or predict', desc: 'Machine learning, pattern recognition' },
  { value: 'llm-agent', label: 'Take multi-step actions', desc: 'LLM as agent, autonomous tasks' },
  { value: 'hybrid', label: 'Calculations + generated text', desc: 'Deterministic core with AI layer' },
];

interface StepDesign {
  humanWork: string;
  deterministicWork: string;
  aiWork: string;
  aiParadigm: string | null;
  notes: string;
  isCandidate: boolean;
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
      if (flagship) setPainPoint(flagship.painPoint);
    }
  }, []);

  function getDesign(stepId: string): StepDesign {
    return designs[stepId] || { humanWork: '', deterministicWork: '', aiWork: '', aiParadigm: null, notes: '', isCandidate: false };
  }

  function updateDesign(stepId: string, field: keyof StepDesign, value: any) {
    const current = getDesign(stepId);
    const updated = { ...current, [field]: value };
    if (field === 'isCandidate' && !value) {
      updated.aiWork = '';
      updated.aiParadigm = null;
    }
    const next = { ...designs, [stepId]: updated };
    setDesigns(next);
    saveState({ designs: next } as any);
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '14px', color: '#991b1b' }}>
        No workflow steps found. <a href="2-select/" style={{ color: '#6830C4' }}>Go back to Step 2</a> to select or define a workflow.
      </div>
    );
  }

  const candidates = steps.filter(s => getDesign(s.id).isCandidate);
  const withParadigm = candidates.filter(s => getDesign(s.id).aiParadigm);

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Context */}
      <div style={{ padding: '1rem 1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Designing intervention for</div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '12px', color: '#666' }}>
            <span>{steps.length} steps</span>
            <span>{candidates.length} candidates for change</span>
          </div>
        </div>
        {painPoint && <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginTop: '0.75rem' }}>{painPoint}</div>}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
        {steps.map((step, i) => {
          const design = getDesign(step.id);
          const isExpanded = expandedStep === step.id;
          const paradigm = design.aiParadigm ? PARADIGMS.find(p => p.value === design.aiParadigm) : null;

          return (
            <div key={step.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>

              {/* Header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#999', fontSize: '13px', minWidth: '1.5em' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{step.name}</div>
                    {step.owner && <div style={{ fontSize: '12px', color: '#999' }}>{step.owner}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {design.isCandidate && (
                    <span style={{ fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4', fontWeight: 600 }}>
                      candidate
                    </span>
                  )}
                  {paradigm && (
                    <span style={{ fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: '#f0fdf4', color: '#166534', fontWeight: 600 }}>
                      {paradigm.label}
                    </span>
                  )}
                  <span style={{ fontSize: '1.25rem', color: '#ccc' }}>{isExpanded ? '\u2212' : '+'}</span>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.25rem' }}>

                  {(step as any).pain && (
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '1.25em', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', borderLeft: '3px solid #e0e0e0' }}>
                      <strong>Current pain:</strong> {(step as any).pain}
                    </div>
                  )}

                  {/* Is this a candidate? */}
                  <div style={{ marginBottom: '1.25em' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.5rem' }}>Does this step need to change?</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateDesign(step.id, 'isCandidate', true)}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                          border: design.isCandidate ? '1px solid #6830C4' : '1px solid #e0e0e0',
                          background: design.isCandidate ? 'rgba(104, 48, 196, 0.06)' : '#fff',
                          color: design.isCandidate ? '#6830C4' : '#666',
                        }}
                      >Yes, this is a candidate</button>
                      <button
                        onClick={() => updateDesign(step.id, 'isCandidate', false)}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                          border: !design.isCandidate ? '1px solid #6830C4' : '1px solid #e0e0e0',
                          background: !design.isCandidate ? 'rgba(104, 48, 196, 0.06)' : '#fff',
                          color: !design.isCandidate ? '#6830C4' : '#666',
                        }}
                      >No, keep as is</button>
                    </div>
                  </div>

                  {design.isCandidate && (
                    <div>
                      {/* Human work */}
                      <div style={{ marginBottom: '1em' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          What part of this step needs to stay with people?
                        </label>
                        <textarea
                          value={design.humanWork}
                          onInput={(e) => updateDesign(step.id, 'humanWork', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. Final review and approval before publishing"
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' as const }}
                        />
                      </div>

                      {/* Deterministic work */}
                      <div style={{ marginBottom: '1em' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          What part is predictable and rule-based? (no AI needed)
                        </label>
                        <textarea
                          value={design.deterministicWork}
                          onInput={(e) => updateDesign(step.id, 'deterministicWork', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. Resizing images to platform dimensions, reformatting data between systems"
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' as const }}
                        />
                      </div>

                      {/* AI work */}
                      <div style={{ marginBottom: '1em' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          What part could AI help with?
                        </label>
                        <textarea
                          value={design.aiWork}
                          onInput={(e) => updateDesign(step.id, 'aiWork', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. Adjusting tone and length of copy for each channel"
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' as const }}
                        />
                      </div>

                      {/* AI paradigm */}
                      {design.aiWork && (
                        <div style={{ marginBottom: '1em' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>
                            What kind of AI fits?
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                            {PARADIGMS.map(p => (
                              <div
                                key={p.value}
                                onClick={() => updateDesign(step.id, 'aiParadigm', p.value)}
                                style={{
                                  padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                                  border: design.aiParadigm === p.value ? '1px solid rgba(104, 48, 196, 0.3)' : '1px solid #f0f0f0',
                                  background: design.aiParadigm === p.value ? 'rgba(104, 48, 196, 0.04)' : '#fff',
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: design.aiParadigm === p.value ? '#6830C4' : '#333' }}>{p.label}</div>
                                  <div style={{ fontSize: '11px', color: '#999' }}>{p.desc}</div>
                                </div>
                                {design.aiParadigm === p.value && (
                                  <span style={{ color: '#6830C4', fontWeight: 700, fontSize: '14px' }}>{'\u2713'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div style={{ marginBottom: '1em' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>
                          Anything else to note?
                        </label>
                        <textarea
                          value={design.notes}
                          onInput={(e) => updateDesign(step.id, 'notes', (e.target as HTMLTextAreaElement).value)}
                          placeholder="e.g. Need to check data access permissions, this step is blocked by another team"
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' as const }}
                        />
                      </div>

                      {/* AI Analysis */}
                      <div>
                        <button
                          onClick={async () => {
                            setAnalysing(step.id);
                            const description = [
                              design.humanWork && `Should stay human: ${design.humanWork}`,
                              design.deterministicWork && `Could be automated with rules: ${design.deterministicWork}`,
                              design.aiWork && `Could use AI: ${design.aiWork}`,
                              design.notes && `Notes: ${design.notes}`,
                            ].filter(Boolean).join('. ') || 'No description provided yet.';
                            const result = await analyseStep(
                              step.name,
                              (step as any).pain || '',
                              description,
                              workflowName,
                            );
                            setAnalyses(prev => ({ ...prev, [step.id]: result }));
                            setAnalysing(null);
                          }}
                          disabled={analysing === step.id}
                          style={{
                            padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '13px',
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
                            fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' as const,
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6830C4', marginBottom: '0.5rem' }}>
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
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem' }}>Intervention summary</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
            {candidates.map(s => {
              const d = getDesign(s.id);
              const p = d.aiParadigm ? PARADIGMS.find(pr => pr.value === d.aiParadigm) : null;
              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {d.humanWork && <span style={{ fontSize: '10px', padding: '0.125rem 0.375rem', borderRadius: '4px', background: '#f3f4f6', color: '#666' }}>human</span>}
                    {d.deterministicWork && <span style={{ fontSize: '10px', padding: '0.125rem 0.375rem', borderRadius: '4px', background: '#f3f4f6', color: '#666' }}>deterministic</span>}
                    {p && <span style={{ fontSize: '10px', padding: '0.125rem 0.375rem', borderRadius: '4px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4' }}>{p.label}</span>}
                    {d.aiWork && !p && <span style={{ fontSize: '10px', color: '#d97706' }}>needs paradigm</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
