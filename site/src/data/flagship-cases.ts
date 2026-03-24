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
    userDescription: 'I want people to be able to ask a question and get an answer from our internal docs, wikis and decision logs without having to search 5 different tools. The answer should show where it came from so people can check it. If the system is not sure, it should ask a person instead of guessing. Answers should be saved so the same question does not need answering twice. Not everyone should be able to see everything though, permissions need to be respected.',
    redesign: `Someone asks a question through a single interface (chat, Slack command or internal tool). A RAG system searches all internal sources (docs, wikis, decision logs, project trackers, Slack messages) and generates an answer with citations showing where each piece of information came from.

If the system is confident in the answer, it shows it directly. If confidence is low or the question is ambiguous, it escalates to a person and shows what it found so far.

Every answer (whether from the system or a person) is captured and becomes searchable. When the same question comes up again, the existing answer surfaces first.

Access control must respect existing document permissions. Not everyone should be able to look up everything. The system must only surface documents the person asking is allowed to see.`,
    redesignData: {
      components: [
        { name: 'User asks question', type: 'human', description: 'Someone asks a question through a single interface', risks: [], considerations: ['Chat, Slack command, internal tool'] },
        { name: 'Permission check', type: 'tool', description: 'Check who is asking and filter which documents they are allowed to see', risks: ['Permission mapping errors could expose confidential information'], considerations: ['Must mirror existing permission structure', 'Need to handle documents with mixed access levels'] },
        { name: 'Document retrieval', type: 'rag', description: 'Search indexed internal sources for relevant documents, respecting access permissions', risks: ['Stale sources produce stale answers', 'Indexing errors can miss documents'], considerations: ['Chunking strategy affects answer quality', 'How often to re-index', 'Which sources to include'] },
        { name: 'Answer generation', type: 'llm', description: 'Generate an answer from retrieved documents with citations', risks: ['Hallucination: plausible but wrong answers', 'Citation present does not guarantee correct interpretation'], considerations: ['Model size vs cost trade-off', 'Confidence scoring to decide when to escalate'] },
        { name: 'Confidence check', type: 'deterministic', description: 'Score how confident the system is in the answer. Low confidence escalates to a person instead of showing the answer directly', risks: ['Threshold too low lets bad answers through, too high escalates everything'], considerations: ['Calibrate threshold based on early usage data'] },
        { name: 'Answer delivered', type: 'human', description: 'User receives the answer with citations showing where it came from', risks: ['User may over-trust AI-generated answers'], considerations: ['Clear labelling that this is an AI-generated answer'] },
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
    subtitle: 'Sales reps spend more time researching leads than talking to them',
    buyer: 'Sales leadership',
    context: 'Revenue',
    painPoint: 'Sales reps spend 15-20 minutes per lead manually researching on LinkedIn and Google, then writing a personalised outreach message. Most of that time is copy-paste. The research is inconsistent because every rep does it differently. And the outreach often sounds generic because there is not enough time to truly personalise it.',
    discoveryMethod: 'Workplace shadowing showed reps spending 30-40 minutes per lead on research and outreach. Time-spend analysis confirmed the scale: over half of rep time goes to preparation, not selling.',
    whyAI: 'AI can pull and summarise lead information from multiple sources much faster than a person. It can also draft personalised outreach based on what it finds. But the rep must review everything before it goes out. Automated outreach without human review damages trust and relationships.',
    userDescription: 'When a new lead comes in, I want it automatically researched instead of a rep spending 20 minutes on LinkedIn and Google. Then I want a personalised outreach message drafted based on what was found. The rep should review the research and the draft, make any changes and send it. But nothing goes out without the rep approving it.',
    redesign: `When a new lead arrives, the system automatically researches it by pulling information from LinkedIn, the company website and recent news via API calls. An LLM summarises the findings into a short profile: what the company does, recent developments, relevant context for the conversation.

Based on the enriched profile, the LLM drafts a personalised outreach message. The draft follows the team's outreach guidelines and references specific details from the research (not generic "I noticed your company..." messages).

The sales rep reviews both the research summary and the draft outreach. They can edit, rewrite or approve as is. Nothing is sent until the rep explicitly approves it.

Once approved, the outreach is sent via the existing email or messaging tool. The enriched data and outreach history are saved to the CRM automatically.`,
    redesignData: {
      components: [
        { name: 'New lead arrives', type: 'deterministic', description: 'Lead enters the system from marketing or inbound', risks: [], considerations: ['Trigger for the pipeline'] },
        { name: 'Lead research', type: 'tool', description: 'Pull data from LinkedIn, company website and news via APIs', risks: ['API rate limits', 'Outdated information'], considerations: ['Which sources to trust', 'How to handle missing data'] },
        { name: 'Profile summary', type: 'llm', description: 'Summarise research findings into a short, useful profile', risks: ['Hallucination in summary', 'Missing important context'], considerations: ['A small model may be sufficient'] },
        { name: 'Outreach draft', type: 'llm', description: 'Draft personalised outreach based on the enriched profile', risks: ['Tone may not match rep style', 'Could reference wrong details'], considerations: ['Prompt with team outreach guidelines', 'Rep always reviews'] },
        { name: 'Rep reviews and sends', type: 'human', description: 'Sales rep reviews research and outreach draft, edits if needed, approves before sending', risks: ['Rep rubber-stamps without reading'], considerations: ['Make review easy but not skippable'] },
        { name: 'Outreach sent', type: 'tool', description: 'Send approved message via email or messaging tool, save to CRM', risks: ['Integration failures'], considerations: ['Use existing tools, do not add new ones'] },
      ],
      boundaries: ['No outreach sent without rep approval', 'All research sources logged for traceability', 'Rep can see exactly what the LLM found and what it drafted'],
      confidentiality: ['Lead personal data must comply with privacy regulations', 'Consider whether lead data can be sent to a cloud LLM', 'Evaluate local model for markets with strict data residency rules'],
      costFactors: ['API costs per lead for enrichment', 'LLM costs per lead for summary and outreach draft', 'A smaller model may work for straightforward outreach'],
      humanCheckpoints: ['Sales rep reviews and approves every outreach before sending'],
    },
    workflow: {
      name: 'crm-data-chaos',
      steps: [
        { id: 's1', name: 'New lead arrives from marketing or inbound', owner: 'system / marketing', pain: 'Lead data is minimal, often just name and email' },
        { id: 's2', name: 'Sales rep manually researches the company using LinkedIn, website and news', owner: 'sales rep', pain: 'Takes 15-20 minutes per lead, mostly copy-paste' },
        { id: 's3', name: 'Sales rep writes a personalised outreach message', owner: 'sales rep', pain: 'Time-consuming, often ends up generic because of time pressure' },
        { id: 's4', name: 'Sales rep sends the outreach', owner: 'sales rep', pain: 'Manual process, no consistency across the team' },
        { id: 's5', name: 'Sales rep logs the outreach in the CRM', owner: 'sales rep', pain: 'Often forgotten or incomplete' },
      ],
      actors: ['sales rep', 'marketing'],
      data_assets: ['CRM records', 'LinkedIn data', 'company websites', 'email threads'],
      success_metrics: ['time_per_lead', 'outreach_personalisation_quality', 'response_rate'],
      qualification: { business_impact: 5, frequency: 5, baseline_measurability: 4, data_readiness: 4, boundary_clarity: 5, pilotability: 4 },
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
        { name: 'Master copy created', type: 'human', description: 'Copywriter creates master narrative and key messages', risks: [], considerations: ['This is the creative work and stays fully human'] },
        { name: '_parallel_start', type: 'deterministic', description: '', risks: [], considerations: [] },
        { name: 'Channel adaptation', type: 'llm', description: 'Generate channel-specific text versions from master copy', risks: ['Tone drift from brand voice'], considerations: ['Prompt with brand guidelines'], _track: 'top' },
        { name: 'Copywriter review', type: 'human', description: 'Review generated versions for tone and accuracy', risks: ['Review fatigue'], considerations: ['Batch review interface'], _track: 'top' },
        { name: 'Image resizing', type: 'deterministic', description: 'Resize visual assets to exact platform specs', risks: ['Template changes when platforms update'], considerations: ['Figma auto-layout or scripted templates'], _track: 'bottom' },
        { name: '_parallel_end', type: 'deterministic', description: '', risks: [], considerations: [] },
        { name: 'Content lead approval', type: 'human', description: 'Content lead approves all versions in one interface', risks: ['Bottleneck if slow'], considerations: ['Parallel approval for independent channels'] },
        { name: 'Version tracking', type: 'deterministic', description: 'Track all versions, naming, campaign association and publish history', risks: ['Gets out of date if steps are bypassed'], considerations: ['Automated tagging at creation, log on publish'] },
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
        { name: 'Period closes', type: 'deterministic', description: 'Trigger: reporting cycle begins automatically', risks: [], considerations: ['Scheduled or event-driven trigger'] },
        { name: 'Data pulls', type: 'tool', description: 'Pull actuals, pipeline and billing data via APIs', risks: ['API changes breaking the pipeline', 'Incomplete data if a system is down'], considerations: ['Error handling and retry logic', 'Data validation after each pull'] },
        { name: 'Reconciliation', type: 'deterministic', description: 'Rules-based reconciliation, flag conflicts for review', risks: ['Rules may not cover new edge cases'], considerations: ['Human review queue for flagged conflicts'] },
        { name: 'Analyst reviews conflicts', type: 'human', description: 'FP&A analyst reviews flagged data conflicts', risks: ['Delays if many conflicts'], considerations: ['Prioritise by materiality'] },
        { name: 'Forecast calculations', type: 'deterministic', description: 'All maths stays in spreadsheets or dedicated tools', risks: ['Formula errors (existing risk)'], considerations: ['Never LLM-generated'] },
        { name: 'Signal scanning', type: 'rag', description: 'Scan deal notes and team updates for qualitative signals', risks: ['Signals are pattern matches, not facts', 'Sensitive information'], considerations: ['Flag as signals not facts', 'Local model recommended'] },
        { name: 'Narrative drafting', type: 'llm', description: 'Draft variance commentary from computed numbers', risks: ['Could misrepresent what numbers mean', 'Could generate numbers that look calculated'], considerations: ['Label as AI draft', 'Numbers only from deterministic sources'] },
        { name: 'Report assembly', type: 'deterministic', description: 'Template-based slide pack', risks: [], considerations: ['Separate content from layout'] },
        { name: 'CFO approval', type: 'human', description: 'Nothing leaves without CFO sign-off', risks: ['Bottleneck if unavailable'], considerations: ['Delegate authority for routine reports'] },
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
