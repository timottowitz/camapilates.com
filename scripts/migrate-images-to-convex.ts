#!/usr/bin/env node
/**
 * Migration script to upload existing local images to Convex storage
 *
 * This script:
 * 1. Reads images from public/images directory
 * 2. Uploads them to Convex storage
 * 3. Creates database entries in site_images table
 *
 * Run with: npx tsx scripts/migrate-images-to-convex.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
// eslint-disable-next-line import/extensions
import { getAdminToken } from './lib/adminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Convex client
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error('❌ CONVEX_URL not found in environment variables');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Map of local file paths to Convex image names
const IMAGE_MAPPINGS = [
  {
    localPath: 'public/images/featured-products.webp',
    name: 'featuredProducts',
    category: 'hero',
    alt: 'Pilates reformer featured product',
  },
  {
    localPath: 'public/images/featured-products.webp',
    name: 'shopHero',
    category: 'hero',
    alt: 'Shop hero banner - Pilates reformer',
  },
  {
    localPath: 'public/images/finish-mycelium.webp',
    name: 'finishMycelium',
    category: 'finish',
    alt: 'Mycelium finish material',
  },
  {
    localPath: 'public/images/badges/mylo.svg',
    name: 'myloBadge',
    category: 'badge',
    alt: 'Mylo™ certified badge',
  },
  {
    localPath: 'public/images/special/mylo-special.svg',
    name: 'myloSpecial',
    category: 'special',
    alt: 'Mylo™ special edition',
  },
  {
    localPath: 'public/brand/edelweiss.svg',
    name: 'edelweissLogo',
    category: 'logo',
    alt: 'Edelweiss Pilates logo',
  },
  {
    localPath: 'public/og/reformer-compacto.png',
    name: 'catReformers',
    category: 'icon',
    alt: 'Reformers category',
  },
  {
    localPath: 'public/og/accesorios-cama-de-pilates-esenciales.png',
    name: 'catAccessories',
    category: 'icon',
    alt: 'Accessories category',
  },
];

async function getMimeType(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadImageToConvex(mapping: typeof IMAGE_MAPPINGS[0], token: string) {
  const fullPath = path.join(__dirname, '..', mapping.localPath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${mapping.name} - file not found: ${mapping.localPath}`);
    return;
  }

  try {
    // Read file
    const buffer = fs.readFileSync(fullPath);
    const blob = new Blob([buffer], { type: await getMimeType(fullPath) });
    const stats = fs.statSync(fullPath);

    console.log(`📤 Uploading ${mapping.name} (${(stats.size / 1024).toFixed(1)}KB)...`);

    // Step 1: Generate upload URL
    const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, { token });

    // Step 2: Upload file to the URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'application/octet-stream' },
      body: blob,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    // Step 3: Create/update database entry
    const imageId = await client.mutation(api.siteImages.upload, {
      token,
      name: mapping.name,
      category: mapping.category,
      storageId,
      mimeType: blob.type,
      size: stats.size,
      alt: mapping.alt,
    });

    console.log(`✅ Uploaded ${mapping.name} → ${imageId}`);
  } catch (error: any) {
    console.error(`❌ Failed to upload ${mapping.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image migration to Convex...\n');
  console.log(`📡 Connected to: ${CONVEX_URL}\n`);
  const token = await getAdminToken(client as any);

  for (const mapping of IMAGE_MAPPINGS) {
    await uploadImageToConvex(mapping, token);
  }

  console.log('\n✨ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify images in Convex dashboard');
  console.log('2. Update components to use useConvexAssets()');
  console.log('3. Test locally');
  console.log('4. Deploy to production');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
