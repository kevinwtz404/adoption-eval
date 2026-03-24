# adoption-eval: comprehensive project brief

## what this project is

adoption-eval is a free, open-source, interactive web guide that helps organisations figure out where and how to adopt AI in their workflows. It is hosted as a static site on GitHub Pages with an AI analysis backend on Hugging Face Spaces.

It is NOT a product, a SaaS tool or an enterprise platform. It is a practical guide built by Kevin Witzenberger that walks people through a structured process for evaluating AI adoption opportunities. Think of it as an interactive textbook with tools embedded in it.

## who it is for

Two primary audiences:

1. **Decision makers** (AI adoption leads, consultants, ops managers, team leads, business owners) who need to figure out where AI fits in their organisation. They are not technical. They do not know the difference between RAG and an LLM agent. They know they have workflows that hurt and they want a structured way to evaluate whether AI can help.

2. **Implementers** (developers, technical leads, data engineers) who take the decisions from above and need to actually build something. They need a clear brief: what components, what boundaries, what constraints.

The guide serves both. The decision maker walks through the guide and makes the decisions. The output at the end includes a build brief the implementer can use.

## the core insight

AI is not one thing. What people call "an AI agent" is actually a combination of different components: a language model (LLM), deterministic tools (APIs, calculators, rules engines), a retrieval layer (RAG), machine learning models (classification, scoring) and human checkpoints (review, approval, redirect). Each component has different strengths and failure modes. How you put them together determines whether the system is useful or dangerous.

The guide helps people understand this and design the right combination for their specific workflow.

## the philosophy

- Start with the work, not with AI capabilities
- Not every problem needs AI. Sometimes better processes, templates or simple automation solve it
- AI is a gravity well towards the average. It is great for routine work. The risk is letting it handle the parts where judgement, context and accountability matter
- Work is done by people, in context, with informal knowledge and judgement. Technology is fast and consistent but blind to all of that. Getting adoption right means looking at both sides
- A pilot is not a success if it is faster but less controllable
- The method is stable but solutions are variable by context

## site structure (7 steps + resources)

### Landing page (index)
- Opens with the problem: every org is told to "use AI" but nobody knows where to start
- Introduces the core insight: AI is not one thing, it is a combination of components
- Shows the 7-step flow
- Lists what the user walks away with
- About section with feedback links
- Early CTA after the "AI is not one thing" section

### Step 1: Discover
- Teaches discovery methods for finding candidate workflows
- 10 methods as an interactive grid with expandable cards (workflow mapping, discovery sessions, employee surveys, workplace shadowing, time-spend analysis, process mining, retrospectives, tool stack audit, champion network, scoring workshop)
- Each method includes: when to use, who runs it, time required, practical steps, what it reveals, example output, academic/practitioner references
- Screening criteria: strong signals and red flags for identifying good candidates

### Step 2: Select
- Pick a workflow to evaluate
- Four flagship cases as templates (current-state workflows with pain points, not AI solutions):
  - Finding internal answers (operational)
  - CRM data chaos (revenue)
  - Campaign adaptation overload (creative)
  - The reporting cycle problem (finance)
- Each flagship case includes: pain point description, how it was discovered, why AI specifically, current workflow steps with per-step pain
- "Enter your own" option: name, pain description, steps (name + who does it). Actors derived from step owners. No jargon fields
- The custom workflow form is the main goal. Flagship cases are templates for learning

### Step 3: Qualify ("Is this ready to pilot?")
- Six questions to check pilot readiness:
  1. Does it matter enough? (business impact)
  2. How much time does it eat? (volume/frequency)
  3. Can you measure how it works today? (baseline measurability) — GATE
  4. Is the data in good enough shape? (data readiness)
  5. Is it clear what should stay with people? (boundary clarity) — GATE
  6. Can you test this in a few weeks? (pilotability)
- Two gates: questions 3 and 5 must score at least 3 to proceed
- Expandable question cards with anchor descriptions (what each score 1-5 means)
- Sliders embedded in the question cards AND a compact scoring section below (synced via localStorage + custom events)
- Results panel: overall score, per-criterion bar chart, gate status, decision badge (proceed / proceed with conditions / defer), dynamic feedback with resource links
- Each question links to the resources page for deeper guidance

### Step 4: Map ("Map the components")
- Teaches what is actually inside an AI system (the agent decomposition)
- Visual component diagram: LLM, Tools, RAG, ML, Human
- Expandable cards for each component: strengths, weaknesses, what to use it for, with real resource links (hallucination studies, knowledge cut-off explainers, bias research, context window limitations)
- Section on how connections between components matter (where most things go wrong)
- Interactive intervention designer:
  - Shows the workflow steps from Step 2
  - For each step: "Does this step need to change?" (yes/no)
  - If yes: three text fields — what stays with people, what is deterministic/rule-based, what could AI help with
  - If AI work described: paradigm selector (plain language options that map to technical paradigms)
  - "Analyse this step" button calls the HF Space (Gemini API) for AI-powered analysis grounded in the guide's methodology
  - Notes field
  - Intervention summary at bottom

### Step 5: Bound ("Set the boundaries")
- Each component has specific failure modes. This page helps put checks in place
- Expandable sections with real resource links:
  - LLM limitations (hallucination, knowledge cut-off, context windows, prompt sensitivity, bias)
  - Data privacy and model choice (cloud vs local, hybrid approaches, access control)
  - Cost and model selection (not every step needs a frontier model, cost at scale, latency, small vs large models)
  - Human checkpoints and approval gates (where humans must review, approval vs monitoring, reviewer fatigue)
  - Failure modes and fallbacks (what happens when AI is wrong, graceful degradation, disallowed actions, logging)
  - Environmental and ethical considerations (energy cost, bias in outputs, transparency)
- Interactive boundary designer:
  - Reads designs from Step 4
  - Generates per-step boundary checklist based on chosen paradigms
  - Checklist items categorised: approval, fallback, monitoring, human, privacy, quality, safety, cost
  - Checkboxes with notes fields
  - Progress tracking (X of Y confirmed)

### Step 6: Pilot ("Build the pilot plan")
- Two outputs for two audiences:
  - Decision maker: pilot roadmap (what to test, how to measure, timeline)
  - Implementer: build brief (components, boundaries, connections — hand to a developer or paste into an AI assistant)
- Educational content on piloting: scope, success criteria, stop criteria, timeline, ownership (all as expandable cards)
- Interactive pilot builder:
  - Assembles everything from previous steps
  - Summary card: total steps, steps changing, boundaries confirmed
  - Download Markdown roadmap
  - Download JSON build brief
  - Copy build brief to clipboard (designed to paste into Claude/ChatGPT for implementation options)

### Step 7: Evaluate
- Six measurement dimensions: time, cost, quality, risk, adoption, control
- Interpretation rule: speed alone is not success
- Scale / revise / stop decision framework
- Placeholder for evaluation tracking tools (v2)

### Resources page
- Deep-dive content linked from throughout the guide
- Sections (mostly TODO for content):
  - Assessing business impact
  - Assessing workflow frequency
  - Establishing a baseline
  - Assessing data readiness
  - Figuring out what should stay with people
  - Scoping a pilot
  - AI paradigms and their risk profiles (with per-paradigm sub-sections)
  - Automation levels (0-5) reference table (preserved from earlier iteration)
  - Glossary (TODO)

## tech stack

- **Site**: Astro (static site generator) + Preact (interactive components) + Tailwind CSS + DaisyUI
- **Hosting**: GitHub Pages (static)
- **AI analysis backend**: Hugging Face Space (Gradio + Python) proxying to Google Gemini API
  - Rate limited (20 calls/hour per IP)
  - Token-authenticated (site sends a token, Space rejects requests without it)
  - API key stored as HF Space secret, never in the repo
- **CLI** (separate from the site): TypeScript, runs the scoring/mapping logic from the command line
  - Core logic in src/lib/ is pure TS with no Node dependencies — shared between CLI and site
  - Currently out of sync with the site's new direction (component architecture, intervention designer) — needs updating
- **State management**: localStorage — all user data persists across page navigation and sessions
- **Node version**: 22+ required for the site (Astro 5+), 20+ for the CLI

## repo structure

```
adoption-eval/
├── site/                    # Astro web app
│   ├── src/
│   │   ├── pages/          # 7 step pages + index + resources
│   │   ├── components/     # Preact interactive components
│   │   ├── data/           # Flagship cases, localStorage store, Gemini client
│   │   ├── layouts/        # BaseLayout with nav, sidebar, footer
│   │   └── styles/         # Global CSS
│   └── public/             # Static assets (favicon)
├── src/                    # CLI TypeScript source (needs updating)
│   ├── lib/                # Core logic (scoring, mapping, validation)
│   ├── commands/           # CLI commands
│   └── types.ts            # Shared types
├── hf-space/               # Hugging Face Space (Gradio app)
│   ├── app.py              # Gemini proxy with rate limiting and token auth
│   └── requirements.txt
├── docs/                   # Method documentation
│   ├── flagship-use-cases/ # 4 worked examples
│   ├── genai-resources.md  # 62 curated links from GenAI Arcade
│   └── ...                 # Method docs, rubrics, research
├── schemas/                # JSON Schema for workflow input
└── examples/cli/           # CLI example inputs
```

## design system

- **Font**: Monaco, monospace (matches kevin-witzenberger.github.io)
- **Colours**: Purple palette (#9b6bd4 light, #6830C4 primary, #4a1f8a dark), neutral greys, white cards
- **Layout**: max-width 5xl (~64rem), fixed left sidebar with connect links, vertical border lines framing content
- **Typography**: body 13px base, content 15px, line-height 1.75, h1 1.75rem purple, h2 1.375rem
- **Interactive patterns**: expandable cards (details/summary or click-to-expand), sliders, text inputs, clickable grids, checkboxes
- **Navigation**: sticky top step bar (7 steps + home), side chevrons for prev/next, bottom "Next: X" links
- **Responsive**: sidebar hidden on mobile, grids collapse, chevrons hidden
- **No em dashes, UK English, no Oxford commas**

## what is working

- Landing page through Qualify: content is solid, interactive components work, scoring syncs between question cards and compact view
- Map page: content is good, intervention designer works, AI analysis button calls HF Space
- Bound page: content is good, boundary designer generates per-step checklists from designs
- Pilot page: content is good, pilot builder assembles and exports everything
- Evaluate page: content only, placeholder for tracking tools
- Flagship cases: four realistic current-state workflows with pain points and discovery context
- HF Space: deployed at https://cantcomeupwithaname-adoption-eval-api.hf.space, token-authenticated

## what needs work

- **Resources page**: all sections are TODO placeholders. Need real content for each qualification criterion, each AI paradigm, the glossary
- **Glossary**: needs to be built out with plain-language definitions
- **CLI**: out of sync with the new direction. The core logic (scoring, mapping) still uses the old could/should/must-stay-human model and the old schema. Needs updating to match the component architecture
- **Content review**: all pages need a pass for consistency, tone, accuracy
- **Formatting consistency**: font sizes and spacing have been standardised but the Preact components still use inline styles with hardcoded values — should reference the design system
- **Flagship case data**: the workflow steps in the flagship cases may need adjustment now that the intervention designer asks for different information
- **The "define your own" form**: needs testing end-to-end to make sure all downstream pages handle custom workflows correctly
- **Build and deploy**: GitHub Pages deployment needs to be enabled in repo settings (source: GitHub Actions). The deploy workflow exists but Pages is not yet enabled
- **Astro config**: site URL is set to kevin-witzenberger.github.io but the repo is under kevinwtz404. Needs checking
- **Mobile experience**: basic responsive breakpoints exist but not thoroughly tested
- **Gemini API key**: the one used in conversation should be rotated. Create a new key in Google AI Studio and update the HF Space secret

## key decisions made during development

1. Workflows should describe current-state human processes, not solutions with AI already baked in
2. The automation levels (0-5) framework was explored and deprioritised. Preserved on resources page as reference but not used as per-step classification
3. Per-step automation level sliders replaced with an intervention designer that asks "what do you want to change?" in plain language
4. The Map page is about designing the intervention (what components, how they connect). The Bound page is about stress-testing it (what could go wrong, what controls)
5. AI paradigm selection uses plain language ("find answers in documents" not "RAG") with technical names shown after selection
6. The guide produces two outputs: a human-readable roadmap (Markdown) and a machine-readable build brief (JSON) designed to be pasted into an AI assistant
7. The HF Space approach was chosen over embedding the API key in the client to keep the key secure on a public repo
8. The guide explicitly acknowledges that AI can supplement creativity and judgement — the three-category (human/deterministic/AI) model was dropped for being too rigid
9. "Could/should/must-stay-human" terminology was dropped entirely. Replaced with component-based thinking
10. The landing page intentionally demystifies "AI agents" early to set the right frame for the rest of the guide
