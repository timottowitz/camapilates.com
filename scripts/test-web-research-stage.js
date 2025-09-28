#!/usr/bin/env node

/**
 * Quick test for the web research CLI wrapper.
 * Usage: node scripts/test-web-research-stage.js [slug] [topic]
 * - If slug not provided, uses a temporary slug and scaffolds a minimal research file.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RESEARCH_DIR = path.join(ROOT, 'blog-planning', 'research');

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }
async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function scaffoldResearch(slug, title) {
  await ensureDir(RESEARCH_DIR);
  const file = path.join(RESEARCH_DIR, `${slug}.md`);
  if (!(await exists(file))) {
    const md = `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n\n## Objetivo\nCrear base de investigación para ${title}.\n`;
    await fs.writeFile(file, md, 'utf-8');
  }
  return file;
}

function runCliWebResearch(payload) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(ROOT, 'scripts', 'cli-web-research-agent.js')]);
    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('close', code => {
      if (code === 0) resolve({ code, out, err }); else reject(new Error(err || `exit ${code}`));
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function main() {
  const slugArg = process.argv[2];
  const topicArg = process.argv[3];
  const slug = (slugArg || `web-research-test-${Date.now()}`).toLowerCase();
  const topic = topicArg || 'Prueba de investigación web';

  const file = await scaffoldResearch(slug, topic);

  const payload = {
    tool: 'gather_current_data',
    parameters: {
      slug,
      topic,
      data_types: ['statistics', 'studies', 'market_data']
    }
  };

  const res = await runCliWebResearch(payload);
  const txt = await fs.readFile(file, 'utf-8');
  const hasSection = /##\s+Web Research Data\b/.test(txt);
  const hasDatos = /###\s+Datos recopilados\b/.test(txt);
  const hasFecha = />\s*Fecha:\s*\d{4}-\d{2}-\d{2}/.test(txt);

  const result = {
    success: hasSection && hasDatos && hasFecha,
    slug,
    file,
    wrote_section: hasSection,
    wrote_datos: hasDatos,
    wrote_fecha: hasFecha,
    agent_output: (() => { try { return JSON.parse(res.out); } catch { return res.out; } })()
  };
  console.log(JSON.stringify(result));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

