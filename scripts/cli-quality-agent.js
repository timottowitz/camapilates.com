#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for Quality Review Agent
 * Tools supported:
 * - validate_mexican_market_data (research stage) { slug }
 * - generate_quality_score (blog stage) { slug }
 * - audit_seo_compliance (final validation) { slug }
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

async function safeRead(p) { try { return await fs.readFile(p, 'utf-8'); } catch { return ''; } }

function countWords(s) { return (s || '').trim().split(/\s+/).filter(Boolean).length; }

async function validateMexicanMarketData(slug) {
  const file = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  const txt = await safeRead(file);
  const lc = txt.toLowerCase();
  const keys = ['méxico', 'mexico', 'cdmx', 'guadalajara', 'monterrey', 'mxn', 'peso', 'inegi', 'imss'];
  const found = keys.filter(k => lc.includes(k));
  const ok = found.length >= 2;
  return {
    success: true,
    slug,
    file,
    has_sufficient_context: ok,
    mexican_keywords_found: found,
    word_count: countWords(txt),
    recommendations: ok ? [] : ['Agregar estadísticas mexicanas y precios en MXN']
  };
}

async function generateQualityScore(slug) {
  const file = path.join(ROOT, 'src', 'content', 'blog', `${slug}.md`);
  const txt = await safeRead(file);
  const contentOnly = txt.replace(/^---[\s\S]*?---/, '');
  const words = countWords(contentOnly);
  const hasH1 = /^\s*#\s+/m.test(contentOnly);
  const hasFAQ = /\n##[^\n]*faq/i.test(contentOnly);
  const hasSeeAlso = /<see-also\b[^>]*\/>/i.test(contentOnly);
  const hasHubList = /<hub-list\b[^>]*\/>/i.test(contentOnly);
  const hasDisclaimer = />\s*Nota: Contenido informativo/i.test(contentOnly);

  let score = 80;
  if (words >= 800) score += 5;
  if (hasH1) score += 2;
  if (hasFAQ) score += 4;
  if (hasSeeAlso) score += 3;
  if (hasHubList) score += 3;
  if (hasDisclaimer) score += 3;
  score = Math.min(100, score);

  return {
    success: true,
    slug,
    overall_score: score,
    metrics: { words, hasH1, hasFAQ, hasSeeAlso, hasHubList, hasDisclaimer }
  };
}

async function auditSeoCompliance(slug) {
  const file = path.join(ROOT, 'src', 'content', 'blog', `${slug}.md`);
  const txt = await safeRead(file);
  const fmMatch = txt.match(/^---([\s\S]*?)---/);
  const fmBlock = fmMatch ? fmMatch[1] : '';
  const hasFM = !!fmMatch;
  const lines = fmBlock.replace(/\r/g, '').split('\n').map(l => l.trim());
  const hasKey = (key) => {
    const re = new RegExp(`^${key}:\\s*\"[^\"]+\"`);
    return lines.some(l => re.test(l));
  };
  const checksByField = {
    title: hasKey('title'),
    description: hasKey('description'),
    category: hasKey('category'),
    publishDate: hasKey('publishDate'),
    author: hasKey('author'),
    slug: hasKey('slug')
  };
  const ok = hasFM && Object.values(checksByField).every(Boolean);
  const faq = /\n##[^\n]*faq/i.test(txt);
  const seeAlso = /<see-also\b[^>]*\/>/.test(txt);
  // Stricter gate: require FAQ + seeAlso + core frontmatter
  const result = {
    success: ok && faq && seeAlso,
    slug,
    checks: { hasFrontmatter: hasFM, hasFAQ: faq, hasSeeAlso: seeAlso },
    fields: checksByField
  };
  return result;
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const p = req?.parameters || {};
    let res;
    switch (tool) {
      case 'validate_mexican_market_data':
        res = await validateMexicanMarketData(p.slug);
        break;
      case 'generate_quality_score':
        res = await generateQualityScore(p.slug);
        break;
      case 'audit_seo_compliance':
        res = await auditSeoCompliance(p.slug);
        break;
      default:
        res = { success: false, error: `Unknown tool: ${tool}` };
    }
    process.stdout.write(JSON.stringify(res));
    process.exit(res?.success === false ? 1 : 0);
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
