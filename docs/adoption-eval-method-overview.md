# adoption-eval method overview (v1)

This is the end-to-end operating logic.

## 0) discover opportunities
Find candidate workflows using the discovery methods guide.

- output: shortlist of candidate opportunities
- note: not every painpoint is an AI problem

Reference: `docs/ai-adoption-opportunity-discovery-methods.md`

## 1) qualify opportunities
Check each candidate for:
- business impact
- frequency/repetition
- baseline measurability
- boundary clarity
- pilotability

- output: ranked shortlist (3–5)

## 2) match opportunity to solution options
For each shortlisted opportunity, evaluate multiple paths:
- no-AI process fix
- rules/automation
- ML approach
- LLM approach (RAG/agent/copilot)
- mixed/hybrid architecture

Also evaluate deployment/runtime options:
- off-the-shelf
- configurable SaaS
- in-house
- hybrid
- cloud model vs local model vs tiny model

- output: chosen path for pilot + deferred alternatives

Reference: `docs/opportunity-to-solution-matching-canvas.md`

## 3) design boundaries and controls
Define:
- what is deterministic vs generative
- what must stay human
- what actions are disallowed
- where approval gates are mandatory

MCP/tool-calling patterns are one implementation mechanism for enforcing these boundaries.

## 4) pilot and evaluate
Run a small pilot and track outcomes via the dimensions matrix:
- time
- cost
- quality
- risk
- adoption friction
- control confidence

Reference: `docs/outcome-dimensions-matrix.md`

## 5) decide and loop
Decision options:
- scale
- revise
- reject

Feed learnings back into discovery and matching criteria so each cycle improves candidate selection and solution matching.

---

## principle
The methodology is stable but adaptable. Solutions are variable.

Every opportunity should consider multiple intervention options, including mixed options. MCP is not mandatory everywhere, but is strongly recommended where strict boundary enforcement is required.
