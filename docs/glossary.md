# Glossary

Terms used throughout the adoption evaluation guide. Plain language, no fluff.

## The guide's framework

- **Workflow** — A repeatable sequence of steps that gets a piece of work done. The unit of analysis in this guide.
- **Discovery** — Finding workflows that might benefit from AI by examining how work actually happens today.
- **Qualification** — Scoring a workflow against six criteria to determine whether it's ready to pilot.
- **Gate** — A qualification criterion that acts as a hard filter. Score below 3 on a gate and the workflow isn't ready, regardless of other scores. The two gates are baseline measurability and boundary clarity.
- **Baseline** — Measurable current performance of a workflow before any intervention. You need this to know whether the pilot made things better or worse.
- **Intervention** — The proposed change to a workflow. Combines what stays human, what becomes deterministic, and what AI handles.
- **Boundary** — The line between what AI should do and what must stay with humans. Includes approval gates and human gates.
- **Pilot** — A small, time-bounded test (typically 2–4 weeks) of an AI intervention on a slice of a workflow.
- **Readiness profile** — An organisational assessment of whether teams and infrastructure are prepared for the pilot.
- **Candidate workflow** — A workflow identified as potentially suitable for AI intervention, before qualification.

## Qualification criteria

- **Business impact** — How much improving this workflow would matter. Time saved, cost reduced, quality improved, or risk lowered.
- **Frequency** — How often the workflow runs. Higher frequency = more value from automation.
- **Baseline measurability** — Whether you can measure current performance. A gate criterion.
- **Data readiness** — Whether the data involved is accessible, structured enough, and clean enough to work with.
- **Boundary clarity** — Whether it's clear which parts need human judgement. A gate criterion.
- **Pilotability** — Whether you can carve out a testable slice and run it within 2–4 weeks.

## Work composition

- **Deterministic work** — Rule-based, predictable work. Calculations, formatting, validation. Same input always produces same output.
- **Generative work** — Creating or synthesising new content. Drafting, summarising, adjusting tone.
- **Judgement work** — Work requiring human discretion, accountability, creativity, or contextual understanding.
- **Approval gate** — A control point where a human must review and approve before work proceeds.
- **Human gate** — A workflow step that must stay human. Cannot be automated.

## AI paradigms

- **Paradigm** — A category of AI or automation approach. The guide identifies six: rules, machine learning, LLM copilot, LLM agent, RAG, and hybrid.
- **Rules engine / deterministic logic** — If X then Y. No model, no learning, no uncertainty. Often the right answer when people think they need AI.
- **Machine learning (ML)** — Models trained on historical data to classify, predict, or score. Learns patterns, but can drift and is hard to explain.
- **LLM (large language model)** — An AI model trained on vast text that generates responses probabilistically. Powerful but not deterministic.
- **Copilot** — An LLM that supports a human. The human drives, AI assists. Lower risk because the human catches errors.
- **Agent** — An LLM that acts autonomously: calls tools, hits APIs, executes multi-step workflows. Significantly higher risk than copilot.
- **RAG (retrieval-augmented generation)** — An LLM that retrieves information from a knowledge base before responding. Grounded in sources, but citation does not guarantee correctness.
- **Hybrid** — Deterministic core + AI layer. Critical logic is rules-based, AI handles the language-rich parts. Worth the complexity when you need both precision and flexibility.

## AI risks and limitations

- **Hallucination** — When an LLM generates something that sounds correct but is factually wrong. Not a bug — it's how the technology works.
- **Prompt sensitivity** — Variation in LLM output depending on how the question is phrased. Small changes in wording can produce very different results.
- **Context window** — The maximum amount of text an LLM can consider at once. Longer isn't always better.
- **Knowledge cut-off** — The date after which an LLM has no training data. The model doesn't know what happened after this date.
- **Weak determinism** — The risk that LLM output varies unpredictably across runs. Makes it unsuitable for calculations or anything requiring exact repeatability.
- **Data drift** — When real-world patterns change over time and a trained ML model stops performing well.
- **Bias** — When training data reflects historical discrimination, causing the model to reproduce it.
- **Conformance drift** — The gap between how a process is documented and how it actually works in practice.
- **Compounding errors** — In agent workflows, mistakes that cascade across steps. Each error feeds into the next action.
- **Scope creep** — When an LLM agent expands beyond its intended boundaries into unauthorised actions.

## Workflow analysis

- **Handoff** — A transfer of work from one person or system to another. Often where things break down.
- **Rework loop** — Repetitive work caused by errors or incomplete information that forces you to redo steps.
- **Bottleneck** — A step or resource that limits overall workflow speed or capacity.
- **Cycle time** — The time to complete one instance of a workflow from start to finish.
- **Pain point** — A specific place in a workflow where work gets stuck, breaks, or causes frustration.
- **Signal** — Evidence that a workflow has problems worth investigating.

## Discovery methods

- **Workflow mapping** — Documenting how work actually happens: steps, owners, inputs, outputs, delays, failure points.
- **Time-spend analysis** — Categorising where effort goes: judgement, repetitive, admin, coordination, waiting.
- **Process mining / event-log analysis** — Using system logs to reconstruct actual workflows at scale.
- **Contextual inquiry / workplace shadowing** — Observing people at work to understand the real process versus the documented one.
- **Champion network** — Trusted peers across teams who provide ground-level feedback on pain and adoption.
- **Scoring workshop** — A value-effort-risk prioritisation exercise to create a shortlist of candidate workflows.

## Evaluation

- **Outcome dimensions** — Six dimensions for evaluating pilot results: time, cost, quality, risk, adoption friction, and control confidence.
- **Adoption friction** — How much resistance or difficulty teams experience when adopting a new process.
- **Control confidence** — Whether you can trace what the AI did and why. Auditability.
- **Pass / Watch / Fail** — Evaluation logic. Pass: improvement in 3+ dimensions with no decline in risk or control. Watch: mixed. Fail: risk or control got worse.

## Data and systems

- **Structured data** — Data in consistent formats with clear fields. Easier for automation.
- **Unstructured data** — Free-form text, emails, documents. Harder for automation to work with reliably.
- **Source traceability** — The ability to trace an LLM's output back to the original source material.
- **Chunking** — How documents are broken into pieces for a RAG system. Affects retrieval quality significantly.

## Automation levels (0–5)

Inspired by SAE levels of driving automation. A shared language for describing how much control AI has.

| Level | Name | Meaning |
|-------|------|---------|
| 0 | Fully human | People do everything. AI is not involved. |
| 1 | AI-assisted | Human drives. AI supports with suggestions, lookups, or drafts. |
| 2 | AI-led, human-supervised | AI handles the task. A human reviews and approves before it goes anywhere. |
| 3 | AI-led, human on standby | AI handles it and only escalates when something looks wrong. |
| 4 | Autonomous within boundaries | AI runs independently within defined rules. Humans set the rules, not the actions. |
| 5 | Fully autonomous | AI handles everything, any conditions. Rare in practice and high risk. |
