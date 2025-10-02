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

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud'; // Production
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
  console.log(`\n🔍 Processing: ${path.basename(imagePath)}`);

  const buffer = fs.readFileSync(imagePath);
  const base64 = buffer.toString('base64');
  const mimeType = 'image/webp';

  // Analyze with GPT-4 Vision
  console.log('   Analyzing with GPT-4 Vision...');
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: visionSchema,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this Pilates image. Provide scene, subjects, mood, colors, composition, use cases, and tags.' },
        { type: 'image', image: `data:${mimeType};base64,${base64}` }
      ]
    }]
  });

  console.log(`   ✅ Analysis complete`);
  console.log(`      Scene: ${result.object.scene}`);

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
    fileName: path.basename(imagePath),
    storageId,
    mimeType,
    size: buffer.length,
    dimensions: { width: 800, height: 600 }, // Default dimensions
    aiDescription: result.object,
    category: result.object.useCases[0] || 'general'
  });

  console.log(`   ✅ Uploaded to Convex`);
  return result.object;
}

async function main() {
  const testImages = [
    '/Users/m3max361tb/Documents/Code/Pilates_Reformer/images/1. Powerful Arm.webp',
    '/Users/m3max361tb/Documents/Code/Pilates_Reformer/images/accessories.webp',
    '/Users/m3max361tb/Documents/Code/Pilates_Reformer/images/reformers.webp'
  ].filter(f => fs.existsSync(f));

  console.log(`\n🖼️  Processing ${testImages.length} test images\n`);

  for (const img of testImages) {
    try {
      await processImage(img);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n✅ Done!\n');
}

main();
