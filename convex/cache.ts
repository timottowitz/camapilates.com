import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

/**
 * Cache management for Google Places data
 *
 * Per Google ToS, we can cache non-photo data for up to 30 days
 * This reduces API costs by avoiding repeated calls for static data
 */

// Cache table schema (add to convex/schema.ts):
// placeDetailsCache: defineTable({
//   placeId: v.string(),
//   data: v.any(),
//   cachedAt: v.number(),
//   expiresAt: v.number(),
// }).index('by_place_id', ['placeId'])

/**
 * Get cached place details
 */
export const getPlaceDetails = internalQuery({
  args: {
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query('placeDetailsCache')
      .withIndex('by_place_id', (q) => q.eq('placeId', args.placeId))
      .first();

    // Check if cache is still valid
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }

    return null;
  },
});

/**
 * Save place details to cache
 * Maximum cache duration: 30 days per ToS
 */
export const savePlaceDetails = internalMutation({
  args: {
    placeId: v.string(),
    data: v.any(),
    cacheDurationDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { placeId, data, cacheDurationDays = 1 } = args;

    // Ensure we don't exceed 30-day maximum
    const duration = Math.min(cacheDurationDays, 30);
    const now = Date.now();
    const expiresAt = now + (duration * 24 * 60 * 60 * 1000);

    // Check if record exists
    const existing = await ctx.db
      .query('placeDetailsCache')
      .withIndex('by_place_id', (q) => q.eq('placeId', placeId))
      .first();

    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        data,
        cachedAt: now,
        expiresAt,
      });
    } else {
      // Create new cache entry
      await ctx.db.insert('placeDetailsCache', {
        placeId,
        data,
        cachedAt: now,
        expiresAt,
      });
    }

    return { success: true };
  },
});

/**
 * Clean up expired cache entries
 * Should be run periodically (e.g., daily cron job)
 */
export const cleanExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all expired entries
    const expired = await ctx.db
      .query('placeDetailsCache')
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect();

    // Delete expired entries
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }

    return {
      cleaned: expired.length,
      timestamp: now,
    };
  },
});

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('placeDetailsCache').collect();
    const now = Date.now();

    const valid = all.filter(entry => entry.expiresAt > now);
    const expired = all.filter(entry => entry.expiresAt <= now);

    // Calculate average cache age
    const avgAge = valid.length > 0
      ? valid.reduce((sum, entry) => sum + (now - entry.cachedAt), 0) / valid.length
      : 0;

    return {
      totalEntries: all.length,
      validEntries: valid.length,
      expiredEntries: expired.length,
      averageCacheAgeMs: avgAge,
      averageCacheAgeHours: avgAge / (1000 * 60 * 60),
      oldestEntry: all.length > 0
        ? Math.min(...all.map(e => e.cachedAt))
        : null,
      newestEntry: all.length > 0
        ? Math.max(...all.map(e => e.cachedAt))
        : null,
    };
  },
});
