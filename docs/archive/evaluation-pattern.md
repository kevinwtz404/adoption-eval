# evaluation pattern (shared)

## purpose
Define one repeatable evaluation loop across all portfolio repos so each project is testable, comparable, and credible.

## pattern
1. **spec**
   - define expected behaviour and boundaries
2. **fixtures**
   - add realistic test inputs (small, auditable)
3. **runner**
   - execute checks via CLI/script
4. **scorecard**
   - report metrics and thresholds
5. **report**
   - export JSON + Markdown (CSV optional)

## core metrics
- correctness: does output match expected intent?
- safety: are guardrails respected?
- traceability: can result be explained and evidenced?
- operational fit: cost/time/effort within target bands?

## pass/fail policy
- define minimum thresholds per metric
- mark run as `pass`, `watch`, or `fail`
- require explicit follow-up actions for `watch` and `fail`

## output contract
- `result.json` (machine)
- `summary.md` (human)
- `scorecard.csv` (optional)

## repo-specific mapping
- **ai-readiness**: readiness diagnostics + evidence checks
- **adoption-eval**: workflow map + pilot readiness score
- **hybrid-rag**: retrieval quality + citation reliability
- **edge-agent**: fallback correctness + guardrail compliance
