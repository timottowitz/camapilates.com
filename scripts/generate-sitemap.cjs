#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'blog');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT = path.join(PUBLIC_DIR, 'sitemap.xml');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && e.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function toSlug(file) {
  return path.basename(file).replace(/\.md$/i, '');
}

function iso(d) {
  try { return new Date(d).toISOString().slice(0,10); } catch { return new Date().toISOString().slice(0,10); }
}

// Must stay identical to slugify() in src/utils/slug.ts. The blog tag and category
// routes redirect any param that is not already in this form, so emitting anything
// else here puts redirects in the sitemap instead of the real pages.
function slugify(input) {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get last git commit date for a file
function getGitLastMod(filePath) {
  try {
    const date = execSync(`git log -1 --format=%ci "${filePath}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    return date ? iso(date) : null;
  } catch {
    return null;
  }
}

function build() {
  const origin = process.env.SITE_ORIGIN || 'https://camadepilates.com';
  const now = new Date().toISOString().slice(0,10);

  // Map page routes to their source files for git lastmod
  const pageFiles = {
    '/': 'src/pages/Index.tsx',
    '/about': 'src/pages/About.tsx',
    '/services': 'src/pages/Services.tsx',
    '/blog': 'src/pages/Blog.tsx',
    '/shop': 'src/pages/Shop.tsx',
    '/products': 'src/pages/Shop.tsx',
    '/certificacion-pilates': 'src/pages/CertificacionPilates.tsx',
    '/reformer-para-casa': 'src/pages/ReformerParaCasa.tsx',
    '/pilates-reformer-cdmx': 'src/pages/PilatesReformerCDMX.tsx',
    '/cama-de-pilates': 'src/pages/CamaDePilatesHub.tsx',
    '/cama-de-pilates/en-venta': 'src/pages/CamaDePilatesEnVenta.tsx',
    '/cama-de-pilates/precio': 'src/pages/CamaDePilatesPrecio.tsx',
    '/reformers/nuevas': 'src/pages/ReformersNew.tsx',
    '/packs/estudio': 'src/pages/StudioPack.tsx',
    '/soporte': 'src/pages/Support.tsx',
    '/legal/terminos': 'src/pages/LegalTerms.tsx',
    '/legal/privacidad': 'src/pages/LegalPrivacy.tsx',
    '/claim-studio': 'src/pages/ClaimStudio.tsx',
    '/claim-teacher': 'src/pages/instructores-pilates/ClaimTeacher.tsx',
    '/estudios-de-pilates': 'src/pages/estudios-de-pilates/StudiosLanding.tsx',
    '/instructores-pilates': 'src/pages/instructores-pilates/TeachersLanding.tsx',
  };

  const page = (route) => getGitLastMod(pageFiles[route]) || now;

  // Directory city pages. The routes are /estudios-de-pilates/:city and
  // /instructores-pilates/:city — city first is a 404 — and both redirect any city
  // slug that is not canonical, so cdmx has to be spelled ciudad-de-mexico.
  const directoryCities = ['ciudad-de-mexico', 'guadalajara', 'monterrey'];

  const urls = [
    { loc: `${origin}/`, lastmod: page('/'), changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/about`, lastmod: page('/about'), changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/services`, lastmod: page('/services'), changefreq: 'monthly', priority: '0.9' },
    { loc: `${origin}/blog`, lastmod: page('/blog'), changefreq: 'daily', priority: '0.9' },
    { loc: `${origin}/shop`, lastmod: page('/shop'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/products`, lastmod: page('/products'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/cama-de-pilates`, lastmod: page('/cama-de-pilates'), changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/cama-de-pilates/en-venta`, lastmod: page('/cama-de-pilates/en-venta'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/cama-de-pilates/precio`, lastmod: page('/cama-de-pilates/precio'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/reformers/nuevas`, lastmod: page('/reformers/nuevas'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/packs/estudio`, lastmod: page('/packs/estudio'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/reformer-para-casa`, lastmod: page('/reformer-para-casa'), changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/pilates-reformer-cdmx`, lastmod: page('/pilates-reformer-cdmx'), changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/certificacion-pilates`, lastmod: page('/certificacion-pilates'), changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/certificacion-pilates/cdmx`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/guadalajara`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/monterrey`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/puebla`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
    { loc: `${origin}/certificacion-pilates/queretaro`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
    { loc: `${origin}/estudios-de-pilates`, lastmod: page('/estudios-de-pilates'), changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/instructores-pilates`, lastmod: page('/instructores-pilates'), changefreq: 'weekly', priority: '0.8' },
    // /claim-teacher is intentionally absent: it redirects to /instructores-pilates.
    { loc: `${origin}/claim-studio`, lastmod: page('/claim-studio'), changefreq: 'monthly', priority: '0.5' },
    { loc: `${origin}/soporte`, lastmod: page('/soporte'), changefreq: 'monthly', priority: '0.5' },
    { loc: `${origin}/legal/terminos`, lastmod: page('/legal/terminos'), changefreq: 'yearly', priority: '0.3' },
    { loc: `${origin}/legal/privacidad`, lastmod: page('/legal/privacidad'), changefreq: 'yearly', priority: '0.3' },
  ];

  for (const city of directoryCities) {
    urls.push({ loc: `${origin}/estudios-de-pilates/${city}`, lastmod: now, changefreq: 'weekly', priority: '0.7' });
    urls.push({ loc: `${origin}/instructores-pilates/${city}`, lastmod: now, changefreq: 'weekly', priority: '0.7' });
  }



  const files = walk(CONTENT_DIR);
  const categories = new Set();
  const tags = new Set();
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || toSlug(file);
    const lastmod = iso(data.updatedDate || data.publishDate || now);
    urls.push({
      loc: `${origin}/blog/${slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    });
    if (data.category) categories.add(String(data.category));
    if (Array.isArray(data.tags)) data.tags.forEach(t => tags.add(String(t)));
  }

  // Include product pages from JSON catalog
  try {
    const productsJsonPath = path.join(ROOT, 'src', 'content', 'products.json');
    const productsJson = fs.readFileSync(productsJsonPath, 'utf8');
    const prods = JSON.parse(productsJson);
    const productsLastMod = getGitLastMod(productsJsonPath) || now;
    const catMap = new Map();
    for (const p of prods) {
      urls.push({
        loc: `${origin}/product/${encodeURIComponent(p.slug)}`,
        lastmod: productsLastMod,
        changefreq: 'weekly',
        priority: '0.7'
      });
      const cname = (p.category || 'Otros');
      catMap.set(cname, true);
    }
    // Category pages
    for (const name of Array.from(catMap.keys())) {
      const slug = slugify(name);
      urls.push({
        loc: `${origin}/shop/category/${slug}`,
        lastmod: productsLastMod,
        changefreq: 'weekly',
        priority: '0.6'
      });
    }
  } catch (e) {
    // ignore
  }

  // Category pages. Slugified, so "Guías de compra" and the odd casing variants in
  // frontmatter collapse onto the one URL the site actually links to.
  for (const c of new Set(Array.from(categories, slugify))) {
    if (!c) continue;
    urls.push({
      loc: `${origin}/blog/category/${c}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  // Tag pages
  for (const t of new Set(Array.from(tags, slugify))) {
    if (!t) continue;
    urls.push({
      loc: `${origin}/blog/tag/${t}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.5',
    });
  }

  const seen = new Set();
  const unique = urls.filter(u => !seen.has(u.loc) && seen.add(u.loc));
  const dropped = urls.length - unique.length;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n\n</urlset>\n`;
  fs.writeFileSync(OUT, xml, 'utf8');
  console.log(`sitemap.xml written with ${unique.length} urls${dropped ? ` (${dropped} duplicate${dropped > 1 ? 's' : ''} dropped)` : ''}`);
}

build();
