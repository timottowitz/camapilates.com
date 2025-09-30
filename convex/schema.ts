import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    passHash: v.string(),
    salt: v.string(),
    createdAt: v.number(),
  }).index('by_username', ['username']),

  sessions: defineTable({
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(),
  }).index('by_token', ['token']).index('by_user', ['userId']),

  blog_suggestions: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    keywords: v.array(v.string()),
    source: v.optional(v.string()),
    status: v.string(), // queued | in_review | accepted | completed | declined
    createdAt: v.number(),
  }).index('by_slug', ['slug']).index('by_status', ['status']).index('by_created', ['createdAt']),

  pipeline_jobs: defineTable({
    type: v.string(), // single | batch
    slugs: v.array(v.string()),
    status: v.string(), // queued | running | done | error
    stages: v.optional(v.any()),
    logs: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  }).index('by_status', ['status']).index('by_created', ['createdAt']),

  blog_images: defineTable({
    slug: v.string(),
    heroStorageId: v.optional(v.id('_storage')), // Convex storage file id
    sectionStorageIds: v.optional(v.array(v.id('_storage'))),
    updatedAt: v.number(),
  }).index('by_slug', ['slug']).index('by_updated', ['updatedAt']),

  app_settings: defineTable({
    key: v.string(),
    valueEnc: v.string(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  keywords: defineTable({
    term: v.string(),
    category: v.string(),
    usageCount: v.number(),
    lastUsed: v.optional(v.number()),
  }).index('by_term', ['term']).index('by_category', ['category']),

  // Pilates Studio Directory Tables
  studios: defineTable({
    // Basic Information
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),

    // Location
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

    // Contact Information
    contact: v.object({
      phone: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      email: v.optional(v.string()),
      website: v.optional(v.string()),
      bookingUrl: v.optional(v.string()),
    }),

    // Business Hours
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

    // Reviews & Ratings
    metrics: v.object({
      googleRating: v.optional(v.number()),
      googleReviewCount: v.optional(v.number()),
      lastReviewDate: v.optional(v.number()),
      sentimentScore: v.optional(v.number()),
    }),

    // Pricing
    pricing: v.optional(v.object({
      singleClassMin: v.optional(v.number()),
      singleClassMax: v.optional(v.number()),
      monthlyMin: v.optional(v.number()),
      monthlyMax: v.optional(v.number()),
      currency: v.string(),
      lastUpdated: v.optional(v.number()),
    })),

    // Features
    classTypes: v.optional(v.array(v.string())),
    equipment: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),

    // Media
    photos: v.optional(v.array(v.string())),
    logo: v.optional(v.string()),

    // Social Media
    social: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
    })),

    // Data Quality
    dataQualityScore: v.number(),
    lastScraped: v.optional(v.number()),
    lastEnriched: v.optional(v.number()),
    isVerified: v.boolean(),
    isActive: v.boolean(),

    // External IDs
    googlePlaceId: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_city', ['address.city'])
    .index('by_neighborhood', ['address.city', 'address.neighborhood'])
    .index('by_rating', ['metrics.googleRating'])
    .index('by_active', ['isActive'])
    .index('by_quality', ['dataQualityScore']),

  cities: defineTable({
    slug: v.string(),
    name: v.string(),
    state: v.string(),
    country: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    population: v.optional(v.number()),
    timezone: v.string(),
    neighborhoods: v.array(v.string()),
    studioCount: v.number(),
    averageRating: v.optional(v.number()),
    searchRadius: v.number(), // in meters
    priority: v.number(), // 1-100 for rollout order
    isActive: v.boolean(),
    seoMetadata: v.optional(v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_priority', ['priority'])
    .index('by_active', ['isActive']),

  neighborhoods: defineTable({
    slug: v.string(),
    name: v.string(),
    cityId: v.id('cities'),
    citySlug: v.string(),
    boundaries: v.optional(v.array(v.object({
      lat: v.number(),
      lng: v.number(),
    }))),
    center: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    studioCount: v.number(),
    averageRating: v.optional(v.number()),
    demographics: v.optional(v.object({
      averageIncome: v.optional(v.number()),
      population: v.optional(v.number()),
    })),
    transport: v.optional(v.array(v.string())),
    landmarks: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_city', ['cityId'])
    .index('by_city_slug', ['citySlug']),

  scraping_jobs: defineTable({
    type: v.string(), // 'discovery' | 'enrichment' | 'reviews'
    targetType: v.string(), // 'city' | 'studio'
    targetId: v.optional(v.string()),
    status: v.string(), // 'pending' | 'running' | 'completed' | 'failed'
    progress: v.optional(v.object({
      current: v.number(),
      total: v.number(),
    })),
    results: v.optional(v.object({
      found: v.number(),
      processed: v.number(),
      errors: v.number(),
    })),
    error: v.optional(v.string()),
    logs: v.array(v.string()),
    retryCount: v.number(),
    priority: v.number(),
    scheduledFor: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_type', ['type'])
    .index('by_scheduled', ['scheduledFor'])
    .index('by_priority', ['priority']),

  review_snapshots: defineTable({
    studioId: v.id('studios'),
    date: v.number(),
    metrics: v.object({
      rating: v.number(),
      totalReviews: v.number(),
      newReviews: v.number(),
      averageSentiment: v.number(),
    }),
    topKeywords: v.array(v.string()),
    sampleReviews: v.array(v.object({
      author: v.string(),
      rating: v.number(),
      text: v.string(),
      date: v.number(),
      sentiment: v.optional(v.number()),
    })),
    createdAt: v.number(),
  })
    .index('by_studio', ['studioId'])
    .index('by_date', ['date']),

  // Google Places API Cache (30-day max per ToS)
  placeDetailsCache: defineTable({
    placeId: v.string(),
    data: v.any(), // Cached place details (non-photo data)
    cachedAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_place_id', ['placeId']),

  // API Usage Tracking for Cost Monitoring
  apiUsageStats: defineTable({
    date: v.string(), // YYYY-MM-DD format
    endpoint: v.string(), // 'place_details', 'place_photos', etc.
    count: v.number(),
    estimatedCost: v.number(), // in USD
  })
    .index('by_date', ['date'])
    .index('by_endpoint_date', ['endpoint', 'date']),

  // Rate limiting settings
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  })
    .index('by_key', ['key']),
});

