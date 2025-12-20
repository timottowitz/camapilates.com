import { queryGeneric as query, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { getAdminUserId } from './lib/adminAuth';

async function isAdmin(ctx: any, token: string): Promise<boolean> {
  const adminId = await getAdminUserId(ctx as any, token);
  return Boolean(adminId);
}

export const listSuggestions = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const authed = await isAdmin(ctx, args.token);
    if (!authed) return [];

    const rows = await ctx.db.query('blog_suggestions').collect();
    // Sort by createdAt desc
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  }
});

export const getSuggestion = query({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return null;

    const idx = ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug));
    const row = await idx.unique();
    return row;
  }
});

export const addSuggestion = mutation({
  args: { token: v.string(), slug: v.string(), title: v.string(), category: v.string(), keywords: v.array(v.string()), source: v.optional(v.string()) },
  handler: async (ctx, { token, slug, title, category, keywords, source }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { ok: false, error: 'Not authenticated' };

    const now = Date.now();
    // Upsert by slug
    const existing = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { title, category, keywords, source, status: 'queued' });
      return { updated: true };
    }
    await ctx.db.insert('blog_suggestions', { slug, title, category, keywords, source, status: 'queued', createdAt: now });
    return { created: true };
  }
});

export const acceptSuggestion = mutation({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { ok: false, error: 'Not authenticated' };

    const s = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (!s) return { ok: false, error: 'not_found' };
    await ctx.db.patch(s._id, { status: 'accepted' });
    return { ok: true };
  }
});

export const declineSuggestion = mutation({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { ok: false, error: 'Not authenticated' };

    const s = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (!s) return { ok: false, error: 'not_found' };
    await ctx.db.patch(s._id, { status: 'declined' });
    return { ok: true };
  }
});

export const updateTopic = mutation({
  args: { token: v.string(), slug: v.string(), title: v.optional(v.string()), category: v.optional(v.string()), keywords: v.optional(v.array(v.string())) },
  handler: async (ctx, { token, slug, title, category, keywords }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { ok: false, error: 'Not authenticated' };

    const s = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (!s) return { ok: false, error: 'not_found' };
    const patch: any = {};
    if (title) patch.title = title;
    if (category) patch.category = category;
    if (keywords) patch.keywords = keywords;
    if (Object.keys(patch).length) await ctx.db.patch(s._id, patch);
    return { ok: true };
  }
});

export const status = query({
  args: { token: v.string(), slug: v.string() },
  handler: async (ctx, { token, slug }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { slug, status: 'not_authenticated' };

    const s = await ctx.db.query('blog_suggestions').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (!s) return { slug, status: 'not_found' };
    return { slug, status: s.status, title: s.title, category: s.category, createdAt: s.createdAt };
  }
});

export const saveKeywords = mutation({
  args: { token: v.string(), keywords: v.array(v.object({ term: v.string(), category: v.string(), usageCount: v.number(), lastUsed: v.optional(v.number()) })) },
  handler: async (ctx, { token, keywords }) => {
    const authed = await isAdmin(ctx, token);
    if (!authed) return { ok: false, error: 'Not authenticated' };

    // Simple replace strategy: delete all and reinsert
    const all = await ctx.db.query('keywords').collect();
    await Promise.all(all.map(doc => ctx.db.delete(doc._id)));
    for (const k of keywords) {
      await ctx.db.insert('keywords', k);
    }
    return { ok: true, count: keywords.length };
  }
});
