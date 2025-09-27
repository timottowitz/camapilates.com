## Shop Rebuild — Ticket Backlog (v1)

Scope: Rebuild the shop with contextual awareness of the current codebase, inspired by the Merrithew shop UX, using 21st.dev-style components (implemented locally as wrappers on our Shadcn/Tailwind stack). Preserve our Shoprocket checkout, SEO prerendering, and Cloudflare setup.

Assumptions
- Keep `src/content/products.json` as single source of truth for catalog.
- Keep checkout via Shoprocket embed; we’ll centralize embed configuration in one component.
- Maintain existing `/products` and `/product/:slug` for compatibility; add `/shop` as the new hub with modern UX.
- Avoid network installs initially; 21st.dev components are implemented as local wrappers consistent with our stack.

Architecture Decisions (AD)
- AD-1: Introduce `src/components/commerce21/*` as 21st.dev component wrappers using Shadcn + Tailwind tokens.
- AD-2: Introduce `src/lib/shop/{types,catalog}.ts` for typed access to products and shared helpers (price, availability, URL building).
- AD-3: Route `/shop` is the new product hub with filters, sort, and facets; it reuses JSON-LD `ItemList` like `/products`.
- AD-4: PDP keeps Shoprocket but via `<ShoprocketEmbed />` to ensure consistent options/styles.
- AD-5: Preserve and expose Region estimator (MX/US/DE) across listing and PDP via a tiny hook.

Dependencies / Risks
- Product images and rich galleries are placeholders; ensure graceful fallback.
- Only two products exist today; filters are built to scale, but default to simple UI when facets are sparse.
- If we later install 21st.dev packages, swap our wrappers behind identical interfaces.

Ticket List

SHOP-001 — Inventory current shop and gaps
- Description: Document current pages (`/store`, `/products`, `/product/:slug`) and data paths; list gaps vs. Merrithew (facets, sort, categories, bundles, search, a11y details).
- Acceptance: README note or this file updated with a short gap list.
- Files: SHOP_TICKETS.md

SHOP-002 — Define product types and catalog helpers
- Description: Create `Product` type from `products.json`, plus helpers for URL, price formatting, availability labels, and `toItemListSchema`.
- Acceptance: Types compile; helpers covered by light usage in pages.
- Files: `src/lib/shop/types.ts`, `src/lib/shop/catalog.ts`

SHOP-003 — 21st.dev wrappers: ProductCard, ProductGrid, FilterBar
- Description: Implement minimal wrappers: `ProductCard21`, `ProductGrid21`, `FilterBar21` with a11y and responsive behavior.
- Acceptance: Components render with our two products; empty states and skeletons included.
- Files: `src/components/commerce21/*`

SHOP-004 — ShoprocketEmbed abstraction
- Description: Centralize Shoprocket embed config, exposing a simple API for PDP/listing CTAs; ensure popup open works consistently.
- Acceptance: PDP and listing CTA both open the Shoprocket modal.
- Files: `src/components/commerce21/ShoprocketEmbed.tsx`

SHOP-005 — New Shop hub page at /shop
- Description: Build `/shop` page using 21st.dev wrappers with facets (category stub), price sort, and region estimator.
- Acceptance: `/shop` lists products, supports sort, shows region note, emits JSON-LD ItemList.
- Files: `src/pages/Shop.tsx`, route wiring in `src/App.tsx`

SHOP-006 — Prerender support for /shop
- Description: Update prerender script to snapshot `/shop` similar to `/products`.
- Acceptance: `npm run build` generates `dist/shop/index.html` with proper head/meta and ItemList JSON‑LD.
- Files: `scripts/static-prerender.cjs`

SHOP-007 — Header nav: expose /shop
- Description: Add a “Tienda (Nuevo)” link to `/shop` next to existing Store.
- Acceptance: Header shows link; static header in prerender updated later if needed.
- Files: `src/components/layout/Header.tsx`

SHOP-008 — PDP refactor to use ShoprocketEmbed
- Description: Replace inline embed in `Product.tsx` with `<ShoprocketEmbed />` + CTA.
- Acceptance: PDP behavior unchanged for user; implementation centralized.
- Files: `src/pages/Product.tsx`

SHOP-009 — PDP gallery (21st.dev style)
- Description: Add basic gallery component with zoom-friendly images and keyboard nav; use `FINISHES` images as sources.
- Acceptance: Gallery renders; fallback to product image when missing.
- Files: `src/components/commerce21/Gallery21.tsx`, integrate in PDP.

SHOP-010 — Cross‑sell block on PDP
- Description: Add “Accesorios” and “Más guías” blocks using internal links; align with shortcodes strategy.
- Acceptance: Blocks render and link to `/accesorios` and popular guides.
- Files: `src/pages/Product.tsx`

SHOP-011 — Filters: category, price range (stub)
- Description: Implement category chips and a price sort (Low→High, High→Low); add a range slider later when more items exist.
- Acceptance: Sorting works; category filters don’t break with current minimal data.
- Files: `src/pages/Shop.tsx`, `src/components/commerce21/FilterBar21.tsx`

SHOP-012 — JSON‑LD enhancements
- Description: Confirm ItemList on /shop, Product/Offer on PDP; include AggregateRating when available via `ReviewsPreview`.
- Acceptance: Valid JSON‑LD output visible in page source.
- Files: `src/pages/Shop.tsx`, `src/pages/Product.tsx`

SHOP-013 — A11y pass (focus, labels, roles)
- Description: Ensure form controls labeled; keyboard navigation for filters; alt text and headings correct.
- Acceptance: Axe devtools yields no critical issues (manual check).
- Files: commerce21 components and pages

SHOP-014 — Performance pass
- Description: Use `loading="lazy"` for grids, `priority` for top hero images, avoid layout shift; keep CSS simple.
- Acceptance: Lighthouse > 90 on Performance for shop pages (local check).
- Files: commerce21 components and pages

SHOP-015 — Region estimator hook reuse
- Description: Extract region state into a small shared hook used by /shop and PDP.
- Acceptance: One source of truth for estimate messaging.
- Files: `src/lib/shop/region.ts`, update pages

SHOP-016 — Compare Casa vs Pro (link from shop)
- Description: Surface the `/store` compare table via a prominent link/card on /shop.
- Acceptance: Users can jump to comparison quickly.
- Files: `src/pages/Shop.tsx`

SHOP-017 — Analytics events (deferred)
- Description: Stub event emitters for view_item, select_item, add_to_cart (when Shoprocket popup opens).
- Acceptance: Console logs behind a feature flag; can wire GA later.
- Files: `src/lib/shop/analytics.ts`, embed usage

SHOP-018 — Docs: contributor guide for shop
- Description: Add a short “How to add products and images” doc.
- Acceptance: Clear steps to add/verify a new product.
- Files: `docs/SHOP_GUIDE.md`

Status Tracking
- Use this file to mark tickets: [ ] pending, [🔄] in progress, [✅] done.
- Current: 001–007 targeted in this PR; others to follow.

