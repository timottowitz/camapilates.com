#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

function resolveConvexUrl() {
  return process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
}

function walkBlog() {
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(BLOG_DIR, f));
}

function slugFromPath(p) { return path.basename(p).replace(/\.md$/i, ''); }

function contextAround(text, idx, before = 500, after = 500) {
  const s = Math.max(0, idx - before);
  const e = Math.min(text.length, idx + after);
  return { before: text.slice(s, idx), after: text.slice(idx, e) };
}

function classify(heading = '', i = 0) {
  const h = heading.toLowerCase();
  let preferredStyle = i === 0 ? 'lifestyle' : 'professional';
  let requiredSubjects = ['reformer'];
  if (/comparativa|comparaci[oó]n|vs|versus|precio|dimensiones|medidas|tabla/.test(h)) {
    preferredStyle = 'technical'; requiredSubjects = ['reformer','comparison'];
  } else if (/ejercicio|beneficio|movimiento|rutina|postura|salud/.test(h)) {
    preferredStyle = 'lifestyle'; requiredSubjects = ['person','reformer','instructor'];
  } else if (/mantenimiento|cuidado|limpieza|repuestos|garant[ií]a/.test(h)) {
    preferredStyle = 'product'; requiredSubjects = ['reformer','tools'];
  } else if (/estudio|cdmx|ciudad|directorio|clase|instructor/.test(h)) {
    preferredStyle = 'studio'; requiredSubjects = ['studio interior','reformer lineup'];
  }
  return { preferredStyle, requiredSubjects };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { inlineLimit: 3, changedOnly: false, changed: [] };
  for (const a of args) {
    if (a.startsWith('--inline=')) out.inlineLimit = Math.max(0, parseInt(a.split('=')[1] || '3', 10) || 3);
    if (a.startsWith('--changed=')) { out.changedOnly = true; out.changed = (a.split('=')[1] || '').split(',').filter(Boolean); }
  }
  // Also accept CHANGED_FILES env from CI
  if (!out.changed.length && process.env.CHANGED_FILES) {
    out.changedOnly = true;
    out.changed = process.env.CHANGED_FILES.split(',').filter(Boolean);
  }
  return out;
}

async function main() {
  const { inlineLimit, changedOnly, changed } = parseArgs();
  const client = new ConvexHttpClient(resolveConvexUrl());

  const blogFiles = walkBlog();
  let targets = blogFiles;
  if (changedOnly && changed.length) {
    const changedSlugs = new Set(
      changed
        .filter((p) => /src\/content\/blog\/.*\.md$/.test(p))
        .map((p) => slugFromPath(p))
    );
    targets = blogFiles.filter((p) => changedSlugs.has(slugFromPath(p)));
  }

  let processed = 0, queued = 0, skipped = 0;
  for (const file of targets) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = data?.slug || slugFromPath(file);
    if (!data?.publishDate) { skipped++; continue; }

    // Check if placeholders exist already (hero)
    const existing = await client.query(api.placeholders.listByPage, { pageType: 'blog', pageSlug: slug });
    const haveHero = existing?.some((r) => r.location === 'hero');

    // Always register idempotently; queue only if hero missing
    const heroId = `blog-${slug}-hero-1`;
    await client.mutation(api.placeholders.register, {
      placeholderId: heroId,
      pageType: 'blog', pageSlug: slug, location: 'hero',
      contextBefore: content.slice(0, 300), contextAfter: content.slice(0, 300),
      headingAbove: data?.title || '', preferredAspectRatio: '16:9',
      preferredStyle: 'lifestyle', requiredSubjects: ['person','reformer','studio'], priority: 100,
    });
    if (!haveHero) { await client.action(api.placeholderGeneration.queue, { placeholderId: heroId }); queued++; }

    // Inline by H2
    const sections = content.split(/\n## /);
    for (let i = 1; i < Math.min(inlineLimit + 1, sections.length); i++) {
      const sec = sections[i];
      const heading = (sec.match(/^[^\n]+/) || [''])[0];
      const idx = content.indexOf('## ' + sec);
      const { before, after } = contextAround(content, Math.max(0, idx));
      const aspect = i === 1 ? '16:9' : '4:3';
      const phId = `blog-${slug}-inline-${i}`;
      await client.mutation(api.placeholders.register, {
        placeholderId: phId,
        pageType: 'blog', pageSlug: slug, location: `inline-${i}`,
        contextBefore: before, contextAfter: after, headingAbove: heading,
        preferredAspectRatio: aspect, ...classify(heading, i - 1),
        priority: i === 1 ? 100 : 60,
      });
      const haveThis = existing?.some((r) => r.location === `inline-${i}`);
      if (!haveThis) { await client.action(api.placeholderGeneration.queue, { placeholderId: phId }); queued++; }
    }

    processed++;
  }

  console.log(`Processed: ${processed}, Queued new: ${queued}, Skipped (no publishDate): ${skipped}`);
}

main();

