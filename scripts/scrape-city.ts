#!/usr/bin/env tsx
/**
 * Main scraping CLI for discovering Pilates studios in Mexican cities.
 *
 * Usage examples:
 *   tsx scripts/scrape-city.ts --city "Ciudad de México"
 *   tsx scripts/scrape-city.ts --city queretaro --limit 100 --enrich
 *   tsx scripts/scrape-city.ts --city "Guadalajara" --output data/guadalajara-studios.csv --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from 'csv-stringify/sync';
import dotenv from 'dotenv';

import GooglePlacesService, {
  PlaceDetailsResult,
  PlaceSearchResult,
} from '../src/services/google-places';
import { generateCityQueries } from '../src/utils/search-queries';
import {
  deduplicateByPlaceId,
  deduplicateStudios,
  StudioRecord,
} from '../src/utils/deduplication';

// ---------------------------------------------------------------------------
// CLI Types & Helpers
// ---------------------------------------------------------------------------

type CliOptions = {
  city: string;
  output?: string;
  limit?: number;
  enrich: boolean;
  dryRun: boolean;
  radius?: number;
};

type CityMetadata = {
  slug: string;
  name: string;
  state: string;
  country?: string;
  priority?: number;
  searchRadius?: number;
  coordinates?: { lat: number; lng: number };
  neighborhoods?: Array<{ name: string }>;
};

type CityMetadataFile = {
  cities: CityMetadata[];
};

type StudioCsvRow = {
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
  price_level: number | null;
  price_min: number | null;
  price_max: number | null;
  business_status: string | null;
  hours: string | null;
  types: string;
  photos: string;
  data_quality_score: number;
  scraped_at: string;
};

function loadEnv() {
  const candidates = ['.env', '.env.local'];
  for (const candidate of candidates) {
    const absolute = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(absolute)) {
      dotenv.config({ path: absolute, override: false });
    }
  }
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const cityIdx = args.indexOf('--city');

  if (cityIdx === -1 || !args[cityIdx + 1]) {
    console.error('Error: --city argument is required.');
    console.log('Usage: tsx scripts/scrape-city.ts --city "Ciudad de México" [--output file.csv] [--limit N] [--radius meters] [--enrich] [--dry-run]');
    process.exit(1);
  }

  const limitIdx = args.indexOf('--limit');
  const radiusIdx = args.indexOf('--radius');

  const limitValue = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined;
  const radiusValue = radiusIdx !== -1 ? Number(args[radiusIdx + 1]) : undefined;

  const outputIdx = args.indexOf('--output');
  const output = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  return {
    city: args[cityIdx + 1],
    output,
    limit: limitValue && limitValue > 0 ? limitValue : undefined,
    enrich: args.includes('--enrich'),
    dryRun: args.includes('--dry-run'),
    radius: radiusValue && radiusValue > 0 ? radiusValue : undefined,
  };
}

function loadCityMetadata(cityArg: string): CityMetadata | undefined {
  const metadataPath = path.resolve(process.cwd(), 'data/cities.json');
  if (!fs.existsSync(metadataPath)) {
    return undefined;
  }

  const raw = fs.readFileSync(metadataPath, 'utf-8');
  const parsed = JSON.parse(raw) as CityMetadataFile;
  const normalized = cityArg.trim().toLowerCase();

  return parsed.cities.find((city) => {
    return (
      city.slug.toLowerCase() === normalized ||
      city.name.trim().toLowerCase() === normalized
    );
  });
}

function inferStateName(city: CityMetadata | undefined, fallbackCity: string): string {
  if (city?.state) return city.state;

  const fallbackMap: Record<string, string> = {
    'ciudad de méxico': 'Ciudad de México',
    'querétaro': 'Querétaro',
    'puebla': 'Puebla',
    'monterrey': 'Nuevo León',
    'guadalajara': 'Jalisco',
    'mazatlán': 'Sinaloa',
    'tijuana': 'Baja California',
  };

  return fallbackMap[fallbackCity.toLowerCase()] || 'Desconocido';
}

function resolveGoogleApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found in environment.');
    process.exit(1);
  }
  return key;
}

// ---------------------------------------------------------------------------
// Data Transformation Helpers
// ---------------------------------------------------------------------------

function calculateQualityScore(studio: Partial<StudioCsvRow>): number {
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
  } as const;

  let score = 0;

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

  return Math.round(score);
}

function studioRecordFromPlace(place: PlaceSearchResult): StudioRecord {
  return {
    place_id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    phone: undefined,
    website: undefined,
  };
}

function formatHours(details?: PlaceDetailsResult | null): string | null {
  if (!details?.opening_hours?.weekday_text) return null;
  return details.opening_hours.weekday_text.join(' | ');
}

function formatTypes(place: PlaceSearchResult): string {
  if (!place.types || place.types.length === 0) return '';
  return place.types.join(', ');
}

function formatPhotos(details?: PlaceDetailsResult | null, service?: GooglePlacesService): string {
  if (!details?.photos || details.photos.length === 0 || !service) return '[]';
  const urls = details.photos.slice(0, 5).map((photo) => service.getPhotoUrl(photo.photo_reference));
  return JSON.stringify(urls);
}

function normalizeString(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function transformToStudioData(
  place: PlaceSearchResult,
  details: PlaceDetailsResult | null,
  cityName: string,
  stateName: string,
  service: GooglePlacesService
): StudioCsvRow {
  const neighborhood = details ? service.extractNeighborhood(details.address_components) : null;
  const postalCode = details ? service.extractPostalCode(details.address_components) : null;
  const photos = formatPhotos(details, service);

  const studio: StudioCsvRow = {
    place_id: place.place_id,
    name: place.name,
    slug: generateSlug(place.name),
    address: place.formatted_address,
    neighborhood,
    city: cityName,
    state: stateName,
    postal_code: postalCode,
    country: 'México',
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    phone: normalizeString(details?.formatted_phone_number || details?.international_phone_number),
    website: normalizeString(details?.website),
    google_maps_url: normalizeString(details?.url),
    rating: place.rating ?? null,
    review_count: place.user_ratings_total ?? null,
    price_level: details?.price_level ?? null,
    price_min: null,
    price_max: null,
    business_status: place.business_status ?? null,
    hours: formatHours(details),
    types: formatTypes(place),
    photos,
    data_quality_score: 0,
    scraped_at: new Date().toISOString(),
  };

  studio.data_quality_score = calculateQualityScore(studio);
  return studio;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Scraping Pipeline
// ---------------------------------------------------------------------------

async function searchCityPlaces(
  service: GooglePlacesService,
  queries: string[],
  location?: { lat: number; lng: number },
  radius?: number
): Promise<PlaceSearchResult[]> {
  const results: PlaceSearchResult[] = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n[${i + 1}/${queries.length}] Searching: "${query}"`);

    try {
      const places = await service.searchPlaces(query, location, radius);
      console.log(`  ✓ ${places.length} results`);
      results.push(...places);
    } catch (error) {
      console.error(`  ✗ Error searching "${query}":`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return results;
}

async function fetchPlaceDetails(
  service: GooglePlacesService,
  placeId: string
): Promise<PlaceDetailsResult | null> {
  try {
    return await service.getPlaceDetails(placeId);
  } catch (error) {
    console.error('  ✗ Error fetching details:', error);
    return null;
  }
}

async function scrapeCity(options: CliOptions): Promise<StudioCsvRow[]> {
  const cityMeta = loadCityMetadata(options.city);
  const cityName = cityMeta ? cityMeta.name : options.city;
  const stateName = inferStateName(cityMeta, cityName);

  const apiKey = resolveGoogleApiKey();
  const placesService = new GooglePlacesService(apiKey);

  const neighborhoods = cityMeta?.neighborhoods?.map((n) => n.name) ?? [];
  const queries = generateCityQueries(cityName, neighborhoods);
  const location = cityMeta?.coordinates;
  const searchRadius = options.radius ?? cityMeta?.searchRadius ?? 20000;

  console.log(`📍 City: ${cityName} (${stateName})`);
  console.log(`🔎 Generated ${queries.length} queries`);

  const rawResults = await searchCityPlaces(placesService, queries, location, searchRadius);
  console.log(`\n🔍 Total raw results: ${rawResults.length}`);

  const uniqueById = deduplicateByPlaceId(rawResults);
  console.log(`  ✓ Unique by place_id: ${uniqueById.length}`);

  const studioRecords: StudioRecord[] = uniqueById.map(studioRecordFromPlace);
  const dedupedRecords = deduplicateStudios(studioRecords);
  console.log(`  ✓ Deduplicated by name/location: ${dedupedRecords.length}`);

  const limitedRecords = options.limit
    ? dedupedRecords.slice(0, options.limit)
    : dedupedRecords;

  const finalStudios: StudioCsvRow[] = [];

  for (let i = 0; i < limitedRecords.length; i++) {
    const record = limitedRecords[i];

    const place = uniqueById.find((candidate) => {
      if (record.place_id && candidate.place_id === record.place_id) return true;
      const sameAddress = candidate.formatted_address === record.address;
      const similarName = candidate.name.toLowerCase() === record.name.toLowerCase();
      return sameAddress && similarName;
    });

    if (!place) {
      console.warn(`⚠️ Unable to locate place entry for ${record.name}. Skipping.`);
      continue;
    }

    console.log(`\n[${i + 1}/${limitedRecords.length}] Processing: ${place.name}`);

    let details: PlaceDetailsResult | null = null;
    if (options.enrich) {
      console.log('  ↳ Fetching detailed information...');
      details = await fetchPlaceDetails(placesService, place.place_id);
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (details) {
        console.log('  ✓ Details retrieved');
      }
    }

    const studio = transformToStudioData(place, details, cityName, stateName, placesService);
    finalStudios.push(studio);
    console.log(`  ↳ Quality Score: ${studio.data_quality_score}/100`);
  }

  return finalStudios;
}

// ---------------------------------------------------------------------------
// Output & Reporting
// ---------------------------------------------------------------------------

function exportCsv(rows: StudioCsvRow[], outputPath: string) {
  const csv = stringify(rows, {
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
      'data_quality_score',
      'scraped_at',
    ],
  });

  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`\n✅ Exported ${rows.length} studios → ${outputPath}`);
}

function printSummary(rows: StudioCsvRow[]) {
  const total = rows.length;
  if (total === 0) return;

  const withWebsite = rows.filter((row) => row.website).length;
  const withPhone = rows.filter((row) => row.phone).length;
  const rated = rows.filter((row) => row.rating && row.rating > 0);
  const avgRating = rated.reduce((sum, row) => sum + (row.rating || 0), 0) / (rated.length || 1);
  const avgQuality = rows.reduce((sum, row) => sum + row.data_quality_score, 0) / total;

  const quality80 = rows.filter((row) => row.data_quality_score >= 80).length;
  const quality60 = rows.filter((row) => row.data_quality_score >= 60 && row.data_quality_score < 80).length;

  console.log('\n📊 Summary Statistics');
  console.log('━'.repeat(40));
  console.log(`Total studios: ${total}`);
  console.log(`Average quality score: ${avgQuality.toFixed(1)}/100`);
  console.log(`With website: ${withWebsite} (${((withWebsite / total) * 100).toFixed(1)}%)`);
  console.log(`With phone: ${withPhone} (${((withPhone / total) * 100).toFixed(1)}%)`);
  console.log(`Rated studios: ${rated.length} (${((rated.length / total) * 100).toFixed(1)}%)`);
  console.log(`Average rating: ${avgRating.toFixed(2)} ⭐`);
  console.log('\nQuality distribution:');
  console.log(`  High (80-100): ${quality80}`);
  console.log(`  Medium (60-79): ${quality60}`);
  console.log(`  Low (<60): ${total - quality80 - quality60}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv();
  const options = parseArgs();

  console.log('🚀 Pilates Studio Scraper');
  console.log('━'.repeat(40));
  console.log(`City: ${options.city}`);
  if (options.limit) console.log(`Limit: ${options.limit}`);
  if (options.radius) console.log(`Search radius: ${options.radius}m`);
  if (options.enrich) console.log('Detail enrichment: enabled');
  if (options.dryRun) console.log('Dry run: results will not be saved');

  const studios = await scrapeCity(options);

  if (studios.length === 0) {
    console.log('\n⚠️ No studios found.');
    return;
  }

  printSummary(studios);

  if (options.dryRun) {
    console.log('\nℹ️ Dry run complete. No files written.');
    return;
  }

  const outputPath = options.output || `data/${generateSlug(options.city)}-studios.csv`;
  const resolvedOutput = path.resolve(process.cwd(), outputPath);
  const outputDir = path.dirname(resolvedOutput);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  exportCsv(studios, resolvedOutput);
  console.log('\n✨ Scraping complete!');
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main().catch((error) => {
    console.error('\n❌ Error during scraping:', error);
    process.exit(1);
  });
}

export { scrapeCity, StudioCsvRow };
