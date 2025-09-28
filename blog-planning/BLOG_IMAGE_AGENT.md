# Blog Image Agent — Automated Image Placement

Purpose
- Programmatically add a hero image and 2–3 contextual images to each blog post, following the site’s content templates and AGENTS.md conventions.

Sources
- Unsplash (via API key) or Unsplash MCP server.

How it works
1) Reads each markdown in `src/content/blog/*.md`.
2) Parses frontmatter and H2 headings.
3) Builds image queries:
   - Hero: `"<title> pilates reformer"` (reflects the post title).
   - Sections: top H2 headings + `"pilates reformer"` (skips FAQ/finance sections) → picks 2 best.
4) Downloads images to `public/images/blog/<slug>/`.
5) Updates the post:
   - Sets `heroImage: "/images/blog/<slug>/hero.jpg"` in frontmatter (if absent or `--force`).
   - Injects section images after matching H2s: `![Heading](/images/blog/<slug>/section-N.jpg)` and a small credit when available.

Prerequisites
- Add your Unsplash key:
  - `.env.mcp` → `UNSPLASH_ACCESS_KEY=your_key`
  - Or export it in your shell before running.
- Optional MCP: install Unsplash MCP server
  - `mcp-config.json` already includes the `unsplash` MCP entry (`npx mcp-unsplash`).
  - Current script uses Unsplash REST directly; can be extended to call the MCP server via JSON‑RPC if desired.

Run
- All posts:
```
deno task images
```
- Specific slugs:
```
deno task images -- --slug reformer-casa-vs-profesional,accesorios-cama-de-pilates-esenciales
```
- Force hero+sections refresh:
```
deno task images -- --force
```

Implementation
- Script: `scripts/enrich-blog-images.ts` (Deno)
- Blog renderer: `src/pages/BlogPost.tsx` displays `heroImage` under the title and excerpt.
- OG remains `/og/<slug>.png`; this system augments in‑article visuals without changing OG generation.

Notes
- The agent respects shortcodes (`<see-also />`, `<hub-list />`) and does not alter them.
- Section image insertion is conservative: only after exact H2 match; otherwise appended at the end.
- To improve precision per section: extend the query builder with synonyms or curated keywords per category.

