#!/usr/bin/env node

/**
 * Product Image Generator
 * Uses Gemini image generation via Convex placeholders to create product images
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src/content/products.json');
const IMAGES_DIR = path.join(ROOT, 'public/images');

// Products that need images generated
const PRODUCTS_TO_GENERATE = [
  {
    slug: 'calcetines-antideslizantes',
    name: 'Calcetines Antideslizantes de Algodón Orgánico',
    description: 'Calcetines grip de algodón orgánico certificado GOTS. Suelas de caucho natural antideslizante para máxima estabilidad en tu Reformer. Libres de plásticos y sintéticos.',
    imageFile: 'socks-organic.png',
    style: 'product',
    subjects: ['organic cotton grip socks', 'pilates socks', 'non-slip sole'],
    prompt: 'Professional product photography of premium organic cotton pilates grip socks in cream/natural color. Show pair of ankle-height socks with visible non-slip rubber grip dots on sole. Soft natural lighting on clean beige/cream background. Minimalist luxury aesthetic. No text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'calcetines-pack-3',
    name: 'Pack 3 Calcetines Antideslizantes Orgánicos',
    description: 'Set de 3 pares de calcetines grip orgánicos. Incluye colores: Crema Natural, Carbón y Salvia.',
    imageFile: 'socks-pack3.png',
    style: 'product',
    subjects: ['three pairs socks', 'pilates socks collection', 'organic cotton'],
    prompt: 'Professional product photography of three pairs of premium organic cotton pilates grip socks neatly arranged. Colors: cream/natural, charcoal grey, sage green. Show non-slip soles visible. Soft natural lighting on clean beige background. Minimalist luxury aesthetic. No text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'leggings-organicos-fitted',
    name: 'Leggings Fitted de Algodón Orgánico',
    description: 'Leggings ajustados de algodón orgánico con elastano natural. Diseño segunda piel para libertad de movimiento total.',
    imageFile: 'leggings-fitted.png',
    style: 'product',
    subjects: ['fitted leggings', 'organic cotton activewear', 'pilates clothing'],
    prompt: 'Professional product photography of premium fitted black organic cotton pilates leggings laid flat. Show natural fabric texture, high waistband. Soft natural lighting on clean cream/beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'top-organico-fitted',
    name: 'Top Fitted de Algodón Orgánico',
    description: 'Top ajustado de algodón orgánico con soporte integrado. Corte ergonómico para práctica de Pilates.',
    imageFile: 'top-fitted.png',
    style: 'product',
    subjects: ['fitted sports top', 'organic cotton activewear', 'pilates top'],
    prompt: 'Professional product photography of premium fitted black organic cotton pilates sports top/crop top laid flat. Show natural fabric texture, built-in support design. Soft natural lighting on clean cream/beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'conjunto-fitted-organico',
    name: 'Conjunto Fitted Completo – Algodón Orgánico',
    description: 'Set completo: leggings + top fitted de algodón orgánico. Coordinados para una práctica elegante.',
    imageFile: 'conjunto-fitted.png',
    style: 'product',
    subjects: ['matching activewear set', 'organic cotton pilates outfit', 'leggings and top'],
    prompt: 'Professional product photography of premium matching black organic cotton pilates outfit set - fitted leggings and sports top laid flat together. Show coordinated design, natural fabric texture. Soft natural lighting on clean cream/beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'pantalon-organico-relaxed',
    name: 'Pantalón Relaxed de Algodón Orgánico',
    description: 'Pantalón amplio y fluido de algodón orgánico. Corte relajado con cintura elástica natural.',
    imageFile: 'pantalon-relaxed.png',
    style: 'product',
    subjects: ['wide leg pants', 'relaxed fit trousers', 'organic linen cotton'],
    prompt: 'Professional product photography of premium relaxed-fit wide-leg organic cotton and linen pilates pants in cream/natural color laid flat. Show flowing fabric, elastic waistband. Soft natural lighting on clean beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'top-organico-relaxed',
    name: 'Top Relaxed de Algodón Orgánico',
    description: 'Top holgado y transpirable de algodón orgánico. Corte oversized cómodo.',
    imageFile: 'top-relaxed.png',
    style: 'product',
    subjects: ['oversized top', 'relaxed fit shirt', 'organic cotton linen'],
    prompt: 'Professional product photography of premium relaxed-fit oversized organic cotton and linen pilates top in cream/natural color laid flat. Show loose flowing silhouette, natural texture. Soft natural lighting on clean beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'conjunto-relaxed-organico',
    name: 'Conjunto Relaxed Completo – Algodón Orgánico',
    description: 'Set completo: pantalón + top relaxed de algodón orgánico y lino.',
    imageFile: 'conjunto-relaxed.png',
    style: 'product',
    subjects: ['matching relaxed outfit', 'organic loungewear set', 'wide pants and top'],
    prompt: 'Professional product photography of premium matching cream/natural organic cotton and linen relaxed pilates outfit set - wide-leg pants and oversized top laid flat together. Show coordinated relaxed design, natural fabric texture. Soft natural lighting on clean beige background. Minimalist luxury aesthetic. No models, no text, no logos. High-end e-commerce style. 1:1 aspect ratio.'
  },
  {
    slug: 'luz-terapia-casa',
    name: 'Panel de Luz Roja + Infrarroja – Casa',
    description: 'Panel de luz roja (660nm) e infrarroja cercana (850nm) para uso personal junto a tu Reformer.',
    imageFile: 'luz-panel-home.png',
    style: 'product',
    subjects: ['red light therapy panel', 'infrared panel', 'home wellness device'],
    prompt: 'Professional product photography of sleek modern red light therapy panel device with aluminum frame, showing warm red glow from LED array. Panel on minimalist pedestal stand. Clean cream/beige studio background. Show premium build quality, medical-grade appearance. No text, no logos. High-end wellness product photography. 1:1 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-2',
    name: 'Sistema de Luz Terapéutica – Studio 2 Reformers',
    description: 'Pack para estudios pequeños: 2 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-2.png',
    style: 'studio',
    subjects: ['two light therapy panels', 'pilates studio setup', 'red light system'],
    prompt: 'Professional interior photograph of modern pilates studio with 2 red light therapy panels positioned next to 2 reformers. Warm red glow from panels illuminating the space. Clean minimalist studio design with wood accents. Show healing atmosphere combining movement and light therapy. No people, no text, no logos. High-end studio photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-4',
    name: 'Sistema de Luz Terapéutica – Studio 4 Reformers',
    description: 'Pack para estudios medianos: 4 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-4.png',
    style: 'studio',
    subjects: ['four light therapy panels', 'medium pilates studio', 'red light installation'],
    prompt: 'Professional interior photograph of modern pilates studio with 4 red light therapy panels positioned alongside 4 reformers in a row. Warm red glow creating therapeutic atmosphere. Clean minimalist studio design with wood floors and neutral walls. Show professional studio setup. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-6',
    name: 'Sistema de Luz Terapéutica – Studio 6 Reformers',
    description: 'Pack para estudios grandes: 6 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-6.png',
    style: 'studio',
    subjects: ['six light therapy panels', 'large pilates studio', 'professional installation'],
    prompt: 'Professional interior photograph of spacious modern pilates studio with 6 red light therapy panels integrated throughout the space with 6 reformers. Dramatic warm red ambient lighting. High ceilings, clean minimalist design, wood and concrete. Show premium boutique studio atmosphere. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-studio-8',
    name: 'Sistema de Luz Terapéutica – Studio 8+ Reformers',
    description: 'Pack para estudios boutique grandes: 8 paneles de luz roja/infrarroja.',
    imageFile: 'luz-studio-8.png',
    style: 'studio',
    subjects: ['eight light therapy panels', 'large boutique studio', 'enterprise system'],
    prompt: 'Professional interior photograph of large luxury boutique pilates studio with 8+ red light therapy panels integrated throughout with multiple reformers. Stunning red ambient glow creating spa-like therapeutic environment. Premium architectural design with floor-to-ceiling windows, modern finishes. Show ultimate wellness studio experience. No people, no text, no logos. High-end architectural photography. 16:9 aspect ratio.'
  },
  {
    slug: 'luz-terapia-custom',
    name: 'Sistema de Luz Terapéutica – Personalizado',
    description: 'Solución personalizada para estudios con necesidades específicas.',
    imageFile: 'luz-custom.png',
    style: 'technical',
    subjects: ['custom consultation', 'studio planning', 'light therapy design'],
    prompt: 'Professional photograph showing architectural floor plan or blueprint of a pilates studio with red light therapy panel placement markers. Clean modern design aesthetic. Show customization and planning concept. Technical but elegant presentation. Cream/beige paper background. No text except subtle grid lines. High-end consultation concept. 1:1 aspect ratio.'
  }
];

function resolveConvexUrl() {
  return process.env.CONVEX_PROD_URL || process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
}

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
      const message = err?.message || '';
      if (attempt < attempts) {
        console.error(`⚠️  ${description} failed (attempt ${attempt}/${attempts}): ${message}`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

async function ensurePlaceholder(client, token, args) {
  await withRetries(() => client.mutation(api.placeholders.register, { token, ...args }), {
    description: `register ${args.placeholderId}`,
  });
  const current = await withRetries(
    () => client.query(api.placeholders.getByIdAdmin, { token, placeholderId: args.placeholderId }),
    { description: `fetch placeholder ${args.placeholderId}` },
  );
  return current;
}

async function queueGeneration(client, token, placeholderId) {
  await withRetries(
    () => client.action(api.placeholderGeneration.queue, { token, placeholderId }),
    { description: `queue generation for ${placeholderId}` },
  );
}

async function pollPlaceholder(client, token, placeholderId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await client.query(api.placeholders.getByIdAdmin, { token, placeholderId });
    } catch (err) {
      await sleep(2000);
      continue;
    }

    if (!last) {
      return { status: 'missing' };
    }

    if ((last.status === 'active' || last.status === 'image_assigned') && last.imageUrl) {
      return { status: 'active', imageUrl: last.imageUrl };
    }

    if (last.status === 'error') {
      return { status: 'error', error: last.generationError || 'generation failed' };
    }

    console.log(`   ⏳ Waiting... status: ${last.status}`);
    await sleep(5000);
  }

  return { status: last?.status || 'pending', imageUrl: last?.imageUrl, timeout: true };
}

async function generateProductImage(client, token, product, options) {
  const placeholderId = `product-${product.slug}-main`;
  
  console.log(`\n🖼️  Generating image for: ${product.name}`);
  console.log(`   File: ${product.imageFile}`);
  
  // Register placeholder with detailed context (without generatedPrompt - that's set separately)
  const placeholder = await ensurePlaceholder(client, token, {
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
  });

  console.log(`   📋 Placeholder registered: ${placeholder?.status || 'new'}`);

  // Check if already has image
  if (!options.force && placeholder?.imageUrl) {
    console.log(`   ✅ Already has image: ${placeholder.imageUrl}`);
    return { placeholderId, status: 'exists', imageUrl: placeholder.imageUrl };
  }

  // Update prompt with our custom detailed prompt
  await withRetries(
    () => client.mutation(api.placeholders.updatePrompt, { 
      token,
      placeholderId, 
      prompt: product.prompt 
    }),
    { description: `update prompt for ${placeholderId}` }
  );
  console.log(`   📝 Custom prompt set`);

  // Queue generation
  await queueGeneration(client, token, placeholderId);
  console.log(`   🚀 Generation queued`);

  // Poll for result
  const result = await pollPlaceholder(client, token, placeholderId, options.waitMs);
  
  if (result.imageUrl) {
    console.log(`   ✅ Image generated: ${result.imageUrl}`);
  } else if (result.error) {
    console.log(`   ❌ Error: ${result.error}`);
  } else if (result.timeout) {
    console.log(`   ⏰ Timeout - check Convex dashboard`);
  }

  return { placeholderId, ...result, targetFile: product.imageFile };
}

async function main() {
  console.log('🚀 Product Image Generator');
  console.log('==========================\n');

  const convexUrl = resolveConvexUrl();
  console.log(`🔗 Convex: ${convexUrl}`);
  
  const client = new ConvexHttpClient(convexUrl);
  const token = await getAdminToken(client);

  const options = {
    force: process.argv.includes('--force'),
    waitMs: 180000, // 3 minutes per image
  };

  const results = [];
  
  // Process products one at a time to avoid rate limits
  for (const product of PRODUCTS_TO_GENERATE) {
    try {
      const result = await generateProductImage(client, token, product, options);
      results.push(result);
      
      // Small delay between products
      await sleep(2000);
    } catch (err) {
      console.error(`❌ Failed for ${product.slug}: ${err.message}`);
      results.push({ placeholderId: `product-${product.slug}-main`, status: 'error', error: err.message });
    }
  }

  console.log('\n\n📊 Summary');
  console.log('==========');
  
  const successful = results.filter(r => r.imageUrl);
  const failed = results.filter(r => r.status === 'error');
  const pending = results.filter(r => !r.imageUrl && r.status !== 'error');

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⏳ Pending: ${pending.length}`);

  if (successful.length > 0) {
    console.log('\n📸 Generated Images:');
    for (const r of successful) {
      console.log(`   ${r.placeholderId}: ${r.imageUrl}`);
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ Failures:');
    for (const r of failed) {
      console.log(`   ${r.placeholderId}: ${r.error}`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
