import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const submit = mutation({
  args: {
    studioSlug: v.string(),
    studioCity: v.string(),
    studioName: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.string(), // 'owner' | 'manager' | 'instructor' | 'other'
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if claim already exists for this studio
    const existing = await ctx.db
      .query('studioClaims')
      .filter((q) => 
        q.and(
          q.eq(q.field('studioSlug'), args.studioSlug),
          q.eq(q.field('studioCity'), args.studioCity),
          q.neq(q.field('status'), 'rejected')
        )
      )
      .first();

    if (existing) {
      return { 
        success: false, 
        error: 'Este estudio ya tiene una solicitud de reclamo pendiente o aprobada.',
        existingStatus: existing.status,
      };
    }

    const id = await ctx.db.insert('studioClaims', {
      studioSlug: args.studioSlug,
      studioCity: args.studioCity,
      studioName: args.studioName,
      name: args.name,
      email: args.email,
      phone: args.phone,
      role: args.role,
      message: args.message,
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, id };
  },
});

export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let q = ctx.db.query('studioClaims');
    
    if (args.status) {
      q = q.filter((qb) => qb.eq(qb.field('status'), args.status));
    }

    return await q.order('desc').take(limit);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id('studioClaims'),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      adminNotes: args.notes,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getByStudio = query({
  args: {
    studioSlug: v.string(),
    studioCity: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('studioClaims')
      .filter((q) => 
        q.and(
          q.eq(q.field('studioSlug'), args.studioSlug),
          q.eq(q.field('studioCity'), args.studioCity)
        )
      )
      .first();
  },
});
