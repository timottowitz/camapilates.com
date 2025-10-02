#!/usr/bin/env node
// Scan TSX pages and blog markdown for image occurrences and emit placeholder suggestions
// Output: data/placeholder-scan.json

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const BLOG_DIR = path.join(SRC, 'content', 'blog');
const PAGES_DIR = path.join(SRC, 'pages');
const COMPONENTS_DIR = path.join(SRC, 'components');
const CONVEX_ASSETS_FILE = path.join(SRC, 'lib', 'convexAssets.ts');
const OUTPUT_DIR = path.join(ROOT, 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'placeholder-scan.json');

function walk(dir, exts = ['.tsx', '.md']) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function toRel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function countLines(str, endIdx) {
  return str.slice(0, endIdx).split('\n').length;
}

function extractWindow(str, startIdx, before = 500, after = 500) {
  const s = Math.max(0, startIdx - before);
  const e = Math.min(str.length, startIdx + after);
  return str.slice(s, e);
}

function findHeadingAbove(str, idx) {
  const chunk = str.slice(0, idx);
  // Prefer HTML heading in TSX
  const htmlMatches = [...chunk.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gis)];
  if (htmlMatches.length) return htmlMatches[htmlMatches.length - 1][2]?.trim().slice(0, 200);
  // Markdown heading
  const mdMatch = chunk.match(/^(#+)\s+(.+)$/gim);
  if (mdMatch && mdMatch.length) {
    const last = mdMatch[mdMatch.length - 1];
    return last.replace(/^#+\s+/, '').trim().slice(0, 200);
  }
  return undefined;
}

function guessPageTypeFromPath(relPath) {
  if (/src\/pages\/index\.tsx$/i.test(relPath)) return 'home';
  if (/src\/pages\/shop/i.test(relPath)) return 'shop';
  if (/src\/pages\/estudios-de-pilates/i.test(relPath)) return 'studios';
  return 'page';
}

function makePlaceholderId({ pageType, pageSlug, relPath, kind, ordinal }) {
  if (pageType === 'blog' && pageSlug) return `blog-${pageSlug}-${kind}-${ordinal}`;
  const base = relPath.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-');
  return `${pageType}-${base}-${kind}-${ordinal}`.toLowerCase();
}

function scanTsxFile(absPath) {
  const relPath = toRel(absPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const pageType = guessPageTypeFromPath(relPath);

  const results = [];
  const patterns = [
    { type: 'img', regex: /<img\b[^>]*>/gims },
    { type: 'Image', regex: /<Image\b[^>]*>/gims },
    { type: 'bg', regex: /backgroundImage\s*:\s*[`'\"]?url\(/gims },
  ];

  let ordinal = 0;
  for (const { type, regex } of patterns) {
    for (const m of content.matchAll(regex)) {
      ordinal += 1;
      const idx = m.index ?? 0;
      const line = countLines(content, idx);
      const context = extractWindow(content, idx, 500, 500);
      const headingAbove = findHeadingAbove(content, idx);
      const kind = type === 'img' && /hero|banner|hero/i.test(context) ? 'hero' : (type === 'bg' ? 'bg' : 'inline');
      const placeholderId = makePlaceholderId({ pageType, relPath, kind, ordinal });

      results.push({
        placeholderId,
        pageType,
        pageSlug: undefined,
        location: kind === 'hero' ? 'hero' : `${kind}-${ordinal}`,
        filePath: relPath,
        line,
        contextBefore: extractWindow(content, idx, 500, 0),
        contextAfter: extractWindow(content, idx, 0, 500),
        headingAbove,
        preferredAspectRatio: kind === 'hero' ? '16:9' : '4:3',
        priority: kind === 'hero' ? 100 : 60,
      });
    }
  }
  return results;
}

function scanMarkdownFile(absPath) {
  const relPath = toRel(absPath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const { data, content } = matter(raw);
  const slug = data?.slug || path.basename(absPath).replace(/\.md$/i, '');
  const pageType = 'blog';

  const results = [];
  // Markdown image syntax
  const mdImgRegex = /!\[[^\]]*\]\([^\)]+\)/gims;
  // HTML image in markdown
  const htmlImgRegex = /<img\b[^>]*>/gims;

  let ordinal = 0;
  for (const regex of [mdImgRegex, htmlImgRegex]) {
    for (const m of content.matchAll(regex)) {
      ordinal += 1;
      const idx = m.index ?? 0;
      const line = countLines(content, idx);
      const headingAbove = findHeadingAbove(content, idx);
      const kind = ordinal === 1 ? 'hero' : 'inline';
      const placeholderId = makePlaceholderId({ pageType, pageSlug: slug, relPath, kind, ordinal });

      results.push({
        placeholderId,
        pageType,
        pageSlug: slug,
        location: kind === 'hero' ? 'hero' : `${kind}-${ordinal}`,
        filePath: relPath,
        line,
        contextBefore: extractWindow(content, idx, 500, 0),
        contextAfter: extractWindow(content, idx, 0, 500),
        headingAbove,
        preferredAspectRatio: kind === 'hero' ? '16:9' : '4:3',
        priority: kind === 'hero' ? 100 : 60,
      });
    }
  }
  return results;
}

function scanConvexAssets(absPath) {
  const relPath = toRel(absPath);
  if (!fs.existsSync(absPath)) return [];
  const content = fs.readFileSync(absPath, 'utf8');
  // Match entries like: MY_KEY: 'value',
  const objStart = content.indexOf('export const CONVEX_IMAGE_NAMES');
  if (objStart < 0) return [];
  const slice = content.slice(objStart);
  const braceStart = slice.indexOf('{');
  const braceEnd = slice.indexOf('} as const');
  if (braceStart < 0 || braceEnd < 0) return [];
  const obj = slice.slice(braceStart + 1, braceEnd);
  const matches = [...obj.matchAll(/([A-Z0-9_]+)\s*:\s*['"]([^'\"]+)['"]/g)];
  const results = matches.map((m, idx) => {
    const name = m[2];
    return {
      placeholderId: `site-${name}`,
      pageType: 'site',
      pageSlug: undefined,
      location: 'named',
      filePath: relPath,
      line: 0,
      contextBefore: undefined,
      contextAfter: undefined,
      headingAbove: undefined,
      preferredAspectRatio: '16:9',
      priority: 90,
      meta: { nameKey: m[1], name }
    };
  });
  return results;
}

function main() {
  const output = { generatedAt: new Date().toISOString(), placeholders: [] };

  // TSX pages
  const tsxFiles = walk(PAGES_DIR, ['.tsx']);
  for (const f of tsxFiles) {
    const items = scanTsxFile(f);
    output.placeholders.push(...items);
  }

  // Components (TSX) — these may render images too
  const compFiles = walk(COMPONENTS_DIR, ['.tsx']);
  for (const f of compFiles) {
    const items = scanTsxFile(f);
    output.placeholders.push(...items);
  }

  // Blog posts
  const mdFiles = walk(BLOG_DIR, ['.md']);
  for (const f of mdFiles) {
    const items = scanMarkdownFile(f);
    output.placeholders.push(...items);
  }

  // Named Convex site images (from src/lib/convexAssets.ts)
  const namedItems = scanConvexAssets(CONVEX_ASSETS_FILE);
  output.placeholders.push(...namedItems);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✅ Scan complete: ${output.placeholders.length} placeholders`);
  console.log(`📄 Output: ${toRel(OUTPUT_FILE)}`);
}

main();
