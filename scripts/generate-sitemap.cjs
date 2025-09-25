#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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

function build() {
  const origin = process.env.SITE_ORIGIN || 'https://camadepilates.com';
  const now = new Date().toISOString().slice(0,10);

  const urls = [
    { loc: `${origin}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/about`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/services`, lastmod: now, changefreq: 'monthly', priority: '0.9' },
    { loc: `${origin}/blog`, lastmod: now, changefreq: 'daily', priority: '0.9' },
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
