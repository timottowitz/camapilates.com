#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for SEO Optimization Agent
 * Tool: optimize_title_and_meta { slug, target_keyword, intent }
 * - Ensures meta description exists and is <= 155 chars
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

function clampDescription(d) {
  if (!d) return '';
  return d.length > 155 ? d.slice(0, 152) + '…' : d;
}

async function optimizeTitleAndMeta({ slug, target_keyword }) {
  const file = path.join(ROOT, 'src', 'content', 'blog', `${slug}.md`);
  let txt;
  try { txt = await fs.readFile(file, 'utf-8'); } catch { return { success: false, error: 'Blog file not found', slug }; }

  // Extract frontmatter block
  const m = txt.match(/^---[\s\S]*?---/);
  if (!m) return { success: false, error: 'Frontmatter missing', slug };
  let fm = m[0];

  // Title: keep as-is; ensure keyword presence softly
  const hasTitle = /\ntitle:\s*"([^"]+)"/.exec(fm);
  let title = hasTitle ? hasTitle[1] : '';
  if (title && target_keyword && !title.toLowerCase().includes(target_keyword.toLowerCase())) {
    // Non-destructive: append subtly if room allows
    if (title.length < 54) title = `${title} – ${target_keyword}`;
    fm = fm.replace(/\ntitle:\s*"([^"]+)"/, `\ntitle: "${title}"`);
  }

  // Description: ensure exists and <= 155 chars
  const dm = /\ndescription:\s*"([^"]*)"/;
  const dMatch = dm.exec(fm);
  if (dMatch) {
    const desc = clampDescription(dMatch[1]);
    fm = fm.replace(dm, `\ndescription: "${desc}"`);
  } else {
    const fallback = clampDescription(`Artículo sobre ${title || slug} para el público de México.`);
    fm = fm.replace(/^---/, `---\ndescription: "${fallback}"`);
  }

  // Rewrite file
  const updated = fm + txt.slice(fm.length);
  await fs.writeFile(file, updated, 'utf-8');
  return { success: true, slug, title, updated: true };
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const p = req?.parameters || {};
    if (tool === 'optimize_title_and_meta') {
      const res = await optimizeTitleAndMeta(p);
      process.stdout.write(JSON.stringify(res));
      process.exit(res.success ? 0 : 1);
      return;
    }
    process.stdout.write(JSON.stringify({ success: false, error: `Unknown tool: ${tool}` }));
    process.exit(1);
  } catch (err) {
    const msg = err?.message || String(err);
    process.stderr.write(msg + '\n');
    process.stdout.write(JSON.stringify({ success: false, error: msg }));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

