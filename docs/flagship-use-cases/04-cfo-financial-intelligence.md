# flagship use case 04: CFO financial intelligence assistant

## one-line objective
Give the CFO's team faster, more trusted financial reporting by automating the assembly and narrative work around forecasts, margins, and variance — while keeping the actual numbers deterministic and human-approved.

## core problem
FP&A teams spend the majority of their reporting cycle not on analysis but on assembly: pulling data from 5+ systems, reconciling formats, building slide packs, and writing commentary. By the time the numbers reach the CFO, the team has spent a week on logistics and has little time left for insight. Meanwhile, qualitative signals (deal risk, market shifts, operational issues) live in CRM notes and Slack threads — disconnected from the financial view.

## discovery method
- structured interviews with FP&A leads and finance directors revealed 60-70% of reporting cycle time spent on data assembly and formatting, not analysis
- process walkthrough of the month-end close showed manual data pulls from CRM, ERP, and billing systems reconciled in spreadsheets
- executive feedback consistently flagged two problems: forecasts arrived late and lacked qualitative context ("the number says 4.2M but what's actually happening in the pipeline?")
- time audit showed analysts spending 2-3 days per month writing board commentary and variance explanations for numbers they had already computed

## candidate signals
- high time cost: reporting cycle dominated by assembly, not judgement
- multi-system fragmentation: data lives across CRM, ERP, billing, and planning tools with no unified view
- qualitative gap: financial reports miss deal-level and operational context that lives in unstructured sources
- recurring cadence: same reporting workflow repeats monthly/quarterly — high automation leverage
- direct executive demand: CFOs explicitly ask for faster, more contextual reporting

## why AI specifically — and why not
this case requires a clear split between what AI should and should not do:

**AI should handle:**
- narrative generation: take deterministic outputs and draft board summaries, variance commentary, risk flags in plain language
- signal surfacing: scan deal notes, call transcripts, team updates for qualitative risk signals the spreadsheet doesn't capture
- report assembly: pull from multiple systems, structure the reporting pack, highlight what changed since last period
- pattern detection: flag anomalies in spend, margin drift, or forecast variance that a human might miss in volume

**AI should not handle:**
- the actual maths: forecasting calculations, margin computation, revenue recognition must stay deterministic and rules-based
- an LLM generating financial projections is a risk, not a feature — hallucinated numbers drive real decisions
- any number that reaches a board deck must have a clear, auditable, non-generative source

## system architecture (MCP tool-calling pattern)
this case showcases how hard boundaries are enforced through architecture, not just policy:

- **data MCP** — read-only access to CRM pipeline, ERP actuals, billing system. the agent can pull numbers but never write or modify financial records.
- **calculator MCP** — deterministic, rules-based engine for forecasting, margin calculation, and variance computation. no LLM involved in the maths. the agent calls it as a tool and gets structured output back.
- **narrative MCP** — this is where the LLM works. takes deterministic output from the calculator and generates commentary, flags, variance explanations, board-ready language.
- **signal scanner MCP** — reads deal notes, call transcripts, Slack threads, team updates. surfaces qualitative risk signals ("champion left the company", "competitor mentioned 3x this month"). flagged as signals, not facts.
- **human approval MCP** — the workflow pauses here. nothing gets sent, published, or marked as final until a human approves. this is a tool in the chain, not an afterthought.

this pattern means "must stay human" is not a policy line — it is an architectural gate that the system cannot bypass.

## target users
- CFO / VP finance
- FP&A analysts
- finance directors
- board reporting teams

## workflow in scope
1. pull actuals, pipeline, and billing data via data MCP (read-only)
2. run deterministic forecast and margin calculations via calculator MCP
3. scan unstructured sources for qualitative signals via signal scanner MCP
4. generate narrative: variance commentary, risk flags, board summary via narrative MCP
5. assemble reporting pack: structured data + narrative + signal highlights
6. route to human approval MCP — nothing is final until signed off
7. export approved pack (JSON for systems, Markdown/PDF for humans)

## hard boundaries
- no LLM-generated financial calculations — all maths is deterministic
- no modification of source financial records
- no external disclosure of projections without human sign-off
- all numbers must trace back to a named source system and query
- narrative must be clearly labelled as AI-generated draft, not audited output
- human approval required before any report leaves the system

## could / should / must-stay-human
- could automate:
  - data assembly from multiple systems
  - variance commentary first drafts
  - qualitative signal surfacing from unstructured sources
  - report formatting and pack assembly
- should automate:
  - anomaly detection in spend and margin patterns
  - cross-referencing pipeline signals with forecast inputs
  - change-since-last-period highlighting
- must stay human:
  - forecast sign-off and board-level projections
  - margin and pricing policy decisions
  - interpretation of qualitative signals for strategic action
  - final approval of any externally shared financial material

## success metrics (pilot)
- reduction in reporting cycle time (days from period close to board-ready pack)
- % of report assembly automated vs. manual
- forecast accuracy improvement (predicted vs. actual, measured quarterly)
- number of qualitative signals surfaced that were previously missed
- analyst time reclaimed for actual analysis vs. assembly

## likely failure modes to teach users
- narrative fluency is not accuracy — a well-written variance explanation can still be wrong if the underlying data pull had issues
- qualitative signals are pattern matches, not facts — always verify before acting
- over-trust in the assembled pack: the system structures and drafts, but a human must still read and challenge the output
- if source systems have bad data, the report inherits that — garbage in, polished garbage out

## outputs we should generate
- `forecast-report.json`
- `margin-analysis.json`
- `variance-commentary.md`
- `signal-flags.json`
- `board-pack-draft.md`
- `approval-log.csv`
- `risk-and-boundary-checklist.md`
