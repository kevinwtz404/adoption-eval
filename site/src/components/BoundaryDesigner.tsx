import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';

interface BoundaryDecision {
  id: string;
  category: string;
  question: string;
  helpText: string;
  choice: string;
  detail: string;
  pilotImplication: { yes: string; partly: string; no: string };
}

const DECISIONS: BoundaryDecision[] = [
  // Error tolerance
  {
    id: 'review-text', category: 'Error tolerance',
    question: 'Should AI-generated text be reviewed by a person before it is used?',
    helpText: 'AI text can be factually wrong, off-tone or misleading. The risk depends on who sees the output and what decisions are made from it.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All AI-generated text goes through human review before use. Build a review interface into the pilot.',
      partly: 'Some outputs need review (high-stakes), others can proceed with monitoring. Define which is which.',
      no: 'AI text is used directly. Ensure quality testing is thorough before launch.',
    },
  },
  {
    id: 'numbers-deterministic', category: 'Error tolerance',
    question: 'Should all numbers and calculations come from deterministic sources only?',
    helpText: 'LLMs can generate numbers that look calculated but are made up. A wrong number in a report is very different from a wrong word in a summary.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Numbers must come from spreadsheets, databases or rules engines. The LLM handles language only. Enforce this in the architecture.',
      partly: 'Some numbers can be AI-estimated (e.g. projections in brainstorming) but anything in a formal report must be deterministic.',
      no: 'AI can generate numerical estimates. Label them clearly as AI-generated.',
    },
  },
  {
    id: 'verify-retrieved', category: 'Error tolerance',
    question: 'Should retrieved information be verified before it informs decisions?',
    helpText: 'If your system retrieves from documents, the answers depend on what was indexed. Stale or incomplete sources produce unreliable answers. A citation does not guarantee the interpretation is correct.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All retrieved answers include source citations. Users are trained to verify before acting on them.',
      partly: 'High-stakes retrievals require verification. Routine lookups can proceed with confidence scoring.',
      no: 'Retrieved information is trusted directly. Ensure source quality is high and indexing is current.',
    },
  },
  // Data and privacy
  {
    id: 'data-local', category: 'Data and privacy',
    question: 'Should the data in this workflow stay within your systems?',
    helpText: 'Cloud AI models process your data on external servers. For confidential, personal or regulated data this may not be acceptable. Local models keep everything on your infrastructure.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Use local models (Ollama, llama.cpp, vLLM) or on-premises deployment. No data sent to external APIs.',
      partly: 'Some data can go to cloud models (non-sensitive), other data must stay local. Split the pipeline accordingly.',
      no: 'Cloud models are acceptable. Standard API terms apply.',
    },
  },
  {
    id: 'access-permissions', category: 'Data and privacy',
    question: 'Should the system enforce existing access permissions?',
    helpText: 'If the system retrieves internal information, it could surface documents that not everyone should see: salary data, confidential client information, unreleased plans.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Permission checks are built into the retrieval layer. The system only surfaces what the user is allowed to see.',
      partly: 'Some sources need permission checks, others are open. Map which is which before building.',
      no: 'All information in scope is accessible to all users of the system.',
    },
  },
  // Cost
  {
    id: 'model-size', category: 'Cost and environment',
    question: 'Should we start with the smallest model that works?',
    helpText: 'Larger models are more capable but more expensive and use more energy. For many tasks a smaller model works just as well. Testing smaller models first saves money and reduces environmental impact.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Test with small/medium models first. Only upgrade if quality is insufficient. Document why a larger model is needed.',
      partly: 'Some steps need a capable model, others can use a small one. Match model to task.',
      no: 'Use the most capable model available. Budget accordingly.',
    },
  },
  {
    id: 'scale-cost', category: 'Cost and environment',
    question: 'Should we estimate costs at full scale before committing to the pilot?',
    helpText: 'What costs pennies for 10 users can cost thousands for 1000. Deterministic components are effectively free at scale. LLM calls are not.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Calculate cost per call, multiply by expected volume at scale. Include this in the pilot evaluation criteria.',
      partly: 'Rough estimate is enough for the pilot. Refine during evaluation.',
      no: 'Pilot first, worry about scale costs later.',
    },
  },
  // Human checkpoints
  {
    id: 'approval-gate', category: 'Human checkpoints',
    question: 'Should a person approve outputs before they leave the system?',
    helpText: 'An approval gate pauses the workflow until someone signs off. Essential for anything customer-facing, legally binding or financially significant. But too many gates create bottlenecks.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Define who approves, what they check and what happens if they are unavailable. Build the approval step into the workflow.',
      partly: 'High-stakes outputs need approval. Low-stakes can proceed with monitoring. Define which is which.',
      no: 'Outputs proceed without approval. Ensure monitoring and logging are in place.',
    },
  },
  {
    id: 'fallback', category: 'Human checkpoints',
    question: 'Should there be a manual fallback for every AI step?',
    helpText: 'If the AI fails, produces bad output or is unavailable, what happens? A manual fallback means a person can always step in. Without one, the workflow breaks when the AI breaks.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'Every AI step has a documented manual process. The pilot can fall back to the old workflow at any point.',
      partly: 'Critical steps have fallbacks. Non-critical steps can fail gracefully (skip, retry, queue).',
      no: 'The pilot depends on the AI working. Ensure reliability testing before launch.',
    },
  },
  {
    id: 'transparency', category: 'Human checkpoints',
    question: 'Should it be clear to users when AI is involved?',
    helpText: 'People affected by AI outputs should know the output was AI-generated. This builds trust and allows them to apply appropriate scrutiny.',
    choice: '', detail: '',
    pilotImplication: {
      yes: 'All AI-generated outputs are labelled. Users know what was written by a person and what was generated.',
      partly: 'Internal outputs are labelled. External outputs may not explicitly mention AI but are human-reviewed.',
      no: 'AI involvement is not disclosed. Consider the ethical and trust implications.',
    },
  },
];

export default function BoundaryDesigner() {
  const [workflowName, setWorkflowName] = useState('');
  const [decisions, setDecisions] = useState<BoundaryDecision[]>([]);

  useEffect(() => {
    const state = loadState();
    setWorkflowName(state.workflow?.name || '');

    const saved = (state as any).boundaryDecisions;
    if (saved && saved.length > 0 && saved[0].pilotImplication) {
      setDecisions(saved);
    } else {
      const fresh = DECISIONS.map(d => ({ ...d }));
      setDecisions(fresh);
      saveState({ boundaryDecisions: fresh } as any);
    }
  }, []);

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

  const categories = [...new Set(decisions.map(d => d.category))];
  const answered = decisions.filter(d => d.choice).length;

  return (
    <div style={{ marginTop: '1.5rem' }}>

      <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Decisions for your pilot: {workflowName}</div>
            <div style={{ fontSize: '15px', color: '#999' }}>{answered} of {decisions.length} decisions made</div>
          </div>
        </div>
        <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginTop: '0.75rem' }}>
          These questions are about your specific pilot. Your answers will shape the build instructions and evaluation criteria.
        </div>
      </div>

      {categories.map(category => {
        const categoryDecisions = decisions.filter(d => d.category === category);

        return (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>{category}</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
              {categoryDecisions.map(item => (
                <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, lineHeight: '1.75', marginBottom: '0.375rem' }}>
                    {item.question}
                  </div>
                  <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '0.75rem' }}>
                    {item.helpText}
                  </div>
                  <div style={{ display: 'inline-flex', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                    {['yes', 'partly', 'no'].map((val, vi) => (
                      <button
                        key={val}
                        onClick={() => updateChoice(item.id, val)}
                        style={{
                          padding: '0.375rem 1rem', fontSize: '15px',
                          fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                          border: 'none',
                          borderRight: vi < 2 ? '1px solid #e0e0e0' : 'none',
                          background: item.choice === val ? '#6830C4' : '#fff',
                          color: item.choice === val ? '#fff' : '#666',
                        }}
                      >
                        {val === 'yes' ? 'Yes' : val === 'partly' ? 'Partly' : 'No'}
                      </button>
                    ))}
                  </div>
                  {item.choice && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', fontSize: '15px', color: '#666', lineHeight: '1.75', borderLeft: '3px solid #6830C4' }}>
                      <strong>What this means for your pilot:</strong> {item.pilotImplication[item.choice as 'yes' | 'partly' | 'no']}
                    </div>
                  )}
                  {item.choice === 'partly' && (
                    <textarea
                      value={item.detail}
                      onInput={(e) => updateDetail(item.id, (e.target as HTMLTextAreaElement).value)}
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
