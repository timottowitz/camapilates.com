/**
 * Studio Scraping Example Script
 *
 * This is a reference implementation showing how to scrape studio data
 * from Google Places API and enrich with additional sources.
 *
 * USAGE:
 *   npm install @googlemaps/google-maps-services-js
 *   export GOOGLE_MAPS_API_KEY="your-key-here"
 *   npx tsx scripts/scrape-studios-example.ts ciudad-de-mexico
 */

import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import type {
  PilatesStudio,
  GooglePlaceResult,
  City,
  ScrapingJob,
} from '../src/types/studio';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const googleMapsClient = new GoogleMapsClient({});

const SEARCH_QUERIES = [
  'Pilates',
  'Estudio de Pilates',
  'Pilates reformer',
  'Clases de Pilates',
  'Pilates studio',
];

// ============================================================================
// MAIN SCRAPING FUNCTIONS
// ============================================================================

/**
 * Step 1: Discover studios in a city using Google Places Text Search
 */
async function discoverStudios(city: City): Promise<GooglePlaceResult[]> {
  console.log(`🔍 Discovering studios in ${city.name}...`);

  const allPlaces: Map<string, GooglePlaceResult> = new Map();

  for (const query of SEARCH_QUERIES) {
    const searchQuery = `${query} ${city.name}`;
    console.log(`   Searching: "${searchQuery}"`);

    try {
      const response = await googleMapsClient.textSearch({
        params: {
          query: searchQuery,
          location: city.coordinates,
          radius: 50000, // 50km
          language: 'es',
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.results) {
        for (const place of response.data.results) {
          // Deduplicate by place_id
          if (place.place_id && !allPlaces.has(place.place_id)) {
            allPlaces.set(place.place_id, place as GooglePlaceResult);
          }
        }
      }

      // Rate limiting
      await sleep(1000);
    } catch (error) {
      console.error(`   ❌ Error searching "${searchQuery}":`, error);
    }
  }

  const studios = Array.from(allPlaces.values());
  console.log(`✅ Found ${studios.length} unique studios`);

  return studios;
}

/**
 * Step 2: Get detailed information for a studio from Google Places
 */
async function getStudioDetails(placeId: string): Promise<any> {
  try {
    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'name',
          'formatted_address',
          'address_component',
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
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    await sleep(500); // Rate limiting

    return response.data.result;
  } catch (error) {
    console.error(`❌ Error fetching details for ${placeId}:`, error);
    return null;
  }
}

/**
 * Step 3: Transform Google Place data to PilatesStudio format
 */
function transformGooglePlaceToStudio(
  placeDetails: any,
  city: City
): Partial<PilatesStudio> {
  // Parse address components
  const addressComponents = placeDetails.address_components || [];
  const neighborhood = findAddressComponent(addressComponents, 'sublocality') ||
                       findAddressComponent(addressComponents, 'neighborhood');
  const postalCode = findAddressComponent(addressComponents, 'postal_code');
  const state = findAddressComponent(addressComponents, 'administrative_area_level_1');

  // Parse opening hours
  const hours = parseOpeningHours(placeDetails.opening_hours);

  // Generate slug
  const slug = generateSlug(placeDetails.name);

  // Build studio object
  const studio: Partial<PilatesStudio> = {
    id: uuidv4(),
    slug,
    googlePlaceId: placeDetails.place_id,
    name: placeDetails.name,
    legalName: null,
    brand: null,

    address: {
      street: extractStreetAddress(placeDetails.formatted_address),
      neighborhood,
      city: city.name,
      state: state || city.state,
      postalCode: postalCode || '',
      country: 'México',
      coordinates: {
        lat: placeDetails.geometry?.location?.lat || 0,
        lng: placeDetails.geometry?.location?.lng || 0,
      },
      formattedAddress: placeDetails.formatted_address,
    },

    contact: {
      phone: placeDetails.formatted_phone_number || null,
      whatsapp: null, // Usually same as phone in Mexico
      email: null,
      website: placeDetails.website || null,
      bookingUrl: null,
    },

    hours,

    reviews: {
      googleRating: placeDetails.rating || null,
      googleReviewCount: placeDetails.user_ratings_total || 0,
      googleReviewsUrl: placeDetails.url || null,
      lastScraped: new Date().toISOString(),
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      sentimentScores: {
        positive: 0,
        neutral: 0,
        negative: 0,
        overallSentiment: 'neutral',
      },
      commonThemes: {
        instructorQuality: 0,
        cleanliness: 0,
        equipment: 0,
        atmosphere: 0,
        customerService: 0,
        pricingValue: 0,
      },
      recentReviews: parseReviews(placeDetails.reviews || []),
    },

    pricing: {
      currency: 'MXN',
      dropInClass: null,
      classPackages: [],
      monthlyUnlimited: null,
      membershipOptions: [],
      promotions: [],
      lastUpdated: new Date().toISOString(),
      source: 'google',
    },

    classes: {
      types: [],
      schedule: null,
      levels: [],
      specialties: [],
      maxClassSize: null,
    },

    equipment: {
      reformers: null,
      cadillac: false,
      wundaChair: false,
      barrels: false,
      matOnly: false,
      brands: [],
    },

    instructors: {
      count: null,
      headInstructor: null,
      certifications: [],
      profiles: [],
    },

    amenities: {
      parking: null,
      showers: null,
      lockers: null,
      wifi: null,
      airConditioning: null,
      changingRooms: null,
      waterStation: null,
      retailShop: null,
    },

    accessibility: {
      wheelchairAccessible: null,
      elevator: null,
      groundFloor: null,
      accessibleBathroom: null,
    },

    transportation: {
      nearbyMetro: null,
      nearbyBusStops: null,
      parkingInfo: null,
    },

    media: {
      logo: null,
      photos: parsePhotos(placeDetails.photos || []),
      virtualTour: null,
      videoUrl: null,
    },

    social: {
      instagram: {
        handle: null,
        followers: null,
        posts: null,
        lastUpdated: null,
      },
      facebook: {
        url: null,
        likes: null,
        lastUpdated: null,
      },
      tiktok: null,
      youtube: null,
    },

    booking: {
      hasOnlineBooking: false,
      systems: [],
      requiresMembership: null,
      allowsDropIns: null,
    },

    metadata: {
      verified: false,
      featured: false,
      claimedByOwner: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVerified: null,
      dataQualityScore: 0,
      scrapingSources: ['google_places'],
      automationStatus: {
        basicInfo: 'complete',
        reviews: 'partial',
        pricing: 'pending',
        schedule: 'pending',
        media: 'partial',
      },
    },

    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      schemaMarkup: {},
    },
  };

  // Calculate data quality score
  studio.metadata!.dataQualityScore = calculateDataQualityScore(studio);

  // Generate SEO fields
  studio.seo = generateSEO(studio, city);

  return studio;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function findAddressComponent(components: any[], type: string): string | null {
  const component = components.find((c) => c.types?.includes(type));
  return component?.long_name || null;
}

function extractStreetAddress(formattedAddress: string): string {
  // Extract street from formatted address (before first comma)
  return formattedAddress.split(',')[0] || formattedAddress;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function parseOpeningHours(openingHours: any): any {
  if (!openingHours?.periods) {
    return {
      monday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      tuesday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      wednesday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      thursday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      friday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      saturday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      sunday: [{ open: '', close: '', is24Hours: false, isClosed: true }],
      timezone: 'America/Mexico_City',
    };
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours: any = {};

  days.forEach((day, index) => {
    hours[day] = [];
  });

  openingHours.periods.forEach((period: any) => {
    const dayIndex = period.open?.day;
    if (dayIndex !== undefined) {
      const dayName = days[dayIndex];
      hours[dayName].push({
        open: period.open?.time ? formatTime(period.open.time) : '',
        close: period.close?.time ? formatTime(period.close.time) : '',
        is24Hours: false,
        isClosed: false,
      });
    }
  });

  hours.timezone = 'America/Mexico_City';

  return hours;
}

function formatTime(time: string): string {
  // Convert "0900" to "09:00"
  return `${time.slice(0, 2)}:${time.slice(2)}`;
}

function parseReviews(reviews: any[]): any[] {
  return reviews.slice(0, 5).map((review) => ({
    id: uuidv4(),
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    date: new Date(review.time * 1000).toISOString(),
    helpful: null,
    response: null,
    sentiment: 'neutral',
    themes: [],
  }));
}

function parsePhotos(photos: any[]): any[] {
  return photos.slice(0, 10).map((photo) => ({
    url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
    caption: null,
    source: 'google',
  }));
}

function calculateDataQualityScore(studio: Partial<PilatesStudio>): number {
  let score = 0;

  if (studio.name && studio.address?.street) score += 20;
  if (studio.contact?.website) score += 10;
  if (studio.hours) score += 10;
  if (studio.reviews?.googleReviewCount && studio.reviews.googleReviewCount > 0) score += 15;
  if (studio.pricing?.dropInClass) score += 15;
  if (studio.classes?.types && studio.classes.types.length > 0) score += 10;
  if (studio.equipment?.reformers) score += 10;
  if (studio.media?.photos && studio.media.photos.length > 0) score += 5;
  if (studio.social?.instagram?.handle) score += 5;

  return score;
}

function generateSEO(studio: Partial<PilatesStudio>, city: City): any {
  const name = studio.name || '';
  const neighborhood = studio.address?.neighborhood || '';
  const rating = studio.reviews?.googleRating || 0;
  const reviewCount = studio.reviews?.googleReviewCount || 0;

  return {
    metaTitle: `${name} - Pilates en ${neighborhood}, ${city.name} | Precios y Reseñas`,
    metaDescription: `${name} en ${neighborhood}, ${city.name}. ${rating > 0 ? `⭐ ${rating} (${reviewCount} reseñas)` : ''}. Horarios, precios y cómo llegar.`,
    keywords: [
      `pilates ${neighborhood.toLowerCase()}`,
      `pilates ${city.name.toLowerCase()}`,
      `estudio pilates ${city.name.toLowerCase()}`,
      name.toLowerCase(),
    ],
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name,
      address: studio.address,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: studio.address?.coordinates.lat,
        longitude: studio.address?.coordinates.lng,
      },
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const citySlug = process.argv[2] || 'ciudad-de-mexico';

  console.log('🚀 Pilates Studio Scraper');
  console.log('========================\n');

  // Load cities data
  const citiesData = await import('../data/cities.json');
  const city = citiesData.cities.find((c: City) => c.slug === citySlug);

  if (!city) {
    console.error(`❌ City "${citySlug}" not found`);
    process.exit(1);
  }

  console.log(`📍 Target City: ${city.name}`);
  console.log(`   Priority: ${city.priority}`);
  console.log(`   Population: ${city.population.toLocaleString()}\n`);

  // Step 1: Discover studios
  const googlePlaces = await discoverStudios(city);

  // Step 2: Get details for each studio
  console.log(`\n📋 Fetching details for ${googlePlaces.length} studios...`);
  const studios: Partial<PilatesStudio>[] = [];

  for (let i = 0; i < googlePlaces.length; i++) {
    const place = googlePlaces[i];
    console.log(`   [${i + 1}/${googlePlaces.length}] ${place.name}`);

    const details = await getStudioDetails(place.place_id);
    if (details) {
      const studio = transformGooglePlaceToStudio(details, city);
      studios.push(studio);
    }
  }

  console.log(`\n✅ Successfully scraped ${studios.length} studios`);

  // Step 3: Save results
  const outputPath = `./data/studios/${citySlug}.json`;
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    city: citySlug,
    studioCount: studios.length,
    studios,
  };

  // In a real implementation, you would:
  // 1. Save to file system
  // 2. Upload to Convex database
  // 3. Trigger enrichment jobs

  console.log(`\n💾 Data would be saved to: ${outputPath}`);
  console.log('\n📊 Summary:');
  console.log(`   Total studios: ${studios.length}`);
  console.log(`   Avg quality score: ${(studios.reduce((sum, s) => sum + (s.metadata?.dataQualityScore || 0), 0) / studios.length).toFixed(1)}`);
  console.log(`   With websites: ${studios.filter((s) => s.contact?.website).length}`);
  console.log(`   With reviews: ${studios.filter((s) => (s.reviews?.googleReviewCount || 0) > 0).length}`);
  console.log(`   With photos: ${studios.filter((s) => (s.media?.photos?.length || 0) > 0).length}`);

  console.log('\n✅ Scraping complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  discoverStudios,
  getStudioDetails,
  transformGooglePlaceToStudio,
  calculateDataQualityScore,
};
