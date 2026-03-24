export interface FlagshipCase {
  id: string;
  title: string;
  subtitle: string;
  buyer: string;
  context: string;
  painPoint: string;
  discoveryMethod: string;
  whyAI: string;
  userDescription: string;
  redesign: string;
  redesignData: {
    components: Array<{ name: string; type: string; description: string; risks: string[]; considerations: string[] }>;
    boundaries: string[];
    confidentiality: string[];
    costFactors: string[];
    humanCheckpoints: string[];
  };
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
    userDescription: 'I want people to be able to ask a question and get an answer from our internal docs, wikis and decision logs without having to search 5 different tools. The answer should show where it came from so people can check it. If the system is not sure, it should ask a person instead of guessing. Answers should be saved so the same question does not need answering twice. I also want a weekly summary of what changed, who owns what and what decisions were made so we can shorten or replace our sync meetings. Not everyone should be able to see everything though, permissions need to be respected.',
    redesign: `Someone asks a question through a single interface (chat, Slack command or internal tool). A RAG system searches all internal sources (docs, wikis, decision logs, project trackers, Slack messages) and generates an answer with citations showing where each piece of information came from.

If the system is confident in the answer, it shows it directly. If confidence is low or the question is ambiguous, it escalates to a person and shows what it found so far.

Every answer (whether from the system or a person) is captured and becomes searchable. When the same question comes up again, the existing answer surfaces first.

A weekly alignment summary is generated automatically from recent decisions, document changes and ownership updates. The ops lead reviews and edits the summary before sharing it, replacing or shortening the weekly sync meeting.

Access control must respect existing document permissions. Not everyone should be able to look up everything. The system must only surface documents the person asking is allowed to see.`,
    redesignData: {
      components: [
        { name: 'Document indexing', type: 'rag', description: 'Index all internal sources (docs, wikis, decision logs, Slack, notes) into a vector database', risks: ['Stale sources produce stale answers', 'Indexing errors can miss documents'], considerations: ['Chunking strategy affects answer quality', 'How often to re-index', 'Which sources to include'] },
        { name: 'Question answering', type: 'llm', description: 'Generate answers from retrieved documents with citations', risks: ['Hallucination: plausible but wrong answers', 'Citation present does not guarantee correct interpretation'], considerations: ['Model size vs cost trade-off', 'Confidence scoring to decide when to escalate'] },
        { name: 'Access control', type: 'tool', description: 'Enforce document permissions before retrieval', risks: ['Permission mapping errors could expose confidential information'], considerations: ['Must mirror existing permission structure', 'Need to handle documents with mixed access levels'] },
        { name: 'Answer capture', type: 'deterministic', description: 'Store every answer for future retrieval', risks: ['Outdated answers persisting'], considerations: ['Expiry or review cycle for stored answers'] },
        { name: 'Weekly summary generation', type: 'llm', description: 'Draft alignment summary from recent changes', risks: ['May miss important context', 'Could misrepresent decisions'], considerations: ['Ops lead must review before sharing'] },
        { name: 'Ops lead review', type: 'human', description: 'Review generated answers and summaries before they become authoritative', risks: ['Review fatigue if volume is high'], considerations: ['Define what requires review vs what can go directly'] },
      ],
      boundaries: ['AI output must be reviewed before being treated as authoritative', 'Escalate to a person when confidence is low', 'Log all queries and answers for traceability'],
      confidentiality: ['Document permissions must be enforced at retrieval time', 'Salary, HR and legal documents must be excluded or access-controlled', 'Consider a local model if internal documents contain sensitive client data', 'Evaluate whether queries and answers can be sent to a cloud API'],
      costFactors: ['LLM calls per question add up with high usage', 'A smaller model may work for straightforward retrieval questions', 'Vector database hosting and re-indexing costs'],
      humanCheckpoints: ['Ops lead reviews weekly summary before distribution', 'Low-confidence answers escalate to a person', 'Source-of-truth documents cannot be edited by the system'],
    },
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
    userDescription: 'When a new lead comes in, I want it automatically researched and enriched instead of an SDR spending 20 minutes per lead on LinkedIn and Google. The enriched data should go into the CRM and the other tools we use without anyone having to enter it three times. I want leads scored consistently against our ICP criteria instead of every SDR doing it differently. When a lead is handed to an AE, there should be a proper summary not just a Slack message. And I want the CRM hygiene checked continuously instead of someone doing it manually every week. But outreach, pricing and forecast decisions must stay with people.',
    redesign: `When a new lead arrives, the system automatically enriches it by pulling from multiple sources (LinkedIn, company website, news, existing CRM data) and consolidating everything into a single, complete profile. This uses API calls for structured data and an LLM to summarise unstructured findings like recent news or social posts.

The enriched data is written once to all systems (CRM and the two other tools) via API calls. Format differences are handled by deterministic transformation rules so data is consistent everywhere.

Lead qualification against ICP criteria is applied consistently using rules-based scoring. Every lead gets scored the same way, removing the inconsistency of each SDR applying criteria differently.

The handoff from SDR to AE is a structured summary generated automatically from the enriched data and qualification notes. This replaces informal Slack messages with a consistent, searchable format that includes everything the AE needs.

CRM hygiene runs continuously in the background: flagging stale fields, detecting data conflicts between tools and surfacing records that need attention. This replaces the weekly manual check.

The sales manager reviews pipeline with higher confidence because the underlying data is more complete and current. Outreach, relationship decisions, pricing and forecast sign-off all stay fully with people.`,
    redesignData: {
      components: [
        { name: 'Lead enrichment', type: 'tool', description: 'Pull structured data from multiple sources via APIs and consolidate', risks: ['API rate limits', 'Outdated external data'], considerations: ['Which sources to trust', 'How to handle conflicting data between sources'] },
        { name: 'Unstructured summarisation', type: 'llm', description: 'Summarise unstructured findings (news, social posts) into the lead profile', risks: ['Hallucination in summaries', 'Outdated information'], considerations: ['A small model may be sufficient for summarisation'] },
        { name: 'Data sync', type: 'deterministic', description: 'Write enriched data to all systems with format transformation', risks: ['Sync failures leaving systems out of date'], considerations: ['Idempotent writes to handle retries'] },
        { name: 'ICP scoring', type: 'deterministic', description: 'Apply qualification criteria consistently via rules', risks: ['Rules may not capture edge cases'], considerations: ['Regular review of scoring criteria'] },
        { name: 'Hygiene monitoring', type: 'tool', description: 'Continuously flag stale fields, conflicts and missing data', risks: ['Alert fatigue if too many flags'], considerations: ['Prioritise flags by severity'] },
        { name: 'Human decisions', type: 'human', description: 'Outreach, pricing, forecast sign-off stay with people', risks: ['Bottleneck if too much needs human input'], considerations: ['Clear handoff criteria'] },
      ],
      boundaries: ['No autonomous outbound communication', 'No deal-stage changes without owner confirmation', 'All enrichment sources logged for traceability'],
      confidentiality: ['No non-consented personal data use', 'Consider whether lead data can be sent to cloud enrichment APIs', 'GDPR/privacy compliance for EU leads', 'Evaluate local processing for personal data enrichment'],
      costFactors: ['Enrichment API costs per lead', 'LLM summarisation costs at scale', 'A smaller model works for basic summarisation'],
      humanCheckpoints: ['SDR reviews enriched profile before outreach', 'Sales manager signs off on forecasts', 'Pricing and discount decisions stay fully human'],
    },
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
    userDescription: 'We have a copywriter who creates the master narrative for each campaign. That part is great. But then they spend days manually rewriting it for LinkedIn, email, the website and social media. Each version is slightly different in tone and length but it is basically the same message. I want the channel versions generated automatically from the master copy so the copywriter reviews them instead of writing each one from scratch. Images also need resizing for each platform which is just mechanical work. And I want all versions tracked in one place with proper naming instead of scattered across Slack and email threads. The creative direction and final approval must stay with people.',
    redesign: `The campaign brief and master narrative stay fully human. The content lead writes the brief, the copywriter creates the master copy and key messages. This is the creative work and it does not change.

From the master copy, an LLM generates channel-specific versions: LinkedIn (professional tone, medium length), email newsletter (conversational, with CTA), website (scannable, SEO-friendly), X and other social platforms (short, punchy). Each version follows documented channel guidelines for tone, length and format.

The copywriter reviews each generated version rather than writing them from scratch. They edit for nuance, brand voice and anything the LLM got wrong. This shifts their role from manual adaptation to quality review.

Visual assets are handled separately. Deterministic tools (like Figma auto-layout or scripted templates) resize images to exact platform specifications. Asset naming and version tracking are automated: every asset is tagged with its campaign, channel and version number in a single registry.

All versions (text and visual) are visible in one approval interface. The content lead reviews everything in one place and approves each version, replacing the current informal Slack and email review process.

Publishing is tracked automatically: what was published where, when and which version. This is deterministic logging, no AI needed.`,
    redesignData: {
      components: [
        { name: 'Channel adaptation', type: 'llm', description: 'Generate channel-specific versions from master copy following documented guidelines', risks: ['Tone drift from brand voice', 'Inconsistency between channels', 'Cultural or context errors'], considerations: ['Prompt engineering with brand guidelines', 'A smaller model may handle straightforward adaptations'] },
        { name: 'Image resizing', type: 'deterministic', description: 'Resize and reformat visual assets to exact platform specs', risks: ['Template changes when platforms update specs'], considerations: ['Figma auto-layout, scripted templates or similar tools'] },
        { name: 'Asset registry', type: 'deterministic', description: 'Track asset versions, naming and campaign association', risks: ['Registry gets out of date if manual steps are skipped'], considerations: ['Automated tagging at creation time'] },
        { name: 'Approval workflow', type: 'tool', description: 'Structured approval interface replacing informal review', risks: ['Bottleneck if approval is slow'], considerations: ['Parallel approval for independent channels'] },
        { name: 'Publish tracking', type: 'deterministic', description: 'Log what was published where and when', risks: ['Missing entries if publishing bypasses the system'], considerations: ['Integrate with publishing tools'] },
        { name: 'Content lead review', type: 'human', description: 'Review all generated versions before publishing', risks: ['Review fatigue with many channels'], considerations: ['Batch review interface, not one-by-one'] },
      ],
      boundaries: ['No publishing without human approval', 'No unlicensed visual assets', 'No brand-unsafe or legally sensitive claims without review'],
      confidentiality: ['Campaign briefs may contain unreleased product information', 'Consider whether draft content can be processed by a cloud LLM', 'Client campaign data may require a local model'],
      costFactors: ['LLM cost per channel adaptation (multiply by number of campaigns)', 'A smaller fine-tuned model may produce more consistent brand voice cheaper', 'Deterministic tools (Figma, templates) have fixed licensing costs'],
      humanCheckpoints: ['Content lead approves all channel versions', 'Creative strategist reviews master narrative', 'Legal review for sensitive claims'],
    },
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
    userDescription: 'Our FP&A team spends most of the reporting cycle pulling data from 5 systems and reconciling it in spreadsheets. I want the data pulls and reconciliation automated so the team can focus on analysis instead of assembly. The forecast calculations and margin analysis must stay exactly as they are, no AI touching the numbers. But I want the variance commentary and board narrative drafted automatically from the computed numbers so analysts are not spending 2 days writing descriptions of numbers they already calculated. I also want the system to pick up on signals from deal notes and team updates that the spreadsheet misses, like a champion leaving or a competitor being mentioned. The CFO must approve everything before it goes anywhere. And all the financial data is confidential so it cannot go to an external API.',
    redesign: `When the period closes, data collection starts automatically. The system pulls actuals from the ERP, pipeline data from the CRM and billing data from the billing platform via API calls. Each pull is deterministic: same query, same result. Format differences between systems are reconciled automatically using transformation rules.

Reconciliation happens through deterministic rules rather than manually in a spreadsheet. Where data conflicts exist between systems, the conflicts are flagged for human review rather than requiring someone to check everything.

Forecast calculations and margin analysis stay exactly as they are: deterministic, rules-based, done in spreadsheets or a dedicated tool. No AI touches the numbers.

An LLM drafts the variance commentary and board narrative from the computed numbers. The numbers come from the deterministic calculations, the LLM only generates the text around them. It also scans deal notes, call transcripts and team updates to surface qualitative signals that the spreadsheet does not capture ("champion left the company", "competitor mentioned three times this month"). These are flagged as signals, not facts.

The slide pack is assembled from templates. Layout and formatting are rules-based. The generated narrative is inserted into the right sections.

The CFO reviews the assembled pack. Nothing leaves the system until they approve it. After approval, distribution is automated: the right people get the right format.

The actual maths must never be generated by an LLM. An LLM producing financial projections is a risk, not a feature. Every number must trace back to a named source system and query.`,
    redesignData: {
      components: [
        { name: 'Data pulls', type: 'tool', description: 'Automated API calls to ERP, CRM and billing', risks: ['API changes breaking the pipeline', 'Incomplete data if a system is down'], considerations: ['Error handling and retry logic', 'Data validation after each pull'] },
        { name: 'Data reconciliation', type: 'deterministic', description: 'Rules-based reconciliation with conflict flagging', risks: ['Rules may not cover new edge cases'], considerations: ['Human review queue for flagged conflicts'] },
        { name: 'Forecast calculations', type: 'deterministic', description: 'Spreadsheet or dedicated tool for all maths', risks: ['Formula errors (existing risk, not new)'], considerations: ['Must remain deterministic, never LLM-generated'] },
        { name: 'Narrative generation', type: 'llm', description: 'Draft variance commentary and board narrative from computed numbers', risks: ['Hallucination: LLM could misrepresent what the numbers mean', 'Could generate numbers that look calculated but are not'], considerations: ['Clear labelling of AI-generated text', 'Numbers must come from deterministic calculations only'] },
        { name: 'Signal scanning', type: 'rag', description: 'Scan deal notes, transcripts and updates for qualitative signals', risks: ['Signals are pattern matches, not facts', 'Sensitive information in transcripts'], considerations: ['Flag as signals not facts', 'Access control on transcript data'] },
        { name: 'Report assembly', type: 'deterministic', description: 'Template-based slide pack assembly', risks: ['Template changes when board requirements change'], considerations: ['Separate content from layout'] },
        { name: 'CFO approval', type: 'human', description: 'Nothing leaves the system without CFO sign-off', risks: ['Bottleneck if CFO is unavailable'], considerations: ['Delegate authority for routine reports'] },
      ],
      boundaries: ['No LLM-generated financial calculations', 'No modification of source financial records', 'No external disclosure without human sign-off', 'All numbers must trace to a named source system', 'Narrative must be labelled as AI-generated draft'],
      confidentiality: ['Financial projections are highly confidential', 'Deal notes and call transcripts contain sensitive client information', 'A local model is strongly recommended for signal scanning', 'Evaluate whether any financial data can leave the organisation', 'Board materials must not be processed by external APIs'],
      costFactors: ['LLM calls for narrative and signal scanning per reporting cycle', 'API integration costs for connecting ERP, CRM and billing', 'A smaller model may handle routine variance commentary', 'Deterministic components (reconciliation, assembly) are effectively free at scale'],
      humanCheckpoints: ['CFO approves final report before distribution', 'FP&A analyst reviews data reconciliation conflicts', 'Finance director reviews AI-generated narrative for accuracy'],
    },
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
