#!/usr/bin/env tsx
/**
 * Test Google Places photo URLs
 */

import GooglePlacesNewService from '../src/services/google-places-new';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testPhotoUrls() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }

  const service = new GooglePlacesNewService(apiKey);

  console.log('🔍 Testing photo URL generation...\n');

  // Search for a specific studio
  const results = await service.searchPlacesText('MindBody Pilates Studio CORDOBA Roma Norte CDMX');

  if (results.length === 0) {
    console.log('❌ No results found');
    return;
  }

  const place = results[0];
  console.log('✅ Found place:', place.displayName?.text);
  console.log('📍 Place ID:', place.id);

  if (!place.photos || place.photos.length === 0) {
    console.log('❌ No photos found for this place');
    return;
  }

  console.log(`\n📸 Found ${place.photos.length} photos`);

  // Test first photo
  const firstPhoto = place.photos[0];
  console.log('\nFirst photo details:');
  console.log('  Name:', firstPhoto.name);
  console.log('  Width:', firstPhoto.widthPx);
  console.log('  Height:', firstPhoto.heightPx);

  // Generate URL
  const photoUrl = service.getPhotoUrl(firstPhoto.name, 800, 600);
  console.log('\n🔗 Generated URL:');
  console.log(photoUrl);

  // Also try getting place details for fresh photo references
  console.log('\n📍 Fetching fresh place details...');
  const detailedPlace = await service.getPlaceDetails(place.id);

  if (detailedPlace.photos && detailedPlace.photos.length > 0) {
    const detailPhoto = detailedPlace.photos[0];
    console.log('\nDetailed photo info:');
    console.log('  Name:', detailPhoto.name);

    const detailPhotoUrl = service.getPhotoUrl(detailPhoto.name, 800, 600);
    console.log('\n🔗 Detail Photo URL:');
    console.log(detailPhotoUrl);

    try {
      const detailResponse = await fetch(detailPhotoUrl, { method: 'HEAD' });
      console.log(`\n✅ Detail Photo Status: ${detailResponse.status}`);
    } catch (error) {
      console.error('❌ Error fetching detail photo:', error);
    }
  }

  // Test if URL is accessible
  try {
    const response = await fetch(photoUrl, { method: 'HEAD' });
    console.log(`\n✅ Photo URL Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Photo is accessible!');
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'), 'bytes');
    } else {
      console.log('❌ Photo returned non-200 status');
    }
  } catch (error) {
    console.error('❌ Error fetching photo:', error);
  }

  // Test URL format
  console.log('\n🔍 URL Structure Analysis:');
  const urlParts = new URL(photoUrl);
  console.log('  Base:', urlParts.origin + urlParts.pathname);
  console.log('  Params:', urlParts.search);

  // Check for duplicate "places/"
  if (photoUrl.includes('places/places/')) {
    console.log('\n⚠️  WARNING: URL contains duplicate "places/" path');
  } else {
    console.log('\n✅ URL structure looks correct');
  }
}

testPhotoUrls().catch(console.error);