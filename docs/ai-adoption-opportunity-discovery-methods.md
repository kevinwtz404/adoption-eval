# AI adoption opportunity discovery methods (quick guide)

Use this as a practical field guide before solution design. The purpose is to find strong AI adoption opportunities with evidence, clear boundaries, and a realistic pilot path.

## 1) workflow mapping
**What it is:** Workflow mapping is a structured way to document how work actually happens across people, systems, and handoffs. You map steps, owners, inputs, outputs, delays, and common failure points. Done well, it gives everyone a shared picture of reality instead of assumptions.

**Benefits:** It creates immediate alignment, exposes rework loops, and surfaces where work gets stuck. It also helps separate “we need better process clarity” from “we need AI support.”

**Caveats:** Teams often map ideal process, not real process. If you only use manager input, you miss frontline exceptions and workarounds.

**How it works:** Capture current-state (`as-is`) process first, then annotate painpoints and friction points. Identify where decisions are made, where data is re-entered, and where work is blocked.

**How to design:** Time-box to one workflow slice (60–90 mins). Include at least one frontline operator and one process owner. Validate the map with people who do the work daily before using it for prioritisation.

**Read more:**
- Akinbowale, O. E., Zerihun, M. F., & Mashigo, P. (2026). *Business process management framework: Systematic review of the trends, potentials and future*. *Cogent Business & Management, 13*(1), 2627025. https://doi.org/10.1080/23311975.2026.2627025
- Moreno-Montes de Oca, I., Snoeck, M., Reijers, H. A., & Rodríguez-Morffi, A. (2014). *A systematic literature review of studies on business process modeling quality*. *Information and Software Technology*. https://doi.org/10.1016/j.infsof.2014.07.011

## 2) discovery sessions with team leaders
**What it is:** Discovery sessions are facilitated workshops/interviews with team leads and process owners to surface recurring pain, high-friction workflows, and constraints on change. This is often the fastest way to build a candidate backlog.

**Benefits:** Fast signal collection, quick stakeholder buy-in, and better visibility into where leadership already sees urgency.

**Caveats:** Leader perspective alone can be biased. Some painpoints raised in sessions will be policy or operating-model issues, not AI candidates.

**How it works:** Use prompts around repetition, quality failures, delays, and coordination overhead. Capture workflow candidates, baseline signals, and known constraints.

**How to design:** Mix leaders with selected frontline voices where possible. Focus on workflows and outcomes, not tool preferences. End with a ranked shortlist, not a vague discussion.

**Read more:**
- Storvang, P., Clarke, A. H., & Mortensen, B. (2024). *Workshops as a Research Method in Business Research*. In *Collaborative Research Design* (pp. 121–143). Springer. https://link.springer.com/chapter/10.1007/978-3-031-70149-8_6
- AGUX. (2022). *Workshops vs Interviews: optimize design thinking discovery*. https://www.agux.co/blog/design-thinking-isnt-workshops

## 3) employee surveys
**What it is:** Employee surveys collect broad, role-level evidence on where work is slow, repetitive, unclear, or error-prone. They provide a scalable pulse check before deeper qualitative work.

**Benefits:** Fast coverage across teams, useful baseline metrics, and better visibility on where pain is concentrated by function.

**Caveats:** Surveys can flatten nuance. Self-report bias is real, and poorly phrased questions create low-value data.

**How it works:** Ask about frequency, impact, and severity of workflow painpoints. Include role filters and a small number of open-text prompts.

**How to design:** Keep it short. Pair survey findings with at least one direct method (shadowing/workshops) before making prioritisation decisions.

**Read more:**
- Harter, J. K., Tatel, C. E., Agrawal, S., Blue, A., Plowman, S. K., Asplund, J., Yu, S., & Kemp, A. (2024). *The Relationship Between Engagement at Work and Organizational Outcomes: Q12® Meta-Analysis (11th ed.)*. Gallup.
- Gallup. (n.d.). *Q12® Employee Engagement Survey*. https://www.gallup.com/q12/

## 4) workplace shadowing (contextual inquiry)
**What it is:** Shadowing/contextual inquiry means observing people doing real work in real settings while asking clarifying questions. It is one of the best methods for finding tacit work that never appears in process docs.

**Benefits:** Reveals hidden handoffs, interruptions, tool switching, and informal coordination practices that interviews often miss.

**Caveats:** Small samples can overfit conclusions. Poorly run shadowing can feel intrusive and change behaviour during observation.

**How it works:** Observe full task cycles, note decisions and handoffs, then run quick debriefs to validate what you saw.

**How to design:** Get consent, observe multiple roles in the same workflow, and triangulate observations with process docs and metrics.

**Read more:**
- Nielsen Norman Group. (2019). *Contextual Inquiry: Inspire Design by Observing and Interviewing Users in Their Context*. https://www.nngroup.com/articles/contextual-inquiry/
- GOV.UK. (n.d.). *Contextual inquiry*. https://www.gov.uk/guidance/contextual-inquiry

## 5) time-spend analysis
**What it is:** Time-spend analysis quantifies where effort goes over a defined period: repetitive admin, judgement work, waiting, handoffs, and rework.

**Benefits:** Gives measurable opportunity size and helps distinguish high-friction workflows from low-impact annoyances.

**Caveats:** Tracking quality can vary, and people may alter behaviour while measuring.

**How it works:** Use a simple time taxonomy over 1–2 weeks. Aggregate by role and workflow stage.

**How to design:** Pilot with one team first. Keep categories simple and consistent. Use results to estimate potential gains and pilot scope.

**Read more:**
- RescueTime. (2019). *The State of Work Life Balance in 2019*. https://blog.rescuetime.com/work-life-balance-study-2019/
- iSixSigma. (n.d.). *Preparing to Measure Process Work: Time Study*. https://www.isixsigma.com/business-process-management-bpm/preparing-measure-process-work-time-study/

## 6) process mining (event-log analysis)
**What it is:** Process mining uses event logs from operational systems (CRM, ERP, ticketing, etc.) to reconstruct how workflows actually run. It compares observed process variants against expected flow.

**Benefits:** High evidence strength for bottlenecks, conformance drift, cycle-time variance, and hidden process paths at scale.

**Caveats:** Heavily dependent on log quality and event definitions. If data is incomplete, outputs can mislead.

**How it works:** Extract logs, preprocess events, discover process flows, analyse variants, and interpret findings with business stakeholders.

**How to design:** Define event semantics early (what each event means), validate data completeness, and pair mining outputs with domain interviews.

**Read more:**
- van der Aalst, W. M. P., et al. (2012). *Process Mining Manifesto*.
- Berti, A., Montali, M., & van der Aalst, W. M. P. (2023). *Advancements and Challenges in Object-Centric Process Mining: A Systematic Literature Review*. arXiv. https://arxiv.org/abs/2311.08795
- García-Rojas, E., et al. (2021). *Event Log Preprocessing for Process Mining: A Review*. *Applied Sciences, 11*(22), 10556. https://www.mdpi.com/2076-3417/11/22/10556

## 7) retrospectives and incident review
**What it is:** This method mines existing retrospectives, incident reports, and postmortems to identify recurring failure patterns and weak workflow controls.

**Benefits:** Uses existing evidence, highlights systemic issues over isolated events, and supports high-trust improvement discussions.

**Caveats:** Output quality depends on candour, documentation discipline, and blameless culture.

**How it works:** Review a fixed window (for example 6–12 months), classify recurring causes, map each cause back to workflow stages.

**How to design:** Use a standard incident taxonomy and insist on blameless language. Convert repeated findings into candidate workflow interventions.

**Read more:**
- Lunney, J., & Lueder, S. (n.d.). *Postmortem Culture: Learning from Failure*. In *Site Reliability Engineering*. https://sre.google/sre-book/postmortem-culture/
- Beebole. (n.d.). *Project Post-Mortem Analysis Guide*. https://beebole.com/blog/project-post-mortem-analysis-guide

## 8) tool stack and data-flow audit
**What it is:** A targeted audit of tools and data movement in a workflow to identify duplication, manual transfer, integration gaps, and control risks.

**Benefits:** Finds practical quick wins (tool consolidation, interface fixes, reduced copy/paste burden).

**Caveats:** Can turn into inventory theatre if not tied to workflow outcomes.

**How it works:** Map each system, owner, and data handoff. Identify where information is duplicated, delayed, transformed manually, or lost.

**How to design:** Focus on one high-value workflow at a time. Quantify overlap and transfer risk so findings are decision-ready.

**Read more:**
- Wiz Academy. (n.d.). *What is Data Flow Mapping?* https://www.wiz.io/academy/data-security/data-flow-mapping
- Alation. (n.d.). *What is Data Mapping?* https://www.alation.com/blog/what-is-data-mapping-guide/

## 9) champion network method
**What it is:** A small cross-functional network of trusted peers who bridge leadership intent and frontline reality during discovery and adoption.

**Benefits:** Improves signal quality, raises trust, and accelerates adoption because feedback loops are local and credible.

**Caveats:** Fails when champions lack mandate, capacity, or visible support from leadership.

**How it works:** Define role + expectations, select champions across affected areas, train them, and run regular feedback cycles.

**How to design:** Include respected informal leaders, not only managers. Track actions taken from champion feedback to maintain trust.

**Read more:**
- Prosci. (2023). *Best Practices in Change Management (Executive Summary)*. https://empower.prosci.com/best-practices-change-management-executive-summary
- Family Planning National Training Center. (2020). *Change Champion Network*.

## 10) value-effort-risk scoring workshop
**What it is:** A structured prioritisation workshop where candidate workflows are scored on value, effort, and risk to create a transparent shortlist.

**Benefits:** Makes trade-offs explicit, reduces political bias, and supports quick pilot selection.

**Caveats:** Weak calibration leads to noisy scores. If scoring semantics are unclear, results are not comparable.

**How it works:** Define criteria and scales first, score by consensus, calculate rank bands, and revisit scores as new evidence appears.

**How to design:** Calibrate scale definitions at the start (what “high” means), include multiple impact factors, and set thresholds for high/medium/low priority.

**Read more:**
- West, J. L. (2002). *Integrating risk analysis and prioritization: a practitioner’s tool*. PMI Annual Seminars & Symposium.
- airfocus. (n.d.). *5-Minute Guide: How to Use the Value vs Effort Framework*. https://airfocus.com/resources/5-min-guides/value-effort.pdf

---

## practical output after discovery
A ranked shortlist of 3–5 candidate workflows, each with:
- discovery evidence
- baseline metrics
- why AI (vs non-AI change)
- boundary notes (policy + capability + approval gates)
- pilotability assessment
