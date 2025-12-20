import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAdminUserId } from './lib/adminAuth';

// Get all active cities
export const getActive = query({
  handler: async (ctx) => {
    const cities = await ctx.db
      .query('cities')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    // Sort by priority
    cities.sort((a, b) => a.priority - b.priority);

    return cities;
  },
});

// Get city by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const city = await ctx.db
      .query('cities')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    return city;
  },
});

// Get priority cities
export const getPriority = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 7;

    const cities = await ctx.db
      .query('cities')
      .withIndex('by_priority')
      .filter((q) => q.eq(q.field('isActive'), true))
      .take(limit);

    return cities;
  },
});

// Get cities with studios
export const getWithStudios = query({
  handler: async (ctx) => {
    const cities = await ctx.db
      .query('cities')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .filter((q) => q.gt(q.field('studioCount'), 0))
      .collect();

    cities.sort((a, b) => b.studioCount - a.studioCount);

    return cities;
  },
});

// Update city statistics
export const updateStats = mutation({
  args: {
    token: v.string(),
    cityId: v.id('cities'),
    studioCount: v.number(),
    averageRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    await ctx.db.patch(args.cityId, {
      studioCount: args.studioCount,
      averageRating: args.averageRating,
      updatedAt: Date.now(),
    });
  },
});

// Create or update city
export const upsert = mutation({
  args: {
    token: v.string(),
    city: v.object({
      slug: v.string(),
      name: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      population: v.optional(v.number()),
      timezone: v.string(),
      neighborhoods: v.array(v.string()),
      searchRadius: v.number(),
      priority: v.number(),
      seoMetadata: v.optional(v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    const now = Date.now();

    // Check if city exists
    const existing = await ctx.db
      .query('cities')
      .withIndex('by_slug', (q) => q.eq('slug', args.city.slug))
      .first();

    if (existing) {
      // Update existing city
      await ctx.db.patch(existing._id, {
        ...args.city,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new city
      const id = await ctx.db.insert('cities', {
        ...args.city,
        studioCount: 0,
        averageRating: undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Batch import cities
export const batchImport = mutation({
  args: {
    token: v.string(),
    cities: v.array(v.object({
      slug: v.string(),
      name: v.string(),
      state: v.string(),
      country: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      population: v.optional(v.number()),
      timezone: v.string(),
      neighborhoods: v.array(v.string()),
      searchRadius: v.number(),
      priority: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    const now = Date.now();
    const results = [];

    for (const city of args.cities) {
      // Check if city exists
      const existing = await ctx.db
        .query('cities')
        .withIndex('by_slug', (q) => q.eq('slug', city.slug))
        .first();

      if (!existing) {
        const id = await ctx.db.insert('cities', {
          ...city,
          studioCount: 0,
          averageRating: undefined,
          isActive: true,
          seoMetadata: {
            title: `Estudios de Pilates en ${city.name}`,
            description: `Encuentra los mejores estudios de Pilates en ${city.name}, ${city.state}. Compara precios, horarios y reseñas.`,
            keywords: [
              `pilates ${city.name}`,
              `estudios pilates ${city.name}`,
              `clases pilates ${city.name}`,
              `reformer ${city.name}`,
            ],
          },
          createdAt: now,
          updatedAt: now,
        });
        results.push({ city: city.name, status: 'created', id });
      } else {
        results.push({ city: city.name, status: 'exists', id: existing._id });
      }
    }

    return results;
  },
});

// Activate/deactivate city
export const setActive = mutation({
  args: {
    token: v.string(),
    cityId: v.id('cities'),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    await ctx.db.patch(args.cityId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});
