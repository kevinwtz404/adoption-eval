# adoption-eval plan (draft v1)

status: in progress
last updated: 2026-03-22 17:52 GMT

## purpose
Build a practical pilot-to-scale toolkit for internal AI adoption.

## agreed direction
- stack: TypeScript-first, selective Python helpers
- mode: standard MVP
- use cases: revops + support triage
- guardrails: extended
- voice: adoption/change focused
- shipping: major content/code changes are reviewed before release

## command design (agreed)
- `adoption-eval run` (combined map + eval)
- `adoption-eval map` (workflow -> opportunities)
- `adoption-eval eval` (pilot results -> readiness score)

## outputs (confirmed)
- machine output: JSON
- human summary: Markdown
- optional export: CSV

## decisions resolved
1. readiness model approach: standard MVP scoring model with extended guardrails
2. first scenarios: revops + support triage (both in v1 workflow set)
3. output preference: JSON + Markdown summaries (with CSV export option)

## immediate next steps
- draft CLI contract and input schemas
- draft first scenario data templates (revops + support triage)
- open roadmap issues for implementation sequencing
- draft scoring model for review before release