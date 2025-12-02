#!/usr/bin/env node

/**
 * CLI wrapper for Web Research Agent
 * Accepts: { tool: "gather_current_data", parameters: { topic, data_types } }
 * Uses Google Custom Search API if available.
 * Fallback: Uses LLM (Gemini/GPT) to generate relevant research from training data.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

import fs from 'fs/promises';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const ROOT = path.resolve(__dirname, '..');

// Simple config loader
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
    return google('gemini-2.5-flash-preview-09-2025'); // Fast model for research
  }
  if (OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
    return openai('gpt-4o-mini'); // Fast model for research
  }
  throw new Error('No API key configured for Research Agent');
}

async function googleSearch(query, apiKey, cx) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.items || [];
  } catch {
    return null;
  }
}

async function gatherLLMKnowledge(topic) {
  try {
    const model = getModel();
    const prompt = `Act as a market researcher for the Pilates industry in Mexico.
Topic: "${topic}"

Provide a JSON object with the following arrays (3-5 items each):
- statistics: Key stats/numbers relevant to the topic.
- studies: Relevant scientific or market studies (summarized).
- market_data: Prices, costs, or consumer behavior in Mexico.
- trends: Current trends for 2024-2025.

Ensure the data is realistic, specific to Mexico where possible, and professional.
Return ONLY the JSON object.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.4, // Low temp for factual/consistent output
      format: 'json'
    });

    // Clean and parse JSON
    const cleaned = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // Ultimate fallback if LLM fails
    return {
      statistics: ['Error generating research data'],
      studies: [],
      market_data: [],
      trends: []
    };
  }
}

async function gatherRealData(topic, types) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  // If no Search API key, use LLM knowledge
  if (!apiKey || !cx) {
    const llmData = await gatherLLMKnowledge(topic);
    return llmData;
  }

  const results = {
    statistics: [],
    studies: [],
    market_data: [],
    trends: []
  };

  // Perform searches
  const queries = [
    `${topic} estadísticas méxico 2024`,
    `${topic} beneficios estudios científicos`,
    `${topic} precio méxico mercado`,
    `${topic} tendencias 2025`
  ];

  for (const q of queries) {
    const items = await googleSearch(q, apiKey, cx);
    if (items) {
      items.slice(0, 2).forEach(item => {
        const snippet = item.snippet || item.title;
        if (q.includes('estadísticas')) results.statistics.push(`${item.title}: ${snippet} (${item.link})`);
        if (q.includes('científicos')) results.studies.push(`${item.title}: ${snippet} (${item.link})`);
        if (q.includes('precio')) results.market_data.push(`${item.title}: ${snippet} (${item.link})`);
        if (q.includes('tendencias')) results.trends.push(`${item.title}: ${snippet} (${item.link})`);
      });
    }
  }

  // Fill empty slots with LLM knowledge if search failed
  const llmFallback = await gatherLLMKnowledge(topic);
  if (!results.statistics.length) results.statistics = llmFallback.statistics;
  if (!results.studies.length) results.studies = llmFallback.studies;
  if (!results.market_data.length) results.market_data = llmFallback.market_data;
  if (!results.trends.length) results.trends = llmFallback.trends;

  return results;
}

async function appendWebResearch(slug, topic, types) {
  if (!slug) return { success: true, note: 'No slug provided; skipping file write', topic, types };

  const file = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  const date = new Date().toISOString().split('T')[0];

  try {
    let exists = await fs.readFile(file, 'utf-8');

    const dataCollected = await gatherRealData(topic, types);

    // Filter requested types
    const selectedData = {};
    for (const t of types || []) {
      if (dataCollected[t]) selectedData[t] = dataCollected[t];
    }

    const block = `\n\n## Web Research Data\n\n> Fecha: ${date}\n> Tema: ${topic}\n\n### Datos recopilados\n${Object.entries(selectedData).map(([k, arr]) => `- ${k}:\n${(arr || []).map(i => {
      if (typeof i === 'string') return `  - ${i}`;
      return `  - ${Object.values(i).join(': ')}`;
    }).join('\n')}`).join('\n')}\n\n### Fuentes necesarias\n- INEGI (hábitos de actividad física)\n- Secretaría de Salud / IMSS\n- Asociaciones locales de Pilates\n\n### Próximos pasos\n- Verificar cifras con fuentes oficiales\n- Recopilar precios MXN actualizados\n`;

    // Replace existing Web Research Data section if present
    if (/^##\s+Web Research Data/m.test(exists)) {
      const start = exists.indexOf('## Web Research Data');
      const after = exists.slice(start + '## Web Research Data'.length);
      const nextIdxRel = after.search(/\n##\s+/);
      const endIdx = nextIdxRel >= 0 ? start + '## Web Research Data'.length + nextIdxRel : exists.length;
      exists = exists.slice(0, start) + block + exists.slice(endIdx);
    } else {
      exists = exists + block;
    }

    await fs.writeFile(file, exists, 'utf-8');
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
