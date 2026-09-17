import { ConvexHttpClient } from 'convex/browser';
// @ts-ignore
import { api } from '../convex/_generated/api.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://scintillating-hornet-482.convex.cloud';

const CATEGORY_IMAGES = [
  {
    name: 'catReformers',
    category: 'icon',
    filePath: path.join(rootDir, 'public/images/products/reformer-roble-a015.webp'),
    alt: 'Cama de Pilates Reformer de roble natural en estudio luminoso - Edelweiss',
    description: 'Category icon for Reformers: Solid oak wood reformer with natural daylight through arched windows',
    width: 1024,
    height: 1024,
  },
  {
    name: 'catCadillacs',
    category: 'icon',
    filePath: path.join(rootDir, 'public/images/products/cadillac-roble-a019.webp'),
    alt: 'Cadillac de Pilates y torre de acero inoxidable y madera de roble - Edelweiss',
    description: 'Category icon for Cadillacs and Torres: Solid oak Cadillac with full stainless steel tower',
    width: 1024,
    height: 1024,
  },
  {
    name: 'catChairs',
    category: 'icon',
    filePath: path.join(rootDir, 'public/images/products/silla-wunda-roble-premium-a101.webp'),
    alt: 'Silla Wunda y barril de Pilates en madera de roble premium - Edelweiss',
    description: 'Category icon for Chairs and Barrels: Premium oak Wunda chair in sunlit studio',
    width: 1024,
    height: 1024,
  },
  {
    name: 'catAccessories',
    category: 'icon',
    filePath: path.join(rootDir, 'public/images/pilates-straps-main.webp'),
    alt: 'Cintas de algodón orgánico para Reformer de Pilates - Edelweiss',
    description: 'Category icon for Accessories: Premium coiled organic cotton reformer straps on wooden bench',
    width: 1024,
    height: 1024,
  },
  {
    name: 'catRopa',
    category: 'icon',
    filePath: path.join(rootDir, 'public/images/cat-icon-ropa.webp'),
    alt: 'Conjunto de ropa deportiva de algodón orgánico para Pilates - Edelweiss',
    description: 'Category icon for Ropa: Terracotta organic cotton workout apparel on warm wood floor',
    width: 1024,
    height: 1024,
  },
];

async function uploadCategoryImages() {
  console.log(`Connecting to Convex: ${CONVEX_URL}`);
  const client = new ConvexHttpClient(CONVEX_URL);

  for (const item of CATEGORY_IMAGES) {
    console.log(`\n📤 Processing ${item.name} (${item.filePath})...`);

    if (!fs.existsSync(item.filePath)) {
      console.error(`❌ File not found: ${item.filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(item.filePath);
    const blob = new Blob([fileBuffer], { type: 'image/webp' });
    console.log(`   File size: ${(blob.size / 1024).toFixed(2)} KB`);

    console.log('   Generating upload URL...');
    const uploadUrl = await client.mutation(api.siteImages.directGenerateUploadUrl, {});

    console.log('   Uploading to Convex storage...');
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/webp' },
      body: blob,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed for ${item.name}: ${uploadRes.statusText}`);
    }

    const { storageId } = await uploadRes.json();
    console.log(`   Uploaded! Storage ID: ${storageId}`);

    console.log('   Saving metadata in site_images...');
    const docId = await client.mutation(api.siteImages.directUpload, {
      name: item.name,
      category: item.category,
      storageId,
      mimeType: 'image/webp',
      size: blob.size,
      width: item.width,
      height: item.height,
      alt: item.alt,
      description: item.description,
    });

    console.log(`✅ Successfully saved ${item.name} (Doc ID: ${docId})`);
  }

  console.log('\n🎉 All category images uploaded to Convex successfully!');
}

uploadCategoryImages().catch((err) => {
  console.error('❌ Upload script failed:', err);
  process.exit(1);
});
