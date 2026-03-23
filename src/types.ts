export interface WorkflowStep {
  id: string;
  name: string;
  owner?: string;
  inputs?: string[];
  outputs?: string[];
  must_stay_human?: boolean;
  requires_approval?: boolean;
  tags?: string[];
}

export interface QualificationScores {
  business_impact?: number;
  frequency?: number;
  baseline_measurability?: number;
  data_readiness?: number;
  boundary_clarity?: number;
  pilotability?: number;
}

export interface Workflow {
  name: string;
  steps: WorkflowStep[];
  actors: string[];
  data_assets: string[];
  success_metrics: string[];
  qualification?: QualificationScores;
}

export interface WorkflowInput {
  workflow: Workflow;
}

export interface RoadmapPriority {
  id: string;
  title: string;
  time_horizon: string;
  owner: string;
}

export interface ReadinessProfile {
  version?: string;
  org_id?: string;
  assessment_date?: string;
  overall_score: number;
  domain_scores: {
    strategy?: number;
    governance?: number;
    data?: number;
    capability?: number;
    change_readiness?: number;
  };
  required_controls: string[];
  blocked_use_cases: string[];
  roadmap_priorities: RoadmapPriority[];
}

export interface Opportunity {
  step_id: string;
  step_name: string;
  could_automate: boolean;
  should_automate: boolean;
  must_stay_human: boolean;
  rationale: string;
}

export interface OpportunityMap {
  workflow: string;
  generated_at: string;
  opportunities: Opportunity[];
}

export interface ReadinessScore {
  workflow: string;
  overall_score: number;
  domain_scores: Record<string, number>;
  controls_required: string[];
  notes: string[];
}

export interface QualificationResult {
  weighted_score: number;
  criteria: Record<string, { score: number; weight: number; weighted: number }>;
  gates_passed: boolean;
  gate_failures: string[];
  decision: 'proceed' | 'proceed_with_conditions' | 'defer';
}

export interface AssessmentResult {
  map: OpportunityMap;
  eval: ReadinessScore;
  qualification: QualificationResult | null;
  actions_next_30_days: string[];
  partial_allowed_by_default: boolean;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface CliOpts {
  input: string;
  out: string;
  readiness?: string;
  strict: boolean;
}

export interface ParsedArgs {
  _: string[];
  [key: string]: string | boolean | string[];
}
