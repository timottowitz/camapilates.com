#!/usr/bin/env node

/**
 * Blog Image Agent CLI
 * Tool: enrich_specific_blogs { slugs?, slug?, force?, waitSeconds? }
 * Registers blog placeholders, queues Convex generation, and waits for images.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

function resolveConvexUrl(preference) {
  const prodUrl = process.env.CONVEX_PROD_URL || 'https://spotted-raven-102.convex.cloud';

  if (!preference || preference === 'prod') {
    return prodUrl;
  }

  if (preference === 'dev') {
    return process.env.CONVEX_URL
      || process.env.CONVEX_DEPLOYMENT_URL
      || process.env.VITE_CONVEX_URL
      || prodUrl;
  }

  if (preference.startsWith('http://') || preference.startsWith('https://')) {
    return preference;
  }

  return prodUrl;
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

function loadBlog(slug) {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) {
    throw new Error(`Blog markdown not found for slug ${slug}`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  return { file, raw, frontmatter: parsed.data || {}, content: parsed.content || '' };
}

function contextAround(text, idx, before = 500, after = 500) {
  const start = Math.max(0, idx - before);
  const end = Math.min(text.length, idx + after);
  return {
    before: text.slice(start, idx),
    after: text.slice(idx, end),
  };
}

function classify(heading = '', order = 0) {
  const h = heading.toLowerCase();
  let preferredStyle = order === 0 ? 'lifestyle' : 'professional';
  let requiredSubjects = ['reformer'];
  if (/comparativa|comparaci[oó]n|vs|versus|precio|dimensiones|medidas|tabla/.test(h)) {
    preferredStyle = 'technical';
    requiredSubjects = ['reformer', 'comparison'];
  } else if (/ejercicio|beneficio|movimiento|rutina|postura|salud/.test(h)) {
    preferredStyle = 'lifestyle';
    requiredSubjects = ['person', 'reformer', 'instructor'];
  } else if (/mantenimiento|cuidado|limpieza|repuestos|garant[ií]a/.test(h)) {
    preferredStyle = 'product';
    requiredSubjects = ['reformer', 'tools'];
  } else if (/estudio|cdmx|ciudad|directorio|clase|instructor/.test(h)) {
    preferredStyle = 'studio';
    requiredSubjects = ['studio interior', 'reformer lineup'];
  }
  return { preferredStyle, requiredSubjects };
}

function extractInlineSections(content, limit = 3) {
  const sections = [];
  const regex = /^##\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) && sections.length < limit) {
    const heading = match[1].trim();
    const index = match.index;
    sections.push({ heading, index });
  }
  return sections;
}

async function withRetries(fn, options = {}) {
  const {
    attempts = 5,
    delayMs = 2000,
    description = 'operation',
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const message = err?.message || '';
      if (!/Service temporarily unavailable/i.test(message) && !/ECONNRESET|ETIMEDOUT|fetch failed/i.test(message)) {
        throw err;
      }
      if (attempt < attempts) {
        console.error(`⚠️  ${description} failed (attempt ${attempt}/${attempts}): ${message}`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

async function ensurePlaceholder(client, args) {
  await withRetries(() => client.mutation(api.placeholders.register, args), {
    description: `register ${args.placeholderId}`,
  });
  const current = await withRetries(
    () => client.query(api.placeholders.getById, { placeholderId: args.placeholderId }),
    { description: `fetch placeholder ${args.placeholderId}` },
  );
  return current;
}

async function queueGeneration(client, placeholderId) {
  await withRetries(
    () => client.action(api.placeholderGeneration.queue, { placeholderId }),
    { description: `queue generation for ${placeholderId}` },
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollPlaceholder(client, placeholderId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await client.query(api.placeholders.getById, { placeholderId });
    } catch (err) {
      const message = err?.message || '';
      if (/Service temporarily unavailable/i.test(message)) {
        await sleep(2000);
        continue;
      }
      throw err;
    }

    if (!last) {
      return { status: 'missing' };
    }

    if ((last.status === 'active' || last.status === 'image_assigned') && last.imageUrl) {
      return { status: 'active', imageUrl: last.imageUrl, waitedMs: timeoutMs - (deadline - Date.now()) };
    }

    if (last.status === 'error') {
      return { status: 'error', error: last.generationError || 'generation failed' };
    }

    await sleep(5000);
  }

  return { status: last?.status || 'pending', imageUrl: last?.imageUrl, timeout: true };
}

async function processSlug(client, slug, options) {
  const { content, frontmatter } = loadBlog(slug);
  const summary = [];

  const heroId = `blog-${slug}-hero-1`;
  const heroPlaceholder = await ensurePlaceholder(client, {
    placeholderId: heroId,
    pageType: 'blog',
    pageSlug: slug,
    location: 'hero',
    contextBefore: content.slice(0, 600),
    contextAfter: content.slice(0, 600),
    headingAbove: frontmatter?.title || '',
    altText: frontmatter?.title || `Hero for ${slug}`,
    preferredAspectRatio: '16:9',
    preferredStyle: 'lifestyle',
    requiredSubjects: ['person', 'reformer', 'studio'],
    priority: 100,
  });
  console.error('   ↳ hero placeholder state:', JSON.stringify({ status: heroPlaceholder?.status, hasImage: Boolean(heroPlaceholder?.imageUrl) }, null, 2));

  const heroNeedsGeneration = options.force || !heroPlaceholder?.imageUrl;
  if (heroNeedsGeneration) {
    await queueGeneration(client, heroId);
    const result = await pollPlaceholder(client, heroId, options.waitMs);
    summary.push({ placeholderId: heroId, ...result });
    console.error(`   ↳ hero: ${result.status}${result.imageUrl ? ' (image ready)' : ''}${result.error ? ` - ${result.error}` : ''}`);
  } else {
    summary.push({ placeholderId: heroId, status: heroPlaceholder.status, imageUrl: heroPlaceholder.imageUrl, skipped: true });
    console.error('   ↳ hero: using existing image');
  }

  const sections = extractInlineSections(content, options.inlineLimit);
  for (let i = 0; i < sections.length; i += 1) {
    const { heading, index } = sections[i];
    const { before, after } = contextAround(content, index);
    const placeholderId = `blog-${slug}-inline-${i + 1}`;
    const { preferredStyle, requiredSubjects } = classify(heading, i);

    const inlinePlaceholder = await ensurePlaceholder(client, {
      placeholderId,
      pageType: 'blog',
      pageSlug: slug,
      location: `inline-${i + 1}`,
      contextBefore: before,
      contextAfter: after,
      headingAbove: heading,
      preferredAspectRatio: i === 0 ? '16:9' : '4:3',
      preferredStyle,
      requiredSubjects,
      altText: heading,
      priority: i === 0 ? 90 : 70,
    });

    const needsGeneration = options.force || !inlinePlaceholder?.imageUrl;
    if (needsGeneration) {
      await queueGeneration(client, placeholderId);
      const result = await pollPlaceholder(client, placeholderId, options.waitMs);
      summary.push({ placeholderId, heading, ...result });
      console.error(`   ↳ ${placeholderId}: ${result.status}${result.imageUrl ? ' (image ready)' : ''}${result.error ? ` - ${result.error}` : ''}`);
    } else {
      summary.push({ placeholderId, heading, status: inlinePlaceholder.status, imageUrl: inlinePlaceholder.imageUrl, skipped: true });
      console.error(`   ↳ ${placeholderId}: using existing image`);
    }
  }

  return summary;
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const params = req?.parameters || {};

    if (tool !== 'enrich_specific_blogs') {
      throw new Error(`Unknown tool: ${tool}`);
    }

    const slugs = Array.isArray(params.slugs)
      ? params.slugs.filter(Boolean)
      : params.slug
        ? [params.slug]
        : [];

    if (slugs.length === 0) {
      throw new Error('No blog slugs provided');
    }

    const envPreference = params.environment || params.env || params.environmentName;
    const explicitUrl = params.convexUrl || params.url;
    const convexUrl = resolveConvexUrl(explicitUrl ? String(explicitUrl) : String(envPreference || 'prod'));
    console.error(`🔗 Convex endpoint: ${convexUrl}`);
    const client = new ConvexHttpClient(convexUrl);

    const options = {
      force: Boolean(params.force || params.forceOverwrite),
      waitMs: Math.max(30, Number(params.waitSeconds) || 120) * 1000,
      inlineLimit: params.inlineLimit ? Number(params.inlineLimit) : 3,
    };

    const results = {};
    for (const slug of slugs) {
      console.error(`🌆 Processing blog: ${slug}`);
      const placeholders = await processSlug(client, slug, options);
      results[slug] = placeholders;
    }

    console.error('✅ Completed image enrichment run');

    process.stdout.write(JSON.stringify({ success: true, slugs, results }));
    process.exit(0);
  } catch (err) {
    const message = err?.message || String(err);
    console.error(message);
    process.stdout.write(JSON.stringify({ success: false, error: message }));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

