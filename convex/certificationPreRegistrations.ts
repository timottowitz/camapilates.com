import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAdminUserId } from './lib/adminAuth';

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
    selectedCohort: v.optional(v.string()),
    registeredForWebinar: v.optional(v.boolean()),
    webinarDate: v.optional(v.string()),
    discountClaimed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error('Email inválido');
    }

    // 2. Validate phone format (basic check for 10 digits)
    const phoneDigits = args.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      throw new Error('El teléfono debe tener al menos 10 dígitos');
    }

    // 3. Validate required fields
    if (!args.fullName.trim()) {
      throw new Error('El nombre es requerido');
    }
    if (!args.city.trim()) {
      throw new Error('La ciudad es requerida');
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
        selectedCohort: args.selectedCohort ?? existing.selectedCohort,
        registeredForWebinar: args.registeredForWebinar ?? existing.registeredForWebinar,
        webinarDate: args.webinarDate ?? existing.webinarDate,
        discountClaimed: args.discountClaimed ?? existing.discountClaimed,
        buzzNotified: false,
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
      selectedCohort: args.selectedCohort,
      registeredForWebinar: args.registeredForWebinar ?? true,
      webinarDate: args.webinarDate ?? '2026-09-26',
      discountClaimed: args.discountClaimed ?? true,
      buzzNotified: false,
      status: 'new',
      submittedAt: Date.now(),
    });

    return { id, isUpdate: false };
  },
});

/**
 * Fast-registration for Webinar & 50% discount waitlist
 */
export const registerWebinarWaitlist = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    cohort: v.string(), // 'queretaro-nov-2026' | 'monterrey-dec-jan-2026-2027' | 'both'
    experienceLevel: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error('Email inválido');
    }

    const phoneDigits = args.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      throw new Error('Ingresa un número de WhatsApp de 10 dígitos');
    }

    const city = args.cohort.includes('queretaro')
      ? 'Querétaro'
      : args.cohort.includes('monterrey')
        ? 'Monterrey'
        : 'Querétaro / Monterrey';

    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const existing = await ctx.db
      .query('certificationPreRegistrations')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .filter((q) => q.gt(q.field('submittedAt'), thirtyDaysAgo))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        phone: args.phone,
        city,
        experienceLevel: args.experienceLevel,
        selectedCohort: args.cohort,
        registeredForWebinar: true,
        webinarDate: '2026-09-26',
        discountClaimed: true,
        source: args.source || 'webinar-landing',
        buzzNotified: false,
        submittedAt: Date.now(),
        status: 'new',
      });
      return { id: existing._id, isUpdate: true };
    }

    const id = await ctx.db.insert('certificationPreRegistrations', {
      fullName: args.fullName,
      email: args.email.toLowerCase(),
      phone: args.phone,
      city,
      experienceLevel: args.experienceLevel,
      preferredTimeline: 'asap',
      selectedCohort: args.cohort,
      registeredForWebinar: true,
      webinarDate: '2026-09-26',
      discountClaimed: true,
      buzzNotified: false,
      source: args.source || 'webinar-landing',
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
    token: v.string(),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];
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
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) {
      return {
        total: 0,
        byStatus: {
          new: 0,
          contacted: 0,
          enrolled: 0,
          notInterested: 0,
        },
        byCity: {} as Record<string, number>,
        byExperience: {
          beginner: 0,
          someExperience: 0,
          advanced: 0,
        },
        byTimeline: {
          asap: 0,
          oneToThreeMonths: 0,
          threeToSixMonths: 0,
          flexible: 0,
        },
        last7Days: 0,
        last30Days: 0,
      };
    }
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
    token: v.string(),
    id: v.id('certificationPreRegistrations'),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { success: false, error: 'Not authenticated' };
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

/**
 * Query unnotified pre-registrations for Buzz channel integration
 */
export const getUnnotifiedSignups = query({
  args: {},
  handler: async (ctx) => {
    const unnotified = await ctx.db
      .query('certificationPreRegistrations')
      .filter((q) => q.eq(q.field('buzzNotified'), false))
      .order('desc')
      .take(25);
    return unnotified;
  },
});

/**
 * Mark pre-registration as notified in Buzz
 */
export const markSignupNotified = mutation({
  args: {
    id: v.id('certificationPreRegistrations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      buzzNotified: true,
      buzzNotifiedAt: Date.now(),
    });
    return { success: true };
  },
});

/**
 * Mark all historical pre-registrations as notified to avoid startup floods
 */
export const markAllHistoricalNotified = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db
      .query('certificationPreRegistrations')
      .filter((q) => q.eq(q.field('buzzNotified'), undefined))
      .collect();
    for (const rec of records) {
      await ctx.db.patch(rec._id, {
        buzzNotified: true,
        buzzNotifiedAt: Date.now(),
      });
    }
    return { updatedCount: records.length };
  },
});

/**
 * Query recent pre-registrations with live updates
 */
export const getRecentSignups = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    return await ctx.db
      .query('certificationPreRegistrations')
      .order('desc')
      .take(limit);
  },
});

