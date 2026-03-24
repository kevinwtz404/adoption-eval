# adoption-eval

Every organisation is being told to "use AI." But when you actually sit down to figure out where it fits, the picture gets complicated fast. Which workflows should you touch? What should AI actually do vs what should stay with people? How do you test any of this without putting your operations, your data or your reputation at risk?

This is a free, open-source, interactive guide that helps you work through those questions. It walks you through finding the right workflow, checking whether it is ready to pilot, designing an intervention with the right components, stress-testing it for what could go wrong, building a pilot plan and evaluating whether it actually worked.

The goal is to help you think clearly about AI adoption: what the pieces are, how they fit together, where the risks hide and how to run a safe, structured test before committing to anything.

## what this is

An interactive walkthrough hosted on GitHub Pages. You bring a workflow that hurts and the guide walks you through seven steps. It is not a product or a platform. It is a practical guide with tools embedded in it.

You do not need to be technical. You do not need to know which model to use. You just need a workflow you are curious about.

## who this is for

**Decision makers** (AI adoption leads, consultants, ops managers, team leads) who need to figure out where AI fits in their organisation. The guide helps you make structured decisions without needing to understand the technology in depth.

**Implementers** (developers, technical leads) who take those decisions and need to build something. The guide produces a build brief you can hand to a developer or paste into an AI assistant for implementation options.

## the seven steps

1. **Discover** — find the workflows worth looking at using 10 structured discovery methods
2. **Select** — pick a workflow to evaluate (4 built-in scenarios or describe your own)
3. **Qualify** — score it against 6 readiness criteria with two gates
4. **Map** — design the intervention: what components you need, how they connect, where people stay in the loop
5. **Bound** — stress-test the design: error tolerance, data privacy, cost, human checkpoints
6. **Pilot** — build the pilot plan with scope, success criteria, stop criteria, timeline, ownership
7. **Evaluate** — measure what changed across 6 dimensions, then decide: scale, revise or stop

There is also a **Resources** page with deeper guidance on each qualification criterion, the AI paradigms and their risk profiles, and a glossary of terms used throughout the guide.

## the core insight

What people call "an AI agent" is actually a combination of different components: a language model, deterministic tools, a retrieval layer and human checkpoints. Each has different strengths and failure modes. How you put them together matters as much as which ones you pick.

## start here

### web app
```bash
cd site && nvm use 22 && npm install && npx astro dev --port 3001
```

### CLI
```bash
npm install && npm run build
node bin/adoption-eval.js run --input examples/cli/support-triage-workflow.example.json --out examples/out
```

## tech stack

| Layer | Location | What it does |
|-------|----------|-------------|
| **Web app** | `site/` | Astro + Preact static site. Interactive components for each step. All state in localStorage |
| **AI backend** | `supabase/functions/` | Supabase Edge Function proxying to Google Gemini API. Generates redesign proposals for custom workflows and pilot overviews. Rate limited (10/IP per 10 min, 500/day global), CORS protected, usage logged |
| **CLI** | `src/` + `bin/` | TypeScript. Runs qualification scoring, opportunity mapping and readiness evaluation from the command line |
| **Schema** | `schemas/` | JSON Schema defining the workflow input contract. Used by the CLI for validation |

The web app and CLI share core logic from `src/lib/`.

## project structure

```
adoption-eval/
├── site/                    # Astro + Preact web app
│   └── src/
│       ├── pages/          # 7 step pages + landing + resources
│       ├── components/     # Interactive Preact components
│       ├── data/           # Flagship cases, localStorage store, Gemini client
│       ├── layouts/        # BaseLayout with nav, sidebar, footer
│       └── styles/         # Global CSS
├── supabase/
│   └── functions/
│       └── ai-analyse/     # Edge function: Gemini proxy with rate limiting and usage logging
├── src/                    # CLI TypeScript source
│   ├── lib/                # Core logic (scoring, mapping, validation)
│   ├── commands/           # CLI command handlers
│   └── types.ts            # Shared type definitions
├── schemas/                # JSON Schema for workflow input
├── examples/cli/           # Example workflow inputs
└── docs/                   # Local reference docs (not published)
```

## built-in scenarios

The guide includes four pre-filled flagship cases you can click through immediately:

- **Finding internal answers** — knowledge scattered across tools, people waste hours searching
- **CRM data chaos** — sales reps spend more time researching leads than talking to them
- **Campaign adaptation overload** — one idea manually rewritten for every channel
- **The reporting cycle problem** — finance teams spend days assembling reports instead of analysing them

Each comes with pre-filled workflow steps, qualification scores, a proposed redesign with component flow diagram, boundary defaults and a pilot plan. Or describe your own workflow and the guide generates a proposal using AI.

## outputs

The guide produces two deliverables at the end:

- **Pilot roadmap** (Markdown) — what you are testing, how you measure, what the timeline is
- **Build brief** (Markdown) — components, boundaries, connections, designed to paste into an AI assistant for implementation options

## current state

The guide is functional end-to-end. All seven steps work with both flagship cases and custom workflows. It is a work in progress and actively being developed. The content tries to be practical and accessible without oversimplifying. That is a hard balance and I am sure some of it is not quite right yet.

## feedback

I built this because I kept seeing the same gap. Organisations want to use AI but do not have a practical way to evaluate where it actually fits. The existing options are either too abstract, too technical or too focused on selling tools.

If something does not make sense, if a step feels wrong or if you have ideas for how to make it more useful, I would genuinely like to hear from you.

- [Send me feedback](mailto:kevin.witzenberger@posteo.de)
- [Open an issue](https://github.com/kevinwtz404/adoption-eval/issues)
- [Connect on LinkedIn](https://linkedin.com/in/kevin-witzenberger/)

Built by [Kevin Witzenberger](https://kevinwtz404.github.io/kevin-witzenberger/).
