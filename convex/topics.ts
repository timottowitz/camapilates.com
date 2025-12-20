import { v } from 'convex/values';
import { action, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';

type TopicSuggestion = {
  slug: string;
  title: string;
  category: string;
  keywords: string[];
  source?: string;
};

export const upsertSuggestionsInReviewInternal = internalMutation({
  args: {
    suggestions: v.array(v.object({
      slug: v.string(),
      title: v.string(),
      category: v.string(),
      keywords: v.array(v.string()),
      source: v.optional(v.string()),
    })),
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

export const findTopicsFromReddit = action({
  args: {
    token: v.string(),
    queries: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { token, queries, limit }) => {
    const sess = await ctx.runQuery(api.admin.session as any, { token } as any);
    if (!sess?.authenticated) return { suggestions: [] as TopicSuggestion[], error: 'Not authenticated' };

    const seeds =
      queries && queries.length
        ? queries
        : [
            'pilates reformer',
            'cama de pilates',
            'reformer pilates',
            'pilates mexico',
            'pilates casa',
            'precio reformer',
          ];

    // Helpers
    const norm = (s: string) =>
      s.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\sáéíóúñü]/gi, '').trim();
    const toSlug = (t: string) =>
      t.toLowerCase()
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
    const guessCategory = (t: string) => {
      const lc = t.toLowerCase();
      if (/vs|contra|comparativa/.test(lc)) return 'Comparativas';
      if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra';
      if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento';
      if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud';
      return 'Estudio';
    };

    const pool: Array<{ title: string; url: string; score: number }> = [];

    // 1) Reddit (JSON API)
    const subs = ['pilates', 'fitness', 'flexibility', 'physicaltherapy'];
    for (const s of subs) {
      for (const q of seeds) {
        try {
          const u = new URL(`https://www.reddit.com/r/${s}/search.json`);
          u.searchParams.set('q', q);
          u.searchParams.set('restrict_sr', '1');
          u.searchParams.set('sort', 'top');
          u.searchParams.set('t', 'year');
          const resp = await fetch(u.toString(), {
            headers: { 'user-agent': 'CAMA-Pilates-Convex/1.0' },
          });
          if (!resp.ok) continue;
          const j: any = await resp.json();
          (j?.data?.children || []).forEach((child: any) => {
            const d = child?.data;
            const title = String(d?.title || '').trim();
            if (!title || !/pilates|reformer|cama/i.test(title)) return;
            const score = Number(d?.score || 0) + Number(d?.num_comments || 0) * 2;
            pool.push({
              title,
              url: `https://reddit.com${d?.permalink || ''}`.replace(/\/$/, ''),
              score,
            });
          });
        } catch {
          // ignore
        }
      }
    }

    // 2) Quora and 3) General Web via DuckDuckGo HTML (no API key)
    async function ddg(query: string) {
      try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const resp = await fetch(url, {
          headers: { 'user-agent': 'Mozilla/5.0 CAMA-Pilates-Convex/1.0' },
        });
        if (!resp.ok) return [] as Array<{ title: string; url: string }>;
        const html = await resp.text();
        const results: Array<{ title: string; url: string }> = [];
        const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gim;
        let m: RegExpExecArray | null;
        while ((m = re.exec(html)) !== null) {
          const href = m[1];
          const title = m[2].replace(/<[^>]+>/g, '').trim();
          if (href && title) results.push({ title, url: href });
          if (results.length >= 10) break;
        }
        return results;
      } catch {
        return [] as Array<{ title: string; url: string }>;
      }
    }

    // Quora (site restricted)
    for (const q of seeds) {
      const qres = await ddg(`site:quora.com ${q}`);
      qres.forEach((r, idx) => {
        if (/pilates|reformer|cama/i.test(r.title)) pool.push({ title: r.title, url: r.url, score: 50 - idx });
      });
    }

    // General websearch
    for (const q of seeds) {
      const gres = await ddg(`${q} México Pilates`);
      gres.forEach((r, idx) => {
        if (/pilates|reformer|cama/i.test(r.title)) pool.push({ title: r.title, url: r.url, score: 40 - idx });
      });
    }

    // Rank + dedupe
    const seen = new Set<string>();
    const ranked = pool
      .sort((a, b) => b.score - a.score)
      .filter((r) => {
        const k = norm(r.title);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, Math.min(30, Math.max(3, Number(limit || 10))));

    const suggestions: TopicSuggestion[] = ranked.map((r) => {
      const title = /mexico|méxico/i.test(r.title) ? r.title : `${r.title} (México)`;
      const slug = toSlug(title).slice(0, 80);
      const category = guessCategory(title);
      const keywords = Array.from(
        new Set(
          title
            .toLowerCase()
            .split(/[^a-z0-9áéíóúñü]+/)
            .filter(Boolean)
        )
      ).slice(0, 5);
      return { slug, title, category, keywords, source: r.url };
    });

    // Persist suggestions (in_review)
    await ctx.runMutation(internal.topics.upsertSuggestionsInReviewInternal, { suggestions });

    return { suggestions };
  },
});

