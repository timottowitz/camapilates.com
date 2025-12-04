import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const capture = mutation({
  args: {
    email: v.string(),
    magnet: v.string(),
    source: v.string(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query('leads')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    if (existing) {
      // Update with new magnet/source if different
      await ctx.db.patch(existing._id, {
        lastMagnet: args.magnet,
        lastSource: args.source,
        touchpoints: (existing.touchpoints || 0) + 1,
        updatedAt: Date.now(),
      });
      return { success: true, isNew: false, id: existing._id };
    }

    // Create new lead
    const id = await ctx.db.insert('leads', {
      email: args.email,
      magnet: args.magnet,
      source: args.source,
      lastMagnet: args.magnet,
      lastSource: args.source,
      touchpoints: 1,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, isNew: true, id };
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query('leads')
      .order('desc')
      .take(limit);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allLeads = await ctx.db.query('leads').collect();
    
    const byMagnet = allLeads.reduce((acc, lead) => {
      acc[lead.magnet] = (acc[lead.magnet] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = allLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: allLeads.length,
      byMagnet,
      bySource,
    };
  },
});
