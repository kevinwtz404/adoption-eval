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
  pilotPlan: {
    scope: string;
    successCriteria: string;
    stopCriteria: string;
    timeline: string;
    owner: string;
  };
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
    pilotPlan: {
      scope: 'One team (ops), one document set (internal wikis and decision logs only). Test for 3 weeks with 10-15 users asking real questions.',
      successCriteria: 'Time to find an answer drops by 50%. 80% of answers include correct source citations. Fewer than 10% of answers need escalation to a person.',
      stopCriteria: 'System surfaces confidential documents to the wrong person. More than 30% of answers are factually wrong. Users stop using it within the first week.',
      timeline: '3 weeks. Midpoint review after week 2. Final evaluation in week 4.',
      owner: 'Ops lead. Has authority to pause the pilot and restrict document access.',
    },
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
    pilotPlan: {
      scope: 'One sales rep, 20 new leads over 2 weeks. Compare enrichment quality and outreach response rate against the same rep doing it manually the previous month.',
      successCriteria: 'Research time per lead drops from 15 minutes to under 2 minutes. Outreach personalisation quality rated as equal or better by the rep. Response rate does not decline.',
      stopCriteria: 'Enrichment data is consistently wrong or outdated. Outreach drafts require more editing than writing from scratch. Rep loses trust in the tool.',
      timeline: '2 weeks. Quick check after week 1. Full evaluation after week 2.',
      owner: 'Sales team lead. Reviews enrichment quality daily during the pilot.',
    },
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
        { id: 's4', name: 'Sales rep sends the outreach and logs it in the CRM', owner: 'sales rep', pain: 'Manual process, logging often forgotten or incomplete' },
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
    painPoint: 'Content teams spend most of their time adapting one campaign idea for different channels. The copywriter creates a great master narrative, then spends days rewriting it for LinkedIn, email, the website and social media. Images need resizing for each platform. The content lead reviews everything through Slack messages and email threads. Nobody is sure which version was actually published where.',
    discoveryMethod: 'Time-spend analysis showed the scale of adaptation work. Workplace shadowing revealed the copy-paste-tweak loop across channels. The content lead described it as "we spend most of our time reformatting and almost no time on the actual creative work."',
    whyAI: 'Generative AI is strong at adapting text for different formats and tones. But the creative direction and final approval must stay with people. The question is how much of the repetitive adaptation can be automated while keeping quality high.',
    userDescription: 'Our copywriter creates the master narrative for each campaign. That part is great. But then they spend days rewriting it for LinkedIn, email, the website and social media. Each version is slightly different in tone and length but it is basically the same message. I want the channel versions generated automatically so the copywriter reviews them instead of writing each one from scratch. Images need resizing for each platform which is just mechanical. Then I want the content lead to see everything in one place, approve it and publish. The creative work and final approval must stay with people.',
    redesign: `The copywriter creates the master narrative and key messages. This is the creative work and it does not change.

From the master copy, two things happen in parallel. An LLM generates channel-specific text versions: LinkedIn (professional tone, medium length), email (conversational, with CTA), website (scannable), social (short, punchy). The copywriter reviews and approves each generated version, editing for brand voice and nuance. At the same time, deterministic tools reformat images and visual assets to exact platform specifications. A creative reviewer checks that the reformatted visuals still work for each channel.

Once both tracks are done, an LLM assembles a campaign summary from the approved text and formatted assets, pulling everything into a single readable overview using structured input.

The content lead reviews the complete campaign package in one place and approves it. This replaces the current process of chasing versions through Slack and email.

Approved versions are published to each channel via the existing publishing tools and the system logs what went where and when.`,
    pilotPlan: {
      scope: 'One campaign, three channels (LinkedIn, email, website). Copywriter creates the master copy as usual, then the system generates the channel versions.',
      successCriteria: 'Time from master copy to all channel versions ready drops by 60%. Copywriter rates generated versions as needing only minor edits. Brand consistency across channels improves (rated by content lead).',
      stopCriteria: 'Generated versions consistently miss brand voice. Copywriter spends more time editing than they would writing from scratch. Content lead rejects more than 30% of generated versions.',
      timeline: '3 weeks, covering 2 campaign cycles. Midpoint review after the first campaign.',
      owner: 'Content lead. Reviews all generated versions and has authority to revert to manual process.',
    },
    redesignData: {
      components: [
        { name: 'Master copy created', type: 'human', description: 'Copywriter creates master narrative and key messages', risks: [], considerations: ['This is the creative work and stays fully human'] },
        { name: '_parallel_start', type: 'deterministic', description: '', risks: [], considerations: [] },
        { name: 'Channel adaptation', type: 'llm', description: 'Generate channel-specific text versions from master copy', risks: ['Tone drift from brand voice'], considerations: ['Prompt with brand guidelines'], _track: 'top' },
        { name: 'Copywriter approval', type: 'human', description: 'Reviews and refines generated text for tone, accuracy and brand voice', risks: ['Review fatigue'], considerations: ['Batch review interface'], _track: 'top' },
        { name: 'Content formatting', type: 'deterministic', description: 'Resize and reformat visual assets to exact platform specs', risks: ['Template changes when platforms update'], considerations: ['Figma auto-layout or scripted templates'], _track: 'bottom' },
        { name: 'Creative approval', type: 'human', description: 'Checks that resized images still suit each channel', risks: ['Missed issues if reviewing too many at once'], considerations: ['Visual comparison tool'], _track: 'bottom' },
        { name: '_parallel_end', type: 'deterministic', description: '', risks: [], considerations: [] },
        { name: 'Campaign summary', type: 'llm+tool', description: 'Assemble all channel versions and assets into a readable campaign overview with structured input from the approved text and formatted images', risks: ['Could misrepresent what was approved', 'Missing versions if process is bypassed'], considerations: ['Summary should reference not rewrite the approved content'] },
        { name: 'Lead approval', type: 'human', description: 'Content lead reviews the complete campaign package and approves', risks: ['Bottleneck if slow'], considerations: ['Single view of everything'] },
        { name: 'Publishing', type: 'tool', description: 'Publish approved versions to each channel and log what went where', risks: ['Integration failures with platforms'], considerations: ['Use existing publishing tools'] },
      ],
      boundaries: ['No publishing without human approval', 'No unlicensed visual assets', 'No brand-unsafe or legally sensitive claims without review'],
      confidentiality: ['Campaign briefs may contain unreleased product information', 'Consider whether draft content can be processed by a cloud LLM', 'Client campaign data may require a local model'],
      costFactors: ['LLM cost per channel adaptation (multiply by number of campaigns)', 'A smaller fine-tuned model may produce more consistent brand voice cheaper', 'Deterministic tools (Figma, templates) have fixed licensing costs'],
      humanCheckpoints: ['Content lead approves all channel versions', 'Creative strategist reviews master narrative', 'Legal review for sensitive claims'],
    },
    workflow: {
      name: 'campaign-adaptation-overload',
      steps: [
        { id: 's1', name: 'Copywriter creates the master narrative and key messages', owner: 'copywriter', pain: 'This is the creative work and usually done well' },
        { id: 's2', name: 'Copywriter manually rewrites the narrative for each channel (LinkedIn, email, website, social)', owner: 'copywriter', pain: 'Same message rewritten 4-5 times with different tone and length' },
        { id: 's3', name: 'Designer creates or resizes visual assets for each channel', owner: 'designer', pain: 'Assets named inconsistently, hard to track versions' },
        { id: 's4', name: 'Content lead reviews all versions through Slack and email', owner: 'content lead', pain: 'Review is ad hoc, versions get lost, things slip through' },
        { id: 's5', name: 'Versions published separately to each channel', owner: 'various', pain: 'No single view of what was published where' },
      ],
      actors: ['content lead', 'copywriter', 'designer'],
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
    painPoint: 'Finance teams spend most of the reporting cycle on assembly, not analysis. They pull data from multiple systems, reconcile it in spreadsheets, calculate variances, write commentary describing what the numbers mean and chase down qualitative context from CRM notes and team updates. By the time the report reaches the CFO, the team has spent a week on logistics and has little time left for actual insight.',
    discoveryMethod: 'Interviews with finance leads revealed 60-70% of reporting time spent on assembly and formatting. Process walkthrough of the month-end close showed manual data pulls reconciled in spreadsheets. The CFO consistently flagged two problems: reports arrived late and lacked qualitative context about what was actually happening in the pipeline.',
    whyAI: 'AI fits in two specific places: drafting variance commentary from computed numbers, and surfacing qualitative signals from unstructured sources like CRM notes and team updates. Everything else in the pipeline (data pulls, reconciliation, calculations, report formatting) is better solved with integration tooling, rules-based automation and templates. The maths must stay deterministic. An LLM generating financial projections is a risk, not a feature.',
    userDescription: 'Our finance team spends most of the reporting cycle pulling data, reconciling it and writing commentary. The numbers are already calculated in spreadsheets and they are fine. What takes forever is writing the variance commentary (describing why the numbers moved) and chasing down qualitative context from CRM notes and Slack threads. I want the commentary drafted automatically from the computed numbers and I want the system to surface signals the team would otherwise miss or spend hours finding. The actual maths must not be touched. The CFO must approve everything. And the financial data is confidential so it should not leave our systems.',
    redesign: `The full reporting pipeline has 8 steps. The AI pilot targets steps 4 and 5 only. Everything else stays as it is or improves through non-AI automation.

1. Data collection: pull numbers from CRM, ERP and billing via APIs. This is an integration problem, not an AI problem. Deterministic tooling.

2. Reconciliation: match records across systems and fix discrepancies. Rules-based automation. You want deterministic matching, not probabilistic.

3. Variance calculation: compute actuals vs budget, margins, KPIs. Spreadsheets or SQL. Maths stays deterministic. Non-negotiable.

4. Variance commentary (AI pilot): take the computed deltas (revenue missed by 8%, costs up 3%) and draft narrative explanations. The LLM generates first-draft commentary from structured numbers plus qualitative context. It connects the dots: "revenue missed because three enterprise deals slipped, per CRM stage changes and account executive notes from weeks 2 and 3."

5. Qualitative signal surfacing (AI pilot): scan CRM notes, deal updates, Slack threads and team updates. Surface signals that explain why the numbers moved: a champion left, a competitor was mentioned repeatedly, a key renewal is at risk. These are flagged as signals, not facts.

6. Analyst interpretation: the analyst decides what matters, what to escalate and what story to tell. This is the actual value of the finance team. AI surfaces inputs, the analyst decides framing and priority.

7. Report assembly: build the slide deck from templates. Formatting problem, not an AI problem. Could be automated in a later phase.

8. CFO review and approval: the CFO reviews, asks questions, approves. If steps 4 and 5 are better, this cycle gets shorter because there are fewer "but why?" follow-ups.

The pilot hypothesis: given that the numbers are already computed, can AI draft useful commentary and surface signals the team would have missed or taken hours to find?`,
    pilotPlan: {
      scope: 'One monthly business review for one business unit. Use last month\'s already-computed numbers as input. Test commentary drafting and signal surfacing only, not the data pipeline.',
      successCriteria: 'Commentary drafting time drops from 2 days to half a day. Finance team rates AI-drafted commentary as requiring only minor edits. At least 2 qualitative signals surfaced that the team would have missed. No AI-generated numbers appear in the output.',
      stopCriteria: 'AI-generated commentary misrepresents what the numbers mean. Generated numbers appear that look like calculations. Confidential data is exposed. Finance team does not trust the output.',
      timeline: '4 weeks covering one full reporting cycle. Midpoint check after the data is pulled and reconciled (before AI steps run).',
      owner: 'Finance team lead. Reviews all AI-generated output before it enters the report.',
    },
    redesignData: {
      components: [
        { name: 'Data collection', type: 'tool', description: 'Pull numbers from CRM, ERP and billing via APIs', risks: ['API changes', 'Incomplete data'], considerations: ['Integration tooling, not AI'] },
        { name: 'Reconciliation', type: 'deterministic', description: 'Rules-based matching across systems', risks: ['Edge cases'], considerations: ['Deterministic, not probabilistic'] },
        { name: 'Variance calculations', type: 'deterministic', description: 'All maths in spreadsheets or SQL', risks: [], considerations: ['Never LLM-generated'] },
        { name: 'Commentary drafting', type: 'llm', description: 'Draft variance explanations from computed deltas and qualitative context', risks: ['Could misrepresent what numbers mean', 'Could generate numbers that look calculated'], considerations: ['Label as AI draft', 'Numbers only from deterministic sources', 'Local model recommended'] },
        { name: 'Signal surfacing', type: 'rag', description: 'Scan CRM notes, deal updates, Slack threads for signals that explain why numbers moved', risks: ['Signals are pattern matches, not facts', 'Sensitive client information in sources'], considerations: ['Flag as signals not facts', 'Local model strongly recommended', 'Access control on source data'] },
        { name: 'Analyst review', type: 'human', description: 'Analyst decides what matters, what to escalate and what story to tell', risks: [], considerations: ['AI surfaces inputs, analyst decides framing'] },
        { name: 'Report assembly', type: 'deterministic', description: 'Template-based slide pack', risks: [], considerations: ['Formatting, not intelligence'] },
        { name: 'CFO approval', type: 'human', description: 'Nothing leaves without sign-off', risks: ['Bottleneck if unavailable'], considerations: ['Delegate for routine reports'] },
      ],
      boundaries: ['No LLM-generated financial calculations ever', 'No modification of source financial records', 'No external disclosure without CFO sign-off', 'All numbers must trace to a named source system and query', 'AI-generated commentary must be labelled as draft', 'Signals must be flagged as pattern matches not facts'],
      confidentiality: ['Financial projections are highly confidential and must not leave the organisation', 'Deal notes and CRM data contain sensitive client information', 'A local model is strongly recommended for both commentary and signal scanning', 'Board materials must not be processed by external APIs', 'Evaluate whether any data can be sent to a cloud service at all'],
      costFactors: ['LLM calls for commentary and signal scanning per reporting cycle (monthly or quarterly)', 'A smaller local model may handle routine variance commentary', 'API integration costs for data pulls are one-time setup', 'Deterministic components (reconciliation, calculations, assembly) are effectively free at scale'],
      humanCheckpoints: ['Analyst reviews and edits AI-generated commentary before it enters the report', 'Analyst decides which signals matter and how to frame them', 'CFO approves final report before distribution'],
    },
    workflow: {
      name: 'the-reporting-cycle-problem',
      steps: [
        { id: 's1', name: 'Pull data from CRM, ERP and billing systems', owner: 'finance analyst', pain: 'Multiple systems, different formats, manual exports' },
        { id: 's2', name: 'Reconcile data across systems in a spreadsheet', owner: 'finance analyst', pain: 'Takes 1-2 days, error-prone' },
        { id: 's3', name: 'Calculate variances, margins and KPIs', owner: 'finance analyst', pain: 'Complex but deterministic, done in spreadsheets' },
        { id: 's4', name: 'Write variance commentary explaining why numbers moved', owner: 'finance analyst', pain: 'Takes 1-2 days, mostly describing numbers already computed' },
        { id: 's5', name: 'Chase down qualitative context from CRM notes, Slack, team updates', owner: 'finance analyst', pain: 'Most manual and ad-hoc step, signals scattered everywhere' },
        { id: 's6', name: 'Decide what matters and frame the story', owner: 'finance analyst', pain: 'The actual analytical work, but barely any time left for it' },
        { id: 's7', name: 'Build slide pack for CFO and board', owner: 'finance analyst', pain: 'Formatting and layout' },
        { id: 's8', name: 'CFO reviews, asks questions, approves', owner: 'CFO', pain: 'Often asks "what is actually happening?" because the report lacks context' },
      ],
      actors: ['finance analyst', 'CFO'],
      data_assets: ['ERP actuals', 'CRM pipeline', 'billing data', 'deal notes', 'team updates'],
      success_metrics: ['reporting_cycle_days', 'time_on_commentary_vs_analysis', 'signal_coverage', 'cfo_follow_up_questions'],
      qualification: { business_impact: 5, frequency: 4, baseline_measurability: 5, data_readiness: 4, boundary_clarity: 5, pilotability: 3 },
    },
  },
];
