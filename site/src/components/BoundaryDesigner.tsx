import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { suggestBoundaryDefaults } from '../data/gemini-playbook';

interface BoundaryDecision {
  id: string;
  question: string;
  choice: string;
  detail: string;
  pilotImplication: { yes: string; partly: string; no: string };
}

const DECISIONS: BoundaryDecision[] = [
  {
    id: 'review-text',
    question: 'Should AI-generated text be reviewed by a person before it is used?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All AI-generated text goes through human review before use. Build a review interface into the pilot.',
      partly: 'Some outputs need review (high-stakes), others can proceed with monitoring. Define which is which.',
      no: 'AI text is used directly. Ensure quality testing is thorough before launch.',
    },
  },
  {
    id: 'numbers-deterministic',
    question: 'Should all numbers and calculations come from deterministic sources only?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Numbers must come from spreadsheets, databases or rules engines. The LLM handles language only. Enforce this in the architecture.',
      partly: 'Some numbers can be AI-estimated (e.g. projections in brainstorming) but anything in a formal report must be deterministic.',
      no: 'AI can generate numerical estimates. Label them clearly as AI-generated.',
    },
  },
  {
    id: 'verify-retrieved',
    question: 'Should retrieved information be verified before it informs decisions?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All retrieved answers include source citations. Users are trained to verify before acting on them.',
      partly: 'High-stakes retrievals require verification. Routine lookups can proceed with confidence scoring.',
      no: 'Retrieved information is trusted directly. Ensure source quality is high and indexing is current.',
    },
  },
  {
    id: 'data-local',
    question: 'Should the data in this workflow stay within your systems?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Use local models (Ollama, llama.cpp, vLLM) or on-premises deployment. No data sent to external APIs.',
      partly: 'Some data can go to cloud models (non-sensitive), other data must stay local. Split the pipeline accordingly.',
      no: 'Cloud models are acceptable. Standard API terms apply.',
    },
  },
  {
    id: 'access-permissions',
    question: 'Should the system enforce existing access permissions?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Permission checks are built into the retrieval layer. The system only surfaces what the user is allowed to see.',
      partly: 'Some sources need permission checks, others are open. Map which is which before building.',
      no: 'All information in scope is accessible to all users of the system.',
    },
  },
  {
    id: 'model-size',
    question: 'Should we start with the smallest model that works?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Test with small/medium models first. Only upgrade if quality is insufficient. Document why a larger model is needed.',
      partly: 'Some steps need a capable model, others can use a small one. Match model to task.',
      no: 'Use the most capable model available. Budget accordingly.',
    },
  },
  {
    id: 'scale-cost',
    question: 'Should we estimate costs at full scale before committing to the pilot?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Calculate cost per call, multiply by expected volume at scale. Include this in the pilot evaluation criteria.',
      partly: 'Rough estimate is enough for the pilot. Refine during evaluation.',
      no: 'Pilot first, worry about scale costs later.',
    },
  },
  {
    id: 'approval-gate',
    question: 'Should a person approve outputs before they leave the system?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Define who approves, what they check and what happens if they are unavailable. Build the approval step into the workflow.',
      partly: 'High-stakes outputs need approval. Low-stakes can proceed with monitoring. Define which is which.',
      no: 'Outputs proceed without approval. Ensure monitoring and logging are in place.',
    },
  },
  {
    id: 'fallback',
    question: 'Should there be a manual fallback for every AI step?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Every AI step has a documented manual process. The pilot can fall back to the old workflow at any point.',
      partly: 'Critical steps have fallbacks. Non-critical steps can fail gracefully (skip, retry, queue).',
      no: 'The pilot depends on the AI working. Ensure reliability testing before launch.',
    },
  },
  {
    id: 'transparency',
    question: 'Should it be clear to users when AI is involved?',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All AI-generated outputs are labelled. Users know what was written by a person and what was generated.',
      partly: 'Internal outputs are labelled. External outputs may not explicitly mention AI but are human-reviewed.',
      no: 'AI involvement is not disclosed. Consider the ethical and trust implications.',
    },
  },
];

const TABS = [
  { id: 'errors', label: 'Error tolerance' },
  { id: 'data', label: 'Data and privacy' },
  { id: 'cost', label: 'Cost' },
  { id: 'humans', label: 'Human checkpoints' },
];

const base = import.meta.env.BASE_URL || '/';

export default function BoundaryDesigner() {
  const [activeTab, setActiveTab] = useState('errors');
  const [decisions, setDecisions] = useState<BoundaryDecision[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState('');

  useEffect(() => {
    const state = loadState();

    const saved = (state as any).boundaryDecisions;
    const hasChoices = saved && saved.length > 0 && saved.some((d: any) => d.choice);
    if (hasChoices && saved[0].pilotImplication) {
      setDecisions(saved);
    } else {
      const defaults = (state as any).boundaryDefaults;
      const fresh = DECISIONS.map(d => {
        if (defaults && defaults[d.id]) {
          return { ...d, choice: defaults[d.id].choice, detail: defaults[d.id].detail };
        }
        return { ...d };
      });
      setDecisions(fresh);
      saveState({ boundaryDecisions: fresh } as any);

      // For custom workflows with no defaults, auto-suggest via Gemini
      const hasAnyChoice = fresh.some(d => d.choice);
      if (!hasAnyChoice && state.selectedCase === 'custom' && state.redesign && state.redesignData) {
        autoSuggest(state, fresh);
      }
    }
  }, []);

  async function autoSuggest(state: any, currentDecisions: BoundaryDecision[]) {
    setSuggesting(true);
    setSuggestError('');
    try {
      const suggestions = await suggestBoundaryDefaults(
        state.workflow?.name || 'Custom workflow',
        state.workflow?.steps?.[0]?.pain || '',
        state.redesign || '',
        (state.redesignData?.components || []).filter((c: any) => !c.name.startsWith('_')),
      );
      if (suggestions && suggestions.length > 0) {
        const updated = currentDecisions.map(d => {
          const suggestion = suggestions.find(s => s.id === d.id);
          if (suggestion) {
            return { ...d, choice: suggestion.choice, detail: suggestion.choice === 'partly' ? suggestion.rationale : '' };
          }
          return d;
        });
        setDecisions(updated);
        saveState({ boundaryDecisions: updated } as any);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Rate limit')) {
        setSuggestError('Rate limit reached. Fill in the decisions manually or try again later.');
      }
    } finally {
      setSuggesting(false);
    }
  }

  function updateChoice(id: string, value: string) {
    const updated = decisions.map(d => d.id === id ? { ...d, choice: value, detail: value === 'partly' ? d.detail : '' } : d);
    setDecisions(updated);
    saveState({ boundaryDecisions: updated } as any);
  }

  function updateDetail(id: string, value: string) {
    const updated = decisions.map(d => d.id === id ? { ...d, detail: value } : d);
    setDecisions(updated);
    saveState({ boundaryDecisions: updated } as any);
  }

  function toggleSection(key: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function getDecision(id: string) {
    return decisions.find(d => d.id === id);
  }

  const answered = decisions.filter(d => d.choice).length;

  // --- Render helpers ---

  function renderDecisionBlock(id: string) {
    const decision = getDecision(id);
    if (!decision) return null;
    return (
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.75', marginBottom: '0.5rem' }}>
          {decision.question}
        </div>
        <div style={{ display: 'inline-flex', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
          {(['yes', 'partly', 'no'] as const).map((val, vi) => (
            <button
              key={val}
              onClick={() => updateChoice(decision.id, val)}
              style={{
                padding: '0.375rem 1rem', fontSize: '15px',
                fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                border: 'none',
                borderRight: vi < 2 ? '1px solid #e0e0e0' : 'none',
                background: decision.choice === val ? '#6830C4' : '#fff',
                color: decision.choice === val ? '#fff' : '#666',
              }}
            >
              {val === 'yes' ? 'Yes' : val === 'partly' ? 'Partly' : 'No'}
            </button>
          ))}
        </div>
        {decision.choice && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', fontSize: '15px', color: '#666', lineHeight: '1.75', borderLeft: '3px solid #6830C4' }}>
            <strong>What this means for your pilot:</strong> {decision.pilotImplication[decision.choice as 'yes' | 'partly' | 'no']}
          </div>
        )}
        {decision.choice === 'partly' && (
          <textarea
            value={decision.detail}
            onInput={(e) => updateDetail(decision.id, (e.target as HTMLTextAreaElement).value)}
            placeholder="Describe how this applies to your specific workflow..."
            rows={2}
            style={{
              width: '100%', marginTop: '0.75rem', padding: '0.5rem',
              border: '1px solid #e0e0e0', borderRadius: '6px',
              fontFamily: 'inherit', fontSize: '15px', resize: 'vertical' as const, lineHeight: '1.75',
            }}
          />
        )}
      </div>
    );
  }

  function renderSection(key: string, title: string, content: preact.ComponentChildren, decisionId?: string) {
    const isOpen = openSections.has(key);
    const decision = decisionId ? getDecision(decisionId) : null;
    const choiceLabel = decision?.choice === 'yes' ? 'Yes' : decision?.choice === 'partly' ? 'Partly' : decision?.choice === 'no' ? 'No' : null;
    return (
      <div key={key} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', marginBottom: '0.5rem' }}>
        <button
          onClick={() => toggleSection(key)}
          style={{
            padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '15px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', width: '100%',
            border: 'none', background: 'transparent', fontFamily: 'inherit',
            textAlign: 'left' as const,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
            {choiceLabel && !isOpen && (
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '100px', background: '#f3f0ff', color: '#6830C4' }}>
                {choiceLabel}
              </span>
            )}
          </span>
          <span style={{ fontSize: '1.25rem', color: '#999', fontWeight: 400 }}>
            {isOpen ? '\u2212' : '+'}
          </span>
        </button>
        {isOpen && (
          <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
            {content}
            {decisionId && renderDecisionBlock(decisionId)}
          </div>
        )}
      </div>
    );
  }

  const p = (text: preact.ComponentChildren) => (
    <p style={{ fontSize: '15px', lineHeight: '1.75' }}>{text}</p>
  );

  const pGap = (text: preact.ComponentChildren) => (
    <p style={{ fontSize: '15px', lineHeight: '1.75', marginTop: '1.25em' }}>{text}</p>
  );

  // --- Main render ---

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.625rem 0.5rem', fontSize: '15px',
              fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              border: 'none',
              borderRight: i < TABS.length - 1 ? '1px solid #e0e0e0' : 'none',
              background: activeTab === tab.id ? '#6830C4' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#999',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ fontSize: '13px', color: '#999', marginBottom: '1.25rem' }}>
        {suggesting ? (
          <span style={{ color: 'var(--purple)' }}>Suggesting defaults based on your workflow...</span>
        ) : (
          <>{answered} of {decisions.length} boundary decisions made</>
        )}
        {suggestError && (
          <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>{suggestError}</span>
        )}
      </div>

      {/* Error tolerance */}
      {activeTab === 'errors' && (
        <div>
          {p('Not all errors are equal. A slightly off tone in a LinkedIn post is fixable. A wrong number in a board deck is not. Think about what happens when each part of your system produces a bad output.')}

          <div style={{ marginTop: '1rem' }}>
            {renderSection('gen-text', 'Errors in generated text', (
              <>
                {p(<>Language models <a href="https://casmi.northwestern.edu/news/articles/2024/the-hallucination-problem-a-feature-not-a-bug.html" target="_blank" rel="noopener" style={{ color: '#6830C4' }}>hallucinate</a>. They produce text that sounds right but can be factually wrong. This is not a bug that will be fixed. It is how the technology works.</>)}
                {pGap(<><strong>Think about:</strong> Who sees this output? Is it a draft or a final product? What happens if it contains a factual error?</>)}
              </>
            ), 'review-text')}

            {renderSection('numbers', 'Errors in numbers', (
              <>
                {p('Numbers from a spreadsheet are deterministic and reliable. Numbers from an LLM are not. An LLM can generate a number that looks calculated but is actually made up. A wrong projection in a brainstorming session is tolerable. A wrong revenue figure in a board report is not.')}
                {pGap(<><strong>Think about:</strong> Does any AI component produce or handle numbers? Are those numbers verified against a deterministic source?</>)}
              </>
            ), 'numbers-deterministic')}

            {renderSection('retrieved', 'Errors in retrieved information', (
              <>
                {p('If your design uses retrieval (RAG), the answers are only as good as the documents indexed. Stale documents produce stale answers. A citation does not guarantee the interpretation is correct.')}
                {pGap(<><strong>Think about:</strong> How current are the source documents? What happens if the system retrieves the wrong document?</>)}
              </>
            ), 'verify-retrieved')}

            {renderSection('signals', 'Errors in signals and patterns', (
              <>
                {p('If your design surfaces signals from unstructured data, these are pattern matches, not facts. The system might count wrong, misattribute a mention or flag something irrelevant.')}
                {pGap(<><strong>Think about:</strong> Are signals clearly labelled as signals, not facts? What is the worst that happens if a signal is wrong?</>)}
              </>
            ))}
          </div>
        </div>
      )}

      {/* Data and privacy */}
      {activeTab === 'data' && (
        <div>
          {p('Most AI models run in the cloud. That means your data is sent to an external server for processing. For some workflows this is fine. For others it is a dealbreaker.')}

          <div style={{ marginTop: '1rem' }}>
            {renderSection('cloud-local', 'Cloud vs local models', (
              <>
                {p('Cloud models (OpenAI, Anthropic, Google) are the most capable but your data leaves your infrastructure. Local models (Ollama, llama.cpp) keep everything on your machines but require hardware and expertise. For many tasks, a smaller local model works well enough.')}
                {pGap(<><strong>Think about:</strong> What data does each AI component process? Is any of it confidential, personal or regulated?</>)}
              </>
            ), 'data-local')}

            {renderSection('access-control', 'Access control and permissions', (
              <>
                {p('If your system retrieves from internal sources, it must respect existing permissions. A system that surfaces salary data or confidential client information to the wrong person is worse than no system at all.')}
                {pGap(<><strong>Think about:</strong> Who can see what in the current workflow? Does the AI system enforce the same permissions?</>)}
              </>
            ), 'access-permissions')}

            {renderSection('hard-rules', 'Hard rules', (
              <>
                {p('Every system needs things it must never do regardless of what the AI decides. These should be enforced in the architecture, not just documented in a policy.')}
                {pGap('Examples: never send an email without human approval. Never modify financial records. Never surface confidential documents to unauthorised users.')}
              </>
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      {activeTab === 'cost' && (
        <div>
          {p('Not every step needs the most expensive model. And what costs pennies at pilot scale can cost thousands at full scale.')}

          <div style={{ marginTop: '1rem' }}>
            {renderSection('model-selection', 'Model selection', (
              <>
                {p('A step that classifies support tickets might work with a small, cheap model. A step that drafts nuanced board commentary might need a more capable one. Match the model to the task.')}
                {pGap(<><strong>Think about:</strong> For each AI component, what is the simplest model that could work? Have you tested smaller models?</>)}
              </>
            ), 'model-size')}

            {renderSection('cost-scale', 'Cost at scale', (
              <>
                {p('Deterministic components (rules, APIs, calculations) are effectively free at scale. LLM calls are not. Think about volume before you build.')}
                {pGap(<><strong>Think about:</strong> How often will each AI component be called? What is the cost at pilot vs full scale?</>)}
              </>
            ), 'scale-cost')}

            {renderSection('env-cost', 'Environmental cost', (
              <>
                {p(<>AI systems <a href="https://www.technologyreview.com/2023/12/05/1084417/ais-carbon-footprint-is-bigger-than-you-think/" target="_blank" rel="noopener" style={{ color: '#6830C4' }}>consume significant energy</a> and <a href="https://www.unep.org/news-and-stories/story/ai-has-environmental-problem-heres-what-world-can-do-about" target="_blank" rel="noopener" style={{ color: '#6830C4' }}>massive amounts of water</a>. <a href="https://www.npm.org/2024/07/12/g-s1-9545/ai-brings-soaring-emissions-for-google-and-microsoft-a-major-contributor-to-climate-change" target="_blank" rel="noopener" style={{ color: '#6830C4' }}>Running models at scale has a real footprint</a>. Using a large model for a task a script could handle is wasteful.</>)}
                {pGap(<><strong>Think about:</strong> For each AI component, is a model call actually necessary? Could a rule, a template or a script do it instead?</>)}
              </>
            ))}
          </div>
        </div>
      )}

      {/* Human checkpoints */}
      {activeTab === 'humans' && (
        <div>
          {p('Not everything needs to pause for human approval. But some things absolutely do. The question is which ones.')}

          <div style={{ marginTop: '1rem' }}>
            {renderSection('approval-gates', 'Approval gates', (
              <>
                {p(<>An <a href={`${base}resources/#approval-gate`} style={{ color: '#6830C4' }}>approval gate</a> pauses the workflow until a person signs off. Use these for high-stakes outputs: anything customer-facing, legally binding or financially significant.</>)}
                {pGap(<><strong>Think about:</strong> Which outputs need human approval? Who approves? What happens if they are unavailable?</>)}
              </>
            ), 'approval-gate')}

            {renderSection('monitoring', 'Monitoring vs approval', (
              <>
                {p('Low-stakes outputs can proceed with monitoring: the system logs everything and a person reviews periodically. If you put approval gates on everything, the human becomes a bottleneck and starts rubber-stamping.')}
                {pGap(<><strong>Think about:</strong> Which outputs need approval and which can proceed with monitoring?</>)}
              </>
            ))}

            {renderSection('rejection', 'Rejection paths', (
              <>
                {p('If the reviewer rejects the AI output, what happens? Does it regenerate? Does a person handle it manually? Does it queue?')}
                {pGap(<><strong>Think about:</strong> For each approval gate, what is the fallback when the human disagrees?</>)}
              </>
            ), 'fallback')}

            {renderSection('bias-transparency', 'Bias and transparency', (
              <>
                {p(<>Models reflect <a href={`${base}resources/#bias`} style={{ color: '#6830C4' }}>biases in their training data</a>. If your system makes decisions that affect people, test for this. <a href="https://hdsr.mitpress.mit.edu/pub/aelql9qy" target="_blank" rel="noopener" style={{ color: '#6830C4' }}>Users should know when they are interacting with AI</a>.</>)}
                {pGap(<><strong>Think about:</strong> Does your system produce outputs that affect people? Is it clear to users when AI is involved?</>)}
              </>
            ), 'transparency')}
          </div>
        </div>
      )}
    </div>
  );
}
