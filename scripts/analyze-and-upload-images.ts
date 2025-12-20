import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
// eslint-disable-next-line import/extensions
import { getAdminToken } from './lib/adminAuth.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import sizeOf from 'image-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONVEX_URL = 'https://scintillating-hornet-482.convex.cloud';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

// Schema for AI vision analysis
const visionSchema = z.object({
  scene: z.string().describe('Main scene description in one sentence'),
  subjects: z.array(z.string()).describe('People, objects, equipment visible in the image'),
  activity: z.string().optional().describe('What activity or action is happening'),
  mood: z.string().describe('Overall atmosphere: professional, welcoming, energetic, calm, etc.'),
  colors: z.array(z.string()).describe('Dominant colors in the image'),
  composition: z.string().describe('How the image is framed: centered, rule of thirds, etc.'),
  lighting: z.string().optional().describe('Natural, studio, dramatic, soft, etc.'),
  setting: z.string().optional().describe('Indoor studio, outdoor, home, etc.'),
  useCases: z.array(z.string()).describe('Best use for this image: hero, feature, blog, product, etc.'),
  tags: z.array(z.string()).describe('Searchable keywords for this image'),
  quality: z.string().optional().describe('Image quality: excellent, good, fair, etc.'),
});

/**
 * Analyze image using GPT-4 Vision
 */
async function analyzeImage(imagePath: string) {
  console.log(`🔍 Analyzing: ${path.basename(imagePath)}`);

  // Read image as base64
  const imageBytes = new Uint8Array(fs.readFileSync(imagePath));
  const base64Image = btoa(String.fromCharCode(...imageBytes));
  const mimeType = imagePath.endsWith('.png') ? 'image/png' :
                   imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: visionSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this Pilates/fitness image in detail. Provide:
- Scene description
- People/objects/equipment visible
- Activity happening
- Mood/atmosphere
- Dominant colors
- Composition style
- Lighting quality
- Setting (indoor/outdoor)
- Best use cases (hero, feature, blog, product, etc.)
- Searchable tags/keywords
- Image quality assessment

Be specific and detailed for accurate search later.`,
          },
          {
            type: 'image',
            image: `data:${mimeType};base64,${base64Image}`,
          },
        ],
      },
    ],
  });

  return result.object;
}

/**
 * Upload image to Convex with AI description
 */
async function uploadToConvex(
  client: ConvexHttpClient,
  token: string,
  imagePath: string,
  aiDescription: z.infer<typeof visionSchema>
) {
  const fileName = path.basename(imagePath);
  const buffer = fs.readFileSync(imagePath);
  const blob = new Blob([buffer]);
  const mimeType = imagePath.endsWith('.png') ? 'image/png' :
                   imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

  // Get image dimensions
  const dimensions = sizeOf(imagePath);

  console.log(`📤 Uploading to Convex: ${fileName}`);

  // Generate upload URL
  const uploadUrl = await client.mutation(api.aiImages.generateUploadUrl, { token });

  // Upload file
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': mimeType },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const { storageId } = await response.json();

  // Save with AI description
  const imageId = await client.mutation(api.aiImages.upload, {
    token,
    fileName,
    storageId,
    mimeType,
    size: blob.size,
    dimensions: {
      width: dimensions.width || 0,
      height: dimensions.height || 0,
    },
    aiDescription,
    category: aiDescription.useCases[0] || 'general',
  });

  console.log(`✅ Uploaded: ${fileName}`);
  console.log(`   Scene: ${aiDescription.scene}`);
  console.log(`   Use cases: ${aiDescription.useCases.join(', ')}`);
  console.log(`   Tags: ${aiDescription.tags.slice(0, 5).join(', ')}...`);

  return imageId;
}

/**
 * Main function
 */
async function main() {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client as any);
  const imagesDir = path.join(__dirname, '../images');

  // Get all image files
  const files = fs.readdirSync(imagesDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => path.join(imagesDir, f));

  console.log(`\n🖼️  Found ${files.length} images to process\n`);

  let processed = 0;
  let failed = 0;

  for (const imagePath of files) {
    try {
      // Analyze with GPT-4 Vision
      const aiDescription = await analyzeImage(imagePath);

      // Upload to Convex
      await uploadToConvex(client, token, imagePath, aiDescription);

      processed++;
      console.log();
    } catch (error) {
      failed++;
      console.error(`❌ Failed: ${path.basename(imagePath)}`);
      console.error(`   Error: ${error}`);
      console.log();
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${files.length}\n`);

  process.exit(0);
}

main();
