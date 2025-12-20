import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';
import fs from 'fs';
import path from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

const visionSchema = z.object({
  scene: z.string(),
  subjects: z.array(z.string()),
  activity: z.string().optional(),
  mood: z.string(),
  colors: z.array(z.string()),
  composition: z.string(),
  lighting: z.string().optional(),
  setting: z.string().optional(),
  useCases: z.array(z.string()),
  tags: z.array(z.string()),
  quality: z.string().optional(),
});

/**
 * Test automatic generation trigger
 * Upload a test image and verify it automatically generates
 */
async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  // Use a small test image
  const testImagePath = '/Users/m3max361tb/Documents/Code/Pilates_Reformer/images/accessories.webp';

  console.log('\n🧪 Testing Automatic Generation Trigger\n');
  console.log(`📁 Using test image: ${path.basename(testImagePath)}`);

  // Step 1: Analyze with GPT-4 Vision
  console.log('\n1️⃣  Analyzing with GPT-4 Vision...');
  const buffer = fs.readFileSync(testImagePath);
  const base64 = buffer.toString('base64');

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: visionSchema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this Pilates image briefly.' },
        { type: 'image', image: `data:image/webp;base64,${base64}` }
      ]
    }]
  });

  console.log(`   ✅ Analysis complete: ${result.object.scene.substring(0, 60)}...`);

  // Step 2: Upload to Convex (should auto-trigger generation)
  console.log('\n2️⃣  Uploading to Convex with AUTO-GENERATION enabled...');
  const uploadUrl = await client.mutation(api.aiImages.generateUploadUrl, { token });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'image/webp' },
    body: buffer
  });

  const { storageId } = await uploadResponse.json();

  const imageId = await client.mutation(api.aiImages.upload, {
    token,
    fileName: `TEST_AUTO_${Date.now()}.webp`,
    storageId,
    mimeType: 'image/webp',
    size: buffer.length,
    dimensions: { width: 800, height: 600 },
    aiDescription: result.object,
    category: 'test',
    autoGenerate: true, // TRIGGER AUTOMATIC GENERATION
  });

  console.log(`   ✅ Uploaded with ID: ${imageId}`);
  console.log(`   🎯 Generation should be triggered automatically!`);

  // Step 3: Monitor generation status
  console.log('\n3️⃣  Monitoring generation status...');
  console.log('   (DALL-E generation takes ~15-30 seconds)\n');

  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

    const images = await client.query(api.aiImages.listAll, { token, limit: 50 });
    const image = images.find(img => img._id === imageId);

    if (!image) {
      console.log('   ❌ Image not found!');
      break;
    }

    const status = image.generationStatus || 'unknown';
    console.log(`   [${attempts * 2}s] Status: ${status}`);

    if (status === 'completed') {
      console.log('\n✅ SUCCESS! Image generated automatically!');
      console.log(`   🎨 Generated Storage ID: ${image.generatedStorageId}`);
      console.log(`   📝 Prompt: ${image.generationPrompt?.substring(0, 80)}...`);
      break;
    }

    if (status === 'failed') {
      console.log(`\n❌ FAILED: ${image.generationError}`);
      break;
    }

    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.log('\n⏱️  Timeout - generation taking longer than expected');
  }

  console.log('\n✅ Test complete!\n');
}

main();
