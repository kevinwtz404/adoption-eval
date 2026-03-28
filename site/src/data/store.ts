const STORAGE_KEY = 'adoption-eval-state';

export interface AppState {
  workflow: {
    name: string;
    steps: Array<{
      id: string;
      name: string;
      owner?: string;
      must_stay_human?: boolean;
      requires_approval?: boolean;
      tags?: string[];
    }>;
    actors: string[];
    data_assets: string[];
    success_metrics: string[];
  } | null;
  qualification: {
    business_impact: number;
    frequency: number;
    baseline_measurability: number;
    data_readiness: number;
    boundary_clarity: number;
    pilotability: number;
  } | null;
  selectedCase: string | null;
  mappings: Record<string, { level: number; paradigm: string | null }> | null;
  redesign: string | null;
  redesignData: {
    components: Array<{ name: string; type: string; description: string; risks: string[]; considerations: string[] }>;
    boundaries: string[];
    confidentiality: string[];
    costFactors: string[];
    humanCheckpoints: string[];
  } | null;
  designs: Record<string, { isCandidate: boolean; description: string; notes: string }> | null;
  boundaries: Record<string, Array<{ id: string; text: string; category: string; checked: boolean; notes: string }>> | null;
  boundaryDecisions: any[] | null;
  pilotPlan: { scope: string; successCriteria: string; stopCriteria: string; timeline: string; owner: string } | null;
  evaluation: any[] | null;
  simplifiedInputs: {
    systemsStack: string[];
    technicalCapacity: 'no-developers' | 'some-technical' | 'dedicated-dev' | null;
    budgetBand: '<500' | '500-2k' | '2k-5k' | '5k+' | null;
    buildPreference: 'existing-tools' | 'open-to-custom' | 'no-preference' | null;
  } | null;
  playbook: {
    decision: 'go' | 'not-yet' | 'no-go' | null;
    costRange: string | null;
    sections: {
      whatWereTesting: string | null;
      howItWorks: string | null;
      guardrails: string[] | null;
      risksAndMitigations: Array<{ risk: string; mitigation: string }> | null;
      twoWeekPlan: string | null;
      stopCriteria: string[] | null;
      whatTheTeamNeedsToKnow: string | null;
      howWellMeasure: string | null;
    } | null;
  } | null;
}

const defaultState: AppState = {
  workflow: null,
  qualification: null,
  selectedCase: null,
  redesign: null,
  redesignData: null,
  mappings: null,
  designs: null,
  boundaries: null,
  boundaryDecisions: null,
  pilotPlan: null,
  evaluation: null,
  simplifiedInputs: null,
  playbook: null,
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: Partial<AppState>): void {
  if (typeof window === 'undefined') return;
  const current = loadState();
  const merged = { ...current, ...state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
