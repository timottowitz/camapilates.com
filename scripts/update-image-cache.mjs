#!/usr/bin/env node
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const CONVEX_URL = process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud';
const client = new ConvexHttpClient(CONVEX_URL);

async function updateAllImages() {
  console.log('🔄 Updating all images to no-cache...\n');
  
  const images = await client.query(api.siteImages.listActive);
  const token = await getAdminToken(client);
  
  for (const image of images) {
    console.log(`📝 Updating ${image.name}...`);
    await client.mutation(api.siteImages.updateMetadata, {
      token,
      id: image._id,
      cacheControl: 'no-store, no-cache, must-revalidate',
    });
    console.log(`✅ Updated ${image.name}`);
  }
  
  console.log('\n✨ All images updated to no-cache!');
}

updateAllImages().catch(console.error);
