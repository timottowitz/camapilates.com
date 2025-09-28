#!/usr/bin/env node

/**
 * Blog Writer Agent (simple stdio tool)
 * - Reads a JSON command from stdin: { tool: "write_blog_from_research", parameters: { slug } }
 * - Loads blog-planning/BLOG_TODO.md and blog-planning/research/<slug>.md
 * - Generates a Markdown blog post at src/content/blog/<slug>.md following frontmatter/template rules
 * - Returns a JSON result to stdout
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

function toTitleFromSlug(slug) {
  return slug
    .split('-')
    .map(w => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function loadTodo() {
  const p = path.join(ROOT, 'blog-planning', 'BLOG_TODO.md');
  const txt = await fs.readFile(p, 'utf-8');
  return txt;
}

function findCategoryAndKeywords(todoMd, slug) {
  const rel = `./research/${slug}.md`;
  const lines = todoMd.split('\n');
  let lineIndex = lines.findIndex(l => l.includes(rel));
  if (lineIndex === -1) {
    // Try match by slug inside a link
    lineIndex = lines.findIndex(l => l.includes(slug));
  }

  let category = 'General';
  let keywords = [];

  if (lineIndex !== -1) {
    // Search upwards for the nearest category heading
    for (let i = lineIndex; i >= 0; i--) {
      const m = lines[i].match(/^##\s+CATEGOR[IÍ]A:\s*(.+)$/);
      if (m) { category = m[1].trim(); break; }
    }
    // Search forward a few lines for Keywords
    for (let j = lineIndex; j < Math.min(lines.length, lineIndex + 10); j++) {
      const km = lines[j].match(/^\*\*Keywords:\*\*\s*(.+)$/i);
      if (km) {
        keywords = km[1]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        break;
      }
    }
  }

  return { category, keywords };
}

async function extractTitleFromResearch(slug) {
  const p = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  try {
    const txt = await fs.readFile(p, 'utf-8');
    const m = txt.match(/^#\s*RESEARCH:\s*(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  return toTitleFromSlug(slug);
}

function buildFrontmatter({ title, description, category, tags, slug, date }) {
  const fm = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `category: "${category}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    `publishDate: "${date}"`,
    `author: "CAMA Pilates"`,
    `slug: "${slug}"`,
    'featured: false',
    '---',
    ''
  ].join('\n');
  return fm;
}

function buildBody({ title, category }) {
  // Simple, compliant scaffold. Content can be enriched later by other agents.
  const parts = [];
  parts.push(`# ${title}`);
  parts.push('');
  parts.push('> Nota: Contenido informativo; no es asesoramiento médico.');
  parts.push('');
  parts.push('## Resumen');
  parts.push('Introducción breve al tema con enfoque mexicano, beneficios principales y a quién le sirve.');
  parts.push('');
  parts.push('## Claves prácticas');
  parts.push('- Punto clave 1 con contexto mexicano');
  parts.push('- Punto clave 2 con recomendación accionable');
  parts.push('- Punto clave 3 con referencia a seguridad');
  parts.push('');
  parts.push('## Desarrollo del tema');
  parts.push('### Contexto en México');
  parts.push('Situación local, disponibilidad, costos en MXN, ciudades relevantes (CDMX, GDL, MTY).');
  parts.push('');
  parts.push('### Ejemplos y progresiones');
  parts.push('Secuencias, progresiones y variaciones, con notas de seguridad.');
  parts.push('');
  parts.push('<see-also limit="3" />');
  parts.push('');
  parts.push('## Recomendaciones CAMA Pilates');
  parts.push('CAMA Pilates ofrece calidad premium con ingeniería alemana y manufactura mexicana. Asesoría en español, envío nacional y garantía.');
  parts.push('');
  parts.push(`<hub-list category="${category}" limit="5" title="Más contenidos relacionados" />`);
  parts.push('');
  parts.push('## FAQ');
  parts.push('### ¿Cuál es el primer paso recomendado?');
  parts.push('Empieza con una evaluación básica y progresiones seguras; prioriza la técnica.');
  parts.push('');
  parts.push('### ¿Cómo adapto esto a espacios pequeños?');
  parts.push('Usa accesorios compactos, gestiona el espacio del hogar y ajusta rangos de movimiento.');
  parts.push('');
  return parts.join('\n');
}

async function writeBlogFromResearch(slugParam) {
  if (!slugParam || typeof slugParam !== 'string') {
    throw new Error('Missing or invalid slug parameter');
  }
  const slug = slugParam.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const outDir = path.join(ROOT, 'src', 'content', 'blog');
  const outFile = path.join(outDir, `${slug}.md`);
  await ensureDir(outDir);

  // Gather metadata
  const [todoMd, titleFromResearch] = await Promise.all([
    loadTodo(),
    extractTitleFromResearch(slug)
  ]);
  const { category, keywords } = findCategoryAndKeywords(todoMd, slug);

  // Basic description from title
  const description = `Guía práctica sobre ${titleFromResearch.toLowerCase()} con enfoque en México: consejos y pasos accionables.`.slice(0, 155);
  const date = todayISO();
  const tags = keywords.length ? keywords : [slug.split('-')[0] || 'pilates'];

  // Build content
  const frontmatter = buildFrontmatter({
    title: titleFromResearch,
    description,
    category,
    tags,
    slug,
    date
  });
  const body = buildBody({ title: titleFromResearch, category });
  const content = `${frontmatter}\n${body}\n`;

  // If file exists, do not overwrite silently — return info
  if (await fileExists(outFile)) {
    return { 
      success: true,
      message: 'Blog post already exists; no changes made',
      slug,
      path: outFile,
      existed: true
    };
  }

  await fs.writeFile(outFile, content, 'utf-8');
  return {
    success: true,
    message: 'Blog post created from research metadata',
    slug,
    path: outFile,
    existed: false
  };
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const params = req?.parameters || req?.params || {};

    if (tool === 'write_blog_from_research') {
      const result = await writeBlogFromResearch(params.slug);
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
      return;
    }

    // Unknown/unsupported tool
    process.stdout.write(JSON.stringify({
      success: false,
      error: `Unsupported tool: ${tool}`
    }));
    process.exit(1);
  } catch (err) {
    const msg = err?.message || String(err);
    process.stderr.write(`Error: ${msg}\n`);
    try {
      process.stdout.write(JSON.stringify({ success: false, error: msg }));
    } catch {}
    process.exit(1);
  }
}

// Run when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

