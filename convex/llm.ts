import { actionGeneric as action } from 'convex/server';
import { v } from 'convex/values';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createPerplexity } from '@ai-sdk/perplexity';

function toSlug(t: string) {
  return t.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
}

function guessCategory(title: string): string {
  const lc = title.toLowerCase();
  if (/vs|contra|comparativa/.test(lc)) return 'Comparativas';
  if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra';
  if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento';
  if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud';
  return 'Estudio';
}

export const discoverTopicsDeep = action({
  args: { prompt: v.string(), limit: v.optional(v.number()), provider: v.optional(v.string()) },
  handler: async (ctx, { prompt, limit, provider }) => {
    const prov = (provider || 'openai').toLowerCase();
    const maxItems = Math.min(30, Math.max(3, Number(limit || 10)));
    let items: Array<{ title: string; category?: string; keywords?: string[] }> = [];

    // Agent-style helper using Exa search + content fetch + LLM JSON synthesis
    async function agentDiscover(): Promise<Array<{ title: string; category?: string; keywords?: string[] }>> {
      const EXA_KEY = await getProviderKey(ctx, 'exa');
      let results: Array<{ title: string; url: string }> = [];
      if (EXA_KEY) {
        try {
          const resp = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: { 'authorization': `Bearer ${EXA_KEY}`, 'content-type': 'application/json' },
            body: JSON.stringify({ query: prompt, numResults: 10, type: 'neural' })
          });
          const data = await resp.json();
          if (Array.isArray(data?.results)) {
            results = data.results.map((r: any) => ({ title: String(r?.title || r?.name || '').trim(), url: String(r?.url || r?.link || '') })).filter(r => r.title && r.url);
          }
        } catch {}
      }
      // Fallback: use Perplexity (online) to propose topics directly if Exa not available
      if (!results.length) {
        const PPLX_KEY = await getProviderKey(ctx, 'perplexity');
        if (PPLX_KEY) {
          const modelName = process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';
          const perplexity = createPerplexity({ apiKey: PPLX_KEY });
          const res = await generateText({ model: perplexity(modelName), system: 'Eres un investigador… JSON items con title, category, keywords.', prompt: `${prompt}\n\nJSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }`, temperature: 0.7 });
          try {
            const j = JSON.parse(res.text || '{}');
            return Array.isArray(j?.items) ? j.items : [];
          } catch { return []; }
        }
      }
      // Fetch content for top results (basic HTML strip)
      const top = results.slice(0, 5);
      const pages: string[] = [];
      for (const r of top) {
        try {
          const p = await fetch(r.url, { headers: { 'user-agent': 'CAMA-Pilates-Convex/1.0' } });
          const html = await p.text();
          const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          pages.push(`# ${r.title}\n${text.slice(0, 4000)}`);
        } catch {}
      }
      // Synthesize topics from pages using available LLM (prefer OpenAI, else Gemini)
      const OPENAI_API_KEY = await getProviderKey(ctx, 'openai') || process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
      const GEM_KEY = await getProviderKey(ctx, 'gemini');
      const sys = 'Eres un investigador senior. A partir de los extractos proporcionados, genera JSON con items: title, category, keywords (3-5), orientado a México.';
      const promptCtx = `${prompt}\n\nExtractos:\n${pages.join('\n\n')}\n\nDevuelve JSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }\nMáximo: ${maxItems}`;
      if (OPENAI_API_KEY) {
        const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const res = await generateText({ model: openai(modelName), system: sys, prompt: promptCtx, temperature: 0.6 });
        try { const j = JSON.parse(res.text || '{}'); return Array.isArray(j?.items) ? j.items : []; } catch { return []; }
      } else if (GEM_KEY) {
        const gemini = createGoogleGenerativeAI({ apiKey: GEM_KEY });
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const res = await generateText({ model: gemini(modelName), system: sys, prompt: promptCtx, temperature: 0.6 });
        try { const j = JSON.parse(res.text || '{}'); return Array.isArray(j?.items) ? j.items : []; } catch { return []; }
      }
      return [];
    }

    if (prov === 'openai') {
      const OPENAI_API_KEY = await getProviderKey(ctx, 'openai') || process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
      if (!OPENAI_API_KEY) return { suggestions: [], error: 'missing_openai_key' };
      const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
      const sys = 'Eres un investigador senior de CAMA Pilates. Objetivo: Descubrir temas con enfoque mexicano. Devuelve JSON.';
      const user = `Prompt del usuario:\n${prompt}\n\nDevuelve JSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }\nCantidad máxima: ${maxItems}`;
      const res = await generateText({ model: openai(modelName), system: sys, prompt: user, temperature: 0.7 });
      let json: any = {};
      try { json = JSON.parse(res.text || '{}'); } catch {}
      items = Array.isArray(json?.items) ? json.items : [];
    } else if (prov === 'perplexity') {
      const PPLX_KEY = await getProviderKey(ctx, 'perplexity');
      if (!PPLX_KEY) return { suggestions: [], error: 'missing_perplexity_key' };
      const modelName = process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';
      const perplexity = createPerplexity({ apiKey: PPLX_KEY });
      const res = await generateText({ model: perplexity(modelName), system: 'Eres un investigador… JSON items con title, category, keywords.', prompt: `${prompt}\n\nJSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }`, temperature: 0.7 });
      let json: any = {};
      try { json = JSON.parse(res.text || '{}'); } catch {}
      items = Array.isArray(json?.items) ? json.items : [];
    } else if (prov === 'gemini') {
      const GEM_KEY = await getProviderKey(ctx, 'gemini');
      if (!GEM_KEY) return { suggestions: [], error: 'missing_gemini_key' };
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const gemini = createGoogleGenerativeAI({ apiKey: GEM_KEY });
      const res = await generateText({ model: gemini(modelName), system: 'Eres un investigador… Devuelve JSON.', prompt: `Prompt:\n${prompt}\n\nJSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }\nCantidad máxima: ${maxItems}` });
      let json: any = {};
      try { json = JSON.parse(res.text || '{}'); } catch {}
      items = Array.isArray(json?.items) ? json.items : [];
    } else if (prov === 'exa' || prov === 'firecrawl') {
      // Agent-style workflow for Exa/Firecrawl
      items = await agentDiscover();
    } else if (prov === 'firecrawl') {
      const FC_KEY = await getProviderKey(ctx, 'firecrawl');
      if (!FC_KEY) return { suggestions: [], error: 'missing_firecrawl_key' };
      // Firecrawl discovery stub (requires specific search endpoints); return not implemented for now
      return { suggestions: [], error: 'firecrawl_not_implemented' };
    } else {
      return { suggestions: [], error: 'unsupported_provider' };
    }

    const ts = Date.now();
    const out: Array<{ slug: string; title: string; category: string; keywords: string[]; source?: string }> = [];
    for (const it of items.slice(0, maxItems)) {
      const title: string = String(it?.title || '').trim();
      if (!title) continue;
      const category = [ 'Guías de compra','Comparativas','Ejercicios y salud','Equipo y mantenimiento','Estudio' ].includes(String(it?.category || '')) ? String(it?.category) : guessCategory(title);
      const sl = toSlug(/mexico|méxico/i.test(title) ? title : `${title} (México)`).slice(0, 80);
      const kws: string[] = Array.isArray(it?.keywords) ? it.keywords.map((s: any) => String(s)).filter(Boolean).slice(0, 5) : (title.toLowerCase().match(/[a-záéíóúñü]{3,}/g) || []).slice(0,5);
      out.push({ slug: sl, title, category, keywords: kws, source: prov });
      const existing = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', sl)).unique();
      if (existing) await ctx.db.patch(existing._id, { title, category, keywords: kws, source: prov, status: 'in_review' });
      else await ctx.db.insert('blog_suggestions', { slug: sl, title, category, keywords: kws, source: prov, status: 'in_review', createdAt: ts });
    }
    return { suggestions: out };
  }
});

// GitHub helpers (duplicated from pipeline for self-containment)
async function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CAMA-Pilates-Convex'
  } as Record<string, string>;
}
function repoInfo() {
  const repo = process.env.GITHUB_REPO; const branch = process.env.GITHUB_BRANCH || 'main';
  if (!repo) throw new Error('GITHUB_REPO not set');
  return { repo, branch };
}
async function ghGet(path: string): Promise<{ sha: string; content: string } | null> {
  const { repo, branch } = repoInfo();
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, { headers: await ghHeaders() });
  if (!resp.ok) return null;
  const j: any = await resp.json();
  const content = j.content ? Buffer.from(j.content.replace(/\n/g, ''), 'base64').toString('utf-8') : '';
  return { sha: j.sha, content };
}
async function ghPut(path: string, content: string, message: string, sha?: string) {
  const { repo, branch } = repoInfo();
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const body = { message, content: Buffer.from(content, 'utf-8').toString('base64'), branch, sha };
  const resp = await fetch(url, { method: 'PUT', headers: { ...(await ghHeaders()), 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${resp.status} ${await resp.text()}`);
}

function extractTextFromResponses(resp: any): string {
  // Try common fields from Responses API
  const candidates = [
    resp?.output_text,
    resp?.content?.[0]?.text,
    resp?.output?.[0]?.content?.[0]?.text,
  ];
  for (const t of candidates) if (typeof t === 'string' && t.trim()) return t;
  return '';
}

export const scaffoldOne = action({
  args: { slug: v.string(), title: v.string(), category: v.string(), keywords: v.array(v.string()), brief: v.optional(v.string()), source: v.optional(v.string()) },
  handler: async (ctx, { slug, title, category, keywords, brief, source }) => {
    const ts = Date.now();
    // Upsert suggestion
    const existing = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { title, category, keywords, source: source || 'openai', status: 'in_review' });
    } else {
      await ctx.db.insert('blog_suggestions', { slug, title, category, keywords, source: source || 'openai', status: 'in_review', createdAt: ts });
    }
    // Scaffold research file
    const researchPath = `blog-planning/research/${slug}.md`;
    const exists = await ghGet(researchPath);
    let content = exists?.content || '';
    if (!content) {
      content = `# RESEARCH: ${title}\n\n**Status**: 📝 Drafted via Deep Discovery\n**Priority**: High\n\n## Palabras clave y SEO\n- Primaria: ${keywords[0] || title.split(' ').slice(0,2).join(' ')}\n- Secundarias: ${keywords.join(', ')}\n\n`;
    }
    if (brief) {
      const sectionTitle = '## Deep Research Brief';
      if (content.includes(sectionTitle)) {
        const idx = content.indexOf(sectionTitle);
        const rest = content.slice(idx + sectionTitle.length);
        const nextIdxRel = rest.search(/^##\s+/m);
        const endIdx = nextIdxRel >= 0 ? idx + sectionTitle.length + nextIdxRel : content.length;
        content = content.slice(0, idx) + `${sectionTitle}\n\n${brief}\n\n*Generated: ${new Date().toISOString().split('T')[0]}*\n\n` + content.slice(endIdx);
      } else {
        content += `\n${sectionTitle}\n\n${brief}\n\n*Generated: ${new Date().toISOString().split('T')[0]}*\n`;
      }
    }
    await ghPut(researchPath, content, exists ? `chore(research): update deep brief ${slug}` : `chore(research): scaffold deep brief ${slug}`, exists?.sha);
    return { ok: true };
  }
});

export const batchDiscoverAndScaffold = action({
  args: { prompt: v.string(), limit: v.optional(v.number()), provider: v.optional(v.string()) },
  handler: async (ctx, { prompt, limit, provider }) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!OPENAI_API_KEY) return { created: 0, error: 'missing_openai_key' };
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const maxItems = Math.min(50, Math.max(5, Number(limit || 50)));

    const sys = [
      'Eres un investigador senior de CAMA Pilates.',
      'Crea una lista de temas con enfoque mexicano (50 máximo) con título, categoría (Guías de compra | Comparativas | Ejercicios y salud | Equipo y mantenimiento | Estudio), keywords (3-5), y un brief en Markdown (3-6 párrafos) con datos y estructura inicial del artículo.',
      'No incluyas publicidad; enfócate en utilidad y contexto de México.'
    ].join(' ');
    const user = [
      'Prompt del usuario:',
      prompt.trim(),
      '',
      'Devuelve JSON con la forma:',
      '{ "items": [ { "title": "...", "category": "...", "keywords": ["..."], "brief_markdown": "..." } ] }',
      `Cantidad máxima: ${maxItems}`
    ].join('\n');

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, input: [ { role: 'system', content: sys }, { role: 'user', content: user } ], response_format: { type: 'json_object' }, temperature: 0.7 })
    });
    if (!resp.ok) return { created: 0, error: `openai_error:${resp.status}` };
    const data = await resp.json();
    const text = extractTextFromResponses(data);
    let json: any = {};
    try { json = JSON.parse(text || '{}'); } catch {}
    const items = Array.isArray(json?.items) ? json.items : [];

    let created = 0;
    for (const it of items.slice(0, maxItems)) {
      const title: string = String(it?.title || '').trim();
      if (!title) continue;
      const catRaw: string = String(it?.category || 'Estudio').trim();
      const category = [ 'Guías de compra','Comparativas','Ejercicios y salud','Equipo y mantenimiento','Estudio' ].includes(catRaw) ? catRaw : 'Estudio';
      const sl = toSlug(/mexico|méxico/i.test(title) ? title : `${title} (México)`).slice(0, 80);
      const kws: string[] = Array.isArray(it?.keywords) ? it.keywords.map((s: any) => String(s)).filter(Boolean).slice(0, 5) : [];
      const brief: string = String(it?.brief_markdown || '').trim();
      // schedule per-topic scaffold to avoid timeouts
      await (ctx as any).scheduler.runAfter(0, (await import('./_generated/api')).default.llm.scaffoldOne, { slug: sl, title, category, keywords: kws, brief, source: 'openai' });
      created++;
    }
    return { created };
  }
});
