import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Record payment completed via Whop checkout
 */
export const recordPayment = mutation({
  args: {
    email: v.string(),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    planId: v.string(),
    planName: v.string(),
    amount: v.number(),
    currency: v.string(),
    receiptId: v.optional(v.string()),
    whopUserId: v.optional(v.string()),
    cohort: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert('whopPayments', {
      email: args.email.toLowerCase().trim(),
      fullName: args.fullName,
      phone: args.phone,
      planId: args.planId,
      planName: args.planName,
      amount: args.amount,
      currency: args.currency.toUpperCase(),
      receiptId: args.receiptId,
      whopUserId: args.whopUserId,
      cohort: args.cohort,
      paymentStatus: 'completed',
      source: args.source || 'whop-checkout',
      createdAt: Date.now(),
    });

    // Also update or insert in certificationPreRegistrations
    const existingReg = await ctx.db
      .query('certificationPreRegistrations')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase().trim()))
      .first();

    if (existingReg) {
      await ctx.db.patch(existingReg._id, {
        status: 'enrolled',
        discountClaimed: true,
        selectedCohort: args.cohort ?? existingReg.selectedCohort,
        notes: `Whop payment confirmed: ${args.planName} (${args.amount} ${args.currency}) - Receipt: ${args.receiptId || 'N/A'}`,
      });
    } else {
      await ctx.db.insert('certificationPreRegistrations', {
        fullName: args.fullName || 'Alumna Registrada',
        email: args.email.toLowerCase().trim(),
        phone: args.phone || '',
        city: args.cohort?.includes('queretaro')
          ? 'Querétaro'
          : args.cohort?.includes('monterrey')
            ? 'Monterrey'
            : 'México',
        experienceLevel: 'beginner',
        preferredTimeline: 'asap',
        selectedCohort: args.cohort,
        registeredForWebinar: true,
        webinarDate: '2026-09-26',
        discountClaimed: true,
        source: args.source || 'whop-checkout',
        status: 'enrolled',
        notes: `Whop direct enrollment: ${args.planName} (${args.amount} ${args.currency})`,
        submittedAt: Date.now(),
      });
    }

    return { success: true, paymentId };
  },
});

/**
 * Get payments for a given email
 */
export const getPaymentsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email.trim()) return [];
    return await ctx.db
      .query('whopPayments')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase().trim()))
      .order('desc')
      .collect();
  },
});
