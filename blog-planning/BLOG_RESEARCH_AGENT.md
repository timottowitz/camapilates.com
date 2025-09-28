# CAMA Pilates — Blog Research Agent

Purpose
- Produce high‑quality research briefs (≥1000 words) that drive the writing phase of a post.
- Combine keyword intelligence + books_md insights + internal linking plan + image plan.
- Guarantee AGENTS.md compliance before any writing happens.

Agent Name
- `blog_research`

Inputs
- Topic slug and intent (from BLOG_TODO.md)
- Keyword clusters (blog-planning/keyword-clusters.md + CSV)
- Books knowledge base (books_md/*.md)

Outputs (Research File)
- Location: `blog-planning/research/<slug>.md`
- Minimum 1000 words
- Must include:
  - Mexican market focus (MX ranges, logistics, support)
  - Keyword list (primary + 2–3 secondary)
  - Structure outline (H2/H3)
  - Shortcode plan (<see-also />, <hub-list />, <shoprocket-button />)
  - Internal links plan (PDPs, hubs, related guides)
  - FAQ plan (5+ questions)
  - Image plan (hero + 2 contextual sections)
  - Book references (books_md) or expert insights

Workflow (Mandatory)
1) Pick next topic from BLOG_TODO (status 🔬)
2) Create/refresh research file (≥1000 words)
3) Validate with `deno task research:validate` (must pass)
4) Mark as 📝 in BLOG_TODO.md
5) Hand off to Blog Writer Agent

Quality Rules
- Spanish (MX), precise, useful; avoid medical claims.
- Commercial awareness (clear CTAs to PDPs/hubs).
- Section-first thinking: outline before prose.
- Image planning integrated (hero reflects title, two section images support key H2s).

Scaffolding
- Create a new research file:
```
deno task research:new -- --slug <slug> --title "<Título>"
```
- Validate all research files:
```
deno task research:validate
```

Validation Criteria (enforced by script)
- Word count ≥ 1000 (excluding code blocks)
- Must include headings for: Keywords, Estructura/Structure, Shortcodes/Plan de shortcodes, FAQ, CTAs/Enlaces, Imagen/Imagenes/Image plan
- Must mention at least one internal PDP or hub
- Warn if no books_md references found
 - Additional checks (warnings): FAQ ≥5 items; Mexico/MXN cues; at least one real PDP slug from products.json; shortcodes plan has concrete examples and uses self-closing syntax; image plan includes Hero: and ≥2 section images.

Handoff to Writing
- Writer follows the research outline; uses shortcodes; adds FAQ; updates interlinks; adds frontmatter.
- Run Image Agent after writing to fetch hero + contextual images (or earlier if desired).

Notes
- Keep research factual and brand-aligned (silencio, materiales, DE/MX, garantía 3 años, repuestos exprés).
- When quoting books, paraphrase and cite informally (no long verbatim quotes).

## MCP Tools

The Blog Research Agent is also available as an MCP server, mirroring the Image Agent pattern.

- Server: `scripts/mcp-research-agent.js`
- Config: `mcp-config.json` → `blog-research-agent`

Tools
- `scaffold_research` — Create a research file
  - inputs: `{ slug: string, title?: string }`
- `validate_research` — Run validator (all or selected slugs)
  - inputs: `{ slugs?: string[] }`
- `list_research_status` — Quick status (word count + missing sections)
  - inputs: `{}`
 - `pick_next_topic` — Reads BLOG_TODO.md and returns the first 🔬 topic
   - inputs: `{}`
 - `scaffold_next_topic` — Scaffolds the next 🔬 topic (wraps scaffold_research)
   - inputs: `{}`
 - `mark_todo_status` — Set BLOG_TODO status (🔬/📝/✅/🚫) for a slug
   - inputs: `{ slug: string, status: '🔬'|'📝'|'✅'|'🚫' }`
 - `validate_and_mark` — Validate one slug and flip to 📝 on success
   - inputs: `{ slug: string }`
 - `suggest_keywords` — Suggest primary + 2–3 secondaries from clusters + heuristics
   - inputs: `{ slug?: string, title?: string, limit?: number }`
 - `suggest_references` — Find 3–5 book snippets from books_MD for the topic
   - inputs: `{ query?: string, slug?: string, title?: string, limit?: number }`
 - `generate_image_queries` — Suggest hero + 2 section queries for Unsplash
   - inputs: `{ slug: string, title?: string }`
 - `suggest_ctas` — PDP links + <shoprocket-button> placeholders from products.json
   - inputs: `{ limit?: number }`
 - `outline_template` — Return H2 outline for a category
   - inputs: `{ category: 'Guías de compra'|'Comparativas'|'Ejercicios y salud'|'Equipo y mantenimiento'|'Estudio' }`
 - `enrich_research` — Auto-fill missing sections with MX context
   - inputs: `{ slug: string, title?: string, category?: one of above, createIfMissing?: boolean, force?: boolean }`

Behavior
- `scaffold_research` wraps `deno task research:new -- --slug <slug> [--title "Title"]`.
- `validate_research` wraps `deno task research:validate [-- --slug slug1,slug2]` and returns output even if validation fails (non‑zero exit).
- `list_research_status` performs a lightweight check equivalent to the validator (word count, required headings, PDP/hub link, books_md mention).
 - `pick_next_topic` parses `blog-planning/BLOG_TODO.md` for the first `### 🔬` entry and extracts `{ title, slug }` from the adjacent Research File line.
 - `scaffold_next_topic` calls `pick_next_topic` and then `scaffold_research` with the discovered slug/title.
 - `mark_todo_status` edits `BLOG_TODO.md` by matching the Research File link and replacing the preceding icon.
 - `validate_and_mark` runs the validator for a slug and marks it 📝 only if validation passes (no errors).
 - `suggest_keywords` ranks CSV rows by fuzzy token match and augments with Spanish heuristics.
 - `suggest_references` scans books_MD paragraphs and returns the strongest matches with excerpts.
 - `generate_image_queries` reads the research file’s structure/H2s to propose a hero query and two localized section queries.
 - `suggest_ctas` loads products.json and suggests `/product/:slug` links with `<shoprocket-button ... />` placeholders.
 - `outline_template` returns a concise H2 skeleton aligned with AGENTS.md sectioning.
 - `enrich_research` ensures presence of: Keywords, Estructura, Shortcodes plan, CTAs/Enlaces (with real PDP links + <shoprocket-button />), Imagenes plan (Hero + 2), Referencias (books_md authors), FAQ (≥5), and adds two MX-context sections to accelerate reaching ≥1000 words.

Prerequisites
- Deno available in PATH (used by the wrapped tasks).
- Research scripts present: `scripts/scaffold-research.ts`, `scripts/validate-research.ts`.

Tips
- Workflow: `scaffold_research` → write content → `validate_research` until clean → mark 📝 in `BLOG_TODO.md`.
