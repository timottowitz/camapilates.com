#!/usr/bin/env node
/**
 * Migration script to upload existing local images to Convex storage
 * Run with: node scripts/migrate-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Convex client
const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('❌ VITE_CONVEX_URL not found in .env.local');
  console.error('   Add: VITE_CONVEX_URL=https://your-deployment.convex.cloud');
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
    localPath: 'public/images/featured-products.webp', // Same file, different name
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

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadImageToConvex(mapping, token) {
  const fullPath = path.join(__dirname, '..', mapping.localPath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${mapping.name} - file not found: ${mapping.localPath}`);
    return;
  }

  try {
    const stats = fs.statSync(fullPath);
    console.log(`📤 Uploading ${mapping.name} (${(stats.size / 1024).toFixed(1)}KB)...`);

    // Step 1: Generate upload URL
    const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, { token });

    // Step 2: Upload file to that URL
    const buffer = fs.readFileSync(fullPath);
    const blob = new Blob([buffer], { type: getMimeType(fullPath) });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': blob.type },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    // Step 3: Create database entry
    await client.mutation(api.siteImages.upload, {
      token,
      name: mapping.name,
      category: mapping.category,
      storageId,
      mimeType: blob.type,
      size: stats.size,
      alt: mapping.alt,
    });

    console.log(`✅ Uploaded ${mapping.name}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${mapping.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image migration to Convex...\n');
  console.log(`📡 Connected to: ${CONVEX_URL}\n`);
  const token = await getAdminToken(client);

  for (const mapping of IMAGE_MAPPINGS) {
    await uploadImageToConvex(mapping, token);
  }

  console.log('\n✨ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Verify images in Convex dashboard → Storage');
  console.log('2. Components will automatically use Convex images');
  console.log('3. Test locally at http://localhost:8081/shop');
  console.log('4. Deploy to production');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
