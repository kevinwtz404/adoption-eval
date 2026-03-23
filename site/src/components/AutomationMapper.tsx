import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';

const LEVELS = [
  { value: 0, name: 'Fully human', short: 'Human' },
  { value: 1, name: 'AI-assisted', short: 'Assisted' },
  { value: 2, name: 'AI-led, human-supervised', short: 'Supervised' },
  { value: 3, name: 'AI-led, human on standby', short: 'Standby' },
  { value: 4, name: 'Autonomous within boundaries', short: 'Autonomous' },
  { value: 5, name: 'Fully autonomous', short: 'Full auto' },
];

const PARADIGMS = [
  { value: 'rules', name: 'Rules and automation' },
  { value: 'ml', name: 'Machine learning' },
  { value: 'llm-copilot', name: 'LLM as copilot' },
  { value: 'llm-agent', name: 'LLM as agent' },
  { value: 'rag', name: 'RAG (retrieval + generation)' },
  { value: 'hybrid', name: 'Hybrid (deterministic + AI)' },
];

const PARADIGM_RISKS: Record<string, string[]> = {
  'rules': ['Rigid: breaks on edge cases or rule changes', 'Maintenance burden as rules grow'],
  'ml': ['Bias in training data', 'Data drift over time', 'Black-box decisions hard to explain'],
  'llm-copilot': ['Hallucination: plausible but wrong output', 'Prompt sensitivity', 'Inconsistency across runs'],
  'llm-agent': ['Loss of control over multi-step actions', 'Scope creep', 'Compounding errors across steps'],
  'rag': ['Source quality determines output quality', 'Access control: who can see what', 'Citation does not guarantee correctness'],
  'hybrid': ['Architectural complexity', 'Boundary between deterministic and generative must be enforced', 'Integration testing is harder'],
};

interface StepMapping {
  level: number;
  paradigm: string | null;
}

interface WorkflowStep {
  id: string;
  name: string;
  owner?: string;
  pain?: string;
}

export default function AutomationMapper() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [mappings, setMappings] = useState<Record<string, StepMapping>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }
    if ((state as any).mappings) {
      setMappings((state as any).mappings);
    }
  }, []);

  function updateMapping(stepId: string, field: 'level' | 'paradigm', value: number | string | null) {
    const current = mappings[stepId] || { level: 0, paradigm: null };
    const updated = { ...current, [field]: value };

    // Clear paradigm if level is set to 0
    if (field === 'level' && value === 0) {
      updated.paradigm = null;
    }

    const next = { ...mappings, [stepId]: updated };
    setMappings(next);
    saveState({ mappings: next } as any);
  }

  function getMapping(stepId: string): StepMapping {
    return mappings[stepId] || { level: 0, paradigm: null };
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2', fontSize: '14px', color: '#991b1b' }}>
        No workflow steps found. <a href="2-select/" style={{ color: '#6830C4' }}>Go back to Step 2</a> to select or define a workflow.
      </div>
    );
  }

  // Summary counts
  const summary = {
    total: steps.length,
    human: steps.filter(s => getMapping(s.id).level === 0).length,
    assisted: steps.filter(s => [1, 2].includes(getMapping(s.id).level)).length,
    autonomous: steps.filter(s => getMapping(s.id).level >= 3).length,
    unmapped: steps.filter(s => getMapping(s.id).level > 0 && !getMapping(s.id).paradigm).length,
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Workflow context */}
      <div style={{ padding: '1rem 1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Mapping</div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '12px', color: '#666' }}>
          <span>{summary.human} human</span>
          <span>{summary.assisted} assisted</span>
          <span>{summary.autonomous} autonomous</span>
          {summary.unmapped > 0 && <span style={{ color: '#d97706' }}>{summary.unmapped} need paradigm</span>}
        </div>
      </div>

      {/* Step cards */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
        {steps.map((step, i) => {
          const mapping = getMapping(step.id);
          const isExpanded = expandedStep === step.id;
          const level = LEVELS.find(l => l.value === mapping.level);
          const paradigm = mapping.paradigm ? PARADIGMS.find(p => p.value === mapping.paradigm) : null;
          const risks = mapping.paradigm ? PARADIGM_RISKS[mapping.paradigm] || [] : [];
          const needsParadigm = mapping.level > 0 && !mapping.paradigm;

          return (
            <div key={step.id} style={{
              border: `1px solid ${needsParadigm ? '#fcd34d' : '#e0e0e0'}`,
              borderRadius: '8px',
              background: '#fff',
              overflow: 'hidden',
            }}>
              {/* Always visible header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#999', fontSize: '13px', minWidth: '1.5em' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{step.name}</div>
                    {step.owner && <div style={{ fontSize: '12px', color: '#999' }}>{step.owner}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '100px',
                    background: mapping.level === 0 ? '#f3f4f6' : 'rgba(104, 48, 196, 0.08)',
                    color: mapping.level === 0 ? '#666' : '#6830C4',
                    fontWeight: 600,
                  }}>
                    L{mapping.level} {level?.short}
                  </span>
                  {paradigm && (
                    <span style={{
                      fontSize: '11px',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '100px',
                      background: '#f0fdf4',
                      color: '#166534',
                      fontWeight: 600,
                    }}>
                      {paradigm.name}
                    </span>
                  )}
                  {needsParadigm && (
                    <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>needs paradigm</span>
                  )}
                  <span style={{ fontSize: '1.25rem', color: '#ccc' }}>{isExpanded ? '\u2212' : '+'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.25rem' }}>
                  {(step as any).pain && (
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '1.25em', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', borderLeft: '3px solid #e0e0e0' }}>
                      <strong>Current pain:</strong> {(step as any).pain}
                    </div>
                  )}

                  {/* Level selector */}
                  <div style={{ marginBottom: '1.25em' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>Automation level</div>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '0.75rem' }}>
                      How much should AI do for this step? Consider the complexity, the risk of errors and whether human judgement is needed.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                      {LEVELS.map(l => (
                        <label key={l.value} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: mapping.level === l.value ? 'rgba(104, 48, 196, 0.06)' : 'transparent',
                          border: mapping.level === l.value ? '1px solid rgba(104, 48, 196, 0.2)' : '1px solid transparent',
                          fontSize: '13px',
                        }}>
                          <input
                            type="radio"
                            name={`level-${step.id}`}
                            checked={mapping.level === l.value}
                            onChange={() => updateMapping(step.id, 'level', l.value)}
                            style={{ accentColor: '#6830C4' }}
                          />
                          <span style={{ fontWeight: 600, minWidth: '1.5em', color: '#6830C4' }}>{l.value}</span>
                          <span>{l.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Paradigm selector (only if level > 0) */}
                  {mapping.level > 0 && (
                    <div style={{ marginBottom: '1.25em' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>AI paradigm</div>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '0.75rem' }}>
                        What kind of AI fits this step? This determines the specific risks and boundary requirements.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                        {PARADIGMS.map(p => (
                          <label key={p.value} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: mapping.paradigm === p.value ? 'rgba(104, 48, 196, 0.06)' : 'transparent',
                            border: mapping.paradigm === p.value ? '1px solid rgba(104, 48, 196, 0.2)' : '1px solid transparent',
                            fontSize: '13px',
                          }}>
                            <input
                              type="radio"
                              name={`paradigm-${step.id}`}
                              checked={mapping.paradigm === p.value}
                              onChange={() => updateMapping(step.id, 'paradigm', p.value)}
                              style={{ accentColor: '#6830C4' }}
                            />
                            <span>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks (shown when paradigm is selected) */}
                  {risks.length > 0 && (
                    <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #fca5a5' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b', marginBottom: '0.375rem' }}>
                        Key risks for {paradigm?.name} at level {mapping.level}
                      </div>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                        {risks.map((risk, i) => (
                          <li key={i} style={{ fontSize: '12px', color: '#991b1b', padding: '0.125rem 0', lineHeight: '1.5' }}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
