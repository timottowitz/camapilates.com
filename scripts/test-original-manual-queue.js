import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);
  const testId = `manual-test-${Date.now()}`;

  console.log('\n🧪 TEST MANUAL QUEUE (Original Design)\n');

  // Step 1: Register
  await client.mutation(api.placeholders.register, {
    token,
    placeholderId: testId,
    pageType: 'test',
    location: 'hero',
    contextBefore: 'Professional Pilates studio',
    altText: 'Studio interior',
    preferredAspectRatio: '16:9',
  });
  console.log('✅ Registered:', testId);

  // Step 2: Manually queue (like admin would)
  await client.action(api.placeholderGeneration.queue, {
    token,
    placeholderId: testId
  });
  console.log('✅ Queued for generation');

  // Step 3: Monitor
  console.log('\n⏱️  Monitoring (90s)...\n');
  for (let i = 0; i < 18; i++) {
    await sleep(5000);
    const data = await client.query(api.placeholders.getById, {
      placeholderId: testId
    });
    console.log(`[${(i+1)*5}s] ${data?.status} | Image: ${data?.imageUrl ? '✅' : '❌'}`);
    if (data?.imageUrl) {
      console.log(`\n🎉 SUCCESS! Original manual system works!\n`);
      return;
    }
  }
}

main().catch(console.error);
