#!/usr/bin/env node

/**
 * Patch blog frontmatter heroImage from API or direct URL
 *
 * Usage:
 *   node scripts/patch-hero-frontmatter.js --slug my-post --origin https://camadepilates.com
 *   node scripts/patch-hero-frontmatter.js --slug my-post --hero https://cdn.example.com/blog/my-post/hero.png
 *   node scripts/patch-hero-frontmatter.js --slug post1,post2 --origin http://localhost:4173
 */

import fs from 'fs/promises';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { slug: '', origin: '', hero: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--slug') out.slug = args[++i] || '';
    else if (a === '--origin') out.origin = args[++i] || '';
    else if (a === '--hero') out.hero = args[++i] || '';
  }
  if (!out.slug) throw new Error('Missing --slug');
  return out;
}

async function fetchHeroFromAPI(origin, slug) {
  if (!origin) throw new Error('Missing --origin for API fetch');
  const url = `${origin.replace(/\/$/, '')}/api/images/meta?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const hero = data?.hero_url || '';
  if (!hero) throw new Error('No hero_url found in API response');
  return hero;
}

function patchFrontmatter(content, heroUrl) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    // Create a new frontmatter block
    const fm = [
      '---',
      `heroImage: "${heroUrl}"`,
      '---',
      ''
    ].join('\n');
    return fm + content;
  }
  const fmBlock = fmMatch[1];
  const start = fmMatch.index || 0;
  const end = start + fmMatch[0].length;
  let newFm = '';
  if (/^heroImage:\s*/m.test(fmBlock)) {
    newFm = fmBlock.replace(/^heroImage:\s*.*$/m, `heroImage: "${heroUrl}"`);
  } else {
    // Insert heroImage just before closing
    newFm = fmBlock + `\nheroImage: "${heroUrl}"`;
  }
  const patched = content.slice(0, start) + '---\n' + newFm + '\n---' + content.slice(end);
  return patched;
}

async function processSlug(slug, hero, origin) {
  const file = path.join('src', 'content', 'blog', `${slug}.md`);
  let content; try { content = await fs.readFile(file, 'utf-8'); } catch { throw new Error(`File not found: ${file}`); }
  const heroUrl = hero || await fetchHeroFromAPI(origin, slug);
  const patched = patchFrontmatter(content, heroUrl);
  if (patched === content) {
    console.log(`[=] ${slug}: unchanged`);
    return;
  }
  await fs.writeFile(file, patched, 'utf-8');
  console.log(`[+] ${slug}: heroImage set to ${heroUrl}`);
}

async function main() {
  try {
    const { slug, origin, hero } = parseArgs();
    const slugs = slug.split(',').map(s => s.trim()).filter(Boolean);
    for (const s of slugs) {
      // eslint-disable-next-line no-await-in-loop
      await processSlug(s, hero, origin);
    }
  } catch (e) {
    console.error('Error:', (e?.message) || e);
    process.exit(1);
  }
}

main();

