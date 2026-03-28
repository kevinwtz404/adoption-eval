import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { loadState, saveState } from '../data/store';

const SYSTEMS = [
  { id: 'google-workspace', label: 'Google Workspace' },
  { id: 'microsoft-365', label: 'Microsoft 365' },
  { id: 'salesforce', label: 'Salesforce' },
  { id: 'hubspot', label: 'HubSpot' },
  { id: 'slack', label: 'Slack' },
  { id: 'pantheos-ai', label: 'Pantheos AI' },
  { id: 'jira', label: 'Jira' },
  { id: 'notion', label: 'Notion' },
  { id: 'xero', label: 'Xero' },
  { id: 'quickbooks', label: 'QuickBooks' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'zendesk', label: 'Zendesk' },
] as const;

const TECH_CAPACITY = [
  { id: 'no-developers', label: 'No developers', description: 'We rely on off-the-shelf tools and external help' },
  { id: 'some-technical', label: 'Some technical staff', description: 'We have people who can configure tools and write basic scripts' },
  { id: 'dedicated-dev', label: 'Dedicated dev team', description: 'We have developers who can build and maintain custom solutions' },
] as const;

const BUDGET_BANDS = [
  { id: '<100', label: 'Under $100' },
  { id: '100-500', label: '$100 - $500' },
  { id: '500-2k', label: '$500 - $2,000' },
  { id: '2k+', label: '$2,000+' },
] as const;

const BUILD_PREFS = [
  { id: 'existing-tools', label: 'Prefer existing tools', description: 'Use platforms and services that already exist' },
  { id: 'open-to-custom', label: 'Open to custom build', description: 'Willing to invest in something purpose-built' },
  { id: 'no-preference', label: 'No preference', description: 'Let the problem decide the approach' },
] as const;

interface Props {
  section: 'context' | 'cost';
}

export default function SimplifiedInputs({ section }: Props) {
  const [systemsStack, setSystemsStack] = useState<string[]>([]);
  const [customSystems, setCustomSystems] = useState<string[]>([]);
  const [newCustom, setNewCustom] = useState('');
  const [technicalCapacity, setTechnicalCapacity] = useState<string | null>(null);
  const [budgetBand, setBudgetBand] = useState<string | null>(null);
  const [buildPreference, setBuildPreference] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state.simplifiedInputs) {
      const all = state.simplifiedInputs.systemsStack || [];
      setSystemsStack(all);
      // Separate known from custom
      const custom = all.filter((s: string) => !SYSTEMS.some(sys => sys.id === s));
      setCustomSystems(custom);
      setTechnicalCapacity(state.simplifiedInputs.technicalCapacity || null);
      setBudgetBand(state.simplifiedInputs.budgetBand || null);
      setBuildPreference(state.simplifiedInputs.buildPreference || null);
      // If anything is already filled, show as saved
      if (all.length > 0 || state.simplifiedInputs.technicalCapacity || state.simplifiedInputs.budgetBand) {
        setSaved(true);
      }
    }
  }, []);

  function persist(updates: Record<string, any>) {
    const state = loadState();
    const current = state.simplifiedInputs || {
      systemsStack: [],
      technicalCapacity: null,
      budgetBand: null,
      buildPreference: null,
    };
    saveState({ simplifiedInputs: { ...current, ...updates } });
    setSaved(false);
  }

  function toggleSystem(id: string) {
    const next = systemsStack.includes(id)
      ? systemsStack.filter(s => s !== id)
      : [...systemsStack, id];
    setSystemsStack(next);
    persist({ systemsStack: [...next.filter(s => SYSTEMS.some(sys => sys.id === s)), ...customSystems] });
  }

  function addCustomSystem() {
    const value = newCustom.trim();
    if (!value || customSystems.includes(value)) return;
    const nextCustom = [...customSystems, value];
    setCustomSystems(nextCustom);
    setNewCustom('');
    const knownSelected = systemsStack.filter(s => SYSTEMS.some(sys => sys.id === s));
    const allSystems = [...knownSelected, ...nextCustom];
    setSystemsStack(allSystems);
    persist({ systemsStack: allSystems });
  }

  function removeCustomSystem(value: string) {
    const nextCustom = customSystems.filter(s => s !== value);
    setCustomSystems(nextCustom);
    const knownSelected = systemsStack.filter(s => SYSTEMS.some(sys => sys.id === s));
    const allSystems = [...knownSelected, ...nextCustom];
    setSystemsStack(allSystems);
    persist({ systemsStack: allSystems });
  }

  function selectTechCapacity(id: string) {
    setTechnicalCapacity(id);
    persist({ technicalCapacity: id });
  }

  function selectBudget(id: string) {
    setBudgetBand(id);
    persist({ budgetBand: id });
  }

  function selectBuildPref(id: string) {
    setBuildPreference(id);
    persist({ buildPreference: id });
  }

  function handleSave() {
    setSaved(true);
  }

  if (section === 'context') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            What systems are involved in this workflow?
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Select all that touch this process. Add any that are missing.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SYSTEMS.map(sys => (
              <button
                key={sys.id}
                onClick={() => toggleSystem(sys.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: `1px solid ${systemsStack.includes(sys.id) ? 'var(--purple)' : 'var(--border)'}`,
                  background: systemsStack.includes(sys.id) ? 'var(--purple)' : 'var(--bg-card)',
                  color: systemsStack.includes(sys.id) ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: 'all 0.15s',
                }}
              >
                {sys.label}
              </button>
            ))}
            {customSystems.map(cs => (
              <button
                key={cs}
                onClick={() => removeCustomSystem(cs)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--purple)',
                  background: 'var(--purple)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                {cs} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>✕</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add a system..."
              value={newCustom}
              onInput={(e) => setNewCustom((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => { if ((e as KeyboardEvent).key === 'Enter') addCustomSystem(); }}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontFamily: "'IBM Plex Mono', monospace",
                width: '100%',
                maxWidth: '250px',
              }}
            />
            <button
              onClick={addCustomSystem}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                color: 'var(--text-light)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap' as const,
              }}
            >
              + Add
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Technical capacity
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            This shapes the build approach and how much support the pilot needs.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TECH_CAPACITY.map(opt => (
              <button
                key={opt.id}
                onClick={() => selectTechCapacity(opt.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: `1px solid ${technicalCapacity === opt.id ? 'var(--purple)' : 'var(--border)'}`,
                  background: technicalCapacity === opt.id ? 'rgba(104, 48, 196, 0.05)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</span>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div style={{ paddingTop: '0.5rem' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              background: saved ? 'var(--success)' : 'var(--purple)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // section === 'cost'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Budget band
        </h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Total budget for a 2-week pilot, including tools and API costs.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {BUDGET_BANDS.map(opt => (
            <button
              key={opt.id}
              onClick={() => selectBudget(opt.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${budgetBand === opt.id ? 'var(--purple)' : 'var(--border)'}`,
                background: budgetBand === opt.id ? 'var(--purple)' : 'var(--bg-card)',
                color: budgetBand === opt.id ? 'white' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: "'IBM Plex Mono', monospace",
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Build preference
        </h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          How do you want the pilot built?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {BUILD_PREFS.map(opt => (
            <button
              key={opt.id}
              onClick={() => selectBuildPref(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${buildPreference === opt.id ? 'var(--purple)' : 'var(--border)'}`,
                background: buildPreference === opt.id ? 'rgba(104, 48, 196, 0.05)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem', marginTop: '0.125rem' }}>{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ paddingTop: '0.5rem' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            background: saved ? 'var(--success)' : 'var(--purple)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
