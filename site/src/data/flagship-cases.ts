export interface FlagshipCase {
  id: string;
  title: string;
  subtitle: string;
  buyer: string;
  context: string;
  workflow: {
    name: string;
    steps: Array<{ id: string; name: string; owner?: string; must_stay_human?: boolean; requires_approval?: boolean; tags?: string[] }>;
    actors: string[];
    data_assets: string[];
    success_metrics: string[];
    qualification: {
      business_impact: number;
      frequency: number;
      baseline_measurability: number;
      data_readiness: number;
      boundary_clarity: number;
      pilotability: number;
    };
  };
}

export const flagshipCases: FlagshipCase[] = [
  {
    id: 'knowledge-alignment',
    title: 'Internal Knowledge Alignment',
    subtitle: 'Help teams find trusted internal knowledge quickly',
    buyer: 'Ops leads',
    context: 'Operational',
    workflow: {
      name: 'internal-knowledge-alignment',
      steps: [
        { id: 's1', name: 'ingest internal sources', owner: 'ops' },
        { id: 's2', name: 'classify and tag by topic', owner: 'ops' },
        { id: 's3', name: 'answer internal questions with citations', owner: 'copilot' },
        { id: 's4', name: 'show owner and active workstream', owner: 'copilot' },
        { id: 's5', name: 'produce weekly alignment brief', owner: 'copilot' },
      ],
      actors: ['ops', 'product-managers', 'team-leads', 'copilot'],
      data_assets: ['docs', 'decision-logs', 'trackers', 'notes'],
      success_metrics: ['time_to_answer', 'citation_accuracy', 'duplicate_reduction'],
      qualification: { business_impact: 4, frequency: 5, baseline_measurability: 4, data_readiness: 3, boundary_clarity: 4, pilotability: 4 },
    },
  },
  {
    id: 'revops-pipeline',
    title: 'RevOps Pipeline',
    subtitle: 'Intelligent lead enrichment and pipeline hygiene',
    buyer: 'CRO / Sales',
    context: 'Revenue',
    workflow: {
      name: 'revops-pipeline',
      steps: [
        { id: 's1', name: 'lead arrives', owner: 'system' },
        { id: 's2', name: 'auto-enrich with company context', owner: 'enrichment' },
        { id: 's3', name: 'score against ICP criteria', owner: 'scoring' },
        { id: 's4', name: 'route to correct rep', owner: 'ops' },
        { id: 's5', name: 'monitor CRM hygiene', owner: 'ops' },
        { id: 's6', name: 'generate pipeline health summary', owner: 'reporting' },
      ],
      actors: ['sdr', 'ae', 'ops', 'system', 'enrichment', 'scoring', 'reporting'],
      data_assets: ['crm-records', 'lead-data', 'company-data', 'pipeline-metrics'],
      success_metrics: ['enrichment_completeness', 'time_to_first_action', 'crm_accuracy', 'forecast_accuracy'],
      qualification: { business_impact: 5, frequency: 5, baseline_measurability: 4, data_readiness: 4, boundary_clarity: 4, pilotability: 4 },
    },
  },
  {
    id: 'creative-content',
    title: 'Creative Content Versioning',
    subtitle: 'Turn one idea into channel-specific, brand-consistent variants',
    buyer: 'Marketing',
    context: 'Creative',
    workflow: {
      name: 'creative-content-versioning',
      steps: [
        { id: 's1', name: 'ingest campaign brief', owner: 'content-lead' },
        { id: 's2', name: 'generate master content structure', owner: 'generator' },
        { id: 's3', name: 'generate channel variants', owner: 'generator' },
        { id: 's4', name: 'generate aligned image assets', owner: 'generator' },
        { id: 's5', name: 'review and approval', owner: 'content-lead', requires_approval: true },
        { id: 's6', name: 'produce publish pack with version tags', owner: 'system' },
      ],
      actors: ['content-lead', 'creative-strategist', 'designer', 'generator', 'system'],
      data_assets: ['campaign-briefs', 'brand-guidelines', 'asset-library', 'channel-specs'],
      success_metrics: ['cycle_time', 'consistency_score', 'approval_rate', 'asset_reuse'],
      qualification: { business_impact: 4, frequency: 4, baseline_measurability: 4, data_readiness: 3, boundary_clarity: 4, pilotability: 5 },
    },
  },
  {
    id: 'cfo-intelligence',
    title: 'CFO Financial Intelligence',
    subtitle: 'Faster, more trusted financial reporting with hard boundaries',
    buyer: 'CFO / Finance',
    context: 'Finance',
    workflow: {
      name: 'cfo-financial-intelligence',
      steps: [
        { id: 's1', name: 'pull actuals and pipeline data', owner: 'data-mcp' },
        { id: 's2', name: 'run deterministic forecast calculations', owner: 'calculator-mcp' },
        { id: 's3', name: 'scan unstructured sources for signals', owner: 'signal-scanner' },
        { id: 's4', name: 'generate narrative commentary', owner: 'narrative-mcp' },
        { id: 's5', name: 'assemble reporting pack', owner: 'system' },
        { id: 's6', name: 'human approval gate', owner: 'cfo', must_stay_human: true, requires_approval: true },
        { id: 's7', name: 'export approved pack', owner: 'system' },
      ],
      actors: ['data-mcp', 'calculator-mcp', 'signal-scanner', 'narrative-mcp', 'system', 'cfo', 'fpa-analyst'],
      data_assets: ['crm-pipeline', 'erp-actuals', 'billing-data', 'call-transcripts', 'deal-notes'],
      success_metrics: ['cycle_time_reduction', 'assembly_automation', 'forecast_accuracy', 'signals_surfaced', 'analyst_time_reclaimed'],
      qualification: { business_impact: 5, frequency: 4, baseline_measurability: 5, data_readiness: 4, boundary_clarity: 5, pilotability: 3 },
    },
  },
];
