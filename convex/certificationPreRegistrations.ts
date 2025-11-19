import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Submit a new pre-registration for Pilates certification courses
 * Handles duplicate detection and validation
 */
export const submitPreRegistration = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    experienceLevel: v.string(),
    preferredTimeline: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error('Email inválido');
    }

    // 2. Validate phone format (basic check for 10 digits)
    const phoneDigits = args.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      throw new Error('El teléfono debe tener 10 dígitos');
    }

    // 3. Validate required fields
    if (!args.fullName.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!args.city.trim()) {
      throw new Error('La ciudad es requerida');
    }
    if (!['beginner', 'some-experience', 'advanced'].includes(args.experienceLevel)) {
      throw new Error('Nivel de experiencia inválido');
    }
    if (!['asap', '1-3-months', '3-6-months', 'flexible'].includes(args.preferredTimeline)) {
      throw new Error('Línea de tiempo inválida');
    }

    // 4. Check for duplicate (same email within last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const existing = await ctx.db
      .query('certificationPreRegistrations')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .filter((q) => q.gt(q.field('submittedAt'), thirtyDaysAgo))
      .first();

    if (existing) {
      // Update existing record instead of creating duplicate
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        phone: args.phone,
        city: args.city,
        experienceLevel: args.experienceLevel,
        preferredTimeline: args.preferredTimeline,
        source: args.source,
        submittedAt: Date.now(),
        status: 'new', // Reset status to new
      });
      return { id: existing._id, isUpdate: true };
    }

    // 5. Create new pre-registration
    const id = await ctx.db.insert('certificationPreRegistrations', {
      fullName: args.fullName,
      email: args.email.toLowerCase(),
      phone: args.phone,
      city: args.city,
      experienceLevel: args.experienceLevel,
      preferredTimeline: args.preferredTimeline,
      source: args.source,
      status: 'new',
      submittedAt: Date.now(),
    });

    return { id, isUpdate: false };
  },
});

/**
 * Get all pre-registrations (for admin dashboard)
 */
export const listPreRegistrations = query({
  args: {
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.status) {
      results = await ctx.db
        .query('certificationPreRegistrations')
        .withIndex('by_status', (q) => q.eq('status', args.status))
        .order('desc')
        .take(args.limit ?? 50);
    } else if (args.city) {
      results = await ctx.db
        .query('certificationPreRegistrations')
        .withIndex('by_city', (q) => q.eq('city', args.city))
        .order('desc')
        .take(args.limit ?? 50);
    } else {
      results = await ctx.db
        .query('certificationPreRegistrations')
        .withIndex('by_submitted')
        .order('desc')
        .take(args.limit ?? 50);
    }

    return results;
  },
});

/**
 * Get pre-registration statistics (for admin dashboard)
 */
export const getPreRegistrationStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('certificationPreRegistrations').collect();

    const stats = {
      total: all.length,
      byStatus: {
        new: all.filter(r => r.status === 'new').length,
        contacted: all.filter(r => r.status === 'contacted').length,
        enrolled: all.filter(r => r.status === 'enrolled').length,
        notInterested: all.filter(r => r.status === 'not-interested').length,
      },
      byCity: {} as Record<string, number>,
      byExperience: {
        beginner: all.filter(r => r.experienceLevel === 'beginner').length,
        someExperience: all.filter(r => r.experienceLevel === 'some-experience').length,
        advanced: all.filter(r => r.experienceLevel === 'advanced').length,
      },
      byTimeline: {
        asap: all.filter(r => r.preferredTimeline === 'asap').length,
        oneToThreeMonths: all.filter(r => r.preferredTimeline === '1-3-months').length,
        threeToSixMonths: all.filter(r => r.preferredTimeline === '3-6-months').length,
        flexible: all.filter(r => r.preferredTimeline === 'flexible').length,
      },
      last7Days: all.filter(r => r.submittedAt > Date.now() - (7 * 24 * 60 * 60 * 1000)).length,
      last30Days: all.filter(r => r.submittedAt > Date.now() - (30 * 24 * 60 * 60 * 1000)).length,
    };

    // Count by city
    all.forEach(reg => {
      stats.byCity[reg.city] = (stats.byCity[reg.city] || 0) + 1;
    });

    return stats;
  },
});

/**
 * Update pre-registration status (for admin)
 */
export const updateStatus = mutation({
  args: {
    id: v.id('certificationPreRegistrations'),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!['new', 'contacted', 'enrolled', 'not-interested'].includes(args.status)) {
      throw new Error('Estado inválido');
    }

    const updates: any = {
      status: args.status,
    };

    if (args.status === 'contacted') {
      updates.lastContactedAt = Date.now();
    }

    if (args.notes !== undefined) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);

    return { success: true };
  },
});
