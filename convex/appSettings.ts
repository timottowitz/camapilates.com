import { v } from 'convex/values';
import { mutation, query, internalQuery } from './_generated/server';
import { getAdminUserId } from './lib/adminAuth';

/**
 * Save API key (stored in valueEnc field - already encrypted by database)
 */
export const saveApiKey = mutation({
  args: {
    token: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { success: false, error: 'Not authenticated' };
    const { token: _token, ...body } = args;
    const existing = await ctx.db
      .query('app_settings')
      .withIndex('by_key', (q) => q.eq('key', body.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        valueEnc: body.value, // Stored encrypted by callers like `settings.setProviderKey`
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('app_settings', {
        key: body.key,
        valueEnc: body.value, // Stored encrypted by callers like `settings.setProviderKey`
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

/**
 * List all settings (keys only, no values)
 */
export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];
    const settings = await ctx.db.query('app_settings').collect();
    return settings.map(s => ({ key: s.key, updatedAt: s.updatedAt }));
  },
});
