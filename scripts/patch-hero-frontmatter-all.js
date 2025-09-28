#!/usr/bin/env node

/**
 * Patch heroImage for all posts that have stored hero_url in API
 *
 * Usage:
 *   node scripts/patch-hero-frontmatter-all.js --origin https://camadepilates.com [--dry]
 */

import fs from 'fs/promises';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { origin: '', dry: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--origin') out.origin = args[++i] || '';
    else if (a === '--dry') out.dry = true;
  }
  if (!out.origin) throw new Error('Missing --origin');
  return out;
}

function patchFrontmatter(content, heroUrl) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    const fm = [ '---', `heroImage: "${heroUrl}"`, '---', '' ].join('\n');
    return fm + content;
  }
  const fmBlock = fmMatch[1];
  const start = fmMatch.index || 0;
  const end = start + fmMatch[0].length;
  let newFm = '';
  if (/^heroImage:\s*/m.test(fmBlock)) newFm = fmBlock.replace(/^heroImage:\s*.*$/m, `heroImage: "${heroUrl}"`);
  else newFm = fmBlock + `\nheroImage: "${heroUrl}"`;
  return content.slice(0, start) + '---\n' + newFm + '\n---' + content.slice(end);
}

async function main() {
  try {
    const { origin, dry } = parseArgs();
    const listUrl = `${origin.replace(/\/$/, '')}/api/images/list`;
    const resp = await fetch(listUrl);
    if (!resp.ok) throw new Error(`List API error ${resp.status}`);
    const data = await resp.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) { console.log('No items with hero_url found.'); return; }
    let updated = 0, skipped = 0, missing = 0;
    for (const it of items) {
      const slug = it.slug; const url = it.hero_url;
      const file = path.join('src', 'content', 'blog', `${slug}.md`);
      let content;
      try { content = await fs.readFile(file, 'utf-8'); } catch { missing++; console.log(`[missing] ${slug}`); continue; }
      const patched = patchFrontmatter(content, url);
      if (patched === content) { skipped++; console.log(`[skip] ${slug}`); continue; }
      if (!dry) await fs.writeFile(file, patched, 'utf-8');
      updated++;
      console.log(`[ok] ${slug} → ${url}`);
    }
    console.log(`Done. Updated=${updated}, Skipped=${skipped}, Missing=${missing}`);
  } catch (e) {
    console.error('Error:', (e?.message) || e);
    process.exit(1);
  }
}

main();

