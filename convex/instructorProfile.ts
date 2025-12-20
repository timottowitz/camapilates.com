import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

// =============================================
// HELPER: Sync profile photo to teacher record
// =============================================

async function syncProfilePhoto(ctx: any, teacherId: Id<'teachers'>) {
  // Get the first active photo (lowest displayOrder)
  const photos = await ctx.db
    .query('teacherPhotos')
    .withIndex('by_teacher_active', (q: any) =>
      q.eq('teacherId', teacherId).eq('isActive', true)
    )
    .collect();

  photos.sort((a: any, b: any) => a.displayOrder - b.displayOrder);
  const firstPhoto = photos[0];

  if (firstPhoto) {
    const url = await ctx.storage.getUrl(firstPhoto.storageId);
    await ctx.db.patch(teacherId, {
      profilePhoto: {
        value: {
          storageId: firstPhoto.storageId.toString(),
          source: 'upload',
          url: url || undefined,
          updatedAt: Date.now(),
        },
        confidence: {
          value: 0.95,
          level: 'high',
          source: 'user_upload',
          observedAt: Date.now(),
        },
      },
    });
  } else {
    // No photos - clear the profilePhoto
    await ctx.db.patch(teacherId, {
      profilePhoto: undefined,
    });
  }
}

// =============================================
// HELPER: Verify session and get account/teacher
// =============================================

async function verifySession(ctx: any, token: string) {
  if (!token) {
    return { ok: false, error: 'No autenticado' };
  }

  const session = await ctx.db
    .query('instructorSessions')
    .withIndex('by_token', (q: any) => q.eq('token', token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    return { ok: false, error: 'Sesión expirada' };
  }

  const account = await ctx.db.get(session.accountId);
  if (!account || account.status !== 'active') {
    return { ok: false, error: 'Cuenta no activa' };
  }

  const teacher = await ctx.db.get(account.teacherId);
  if (!teacher) {
    return { ok: false, error: 'Perfil no encontrado' };
  }

  return { ok: true, account, teacher };
}

// =============================================
// GET MY PROFILE (for edit page)
// =============================================

export const getMyProfile = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    const { teacher, account } = auth;

    // Get photos
    const photos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher_active', (q) =>
        q.eq('teacherId', teacher._id).eq('isActive', true)
      )
      .collect();

    // Sort by displayOrder
    photos.sort((a, b) => a.displayOrder - b.displayOrder);

    // Get photo URLs
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        return {
          id: photo._id,
          storageId: photo.storageId,
          url,
          type: photo.type,
          caption: photo.caption,
          displayOrder: photo.displayOrder,
        };
      })
    );

    return {
      ok: true,
      profile: {
        // Basic info
        fullName: teacher.fullName?.value || '',
        bio: teacher.bio?.value || '',
        specializations: teacher.specializations?.value || [],
        experienceYears: teacher.experienceYears?.value,
        languages: teacher.languages?.value || ['Español'],

        // Contact
        whatsapp: teacher.contact?.whatsapp?.value || '',
        instagram: teacher.social?.instagram?.value || '',
        website: teacher.social?.website?.value || '',
        bookingUrl: teacher.contact?.bookingUrl?.value || '',

        // Location
        citySlug: teacher.citySlug,
        cityName: teacher.cityName?.value || '',

        // Photos
        photos: photosWithUrls,

        // Account info
        email: account.email,
        tier: account.tier || 'free',
      },
    };
  },
});

// =============================================
// UPDATE PROFILE (text fields)
// =============================================

export const updateProfile = mutation({
  args: {
    token: v.string(),
    bio: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    experienceYears: v.optional(v.number()),
    languages: v.optional(v.array(v.string())),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    website: v.optional(v.string()),
    bookingUrl: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...updates }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    const { teacher } = auth;
    const now = Date.now();
    const confidence = {
      value: 1.0,
      level: 'high' as const,
      source: 'instructor_edit',
      observedAt: now,
    };

    // Build patch object
    const patch: Record<string, any> = {
      updatedAt: now,
    };

    if (updates.bio !== undefined) {
      patch.bio = {
        value: updates.bio,
        confidence,
      };
    }

    if (updates.specializations !== undefined) {
      patch.specializations = {
        value: updates.specializations,
        confidence,
      };
    }

    if (updates.experienceYears !== undefined) {
      patch.experienceYears = {
        value: updates.experienceYears,
        confidence,
      };
    }

    if (updates.languages !== undefined) {
      patch.languages = {
        value: updates.languages,
        confidence,
      };
    }

    // Contact updates
    if (updates.whatsapp !== undefined || updates.bookingUrl !== undefined) {
      const existingContact = teacher.contact || {};
      patch.contact = {
        ...existingContact,
        isPublic: existingContact.isPublic ?? true,
      };

      if (updates.whatsapp !== undefined) {
        patch.contact.whatsapp = {
          value: updates.whatsapp,
          confidence,
        };
      }

      if (updates.bookingUrl !== undefined) {
        patch.contact.bookingUrl = {
          value: updates.bookingUrl,
          confidence,
        };
      }
    }

    // Social updates
    if (updates.instagram !== undefined || updates.website !== undefined) {
      const existingSocial = teacher.social || {};
      patch.social = { ...existingSocial };

      if (updates.instagram !== undefined) {
        patch.social.instagram = {
          value: updates.instagram.replace('@', ''),
          confidence,
        };
      }

      if (updates.website !== undefined) {
        patch.social.website = {
          value: updates.website,
          confidence,
        };
      }
    }

    await ctx.db.patch(teacher._id, patch);

    return { ok: true };
  },
});

// =============================================
// PHOTO MANAGEMENT
// =============================================

export const generatePhotoUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    // Check photo limit (5 max)
    const existingPhotos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher_active', (q) =>
        q.eq('teacherId', auth.teacher._id).eq('isActive', true)
      )
      .collect();

    if (existingPhotos.length >= 5) {
      return { ok: false, error: 'Máximo 5 fotos permitidas' };
    }

    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { ok: true, uploadUrl };
  },
});

export const addPhoto = mutation({
  args: {
    token: v.string(),
    storageId: v.id('_storage'),
    type: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { token, storageId, type, caption }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    const { teacher } = auth;

    // Get current max displayOrder
    const existingPhotos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher_active', (q) =>
        q.eq('teacherId', teacher._id).eq('isActive', true)
      )
      .collect();

    if (existingPhotos.length >= 5) {
      return { ok: false, error: 'Máximo 5 fotos permitidas' };
    }

    const maxOrder = existingPhotos.reduce(
      (max, p) => Math.max(max, p.displayOrder),
      -1
    );

    const photoId = await ctx.db.insert('teacherPhotos', {
      teacherId: teacher._id,
      storageId,
      type: type || 'gallery',
      caption,
      displayOrder: maxOrder + 1,
      isActive: true,
      uploadedAt: Date.now(),
      approvedAt: Date.now(), // Self-uploaded = auto-approved
    });

    const url = await ctx.storage.getUrl(storageId);

    // Sync profile photo (first photo becomes profile photo)
    await syncProfilePhoto(ctx, teacher._id);

    return {
      ok: true,
      photo: {
        id: photoId,
        storageId,
        url,
        type: type || 'gallery',
        caption,
        displayOrder: maxOrder + 1,
      },
    };
  },
});

export const deletePhoto = mutation({
  args: {
    token: v.string(),
    photoId: v.id('teacherPhotos'),
  },
  handler: async (ctx, { token, photoId }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    const photo = await ctx.db.get(photoId);
    if (!photo) {
      return { ok: false, error: 'Foto no encontrada' };
    }

    // Verify ownership
    if (photo.teacherId.toString() !== auth.teacher._id.toString()) {
      return { ok: false, error: 'No autorizado' };
    }

    // Soft delete
    await ctx.db.patch(photoId, { isActive: false });

    // Sync profile photo (next photo becomes profile, or clear if none)
    await syncProfilePhoto(ctx, auth.teacher._id);

    return { ok: true };
  },
});

export const reorderPhotos = mutation({
  args: {
    token: v.string(),
    photoOrder: v.array(v.id('teacherPhotos')),
  },
  handler: async (ctx, { token, photoOrder }) => {
    const auth = await verifySession(ctx, token);
    if (!auth.ok) {
      return { ok: false, error: auth.error };
    }

    // Verify all photos belong to this teacher
    for (let i = 0; i < photoOrder.length; i++) {
      const photo = await ctx.db.get(photoOrder[i]);
      if (!photo || photo.teacherId.toString() !== auth.teacher._id.toString()) {
        return { ok: false, error: 'Foto no autorizada' };
      }
      await ctx.db.patch(photoOrder[i], { displayOrder: i });
    }

    // Sync profile photo (first in new order becomes profile photo)
    await syncProfilePhoto(ctx, auth.teacher._id);

    return { ok: true };
  },
});
