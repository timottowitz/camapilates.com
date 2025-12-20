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

  blogs: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(), // Markdown content
    excerpt: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    author: v.string(),
    publishDate: v.string(), // ISO date string
    heroImage: v.optional(v.string()),
    featured: v.boolean(),
    status: v.string(), // 'published' | 'draft' | 'archived'
    canonical: v.optional(v.string()),
    noindex: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_status', ['status'])
    .index('by_category', ['category'])
    .index('by_date', ['publishDate']),

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

    // AI-Generated Summary from Reviews
    generatedSummary: v.optional(v.object({
      overview: v.string(),
      vibe: v.optional(v.string()),
      highlight: v.optional(v.string()),
      reviewInsights: v.optional(v.string()),
      generatedAt: v.number(),
    })),

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

  // Raw Google Places API data warehouse (complete responses)
  placesRawData: defineTable({
    googlePlaceId: v.string(),
    studioId: v.optional(v.id('studios')),
    rawResponse: v.any(), // Complete API response JSON
    fieldMask: v.string(), // Fields that were requested
    apiVersion: v.string(), // "v1" for new Places API
    fetchedAt: v.number(),
  })
    .index('by_place_id', ['googlePlaceId'])
    .index('by_studio', ['studioId'])
    .index('by_fetched', ['fetchedAt']),

  // Studio photos stored in Convex file storage
  studioPhotos: defineTable({
    studioId: v.id('studios'),
    googlePlaceId: v.string(),
    storageId: v.id('_storage'), // Convex file storage reference
    photoIndex: v.number(), // 0-9 position from Places API
    width: v.number(),
    height: v.number(),
    attribution: v.optional(v.object({
      displayName: v.string(),
      uri: v.optional(v.string()),
      photoUri: v.optional(v.string()),
    })),
    googlePhotoName: v.string(), // Original Places API photo name
    uploadedAt: v.number(),
  })
    .index('by_studio', ['studioId'])
    .index('by_place_id', ['googlePlaceId'])
    .index('by_studio_index', ['studioId', 'photoIndex']),

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

  // Site Images (Hero, Featured, etc.)
  site_images: defineTable({
    name: v.string(), // e.g., "shopHero", "featuredProducts", "finishMycelium"
    category: v.string(), // "hero" | "featured" | "icon" | "logo" | "blog"
    storageId: v.id('_storage'),
    mimeType: v.string(), // "image/webp", "image/jpeg", etc.
    size: v.number(), // bytes
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    description: v.optional(v.string()),
    uploadedBy: v.optional(v.id('users')),
    isActive: v.boolean(),
    cacheControl: v.string(), // e.g., "public, max-age=31536000, immutable"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_category', ['category'])
    .index('by_active', ['isActive'])
    .index('by_created', ['createdAt']),

  // AI-Described Images for Smart Selection
  ai_images: defineTable({
    fileName: v.string(), // Original filename
    storageId: v.id('_storage'), // Convex storage ID (original image)
    mimeType: v.string(),
    size: v.number(),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),

    // AI Vision Analysis (GPT-4 Vision)
    aiDescription: v.object({
      scene: v.string(), // Main scene description
      subjects: v.array(v.string()), // People, objects detected
      activity: v.optional(v.string()), // What's happening
      mood: v.string(), // Atmosphere/feeling
      colors: v.array(v.string()), // Dominant colors
      composition: v.string(), // Layout/framing
      lighting: v.optional(v.string()), // Lighting quality
      setting: v.optional(v.string()), // Indoor/outdoor, location type
      useCases: v.array(v.string()), // Suggested use: hero, feature, blog, etc.
      tags: v.array(v.string()), // Searchable keywords
      quality: v.optional(v.string()), // Image quality assessment
    }),

    // AI-Generated Similar Image (copyright-free alternative)
    generatedStorageId: v.optional(v.id('_storage')), // Generated image ID
    generationPrompt: v.optional(v.string()), // DALL-E prompt used
    generatedDimensions: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    generatedAt: v.optional(v.number()), // When image was generated
    generationStatus: v.optional(v.string()), // 'pending' | 'generating' | 'completed' | 'failed'
    generationError: v.optional(v.string()), // Error message if generation failed

    // Metadata
    category: v.optional(v.string()), // Auto-detected or manual
    isActive: v.boolean(),
    uploadedAt: v.number(),
    analyzedAt: v.optional(v.number()),
  })
    .index('by_file', ['fileName'])
    .index('by_category', ['category'])
    .index('by_active', ['isActive'])
    .index('by_uploaded', ['uploadedAt'])
    .index('by_generation_status', ['generationStatus']),

  // Image Placeholders registry for contextual image generation
  image_placeholders: defineTable({
    // Identity
    placeholderId: v.string(), // Unique key like "blog-slug-hero-1"
    pageType: v.string(), // "blog" | "home" | "shop" | "studios" | "about" | etc.
    pageSlug: v.optional(v.string()), // For dynamic pages (blog slug, studio slug)
    location: v.string(), // "hero" | "section-1" | "inline-3" | "gallery-2"

    // Context snapshot
    contextBefore: v.optional(v.string()), // up to ~500 chars
    contextAfter: v.optional(v.string()), // up to ~500 chars
    headingAbove: v.optional(v.string()),
    altText: v.optional(v.string()),
    figCaption: v.optional(v.string()),

    // Generation prompt
    generatedPrompt: v.optional(v.string()),
    promptGeneratedAt: v.optional(v.number()),

    // Assignment
    assignedImageId: v.optional(v.id('ai_images')),
    assignedAt: v.optional(v.number()),

    // Requirements/preferences
    preferredAspectRatio: v.string(), // e.g., "16:9" | "1:1" | "4:3"
    preferredStyle: v.optional(v.string()), // e.g., "professional" | "lifestyle"
    requiredSubjects: v.optional(v.array(v.string())),

    // Status & priority
    status: v.string(), // "pending" | "prompt_generated" | "image_assigned" | "active"
    priority: v.number(), // 1-100
    generationError: v.optional(v.string()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    isActive: v.boolean(),
  })
    .index('by_placeholder_id', ['placeholderId'])
    .index('by_page_slug', ['pageSlug'])
    .index('by_status', ['status'])
    .index('by_priority', ['priority'])
    .index('by_page_type_slug', ['pageType', 'pageSlug']),

  // Lead Capture (Lead Magnets)
  leads: defineTable({
    email: v.string(),
    magnet: v.string(), // 'routine' | 'checklist' | 'pricing'
    source: v.string(), // page URL or identifier
    lastMagnet: v.string(),
    lastSource: v.string(),
    touchpoints: v.number(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_email', ['email'])
    .index('by_magnet', ['magnet'])
    .index('by_created', ['createdAt']),

  // Studio Claim Requests
  studioClaims: defineTable({
    studioSlug: v.string(),
    studioCity: v.string(),
    studioName: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.string(), // 'owner' | 'manager' | 'instructor' | 'other'
    message: v.optional(v.string()),
    status: v.string(), // 'pending' | 'approved' | 'rejected'
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_studio', ['studioSlug', 'studioCity'])
    .index('by_status', ['status'])
    .index('by_email', ['email'])
    .index('by_created', ['createdAt']),

  // Certification Pre-Registration (Lead Generation)
  certificationPreRegistrations: defineTable({
    // Personal Information
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),

    // Preferences
    city: v.string(), // Which city they're interested in
    experienceLevel: v.string(), // 'beginner' | 'some-experience' | 'advanced'
    preferredTimeline: v.string(), // 'asap' | '1-3-months' | '3-6-months' | 'flexible'

    // Metadata
    source: v.string(), // Which page they came from
    status: v.string(), // 'new' | 'contacted' | 'enrolled' | 'not-interested'
    notes: v.optional(v.string()), // Admin notes

    // Timestamps
    submittedAt: v.number(),
    lastContactedAt: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_city', ['city'])
    .index('by_status', ['status'])
    .index('by_submitted', ['submittedAt']),

  // Teachers Directory
  teachers: defineTable({
    // === IDENTITY ===
    slug: v.string(),                    // "maria-gonzalez-cdmx"
    fullName: v.object({
      value: v.string(),
      confidence: v.object({
        value: v.number(),
        level: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
        source: v.string(),
        observedAt: v.number(),
        evidence: v.optional(v.string()),
      }),
    }),
    displayName: v.optional(v.object({
      value: v.string(),
      confidence: v.object({
        value: v.number(),
        level: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),

    // === LOCATION (matches cities pattern) ===
    citySlug: v.string(),                // "cdmx" - matches cities.slug
    cityName: v.object({
      value: v.string(),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    }),
    neighborhoodSlug: v.optional(v.object({
      value: v.string(),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),

    // === PROFILE ===
    bio: v.optional(v.object({
      value: v.string(),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),
    specializations: v.object({
      value: v.array(v.string()), // ["Reformer", "Prenatal", "Rehabilitación"]
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    }),
    experienceYears: v.optional(v.object({
      value: v.number(),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),
    experienceLevel: v.optional(v.object({
      value: v.union(
        v.literal('ENTRY'),
        v.literal('INTERMEDIATE'),
        v.literal('EXPERIENCED'),
        v.literal('SENIOR'),
        v.literal('MASTER')
      ),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),
    languages: v.object({
      value: v.array(v.string()),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    }),

    // === CERTIFICATIONS ===
    certifications: v.array(v.object({
      key: v.string(),
      name: v.string(),
      organization: v.optional(v.string()),
      year: v.optional(v.object({
        value: v.number(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      expiryDate: v.optional(v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      credentialId: v.optional(v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      isVerified: v.boolean(),
      verificationProof: v.optional(v.object({
        storageId: v.optional(v.id('_storage')),
        url: v.optional(v.string()),
        uploadedAt: v.optional(v.number()),
      })),
    })),

    // === PHOTO (Convex storage first) ===
    profilePhoto: v.optional(v.object({
      value: v.object({
        storageId: v.string(),
        source: v.union(v.literal('upload'), v.literal('instagram_oauth'), v.literal('scrape')),
        url: v.optional(v.string()),
        updatedAt: v.number(),
      }),
      confidence: v.object({
        value: v.number(),
        level: v.string(),
        source: v.string(),
        observedAt: v.number(),
      }),
    })),

    // === SOCIAL (for icon display) ===
    social: v.optional(v.object({
      instagram: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      linkedin: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      facebook: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      tiktok: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      website: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
    })),

    // === CONTACT (private by default) ===
    contact: v.optional(v.object({
      email: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      phone: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      whatsapp: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      bookingUrl: v.optional(v.object({
        value: v.string(),
        confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
      })),
      isPublic: v.boolean(),             // Show on public profile?
    })),

    // === STATUS & VERIFICATION ===
    status: v.union(
      v.literal('scraped'),
      v.literal('claimed'),
      v.literal('verified'),
      v.literal('suspended')
    ),
    isVerified: v.boolean(),             // Quick filter
    isActive: v.boolean(),
    dataQualityScore: v.number(),        // 0-100

    // === TIMESTAMPS ===
    createdAt: v.number(),
    updatedAt: v.number(),
    claimedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    lastScrapedAt: v.optional(v.number()),
    scrapeSources: v.optional(v.array(v.string())),
  })
    .index('by_slug', ['slug'])
    .index('by_city', ['citySlug'])
    .index('by_city_active', ['citySlug', 'isActive'])
    .index('by_active_verified', ['isActive', 'isVerified'])
    .index('by_quality', ['dataQualityScore']),

  // Teacher-Studio Links (Smart Links Junction Table)
  teacherStudioLinks: defineTable({
    teacherId: v.id('teachers'),
    studioId: v.id('studios'),

    // === STATUS & CONFIDENCE ===
    status: v.string(),       // 'inferred' | 'pending' | 'verified' | 'rejected'
    confidence: v.number(),   // 0-100
    source: v.string(),       // 'scrape' | 'suggested' | 'teacher_claim' | 'studio_claim' | 'admin'

    // === EVIDENCE LOG ===
    signals: v.array(v.object({
      type: v.string(),       // 'bio_mention' | 'website_staff_page' | 'user_suggestion' | etc.
      score: v.number(),      // 0-100
      evidence: v.optional(v.string()), // Snippet/explanation
      url: v.optional(v.string()),
      observedAt: v.number(),
    })),

    // === DISPLAY DATA (denormalized) ===
    teacherSlug: v.string(),
    teacherName: v.string(),
    studioSlug: v.string(),
    studioName: v.string(),
    studioCity: v.string(),

    // === VERIFICATION ===
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.string()), // 'teacher' | 'studio' | 'admin'
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),

    // === TIMESTAMPS ===
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_teacher', ['teacherId'])
    .index('by_studio', ['studioId'])
    .index('by_teacher_status', ['teacherId', 'status'])
    .index('by_studio_status', ['studioId', 'status'])
    .index('by_teacher_studio', ['teacherId', 'studioId']),

  // Teacher Claims
  teacherClaims: defineTable({
    // === TARGET ===
    teacherId: v.id('teachers'),
    teacherSlug: v.string(),
    teacherName: v.string(),
    citySlug: v.string(),

    // === CLAIMANT INFO ===
    claimantName: v.string(),
    email: v.string(),
    phone: v.string(),
    relationship: v.string(),  // 'self' | 'agent' | 'colleague'
    message: v.optional(v.string()),

    // === VERIFICATION ===
    status: v.string(),        // 'draft' | 'email_pending' | 'pending_review' | 'approved' | 'rejected'
    verificationToken: v.optional(v.string()),  // Hashed 6-digit code
    tokenExpiresAt: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),

    // === DRAFT CHECKPOINT TRACKING ===
    completedSteps: v.optional(v.array(v.number())),  // [1, 2, 3] = steps 1-3 saved
    lastSavedStep: v.optional(v.number()),            // Last step user was viewing

    // === PROPOSED PROFILE (Rich data from claim form) ===
    proposedProfile: v.optional(v.object({
      // Basic Info
      bio: v.optional(v.string()),
      specializations: v.optional(v.array(v.string())),
      experienceYears: v.optional(v.number()),
      languages: v.optional(v.array(v.string())),
      
      // Teaching Style
      teachingStyle: v.optional(v.object({
        vibe: v.optional(v.array(v.string())),      // "Motivador", "Técnico", "Relajante"
        classPace: v.optional(v.string()),           // "slow" | "moderate" | "fast"
        musicStyle: v.optional(v.string()),          // "none" | "pop" | "classical" | "lofi"
        classSize: v.optional(v.string()),           // "private_only" | "small_groups" | "large"
      })),
      
      // Credentials
      certifications: v.optional(v.array(v.object({
        name: v.string(),
        organization: v.optional(v.string()),
        year: v.optional(v.number()),
      }))),
      trainingLineage: v.optional(v.string()),       // "Trained under..."
      teachingHours: v.optional(v.number()),         // Total hours taught
      
      // Contact & Booking
      whatsapp: v.optional(v.string()),
      bookingUrl: v.optional(v.string()),
      instagram: v.optional(v.string()),
      website: v.optional(v.string()),
      
      // Location
      neighborhoods: v.optional(v.array(v.string())),
      homeVisits: v.optional(v.boolean()),
    })),

    // === PROPOSED PHOTOS (up to 5) ===
    proposedPhotos: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      type: v.string(),            // "profile" | "action" | "studio" | "certificate"
      caption: v.optional(v.string()),
      uploadedAt: v.number(),
    }))),

    // === LEGACY: PROPOSED UPDATES (keeping for backward compatibility) ===
    proposedChanges: v.optional(v.object({
      bio: v.optional(v.string()),
      specializations: v.optional(v.array(v.string())),
      certifications: v.optional(v.array(v.object({
        name: v.string(),
        organization: v.optional(v.string()),
      }))),
      studioAssociations: v.optional(v.array(v.string())), // studioSlugs
      profilePhotoStorageId: v.optional(v.id('_storage')),
    })),

    // === MAGIC LINK ACCESS ===
    editorTokenHash: v.optional(v.string()),
    editorTokenExpiresAt: v.optional(v.number()),

    // === ADMIN ===
    adminNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),

    // === TIMESTAMPS ===
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_teacher', ['teacherId'])
    .index('by_email', ['email'])
    .index('by_status', ['status'])
    .index('by_created', ['createdAt'])
    .index('by_teacher_email', ['teacherId', 'email']),

  // Teacher Photos (approved photos from claims)
  teacherPhotos: defineTable({
    teacherId: v.id('teachers'),
    storageId: v.id('_storage'),
    type: v.string(),              // "profile" | "gallery" | "action" | "certificate"
    caption: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.boolean(),
    uploadedAt: v.number(),
    approvedAt: v.number(),
  })
    .index('by_teacher', ['teacherId'])
    .index('by_teacher_type', ['teacherId', 'type'])
    .index('by_teacher_active', ['teacherId', 'isActive']),

  // =============================================
  // INSTRUCTOR ACCOUNTS (SaaS-ready authentication)
  // =============================================
  instructorAccounts: defineTable({
    // Identity
    email: v.string(),
    passwordHash: v.string(),
    salt: v.string(),

    // Profile link
    teacherId: v.id('teachers'),

    // Account status
    status: v.string(),  // 'pending_setup' | 'active' | 'suspended'

    // SaaS-ready (unused now, prepared for future)
    tier: v.optional(v.string()),              // 'free' | 'pro' | 'studio'
    stripeCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()), // 'active' | 'past_due' | 'canceled'

    // Tokens
    setupToken: v.optional(v.string()),
    setupTokenExpiresAt: v.optional(v.number()),
    resetToken: v.optional(v.string()),
    resetTokenExpiresAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    passwordSetAt: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_teacher', ['teacherId'])
    .index('by_status', ['status'])
    .index('by_tier', ['tier']),

  instructorSessions: defineTable({
    token: v.string(),
    accountId: v.id('instructorAccounts'),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_account', ['accountId']),

  // Cached Instagram profile previews (best-effort; used for teacher pages)
  instagramProfiles: defineTable({
    username: v.string(), // normalized (no @, lowercase)
    profileUrl: v.string(),
    displayName: v.optional(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    profileImageStorageId: v.optional(v.id('_storage')),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
    posts: v.optional(v.number()),
    recentPostUrls: v.optional(v.array(v.string())),
    status: v.string(), // 'pending' | 'ok' | 'error'
    error: v.optional(v.string()),
    fetchedAt: v.number(),
    nextFetchAfter: v.number(),
    updatedAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_updated', ['updatedAt']),

});
