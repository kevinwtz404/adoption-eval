import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { analyseWorkflow } from '../data/gemini';

interface BoundaryDecision {
  id: string;
  context: string;
  category: string;
  choice: string;
  detail: string;
}

const CATEGORY_OPTIONS: Record<string, Array<{ value: string; label: string; needsDetail: boolean }>> = {
  'Hard rules': [
    { value: 'enforced', label: 'Enforced in architecture', needsDetail: false },
    { value: 'policy', label: 'Policy only', needsDetail: true },
    { value: 'not-yet', label: 'Not yet addressed', needsDetail: true },
  ],
  'Data and privacy': [
    { value: 'local', label: 'Must stay local', needsDetail: false },
    { value: 'depends', label: 'Depends', needsDetail: true },
    { value: 'cloud-ok', label: 'Cloud is fine', needsDetail: false },
  ],
  'Cost': [
    { value: 'acceptable', label: 'Acceptable', needsDetail: false },
    { value: 'review', label: 'Needs review', needsDetail: true },
    { value: 'too-high', label: 'Too expensive', needsDetail: true },
  ],
  'Human checkpoints': [
    { value: 'in-place', label: 'In place', needsDetail: false },
    { value: 'partial', label: 'Partially', needsDetail: true },
    { value: 'not-yet', label: 'Not yet', needsDetail: true },
  ],
  'Error tolerance': [
    { value: 'critical', label: 'No, critical', needsDetail: true },
    { value: 'review', label: 'Needs review', needsDetail: true },
    { value: 'acceptable', label: 'Yes, acceptable', needsDetail: false },
  ],
};

function buildDecisions(redesignData: any): BoundaryDecision[] {
  const decisions: BoundaryDecision[] = [];
  let id = 0;

  if (redesignData.boundaries) {
    redesignData.boundaries.forEach((b: string) => {
      decisions.push({ id: `b-${id++}`, context: b, category: 'Hard rules', choice: '', detail: '' });
    });
  }
  if (redesignData.confidentiality) {
    redesignData.confidentiality.forEach((c: string) => {
      decisions.push({ id: `c-${id++}`, context: c, category: 'Data and privacy', choice: '', detail: '' });
    });
  }
  if (redesignData.costFactors) {
    redesignData.costFactors.forEach((c: string) => {
      decisions.push({ id: `co-${id++}`, context: c, category: 'Cost', choice: '', detail: '' });
    });
  }
  if (redesignData.humanCheckpoints) {
    redesignData.humanCheckpoints.forEach((h: string) => {
      decisions.push({ id: `h-${id++}`, context: h, category: 'Human checkpoints', choice: '', detail: '' });
    });
  }
  if (redesignData.components) {
    redesignData.components.forEach((comp: any) => {
      if (comp.risks && comp.risks.length > 0) {
        comp.risks.forEach((risk: string) => {
          decisions.push({ id: `r-${id++}`, context: `${comp.name}: ${risk}`, category: 'Error tolerance', choice: '', detail: '' });
        });
      }
    });
  }
  return decisions;
}

export default function BoundaryDesigner() {
  const [workflowName, setWorkflowName] = useState('');
  const [decisions, setDecisions] = useState<BoundaryDecision[]>([]);
  const [hasData, setHasData] = useState(false);
  const [needsGeneration, setNeedsGeneration] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [redesignText, setRedesignText] = useState('');

  useEffect(() => {
    const state = loadState();
    setWorkflowName(state.workflow?.name || '');
    if (state.workflow?.steps) setSteps(state.workflow.steps);
    if ((state as any).redesign) setRedesignText((state as any).redesign);

    if ((state as any).boundaryDecisions) {
      setDecisions((state as any).boundaryDecisions);
      setHasData(true);
      return;
    }

    let redesignData = (state as any).redesignData;
    if (!redesignData && state.selectedCase && state.selectedCase !== 'custom') {
      const flagship = flagshipCases.find(c => c.id === state.selectedCase);
      if (flagship) redesignData = flagship.redesignData;
    }

    if (redesignData) {
      const generated = buildDecisions(redesignData);
      setDecisions(generated);
      setHasData(true);
      saveState({ boundaryDecisions: generated } as any);
    } else {
      setNeedsGeneration(true);
    }
  }, []);

  function updateChoice(itemId: string, value: string) {
    const updated = decisions.map(d => d.id === itemId ? { ...d, choice: value, detail: value === d.choice ? d.detail : '' } : d);
    setDecisions(updated);
    saveState({ boundaryDecisions: updated } as any);
  }

  function updateDetail(itemId: string, value: string) {
    const updated = decisions.map(d => d.id === itemId ? { ...d, detail: value } : d);
    setDecisions(updated);
    saveState({ boundaryDecisions: updated } as any);
  }

  async function regenerate() {
    setGenerating(true);
    const result = await analyseWorkflow(workflowName, redesignText, steps);
    if (result) {
      const generated = buildDecisions(result);
      setDecisions(generated);
      setHasData(true);
      setNeedsGeneration(false);
      saveState({
        boundaryDecisions: generated,
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
  }

  if (needsGeneration && !hasData) {
    return (
      <div style={{
        padding: '2rem', border: '2px solid #6830C4', borderRadius: '8px',
        background: 'rgba(104, 48, 196, 0.03)', textAlign: 'center' as const,
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>
          Generate boundary decisions from your design
        </div>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '1.25rem', maxWidth: '550px', margin: '0 auto 1.25rem' }}>
          We will analyse your redesign and generate specific decisions you need to make about boundaries, privacy, cost and human checkpoints.
        </p>
        <button
          onClick={regenerate} disabled={generating}
          style={{
            padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '15px',
            fontFamily: 'inherit', fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
            background: '#6830C4', color: '#fff', border: 'none', opacity: generating ? 0.6 : 1,
          }}
        >
          {generating ? 'Generating...' : 'Generate boundary decisions'}
        </button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', fontSize: '15px', color: '#666', textAlign: 'center' as const }}>
        No design data found. <a href="4-map/" style={{ color: '#6830C4' }}>Complete the Map step</a> first.
      </div>
    );
  }

  const categories = [...new Set(decisions.map(d => d.category))];
  const answered = decisions.filter(d => d.choice).length;

  return (
    <div style={{ marginTop: '1.5rem' }}>

      <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
          <div style={{ fontSize: '15px', color: '#999' }}>{answered} of {decisions.length} decisions made</div>
        </div>
        <button
          onClick={regenerate} disabled={generating}
          style={{
            padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '15px',
            fontFamily: 'inherit', fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
            background: '#fff', color: '#6830C4', border: '1px solid #6830C4', opacity: generating ? 0.6 : 1,
          }}
        >
          {generating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {categories.map(category => {
        const categoryDecisions = decisions.filter(d => d.category === category);
        const options = CATEGORY_OPTIONS[category] || CATEGORY_OPTIONS['Error tolerance'];

        return (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.75rem' }}>{category}</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
              {categoryDecisions.map(item => {
                const selectedOption = options.find(o => o.value === item.choice);
                const showDetail = selectedOption?.needsDetail;

                return (
                  <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '15px', lineHeight: '1.75', marginBottom: '0.75rem' }}>
                      {item.context}
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                      {options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateChoice(item.id, opt.value)}
                          style={{
                            padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '15px',
                            fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                            border: item.choice === opt.value ? '1px solid #6830C4' : '1px solid #e0e0e0',
                            background: item.choice === opt.value ? '#6830C4' : '#fff',
                            color: item.choice === opt.value ? '#fff' : '#666',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {showDetail && item.choice && (
                      <textarea
                        value={item.detail}
                        onInput={(e) => updateDetail(item.id, (e.target as HTMLTextAreaElement).value)}
                        placeholder="Explain..."
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
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
