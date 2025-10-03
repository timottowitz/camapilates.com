import { v } from 'convex/values';
import { mutation, query, internalQuery, internalMutation } from './_generated/server';
import { internal } from './_generated/api';

/**
 * Register or update an image placeholder
 */
export const register = mutation({
  args: {
    placeholderId: v.string(),
    pageType: v.string(),
    pageSlug: v.optional(v.string()),
    location: v.string(),

    // Context
    contextBefore: v.optional(v.string()),
    contextAfter: v.optional(v.string()),
    headingAbove: v.optional(v.string()),
    altText: v.optional(v.string()),
    figCaption: v.optional(v.string()),

    // Preferences
    preferredAspectRatio: v.string(),
    preferredStyle: v.optional(v.string()),
    requiredSubjects: v.optional(v.array(v.string())),

    // Priority override
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Derive default priority from location if not provided
    const defaultPriority = (() => {
      const loc = (args.location || '').toLowerCase();
      if (loc.includes('hero')) return 100;
      if (loc.startsWith('section-')) return 80;
      if (loc.startsWith('inline-')) return 50;
      return 60;
    })();

    // Truncate long context fields for storage sanity
    const truncate = (s?: string, max = 1000) => (s ? s.slice(0, max) : undefined);

    const existing = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pageType: args.pageType,
        pageSlug: args.pageSlug,
        location: args.location,
        contextBefore: truncate(args.contextBefore),
        contextAfter: truncate(args.contextAfter),
        headingAbove: truncate(args.headingAbove, 200),
        altText: truncate(args.altText, 300),
        figCaption: truncate(args.figCaption, 300),
        preferredAspectRatio: args.preferredAspectRatio,
        preferredStyle: args.preferredStyle,
        requiredSubjects: args.requiredSubjects,
        priority: args.priority ?? existing.priority ?? defaultPriority,
        updatedAt: now,
        generationError: undefined,
        // Keep existing status/assignment fields
      });
      // Auto-trigger: if still pending or only prompt exists, schedule prompt/gen pipeline
      try {
        const status = (existing as any).status;
        const hasPrompt = Boolean((existing as any).generatedPrompt);
        if (status === 'pending' || (status === 'prompt_generated' && hasPrompt)) {
          await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generatePrompt, {
            placeholderId: args.placeholderId,
          });
        }
      } catch {}
      return existing._id;
    }

    const id = await ctx.db.insert('image_placeholders', {
      placeholderId: args.placeholderId,
      pageType: args.pageType,
      pageSlug: args.pageSlug,
      location: args.location,
      contextBefore: truncate(args.contextBefore),
      contextAfter: truncate(args.contextAfter),
      headingAbove: truncate(args.headingAbove, 200),
      altText: truncate(args.altText, 300),
      figCaption: truncate(args.figCaption, 300),
      generatedPrompt: undefined,
      promptGeneratedAt: undefined,
      assignedImageId: undefined,
      assignedAt: undefined,
      preferredAspectRatio: args.preferredAspectRatio,
      preferredStyle: args.preferredStyle,
      requiredSubjects: args.requiredSubjects,
      status: 'pending',
      priority: args.priority ?? defaultPriority,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      generationError: undefined,
    });
    // Auto-trigger: schedule prompt generation (which will schedule image generation)
    try {
      await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generatePrompt, {
        placeholderId: args.placeholderId,
      });
    } catch {}

    return id;
  },
});

/**
 * Get a placeholder by id, with a resolved image URL if assigned
 */
export const getById = query({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    if (!row) return null;

    let imageUrl: string | undefined;
    if (row.assignedImageId) {
      const img = await ctx.db.get(row.assignedImageId);
      if (img) {
        const sid = img.generatedStorageId ?? img.storageId;
        imageUrl = await ctx.storage.getUrl(sid);
      }
    }

    return { ...row, imageUrl };
  },
});

/**
 * List placeholders by status (optional)
 */
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = ctx.db.query('image_placeholders');
    const rows = args.status
      ? await q.withIndex('by_status', ix => ix.eq('status', args.status!)).collect()
      : await q.collect();
    return rows;
  },
});

/**
 * List placeholders by page type & slug
 */
export const listByPage = query({
  args: { pageType: v.string(), pageSlug: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('image_placeholders')
      .withIndex('by_page_type_slug', q => q.eq('pageType', args.pageType).eq('pageSlug', args.pageSlug))
      .collect();
    return rows;
  },
});

/**
 * List placeholders with preview URL (if assigned)
 */
export const listWithPreview = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = ctx.db.query('image_placeholders');
    const rows = args.status
      ? await q.withIndex('by_status', ix => ix.eq('status', args.status!)).collect()
      : await q.collect();

    const out = await Promise.all(rows.map(async (row) => {
      let previewUrl: string | undefined;
      if (row.assignedImageId) {
        const img = await ctx.db.get(row.assignedImageId);
        if (img) {
          const sid = img.generatedStorageId || img.storageId;
          try { previewUrl = await ctx.storage.getUrl(sid); } catch {}
        }
      }
      return { ...row, previewUrl };
    }));
    return out;
  }
});

/**
 * Update the generated prompt for a placeholder
 */
export const updatePrompt = mutation({
  args: {
    placeholderId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    if (!row) throw new Error('Placeholder not found');
    await ctx.db.patch(row._id, {
      generatedPrompt: args.prompt,
      promptGeneratedAt: Date.now(),
      status: 'prompt_generated',
      updatedAt: Date.now(),
    });
  },
});

/**
 * Assign an AI image to a placeholder
 */
export const assignImage = mutation({
  args: {
    placeholderId: v.string(),
    imageId: v.id('ai_images'),
    activate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    if (!row) throw new Error('Placeholder not found');
    await ctx.db.patch(row._id, {
      assignedImageId: args.imageId,
      assignedAt: Date.now(),
      status: args.activate ? 'active' : 'image_assigned',
      updatedAt: Date.now(),
      generationError: undefined,
    });
  },
});

/** Assign latest generated/original image for a placeholder */
export const assignLatest = mutation({
  args: {
    placeholderId: v.string(),
    activate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    if (!row) throw new Error('Placeholder not found');

    const fileName = `${args.placeholderId}.png`;
    const items = await ctx.db
      .query('ai_images')
      .withIndex('by_file', q => q.eq('fileName', fileName))
      .collect();
    if (!items.length) throw new Error('No images found for placeholder');
    items.sort((a, b) => (b.generatedAt || b.uploadedAt || 0) - (a.generatedAt || a.uploadedAt || 0));
    const latest = items[0];

    await ctx.db.patch(row._id, {
      assignedImageId: latest._id,
      assignedAt: Date.now(),
      status: args.activate ? 'active' : 'image_assigned',
      updatedAt: Date.now(),
      generationError: undefined,
    });
  }
});

export const markStatus = internalMutation({
  args: {
    placeholderId: v.string(),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    if (!row) return;
    await ctx.db.patch(row._id, {
      status: args.status,
      generationError: args.error,
      updatedAt: Date.now(),
    });
  },
});

/**
 * INTERNAL: Get placeholder by ID (for use in actions)
 */
export const getByIdInternal = internalQuery({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('image_placeholders')
      .withIndex('by_placeholder_id', q => q.eq('placeholderId', args.placeholderId))
      .first();
    return row || null;
  },
});
