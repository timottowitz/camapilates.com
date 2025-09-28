#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for Web Research Agent
 * Accepts: { tool: "gather_current_data", parameters: { topic, data_types } }
 * No network calls; writes a minimal placeholder section if a research file can be inferred by slug in params
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

async function appendWebResearch(slug, topic, types) {
  if (!slug) return { success: true, note: 'No slug provided; skipping file write', topic, types };
  const file = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  try {
    const exists = await fs.readFile(file, 'utf-8');
    const block = `\n\n## Web Research (placeholder)\n- Tema: ${topic || slug}\n- Tipos: ${(types || []).join(', ')}\n- Nota: Agregar datos específicos de México (INEGI, costos MXN, ciudades).\n`;
    await fs.writeFile(file, exists + block, 'utf-8');
    return { success: true, slug, file };
  } catch {
    return { success: true, note: 'Research file not found; skipping', topic };
  }
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const p = req?.parameters || {};
    switch (tool) {
      case 'gather_current_data': {
        // Best effort: accept optional p.slug (if present from orchestrator fix); otherwise skip write
        const res = await appendWebResearch(p.slug, p.topic, p.data_types);
        process.stdout.write(JSON.stringify(res));
        process.exit(0);
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

