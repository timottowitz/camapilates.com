Spec: Creating Content Automation Agents (Pattern We Used Here)

  - Purpose
      - Automate repetitive editorial/SEO tasks on Markdown blog posts and product pages without breaking the site’s content conventions, SEO, or
  build pipeline.
      - Keep changes idempotent, reviewable, and reversible (git-friendly).
      - Integrate with the project’s agent workflow (AGENTS.md) and Deno/Vite toolchain.
      - Integrate with the project’s agent workflow (AGENTS.md) and Deno/Vite toolchain.
  -
  Scope
      - Blog content (src/content/blog/*.md): frontmatter enrichment, inline asset insertion, shortcodes, section rewrites.
      - Product content (src/content/products.json or PDP rendering scripts).
      - Non-destructive transforms only (no hard deletes unless explicitly requested).
  -
  Non‑Goals
      - Changing OG generation or site routing semantics.
      - Heavy editorial rewriting without research files (use the Blog Writer/Research agents for that).

  Design Principles

  - Align To AGENTS.md
      - Frontmatter completeness (title, description, category, tags, publishDate, author, slug, featured, updatedDate).
      - Structure: H2/H3, , , FAQ under “## FAQ”.
      - Spanish (MX), no medical claims; link to PDPs and hubs.
      - Spanish (MX), no medical claims; link to PDPs and hubs.
  -
  Idempotent + Safe
      - Re-run agents without duplicating inserts (detect existing fields and injected blocks).
      - Avoid breaking shortcodes; never remove markdown that isn’t added by this agent.
      - Work per post (slug-based), allow targeted runs for fast feedback.
  -
  Configurable + Isolated
      - Use .env.mcp for secrets (e.g., UNSPLASH_ACCESS_KEY).
      - Make Deno tasks first-class; no global install assumptions.
  -
  Git‑Friendly
      - Minimal diffs; stable ordering; section-aware injections.
      - Touch only the files required for the change.

  Inputs & Outputs

  - Inputs
      - Markdown files: src/content/blog/*.md
      - Frontmatter fields (title, slug, etc.)
      - Agent-specific config/keys in environment or .env.mcp
      - Agent-specific config/keys in environment or .env.mcp
  -
  Outputs
      - Updated frontmatter with new fields (e.g., heroImage)
      - Markdown body changes (e.g., injected images after H2 headings)
      - Saved assets under public/… so build/prerender consume them

  Environment & Tooling

  - Deno tasks (deno.json)
      - Add small, composable scripts (TypeScript) runnable via:
      - deno task <agent> [--flags]
  -
  Vite + prerender pipeline unchanged; agents operate on content files.
  -
  MCP (optional)
      - mcp-config.json can declare external providers (e.g., Unsplash MCP).
      - Agents can call MCP servers (JSON-RPC) or plain REST (we used REST).

  Agent Template (General)

  - Agent Name: blog__agent (e.g., blog_image_agent)
  - File: scripts/.ts
  - Deno task: deno task
  - CLI flags:
      - --slug slug1,slug2: limit to specific posts
      - --force: override existing content/fields
      - (Add more as needed, e.g., --dry-run)
  CLI flags:
      - --slug slug1,slug2: limit to specific posts
      - --force: override existing content/fields
      - (Add more as needed, e.g., --dry-run)
  -
  Flow
      - Read post list (glob).
      - If --slug provided, filter targets.
      - For each post:
      - Parse with gray-matter; validate frontmatter.
      - Analyze content (H2 headings, FAQ blocks, shortcodes).
      - Decide injection points; compute updates (fields + body).
      - Write back via gray-matter.stringify.
      - Save assets (if the agent downloads anything).

  - Safety
      - Preserve shortcodes and link syntax.
      - Avoid over-inserting; check if you already added a block.
      - Test on one slug first; keep changes local to the post.

  Agent Example: Blog Image Agent

  - Purpose
      - Add a hero image reflecting the post title and 2–3 contextual images for key H2 sections.
      - Add a hero image reflecting the post title and 2–3 contextual images for key H2 sections.
  -
  Files
      - scripts/enrich-blog-images.ts — agent script
      - blog-planning/BLOG_IMAGE_AGENT.md — usage & process doc
      - AGENTS.md — agent listing + workflow notes
      - .env.mcp — UNSPLASH_ACCESS_KEY
      - mcp-config.json — MCP server config (optional)
  -
  Behavior
      - Reads posts; extracts frontmatter.title and H2 headings.
      - Queries Unsplash (REST; can swap to MCP):
      - Hero: "<title> pilates reformer"
      - Sections: "<H2> pilates reformer" (skip FAQ/finance headings)
  -
  Downloads to public/images/blog//hero.jpg and section images.
  -
  Sets frontmatter.heroImage to /images/blog//hero.jpg.
  -
  Inserts section images after matching H2s; adds small photographer credit.
  -
  Run
      - All posts: deno task images
      - Selected posts: deno task images -- --slug slug1,slug2
      - Force updates: deno task images -- --force
  -
  Blog Rendering
      - BlogPost.tsx: heroImage rendered below title/excerpt.
      - OG images remain /og/.png (unchanged).

  How To Build A New Agent (Step‑By‑Step)

  1. Plan

  - Identify content source files and target fields/blocks (e.g., add frontmatter keys, insert CTA blocks).
  - Decide injection strategy:
      - After specific H2s (regex with exact match)
      - At end/start of post if no exact match
  - Define idempotency: how do we detect if we already updated a post?

  2. Create Script

  - In scripts/.ts:
      - Use gray-matter to parse frontmatter & body
      - Build a pure function: (rawMd, options) => newMd/frontmatter
      - Add network calls if needed (REST/MCP), but keep isolated and handled by env keys

  3. Add Deno Task

  - deno.json:
      - "tasks": { "": "deno run --allow-read --allow-write --allow-env --allow-net scripts/.ts" }

  4. Update AGENTS.md

  - Introduce the agent; document when to run it (e.g., after writing phase).
  - Call out any required env variables or tokens.

  5. Write Usage Doc

  - blog-planning/BLOG__AGENT.md:
      - Purpose, behavior, safety, examples, troubleshooting

  6. Validate

  - Agent dry-run or limited run with --slug on a single post.
  - Open diff; confirm frontmatter and body changed as expected.
  - Run build preview (if needed) to ensure no breaks.

  7. Rollout

  - Over small batches; review diffs and refine heading heuristics if needed.
  - Add any exceptions to avoid over-eager injections (e.g., skip finance sections, FAQ).

  Patterns You Can Reuse

  - Content parsing
      - gray-matter for frontmatter
      - Markdown H2/H3 matching via regex (e.g., /^##\s+(.+)$/gm)
      - Markdown H2/H3 matching via regex (e.g., /^##\s+(.+)$/gm)
  -
  Idempotent field updates
      - If field not set: set it
      - If set and not --force: leave it
      - If set and --force: update
  -
  Section‑aware injection
      - insertAfterHeading(md, heading, block)
      - fallback: append at end
  -
  Multi‑slug targeting
      - --slug "a,b,c" filter logic

  MCP Integration (Optional)

  - mcp-config.json:
      - Define servers (Unsplash, etc.), command + args, env keys.
  - Two approaches:
      - Direct REST (we used it) — fewer moving parts.
      - MCP RPC — strong provider abstraction across agents.
      - Direct REST (we used it) — fewer moving parts.
      - MCP RPC — strong provider abstraction across agents.
  -
  When to prefer MCP
      - Multiple agents sharing the same provider
      - Access control & auditing across tools
      - Rate limiting centrally

  SEO & Compliance Guardrails

  - AGENTS.md alignment:
      - Spanish (MX), no medical claims.
      - Ensure “title” & “description” 1–2 lines; use updatedDate on edits.
      - Place  after first section and at end.
      - Provide FAQ sections with “## FAQ” and “### question” headings.
  - Don’t:
      - Break shortcodes or markdown structure
      - Change OG paths or canonical unexpectedly
      - Insert claims or medical assertions

  Testing & Verification

  - Unit of work: one post
      - Inspect resulting MD (frontmatter + body).
      - Verify images exist in public/images/blog//.
      - Run preview (vite) to visually confirm.
      - Run preview (vite) to visually confirm.
  -
  Batch run
      - Use git diff to confirm only expected deltas.
      - If headings vary, consider logging misses.

  Performance & Limits

  - Rate limiting for external APIs
      - Backoff on 429; skip or retry later.
  - Large runs
      - Batch slugs or process sequentially to avoid API caps.

  Logging & Observability

  - Console logs per post:
      - “Hero set for ”
      - “Section image inserted for ‘’”
  - Capture errors but continue with other posts.

  Rollout Checklist

  - [ ] Script written in scripts/.ts
  - [ ] Task added to deno.json (deno task )
  - [ ] Agent doc added in blog-planning/BLOG__AGENT.md
  - [ ] AGENTS.md updated (agent listed + workflow step)
  - [ ] Secrets in .env.mcp; confirm script loads them
  - [ ] Tested on one post with --slug; then batch

  Examples Of New Agent Ideas

  - blog_cta_agent
      - Insert a mid-article CTA component after 30% and 70% of sections (we already do similar for PDP/BlogPost, but a content agent could
  standardize inline copy per category).
      - Insert a mid-article CTA component after 30% and 70% of sections (we already do similar for PDP/BlogPost, but a content agent could
  standardize inline copy per category).
  -
  blog_faq_agent
      - Extract implied questions from headings and generate a FAQ block stub; ensure “## FAQ” exists and add “### question” structure.
  -
  blog_internal_links_agent
      - Scan for keywords and auto-insert internal links to hubs/PDPs, respecting a per-post cap and avoiding overlinking.
  -
  blog_schema_agent
      - Enforce frontmatter fields and JSON‑LD changes (e.g., add canonical if missing; sync updatedDate on edits).

  Summary

  - Agents are small, focused content utilities wired to Deno tasks, designed to be idempotent and AGENTS.md‑compliant.
  - The image agent showcases the pattern:
      - Parse → decide → fetch → inject → write → log
  - By following this spec, you can develop additional agents that enhance posts programmatically without risking SEO or content quality.