# adoption-eval

workflow implementation layer.

## purpose
Evaluate a specific workflow and produce an implementation-ready plan for AI adoption.

## this repo owns
- workflow mapping and analysis
- step-level decisions: could automate / should automate / must stay human
- pilot design, measurement baseline, and 30-day implementation plan
- recommendations adjusted by org readiness constraints

## this repo does not own
- organisation-wide readiness diagnostics and roadmap generation (that lives in `ai-readiness`)
- deep technical architecture repos (`hybrid-rag`, `edge-agent`)

## accepts optional org readiness input
- interface doc: `docs/readiness-interface.md`
- sample input: `examples/readiness-profile.input.example.json`

## quick practical usage
- guide: `docs/how-to-use-adoption-eval.md`
- run: `node bin/adoption-eval.js run --input <workflow.json> --out <dir>`

## roadmap (draft)
- define `run`, `map`, `eval` command contract
- finalise revops and support triage sample workflows
- implement standard readiness scoring with extended guardrails
- export results as JSON and Markdown (CSV optional)
