import { v } from 'convex/values';
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';

/**
 * Production-ready Google Places Photo Proxy
 * Compliant with Google Maps Platform Terms of Service
 *
 * Architecture:
 * 1. Store only place_id (permanently allowed)
 * 2. Fetch fresh photo references on-demand
 * 3. Use field masking for cost optimization
 * 4. Implement proper error handling and fallbacks
 */

// Cost-optimized field masks
const PHOTO_ONLY_FIELDS = 'id,photos';
const BASIC_FIELDS = 'id,displayName,photos,formattedAddress';
const DETAILED_FIELDS = 'id,displayName,photos,formattedAddress,nationalPhoneNumber,websiteUri,regularOpeningHours,rating,userRatingCount';

/**
 * Primary action: Fetch fresh photo URL for a studio
 * Uses minimal field mask to optimize costs
 *
 * Cost: ~$0.017 per call (Place Details) + $0.007 (Place Photos) = $0.024
 */
export const getStudioPhotoUrl = internalAction({
  args: {
    placeId: v.string(),
    maxWidth: v.optional(v.number()),
    maxHeight: v.optional(v.number()),
    photoIndex: v.optional(v.number()), // Which photo to return (0-9)
    includeAttribution: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      placeId,
      maxWidth = 800,
      maxHeight = 600,
      photoIndex = 0,
      includeAttribution = true
    } = args;

    // Validate input parameters
    if (!placeId || !placeId.startsWith('ChIJ')) {
      console.error('Invalid place_id format');
      return {
        success: false,
        error: 'INVALID_PLACE_ID',
        fallbackUrl: null,
      };
    }

    // Use environment variable for API key (server-side only)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('No Google Maps API key configured');
      return {
        success: false,
        error: 'NO_API_KEY',
        fallbackUrl: null,
      };
    }

    try {
      // Step 1: Place Details request with minimal fields (cost optimization)
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

      const detailsResponse = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': PHOTO_ONLY_FIELDS, // Minimal fields for lowest SKU
        },
      });

      if (!detailsResponse.ok) {
        console.error(`Place Details failed: ${detailsResponse.status}`);
        return {
          success: false,
          error: `API_ERROR_${detailsResponse.status}`,
          fallbackUrl: null,
        };
      }

      const placeData = await detailsResponse.json();

      // Check if photos exist
      if (!placeData.photos || placeData.photos.length === 0) {
        return {
          success: false,
          error: 'NO_PHOTOS_AVAILABLE',
          fallbackUrl: null,
        };
      }

      // Select the requested photo (with bounds checking)
      const selectedIndex = Math.min(photoIndex, placeData.photos.length - 1);
      const photo = placeData.photos[selectedIndex];

      // Step 2: Construct photo URL with proper parameters
      const photoName = photo.name;

      // Use skipHttpRedirect to get JSON response (more efficient for proxy)
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media`;
      const photoParams = new URLSearchParams({
        maxHeightPx: Math.min(maxHeight, 4800).toString(),
        maxWidthPx: Math.min(maxWidth, 4800).toString(),
        key: apiKey,
        skipHttpRedirect: 'true', // Get JSON response instead of redirect
      });

      // Step 3: Fetch the photo URL (not the actual image)
      const photoResponse = await fetch(`${photoUrl}?${photoParams}`);

      if (!photoResponse.ok) {
        console.error(`Photo fetch failed: ${photoResponse.status}`);
        return {
          success: false,
          error: `PHOTO_ERROR_${photoResponse.status}`,
          fallbackUrl: null,
        };
      }

      const photoData = await photoResponse.json();

      // Prepare attribution if needed
      let attribution = null;
      if (includeAttribution && photo.authorAttributions && photo.authorAttributions.length > 0) {
        attribution = {
          displayName: photo.authorAttributions[0].displayName,
          uri: photo.authorAttributions[0].uri,
          photoUri: photo.authorAttributions[0].photoUri,
        };
      }

      return {
        success: true,
        photoUrl: photoData.photoUri,
        attribution,
        width: photo.widthPx,
        height: photo.heightPx,
        photoCount: placeData.photos.length,
      };

    } catch (error) {
      console.error('Error in photo proxy:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        fallbackUrl: null,
      };
    }
  },
});

/**
 * Batch photo fetching with rate limiting
 * Optimized for directory pages showing multiple studios
 */
export const getBatchStudioPhotos = internalAction({
  args: {
    placeIds: v.array(v.string()),
    maxWidth: v.optional(v.number()),
    maxHeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { placeIds, maxWidth = 400, maxHeight = 300 } = args;

    const results: Record<string, any> = {};

    // Process in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const DELAY_MS = 100; // 100ms between batches

    for (let i = 0; i < placeIds.length; i += BATCH_SIZE) {
      const batch = placeIds.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchPromises = batch.map(async (placeId) => {
        const result = await ctx.runAction(internal.googlePlaces.getStudioPhotoUrl, {
          placeId,
          maxWidth,
          maxHeight,
          photoIndex: 0,
          includeAttribution: false, // Skip for thumbnails
        });
        return { placeId, result };
      });

      const batchResults = await Promise.all(batchPromises);

      // Store results
      batchResults.forEach(({ placeId, result }) => {
        results[placeId] = result;
      });

      // Rate limiting delay (except for last batch)
      if (i + BATCH_SIZE < placeIds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    return results;
  },
});

/**
 * Get cached studio details (non-photo data)
 * This data can be cached for up to 30 days per ToS
 */
export const getCachedStudioDetails = internalAction({
  args: {
    placeId: v.string(),
    forceRefresh: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { placeId, forceRefresh = false } = args;

    // Check if we have cached data less than 24 hours old
    const cached = await ctx.runQuery(internal.cache.getPlaceDetails, { placeId });

    if (!forceRefresh && cached && cached.cachedAt > Date.now() - 24 * 60 * 60 * 1000) {
      return {
        success: true,
        data: cached.data,
        fromCache: true,
      };
    }

    // Fetch fresh data
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'NO_API_KEY',
      };
    }

    try {
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

      const response = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': BASIC_FIELDS, // More fields but still optimized
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API_ERROR_${response.status}`,
        };
      }

      const data = await response.json();

      // Cache the non-photo data
      await ctx.runMutation(internal.cache.savePlaceDetails, {
        placeId,
        data: {
          displayName: data.displayName,
          formattedAddress: data.formattedAddress,
          nationalPhoneNumber: data.nationalPhoneNumber,
          websiteUri: data.websiteUri,
          regularOpeningHours: data.regularOpeningHours,
          rating: data.rating,
          userRatingCount: data.userRatingCount,
        },
      });

      return {
        success: true,
        data,
        fromCache: false,
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
      };
    }
  },
});

/**
 * Monitor API usage and costs
 * Should be called periodically to track spending
 */
export const monitorApiUsage = internalAction({
  args: {},
  handler: async (ctx) => {
    // This would integrate with Google Cloud Monitoring API
    // to fetch actual usage metrics and costs

    const stats = await ctx.runQuery(internal.stats.getApiUsageInternal, {});

    // Check if we're approaching budget limits
    const MONTHLY_BUDGET = 1000; // $1000 monthly budget
    const WARNING_THRESHOLD = 0.8; // Warn at 80% usage

    if (stats.estimatedMonthlyCost > MONTHLY_BUDGET * WARNING_THRESHOLD) {
      // Send alert (email, Slack, etc.)
      console.warn(`API usage warning: $${stats.estimatedMonthlyCost} of $${MONTHLY_BUDGET} budget used`);
    }

    return {
      currentMonthUsage: stats.estimatedMonthlyCost,
      projectedMonthlyTotal: stats.projectedTotal,
      isOverBudget: stats.estimatedMonthlyCost > MONTHLY_BUDGET,
    };
  },
});
