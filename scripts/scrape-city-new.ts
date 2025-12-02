#!/usr/bin/env tsx
/**
 * Enhanced scraping script using Google Places API (New)
 * Better data quality and more features
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from 'csv-stringify/sync';
import GooglePlacesNewService, { PlaceNewSearchResult } from '../src/services/google-places-new';
import { generateCityQueries, PRIORITY_CITIES } from '../src/utils/search-queries';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface StudioData {
  place_id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  rating: number | null;
  review_count: number | null;
  price_level: string | null;
  price_min: number | null;
  price_max: number | null;
  business_status: string | null;
  hours: string | null;
  types: string;
  photos: string;
  data_quality_score: number;
  has_accessibility: boolean;
  has_parking: boolean;
  accepts_credit_cards: boolean;
  scraped_at: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { city: string; output?: string; enrichDetails?: boolean } {
  const args = process.argv.slice(2);
  const cityIndex = args.indexOf('--city');
  const outputIndex = args.indexOf('--output');
  const enrichIndex = args.indexOf('--enrich');

  if (cityIndex === -1 || !args[cityIndex + 1]) {
    console.error('Error: --city argument is required');
    console.log('Usage: tsx scripts/scrape-city-new.ts --city "Ciudad de México" [--output output.csv] [--enrich]');
    process.exit(1);
  }

  return {
    city: args[cityIndex + 1],
    output: outputIndex !== -1 ? args[outputIndex + 1] : undefined,
    enrichDetails: enrichIndex !== -1,
  };
}

/**
 * Generate slug from studio name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
}

/**
 * Calculate data quality score (0-100)
 */
function calculateQualityScore(studio: Partial<StudioData>): number {
  let score = 0;
  const weights = {
    name: 10,
    address: 10,
    phone: 10,
    website: 10,
    rating: 10,
    review_count: 5,
    hours: 10,
    photos: 5,
    neighborhood: 5,
    postal_code: 5,
    price_level: 5,
    google_maps_url: 5,
    business_status: 10,
    accessibility: 5,
  };

  if (studio.name) score += weights.name;
  if (studio.address) score += weights.address;
  if (studio.phone) score += weights.phone;
  if (studio.website) score += weights.website;
  if (studio.rating && studio.rating > 0) score += weights.rating;
  if (studio.review_count && studio.review_count > 0) score += weights.review_count;
  if (studio.hours) score += weights.hours;
  if (studio.photos && studio.photos !== '[]') score += weights.photos;
  if (studio.neighborhood) score += weights.neighborhood;
  if (studio.postal_code) score += weights.postal_code;
  if (studio.price_level) score += weights.price_level;
  if (studio.google_maps_url) score += weights.google_maps_url;
  if (studio.business_status === 'OPERATIONAL') score += weights.business_status;
  if (studio.has_accessibility) score += weights.accessibility;

  return Math.round(score);
}

/**
 * Transform Place result to StudioData
 */
function transformToStudioData(
  place: PlaceNewSearchResult,
  cityName: string,
  stateName: string,
  service: GooglePlacesNewService
): StudioData {
  const neighborhood = service.extractNeighborhood(place.addressComponents, place.formattedAddress);
  const postalCode = service.extractPostalCode(place.addressComponents);

  const photos = place.photos
    ? place.photos.slice(0, 5).map(p => service.getPhotoUrl(p.name))
    : [];

  const priceRange = service.convertPriceLevel(place.priceLevel);

  const studio: Partial<StudioData> = {
    place_id: place.id,
    name: place.displayName?.text || '',
    slug: generateSlug(place.displayName?.text || ''),
    address: place.formattedAddress || '',
    neighborhood,
    city: cityName,
    state: stateName,
    postal_code: postalCode,
    country: 'México',
    lat: place.location?.latitude || 0,
    lng: place.location?.longitude || 0,
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
    website: place.websiteUri || null,
    google_maps_url: place.googleMapsUri || null,
    rating: place.rating || null,
    review_count: place.userRatingCount || null,
    price_level: place.priceLevel || null,
    price_min: priceRange?.min || null,
    price_max: priceRange?.max || null,
    business_status: place.businessStatus || null,
    hours: place.regularOpeningHours?.weekdayDescriptions?.join(' | ') || null,
    types: place.types?.join(', ') || '',
    photos: JSON.stringify(photos),
    has_accessibility: place.accessibilityOptions?.wheelchairAccessibleEntrance || false,
    has_parking: place.parkingOptions?.freeParkingLot || place.parkingOptions?.paidParkingLot || false,
    accepts_credit_cards: place.paymentOptions?.acceptsCreditCards || false,
    scraped_at: new Date().toISOString(),
  };

  studio.data_quality_score = calculateQualityScore(studio);

  return studio as StudioData;
}

/**
 * Deduplicate studios by place ID
 */
function deduplicateStudios(studios: StudioData[]): StudioData[] {
  const seen = new Set<string>();
  const unique: StudioData[] = [];

  for (const studio of studios) {
    if (!seen.has(studio.place_id)) {
      seen.add(studio.place_id);
      unique.push(studio);
    }
  }

  return unique;
}

/**
 * Main scraping function using new API
 */
async function scrapeCityNew(cityName: string, enrichDetails: boolean = false): Promise<StudioData[]> {
  // Find city data
  const cityData = PRIORITY_CITIES.find(c =>
    c.name === cityName || c.aliases.includes(cityName)
  );

  if (!cityData) {
    console.warn(`City "${cityName}" not found in priority cities. Using basic configuration.`);
  }

  // Initialize Google Places service
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not found in environment variables');
  }

  const service = new GooglePlacesNewService(apiKey);

  // Generate search queries
  const queries = generateCityQueries(cityName, cityData?.neighborhoods);

  console.log(`\n📍 Scraping Pilates studios in ${cityName} (Using New Places API)`);
  console.log(`📝 Generated ${queries.length} search queries`);

  // City coordinates for location bias
  const cityCoordinates = cityData ?
    { lat: 19.4326, lng: -99.1332, radius: 20000 } : // Default to CDMX
    undefined;

  // Execute searches
  const allResults: PlaceNewSearchResult[] = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n[${i + 1}/${queries.length}] Searching: "${query}"`);

    try {
      const results = await service.searchPlacesText(query, cityCoordinates);
      console.log(`  ✓ Found ${results.length} results`);

      // Filter for Pilates-related results
      const filteredResults = results.filter(place => {
        const name = place.displayName?.text?.toLowerCase() || '';
        const types = place.types || [];
        return name.includes('pilates') ||
               name.includes('reformer') ||
               name.includes('fitness') ||
               types.includes('gym') ||
               types.includes('health');
      });

      console.log(`  ✓ ${filteredResults.length} Pilates-related results`);
      allResults.push(...filteredResults);
    } catch (error) {
      console.error(`  ✗ Error searching "${query}":`, error);
    }

    // Small delay between queries
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Deduplicate results
  console.log(`\n🔍 Processing ${allResults.length} total results`);

  // Transform to studio data
  const studios: StudioData[] = [];
  const stateName = getStateName(cityName);
  const processedIds = new Set<string>();

  for (let i = 0; i < allResults.length; i++) {
    const place = allResults[i];

    // Skip if already processed
    if (processedIds.has(place.id)) continue;
    processedIds.add(place.id);

    console.log(`\n[${studios.length + 1}] Processing: ${place.displayName?.text}`);

    let detailedPlace = place;

    if (enrichDetails) {
      try {
        console.log('  Fetching detailed information...');
        detailedPlace = await service.getPlaceDetails(place.id);
        console.log('  ✓ Details retrieved');
      } catch (error) {
        console.error('  ✗ Error fetching details:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const studioData = transformToStudioData(detailedPlace, cityName, stateName, service);
    studios.push(studioData);

    console.log(`  Quality Score: ${studioData.data_quality_score}/100`);
    if (studioData.has_accessibility) console.log('  ✓ Wheelchair accessible');
    if (studioData.has_parking) console.log('  ✓ Has parking');
    if (studioData.accepts_credit_cards) console.log('  ✓ Accepts credit cards');
  }

  return deduplicateStudios(studios);
}

/**
 * Get state name for a city
 */
function getStateName(cityName: string): string {
  const cityStateMap: { [key: string]: string } = {
    'Ciudad de México': 'Ciudad de México',
    'CDMX': 'Ciudad de México',
    'Querétaro': 'Querétaro',
    'Puebla': 'Puebla',
    'Monterrey': 'Nuevo León',
    'Guadalajara': 'Jalisco',
    'Mazatlán': 'Sinaloa',
    'Tijuana': 'Baja California',
  };

  return cityStateMap[cityName] || 'Unknown';
}

/**
 * Export studios to CSV
 */
function exportToCSV(studios: StudioData[], outputPath: string): void {
  const csv = stringify(studios, {
    header: true,
    columns: [
      'place_id',
      'name',
      'slug',
      'address',
      'neighborhood',
      'city',
      'state',
      'postal_code',
      'country',
      'lat',
      'lng',
      'phone',
      'website',
      'google_maps_url',
      'rating',
      'review_count',
      'price_level',
      'price_min',
      'price_max',
      'business_status',
      'hours',
      'types',
      'photos',
      'has_accessibility',
      'has_parking',
      'accepts_credit_cards',
      'data_quality_score',
      'scraped_at',
    ],
  });

  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`\n✅ Exported ${studios.length} studios to ${outputPath}`);
}

/**
 * Generate summary statistics
 */
function printSummary(studios: StudioData[]): void {
  if (studios.length === 0) {
    console.log('\n⚠️ No studios found');
    return;
  }

  const avgQuality = studios.reduce((sum, s) => sum + s.data_quality_score, 0) / studios.length;
  const withWebsite = studios.filter(s => s.website).length;
  const withPhone = studios.filter(s => s.phone).length;
  const withRating = studios.filter(s => s.rating && s.rating > 0).length;
  const avgRating = studios
    .filter(s => s.rating)
    .reduce((sum, s) => sum + (s.rating || 0), 0) / (withRating || 1);

  const withAccessibility = studios.filter(s => s.has_accessibility).length;
  const withParking = studios.filter(s => s.has_parking).length;
  const acceptsCards = studios.filter(s => s.accepts_credit_cards).length;

  console.log('\n📊 Summary Statistics:');
  console.log('━'.repeat(40));
  console.log(`Total studios found: ${studios.length}`);
  console.log(`Average data quality: ${avgQuality.toFixed(1)}/100`);
  console.log(`Studios with website: ${withWebsite} (${((withWebsite / studios.length) * 100).toFixed(1)}%)`);
  console.log(`Studios with phone: ${withPhone} (${((withPhone / studios.length) * 100).toFixed(1)}%)`);
  console.log(`Studios with rating: ${withRating} (${((withRating / studios.length) * 100).toFixed(1)}%)`);
  console.log(`Average rating: ${avgRating.toFixed(2)} ⭐`);

  console.log('\n🏢 Accessibility & Amenities:');
  console.log(`Wheelchair accessible: ${withAccessibility} (${((withAccessibility / studios.length) * 100).toFixed(1)}%)`);
  console.log(`Has parking: ${withParking} (${((withParking / studios.length) * 100).toFixed(1)}%)`);
  console.log(`Accepts credit cards: ${acceptsCards} (${((acceptsCards / studios.length) * 100).toFixed(1)}%)`);

  // Quality distribution
  const quality80Plus = studios.filter(s => s.data_quality_score >= 80).length;
  const quality60Plus = studios.filter(s => s.data_quality_score >= 60 && s.data_quality_score < 80).length;
  const qualityBelow60 = studios.filter(s => s.data_quality_score < 60).length;

  console.log('\n📈 Quality Distribution:');
  console.log(`  High (80-100): ${quality80Plus} studios`);
  console.log(`  Medium (60-79): ${quality60Plus} studios`);
  console.log(`  Low (<60): ${qualityBelow60} studios`);

  // Top neighborhoods
  const neighborhoodCounts = new Map<string, number>();
  studios.forEach(s => {
    if (s.neighborhood) {
      neighborhoodCounts.set(s.neighborhood, (neighborhoodCounts.get(s.neighborhood) || 0) + 1);
    }
  });

  const topNeighborhoods = Array.from(neighborhoodCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topNeighborhoods.length > 0) {
    console.log('\n🏘️ Top Neighborhoods:');
    topNeighborhoods.forEach(([neighborhood, count]) => {
      console.log(`  ${neighborhood}: ${count} studios`);
    });
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const { city, output, enrichDetails } = parseArgs();

  console.log('🚀 Pilates Studio Scraper (New Places API)');
  console.log('━'.repeat(40));

  try {
    const studios = await scrapeCityNew(city, enrichDetails || false);

    if (studios.length === 0) {
      console.log('\n⚠️  No studios found. Try different search terms or check API key.');
      return;
    }

    // Export to CSV
    const outputPath = output || `data/${generateSlug(city)}-studios-new.csv`;
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    exportToCSV(studios, outputPath);

    // Print summary
    printSummary(studios);

    console.log('\n✨ Scraping complete!');
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run if called directly
const __filename = fileURLToPath(import.meta.url);

// Check if this file is being run directly
if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { scrapeCityNew, StudioData };