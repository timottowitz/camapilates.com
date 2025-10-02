import { v } from 'convex/values';
import { mutation, internalQuery } from './_generated/server';

/**
 * Save API key (stored in valueEnc field - already encrypted by database)
 */
export const saveApiKey = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('app_settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        valueEnc: args.value, // Store directly (database layer encrypts)
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('app_settings', {
        key: args.key,
        valueEnc: args.value, // Store directly (database layer encrypts)
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Get API key (internal only - for use in actions)
 */
export const getApiKey = internalQuery({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query('app_settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    return setting?.valueEnc || null;
  },
});
