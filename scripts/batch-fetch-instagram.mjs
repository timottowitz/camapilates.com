#!/usr/bin/env node
/**
 * Batch fetch Instagram profiles for all teachers
 * Usage: node scripts/batch-fetch-instagram.mjs
 */

import { execSync } from 'child_process';

const INSTAGRAM_HANDLES = [
  'gabyotapilates',
  'rouxalinaduran',
  'bia_pilates',
  'casslucina',
  'chantal.anfossi',
  'dadopilates',
  'elsamonterd',
  'mandalastudiomx',
  'adulam717',
  'irmabeltran606',
  'juaninguiso',
  'x_lesleey',
  'luciaphysiomoon',
  'ulu_pilates',
  'controlroom.pilates',
  'mindbody.mx',
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\n🔄 Processing ${INSTAGRAM_HANDLES.length} Instagram profiles...\n`);

  for (let i = 0; i < INSTAGRAM_HANDLES.length; i++) {
    const handle = INSTAGRAM_HANDLES[i];
    console.log(`[${i + 1}/${INSTAGRAM_HANDLES.length}] Fetching @${handle}...`);

    try {
      const result = execSync(
        `npx convex run instagram:forceRefresh '{"instagram": "${handle}"}'`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      console.log(`  ✅ Scheduled`);
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    // Wait between requests to avoid overwhelming the system
    // ScrapingBee has rate limits too
    await sleep(2000);
  }

  console.log(`\n⏳ Waiting 30 seconds for all fetches to complete...\n`);
  await sleep(30000);

  // Check results
  console.log(`\n📊 Results:\n`);
  try {
    const profiles = execSync('npx convex run instagram:listProfiles', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const data = JSON.parse(profiles);

    console.log('Username'.padEnd(25) + 'Status'.padEnd(10) + 'Image'.padEnd(8) + 'Followers');
    console.log('-'.repeat(60));

    for (const p of data) {
      const followers = p.followers ? p.followers.toLocaleString() : '-';
      const image = p.hasImage ? '✅' : '❌';
      const status = p.status === 'ok' ? '✅ OK' : `❌ ${p.status}`;
      console.log(
        `@${p.username}`.padEnd(25) +
        status.padEnd(10) +
        image.padEnd(8) +
        followers
      );
    }

    const okCount = data.filter(p => p.status === 'ok').length;
    const imageCount = data.filter(p => p.hasImage).length;
    console.log(`\n✅ ${okCount}/${data.length} profiles fetched successfully`);
    console.log(`🖼️  ${imageCount}/${data.length} profiles have images\n`);

  } catch (err) {
    console.log('Error getting results:', err.message);
  }
}

main().catch(console.error);
