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
    '/compare': 'src/pages/Compare.tsx',
    '/certificacion-pilates': 'src/pages/CertificacionPilates.tsx',
    '/reformer-para-casa': 'src/pages/ReformerParaCasa.tsx',
    '/pilates-reformer-cdmx': 'src/pages/PilatesReformerCDMX.tsx',
    '/cama-de-pilates': 'src/pages/CamaDePilatesHub.tsx',
  };

  const urls = [
    { loc: `${origin}/`, lastmod: getGitLastMod(pageFiles['/']) || now, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/about`, lastmod: getGitLastMod(pageFiles['/about']) || now, changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/services`, lastmod: getGitLastMod(pageFiles['/services']) || now, changefreq: 'monthly', priority: '0.9' },
    { loc: `${origin}/blog`, lastmod: getGitLastMod(pageFiles['/blog']) || now, changefreq: 'daily', priority: '0.9' },
    { loc: `${origin}/shop`, lastmod: getGitLastMod(pageFiles['/shop']) || now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/products`, lastmod: getGitLastMod(pageFiles['/products']) || now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/compare`, lastmod: getGitLastMod(pageFiles['/compare']) || now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/cama-de-pilates`, lastmod: getGitLastMod(pageFiles['/cama-de-pilates']) || now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/reformer-para-casa`, lastmod: getGitLastMod(pageFiles['/reformer-para-casa']) || now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/pilates-reformer-cdmx`, lastmod: getGitLastMod(pageFiles['/pilates-reformer-cdmx']) || now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/certificacion-pilates`, lastmod: getGitLastMod(pageFiles['/certificacion-pilates']) || now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/certificacion-pilates/cdmx`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/guadalajara`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/monterrey`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/certificacion-pilates/puebla`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
    { loc: `${origin}/certificacion-pilates/queretaro`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
    { loc: `${origin}/estudios-de-pilates`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/cdmx/estudios-de-pilates`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/instructores-pilates`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/cdmx/instructores-pilates`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${origin}/guadalajara/instructores-pilates`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
    { loc: `${origin}/monterrey/instructores-pilates`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
  ];

  

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
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

  // Category pages
  for (const c of Array.from(categories)) {
    urls.push({
      loc: `${origin}/blog/category/${encodeURIComponent(c)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  // Tag pages
  for (const t of Array.from(tags)) {
    urls.push({
      loc: `${origin}/blog/tag/${encodeURIComponent(t)}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.5',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n\n</urlset>\n`;
  fs.writeFileSync(OUT, xml, 'utf8');
  console.log(`sitemap.xml written with ${urls.length} urls`);
}

build();
