# Pilates Studio Directory - Comprehensive Implementation Plan

## Executive Summary

This plan outlines a scalable, programmatic approach to building a Pilates studio directory for Mexican cities, starting with 7 priority cities and expanding to 100+ cities. The system emphasizes automated data collection, structured schemas, and SEO optimization.

---

## 1. Directory Structure

### 1.1 File System Organization

```
src/
├── content/
│   ├── studios/
│   │   ├── ciudad-de-mexico/
│   │   │   ├── _index.md (city landing page)
│   │   │   ├── reforma-pilates.md
│   │   │   ├── core-studio-cdmx.md
│   │   │   └── ...
│   │   ├── queretaro/
│   │   │   ├── _index.md
│   │   │   ├── studio-name.md
│   │   │   └── ...
│   │   ├── puebla/
│   │   ├── monterrey/
│   │   ├── guadalajara/
│   │   ├── mazatlan/
│   │   └── [90+ more cities]/
│   ├── cities/
│   │   ├── ciudad-de-mexico.md (detailed city guide)
│   │   ├── queretaro.md
│   │   └── ...
│   └── neighborhoods/
│       ├── ciudad-de-mexico/
│       │   ├── polanco.md
│       │   ├── condesa.md
│       │   ├── roma.md
│       │   └── ...
│       └── ...
├── data/
│   ├── cities.json (master city list with metadata)
│   ├── studios/
│   │   ├── ciudad-de-mexico.json
│   │   ├── queretaro.json
│   │   └── ...
│   └── scraping/
│       ├── google-places-cache.json
│       ├── reviews-cache.json
│       └── enrichment-data.json
└── pages/
    ├── studios/
    │   ├── [city]/
    │   │   ├── index.tsx (city directory listing)
    │   │   ├── [slug].tsx (individual studio page)
    │   │   └── [neighborhood].tsx (neighborhood listing)
    │   └── index.tsx (all cities overview)
    └── api/
        ├── scrape-studios.ts
        ├── enrich-studio.ts
        └── update-reviews.ts
```

### 1.2 URL Structure (SEO-Optimized)

```
/estudios-de-pilates                          → Main directory landing
/estudios-de-pilates/ciudad-de-mexico        → City listing (all studios)
/estudios-de-pilates/ciudad-de-mexico/polanco → Neighborhood listing
/estudios-de-pilates/ciudad-de-mexico/reforma-pilates → Individual studio
/ciudades/ciudad-de-mexico                    → City guide page
/compara/reforma-pilates-vs-core-studio       → Comparison pages (future)
```

---

## 2. Data Schema Design

### 2.1 Core Studio Schema (TypeScript)

```typescript
interface PilatesStudio {
  // === IDENTIFIERS === (AUTOMATED)
  id: string;                          // UUID
  slug: string;                        // URL-friendly identifier
  googlePlaceId: string | null;        // For Google APIs

  // === BASIC INFO === (AUTOMATED via Google Places)
  name: string;
  legalName: string | null;            // Official business name
  brand: string | null;                // Chain name if applicable

  // === LOCATION === (AUTOMATED)
  address: {
    street: string;
    neighborhood: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;                   // Always "México"
    coordinates: {
      lat: number;
      lng: number;
    };
    formattedAddress: string;
  };

  // === CONTACT === (AUTOMATED with validation)
  contact: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    bookingUrl: string | null;
  };

  // === BUSINESS HOURS === (AUTOMATED)
  hours: {
    monday: TimeRange[];
    tuesday: TimeRange[];
    wednesday: TimeRange[];
    thursday: TimeRange[];
    friday: TimeRange[];
    saturday: TimeRange[];
    sunday: TimeRange[];
    timezone: string;                  // "America/Mexico_City"
  };

  // === GOOGLE REVIEWS METRICS === (AUTOMATED)
  reviews: {
    googleRating: number | null;       // 0-5
    googleReviewCount: number;
    googleReviewsUrl: string | null;
    lastScraped: string;               // ISO timestamp

    // Computed metrics
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };

    // Sentiment analysis (computed from reviews)
    sentimentScores: {
      positive: number;                // 0-1
      neutral: number;
      negative: number;
      overallSentiment: "positive" | "neutral" | "negative";
    };

    // Key themes from reviews (NLP extraction)
    commonThemes: {
      instructorQuality: number;       // mention frequency
      cleanliness: number;
      equipment: number;
      atmosphere: number;
      customerService: number;
      pricingValue: number;
    };

    // Recent reviews snapshot
    recentReviews: Review[];           // Last 5-10 reviews
  };

  // === PRICING === (SEMI-AUTOMATED - scraped + manual verification)
  pricing: {
    currency: "MXN";
    dropInClass: number | null;        // Single class price
    classPackages: {
      size: number;                    // e.g., 5, 10, 20 classes
      price: number;
      validityDays: number | null;     // How long package is valid
    }[];
    monthlyUnlimited: number | null;
    membershipOptions: string[];       // e.g., ["Mensual", "Trimestral", "Anual"]
    promotions: {
      description: string;
      validUntil: string | null;
    }[];
    lastUpdated: string;               // ISO timestamp
    source: "website" | "phone" | "google" | "manual";
  };

  // === CLASSES & OFFERINGS === (SEMI-AUTOMATED)
  classes: {
    types: ClassType[];                // e.g., reformer, mat, prenatal
    schedule: ClassSchedule[] | null;  // If available
    levels: ("beginner" | "intermediate" | "advanced" | "all-levels")[];
    specialties: string[];             // e.g., "Pilates clínico", "Rehabilitación"
    maxClassSize: number | null;
  };

  // === EQUIPMENT === (MANUAL with template options)
  equipment: {
    reformers: number | null;
    cadillac: boolean;
    wundaChair: boolean;
    barrels: boolean;
    matOnly: boolean;
    brands: string[];                  // e.g., ["Balanced Body", "Stott"]
  };

  // === INSTRUCTORS === (SEMI-AUTOMATED from website/social)
  instructors: {
    count: number | null;
    headInstructor: string | null;
    certifications: string[];          // e.g., ["Stott Pilates", "BASI"]
    profiles: InstructorProfile[];     // If available
  };

  // === AMENITIES === (MANUAL checklist)
  amenities: {
    parking: boolean | null;
    showers: boolean | null;
    lockers: boolean | null;
    wifi: boolean | null;
    airConditioning: boolean | null;
    changingRooms: boolean | null;
    waterStation: boolean | null;
    retailShop: boolean | null;
  };

  // === ACCESSIBILITY === (Manual checklist)
  accessibility: {
    wheelchairAccessible: boolean | null;
    elevator: boolean | null;
    groundFloor: boolean | null;
    accessibleBathroom: boolean | null;
  };

  // === TRANSPORTATION === (AUTOMATED via Google APIs)
  transportation: {
    nearbyMetro: {
      station: string;
      line: string;
      walkingMinutes: number;
    }[] | null;
    nearbyBusStops: string[] | null;
    parkingInfo: string | null;
  };

  // === MEDIA === (SEMI-AUTOMATED)
  media: {
    logo: string | null;               // URL or storage ID
    photos: {
      url: string;
      caption: string | null;
      source: "google" | "website" | "instagram" | "manual";
    }[];
    virtualTour: string | null;
    videoUrl: string | null;
  };

  // === SOCIAL MEDIA === (AUTOMATED via scraping)
  social: {
    instagram: {
      handle: string | null;
      followers: number | null;
      posts: number | null;
      lastUpdated: string | null;
    };
    facebook: {
      url: string | null;
      likes: number | null;
      lastUpdated: string | null;
    };
    tiktok: string | null;
    youtube: string | null;
  };

  // === BOOKING SYSTEM === (AUTOMATED detection)
  booking: {
    hasOnlineBooking: boolean;
    systems: ("mindbody" | "gympass" | "classpass" | "custom" | "none")[];
    requiresMembership: boolean | null;
    allowsDropIns: boolean | null;
  };

  // === METADATA === (System-generated)
  metadata: {
    verified: boolean;                 // Manual verification flag
    featured: boolean;                 // Premium listing
    claimedByOwner: boolean;
    createdAt: string;
    updatedAt: string;
    lastVerified: string | null;
    dataQualityScore: number;          // 0-100 based on completeness
    scrapingSources: string[];         // Track data provenance
    automationStatus: {
      basicInfo: "complete" | "partial" | "pending";
      reviews: "complete" | "partial" | "pending";
      pricing: "complete" | "partial" | "pending";
      schedule: "complete" | "partial" | "pending";
      media: "complete" | "partial" | "pending";
    };
  };

  // === SEO === (Auto-generated)
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    schemaMarkup: object;              // JSON-LD structured data
  };
}

// Supporting interfaces
interface TimeRange {
  open: string;                        // "09:00"
  close: string;                       // "21:00"
  is24Hours: boolean;
  isClosed: boolean;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number | null;
  response: {
    text: string;
    date: string;
  } | null;
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];                    // Extracted keywords
}

interface ClassType {
  name: string;
  description: string | null;
  duration: number | null;             // minutes
  difficulty: string | null;
}

interface ClassSchedule {
  dayOfWeek: string;
  time: string;
  className: string;
  instructor: string | null;
  availableSpots: number | null;
}

interface InstructorProfile {
  name: string;
  bio: string | null;
  certifications: string[];
  photoUrl: string | null;
  specialties: string[];
}
```

### 2.2 City Schema

```typescript
interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  neighborhoods: Neighborhood[];
  studioCount: number;
  averageRating: number | null;
  priceRange: {
    min: number | null;
    max: number | null;
    average: number | null;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
  };
  priority: number;                     // 1-7 for initial cities, 8-100 for expansion
  timezone: string;
}

interface Neighborhood {
  name: string;
  slug: string;
  studioCount: number;
  description: string | null;
}
```

---

## 3. Convex Database Schema

### 3.1 Convex Tables

```typescript
// convex/schema.ts additions

export default defineSchema({
  // ... existing tables ...

  studios: defineTable({
    // Core identifiers
    slug: v.string(),
    googlePlaceId: v.optional(v.string()),
    name: v.string(),
    citySlug: v.string(),

    // Location (flattened for querying)
    addressStreet: v.string(),
    addressNeighborhood: v.optional(v.string()),
    addressCity: v.string(),
    addressState: v.string(),
    addressPostalCode: v.string(),
    lat: v.number(),
    lng: v.number(),

    // Contact
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    bookingUrl: v.optional(v.string()),

    // Reviews metrics (for quick filtering/sorting)
    googleRating: v.optional(v.number()),
    googleReviewCount: v.number(),
    reviewsLastScraped: v.number(),        // timestamp

    // Pricing (for filtering)
    dropInPrice: v.optional(v.number()),
    monthlyPrice: v.optional(v.number()),

    // Full data object (stored as JSON)
    dataJson: v.string(),                  // Stringified full PilatesStudio object

    // Metadata
    verified: v.boolean(),
    featured: v.boolean(),
    dataQualityScore: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_city', ['citySlug'])
    .index('by_neighborhood', ['addressNeighborhood'])
    .index('by_rating', ['googleRating'])
    .index('by_review_count', ['googleReviewCount'])
    .index('by_price', ['dropInPrice'])
    .index('by_updated', ['updatedAt'])
    .index('by_google_place', ['googlePlaceId']),

  cities: defineTable({
    slug: v.string(),
    name: v.string(),
    state: v.string(),
    population: v.number(),
    lat: v.number(),
    lng: v.number(),
    studioCount: v.number(),
    averageRating: v.optional(v.number()),
    priority: v.number(),
    dataJson: v.string(),                  // Full City object
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_priority', ['priority'])
    .index('by_studio_count', ['studioCount']),

  neighborhoods: defineTable({
    citySlug: v.string(),
    name: v.string(),
    slug: v.string(),
    studioCount: v.number(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_city', ['citySlug'])
    .index('by_slug', ['slug']),

  scraping_jobs: defineTable({
    type: v.string(),                      // 'google_places' | 'reviews' | 'enrichment'
    citySlug: v.optional(v.string()),
    studioId: v.optional(v.id('studios')),
    status: v.string(),                    // 'pending' | 'running' | 'complete' | 'error'
    progress: v.number(),                  // 0-100
    results: v.optional(v.string()),       // JSON results
    error: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_type', ['type'])
    .index('by_city', ['citySlug'])
    .index('by_created', ['createdAt']),

  review_snapshots: defineTable({
    studioId: v.id('studios'),
    reviewsJson: v.string(),               // Array of Review objects
    rating: v.number(),
    reviewCount: v.number(),
    sentimentScore: v.number(),
    snapshotDate: v.number(),              // timestamp
  })
    .index('by_studio', ['studioId'])
    .index('by_date', ['snapshotDate']),
});
```

---

## 4. Data Collection & Automation Strategy

### 4.1 Automation Tiers

**TIER 1: Fully Automated (90% accuracy target)**
- Basic info (name, address, phone)
- Google Reviews metrics (rating, count)
- Business hours
- Coordinates
- Google Photos
- Social media handles (Instagram, Facebook)

**TIER 2: Semi-Automated (requires validation)**
- Pricing (scraped but needs verification)
- Class schedules
- Equipment counts
- Instructor names
- Website content extraction

**TIER 3: Manual Collection (one-time setup)**
- Detailed amenities checklist
- Accessibility features
- Specialized certifications
- Virtual tours
- Owner verification

### 4.2 Data Collection Pipeline

```typescript
// Step 1: Google Places API - Initial Discovery
async function discoverStudios(cityName: string, cityCoords: LatLng) {
  // Search query variations
  const queries = [
    `Pilates ${cityName}`,
    `Estudio de Pilates ${cityName}`,
    `Pilates reformer ${cityName}`,
    `Clases de Pilates ${cityName}`,
  ];

  const places = [];
  for (const query of queries) {
    const results = await googlePlaces.textSearch({
      query,
      location: cityCoords,
      radius: 50000, // 50km
      language: 'es',
    });
    places.push(...results);
  }

  // Deduplicate by place_id
  return deduplicateByPlaceId(places);
}

// Step 2: Google Places Details - Detailed Info
async function enrichFromGooglePlaces(placeId: string) {
  const details = await googlePlaces.placeDetails({
    placeId,
    fields: [
      'name',
      'formatted_address',
      'address_components',
      'geometry',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'opening_hours',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos',
      'url',
    ],
    language: 'es',
  });

  return transformGooglePlaceToStudio(details);
}

// Step 3: Google Reviews Scraping - Reviews & Sentiment
async function scrapeReviews(googleMapsUrl: string) {
  // Use Puppeteer/Playwright to scrape additional reviews
  // Google Places API only returns 5 reviews
  const reviews = await scrapeGoogleMapsReviews(googleMapsUrl, {
    maxReviews: 100,
    sortBy: 'newest',
  });

  // NLP sentiment analysis
  const analyzedReviews = await Promise.all(
    reviews.map(r => analyzeSentiment(r.text))
  );

  return {
    reviews: analyzedReviews,
    themes: extractCommonThemes(analyzedReviews),
    sentiment: calculateOverallSentiment(analyzedReviews),
  };
}

// Step 4: Website Scraping - Pricing & Classes
async function scrapeWebsite(websiteUrl: string) {
  const html = await fetchWebsite(websiteUrl);

  return {
    pricing: extractPricing(html),
    classes: extractClasses(html),
    instructors: extractInstructors(html),
    schedule: extractSchedule(html),
    photos: extractPhotos(html),
  };
}

// Step 5: Social Media Enrichment
async function enrichFromInstagram(handle: string) {
  // Use Instagram scraping API or Graph API
  const data = await scrapeInstagram(handle);

  return {
    followers: data.followers,
    posts: data.postsCount,
    recentPhotos: data.recentPosts.slice(0, 9),
  };
}

// Step 6: Data Quality Scoring
function calculateDataQualityScore(studio: PilatesStudio): number {
  const weights = {
    basicInfo: 20,      // name, address, phone
    contact: 10,        // website, email
    hours: 10,
    reviews: 15,        // has reviews
    pricing: 15,        // has pricing
    classes: 10,
    equipment: 10,
    media: 5,           // has photos
    social: 5,
  };

  let score = 0;

  if (studio.name && studio.address.street) score += weights.basicInfo;
  if (studio.contact.website) score += weights.contact;
  if (studio.hours) score += weights.hours;
  if (studio.reviews.googleReviewCount > 0) score += weights.reviews;
  if (studio.pricing.dropInClass) score += weights.pricing;
  if (studio.classes.types.length > 0) score += weights.classes;
  if (studio.equipment.reformers) score += weights.equipment;
  if (studio.media.photos.length > 0) score += weights.media;
  if (studio.social.instagram.handle) score += weights.social;

  return score;
}
```

### 4.3 Automation Schedule (Convex Crons)

```typescript
// convex/crons.ts

export default defineCron({
  // Daily: Update reviews for all studios
  dailyReviewsUpdate: {
    schedule: '0 2 * * *',  // 2 AM daily
    handler: async (ctx) => {
      const studios = await ctx.db.query('studios').collect();
      for (const studio of studios) {
        await scheduleReviewUpdate(ctx, studio._id);
      }
    },
  },

  // Weekly: Enrich top 100 studios with fresh data
  weeklyTopStudiosEnrichment: {
    schedule: '0 3 * * 0',  // 3 AM Sunday
    handler: async (ctx) => {
      const topStudios = await ctx.db
        .query('studios')
        .withIndex('by_rating')
        .order('desc')
        .take(100);

      for (const studio of topStudios) {
        await scheduleFullEnrichment(ctx, studio._id);
      }
    },
  },

  // Monthly: Discover new studios in all cities
  monthlyStudioDiscovery: {
    schedule: '0 4 1 * *',  // 4 AM on 1st of month
    handler: async (ctx) => {
      const cities = await ctx.db.query('cities').collect();
      for (const city of cities) {
        await scheduleStudioDiscovery(ctx, city.slug);
      }
    },
  },

  // Hourly: Process pending scraping jobs
  hourlyScrapeQueue: {
    schedule: '0 * * * *',  // Every hour
    handler: async (ctx) => {
      await processScrapeQueue(ctx);
    },
  },
});
```

---

## 5. JSON/CSV Data Interchange Formats

### 5.1 Studio Export Format (JSON)

```json
{
  "version": "1.0",
  "exportDate": "2025-09-30T12:00:00Z",
  "city": "ciudad-de-mexico",
  "studioCount": 45,
  "studios": [
    {
      "id": "uuid-here",
      "slug": "reforma-pilates",
      "name": "Reforma Pilates Studio",
      "address": {
        "street": "Paseo de la Reforma 123",
        "neighborhood": "Polanco",
        "city": "Ciudad de México",
        "state": "CDMX",
        "postalCode": "11560",
        "coordinates": {"lat": 19.4326, "lng": -99.1332}
      },
      "contact": {
        "phone": "+52 55 1234 5678",
        "website": "https://reformapilates.mx"
      },
      "reviews": {
        "googleRating": 4.8,
        "googleReviewCount": 127,
        "sentimentScores": {
          "positive": 0.85,
          "neutral": 0.10,
          "negative": 0.05
        }
      },
      "pricing": {
        "dropInClass": 350,
        "monthlyUnlimited": 3500
      },
      "metadata": {
        "dataQualityScore": 92,
        "lastUpdated": "2025-09-30T10:00:00Z"
      }
    }
  ]
}
```

### 5.2 CSV Format (for spreadsheet management)

```csv
id,slug,name,city,neighborhood,address,phone,website,googleRating,reviewCount,dropInPrice,monthlyPrice,dataQualityScore,lastUpdated
uuid-1,reforma-pilates,Reforma Pilates Studio,Ciudad de México,Polanco,"Paseo de la Reforma 123",+52 55 1234 5678,https://reformapilates.mx,4.8,127,350,3500,92,2025-09-30T10:00:00Z
uuid-2,core-studio-cdmx,Core Studio CDMX,Ciudad de México,Condesa,"Av. Amsterdam 45",+52 55 9876 5432,https://corestudio.mx,4.6,89,400,3800,88,2025-09-30T09:30:00Z
```

### 5.3 Import/Export Scripts

```typescript
// scripts/export-studios.ts
async function exportStudiosToJSON(citySlug: string) {
  const studios = await convexClient.query(api.studios.listByCity, { citySlug });

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    city: citySlug,
    studioCount: studios.length,
    studios: studios.map(s => JSON.parse(s.dataJson)),
  };

  await fs.writeFile(
    `data/exports/${citySlug}-${Date.now()}.json`,
    JSON.stringify(exportData, null, 2)
  );
}

// scripts/import-manual-updates.ts
async function importCSVUpdates(csvPath: string) {
  const csv = await fs.readFile(csvPath, 'utf-8');
  const records = parseCSV(csv);

  for (const record of records) {
    const studio = await convexClient.query(api.studios.getBySlug, {
      slug: record.slug,
    });

    if (studio) {
      const data = JSON.parse(studio.dataJson);

      // Merge manual updates
      data.pricing.dropInClass = parseFloat(record.dropInPrice) || data.pricing.dropInClass;
      data.contact.phone = record.phone || data.contact.phone;

      await convexClient.mutation(api.studios.update, {
        id: studio._id,
        dataJson: JSON.stringify(data),
      });
    }
  }
}
```

---

## 6. Priority City Rollout Plan

### Phase 1: Foundation (Weeks 1-2)
**Cities: Ciudad de México, Querétaro**

- Set up scraping infrastructure
- Build 20-30 studio profiles per city
- Validate data quality
- Create city landing pages
- Test SEO templates

**Success Metrics:**
- 50+ studios total
- 80%+ data quality score
- All tier-1 automation working

### Phase 2: Expansion (Weeks 3-4)
**Cities: Puebla, Monterrey, Guadalajara**

- Scale scraping to 3 more cities
- Refine pricing collection
- Add neighborhood pages
- Implement review sentiment analysis

**Success Metrics:**
- 150+ studios total
- Neighborhood-level SEO pages
- Review themes extraction working

### Phase 3: Coastal Addition (Week 5)
**Cities: Mazatlán**

- Test in smaller market
- Validate templates work for lower-density cities
- Refine data quality scoring

**Success Metrics:**
- Complete coverage of 7 priority cities
- 200+ studios total

### Phase 4: Scale to 100 Cities (Weeks 6-12)
**Cities: Top 93 Mexican cities by population**

- Automated city onboarding
- Batch scraping jobs
- Minimal manual intervention
- Focus on tier-1 automation

**Target:**
- 2000-5000 studios
- 80%+ coverage of major markets

---

## 7. SEO Strategy

### 7.1 Page Templates

**City Directory Page**
```
Title: "Los Mejores Estudios de Pilates en {Ciudad} - Precios, Horarios y Reseñas"
URL: /estudios-de-pilates/{ciudad-slug}
H1: "Estudios de Pilates en {Ciudad}"
Meta: "Encuentra los mejores estudios de Pilates en {Ciudad}. Compara precios, horarios, reseñas y ubicaciones. Lista actualizada 2025."

Content Sections:
- Hero with city name and studio count
- Interactive map of studios
- Filter by neighborhood, price, rating
- Studio cards grid (12 per page)
- "Por qué elegir Pilates en {Ciudad}" section
- Neighborhood guides
- FAQs specific to city
```

**Studio Detail Page**
```
Title: "{Studio Name} - Pilates en {Neighborhood}, {Ciudad} | Precios y Reseñas"
URL: /estudios-de-pilates/{ciudad-slug}/{studio-slug}
H1: "{Studio Name}"
Meta: "{Studio Name} en {Neighborhood}, {Ciudad}. ⭐ {Rating} ({ReviewCount} reseñas). Clases desde ${Price}. Horarios, precios y cómo llegar."

Content Sections:
- Hero with name, rating, address
- Quick info cards (hours, price, contact)
- Photo gallery
- Reviews section with sentiment
- Class schedule (if available)
- Instructor profiles
- Equipment list
- Amenities checklist
- Map and directions
- Nearby studios comparison
- FAQ
```

**Neighborhood Page**
```
Title: "Estudios de Pilates en {Neighborhood}, {Ciudad} - Guía Completa 2025"
URL: /estudios-de-pilates/{ciudad-slug}/{neighborhood-slug}
```

### 7.2 Schema Markup (JSON-LD)

```typescript
function generateStudioSchemaMarkup(studio: PilatesStudio) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": studio.name,
    "image": studio.media.photos.map(p => p.url),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": studio.address.street,
      "addressLocality": studio.address.city,
      "addressRegion": studio.address.state,
      "postalCode": studio.address.postalCode,
      "addressCountry": "MX",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": studio.address.coordinates.lat,
      "longitude": studio.address.coordinates.lng,
    },
    "telephone": studio.contact.phone,
    "url": studio.contact.website,
    "priceRange": studio.pricing.dropInClass
      ? `$${studio.pricing.dropInClass} - $${studio.pricing.monthlyUnlimited || studio.pricing.dropInClass * 10}`
      : undefined,
    "aggregateRating": studio.reviews.googleRating ? {
      "@type": "AggregateRating",
      "ratingValue": studio.reviews.googleRating,
      "reviewCount": studio.reviews.googleReviewCount,
      "bestRating": 5,
      "worstRating": 1,
    } : undefined,
    "openingHoursSpecification": generateOpeningHoursSpec(studio.hours),
  };
}
```

### 7.3 Internal Linking Strategy

- City page → All studio pages in city
- Studio page → City page, neighborhood page, nearby studios
- Neighborhood page → All studios in neighborhood
- Cross-city comparisons for major metros
- "Best studios in X" editorial content linking to directory

---

## 8. Data Freshness & Maintenance

### 8.1 Update Frequency

| Data Type | Update Frequency | Method |
|-----------|------------------|---------|
| Reviews | Daily | Automated scrape |
| Hours | Weekly | API check |
| Pricing | Monthly | Semi-automated |
| Class Schedule | Weekly | Website scrape |
| Photos | Monthly | Social media |
| Contact Info | Quarterly | Verification |
| Amenities | Quarterly | Manual review |

### 8.2 Data Validation

```typescript
async function validateStudioData(studio: PilatesStudio) {
  const issues: string[] = [];

  // Check phone format
  if (studio.contact.phone && !isValidMexicanPhone(studio.contact.phone)) {
    issues.push('Invalid phone format');
  }

  // Check website is accessible
  if (studio.contact.website) {
    const isOnline = await checkWebsiteStatus(studio.contact.website);
    if (!isOnline) issues.push('Website unreachable');
  }

  // Check stale data
  const daysSinceUpdate = getDaysSince(studio.metadata.updatedAt);
  if (daysSinceUpdate > 90) {
    issues.push('Data older than 90 days');
  }

  // Check review freshness
  const daysSinceReviewUpdate = getDaysSince(studio.reviews.lastScraped);
  if (daysSinceReviewUpdate > 7) {
    issues.push('Reviews need update');
  }

  return {
    isValid: issues.length === 0,
    issues,
    score: calculateDataQualityScore(studio),
  };
}
```

---

## 9. User Experience Features

### 9.1 Search & Filter System

```typescript
interface SearchFilters {
  city: string;
  neighborhood?: string;
  priceRange?: [number, number];        // [min, max] in MXN
  minRating?: number;                   // 0-5
  hasOnlineBooking?: boolean;
  wheelchairAccessible?: boolean;
  hasParking?: boolean;
  classTypes?: string[];                // e.g., ["reformer", "prenatal"]
  openNow?: boolean;
  sortBy?: 'rating' | 'reviewCount' | 'price' | 'distance';
}

// Example query
const results = await searchStudios({
  city: 'ciudad-de-mexico',
  neighborhood: 'polanco',
  priceRange: [200, 500],
  minRating: 4.0,
  hasOnlineBooking: true,
  sortBy: 'rating',
});
```

### 9.2 Interactive Map

- Cluster studios by proximity
- Filter markers by search criteria
- Click marker → studio preview card
- Get directions integration
- Show nearby metro stations

### 9.3 Studio Comparison Tool

Allow users to compare 2-3 studios side-by-side:
- Pricing comparison
- Review scores
- Amenities checklist
- Distance comparison
- Class offerings

---

## 10. Technical Implementation

### 10.1 Scraping Stack

```typescript
// Use Playwright for dynamic content
import { chromium } from 'playwright';

// Google Places API for official data
import { Client } from '@googlemaps/google-maps-services-js';

// Sentiment analysis
import { Sentiment } from 'sentiment';

// Rate limiting
import Bottleneck from 'bottleneck';
```

### 10.2 API Endpoints

```typescript
// convex/studios.ts

// Public queries
export const listByCity = query({
  args: { citySlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('studios')
      .withIndex('by_city', q => q.eq('citySlug', args.citySlug))
      .collect();
  },
});

export const search = query({
  args: {
    citySlug: v.string(),
    filters: v.optional(v.object({
      minRating: v.optional(v.number()),
      maxPrice: v.optional(v.number()),
      neighborhood: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('studios')
      .withIndex('by_city', q => q.eq('citySlug', args.citySlug));

    const results = await query.collect();

    // Client-side filtering (Convex doesn't support complex queries)
    return results.filter(studio => {
      if (args.filters?.minRating && studio.googleRating < args.filters.minRating) {
        return false;
      }
      if (args.filters?.maxPrice && studio.dropInPrice > args.filters.maxPrice) {
        return false;
      }
      if (args.filters?.neighborhood && studio.addressNeighborhood !== args.filters.neighborhood) {
        return false;
      }
      return true;
    });
  },
});

// Admin mutations
export const createOrUpdateStudio = mutation({
  args: {
    slug: v.string(),
    dataJson: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('studios')
      .withIndex('by_slug', q => q.eq('slug', args.slug))
      .first();

    const data = JSON.parse(args.dataJson);

    if (existing) {
      await ctx.db.patch(existing._id, {
        dataJson: args.dataJson,
        updatedAt: Date.now(),
        dataQualityScore: calculateDataQualityScore(data),
      });
      return existing._id;
    } else {
      return await ctx.db.insert('studios', {
        slug: args.slug,
        googlePlaceId: data.googlePlaceId,
        name: data.name,
        citySlug: data.address.city.toLowerCase().replace(/ /g, '-'),
        addressStreet: data.address.street,
        addressNeighborhood: data.address.neighborhood,
        addressCity: data.address.city,
        addressState: data.address.state,
        addressPostalCode: data.address.postalCode,
        lat: data.address.coordinates.lat,
        lng: data.address.coordinates.lng,
        phone: data.contact.phone,
        website: data.contact.website,
        googleRating: data.reviews.googleRating,
        googleReviewCount: data.reviews.googleReviewCount,
        reviewsLastScraped: Date.now(),
        dropInPrice: data.pricing.dropInClass,
        monthlyPrice: data.pricing.monthlyUnlimited,
        dataJson: args.dataJson,
        verified: false,
        featured: false,
        dataQualityScore: calculateDataQualityScore(data),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
```

### 10.3 React Components

```typescript
// src/components/studios/StudioCard.tsx
interface StudioCardProps {
  studio: PilatesStudio;
  showDistance?: boolean;
}

export function StudioCard({ studio, showDistance }: StudioCardProps) {
  return (
    <Card>
      <CardImage src={studio.media.photos[0]?.url} />
      <CardContent>
        <h3>{studio.name}</h3>
        <div className="rating">
          <StarRating value={studio.reviews.googleRating} />
          <span>({studio.reviews.googleReviewCount} reseñas)</span>
        </div>
        <p>{studio.address.neighborhood}, {studio.address.city}</p>
        {studio.pricing.dropInClass && (
          <p className="price">Desde ${studio.pricing.dropInClass} MXN</p>
        )}
        <Link to={`/estudios-de-pilates/${studio.citySlug}/${studio.slug}`}>
          Ver detalles
        </Link>
      </CardContent>
    </Card>
  );
}

// src/components/studios/StudioSearch.tsx
export function StudioSearch({ city }: { city: string }) {
  const [filters, setFilters] = useState<SearchFilters>({
    city,
    sortBy: 'rating',
  });

  const studios = useQuery(api.studios.search, {
    citySlug: city,
    filters
  });

  return (
    <div>
      <SearchFilters filters={filters} onChange={setFilters} />
      <StudioGrid studios={studios || []} />
    </div>
  );
}
```

---

## 11. Monetization Opportunities

1. **Premium Listings**: Featured placement, extra photos, video tour
2. **Booking Integration**: Commission on bookings made through site
3. **Advertising**: Display ads for Pilates equipment, apparel
4. **Lead Generation**: Capture email for studios, charge per lead
5. **API Access**: Sell data access to aggregators, apps
6. **Affiliate Programs**: Partner with ClassPass, Gympass, etc.
7. **Content Sponsorship**: "Best studios in X" sponsored content

---

## 12. Success Metrics & KPIs

### 12.1 Data Coverage Metrics
- Studios per city (target: 80%+ of all studios)
- Data quality score (target: 85%+ average)
- Automated vs manual data (target: 70%+ automated)
- Review freshness (target: <7 days old)

### 12.2 SEO Metrics
- Organic traffic per city page
- Rankings for "[ciudad] pilates" searches
- Click-through rate from search
- Bounce rate (<60% target)

### 12.3 User Engagement
- Average session duration (target: 3+ min)
- Pages per session (target: 2.5+)
- Search filter usage
- Map interaction rate
- Studio page visits → website clicks

---

## 13. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Google rate limiting | Implement delays, use multiple API keys, cache aggressively |
| Stale data | Automated freshness checks, user reporting, quarterly audits |
| Inaccurate pricing | Manual verification for top studios, user feedback system |
| Copyright (photos) | Only use Google-licensed photos or request from studios |
| Scraping detection | Use residential proxies, mimic human behavior, respect robots.txt |
| Scale costs | Start with 7 cities, validate ROI before scaling to 100 |

---

## 14. Next Steps (Immediate Actions)

### Week 1 Tasks:
1. Set up Google Places API credentials
2. Create initial city list (7 priorities + 93 expansion)
3. Build `PilatesStudio` TypeScript interface
4. Implement basic Google Places scraper
5. Set up Convex `studios` and `cities` tables
6. Create first 10 studio profiles manually (as templates)

### Week 2 Tasks:
7. Build automated scraping pipeline
8. Create city directory page template
9. Create studio detail page template
10. Implement schema markup
11. Test with Ciudad de México (target: 30 studios)
12. Set up data quality monitoring

### Week 3-4 Tasks:
13. Scale to all 7 priority cities
14. Implement review scraping
15. Build search/filter UI
16. Create interactive map
17. Set up automated cron jobs
18. Launch beta version

---

## 15. File Structure Summary

```
Final Directory Structure:

/Users/m3max361tb/Documents/Code/Pilates_Reformer/
├── convex/
│   ├── schema.ts (add studios, cities tables)
│   ├── studios.ts (queries & mutations)
│   ├── cities.ts
│   ├── scraping.ts (scraping jobs)
│   └── crons.ts (automated jobs)
├── src/
│   ├── content/
│   │   └── studios/
│   │       ├── ciudad-de-mexico/
│   │       ├── queretaro/
│   │       └── [98 more cities]/
│   ├── pages/
│   │   └── studios/
│   │       ├── [city]/
│   │       │   ├── index.tsx
│   │       │   └── [slug].tsx
│   │       └── index.tsx
│   ├── components/
│   │   └── studios/
│   │       ├── StudioCard.tsx
│   │       ├── StudioSearch.tsx
│   │       ├── StudioMap.tsx
│   │       └── StudioFilters.tsx
│   └── lib/
│       └── scraping/
│           ├── google-places.ts
│           ├── reviews.ts
│           ├── sentiment.ts
│           └── enrichment.ts
├── scripts/
│   ├── scrape-city.ts
│   ├── enrich-studios.ts
│   ├── export-data.ts
│   └── validate-data.ts
├── data/
│   ├── cities.json
│   ├── studios/
│   └── exports/
└── PILATES_DIRECTORY_IMPLEMENTATION_PLAN.md (this file)
```

---

## Conclusion

This plan provides a complete blueprint for building a scalable Pilates studio directory with:

- **Automated data collection** reducing manual work by 70%+
- **Structured schemas** for consistency and scalability
- **SEO-optimized** templates for organic traffic
- **Clear expansion path** from 7 to 100+ cities
- **Data quality** monitoring and validation
- **User-centric** search and discovery features

The system is designed to start small (7 cities), validate the approach, and scale efficiently to cover all major Mexican cities with minimal incremental effort per city.

**Estimated Timeline:** 8-12 weeks from inception to 100-city launch
**Estimated Cost:** Google API costs + scraping infrastructure ($200-500/month)
**Expected Output:** 2000-5000 studio profiles with 85%+ data quality scores
