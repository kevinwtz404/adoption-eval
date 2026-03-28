import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { loadState, saveState } from '../data/store';
import { flagshipCases } from '../data/flagship-cases';
import { calculateDecision } from '../data/playbookGenerator';
import { generatePlaybook } from '../data/gemini-playbook';
import type { PlaybookContent } from '../data/gemini-playbook';
import type { PlaybookDecision } from '../data/playbookGenerator';
import LoadingDots from './LoadingDots';

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.0625rem;font-weight:600;margin:1.25em 0 0.5em;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.25rem;font-weight:600;margin:1.25em 0 0.5em;">$2</h2>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul style="padding-left:1.5rem;margin:0.5em 0;">${match}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin-top:0.75em;">')
    .replace(/\n/g, ' ')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

const DECISION_CONFIG: Record<PlaybookDecision, { label: string; color: string; bg: string }> = {
  'go': { label: 'Go', color: '#166534', bg: '#dcfce7' },
  'not-yet': { label: 'Not yet', color: '#92400e', bg: '#fef3c7' },
  'no-go': { label: 'No-go', color: '#991b1b', bg: '#fee2e2' },
};

const TECH_LABELS: Record<string, string> = {
  'no-developers': 'No developers',
  'some-technical': 'Some technical staff',
  'dedicated-dev': 'Dedicated dev team',
};

export default function PilotPlaybook() {
  const [decision, setDecision] = useState<PlaybookDecision>('not-yet');
  const [content, setContent] = useState<PlaybookContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [techCapacity, setTechCapacity] = useState('');
  const [costRange, setCostRange] = useState('');
  const playbookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = loadState();
    setWorkflowName(state.workflow?.name || '');
    setIsCustom(state.selectedCase === 'custom');

    // Calculate decision
    const d = calculateDecision(state.qualification, state.boundaryDecisions);
    setDecision(d);

    const inputs = state.simplifiedInputs;
    setTechCapacity(inputs?.technicalCapacity ? TECH_LABELS[inputs.technicalCapacity] || inputs.technicalCapacity : '');

    // For flagship cases, use hand-authored playbook content
    if (state.selectedCase && state.selectedCase !== 'custom') {
      const fc = flagshipCases.find(c => c.id === state.selectedCase);
      if (fc && fc.playbookContent) {
        setContent(fc.playbookContent);
        setCostRange(fc.playbookContent.costRange);
      }
    }

    // For custom workflows, check if we have saved playbook content
    if (state.selectedCase === 'custom' && state.playbook?.sections) {
      setContent(state.playbook.sections as any);
      setCostRange(state.playbook.costRange || '');
    }
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const state = loadState();
      const result = await generatePlaybook(
        state.workflow?.name || 'Custom workflow',
        state.workflow?.steps?.[0]?.pain || '',
        state.redesign || '',
        state.redesignData?.components || [],
        state.boundaryDecisions || [],
        state.simplifiedInputs || { systemsStack: [], technicalCapacity: null, budgetBand: null, buildPreference: null },
        state.workflow?.steps || [],
        state.workflow?.actors || [],
      );
      if (result) {
        setContent(result);
        setCostRange(result.costRange);
        saveState({
          playbook: {
            decision,
            costRange: result.costRange,
            sections: result,
          },
        });
      } else {
        setError('Could not generate playbook. Check that earlier steps are complete.');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Rate limit')) {
        setError('Rate limit reached. Try again in a few minutes.');
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleExportPDF() {
    if (!playbookRef.current) return;
    // Load html2pdf dynamically at runtime (browser-only)
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) {
      // Load the script on first use
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.head.appendChild(script);
      });
    }
    (window as any).html2pdf()
      .from(playbookRef.current)
      .set({
        margin: [12, 12, 12, 12],
        filename: `pilot-playbook-${workflowName.replace(/\s+/g, '-').toLowerCase() || 'custom'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: '.no-break' },
      })
      .save();
  }

  const cfg = DECISION_CONFIG[decision];

  // --- Empty state for custom workflows ---
  if (isCustom && !content && !generating) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <button
          onClick={handleGenerate}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--purple)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Generate pilot playbook
        </button>
        {error && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <LoadingDots label="Generating your pilot playbook" />
      </div>
    );
  }

  if (!content) return null;

  return (
    <div>
      {/* Playbook content */}
      <div ref={playbookRef} style={{ background: 'white' }}>
        {/* Dashboard cards */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 200px',
            padding: '1.5rem',
            borderRadius: '8px',
            background: cfg.bg,
            textAlign: 'center',
          }}>
            <div class="result-badge" style={{ color: cfg.color }}>{cfg.label}</div>
            <div class="ui-label" style={{ color: cfg.color, marginTop: '0.25rem' }}>Pilot decision</div>
          </div>
          <div style={{
            flex: '1 1 150px',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div class="font-mono" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{costRange || 'TBD'}</div>
            <div class="ui-label" style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Cost range</div>
          </div>
          <div style={{
            flex: '1 1 150px',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>2 weeks</div>
            <div class="ui-label" style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Timeline</div>
          </div>
          {techCapacity && (
            <div style={{
              flex: '1 1 150px',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{techCapacity}</div>
              <div class="ui-label" style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Tech capacity</div>
            </div>
          )}
        </div>

        {/* 1. What we're testing */}
        <Section title="What we're testing">
          <p>{content.whatWereTesting}</p>
        </Section>

        {/* 2. How it works */}
        <Section title="How it works">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content.howItWorks) }} />
        </Section>

        {/* 3. Guardrails */}
        <Section title="Guardrails">
          <ul>
            {content.guardrails.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </Section>

        {/* 4. Risks and mitigations */}
        <Section title="Risks and mitigations">
          {content.risksAndMitigations.map((r, i) => (
            <div key={i} class="no-break" style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#fafafa', borderRadius: '6px', borderLeft: '3px solid var(--purple)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Risk: {r.risk}</div>
              <div style={{ color: 'var(--text-light)' }}>Mitigation: {r.mitigation}</div>
            </div>
          ))}
        </Section>

        {/* 5. 2-week trial plan */}
        <Section title="2-week trial plan" pageBreak>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content.twoWeekPlan) }} />
        </Section>

        {/* 6. Stop criteria */}
        <Section title="Stop criteria">
          <ul>
            {content.stopCriteria.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Section>

        {/* 7. What the team needs to know */}
        <Section title="What the team needs to know">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content.whatTheTeamNeedsToKnow) }} />
        </Section>

        {/* 8. How we'll measure success */}
        <Section title="How we'll measure success" pageBreak>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content.howWellMeasure) }} />
        </Section>
      </div>

      {/* Export button */}
      <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleExportPDF}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--purple)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Download as PDF
        </button>
        {isCustom && (
          <button
            onClick={handleGenerate}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              color: 'var(--purple)',
              border: '1px solid var(--purple)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginLeft: '0.75rem',
            }}
          >
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
}

// --- Section component ---

function Section({ title, children, pageBreak }: { title: string; children: preact.ComponentChildren; pageBreak?: boolean }) {
  return (
    <div style={{
      marginBottom: '2rem',
      ...(pageBreak ? { breakBefore: 'page' as const } : {}),
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>{title}</h2>
      {children}
    </div>
  );
}

