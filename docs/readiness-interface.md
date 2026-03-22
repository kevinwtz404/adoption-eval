# readiness interface (v0.1)

Plain version: this is the handover file from `ai-readiness` to `adoption-eval`.

- `ai-readiness` exports `readiness-profile.json`
- `adoption-eval` optionally reads it to adjust workflow decisions

## why this exists
Without this file, teams copy-paste readiness notes manually.
With this file, workflow evaluation can automatically apply org constraints.

## file contract
- schema: `ai-readiness/schemas/readiness-profile.schema.json`
- example: `ai-readiness/examples/readiness-profile.example.json`

## minimum fields adoption-eval should use first
1. `overall_score`
2. `domain_scores`
3. `required_controls`
4. `blocked_use_cases`
5. `roadmap_priorities`

## how adoption-eval should apply it
- If `blocked_use_cases` matches workflow intent: mark as `defer` with explanation.
- If `governance` or `data` score is low (<60): lower confidence, increase human checkpoints.
- Always inject `required_controls` into recommendations.
- Add relevant `roadmap_priorities` as prerequisites in the 30-day plan.

## non-goal in v0.1
- No strict dependency. If file missing, run normally and warn.
