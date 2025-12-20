#!/usr/bin/env node

/**
 * Generate remaining product images
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const REMAINING_PRODUCTS = [
  {
    slug: 'luz-terapia-studio-4',
    name: 'Sistema de Luz Terapeutica - Studio 4 Reformers',
    description: 'Pack para estudios medianos: 4 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-4.png',
    style: 'studio',
    subjects: ['four light therapy panels', 'medium pilates studio', 'red light installation'],
    prompt: 'Professional interior photograph of modern pilates studio with 4 red light therapy panels positioned alongside 4 reformers in a row. Warm red glow creating therapeutic atmosphere. Clean minimalist studio design with wood floors and neutral walls. Show professional studio setup. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-6',
    name: 'Sistema de Luz Terapeutica - Studio 6 Reformers',
    description: 'Pack para estudios grandes: 6 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-6.png',
    style: 'studio',
    subjects: ['six light therapy panels', 'large pilates studio', 'professional installation'],
    prompt: 'Professional interior photograph of spacious modern pilates studio with 6 red light therapy panels integrated throughout the space with 6 reformers. Dramatic warm red ambient lighting. High ceilings, clean minimalist design, wood and concrete. Show premium boutique studio atmosphere. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-8',
    name: 'Sistema de Luz Terapeutica - Studio 8+ Reformers',
    description: 'Pack para estudios boutique grandes: 8 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-8.png',
    style: 'studio',
    subjects: ['eight light therapy panels', 'large boutique studio', 'enterprise system'],
    prompt: 'Professional interior photograph of large luxury boutique pilates studio with 8+ red light therapy panels integrated throughout with multiple reformers. Stunning red ambient glow creating spa-like therapeutic environment. Premium architectural design with floor-to-ceiling windows, modern finishes. Show ultimate wellness studio experience. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-custom',
    name: 'Sistema de Luz Terapeutica - Personalizado',
    description: 'Solucion personalizada para estudios con necesidades especificas.',
    imageFile: 'luz-custom.png',
    style: 'technical',
    subjects: ['custom consultation', 'studio planning', 'light therapy design'],
    prompt: 'Professional photograph showing architectural floor plan or blueprint of a pilates studio with red light therapy panel placement markers. Clean modern design aesthetic. Show customization and planning concept. Technical but elegant presentation. Cream/beige paper background. No text except subtle grid lines. High-end consultation concept. 1:1 aspect ratio.'
  }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, options = {}) {
  const { attempts = 3, delayMs = 2000, description = 'operation' } = options;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        console.error(`   ⚠️  ${description} failed (attempt ${attempt}/${attempts})`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

async function generateProductImage(client, token, product, options) {
  const placeholderId = `product-${product.slug}-main`;
  
  console.log(`\n🖼️  Generating: ${product.name}`);
  
  // Check if already exists with image
  const existing = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId });
  if (existing?.imageUrl && !options.force) {
    console.log(`   ✅ Already has image`);
    return { placeholderId, status: 'exists', imageUrl: existing.imageUrl };
  }
  
  // Register placeholder
  await withRetries(
    () => client.mutation(api.placeholders.register, {
      token,
      placeholderId,
      pageType: 'product',
      pageSlug: product.slug,
      location: 'main',
      contextBefore: product.description,
      contextAfter: product.description,
      headingAbove: product.name,
      altText: product.name,
      preferredAspectRatio: product.style === 'studio' ? '16:9' : '1:1',
      preferredStyle: product.style,
      requiredSubjects: product.subjects,
      priority: 100,
      autoGenerate: false,
    }),
    { description: 'register' }
  );

  // Set custom prompt
  await withRetries(
    () => client.mutation(api.placeholders.updatePrompt, { 
      token,
      placeholderId, 
      prompt: product.prompt 
    }),
    { description: 'set prompt' }
  );
  console.log(`   📝 Prompt set`);

  // Queue generation
  await withRetries(
    () => client.action(api.placeholderGeneration.queue, { token, placeholderId }),
    { description: 'queue' }
  );
  console.log(`   🚀 Generation queued`);

  // Poll for result
  const deadline = Date.now() + options.waitMs;
  while (Date.now() < deadline) {
    const p = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId });
    
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
  console.log('🚀 Generating Remaining Product Images');
  console.log('======================================\n');

  const convexUrl = process.env.CONVEX_PROD_URL || 'https://scintillating-hornet-482.convex.cloud';
  const client = new ConvexHttpClient(convexUrl);
  const token = await getAdminToken(client);

  const options = {
    force: process.argv.includes('--force'),
    waitMs: 180000, // 3 minutes
  };

  for (const product of REMAINING_PRODUCTS) {
    try {
      await generateProductImage(client, token, product, options);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
    }
    await sleep(2000);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
