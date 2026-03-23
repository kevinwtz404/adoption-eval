# llm limitations and boundary design (practical guide)

LLMs are powerful but unreliable in specific ways. This section translates known limitations into boundary design choices.

## known limitations that matter in delivery
1. hallucination: plausible but wrong output
2. prompt sensitivity: output quality varies with phrasing/context
3. weak deterministic reasoning for strict numeric logic
4. inconsistency over repeated runs
5. hidden failure modes in long context chains

## boundary implications
- high-stakes numeric calculation should be deterministic
- externally shared outputs require human approval
- source traceability should be mandatory for factual claims
- confidence should never be treated as correctness

## design patterns
1. deterministic core + LLM narrative layer
2. retrieval with citations for factual tasks
3. approval gates before irreversible actions
4. disallowed action list for agent/tool permissions

## where LLMs fit best
- summarisation
- drafting and explanation
- pattern surfacing and triage support

## where LLMs should be constrained
- financial calculations
- policy or compliance final decisions
- safety-critical or legally binding outputs without human sign-off

## practical rule
Use LLMs for language-rich uncertainty. Use deterministic systems for arithmetic truth and hard controls.
