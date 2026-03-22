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

## what this repo owns
- workflow-level analysis and decision logic
- `could / should / must-stay-human` decisions
- opportunity-to-solution matching
- boundary design and approval-gate patterns
- pilot planning and outcome evaluation

## what this repo does not own
- org-wide readiness diagnostics and roadmap generation (`ai-readiness`)
- deep technical architecture implementation repos (`hybrid-rag`, `edge-agent`)

## method backbone (end-to-end)
1. discover opportunities
2. qualify and shortlist
3. match each opportunity to intervention options
4. design boundaries and controls
5. run pilot and evaluate outcomes
6. decide (scale / revise / reject) and loop

Detailed flow: `docs/adoption-eval-method-overview.md`

## key principles
- method is stable but adaptable
- solutions are variable by context and risk
- mixed options are always considered
- not every problem is an AI problem
- boundary enforcement should be architectural where risk is high

## start here
- docs map: `docs/README.md`
- method overview: `docs/adoption-eval-method-overview.md`
- discovery methods: `docs/ai-adoption-opportunity-discovery-methods.md`
- matching canvas: `docs/opportunity-to-solution-matching-canvas.md`
- outcome matrix: `docs/outcome-dimensions-matrix.md`
- flagship examples: `docs/flagship-use-cases/README.md`

## inputs and outputs
### optional upstream input
- readiness profile contract: `docs/readiness-interface.md`
- sample file: `examples/readiness-profile.input.example.json`

### typical outputs
- workflow map and intervention options
- boundary/control design
- pilot plan
- outcome dimensions matrix (`time`, `cost`, `quality`, `risk`, `adoption friction`, `control confidence`)

## quick practical usage
- guide: `docs/how-to-use-adoption-eval.md`
- run:

```bash
node bin/adoption-eval.js run --input <workflow.json> --out <dir>
```

## current state
This repo is in active development. Core method docs and templates are in place. The next phase is iterative testing and refinement across the 4 flagship examples.
