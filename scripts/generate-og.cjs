#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'public', 'og');

async function fetchFontDataUrl() {
  const url = 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    const b64 = Buffer.from(buf).toString('base64');
    return `data:font/ttf;base64,${b64}`;
  } catch (e) {
    console.warn('OG: font fetch failed, falling back to system fonts', e.message);
    return null;
  }
}

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

function readPosts() {
  const files = walk(CONTENT_DIR);
  return files.map(f => {
    const raw = fs.readFileSync(f, 'utf8');
    const { data } = matter(raw);
    return {
      slug: data.slug || path.basename(f).replace(/\.md$/i, ''),
      title: data.title || 'Article',
      description: data.description || '',
      category: data.category || 'Blog',
      date: data.publishDate || '',
    };
  });
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxCharsPerLine) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3); // keep it to ~3 lines
}

function svgTemplate(post, fontDataUrl) {
  const W = 1200, H = 630;
  const titleLines = wrapText(post.title, 36);
  const subtitle = post.description ? wrapText(post.description, 60).join(' · ') : '';
  const fontFace = fontDataUrl ? `@font-face{ font-family: 'InterOG'; src: url(${fontDataUrl}) format('truetype'); font-weight: 700; font-style: normal; }` : '';
  const family = fontDataUrl ? 'InterOG, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' : '-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  const date = post.date || '';
  const category = post.category;
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <style>
        ${fontFace}
        .title { font: 700 68px ${family}; fill: #ffffff; letter-spacing: -0.5px; }
        .subtitle { font: 400 26px ${family}; fill: #cbd5e1; }
        .meta { font: 500 24px ${family}; fill: #e2e8f0; }
        .badge { font: 600 22px ${family}; fill: #111827; }
      </style>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="48" y="48" width="1104" height="534" rx="24" fill="#0b1220" opacity="0.6"/>
    <g transform="translate(96, 120)">
      <rect x="0" y="-12" rx="10" width="auto" height="40" fill="#fbbf24" />
      <text class="badge" x="0" y="20">${escapeXml(category)}</text>
    </g>
    <g transform="translate(96, 170)">
      <text class="title" x="0" y="0">${escapeXml(titleLines[0] || '')}</text>
      ${titleLines[1] ? `<text class="title" x="0" y="76">${escapeXml(titleLines[1])}</text>` : ''}
      ${titleLines[2] ? `<text class="title" x="0" y="152">${escapeXml(titleLines[2])}</text>` : ''}
    </g>
    ${subtitle ? `<g transform="translate(96, ${titleLines.length > 1 ? 360 : 300})"><text class="subtitle" x="0" y="0">${escapeXml(subtitle)}</text></g>` : ''}
    <g transform="translate(96, 560)">
      <text class="meta" x="0" y="0">${escapeXml(date)}</text>
      <text class="meta" x="900" y="0">solarpanelfraud.org</text>
    </g>
  </svg>`;
}

async function main() {
  const posts = readPosts();
  if (!posts.length) {
    console.log('OG: no posts found');
    return;
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const fontDataUrl = await fetchFontDataUrl();
  let count = 0;
  for (const p of posts) {
    try {
      const svg = svgTemplate(p, fontDataUrl);
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true } });
      const pngData = resvg.render().asPng();
      fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.png`), pngData);
      count++;
    } catch (e) {
      console.warn('OG: failed to render', p.slug, e.message);
    }
  }
  console.log(`OG: generated ${count} images in public/og/`);
}

main();

