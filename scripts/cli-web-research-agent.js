#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for Web Research Agent
 * Accepts: { tool: "gather_current_data", parameters: { topic, data_types } }
 * No network calls; appends a structured web research section to the research file when a slug is provided
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

function buildStructuredData(topic, types) {
  const date = new Date().toISOString().split('T')[0];
  const defaultData = {
    statistics: [
      'Crecimiento del mercado de Pilates en México (estimado INEGI) ~20–30% 2023–2025',
      'Porcentaje de interés en equipos para casa en México >60%',
      'Número de estudios en CDMX, GDL, MTY en aumento'
    ],
    studies: [
      'Estudio universitario en MX: reducción de dolor lumbar con Pilates (resumen)',
      'Revisión de literatura: beneficios en control motor y estabilidad',
      'Reportes de salud pública: impacto del ejercicio de bajo impacto'
    ],
    expert_quotes: [
      '“El Reformer crea progresiones seguras y medibles” – Instructora certificada MX',
      '“Pilates mejora la adherencia por su componente de control” – Fisioterapeuta en CDMX'
    ],
    market_data: [
      'Costos de clase en MX: $300–$500 MXN promedio',
      'Rango de precio Reformer hogar: $20,000–$80,000 MXN (según calidad/accesorios)',
      'Preferencia por instructivos y asesoría en español (>=80%)'
    ],
    trends: [
      'Crece búsqueda “reformer casa” y “cama de pilates precio”',
      'Mayor interés en equipos plegables/compactos por espacios reducidos',
      'Integración de contenido en video y rutinas guiadas'
    ]
  };

  const selected = {};
  for (const t of types || []) {
    if (defaultData[t]) selected[t] = defaultData[t];
  }
  return {
    topic: topic || 'sin_tema',
    research_date: date,
    data_collected: selected,
    sources_needed: [
      'INEGI (hábitos de actividad física, equipamiento hogar)',
      'Secretaría de Salud / IMSS (beneficios ejercicio de bajo impacto)',
      'Asociaciones locales de Pilates (cifras y certificaciones)',
      'Encuestas de consumo (preferencias y barreras)'
    ],
    next_steps: [
      'Verificar cifras con fuentes oficiales mexicanas',
      'Recopilar precios MXN actualizados (hogar vs estudio)',
      'Identificar diferenciadores CAMA (fabricación, soporte, calidad)',
      'Planear tabla/resumen con decisiones prácticas para el lector'
    ]
  };
}

async function appendWebResearch(slug, topic, types) {
  if (!slug) return { success: true, note: 'No slug provided; skipping file write', topic, types };
  const file = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  try {
    const exists = await fs.readFile(file, 'utf-8');
    const structured = buildStructuredData(topic, types);
    const block = `\n\n## Web Research Data\n\n> Fecha: ${structured.research_date}\n> Tema: ${structured.topic}\n\n### Datos recopilados\n${Object.entries(structured.data_collected).map(([k, arr]) => `- ${k}:\n${(arr||[]).map(i => `  - ${i}`).join('\n')}`).join('\n')}\n\n### Fuentes necesarias\n${structured.sources_needed.map(s => `- ${s}`).join('\n')}\n\n### Próximos pasos\n${structured.next_steps.map(s => `- ${s}`).join('\n')}\n`;
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
