import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function processImage(imagePath) {
  const fileName = path.basename(imagePath);
  console.log(`\n🔍 ${fileName}`);

  const buffer = fs.readFileSync(imagePath);
  const base64 = buffer.toString('base64');
  const mimeType = 'image/webp';

  // Analyze with GPT-4 Vision
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: visionSchema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this Pilates/fitness image in detail. Provide scene, subjects, activity, mood, colors, composition, lighting, setting, use cases (hero/feature/blog/product), searchable tags, and quality assessment. Be specific for accurate search later.' },
        { type: 'image', image: `data:${mimeType};base64,${base64}` }
      ]
    }]
  });

  console.log(`   ✅ AI: ${result.object.scene.substring(0, 60)}...`);

  // Upload to Convex
  const client = new ConvexHttpClient(CONVEX_URL);
  const uploadUrl = await client.mutation(api.aiImages.generateUploadUrl);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': mimeType },
    body: buffer
  });

  const { storageId } = await uploadResponse.json();

  await client.mutation(api.aiImages.upload, {
    fileName,
    storageId,
    mimeType,
    size: buffer.length,
    dimensions: { width: 1000, height: 800 },
    aiDescription: result.object,
    category: result.object.useCases[0] || 'general'
  });

  console.log(`   ✅ Uploaded: ${result.object.useCases.join(', ')}`);
  return result.object;
}

async function main() {
  const imagesDir = '/Users/m3max361tb/Documents/Code/Pilates_Reformer/images';
  const webpImages = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.webp'))
    .map(f => path.join(imagesDir, f));

  console.log(`\n🖼️  Found ${webpImages.length} WebP images\n`);

  let processed = 0;
  let failed = 0;

  for (const img of webpImages) {
    try {
      await processImage(img);
      processed++;
    } catch (error) {
      failed++;
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${webpImages.length}\n`);
}

main();
