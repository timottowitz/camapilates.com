import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONVEX_URL = 'https://scintillating-hornet-482.convex.cloud';

async function uploadImage(params: {
  filePath: string;
  name: string;
  category: string;
  alt?: string;
  description?: string;
}) {
  const { filePath, name, category, alt, description } = params;

  console.log(`\n📤 Uploading: ${name}`);

  const client = new ConvexHttpClient(CONVEX_URL);

  // Read file
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);

  console.log(`   Size: ${(blob.size / 1024).toFixed(2)} KB`);

  // Generate upload URL
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl);

  // Upload file
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'image/png' },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const { storageId } = await response.json();

  // Save metadata
  const result = await client.mutation(api.siteImages.upload, {
    name,
    category,
    storageId,
    mimeType: blob.type || 'image/png',
    size: blob.size,
    alt,
    description,
  });

  console.log(`   ✅ Uploaded successfully: ${name} (${category})`);
  return result;
}

async function main() {
  try {
    // Upload Feature Image 1 - Silence card (use optimized WebP)
    await uploadImage({
      filePath: path.join(__dirname, '../public/images/feature_1.webp'),
      name: 'featureSilence',
      category: 'feature',
      alt: 'Silence that is felt in each repetition',
      description: 'Feature section showing premium silence and craftsmanship with card layout',
    });

    console.log('\n🎉 Image uploaded successfully to Convex!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
