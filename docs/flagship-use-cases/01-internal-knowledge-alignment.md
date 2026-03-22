# flagship use case 01: internal knowledge alignment copilot

## one-line objective
Help teams find trusted internal knowledge quickly, understand ownership, and keep everyone aligned on decisions and terminology.

## core problem
Teams waste time because knowledge is fragmented across docs, chats, and tools. People use different terms for the same concepts, duplicate work, and lose context on why decisions were made.

## discovery method
- champion workshops with ops/product leads surfaced repeated alignment pain
- workplace shadowing showed staff checking 3-5 tools before finding trusted answers
- time-spend analysis showed 5-6 hours/week per lead spent manually answering repeat questions

## candidate signals
- high volume: repeated internal questions across teams
- high repetition: answers already exist but are hard to retrieve
- measurable baseline: time-to-answer and duplicate question rates are trackable
- clear boundary: retrieval and summarisation can be automated; strategic decisions cannot

## why AI specifically
- this is a retrieval + synthesis problem across mixed unstructured sources
- AI improves speed/consistency while keeping judgement with humans
- permission-aware retrieval + cited answers map directly to the need

## non-AI filter (important)
not every pain belongs here. exclude non-workflow/non-information issues (e.g., office comfort, building access, seating constraints) and route those to workplace ops.

## target users
- ops leads
- product managers
- team leads
- new joiners

## workflow in scope
1. ingest internal sources (docs, notes, decision logs, trackers)
2. classify/tag by topic, owner, project, status
3. answer internal questions with citations + confidence
4. show owner and active workstream for each answer
5. produce weekly alignment brief (what changed, who owns what, open decisions)

## system architecture (tool-gated pattern)
- **knowledge MCP**: read-only retrieval from approved internal sources
- **permissions MCP**: enforces role-based access before retrieval
- **terminology MCP**: suggests canonical term mappings
- **summary MCP**: drafts alignment updates from retrieved evidence
- **human approval MCP**: required for edits to source-of-truth docs

## hard boundaries
- no external sharing of internal material
- permission-aware retrieval only
- no answer without source traceability
- no automatic edits to source-of-truth docs without human approval

## could / should / must-stay-human
- could automate:
  - search and retrieval
  - terminology normalisation suggestions
  - weekly alignment summary drafts
- should automate:
  - source linking and owner lookup
  - duplicate topic detection
- must stay human:
  - final decision-making
  - sensitive strategic interpretation
  - conflict resolution between teams

## success metrics (pilot)
- median time-to-answer for internal questions
- % answers with trusted citations
- reduction in duplicate requests/questions
- stakeholder confidence score in answer quality

## likely failure modes to teach users
- stale sources produce stale answers
- missing permissions hide relevant context
- citation present does not always mean correct interpretation

## outputs we should generate
- `knowledge-map.json`
- `owner-topic-matrix.csv`
- `alignment-brief.md`
- `risk-and-boundary-checklist.md`
