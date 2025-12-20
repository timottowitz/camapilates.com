import { v } from 'convex/values';
import { action, internalAction, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createPerplexity } from '@ai-sdk/perplexity';

type Suggestion = {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  source?: string;
};

function toSlug(t: string) {
  return t
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function guessCategory(title: string): string {
  const lc = title.toLowerCase();
  if (/vs|contra|comparativa/.test(lc)) return 'Comparativas';
  if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra';
  if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento';
  if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud';
  return 'Estudio';
}

function normalizeCategory(input: string): string {
  const catRaw = String(input || '').trim();
  return ['Guías de compra', 'Comparativas', 'Ejercicios y salud', 'Equipo y mantenimiento', 'Estudio'].includes(
    catRaw
  )
    ? catRaw
    : 'Estudio';
}

async function decryptSettingValue(b64: string): Promise<any | null> {
  try {
    const keyStr = process.env.CONFIG_ENC_KEY || '';
    if (!keyStr) return null;
    const bin = Uint8Array.from(Buffer.from(b64, 'base64'));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
    const enc = new TextEncoder().encode(keyStr);
    // @ts-ignore
    const hash = await crypto.subtle.digest('SHA-256', enc);
    // @ts-ignore
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    // @ts-ignore
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
  } catch {
    return null;
  }
}

async function getProviderKey(ctx: any, provider: string): Promise<string | null> {
  const row = (await ctx.runQuery(internal.appSettings.getApiKey, {
    key: `provider_key_${provider}`,
  })) as string | null;
  if (!row) return null;

  const decoded = await decryptSettingValue(row);
  if (decoded && typeof decoded.key === 'string' && decoded.key.trim()) return decoded.key.trim();

  // Backward compatibility: allow raw strings stored in `valueEnc`.
  if (typeof row === 'string' && row.trim()) return row.trim();

  return null;
}

export const upsertSuggestionsInReviewInternal = internalMutation({
  args: {
    suggestions: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        category: v.string(),
        keywords: v.array(v.string()),
        source: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ts = Date.now();
    for (const s of args.suggestions) {
      const existing = await ctx.db
        .query('blog_suggestions')
        .withIndex('by_slug', (q) => q.eq('slug', s.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          title: s.title,
          category: s.category,
          keywords: s.keywords,
          source: s.source,
          status: 'in_review',
        });
      } else {
        await ctx.db.insert('blog_suggestions', {
          ...s,
          status: 'in_review',
          createdAt: ts,
        });
      }
    }
  },
});

export const discoverTopicsDeep = action({
  args: {
    token: v.string(),
    prompt: v.string(),
    limit: v.optional(v.number()),
    provider: v.optional(v.string()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, { token, prompt, limit, provider }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { suggestions: [] as Suggestion[], error: 'Not authenticated' };

    const prov = (provider || 'openai').toLowerCase();
    const maxItems = Math.min(30, Math.max(3, Number(limit || 10)));

    const system = [
      'Eres el Investigador Senior de CAMA Pilates.',
      'Genera temas con enfoque mexicano (México), alta intención de búsqueda y potencial viral.',
      'Devuelve JSON estricto con forma: { "items": [ { "title": "...", "category": "...", "keywords": ["..."] } ] }',
      'category debe ser una de: Guías de compra | Comparativas | Ejercicios y salud | Equipo y mantenimiento | Estudio',
      `Máximo items: ${maxItems}`,
    ].join(' ');

    const user = prompt.trim();

    let items: Array<{ title: string; category?: string; keywords?: string[] }> = [];

    if (prov === 'openai') {
      const OPENAI_API_KEY =
        (await getProviderKey(ctx, 'openai')) || process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
      if (!OPENAI_API_KEY) return { suggestions: [], error: 'missing_openai_key' };
      const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
      const res = await generateText({
        model: openai(modelName),
        system,
        prompt: user,
        temperature: 0.7,
      });
      try {
        const json: any = JSON.parse(res.text || '{}');
        items = Array.isArray(json?.items) ? json.items : [];
      } catch {
        items = [];
      }
    } else if (prov === 'perplexity') {
      const PPLX_KEY = await getProviderKey(ctx, 'perplexity');
      if (!PPLX_KEY) return { suggestions: [], error: 'missing_perplexity_key' };
      const modelName = process.env.PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online';
      const perplexity = createPerplexity({ apiKey: PPLX_KEY });
      const res = await generateText({
        model: perplexity(modelName),
        system,
        prompt: user,
        temperature: 0.7,
      });
      try {
        const json: any = JSON.parse(res.text || '{}');
        items = Array.isArray(json?.items) ? json.items : [];
      } catch {
        items = [];
      }
    } else if (prov === 'gemini') {
      const GEM_KEY = await getProviderKey(ctx, 'gemini');
      if (!GEM_KEY) return { suggestions: [], error: 'missing_gemini_key' };
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const gemini = createGoogleGenerativeAI({ apiKey: GEM_KEY });
      const res = await generateText({
        model: gemini(modelName),
        system,
        prompt: user,
        temperature: 0.7,
      });
      try {
        const json: any = JSON.parse(res.text || '{}');
        items = Array.isArray(json?.items) ? json.items : [];
      } catch {
        items = [];
      }
    } else {
      return { suggestions: [], error: 'unsupported_provider' };
    }

    const suggestions: Suggestion[] = [];
    for (const it of items.slice(0, maxItems)) {
      const titleRaw = String(it?.title || '').trim();
      if (!titleRaw) continue;
      const title = /mexico|méxico/i.test(titleRaw) ? titleRaw : `${titleRaw} (México)`;
      const slug = toSlug(title).slice(0, 80);
      const category = normalizeCategory(it?.category || guessCategory(title));
      const keywords = Array.isArray(it?.keywords)
        ? it.keywords.map((k) => String(k)).filter(Boolean).slice(0, 5)
        : (title.toLowerCase().match(/[a-záéíóúñü]{3,}/g) || []).slice(0, 5);
      suggestions.push({ slug, title, category, keywords, source: prov });
    }

    await ctx.runMutation(internal.llm.upsertSuggestionsInReviewInternal, { suggestions });
    return { suggestions };
  },
});

// GitHub helpers (minimal)
async function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CAMA-Pilates-Convex',
  } as Record<string, string>;
}

function repoInfo() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
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
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
    sha,
  };
  const resp = await fetch(url, {
    method: 'PUT',
    headers: { ...(await ghHeaders()), 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${resp.status} ${await resp.text()}`);
}

export const scaffoldOne = internalAction({
  args: {
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    keywords: v.array(v.string()),
    brief: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, { slug, title, category, keywords, brief, source }) => {
    await ctx.runMutation(internal.llm.upsertSuggestionsInReviewInternal, {
      suggestions: [
        {
          slug,
          title,
          category,
          keywords,
          source: source || 'openai',
        },
      ],
    });

    const researchPath = `blog-planning/research/${slug}.md`;
    const exists = await ghGet(researchPath);
    let content = exists?.content || '';

    if (!content) {
      content = [
        `# RESEARCH: ${title}`,
        '',
        '**Status**: 📝 Drafted via Deep Discovery',
        '**Priority**: High',
        '',
        '## Palabras clave y SEO',
        `- Primaria: ${keywords[0] || title.split(' ').slice(0, 2).join(' ')}`,
        `- Secundarias: ${keywords.join(', ')}`,
        '',
      ].join('\n');
    }

    if (brief) {
      const sectionTitle = '## Deep Research Brief';
      if (content.includes(sectionTitle)) {
        const idx = content.indexOf(sectionTitle);
        const rest = content.slice(idx + sectionTitle.length);
        const nextIdxRel = rest.search(/^##\s+/m);
        const endIdx = nextIdxRel >= 0 ? idx + sectionTitle.length + nextIdxRel : content.length;
        content =
          content.slice(0, idx) +
          `${sectionTitle}\n\n${brief}\n\n*Generated: ${new Date().toISOString().split('T')[0]}*\n\n` +
          content.slice(endIdx);
      } else {
        content += `\n${sectionTitle}\n\n${brief}\n\n*Generated: ${new Date().toISOString().split('T')[0]}*\n`;
      }
    }

    await ghPut(
      researchPath,
      content,
      exists ? `chore(research): update deep brief ${slug}` : `chore(research): scaffold deep brief ${slug}`,
      exists?.sha
    );

    return { ok: true };
  },
});

function extractTextFromResponses(resp: any): string {
  const candidates = [resp?.output_text, resp?.content?.[0]?.text, resp?.output?.[0]?.content?.[0]?.text];
  for (const t of candidates) if (typeof t === 'string' && t.trim()) return t;
  return '';
}

export const batchDiscoverAndScaffold = action({
  args: {
    token: v.string(),
    prompt: v.string(),
    limit: v.optional(v.number()),
    provider: v.optional(v.string()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, { token, prompt, limit }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { created: 0, error: 'Not authenticated' };

    const OPENAI_API_KEY =
      (await getProviderKey(ctx, 'openai')) || process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!OPENAI_API_KEY) return { created: 0, error: 'missing_openai_key' };

    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const maxItems = Math.min(50, Math.max(5, Number(limit || 50)));

    const sys = [
      'Eres un investigador senior de CAMA Pilates.',
      'Crea una lista de temas con enfoque mexicano (50 máximo) con título, categoría (Guías de compra | Comparativas | Ejercicios y salud | Equipo y mantenimiento | Estudio), keywords (3-5), y un brief en Markdown (3-6 párrafos) con estructura inicial del artículo.',
      'Devuelve JSON: { "items": [ { "title": "...", "category": "...", "keywords": ["..."], "brief_markdown": "..." } ] }',
    ].join(' ');

    const user = [
      'Prompt del usuario:',
      prompt.trim(),
      '',
      `Cantidad máxima: ${maxItems}`,
    ].join('\n');

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
    if (!resp.ok) return { created: 0, error: `openai_error:${resp.status}` };

    const data = await resp.json();
    const text = extractTextFromResponses(data);
    let json: any = {};
    try {
      json = JSON.parse(text || '{}');
    } catch {
      json = {};
    }
    const items = Array.isArray(json?.items) ? json.items : [];

    let created = 0;
    for (const it of items.slice(0, maxItems)) {
      const titleRaw: string = String(it?.title || '').trim();
      if (!titleRaw) continue;
      const title = /mexico|méxico/i.test(titleRaw) ? titleRaw : `${titleRaw} (México)`;
      const category = normalizeCategory(it?.category || 'Estudio');
      const slug = toSlug(title).slice(0, 80);
      const keywords: string[] = Array.isArray(it?.keywords)
        ? it.keywords.map((s: any) => String(s)).filter(Boolean).slice(0, 5)
        : [];
      const brief: string = String(it?.brief_markdown || '').trim();

      await ctx.scheduler.runAfter(0, internal.llm.scaffoldOne, {
        slug,
        title,
        category,
        keywords,
        brief,
        source: 'openai',
      });
      created++;
    }

    return { created };
  },
});

