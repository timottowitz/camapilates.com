import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';
import { createOpenAI } from '@ai-sdk/openai';
import fetch from 'node-fetch';
import fs from 'fs';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Convert AI description to DALL-E 3 prompt
 * Goal: Create similar image but visually different to avoid copyright issues
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

  // Build a descriptive prompt that captures essence but creates new image
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
      size: '1024x1024', // DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024
      quality: 'hd', // or 'standard'
      style: 'natural', // or 'vivid'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DALL-E API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  const imageUrl = result.data[0].url;
  const revisedPrompt = result.data[0].revised_prompt;

  console.log(`   ✅ Generated! Revised prompt: ${revisedPrompt.substring(0, 80)}...`);

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
 * Process single image: generate similar version
 */
async function processImage(client, token, image) {
  console.log(`\n🔍 Processing: ${image.fileName}`);
  console.log(`   Scene: ${image.aiDescription.scene.substring(0, 60)}...`);

  try {
    // Build prompt from AI description
    const prompt = buildGenerationPrompt(image.aiDescription);
    console.log(`   📝 Prompt length: ${prompt.length} chars`);

    // Generate with DALL-E 3
    const { imageUrl, revisedPrompt } = await generateImage(prompt);

    // Download generated image
    console.log('   ⬇️  Downloading generated image...');
    const imageBuffer = await downloadImage(imageUrl);

    // Upload to Convex
    console.log('   ⬆️  Uploading to Convex...');
    const uploadUrl = await client.mutation(api.aiImages.generateUploadUrl, { token });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' }, // DALL-E returns PNG
      body: imageBuffer,
    });

    const { storageId } = await uploadResponse.json();

    // Update image record with generated version
    await client.mutation(api.aiImages.updateGeneratedImage, {
      token,
      imageId: image._id,
      generatedStorageId: storageId,
      generationPrompt: revisedPrompt,
      dimensions: { width: 1024, height: 1024 },
    });

    console.log(`   ✅ Complete! Generated image stored.`);
    return { success: true };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);

    // Mark as failed in database
    await client.mutation(api.aiImages.markGenerationFailed, {
      token,
      imageId: image._id,
      error: error.message,
    });

    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found');
    process.exit(1);
  }

  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  // Get all images without generated versions
  console.log('\n🔍 Fetching images without generated versions...');
  const allImages = await client.query(api.aiImages.listAll, { token, limit: 100 });

  const pendingImages = allImages.filter((img) => !img.generatedStorageId);

  console.log(`\n🖼️  Found ${pendingImages.length} images to process\n`);

  if (pendingImages.length === 0) {
    console.log('✅ All images already have generated versions!');
    process.exit(0);
  }

  let processed = 0;
  let failed = 0;

  for (const img of pendingImages) {
    const result = await processImage(client, token, img);

    if (result.success) {
      processed++;
    } else {
      failed++;
    }

    // Rate limit: DALL-E 3 has limits (5 images/min for tier 1)
    // Wait 15 seconds between generations to be safe
    if (processed + failed < pendingImages.length) {
      console.log('\n   ⏳ Waiting 15 seconds (rate limit)...');
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Generated: ${processed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${pendingImages.length}\n`);
}

main();
