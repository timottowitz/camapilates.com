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
  const signals = `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
  const buyingArticle =
    ['guías de compra', 'comparativas'].includes(post.category.toLowerCase()) ||
    /(comprar|compra|precio|barata|venta|financiaci[oó]n|mejor|elegir)/.test(signals);
  if (!buyingArticle) return '';

  const links = [];
  if (/(reformer|cama de pilates|equipo|comparativa|guía de compra)/.test(signals)) {
    links.push({ href: '/cama-de-pilates', label: 'Guía de cama de Pilates' });
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
  return `<nav aria-label="Recursos de compra" class="mb-8"><ul>${links
    .map(link => `<li><a href="${link.href}">${htmlEscape(link.label)}</a></li>`)
    .join('')}</ul></nav>`;
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
      itemCondition: 'https://schema.org/NewCondition'
    }
  };
  const head = {
    title: `${p.name} | camadepilates.com`,
    description: p.description,
    canonical: `${origin}/product/${p.slug}`,
    ogImage: `${origin}${p.image}`,
    ogType: 'product'
  };
  const body = `
  <section class="bg-white">
    <div class="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
      <div>
        <img src="${p.image}" alt="${p.name}" class="w-full h-auto rounded-lg border" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">${p.name}</h1>
        <p class="mt-4 text-gray-700">${p.description}</p>
        <div class="mt-6 text-xl text-gray-900 font-semibold">$ ${p.price} ${p.currency}</div>
        <div class="mt-8">
          <div class="sr-element sr-products" data-embed="single_product_widget">
            <script type="application/json" data-config="embed">${JSON.stringify({ publishable_key: p.publishableKey, options: { product_to_display: p.productId, open_product_in: 'popup', variation_style: 'on_hover' }, includes: { show_product_name: '0', show_product_price: '0', show_product_image: '0', show_product_summary: '0', open_modal_on_image_click: '0', show_view_product_button: '1', show_add_to_cart_button: '1', show_button_icons: '1' } })}</script>
          </div>
        </div>
      </div>
    </div>
  </section>`;
  return { head, body, schema: productSchema };
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
    { key: 'guadalajara', name: 'Guadalajara (Jalisco)', shortName: 'Guadalajara', directorySlug: 'guadalajara' },
    { key: 'monterrey', name: 'Monterrey (NL)', shortName: 'Monterrey', directorySlug: 'monterrey' },
    { key: 'puebla', name: 'Puebla', shortName: 'Puebla' },
    { key: 'queretaro', name: 'Querétaro', shortName: 'Querétaro' },
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
        <p class="mt-6 text-lg text-gray-700 leading-8">Compara modelos para casa y estudio, consulta precios y encuentra guías para elegir una cama de Pilates con envío desde CDMX.</p>
      </header>
      <nav aria-label="Enlaces principales" class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <a href="/shop/category/reformers" class="rounded-lg border p-6"><strong>Comprar Reformers</strong><br><span>Explora modelos y precios disponibles.</span></a>
        <a href="/reformer-para-estudio" class="rounded-lg border p-6"><strong>Reformer para estudio</strong><br><span>Equipo profesional para uso intensivo.</span></a>
        <a href="/reformer-para-casa" class="rounded-lg border p-6"><strong>Reformer para casa</strong><br><span>Guía para espacios residenciales.</span></a>
        <a href="/cama-de-pilates/precio" class="rounded-lg border p-6"><strong>Precio de cama de Pilates</strong><br><span>Rangos y factores de comparación.</span></a>
        <a href="/estudios-de-pilates" class="rounded-lg border p-6"><strong>Estudios y clases</strong><br><span>Directorio de estudios de Pilates.</span></a>
        <a href="/certificacion-pilates" class="rounded-lg border p-6"><strong>Certificación de Pilates</strong><br><span>Formación para instructores.</span></a>
      </nav>
    </main>`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Cama de Pilates Reformer — enlaces principales',
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: `${origin}/shop/category/reformers`, name: 'Comprar Reformers' },
        { '@type': 'ListItem', position: 2, url: `${origin}/reformer-para-estudio`, name: 'Reformer para estudio' },
        { '@type': 'ListItem', position: 3, url: `${origin}/reformer-para-casa`, name: 'Reformer para casa' },
        { '@type': 'ListItem', position: 4, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de cama de Pilates' },
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
    const html = baseHtml(template, head, body);
    assertNoRawRelatedShortcodes(html, `/blog/${p.slug}`);
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
    const { head, body, schema } = renderProduct(pr, origin);
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
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
      title: 'Certificación de Pilates (Reformer) en México — CDMX, Guadalajara y Monterrey | camadepilates.com',
      description: 'Conecta con certificaciones de Pilates Reformer y Mat en México. Sedes en CDMX, Guadalajara y Monterrey. Requisitos, duración, costos y registro.',
      canonical: `${origin}/certificacion-pilates`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website'
    };
    const certFormUrl = process.env.CERT_FORM_URL || process.env.VITE_AIRTABLE_CERT_FORM_URL || 'mailto:valery@camadepilates.com';
    const cities = [
      { key: 'cdmx', name: 'Ciudad de México (CDMX)' },
      { key: 'guadalajara', name: 'Guadalajara (Jalisco)' },
      { key: 'monterrey', name: 'Monterrey (NL)' },
      { key: 'puebla', name: 'Puebla' },
      { key: 'queretaro', name: 'Querétaro' },
    ];
    const body = `
    <section class="bg-background border-b border-border">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">Certificación de Pilates (Reformer) en México</h1>
        <p class="mt-4 text-lg text-muted-foreground max-w-2xl">Edelweiss te conecta con certificaciones de Pilates en México (Reformer y Mat). Sedes en CDMX, Guadalajara y Monterrey. Recibe asesoría sobre requisitos, duración, costos y próximas fechas.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/523222787690?text=Hola%20Edelweiss%2C%20quiero%20inscribirme%20a%20la%20certificaci%C3%B3n%20de%20Pilates" class="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground">Quiero inscribirme</a>
          <a href="mailto:valery@camadepilates.com?subject=Certificaci%C3%B3n%20de%20Pilates%20-%20Informaci%C3%B3n" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Solicitar información por correo</a>
          <a href="${certFormUrl}" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Formulario de pre-inscripción</a>
        </div>
      </div>
    </section>
    <section class="bg-background">
      <div class="container mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-foreground mb-6">Sedes y registro</h2>
        <div class="grid md:grid-cols-2 gap-8">
          ${cities.map(c => `
            <div id="${c.key}" class="border rounded-lg p-6 bg-card">
              <h3 class="text-xl font-semibold text-foreground">Certificación de Pilates en ${c.name}</h3>
              <p class="text-sm text-muted-foreground mt-2">Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada.</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <a href="https://wa.me/523222787690?text=Hola%20Edelweiss%2C%20quiero%20inscribirme%20a%20la%20certificaci%C3%B3n%20de%20Pilates%20en%20${encodeURIComponent(c.name)}" class="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Inscribirme en ${c.name.split(' ')[0]}</a>
                <a href="mailto:valery@camadepilates.com?subject=Certificaci%C3%B3n%20de%20Pilates%20-%20${encodeURIComponent(c.name)}" class="inline-flex items-center px-4 py-2 rounded-md border border-foreground text-foreground">Solicitar temario</a>
                <a href="${certFormUrl}" class="inline-flex items-center px-4 py-2 rounded-md border border-foreground text-foreground">Pre-inscripción</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
    const html = baseHtml(template, head, body);
    writeFileForRoute('/certificacion-pilates', html);
  }

  // Certification city pages (static snapshots)
  for (const c of certCities) {
    const cityTitle = `Certificación de Pilates Reformer en ${c.shortName}`;
    const head = {
      title: `${cityTitle} | CAMA Pilates`,
      description: `Compara opciones de certificación de Pilates Reformer en ${c.shortName}. Revisa requisitos, duración, costos y criterios antes de solicitar fechas.`,
      canonical: `${origin}/certificacion-pilates/${c.key}`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website'
    };
    const certFormUrl = process.env.CERT_FORM_URL || process.env.VITE_AIRTABLE_CERT_FORM_URL || 'mailto:valery@camadepilates.com';
    const directoryLink = c.directorySlug
      ? `<a href="/estudios-de-pilates/${c.directorySlug}">Ver clases y estudios en ${c.shortName}</a>`
      : '';
    const body = `
    <section class="bg-background border-b border-border">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">${cityTitle}</h1>
        <p class="mt-4 text-lg text-muted-foreground max-w-2xl">Compara opciones de formación en Reformer y Mat en ${c.shortName}. Antes de inscribirte, confirma el respaldo del programa, las horas de práctica, la evaluación y el costo total.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/523222787690?text=${encodeURIComponent('Hola Edelweiss, quiero información sobre certificación de Pilates en ' + c.shortName)}" class="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground">Solicitar información</a>
          <a href="mailto:valery@camadepilates.com?subject=${encodeURIComponent('Certificación de Pilates - ' + c.name)}&body=${encodeURIComponent('Hola, quisiera recibir el temario, fechas y costos para la certificación de Pilates en ' + c.name + '.') }" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Solicitar temario</a>
          <a href="${certFormUrl}" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Pre-inscripción</a>
        </div>
      </div>
    </section>
    <section class="container mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-foreground">Qué comparar antes de inscribirte</h2>
      <ul class="mt-5 space-y-3 text-muted-foreground">
        <li>Alcance de la formación: Reformer, Mat o ruta integral.</li>
        <li>Horas de observación, práctica y enseñanza.</li>
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
  for (const [route, meta] of Object.entries(routeMeta)) {
    if (route === '/reformer-para-estudio') continue;
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
