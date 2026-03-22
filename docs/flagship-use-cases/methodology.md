# workflow discovery and selection methodology

## why this document exists
adoption-eval evaluates workflows and produces implementation plans. but before you can evaluate a workflow, you need to find it. this document explains the methodology for discovering, screening, and selecting candidate workflows — the step that comes before everything else.

without this step, use cases appear out of thin air. with it, every case traces back to a structured discovery process with real evidence.

## where this sits in the overall flow

```
ai-readiness (is the org ready?)
    → workflow discovery (find + prioritise candidate workflows)  ← this doc
    → adoption-eval map (analyse the chosen workflow)
    → adoption-eval eval (score + plan)
```

ai-readiness tells you whether the organisation is ready. workflow discovery tells you which workflows are worth evaluating. adoption-eval tells you how to implement AI in the ones you choose.

## staged discovery flow (practical)
1. **input methods**: workshops, shadowing, time-spend analysis, tech-stack audit, retrospectives
2. **problem typing**: separate AI-suitable workflow pain from non-AI pain
3. **screening**: apply must-have signals, positive signals, red flags
4. **selection**: prioritise 3-5 candidates for mapping
5. **evaluation handoff**: convert selected candidates into `workflow-input` + evidence

## discovery methods

these are the practical methods for surfacing candidate workflows. a good discovery pass uses 2-3 of these in combination.

### 1. champion workshops
structured sessions with team leads and process owners to identify pain points, repetitive tasks, and known bottlenecks.

**how it works:**
- run 60-90 min facilitated sessions with 4-8 participants per team
- ask: "where does your team spend time on work that feels repetitive, manual, or low-value?"
- ask: "where do mistakes happen because of volume or complexity?"
- ask: "what would you automate tomorrow if you could?"
- capture workflows, not solutions — the goal is to surface candidates, not design systems

**what it reveals:**
- workflows with high perceived pain
- processes that teams already want to change
- internal champions who will support a pilot

### 2. workplace shadowing
observe how teams actually work, rather than how they describe their work.

**how it works:**
- shadow 2-3 people per role for half a day each
- document the actual steps, tools, handoffs, and interruptions
- note where people switch between tools, re-key data, or ask colleagues for context
- compare observed workflow to the documented/official process

**what it reveals:**
- hidden repetition and workarounds that don't show up in process maps
- tool fragmentation and data re-entry patterns
- the gap between how work is supposed to happen and how it actually happens

### 3. time-spend analysis
measure where teams spend their time to quantify the opportunity.

**how it works:**
- use time-tracking data, calendar analysis, or structured self-reporting over 1-2 weeks
- categorise time into: creative/judgement work, structured/repetitive work, admin/coordination, waiting/blocked
- identify roles or workflows where structured/repetitive work exceeds 40% of total time

**what it reveals:**
- quantified opportunity size (hours/week recoverable)
- which workflows have the highest volume and repetition
- baseline metrics for measuring pilot success

### 4. tech stack audit
review existing tools to find redundancy, integration gaps, and automation potential.

**how it works:**
- inventory all tools used across the workflow (CRM, docs, comms, analytics, etc.)
- map data flows between tools: what is manual, what is automated, what is duplicated
- identify overlapping capabilities and integration gaps
- estimate cost of current stack vs. potential consolidated solution

**what it reveals:**
- tool sprawl and redundancy (cost and complexity)
- manual integration points that AI could replace
- data fragmentation that limits visibility and decision-making

### 5. retrospective and incident review
mine existing post-mortems, retros, and feedback for recurring process failures.

**how it works:**
- review the last 6-12 months of retrospectives, incident reports, or team feedback surveys
- identify recurring themes: missed steps, inconsistent documentation, slow handoffs, quality variance
- cross-reference with the workflows those issues map to

**what it reveals:**
- workflows where quality or consistency is already a known problem
- process failure patterns that structured automation could prevent
- evidence for urgency and executive sponsorship

## stage 0: problem typing (before AI)

before screening for AI, classify the problem type:
- **A: workflow intelligence/coordination problem** (candidate for adoption-eval)
- **B: policy/operating model problem** (ownership, incentives, governance design)
- **C: capability/process discipline problem** (missing standards, unclear handoffs, inconsistent execution)

only type **A** should enter AI workflow screening directly. type **B/C** should be routed to the correct owner first, then re-evaluated for AI suitability if needed.

## screening criteria

not every workflow surfaced in discovery is a good AI candidate. use these criteria to filter and prioritise.

### must-have signals (at least 2 of these)
- **high volume or frequency**: the workflow runs often enough that automation has meaningful impact
- **high repetition**: the same pattern of steps is repeated with minor variation
- **measurable baseline**: current performance (time, accuracy, cost) can be quantified
- **clear human boundary**: it is obvious which parts must stay human, making scope well-defined

### positive signals (strengthen the case)
- **data availability**: inputs are structured or can be structured without major effort
- **existing pain**: teams actively complain about this workflow
- **executive demand**: leadership has asked for improvement in this area
- **low entry risk**: the workflow can be piloted on a small slice without high-stakes consequences
- **direct business impact**: tied to revenue, cost, compliance, or customer experience

### red flags (proceed with caution or defer)
- **no clear boundary**: it is hard to define where AI stops and human judgement begins
- **high regulatory exposure**: errors have legal, financial, or safety consequences that are hard to contain in a pilot
- **data quality issues**: inputs are unreliable, inconsistent, or inaccessible
- **low volume**: the workflow runs so rarely that automation ROI is marginal
- **organisational resistance**: the team or leadership is not ready for change in this area

## from discovery to evaluation

once a workflow passes screening, it enters adoption-eval as an input:

1. **document the workflow** using the standard input schema (`schemas/workflow-input.schema.json`)
2. **record the discovery evidence** — which methods were used, what signals were found, why this workflow was selected
3. **run `adoption-eval map`** to produce the could/should/must-stay-human decision map
4. **run `adoption-eval eval`** to score pilot readiness and generate the 30-day plan

the flagship use cases in this folder are the first four workflows through this process. each one includes its discovery method and candidate signals as proof of methodology.

## applying this in practice

### for consultants and adoption leads
use discovery methods 1-3 in your first engagement week. the output is a shortlist of 3-5 candidate workflows, each with evidence and a preliminary screening score. present this to stakeholders before diving into detailed evaluation.

### for internal teams
start with method 3 (time-spend analysis) — it is the least disruptive and gives you quantified data to justify further investigation. follow up with champion workshops for the top candidates.

### for technical teams
start with method 4 (tech stack audit) — it surfaces integration opportunities and redundancy that maps directly to build vs. buy decisions.

## connection to the flagship use cases

| case | primary discovery methods | buyer context |
|------|--------------------------|---------------|
| 01 — knowledge alignment | champion interviews, shadowing, time audit | ops leads, internal teams |
| 02 — revops pipeline | champion interviews, tech stack audit, shadowing, pipeline review | CRO, sales leadership |
| 03 — creative content | time-spend analysis, shadowing, retrospective review | content/marketing leads |
| 04 — CFO intelligence | structured interviews, process walkthrough, time audit, executive feedback | CFO, FP&A teams |
