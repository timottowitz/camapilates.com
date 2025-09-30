import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

/**
 * Fetch fresh Google Places photo URL for a studio
 * Photo references expire, so we need to fetch them on-demand
 */
export const getStudioPhotoUrl = action({
  args: {
    placeId: v.string(),
    maxWidth: v.optional(v.number()),
    maxHeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { placeId, maxWidth = 800, maxHeight = 600 } = args;

    // Use environment variable for API key (server-side only)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('No Google Maps API key found');
      return null;
    }

    try {
      // First, fetch place details to get current photo references
      const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

      const detailsResponse = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,photos',
        },
      });

      if (!detailsResponse.ok) {
        console.error('Failed to fetch place details:', detailsResponse.status);
        return null;
      }

      const placeData = await detailsResponse.json();

      if (!placeData.photos || placeData.photos.length === 0) {
        return null;
      }

      // Get the first photo reference
      const photoName = placeData.photos[0].name;

      // Construct the photo URL
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${apiKey}`;

      return photoUrl;
    } catch (error) {
      console.error('Error fetching photo URL:', error);
      return null;
    }
  },
});

/**
 * Batch fetch photo URLs for multiple studios
 */
export const getStudioPhotoUrls = action({
  args: {
    placeIds: v.array(v.string()),
    maxWidth: v.optional(v.number()),
    maxHeight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { placeIds, maxWidth = 400, maxHeight = 300 } = args;

    const results: Record<string, string | null> = {};

    // Fetch URLs in parallel but limit concurrency
    const batchSize = 5;
    for (let i = 0; i < placeIds.length; i += batchSize) {
      const batch = placeIds.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (placeId) => {
          const url = await ctx.runAction(api.places.getStudioPhotoUrl, {
            placeId,
            maxWidth,
            maxHeight,
          });
          return { placeId, url };
        })
      );

      batchResults.forEach(({ placeId, url }) => {
        results[placeId] = url;
      });
    }

    return results;
  },
});