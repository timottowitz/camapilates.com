#!/usr/bin/env tsx
/**
 * Backfill neighborhoods for existing studios by parsing from formatted addresses.
 * Mexican addresses follow: "Street, Colonia, Delegación, PostalCode City, State, Country"
 *
 * Usage:
 *   npx tsx scripts/backfill-neighborhoods.ts --dry-run          # Preview changes
 *   npx tsx scripts/backfill-neighborhoods.ts                    # Update Convex directly
 *   npx tsx scripts/backfill-neighborhoods.ts --csv              # Output updated CSV
 */

import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import dotenv from 'dotenv';
// eslint-disable-next-line import/extensions
import { getAdminToken } from './lib/adminAuth.js';

// Load environment
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

interface CliOptions {
  dryRun: boolean;
  outputCsv: boolean;
  city: string;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    outputCsv: args.includes('--csv'),
    city: 'Ciudad de México', // Default to CDMX
  };
}

/**
 * Extract colonia from Mexican formatted address.
 * Pattern: "Street, Colonia, Delegación/Municipality, PostalCode City, State, Country"
 */
function extractColoniaFromAddress(formattedAddress: string): string | null {
  if (!formattedAddress) return null;

  const parts = formattedAddress.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    // Second segment is typically the colonia
    const potentialColonia = parts[1];

    // Validate: not a number, not too short, not a postal code pattern
    if (
      potentialColonia &&
      potentialColonia.length > 2 &&
      !/^\d+$/.test(potentialColonia) &&
      !/^\d{5}/.test(potentialColonia)
    ) {
      return potentialColonia;
    }
  }

  return null;
}

async function backfillNeighborhoods(options: CliOptions) {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

  if (!convexUrl) {
    console.error('❌ VITE_CONVEX_URL not found in environment');
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);
  const token = await getAdminToken(client as any);

  console.log(`🔍 Fetching studios for ${options.city}...`);
  const studios = await client.query(api.studios.getByCity, { city: options.city });

  console.log(`📊 Found ${studios.length} studios`);

  // Find studios without neighborhood
  const studiosWithoutNeighborhood = studios.filter(s => !s.address.neighborhood);
  console.log(`📍 Studios without neighborhood: ${studiosWithoutNeighborhood.length}`);

  if (studiosWithoutNeighborhood.length === 0) {
    console.log('✅ All studios already have neighborhood data!');
    return;
  }

  // Extract neighborhoods from addresses
  const updates: Array<{
    id: string;
    name: string;
    address: string;
    neighborhood: string | null;
  }> = [];

  for (const studio of studiosWithoutNeighborhood) {
    const neighborhood = extractColoniaFromAddress(studio.address.street);
    updates.push({
      id: studio._id,
      name: studio.name,
      address: studio.address.street,
      neighborhood,
    });
  }

  // Count successful extractions
  const successfulExtractions = updates.filter(u => u.neighborhood);
  console.log(`\n✅ Successfully extracted: ${successfulExtractions.length}/${updates.length}`);

  // Show sample of extractions
  console.log('\n📋 Sample extractions:');
  updates.slice(0, 10).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name}`);
    console.log(`     Address: ${u.address.substring(0, 60)}...`);
    console.log(`     Colonia: ${u.neighborhood || '(not found)'}`);
  });

  // Count unique neighborhoods
  const uniqueNeighborhoods = [...new Set(updates.map(u => u.neighborhood).filter(Boolean))];
  console.log(`\n🏘️  Unique colonias found: ${uniqueNeighborhoods.length}`);
  uniqueNeighborhoods.sort().slice(0, 20).forEach(n => console.log(`  - ${n}`));
  if (uniqueNeighborhoods.length > 20) {
    console.log(`  ... and ${uniqueNeighborhoods.length - 20} more`);
  }

  if (options.dryRun) {
    console.log('\n🔍 Dry run - no changes made');
    return;
  }

  if (options.outputCsv) {
    // Output as CSV for review
    const csvData = updates.map(u => ({
      id: u.id,
      name: u.name,
      address: u.address,
      extracted_neighborhood: u.neighborhood || '',
    }));

    const csv = stringify(csvData, { header: true });
    const outputPath = path.join(process.cwd(), 'data', 'neighborhood-backfill.csv');
    fs.writeFileSync(outputPath, csv, 'utf-8');
    console.log(`\n📄 CSV written to: ${outputPath}`);
    return;
  }

  // Apply updates to Convex
  console.log('\n🚀 Applying updates to Convex...');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const update of updates) {
    if (!update.neighborhood) {
      skipped++;
      continue;
    }

    try {
      // We need to fetch the full studio and update it
      const studio = studios.find(s => s._id === update.id);
      if (!studio) {
        skipped++;
        continue;
      }

      await client.mutation(api.studios.upsert, {
        token,
        studio: {
          slug: studio.slug,
          name: studio.name,
          description: studio.description,
          address: {
            street: studio.address.street,
            neighborhood: update.neighborhood,
            city: studio.address.city,
            state: studio.address.state,
            postalCode: studio.address.postalCode,
            country: studio.address.country,
            coordinates: studio.address.coordinates,
          },
          contact: studio.contact,
          hours: studio.hours,
          metrics: studio.metrics,
          pricing: studio.pricing,
          classTypes: studio.classTypes,
          equipment: studio.equipment,
          amenities: studio.amenities,
          certifications: studio.certifications,
          photos: studio.photos,
          logo: studio.logo,
          social: studio.social,
          dataQualityScore: studio.dataQualityScore,
          googlePlaceId: studio.googlePlaceId,
        },
      });

      updated++;
      process.stdout.write(`\r  Updated: ${updated}/${successfulExtractions.length}`);
    } catch (error) {
      errors++;
      console.error(`\n❌ Error updating ${update.name}:`, error);
    }
  }

  console.log('\n\n📊 Backfill Summary:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⏭️  Skipped (no colonia found): ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
}

async function main() {
  const options = parseArgs();

  console.log('🏘️  Neighborhood Backfill Script');
  console.log('━'.repeat(40));

  if (options.dryRun) {
    console.log('Mode: DRY RUN (no changes will be made)\n');
  } else if (options.outputCsv) {
    console.log('Mode: CSV OUTPUT\n');
  } else {
    console.log('Mode: LIVE UPDATE\n');
  }

  await backfillNeighborhoods(options);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
