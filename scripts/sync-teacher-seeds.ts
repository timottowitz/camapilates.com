#!/usr/bin/env tsx
/**
 * Sync seed instructors from src/data/teachers.ts into Convex.
 *
 * Usage:
 *   tsx scripts/sync-teacher-seeds.ts
 *   tsx scripts/sync-teacher-seeds.ts --dry-run
 *   tsx scripts/sync-teacher-seeds.ts --city ciudad-de-mexico
 *   tsx scripts/sync-teacher-seeds.ts --limit 10
 *   tsx scripts/sync-teacher-seeds.ts --normalize-slugs
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { TEACHERS_SEED } from '../src/data/teachers';
// eslint-disable-next-line import/extensions
import { getAdminToken } from './lib/adminAuth.js';

type SeedTeacher = {
  slug: string;
  citySlug: string;
  cityName: string;
  fullName: string;
  bio?: string;
  specializations?: string[];
  experienceYears?: number;
  languages?: string[];
  certifications?: Array<{
    name: string;
    organization?: string;
    year?: number;
    isVerified?: boolean;
  }>;
  social?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
  isVerified?: boolean;
};

type CliOptions = {
  dryRun: boolean;
  normalizeSlugs: boolean;
  limit?: number;
  city?: string;
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
    normalizeSlugs: args.includes('--normalize-slugs'),
  };

  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    const parsed = Number(args[limitIdx + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      opts.limit = parsed;
    }
  }

  const cityIdx = args.indexOf('--city');
  if (cityIdx !== -1 && args[cityIdx + 1]) {
    opts.city = args[cityIdx + 1];
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

function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeCityInput(input: string): string {
  const raw = stripDiacritics(String(input).trim()).toLowerCase();
  if (raw === 'cdmx' || raw === 'mexico df' || raw === 'mexico-df' || raw === 'df') {
    return 'ciudad-de-mexico';
  }
  return raw.replace(/\s+/g, '-');
}

function toSeedPayload(): SeedTeacher[] {
  return TEACHERS_SEED.map((t) => ({
    slug: t.slug,
    citySlug: t.citySlug,
    cityName: t.cityName.value,
    fullName: t.fullName.value,
    bio: t.bio?.value,
    specializations: t.specializations?.value,
    experienceYears: t.experienceYears?.value,
    languages: t.languages?.value,
    certifications: (t.certifications || []).map((c) => ({
      name: c.name,
      organization: c.organization,
      year: c.year?.value,
      isVerified: c.isVerified,
    })),
    social: {
      instagram: t.social?.instagram?.value,
      linkedin: t.social?.linkedin?.value,
      facebook: t.social?.facebook?.value,
      website: t.social?.website?.value,
    },
    isVerified: t.isVerified,
  }));
}

async function main() {
  loadEnv();
  const options = parseArgs();
  const convexUrl = resolveConvexUrl();

  let seeds = toSeedPayload();
  if (options.city) {
    const normalized = normalizeCityInput(options.city);
    seeds = seeds.filter((s) => {
      if (s.citySlug === normalized) return true;
      return normalizeCityInput(s.cityName) === normalized;
    });
  }

  if (options.limit && options.limit > 0) {
    seeds = seeds.slice(0, options.limit);
  }

  if (seeds.length === 0) {
    console.warn('⚠️ No seed instructors found for the current filters.');
    return;
  }

  if (options.dryRun) {
    console.log('🔍 Dry run — no data will be written.\n');
    console.log(`Deployment: ${convexUrl}`);
    console.log(`Seeds to sync: ${seeds.length}`);
    console.log(`Normalize slugs: ${options.normalizeSlugs ? 'yes' : 'no'}`);
    seeds.slice(0, 5).forEach((seed, idx) => {
      console.log(`\n[${idx + 1}] ${seed.fullName}`);
      console.log(`  city: ${seed.cityName} (${seed.citySlug})`);
      console.log(`  slug: ${seed.slug}`);
    });
    if (seeds.length > 5) {
      console.log(`\n...and ${seeds.length - 5} more`);
    }
    return;
  }

  console.log('🚀 Syncing teacher seeds into Convex');
  console.log(`🔗 Deployment: ${convexUrl}`);
  console.log(`📦 Payload size: ${seeds.length}`);
  console.log(`🔧 Normalize slugs: ${options.normalizeSlugs ? 'yes' : 'no'}`);

  const client = new ConvexHttpClient(convexUrl);
  const token = await getAdminToken(client as any);

  try {
    const result = await client.mutation(api.teachers.syncSeedTeachers, {
      token,
      normalizeSlugs: options.normalizeSlugs,
      seeds,
    });

    console.log('\n✅ Sync complete');
    console.log(`  Inserted: ${result.inserted}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Renamed: ${result.renamed}`);

    if (result.conflicts?.length) {
      console.log('\n⚠️ Conflicts:');
      result.conflicts.forEach((conflict: { citySlug: string; slug: string; reason: string }) => {
        console.log(`  - ${conflict.citySlug}/${conflict.slug}: ${conflict.reason}`);
      });
    }
  } catch (error) {
    console.error('❌ Error syncing teachers:', error);
    process.exit(1);
  }
}

main();
