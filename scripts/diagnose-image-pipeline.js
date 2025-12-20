import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log('\n🔍 IMAGE PIPELINE DIAGNOSTIC\n');
  console.log('='.repeat(60));

  // 1. Check site_images table (old system)
  console.log('\n📊 SITE_IMAGES TABLE (Current Website Images):');
  try {
    const siteImages = await client.query(api.siteImages.listActive);
    console.log(`   Found: ${siteImages?.length || 0} images`);
    if (siteImages && siteImages.length > 0) {
      siteImages.forEach(img => {
        console.log(`   - ${img.name} (${img.category})`);
      });
    } else {
      console.log('   ❌ NO IMAGES in site_images table!');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 2. Check ai_images table (new AI system)
  console.log('\n📊 AI_IMAGES TABLE (AI-Generated System):');
  try {
    const aiImages = await client.query(api.aiImages.listAll, { token, limit: 100 });
    console.log(`   Found: ${aiImages?.length || 0} images`);

    const withGenerated = aiImages?.filter(img => img.generatedStorageId) || [];
    const pending = aiImages?.filter(img => !img.generatedStorageId) || [];

    console.log(`   ✅ With generated versions: ${withGenerated.length}`);
    console.log(`   ⏳ Pending generation: ${pending.length}`);

    if (withGenerated.length > 0) {
      console.log('\n   Generated images:');
      withGenerated.slice(0, 5).forEach(img => {
        console.log(`   - ${img.fileName}`);
        console.log(`     Status: ${img.generationStatus || 'unknown'}`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 3. Check image_placeholders table (new placeholder system)
  console.log('\n📊 IMAGE_PLACEHOLDERS TABLE (Placeholder Registry):');
  try {
    const placeholders = await client.query(api.placeholders.list, { token });
    console.log(`   Found: ${placeholders?.length || 0} placeholders`);
  } catch (error) {
    console.log(`   ⚠️  ${error.message}`);
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 DIAGNOSIS:\n');

  console.log('Current State:');
  console.log('  1. ❌ site_images and ai_images are SEPARATE systems');
  console.log('  2. ❌ Website uses site_images (not connected to AI generation)');
  console.log('  3. ✅ AI generation works (creates images in ai_images table)');
  console.log('  4. ❌ Generated images NOT being used on website');

  console.log('\nWhat\'s Missing:');
  console.log('  1. Connection between site_images and ai_images');
  console.log('  2. Update site_images to use generated versions');
  console.log('  3. OR migrate website to use ai_images directly');
  console.log('  4. OR implement placeholder system to replace both');

  console.log('\nRecommended Fix:');
  console.log('  OPTION A: Update site_images to reference ai_images');
  console.log('  OPTION B: Implement full placeholder system from plan');
  console.log('  OPTION C: Migrate website to use ai_images directly');

  console.log('\n' + '='.repeat(60) + '\n');
}

main();
