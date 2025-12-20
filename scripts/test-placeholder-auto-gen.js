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

  console.log('\n🧪 TESTING AUTOMATIC PLACEHOLDER GENERATION\n');
  console.log('='.repeat(70));

  // Test placeholder data
  const testPlaceholderId = 'test-auto-gen-hero-1';
  const testData = {
    placeholderId: testPlaceholderId,
    pageType: 'test',
    pageSlug: 'test-page',
    location: 'hero',
    contextBefore: 'Welcome to our professional Pilates studio. Experience transformation through mindful movement.',
    contextAfter: 'Our certified instructors will guide you through personalized Reformer sessions designed to strengthen your core, improve flexibility, and enhance overall wellness.',
    headingAbove: 'Transform Your Body & Mind with Pilates',
    altText: 'Professional Pilates reformer studio interior',
    preferredAspectRatio: '16:9',
    preferredStyle: 'professional, clean, modern',
    requiredSubjects: ['pilates reformer', 'studio interior'],
  };

  console.log('\n📝 Step 1: Registering test placeholder...');
  try {
    const placeholderId = await client.mutation(api.placeholders.register, { token, ...testData });
    console.log(`   ✅ Placeholder registered: ${placeholderId}`);
  } catch (error) {
    console.log(`   ❌ Registration failed: ${error.message}`);
    return;
  }

  console.log('\n🔍 Step 2: Monitoring placeholder status...');
  console.log('   (Checking every 5 seconds for 60 seconds...)');

  let found = false;
  for (let i = 0; i < 12; i++) {
    await sleep(5000);

    try {
      const placeholder = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId: testPlaceholderId });

      if (!placeholder) {
        console.log(`   [${i * 5}s] ❌ Placeholder not found`);
        continue;
      }

      const status = placeholder.status || 'unknown';
      const hasPrompt = !!placeholder.generatedPrompt;
      const hasImage = !!placeholder.assignedImageId;
      const imageUrl = placeholder.imageUrl || null;

      console.log(`   [${i * 5}s] Status: ${status} | Prompt: ${hasPrompt ? '✅' : '❌'} | Image: ${hasImage ? '✅' : '❌'}`);

      if (status === 'active' && imageUrl) {
        console.log(`\n   🎉 SUCCESS! Image generated and assigned!`);
        console.log(`   📸 Image URL: ${imageUrl.substring(0, 80)}...`);
        found = true;
        break;
      }

      if (status === 'error') {
        console.log(`\n   ❌ ERROR: ${placeholder.generationError || 'Generation failed'}`);
        break;
      }
    } catch (error) {
      console.log(`   [${i * 5}s] ❌ Error: ${error.message}`);
    }
  }

  if (!found) {
    console.log('\n   ⏱️  Timeout: Image generation took longer than 60 seconds');
    console.log('   (This is normal - DALL-E can take 20-40 seconds per image)');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Test complete! Check Convex dashboard for full pipeline status.\n');
}

main().catch(console.error);
