Edelweiss Pilates — UX • Copy • SEO Backlog (Executable Tickets)

Scope: Convert the audit into concrete tickets with priorities, clear acceptance criteria, and file targets so we can implement in small, verifiable PRs. All public‑facing copy must be Spanish (es‑MX).

Legend
- Priority: P0 (now), P1 (next), P2 (later)
- Effort: S (<2h), M (2–6h), L (>1d)
- AC = Acceptance Criteria

Sprint 1 — Conversion & Navigation (P0)

P0-001 Replace legacy nav with focused IA (S)
- Change: Header menu = Inicio, Tienda, Acabados, Accesorios, Centro de Conocimiento, Paquete de Estudio (8+), Certificación
- Remove: FAQ, legacy Tienda (/store)
- Files: src/components/layout/Header.tsx, scripts/static-prerender.cjs
- AC: Nav matches above on all routes (CSR + prerender). Links work.

P0-002 Homepage primary CTA (S)
- Add bold hero CTA: “Comprar ahora” + secondary “Comparar modelos” and ensure scroll/tap targets >44px
- Files: src/pages/Index.tsx
- AC: One primary CTA; buttons visible on mobile; Lighthouse tap targets pass.

P0-003 Breadcrumbs everywhere it matters (S)
- Ensure PDP, /shop/category/:slug show BreadcrumbList JSON‑LD & visible crumbs
- Files: src/pages/Product.tsx, src/pages/ShopCategory.tsx
- AC: Visible crumbs; schema validates in Rich Results.

P0-004 WhatsApp-first support affordance (S)
- Keep WA first on hero, PDP, sticky bars; add aria-labels
- Files: Shop/PDP/Store sticky bars
- AC: Visible on mobile; links click open WA; accessible labels present.

P0-005 Trust strip near price/CTAs (S)
- Add “Pago seguro”, “Entrega 7–14 días”, “Garantía 3 años”, “Repuestos exprés” next to price/CTA on PDP
- Files: src/pages/Product.tsx
- AC: Trust strip present above the fold on mobile & desktop.

P0-006 Fast path to Studio Pack (S)
- Prominent link/CTA “Paquete de Estudio (8+) – 20%” on /shop and PDP
- Files: src/pages/Shop.tsx, src/pages/Product.tsx
- AC: Link visible on first screen on desktop & mobile.

P0-007 Internal linking hub (S)
- Ensure /cama-de-pilates/, /cama-de-pilates/en-venta, /cama-de-pilates/precio interlink and link to /shop and PDPs
- Files: hub pages
- AC: From any hub page, two clicks to PDP.

P0-008 Spanish everywhere + tone pass (M)
- Ensure hero/subline/CTAs are Spanish on /shop. Replace remaining English phrases.
- Files: src/pages/Shop.tsx
- AC: No English strings in store; i18n lint pass by search.

Sprint 1 — Media & Product Presentation (P0)

P0-009 Gallery parity (S)
- PDP gallery: minimum 4 images (angles + finish), enable zoom cursor, keyboard left/right
- Files: src/components/commerce21/Gallery21.tsx usage in PDP
- AC: Arrow keys work; zoom feel communicated.

P0-010 Mylo™ Special Edition polish (S)
- Badge in Featured section & grid; PDP chip + tooltip; link to Mylo page; structured data includes material_brand
- Files: FeaturedProduct21.tsx, ProductCard21.tsx, Product.tsx
- AC: Badge appears; tooltip text in Spanish; JSON‑LD has PropertyValue material_brand=Mylo (micelio).

P0-011 Replace placeholders with approved assets (M)
- Move hero/category/explore to /public/images per ASSETS mapping; compress to webp; width sets
- Files: public/images/*, src/lib/assets.ts
- AC: No 404s; <100KB hero LCP; LCP <2.5s on mobile.

Sprint 1 — Speed & Mobile (P0)

P0-012 Image constraints & lazy (S)
- Ensure images have width/height or aspect; add loading="lazy" except LCP hero
- Files: grid cards, rails, PDP
- AC: Lighthouse CLS <0.1; no unsized image warnings.

P0-013 JS budget & split (M)
- Split blog/shop routes, defer heavy embeds until interaction
- Files: src/App.tsx, dynamic imports for Shop/Blog/Store
- AC: Bundle < 300KB initial on mobile; no long tasks > 200ms.

P0-014 Tailwind purge & font fallbacks (S)
- Ensure unused CSS purged; confirm system fonts stack on slow
- Files: tailwind.config.ts
- AC: CSS < 150KB gz.

Sprint 2 — Checkout & CTAs (P1)

P1-015 CTA color & whitespace audit (S)
- Use accent Ember (#FF5A3D) for primary CTAs; ensure 16px+ padding, 8:1 contrast
- Files: buttons across pages
- AC: Buttons consistent; meets WCAG AA.

P1-016 Cart reassurance (S)
- In cart view: show badges, shipping promise “7–14 días MX”, payment logos
- Files: ShoprocketCart or wrapper note
- AC: Visible reassurance next to checkout button.

P1-017 Studio Pack lead flow (M)
- Add form/CTA “Solicitar Cotización – 20%” to /packs/estudio; capture name/email/WA
- Files: src/pages/StudioPack.tsx
- AC: Submission creates mailto draft or posts webhook; confirmation copy shows.

Sprint 2 — Copy & Voice (P1)

P1-018 Value prop first (S)
- Ensure each key page H1 communicates concrete benefits in 1–2 lines
- Files: Index, Shop, PDP, Hub pages
- AC: “Silencio total”, “Nogal & cuero genuino”, “Acero estructural” present above the fold.

P1-019 Benefit bullets for personas (S)
- Add sub‑sections “Para Estudios” & “Para Instructoras” with 3 benefit bullets each
- Files: PDP & /shop
- AC: Two persona blocks present with concise Spanish copy.

P1-020 Subtle urgency/exclusividad (S)
- Add copy “existencias limitadas”, “volumen 8+ con 20%” in relevant areas
- Files: Shop & PDP
- AC: Copy visible without feeling pushy.

Sprint 2 — SEO On‑Page (P1)

P1-021 Money pages titles & metas (S)
- Unique H1/title/meta on: /cama-de-pilates, /en-venta, /precio, /shop, /product/*
- Files: pages + Helmet
- AC: Titles contain target intent; metas ≤ 160 chars.

P1-022 FAQ schema on price/venta (S)
- Add 3–5 FAQs on /precio & /en-venta with schema
- Files: those pages
- AC: Rich results tester shows FAQPage.

P1-023 Canonicals & hreflang prep (S)
- Verify canonical on each route; add comments for future hreflang
- Files: Helmet across pages
- AC: No duplicate content warnings in GSC.

Sprint 3 — Content & Backlinks (P2)

P2-024 Content plan execution (L)
- Publish 6 posts: dimensiones, mantenimiento, comparativa marcas, casa vs estudio, precio ranges, accesorios esenciales
- Files: src/content/blog/*.md
- AC: Each with interlinks to PDP; OG generated; sitemap updated.

P2-025 Case studies & testimonios (M)
- Add 2 testimonios (Laura + 1 estudio) with 1–2 images each; snippet on PDP
- Files: content + PDP render block
- AC: Snippets visible; optional schema Review (aggregate when count ≥5).

P2-026 Backlink outreach (L)
- Create 1 PR brief & outreach list (10 targets); log status in /docs/PR_OUTREACH.md
- AC: At least 3 links acquired over cycle.

Sprint 3 — Local SEO & GMB (P2)

P2-027 Google Business Profile (M)
- Create/verify listing, add photos, categories, service area MX
- AC: GBP live; link from footer “Encuéntranos en Google”.

P2-028 Local signals on site (S)
- Mention “Fabricado en CDMX” & “Envíos en todo México” in footer and PDP trust strip
- Files: Footer, Product.tsx
- AC: Copy visible on mobile/desktop.

Analytics & Experimentation (P0)

P0-029 GA4 pageviews & events (S)
- Confirm GA pageviews working; wire add_to_cart, begin_checkout from existing helpers when buy buttons clicked
- Files: src/lib/analytics/ga.ts used in PDP & Quick View
- AC: Events visible in GA4 DebugView.

P0-030 A/B test scaffolding (P2)
- Add feature flag util for headline/CTA text experiments (local only to start)
- Files: src/lib/flags.ts (new), sample in Shop hero
- AC: Toggle switches copy variants without rebuild.

QA Checklist per ticket
- Spanish copy & tone (precisa, silenciosa, honesta)
- Mobile-first spacing & tap targets
- Lighthouse Perf ≥ 90, CLS < 0.1
- SEO metas present (title/desc/canonical)
- Analytics: pageview + events if applicable

