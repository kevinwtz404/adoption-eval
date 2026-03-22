# adoption-eval CLI contract (draft v1)

## command surface

```bash
adoption-eval <command> [options]
```

### commands

- `run`: end-to-end flow (`map` + `eval` + recommendations)
- `map`: map workflow steps to AI opportunities and risk gates
- `eval`: score pilot readiness across domains
- `validate`: validate input JSON against schema only
- `version`: print CLI version

## global options

- `--input <path>`: input workflow JSON (required for `run|map|eval|validate`)
- `--scenario <revops|support-triage|custom>`: scenario profile (default `custom`)
- `--out <dir>`: output directory (default `./out`)
- `--format <json|md|both>`: output format (default `both`)
- `--quiet`: suppress progress logs
- `--verbose`: include scoring trace details
- `--no-colour`: disable ANSI colours
- `--help`

## command contracts

### `adoption-eval run`

Purpose: run full analysis and generate decision-ready outputs.

```bash
adoption-eval run --input workflow.json --scenario revops --out ./out --format both
```

Outputs:
- `readiness-score.json`
- `readiness-summary.md`
- `opportunity-map.json`
- `actions-next-30-days.md`
- `opportunity-map.csv` (when `--csv` is set)

Additional options:
- `--csv`: include CSV export for mapped opportunities
- `--weights <path>`: override scoring weights

Exit codes:
- `0`: success
- `2`: input/schema validation failure
- `3`: scoring/evaluation failure
- `4`: write/output failure

### `adoption-eval map`

Purpose: map workflow, opportunities, risks, and human checkpoints.

```bash
adoption-eval map --input workflow.json --scenario support-triage --out ./out
```

Outputs:
- `opportunity-map.json`
- `opportunity-map.csv` (when `--csv` is set)

Additional options:
- `--csv`: include CSV export

Exit codes:
- `0`, `2`, `4`

### `adoption-eval eval`

Purpose: compute readiness score and generate recommendations.

```bash
adoption-eval eval --input workflow.json --weights weights.json --out ./out --format md
```

Outputs:
- `readiness-score.json`
- `readiness-summary.md`
- `actions-next-30-days.md`

Additional options:
- `--weights <path>`: optional scoring weights override JSON

Exit codes:
- `0`, `2`, `3`, `4`

### `adoption-eval validate`

Purpose: validate input JSON without analysis.

```bash
adoption-eval validate --input workflow.json
```

Stdout:
- `VALID` on success
- machine-readable error summary on failure

Exit codes:
- `0`: valid
- `2`: invalid

## input contract (v0)

Input JSON must satisfy:
- `schemas/workflow-input.schema.json`
- minimum required keys:
  - `workflow.name`
  - `workflow.steps[]`
  - `workflow.actors[]`
  - `workflow.data_assets[]`
  - `workflow.success_metrics[]`

## scoring domains (baseline)

- workflow clarity
- data sensitivity handling
- human-in-the-loop design
- reliability and quality controls
- operational fit (cost/time)
- adoption readiness (change and rollout)

Default domain weights: equal unless overridden by `--weights`.

## non-goals for v1

- no external API calls
- no auto-remediation actions
- no historical trend comparison

## open review questions

- should `run` fail hard when one output format fails, or continue with partial outputs?
- should we add `--strict` mode (treat warnings as failures)?
- do we need `--stdin` support for pipeline use?
