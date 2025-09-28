#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for Research Agent
 * Accepts: { tool: "scaffold_next_topic", parameters: {} }
 * Output: JSON single-shot response. No MCP server.
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

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

function parseNextPending(todo) {
  const lines = todo.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^###\s+🔬\s+(.+)$/);
    if (m) {
      const title = m[1].trim();
      // Look ahead for research file link
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const rf = lines[j].match(/\*\*Research File:\*\*\s*\[[^\]]+\]\(\.\/research\/(.+?)\.md\)/i);
        if (rf) {
          return { title, slug: rf[1].trim() };
        }
      }
    }
  }
  return null;
}

function researchTemplate(title) {
  return `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n**Priority**: High\n**Target Blog Date**: TBD\n**Estimated Research Time**: 2-4 hours\n\n## Objetivo\nReunir información mexicana y de calidad para desarrollar un artículo completo.\n\n## Palabras clave y SEO\n- Primaria: \n- Secundarias: \n- Long-tail: \n\n## Estructura sugerida\n1) Resumen e intención de búsqueda\n2) Beneficios y precauciones (MX)\n3) Desarrollo (ejercicios/criterios)\n4) Recomendaciones CAMA Pilates\n5) FAQ\n\n## Plan de shortcodes\n- <see-also limit=\"3\" /> tras la primera sección\n- <hub-list category=\"Guías de compra\" limit=\"5\" title=\"Más guías\" /> al final\n\n## Plan de imágenes\n- Hero: contexto mexicano del tema\n- 2 imágenes contextuales en secciones clave\n\n## Fuentes y referencias (añadir URL y citas)\n- \n`;
}

async function scaffoldNextTopic() {
  const todoPath = path.join(ROOT, 'blog-planning', 'BLOG_TODO.md');
  const todo = await fs.readFile(todoPath, 'utf-8');
  const next = parseNextPending(todo);
  if (!next) return { success: false, error: 'No pending (🔬) topics found' };

  const researchDir = path.join(ROOT, 'blog-planning', 'research');
  const file = path.join(researchDir, `${next.slug}.md`);
  await ensureDir(researchDir);

  const already = await exists(file);
  if (!already) {
    await fs.writeFile(file, researchTemplate(next.title), 'utf-8');
  }
  return { success: true, slug: next.slug, title: next.title, file, created: !already };
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    switch (tool) {
      case 'scaffold_next_topic': {
        const res = await scaffoldNextTopic();
        process.stdout.write(JSON.stringify(res));
        process.exit(res.success ? 0 : 1);
        return;
      }
      default:
        process.stdout.write(JSON.stringify({ success: false, error: `Unknown tool: ${tool}` }));
        process.exit(1);
    }
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

