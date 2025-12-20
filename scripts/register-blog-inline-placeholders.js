#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
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

function resolveConvexUrl() {
  return process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
}

async function main() {
  const files = walk(BLOG_DIR);
  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);
  let registered = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const slug = data?.slug || path.basename(file).replace(/\.md$/i, '');
    // Split by H2 headings
    const sections = content.split(/\n## /);
    for (let i = 1; i < Math.min(4, sections.length); i++) {
      const sec = sections[i];
      const heading = (sec.match(/^[^\n]+/) || [''])[0];
      const idxInFull = content.indexOf('## ' + sec);
      const { before, after } = contextAround(content, Math.max(0, idxInFull));
      const aspect = i === 1 ? '16:9' : '4:3';
      const phId = `blog-${slug}-inline-${i}`;
      const { preferredStyle, requiredSubjects } = classify(heading, i - 1);
      try {
        await client.mutation(api.placeholders.register, {
          token,
          placeholderId: phId,
          pageType: 'blog',
          pageSlug: slug,
          location: `inline-${i}`,
          contextBefore: before,
          contextAfter: after,
          headingAbove: heading,
          preferredAspectRatio: aspect,
          preferredStyle,
          requiredSubjects,
          priority: i === 1 ? 100 : 60,
        });
        registered++;
      } catch (e) {
        // continue
      }
    }
    // Hero
    const phHero = `blog-${slug}-hero-1`;
    try {
      await client.mutation(api.placeholders.register, {
        token,
        placeholderId: phHero,
        pageType: 'blog',
        pageSlug: slug,
        location: 'hero',
        contextBefore: content.slice(0, 300),
        contextAfter: content.slice(0, 300),
        headingAbove: data?.title || '',
        preferredAspectRatio: '16:9',
        preferredStyle: 'lifestyle',
        requiredSubjects: ['person','reformer','studio'],
        priority: 100,
      });
      registered++;
    } catch {}
  }

  console.log(`Registered: ${registered}, Blogs: ${files.length}`);
}

main();
