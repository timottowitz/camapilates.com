#!/usr/bin/env node

/**
 * Download product images from Convex storage to public/images
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'public/images');

// Map placeholder IDs to target filenames
const PLACEHOLDER_TO_FILE = {
  'product-calcetines-antideslizantes-main': 'socks-organic.png',
  'product-calcetines-pack-3-main': 'socks-pack3.png',
  'product-leggings-organicos-fitted-main': 'leggings-fitted.png',
  'product-top-organico-fitted-main': 'top-fitted.png',
  'product-conjunto-fitted-organico-main': 'conjunto-fitted.png',
  'product-pantalon-organico-relaxed-main': 'pantalon-relaxed.png',
  'product-top-organico-relaxed-main': 'top-relaxed.png',
  'product-conjunto-relaxed-organico-main': 'conjunto-relaxed.png',
  'product-luz-terapia-casa-main': 'luz-panel-home.png',
  'product-luz-terapia-studio-2-main': 'luz-studio-2.png',
  'product-luz-terapia-studio-4-main': 'luz-studio-4.png',
  'product-luz-terapia-studio-6-main': 'luz-studio-6.png',
  'product-luz-terapia-studio-8-main': 'luz-studio-8.png',
  'product-luz-terapia-custom-main': 'luz-custom.png',
};

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    proto.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function main() {
  console.log('📥 Product Image Downloader');
  console.log('===========================\n');

  const convexUrl = process.env.CONVEX_PROD_URL || process.env.VITE_CONVEX_URL || 'https://scintillating-hornet-482.convex.cloud';
  console.log(`🔗 Convex: ${convexUrl}`);
  
  const client = new ConvexHttpClient(convexUrl);

  // Get all product placeholders
  const all = await client.query(api.placeholders.list, {});
  const productPlaceholders = all.filter(p => p.pageType === 'product');

  console.log(`\n📦 Found ${productPlaceholders.length} product placeholders\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of productPlaceholders) {
    const targetFile = PLACEHOLDER_TO_FILE[p.placeholderId];
    if (!targetFile) {
      console.log(`⚠️  Unknown placeholder: ${p.placeholderId}`);
      continue;
    }

    const destPath = path.join(IMAGES_DIR, targetFile);
    
    // Check if already exists
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size > 1000) { // Existing file is substantial
        console.log(`✓ ${targetFile} already exists (${Math.round(stats.size/1024)}KB)`);
        skipped++;
        continue;
      }
    }

    if (!p.assignedImageId) {
      console.log(`⏳ ${targetFile} - no image assigned yet`);
      failed++;
      continue;
    }

    // Get the full placeholder with imageUrl
    const full = await client.query(api.placeholders.getById, { placeholderId: p.placeholderId });
    
    if (!full?.imageUrl) {
      console.log(`❌ ${targetFile} - no image URL`);
      failed++;
      continue;
    }

    try {
      console.log(`📥 Downloading ${targetFile}...`);
      await downloadFile(full.imageUrl, destPath);
      const stats = fs.statSync(destPath);
      console.log(`   ✅ Saved (${Math.round(stats.size/1024)}KB)`);
      downloaded++;
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);
