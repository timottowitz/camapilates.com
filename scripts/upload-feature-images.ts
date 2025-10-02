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
    // Get image path from command line args, or use default
    const imagePath = process.argv[2];

    if (!imagePath) {
      console.error('❌ Please provide image path as argument');
      console.log('\nUsage:');
      console.log('  deno run --allow-all scripts/upload-feature-images.ts /path/to/image.jpg');
      process.exit(1);
    }

    // Determine image name based on path
    const fileName = path.basename(imagePath, path.extname(imagePath));

    // Upload the image
    await uploadImage({
      filePath: imagePath,
      name: 'featureStudioClass',
      category: 'feature',
      alt: 'Pilates instructor teaching reformer class',
      description: 'Feature section showing professional instruction and studio environment',
    });

    console.log('\n🎉 Image uploaded successfully to Convex!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
