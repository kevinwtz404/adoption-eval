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
}

const defaultState: AppState = {
  workflow: null,
  qualification: null,
  selectedCase: null,
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
