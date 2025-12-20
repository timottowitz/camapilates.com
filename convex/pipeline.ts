import { actionGeneric as action, mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { internalAction, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { getAdminUserId } from './lib/adminAuth';

// Helpers
function toSlug(s: string) {
  return s.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
}
function titleCase(s: string) { return s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()); }
function todayISO() { return new Date().toISOString().split('T')[0]; }

function buildBlogMarkdown(meta: { title: string; description: string; category: string; tags: string[]; slug: string; publishDate?: string }) {
  const { title, description, category, tags, slug } = meta;
  const publishDate = meta.publishDate || todayISO();
  const fm = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `category: "${category}"`,
    `tags: [${tags.slice(0,3).map(t => `"${t}"`).join(', ')}]`,
    `publishDate: "${publishDate}"`,
    'author: "CAMA Pilates"',
    `slug: "${slug}"`,
    'featured: false',
    '---',
    '',
    `# ${title}`,
    '',
    '> Nota: Contenido informativo; no es asesoramiento médico.',
    '',
    '## Resumen',
    `${description}`,
    '',
    '## Criterios clave para elegir',
    '- Seguridad y progresión adecuada',
    '- Adaptación al espacio y presupuesto',
    '- Calidad del equipo y soporte',
    '',
    '## Desarrollo y puntos clave',
    '### Beneficios y contexto mexicano',
    'En México, el interés por Pilates crece por su bajo impacto y mejoras en control postural.',
    '',
    '### Ejercicios y técnica',
    'Prioriza control, respiración y alineación. Trabaja con progresiones y evita dolor agudo.',
    '',
    '<see-also limit="3" />',
    '',
    '## Recomendaciones CAMA Pilates',
    'Nuestros Reformers ofrecen calidad premium con ingeniería y manufactura local, soporte y refacciones en México.',
    '',
    '<hub-list category="Guías de compra" limit="5" title="Más guías de compra" />',
    '',
    '## FAQ',
    '### ¿Cuál es la mejor opción para casa?',
    'Depende del espacio, nivel y presupuesto; busca estabilidad, ajustes y soporte local.',
    '',
    '### ¿Vale la pena invertir en calidad?',
    'Sí: mayor durabilidad, precisión en el movimiento y mejor experiencia a largo plazo.',
    ''
  ].join('\n');
  return fm;
}

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

export const queueTopic = mutation({
  args: { token: v.string(), slug: v.string(), title: v.optional(v.string()), category: v.optional(v.string()), keywords: v.optional(v.array(v.string())) },
  handler: async (ctx, { token, slug, title, category, keywords }) => {
    const adminId = await getAdminUserId(ctx as any, token);
    if (!adminId) return { ok: false, error: 'Not authenticated' };

    const now = Date.now();
    const s = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (s) {
      await ctx.db.patch(s._id, { title: title ?? s.title, category: category ?? s.category, keywords: keywords ?? s.keywords, status: 'queued' });
      return { updated: true };
    }
    await ctx.db.insert('blog_suggestions', { slug, title: title || titleCase(slug), category: category || 'Estudio', keywords: keywords || [], source: 'admin_ui', status: 'queued', createdAt: now });
    return { created: true };
  }
});

export const pipelineRunInternal = internalAction({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const s = await ctx.runQuery(getSuggestionBySlug, { slug });
    const title = s?.title || titleCase(slug);
    const category = s?.category || 'Estudio';
    const tags = (s?.keywords && s.keywords.length ? s.keywords : title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean).slice(0,3));
    const description = `Guía práctica sobre ${title.toLowerCase()} en México: criterios, beneficios y recomendaciones.`;

    // Ensure research file
    const researchPath = `blog-planning/research/${slug}.md`;
    const research = await ghGet(researchPath);
    if (!research) {
      const scaffold = `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n**Priority**: High\n\n## Objetivo\nReunir información mexicana y de calidad para desarrollar un artículo completo sobre ${title.toLowerCase()}.\n`;
      await ghPut(researchPath, scaffold, `chore(research): scaffold ${slug}`);
    }

    // Commit blog
    const blogPath = `src/content/blog/${slug}.md`;
    const existing = await ghGet(blogPath);
    const md = buildBlogMarkdown({ title, description, category, tags, slug });
    await ghPut(blogPath, md, existing ? `feat(blog): update ${slug}` : `feat(blog): add ${slug}`, existing?.sha);

    // Update BLOG_TODO.md
    const todoPath = 'blog-planning/BLOG_TODO.md';
    try {
      const todo = await ghGet(todoPath);
      if (todo) {
        const lines = todo.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(slug) && lines[i].includes('🔬')) { lines[i] = lines[i].replace('🔬', '✅'); break; }
        }
        await ghPut(todoPath, lines.join('\n'), `chore(todo): mark ${slug} done`, todo.sha);
      }
    } catch {}

    // Mark status
    if (s) {
      await ctx.runMutation(internal.pipeline.markSuggestionStatusInternal as any, {
        suggestionId: s._id,
        status: 'completed',
      } as any);
    }
    return { success: true, slug, committed: blogPath };
  }
});

export const markSuggestionStatusInternal = internalMutation({
  args: {
    suggestionId: v.id('blog_suggestions'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.suggestionId, { status: args.status });
  }
});

export const pipelineRun = action({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { success: false, error: 'Not authenticated' };
    return await ctx.runAction(internal.pipeline.pipelineRunInternal as any, { slug } as any);
  }
});

export const pipelineRunBatch = action({
  args: { token: v.string(), slugs: v.array(v.string()) },
  handler: async (ctx, { token, slugs }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { success: false, error: 'Not authenticated' };

    const results: any[] = [];
    for (const slug of slugs) {
      try {
        results.push(await ctx.runAction(internal.pipeline.pipelineRunInternal as any, { slug } as any));
      } catch (e: any) {
        results.push({ slug, error: e?.message || String(e) });
      }
    }
    return { success: true, results };
  }
});

export const getSuggestionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
  }
});

export const processQueuedSuggestions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const queued = await ctx.db
      .query('blog_suggestions')
      .withIndex('by_status', q => q.eq('status', 'queued'))
      .take(2);
    for (const s of queued) {
      try {
        await ctx.scheduler.runAfter(0, internal.pipeline.pipelineRunInternal as any, { slug: s.slug } as any);
      } catch (e) {
        // noop — will retry next schedule
      }
    }
  }
});

export const contentStatus = action({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { success: false, error: 'Not authenticated' };

    const researchPath = `blog-planning/research/${slug}.md`;
    const blogPath = `src/content/blog/${slug}.md`;
    const r = await ghGet(researchPath);
    const b = await ghGet(blogPath);
    return { success: true, slug, researchExists: Boolean(r), blogExists: Boolean(b) };
  }
});

export const ensureTodoEntry = action({
  args: { token: v.string(), slug: v.string(), title: v.string(), category: v.string(), keywords: v.optional(v.array(v.string())), targetAudience: v.optional(v.string()) },
  handler: async (ctx, { token, slug, title, category, keywords, targetAudience }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { success: false, error: 'Not authenticated' };

    const todoPath = 'blog-planning/BLOG_TODO.md';
    const todo = await ghGet(todoPath);
    if (!todo) throw new Error('BLOG_TODO.md not found');
    if (todo.content.includes(`./research/${slug}.md`)) {
      return { alreadyExists: true };
    }

    const lines = todo.content.split('\n');
    const categoryHeader = `## CATEGORÍA: ${category}`;
    const keywordsList = Array.isArray(keywords) ? keywords.join(', ') : '';
    const newEntry = [
      `### 🔬 ${title}`,
      `**Research File:** [${slug}.md](./research/${slug}.md)`,
      `**Target:** ${targetAudience || 'Público general interesado en Pilates'}`,
      `**Keywords:** ${keywordsList}`,
      ''
    ].join('\n');

    let categoryFound = false;
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## CATEGORÍA:') && lines[i].includes(category)) {
        categoryFound = true;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('## CATEGORÍA:') || lines[j].startsWith('---')) { insertIndex = j; break; }
        }
        if (insertIndex === -1) insertIndex = lines.length;
        break;
      }
    }

    if (!categoryFound) {
      // Add new category at the end but before terminating '---' if present
      let endIdx = lines.length;
      const termIdx = lines.findIndex(l => l.trim() === '---');
      if (termIdx !== -1) endIdx = termIdx;
      lines.splice(endIdx, 0, '', categoryHeader, newEntry);
    } else {
      lines.splice(insertIndex, 0, newEntry);
    }

    await ghPut(todoPath, lines.join('\n'), `chore(todo): add 🔬 ${slug}`, todo.sha);
    return { success: true, created: true };
  }
});
