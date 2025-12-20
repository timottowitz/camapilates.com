#!/usr/bin/env node

/**
 * Blog Image Agent CLI
 * Tool: enrich_specific_blogs { slugs?, slug?, force?, waitSeconds? }
 * Registers blog placeholders, queues Convex generation, and waits for images.
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

import fs from 'node:fs';
import matter from 'gray-matter';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-pro-preview';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

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

function normalizeHeading(str = '') {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function reviewImagePlacements(slug, title, content) {
  if (!GEMINI_API_KEY) return null;
  try {
    const prompt = `Analiza el siguiente artículo de blog sobre Pilates y propone hasta 3 lugares donde una imagen agregaría valor visual.
Devuelve un JSON con este formato exacto:
[
  {
    "heading": "Texto exacto del H2",
    "reason": "Por qué ayuda",
    "preferredStyle": "lifestyle | studio | technical | product",
    "subjects": ["persona", "reformer"],
    "aspectRatio": "16:9" (opcional)
  }
]
Solo sugiere headings que existan en el Markdown. Contexto:
Titulo: ${title}
Slug: ${slug}
Contenido:
${content.slice(0, 8000)}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    });
    if (!resp.ok) {
      throw new Error(`Gemini reviewer error: ${resp.status}`);
    }
    const data = await resp.json();
    const text = String(data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || '').trim();
    if (!text) return null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/i);
    const payload = jsonMatch ? jsonMatch[1] : text;
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) return null;
    return parsed.slice(0, 3).map((item) => ({
      heading: String(item.heading || '').trim(),
      reason: String(item.reason || '').trim(),
      preferredStyle: String(item.preferredStyle || '').trim(),
      subjects: Array.isArray(item.subjects) ? item.subjects.map((s) => String(s)) : [],
      aspectRatio: item.aspectRatio ? String(item.aspectRatio) : undefined,
    })).filter((s) => s.heading);
  } catch (err) {
    console.error('⚠️  Reviewer failed, falling back to default sections:', err?.message || err);
    return null;
  }
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

async function ensurePlaceholder(client, token, args) {
  await withRetries(() => client.mutation(api.placeholders.register, { token, ...args }), {
    description: `register ${args.placeholderId}`,
  });
  const current = await withRetries(
    () => client.query(api.placeholders.getByIdAdmin, { token, placeholderId: args.placeholderId }),
    { description: `fetch placeholder ${args.placeholderId}` },
  );
  return current;
}

async function queueGeneration(client, token, placeholderId) {
  await withRetries(
    () => client.action(api.placeholderGeneration.queue, { token, placeholderId }),
    { description: `queue generation for ${placeholderId}` },
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollPlaceholder(client, token, placeholderId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId });
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

async function processSlug(client, token, slug, options) {
  const { content, frontmatter } = loadBlog(slug);
  const summary = [];

  const heroId = `blog-${slug}-hero-1`;
  const heroPlaceholder = await ensurePlaceholder(client, token, {
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
    if (options.force) {
      await queueGeneration(client, token, heroId);
    }
    const result = await pollPlaceholder(client, token, heroId, options.waitMs);
    summary.push({ placeholderId: heroId, ...result });
    console.error(`   ↳ hero: ${result.status}${result.imageUrl ? ' (image ready)' : ''}${result.error ? ` - ${result.error}` : ''}`);
  } else {
    summary.push({ placeholderId: heroId, status: heroPlaceholder.status, imageUrl: heroPlaceholder.imageUrl, skipped: true });
    console.error('   ↳ hero: using existing image');
  }

  const baseSections = extractInlineSections(content, options.inlineLimit + 2);
  const normalizedMap = new Map(baseSections.map((s) => [normalizeHeading(s.heading), s]));
  const reviewerSuggestions = await reviewImagePlacements(slug, frontmatter?.title || slug, content);
  const mergedTargets = reviewerSuggestions && reviewerSuggestions.length
    ? reviewerSuggestions
      .map((s) => {
        const exact = normalizedMap.get(normalizeHeading(s.heading));
        return exact ? { ...exact, meta: s } : null;
      })
      .filter(Boolean)
    : baseSections.slice(0, options.inlineLimit).map((s) => ({ ...s, meta: null }));

  for (let i = 0; i < mergedTargets.length; i += 1) {
    const { heading, index, meta } = mergedTargets[i];
    const { before, after } = contextAround(content, index);
    const placeholderId = `blog-${slug}-inline-${i + 1}`;
    const classified = classify(heading, i);
    const preferredStyle = meta?.preferredStyle || classified.preferredStyle;
    const requiredSubjects = meta?.subjects?.length ? meta.subjects : classified.requiredSubjects;
    const preferredAspectRatio = meta?.aspectRatio || (i === 0 ? '16:9' : '4:3');

    const inlinePlaceholder = await ensurePlaceholder(client, token, {
      placeholderId,
      pageType: 'blog',
      pageSlug: slug,
      location: `inline-${i + 1}`,
      contextBefore: before,
      contextAfter: after,
      headingAbove: heading,
      preferredAspectRatio,
      preferredStyle,
      requiredSubjects,
      altText: heading,
      priority: i === 0 ? 90 : 70,
    });

    const needsGeneration = options.force || !inlinePlaceholder?.imageUrl;
    if (needsGeneration) {
      if (options.force) {
        await queueGeneration(client, token, placeholderId);
      }
      const result = await pollPlaceholder(client, token, placeholderId, options.waitMs);
      summary.push({ placeholderId, heading, reason: meta?.reason, ...result });
      console.error(`   ↳ ${placeholderId}: ${result.status}${result.imageUrl ? ' (image ready)' : ''}${result.error ? ` - ${result.error}` : ''}`);
    } else {
      summary.push({ placeholderId, heading, status: inlinePlaceholder.status, imageUrl: inlinePlaceholder.imageUrl, skipped: true });
      console.error(`   ↳ ${placeholderId}: using existing image`);
    }
  }

  // Update the blog file with the images
  updateBlogContent(slug, content, frontmatter, summary);

  return summary;
}

function updateBlogContent(slug, content, frontmatter, summary) {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  let newContent = content;
  let newFrontmatter = { ...frontmatter };
  let hasChanges = false;

  // 1. Update Hero Image in Frontmatter
  const hero = summary.find(s => s.placeholderId.includes('hero'));
  if (hero && hero.imageUrl) {
    newFrontmatter.heroImage = hero.imageUrl;
    hasChanges = true;
  }

  // 2. Insert Inline Images
  // Sort by index descending to avoid offsetting indices when inserting
  const inlineImages = summary
    .filter(s => s.heading && s.imageUrl)
    .sort((a, b) => {
      const idxA = content.indexOf(a.heading);
      const idxB = content.indexOf(b.heading);
      return idxB - idxA;
    });

  for (const img of inlineImages) {
    // Find the heading in the *current* newContent (it might have changed, but we iterate backwards so indices relative to the start shouldn't shift for previous items... wait, regex is safer)
    // Actually, simple replacement is safer.
    const headingRegex = new RegExp(`(##\\s+${escapeRegExp(img.heading)})`, 'i');
    if (headingRegex.test(newContent)) {
      // Check if image is already there to avoid duplicates
      if (!newContent.includes(img.imageUrl)) {
        // Insert after the heading
        const imageMarkdown = `\n![${img.heading}](${img.imageUrl})\n`;
        newContent = newContent.replace(headingRegex, `$1${imageMarkdown}`);
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    const newFileContent = matter.stringify(newContent, newFrontmatter);
    fs.writeFileSync(file, newFileContent, 'utf8');
    console.error(`   💾 Updated blog file with images: ${slug}`);
  } else {
    console.error(`   ℹ️  No new images to write for: ${slug}`);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const token = await getAdminToken(client);

    const options = {
      force: Boolean(params.force || params.forceOverwrite),
      waitMs: Math.max(30, Number(params.waitSeconds) || 120) * 1000,
      inlineLimit: params.inlineLimit ? Number(params.inlineLimit) : 3,
    };

    const results = {};
    for (const slug of slugs) {
      console.error(`🌆 Processing blog: ${slug}`);
      const placeholders = await processSlug(client, token, slug, options);
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
