export interface FlagshipCase {
  id: string;
  title: string;
  subtitle: string;
  buyer: string;
  context: string;
  painPoint: string;
  discoveryMethod: string;
  whyAI: string;
  redesign: string;
  workflow: {
    name: string;
    steps: Array<{ id: string; name: string; owner?: string; pain?: string }>;
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
    title: 'Finding internal answers',
    subtitle: 'Teams waste hours searching for information that already exists somewhere',
    buyer: 'Ops leads',
    context: 'Operational',
    painPoint: 'Knowledge is fragmented across docs, chats, wikis and project tools. People use different terms for the same concepts, duplicate work because they cannot find what already exists and lose context on why decisions were made. Ops leads reported spending 5-6 hours per week manually answering the same questions from different people.',
    discoveryMethod: 'Champion workshops with ops and product leads surfaced repeated alignment pain. Workplace shadowing showed staff checking 3-5 different tools before finding a trusted answer. Time-spend analysis confirmed the scale: senior staff were spending significant time as informal help desks.',
    whyAI: 'This is a retrieval and synthesis problem across mixed unstructured sources. AI can improve speed and consistency of finding answers while keeping strategic judgement with humans. The key question is how much of the retrieval and summarisation can be automated without losing accuracy or leaking sensitive information.',
    redesign: `Someone asks a question through a single interface (chat, Slack command or internal tool). A RAG system searches all internal sources (docs, wikis, decision logs, project trackers, Slack messages) and generates an answer with citations showing where each piece of information came from.

If the system is confident in the answer, it shows it directly. If confidence is low or the question is ambiguous, it escalates to a person and shows what it found so far.

Every answer (whether from the system or a person) is captured and becomes searchable. When the same question comes up again, the existing answer surfaces first.

A weekly alignment summary is generated automatically from recent decisions, document changes and ownership updates. The ops lead reviews and edits the summary before sharing it, replacing or shortening the weekly sync meeting.

Access control must respect existing document permissions. Not everyone should be able to look up everything. The system must only surface documents the person asking is allowed to see.`,
    workflow: {
      name: 'finding-internal-answers',
      steps: [
        { id: 's1', name: 'Someone has a question about a project, process or decision', owner: 'any team member', pain: 'No clear place to start looking' },
        { id: 's2', name: 'Search across docs, wikis, Slack, email and project tools', owner: 'any team member', pain: 'Information scattered across 3-5 tools, inconsistent naming' },
        { id: 's3', name: 'Ask a colleague who might know', owner: 'any team member', pain: 'Interrupts the colleague, answer depends on who you ask' },
        { id: 's4', name: 'Piece together an answer from multiple sources', owner: 'any team member', pain: 'Time-consuming, no way to verify completeness' },
        { id: 's5', name: 'Share the answer with the person who asked', owner: 'senior staff / ops lead', pain: 'Answer not captured for next time, same question will come up again' },
        { id: 's6', name: 'Weekly team alignment meeting to sync on who owns what', owner: 'ops lead', pain: 'Meeting is long, not everyone has context, decisions get lost in notes' },
      ],
      actors: ['team members', 'ops leads', 'product managers', 'team leads'],
      data_assets: ['internal docs', 'decision logs', 'project trackers', 'Slack messages', 'meeting notes'],
      success_metrics: ['time_to_answer', 'duplicate_question_rate', 'team_alignment_confidence'],
      qualification: { business_impact: 4, frequency: 5, baseline_measurability: 4, data_readiness: 3, boundary_clarity: 4, pilotability: 4 },
    },
  },
  {
    id: 'revops-pipeline',
    title: 'CRM data chaos',
    subtitle: 'Lead data spread across tools, manual enrichment and stale records',
    buyer: 'CRO / Sales leadership',
    context: 'Revenue',
    painPoint: 'Sales teams use 3-4 different tools that all partially enrich lead data. Reps manually copy information between platforms, re-enter the same data in multiple places and spend hours each week on CRM hygiene instead of selling. Enrichment tools overlap but none gives a complete picture. Forecast confidence drops because records are stale or contradictory.',
    discoveryMethod: 'Champion workshops with RevOps and sales managers. Tech stack audit revealed three overlapping enrichment tools with manual integration between them. Workplace shadowing showed AEs spending 30-40 minutes per lead on copy-paste enrichment cycles. Pipeline review flagged stale fields and data conflicts between tools.',
    whyAI: 'AI can help consolidate and normalise data across fragmented sources and surface hygiene problems automatically. But the question is where human judgement must stay: outreach decisions, relationship context, pricing and forecast sign-off all require people. The challenge is finding the right boundary between automated data management and human decision-making.',
    redesign: `When a new lead arrives, the system automatically enriches it by pulling from multiple sources (LinkedIn, company website, news, existing CRM data) and consolidating everything into a single, complete profile. This uses API calls for structured data and an LLM to summarise unstructured findings like recent news or social posts.

The enriched data is written once to all systems (CRM and the two other tools) via API calls. Format differences are handled by deterministic transformation rules so data is consistent everywhere.

Lead qualification against ICP criteria is applied consistently using rules-based scoring. Every lead gets scored the same way, removing the inconsistency of each SDR applying criteria differently.

The handoff from SDR to AE is a structured summary generated automatically from the enriched data and qualification notes. This replaces informal Slack messages with a consistent, searchable format that includes everything the AE needs.

CRM hygiene runs continuously in the background: flagging stale fields, detecting data conflicts between tools and surfacing records that need attention. This replaces the weekly manual check.

The sales manager reviews pipeline with higher confidence because the underlying data is more complete and current. Outreach, relationship decisions, pricing and forecast sign-off all stay fully with people.`,
    workflow: {
      name: 'crm-data-chaos',
      steps: [
        { id: 's1', name: 'New lead arrives from marketing or inbound', owner: 'system / marketing', pain: 'Lead data is minimal, often just name and email' },
        { id: 's2', name: 'SDR manually researches the company using LinkedIn, website and news', owner: 'SDR', pain: 'Takes 15-20 minutes per lead, mostly copy-paste' },
        { id: 's3', name: 'SDR enters enriched data into CRM and two other tools', owner: 'SDR', pain: 'Same data entered in 3 places, formats differ between tools' },
        { id: 's4', name: 'SDR qualifies the lead against ideal customer criteria', owner: 'SDR', pain: 'Criteria applied inconsistently across the team' },
        { id: 's5', name: 'Lead is handed off to an account executive with a summary', owner: 'SDR / AE', pain: 'Summary is informal (Slack message or email), context gets lost' },
        { id: 's6', name: 'AE updates CRM with deal progress over weeks/months', owner: 'AE', pain: 'Updates are sporadic, fields go stale, data conflicts with enrichment tools' },
        { id: 's7', name: 'RevOps manually checks CRM hygiene weekly', owner: 'RevOps', pain: 'Time-consuming, reactive, always behind' },
        { id: 's8', name: 'Sales manager reviews pipeline for forecast', owner: 'Sales manager', pain: 'Low confidence in data, spends time verifying instead of coaching' },
      ],
      actors: ['SDR', 'AE', 'sales manager', 'RevOps', 'marketing'],
      data_assets: ['CRM records', 'enrichment tool data', 'LinkedIn data', 'email threads', 'pipeline metrics'],
      success_metrics: ['time_per_lead_enrichment', 'field_completeness', 'data_consistency_across_tools', 'forecast_accuracy'],
      qualification: { business_impact: 5, frequency: 5, baseline_measurability: 4, data_readiness: 4, boundary_clarity: 4, pilotability: 4 },
    },
  },
  {
    id: 'creative-content',
    title: 'Campaign adaptation overload',
    subtitle: 'One idea manually rewritten and reformatted for every channel',
    buyer: 'Content / marketing leads',
    context: 'Creative',
    painPoint: 'Content teams spend 60-70% of their effort on adaptation tasks. One campaign idea gets manually rewritten for LinkedIn, email, the website, X and internal comms. Each version is created separately, tracked in different places and approved through informal channels. Tone drifts between versions, assets get named inconsistently and nobody is sure which version was actually published where.',
    discoveryMethod: 'Time-spend analysis showed the scale of adaptation work. Workplace shadowing revealed the copy-paste-tweak loop across channels. Retrospective review flagged version confusion and quality variance after publishing. The content lead described it as "we spend most of our time reformatting and almost no time on the actual creative work."',
    whyAI: 'Generative AI is strong at structured text adaptation under style constraints. But the core creative judgement, brand-sensitive decisions and legal review must stay with people. The question is how much of the adaptation and version tracking can be automated without losing the quality that makes content effective.',
    redesign: `The campaign brief and master narrative stay fully human. The content lead writes the brief, the copywriter creates the master copy and key messages. This is the creative work and it does not change.

From the master copy, an LLM generates channel-specific versions: LinkedIn (professional tone, medium length), email newsletter (conversational, with CTA), website (scannable, SEO-friendly), X and other social platforms (short, punchy). Each version follows documented channel guidelines for tone, length and format.

The copywriter reviews each generated version rather than writing them from scratch. They edit for nuance, brand voice and anything the LLM got wrong. This shifts their role from manual adaptation to quality review.

Visual assets are handled separately. Deterministic tools (like Figma auto-layout or scripted templates) resize images to exact platform specifications. Asset naming and version tracking are automated: every asset is tagged with its campaign, channel and version number in a single registry.

All versions (text and visual) are visible in one approval interface. The content lead reviews everything in one place and approves each version, replacing the current informal Slack and email review process.

Publishing is tracked automatically: what was published where, when and which version. This is deterministic logging, no AI needed.`,
    workflow: {
      name: 'campaign-adaptation-overload',
      steps: [
        { id: 's1', name: 'Campaign brief is written by the content lead', owner: 'content lead', pain: 'Briefs vary in quality and completeness' },
        { id: 's2', name: 'Copywriter creates the master narrative and key messages', owner: 'copywriter', pain: 'This is the creative work; usually done well' },
        { id: 's3', name: 'Copywriter manually adapts the narrative for LinkedIn', owner: 'copywriter', pain: 'Rewriting the same idea in a different format' },
        { id: 's4', name: 'Copywriter manually adapts for email newsletter', owner: 'copywriter', pain: 'Another rewrite, different tone and length constraints' },
        { id: 's5', name: 'Copywriter or designer adapts for website', owner: 'copywriter / designer', pain: 'Yet another format, often needs visual assets too' },
        { id: 's6', name: 'Social media manager adapts for X and other platforms', owner: 'social media manager', pain: 'Shortest format, but needs to capture the same message' },
        { id: 's7', name: 'Designer creates or sources visual assets for each channel', owner: 'designer', pain: 'Assets named inconsistently, hard to track which belong to which version' },
        { id: 's8', name: 'Content lead reviews all versions informally (Slack, email)', owner: 'content lead', pain: 'Review is ad hoc, things slip through' },
        { id: 's9', name: 'Approved versions published separately to each channel', owner: 'various', pain: 'No single view of what was published where and when' },
      ],
      actors: ['content lead', 'copywriter', 'designer', 'social media manager'],
      data_assets: ['campaign briefs', 'brand guidelines', 'asset library', 'channel specs', 'published content log'],
      success_metrics: ['time_brief_to_publish', 'consistency_across_channels', 'approval_round_count', 'asset_reuse_rate'],
      qualification: { business_impact: 4, frequency: 4, baseline_measurability: 4, data_readiness: 3, boundary_clarity: 4, pilotability: 5 },
    },
  },
  {
    id: 'cfo-intelligence',
    title: 'The reporting cycle problem',
    subtitle: 'Finance teams spend days assembling reports instead of analysing them',
    buyer: 'CFO / FP&A',
    context: 'Finance',
    painPoint: 'FP&A teams spend the majority of their reporting cycle on assembly, not analysis. They pull data from 5+ systems, reconcile formats in spreadsheets, build slide packs and write commentary. By the time numbers reach the CFO, the team has spent a week on logistics. Meanwhile, qualitative signals (deal risk, market shifts, operational issues) live in CRM notes and Slack threads, completely disconnected from the financial view.',
    discoveryMethod: 'Structured interviews with FP&A leads revealed 60-70% of reporting time spent on data assembly and formatting. Process walkthrough of the month-end close showed manual data pulls from CRM, ERP and billing systems reconciled in spreadsheets. Executive feedback consistently flagged two problems: forecasts arrived late and lacked qualitative context.',
    whyAI: 'AI could help with narrative generation (drafting variance commentary from computed numbers), signal surfacing (scanning deal notes and team updates for risk signals) and report assembly. But the actual maths must stay deterministic: forecasting calculations, margin computation and revenue recognition cannot be generated by an LLM. An LLM producing financial projections is a risk, not a feature.',
    redesign: `When the period closes, data collection starts automatically. The system pulls actuals from the ERP, pipeline data from the CRM and billing data from the billing platform via API calls. Each pull is deterministic: same query, same result. Format differences between systems are reconciled automatically using transformation rules.

Reconciliation happens through deterministic rules rather than manually in a spreadsheet. Where data conflicts exist between systems, the conflicts are flagged for human review rather than requiring someone to check everything.

Forecast calculations and margin analysis stay exactly as they are: deterministic, rules-based, done in spreadsheets or a dedicated tool. No AI touches the numbers.

An LLM drafts the variance commentary and board narrative from the computed numbers. The numbers come from the deterministic calculations, the LLM only generates the text around them. It also scans deal notes, call transcripts and team updates to surface qualitative signals that the spreadsheet does not capture ("champion left the company", "competitor mentioned three times this month"). These are flagged as signals, not facts.

The slide pack is assembled from templates. Layout and formatting are rules-based. The generated narrative is inserted into the right sections.

The CFO reviews the assembled pack. Nothing leaves the system until they approve it. After approval, distribution is automated: the right people get the right format.

The actual maths must never be generated by an LLM. An LLM producing financial projections is a risk, not a feature. Every number must trace back to a named source system and query.`,
    workflow: {
      name: 'the-reporting-cycle-problem',
      steps: [
        { id: 's1', name: 'Period closes and finance team begins data collection', owner: 'FP&A analyst', pain: 'Manual trigger, no automation' },
        { id: 's2', name: 'Pull actuals from ERP system', owner: 'FP&A analyst', pain: 'Export to CSV, manual cleanup required' },
        { id: 's3', name: 'Pull pipeline data from CRM', owner: 'FP&A analyst', pain: 'Different format, needs reconciliation with ERP data' },
        { id: 's4', name: 'Pull billing data from billing platform', owner: 'FP&A analyst', pain: 'Third system, third format' },
        { id: 's5', name: 'Reconcile all data sources in a spreadsheet', owner: 'FP&A analyst', pain: 'This takes 1-2 days, error-prone, formula-heavy' },
        { id: 's6', name: 'Run forecast calculations and margin analysis', owner: 'FP&A analyst', pain: 'Done in spreadsheets, formulas are complex but deterministic' },
        { id: 's7', name: 'Write variance commentary and board narrative', owner: 'FP&A analyst / finance director', pain: 'Takes another 1-2 days, mostly describing numbers that are already computed' },
        { id: 's8', name: 'Build slide pack for CFO and board', owner: 'FP&A analyst', pain: 'Formatting and layout, low-value work' },
        { id: 's9', name: 'CFO reviews, requests changes, approves', owner: 'CFO', pain: 'Often asks "but what is actually happening in the pipeline?" because the report lacks qualitative context' },
        { id: 's10', name: 'Final report distributed', owner: 'finance director', pain: 'By now, the data is already a week old' },
      ],
      actors: ['FP&A analyst', 'finance director', 'CFO'],
      data_assets: ['ERP actuals', 'CRM pipeline', 'billing data', 'deal notes', 'call transcripts', 'team updates'],
      success_metrics: ['reporting_cycle_days', 'analyst_time_on_assembly_vs_analysis', 'forecast_accuracy', 'qualitative_signal_coverage'],
      qualification: { business_impact: 5, frequency: 4, baseline_measurability: 5, data_readiness: 4, boundary_clarity: 5, pilotability: 3 },
    },
  },
];
