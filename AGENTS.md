
# camadepilates.com — Agent Guide

This guide trains agents to author SEO‑ready content and products for a Pilates Reformer site.

## Mission
- Publish high‑quality content about camas de pilates (Reformer): guías de compra, comparativas, ejercicios, mantenimiento.
- Maintain fast edge delivery with prerender + Cloudflare cache.

## Stack Essentials
- Vite + React SPA with static prerender of key routes.
- Blog posts: `src/content/blog/*.md` (frontmatter).
- Products: `src/content/products.json` → pages at `/product/:slug`, hub at `/products`.
- OG/sitemap generated prebuild; Cloudflare Pages functions + cron prewarm.

## Blog Frontmatter (required)
```
---
title: "<Título principal>"
description: "<Meta 1–2 líneas>"
category: "Guías de compra | Comparativas | Ejercicios y salud | Equipo y mantenimiento | Estudio"
tags: ["<principal>", "<variante1>", "<variante2>"]
publishDate: "YYYY-MM-DD"
author: "CAMA Pilates"
slug: "<kebab-slug>"
featured: false
# optional: heroImage, canonical, updatedDate, noindex
---
```

## Shortcodes Available in Markdown
- `<see-also limit="3" />` — Auto-generated related articles based on tags/category (limit defaults to 3)
- `<hub-list tags="a,b" category="Guías de compra" limit="30" title="..." />` — Filtered article lists by tags/category
- `<audio-story audioUrl="url" title="title" description="desc" />` — Audio story component
- `<shoprocket-button product="prod_xxx" pk="sr_live_pk_xxx" />` — Product purchase button with popup

**Usage Notes:**
- Components are processed automatically by the ArticleContentWithCTAs function
- `<see-also />` is automatically injected after the first section and at article end
- All shortcodes must be properly closed (self-closing with `/>`)

## Authoring Rules
- Español, conciso, útil. Evita promesas exageradas o claims médicos.
- Título natural con la intención de búsqueda; slug breve.
- `description` única (~150 caracteres) para CTR.
- Estructura: `##` secciones, `###` subsecciones.
- Internos: enlaza a guías relevantes, hubs, productos; usa `<see-also>`.
- FAQ: añade `## FAQ` y `### Pregunta` para JSON‑LD FAQPage.

## Product Pages
- Catalog: `src/content/products.json` (slug, name, description, brand, sku, image, price, currency, availability, productId, publishableKey).
- Autogenera páginas en `/product/:slug` y hub `/products`.
- Cada página incluye JSON‑LD Product con Offer (usa placeholders si no hay datos reales).

## Blog Planning System 🔄

**MANDATORY**: Before writing ANY blog post, ALWAYS check `/blog-planning/BLOG_TODO.md`

### Quick Blog Writer Agent
For autonomous blog creation, use the specialized `blog_writer` agent:
```
Task: blog_writer - "Write next priority blog post"
```
This agent automatically handles research, writing, and status tracking according to established patterns.

### Blog Image Agent
Automatically adds a hero image and 2–3 contextual images per post using Unsplash. Reads headings to decide placement.

Usage:
```
deno task images              # all posts
deno task images -- --slug slug1,slug2  # selected posts
deno task images -- --force   # refresh hero/sections
```

Setup:
- Set `UNSPLASH_ACCESS_KEY` in environment or `.env.mcp`.
- Optional: run Unsplash MCP server (`npx mcp-unsplash`) if you prefer MCP. Current script uses REST directly.

Implementation:
- Script: `scripts/enrich-blog-images.ts`
- Saves images under `public/images/blog/<slug>/` and sets `heroImage` in frontmatter.
- `BlogPost.tsx` renders the hero image under title/excerpt automatically.

### Book Research Agent
For discovering unique, viral-worthy topics from expert knowledge:
```
Task: book_research - "Discover unique blog topics from books_MD knowledge base"
```
This agent mines Pilates books for expert insights, generates viral titles, and creates research briefs that competitors cannot replicate. Integrates with keyword clusters for SEO optimization.

### Workflow Rules
1. **Check TODO List**: Always start by reading `blog-planning/BLOG_TODO.md`
2. **Research First**: Complete the research file before writing
3. **One Post at a Time**: Never write multiple posts simultaneously
4. **Update Status**: Mark progress (🔬 → 📝 → ✅) in BLOG_TODO.md
5. **Follow Queue**: Write posts in order of priority

### Research Phase (Required)
- Fill corresponding `/blog-planning/research/[topic].md` file
- Minimum 1000 words of research content
- Include Mexican market focus and CAMA Pilates product connections
- Add SEO keywords and references
- Plan shortcode placement (see-also, hub-list, etc.)
- Plan image placement (hero + 2 contextual images). Use the image agent when ready.
- Structure content for automatic FAQ extraction (use ## FAQ section)
- Mark as 📝 when research is complete

### Writing Phase
- Only start when research file is marked 📝
- Follow blog structure suggested in research file
- Target 1500-2500 words for final blog
- Include proper shortcode placement: `<see-also />`, `<hub-list />` as needed
- Add FAQ section (## FAQ) for automatic structured data
- Include CAMA Pilates CTAs and product connections
- Use correct frontmatter structure with all required fields
- Add `heroImage` when available (image agent can set it).
- Mark as ✅ when published

### File Locations
- **TODO List**: `/blog-planning/BLOG_TODO.md`
- **Research Files**: `/blog-planning/research/[topic-name].md`
- **Published Blogs**: `/src/content/blog/[slug].md`

## Build & Deploy

### Local Development
```bash
npm ci && npm run build  # prerender + OG + sitemap
npm run dev              # local dev server
```

### Deployment to Cloudflare Pages

**CRITICAL: Always use this exact process when pushing to main**

#### Step 1: Commit Changes
```bash
# Stage your changes
git add .

# Create commit with descriptive message
git commit -m "feat(scope): description

Details about changes...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Step 2: Push to GitHub
```bash
git push
```

#### Step 3: Verify Deployment
1. **GitHub Actions**: https://github.com/timottowitz/camapilates.com/actions
   - Look for "Deploy to Cloudflare Pages" workflow
   - Should show green checkmark when successful
   - Click workflow to see build logs

2. **Cloudflare Dashboard**: https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** → **camadepilates**
   - Check deployment status and logs
   - View deployment URL

3. **Live Site**: Visit production URL to verify changes

#### Common Deployment Issues

**Build Failures:**
- Check GitHub Actions logs for errors
- Common issues: TypeScript errors, missing dependencies, ESM/CommonJS conflicts
- Fix locally, commit, and push again

**Deno vs Node.js:**
- Workflow uses Deno for builds (`deno task build`)
- Ensure all imports are ESM compatible
- Use `import` not `require()` in config files

**Environment Variables:**
- Set in Cloudflare Pages dashboard: **Settings** → **Environment variables**
- Required: `SITE_URL`, `VITE_GA_ID`, etc.
- Secrets are encrypted and not visible in logs

**Cache Issues:**
- Purge Cloudflare cache if changes don't appear
- Cache prewarm runs via cron (see `/functions/cron-prewarm.js`)

#### Deployment Checklist
- [ ] Local build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Git status clean (all changes committed)
- [ ] Commit message follows convention
- [ ] Pushed to main branch
- [ ] GitHub Actions workflow passes
- [ ] Cloudflare deployment succeeds
- [ ] Live site updated and working

## Analytics (Google tag)

We use GA4 via the Google tag (gtag.js).

Best practice adopted for this repo:
- Install the global tag once in `index.html` immediately after `<head>`.
- Send SPA pageviews on route changes using a listener.
- Do NOT duplicate the tag per page; one tag per HTML document.

Implementation details:
- Global tag snippet in `index.html` (currently using `G-RP5K1P8VKP`). If you need to change it, set `VITE_GA_ID` and keep the snippet ID in sync.
- Consent Mode default is set to grant analytics and deny ads until updated. If you add a cookie banner later, call `setConsent(...)` from `src/lib/analytics/ga.ts` after the user choice.
- SPA pageviews: `src/components/analytics/GAListener.tsx` + `src/lib/analytics/ga.ts` track `page_path` on every React Router navigation. The component is mounted in `src/App.tsx`.
- Static prerender preserves the tag because our prerenderer does not remove `<script>` tags from the head template.

When adding new pages/components:
- No extra work is required. Do not add additional GA tags. The listener covers route changes.
- If a page triggers important events (e.g., purchases, form submits), prefer helpers in `src/lib/analytics/ga.ts`:
  - `event(name, params)` generic emitter
  - `beginCheckout(params)`
  - `addToCart({ value, currency, items })`
  - `purchase({ transaction_id, value, currency, items })`
  - `viewItem({ item_id, item_name, value, currency, items })`
- If you integrate Consent UI later, update consent with `setConsent({ analytics_storage: 'granted'|'denied', ad_storage: 'granted'|'denied', ... })` as needed.

## SEO Checklist por PR
- [ ] Frontmatter completo; `description` única.
- [ ] Título y slug reflejan intención de búsqueda.
- [ ] Interlink: guías ↔ comparativas ↔ productos; `<see-also>`.
- [ ] FAQ presente si aplica.
- [ ] OG auto; build OK; sitemap actualizado.

## Plantilla de Post
```
---
title: "Mejor Cama de Pilates para Casa (2025)"
description: "Guía para elegir tu cama de Pilates para casa: tamaño, accesorios y precio."
category: "Guías de compra"
tags: ["cama de pilates", "reformer casa", "mejor cama"]
publishDate: "2025-09-24"
author: "CAMA Pilates"
slug: "mejor-cama-de-pilates-para-casa"
featured: false
---

# Mejor Cama de Pilates para Casa (2025)

> Nota: Contenido informativo; no es asesoramiento médico.

## Resumen
<2–3 frases introductorias sobre el tema>

## Criterios clave para elegir
- <punto importante 1>
- <punto importante 2>
- <punto importante 3>

## Tipos de camas de Pilates
### <Subsección con detalles>
Texto explicativo...

<see-also limit="3" />

## Qué considerar al comprar
### Espacio y medidas
Información sobre dimensiones...

### Presupuesto y calidad
Comparativa de opciones...

## Recomendaciones CAMA Pilates
Nuestros Reformers ofrecen calidad premium con ingeniería alemana y manufactura mexicana...

<hub-list category="Guías de compra" limit="5" title="Más guías de compra" />

## FAQ
### ¿Cuál es el mejor tamaño para casa?
Respuesta detallada sobre dimensiones...

### ¿Qué presupuesto necesito?
Información sobre rangos de precio...

### ¿Vale la pena invertir en calidad?
Explicación sobre relación calidad-precio...
```

## Plantilla de Producto (products.json)
```
{
  "slug": "reformer-premium",
  "name": "Cama de Pilates Reformer – Premium",
  "description": "Descripción breve del modelo.",
  "brand": "CAMA Pilates",
  "sku": "PREM-REF-001",
  "image": "/og/reformer-premium.png",
  "price": "2499.00",
  "currency": "MXN",
  "availability": "https://schema.org/InStock",
  "productId": "prod_xxx",
  "publishableKey": "sr_live_pk_xxx"
}
```

---

## Image Upload Workflow

**CRITICAL: We ONLY use Convex for ALL images. No public folder images.**

**When user drops an image in chat:**

### Quick Steps
1. **Identify area** - Where does it go? (hero, product, blog, feature, logo, badge)
2. **Optimize** - WebP, correct size, compressed
3. **Upload to Convex** - Run upload script
4. **Update convexAssets.ts** - Add image name constant and hook
5. **Test** - `npm run build` must succeed
6. **Deploy** - Commit and push

### Convex Storage (ONLY Method)

**Use for:** ALL images (hero, product, blog, feature, logo, badge, finish, etc.)

**Process:**
1. Save image temporarily
2. Create upload script in `scripts/upload-{name}.ts`
3. Upload via Convex client: `generateUploadUrl` → POST file → `siteImages.upload`
4. Update `src/lib/convexAssets.ts` with new image name
5. Use `useConvexAssets()` hook in component

**Categories:** `hero`, `product`, `feature`, `logo`, `badge`, `finish`, `blog`

### Image Sizes
- **Hero:** 1920x1080 (16:9), WebP
- **Product:** 1000x1000 (1:1), WebP
- **Feature:** 800x600 (4:3), WebP
- **Blog/OG Image:** 1200x630, PNG/JPEG
- **Logo:** SVG preferred, or 2x PNG

### Example

**User drops image:** "Add this as homepage hero"

**You:**
```bash
# 1. Save image temporarily
cp user-image.webp /tmp/hero-homepage.webp

# 2. Create upload script
scripts/upload-hero-homepage.ts

# 3. Run upload to Convex
deno run --allow-all scripts/upload-hero-homepage.ts

# 4. Update convexAssets.ts
Add HERO_HOMEPAGE constant and hook

# 5. Update Index.tsx
Use assets.heroHomepage

# 6. Test & commit
npm run build
git add .
git commit -m "feat(hero): add homepage hero image via Convex"
git push
```

**See:** `IMAGE_UPLOAD_GUIDE.md` for complete documentation
