# outcome dimensions matrix (v1)

Use this matrix at the end of every pilot to document what changed, where, and with what confidence.

## dimensions
1. **time** (faster/slower)
2. **cost** (cheaper/more expensive)
3. **quality** (better/worse output quality)
4. **risk** (higher/lower operational or compliance risk)
5. **adoption friction** (easier/harder for teams to use)
6. **control confidence** (better/worse traceability, approvals, auditability)

## required fields
- `scope_level` (`workflow` or `step`)
- `scope_id` (workflow name or step id)
- `dimension`
- `baseline_value`
- `current_value`
- `delta`
- `direction` (`improved|declined|neutral`)
- `confidence` (`low|medium|high`)
- `evidence_source`
- `notes`

## interpretation rule
Do not treat time savings alone as success. A pilot is only considered strong when improvements in time/cost do not degrade risk/control beyond accepted thresholds.

## file outputs
- machine: `outcome-dimensions-matrix.csv`
- human: `outcome-dimensions-summary.md`
