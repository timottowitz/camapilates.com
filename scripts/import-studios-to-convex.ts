#!/usr/bin/env tsx
/**
 * Import scraped studio data from CSV into Convex.
 *
 * Usage examples:
 *   tsx scripts/import-studios-to-convex.ts --file data/ciudad-de-mexico-studios-new.csv
 *   tsx scripts/import-studios-to-convex.ts --file data/ciudad-de-mexico-studios-new.csv --dry-run
 *   tsx scripts/import-studios-to-convex.ts --file data/ciudad-de-mexico-studios-new.csv --limit 25
 *   tsx scripts/import-studios-to-convex.ts --file data/ciudad-de-mexico-studios-new.csv --city "Ciudad de México"
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import dotenv from 'dotenv';

type CliOptions = {
  file: string;
  dryRun: boolean;
  limit?: number;
  city?: string;
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
  lat: string;
  lng: string;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  rating: string | null;
  review_count: string | null;
  price_level: string | null;
  price_min: string | null;
  price_max: string | null;
  business_status: string | null;
  hours: string | null;
  types: string;
  photos: string;
  has_accessibility: string;
  has_parking: string;
  accepts_credit_cards: string;
  data_quality_score: string;
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
  const fileIdx = args.indexOf('--file');
  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.error('Error: --file argument is required');
    console.log('Usage: tsx scripts/import-studios-to-convex.ts --file path/to/file.csv [--dry-run] [--limit N] [--city "Ciudad de México"]');
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');

  const limitIdx = args.indexOf('--limit');
  const limitValue = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined;
  const limit = limitValue && limitValue > 0 ? limitValue : undefined;

  const cityIdx = args.indexOf('--city');
  const city = cityIdx !== -1 ? args[cityIdx + 1] : undefined;

  return {
    file: args[fileIdx + 1],
    dryRun,
    limit,
    city,
  };
}

function resolveConvexUrl(): string {
  const url =
    process.env.VITE_CONVEX_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    process.env.CONVEX_URL;

  if (!url) {
    console.error('❌ Unable to determine Convex deployment URL. Set VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.');
    process.exit(1);
  }
  return url;
}

function readCsv(filePath: string): StudioCsvRow[] {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ CSV file not found: ${absolutePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
  }) as StudioCsvRow[];

  if (rows.length === 0) {
    console.warn('⚠️ No rows found in CSV.');
  }

  return rows;
}

function normalizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeNumber(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePhotos(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((url: unknown) => typeof url === 'string' && url.length > 0) : [];
  } catch {
    return [];
  }
}

function inferTimezone(city: string): string {
  const map: Record<string, string> = {
    'Ciudad de México': 'America/Mexico_City',
    Guadalajara: 'America/Mexico_City',
    Puebla: 'America/Mexico_City',
    Querétaro: 'America/Mexico_City',
    Monterrey: 'America/Monterrey',
    Mazatlán: 'America/Mazatlan',
    Tijuana: 'America/Tijuana',
    Cancún: 'America/Cancun',
    Mérida: 'America/Mexico_City',
  };
  return map[city] || 'America/Mexico_City';
}

function parseHours(raw: string | null | undefined, city: string) {
  if (!raw) return undefined;

  const segments = raw
    .split('|')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return undefined;

  const dayMap = new Map<string, string>([
    ['monday', 'monday'],
    ['lunes', 'monday'],
    ['tuesday', 'tuesday'],
    ['martes', 'tuesday'],
    ['wednesday', 'wednesday'],
    ['miércoles', 'wednesday'],
    ['miercoles', 'wednesday'],
    ['thursday', 'thursday'],
    ['jueves', 'thursday'],
    ['friday', 'friday'],
    ['viernes', 'friday'],
    ['saturday', 'saturday'],
    ['sábado', 'saturday'],
    ['sabado', 'saturday'],
    ['sunday', 'sunday'],
    ['domingo', 'sunday'],
  ]);

  const record: Record<string, string> = {};

  for (const segment of segments) {
    const [rawDay, ...rest] = segment.split(':');
    if (!rawDay) continue;
    const key = dayMap.get(rawDay.trim().toLowerCase());
    if (!key) continue;
    record[key] = rest.join(':').trim();
  }

  return {
    ...record,
    timezone: inferTimezone(city),
  };
}

function mapAmenities(row: StudioCsvRow): string[] {
  const amenities: string[] = [];
  if (row.has_parking === 'true') amenities.push('Estacionamiento');
  if (row.has_accessibility === 'true') amenities.push('Accesibilidad');
  if (row.accepts_credit_cards === 'true') amenities.push('Tarjetas de crédito');
  return amenities;
}

function transformRow(row: StudioCsvRow) {
  const photos = parsePhotos(row.photos);
  const classTypes = row.types
    ? row.types
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    : [];

  return {
    slug: row.slug,
    name: row.name,
    description: undefined,
    address: {
      street: row.address,
      neighborhood: normalizeString(row.neighborhood),
      city: row.city,
      state: row.state,
      postalCode: normalizeString(row.postal_code),
      country: row.country,
      coordinates: {
        lat: Number(row.lat),
        lng: Number(row.lng),
      },
    },
    contact: {
      phone: normalizeString(row.phone),
      whatsapp: undefined,
      email: undefined,
      website: normalizeString(row.website),
      bookingUrl: undefined,
    },
    hours: parseHours(row.hours, row.city),
    metrics: {
      googleRating: normalizeNumber(row.rating),
      googleReviewCount: normalizeNumber(row.review_count),
      lastReviewDate: undefined,
      sentimentScore: undefined,
    },
    pricing: {
      singleClassMin: normalizeNumber(row.price_min),
      singleClassMax: normalizeNumber(row.price_max),
      monthlyMin: undefined,
      monthlyMax: undefined,
      currency: 'MXN' as const,
      lastUpdated: row.scraped_at ? Date.parse(row.scraped_at) || undefined : undefined,
    },
    classTypes: classTypes.length ? classTypes : undefined,
    equipment: undefined,
    amenities: (() => {
      const amenities = mapAmenities(row);
      return amenities.length ? amenities : undefined;
    })(),
    certifications: undefined,
    photos: photos.length ? photos : undefined,
    logo: photos.length ? photos[0] : undefined,
    social: undefined,
    dataQualityScore: Number(row.data_quality_score) || 0,
    googlePlaceId: normalizeString(row.place_id),
  } satisfies Parameters<typeof api.studios.upsert>[0]['studio'];
}

async function importStudios(options: CliOptions) {
  const rows = readCsv(options.file)
    .filter((row) => (options.city ? row.city.toLowerCase() === options.city.toLowerCase() : true))
    .slice(0, options.limit ?? Number.MAX_SAFE_INTEGER);

  if (rows.length === 0) {
    console.warn('Nothing to import.');
    return;
  }

  if (options.dryRun) {
    console.log('🔍 Dry run — no data will be written.');
    console.log(`📄 Source: ${path.resolve(options.file)}`);
    console.log(`📊 Records: ${rows.length}`);

    rows.slice(0, Math.min(5, rows.length)).forEach((row, index) => {
      const studio = transformRow(row);
      console.log(`\n[${index + 1}] ${studio.name}`);
      console.log(`  slug: ${studio.slug}`);
      console.log(`  city: ${studio.address.city}`);
      console.log(`  neighborhood: ${studio.address.neighborhood ?? '—'}`);
      console.log(`  rating: ${studio.metrics.googleRating ?? 'N/A'}`);
      console.log(`  reviews: ${studio.metrics.googleReviewCount ?? 0}`);
      console.log(`  dataQuality: ${studio.dataQualityScore}`);
    });
    if (rows.length > 5) {
      console.log(`\n...and ${rows.length - 5} more`);
    }
    return;
  }

  const convexUrl = resolveConvexUrl();
  const client = new ConvexHttpClient(convexUrl);

  console.log(`🚀 Importing ${rows.length} studios to ${convexUrl}`);

  let success = 0;
  let failure = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const studio = transformRow(row);

    try {
      await client.mutation(api.studios.upsert, { studio });
      success++;
      console.log(`✅ [${i + 1}/${rows.length}] ${studio.name}`);
    } catch (error) {
      failure++;
      console.error(`❌ [${i + 1}/${rows.length}] ${studio.name}:`, error);
    }
  }

  console.log('\n📊 Import summary');
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failure: ${failure}`);
}

async function main() {
  loadEnv();
  const options = parseArgs();
  await importStudios(options);
}

main().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});

export { importStudios };
