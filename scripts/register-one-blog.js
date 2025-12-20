#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'data');

function resolveConvexUrl() {
  return process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { slug: '', inlineLimit: 3, queue: false };
  for (const a of args) {
    if (a.startsWith('--slug=')) out.slug = a.split('=')[1];
    else if (a.startsWith('--inline=')) out.inlineLimit = Math.max(0, parseInt(a.split('=')[1] || '3', 10) || 3);
    else if (a === '--queue') out.queue = true;
    else if (a === '--no-queue') out.queue = false;
  }
  if (!out.slug) {
    console.error('Usage: node scripts/register-one-blog.js --slug=<slug> [--inline=3] [--queue]');
    process.exit(1);
  }
  return out;
}

function blogPath(slug) {
  const p = path.join(BLOG_DIR, `${slug}.md`);
  return fs.existsSync(p) ? p : null;
}

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

async function main() {
  const { slug, inlineLimit, queue } = parseArgs();
  const file = blogPath(slug);
  if (!file) {
    console.error(`Blog not found: src/content/blog/${slug}.md`);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  // ensure publishDate exists => considered released
  if (!data?.publishDate) {
    console.error(`Blog missing publishDate (not considered released): ${slug}`);
    process.exit(1);
  }

  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);
  const created = [];

  // Hero
  const heroId = `blog-${slug}-hero-1`;
  try {
    await client.mutation(api.placeholders.register, {
      token,
      placeholderId: heroId,
      pageType: 'blog', pageSlug: slug, location: 'hero',
      contextBefore: content.slice(0, 300), contextAfter: content.slice(0, 300),
      headingAbove: data?.title || '', preferredAspectRatio: '16:9',
      preferredStyle: 'lifestyle', requiredSubjects: ['person','reformer','studio'], priority: 100,
    });
    if (queue) await client.action(api.placeholderGeneration.queue, { token, placeholderId: heroId });
    created.push({ placeholderId: heroId, location: 'hero' });
  } catch (e) { /* ignore */ }

  // Inline sections by H2
  const sections = content.split(/\n## /);
  for (let i = 1; i < Math.min(inlineLimit + 1, sections.length); i++) {
    const sec = sections[i];
    const heading = (sec.match(/^[^\n]+/) || [''])[0];
    const idx = content.indexOf('## ' + sec);
    const { before, after } = contextAround(content, Math.max(0, idx));
    const aspect = i === 1 ? '16:9' : '4:3';
    const phId = `blog-${slug}-inline-${i}`;
    const { preferredStyle, requiredSubjects } = classify(heading, i - 1);
    try {
      await client.mutation(api.placeholders.register, {
        token,
        placeholderId: phId,
        pageType: 'blog', pageSlug: slug, location: `inline-${i}`,
        contextBefore: before, contextAfter: after, headingAbove: heading,
        preferredAspectRatio: aspect, preferredStyle, requiredSubjects,
        priority: i === 1 ? 100 : 60,
      });
      if (queue) await client.action(api.placeholderGeneration.queue, { token, placeholderId: phId });
      created.push({ placeholderId: phId, location: `inline-${i}` });
    } catch (e) { /* ignore */ }
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `placeholder-${slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ slug, created, at: new Date().toISOString() }, null, 2), 'utf8');
  console.log(`✅ ${slug}: ${created.length} placeholders (file: ${path.relative(ROOT, outFile)})`);
}

main();
