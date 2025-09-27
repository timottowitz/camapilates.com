#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
// Use dynamic import for marked ESM module

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content', 'blog');
const PRODUCTS = path.join(ROOT, 'src', 'content', 'products.json');

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
  const headerHtml = `
  <header class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div class="container flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-3">
        <img src="/brand/edelweiss.svg" alt="CAMA Pilates" class="h-7 w-auto" />
        <span class="text-sm md:text-base font-semibold tracking-tight text-gray-900">CAMA Pilates</span>
      </a>
      <nav class="flex items-center gap-6 text-sm text-gray-700">
        <a href="/about" class="hover:text-black">Acerca de</a>
        <a href="/shop" class="hover:text-black">Tienda</a>
        <a href="/acabados" class="hover:text-black">Acabados</a>
        <a href="/accesorios" class="hover:text-black">Accesorios</a>
        <a href="/blog" class="hover:text-black">Blog</a>
        <a href="/packs/estudio" class="hover:text-black">Paquete de Estudio (8+)</a>
        <a href="/certificacion-pilates" class="hover:text-black">Certificación</a>
      </nav>
    </div>
  </header>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${headerHtml}${bodyHtml}</div>`);
  return html;
}

function renderPost({ slug, title, description, category, date, content }) {
  const md = content
    .replace(/<hub-list[^>]*\/>/g, '')
    .replace(/<see-also[^>]*\/>/g, '')
    .replace(/<audio-story[^>]*\/>/g, '');
  const article = `
    <article class="container mx-auto px-4 py-8">
      <header>
        <div class="text-sm text-muted-foreground mb-4">${htmlEscape(category || '')} • ${htmlEscape(date || '')}</div>
        <h1 class="text-4xl font-bold mb-4">${htmlEscape(title)}</h1>
        <p class="text-xl text-muted-foreground mb-8">${htmlEscape(description || '')}</p>
      </header>
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

function buildProductsIndex(products) {
  const cards = products.map(p => `
    <a href="/product/${p.slug}" class="block group border rounded-lg p-6 hover:border-gray-900 transition-colors">
      <img src="${p.image}" alt="${p.name}" class="w-full h-auto rounded mb-4 border" />
      <h2 class="font-semibold text-gray-900 group-hover:text-black">${p.name}</h2>
      <p class="text-sm text-gray-600 mt-2">${p.description}</p>
      <div class="mt-3 font-semibold text-gray-900">$ ${p.price} ${p.currency}</div>
    </a>
  `).join('\n');
  return `<div class="container mx-auto px-4 py-12"><h1 class="text-3xl font-bold text-gray-900 mb-8">Todos los productos</h1><div class="grid md:grid-cols-3 gap-6">${cards}</div></div>`;
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
  });
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
  // routePath like /blog/foo or /blog
  const targetDir = path.join(DIST, routePath.replace(/^\//, ''), routePath.endsWith('/') ? '' : '/');
  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
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
  const certCities = [
    { key: 'cdmx', name: 'Ciudad de México (CDMX)' },
    { key: 'guadalajara', name: 'Guadalajara (Jalisco)' },
    { key: 'monterrey', name: 'Monterrey (NL)' },
    { key: 'puebla', name: 'Puebla' },
    { key: 'queretaro', name: 'Querétaro' },
  ];

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
    const body = renderPost(p);
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/blog/${p.slug}`, html);
  }

  // Simple category pages
  const categories = Array.from(new Set(posts.map(p => p.category)));
  for (const c of categories) {
    const list = posts.filter(p => p.category === c).slice(0, 40);
    const head = {
      title: `Categoría: ${c} | camadepilates.com`,
      description: `Artículos de ${c}`,
      canonical: `${origin}/blog/category/${encodeURIComponent(c)}`,
      ogImage: `${origin}/og/${list[0]?.slug || 'og'}.png`,
      ogType: 'website'
    };
    const body = buildIndex(list);
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/blog/category/${c}`, html);
  }

  // Simple tag pages
  const tagSet = new Set();
  posts.forEach(p => (p.tags||[]).forEach(t => tagSet.add(t)));
  for (const t of Array.from(tagSet)) {
    const list = posts.filter(p => (p.tags||[]).includes(t)).slice(0, 40);
    const head = {
      title: `Etiqueta: ${t} | camadepilates.com`,
      description: `Artículos etiquetados con ${t}`,
      canonical: `${origin}/blog/tag/${encodeURIComponent(t)}`,
      ogImage: `${origin}/og/${list[0]?.slug || 'og'}.png`,
      ogType: 'website'
    };
    const body = buildIndex(list);
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/blog/tag/${t}`, html);
  }

  // Product pages
  for (const pr of prods) {
    const { head, body, schema } = renderProduct(pr, origin);
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
    writeFileForRoute(`/product/${pr.slug}`, html);
  }
  // Products hub
  if (prods.length) {
    const head = {
      title: 'Productos: Camas de Pilates y Accesorios | camadepilates.com',
      description: 'Explora todas nuestras camas de Pilates (Reformer) y accesorios. Compra para casa o estudio.',
      canonical: `${origin}/products`,
      ogImage: `${origin}${prods[0].image}`,
      ogType: 'website'
    };
    const body = buildProductsIndex(prods);
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: prods.map((p, idx) => ({ '@type': 'ListItem', position: idx + 1, url: `${origin}/product/${p.slug}`, name: p.name }))
    };
    let html = baseHtml(template, head, body);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(itemList)}</script>\n</head>`);
    writeFileForRoute('/products', html);
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

  // Shop categories (new)
  if (prods.length) {
    const catMap = new Map();
    for (const p of prods) {
      const c = (p.category || 'Otros');
      catMap.set(c, true);
    }
    for (const name of Array.from(catMap.keys())) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const list = prods.filter(p => (p.category || 'Otros') === name);
      const head = {
        title: `Tienda — ${name} | camadepilates.com`,
        description: `Productos en la categoría ${name}`,
        canonical: `${origin}/shop/category/${slug}`,
        ogImage: `${origin}${list[0]?.image || '/og/cama-de-pilates-venta-mexico.png'}`,
        ogType: 'website'
      };
      const body = buildShopIndex(list);
      const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: list.map((p, idx) => ({ '@type': 'ListItem', position: idx + 1, url: `${origin}/product/${p.slug}`, name: p.name }))
      };
      let html = baseHtml(template, head, body);
      html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(itemList)}</script>\n</head>`);
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
    const head = {
      title: `Certificación de Pilates (Reformer) en ${c.name} | camadepilates.com`,
      description: `Conecta con certificaciones de Pilates en ${c.name}. Reformer y Mat: requisitos, duración, costos y registro.`,
      canonical: `${origin}/certificacion-pilates/${c.key}`,
      ogImage: `${origin}/og/cama-de-pilates-venta-mexico.png`,
      ogType: 'website'
    };
    const certFormUrl = process.env.CERT_FORM_URL || process.env.VITE_AIRTABLE_CERT_FORM_URL || 'mailto:valery@camadepilates.com';
    const body = `
    <section class="bg-background border-b border-border">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">Certificación de Pilates (Reformer) en ${c.name}</h1>
        <p class="mt-4 text-lg text-muted-foreground max-w-2xl">Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/523222787690?text=${encodeURIComponent('Hola Edelweiss, quiero inscribirme a la certificación de Pilates en ' + c.name)}" class="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground">Inscribirme en ${c.name.split(' ')[0]}</a>
          <a href="mailto:valery@camadepilates.com?subject=${encodeURIComponent('Certificación de Pilates - ' + c.name)}&body=${encodeURIComponent('Hola, quisiera recibir el temario, fechas y costos para la certificación de Pilates en ' + c.name + '.') }" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Solicitar temario</a>
          <a href="${certFormUrl}" class="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground">Pre-inscripción</a>
        </div>
      </div>
    </section>`;
    const html = baseHtml(template, head, body);
    writeFileForRoute(`/certificacion-pilates/${c.key}`, html);
  }
  console.log('Static prerender complete.');
}

main().catch(console.error);
