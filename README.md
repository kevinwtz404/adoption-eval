# adoption-eval

A practical workflow implementation method for AI adoption.

Most teams do not fail because they lack AI tools. They fail because they cannot reliably move from a painpoint to a safe, testable implementation plan. `adoption-eval` exists to close that gap.

## what this is for
Use this repo to:
- discover and qualify AI adoption opportunities in real workflows
- compare intervention options (including non-AI, ML, LLM, hybrid)
- define hard boundaries (policy + capability + architectural gates)
- design small pilots with measurable outcomes
- make clear scale/revise/reject decisions

## who this is for
- AI adoption leads
- ops and transformation teams
- consultants running workflow discovery and pilot design
- technical teams translating business workflow needs into build choices

## architecture at a glance

This repo has three layers. They share one method backbone and one schema contract.

| Layer | Location | Purpose | Audience |
|-------|----------|---------|----------|
| **Web app** | `site/` | Interactive walkthrough of the method. Pick a flagship case or enter your own workflow, score it, map opportunities, review boundaries, get a pilot plan. | Anyone learning or applying the method |
| **CLI** | `src/` + `bin/` | Operational tool for running assessments in pipelines or local workflows. Same logic as the web app. | Technical teams, automation pipelines |
| **Method docs** | `docs/` | Canonical method documentation, rubrics, discovery guides, flagship use cases. | Everyone — the source of truth for the method |

The web app and CLI both import the same core logic from `src/lib/`. The method docs define the rules that the logic implements.

## method backbone (end-to-end)
1. discover opportunities
2. qualify and shortlist
3. match each opportunity to intervention options
4. design boundaries and controls
5. run pilot and evaluate outcomes
6. decide (scale / revise / reject) and loop

Detailed flow: `docs/adoption-eval-method-overview.md`

## what this repo owns
- workflow-level analysis and decision logic
- `could / should / must-stay-human` decisions
- opportunity-to-solution matching
- boundary design and approval-gate patterns
- pilot planning and outcome evaluation

## what this repo does not own
- org-wide readiness diagnostics and roadmap generation (`ai-readiness`)
- deep technical architecture implementation repos (`hybrid-rag`, `edge-agent`)

## key principles
- method is stable but adaptable
- solutions are variable by context and risk
- mixed options are always considered
- not every problem is an AI problem
- boundary enforcement should be architectural where risk is high

## start here

### web app (interactive)
```bash
cd site && nvm use 22 && npm run dev
```
Or visit the hosted version (once GitHub Pages is enabled).

### CLI
```bash
npm run build
node bin/adoption-eval.js run --input examples/cli/support-triage-workflow.example.json --out examples/out
```

### docs
- docs map: `docs/README.md`
- method overview: `docs/adoption-eval-method-overview.md`
- discovery methods: `docs/ai-adoption-opportunity-discovery-methods.md`
- matching canvas: `docs/opportunity-to-solution-matching-canvas.md`
- rubric + thresholds: `docs/rubric-and-thresholds.md`
- outcome matrix: `docs/outcome-dimensions-matrix.md`
- LLM boundary guide: `docs/llm-limitations-and-boundary-design.md`
- positioning draft: `docs/market-facing-positioning.md`
- flagship examples: `docs/flagship-use-cases/README.md`

## schema contract

The canonical input shape is defined in `schemas/workflow-input.schema.json`. Both the CLI and web app validate against it.

All outputs include `method_version` and `schema_version` tags to track drift between the method docs, CLI, and web app.

Key fields: `workflow.name`, `workflow.steps[]`, `workflow.actors[]`, `workflow.data_assets[]`, `workflow.success_metrics[]`, and optional `workflow.qualification` scores (1-5 scale).

### optional upstream input
- readiness profile contract: `docs/readiness-interface.md`
- sample file: `examples/cli/readiness-profile.input.example.json`

### typical outputs
- opportunity map (could / should / must-stay-human per step)
- qualification score with weighted criteria and gate checks
- readiness score with domain breakdown
- 30-day action plan with prerequisites, controls, and gate-failure remediation
- outcome dimensions matrix (`time`, `cost`, `quality`, `risk`, `adoption friction`, `control confidence`)

## project structure

```
adoption-eval/
├── bin/                    # CLI entry point
├── src/                    # TypeScript source (shared logic + CLI commands)
│   ├── lib/                # Core logic (browser-safe, used by both CLI and web app)
│   ├── commands/           # CLI command handlers
│   ├── core/               # Output helpers, exit codes
│   └── types.ts            # Shared type definitions
├── site/                   # Astro + Preact web app
│   └── src/
│       ├── pages/          # 7 pages (landing + 6 method steps)
│       ├── components/     # Interactive Preact islands
│       └── data/           # Flagship case fixtures, localStorage state
├── docs/                   # Method documentation (source of truth)
├── schemas/                # JSON Schema for workflow input
└── examples/
    └── cli/                # CLI example inputs (workflow, readiness, outcome matrix)
```

## current state
This repo is in active development. The method docs, CLI logic, and web app prototype are in place. The web app is a prototype sandbox for learning and applying the method interactively. The next phase is iterative testing and refinement across the 4 flagship examples.
