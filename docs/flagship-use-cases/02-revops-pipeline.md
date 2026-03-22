# flagship use case 02: revenue operations pipeline

## one-line objective
Replace fragmented, manual sales operations with an intelligent pipeline that enriches leads, maintains CRM quality, and gives revenue leaders a trusted funnel view.

## core problem
Sales teams spend too much time on data entry, lead research, and CRM hygiene. Data decays quickly, tool overlap is high, and forecast confidence drops because records are stale.

## discovery method
- champion workshops with RevOps + sales managers
- tech stack audit showing overlapping tools and manual integration gaps
- workplace shadowing of AEs showing repeat enrich-update-copy cycles
- retrospective/pipeline review showing stale fields and missed hygiene patterns

## candidate signals
- extreme repetition: same enrich/qualify/update loop per lead
- measurable baseline: response time, field completion, velocity, forecast variance
- direct business impact: pipeline quality affects conversion and forecasting
- clear boundaries: outreach, pricing, and forecast sign-off remain human

## why AI specifically
- AI can enrich/structure lead context at scale
- AI can continuously surface hygiene risks and missing data
- conversational CRM interfaces reduce admin burden for reps

## non-AI filter (important)
exclude root causes unrelated to workflow intelligence (e.g., territory policy conflicts, comp-plan design, staffing shortages). those are org design issues, not AI adoption targets.

## target users
- account executives / sales reps
- sales managers
- RevOps leads
- CRO / VP sales

## workflow in scope
1. lead arrives
2. auto-enrich with company/contact context
3. score against ICP criteria
4. route to correct rep with context summary
5. monitor CRM hygiene continuously (stale fields, conflicts, missing data)
6. generate weekly pipeline health summary

## system architecture (tool-gated pattern)
- **enrichment MCP**: gathers and normalises external/public lead data
- **CRM MCP**: controlled read/write to contact/deal objects
- **scoring MCP**: deterministic rule-based ICP scoring + explainability
- **hygiene MCP**: stale/conflict detection with evidence links
- **outbound approval MCP**: required gate before prospect-facing outbound actions

## hard boundaries
- no autonomous outbound communication without human approval
- no deal-stage/forecast changes without owner confirmation
- no non-consented personal data use
- all enrichment sources logged for traceability
- pricing and discount decisions stay fully human

## could / should / must-stay-human
- could automate:
  - lead enrichment and field population
  - initial qualification scoring
  - CRM hygiene alerts
  - weekly pipeline summaries
- should automate:
  - duplicate lead/contact detection
  - stale deal flagging with evidence
  - source logging and confidence tagging
- must stay human:
  - strategic account qualification calls
  - outbound messaging and relationship management
  - pricing, discounting, and contract decisions
  - forecast sign-off

## success metrics (pilot)
- enrichment completeness at lead arrival
- time from lead arrival to first rep action
- CRM field accuracy at 30/60/90 days
- number of overlapping tools reduced
- forecast accuracy vs actual close outcomes

## likely failure modes to teach users
- enrichment can be outdated; verify before outreach
- scoring is guidance, not truth
- over-automation can hide atypical high-value opportunities
- rep trust drops if alerts feel punitive not supportive

## outputs we should generate
- `enrichment-log.json`
- `pipeline-health-summary.md`
- `icp-scoring-model.json`
- `tool-consolidation-map.csv`
- `risk-and-boundary-checklist.md`
