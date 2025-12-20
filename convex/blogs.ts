import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { getAdminUserId } from './lib/adminAuth';

// --- Queries ---

export const list = query({
    args: {
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const status = args.status || 'published';
        const limit = args.limit || 100;

        const blogs = await ctx.db
            .query('blogs')
            .withIndex('by_status', (q) => q.eq('status', status))
            .order('desc')
            .take(limit);

        // Sort by publishDate desc in memory (since we queried by status)
        return blogs.sort((a, b) =>
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const blog = await ctx.db
            .query('blogs')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .unique();
        return blog;
    },
});

// Get related posts based on category and tags
export const getRelated = query({
    args: {
        slug: v.string(),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 3;
        const current = await ctx.db
            .query('blogs')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .unique();

        if (!current) return [];

        // 1. Try same category
        let candidates = await ctx.db
            .query('blogs')
            .withIndex('by_category', (q) => q.eq('category', current.category))
            .filter((q) => q.neq(q.field('slug'), current.slug))
            .take(limit + 5); // Fetch a few more to shuffle/filter

        // 2. If not enough, just get latest published
        if (candidates.length < limit) {
            const more = await ctx.db
                .query('blogs')
                .withIndex('by_status', (q) => q.eq('status', 'published'))
                .order('desc')
                .take(limit * 2);

            const existingIds = new Set(candidates.map(c => c._id));
            for (const m of more) {
                if (m.slug !== current.slug && !existingIds.has(m._id)) {
                    candidates.push(m);
                }
            }
        }

        return candidates.slice(0, limit);
    },
});

// --- Mutations ---

export const create = mutation({
    args: {
        token: v.string(),
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        excerpt: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        author: v.string(),
        publishDate: v.string(),
        heroImage: v.optional(v.string()),
        featured: v.boolean(),
        status: v.string(),
        canonical: v.optional(v.string()),
        noindex: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const adminId = await getAdminUserId(ctx as any, args.token);
        if (!adminId) throw new Error('Not authenticated');

        const { token: _token, ...data } = args as any;
        const existing = await ctx.db
            .query('blogs')
            .withIndex('by_slug', (q) => q.eq('slug', data.slug))
            .unique();

        if (existing) {
            throw new Error(`Blog with slug "${data.slug}" already exists`);
        }

        await ctx.db.insert('blogs', {
            ...data,
            updatedAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        token: v.string(),
        slug: v.string(),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        heroImage: v.optional(v.string()),
        status: v.optional(v.string()),
        featured: v.optional(v.boolean()),
        canonical: v.optional(v.string()),
        noindex: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const adminId = await getAdminUserId(ctx as any, args.token);
        if (!adminId) throw new Error('Not authenticated');

        const { token: _token, slug, ...updates } = args as any;
        const blog = await ctx.db
            .query('blogs')
            .withIndex('by_slug', (q) => q.eq('slug', slug))
            .unique();

        if (!blog) {
            throw new Error(`Blog "${slug}" not found`);
        }

        await ctx.db.patch(blog._id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const deleteBlog = mutation({
    args: { token: v.string(), slug: v.string() },
    handler: async (ctx, args) => {
        const adminId = await getAdminUserId(ctx as any, args.token);
        if (!adminId) throw new Error('Not authenticated');

        const blog = await ctx.db
            .query('blogs')
            .withIndex('by_slug', (q) => q.eq('slug', args.slug))
            .unique();

        if (!blog) return;

        await ctx.db.delete(blog._id);
    },
});

// --- Actions ---

export const regenerateImage = action({
    args: {
        token: v.string(),
        prompt: v.string(),
        context: v.optional(v.string()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
        if (!sess?.authenticated) return { success: false, error: 'Not authenticated' };

        // This connects to the existing AI pipeline
        // For now, we'll mock the response or call an internal endpoint if available
        // In a real scenario, this would call OpenAI DALL-E 3 or similar

        console.log('Regenerating image with prompt:', args.prompt);

        // TODO: Implement actual AI call here
        // const imageUrl = await generateImage(args.prompt);

        // Mock response for UI development
        return {
            success: true,
            url: 'https://placehold.co/600x400?text=Regenerated+Image',
            prompt: args.prompt
        };
    },
});
