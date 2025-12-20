#!/usr/bin/env node
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

function resolveConvexUrl() {
  return process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
}

async function main() {
  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);

  console.log('\n🧩 Assigning latest generated images to placeholders...');

  // Fetch all placeholders (no filter)
  let rows = [];
  try {
    rows = await client.query(api.placeholders.list, { token });
  } catch (e) {
    console.error('❌ Failed to list placeholders:', e?.message || e);
    process.exit(1);
  }

  let tried = 0, assigned = 0, skipped = 0, failed = 0;
  for (const r of rows) {
    tried++;
    // Skip active items to avoid unnecessary writes; still safe to assignLatest, but avoid churn
    if (r.status === 'active') { skipped++; continue; }
    try {
      await client.mutation(api.placeholders.assignLatest, { token, placeholderId: r.placeholderId, activate: true });
      assigned++;
      process.stdout.write('.');
    } catch (e) {
      // Most likely: no images yet for this placeholder; ignore
      failed++;
    }
  }

  console.log(`\nDone. Tried: ${tried}, Assigned: ${assigned}, Skipped(active): ${skipped}, Failed(no image yet): ${failed}`);
  console.log('Tip: Re-run this script again after generation finishes to pick up remaining placeholders.');
}

main().catch((e) => { console.error(e); process.exit(1); });
