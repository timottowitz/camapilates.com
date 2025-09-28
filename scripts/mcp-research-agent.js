#!/usr/bin/env node

/**
 * MCP Server — Blog Research Agent
 * Mirrors the Blog Image Agent MCP structure and exposes tools to:
 * - Scaffold research files
 * - Validate research files
 * - List research status (word count + missing sections)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

const ROOT = path.resolve(__dirname, '..');
const RESEARCH_DIR = path.join(ROOT, 'blog-planning', 'research');

const server = new Server(
  {
    name: 'blog-research-agent',
    version: '1.0.0',
  },
  {
    capabilities: { tools: {} },
  }
);

// Tools manifest
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'pick_next_topic',
      description: 'Read BLOG_TODO.md and return the first pending (🔬) topic with title and slug',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'scaffold_next_topic',
      description: 'Scaffold the next pending (🔬) research file using slug/title from BLOG_TODO.md',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'scaffold_research',
      description: 'Create a research file from slug/title using the scaffold script',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Research slug (kebab-case)' },
          title: { type: 'string', description: 'Optional human title' }
        },
        required: ['slug']
      }
    },
    {
      name: 'validate_research',
      description: 'Run the research validator (optionally for selected slugs)',
      inputSchema: {
        type: 'object',
        properties: {
          slugs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of slugs to validate'
          }
        }
      }
    },
    {
      name: 'list_research_status',
      description: 'List research files with word count and missing sections summary',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'mark_todo_status',
      description: 'Update BLOG_TODO.md status icon for a topic (🔬, 📝, ✅, 🚫)',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          status: { type: 'string', enum: ['🔬', '📝', '✅', '🚫'] }
        },
        required: ['slug', 'status']
      }
    },
    {
      name: 'validate_and_mark',
      description: 'Validate a research file by slug; if it passes, mark BLOG_TODO to 📝',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string' } },
        required: ['slug']
      }
    },
    {
      name: 'suggest_keywords',
      description: 'Suggest primary + secondary keywords from clusters CSV and heuristics',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          limit: { type: 'number', default: 3 }
        }
      }
    },
    {
      name: 'suggest_references',
      description: 'Find relevant snippets in books_MD for the topic',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          slug: { type: 'string' },
          title: { type: 'string' },
          limit: { type: 'number', default: 5 }
        }
      }
    },
    {
      name: 'generate_image_queries',
      description: 'Suggest localized Unsplash queries (hero + 2 section images) from research file',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Research slug to read' },
          title: { type: 'string', description: 'Optional title override' }
        },
        required: ['slug']
      }
    },
    {
      name: 'suggest_ctas',
      description: 'Suggest PDP links and optional <shoprocket-button> placeholders from products.json',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 3 }
        }
      }
    },
    {
      name: 'outline_template',
      description: 'Return a recommended H2/H3 outline for a given category',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: [
              'Guías de compra',
              'Comparativas',
              'Ejercicios y salud',
              'Equipo y mantenimiento',
              'Estudio'
            ]
          }
        },
        required: ['category']
      }
    },
    {
      name: 'enrich_research',
      description: 'Auto-fill missing sections (keywords, outline, shortcodes, CTAs, image plan, FAQ, references) with MX context',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          category: {
            type: 'string',
            enum: ['Guías de compra', 'Comparativas', 'Ejercicios y salud', 'Equipo y mantenimiento', 'Estudio']
          },
          createIfMissing: { type: 'boolean', default: false },
          force: { type: 'boolean', default: false }
        },
        required: ['slug']
      }
    }
  ]
}));

// Handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'pick_next_topic':
        return await pickNextTopic();
      case 'scaffold_next_topic':
        return await scaffoldNextTopic();
      case 'scaffold_research':
        return await scaffoldResearch(args?.slug, args?.title);
      case 'validate_research':
        return await validateResearch(args?.slugs);
      case 'list_research_status':
        return await listResearchStatus();
      case 'mark_todo_status':
        return await markTodoStatus(args?.slug, args?.status);
      case 'validate_and_mark':
        return await validateAndMark(args?.slug);
      case 'suggest_keywords':
        return await suggestKeywords(args?.slug, args?.title, args?.limit);
      case 'suggest_references':
        return await suggestReferences(args?.query, args?.slug, args?.title, args?.limit);
      case 'generate_image_queries':
        return await generateImageQueries(args?.slug, args?.title);
      case 'suggest_ctas':
        return await suggestCTAs(args?.limit);
      case 'outline_template':
        return await outlineTemplate(args?.category);
      case 'enrich_research':
        return await enrichResearch(args?.slug, {
          title: args?.title,
          category: args?.category,
          createIfMissing: !!args?.createIfMissing,
          force: !!args?.force,
        });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
  }
});

async function scaffoldResearch(slug, title) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('slug is required');
  }
  const hasTitle = title && String(title).trim().length > 0;
  const cmd = hasTitle
    ? `deno task research:new -- --slug ${shellArg(slug)} --title ${shellStr(title)}`
    : `deno task research:new -- --slug ${shellArg(slug)}`;

  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT });
    return { content: [{ type: 'text', text: `${stdout}\n${stderr}` }] };
  } catch (error) {
    // Return stderr/stdout even on failure
    const out = [error.stdout || '', error.stderr || error.message].filter(Boolean).join('\n');
    return { content: [{ type: 'text', text: out }] };
  }
}

async function validateResearch(slugs) {
  let cmd = 'deno task research:validate';
  if (Array.isArray(slugs) && slugs.length > 0) {
    const list = slugs.join(',');
    cmd = `deno task research:validate -- --slug ${list}`;
  }
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT });
    return { content: [{ type: 'text', text: `${stdout}\n${stderr}` }] };
  } catch (error) {
    // Validation exits non-zero on errors: still return output for visibility
    const out = [error.stdout || '', error.stderr || error.message].filter(Boolean).join('\n');
    return { content: [{ type: 'text', text: out }] };
  }
}

// Local analysis mirroring scripts/validate-research.ts (lightweight)
async function listResearchStatus() {
  const files = await safeReadDir(RESEARCH_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const rows = [];
  for (const file of mdFiles) {
    const full = path.join(RESEARCH_DIR, file);
    const raw = await safeReadText(full);
    const wc = wordCount(raw);
    const warnings = [];
    const errors = [];
    if (wc < 1000) errors.push(`Word count ${wc} < 1000`);
    if (!hasHeading(raw, /^##\s+Keywords|^##\s+Palabras clave/im)) warnings.push('Missing Keywords section');
    if (!hasHeading(raw, /^##\s+(Estructura|Structure)/im)) warnings.push('Missing Structure/Estructura section');
    if (!hasHeading(raw, /^##\s+(Shortcodes|Plan de shortcodes|Plan de shortcodes)/im)) warnings.push('Missing Shortcodes plan');
    if (!hasHeading(raw, /^##\s+FAQ/im)) warnings.push('Missing FAQ plan');
    if (!hasHeading(raw, /^##\s+(CTAs|Enlaces|Interlink)/im)) warnings.push('Missing CTAs/Enlaces plan');
    if (!hasHeading(raw, /^##\s+(Imagen|Imagenes|Image plan)/im)) warnings.push('Missing Image plan');
    if (!/\/product\//.test(raw) && !/\[\/products\]/.test(raw)) warnings.push('No PDP/hub link mentioned');
    if (!/books_md\b|Herman|Pilates|Lea|Wells/i.test(raw)) warnings.push('No books_md references found (Herman/Pilates/Lea/Wells)');

    rows.push({
      slug: file.replace(/\.md$/, ''),
      wc,
      ok: errors.length === 0,
      errors,
      warnings,
    });
  }

  const summary = rows.map((r) => {
    const status = r.ok ? '✅' : '❌';
    const issues = r.errors.length + r.warnings.length;
    return `${status} ${r.slug} — ${r.wc} words (${issues} issues)`;
  }).join('\n');

  return {
    content: [{
      type: 'text',
      text: `Research status (blog-planning/research):\n\n${summary}\n\nTotal: ${rows.length} files; Passing: ${rows.filter(r => r.ok).length}`
    }]
  };
}

// BLOG_TODO parsing for next topic selection
async function pickNextTopic() {
  const todoPath = path.join(ROOT, 'blog-planning', 'BLOG_TODO.md');
  const raw = await safeReadText(todoPath);
  if (!raw) return { content: [{ type: 'text', text: 'No BLOG_TODO.md content found' }] };

  const lines = raw.split(/\r?\n/);
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^###\s+🔬\s+(.*)$/);
    if (m) {
      const title = m[1].trim();
      // Look ahead up to 6 lines to find Research File link with slug
      let slug = '';
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const rf = lines[j].match(/\*\*Research File:\*\*\s*\[[^\]]+\]\(\.\/research\/(.+?)\.md\)/i);
        if (rf) { slug = rf[1].trim(); break; }
      }
      if (slug) entries.push({ title, slug, status: '🔬' });
    }
  }

  if (!entries.length) {
    return { content: [{ type: 'text', text: 'No pending (🔬) topics found.' }] };
  }

  const next = entries[0];
  const out = JSON.stringify(next, null, 2);
  return { content: [{ type: 'text', text: `Next topic:\n${out}` }] };
}

async function scaffoldNextTopic() {
  const res = await pickNextTopic();
  const txt = (res.content?.[0]?.text || '').toString();
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return { content: [{ type: 'text', text: 'Could not parse next topic from BLOG_TODO.md' }] };
  let obj;
  try { obj = JSON.parse(m[0]); } catch { return { content: [{ type: 'text', text: 'Failed to parse next topic JSON' }] }; }
  const { slug, title } = obj;
  if (!slug) return { content: [{ type: 'text', text: 'Next topic does not include a slug' }] };
  // Call scaffold
  const result = await scaffoldResearch(slug, title);
  return result;
}

async function markTodoStatus(slug, status) {
  if (!slug || !status) throw new Error('slug and status are required');
  const todoPath = path.join(ROOT, 'blog-planning', 'BLOG_TODO.md');
  const raw = await safeReadText(todoPath);
  if (!raw) throw new Error('BLOG_TODO.md not found or empty');
  const lines = raw.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`\\[.*\\]\\(\\./research/${escapeReg(slug)}\\.md\\)`, 'i'))) {
      for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
        if (/^###\s+[🔬📝✅🚫]/.test(lines[j])) {
          lines[j] = lines[j].replace(/^###\s+[🔬📝✅🚫]/, `### ${status}`);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  if (!changed) return { content: [{ type: 'text', text: `No matching entry found for slug: ${slug}` }] };
  await fs.writeFile(todoPath, lines.join('\n'), 'utf-8');
  return { content: [{ type: 'text', text: `Updated status for ${slug} to ${status}` }] };
}

async function validateAndMark(slug) {
  if (!slug) throw new Error('slug is required');
  const { ok, stdout, stderr } = await runDeno(`deno task research:validate -- --slug ${slug}`);
  let msg = stdout + (stderr ? `\n${stderr}` : '');
  if (ok) {
    await markTodoStatus(slug, '📝');
    msg += `\nValidation passed. Marked ${slug} as 📝 in BLOG_TODO.md.`;
  } else {
    msg += `\nValidation failed. Not updating BLOG_TODO.md.`;
  }
  return { content: [{ type: 'text', text: msg.trim() }] };
}

async function suggestKeywords(slug, title, limit = 3) {
  const csvPath = path.join(ROOT, 'blog-planning', 'camapilates_clusters_2025-09-24.csv');
  let csv = '';
  try { csv = await fs.readFile(csvPath, 'utf-8'); } catch {}
  const tokens = buildTokens(slug, title);
  const matches = [];
  if (csv) {
    const lines = csv.split(/\r?\n/).slice(1).filter(Boolean);
    for (const line of lines) {
      const cols = splitCSV(line);
      const kw = cols[1] || '';
      const tag = (cols[6] || '').toLowerCase();
      const lc = kw.toLowerCase();
      const score = scoreMatch(lc, tokens) + (tag.includes('machine') || tag.includes('beds') ? 0.2 : 0);
      if (score > 0) matches.push({ kw, score });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  const suggestions = matches.slice(0, Math.max(0, limit - 1)).map(m => m.kw);
  const primary = heuristicPrimary(tokens) || (suggestions[0] || 'reformer pilates');
  const secondaries = heuristicSecondaries(tokens, primary, limit - 1, suggestions);
  const out = { primary, secondary: secondaries.slice(0, Math.max(0, limit - 1)) };
  return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
}

async function suggestReferences(query, slug, title, limit = 5) {
  const dir = path.join(ROOT, 'books_MD');
  const files = await safeReadDir(dir);
  const qTokens = buildTokens(slug, title, query).filter(t => t.length > 2);
  const results = [];
  for (const f of files.filter(f => f.endsWith('.md'))) {
    const full = path.join(dir, f);
    const text = await safeReadText(full);
    const paras = text.split(/\n\s*\n/);
    for (const p of paras) {
      const lc = p.toLowerCase();
      const score = scoreMatch(lc, qTokens);
      if (score > 0.4) {
        results.push({ file: f, excerpt: trimText(p, 300), score });
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }
  if (!results.length) return { content: [{ type: 'text', text: 'No references found. Try a different query.' }] };
  results.sort((a, b) => b.score - a.score);
  const out = results.slice(0, limit).map(r => `- ${r.file}: ${r.excerpt}`).join('\n');
  return { content: [{ type: 'text', text: `Suggested references:\n${out}` }] };
}

// Exec helper returning ok + output
async function runDeno(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: ROOT });
    return { ok: true, stdout, stderr };
  } catch (error) {
    const stdout = error?.stdout || '';
    const stderr = error?.stderr || error?.message || '';
    return { ok: false, stdout, stderr };
  }
}

async function generateImageQueries(slug, title) {
  // Attempt to read H2/H3 or structure section from research file
  const file = path.join(RESEARCH_DIR, `${slug}.md`);
  const raw = await safeReadText(file);
  const h2s = Array.from(raw.matchAll(/^##\s+(.+)/gm)).map(m => m[1].trim());
  const structureSec = sectionBetween(raw, /^##\s+(Estructura|Structure)/im);
  const structureItems = Array.from(structureSec.matchAll(/^\d+\)\s*(.+)$/gm)).map(m => m[1].trim());
  const baseTitle = title || (h2s[0] || slug).replace(/[#`]/g, '').trim();
  const hero = `${baseTitle} pilates reformer mexico`;
  const candidates = [...h2s, ...structureItems]
    .filter(h => !/FAQ|Resumen|CTAs|Imagen/i.test(h))
    .slice(0, 4)
    .map(h => `${h} pilates reformer casa MX`);
  const sections = (candidates.length >= 2 ? candidates.slice(0, 2) : [
    'reformer pilates en casa mexico',
    'reformer compacto departamento mexico'
  ]);
  const out = { hero, sections };
  return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
}

async function suggestCTAs(limit = 3) {
  const prodPath = path.join(ROOT, 'src', 'content', 'products.json');
  const raw = await safeReadText(prodPath);
  if (!raw) return { content: [{ type: 'text', text: 'products.json not found' }] };
  let list;
  try { list = JSON.parse(raw); } catch { list = []; }
  if (!Array.isArray(list) || list.length === 0) return { content: [{ type: 'text', text: 'No products available' }] };
  const pick = list.slice(0, limit);
  const lines = pick.map(p => {
    const slug = p.slug;
    const id = p.productId || 'prod_xxx';
    const pk = p.publishableKey || 'sr_live_pk_xxx';
    return `- /product/${slug}\n  <shoprocket-button product="${id}" pk="${pk}" />`;
  }).join('\n');
  return { content: [{ type: 'text', text: `Suggested CTAs (PDP + button):\n${lines}` }] };
}

async function outlineTemplate(category) {
  const map = {
    'Guías de compra': [
      'Resumen',
      'Criterios clave para elegir',
      'Tipos de camas de Pilates',
      'Qué considerar al comprar',
      'Recomendaciones CAMA Pilates',
      'FAQ'
    ],
    'Comparativas': [
      'Resumen',
      'Tabla comparativa (características clave)',
      'Ventajas y desventajas',
      '¿Para quién es cada opción?',
      'Recomendaciones CAMA Pilates',
      'FAQ'
    ],
    'Ejercicios y salud': [
      'Resumen',
      'Beneficios y precauciones',
      'Rutina propuesta (ejercicios)',
      'Progresiones y adaptaciones',
      'Cuándo consultar a un profesional',
      'FAQ'
    ],
    'Equipo y mantenimiento': [
      'Resumen',
      'Checklist de mantenimiento',
      'Limpieza y cuidados',
      'Repuestos y ajustes',
      'Cuándo dar servicio',
      'FAQ'
    ],
    'Estudio': [
      'Resumen',
      'Diseño del espacio',
      'Flujo de cliente y operación',
      'Equipo recomendado',
      'Costos y retorno',
      'FAQ'
    ],
  };
  const h2s = map[category] || map['Guías de compra'];
  const outline = h2s.map((h) => `## ${h}`).join('\n');
  return { content: [{ type: 'text', text: outline }] };
}

async function enrichResearch(slug, opts = {}) {
  if (!slug) throw new Error('slug is required');
  const file = path.join(RESEARCH_DIR, `${slug}.md`);
  let md = await safeReadText(file);
  if (!md) {
    if (opts.createIfMissing) {
      await scaffoldResearch(slug, opts.title || slug);
      md = await safeReadText(file);
    } else {
      return { content: [{ type: 'text', text: `Research file not found: ${file}` }] };
    }
  }

  const baseTitle = opts.title || slug.replace(/-/g, ' ');

  // Keywords
  let keywordsBlock = '';
  try {
    const kwRes = await suggestKeywords(slug, baseTitle, 3);
    const txt = kwRes?.content?.[0]?.text || '';
    const parsed = JSON.parse(txt);
    const primary = parsed.primary;
    const secondary = (parsed.secondary || []).join(', ');
    keywordsBlock = `## Keywords\n- Primary: ${primary}\n- Secondary: ${secondary}\n`;
  } catch {
    keywordsBlock = `## Keywords\n- Primary: reformer pilates\n- Secondary: reformer para casa, reformer profesional\n`;
  }
  md = upsertSection(md, /^(##\s+Keywords|##\s+Palabras clave)/im, '## Keywords', keywordsBlock, opts.force);

  // Structure outline
  const outlineMap = {
    'Guías de compra': [
      'Resumen',
      'Criterios clave para elegir',
      'Tipos de camas de Pilates',
      'Qué considerar al comprar',
      'Recomendaciones CAMA Pilates',
      'FAQ'
    ],
    'Comparativas': [
      'Resumen',
      'Tabla comparativa (características clave)',
      'Ventajas y desventajas',
      '¿Para quién es cada opción?',
      'Recomendaciones CAMA Pilates',
      'FAQ'
    ],
    'Ejercicios y salud': [
      'Resumen',
      'Beneficios y precauciones',
      'Rutina propuesta (ejercicios)',
      'Progresiones y adaptaciones',
      'Cuándo consultar a un profesional',
      'FAQ'
    ],
    'Equipo y mantenimiento': [
      'Resumen',
      'Checklist de mantenimiento',
      'Limpieza y cuidados',
      'Repuestos y ajustes',
      'Cuándo dar servicio',
      'FAQ'
    ],
    'Estudio': [
      'Resumen',
      'Diseño del espacio',
      'Flujo de cliente y operación',
      'Equipo recomendado',
      'Costos y retorno',
      'FAQ'
    ],
  };
  const cat = outlineMap[opts.category] ? opts.category : 'Guías de compra';
  const items = outlineMap[cat];
  const estructura = `## Estructura\n${items.map((h, i) => `${i + 1}) ${h}`).join('\n')}\n`;
  md = upsertSection(md, /^##\s+(Estructura|Structure)/im, '## Estructura', estructura, opts.force);

  // Shortcodes plan
  const shortcodes = `## Plan de shortcodes\n- <see-also limit="3" /> después de "Resumen" y al final\n- <hub-list category="${cat}" limit="5" title="Más guías relacionadas" /> antes de FAQ\n- <shoprocket-button product="prod_xxx" pk="sr_live_pk_xxx" /> en la sección de CTAs\n`;
  md = upsertSection(md, /^##\s+(Shortcodes|Plan de shortcodes)/im, '## Plan de shortcodes', shortcodes, opts.force);

  // CTAs / Enlaces internos (use real products)
  const prodRaw = await safeReadText(path.join(ROOT, 'src', 'content', 'products.json'));
  let ctas = '## CTAs / Enlaces internos\n';
  try {
    const products = JSON.parse(prodRaw);
    const picks = Array.isArray(products) ? products.slice(0, 2) : [];
    for (const p of picks) {
      ctas += `- /product/${p.slug}\n  <shoprocket-button product="${p.productId || 'prod_xxx'}" pk="${p.publishableKey || 'sr_live_pk_xxx'}" />\n`;
    }
  } catch {
    ctas += `- /products (hub)\n`;
  }
  ctas += `\n- Considera enlace a /certificacion-pilates para funnel de instructores.\n`;
  md = upsertSection(md, /^##\s+(CTAs|Enlaces|Enlaces internos|Interlink)/im, '## CTAs / Enlaces internos', ctas, opts.force);

  // Imagen plan
  const imgQueries = await generateImageQueries(slug, baseTitle);
  const imgTxt = imgQueries?.content?.[0]?.text || '';
  let imgObj; try { imgObj = JSON.parse(imgTxt); } catch { imgObj = { hero: `${baseTitle} pilates reformer mexico`, sections: ['reformer en casa mexico', 'reformer compacto departamento mexico'] }; }
  const imagenes = `## Imagenes (hero + 2 secciones)\n- Hero: ${imgObj.hero}\n- ${imgObj.sections[0]}\n- ${imgObj.sections[1]}\n`;
  md = upsertSection(md, /^##\s+(Imagen|Imagenes|Image plan)/im, '## Imagenes (hero + 2 secciones)', imagenes, opts.force);

  // Referencias
  const refs = `## Referencias (books_md / expertos)\n- Herman (2019) — Pilates Reformer (Paidotribo)\n- Joseph Pilates (2011) — Return to Life\n- Wells (2018) — Foundation Course\n- Lea (2012) — Essential Training for the Athlete\n`;
  md = upsertSection(md, /^##\s+Referencias/im, '## Referencias (books_md / expertos)', refs, opts.force);

  // FAQ (5+)
  const faq = `## FAQ\n### ¿Cuál es el espacio mínimo recomendado en casa (CDMX/MTY/GDL)?\nEn departamentos pequeños, deja 60–80 cm libres alrededor del Reformer para seguridad y recorrido.\n\n### ¿Cuánto cuesta un Reformer en México (MXN)?\nRangos orientativos: hogar desde MXN $35k–$90k; profesional desde MXN $90k–$200k+ según configuración.\n\n### ¿Qué mantenimiento requiere y cada cuánto?\nLimpieza semanal, revisión de resortes/traveler cada 3–6 meses; servicio anual si es de estudio.\n\n### ¿Hay garantía y repuestos en México?\nSí: garantía de 3 años en estructura y refacciones con entrega exprés; soporte en todo México.\n\n### ¿Cuál es la diferencia entre modelo Casa y Profesional?\nEstructura, capacidad de uso intensivo, accesorios y servicio; ver /product/reformer-casa y /product/reformer-profesional.\n`;
  md = upsertSection(md, /^##\s+FAQ/im, '## FAQ', faq, opts.force);

  // Add MX context sections to boost depth
  const mxContext = `## Contexto México y criterios de decisión\nAl elegir tu Reformer en México, considera logística (envío a CDMX, Guadalajara y Monterrey), posventa (garantía y refacciones en MXN), y tiempos de entrega. Para hogar, prioriza silencio, tamaño y facilidad de uso; para estudio, piensa en durabilidad, repuestos y servicio técnico. La relación calidad-precio debe evaluarse en MXN, contemplando impuestos (IVA) y costo total de propiedad.\n`;
  md = upsertSection(md, /^##\s+Contexto México y criterios de decisión/im, '## Contexto México y criterios de decisión', mxContext, opts.force);

  const tech = `## Consideraciones técnicas y de espacio\nDimensiones del carro, altura del riel y recorrido influyen en la sensación y en el ruido percibido. En espacios pequeños, opta por equipos compactos y protectores de piso; el anclaje de accesorios debe revisarse periódicamente. Si vas a entrenar de noche, prioriza un Reformer silencioso y movimientos controlados; una alfombra densa reduce vibraciones.\n`;
  md = upsertSection(md, /^##\s+Consideraciones técnicas y de espacio/im, '## Consideraciones técnicas y de espacio', tech, opts.force);

  await fs.writeFile(file, md, 'utf-8');
  const wc = wordCount(md);
  return { content: [{ type: 'text', text: `Enriched ${slug}.md — word count: ${wc}. Sections ensured: Keywords, Estructura, Shortcodes, CTAs, Imagenes, Referencias, FAQ, MX context.` }] };
}



// Helpers
function wordCount(md) {
  const cleaned = String(md || '').replace(/```[\s\S]*?```/g, '');
  return cleaned.split(/\s+/).filter(Boolean).length;
}
function hasHeading(md, rx) { return rx.test(md || ''); }

async function safeReadDir(dir) {
  try {
    return await fs.readdir(dir);
  } catch (e) {
    throw new Error(`Unable to read directory: ${dir} — ${e.message}`);
  }
}
async function safeReadText(file) {
  try {
    return await fs.readFile(file, 'utf-8');
  } catch (e) {
    return '';
  }
}

// Lightweight section extractor (regex based)
function sectionBetween(md, rx) {
  const m = String(md || '').match(rx);
  if (!m) return '';
  const start = (m.index || 0) + m[0].length;
  const rest = md.slice(start);
  const n = rest.search(/^##\s+/m);
  return n === -1 ? rest : rest.slice(0, n);
}

function escapeReg(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function trimText(s, max) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}
function buildTokens(slug, title, query) {
  const src = [slug || '', title || '', query || ''].join(' ').toLowerCase();
  return Array.from(new Set(src.split(/[^a-záéíóúñü0-9]+/i).filter(Boolean)));
}
function scoreMatch(text, tokens) {
  let s = 0;
  for (const t of tokens) if (t && text.includes(t)) s += 1;
  return s / Math.max(1, tokens.length);
}
function splitCSV(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; cur += c; continue; }
    if (c === ',' && !inQ) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}
function heuristicPrimary(tokens) {
  const t = tokens.join(' ');
  if (/espacios|pequeñ|compact/.test(t)) return 'reformer pequeño';
  if (/guia|guía|completa/.test(t)) return 'reformer pilates';
  if (/precio|costo/.test(t)) return 'precio reformer pilates';
  if (/mantenimiento|cuidado/.test(t)) return 'mantenimiento reformer';
  if (/profesional/.test(t)) return 'reformer profesional';
  if (/casa/.test(t)) return 'reformer para casa';
  return '';
}
function heuristicSecondaries(tokens, primary, want, csvSugs) {
  const base = [];
  const t = tokens.join(' ');
  if (/espacios|pequeñ|compact/.test(t)) base.push('reformer compacto', 'reformer silencioso');
  if (/guia|guía|completa/.test(t)) base.push('uso del reformer', 'beneficios del reformer');
  if (/precio|costo/.test(t)) base.push('reformer precio mexico', 'cama de pilates precio');
  if (/mantenimiento|cuidado/.test(t)) base.push('limpieza reformer', 'cambio de resortes');
  if (/profesional/.test(t)) base.push('reformer estudio', 'reformer comercial');
  if (/casa/.test(t)) base.push('reformer hogar', 'mejor reformer casa');
  const uniq = Array.from(new Set([...base, ...(csvSugs || [])])).filter(k => k !== primary);
  return uniq.slice(0, want);
}
function shellArg(s) {
  return String(s).replace(/[^a-z0-9\-_,]/gi, '');
}
function shellStr(s) {
  // wrap in double quotes and escape inner quotes
  const escaped = String(s).replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// Error handling
server.onerror = (error) => console.error('[MCP Error]', error);

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Blog Research Agent MCP server running on stdio');
}

main().catch(console.error);
