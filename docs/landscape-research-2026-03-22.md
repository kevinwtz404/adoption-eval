# adoption-eval landscape research (2026-03-22)

## research goal
Assess existing tools and frameworks before defining `adoption-eval`, to avoid building in a vacuum.

## executive summary
Current offerings cluster into three adjacent but separate categories: process mining/process intelligence, AI readiness assessments, and AI governance/accountability frameworks (IBM, n.d.; Microsoft, 2024; NIST, n.d.-a; U.S. Government Accountability Office [GAO], 2021). 

Process mining tools are strong at reconstructing real workflow execution from event data and quantifying bottlenecks or potential savings (Microsoft, 2024; UiPath, n.d.; Celonis, n.d.). Readiness assessments are strong at organisational maturity diagnostics, but typically weak at workflow-level intervention design (Microsoft, n.d.-a). Governance frameworks are strong at controls and accountability, but are not designed as step-by-step workflow automation decision engines (GAO, 2021; NIST, n.d.-a; OECD, n.d.).

The core opportunity for `adoption-eval` is to bridge these layers in one operational flow: map work-as-done, classify each step as could/should/must-stay-human, and produce pilot-ready recommendations with governance traceability. This is strengthened by the “situated capabilities” argument: useful AI capability emerges from the interaction between people, tools, and context, rather than from model benchmarks alone (Witzenberger et al., 2025).

---

## findings by category

### A) process mining and automation opportunity platforms

**Microsoft Power Automate Process Mining** positions process mining as event-data analysis for process visibility, bottleneck detection, KPI monitoring, and improvement opportunities (Microsoft, 2024).

**UiPath Process Mining** includes automation-potential simulation and what-if analysis for time/cost impact (UiPath, n.d.).

**ServiceNow process mining guidance** provides practical heuristics for identifying automation candidates, including transition-time based screening (ServiceNow, 2024).

**Celonis** frames process mining as a value extraction layer with continuous process observation and actioning (Celonis, n.d.).

**IBM Process Mining** emphasises process digital twins, predictive/scenario analysis, and prescriptive recommendations (IBM, n.d.).

**Synthesis:** these platforms are strong on “where efficiency can be gained,” but generally less explicit on normative “should we automate this step?” decisions under governance and accountability constraints.

### B) AI readiness assessments

**Microsoft AI Readiness Assessment** uses a seven-pillar organisational lens (e.g., strategy, governance, data, culture, infrastructure) and provides recommendation-oriented scoring (Microsoft, n.d.-a).

Commercial short-form assessment tools also indicate clear demand for quick readiness scoring experiences, but methodological transparency is often limited (INVARITECH, n.d.).

**Synthesis:** useful for top-down maturity signals; weaker for bottom-up workflow redesign.

### C) governance and accountability frameworks

**NIST AI RMF + Playbook** provides practical, voluntary actions mapped to Govern, Map, Measure, and Manage functions (NIST, n.d.-a, n.d.-b).

**GAO AI Accountability Framework** defines governance, data, performance, and monitoring principles with audit-oriented questions (GAO, 2021).

**ISO/IEC 42001** provides a management-system standard for responsible AI governance and continual improvement (International Organization for Standardization [ISO], 2023).

**OECD AI classification framework** links technical AI characteristics to policy implications and risk discussion (OECD, n.d.).

**Synthesis:** strong for control structures and accountability expectations; not designed to directly produce workflow-level automation recommendations.

---

## implications for adoption-eval

### what to adopt
1. **Reality checks from event/process data** where available (Microsoft, 2024; UiPath, n.d.).
2. **Scenario simulation outputs** for expected operational impact (IBM, n.d.; UiPath, n.d.).
3. **Control domains and risk checks** aligned to NIST/GAO/ISO structures (GAO, 2021; NIST, n.d.-a; ISO, 2023).

### what to avoid
1. Maturity-only scoring with weak operational output.
2. Automation-first framing that omits explicit “must-stay-human” decisions.
3. Opaque scoring without evidence provenance.

### recommended product focus
`adoption-eval` should remain workflow-first and decision-centric:
- per-step decision labels: **could automate / should automate / must stay human**;
- confidence and evidence quality indicators;
- explicit assumptions and unresolved risks;
- traceability to governance controls;
- explicit treatment of capability as situated human-AI practice, not model-only performance (Witzenberger et al., 2025).

### accessibility and delivery model (practical)
To make this usable for AI adoption practitioners from mixed backgrounds, delivery should be dual-track:
1. **tooling track (technical):** CLI/MCP tools for mapping, evaluation, and follow-up measurement.
2. **plain-language track (accessible):** downloadable narrative outputs with minimal jargon, implementation checklists, and step-by-step measurement guidance.

In practice, every run should produce both:
- machine-readable outputs (`json/csv`) for tooling and integration;
- human-readable outputs (`md/txt/pdf-ready`) for teams, managers, and non-technical stakeholders.

This keeps the project open and reproducible on GitHub while still usable as a normal, readable “guide to action.”

---

## references (APA 7)

Celonis. (n.d.). *Process mining*. https://www.celonis.com/process-mining/

IBM. (n.d.). *IBM Process Mining*. https://www.ibm.com/products/process-mining

INVARITECH. (n.d.). *Free AI automation readiness assessment*. https://www.invaritech.ai/tools/assessment/

International Organization for Standardization. (2023). *ISO/IEC 42001:2023 AI management systems*. https://www.iso.org/standard/42001

Microsoft. (2024, October 30). *Overview of process mining in Power Automate*. Microsoft Learn. https://learn.microsoft.com/en-us/power-automate/process-mining-overview

Microsoft. (n.d.-a). *AI Readiness Assessment*. Microsoft Assessments. https://learn.microsoft.com/en-us/assessments/94f1c697-9ba7-4d47-ad83-7c6bd94b1505/

National Institute of Standards and Technology. (n.d.-a). *NIST AI RMF Playbook*. https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook

National Institute of Standards and Technology. (n.d.-b). *AI RMF Playbook (Knowledge Base)*. https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook

OECD. (n.d.). *OECD framework for the classification of AI systems*. https://www.oecd.ai/en/classification

Rock, D., Eloundou, T., Manning, S., Mishkin, P., & Mollick, E. (2023). *An early look at the labor market impact potential of large language models* (arXiv:2303.10130). arXiv. https://arxiv.org/abs/2303.10130

ServiceNow. (2024, October 1). *How to use ServiceNow Process Mining to identify automation opportunities*. https://www.servicenow.com/community/process-mining-blog/how-to-use-process-mining-to-identify-automation-opportunities/ba-p/3061642

UiPath. (n.d.). *Process Mining: Simulating automation potential*. https://docs.uipath.com/process-mining/automation-suite/2022.10/user-guide/simulating-automation-potential

U.S. Government Accountability Office. (2021). *Artificial intelligence: An accountability framework for federal agencies and other entities* (GAO-21-519SP). https://www.gao.gov/products/gao-21-519sp

Witzenberger, K., Burgess, J., He, W., & Snoswell, A. (2025). *Building situated capabilities: An introduction to the GenAI Arcade* [SSRN working paper]. SSRN. https://download.ssrn.com/2025/7/27/5326869.pdf

---

## access notes
Some sources (e.g., Gartner/WEF pages) were blocked by anti-bot/access controls during this pass. No claims were made from blocked pages.