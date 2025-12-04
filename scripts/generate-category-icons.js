#!/usr/bin/env node

/**
 * Generate category icons for Ropa and Terapia de Luz
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const CATEGORY_ICONS = [
  {
    slug: 'cat-icon-ropa',
    name: 'Category Icon - Ropa',
    imageFile: 'cat-icon-ropa.png',
    prompt: 'Minimalist circular category icon for pilates clothing. Show elegant folded organic cotton activewear (leggings and top) in cream/natural color on soft beige background. Clean, simple composition centered in frame. Soft diffused lighting. Premium e-commerce category thumbnail style. Square 1:1 aspect ratio. No text, no logos, no people.'
  },
  {
    slug: 'cat-icon-luz',
    name: 'Category Icon - Terapia de Luz',
    imageFile: 'cat-icon-luz.png',
    prompt: 'Minimalist circular category icon for red light therapy. Show sleek modern red light therapy panel device with warm red glow emanating from it. Clean beige/cream background. Simple centered composition. Premium wellness product aesthetic. Square 1:1 aspect ratio. No text, no logos, no people.'
  }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, options = {}) {
  const { attempts = 3, delayMs = 3000, description = 'operation' } = options;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        console.error(`   ⚠️  ${description} failed (attempt ${attempt}/${attempts}): ${err.message}`);
        await sleep(delayMs * attempt);
      }
    }
  }
  throw lastError;
}

async function generateIcon(client, icon, options) {
  const placeholderId = `category-${icon.slug}`;
  
  console.log(`\n🖼️  Generating: ${icon.name}`);
  
  // Check if already exists with image
  const existing = await client.query(api.placeholders.getById, { placeholderId });
  if (existing?.imageUrl && !options.force) {
    console.log(`   ✅ Already has image`);
    return { placeholderId, status: 'exists', imageUrl: existing.imageUrl };
  }
  
  // Register placeholder
  await withRetries(
    () => client.mutation(api.placeholders.register, {
      placeholderId,
      pageType: 'category',
      pageSlug: icon.slug,
      location: 'icon',
      contextBefore: icon.name,
      contextAfter: icon.name,
      headingAbove: icon.name,
      altText: icon.name,
      preferredAspectRatio: '1:1',
      preferredStyle: 'product',
      requiredSubjects: [],
      priority: 100,
    }),
    { description: 'register' }
  );

  // Set custom prompt
  await withRetries(
    () => client.mutation(api.placeholders.updatePrompt, { 
      placeholderId, 
      prompt: icon.prompt 
    }),
    { description: 'set prompt' }
  );
  console.log(`   📝 Prompt set`);

  // Queue generation
  await withRetries(
    () => client.action(api.placeholderGeneration.queue, { placeholderId }),
    { description: 'queue' }
  );
  console.log(`   🚀 Generation queued`);

  // Poll for result
  const deadline = Date.now() + options.waitMs;
  while (Date.now() < deadline) {
    const p = await client.query(api.placeholders.getById, { placeholderId });
    
    if (p?.imageUrl) {
      console.log(`   ✅ Generated!`);
      return { placeholderId, status: 'active', imageUrl: p.imageUrl };
    }
    
    if (p?.status === 'error') {
      console.log(`   ❌ Error: ${p.generationError}`);
      return { placeholderId, status: 'error', error: p.generationError };
    }
    
    console.log(`   ⏳ ${p?.status || 'waiting'}...`);
    await sleep(5000);
  }

  console.log(`   ⏰ Timeout`);
  return { placeholderId, status: 'timeout' };
}

async function main() {
  console.log('🚀 Generating Category Icons');
  console.log('============================\n');

  const convexUrl = process.env.CONVEX_PROD_URL || 'https://scintillating-hornet-482.convex.cloud';
  const client = new ConvexHttpClient(convexUrl);

  const options = {
    force: process.argv.includes('--force'),
    waitMs: 180000,
  };

  for (const icon of CATEGORY_ICONS) {
    try {
      await generateIcon(client, icon, options);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
    }
    await sleep(3000);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
