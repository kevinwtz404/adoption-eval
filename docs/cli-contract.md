# adoption-eval CLI contract (draft v0)

## commands

### `adoption-eval run`
Combined flow:
1. map workflow
2. evaluate readiness
3. output score + recommendations

**flags**
- `--input <path>` workflow/pilot input JSON
- `--scenario <revops|support-triage>`
- `--out <dir>` output folder (default `./out`)
- `--format <json|md|both>` default `both`
- `--csv` include CSV export

### `adoption-eval map`
Maps process steps to AI opportunities and risk gates.

**flags**
- `--input <path>`
- `--scenario <revops|support-triage>`
- `--out <dir>`

### `adoption-eval eval`
Scores pilot readiness with extended guardrails.

**flags**
- `--input <path>`
- `--weights <path>` optional weighting override JSON
- `--out <dir>`
- `--format <json|md|both>` default `both`

## baseline scoring domains (draft)
- workflow clarity
- data sensitivity handling
- human-in-the-loop design
- reliability/quality controls
- operational fit (cost/time)
- adoption readiness (change and rollout)

## output files (draft)
- `readiness-score.json`
- `readiness-summary.md`
- `opportunity-map.json`
- `opportunity-map.csv` (optional)
- `actions-next-30-days.md`