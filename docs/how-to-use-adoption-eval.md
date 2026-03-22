# how to use adoption-eval (quick practical flow)

## who this is for
AI adoption leads, ops managers, product teams, and technical teams who need one practical answer:

> What should we automate in this workflow, what should stay human, and what do we do in the next 30 days?

## what you need
1. A workflow input JSON (see `examples/support-triage-workflow.example.json`)
2. Optional org readiness profile from `ai-readiness`

## quickstart

```bash
# from repo root
node bin/adoption-eval.js run \
  --input examples/support-triage-workflow.example.json \
  --readiness examples/readiness-profile.input.example.json \
  --out examples/out
```

## what you get
- `opportunity-map.json`: per-step could/should/must-stay-human decisions
- `readiness-score.json`: workflow readiness score and domain breakdown
- `actions-next-30-days.json`: machine-readable action plan
- `actions-next-30-days.md`: plain-language plan to execute

## how teams should use this in practice
1. **map current workflow**: confirm the steps match reality.
2. **review decision labels**: challenge false positives on automation.
3. **check controls**: confirm governance/data controls before pilot.
4. **run a small pilot**: start with one slice of the workflow.
5. **measure weekly**: quality, cycle time, errors, and adoption friction.

## what this is not
- not a fully autonomous decision-maker
- not a replacement for stakeholder interviews
- not a compliance certification tool

## v1 note
- partial outputs are allowed by default
- `--strict` behaviour is reserved for the next implementation pass
- stdin support is intentionally deferred for v1
