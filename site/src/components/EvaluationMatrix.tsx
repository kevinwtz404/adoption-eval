import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';

interface Dimension {
  id: string;
  name: string;
  question: string;
  baseline: string;
  result: string;
  direction: string;
  notes: string;
}

const DIMENSIONS: Dimension[] = [
  { id: 'time', name: 'Time', question: 'Did the workflow get faster? Measure cycle time end-to-end, not just the automated steps.', baseline: '', result: '', direction: '', notes: '' },
  { id: 'cost', name: 'Cost', question: 'What did the pilot cost to run (API calls, tools, setup time) vs what did it save?', baseline: '', result: '', direction: '', notes: '' },
  { id: 'quality', name: 'Quality', question: 'Is the output better or worse? Measure accuracy, consistency, error rate. Ask the people who use the output.', baseline: '', result: '', direction: '', notes: '' },
  { id: 'risk', name: 'Risk', question: 'Did the pilot increase or decrease operational risk? Were there boundary violations, near-misses or unexpected behaviours?', baseline: '', result: '', direction: '', notes: '' },
  { id: 'adoption', name: 'Adoption', question: 'Did the team actually use it? Was there friction? Did people trust it, work around it or ignore it?', baseline: '', result: '', direction: '', notes: '' },
  { id: 'control', name: 'Control', question: 'Can you trace what the system did and why? Can you audit it? Do you trust the boundaries held?', baseline: '', result: '', direction: '', notes: '' },
];

export default function EvaluationMatrix() {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [workflowName, setWorkflowName] = useState('');

  useEffect(() => {
    const state = loadState();
    setWorkflowName(state.workflow?.name || '');
    if ((state as any).evaluation) {
      setDimensions((state as any).evaluation);
    } else {
      setDimensions(DIMENSIONS.map(d => ({ ...d })));
    }
  }, []);

  function update(id: string, field: keyof Dimension, value: string) {
    const updated = dimensions.map(d => d.id === id ? { ...d, [field]: value } : d);
    setDimensions(updated);
    saveState({ evaluation: updated } as any);
  }

  const measured = dimensions.filter(d => d.direction).length;

  return (
    <div style={{ marginTop: '1.5rem' }}>

      <div style={{ padding: '1.25rem', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fafafa', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{workflowName}</div>
          <div style={{ fontSize: '15px', color: '#999' }}>{measured} of {dimensions.length} dimensions evaluated</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
        {dimensions.map(dim => (
          <div key={dim.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.25rem' }}>{dim.name}</div>
            <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.75', marginBottom: '0.75rem' }}>{dim.question}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.25rem' }}>Before (baseline)</label>
                <input type="text" value={dim.baseline}
                  onInput={(e) => update(dim.id, 'baseline', (e.target as HTMLInputElement).value)}
                  placeholder="e.g. 5 days cycle time"
                  style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.25rem' }}>After (result)</label>
                <input type="text" value={dim.result}
                  onInput={(e) => update(dim.id, 'result', (e.target as HTMLInputElement).value)}
                  placeholder="e.g. 2.5 days cycle time"
                  style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.25rem' }}>Direction</label>
              <div style={{ display: 'inline-flex', border: '1px solid #e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                {['improved', 'neutral', 'declined'].map((val, vi) => (
                  <button key={val}
                    onClick={() => update(dim.id, 'direction', val)}
                    style={{
                      padding: '0.375rem 0.75rem', fontSize: '15px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
                      border: 'none', borderRight: vi < 2 ? '1px solid #e0e0e0' : 'none',
                      background: dim.direction === val ? (val === 'improved' ? '#166534' : val === 'declined' ? '#991b1b' : '#854d0e') : '#fff',
                      color: dim.direction === val ? '#fff' : '#666',
                    }}>
                    {val === 'improved' ? 'Improved' : val === 'neutral' ? 'Neutral' : 'Declined'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginBottom: '0.25rem' }}>Notes</label>
              <input type="text" value={dim.notes}
                onInput={(e) => update(dim.id, 'notes', (e.target as HTMLInputElement).value)}
                placeholder="What explains this result?"
                style={{ width: '100%', padding: '0.375rem 0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '15px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
