# flagship use case 03: creative content versioning pipeline

## one-line objective
Turn one core content idea into channel-specific, brand-consistent text and image variants with version control and approval gates.

## core problem
Content teams spend too much time manually adapting one idea across channels. This creates tone inconsistency, low asset reuse, and weak traceability from approved draft to published output.

## discovery method
- time-spend analysis showed 60-70% effort spent on adaptation tasks
- workplace shadowing showed copy-paste-tweak loops across channels
- retrospective review flagged version confusion and post-publish quality variance

## candidate signals
- high repetition: same core message rewritten for each channel
- measurable baseline: cycle time, approval rounds, reuse rates, consistency scores
- clear boundaries: creative/legal sign-off remains human
- low-risk pilot path: start with one campaign and controlled channel set

## why AI specifically
- generative AI is strong for structured channel adaptation under style constraints
- AI can automate version tracking and lineage metadata
- AI can increase output consistency while preserving human editorial control

## non-AI filter (important)
exclude issues caused primarily by strategy gaps (unclear audience, weak campaign brief, missing brand guidelines). those must be fixed upstream before AI content automation.

## target users
- content lead
- creative strategist
- designer
- social/media manager

## workflow in scope
1. ingest campaign brief and master narrative
2. generate master content structure (messages + CTA options)
3. generate channel variants (LinkedIn, X, newsletter, site)
4. generate aligned image prompts/assets
5. pass through review/approval states
6. produce publish pack with version tags and lineage

## system architecture (tool-gated pattern)
- **brief MCP**: validates campaign brief completeness
- **variant generator MCP**: creates channel-specific drafts from master narrative
- **brand policy MCP**: checks tone/rule compliance
- **asset registry MCP**: tracks image/source/prompt lineage and versions
- **publish approval MCP**: final gate before publishing/export

## hard boundaries
- no publishing without human approval
- no unlicensed visual assets
- no brand-unsafe or legal-sensitive claims without review
- prompt/image provenance must be retained

## could / should / must-stay-human
- could automate:
  - first-draft channel adaptations
  - asset naming/versioning
  - format/export packs by channel
- should automate:
  - brand consistency checks
  - channel coverage checks
- must stay human:
  - final creative judgement
  - sensitive messaging decisions
  - final brand/legal sign-off

## success metrics (pilot)
- cycle time from brief to publish-ready pack
- consistency score across channels
- % outputs approved without major rewrite
- asset reuse rate across campaigns

## likely failure modes to teach users
- consistent style but weak strategic relevance
- repetitive variants across channels
- image-text mismatch despite formal correctness

## outputs we should generate
- `content-structure.json`
- `channel-variants.json`
- `asset-version-log.csv`
- `approval-board.md`
- `publish-pack-index.md`
