import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { api } from './_generated/api';

/**
 * API Usage Tracking and Cost Monitoring
 *
 * Tracks Google Maps Platform API usage for cost control
 * and helps prevent unexpected billing spikes
 */

// Add to convex/schema.ts:
// apiUsageStats: defineTable({
//   date: v.string(), // YYYY-MM-DD format
//   endpoint: v.string(), // 'place_details', 'place_photos', etc.
//   count: v.number(),
//   estimatedCost: v.number(), // in USD
// }).index('by_date', ['date'])
//   .index('by_endpoint_date', ['endpoint', 'date'])

// Pricing constants (USD per 1000 requests)
const API_PRICING = {
  place_details_basic: 17.00, // Basic/ID-only fields
  place_details_contact: 17.00, // Contact fields
  place_details_atmosphere: 20.00, // Atmosphere fields
  place_details_pro: 25.00, // All fields
  place_photos: 7.00,
  text_search: 32.00,
  nearby_search: 32.00,
};

/**
 * Record an API call for tracking
 */
export const recordApiCall = mutation({
  args: {
    endpoint: v.string(),
    fieldMask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { endpoint, fieldMask } = args;

    // Determine SKU based on endpoint and fields
    let sku = endpoint;
    let costPer1000 = 0;

    if (endpoint === 'place_details') {
      // Determine SKU based on field mask
      if (fieldMask && fieldMask === 'id,photos') {
        sku = 'place_details_basic';
        costPer1000 = API_PRICING.place_details_basic;
      } else if (fieldMask && fieldMask.includes('rating')) {
        sku = 'place_details_pro';
        costPer1000 = API_PRICING.place_details_pro;
      } else {
        sku = 'place_details_contact';
        costPer1000 = API_PRICING.place_details_contact;
      }
    } else if (endpoint === 'place_photos') {
      costPer1000 = API_PRICING.place_photos;
    } else if (endpoint === 'text_search') {
      costPer1000 = API_PRICING.text_search;
    } else if (endpoint === 'nearby_search') {
      costPer1000 = API_PRICING.nearby_search;
    }

    // Calculate cost for this single request
    const requestCost = costPer1000 / 1000;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Find or create today's record
    const existing = await ctx.db
      .query('apiUsageStats')
      .withIndex('by_endpoint_date', (q) =>
        q.eq('endpoint', sku).eq('date', today)
      )
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        estimatedCost: existing.estimatedCost + requestCost,
      });
    } else {
      // Create new record
      await ctx.db.insert('apiUsageStats', {
        date: today,
        endpoint: sku,
        count: 1,
        estimatedCost: requestCost,
      });
    }

    return {
      sku,
      cost: requestCost,
    };
  },
});

/**
 * Get current month's API usage and costs
 */
export const getApiUsage = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Default to current month
    const now = new Date();
    const startDate = args.startDate ||
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = args.endDate ||
      new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Get all usage records for the date range
    const records = await ctx.db
      .query('apiUsageStats')
      .filter((q) =>
        q.and(
          q.gte(q.field('date'), startDate),
          q.lte(q.field('date'), endDate)
        )
      )
      .collect();

    // Aggregate by endpoint
    const byEndpoint: Record<string, { count: number; cost: number }> = {};
    let totalCount = 0;
    let totalCost = 0;

    for (const record of records) {
      if (!byEndpoint[record.endpoint]) {
        byEndpoint[record.endpoint] = { count: 0, cost: 0 };
      }
      byEndpoint[record.endpoint].count += record.count;
      byEndpoint[record.endpoint].cost += record.estimatedCost;
      totalCount += record.count;
      totalCost += record.estimatedCost;
    }

    // Calculate daily average
    const days = records.length > 0
      ? new Set(records.map(r => r.date)).size
      : 1;
    const dailyAverage = totalCost / days;

    // Project monthly total
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedTotal = dailyAverage * daysInMonth;

    // Google provides $200 monthly credit
    const MONTHLY_CREDIT = 200;
    const netCost = Math.max(0, totalCost - MONTHLY_CREDIT);
    const projectedNetCost = Math.max(0, projectedTotal - MONTHLY_CREDIT);

    return {
      period: { startDate, endDate },
      totalRequests: totalCount,
      totalCost,
      netCost, // After $200 credit
      dailyAverage,
      projectedTotal,
      projectedNetCost,
      byEndpoint,
      estimatedMonthlyCost: totalCost,
      remainingCredit: Math.max(0, MONTHLY_CREDIT - totalCost),
      isOverCredit: totalCost > MONTHLY_CREDIT,
    };
  },
});

/**
 * Get daily usage trend for charts
 */
export const getDailyTrend = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const records = await ctx.db
      .query('apiUsageStats')
      .filter((q) =>
        q.gte(q.field('date'), startDate.toISOString().split('T')[0])
      )
      .collect();

    // Group by date
    const byDate: Record<string, { requests: number; cost: number }> = {};

    for (const record of records) {
      if (!byDate[record.date]) {
        byDate[record.date] = { requests: 0, cost: 0 };
      }
      byDate[record.date].requests += record.count;
      byDate[record.date].cost += record.estimatedCost;
    }

    // Convert to array and sort by date
    const trend = Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trend;
  },
});

/**
 * Check if we're approaching budget limits
 */
export const checkBudgetStatus = query({
  args: {
    monthlyBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const budget = args.monthlyBudget || 1000; // Default $1000 budget

    // Get current month's dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Get all usage records for the date range directly
    const records = await ctx.db
      .query('apiUsageStats')
      .filter((q) =>
        q.and(
          q.gte(q.field('date'), startDate),
          q.lte(q.field('date'), endDate)
        )
      )
      .collect();

    // Calculate totals
    let totalCost = 0;
    for (const record of records) {
      totalCost += record.estimatedCost;
    }

    // Calculate projections
    const days = records.length > 0 ? new Set(records.map(r => r.date)).size : 1;
    const dailyAverage = totalCost / days;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedTotal = dailyAverage * daysInMonth;

    const percentUsed = (totalCost / budget) * 100;
    const dayOfMonth = new Date().getDate();
    const expectedUsage = (dayOfMonth / daysInMonth) * budget;
    const isOverPace = totalCost > expectedUsage;

    let status: 'healthy' | 'warning' | 'critical' | 'over_budget';
    if (totalCost >= budget) {
      status = 'over_budget';
    } else if (percentUsed >= 90 || (isOverPace && percentUsed >= 70)) {
      status = 'critical';
    } else if (percentUsed >= 70 || (isOverPace && percentUsed >= 50)) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      budget,
      spent: totalCost,
      remaining: Math.max(0, budget - totalCost),
      percentUsed,
      expectedUsage,
      isOverPace,
      status,
      projectedOverage: Math.max(0, projectedTotal - budget),
      message: status === 'over_budget'
        ? `Budget exceeded! Spent $${totalCost.toFixed(2)} of $${budget} budget.`
        : status === 'critical'
        ? `Critical: ${percentUsed.toFixed(1)}% of budget used. Projected to exceed budget.`
        : status === 'warning'
        ? `Warning: ${percentUsed.toFixed(1)}% of budget used. Monitor closely.`
        : `Healthy: ${percentUsed.toFixed(1)}% of budget used.`,
    };
  },
});