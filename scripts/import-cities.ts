#!/usr/bin/env tsx
/**
 * Import city metadata from data/cities.json into Convex.
 *
 * Usage:
 *   tsx scripts/import-cities.ts             # imports all cities
 *   tsx scripts/import-cities.ts --dry-run   # prints summary only
 *   tsx scripts/import-cities.ts --limit 5   # import first 5 cities
 *   tsx scripts/import-cities.ts --file path/to/custom.json
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

type CliOptions = {
  dryRun: boolean;
  limit?: number;
  file: string;
};

type CitySeo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

type CityJson = {
  slug: string;
  name: string;
  state: string;
  country?: string;
  population?: number;
  priority?: number;
  timezone?: string;
  searchRadius?: number;
  coordinates: { lat: number; lng: number };
  neighborhoods?: Array<{ name: string }>;
  seo?: CitySeo;
};

type CitiesFile = {
  cities: CityJson[];
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
  const opts: CliOptions = {
    dryRun: args.includes('--dry-run'),
    file: 'data/cities.json',
  };

  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    const parsed = Number(args[limitIdx + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      opts.limit = parsed;
    }
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    opts.file = args[fileIdx + 1];
  }

  return opts;
}

function resolveConvexUrl(): string {
  const url =
    process.env.VITE_CONVEX_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    process.env.CONVEX_URL;

  if (!url) {
    console.error('❌ Unable to find Convex URL. Set VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL in your environment.');
    process.exit(1);
  }
  return url;
}

function readCities(filePath: string, limit?: number): CityJson[] {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    console.error(`❌ Cities file not found: ${absolute}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absolute, 'utf-8');
  const parsed = JSON.parse(raw) as CitiesFile;
  const cities = parsed.cities ?? [];

  if (cities.length === 0) {
    console.warn('⚠️ No cities found in file.');
  }

  if (limit && limit > 0) {
    return cities.slice(0, limit);
  }
  return cities;
}

function toBatchPayload(city: CityJson) {
  const neighborhoods = city.neighborhoods?.map((n) => n.name.trim()).filter(Boolean) ?? [];
  const priority = city.priority ?? 50;
  const searchRadius = city.searchRadius ?? (priority <= 7 ? 20000 : 15000);

  return {
    slug: city.slug,
    name: city.name,
    state: city.state,
    country: city.country ?? 'México',
    coordinates: {
      lat: city.coordinates.lat,
      lng: city.coordinates.lng,
    },
    population: city.population,
    timezone: city.timezone ?? 'America/Mexico_City',
    neighborhoods,
    searchRadius,
    priority,
    seoMetadata: city.seo
      ? {
          title: city.seo.metaTitle,
          description: city.seo.metaDescription,
          keywords: city.seo.keywords,
        }
      : undefined,
  };
}

async function main() {
  loadEnv();
  const options = parseArgs();
  const convexUrl = resolveConvexUrl();
  const cities = readCities(options.file, options.limit);

  if (cities.length === 0) {
    return;
  }

  const payload = cities.map(toBatchPayload);

  if (options.dryRun) {
    console.log('🔍 Dry run — no data will be written.\n');
    console.log(`Source file: ${path.resolve(options.file)}`);
    console.log(`Cities to import: ${payload.length}`);

    payload.slice(0, 5).forEach((city, index) => {
      console.log(`\n[${index + 1}] ${city.name}`);
      console.log(`  slug: ${city.slug}`);
      console.log(`  neighborhoods: ${city.neighborhoods.length}`);
      console.log(`  priority: ${city.priority} | searchRadius: ${city.searchRadius}`);
    });
    if (payload.length > 5) {
      console.log(`\n...and ${payload.length - 5} more`);
    }
    return;
  }

  console.log('🚀 Importing cities into Convex');
  console.log(`🔗 Deployment: ${convexUrl}`);
  console.log(`📦 Payload size: ${payload.length}`);

  const client = new ConvexHttpClient(convexUrl);

  try {
    const result = await client.mutation(api.cities.batchImport, { cities: payload });

    const created = result.filter((entry) => entry.status === 'created').length;
    const existing = result.filter((entry) => entry.status === 'exists').length;

    console.log('\n✅ Import complete');
    result.forEach((entry) => {
      const emoji = entry.status === 'created' ? '✅' : '⏭️';
      console.log(`  ${emoji} ${entry.city}: ${entry.status}`);
    });

    console.log('\nSummary:');
    console.log(`  Created: ${created}`);
    console.log(`  Already existed: ${existing}`);
    console.log(`  Total processed: ${result.length}`);
  } catch (error) {
    console.error('❌ Error importing cities:', error);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
