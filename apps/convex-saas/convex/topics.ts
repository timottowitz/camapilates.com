import { actionGeneric as action, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';

export const findTopicsFromReddit = action({
  args: { queries: v.optional(v.array(v.string())), limit: v.optional(v.number()) },
  handler: async (ctx, { queries, limit }) => {
    const seeds = (queries && queries.length) ? queries : ['pilates reformer', 'cama de pilates', 'reformer pilates', 'pilates mexico', 'pilates casa', 'precio reformer'];
    const subs = ['pilates', 'fitness', 'flexibility', 'physicaltherapy'];
    const pool: Array<{ title: string; url: string; score: number; num_comments: number }> = [];
    for (const s of subs) {
      for (const q of seeds) {
        try {
          const u = new URL(`https://www.reddit.com/r/${s}/search.json`);
          u.searchParams.set('q', q);
          u.searchParams.set('restrict_sr', '1');
          u.searchParams.set('sort', 'top');
          u.searchParams.set('t', 'year');
          const resp = await fetch(u.toString(), { headers: { 'user-agent': 'CAMA-Pilates-Convex/1.0' } });
          if (!resp.ok) continue;
          const j: any = await resp.json();
          (j?.data?.children || []).forEach((child: any) => {
            const d = child?.data; const title = String(d?.title || '').trim();
            if (!title || !/pilates|reformer|cama/i.test(title)) return;
            pool.push({ title, url: `https://reddit.com${d?.permalink || ''}`.replace(/\/$/, ''), score: Number(d?.score || 0), num_comments: Number(d?.num_comments || 0) });
          });
        } catch {}
      }
    }
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\sáéíóúñü]/gi, '').trim();
    const seen = new Set<string>();
    const ranked = pool
      .sort((a, b) => (b.score + b.num_comments * 2) - (a.score + a.num_comments * 2))
      .filter(r => { const k = norm(r.title); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, Math.min(30, Math.max(3, Number(limit || 10))));

    const guessCategory = (t: string) => {
      const lc = t.toLowerCase();
      if (/vs|contra|comparativa/.test(lc)) return 'Comparativas';
      if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra';
      if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento';
      if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud';
      return 'Estudio';
    };
    const toSlug = (t: string) => t.toLowerCase()
      .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');

    const suggestions = ranked.map(r => {
      const title = /mexico|méxico/i.test(r.title) ? r.title : `${r.title} (México)`;
      const slug = toSlug(title).slice(0, 80);
      const category = guessCategory(title);
      const keywords = Array.from(new Set(title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean))).slice(0, 5);
      return { slug, title, category, keywords, source: r.url };
    });

    const ts = Date.now();
    for (const s of suggestions) {
      const existing = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', s.slug)).unique();
      if (existing) {
        await ctx.db.patch(existing._id, { title: s.title, category: s.category, keywords: s.keywords, source: s.source, status: 'in_review' });
      } else {
        await ctx.db.insert('blog_suggestions', { ...s, status: 'in_review', createdAt: ts });
      }
    }

    return { suggestions };
  }
});

