import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Generate upload URL for AI image
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Upload AI-analyzed image with vision description
 */
export const upload = mutation({
  args: {
    fileName: v.string(),
    storageId: v.id('_storage'),
    mimeType: v.string(),
    size: v.number(),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
    aiDescription: v.object({
      scene: v.string(),
      subjects: v.array(v.string()),
      activity: v.optional(v.string()),
      mood: v.string(),
      colors: v.array(v.string()),
      composition: v.string(),
      lighting: v.optional(v.string()),
      setting: v.optional(v.string()),
      useCases: v.array(v.string()),
      tags: v.array(v.string()),
      quality: v.optional(v.string()),
    }),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const imageId = await ctx.db.insert('ai_images', {
      fileName: args.fileName,
      storageId: args.storageId,
      mimeType: args.mimeType,
      size: args.size,
      dimensions: args.dimensions,
      aiDescription: args.aiDescription,
      category: args.category,
      isActive: true,
      uploadedAt: now,
      analyzedAt: now,
    });

    return imageId;
  },
});

/**
 * Get AI image by storage ID
 */
export const getByStorageId = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const image = await ctx.db
      .query('ai_images')
      .filter((q) => q.eq(q.field('storageId'), args.storageId))
      .first();

    if (!image) return null;

    const url = await ctx.storage.getUrl(image.storageId);
    return { ...image, url };
  },
});

/**
 * Search images by description/tags
 */
export const searchByDescription = query({
  args: {
    query: v.string(), // Natural language query
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchTerms = args.query.toLowerCase().split(' ');

    const allImages = await ctx.db
      .query('ai_images')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Score images based on query relevance
    const scored = allImages.map((img) => {
      let score = 0;
      const descStr = JSON.stringify(img.aiDescription).toLowerCase();

      searchTerms.forEach((term) => {
        if (descStr.includes(term)) score += 1;
        if (img.aiDescription.scene.toLowerCase().includes(term)) score += 2;
        if (img.aiDescription.subjects.some((s) => s.toLowerCase().includes(term))) score += 2;
        if (img.aiDescription.tags.some((t) => t.toLowerCase().includes(term))) score += 1;
      });

      return { ...img, score };
    });

    // Sort by score and return top results
    const topResults = scored
      .filter((img) => img.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Add URLs
    const withUrls = await Promise.all(
      topResults.map(async (img) => {
        const url = await ctx.storage.getUrl(img.storageId);
        return { ...img, url };
      })
    );

    return withUrls;
  },
});

/**
 * Get images by use case
 */
export const getByUseCase = query({
  args: {
    useCase: v.string(), // e.g., "hero", "feature", "blog"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const images = await ctx.db
      .query('ai_images')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const matching = images
      .filter((img) =>
        img.aiDescription.useCases.includes(args.useCase.toLowerCase())
      )
      .slice(0, limit);

    const withUrls = await Promise.all(
      matching.map(async (img) => {
        const url = await ctx.storage.getUrl(img.storageId);
        return { ...img, url };
      })
    );

    return withUrls;
  },
});

/**
 * Get all AI images with URLs
 */
export const listAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const images = await ctx.db
      .query('ai_images')
      .filter((q) => q.eq(q.field('isActive'), true))
      .order('desc')
      .take(limit);

    const withUrls = await Promise.all(
      images.map(async (img) => {
        const url = await ctx.storage.getUrl(img.storageId);
        return { ...img, url };
      })
    );

    return withUrls;
  },
});

/**
 * Get images by mood/atmosphere
 */
export const getByMood = query({
  args: {
    mood: v.string(), // e.g., "professional", "welcoming", "energetic"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const images = await ctx.db
      .query('ai_images')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const matching = images
      .filter((img) =>
        img.aiDescription.mood.toLowerCase().includes(args.mood.toLowerCase())
      )
      .slice(0, limit);

    const withUrls = await Promise.all(
      matching.map(async (img) => {
        const url = await ctx.storage.getUrl(img.storageId);
        return { ...img, url };
      })
    );

    return withUrls;
  },
});
