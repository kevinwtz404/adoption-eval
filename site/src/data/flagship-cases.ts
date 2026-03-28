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
  simplifiedInputs: {
    systemsStack: string[];
    technicalCapacity: 'no-developers' | 'some-technical' | 'dedicated-dev';
    budgetBand: '<100' | '100-500' | '500-2k' | '2k+';
    buildPreference: 'existing-tools' | 'open-to-custom' | 'no-preference';
  };
  playbookContent: {
    costRange: string;
    whatWereTesting: string;
    howItWorks: string;
    guardrails: string[];
    risksAndMitigations: Array<{ risk: string; mitigation: string }>;
    twoWeekPlan: string;
    stopCriteria: string[];
    whatTheTeamNeedsToKnow: string;
    howWellMeasure: string;
  };
  pilotPlan: {
    scope: string;
    successCriteria: string;
    stopCriteria: string;
    timeline: string;
    owner: string;
  };
  boundaryDefaults: Record<string, { choice: string; detail: string }>;
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
    simplifiedInputs: {
      systemsStack: ['google-workspace', 'slack'],
      technicalCapacity: 'some-technical',
      budgetBand: '100-500',
      buildPreference: 'existing-tools',
    },
    playbookContent: {
      costRange: '$100-400',
      whatWereTesting: 'A retrieval system that lets team members ask questions and get answers from internal docs, wikis and decision logs through a single interface, with source citations and confidence-based escalation. The pilot tests whether this reduces time-to-answer and duplicate questions for one team over 2 weeks.',
      howItWorks: `- Someone asks a question through a single interface (chat or Slack command).
- A retrieval system searches indexed internal sources (docs, wikis, decision logs) respecting existing document permissions.
- An LLM generates an answer with citations showing where each piece of information came from.
- If confidence is high, the answer shows directly. If low, it escalates to a person and shows what it found so far.
- Answers are captured and become searchable for next time.

### Systems
Google Workspace, Slack, internal wikis, document storage.

### Team and ownership
- Ops lead: pilot owner, authority to pause and restrict access.
- Team members (10-15): ask real questions during the pilot.
- IT/admin: initial setup and permission mapping.

### What stays human
- All strategic decisions and judgement calls.
- Escalation handling when the system is not confident.
- Document permission management and updates.`,
      guardrails: [
        'Document permissions enforced at retrieval time. The system only surfaces what the user is allowed to see.',
        'All AI-generated answers labelled as such and include source citations.',
        'Low-confidence answers escalate to a person instead of showing directly.',
        'No modification of source documents by the system.',
        'Full audit trail for all queries and answers.',
      ],
      risksAndMitigations: [
        { risk: 'Hallucinated answers that sound plausible but are wrong', mitigation: 'Mandatory source citations on every answer. Users trained to verify before acting.' },
        { risk: 'Confidential documents surfaced to the wrong person', mitigation: 'Permission check built into retrieval layer, mirroring existing access controls. Tested before launch.' },
        { risk: 'Stale documents producing outdated answers', mitigation: 'Re-index weekly. Flag document age in answer metadata.' },
        { risk: 'Users over-trusting AI-generated answers', mitigation: 'Clear labelling on every response. Escalation path visible.' },
      ],
      twoWeekPlan: `### Week 1: Configure and baseline
- Day 1-2: Set up retrieval system, connect document sources, configure permission mapping.
- Day 3: Index documents and run test queries against known answers.
- Day 4: Test permission controls. Verify a restricted document does not surface to an unauthorised user.
- Day 5: Brief the pilot team (10-15 users). Explain what is being tested, how to flag issues, and that this is a trial.
- Establish baseline: how long does it currently take to find an answer? How many duplicate questions per week?

### Week 2: Operate and evaluate
- Day 6-8: Team uses the system for real questions. Log all queries and satisfaction.
- Day 9: Midpoint check. Review answer quality, citation accuracy, escalation rate.
- Day 10: Final day of active use. Collect feedback from each user.
- End of week: Ops lead reviews all metrics and makes the Scale / Revise / Stop call.`,
      stopCriteria: [
        'System surfaces confidential documents to someone who should not see them.',
        'More than 30% of answers are factually wrong when checked against sources.',
        'Users stop using the system within the first week.',
        'Citation accuracy drops below 80%.',
      ],
      whatTheTeamNeedsToKnow: 'This is a 2-week trial of a question-answering tool that searches our internal docs. It is not replacing anyone. Every answer shows where it came from so you can check it. If it is not confident, it will ask a person instead of guessing. Your feedback on answer quality is the most important thing we are measuring.',
      howWellMeasure: `**Time:** Time to find an answer should drop by at least 50%.
**Cost:** LLM API costs should stay within the pilot budget for the test period.
**Quality:** 80% of answers should include correct source citations. Fewer than 10% should need escalation.
**Risk:** Zero incidents of confidential documents surfaced to the wrong user.
**Adoption:** Users should ask at least 5 questions per week and report the tool as useful.
**Control:** All answers traceable to source documents. Full audit log.

Faster alone is not success. If answers are quick but wrong, the pilot has failed.

**Scale:** Time savings confirmed, citations accurate, permissions hold, team trusts it.
**Revise:** Useful but citation quality or confidence thresholds need adjustment.
**Stop:** Permission breach, low trust, or answers consistently wrong.`,
    },
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
      metrics: { time: 'Time to find an answer drops by 50%', cost: 'LLM API costs stay under budget for the test period', quality: '80% of answers include correct source citations', risk: 'No confidential documents surfaced to wrong users', adoption: 'Users ask at least 5 questions per week', control: 'All answers traceable to source documents' },
    },
    boundaryDefaults: {
      'review-text': { choice: 'yes', detail: '' },
      'numbers-deterministic': { choice: 'yes', detail: '' },
      'verify-retrieved': { choice: 'yes', detail: '' },
      'data-local': { choice: 'partly', detail: 'Depends on document sensitivity. Some internal docs may contain client data.' },
      'access-permissions': { choice: 'yes', detail: '' },
      'model-size': { choice: 'yes', detail: '' },
      'scale-cost': { choice: 'partly', detail: 'Estimate per-question cost but do not let it block the pilot.' },
      'approval-gate': { choice: 'partly', detail: 'Low-confidence answers escalate to a person. High-confidence go direct.' },
      'fallback': { choice: 'yes', detail: '' },
      'transparency': { choice: 'yes', detail: '' },
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
    simplifiedInputs: {
      systemsStack: ['salesforce', 'slack'],
      technicalCapacity: 'some-technical',
      budgetBand: '100-500',
      buildPreference: 'open-to-custom',
    },
    playbookContent: {
      costRange: '$150-500',
      whatWereTesting: 'An automated lead enrichment and outreach drafting system. When a new lead arrives, it is automatically researched via APIs and an LLM drafts a personalised outreach message. The sales rep reviews and approves everything before it goes out. The pilot tests whether this reduces research time per lead while maintaining or improving outreach quality.',
      howItWorks: `- New lead arrives from marketing or inbound.
- The system pulls data from LinkedIn, company website and news via API calls.
- An LLM summarises the findings into a short profile: what the company does, recent developments, relevant context.
- Based on the profile, the LLM drafts a personalised outreach message following team guidelines.
- The sales rep reviews both the research summary and draft outreach. They edit or approve before sending.
- Nothing is sent without explicit rep approval. Enriched data and outreach history saved to CRM.

### Systems
Salesforce, Slack, LinkedIn API, email.

### Team and ownership
- Sales team lead: pilot owner, reviews enrichment quality daily.
- One sales rep: uses the tool for all new leads during the pilot.
- RevOps: CRM integration and data mapping.

### What stays human
- All outreach approval. Nothing sent without the rep clicking approve.
- Relationship judgement and tone adjustments.
- Decisions about which leads to pursue.`,
      guardrails: [
        'No outreach sent without explicit rep approval.',
        'All enrichment sources logged and verifiable.',
        'Rep can see exactly what the system found and what it drafted.',
        'Lead personal data handled per privacy regulations.',
        'Outreach drafts follow team guidelines and reference specific details, not generic templates.',
      ],
      risksAndMitigations: [
        { risk: 'Enrichment data is wrong or outdated', mitigation: 'Sources logged on every enrichment. Rep verifies key facts before sending.' },
        { risk: 'Outreach tone does not match rep style', mitigation: 'Rep reviews and edits every draft. System learns from edits over time.' },
        { risk: 'Rep rubber-stamps without reading', mitigation: 'Review interface designed to make reading easy but not skippable. Key facts highlighted.' },
        { risk: 'API rate limits or enrichment failures', mitigation: 'Graceful fallback: rep sees what was found, even if incomplete. Manual research remains available.' },
      ],
      twoWeekPlan: `### Week 1: Configure and baseline
- Day 1-2: Set up enrichment API connections and CRM integration.
- Day 3: Configure outreach template and team guidelines in the prompt.
- Day 4: Test with 5 known leads. Check enrichment accuracy and draft quality.
- Day 5: Brief the pilot rep. Walk through the review interface. Establish baseline: current time per lead, current response rate.

### Week 2: Operate and evaluate
- Day 6-8: Rep uses the system for all new leads (target: 20 leads). Log time per lead, edits made, satisfaction.
- Day 9: Midpoint check. Review enrichment quality and outreach personalisation with the rep.
- Day 10: Final batch of leads. Collect rep feedback on trust and usability.
- End of week: Sales team lead compares time, quality and response rate against baseline.`,
      stopCriteria: [
        'Enrichment data is consistently wrong or outdated for more than 3 leads in a row.',
        'Outreach drafts require more editing time than writing from scratch.',
        'Rep loses trust in the tool and stops using it.',
        'Response rate drops significantly compared to baseline.',
      ],
      whatTheTeamNeedsToKnow: 'We are testing a tool that automatically researches new leads and drafts personalised outreach. One rep is trialling it for 2 weeks. Nothing goes out without the rep reading and approving it. We are measuring whether it saves time without hurting outreach quality.',
      howWellMeasure: `**Time:** Research time per lead should drop from 15 minutes to under 2 minutes.
**Cost:** API and LLM costs should stay reasonable per lead at pilot volume.
**Quality:** Outreach personalisation rated as equal or better by the rep. No incorrect company information in sent messages.
**Risk:** No privacy violations. No outreach sent without approval.
**Adoption:** Rep uses the tool for every lead, not just some. Reports it as useful.
**Control:** All enrichment sources logged. All drafts traceable.

Faster alone is not success. If outreach is quick but generic, the pilot has failed.

**Scale:** Time savings confirmed, outreach quality maintained, rep trusts the tool.
**Revise:** Useful but enrichment accuracy or tone needs work.
**Stop:** Consistently wrong data, quality decline, or rep rejection.`,
    },
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
      metrics: { time: 'Research time per lead drops from 15 minutes to under 2 minutes', cost: 'API costs per lead stay reasonable at volume', quality: 'Outreach personalisation rated equal or better by the rep', risk: 'No incorrect company information in outreach', adoption: 'Rep uses the tool for every lead, not just some', control: 'All enrichment sources logged and verifiable' },
    },
    boundaryDefaults: {
      'review-text': { choice: 'yes', detail: '' },
      'numbers-deterministic': { choice: 'no', detail: '' },
      'verify-retrieved': { choice: 'yes', detail: '' },
      'data-local': { choice: 'partly', detail: 'Lead data is not highly sensitive but depends on jurisdiction.' },
      'access-permissions': { choice: 'no', detail: '' },
      'model-size': { choice: 'yes', detail: '' },
      'scale-cost': { choice: 'partly', detail: 'Per-lead costs matter at volume.' },
      'approval-gate': { choice: 'yes', detail: '' },
      'fallback': { choice: 'yes', detail: '' },
      'transparency': { choice: 'partly', detail: 'Internal team knows. Customer does not need to.' },
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
    simplifiedInputs: {
      systemsStack: ['google-workspace', 'slack'],
      technicalCapacity: 'no-developers',
      budgetBand: '<100',
      buildPreference: 'existing-tools',
    },
    playbookContent: {
      costRange: '$50-200',
      whatWereTesting: 'An LLM-based channel adaptation tool that generates LinkedIn, email, website and social versions from a master campaign narrative. The copywriter reviews and refines each version instead of writing from scratch. The pilot tests whether this cuts adaptation time by 60% while maintaining brand voice across one campaign.',
      howItWorks: `- Copywriter creates the master narrative and key messages. This stays fully human.
- The system generates channel-specific text versions: LinkedIn (professional tone), email (conversational with CTA), website (scannable), social (short, punchy).
- Copywriter reviews and approves each generated version, editing for brand voice.
- In parallel, deterministic tools reformat visual assets to platform specs.
- Content lead reviews the complete campaign package in one place and approves.
- Approved versions published via existing tools. System logs what went where and when.

### Systems
Google Workspace, Slack, existing publishing tools, asset library.

### Team and ownership
- Content lead: pilot owner, reviews all versions, authority to revert to manual.
- Copywriter: creates master copy, reviews generated versions.
- Designer: checks reformatted visuals.

### What stays human
- All creative direction and master narrative creation.
- Final approval of every channel version before publishing.
- Brand voice judgement and tone adjustments.`,
      guardrails: [
        'No content published without human approval from both copywriter and content lead.',
        'All generated text clearly labelled as AI-generated during review.',
        'Brand guidelines embedded in the generation prompt.',
        'No unlicensed visual assets or legally sensitive claims without review.',
        'Full lineage from master copy to each channel version.',
      ],
      risksAndMitigations: [
        { risk: 'Generated versions drift from brand voice', mitigation: 'Brand guidelines in the prompt. Copywriter reviews every version.' },
        { risk: 'Review fatigue leads to rubber-stamping', mitigation: 'Batch review interface that highlights differences from master copy.' },
        { risk: 'Campaign briefs contain unreleased product info sent to cloud LLM', mitigation: 'Review what is sent in the prompt. Strip confidential details if needed.' },
        { risk: 'Generated content misses channel-specific nuance', mitigation: 'Copywriter edits for nuance. Track edit volume to assess quality over time.' },
      ],
      twoWeekPlan: `### Week 1: Configure and baseline
- Day 1-2: Set up the LLM prompt with brand guidelines, tone rules and channel specs.
- Day 3: Run a test campaign through the system. Compare generated versions against a manually written set.
- Day 4: Copywriter and content lead review test output. Adjust prompt based on feedback.
- Day 5: Establish baseline: how long does a full campaign adaptation take today?

### Week 2: Operate and evaluate
- Day 6-7: Run one real campaign through the system. Copywriter reviews all generated versions.
- Day 8: Content lead reviews complete package in one view. Track time and edit volume.
- Day 9: If time allows, run a second campaign. Compare quality and speed.
- Day 10: Collect feedback from copywriter and content lead. Measure against baseline.`,
      stopCriteria: [
        'Generated versions consistently miss brand voice and require complete rewrites.',
        'Copywriter spends more time editing generated text than writing from scratch.',
        'Content lead rejects more than 30% of generated versions.',
        'Unreleased product information appears in generated content.',
      ],
      whatTheTeamNeedsToKnow: 'We are testing whether an LLM can generate channel versions of our campaign copy so the copywriter reviews instead of rewriting from scratch. The creative work stays with people. Nothing gets published without the same approval process we use now. We are measuring time savings and whether brand voice holds up.',
      howWellMeasure: `**Time:** Time from master copy to all channel versions ready should drop by 60%.
**Cost:** LLM costs per campaign should be well within budget.
**Quality:** Generated versions need only minor edits. Brand consistency improves across channels.
**Risk:** No brand-unsafe content published. No confidential information leaked.
**Adoption:** Copywriter prefers reviewing generated versions over writing from scratch.
**Control:** All versions tracked with lineage from master copy. Full audit of what was published where.

Faster alone is not success. If it is quicker but the brand voice suffers, the pilot has failed.

**Scale:** Time savings confirmed, quality maintained, team prefers the new workflow.
**Revise:** Useful but prompt needs tuning for specific channels or brand voice.
**Stop:** Quality decline, excessive editing, or team rejection.`,
    },
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
      metrics: { time: 'Time from master copy to all channel versions drops by 60%', cost: 'LLM costs per campaign are acceptable', quality: 'Generated versions need only minor edits, brand consistency improves', risk: 'No brand-unsafe content published', adoption: 'Copywriter prefers reviewing generated versions over writing from scratch', control: 'All versions tracked with lineage from master copy' },
    },
    boundaryDefaults: {
      'review-text': { choice: 'yes', detail: '' },
      'numbers-deterministic': { choice: 'no', detail: '' },
      'verify-retrieved': { choice: 'no', detail: '' },
      'data-local': { choice: 'partly', detail: 'Campaign briefs may contain unreleased product information.' },
      'access-permissions': { choice: 'no', detail: '' },
      'model-size': { choice: 'yes', detail: '' },
      'scale-cost': { choice: 'yes', detail: '' },
      'approval-gate': { choice: 'yes', detail: '' },
      'fallback': { choice: 'yes', detail: '' },
      'transparency': { choice: 'partly', detail: 'Internal team knows AI is involved. External audience does not need to.' },
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
    simplifiedInputs: {
      systemsStack: ['microsoft-365', 'salesforce', 'xero'],
      technicalCapacity: 'some-technical',
      budgetBand: '500-2k',
      buildPreference: 'open-to-custom',
    },
    playbookContent: {
      costRange: '$300-1,000',
      whatWereTesting: 'AI-assisted variance commentary and qualitative signal surfacing for the monthly business review. The numbers stay deterministic. The AI drafts explanations of why numbers moved and surfaces signals from CRM notes and team updates that the team would otherwise spend hours finding. The pilot covers one reporting cycle for one business unit.',
      howItWorks: `- Data collection, reconciliation and variance calculations remain unchanged. Deterministic. Non-negotiable.
- AI drafts variance commentary from the computed deltas plus qualitative context. It connects the dots: "revenue missed because three enterprise deals slipped, per CRM stage changes and AE notes."
- AI scans CRM notes, deal updates, Slack threads and team updates. Surfaces signals that explain why numbers moved. These are flagged as signals, not facts.
- The finance analyst decides what matters, what to escalate and what story to tell. This is the actual analytical work.
- Report assembled from templates. CFO reviews and approves.

### Systems
Microsoft 365, Salesforce, Xero, ERP, CRM notes, Slack.

### Team and ownership
- Finance team lead: pilot owner, reviews all AI output before it enters the report.
- Finance analyst: uses AI-drafted commentary as a starting point, decides framing.
- CFO: final approval, nothing leaves without sign-off.

### What stays human
- All financial calculations. No LLM-generated numbers, ever.
- Analyst interpretation and story framing.
- CFO approval of the final report.
- Decisions about what to escalate.`,
      guardrails: [
        'No LLM-generated financial calculations. All numbers from deterministic sources only.',
        'AI-generated commentary labelled as draft until analyst approves.',
        'Signals flagged as pattern matches, not facts.',
        'Financial data stays within organisational systems. Local model strongly recommended.',
        'No modification of source financial records.',
        'All numbers traceable to a named source system and query.',
        'CFO approval required before any distribution.',
      ],
      risksAndMitigations: [
        { risk: 'AI commentary misrepresents what the numbers mean', mitigation: 'Analyst reviews every line. Commentary labelled as draft. Numbers always from deterministic source.' },
        { risk: 'LLM generates numbers that look calculated but are fabricated', mitigation: 'Architecture enforces separation: LLM handles language only, never produces numerical values.' },
        { risk: 'Confidential financial data sent to external API', mitigation: 'Local model strongly recommended. If cloud model used, no board materials or projections in prompts.' },
        { risk: 'Signals from CRM notes misattributed or taken as fact', mitigation: 'All signals labelled as pattern matches with source references. Analyst decides which are relevant.' },
      ],
      twoWeekPlan: `### Week 1: Configure and baseline
- Day 1-2: Set up data connections. Map CRM fields and financial data sources. Configure local model if using one.
- Day 3: Use last month's already-computed numbers as test input. Generate draft commentary.
- Day 4: Finance analyst reviews generated commentary against what they actually wrote last month. Score accuracy.
- Day 5: Test signal surfacing against known events from last month. Did it catch what mattered?
- Establish baseline: how long did last month's commentary and context-gathering take?

### Week 2: Operate and evaluate
- Day 6-7: Run the system on this month's real data as numbers come in. Generate commentary drafts daily.
- Day 8: Analyst uses AI-drafted commentary as starting point for the real report. Track time and edit volume.
- Day 9: Signal surfacing runs against current CRM and Slack data. Analyst reviews what it found.
- Day 10: Complete the reporting cycle. CFO reviews. Measure total time vs baseline.
- End of week: Finance team lead compares time savings, quality, and whether the CFO had fewer follow-up questions.`,
      stopCriteria: [
        'AI-generated commentary misrepresents what the numbers mean.',
        'Generated numbers appear that look like calculations.',
        'Confidential financial data is exposed outside the organisation.',
        'Finance team does not trust the output and reverts to manual process.',
      ],
      whatTheTeamNeedsToKnow: 'We are testing whether AI can draft the variance commentary and surface qualitative signals, so the team spends more time on analysis and less on assembly. The actual numbers are not touched. Everything the AI produces is a draft that the analyst reviews. The CFO approval process does not change.',
      howWellMeasure: `**Time:** Commentary drafting should drop from 2 days to half a day.
**Cost:** LLM costs per reporting cycle justified by time savings.
**Quality:** AI-drafted commentary needs only minor edits. No fabricated numbers appear anywhere.
**Risk:** Zero AI-generated numbers in the final report. No confidential data exposure.
**Adoption:** Finance team trusts the output enough to use it as a starting point.
**Control:** All AI output labelled as draft. All numbers traceable to source systems. Full audit trail.

Faster alone is not success. If the report is quicker but less trustworthy, the pilot has failed.

**Scale:** Time savings confirmed, quality maintained, CFO asks fewer follow-up questions.
**Revise:** Commentary useful but signal quality or confidence thresholds need adjustment.
**Stop:** Trust breakdown, data exposure, or fabricated numbers.`,
    },
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
      metrics: { time: 'Commentary drafting drops from 2 days to half a day', cost: 'LLM costs per reporting cycle are justified by time savings', quality: 'AI-drafted commentary needs only minor edits, no fabricated numbers', risk: 'No AI-generated numbers appear in the report', adoption: 'Finance team trusts the output enough to use it as a starting point', control: 'All AI output labelled as draft, all numbers traceable to source systems' },
    },
    boundaryDefaults: {
      'review-text': { choice: 'yes', detail: '' },
      'numbers-deterministic': { choice: 'yes', detail: '' },
      'verify-retrieved': { choice: 'yes', detail: '' },
      'data-local': { choice: 'yes', detail: '' },
      'access-permissions': { choice: 'yes', detail: '' },
      'model-size': { choice: 'partly', detail: 'Commentary may need a capable model. Signal scanning could use a smaller one.' },
      'scale-cost': { choice: 'yes', detail: '' },
      'approval-gate': { choice: 'yes', detail: '' },
      'fallback': { choice: 'yes', detail: '' },
      'transparency': { choice: 'yes', detail: '' },
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
