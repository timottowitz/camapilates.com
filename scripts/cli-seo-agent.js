#!/usr/bin/env node

/**
 * CLI wrapper for SEO Optimization Agent
 * Tool: optimize_title_and_meta { slug, target_keyword, intent }
 * - Uses gray-matter for robust frontmatter parsing
 * - Uses LLM to generate compelling meta descriptions
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Simple config loader (duplicate of config.js logic to avoid import issues in CLI)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || (GEMINI_API_KEY ? 'gemini' : 'openai');

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

function getModel() {
  if (LLM_PROVIDER === 'gemini' && GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    return google('gemini-1.5-flash'); // Fast model for SEO
  }
  if (OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
    return openai('gpt-4o-mini'); // Fast model for SEO
  }
  throw new Error('No API key configured for SEO agent');
}

async function generateMetaDescription(content, title, keyword) {
  try {
    const model = getModel();
    const prompt = `Eres un experto en SEO para CAMA Pilates (México).
Tarea: Escribe una meta description atractiva para Google.
Título: "${title}"
Keyword: "${keyword}"
Contenido (inicio): "${content.slice(0, 500)}..."

Requisitos:
- Máximo 155 caracteres.
- Incluye la keyword de forma natural.
- Call to action sutil.
- Tono profesional y persuasivo.
- Devuelve SOLO el texto de la descripción.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 100
    });

    return text.trim().slice(0, 155);
  } catch (e) {
    // Fallback if LLM fails
    return `Descubre todo sobre ${title}. Guía completa de CAMA Pilates México con consejos expertos sobre ${keyword}.`;
  }
}

async function optimizeTitleAndMeta({ slug, target_keyword }) {
  const file = path.join(ROOT, 'src', 'content', 'blog', `${slug}.md`);
  let rawContent;
  try { rawContent = await fs.readFile(file, 'utf-8'); } catch { return { success: false, error: 'Blog file not found', slug }; }

  const { data: frontmatter, content } = matter(rawContent);
  let updated = false;

  // 1. Optimize Title
  if (frontmatter.title && target_keyword && !frontmatter.title.toLowerCase().includes(target_keyword.toLowerCase())) {
    if (frontmatter.title.length < 50) {
      frontmatter.title = `${frontmatter.title} – ${target_keyword}`;
      updated = true;
    }
  }

  // 2. Optimize Description
  if (!frontmatter.description || frontmatter.description.length < 50 || frontmatter.description.length > 160) {
    frontmatter.description = await generateMetaDescription(content, frontmatter.title, target_keyword);
    updated = true;
  }

  if (updated) {
    const newFileContent = matter.stringify(content, frontmatter);
    await fs.writeFile(file, newFileContent, 'utf-8');
  }

  return { success: true, slug, title: frontmatter.title, description: frontmatter.description, updated };
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

