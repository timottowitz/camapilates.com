import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';
import { createOpenAI } from '@ai-sdk/openai';
import fetch from 'node-fetch';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Convert AI description to DALL-E 3 prompt
 */
function buildGenerationPrompt(aiDescription) {
  const {
    scene,
    subjects,
    activity,
    mood,
    colors,
    composition,
    lighting,
    setting,
  } = aiDescription;

  const prompt = `Professional Pilates studio photograph:

Scene: ${scene}
Subjects: ${subjects.join(', ')}
${activity ? `Activity: ${activity}` : ''}
Mood: ${mood}
Colors: ${colors.slice(0, 3).join(', ')} tones
Composition: ${composition}
${lighting ? `Lighting: ${lighting}` : ''}
${setting ? `Setting: ${setting}` : ''}

Style: Modern fitness photography, high quality, professional, unique perspective.
Shot with professional camera, 8K resolution, magazine quality.
Photorealistic but with unique artistic interpretation.`;

  return prompt;
}

/**
 * Generate image using DALL-E 3
 */
async function generateImage(prompt) {
  console.log('   🎨 Generating with DALL-E 3...');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DALL-E API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  const imageUrl = result.data[0].url;
  const revisedPrompt = result.data[0].revised_prompt;

  console.log(`   ✅ Generated!`);
  console.log(`   📝 Revised: ${revisedPrompt.substring(0, 100)}...`);

  return { imageUrl, revisedPrompt };
}

/**
 * Download generated image
 */
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Test with first image
 */
async function main() {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found');
    process.exit(1);
  }

  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log('\n🔍 Fetching first image...');
  const allImages = await client.query(api.aiImages.listAll, { token, limit: 1 });

  if (!allImages || allImages.length === 0) {
    console.error('❌ No images found in database');
    process.exit(1);
  }

  const image = allImages[0];

  console.log(`\n🖼️  Testing with: ${image.fileName}`);
  console.log(`   Scene: ${image.aiDescription.scene}`);

  try {
    // Build prompt
    const prompt = buildGenerationPrompt(image.aiDescription);
    console.log(`\n📝 Generation Prompt (${prompt.length} chars):`);
    console.log(prompt);
    console.log();

    // Generate with DALL-E 3
    const { imageUrl, revisedPrompt } = await generateImage(prompt);

    // Download
    console.log('   ⬇️  Downloading...');
    const imageBuffer = await downloadImage(imageUrl);
    console.log(`   ✅ Downloaded ${imageBuffer.length} bytes`);

    // Upload to Convex
    console.log('   ⬆️  Uploading to Convex...');
    const uploadUrl = await client.mutation(api.aiImages.generateUploadUrl, { token });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: imageBuffer,
    });

    const { storageId } = await uploadResponse.json();
    console.log(`   ✅ Uploaded with storageId: ${storageId}`);

    // Update record
    console.log('   💾 Updating database record...');
    await client.mutation(api.aiImages.updateGeneratedImage, {
      token,
      imageId: image._id,
      generatedStorageId: storageId,
      generationPrompt: revisedPrompt,
      dimensions: { width: 1024, height: 1024 },
    });

    console.log('\n✅ SUCCESS! Generated image saved to database.');
    console.log(`\n🔗 Original image ID: ${image._id}`);
    console.log(`🔗 Generated storage ID: ${storageId}`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
