import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { Doc } from './_generated/dataModel';

// Get studios by city
export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const studios = await ctx.db
      .query('studios')
      .withIndex('by_city', (q) => q.eq('address.city', args.city))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    return studios;
  },
});

// Get single studio by slug
export const getBySlug = query({
  args: {
    city: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const studio = await ctx.db
      .query('studios')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .filter((q) => q.eq(q.field('address.city'), args.city))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    return studio;
  },
});

// Search studios
export const search = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let studiosQuery = ctx.db.query('studios');

    // Filter by city if provided
    if (args.city) {
      studiosQuery = studiosQuery.withIndex('by_city', (q) =>
        q.eq('address.city', args.city)
      );
    }

    const studios = await studiosQuery
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Filter by search query
    const query = args.query.toLowerCase();
    const filtered = studios.filter((studio) => {
      return (
        studio.name.toLowerCase().includes(query) ||
        studio.address.neighborhood?.toLowerCase().includes(query) ||
        studio.address.street.toLowerCase().includes(query) ||
        studio.classTypes?.some((type) => type.toLowerCase().includes(query)) ||
        studio.amenities?.some((amenity) => amenity.toLowerCase().includes(query))
      );
    });

    // Sort by relevance (simple scoring)
    const scored = filtered.map((studio) => {
      let score = 0;
      if (studio.name.toLowerCase().includes(query)) score += 10;
      if (studio.address.neighborhood?.toLowerCase().includes(query)) score += 5;
      if (studio.classTypes?.some((type) => type.toLowerCase().includes(query))) score += 3;
      if (studio.amenities?.some((amenity) => amenity.toLowerCase().includes(query))) score += 2;

      // Boost by rating and review count
      score += (studio.metrics.googleRating || 0) * 2;
      score += Math.min((studio.metrics.googleReviewCount || 0) / 10, 5);

      return { ...studio, score };
    });

    // Sort by score and limit
    scored.sort((a, b) => b.score - a.score);
    const limit = args.limit || 20;

    return scored.slice(0, limit).map(({ score, ...studio }) => studio);
  },
});

// Get featured studios
export const getFeatured = query({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let studiosQuery = ctx.db.query('studios');

    if (args.city) {
      studiosQuery = studiosQuery.withIndex('by_city', (q) =>
        q.eq('address.city', args.city)
      );
    }

    const studios = await studiosQuery
      .filter((q) => q.eq(q.field('isActive'), true))
      .filter((q) => q.eq(q.field('isVerified'), true))
      .collect();

    // Sort by rating and review count
    studios.sort((a, b) => {
      const scoreA = (a.metrics.googleRating || 0) * (Math.log(a.metrics.googleReviewCount || 1) + 1);
      const scoreB = (b.metrics.googleRating || 0) * (Math.log(b.metrics.googleReviewCount || 1) + 1);
      return scoreB - scoreA;
    });

    const limit = args.limit || 6;
    return studios.slice(0, limit);
  },
});

// Get studios by neighborhood
export const getByNeighborhood = query({
  args: {
    city: v.string(),
    neighborhood: v.string(),
  },
  handler: async (ctx, args) => {
    const studios = await ctx.db
      .query('studios')
      .withIndex('by_neighborhood', (q) =>
        q.eq('address.city', args.city).eq('address.neighborhood', args.neighborhood)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    return studios;
  },
});

// Get nearby studios (requires lat/lng)
export const getNearby = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radiusKm: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radiusKm = args.radiusKm || 5;
    const limit = args.limit || 10;

    // Get all active studios
    const studios = await ctx.db
      .query('studios')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Calculate distances and filter by radius
    const studiosWithDistance = studios.map((studio) => {
      const distance = calculateDistance(
        args.lat,
        args.lng,
        studio.address.coordinates.lat,
        studio.address.coordinates.lng
      );
      return { ...studio, distance };
    });

    // Filter by radius and sort by distance
    const nearby = studiosWithDistance
      .filter((studio) => studio.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearby;
  },
});

// Create or update studio
export const upsert = mutation({
  args: {
    studio: v.object({
      slug: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      address: v.object({
        street: v.string(),
        neighborhood: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        postalCode: v.optional(v.string()),
        country: v.string(),
        coordinates: v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      }),
      contact: v.object({
        phone: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        email: v.optional(v.string()),
        website: v.optional(v.string()),
        bookingUrl: v.optional(v.string()),
      }),
      hours: v.optional(v.object({
        monday: v.optional(v.string()),
        tuesday: v.optional(v.string()),
        wednesday: v.optional(v.string()),
        thursday: v.optional(v.string()),
        friday: v.optional(v.string()),
        saturday: v.optional(v.string()),
        sunday: v.optional(v.string()),
        timezone: v.string(),
      })),
      metrics: v.object({
        googleRating: v.optional(v.number()),
        googleReviewCount: v.optional(v.number()),
        lastReviewDate: v.optional(v.number()),
        sentimentScore: v.optional(v.number()),
      }),
      pricing: v.optional(v.object({
        singleClassMin: v.optional(v.number()),
        singleClassMax: v.optional(v.number()),
        monthlyMin: v.optional(v.number()),
        monthlyMax: v.optional(v.number()),
        currency: v.string(),
        lastUpdated: v.optional(v.number()),
      })),
      classTypes: v.optional(v.array(v.string())),
      equipment: v.optional(v.array(v.string())),
      amenities: v.optional(v.array(v.string())),
      certifications: v.optional(v.array(v.string())),
      photos: v.optional(v.array(v.string())),
      logo: v.optional(v.string()),
      social: v.optional(v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })),
      dataQualityScore: v.number(),
      googlePlaceId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if studio exists
    const existing = await ctx.db
      .query('studios')
      .withIndex('by_slug', (q) => q.eq('slug', args.studio.slug))
      .first();

    if (existing) {
      // Update existing studio
      await ctx.db.patch(existing._id, {
        ...args.studio,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new studio
      const id = await ctx.db.insert('studios', {
        ...args.studio,
        isVerified: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// Update studio metrics
export const updateMetrics = mutation({
  args: {
    studioId: v.id('studios'),
    metrics: v.object({
      googleRating: v.optional(v.number()),
      googleReviewCount: v.optional(v.number()),
      lastReviewDate: v.optional(v.number()),
      sentimentScore: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studioId, {
      metrics: args.metrics,
      updatedAt: Date.now(),
    });
  },
});

// Get global stats for all studios
export const getGlobalStats = query({
  handler: async (ctx) => {
    const allStudios = await ctx.db
      .query('studios')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Count by city
    const citySet = new Set<string>();
    let totalReviews = 0;
    let totalRating = 0;
    let ratedStudios = 0;

    for (const studio of allStudios) {
      citySet.add(studio.address.city);
      
      if (studio.metrics.googleReviewCount) {
        totalReviews += studio.metrics.googleReviewCount;
      }
      if (studio.metrics.googleRating) {
        totalRating += studio.metrics.googleRating;
        ratedStudios++;
      }
    }

    return {
      totalStudios: allStudios.length,
      totalCities: citySet.size,
      totalReviews,
      averageRating: ratedStudios > 0 ? Math.round((totalRating / ratedStudios) * 100) / 100 : 0,
    };
  },
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}