
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

## Shortcodes
- `<hub-list tags="a,b" category="Guías de compra" limit="30" title="..." />` — Autolista.
- `<see-also limit="3" />` — Enlaces contextuales en medio del artículo.
- `<shoprocket-button product="prod_xxx" pk="sr_live_pk_xxx" />` — Botón con popup.

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

## Build & Deploy
- Local: `npm ci && npm run build` → prerender + OG + sitemap.
- CF Pages: headers + functions incluidos; set `SITE_URL` y cron prewarm.

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
<2–3 frases>

## Criterios clave
- <punto>
- <punto>
- <punto>

<see-also limit="3" />

## Qué comprar
### <Subsección>
Texto...

## FAQ
### ¿Pregunta?
Respuesta.
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
