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

  console.log('\n🧪 SIMPLE PLACEHOLDER AUTO-GEN TEST\n');
  console.log('='.repeat(60));

  const testId = `test-simple-${Date.now()}`;

  console.log(`\n📝 Registering placeholder: ${testId}`);
  try {
    await client.mutation(api.placeholders.register, {
      token,
      placeholderId: testId,
      pageType: 'test',
      location: 'hero',
      contextBefore: 'Professional Pilates reformer studio',
      contextAfter: 'Expert instructors, modern equipment',
      headingAbove: 'Transform Your Body',
      altText: 'Pilates reformer studio',
      preferredAspectRatio: '16:9',
    });
    console.log('   ✅ Registered');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return;
  }

  console.log('\n⏱️  Waiting 90 seconds for auto-generation...\n');

  for (let i = 0; i < 18; i++) {
    await sleep(5000);

    try {
      const data = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId: testId });

      const status = data?.status || 'unknown';
      const hasPrompt = !!data?.generatedPrompt;
      const hasImage = !!data?.assignedImageId;
      const hasUrl = !!data?.imageUrl;

      console.log(`   [${(i+1)*5}s] ${status} | Prompt: ${hasPrompt ? '✅' : '❌'} | Image: ${hasImage ? '✅' : '❌'} | URL: ${hasUrl ? '✅' : '❌'}`);

      if (status === 'active' && hasUrl) {
        console.log(`\n🎉 SUCCESS! Image generated in ${(i+1)*5} seconds`);
        console.log(`📸 URL: ${data.imageUrl.substring(0, 80)}...\n`);
        return;
      }
    } catch (error) {
      console.log(`   [${(i+1)*5}s] ❌ ${error.message}`);
    }
  }

  console.log('\n⏱️  Timeout after 90 seconds\n');
}

main().catch(console.error);
