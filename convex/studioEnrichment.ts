import { v } from 'convex/values';
import { action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

/**
 * Studio Enrichment Pipeline
 * Fetches complete data from Google Places API and stores in Convex
 */

// Full field mask for complete enrichment
const ENRICHMENT_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'shortFormattedAddress',
  'addressComponents',
  'location',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'googleMapsUri',
  'regularOpeningHours',
  'rating',
  'userRatingCount',
  'priceLevel',
  'editorialSummary',
  'reviews',
  'photos',
  'types',
  'primaryType',
  'primaryTypeDisplayName',
  'accessibilityOptions',
  'paymentOptions',
  'parkingOptions',
  'businessStatus',
  'utcOffsetMinutes',
].join(',');

// Configuration
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;
const MAX_PHOTOS_PER_STUDIO = 5;
const PHOTO_WIDTH = 800;
const PHOTO_HEIGHT = 600;

// Types for Places API response
interface PlacesPhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions?: Array<{
    displayName: string;
    uri?: string;
    photoUri?: string;
  }>;
}

interface PlacesResponse {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
  };
  editorialSummary?: { text: string };
  photos?: PlacesPhoto[];
  accessibilityOptions?: Record<string, boolean>;
  paymentOptions?: Record<string, boolean>;
  parkingOptions?: Record<string, boolean>;
  reviews?: Array<{
    name: string;
    rating: number;
    text?: { text: string };
    authorAttribution?: { displayName: string };
    publishTime?: string;
  }>;
  utcOffsetMinutes?: number;
  businessStatus?: string;
  types?: string[];
  primaryType?: string;
}

/**
 * Main enrichment action - enriches all CDMX studios
 */
export const enrichAll = action({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const city = args.city || 'Ciudad de México';
    const limit = args.limit;

    console.log(`Starting enrichment for city: ${city}`);

    // Get API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured');
    }

    // Get studios to enrich
    const studios = await ctx.runQuery(internal.studioEnrichment.getStudiosToEnrich, {
      city,
      limit,
    });

    console.log(`Found ${studios.length} studios to enrich`);

    const results = {
      total: studios.length,
      enriched: 0,
      photosUploaded: 0,
      errors: [] as Array<{ studioId: string; slug: string; error: string }>,
      startTime: Date.now(),
    };

    // Process in batches
    for (let i = 0; i < studios.length; i += BATCH_SIZE) {
      const batch = studios.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(studios.length / BATCH_SIZE)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (studio) => {
        try {
          // 1. Fetch Place Details
          const placeData = await fetchPlaceDetails(studio.googlePlaceId!, apiKey);

          if (!placeData) {
            throw new Error('No data returned from Places API');
          }

          // 2. Store raw response
          await ctx.runMutation(internal.studioEnrichment.storeRawData, {
            googlePlaceId: studio.googlePlaceId!,
            studioId: studio._id,
            rawResponse: placeData,
            fieldMask: ENRICHMENT_FIELD_MASK,
          });

          // 3. Download and upload photos
          let photosUploaded = 0;
          if (placeData.photos && placeData.photos.length > 0) {
            const photosToDownload = placeData.photos.slice(0, MAX_PHOTOS_PER_STUDIO);

            for (let photoIndex = 0; photoIndex < photosToDownload.length; photoIndex++) {
              const photo = photosToDownload[photoIndex];
              try {
                const photoResult = await downloadAndUploadPhoto(
                  ctx,
                  photo,
                  apiKey,
                  studio._id,
                  studio.googlePlaceId!,
                  photoIndex
                );
                if (photoResult) {
                  photosUploaded++;
                }
              } catch (photoError) {
                console.error(`Error uploading photo ${photoIndex} for ${studio.slug}:`, photoError);
              }
            }
          }

          // 4. Map and update studio
          const mappedData = mapPlacesDataToStudio(placeData);
          await ctx.runMutation(internal.studioEnrichment.updateStudioWithEnrichment, {
            studioId: studio._id,
            data: mappedData,
          });

          return { success: true, photosUploaded };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error enriching ${studio.slug}:`, errorMessage);
          return { success: false, error: errorMessage, slug: studio.slug, studioId: studio._id.toString() };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Aggregate results
      for (const result of batchResults) {
        if (result.success) {
          results.enriched++;
          results.photosUploaded += result.photosUploaded || 0;
        } else if ('error' in result) {
          results.errors.push({
            studioId: result.studioId!,
            slug: result.slug!,
            error: result.error!,
          });
        }
      }

      // Rate limiting delay (except for last batch)
      if (i + BATCH_SIZE < studios.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const duration = Date.now() - results.startTime;
    console.log(`Enrichment complete: ${results.enriched}/${results.total} studios, ${results.photosUploaded} photos, ${results.errors.length} errors`);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);

    return {
      ...results,
      duration,
      estimatedCost: `$${((results.enriched * 0.008) + (results.photosUploaded * 0.007)).toFixed(2)}`,
    };
  },
});

/**
 * Enrich a single studio (for testing)
 */
export const enrichOne = action({
  args: {
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured');
    }

    const studio = await ctx.runQuery(internal.studioEnrichment.getStudioById, {
      studioId: args.studioId,
    });

    if (!studio) {
      throw new Error('Studio not found');
    }

    if (!studio.googlePlaceId) {
      throw new Error('Studio has no googlePlaceId');
    }

    // Fetch Place Details
    const placeData = await fetchPlaceDetails(studio.googlePlaceId, apiKey);

    if (!placeData) {
      throw new Error('No data returned from Places API');
    }

    // Store raw response
    await ctx.runMutation(internal.studioEnrichment.storeRawData, {
      googlePlaceId: studio.googlePlaceId,
      studioId: studio._id,
      rawResponse: placeData,
      fieldMask: ENRICHMENT_FIELD_MASK,
    });

    // Download and upload photos
    let photosUploaded = 0;
    if (placeData.photos && placeData.photos.length > 0) {
      const photosToDownload = placeData.photos.slice(0, MAX_PHOTOS_PER_STUDIO);

      for (let photoIndex = 0; photoIndex < photosToDownload.length; photoIndex++) {
        const photo = photosToDownload[photoIndex];
        try {
          const photoResult = await downloadAndUploadPhoto(
            ctx,
            photo,
            apiKey,
            studio._id,
            studio.googlePlaceId,
            photoIndex
          );
          if (photoResult) {
            photosUploaded++;
          }
        } catch (photoError) {
          console.error(`Error uploading photo ${photoIndex}:`, photoError);
        }
      }
    }

    // Map and update studio
    const mappedData = mapPlacesDataToStudio(placeData);
    await ctx.runMutation(internal.studioEnrichment.updateStudioWithEnrichment, {
      studioId: studio._id,
      data: mappedData,
    });

    return {
      success: true,
      studioSlug: studio.slug,
      photosUploaded,
      fieldsUpdated: Object.keys(mappedData),
    };
  },
});

// ============================================
// Helper Functions
// ============================================

async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<PlacesResponse | null> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': ENRICHMENT_FIELD_MASK,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Places API error ${response.status}:`, errorText);
    throw new Error(`Places API error: ${response.status}`);
  }

  return response.json();
}

async function downloadAndUploadPhoto(
  ctx: any,
  photo: PlacesPhoto,
  apiKey: string,
  studioId: Id<'studios'>,
  googlePlaceId: string,
  photoIndex: number
): Promise<boolean> {
  // Get photo URL
  const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media`;
  const params = new URLSearchParams({
    maxHeightPx: PHOTO_HEIGHT.toString(),
    maxWidthPx: PHOTO_WIDTH.toString(),
    key: apiKey,
    skipHttpRedirect: 'true',
  });

  const photoResponse = await fetch(`${photoUrl}?${params}`);
  if (!photoResponse.ok) {
    throw new Error(`Photo fetch failed: ${photoResponse.status}`);
  }

  const photoData = await photoResponse.json();
  const imageUrl = photoData.photoUri;

  if (!imageUrl) {
    throw new Error('No photoUri in response');
  }

  // Download actual image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Image download failed: ${imageResponse.status}`);
  }

  const imageBlob = await imageResponse.blob();
  const imageBuffer = await imageBlob.arrayBuffer();

  // Upload to Convex storage
  const uploadUrl = await ctx.runMutation(internal.studioEnrichment.generateUploadUrl);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': imageBlob.type || 'image/jpeg' },
    body: imageBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Convex upload failed: ${uploadResponse.status}`);
  }

  const { storageId } = await uploadResponse.json();

  // Store photo record
  await ctx.runMutation(internal.studioEnrichment.storePhoto, {
    studioId,
    googlePlaceId,
    storageId,
    photoIndex,
    width: photo.widthPx,
    height: photo.heightPx,
    attribution: photo.authorAttributions?.[0]
      ? {
          displayName: photo.authorAttributions[0].displayName,
          uri: photo.authorAttributions[0].uri,
          photoUri: photo.authorAttributions[0].photoUri,
        }
      : undefined,
    googlePhotoName: photo.name,
  });

  return true;
}

function mapPlacesDataToStudio(placeData: PlacesResponse) {
  const result: Record<string, any> = {};

  // Metrics
  if (placeData.rating !== undefined) {
    result.metrics = {
      googleRating: placeData.rating,
      googleReviewCount: placeData.userRatingCount,
      lastReviewDate: placeData.reviews?.[0]?.publishTime
        ? new Date(placeData.reviews[0].publishTime).getTime()
        : undefined,
    };
  }

  // Contact
  if (placeData.nationalPhoneNumber || placeData.websiteUri) {
    result.contact = {
      phone: placeData.nationalPhoneNumber,
      website: placeData.websiteUri,
    };
  }

  // Hours
  if (placeData.regularOpeningHours?.weekdayDescriptions) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hours: Record<string, string> = {};

    placeData.regularOpeningHours.weekdayDescriptions.forEach((desc, index) => {
      if (days[index]) {
        // Extract just the hours part (after the day name)
        const hoursPart = desc.split(': ').slice(1).join(': ');
        hours[days[index]] = hoursPart || desc;
      }
    });

    // Convert UTC offset to timezone string
    const utcOffset = placeData.utcOffsetMinutes ?? -360; // Default to Mexico City (UTC-6)
    const offsetHours = Math.abs(Math.floor(utcOffset / 60));
    const offsetSign = utcOffset >= 0 ? '+' : '-';
    hours.timezone = `UTC${offsetSign}${offsetHours}`;

    result.hours = hours;
  }

  // Description from editorial summary
  if (placeData.editorialSummary?.text) {
    result.description = placeData.editorialSummary.text;
  }

  // Amenities from accessibility, parking, payment options
  const amenities: string[] = [];

  if (placeData.accessibilityOptions) {
    if (placeData.accessibilityOptions.wheelchairAccessibleParking) amenities.push('Estacionamiento accesible');
    if (placeData.accessibilityOptions.wheelchairAccessibleEntrance) amenities.push('Entrada accesible');
    if (placeData.accessibilityOptions.wheelchairAccessibleRestroom) amenities.push('Baño accesible');
    if (placeData.accessibilityOptions.wheelchairAccessibleSeating) amenities.push('Asientos accesibles');
  }

  if (placeData.parkingOptions) {
    if (placeData.parkingOptions.freeParking) amenities.push('Estacionamiento gratuito');
    if (placeData.parkingOptions.paidParking) amenities.push('Estacionamiento de pago');
    if (placeData.parkingOptions.streetParking) amenities.push('Estacionamiento en calle');
    if (placeData.parkingOptions.valetParking) amenities.push('Servicio de valet');
  }

  if (placeData.paymentOptions) {
    if (placeData.paymentOptions.acceptsCreditCards) amenities.push('Acepta tarjetas de crédito');
    if (placeData.paymentOptions.acceptsDebitCards) amenities.push('Acepta tarjetas de débito');
    if (placeData.paymentOptions.acceptsCashOnly) amenities.push('Solo efectivo');
    if (placeData.paymentOptions.acceptsNfc) amenities.push('Pago sin contacto');
  }

  if (amenities.length > 0) {
    result.amenities = amenities;
  }

  // Data quality tracking
  result.lastEnriched = Date.now();
  result.updatedAt = Date.now();

  // Calculate data quality score (0-100)
  let qualityScore = 0;
  if (placeData.rating) qualityScore += 20;
  if (placeData.nationalPhoneNumber) qualityScore += 15;
  if (placeData.websiteUri) qualityScore += 15;
  if (placeData.regularOpeningHours) qualityScore += 15;
  if (placeData.photos && placeData.photos.length > 0) qualityScore += 20;
  if (placeData.editorialSummary) qualityScore += 10;
  if (amenities.length > 0) qualityScore += 5;

  result.dataQualityScore = qualityScore;

  return result;
}

// ============================================
// Internal Queries and Mutations
// ============================================

export const getStudiosToEnrich = internalQuery({
  args: {
    city: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('studios')
      .withIndex('by_city', (q) => q.eq('address.city', args.city))
      .filter((q) => q.eq(q.field('isActive'), true));

    const studios = await query.collect();

    // Filter to only studios with googlePlaceId
    const withPlaceId = studios.filter((s) => s.googlePlaceId);

    if (args.limit) {
      return withPlaceId.slice(0, args.limit);
    }

    return withPlaceId;
  },
});

export const getStudioById = internalQuery({
  args: {
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.studioId);
  },
});

export const storeRawData = internalMutation({
  args: {
    googlePlaceId: v.string(),
    studioId: v.id('studios'),
    rawResponse: v.any(),
    fieldMask: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if we already have data for this place
    const existing = await ctx.db
      .query('placesRawData')
      .withIndex('by_place_id', (q) => q.eq('googlePlaceId', args.googlePlaceId))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        rawResponse: args.rawResponse,
        fieldMask: args.fieldMask,
        fetchedAt: Date.now(),
      });
    } else {
      // Create new record
      await ctx.db.insert('placesRawData', {
        googlePlaceId: args.googlePlaceId,
        studioId: args.studioId,
        rawResponse: args.rawResponse,
        fieldMask: args.fieldMask,
        apiVersion: 'v1',
        fetchedAt: Date.now(),
      });
    }
  },
});

export const generateUploadUrl = internalMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const storePhoto = internalMutation({
  args: {
    studioId: v.id('studios'),
    googlePlaceId: v.string(),
    storageId: v.id('_storage'),
    photoIndex: v.number(),
    width: v.number(),
    height: v.number(),
    attribution: v.optional(
      v.object({
        displayName: v.string(),
        uri: v.optional(v.string()),
        photoUri: v.optional(v.string()),
      })
    ),
    googlePhotoName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if photo already exists for this studio/index
    const existing = await ctx.db
      .query('studioPhotos')
      .withIndex('by_studio_index', (q) =>
        q.eq('studioId', args.studioId).eq('photoIndex', args.photoIndex)
      )
      .first();

    if (existing) {
      // Delete old storage file
      await ctx.storage.delete(existing.storageId);
      // Update record
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        width: args.width,
        height: args.height,
        attribution: args.attribution,
        googlePhotoName: args.googlePhotoName,
        uploadedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('studioPhotos', {
        studioId: args.studioId,
        googlePlaceId: args.googlePlaceId,
        storageId: args.storageId,
        photoIndex: args.photoIndex,
        width: args.width,
        height: args.height,
        attribution: args.attribution,
        googlePhotoName: args.googlePhotoName,
        uploadedAt: Date.now(),
      });
    }
  },
});

export const updateStudioWithEnrichment = internalMutation({
  args: {
    studioId: v.id('studios'),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const studio = await ctx.db.get(args.studioId);
    if (!studio) return;

    // Merge new data with existing
    const updates: Record<string, any> = {
      updatedAt: Date.now(),
      lastEnriched: Date.now(),
    };

    // Merge metrics
    if (args.data.metrics) {
      updates.metrics = {
        ...studio.metrics,
        ...args.data.metrics,
      };
    }

    // Merge contact (don't overwrite existing whatsapp, email, bookingUrl)
    if (args.data.contact) {
      updates.contact = {
        ...studio.contact,
        phone: args.data.contact.phone || studio.contact.phone,
        website: args.data.contact.website || studio.contact.website,
      };
    }

    // Set hours
    if (args.data.hours) {
      updates.hours = args.data.hours;
    }

    // Set description if not already set
    if (args.data.description && !studio.description) {
      updates.description = args.data.description;
    }

    // Merge amenities
    if (args.data.amenities) {
      const existingAmenities = studio.amenities || [];
      const newAmenities = args.data.amenities.filter(
        (a: string) => !existingAmenities.includes(a)
      );
      updates.amenities = [...existingAmenities, ...newAmenities];
    }

    // Update data quality score
    if (args.data.dataQualityScore !== undefined) {
      updates.dataQualityScore = args.data.dataQualityScore;
    }

    await ctx.db.patch(args.studioId, updates);
  },
});
