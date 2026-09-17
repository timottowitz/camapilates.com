#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
// const { marked } = require('marked'); // Moved to dynamic import

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content', 'blog');
const PRODUCTS = path.join(ROOT, 'src', 'content', 'products.json');
const STUDIOS = path.join(ROOT, 'src', 'data', 'studios.json');
const SHOP_CATEGORY_SEO = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'content', 'shop-category-seo.json'), 'utf8')
);
const STUDIO_DIRECTORY_SEO = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'content', 'studio-directory-seo.json'), 'utf8')
);
const REDIRECT_POST_SLUGS = new Set([
  'precio-cama-de-pilates',
  'precio-cama-de-pilates-2025',
]);

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function htmlEscape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Must stay identical to slugify() in src/utils/slug.ts and in generate-sitemap.cjs.
// The blog tag and category routes redirect anything that is not already in this form,
// so a percent-encoded value here writes the prerendered file to a URL nothing links to
// and declares a canonical that redirects.
function slugify(input) {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function baseHtml(template, headMeta, bodyHtml) {
  // Inject head tags and static body content into dist/index.html
  let html = template;
  // Clean conflicting tags from template head before injecting route-specific ones
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, '<title></title>')
    .replace(/<meta[^>]+name=\"description\"[^>]*>\n?/gi, '')
    .replace(/<link[^>]+rel=\"canonical\"[^>]*>\n?/gi, '')
    .replace(/<meta[^>]+property=\"og:[^\"]+\"[^>]*>\n?/gi, '')
    .replace(/<meta[^>]+name=\"twitter:[^\"]+\"[^>]*>\n?/gi, '');
  // inject new head tags
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${htmlEscape(headMeta.title)}</title>`);
  const headInsert = [
    `<meta name="description" content="${htmlEscape(headMeta.description || '')}">`,
    `<link rel="canonical" href="${htmlEscape(headMeta.canonical)}">`,
    `<meta property="og:title" content="${htmlEscape(headMeta.title)}">`,
    `<meta property="og:description" content="${htmlEscape(headMeta.description || '')}">`,
    `<meta property="og:type" content="${htmlEscape(headMeta.ogType || 'website')}">`,
    `<meta property="og:url" content="${htmlEscape(headMeta.canonical)}">`,
    `<meta property="og:image" content="${htmlEscape(headMeta.ogImage || '')}">`,
  ].join('\n');
  html = html.replace(/<\/head>/, headInsert + '\n</head>');
  // Replace root content
  const collectionLinks = Object.entries(SHOP_CATEGORY_SEO)
    .map(([slug, category]) => `<a href="/shop/category/${slug}" class="hover:text-black">${htmlEscape(category.navLabel)}</a>`)
    .join('\n');
  const headerHtml = `
  <header class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div class="container flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-3">
        <img src="/brand/edelweiss.svg" alt="CAMA Pilates" class="h-7 w-auto" />
        <span class="text-sm md:text-base font-semibold tracking-tight text-gray-900">CAMA Pilates</span>
      </a>
      <nav class="flex items-center gap-6 text-sm text-gray-700">
        <a href="/shop" class="hover:text-black">Tienda</a>
        ${collectionLinks}
        <a href="/blog" class="hover:text-black">Blog</a>
        <a href="/about" class="hover:text-black">Acerca de</a>
      </nav>
    </div>
  </header>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${headerHtml}${bodyHtml}</div>`);
  return html;
}

function shortcodeAttributes(source) {
  const attrs = {};
  String(source || '').replace(/(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (_match, key, doubleQuoted, singleQuoted) => {
    attrs[key] = doubleQuoted ?? singleQuoted;
    return '';
  });
  return attrs;
}

function normalizeHubId(value) {
  if (!value) return undefined;
  const normalized = `/${String(value).trim().replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? undefined : normalized;
}

function renderArticleLinks(items, title) {
  if (!items.length) return '';
  return `<aside class="my-8"><h3 class="text-xl font-semibold mb-3">${htmlEscape(title)}</h3><ul>${items
    .map(post => `<li><a href="/blog/${htmlEscape(post.slug)}">${htmlEscape(post.title)}</a></li>`)
    .join('')}</ul></aside>`;
}

function relatedPosts(current, posts, limit) {
  const currentTags = new Set(current.tags.map(tag => tag.toLowerCase()));
  const byTag = posts.filter(post =>
    post.slug !== current.slug &&
    !REDIRECT_POST_SLUGS.has(post.slug) &&
    post.tags.some(tag => currentTags.has(tag.toLowerCase()))
  );
  if (byTag.length >= limit) return byTag.slice(0, limit);

  const selected = new Set(byTag.map(post => post.slug));
  const byCategory = posts.filter(post =>
    post.slug !== current.slug &&
    !REDIRECT_POST_SLUGS.has(post.slug) &&
    post.category === current.category &&
    !selected.has(post.slug)
  );
  const merged = [...byTag, ...byCategory];
  if (merged.length >= limit) return merged.slice(0, limit);

  const mergedSlugs = new Set(merged.map(post => post.slug));
  const fallback = posts.filter(post =>
    post.slug !== current.slug &&
    !REDIRECT_POST_SLUGS.has(post.slug) &&
    !mergedSlugs.has(post.slug)
  );
  return [...merged, ...fallback].slice(0, limit);
}

function renderShortcodes(content, current, posts) {
  return content
    .replace(/<hub-list\b((?:"[^"]*"|'[^']*'|[^"'<>])*)\/>/gi, (_match, source) => {
      const attrs = shortcodeAttributes(source);
      const hubId = normalizeHubId(attrs.hub_id);
      const tags = new Set(
        String(attrs.tags || '')
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(Boolean)
      );
      const limit = Number.parseInt(attrs.limit || '20', 10);
      const items = posts.filter(post => {
        if (post.slug === current.slug || REDIRECT_POST_SLUGS.has(post.slug)) return false;
        if (attrs.category && post.category.toLowerCase() !== attrs.category.toLowerCase()) return false;
        if (tags.size && !post.tags.some(tag => tags.has(tag.toLowerCase()))) return false;
        return true;
      }).slice(0, Number.isFinite(limit) && limit >= 0 ? limit : 20);
      const hubLink = hubId
        ? `<p><a href="${htmlEscape(hubId)}">Ver guía principal</a></p>`
        : '';
      return `${hubLink}${renderArticleLinks(items, attrs.title || 'Artículos relacionados')}`;
    })
    .replace(/<see-also\b((?:"[^"]*"|'[^']*'|[^"'<>])*)\/>/gi, (_match, source) => {
      const attrs = shortcodeAttributes(source);
      const limit = Number.parseInt(attrs.limit || '3', 10);
      const safeLimit = Number.isFinite(limit) && limit >= 0 ? limit : 3;
      return renderArticleLinks(relatedPosts(current, posts, safeLimit), 'También te puede interesar');
    })
    .replace(/<audio-story[^>]*\/>/g, '');
}

function assertNoRawRelatedShortcodes(html, route) {
  if (/<(?:hub-list|see-also)\b/i.test(html)) {
    throw new Error(`Unrendered related-post shortcode in ${route}`);
  }
}

function commercialParentLinks(post) {
  const signals = `${post.title} ${post.description} ${post.category} ${(post.tags || []).join(' ')}`.toLowerCase();
  const buyingArticle =
    ['guías de compra', 'comparativas'].includes((post.category || '').toLowerCase()) ||
    /(comprar|compra|precio|barata|venta|financiaci[oó]n|mejor|elegir)/.test(signals);
  if (!buyingArticle) return '';

  const links = [];
  if (/(reformer|cama de pilates|equipo|comparativa|guía de compra)/.test(signals)) {
    links.push({ href: '/cama-de-pilates', label: 'Camas de Pilates en México' });
    links.push({ href: '/cama-de-pilates/precio', label: 'Precios de Camas de Pilates 2026' });
    links.push({ href: '/shop/category/reformers', label: 'Colección de Reformers' });
  }
  if (/(casa|hogar|doméstic)/.test(signals)) {
    links.push({ href: '/reformer-para-casa', label: 'Reformer para casa' });
  }
  if (/(estudio|profesional|negocio)/.test(signals)) {
    links.push({ href: '/reformer-para-estudio', label: 'Reformer para estudio' });
    links.push({ href: '/packs/estudio', label: 'Packs para estudio' });
  }
  if (!links.length) return '';
  return `<nav aria-label="Recursos de compra" class="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-200"><p class="text-xs uppercase font-bold tracking-wider text-stone-600 mb-2">Recursos y guías de compra:</p><ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-amber-900">${links
    .map(link => `<li><a href="${link.href}" class="hover:underline">→ ${htmlEscape(link.label)}</a></li>`)
    .join('')}</ul></nav>`;
}

function extractFaqSchemaFromMarkdown(content) {
  if (!content) return null;
  const faqMatch = content.match(/## FAQ\n([\s\S]*?)(?=\n## |$)/i);
  if (!faqMatch) return null;
  const faqSection = faqMatch[1];
  const items = [];
  const qMatches = [...faqSection.matchAll(/###\s+([^\n]+)\n([\s\S]*?)(?=\n###|$)/g)];
  for (const m of qMatches) {
    const q = m[1].trim().replace(/^¿?/, '¿').replace(/\??$/, '?');
    const a = m[2].trim().replace(/\n+/g, ' ').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_#`]/g, '');
    if (q && a) {
      items.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a
        }
      });
    }
  }
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
  };
}

function buildArticleSchema(p, origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    image: [`${origin}/og/${p.slug}.png`],
    datePublished: p.date,
    dateModified: p.date,
    author: {
      '@type': 'Organization',
      name: 'CAMA Pilates',
      url: origin
    },
    publisher: {
      '@type': 'Organization',
      name: 'CAMA Pilates',
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${origin}/blog/${p.slug}`
    }
  };
}

function buildBlogBreadcrumbSchema(p, origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
      { '@type': 'ListItem', position: 3, name: p.title, item: `${origin}/blog/${p.slug}` }
    ]
  };
}

function renderPost({ slug, title, description, category, date, tags, content }, marked, posts) {
  const current = { slug, title, description, category, date, tags, content };
  const md = content
    ? renderShortcodes(content, current, posts)
    : '';
  const article = `
    <article class="container mx-auto px-4 py-8">
      <header>
        <div class="text-sm text-muted-foreground mb-4">${htmlEscape(category || '')} • ${htmlEscape(date || '')}</div>
        <h1 class="text-4xl font-bold mb-4">${htmlEscape(title)}</h1>
        <p class="text-xl text-muted-foreground mb-8">${htmlEscape(description || '')}</p>
      </header>
      ${commercialParentLinks(current)}
      <div class="prose max-w-none">${marked.parse(md)}</div>
    </article>
  `;
  return article;
}

function buildIndex(posts) {
  const items = posts.map(p => `
    <a href="/blog/${p.slug}" class="block group border rounded-lg p-4 hover:border-primary/50">
      <div class="text-xs text-muted-foreground mb-2">${htmlEscape(p.category)}</div>
      <h2 class="font-semibold group-hover:text-primary mb-1">${htmlEscape(p.title)}</h2>
      <p class="text-sm text-muted-foreground">${htmlEscape(p.description || '')}</p>
    </a>
  `).join('\n');
  return `<div class="container mx-auto px-4 py-8"><h1 class="text-3xl font-bold mb-6">Centro de Conocimiento</h1><div class="grid md:grid-cols-2 gap-4">${items}</div></div>`;
}

function buildShopIndex(products) {
  const cards = products.map(p => `
    <a href="/product/${p.slug}" class="block group border rounded-lg p-6 hover:border-gray-900 transition-colors">
      <img src="${p.image}" alt="${p.name}" class="w-full h-auto rounded mb-4 border" />
      <h2 class="font-semibold text-gray-900 group-hover:text-black">${p.name}</h2>
      <p class="text-sm text-gray-600 mt-2">${p.description}</p>
      <div class="mt-3 font-semibold text-gray-900">$ ${p.price} ${p.currency}</div>
    </a>
  `).join('\n');
  return `<div class="container mx-auto px-4 py-12"><h1 class="text-3xl font-bold text-gray-900 mb-8">Tienda</h1><div class="grid md:grid-cols-3 gap-6">${cards}</div></div>`;
}

function buildStudioReformerPage(reformers) {
  const cards = reformers.map(product => `
    <article class="rounded-lg border p-6">
      <a href="/product/${htmlEscape(product.slug)}">
        <img src="${htmlEscape(product.image)}" alt="${htmlEscape(product.name)}" class="w-full h-auto rounded mb-4" />
        <h2 class="text-xl font-semibold text-gray-900">${htmlEscape(product.name)}</h2>
      </a>
      <p class="mt-3 text-gray-700">${htmlEscape(product.description)}</p>
      <p class="mt-4 font-semibold text-gray-900">$ ${htmlEscape(product.price)} ${htmlEscape(product.currency)}</p>
    </article>
  `).join('\n');

  return `
    <main class="container mx-auto px-4 py-12">
      <nav aria-label="Migas de pan" class="text-sm text-gray-600">
        <a href="/">Inicio</a> / Reformer para estudio
      </nav>
      <header class="mt-8 max-w-4xl">
        <p class="text-sm uppercase tracking-wide text-gray-600">Equipamiento profesional</p>
        <h1 class="mt-3 text-4xl font-bold text-gray-900">Reformer para estudio</h1>
        <p class="mt-5 text-lg leading-8 text-gray-700">
          Compara los Reformers disponibles para equipar un estudio de Pilates. Revisa cada ficha para confirmar materiales, configuración, precio y tiempo de fabricación.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a href="/shop/category/reformers" class="rounded border px-5 py-3 font-semibold">Ver colección completa</a>
          <a href="/packs/estudio" class="rounded border px-5 py-3 font-semibold">Cotizar pack de estudio</a>
        </div>
      </header>
      <section class="mt-14">
        <h2 class="text-2xl font-bold text-gray-900">Modelos disponibles para estudio</h2>
        <p class="mt-3 text-gray-700">${reformers.length} Reformers disponibles en el catálogo actual.</p>
        <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
      </section>
      <aside class="mt-14">
        <h2 class="text-2xl font-bold text-gray-900">Planifica el equipamiento de tu estudio</h2>
        <ul class="mt-5 space-y-3">
          <li><a href="/blog/reformer-casa-vs-profesional">Compara Reformer para casa vs profesional</a></li>
          <li><a href="/blog/cama-de-pilates-guia-de-compra">Consulta la guía de compra de cama de Pilates</a></li>
          <li><a href="/blog/mantenimiento-cama-de-pilates">Revisa la guía de mantenimiento del Reformer</a></li>
        </ul>
      </aside>
    </main>
  `;
}

function formatMXN(price) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
}

function calculateMSI(price, months = 12) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return formatMXN(Math.round(num / months));
}

function buildCamaDePilatesPage(reformers, origin) {
  const productCards = reformers.map(p => {
    const msi = calculateMSI(p.price, 12);
    const formattedPrice = formatMXN(p.price);
    const materialsList = Array.isArray(p.materials) ? p.materials.slice(0, 3).join(' · ') : '';
    const badge = p.bestSeller
      ? `<span class="inline-block bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">Más Vendido</span>`
      : '';
    const waUrl = `https://wa.me/525548468190?text=${encodeURIComponent('Hola, me interesa información y cotización de la cama ' + p.name)}`;

    return `
    <article class="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <div class="relative overflow-hidden rounded-xl mb-4 bg-stone-50 aspect-[4/3] flex items-center justify-center">
          <img src="${htmlEscape(p.image)}" alt="${htmlEscape(p.name)}" class="w-full h-full object-cover object-center" loading="lazy" />
        </div>
        ${badge}
        <h3 class="text-xl font-bold text-stone-900 leading-snug mb-2">
          <a href="/product/${htmlEscape(p.slug)}" class="hover:text-amber-700 transition-colors">${htmlEscape(p.name)}</a>
        </h3>
        <p class="text-sm text-stone-600 mb-4 line-clamp-3 leading-relaxed">${htmlEscape(p.description)}</p>
        ${materialsList ? `<p class="text-xs text-stone-500 font-medium mb-4"><span class="text-stone-700">Materiales:</span> ${htmlEscape(materialsList)}</p>` : ''}
      </div>
      <div class="pt-4 border-t border-stone-100 mt-2">
        <div class="mb-1">
          <span class="text-2xl font-extrabold text-stone-900">${htmlEscape(formattedPrice)}</span>
          <span class="text-xs text-stone-500 font-semibold ml-1">MXN</span>
        </div>
        <p class="text-xs text-emerald-700 font-semibold mb-4">Hasta 12 MSI de ${htmlEscape(msi)} MXN</p>
        <div class="grid grid-cols-2 gap-2">
          <a href="/product/${htmlEscape(p.slug)}" class="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg border border-stone-300 text-stone-800 hover:bg-stone-50 transition-colors text-center">
            Ver Ficha
          </a>
          <a href="${htmlEscape(waUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors text-center">
            Cotizar
          </a>
        </div>
      </div>
    </article>`;
  }).join('\n');

  return `
  <main class="bg-[#FAF9F6] text-stone-900">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 pt-16 pb-12 max-w-6xl">
      <nav aria-label="Migas de pan" class="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-6">
        <a href="/" class="hover:text-stone-900">Inicio</a> / <span class="text-stone-900">Cama de Pilates</span>
      </nav>
      <div class="max-w-4xl">
        <span class="inline-block bg-stone-200 text-stone-800 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
          Manufactura de Precisión · Entrega a Todo México
        </span>
        <h1 class="text-4xl md:text-6xl font-serif italic font-bold tracking-tight text-stone-950 mb-6 leading-[1.05]">
          Camas de Pilates Reformer en México: Modelos, Precios y Venta 2026
        </h1>
        <p class="text-lg md:text-xl text-stone-700 font-light leading-relaxed mb-8">
          Encuentra la mejor <strong>cama de Pilates (Reformer)</strong> para equipar tu estudio boutique o practicar en casa con nivel profesional. En <strong>CAMA Pilates</strong> combinamos maderas macizas seleccionadas (Maple norteamericano y Roble blanco) y perfiles de aleación de aluminio reforzada con resortes alemanes de alambre de piano y rodamientos japoneses ultra-silenciosos. Envíos asegurados a Ciudad de México, Monterrey, Guadalajara, Querétaro, Puebla y las 32 entidades del país con garantía de 3 años y refacciones locales inmediatas.
        </p>
        <div class="flex flex-wrap gap-4 mb-12">
          <a href="#catalogo" class="rounded-full bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md">
            Ver Catálogo de Camas (${reformers.length} Modelos) ↓
          </a>
          <a href="https://wa.me/525548468190?text=${encodeURIComponent('Hola, me interesa recibir asesoría y cotización para una cama de Pilates Reformer en México.')}" target="_blank" rel="noopener noreferrer" class="rounded-full bg-emerald-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md">
            Cotizar por WhatsApp →
          </a>
          <a href="/cama-de-pilates/precio" class="rounded-full border border-stone-300 bg-white text-stone-800 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
            Guía de Precios 2026
          </a>
        </div>
      </div>

      <!-- Trust Badges Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-stone-200 mb-16">
        <div class="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
          <div class="text-xl mb-1">🚚</div>
          <h4 class="font-bold text-sm text-stone-900">Envío Asegurado 32 Estados</h4>
          <p class="text-xs text-stone-600 mt-1">Flete especializado a CDMX, MTY, GDL y todo el país en 3 a 8 semanas.</p>
        </div>
        <div class="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
          <div class="text-xl mb-1">🛡️</div>
          <h4 class="font-bold text-sm text-stone-900">Garantía Directa de 3 Años</h4>
          <p class="text-xs text-stone-600 mt-1">Cobertura total en estructura, rieles y mecanismos de carga.</p>
        </div>
        <div class="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
          <div class="text-xl mb-1">💳</div>
          <h4 class="font-bold text-sm text-stone-900">Hasta 12 MSI</h4>
          <p class="text-xs text-stone-600 mt-1">Meses sin intereses con tarjetas participantes y transferencias seguras.</p>
        </div>
        <div class="p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
          <div class="text-xl mb-1">⚙️</div>
          <h4 class="font-bold text-sm text-stone-900">Refacciones Locales Inmediatas</h4>
          <p class="text-xs text-stone-600 mt-1">Resortes, poleas, correas y tapicerías en inventario nacional permanente.</p>
        </div>
      </div>
    </section>

    <!-- Catalog Section -->
    <section id="catalogo" class="container mx-auto px-4 pb-20 max-w-6xl">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Catálogo Oficial 2026</span>
          <h2 class="text-3xl md:text-4xl font-serif italic font-bold text-stone-900 mt-1">
            Modelos de Camas de Pilates en Venta
          </h2>
          <p class="text-stone-600 mt-2 max-w-xl text-sm">
            Desde modelos compactos y elegantes para casa hasta Reformers clínicos con media torre para estudios profesionales de alta afluencia.
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex gap-2">
          <a href="/packs/estudio" class="text-xs font-bold text-stone-800 bg-white border border-stone-300 px-4 py-2 rounded-lg hover:bg-stone-50">
            Packs de Estudio (20% Desc.)
          </a>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${productCards}
      </div>
    </section>

    <!-- Technical Comparison Table -->
    <!-- Brand Comparison Section: CAMA vs Competitors in Mexico -->
    <section class="container mx-auto px-4 pb-20 max-w-6xl">
      <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-10 shadow-sm">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Análisis Comparativo de Mercado</span>
        <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mt-1 mb-4">
          CAMA Pilates vs. Otras Marcas en México: Vanlig, Ironside, UCAN y Balanced Body
        </h2>
        <p class="text-stone-600 text-sm mb-8 max-w-3xl leading-relaxed">
          Al invertir en una cama de Pilates en México, las diferencias no son solo de marca: se traducen en seguridad biomecánica, durabilidad del chasis, silencio en el deslizamiento y, sobre todo, disponibilidad inmediata de refacciones y soporte técnico local. Compara con total transparencia:
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="border-b-2 border-stone-200 bg-stone-50 text-stone-800 font-bold">
                <th class="p-3 md:p-4">Criterio</th>
                <th class="p-3 md:p-4 text-emerald-900 bg-emerald-50/60 font-extrabold">CAMA Pilates®</th>
                <th class="p-3 md:p-4">Vanlig / Centurfit</th>
                <th class="p-3 md:p-4">Ironside / Tayga</th>
                <th class="p-3 md:p-4">Balanced Body / Merrithew</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Origen y Manufactura</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">Ingeniería alemana · Taller artesanal en México</td>
                <td class="p-3 md:p-4 text-stone-600">Importación genérica de China (revendedor)</td>
                <td class="p-3 md:p-4 text-stone-600">Marca de crossfit / fitness comercial</td>
                <td class="p-3 md:p-4 text-stone-600">Importado de EE.UU. / Canadá</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Materiales del Chasis</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">Madera maciza (Maple / Roble 3cm) o Aluminio aeronáutico</td>
                <td class="p-3 md:p-4 text-stone-600">Acero tubular delgado o contrachapado básico</td>
                <td class="p-3 md:p-4 text-stone-600">Aluminio plegable estándar + madera multicapa</td>
                <td class="p-3 md:p-4 text-stone-600">Madera noble o aluminio extruido premium</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Calidad de Resortes</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">5 resortes alemanes calibrados (alambre de piano)</td>
                <td class="p-3 md:p-4 text-stone-600">Ligas de caucho o resortes sin calibración elástica</td>
                <td class="p-3 md:p-4 text-stone-600">5-6 resortes genéricos de tensión estándar</td>
                <td class="p-3 md:p-4 text-stone-600">5 resortes patentados de alta precisión</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Sistema de Rodamientos</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">8 rodamientos sellados japoneses Whisper-Glide (cero ruido)</td>
                <td class="p-3 md:p-4 text-stone-600">Ruedas plásticas de fricción propensas a chirridos</td>
                <td class="p-3 md:p-4 text-stone-600">Ruedas estándar de nylon sobre riel metálico</td>
                <td class="p-3 md:p-4 text-stone-600">Ruedas de precisión de uretano y baleros sellados</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Capacidad de Carga Real</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">Hasta 180–200 kg certificados</td>
                <td class="p-3 md:p-4 text-stone-600">100–120 kg (se flexiona con usuarios pesados)</td>
                <td class="p-3 md:p-4 text-stone-600">130–150 kg máximo</td>
                <td class="p-3 md:p-4 text-stone-600">150–180 kg</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Rango de Precios (MXN)</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">$23,234 a $85,050 MXN (12 MSI disponibles)</td>
                <td class="p-3 md:p-4 text-stone-600">$4,489 a $50,999 MXN (stock muy limitado)</td>
                <td class="p-3 md:p-4 text-stone-600">$19,690 a $25,990 MXN (solo 1-2 modelos)</td>
                <td class="p-3 md:p-4 text-stone-600">$90,000 a $160,000+ MXN (altos aranceles)</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-semibold text-stone-900">Garantía y Refacciones</td>
                <td class="p-3 md:p-4 font-bold text-emerald-800 bg-emerald-50/30">3 años directos · Refacciones en almacén MX en 24-48h</td>
                <td class="p-3 md:p-4 text-rose-700">3-6 meses básica · Sin refacciones oficiales en MX</td>
                <td class="p-3 md:p-4 text-stone-600">Garantía estándar de equipo de gimnasio</td>
                <td class="p-3 md:p-4 text-stone-600">Garantía en EE.UU. · Refacciones en USD con semanas de espera</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Spring Calibration & Biomechanical Resistance Guide -->
    <section class="container mx-auto px-4 pb-20 max-w-6xl">
      <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-10 shadow-sm">
        <div class="max-w-3xl mb-8">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Biometría y Resistencia</span>
          <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mt-1 mb-3">
            El Sistema de 5 Resortes Alemanes de Alambre de Piano: Calibración y Uso
          </h2>
          <p class="text-stone-600 text-sm leading-relaxed">
            En el método Pilates tradicional y contemporáneo, el resorte no solo crea carga: <strong>asiste o desafía la estabilidad neuromuscular</strong>. A diferencia de las pesas tradicionales, la resistencia del resorte aumenta progresivamente a medida que el carro se aleja de la barra de pies, protegiendo las articulaciones en los puntos de máxima flexión y desafiando al músculo en su elongación.
          </p>
        </div>

        <div class="grid sm:grid-cols-3 gap-6">
          <div class="p-6 rounded-xl border border-amber-200 bg-amber-50/40">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-4 h-4 rounded-full bg-amber-400 border border-amber-600"></span>
              <h3 class="font-bold text-stone-900 text-base">1 Resorte Amarillo (25%)</h3>
            </div>
            <p class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">Tensión Ligera · Asistencia y Control</p>
            <p class="text-xs text-stone-600 leading-relaxed mb-3">
              Ofrece la menor resistencia de retorno. Ideal para series de brazos sentados, rehabilitación de manguito rotador, articulación de columna y ejercicios donde menos resorte exige mayor control del core abdominal para evitar que el carro choque.
            </p>
            <span class="inline-block bg-white text-stone-700 text-xs px-2.5 py-1 rounded border border-stone-200 font-medium">Ej: Long Spine, Arm Springs</span>
          </div>

          <div class="p-6 rounded-xl border border-sky-200 bg-sky-50/40">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-4 h-4 rounded-full bg-sky-500 border border-sky-700"></span>
              <h3 class="font-bold text-stone-900 text-base">2 Resortes Azules (50% c/u)</h3>
            </div>
            <p class="text-xs font-bold uppercase tracking-wider text-sky-900 mb-2">Tensión Media · El Estándar Funcional</p>
            <p class="text-xs text-stone-600 leading-relaxed mb-3">
              La resistencia base para más del 60% del repertorio de Pilates. Brinda la estabilidad justa para la serie de Hundred, Stomach Massage, Mermaid, y trabajo unilateral de cadera. Diseñado con alambre de piano que no se fatiga con el uso continuo.
            </p>
            <span class="inline-block bg-white text-stone-700 text-xs px-2.5 py-1 rounded border border-stone-200 font-medium">Ej: The Hundred, Elephant, Short Box</span>
          </div>

          <div class="p-6 rounded-xl border border-rose-200 bg-rose-50/40">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-4 h-4 rounded-full bg-rose-500 border border-rose-700"></span>
              <h3 class="font-bold text-stone-900 text-base">2 Resortes Rojos (100% c/u)</h3>
            </div>
            <p class="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2">Tensión Fuerte · Carga Estructural y Salto</p>
            <p class="text-xs text-stone-600 leading-relaxed mb-3">
              Resistencia pesada para trabajo de grandes cadenas musculares: cuádriceps, glúteos e isquiotibiales en el Footwork inicial, así como absorción de impacto controlada en saltos cardiovasculares con la tabla de salto (Jumpboard).
            </p>
            <span class="inline-block bg-white text-stone-700 text-xs px-2.5 py-1 rounded border border-stone-200 font-medium">Ej: Footwork (3-4 resortes), Jumpboard</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Buyer Decision Framework: 4 Common Pitfalls in Mexico -->
    <section class="container mx-auto px-4 pb-20 max-w-4xl">
      <div class="bg-stone-50 border border-stone-200 rounded-2xl p-6 md:p-10">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Criterios de Decisión</span>
        <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mt-1 mb-6">
          4 Errores Críticos al Comprar una Cama de Pilates en México
        </h2>
        
        <div class="space-y-6 text-sm text-stone-700">
          <div class="border-b border-stone-200 pb-5">
            <h3 class="font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <span class="text-rose-600 font-bold">1.</span> Caer en la trampa de camas de $4,000 – $8,000 MXN con ligas de goma
            </h3>
            <p class="leading-relaxed text-stone-600">
              En plataformas de marketplace abundan aparatos anunciados como "Cama de Pilates" por menos de $8,000 pesos. Estos equipos sustituyen los resortes de acero por ligas de látex o elásticos tubulares. La curva de resistencia de una liga es inconsistente, se afloja en menos de 3 meses, el carro se traba con ruedas plásticas sin baleros y el marco inestable aumenta el riesgo de caídas o tirones musculares. Un Reformer real requiere tensión mecánica por resortes de acero al carbono.
            </p>
          </div>

          <div class="border-b border-stone-200 pb-5">
            <h3 class="font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <span class="text-amber-700 font-bold">2.</span> Comprar equipos importados sin almacén de refacciones en México
            </h3>
            <p class="leading-relaxed text-stone-600">
              Los resortes, poleas y correas son consumibles sometidos a tracción continua. En un estudio comercial, un resorte roto significa una máquina fuera de servicio. Si compras marcas importadas de Asia o Norteamérica sin representación oficial en México, sustituir un resorte o una rueda puede demorar hasta 12 semanas y costar cientos de dólares en trámites aduanales. En CAMA Pilates mantenemos inventario permanente en CDMX con envíos en 24 a 48 horas a cualquier estado.
            </p>
          </div>

          <div class="border-b border-stone-200 pb-5">
            <h3 class="font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <span class="text-sky-800 font-bold">3.</span> Confundir un Reformer plegable residencial con uno de estudio comercial
            </h3>
            <p class="leading-relaxed text-stone-600">
              Los Reformers plegables son una solución extraordinaria para departamentos en Polanco, Condesa, San Pedro o Providencia donde el espacio es limitado. Sin embargo, no están diseñados para operar 8 horas consecutivas al día con alumnos de 100+ kg. Si planeas abrir un estudio comercial o dar clases profesionales, necesitas una estructura rígida de Maple o aluminio anodizado que no ceda ni vibre ante cargas laterales continuas.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-base text-stone-900 mb-2 flex items-center gap-2">
              <span class="text-emerald-800 font-bold">4.</span> Ignorar la ergonomía de la barra de pies y el soporte lumbar
            </h3>
            <p class="leading-relaxed text-stone-600">
              Una barra de pies de una sola posición fija fuerza a los practicantes más altos o más bajos a adoptar ángulos de rodilla lesivos. Nuestras camas cuentan con 4 a 6 posiciones de ajuste angular y topos regulables en el riel, permitiendo calibrar la distancia exacta del carro para estaturas desde 1.45 m hasta 2.05 m.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- In-depth Educational Guide Section -->
    <section class="container mx-auto px-4 pb-20 max-w-4xl">
      <div class="prose prose-stone max-w-none">
        <h2 class="text-3xl font-serif italic font-bold text-stone-900 mb-6">
          Guía Definitiva: Todo lo que Debes Saber Antes de Comprar una Cama de Pilates en México
        </h2>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">¿Qué es una Cama de Pilates (Reformer) y Por Qué es Superior al Ejercicio de Suelo?</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          La <strong>cama de Pilates</strong>, originalmente concebida por Joseph Pilates bajo el nombre de <em>Universal Reformer</em>, es un equipo biomecánico diseñado para fortalecer el cuerpo de manera simétrica, corregir desbalances posturales y aumentar la movilidad articular sin generar impacto sobre la columna vertebral ni las articulaciones periféricas.
        </p>
        <p class="text-stone-700 leading-relaxed mb-4">
          A diferencia del Pilates en tapete (Mat Pilates), donde el practicante trabaja únicamente contra la gravedad y su propio peso corporal, el Reformer utiliza un <strong>carro deslizante montado sobre rieles de precisión</strong> y un <strong>conjunto de resortes de distintas tensiones</strong>. Esta combinación permite tanto asistir el movimiento de personas en rehabilitación o con sobrepeso, como desafiar a atletas de alto rendimiento mediante resistencias continuas en fase concéntrica y excéntrica.
        </p>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">Reformer para Casa vs. Reformer para Estudio: Claves para Decidir</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          Una de las preguntas más frecuentes entre compradores en México es si deben adquirir un modelo residencial o uno profesional de estudio:
        </p>
        <ul class="list-disc pl-6 text-stone-700 space-y-2 mb-6">
          <li><strong>Cama de Pilates para Casa:</strong> Busca optimizar el espacio sin perder rigidez. Se prefieren modelos de perfil estilizado en aluminio o maderas nobles que se integren armónicamente con la decoración del hogar. Cuentan con ruedas de traslado frontales para mover el equipo con facilidad y admiten almacenamiento vertical o en formato compacto.</li>
          <li><strong>Cama de Pilates de Estudio Comercial:</strong> Diseñada para resistir entre 6 y 12 sesiones continuas diarias. Requiere una base estructural indeformable (Maple norteamericano macizo de 3 cm o aluminio estructural reforzado), barra de pies con microajuste de posiciones para adaptarse velozmente a alumnos de diferentes estaturas, y tapicería de grado comercial antibacteriana resistente a desinfectantes y sudoración continua.</li>
        </ul>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">¿Cuánto Cuesta una Cama de Pilates en México en 2026?</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          En el mercado mexicano actual existen tres rangos de precio claramente diferenciados:
        </p>
        <ol class="list-decimal pl-6 text-stone-700 space-y-3 mb-6">
          <li><strong>Gama Económica / Importación Genérica ($15,000 – $25,000 MXN):</strong> Reformers plegables ligeros fabricados con perfiles delgados y ruedas plásticas. Suelen presentar juego o vibración en el riel, ruidos metálicos molestos y una ausencia casi absoluta de refacciones en México si se rompe un resorte o una polea.</li>
          <li><strong>Gama Intermedia & Profesional Nacional CAMA ($23,234 – $42,567 MXN):</strong> Fabricados con maderas nobles macizas (Roble o Maple) o aleaciones de aluminio reforzado, equipados con resortes alemanes de alambre de piano y rodamientos japoneses. Es el rango con mejor relación costo-beneficio del mercado mexicano, con garantía directa de 3 años y repuestos inmediatos.</li>
          <li><strong>Gama Alta con Torre o Cadillac ($51,000 – $85,050 MXN):</strong> Estaciones híbridas que incorporan una torre de acero inoxidable con poleas superiores, barra de empuje (push-through bar) y juego extendido de resortes, permitiendo ejecutar más de 300 ejercicios clínicos y avanzados.</li>
        </ol>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">Dimensiones y Requisitos de Espacio para Instalar tu Cama</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          Un Reformer estándar mide aproximadamente <strong>235 cm a 246 cm de largo</strong> por <strong>68 cm a 75 cm de ancho</strong>, con una altura de carro que oscila entre 30 cm y 40 cm sobre el piso. Para practicar con total seguridad y realizar ejercicios con la barra de pies extendida y poleas abiertas, se recomienda contar con un espacio despejado de al menos <strong>3.0 metros de largo por 1.8 metros de ancho</strong>.
        </p>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">Logística y Envíos Seguros a Toda la República Mexicana</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          El transporte de una cama de Pilates requiere un manejo logístico especializado debido a su peso (entre 70 kg y 110 kg según acabados). En CAMA Pilates enviamos nuestras camas debidamente embaladas en cajas de madera tratada para exportación, con flete asegurado directo a domicilio en las 32 entidades federativas de México, incluyendo:
        </p>
        <p class="text-stone-600 text-sm font-medium mb-6">
          Ciudad de México (CDMX) · Monterrey y Zona Metropolitana (San Pedro, Valle Oriente, Cumbres) · Guadalajara, Zapopan y Tlaquepaque · Querétaro (Juriquilla, El Campanario, Álamos) · Puebla (Angelópolis, Cholula) · Mérida · Cancún · León · Tijuana · Toluca · Cuernavaca.
        </p>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="container mx-auto px-4 pb-20 max-w-4xl">
      <div class="border-t border-stone-200 pt-12">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Preguntas Frecuentes</span>
        <h2 class="text-3xl font-serif italic font-bold text-stone-900 mt-1 mb-8">
          Preguntas Frecuentes sobre la Compra de Camas de Pilates en México
        </h2>
        <div class="space-y-4">
          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuánto cuesta una cama de Pilates Reformer en México?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              En México, los precios de camas de Pilates profesionales inician desde $23,234 MXN para modelos clásicos de roble, entre $28,000 y $38,000 MXN para modelos de maple norteamericano y aluminio de alta gama, y entre $51,000 y $85,050 MXN para equipos que incorporan media torre o estructura de Cadillac. Todos nuestros precios incluyen IVA y garantía directa.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuál es la diferencia entre un Reformer de madera y uno de aluminio?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Ambos ofrecen exactamente la misma precisión biomecánica. Los Reformers de madera maciza (como el Maple y Roble) aportan una estética orgánica, cálida y clásica sumamente cotizada en estudios boutique y residencias. Los Reformers de aluminio ofrecen una estética contemporánea e industrial, menor peso total para facilitar reubicaciones y rieles anodizados de altísima resistencia al desgaste.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Qué espacio necesito para tener un Reformer en casa o departamento?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              El equipo mide en promedio 240 cm de largo por 70 cm de ancho. Se aconseja disponer de una superficie de al menos 3.0 m x 1.8 m para entrar y salir con comodidad y extender los brazos lateralmente sin obstáculos. Muchos clientes en departamentos de CDMX, MTY y GDL ubican su Reformer en una recámara secundaria, sala o estudio.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Sí. Aceptamos pagos con tarjeta de crédito con planes de hasta 12 Meses Sin Intereses con bancos participantes a través de nuestras pasarelas de pago certificadas. También contamos con descuentos preferenciales en pagos de contado por transferencia bancaria SPEI.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Hacen envíos a Monterrey, Guadalajara, Querétaro y todo México?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Sí, realizamos envíos asegurados a las 32 entidades federativas del país. La mercancía viaja con seguro contra daños de transporte puerta a puerta. El tiempo estimado de producción y entrega es de 3 a 8 semanas según el acabado y modelo seleccionado.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Qué garantía tienen los Reformers y cómo se gestionan las refacciones?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Ofrecemos una garantía directa de 3 años en chasis, rieles y mecanismos estructurales. A diferencia de las máquinas importadas donde un repuesto puede tardar meses o ser imposible de conseguir, en CAMA Pilates contamos con almacén de refacciones en México con resortes de repuesto, poleas, correas de cuero y microfibra con envío exprés de 24 a 48 horas.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cómo se calibra la resistencia de los resortes y qué combinaciones se usan?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Nuestras camas incorporan un sistema de 5 resortes alemanes calibrados por código de color: 1 amarillo (25% ligero), 2 azules (50% medio) y 2 rojos (100% pesado). Para trabajo de calentamiento y brazos se usa 1 resorte azul o amarillo; para ejercicios de abdomen y estabilidad de core se emplean 1 a 2 azules; y para la serie de Footwork y salto con Jumpboard se combinan 3 a 4 resortes (ej. 2 rojos + 1 azul o 2 rojos + 2 azules).
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Qué mantenimiento preventivo requiere un Reformer en México y cada cuánto se cambian los resortes?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              El mantenimiento básico incluye limpiar los rieles semanalmente con un paño de microfibra seco (evitando lubricantes con base de silicón que atraigan polvo), desinfectar la tapicería con soluciones libres de alcohol, e inspeccionar los resortes cada 6 meses. En uso residencial, los resortes de alambre de piano duran entre 3 y 5 años sin fatiga elástica. En estudios comerciales con alto flujo (6+ clases diarias), se recomienda renovar el set de resortes cada 18 a 24 meses por seguridad.
            </div>
          </details>

          <details class="bg-white border border-stone-200 rounded-2xl p-6 group">
            <summary class="font-bold text-lg text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Por qué un Reformer de madera maciza o aluminio estructural es superior a una cama plegable económica?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
            </summary>
            <div class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              Las camas plegables económicas de menos de $15,000 MXN utilizan perfiles delgados y articulaciones centrales que con el tiempo ceden, generando un desnivel perceptible en el recorrido del carro. Además, sustituyen los rodamientos sellados por ruedas de plástico de alta fricción. Una cama de madera maciza de Maple o Roble de 3 cm o un chasis de aluminio de aviación absorbe las vibraciones por completo, no se pandea y garantiza una alineación postural impecable que protege las articulaciones.
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- Bottom Hub Links -->
    <section class="bg-stone-100 border-t border-stone-200 py-12">
      <div class="container mx-auto px-4 max-w-6xl">
        <h3 class="text-sm font-bold uppercase tracking-widest text-stone-600 mb-6">Explora Más Recursos de CAMA Pilates</h3>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <a href="/cama-de-pilates/precio" class="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-colors">
            <strong class="block text-stone-900 mb-1">Guía de Precios</strong>
            <span class="text-xs text-stone-600">Rangos de costo por modelo y nivel de equipamiento.</span>
          </a>
          <a href="/reformer-para-estudio" class="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-colors">
            <strong class="block text-stone-900 mb-1">Reformer para Estudio</strong>
            <span class="text-xs text-stone-600">Equipos de uso rudo para abrir tu estudio boutique.</span>
          </a>
          <a href="/reformer-para-casa" class="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-colors">
            <strong class="block text-stone-900 mb-1">Reformer para Casa</strong>
            <span class="text-xs text-stone-600">Modelos residenciales compactos y silenciosos.</span>
          </a>
          <a href="/certificacion-pilates" class="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-400 transition-colors">
            <strong class="block text-stone-900 mb-1">Certificación Oficial</strong>
            <span class="text-xs text-stone-600">Formación profesional para instructores en México.</span>
          </a>
        </div>
      </div>
    </section>
  </main>`;
}

function buildCamaDePilatesPrecioPage(reformers, origin) {
  const priceRows = reformers.slice(0, 10).map(p => {
    const formattedPrice = formatMXN(p.price);
    const msi = calculateMSI(p.price, 12);
    return `
    <tr class="border-b border-stone-100 hover:bg-stone-50">
      <td class="p-4 font-semibold text-stone-900">
        <a href="/product/${htmlEscape(p.slug)}" class="hover:text-amber-800 transition-colors">${htmlEscape(p.name)}</a>
      </td>
      <td class="p-4 text-stone-600 text-xs">${htmlEscape(p.materials ? p.materials[0] : 'Aluminio / Madera')}</td>
      <td class="p-4 font-bold text-stone-900">${htmlEscape(formattedPrice)} MXN</td>
      <td class="p-4 font-semibold text-emerald-700">12 MSI de ${htmlEscape(msi)}</td>
      <td class="p-4">
        <a href="/product/${htmlEscape(p.slug)}" class="text-xs font-bold uppercase tracking-wider text-stone-900 hover:underline">Ver Ficha →</a>
      </td>
    </tr>`;
  }).join('\n');

  return `
  <main class="bg-[#FAF9F6] text-stone-900">
    <section class="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
      <nav aria-label="Migas de pan" class="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-6">
        <a href="/" class="hover:text-stone-900">Inicio</a> / <a href="/cama-de-pilates" class="hover:text-stone-900">Cama de Pilates</a> / <span class="text-stone-900">Precio</span>
      </nav>
      <div class="max-w-4xl">
        <span class="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
          Guía Transparente de Costos México 2026
        </span>
        <h1 class="text-4xl md:text-6xl font-serif italic font-bold tracking-tight text-stone-950 mb-6 leading-[1.05]">
          ¿Cuánto Cuesta una Cama de Pilates en México? Precios y Presupuestos 2026
        </h1>
        <p class="text-lg md:text-xl text-stone-700 font-light leading-relaxed mb-8">
          En México, el precio de una <strong>cama de Pilates Reformer</strong> profesional oscila entre <strong>$23,234 MXN y $85,050 MXN</strong>, dependiendo del tipo de chasis (madera maciza de arce/roble vs. aleación de aluminio extrusionado), la presencia de media torre o aditamentos de Cadillac, y la calidad de los rodamientos y resortes alemanes. Analizamos con total transparencia los rangos de costo, facilidades de 12 Meses Sin Intereses y qué factores determinan una inversión segura y rentable.
        </p>
        <div class="flex flex-wrap gap-4 mb-12">
          <a href="/cama-de-pilates" class="rounded-full bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md">
            Ver Modelos y Comprar en /cama-de-pilates →
          </a>
          <a href="https://wa.me/525548468190?text=${encodeURIComponent('Hola, me gustaría cotizar una cama de Pilates Reformer con opciones de precio y financiamiento en México.')}" target="_blank" rel="noopener noreferrer" class="rounded-full bg-emerald-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md">
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </section>

    <!-- Pricing Matrix Table -->
    <section class="container mx-auto px-4 pb-16 max-w-5xl">
      <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm mb-12">
        <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mb-4">
          Tabla de Precios Oficiales CAMA Pilates 2026
        </h2>
        <p class="text-stone-600 text-sm mb-6">
          Precios actualizados con entrega en todo México, IVA incluido y garantía de fábrica de 3 años.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b-2 border-stone-200 bg-stone-50 text-stone-800 font-bold">
                <th class="p-4">Modelo Reformer</th>
                <th class="p-4">Material Principal</th>
                <th class="p-4">Precio Contado (MXN)</th>
                <th class="p-4">Financiamiento (MSI)</th>
                <th class="p-4">Detalle</th>
              </tr>
            </thead>
            <tbody>
              ${priceRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Market Comparison Table -->
      <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm mb-12">
        <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mb-4">
          Comparativa de Precios en México: CAMA vs. Otras Marcas
        </h2>
        <p class="text-stone-600 text-sm mb-6">
          Rangos de precios reales, materiales y condiciones de garantía de las marcas disponibles en el mercado mexicano:
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="border-b-2 border-stone-200 bg-stone-50 text-stone-800 font-bold">
                <th class="p-3 md:p-4">Marca</th>
                <th class="p-3 md:p-4">Rango de Precios (MXN)</th>
                <th class="p-3 md:p-4">Tipo de Resistencia</th>
                <th class="p-3 md:p-4">Material de Estructura</th>
                <th class="p-3 md:p-4">Garantía y Servicio</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-stone-700">
              <tr class="bg-emerald-50/50 font-medium">
                <td class="p-3 md:p-4 font-bold text-emerald-900">CAMA Pilates®</td>
                <td class="p-3 md:p-4 font-extrabold text-stone-900">$23,234 – $85,050</td>
                <td class="p-3 md:p-4">5 resortes alemanes de alambre de piano calibrados</td>
                <td class="p-3 md:p-4">Roble / Maple macizo o Aluminio aeroespacial</td>
                <td class="p-3 md:p-4 text-emerald-800">3 años garantía directa, 12 MSI, refacciones 24-48h</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-bold text-stone-900">Vanlig</td>
                <td class="p-3 md:p-4">$4,489 – $50,999</td>
                <td class="p-3 md:p-4">Ligas elásticas (gama baja) / resortes genéricos</td>
                <td class="p-3 md:p-4">MDF prensado / chapado roble / tubular plegable</td>
                <td class="p-3 md:p-4">3 a 6 meses de garantía; stock recurrente agotado</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-bold text-stone-900">Ironside / Tayga</td>
                <td class="p-3 md:p-4">$19,690 – $25,990</td>
                <td class="p-3 md:p-4">Cuerdas elásticas / resortes básicos de gimnasio</td>
                <td class="p-3 md:p-4">Acero tubular plegable (130-150 kg límite)</td>
                <td class="p-3 md:p-4">1 año; enfocado a crossfit, no pilates clínico</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-bold text-stone-900">UCAN</td>
                <td class="p-3 md:p-4">$40,000 – $50,600</td>
                <td class="p-3 md:p-4">Resortes estándar para estudio</td>
                <td class="p-3 md:p-4">Aluminio lacado en blanco (sin opciones en madera)</td>
                <td class="p-3 md:p-4">1 año; catálogo limitado a 4 modelos metálicos</td>
              </tr>
              <tr>
                <td class="p-3 md:p-4 font-bold text-stone-900">Balanced Body (Importado)</td>
                <td class="p-3 md:p-4">$90,000 – $180,000+</td>
                <td class="p-3 md:p-4">Resortes Signature calibrados</td>
                <td class="p-3 md:p-4">Maple norteamericano / Aluminio</td>
                <td class="p-3 md:p-4">Garantía en EE.UU.; 8–16 semanas de espera y aranceles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="prose prose-stone max-w-none mb-16">
        <h2 class="text-3xl font-serif italic font-bold text-stone-900 mb-6">
          ¿Qué Factores Determinan el Costo de una Cama de Pilates en México?
        </h2>
        <p class="text-stone-700 leading-relaxed mb-4">
          El abanico de precios en el mercado puede resultar desconcertante si no se evalúan los componentes estructurales que garantizan la seguridad del practicante y la vida útil del equipo:
        </p>
        <div class="grid md:grid-cols-2 gap-6 my-8 not-prose">
          <div class="p-6 bg-white border border-stone-200 rounded-xl">
            <h3 class="font-bold text-base text-stone-900 mb-2">1. Materiales de la Estructura</h3>
            <p class="text-xs text-stone-600 leading-relaxed">
              Las maderas de arce (maple) o roble blanco macizo y los perfiles de aleación de aluminio reforzada ofrecen rigidez indeformable bajo cargas pesadas. Las opciones excesivamente baratas de importación emplean MDF prensado o perfiles de acero delgado que se desajustan rápidamente.
            </p>
          </div>
          <div class="p-6 bg-white border border-stone-200 rounded-xl">
            <h3 class="font-bold text-base text-stone-900 mb-2">2. Calibración de Resortes Alemanes</h3>
            <p class="text-xs text-stone-600 leading-relaxed">
              El resorte es el corazón biomecánico del Reformer. Empleamos resortes de alambre de piano alemán de precisión calibrada que mantienen su coeficiente de elasticidad por años sin deformaciones peligrosas ni variaciones súbitas de resistencia.
            </p>
          </div>
          <div class="p-6 bg-white border border-stone-200 rounded-xl">
            <h3 class="font-bold text-base text-stone-900 mb-2">3. Rodamientos y Silencio del Carro</h3>
            <p class="text-xs text-stone-600 leading-relaxed">
              Un rodamiento japonés de precisión con ruedas de uretano de alta densidad asegura un deslizamiento sedoso y silencioso. Los carros de baja calidad generan un rechinido constante que interrumpe la concentración y el control de la respiración.
            </p>
          </div>
          <div class="p-6 bg-white border border-stone-200 rounded-xl">
            <h3 class="font-bold text-base text-stone-900 mb-2">4. Soporte Local y Refacciones en México</h3>
            <p class="text-xs text-stone-600 leading-relaxed">
              Comprar marcas extranjeras implica meses de espera y costosos aranceles de importación ante cualquier refacción. En CAMA Pilates contamos con stock permanente en México de resortes, poleas, correas dobles y tapicería para entrega en 24–48 horas.
            </p>
          </div>
        </div>

        <h3 class="text-2xl font-bold text-stone-800 mt-8 mb-4">Retorno de Inversión (ROI) para Estudios de Pilates en México</h3>
        <p class="text-stone-700 leading-relaxed mb-4">
          Para instructores y emprendedores que desean equipar un estudio boutique, la adquisición de Reformers es una de las inversiones con menor periodo de recuperación en el sector fitness:
        </p>
        <ul class="list-disc pl-6 text-stone-700 space-y-2 mb-6">
          <li><strong>Clase Privada promedio en México (CDMX/MTY/GDL):</strong> $500 a $900 MXN por hora.</li>
          <li><strong>Clase Grupal (paquete mensual 8 sesiones):</strong> $2,200 a $3,800 MXN por alumno al mes.</li>
          <li><strong>Amortización:</strong> Con apenas 4 a 6 horas de ocupación diaria por máquina, una cama de $32,900 MXN recupera el 100% de su valor inicial en <strong>2 a 3 meses de operación</strong>, generando flujo neto positivo durante los años posteriores.</li>
        </ul>

        <!-- Promo Banner to /cama-de-pilates -->
        <div class="my-10 p-8 bg-stone-900 text-white rounded-2xl text-center not-prose">
          <h3 class="text-2xl md:text-3xl font-serif italic font-bold mb-3">¿Listo para Elegir tu Modelo de Cama de Pilates?</h3>
          <p class="text-stone-300 text-sm max-w-xl mx-auto mb-6">
            Visita nuestro catálogo completo de camas de Pilates Reformer con especificaciones técnicas detalladas, fotos de alta resolución y cotización directa.
          </p>
          <a href="/cama-de-pilates" class="inline-block bg-white text-stone-950 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-stone-100 transition-all">
            Ver Modelos en Venta en /cama-de-pilates →
          </a>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white border border-stone-200 rounded-2xl p-6 md:p-10 shadow-sm mb-12 not-prose">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-800">Preguntas Frecuentes</span>
        <h2 class="text-2xl md:text-3xl font-serif italic font-bold text-stone-900 mt-1 mb-6">
          Preguntas Frecuentes sobre Precios y Presupuesto
        </h2>
        <div class="space-y-4">
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuánto cuesta una cama de Pilates en México en 2026?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              En México, el precio de una cama de Pilates Reformer profesional oscila entre $23,234 MXN para modelos clásicos de roble o aluminio de entrada, y entre $32,900 y $85,050 MXN para modelos profesionales de estudio con acabados de nogal, roble macizo, aluminio anodizado estructural y aditamentos de media torre o Cadillac.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuál es el precio de una cama de Pilates para casa?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Nuestras opciones residenciales inician desde $23,234 MXN (o desde $1,936 MXN/mes a 12 MSI). Cuentan con chasis rígido que elimina vibraciones, carro silencioso con rodamientos sellados y sistema de 5 resortes alemanes de alambre de piano.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuál es el precio de una cama de Pilates de estudio profesional?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Los Reformers profesionales para estudio boutique rondan entre $36,716 y $69,617 MXN para camas fijas de madera maciza o aluminio aeroespacial, y hasta $85,050 MXN para modelos con media torre o estructura de Cadillac. Todos con garantía directa de 3 años y tolerancias para uso comercial continuo de 8 a 10 horas diarias.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Qué factores influyen en el precio de una cama de Pilates?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Los cuatro factores determinantes son: 1) Materiales del chasis (madera maciza de 30 mm o aluminio estructural vs MDF/perfiles delgados), 2) Calibración y origen de los resortes (alambre de piano alemán vs resortes genéricos o ligas), 3) Rodamientos y rieles (deslizamiento ultra silencioso de alta precisión), y 4) Disponibilidad de refacciones locales y garantía con soporte directo en México.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Vale la pena comprar una cama de Pilates económica o plegable de importación?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Las camas plegables de menos de $15,000 MXN suelen sacrificar rigidez estructural, flexionándose en el punto de pliegue y descalibrando la alineación de columna del practicante. Además, la mayoría utiliza cuerdas elásticas en lugar de resortes calibrados y carecen totalmente de refacciones en México cuando se rompe una rueda o polea.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Qué incluye normalmente el precio de un Reformer CAMA Pilates?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Incluye el chasis completo ensamblado, carro tapizado en microfibra de alta resistencia, barra de pies ajustable multidireccional, sistema de 5 resortes alemanes calibrados por color, cabecera ajustable de 3 posiciones, hombreras ergonómicas, juego de poleas silenciosas, correas dobles de manos/pies y caja (box) según el modelo seleccionado.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Sí, contamos con financiamiento de hasta 12 Meses Sin Intereses con tarjetas de crédito de bancos participantes en México a través de pasarelas de pago seguras, además de descuentos preferenciales por pago de contado vía transferencia SPEI.
            </div>
          </details>
          <details class="border border-stone-200 rounded-xl p-5 group bg-stone-50/50">
            <summary class="font-bold text-base text-stone-900 cursor-pointer list-none flex justify-between items-center">
              ¿Cuánto cuesta el envío y cómo se protege el equipo durante el transporte?
              <span class="text-stone-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
            </summary>
            <div class="mt-3 text-stone-600 text-sm leading-relaxed border-t border-stone-200/60 pt-3">
              Realizamos envíos asegurados a toda la República Mexicana (CDMX, Monterrey, Guadalajara, Querétaro, Puebla, Mérida, etc.). Cada cama viaja embalada en un huacal de madera tratada para exportación con seguro de transporte puerta a puerta.
            </div>
          </details>
        </div>
      </div>
    </section>
  </main>`;
}

function buildShopCategoryIndex(slug, category, products) {
  const cards = products.map(p => `
    <a href="/product/${htmlEscape(p.slug)}" class="block group border rounded-lg p-6 hover:border-gray-900 transition-colors">
      <img src="${htmlEscape(p.image)}" alt="${htmlEscape(p.name)}" class="w-full h-auto rounded mb-4 border" />
      <h2 class="font-semibold text-gray-900 group-hover:text-black">${htmlEscape(p.name)}</h2>
      <p class="text-sm text-gray-600 mt-2">${htmlEscape(p.description)}</p>
      <div class="mt-3 font-semibold text-gray-900">$ ${htmlEscape(p.price)} ${htmlEscape(p.currency)}</div>
    </a>
  `).join('\n');
  const sections = category.sections.map(section => `
    <section class="mt-10 max-w-3xl">
      <h2 class="text-2xl font-bold text-gray-900">${htmlEscape(section.heading)}</h2>
      <p class="mt-3 text-gray-700 leading-7">${htmlEscape(section.body)}</p>
    </section>
  `).join('\n');
  const guides = category.guides.map(guide => `
    <li>
      <a href="${htmlEscape(guide.href)}" class="font-semibold text-gray-900 hover:underline">${htmlEscape(guide.label)}</a>
      <p class="mt-1 text-sm text-gray-600">${htmlEscape(guide.description)}</p>
    </li>
  `).join('\n');
  const related = Object.entries(SHOP_CATEGORY_SEO)
    .filter(([relatedSlug]) => relatedSlug !== slug)
    .map(([relatedSlug, relatedCategory]) => `
      <a href="/shop/category/${relatedSlug}" class="block rounded-lg border p-4 hover:border-gray-900">
        <h3 class="font-semibold text-gray-900">${htmlEscape(relatedCategory.navLabel)}</h3>
      </a>
    `).join('\n');
  const faq = category.faq.map(item => `
    <div class="border-t py-5">
      <h3 class="font-semibold text-gray-900">${htmlEscape(item.question)}</h3>
      <p class="mt-2 text-gray-700 leading-7">${htmlEscape(item.answer)}</p>
    </div>
  `).join('\n');

  return `
    <main class="container mx-auto px-4 py-12">
      <nav aria-label="Migas de pan" class="text-sm text-gray-600">
        <a href="/shop" class="hover:underline">Tienda</a> / ${htmlEscape(category.navLabel)}
      </nav>
      <header class="mt-6 max-w-4xl">
        <h1 class="text-4xl font-bold text-gray-900">${htmlEscape(category.h1)}</h1>
        <p class="mt-5 text-lg text-gray-700 leading-8">${htmlEscape(category.intro)}</p>
        <p class="mt-3 text-sm text-gray-600">${products.length} productos</p>
      </header>
      <div class="grid md:grid-cols-3 gap-6 mt-10">${cards}</div>
      <div class="mt-16">${sections}</div>
      <aside class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900">Guías para elegir mejor</h2>
        <ul class="mt-6 grid md:grid-cols-3 gap-6">${guides}</ul>
      </aside>
      <section class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900">Explora otras colecciones</h2>
        <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">${related}</div>
      </section>
      <section class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
        <div class="mt-6">${faq}</div>
      </section>
    </main>
  `;
}

function readPosts() {
  const files = walk(CONTENT);
  return files.map(f => {
    const raw = fs.readFileSync(f, 'utf8');
    const { data, content } = matter(raw);
    return {
      slug: (data.slug || path.basename(f).replace(/\.md$/i, '')).toLowerCase(),
      title: data.title || 'Article',
      description: data.description || '',
      category: data.category || 'Blog',
      date: data.publishDate || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      content
    };
  }).filter(post => !REDIRECT_POST_SLUGS.has(post.slug));
}

function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS, 'utf8');
    const list = JSON.parse(raw);
    return list;
  } catch (e) {
    return [];
  }
}

function readStudios() {
  try {
    return JSON.parse(fs.readFileSync(STUDIOS, 'utf8'));
  } catch (_error) {
    return { cities: [], studios: [] };
  }
}


function renderProduct(p, origin) {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    brand: { '@type': 'Brand', name: p.brand },
    sku: p.sku,
    image: [origin + p.image],
    url: `${origin}/product/${p.slug}`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/product/${p.slug}`,
      priceCurrency: p.currency,
      price: p.price,
      availability: p.availability,
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'MX',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' }
          },
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'MXN'
          }
        }
      ]
    }
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Camas de Pilates', item: `${origin}/cama-de-pilates` },
      { '@type': 'ListItem', position: 3, name: p.name, item: `${origin}/product/${p.slug}` }
    ]
  };
  const head = {
    title: `${p.name} | Camas de Pilates en México`,
    description: p.description,
    canonical: `${origin}/product/${p.slug}`,
    ogImage: `${origin}${p.image}`,
    ogType: 'product'
  };
  const body = `
  <section class="bg-white">
    <div class="container mx-auto px-4 py-12">
      <nav aria-label="Migas de pan" class="text-sm text-stone-500 mb-8 flex items-center gap-2">
        <a href="/" class="hover:underline">Inicio</a>
        <span>/</span>
        <a href="/cama-de-pilates" class="hover:underline font-semibold text-stone-800">Camas de Pilates</a>
        <span>/</span>
        <span class="text-stone-900">${htmlEscape(p.name)}</span>
      </nav>
      <div class="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <img src="${p.image}" alt="${htmlEscape(p.name)}" class="w-full h-auto rounded-lg border shadow-sm" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">${htmlEscape(p.name)}</h1>
          <p class="mt-4 text-gray-700 leading-relaxed">${htmlEscape(p.description)}</p>
          <div class="mt-6 text-2xl text-gray-900 font-bold">$ ${formatMXN(p.price)} ${p.currency}</div>
          <div class="mt-2 text-sm text-stone-600">Disponible desde <strong>${calculateMSI(p.price, 12)}/mes</strong> a 12 Meses Sin Intereses</div>
          <ul class="mt-6 space-y-2 text-sm text-stone-700 bg-stone-50 p-4 rounded-lg border border-stone-200">
            <li>✓ <strong>Garantía:</strong> 3 años directa de fábrica en México</li>
            <li>✓ <strong>Resortes:</strong> 5 resortes alemanes de alambre de piano de alta precisión</li>
            <li>✓ <strong>Rodamientos:</strong> Deslizamiento ultra silencioso de alta durabilidad</li>
            <li>✓ <strong>Envíos:</strong> Embalaje en huacal de madera asegurado a toda la República Mexicana</li>
          </ul>
          <div class="mt-8">
            <div class="sr-element sr-products" data-embed="single_product_widget">
              <script type="application/json" data-config="embed">${JSON.stringify({ publishable_key: p.publishableKey, options: { product_to_display: p.productId, open_product_in: 'popup', variation_style: 'on_hover' }, includes: { show_product_name: '0', show_product_price: '0', show_product_image: '0', show_product_summary: '0', open_modal_on_image_click: '0', show_view_product_button: '1', show_add_to_cart_button: '1', show_button_icons: '1' } })}</script>
            </div>
          </div>
          <div class="mt-10 pt-6 border-t border-stone-200 space-y-2 text-sm">
            <p class="font-semibold text-stone-900">Enlaces y guías recomendadas:</p>
            <div class="flex flex-col gap-1.5">
              <a href="/cama-de-pilates" class="text-amber-800 font-medium hover:underline">← Ver catálogo completo de Camas de Pilates en México</a>
              <a href="/cama-de-pilates/precio" class="text-stone-600 hover:text-stone-900 hover:underline">Tabla comparativa de precios y financiamiento 12 MSI</a>
              <a href="/blog/cama-de-pilates-guia-de-compra" class="text-stone-600 hover:text-stone-900 hover:underline">Guía definitiva de compra de Reformer (medidas, resortes y ROI)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
  return { head, body, schema: productSchema, breadcrumbSchema };
}

function writeFileForRoute(routePath, html) {
  // routePath like /blog/foo or /blog.
  //
  // Written as <path>.html rather than <path>/index.html on purpose. Cloudflare Pages
  // serves foo.html at /foo with a 200, but serves foo/index.html only at /foo/ and
  // 308s /foo to it. Every canonical we emit, and every URL in the sitemap, is the
  // slashless form, so the directory layout made 141 of 278 sitemap URLs redirect and
  // pointed each page's canonical at a URL that redirects. Same bytes, no redirect.
  const rel = routePath.replace(/^\//, '').replace(/\/$/, '');
  if (!rel) {
    fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
    return;
  }
  ensureDir(path.join(DIST, path.dirname(rel)));
  fs.writeFileSync(path.join(DIST, `${rel}.html`), html, 'utf8');
}

async function main() {
  // Import marked dynamically
  const { marked } = await import('marked');
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run build first.');
    process.exit(1);
  }
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const origin = process.env.SITE_ORIGIN || 'https://camadepilates.com';
  const posts = readPosts().sort((a,b) => new Date(b.date) - new Date(a.date));
  const prods = readProducts();
  const studioData = readStudios();
  const routeMeta = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'content', 'route-meta.json'), 'utf8'));
  
  const certCities = [
    { key: 'cdmx', name: 'Ciudad de México (CDMX)', shortName: 'Ciudad de México', directorySlug: 'ciudad-de-mexico' },
    { key: 'monterrey', name: 'Monterrey (NL)', shortName: 'Monterrey', directorySlug: 'monterrey' },
    { key: 'queretaro', name: 'Querétaro', shortName: 'Querétaro' },
    { key: 'guadalajara', name: 'Guadalajara (Jalisco)', shortName: 'Guadalajara', directorySlug: 'guadalajara' },
    { key: 'puebla', name: 'Puebla', shortName: 'Puebla' },
    { key: 'puerto-vallarta', name: 'Puerto Vallarta (Jalisco)', shortName: 'Puerto Vallarta' },
    { key: 'tijuana', name: 'Tijuana (Baja California)', shortName: 'Tijuana' },
    { key: 'riviera-maya', name: 'Riviera Maya (Quintana Roo)', shortName: 'Riviera Maya' },
    { key: 'leon', name: 'León (Guanajuato)', shortName: 'León' },
    { key: 'merida', name: 'Mérida (Yucatán)', shortName: 'Mérida' },
  ];

  // Homepage snapshot for crawlers and native Cloudflare builds.
  {
    const head = {
      title: 'Cama de Pilates (Reformer) en México — Guías, Precios y Venta | CAMA Pilates',
      description: 'Compra tu cama de Pilates Reformer en México: modelos para casa y estudio, guía de precios, dimensiones y envío desde CDMX.',
      canonical: `${origin}/`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website',
    };
    const body = `
    <main class="container mx-auto px-4 py-16">
      <header class="max-w-4xl">
        <p class="text-sm uppercase tracking-widest text-gray-600">Reformers para México</p>
        <h1 class="mt-4 text-4xl md:text-6xl font-bold text-gray-900">Cama de Pilates Reformer en México</h1>
        <p class="mt-6 text-lg text-gray-700 leading-8">Compara 22 modelos de camas de Pilates para casa y estudio, consulta precios actualizados 2026 desde $23,234 MXN y encuentra guías para elegir tu cama con envío asegurado a todo México y hasta 12 MSI.</p>
      </header>
      <section class="mt-12">
        <h2 class="sr-only">Ecosistema de Cama de Pilates: Modelos Reformer, Estudios y Certificación</h2>
        <nav aria-label="Enlaces principales" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <a href="/cama-de-pilates" class="rounded-xl border-2 border-stone-900 bg-stone-900 text-white p-6 hover:bg-stone-800 transition-colors sm:col-span-2 lg:col-span-3">
            <h3 class="text-xl font-bold text-white mb-1">Camas de Pilates Reformer en México (Catálogo Completo 2026)</h3>
            <p class="text-sm text-stone-300">Explora todos los 22 modelos de madera noble y aluminio con especificaciones técnicas, precios, financiamiento y cotización directa.</p>
          </a>
          <a href="/shop/category/reformers" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Tienda de Reformers</h3><p class="mt-1 text-sm text-gray-600">Explora modelos y precios disponibles.</p></a>
          <a href="/reformer-para-estudio" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Reformer para estudio</h3><p class="mt-1 text-sm text-gray-600">Equipo profesional para uso intensivo.</p></a>
          <a href="/reformer-para-casa" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Reformer para casa</h3><p class="mt-1 text-sm text-gray-600">Guía para espacios residenciales.</p></a>
          <a href="/cama-de-pilates/precio" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Precio de cama de Pilates</h3><p class="mt-1 text-sm text-gray-600">Rangos y factores de comparación.</p></a>
          <a href="/estudios-de-pilates" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Estudios y clases</h3><p class="mt-1 text-sm text-gray-600">Directorio de estudios de Pilates.</p></a>
          <a href="/certificacion-pilates" class="rounded-lg border p-6"><h3 class="text-lg font-bold text-gray-900">Certificación de Pilates</h3><p class="mt-1 text-sm text-gray-600">Formación para instructores.</p></a>
        </nav>
      </section>

      <section class="mt-16">
        <h2 class="text-2xl font-bold text-stone-900 mb-6">Modelos Destacados de Camas de Pilates Reformer</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${prods.filter(p => p.category === 'Reformers').slice(0, 4).map(p => `
            <article class="bg-white border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <img src="${htmlEscape(p.image)}" alt="${htmlEscape(p.name)}" class="w-full aspect-[4/3] object-cover rounded-lg mb-3" loading="lazy" />
                <h3 class="font-bold text-stone-900 text-base mb-1">
                  <a href="/product/${htmlEscape(p.slug)}" class="hover:underline">${htmlEscape(p.name)}</a>
                </h3>
                <p class="text-xs text-stone-600 mb-3 line-clamp-2">${htmlEscape(p.description)}</p>
              </div>
              <div class="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span class="font-bold text-stone-900 text-sm">${htmlEscape(formatMXN(p.price))} MXN</span>
                <a href="/product/${htmlEscape(p.slug)}" class="text-xs font-semibold text-amber-800 hover:underline">Ver ficha →</a>
              </div>
            </article>
          `).join('')}
        </div>
        <div class="mt-6 text-center">
          <a href="/cama-de-pilates" class="inline-block bg-stone-900 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-stone-800">
            Ver las 22 Camas de Pilates en Venta →
          </a>
        </div>
      </section>
    </main>`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cama de Pilates Reformer — enlaces principales',
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates`, name: 'Camas de Pilates Reformer en México' },
        { '@type': 'ListItem', position: 2, url: `${origin}/shop/category/reformers`, name: 'Comprar Reformers' },
        { '@type': 'ListItem', position: 3, url: `${origin}/reformer-para-estudio`, name: 'Reformer para estudio' },
        { '@type': 'ListItem', position: 4, url: `${origin}/reformer-para-casa`, name: 'Reformer para casa' },
        { '@type': 'ListItem', position: 5, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de cama de Pilates' },
      ],
    };
    const html = baseHtml(template, head, body).replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`,
    );
    writeFileForRoute('/', html);
  }

  // Blog index
  const blogHead = {
    title: 'Centro de Conocimiento | camadepilates.com',
    description: 'Centro de Conocimiento: guías de compra, ejercicios y comparativas de camas de Pilates (Reformer).',
    canonical: `${origin}/blog`,
    ogImage: `${origin}/og/${posts[0]?.slug || 'og'}.png`,
    ogType: 'website'
  };
  const blogHtml = baseHtml(template, blogHead, buildIndex(posts.slice(0, 40)));
  writeFileForRoute('/blog', blogHtml);

  // Posts
  for (const p of posts) {
    const head = {
      title: `${p.title} | camadepilates.com`,
      description: p.description,
      canonical: `${origin}/blog/${p.slug}`,
      ogImage: `${origin}/og/${p.slug}.png`,
      ogType: 'article'
    };
    const body = renderPost(p, marked, posts);
    let html = baseHtml(template, head, body);
    assertNoRawRelatedShortcodes(html, `/blog/${p.slug}`);

    const articleSchema = buildArticleSchema(p, origin);
    const breadcrumbSchema = buildBlogBreadcrumbSchema(p, origin);
    const faqSchema = extractFaqSchemaFromMarkdown(p.content);

    const schemaTags = [
      `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`,
      `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`
    ];
    if (faqSchema) {
      schemaTags.push(`<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`);
    }

    html = html.replace('</head>', `${schemaTags.join('\n')}\n</head>`);
    writeFileForRoute(`/blog/${p.slug}`, html);
  }

  // Simple category pages. Keyed by slug so the casing variants in frontmatter
  // ("Equipo y mantenimiento" / "Equipo y Mantenimiento") render one page.
  const categoryBySlug = new Map();
  for (const p of posts) {
    const slug = slugify(p.category);
    if (slug && !categoryBySlug.has(slug)) categoryBySlug.set(slug, p.category);
  }
  for (const [slug, c] of categoryBySlug) {
    const list = posts.filter(p => slugify(p.category) === slug).slice(0, 40);
    const head = {
      title: `Categoría: ${c} | camadepilates.com`,
      description: `Artículos de ${c}`,
      canonical: `${origin}/blog/category/${slug}`,
      ogImage: `${origin}/og/${list[0]?.slug || 'og'}.png`,
      ogType: 'website'
    };
    const body = buildIndex(list);
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/blog/category/${slug}`, html);
  }

  // Simple tag pages
  const tagBySlug = new Map();
  for (const p of posts) {
    for (const t of p.tags || []) {
      const slug = slugify(t);
      if (slug && !tagBySlug.has(slug)) tagBySlug.set(slug, t);
    }
  }
  for (const [slug, t] of tagBySlug) {
    const list = posts.filter(p => (p.tags || []).some(x => slugify(x) === slug)).slice(0, 40);
    const head = {
      title: `Etiqueta: ${t} | camadepilates.com`,
      description: `Artículos etiquetados con ${t}`,
      canonical: `${origin}/blog/tag/${slug}`,
      ogImage: `${origin}/og/${list[0]?.slug || 'og'}.png`,
      ogType: 'website'
    };
    const body = buildIndex(list);
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/blog/tag/${slug}`, html);
  }

  // Product pages
  for (const pr of prods) {
    const { head, body, schema, breadcrumbSchema } = renderProduct(pr, origin);
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>\n</head>`);
    writeFileForRoute(`/product/${pr.slug}`, html);
  }
  // Shop hub (new)
  if (prods.length) {
    const head = {
      title: 'Tienda — Camas de Pilates y Accesorios | camadepilates.com',
      description: 'Compra tu Cama de Pilates (Reformer) y accesorios. Modelos para casa y estudio con envío en México.',
      canonical: `${origin}/shop`,
      ogImage: `${origin}${prods[0].image}`,
      ogType: 'website'
    };
    const body = buildShopIndex(prods);
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: prods.map((p, idx) => ({ '@type': 'ListItem', position: idx + 1, url: `${origin}/product/${p.slug}`, name: p.name }))
    };
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(itemList)}</script>\n</head>`);
    writeFileForRoute('/shop', html);
  }

  // Studio Reformer landing. Keep this richer snapshot aligned with the React page
  // and derive every product fact from products.json.
  {
    const route = '/reformer-para-estudio';
    const meta = routeMeta[route];
    const reformers = prods.filter(product => product.category === 'Reformers');
    if (!meta || !reformers.length) {
      throw new Error('Studio Reformer prerender requires route metadata and Reformer products');
    }
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Reformers para estudio',
      numberOfItems: reformers.length,
      itemListElement: reformers.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}/product/${product.slug}`,
        name: product.name,
      })),
    };
    const collectionPage = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Reformer para estudio',
      description: meta.description,
      url: `${origin}${route}`,
      inLanguage: 'es-MX',
      mainEntity: itemList,
    };
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Reformer para estudio' },
      ],
    };
    const head = {
      title: meta.title,
      description: meta.description,
      canonical: `${origin}${route}`,
      ogImage: `${origin}${reformers[0].image}`,
      ogType: 'website',
    };
    let html = baseHtml(template, head, buildStudioReformerPage(reformers));
    html = html.replace(
      '</head>',
      [breadcrumb, collectionPage, itemList]
        .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n') + '\n</head>'
    );
    writeFileForRoute(route, html);
  }

  // Home Reformer landing. Keep aligned with ReformerParaCasa.tsx.
  {
    const route = '/reformer-para-casa';
    const meta = routeMeta[route];
    if (!meta) {
      throw new Error('Home Reformer prerender requires route metadata');
    }
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Reformer para Casa' },
      ],
    };
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué espacio necesito para un reformer en casa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Necesitas aproximadamente 3m x 1.5m de espacio libre. El reformer mide ~245cm de largo y ~70cm de ancho, más espacio para moverte alrededor.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta un reformer para casa en México?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Un reformer de calidad para casa en México cuesta entre $35,000 y $45,000 MXN. Modelos económicos desde $15,000 MXN sacrifican durabilidad y silencio.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Es difícil instalar un reformer en casa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, los reformers modernos vienen pre-ensamblados. Solo necesitas colocarlo en posición. Edelweiss incluye entrega a domicilio y guía de instalación.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Puedo practicar pilates en casa sin instructor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, pero recomendamos tomar algunas clases presenciales primero. Hay excelentes apps y videos para practicar en casa una vez domines los fundamentos.'
          }
        }
      ]
    };
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Edelweiss Home Reformer',
      description: 'Reformer de pilates para casa con diseño compacto, sistema silencioso Whisper Glide y acabados premium en madera de nogal.',
      brand: { '@type': 'Brand', name: 'Edelweiss Pilates' },
      sku: 'EW-HOME-WALNUT',
      image: [`${origin}/images/products/reformer-aluminio-nogal-a039.webp`],
      url: `${origin}/reformer-para-casa`,
      offers: {
        '@type': 'Offer',
        url: `${origin}/reformer-para-casa`,
        priceCurrency: 'MXN',
        price: '35000',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'CAMA Pilates' },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'MX',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn'
        },
        shippingDetails: [
          {
            '@type': 'OfferShippingDetails',
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
              transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' }
            },
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: '0',
              currency: 'MXN'
            }
          }
        ]
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        reviewCount: '2'
      }
    };
    const head = {
      title: meta.title,
      description: meta.description,
      canonical: `${origin}${route}`,
      ogImage: `${origin}/images/products/reformer-aluminio-nogal-a039.webp`,
      ogType: 'website',
    };
    const body = `
    <section class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">${htmlEscape(meta.title)}</h1>
      <p class="text-lg text-gray-600 max-w-2xl mb-8">${htmlEscape(meta.description)}</p>
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <img src="/images/products/reformer-aluminio-nogal-a039.webp" alt="Edelweiss Home Reformer" class="w-full h-auto rounded-lg border" />
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Edelweiss Home Reformer</h2>
          <p class="mt-4 text-gray-700">Reformer de pilates para casa con diseño compacto, sistema silencioso Whisper Glide y acabados premium en madera de nogal.</p>
          <div class="mt-6 text-2xl font-bold text-gray-900">$35,000 MXN</div>
        </div>
      </div>
    </section>`;
    let html = baseHtml(template, head, body);
    html = html.replace(
      '</head>',
      [breadcrumb, faqSchema, productSchema]
        .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n') + '\n</head>'
    );
    writeFileForRoute(route, html);
  }

  // Cama de Pilates Primary Transactional Pillar Page
  {
    const route = '/cama-de-pilates';
    const meta = routeMeta[route];
    const reformers = prods.filter(product => product.category === 'Reformers');
    if (!meta || !reformers.length) {
      throw new Error('Cama de Pilates prerender requires route metadata and Reformer products');
    }
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Camas de Pilates Reformer en México',
      description: 'Catálogo oficial de camas de Pilates (Reformer) en venta en México.',
      numberOfItems: reformers.length,
      itemListElement: reformers.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}/product/${product.slug}`,
        name: product.name,
      })),
    };
    const collectionPage = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Camas de Pilates Reformer en México: Modelos y Precios 2026',
      description: meta.description,
      url: `${origin}${route}`,
      inLanguage: 'es-MX',
      mainEntity: itemList,
    };
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Cama de Pilates', item: `${origin}${route}` },
      ],
    };
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta una cama de Pilates Reformer en México?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'En México, los precios de camas de Pilates profesionales inician desde $23,234 MXN para modelos clásicos de roble, entre $28,000 y $38,000 MXN para modelos de maple norteamericano y aluminio de alta gama, y entre $51,000 y $85,050 MXN para equipos que incorporan media torre o estructura de Cadillac. Todos nuestros precios incluyen IVA y garantía directa.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuál es la diferencia entre un Reformer de madera y uno de aluminio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ambos ofrecen exactamente la misma precisión biomecánica. Los Reformers de madera maciza (como el Maple y Roble) aportan una estética orgánica, cálida y clásica sumamente cotizada en estudios boutique y residencias. Los Reformers de aluminio ofrecen una estética contemporánea e industrial, menor peso total para facilitar reubicaciones y rieles anodizados de altísima resistencia al desgaste.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué espacio necesito para tener un Reformer en casa o departamento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El equipo mide en promedio 240 cm de largo por 70 cm de ancho. Se aconseja disponer de una superficie de al menos 3.0 m x 1.8 m para entrar y salir con comodidad y extender los brazos lateralmente sin obstáculos.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Aceptamos pagos con tarjeta de crédito con planes de hasta 12 Meses Sin Intereses con bancos participantes a través de nuestras pasarelas de pago certificadas. También contamos con descuentos preferenciales en pagos de contado por transferencia bancaria SPEI.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Hacen envíos a Monterrey, Guadalajara, Querétaro y todo México?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, realizamos envíos asegurados a las 32 entidades federativas del país. La mercancía viaja con seguro contra daños de transporte puerta a puerta. El tiempo estimado de producción y entrega es de 3 a 8 semanas según el acabado y modelo seleccionado.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué garantía tienen los Reformers y cómo se gestionan las refacciones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ofrecemos una garantía directa de 3 años en chasis, rieles y mecanismos estructurales. Contamos con almacén de refacciones en México con resortes de repuesto, poleas, correas de cuero y microfibra con envío exprés de 24 a 48 horas.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cómo se calibra la resistencia de los resortes y qué combinaciones se usan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nuestras camas incorporan un sistema de 5 resortes alemanes calibrados por código de color: 1 amarillo (25% ligero), 2 azules (50% medio) y 2 rojos (100% pesado), permitiendo graduar la resistencia con precisión para calentamiento, core abdominal o saltos pliométricos en Jumpboard.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué mantenimiento preventivo requiere un Reformer en México y cada cuándo se cambian los resortes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Se recomienda limpiar rieles semanalmente con microfibra seca, desinfectar la tapicería sin alcohol y revisar resortes cada 6 meses. En casa duran de 3 a 5 años; en estudios comerciales de alto flujo se sugiere renovación cada 18 a 24 meses.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Por qué un Reformer de madera maciza o aluminio estructural es superior a una cama plegable económica?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Las camas plegables económicas de menos de $15,000 MXN sufren flexión en articulaciones centrales y usan ruedas plásticas ruidosas. Una estructura de Maple o Roble de 3 cm o aluminio aeronáutico absorbe vibraciones, no se descalibra y soporta hasta 180-200 kg.'
          }
        }
      ]
    };
    const head = {
      title: meta.title,
      description: meta.description,
      canonical: `${origin}${route}`,
      ogImage: `${origin}${reformers[0].image}`,
      ogType: 'website',
    };
    let html = baseHtml(template, head, buildCamaDePilatesPage(reformers, origin));
    html = html.replace(
      '</head>',
      [breadcrumb, collectionPage, itemList, faqSchema]
        .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n') + '\n</head>'
    );
    writeFileForRoute(route, html);
  }

  // Cama de Pilates Precio Guide Page
  {
    const route = '/cama-de-pilates/precio';
    const meta = routeMeta[route];
    const reformers = prods.filter(product => product.category === 'Reformers');
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Cama de Pilates', item: `${origin}/cama-de-pilates` },
        { '@type': 'ListItem', position: 3, name: 'Precio', item: `${origin}${route}` },
      ],
    };
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta una cama de Pilates en México en 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'En México, el precio de una cama de Pilates Reformer profesional oscila entre $23,234 MXN para modelos clásicos de roble o aluminio de entrada, y entre $32,900 y $85,050 MXN para modelos profesionales de estudio con acabados de nogal, roble macizo, aluminio anodizado estructural y aditamentos de media torre o Cadillac.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuál es el precio de una cama de Pilates para casa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nuestras opciones residenciales inician desde $23,234 MXN (o desde $1,936 MXN/mes a 12 MSI). Cuentan con chasis rígido que elimina vibraciones, carro silencioso con rodamientos sellados y sistema de 5 resortes alemanes de alambre de piano.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuál es el precio de una cama de Pilates de estudio profesional?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los Reformers profesionales para estudio boutique rondan entre $36,716 y $69,617 MXN para camas fijas de madera maciza o aluminio aeroespacial, y hasta $85,050 MXN para modelos con media torre o estructura de Cadillac. Todos con garantía directa de 3 años y tolerancias para uso comercial continuo de 8 a 10 horas diarias.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué factores influyen en el precio de una cama de Pilates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los cuatro factores determinantes son: 1) Materiales del chasis (madera maciza de 30 mm o aluminio estructural vs MDF/perfiles delgados), 2) Calibración y origen de los resortes (alambre de piano alemán vs resortes genéricos o ligas), 3) Rodamientos y rieles (deslizamiento ultra silencioso de alta precisión), y 4) Disponibilidad de refacciones locales y garantía con soporte directo en México.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Vale la pena comprar una cama de Pilates económica o plegable de importación?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Las camas plegables de menos de $15,000 MXN suelen sacrificar rigidez estructural, flexionándose en el punto de pliegue y descalibrando la alineación de columna del practicante. Además, la mayoría utiliza cuerdas elásticas en lugar de resortes calibrados y carecen totalmente de refacciones en México cuando se rompe una rueda o polea.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué incluye normalmente el precio de un Reformer CAMA Pilates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Incluye el chasis completo ensamblado, carro tapizado en microfibra de alta resistencia, barra de pies ajustable multidireccional, sistema de 5 resortes alemanes calibrados por color, cabecera ajustable de 3 posiciones, hombreras ergonómicas, juego de poleas silenciosas, correas dobles de manos/pies y caja (box) según el modelo seleccionado.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, contamos con financiamiento de hasta 12 Meses Sin Intereses con tarjetas de crédito de bancos participantes en México a través de pasarelas de pago seguras, además de descuentos preferenciales por pago de contado vía transferencia SPEI.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta el envío y cómo se protege el equipo durante el transporte?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Realizamos envíos asegurados a toda la República Mexicana (CDMX, Monterrey, Guadalajara, Querétaro, Puebla, Mérida, etc.). Cada cama viaja embalada en un huacal de madera tratada para exportación con seguro de transporte puerta a puerta.'
          }
        }
      ]
    };
    const head = {
      title: meta ? meta.title : '¿Cuánto Cuesta una Cama de Pilates en México? Precios Desde $23,234 MXN [2026]',
      description: meta ? meta.description : 'Guía completa de precios de camas de Pilates (Reformer) en México 2026: modelos para casa y estudio desde $23,234 MXN. Incluye garantía y 12 MSI.',
      canonical: `${origin}${route}`,
      ogImage: `${origin}${reformers[0].image}`,
      ogType: 'website',
    };
    let html = baseHtml(template, head, buildCamaDePilatesPrecioPage(reformers, origin));
    html = html.replace(
      '</head>',
      [breadcrumb, faqSchema]
        .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n') + '\n</head>'
    );
    writeFileForRoute(route, html);
  }

  // Cama de Pilates En Venta -> 301 Consolidation Redirect Snapshot
  {
    const route = '/cama-de-pilates/en-venta';
    const targetUrl = `${origin}/cama-de-pilates`;
    const reformers = prods.filter(product => product.category === 'Reformers');
    const head = {
      title: 'Venta de Camas de Pilates Reformer en México | CAMA',
      description: 'Redirigiendo a nuestro catálogo oficial de camas de Pilates Reformer en México...',
      canonical: targetUrl,
      ogImage: `${origin}${reformers[0]?.image || '/og/cama-de-pilates-venta-mexico.png'}`,
      ogType: 'website',
    };
    const redirectMeta = `<meta http-equiv="refresh" content="0;url=/cama-de-pilates">`;
    const body = `
    <section class="container mx-auto px-4 py-20 text-center max-w-xl">
      <h1 class="text-2xl font-bold text-stone-900 mb-4">Redirigiendo a Camas de Pilates en México...</h1>
      <p class="text-stone-600 mb-6 text-sm">Nuestro catálogo de venta se ha consolidado en una sola página completa con especificaciones, precios y modelos 2026.</p>
      <a href="/cama-de-pilates" class="inline-block bg-stone-900 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-stone-800">
        Haz clic aquí si no eres redirigido automáticamente →
      </a>
    </section>`;
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `${redirectMeta}\n</head>`);
    writeFileForRoute(route, html);
  }

  // Shop categories
  if (prods.length) {
    const catMap = new Map();
    for (const p of prods) {
      const c = (p.category || 'Otros');
      catMap.set(c, true);
    }
    for (const name of Array.from(catMap.keys())) {
      const slug = slugify(name);
      const categorySeo = SHOP_CATEGORY_SEO[slug];
      if (!categorySeo) {
        throw new Error(`Missing shop category SEO content for "${name}" (${slug})`);
      }
      const list = prods.filter(p => (p.category || 'Otros') === name);
      const head = {
        title: categorySeo.title,
        description: categorySeo.description,
        canonical: `${origin}/shop/category/${slug}`,
        ogImage: `${origin}${list[0]?.image || '/og/cama-de-pilates-venta-mexico.png'}`,
        ogType: 'website'
      };
      const body = buildShopCategoryIndex(slug, categorySeo, list);
      const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: list.map((p, idx) => ({ '@type': 'ListItem', position: idx + 1, url: `${origin}/product/${p.slug}`, name: p.name }))
      };
      const collectionPage = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: categorySeo.h1,
        description: categorySeo.description,
        url: `${origin}/shop/category/${slug}`,
        inLanguage: 'es-MX',
        mainEntity: itemList,
      };
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
          { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${origin}/shop` },
          { '@type': 'ListItem', position: 3, name: categorySeo.h1 },
        ],
      };
      const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: categorySeo.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      };
      let html = baseHtml(template, head, body);
      html = html.replace(
        '</head>',
        [itemList, collectionPage, breadcrumb, faq]
          .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
          .join('\n') + '\n</head>'
      );
      writeFileForRoute(`/shop/category/${slug}`, html);
    }
  }

  // Certification landing (static snapshot for SEO)
  {
    const head = {
      title: 'Certificación Pilates Reformer México [Aval Oficial] | CAMA',
      description: 'Certifícate como instructora de Pilates Reformer: Curso Básico (28h · $25k) o Certificación Completa (48h · $38k). Máquina individual por alumna y comunidad Whop. Sedes en Querétaro y Monterrey.',
      canonical: `${origin}/certificacion-pilates`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website'
    };
    const body = `
    <header style="background:#F8F8F6;border-bottom:1px solid #E5E5E0;padding:16px 24px;">
      <div style="max-w:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-family:monospace;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
          <a href="/" style="color:#666;text-decoration:none;">• camadepilates.com</a> / <span style="color:#111;">[ 28H / 48H CERTIFICACIÓN PROFESIONAL ]</span>
        </div>
        <div>
          <a href="/certificacion-pilates/webinar" style="display:inline-block;background:#111;color:#fff;padding:8px 18px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Pre-reservar Cupo ($400 MXN)</a>
        </div>
      </div>
    </header>

    <main style="background:#F8F8F6;color:#0F0F0F;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
      <div style="max-width:1200px;margin:0 auto;">
        <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
          <span style="background:#ECECE9;padding:6px 14px;border-radius:999px;font-family:monospace;font-size:11px;font-weight:600;letter-spacing:1px;">• 28H BÁSICO ($25K) · 48H COMPLETO ($38K)</span>
          <span style="background:#ECECE9;padding:6px 14px;border-radius:999px;font-family:monospace;font-size:11px;font-weight:600;letter-spacing:1px;">[ QUERÉTARO · MONTERREY · CDMX ]</span>
          <span style="background:#D1FAE5;color:#065F46;padding:6px 14px;border-radius:999px;font-family:monospace;font-size:11px;font-weight:600;letter-spacing:1px;">● REFORMER EXCLUSIVO POR ALUMNA</span>
        </div>

        <h1 style="font-size:48px;line-height:1.05;font-weight:800;letter-spacing:-1.5px;margin:0 0 24px 0;max-width:900px;color:#0F0F0F;">
          Formación clínica en cada movimiento.
        </h1>

        <p style="font-size:19px;line-height:1.6;color:#4B5563;max-width:800px;margin:0 0 32px 0;">
          Formación profesional en Pilates Reformer con ingeniería del movimiento, una máquina profesional exclusiva por alumna (sin turnos compartidos) y comunidad de por vida en Whop. Elige entre el Curso Básico de 28 horas ($25,000 MXN) y la Certificación Completa de 48 horas ($38,000 MXN). Impartida por las Master Trainers <strong>Gabi</strong> y <strong>Laura Munive</strong>.
        </p>

        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px;">
          <a href="/certificacion-pilates/webinar" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Pre-reservar Cupo Oficial ($400 MXN) →</a>
          <a href="https://wa.me/525548468190?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20Curso%20B%C3%A1sico%20(28h)%20y%20Certificaci%C3%B3n%20Completa%20(48h)" style="display:inline-block;background:#fff;border:1px solid #D1D5DB;color:#111;padding:14px 28px;border-radius:999px;font-size:13px;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Consultar por WhatsApp</a>
          <a href="/app" style="display:inline-block;background:#ECECE9;border:1px solid #D1D5DB;color:#111;padding:14px 28px;border-radius:999px;font-size:13px;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Campus Alumnas & Foros</a>
        </div>

        <section style="margin-bottom:48px;">
          <h2 style="font-size:28px;font-weight:700;letter-spacing:-0.5px;margin-bottom:20px;">Sedes y Próximas Cohortes Presenciales</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:28px;">
              <span style="display:inline-block;background:#D1FAE5;color:#065F46;font-family:monospace;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;margin-bottom:12px;">12 CUPOS · REFORMER INDIVIDUAL</span>
              <h3 style="font-size:22px;font-weight:700;margin:0 0 8px 0;">Querétaro</h3>
              <p style="font-size:14px;color:#4B5563;line-height:1.5;margin-bottom:16px;">Noviembre de 2026 en Juriquilla / Álamos. Básico (2 fines de semana, 28h) o Completo (4 fines de semana, 48h). Cupo estricto a 12 participantes.</p>
              <div style="font-size:22px;font-weight:800;color:#111;margin-bottom:16px;">$25,000 MXN <span style="font-size:14px;font-weight:normal;color:#6B7280;">(28h Básico)</span> · $38,000 MXN <span style="font-size:14px;font-weight:normal;color:#6B7280;">(48h Completo)</span></div>
              <a href="/certificacion-pilates/queretaro" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;">Ver Convocatoria Querétaro →</a>
            </div>

            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:28px;">
              <span style="display:inline-block;background:#D1FAE5;color:#065F46;font-family:monospace;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;margin-bottom:12px;">12 CUPOS · REFORMER INDIVIDUAL</span>
              <h3 style="font-size:22px;font-weight:700;margin:0 0 8px 0;">Monterrey</h3>
              <p style="font-size:14px;color:#4B5563;line-height:1.5;margin-bottom:16px;">5 Dic 2026 al 17 Ene 2027 en San Pedro Garza García. Básico (2 fines en diciembre, 28h) o Completo (+2 fines en enero, 48h). Práctica intensiva supervisada.</p>
              <div style="font-size:22px;font-weight:800;color:#111;margin-bottom:16px;">$25,000 MXN <span style="font-size:14px;font-weight:normal;color:#6B7280;">(28h Básico)</span> · $38,000 MXN <span style="font-size:14px;font-weight:normal;color:#6B7280;">(48h Completo)</span></div>
              <a href="/certificacion-pilates/monterrey" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;">Ver Convocatoria Monterrey →</a>
            </div>

            <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:28px;">
              <span style="display:inline-block;background:#ECECE9;color:#374151;font-family:monospace;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;margin-bottom:12px;">MERRITHEW® OFICIAL</span>
              <h3 style="font-size:22px;font-weight:700;margin:0 0 8px 0;">Ciudad de México</h3>
              <p style="font-size:14px;color:#4B5563;line-height:1.5;margin-bottom:16px;">Programa STOTT PILATES® Intensive Reformer (125h) e Intensive Mat-Plus™ en Santa Fe con Pilates Educare. Validez en 100+ países.</p>
              <div style="font-size:24px;font-weight:800;color:#111;margin-bottom:16px;">$44,000 MXN <span style="font-size:12px;font-weight:normal;color:#6B7280;">(Intensive Reformer)</span></div>
              <a href="/certificacion-pilates/cdmx" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;">Ver Programa STOTT CDMX →</a>
            </div>
          </div>
        </section>

        <section style="background:#fff;border:1px solid #E5E7EB;border-radius:24px;padding:32px;margin-bottom:48px;">
          <h2 style="font-size:24px;font-weight:700;margin-bottom:16px;">Plan de Estudios Presencial (28h Básica / 48h Completa)</h2>
          <ul style="color:#4B5563;line-height:1.8;padding-left:20px;font-size:15px;">
            <li><strong>Módulo 1 (14h · Fines de Sem. 1):</strong> Anatomía Funcional Aplicada & Repertorio Esencial Reformer (35 movimientos base). Parte del Curso Básico.</li>
            <li><strong>Módulo 2 (14h · Fines de Sem. 2):</strong> Repertorio Intermedio, Dinámica de Carro & Manejo de Cargas según Biotipo. Concluye el Curso Básico (28h).</li>
            <li><strong>Módulo 3 (10h · Fines de Sem. 3):</strong> Modificaciones Clínicas, Hernias Discales, Dolor Lumbar y Poblaciones Especiales. Exclusivo Certificación Completa.</li>
            <li><strong>Módulo 4 (10h · Fines de Sem. 4):</strong> Metodología de Cueing Preciso, Práctica de Enseñanza en Vivo, Examen y Aval. Concluye la Certificación Completa (48h).</li>
            <li><strong>Campus Whop Vitalicio:</strong> Videoteca digital HD, foros clínicos y grabaciones de por vida.</li>
          </ul>
        </section>
      </div>
    </main>`;
    const html = baseHtml(template, head, body);
    writeFileForRoute('/certificacion-pilates', html);
  }

  // Certification city pages (static snapshots)
  for (const c of certCities) {
    const isQueretaro = c.key === 'queretaro';
    const isMonterrey = c.key === 'monterrey';
    const isPuebla = c.key === 'puebla';
    const isCdmx = c.key === 'cdmx';
    const headingTitle = `Certificación de Pilates Reformer en ${c.shortName}`;
    const cityTitle = isMonterrey
      ? 'Certificación Pilates Monterrey [Fechas 2026]'
      : isQueretaro
        ? 'Certificación Pilates Querétaro [Nov 2026 y Sedes]'
        : isPuebla
          ? 'Certificación Pilates Puebla 2026: Costos, Fechas y Aval Oficial'
          : isCdmx
            ? 'Certificación Pilates CDMX [STOTT & Linaje Clásico 2026]'
            : `Certificación Pilates ${c.shortName} [2026: Escuelas y Avales]`;
    const customTitle = `${cityTitle} | CAMA Pilates`;
    const customDesc = isQueretaro
      ? 'Certifícate como instructora de Pilates Reformer en Querétaro (Noviembre 2026): Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). 12 cupos exclusivos con Reformer individual y directorio de academias.'
      : isMonterrey
        ? 'Certifícate como instructora de Pilates Reformer en Monterrey (Dic 2026 – Ene 2027): Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). 12 cupos exclusivos con Reformer individual y directorio de academias.'
        : isCdmx
          ? 'Certifícate en STOTT PILATES® en CDMX Santa Fe y escuelas clásicas de 2da generación en Polanco y Roma Norte. Sedes, costos y registro.'
          : `Directorio de academias y escuelas de certificación de Pilates en ${c.shortName}. Compara opciones en Reformer y Mat, horas avaladas (NPCP/SEP), requisitos, costos y contacto directo.`;

    const head = {
      title: customTitle,
      description: customDesc,
      canonical: `${origin}/certificacion-pilates/${c.key}`,
      ogImage: `${origin}/images/cities/${c.key}.webp`,
      ogType: 'website'
    };
    const certFormUrl = process.env.CERT_FORM_URL || process.env.VITE_AIRTABLE_CERT_FORM_URL || `https://wa.me/525548468190?text=${encodeURIComponent('Hola, quiero hacer mi pre-registro para la certificación de Pilates en ' + c.shortName)}`;
    const directoryLink = c.directorySlug
      ? `<a href="/estudios-de-pilates/${c.directorySlug}">Ver clases y estudios en ${c.shortName}</a>`
      : '';
    const cohortAlert = (isQueretaro || isMonterrey)
      ? `<div style="background:#2A2624;color:#EAE8E4;padding:20px;border-radius:12px;margin:24px 0;">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#D9865B;margin-bottom:8px;"><strong>Convocatoria Abierta · 12 Cupos por Sede</strong></p>
          <h2 style="font-size:20px;color:#fff;margin-bottom:8px;">${isQueretaro ? 'Cohorte Querétaro: 7 al 29 de Noviembre 2026 (4 Fines de Semana)' : 'Cohorte Monterrey: 5 Dic 2026 al 17 Ene 2027 (4 Fines de Semana)'}</h2>
          <p style="font-size:14px;color:#d1d5db;margin-bottom:16px;">Sesión en vivo con Gabi y Laura Munive el Sábado 26 de Septiembre (11:00 AM CST). Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). Pre-reserva con solo $400 MXN.</p>
          <a href="/certificacion-pilates/webinar" style="display:inline-block;background:#fff;color:#2A2624;padding:10px 20px;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">Registrarme al Pre-Webinar →</a>
        </div>`
      : '';

    const body = `
    <section class="bg-background border-b border-border">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">${headingTitle}</h1>
        <p class="mt-4 text-lg text-muted-foreground max-w-2xl">Compara opciones de formación en Reformer y Mat en ${c.shortName}. Antes de inscribirte, confirma el respaldo del programa, las horas de práctica, la evaluación y el costo total.</p>
        ${cohortAlert}
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/525548468190?text=${encodeURIComponent('Hola, quiero información sobre la certificación de Pilates en ' + c.shortName)}" class="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground">Solicitar información</a>
          <a href="/certificacion-pilates/webinar" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Pre-Webinar 26 Sep</a>
          <a href="${certFormUrl}" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Pre-inscripción</a>
        </div>
      </div>
    </section>
    <section class="container mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-foreground">Qué comparar antes de inscribirte</h2>
      <ul class="mt-5 space-y-3 text-muted-foreground">
        <li>Alcance de la formación: Reformer, Mat o ruta integral.</li>
        <li>Horas de observación, práctica y enseñanza (28h Básica / 48h Completa).</li>
        <li>Método de evaluación y organismo que respalda el certificado.</li>
        <li>Costo total, materiales incluidos y políticas de pago.</li>
      </ul>
      <div class="mt-8 flex flex-wrap gap-4">
        ${directoryLink}
        <a href="/reformer-para-estudio">Reformers para abrir un estudio</a>
      </div>
      <h2 class="mt-12 text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
      <h3 class="mt-5 font-semibold">¿Una certificación de Pilates es lo mismo que tomar clases?</h3>
      <p class="mt-2 text-muted-foreground">No. Una certificación prepara instructores; las clases son para practicar Pilates como alumno.</p>
      <h3 class="mt-5 font-semibold">¿Cómo consulto próximas fechas y costos?</h3>
      <p class="mt-2 text-muted-foreground">Solicita información y confirma directamente la sede, el calendario vigente, los requisitos y las políticas de pago antes de inscribirte.</p>
    </section>`;
    const faq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Una certificación de Pilates es lo mismo que tomar clases?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. Una certificación prepara instructores; las clases son para practicar Pilates como alumno.' },
        },
        {
          '@type': 'Question',
          name: '¿Cómo consulto próximas fechas y costos?',
          acceptedAnswer: { '@type': 'Answer', text: 'Solicita información y confirma directamente la sede, el calendario vigente, los requisitos y las políticas de pago antes de inscribirte.' },
        },
      ],
    };
    const html = baseHtml(template, head, body).replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(faq)}</script>\n</head>`,
    );
    writeFileForRoute(`/certificacion-pilates/${c.key}`, html);
  }

  // Pre-Webinar registration route (static snapshot)
  {
    const webinarHead = {
      title: 'Info Day en Vivo: Próximos Cursos de Certificación Pilates Reformer | CAMA Pilates',
      description: 'Sesión informativa en vivo este Sábado 26 de Septiembre a las 11:00 AM CST con Gabi y Laura Munive. Explicación de los próximos cursos: Curso Básico (28h · $25k) y Certificación Completa (48h · $38k) para Querétaro y Monterrey.',
      canonical: `${origin}/certificacion-pilates/webinar`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'event'
    };
    const webinarBody = `
    <section class="bg-stone-900 text-stone-100 py-16 px-4">
      <div class="container mx-auto max-w-4xl text-center">
        <p class="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-3">Info Day en Vivo · Sábado 26 de Septiembre 11:00 AM CST</p>
        <h1 class="text-3xl md:text-5xl font-serif italic mb-6">Info Day: Conoce los Próximos Cursos de Certificación Pilates Reformer</h1>
        <p class="text-lg text-stone-300 max-w-2xl mx-auto mb-8 font-light">Sesión informativa en vivo con Gabi y Laura Munive para explicar los próximos cursos presenciales: Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). Cupo limitado a 12 participantes por ciudad.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="/certificacion-pilates/webinar#registro" class="px-8 py-4 rounded-full bg-white text-stone-900 text-xs uppercase tracking-widest font-semibold">Apartar Lugar en el Info Day</a>
          <a href="/certificacion-pilates/queretaro" class="px-8 py-4 rounded-full border border-stone-600 text-stone-200 text-xs uppercase tracking-widest">Cohorte Querétaro (Nov 2026)</a>
          <a href="/certificacion-pilates/monterrey" class="px-8 py-4 rounded-full border border-stone-600 text-stone-200 text-xs uppercase tracking-widest">Cohorte Monterrey (Dic-Ene)</a>
        </div>
      </div>
    </section>
    <section id="registro" class="py-16 px-4 max-w-3xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-serif italic mb-4 text-stone-900">Apartar Lugar en el Info Day Gratuito</h2>
      <p class="text-stone-600 mb-8 max-w-xl mx-auto font-light">Sesión informativa en vivo con Gabi y Laura Munive el Sábado 26 de Septiembre a las 11:00 AM CST para explicar los próximos cursos de certificación (28h / 48h) y resolver tus dudas.</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="https://wa.me/525548468190?text=${encodeURIComponent('Hola, quiero apartar mi lugar en el Info Day del 26 de Septiembre para conocer los próximos cursos de certificación de Pilates Reformer.')}" class="px-8 py-4 rounded-full bg-stone-900 text-white text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors">Apartar mi lugar por WhatsApp →</a>
        <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Info Day: Próximos Cursos Certificación Pilates Reformer')}&dates=20260926T170000Z/20260926T181500Z&details=${encodeURIComponent('Sesión informativa online en vivo con Gabi y Laura Munive para explicar los próximos cursos.')}" target="_blank" rel="noopener noreferrer" class="px-6 py-4 rounded-full border border-stone-300 text-stone-700 text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors">Agregar al Calendario</a>
      </div>
    </section>`;
    const webinarHtml = baseHtml(template, webinarHead, webinarBody);
    writeFileForRoute('/certificacion-pilates/webinar', webinarHtml);
    writeFileForRoute('/webinar', webinarHtml);
  }

  // City directory pages (static snapshots)
  for (const c of certCities.filter(city => ['ciudad-de-mexico', 'guadalajara', 'monterrey'].includes(city.directorySlug))) {
    const isMonterrey = c.directorySlug === 'monterrey';
    const cityStudios = STUDIO_DIRECTORY_SEO.cities[c.directorySlug] || (studioData.studios || [])
      .filter(studio => slugify(studio.address?.city || '') === c.directorySlug)
      .map(studio => ({
        name: studio.name,
        slug: studio.slug,
        neighborhood: studio.address?.neighborhood,
        rating: studio.metrics?.googleRating,
        reviewCount: studio.metrics?.googleReviewCount,
      }));
    const pageTitle = isMonterrey
      ? 'Clases y Estudios de Pilates en Monterrey | CAMA Pilates'
      : `Estudios y Clases de Pilates en ${c.shortName} | CAMA Pilates`;
    const pageDescription = `Encuentra clases y estudios de Pilates en ${c.shortName}. Compara ubicaciones, modalidades, reseñas y opciones de Reformer.`;
    const head = {
      title: pageTitle,
      description: pageDescription,
      canonical: `${origin}/estudios-de-pilates/${c.directorySlug}`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website',
    };
    const studioCards = cityStudios.length
      ? cityStudios.map(studio => `
        <li class="rounded-lg border p-5">
          <a href="/estudios-de-pilates/${c.directorySlug}/${htmlEscape(studio.slug)}"><strong>${htmlEscape(studio.name)}</strong></a>
          <p class="mt-2">${htmlEscape(studio.neighborhood || c.shortName)}${studio.rating ? ` · ${htmlEscape(studio.rating)} de 5 (${htmlEscape(studio.reviewCount || 0)} reseñas)` : ''}</p>
        </li>
      `).join('')
      : '<li>Consulta el directorio para comparar perfiles y opciones disponibles.</li>';
    const body = `
    <main class="container mx-auto px-4 py-12">
      <nav aria-label="Migas de pan"><a href="/estudios-de-pilates">Directorio de estudios</a></nav>
      <header class="mt-6 max-w-4xl">
        <h1 class="text-4xl font-bold text-gray-900">${isMonterrey ? 'Clases y estudios de Pilates en Monterrey' : `Estudios y clases de Pilates en ${c.shortName}`}</h1>
        <p class="mt-5 text-lg text-gray-700">${pageDescription}</p>
      </header>
      <section class="mt-10">
        <h2 class="text-2xl font-bold text-gray-900">Opciones en ${c.shortName}</h2>
        <ul class="mt-5 grid md:grid-cols-2 gap-5">${studioCards}</ul>
      </section>
      <aside class="mt-12 border-t pt-8">
        <h2 class="text-2xl font-bold text-gray-900">¿Buscas formación o equipo profesional?</h2>
        <p class="mt-3 text-gray-700">Las clases del directorio son para practicar Pilates. La certificación prepara instructores y el catálogo profesional reúne equipo para estudios.</p>
        <div class="mt-5 flex flex-wrap gap-4">
          <a href="/certificacion-pilates/${c.key}">Certificación en ${c.shortName}</a>
          <a href="/reformer-para-estudio">Reformers para estudio</a>
        </div>
      </aside>
    </main>`;
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Estudios de Pilates en ${c.shortName}`,
      itemListElement: cityStudios.map((studio, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${origin}/estudios-de-pilates/${c.directorySlug}/${studio.slug}`,
        name: studio.name,
      })),
    };
    const html = baseHtml(template, head, body).replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(itemList)}</script>\n</head>`,
    );
    writeFileForRoute(`/estudios-de-pilates/${c.directorySlug}`, html);
  }

  // Static landing pages. These render entirely in React, so without this they fall
  // back to index.html and anything that does not run JS — social scrapers especially —
  // sees the generic site title and description instead of the page's own. Titles and
  // descriptions come from the same src/content/route-meta.json the components read,
  // so the prerendered head and the hydrated head cannot disagree.
  const customPrerenderedRoutes = new Set([
    '/reformer-para-estudio',
    '/reformer-para-casa',
    '/certificacion-pilates',
    '/certificacion-pilates/webinar',
    '/webinar',
    '/cama-de-pilates',
    '/cama-de-pilates/precio',
    '/cama-de-pilates/en-venta',
  ]);
  for (const [route, meta] of Object.entries(routeMeta)) {
    if (customPrerenderedRoutes.has(route)) continue;
    const head = {
      title: meta.title,
      description: meta.description,
      canonical: `${origin}${route}`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website',
    };
    const body = `
    <section class="container mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">${htmlEscape(meta.title)}</h1>
      <p class="text-lg text-gray-600 max-w-2xl">${htmlEscape(meta.description)}</p>
    </section>`;
    writeFileForRoute(route, baseHtml(template, head, body));
  }

  console.log('Static prerender complete.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
