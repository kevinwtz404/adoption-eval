import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';

const LEVELS = [
  { value: 0, name: 'Fully human' },
  { value: 1, name: 'AI-assisted' },
  { value: 2, name: 'AI-led, human-supervised' },
  { value: 3, name: 'AI-led, human on standby' },
  { value: 4, name: 'Autonomous within boundaries' },
  { value: 5, name: 'Fully autonomous' },
];

const PARADIGMS = [
  { value: 'rules', name: 'Rules and automation', prompt: 'Follow set rules', desc: 'If X then Y. Route, validate, calculate, format.' },
  { value: 'rag', name: 'RAG', prompt: 'Find answers in existing documents', desc: 'Search, retrieve and cite from a knowledge base.' },
  { value: 'llm-copilot', name: 'LLM as copilot', prompt: 'Draft, summarise or explain', desc: 'Generate text, create summaries, support human decisions.' },
  { value: 'ml', name: 'Machine learning', prompt: 'Classify, score or predict', desc: 'Detect patterns, rank items, forecast outcomes.' },
  { value: 'llm-agent', name: 'LLM as agent', prompt: 'Take actions across multiple steps', desc: 'Call tools, orchestrate workflows, execute multi-step tasks.' },
  { value: 'hybrid', name: 'Hybrid', prompt: 'Combine calculations with generated text', desc: 'Numbers must be exact, narrative wraps around them.' },
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

  useEffect(() => {
    const state = loadState();
    if (state.workflow?.steps) {
      setSteps(state.workflow.steps as WorkflowStep[]);
      setWorkflowName(state.workflow.name || '');
    }
    if (state.mappings) {
      setMappings(state.mappings);
    }
  }, []);

  function updateLevel(stepId: string, value: number) {
    const current = mappings[stepId] || { level: 0, paradigm: null };
    const updated = { ...current, level: value };
    if (value === 0) updated.paradigm = null;
    const next = { ...mappings, [stepId]: updated };
    setMappings(next);
    saveState({ mappings: next } as any);
  }

  function updateParadigm(stepId: string, value: string) {
    const current = mappings[stepId] || { level: 0, paradigm: null };
    const next = { ...mappings, [stepId]: { ...current, paradigm: value } };
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

  const summary = {
    total: steps.length,
    human: steps.filter(s => getMapping(s.id).level === 0).length,
    withAI: steps.filter(s => getMapping(s.id).level > 0).length,
    needParadigm: steps.filter(s => getMapping(s.id).level > 0 && !getMapping(s.id).paradigm).length,
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
          <span>{summary.human} fully human</span>
          <span>{summary.withAI} with AI</span>
          {summary.needParadigm > 0 && <span style={{ color: '#d97706' }}>{summary.needParadigm} need paradigm</span>}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
        {steps.map((step, i) => {
          const mapping = getMapping(step.id);
          const level = LEVELS[mapping.level];
          const paradigm = mapping.paradigm ? PARADIGMS.find(p => p.value === mapping.paradigm) : null;
          const risks = mapping.paradigm ? PARADIGM_RISKS[mapping.paradigm] || [] : [];

          return (
            <div key={step.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1.25rem' }}>

              {/* Step header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#999', fontSize: '13px', minWidth: '1.5em', paddingTop: '2px' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{step.name}</div>
                  {step.owner && <div style={{ fontSize: '12px', color: '#999' }}>{step.owner}</div>}
                  {(step as any).pain && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '0.375rem', lineHeight: '1.5' }}>{(step as any).pain}</div>
                  )}
                </div>
              </div>

              {/* Level slider */}
              <div style={{ marginBottom: mapping.level > 0 ? '1rem' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.375rem' }}>Automation level</div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={mapping.level}
                  style={{ width: '100%', accentColor: '#6830C4', cursor: 'pointer' }}
                  onInput={(e: Event) => updateLevel(step.id, parseInt((e.target as HTMLInputElement).value, 10))}
                />
                <div style={{ fontSize: '12px', color: '#6830C4', fontWeight: 600, marginTop: '0.25rem' }}>
                  {level?.name}
                </div>
              </div>

              {/* Paradigm selector (only if level > 0) */}
              {mapping.level > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.25rem' }}>What would AI do at this step?</div>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                    These are different technologies, not just different uses of the same tool. "Follow set rules" means deterministic logic (no AI model involved). "Draft or summarise" means a language model generates text. They have very different risk profiles.
                    {' '}<a href="resources/#ai-paradigms" style={{ color: '#6830C4', fontSize: '12px' }}>Understand the differences</a>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                    {PARADIGMS.map(p => (
                      <div
                        key={p.value}
                        onClick={() => updateParadigm(step.id, p.value)}
                        style={{
                          padding: '0.625rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: mapping.paradigm === p.value ? '1px solid rgba(104, 48, 196, 0.3)' : '1px solid #f0f0f0',
                          background: mapping.paradigm === p.value ? 'rgba(104, 48, 196, 0.04)' : '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: mapping.paradigm === p.value ? '#6830C4' : '#333' }}>
                            {p.prompt}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '0.125rem' }}>{p.desc}</div>
                        </div>
                        {mapping.paradigm === p.value && (
                          <span style={{ fontSize: '11px', padding: '0.125rem 0.5rem', borderRadius: '100px', background: 'rgba(104, 48, 196, 0.08)', color: '#6830C4', fontWeight: 600, whiteSpace: 'nowrap' as const, marginLeft: '0.75rem' }}>
                            {p.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Risks */}
                  {risks.length > 0 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #fca5a5' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b', marginBottom: '0.375rem' }}>
                        Key risks for this approach
                      </div>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                        {risks.map((risk, ri) => (
                          <li key={ri} style={{ fontSize: '12px', color: '#991b1b', padding: '0.125rem 0', lineHeight: '1.5' }}>{risk}</li>
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
