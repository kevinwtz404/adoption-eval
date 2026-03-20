# adoption-eval plan (draft v1)

status: in progress
owner: cynthia
last updated: 2026-03-20 16:49 GMT

## purpose
Build a practical pilot-to-scale toolkit for internal AI adoption.

## agreed direction
- stack: TypeScript-first, selective Python helpers
- mode: standard MVP
- use cases: revops + support triage
- guardrails: extended
- voice: adoption/change focused
- shipping: big content/code waits for explicit "ship it"
- green money: small setup/config/issues allowed now

## command design (agreed)
- `adoption-eval run` (combined map + eval)
- `adoption-eval map` (workflow -> opportunities)
- `adoption-eval eval` (pilot results -> readiness score)

## outputs (confirmed)
- machine output: JSON
- human summary: Markdown
- optional export: CSV

## decisions resolved (from Telegram thread)
1. readiness model approach: standard MVP scoring model with extended guardrails
2. first scenarios: revops + support triage (both in v1 workflow set)
3. output preference: JSON + Markdown summaries (with CSV export option)

## immediate next steps
- draft CLI contract and input schemas
- draft first scenario data templates (revops + support triage)
- open green-money roadmap issues
- draft scoring model for Kevin review before "ship it"