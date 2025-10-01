import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Generate upload URL for image
 * Call this first to get a URL, then POST the file to that URL
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Upload a new site image
 * After uploading file to URL from generateUploadUrl, call this with the storageId
 */
export const upload = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    storageId: v.id('_storage'),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if image with this name already exists
    const existing = await ctx.db
      .query('site_images')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing image
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        mimeType: args.mimeType,
        size: args.size,
        width: args.width,
        height: args.height,
        alt: args.alt,
        description: args.description,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new image
    const imageId = await ctx.db.insert('site_images', {
      name: args.name,
      category: args.category,
      storageId: args.storageId,
      mimeType: args.mimeType,
      size: args.size,
      width: args.width,
      height: args.height,
      alt: args.alt,
      description: args.description,
      isActive: true,
      cacheControl: 'public, max-age=31536000, immutable',
      createdAt: now,
      updatedAt: now,
    });

    return imageId;
  },
});

/**
 * Delete a site image
 */
export const deleteImage = mutation({
  args: { id: v.id('site_images') },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) throw new Error('Image not found');

    // Delete from storage
    await ctx.storage.delete(image.storageId);

    // Delete from database
    await ctx.db.delete(args.id);
  },
});

/**
 * Get image by name
 */
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const image = await ctx.db
      .query('site_images')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (!image) return null;

    const url = await ctx.storage.getUrl(image.storageId);

    return {
      ...image,
      url,
    };
  },
});

/**
 * Get all active images
 */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query('site_images')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );

    return imagesWithUrls;
  },
});

/**
 * Get images by category
 */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query('site_images')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );

    return imagesWithUrls;
  },
});

/**
 * Toggle image active status
 */
export const toggleActive = mutation({
  args: { id: v.id('site_images') },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) throw new Error('Image not found');

    await ctx.db.patch(args.id, {
      isActive: !image.isActive,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update image metadata
 */
export const updateMetadata = mutation({
  args: {
    id: v.id('site_images'),
    alt: v.optional(v.string()),
    description: v.optional(v.string()),
    cacheControl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
