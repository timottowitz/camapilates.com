# camadepilates.com — Agent Guide (AGENTS.md)

This file trains agents how the blog system works and exactly how to add high‑quality, SEO‑ready posts. Follow it strictly.

## 1) Mission & Scope
- Publish authoritative, consumer‑protection content about solar fraud, scams, and legal options.
- Maintain a frontmatter‑driven blog with strong technical SEO: meta tags, OG images, JSON‑LD, internal linking, and fast edge delivery.
- Scope: Entire repository.

## 2) Tech Stack (what matters for content)
- Vite + React SPA, but posts are prerendered into static HTML after build.
- Frontmatter Markdown lives in `src/content/blog/*.md`.
- Loader/indexer: `src/lib/content.ts` (build‑time import + frontmatter parse).
- Blog pages: `/blog`, `/blog/:slug`, `/blog/category/:category`, `/blog/tag/:tag`.
- OG images & sitemap generated prebuild.
- Shortcodes allowed in Markdown:
  - `<hub-list ... />` autolists related posts on hubs.
  - `<see-also ... />` injects contextual related links.
  - `<audio-story ... />` embeds an audio UI block.

## 3) Frontmatter Content Model
Required fields (unless noted):
- `title` (H1 and meta title)
- `description` (1–2 sentence meta; influences SERP CTR)
- `category` (e.g., `Scam`, `Company`, `Legal`, `State`, `General`)
- `tags` (string array; use query variants deliberately)
- `publishDate` (YYYY-MM-DD)
- `author` (string)
- `slug` (url slug; lower‑case; hyphenated)
- Optional: `featured` (bool), `heroImage` (absolute or site‑relative), `updatedDate`, `canonical`, `noindex`

Example:
```
---
title: "Is Solar a Scam or Legit?"
description: "Debunking the ‘solar is a scam’ claim and explaining where real scams occur."
category: "General"
tags: ["is solar a scam", "solar scam", "myth"]
publishDate: "2025-09-24"
author: "CAMA Pilates"
slug: "is-solar-a-scam"
featured: false
heroImage: "/og/is-solar-a-scam.png"
canonical: "https://solarpanelfraud.org/blog/is-solar-a-scam"
---
```

## 4) Authoring Guidelines (SEO + compliance)
- Titles: Clear, keyword‑led, but natural. Include primary query.
- Description: 120–160 chars; actionable, unique per page; no keyword stuffing.
- Headings: Use `##` for major sections, `###` for subsections. One `#` title at top is fine.
- Internal links: Link with descriptive anchor text to related posts (use `/blog/<slug>`). Add a mid‑article `<see-also />` if helpful.
- FAQ: Add a `## FAQ` section with `### Question` blocks for key pages to emit FAQ JSON‑LD.
- Disclaimers: For legal pages include a short “not legal advice” note near the top.
- Claims: Avoid unverified/defamatory claims. Attribute as “allegations” if referring to public complaints.
- Tags: Include main head term plus variants (“sun run”, “sunrun scams”), but keep list reasonable (3–8 typical).
- Canonical: Use when creating alias pages for variant queries; canonicalize to the primary page.

## 5) Shortcodes
- `<hub-list>`: Autolist posts.
  - Props: `tags="a,b"` (optional), `category="Scam|Company|..."` (optional), `limit="N"`, `title="Heading"`, `excludeSlug` auto‑handled.
  - Example: `<hub-list category="Scam" limit="30" title="Common Scam Types" />`
- `<see-also>`: Contextual related links (3 by default).
  - Props: `limit="N"`
  - Example: `<see-also limit="3" />`
- `<audio-story>`: Embed audio block.
  - Props: `audioUrl`, `title`, `description`
  - Example: `<audio-story audioUrl="/audio/case1.mp3" title="Victim Story" description="How it happened" />`

## 6) Where to put files
- New post: `src/content/blog/<slug>.md` (filename should equal slug).
- Do not add content under `public/blog/` (legacy). All content lives in `src/content/blog/`.

## 7) Related Articles logic
- Signals: shared tags → same category → recency fallback.
- Appears near bottom; `<see-also />` places a mid‑article list as well.

## 8) Build & Validate
- Local: `npm ci && npm run build`
  - Prebuild:
    - Generates OG images for each post into `public/og/*.png`.
    - Generates `public/sitemap.xml` (includes posts, categories, tags).
  - Build:
    - Vite builds app, then prerender script writes static HTML snapshots for blog routes.
- Preview: `npm run preview` (or serve `dist/` statically).

## 9) Adding a New Blog Post (step‑by‑step)
1) Choose a succinct slug: `how-to-avoid-solar-scams`
2) Create `src/content/blog/how-to-avoid-solar-scams.md` with full frontmatter (see §3) and outline:
   - Intro, red flags, steps, internal links to relevant posts; optional `## FAQ`.
3) Add shortcodes as needed (`<see-also />`, hub lists on hubs only).
4) Build locally; ensure OG image and sitemap updated.
5) Commit and push.

## 10) Page Types: intent & outline hints
- General/Myth: Education + redirects to specific scam types.
- Scam Type: Definition → examples → red flags → what to do → reporting links.
- Company Page: Background → public allegations/complaints (neutral, factual) → what customers can do.
- Legal Guide: Not legal advice; steps, when to hire counsel; state‑specific notes if applicable.
- State Page: Local patterns, rights, reporting links; link to legal guides and scam types.

## 11) Cloudflare Pages (deployment behavior)
- `public/_headers` sets cache policy at edge.
- Functions:
  - `functions/[[path]].ts` ensures consistent Cache‑Control for assets/blog/sitemap.
  - `functions/_scheduled.ts` warms the cache by fetching all URLs in `sitemap.xml`.
- Set env var `SITE_URL` in the Pages project; add a Cron Trigger (e.g., every 6 hours).

## 12) Commit Policy
- Keep changes focused; do not edit unrelated infra without reason.
- For content batches, prefer multiple commits grouped by topic.
- Use clear commit messages: `content: add <slug>`, `seo: add FAQ to <slug>`, `infra: cache headers`.

## 13) Safety & Style
- Avoid libel/defamation; say “customers allege”, “public reports indicate”. Link to sources only if publicly available and stable.
- Keep tone factual, helpful, empowering.
- Avoid hallucinated stats; if uncertain, omit or mark as “no public data available”.

## 14) Post Template (copy/paste)
```
---
title: "<Title with primary query>"
description: "<1–2 sentence unique meta>"
category: "Scam | Company | Legal | State | General"
tags: ["<primary>", "<variant1>", "<variant2>"]
publishDate: "YYYY-MM-DD"
author: "CAMA Pilates"
slug: "<kebab-slug>"
featured: false
# Optional
# heroImage: "/og/<slug>.png"
# canonical: "https://solarpanelfraud.org/blog/<slug>"
# updatedDate: "YYYY-MM-DD"
# noindex: false
---

# <Title>

> Disclaimer: This article is informational, not legal advice.

## Overview
<2–3 sentences answering the query>

## Key Points
- <point>
- <point>
- <point>

## Main Sections
### <Subheading>
<content>

### <Subheading>
<content>

<see-also limit="3" />

## What To Do Next
<Actionable next steps; link to related posts>

## FAQ
### <Question?>
<Answer>
```

## 15) SEO Checklist (each PR)
- [ ] Title includes primary query; slug mirrors intent.
- [ ] Unique description ~150 chars; no stuffing.
- [ ] Category correct; tags include query variants.
- [ ] Internal links added to relevant posts; mid‑article `<see-also />` where useful.
- [ ] `## FAQ` added for high‑value queries (renders JSON‑LD).
- [ ] Optional: heroImage; otherwise OG is auto‑generated.
- [ ] Build passes; OG + sitemap updated.

## 16) Hubs & Tags
- Hubs (e.g., `solar-panel-scams-ripoffs`, `solar-company-lawsuits`) should include a `<hub-list ... />` block with suitable tags/category.
- When creating new categories/tags, keep names consistent and simple (lowercase tags preferred).

## 17) When adding alias pages
- For query variants (“is sun run a scam”), create a short alias page with `canonical` pointing to the primary article. Keep content brief and link users to the main explainer.

Following this guide ensures agents can add content, maintain SEO quality, and keep the site fast and consistent—even after a cold start.

