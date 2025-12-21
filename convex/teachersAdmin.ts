import { v } from 'convex/values';
import { query, mutation, QueryCtx, MutationCtx } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import { getAdminUserId } from './lib/adminAuth';

// Helper to get photo URL
async function withPhotoUrl(ctx: QueryCtx, teacher: Doc<'teachers'>): Promise<Doc<'teachers'> & { photoUrl?: string }> {
  const storageId = teacher.profilePhoto?.value?.storageId;
  if (!storageId) return teacher;

  try {
    const url = await ctx.storage.getUrl(storageId as unknown as Id<'_storage'>);
    return { ...teacher, photoUrl: url || undefined };
  } catch {
    return teacher;
  }
}

// List all teachers for admin spreadsheet view
export const listAll = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cityFilter: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx: QueryCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { teachers: [], total: 0 };

    let allTeachers = await ctx.db.query('teachers').collect();

    // Apply filters
    if (args.cityFilter) {
      allTeachers = allTeachers.filter(t => t.citySlug === args.cityFilter);
    }
    if (args.statusFilter) {
      allTeachers = allTeachers.filter(t => t.status === args.statusFilter);
    }

    // Sort by updated date
    allTeachers.sort((a, b) => b.updatedAt - a.updatedAt);

    const total = allTeachers.length;
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paged = allTeachers.slice(offset, offset + limit);

    // Enrich with photo URLs and gallery counts
    const enriched = await Promise.all(
      paged.map(async (teacher) => {
        const teacherWithUrl = await withPhotoUrl(ctx, teacher);

        // Get gallery photo count
        const galleryPhotos = await ctx.db
          .query('teacherPhotos')
          .withIndex('by_teacher_active', (q) =>
            q.eq('teacherId', teacher._id).eq('isActive', true)
          )
          .collect();

        return {
          ...teacherWithUrl,
          galleryPhotoCount: galleryPhotos.length,
        };
      })
    );

    return { teachers: enriched, total };
  },
});

// Get unique cities for filter dropdown
export const getCities = query({
  args: { token: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];

    const teachers = await ctx.db.query('teachers').collect();
    const cityMap = new Map<string, string>();

    for (const t of teachers) {
      if (!cityMap.has(t.citySlug)) {
        cityMap.set(t.citySlug, t.cityName?.value || t.citySlug);
      }
    }

    return Array.from(cityMap.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Update a teacher field (single field at a time for inline editing)
export const updateField = mutation({
  args: {
    token: v.string(),
    teacherId: v.id('teachers'),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) throw new Error('Unauthorized');

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error('Teacher not found');

    const now = Date.now();
    const confidence = {
      value: 0.95,
      level: 'high',
      source: 'admin_edit',
      observedAt: now,
    };

    const updates: Record<string, any> = { updatedAt: now };

    // Handle different field types
    switch (args.field) {
      case 'fullName':
        updates.fullName = { value: args.value, confidence };
        break;
      case 'bio':
        updates.bio = args.value ? { value: args.value, confidence } : undefined;
        break;
      case 'experienceYears':
        updates.experienceYears = args.value ? { value: Number(args.value), confidence } : undefined;
        break;
      case 'teachingHours':
        updates.teachingHours = args.value ? { value: Number(args.value), confidence } : undefined;
        break;
      case 'specializations':
        updates.specializations = { value: args.value || [], confidence };
        break;
      case 'languages':
        updates.languages = { value: args.value || [], confidence };
        break;
      case 'instagram':
        updates.social = {
          ...teacher.social,
          instagram: args.value ? { value: args.value, confidence } : undefined,
        };
        break;
      case 'whatsapp':
        updates.contact = {
          ...teacher.contact,
          whatsapp: args.value ? { value: args.value, confidence } : undefined,
          isPublic: teacher.contact?.isPublic ?? false,
        };
        break;
      case 'bookingUrl':
        updates.contact = {
          ...teacher.contact,
          bookingUrl: args.value ? { value: args.value, confidence } : undefined,
          isPublic: teacher.contact?.isPublic ?? false,
        };
        break;
      case 'status':
        if (['scraped', 'claimed', 'verified', 'suspended'].includes(args.value)) {
          updates.status = args.value;
          if (args.value === 'verified') {
            updates.isVerified = true;
            updates.verifiedAt = now;
          }
        }
        break;
      case 'isActive':
        updates.isActive = Boolean(args.value);
        break;
      default:
        throw new Error(`Unknown field: ${args.field}`);
    }

    await ctx.db.patch(args.teacherId, updates);
    return { success: true };
  },
});

// Generate upload URL for admin photo uploads
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx: MutationCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) throw new Error('Unauthorized');

    return await ctx.storage.generateUploadUrl();
  },
});

// Save uploaded photo to teacher (profile or gallery)
export const savePhoto = mutation({
  args: {
    token: v.string(),
    teacherId: v.id('teachers'),
    storageId: v.id('_storage'),
    type: v.union(v.literal('profile'), v.literal('gallery')),
    caption: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) throw new Error('Unauthorized');

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error('Teacher not found');

    const now = Date.now();

    if (args.type === 'profile') {
      // Update profile photo
      const url = await ctx.storage.getUrl(args.storageId);
      await ctx.db.patch(args.teacherId, {
        profilePhoto: {
          value: {
            storageId: args.storageId.toString(),
            source: 'upload',
            url: url || undefined,
            updatedAt: now,
          },
          confidence: {
            value: 0.95,
            level: 'high',
            source: 'admin_upload',
            observedAt: now,
          },
        },
        updatedAt: now,
      });
    } else {
      // Add to gallery
      const existing = await ctx.db
        .query('teacherPhotos')
        .withIndex('by_teacher_active', (q) =>
          q.eq('teacherId', args.teacherId).eq('isActive', true)
        )
        .collect();

      const maxOrder = existing.reduce((max, p) => Math.max(max, p.displayOrder), -1);

      await ctx.db.insert('teacherPhotos', {
        teacherId: args.teacherId,
        storageId: args.storageId,
        type: 'gallery',
        caption: args.caption,
        displayOrder: maxOrder + 1,
        isActive: true,
        uploadedAt: now,
        approvedAt: now,
      });
    }

    return { success: true };
  },
});

// Delete a gallery photo
export const deleteGalleryPhoto = mutation({
  args: {
    token: v.string(),
    photoId: v.id('teacherPhotos'),
  },
  handler: async (ctx: MutationCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) throw new Error('Unauthorized');

    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error('Photo not found');

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.photoId, { isActive: false });

    return { success: true };
  },
});

// Get gallery photos for a specific teacher
export const getGalleryPhotos = query({
  args: {
    token: v.string(),
    teacherId: v.id('teachers'),
  },
  handler: async (ctx: QueryCtx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];

    const photos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher_active', (q) =>
        q.eq('teacherId', args.teacherId).eq('isActive', true)
      )
      .collect();

    photos.sort((a, b) => a.displayOrder - b.displayOrder);

    const withUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        return { ...photo, url };
      })
    );

    return withUrls;
  },
});
