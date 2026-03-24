import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import type { FlagshipCase } from '../data/flagship-cases';

export default function CaseSelector() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPain, setCustomPain] = useState('');
  const [customSteps, setCustomSteps] = useState([{ id: 's1', name: '', owner: '' }]);

  useEffect(() => {
    const state = loadState();
    if (state.selectedCase) setSelectedId(state.selectedCase);
  }, []);

  function selectCase(c: FlagshipCase) {
    setSelectedId(c.id);
    setShowCustom(false);
    saveState({
      selectedCase: c.id,
      workflow: c.workflow,
      qualification: c.workflow.qualification,
      redesign: c.redesign || '',
      redesignData: c.redesignData || null,
    } as any);
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function addStep() {
    setCustomSteps([...customSteps, { id: `s${customSteps.length + 1}`, name: '', owner: '' }]);
  }

  function removeStep(idx: number) {
    if (customSteps.length <= 1) return;
    setCustomSteps(customSteps.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, field: string, value: string) {
    const updated = [...customSteps];
    (updated[idx] as any)[field] = value;
    setCustomSteps(updated);
  }

  function saveCustom() {
    if (!customName.trim()) return;
    const workflow = {
      name: customName.trim(),
      steps: customSteps.filter(s => s.name.trim()).map((s, i) => ({ id: s.id || `s${i+1}`, name: s.name.trim(), owner: s.owner.trim() || undefined })),
      actors: [...new Set(customSteps.map(s => s.owner.trim()).filter(Boolean))],
      data_assets: [],
      success_metrics: [],
    };
    setSelectedId('custom');
    saveState({ selectedCase: 'custom', workflow, qualification: null });
  }

  const expanded = expandedId ? flagshipCases.find(c => c.id === expandedId) : null;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
        {flagshipCases.map(c => (
          <div
            key={c.id}
            style={{
              border: `1px solid ${selectedId === c.id ? '#6830C4' : '#e0e0e0'}`,
              borderRadius: '8px',
              background: selectedId === c.id ? 'rgba(104, 48, 196, 0.04)' : '#fff',
              padding: '1.25rem',
              boxShadow: selectedId === c.id ? '0 0 0 2px rgba(104, 48, 196, 0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column' as const,
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{c.title}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '0.125rem' }}>{c.subtitle}</div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '100px',
                  background: 'rgba(104, 48, 196, 0.08)',
                  color: '#6830C4',
                  whiteSpace: 'nowrap' as const,
                  marginLeft: '0.75rem',
                }}>{c.context}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '0.75rem' }}>
                Buyer: {c.buyer}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => toggleExpand(c.id)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.75rem',
                  fontSize: '13px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  background: expandedId === c.id ? '#f3f4f6' : '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: '#333',
                }}
              >
                {expandedId === c.id ? 'Close' : 'Learn more'}
              </button>
              <button
                onClick={() => selectCase(c)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '13px',
                  border: selectedId === c.id ? '1px solid #6830C4' : '1px solid #e0e0e0',
                  borderRadius: '6px',
                  background: selectedId === c.id ? '#6830C4' : '#fff',
                  color: selectedId === c.id ? '#fff' : '#6830C4',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                {selectedId === c.id ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {expanded && (
        <div style={{
          marginTop: '1rem',
          padding: '1.5rem',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          background: '#fff',
          fontSize: '14px',
          lineHeight: '1.75',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1rem' }}>{expanded.title}</h3>

          <p style={{ marginBottom: '1.25em' }}><strong>The pain point:</strong> {expanded.painPoint}</p>
          <p style={{ marginBottom: '1.25em' }}><strong>How it was discovered:</strong> {expanded.discoveryMethod}</p>
          <p style={{ marginBottom: '1.25em' }}><strong>Why AI specifically:</strong> {expanded.whyAI}</p>

          <p style={{ marginBottom: '0.5em' }}><strong>Current workflow steps:</strong></p>
          <div style={{ marginBottom: '1.25em' }}>
            {expanded.workflow.steps.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.5rem 0',
                borderBottom: i < expanded.workflow.steps.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                <span style={{ color: '#999', fontSize: '12px', minWidth: '1.5em', flexShrink: 0, paddingTop: '2px' }}>{i + 1}</span>
                <div>
                  <div>{s.name}{s.owner ? <span style={{ color: '#999' }}> ({s.owner})</span> : ''}</div>
                  {(s as any).pain && <div style={{ color: '#999', fontSize: '12px', marginTop: '0.125rem' }}>Pain: {(s as any).pain}</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => selectCase(expanded)}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '14px',
                border: selectedId === expanded.id ? '1px solid #6830C4' : '1px solid #e0e0e0',
                borderRadius: '6px',
                background: selectedId === expanded.id ? '#6830C4' : '#fff',
                color: selectedId === expanded.id ? '#fff' : '#6830C4',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              {selectedId === expanded.id ? '✓ Selected' : 'Select this workflow'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <div
          onClick={() => { setShowCustom(!showCustom); setExpandedId(null); }}
          style={{
            border: `1px solid ${selectedId === 'custom' ? '#6830C4' : '#e0e0e0'}`,
            borderRadius: '8px',
            padding: '1.25rem',
            cursor: 'pointer',
            background: selectedId === 'custom' ? 'rgba(104, 48, 196, 0.04)' : '#fff',
            boxShadow: selectedId === 'custom' ? '0 0 0 2px rgba(104, 48, 196, 0.15)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#999' }}>+</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Enter your own</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Define a custom workflow to assess</div>
            </div>
          </div>
        </div>

        {showCustom && (
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            background: '#fff',
            fontSize: '14px',
            lineHeight: '1.75',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.5rem' }}>Describe your workflow</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.25rem' }}>
              Describe the process as it works today. Don't worry about AI or solutions yet. Just describe what happens, who does it and where it hurts.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '13px' }}>What is the process?</label>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '0.375rem' }}>Give it a short name, e.g. "monthly reporting" or "handling inbound leads"</p>
              <input
                type="text"
                value={customName}
                placeholder="e.g. Monthly financial reporting"
                onInput={(e) => setCustomName((e.target as HTMLInputElement).value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '13px' }}>What's the pain?</label>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '0.375rem' }}>What goes wrong, what takes too long, what's frustrating about this process?</p>
              <textarea
                value={customPain}
                placeholder="e.g. We spend 2 days every month pulling data from 4 different systems and reconciling it in a spreadsheet"
                onInput={(e) => setCustomPain((e.target as HTMLTextAreaElement).value)}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' as const }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '13px' }}>What are the steps today?</label>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '0.375rem' }}>Describe the steps as they happen today, not how you want them to work. Include who does each step. The roles will be used later in the guide.</p>
              {customSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#999', fontSize: '12px', minWidth: '1.5em' }}>{i + 1}</span>
                  <input
                    type="text"
                    placeholder="What happens at this step?"
                    value={step.name}
                    onInput={(e) => updateStep(i, 'name', (e.target as HTMLInputElement).value)}
                    style={{ flex: 2, padding: '0.4rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Who does it?"
                    value={step.owner}
                    onInput={(e) => updateStep(i, 'owner', (e.target as HTMLInputElement).value)}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '13px' }}
                  />
                  <button
                    onClick={() => removeStep(i)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: '1rem', padding: '0.25rem' }}
                  >×</button>
                </div>
              ))}
              <button
                onClick={addStep}
                style={{ fontSize: '13px', color: '#6830C4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >+ Add step</button>
            </div>

            <button
              onClick={saveCustom}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '14px',
                background: '#6830C4',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >Save & Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}
