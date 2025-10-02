# Blog Image Automation

Systemic approach to inject contextual images into blog posts automatically.

## What happens
- On render, `BlogPost.tsx` now:
  - Renders a `<ContextualImage>` for the hero with fallback to frontmatter/override.
  - Inserts a `<ContextualImage>` after the first 2–3 H2 sections (auto-registers placeholders and fetches images when assigned).
  - Triggers generation queue for this blog’s placeholders (pending → generated).

## Placeholders
- ID format: `blog-<slug>-hero-1` and `blog-<slug>-inline-<n>`
- Registered with context (heading, before/after text), aspect ratio, and priority.

## Generation
- Convex action `placeholderGeneration.queue` schedules prompt + DALL·E generation.
- Preferences (style, subjects) are applied via heuristics based on heading keywords.
  - Technical: comparativa, precios, dimensiones → `technical`, `['reformer','comparison']`
  - Lifestyle: ejercicios, beneficios → `lifestyle`, `['person','reformer','instructor']`
  - Product: mantenimiento, limpieza → `product`, `['reformer','tools']`
  - Studio: estudio, CDMX → `studio`, `['studio interior','reformer lineup']`

## Commands
- Scan & report
  - `npm run scan:placeholders`
  - `npm run placeholders:report`
- Register & apply preferences
  - `npm run placeholders:register`
  - `npm run placeholders:apply-preferences`
- Queue generation
  - `npm run placeholders:queue-gen`

## Notes
- Component auto-registers placeholders when Convex is available.
- Falls back to existing images (frontmatter or dynamic hero mapping) until generation completes.
- Limit: 3 inline images per article to keep pages lean.

