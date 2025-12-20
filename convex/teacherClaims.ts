import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const ALLOWED_PHOTO_TYPES = new Set(['profile', 'action', 'studio', 'certificate']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function assertClaimUploadAllowed(
  ctx: any,
  args: { teacherId: any; email: string }
): Promise<void> {
  const email = args.email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Email inválido.');
  }

  const teacher = await ctx.db.get(args.teacherId);
  if (!teacher || !teacher.isActive) {
    throw new Error('Perfil no encontrado.');
  }
  if (teacher.status === 'claimed' || teacher.status === 'verified') {
    throw new Error('Este perfil ya fue reclamado.');
  }
  if (teacher.status === 'suspended') {
    throw new Error('Este perfil no está disponible para reclamar.');
  }

  const existing = await ctx.db
    .query('teacherClaims')
    .withIndex('by_teacher', (q: any) => q.eq('teacherId', args.teacherId))
    .filter((q: any) => q.neq(q.field('status'), 'rejected'))
    .first();
  if (existing) {
    throw new Error('Ya existe una solicitud pendiente para este perfil.');
  }

  // Soft rate limit (prevents obvious abuse of storage uploads).
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
  const recentByEmail = await ctx.db
    .query('teacherClaims')
    .withIndex('by_email', (q: any) => q.eq('email', email))
    .order('desc')
    .take(10);
  const recentInWindow = recentByEmail.filter((c: any) => c.createdAt > cutoff);
  if (recentInWindow.length >= 3) {
    throw new Error('Demasiadas solicitudes. Intenta más tarde.');
  }

  const recentByTeacher = await ctx.db
    .query('teacherClaims')
    .withIndex('by_teacher', (q: any) => q.eq('teacherId', args.teacherId))
    .order('desc')
    .take(10);
  const teacherWindow = recentByTeacher.filter((c: any) => c.createdAt > cutoff);
  if (teacherWindow.length >= 10) {
    throw new Error('Demasiadas solicitudes para este perfil. Intenta más tarde.');
  }
}

function normalizeStringArray(
  input: string[] | undefined,
  maxItems: number,
  maxLen: number
): string[] | undefined {
  if (!input) return undefined;
  const normalized = input
    .map((s) => s.trim().slice(0, maxLen))
    .filter((s) => s.length > 0);
  const unique = Array.from(new Set(normalized));
  return unique.length ? unique.slice(0, maxItems) : undefined;
}

function normalizeUrl(input: string | undefined, maxLen: number): string | undefined {
  if (!input) return undefined;
  const raw = input.trim().slice(0, maxLen);
  if (!raw) return undefined;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

// Proposed profile schema for reuse
const proposedProfileSchema = v.object({
  bio: v.optional(v.string()),
  specializations: v.optional(v.array(v.string())),
  experienceYears: v.optional(v.number()),
  languages: v.optional(v.array(v.string())),
  teachingStyle: v.optional(v.object({
    vibe: v.optional(v.array(v.string())),
    classPace: v.optional(v.string()),
    musicStyle: v.optional(v.string()),
    classSize: v.optional(v.string()),
  })),
  certifications: v.optional(v.array(v.object({
    name: v.string(),
    organization: v.optional(v.string()),
    year: v.optional(v.number()),
  }))),
  trainingLineage: v.optional(v.string()),
  teachingHours: v.optional(v.number()),
  whatsapp: v.optional(v.string()),
  bookingUrl: v.optional(v.string()),
  instagram: v.optional(v.string()),
  website: v.optional(v.string()),
  neighborhoods: v.optional(v.array(v.string())),
  homeVisits: v.optional(v.boolean()),
});

// Simple claim submission (legacy support)
export const submit = mutation({
  args: {
    teacherId: v.id('teachers'),
    teacherSlug: v.string(),
    teacherName: v.string(),
    citySlug: v.string(),
    
    claimantName: v.string(),
    email: v.string(),
    phone: v.string(),
    relationship: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const claimantName = args.claimantName.trim().slice(0, 120);
    const email = args.email.trim().toLowerCase().slice(0, 254);
    const phone = args.phone.trim().slice(0, 40);
    const relationship = args.relationship.trim().slice(0, 40);
    const message = args.message?.trim().slice(0, 2000);

    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Email inválido.' };
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.isActive) {
      return { success: false, error: 'Perfil no encontrado.' };
    }
    if (teacher.status === 'claimed' || teacher.status === 'verified') {
      return { success: false, error: 'Este perfil ya fue reclamado.' };
    }
    if (teacher.status === 'suspended') {
      return { success: false, error: 'Este perfil no está disponible para reclamar.' };
    }

    // Basic rate limit by email (prevents obvious spam across many profiles).
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
    const recentByEmail = await ctx.db
      .query('teacherClaims')
      .withIndex('by_email', (q) => q.eq('email', email))
      .order('desc')
      .take(10);
    const recentInWindow = recentByEmail.filter((c) => c.createdAt > cutoff);
    if (recentInWindow.length >= 3) {
      return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' };
    }

    const existing = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .filter((q) => q.neq(q.field('status'), 'rejected'))
      .first();

    if (existing) {
      return {
        success: false,
        error: 'Ya existe una solicitud pendiente para este perfil.',
      };
    }

    const claimId = await ctx.db.insert('teacherClaims', {
      teacherId: args.teacherId,
      teacherSlug: teacher.slug,
      teacherName: teacher.fullName.value,
      citySlug: teacher.citySlug,
      claimantName,
      email,
      phone,
      relationship,
      message,
      status: 'pending_review',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, claimId };
  },
});

// Enhanced claim submission with full profile and photos
export const submitWithProfile = mutation({
  args: {
    teacherId: v.id('teachers'),
    teacherSlug: v.string(),
    teacherName: v.string(),
    citySlug: v.string(),
    
    claimantName: v.string(),
    email: v.string(),
    phone: v.string(),
    relationship: v.string(),
    message: v.optional(v.string()),
    
    proposedProfile: v.optional(proposedProfileSchema),
    proposedPhotos: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      type: v.string(),
      caption: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const claimantName = args.claimantName.trim().slice(0, 120);
    const email = args.email.trim().toLowerCase().slice(0, 254);
    const phone = args.phone.trim().slice(0, 40);
    const relationship = args.relationship.trim().slice(0, 40);
    const message = args.message?.trim().slice(0, 2000);

    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Email inválido.' };
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.isActive) {
      return { success: false, error: 'Perfil no encontrado.' };
    }
    if (teacher.status === 'claimed' || teacher.status === 'verified') {
      return { success: false, error: 'Este perfil ya fue reclamado.' };
    }
    if (teacher.status === 'suspended') {
      return { success: false, error: 'Este perfil no está disponible para reclamar.' };
    }

    // Basic rate limit by email (prevents obvious spam across many profiles).
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour
    const recentByEmail = await ctx.db
      .query('teacherClaims')
      .withIndex('by_email', (q) => q.eq('email', email))
      .order('desc')
      .take(10);
    const recentInWindow = recentByEmail.filter((c) => c.createdAt > cutoff);
    if (recentInWindow.length >= 3) {
      return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' };
    }

    if (args.proposedPhotos && args.proposedPhotos.length > 5) {
      return {
        success: false,
        error: 'Puedes subir hasta 5 fotos.',
      };
    }

    if (args.proposedPhotos) {
      for (const photo of args.proposedPhotos) {
        if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
          return {
            success: false,
            error: 'Tipo de foto inválido.',
          };
        }
      }
    }

    const normalizedBookingUrl = normalizeUrl(args.proposedProfile?.bookingUrl, 500);
    if (args.proposedProfile?.bookingUrl && !normalizedBookingUrl) {
      return { success: false, error: 'URL de reserva inválida.' };
    }
    const normalizedWebsite = normalizeUrl(args.proposedProfile?.website, 500);
    if (args.proposedProfile?.website && !normalizedWebsite) {
      return { success: false, error: 'Sitio web inválido.' };
    }

    const proposedProfile = args.proposedProfile
      ? {
          ...args.proposedProfile,
          bio: args.proposedProfile.bio?.trim().slice(0, 5000),
          specializations: normalizeStringArray(args.proposedProfile.specializations, 30, 80),
          experienceYears:
            typeof args.proposedProfile.experienceYears === 'number' &&
            Number.isFinite(args.proposedProfile.experienceYears)
              ? Math.max(0, Math.min(args.proposedProfile.experienceYears, 80))
              : undefined,
          languages: normalizeStringArray(args.proposedProfile.languages, 15, 40),
          teachingStyle: args.proposedProfile.teachingStyle
            ? {
                vibe: normalizeStringArray(args.proposedProfile.teachingStyle.vibe, 10, 40),
                classPace: args.proposedProfile.teachingStyle.classPace?.trim().slice(0, 40),
                musicStyle: args.proposedProfile.teachingStyle.musicStyle?.trim().slice(0, 80),
                classSize: args.proposedProfile.teachingStyle.classSize?.trim().slice(0, 40),
              }
            : undefined,
          certifications: args.proposedProfile.certifications
            ? args.proposedProfile.certifications
                .slice(0, 10)
                .map((c) => ({
                  name: c.name.trim().slice(0, 120),
                  organization: c.organization?.trim().slice(0, 120),
                  year:
                    typeof c.year === 'number' && Number.isFinite(c.year)
                      ? Math.max(1900, Math.min(c.year, new Date().getFullYear()))
                      : undefined,
                }))
                .filter((c) => Boolean(c.name))
            : undefined,
          trainingLineage: args.proposedProfile.trainingLineage?.trim().slice(0, 500),
          teachingHours:
            typeof args.proposedProfile.teachingHours === 'number' &&
            Number.isFinite(args.proposedProfile.teachingHours)
              ? Math.max(0, Math.min(args.proposedProfile.teachingHours, 100000))
              : undefined,
          whatsapp: args.proposedProfile.whatsapp?.trim().slice(0, 40),
          bookingUrl: normalizedBookingUrl,
          instagram: args.proposedProfile.instagram?.trim().slice(0, 100),
          website: normalizedWebsite,
          neighborhoods: normalizeStringArray(args.proposedProfile.neighborhoods, 20, 80),
          homeVisits:
            typeof args.proposedProfile.homeVisits === 'boolean'
              ? args.proposedProfile.homeVisits
              : undefined,
        }
      : undefined;

    const existing = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .filter((q) => q.neq(q.field('status'), 'rejected'))
      .first();

    if (existing) {
      return {
        success: false,
        error: 'Ya existe una solicitud pendiente para este perfil.',
      };
    }

    const now = Date.now();
    const photosWithTimestamp = args.proposedPhotos?.map((photo) => ({
      storageId: photo.storageId,
      type: photo.type,
      caption: photo.caption?.trim().slice(0, 200),
      uploadedAt: now,
    }));

    const claimId = await ctx.db.insert('teacherClaims', {
      teacherId: args.teacherId,
      teacherSlug: teacher.slug,
      teacherName: teacher.fullName.value,
      citySlug: teacher.citySlug,
      claimantName,
      email,
      phone,
      relationship,
      message,
      proposedProfile,
      proposedPhotos: photosWithTimestamp,
      status: 'pending_review',
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, claimId };
  },
});

// Generate upload URL for a single photo
export const generatePhotoUploadUrl = mutation({
  args: { teacherId: v.id('teachers'), email: v.string() },
  handler: async (ctx, args) => {
    await assertClaimUploadAllowed(ctx, args);

    return await ctx.storage.generateUploadUrl();
  },
});

// Generate multiple upload URLs (max 5)
export const generatePhotoUploadUrls = mutation({
  args: { teacherId: v.id('teachers'), email: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    await assertClaimUploadAllowed(ctx, args);
    const count = Math.max(0, Math.min(args.count, 5));
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      urls.push(await ctx.storage.generateUploadUrl());
    }
    return urls;
  },
});

export const getStatus = query({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx, args) => {
    const claim = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .order('desc')
      .first();

    if (!claim) return null;

    // Public-safe status only (avoid exposing claimant PII).
    return {
      claimId: claim._id,
      status: claim.status,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      reviewedAt: claim.reviewedAt,
    };
  },
});

// ============================================================
// DRAFT / CHECKPOINT SYSTEM
// ============================================================

// Get existing draft for a teacher+email combination
export const getDraft = query({
  args: {
    teacherId: v.id('teachers'),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase().slice(0, 254);
    if (!EMAIL_REGEX.test(email)) return null;

    const draft = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher_email', (q) =>
        q.eq('teacherId', args.teacherId).eq('email', email)
      )
      .filter((q) => q.eq(q.field('status'), 'draft'))
      .first();

    if (!draft) return null;

    // Return full draft data for form restoration
    return {
      claimId: draft._id,
      // Step 1: Identity
      claimantName: draft.claimantName,
      email: draft.email,
      phone: draft.phone,
      relationship: draft.relationship,
      message: draft.message,
      // Step 2-3: Profile & Contact
      proposedProfile: draft.proposedProfile,
      // Step 4: Photos
      proposedPhotos: draft.proposedPhotos,
      // Checkpoint tracking
      completedSteps: draft.completedSteps ?? [],
      lastSavedStep: draft.lastSavedStep ?? 1,
      updatedAt: draft.updatedAt,
    };
  },
});

// Save draft checkpoint - creates or updates draft at each step
export const saveDraft = mutation({
  args: {
    teacherId: v.id('teachers'),
    teacherSlug: v.string(),
    teacherName: v.string(),
    citySlug: v.string(),
    currentStep: v.number(),

    // Step 1: Identity (required for draft creation)
    claimantName: v.string(),
    email: v.string(),
    phone: v.string(),
    relationship: v.string(),
    message: v.optional(v.string()),

    // Step 2-3: Profile & Contact
    proposedProfile: v.optional(proposedProfileSchema),

    // Step 4: Photos
    proposedPhotos: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      type: v.string(),
      caption: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const claimantName = args.claimantName.trim().slice(0, 120);
    const email = args.email.trim().toLowerCase().slice(0, 254);
    const phone = args.phone.trim().slice(0, 40);
    const relationship = args.relationship.trim().slice(0, 40);
    const message = args.message?.trim().slice(0, 2000);

    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Email inválido.' };
    }

    // Check teacher exists and is claimable
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.isActive) {
      return { success: false, error: 'Perfil no encontrado.' };
    }
    if (teacher.status === 'claimed' || teacher.status === 'verified') {
      return { success: false, error: 'Este perfil ya fue reclamado.' };
    }

    // Check for existing non-draft claim
    const existingClaim = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher', (q) => q.eq('teacherId', args.teacherId))
      .filter((q) =>
        q.and(
          q.neq(q.field('status'), 'rejected'),
          q.neq(q.field('status'), 'draft')
        )
      )
      .first();

    if (existingClaim) {
      return { success: false, error: 'Ya existe una solicitud pendiente para este perfil.' };
    }

    // Normalize profile data
    const normalizedBookingUrl = normalizeUrl(args.proposedProfile?.bookingUrl, 500);
    const normalizedWebsite = normalizeUrl(args.proposedProfile?.website, 500);

    const proposedProfile = args.proposedProfile
      ? {
          bio: args.proposedProfile.bio?.trim().slice(0, 5000),
          specializations: normalizeStringArray(args.proposedProfile.specializations, 30, 80),
          experienceYears:
            typeof args.proposedProfile.experienceYears === 'number' &&
            Number.isFinite(args.proposedProfile.experienceYears)
              ? Math.max(0, Math.min(args.proposedProfile.experienceYears, 80))
              : undefined,
          languages: normalizeStringArray(args.proposedProfile.languages, 15, 40),
          teachingStyle: args.proposedProfile.teachingStyle
            ? {
                vibe: normalizeStringArray(args.proposedProfile.teachingStyle.vibe, 10, 40),
                classPace: args.proposedProfile.teachingStyle.classPace?.trim().slice(0, 40),
                musicStyle: args.proposedProfile.teachingStyle.musicStyle?.trim().slice(0, 80),
                classSize: args.proposedProfile.teachingStyle.classSize?.trim().slice(0, 40),
              }
            : undefined,
          trainingLineage: args.proposedProfile.trainingLineage?.trim().slice(0, 500),
          teachingHours:
            typeof args.proposedProfile.teachingHours === 'number' &&
            Number.isFinite(args.proposedProfile.teachingHours)
              ? Math.max(0, Math.min(args.proposedProfile.teachingHours, 100000))
              : undefined,
          whatsapp: args.proposedProfile.whatsapp?.trim().slice(0, 40),
          bookingUrl: normalizedBookingUrl,
          instagram: args.proposedProfile.instagram?.trim().slice(0, 100),
          website: normalizedWebsite,
        }
      : undefined;

    const now = Date.now();
    const photosWithTimestamp = args.proposedPhotos?.map((photo) => ({
      storageId: photo.storageId,
      type: photo.type,
      caption: photo.caption?.trim().slice(0, 200),
      uploadedAt: now,
    }));

    // Find existing draft for this teacher+email
    const existingDraft = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher_email', (q) =>
        q.eq('teacherId', args.teacherId).eq('email', email)
      )
      .filter((q) => q.eq(q.field('status'), 'draft'))
      .first();

    // Calculate completed steps
    const completedSteps = existingDraft?.completedSteps ?? [];
    if (!completedSteps.includes(args.currentStep)) {
      completedSteps.push(args.currentStep);
      completedSteps.sort((a, b) => a - b);
    }

    if (existingDraft) {
      // Update existing draft
      await ctx.db.patch(existingDraft._id, {
        claimantName,
        phone,
        relationship,
        message,
        proposedProfile,
        proposedPhotos: photosWithTimestamp,
        completedSteps,
        lastSavedStep: args.currentStep,
        updatedAt: now,
      });

      return { success: true, claimId: existingDraft._id, isNew: false };
    } else {
      // Create new draft
      const claimId = await ctx.db.insert('teacherClaims', {
        teacherId: args.teacherId,
        teacherSlug: teacher.slug,
        teacherName: teacher.fullName.value,
        citySlug: teacher.citySlug,
        claimantName,
        email,
        phone,
        relationship,
        message,
        proposedProfile,
        proposedPhotos: photosWithTimestamp,
        status: 'draft',
        completedSteps,
        lastSavedStep: args.currentStep,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true, claimId, isNew: true };
    }
  },
});

// List recent claims with photos (for debugging/admin)
export const listRecentWithPhotos = query({
  args: {},
  handler: async (ctx) => {
    const claims = await ctx.db.query('teacherClaims').order('desc').take(20);

    const results = [];
    for (const c of claims) {
      const photos = c.proposedPhotos;
      if (photos && photos.length > 0) {
        results.push({
          _id: c._id,
          teacherId: c.teacherId,
          teacherName: c.teacherName,
          claimantName: c.claimantName,
          status: c.status,
          photoCount: photos.length,
        });
      }
    }
    return results;
  },
});

// Sync photos from a claim to teacherPhotos table
export const syncPhotos = mutation({
  args: {
    claimId: v.id('teacherClaims'),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }

    const proposedPhotos = claim.proposedPhotos || [];
    if (proposedPhotos.length === 0) {
      return { success: false, error: 'No photos in claim' };
    }

    // Check existing photos
    const existingPhotos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher', (q) => q.eq('teacherId', claim.teacherId))
      .collect();

    const existingStorageIds = new Set(existingPhotos.map((p) => p.storageId));
    const photosToSync = proposedPhotos.filter(
      (p) => !existingStorageIds.has(p.storageId)
    );

    if (photosToSync.length === 0) {
      return { success: true, message: 'Already synced', syncedCount: 0 };
    }

    // Validate and insert
    const now = Date.now();
    let displayOrder = existingPhotos.length;
    let syncedCount = 0;

    for (const photo of photosToSync) {
      const url = await ctx.storage.getUrl(photo.storageId);
      if (url) {
        await ctx.db.insert('teacherPhotos', {
          teacherId: claim.teacherId,
          storageId: photo.storageId,
          type: photo.type,
          caption: photo.caption,
          displayOrder: displayOrder++,
          isActive: true,
          uploadedAt: photo.uploadedAt,
          approvedAt: now,
        });
        syncedCount++;
      }
    }

    return {
      success: true,
      message: `Synced ${syncedCount} photos for ${claim.teacherName}`,
      syncedCount,
    };
  },
});

// Submit draft - converts draft to pending_review
export const submitDraft = mutation({
  args: {
    claimId: v.id('teacherClaims'),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.claimId);
    if (!draft) {
      return { success: false, error: 'Borrador no encontrado.' };
    }
    if (draft.status !== 'draft') {
      return { success: false, error: 'Esta solicitud ya fue enviada.' };
    }

    // Validate required fields
    if (!draft.claimantName || !draft.email || !draft.phone) {
      return { success: false, error: 'Faltan campos requeridos. Por favor completa el paso 1.' };
    }

    // Check teacher is still claimable
    const teacher = await ctx.db.get(draft.teacherId);
    if (!teacher || !teacher.isActive) {
      return { success: false, error: 'Perfil no encontrado.' };
    }
    if (teacher.status === 'claimed' || teacher.status === 'verified') {
      return { success: false, error: 'Este perfil ya fue reclamado.' };
    }

    // Check no other pending claim exists
    const existingClaim = await ctx.db
      .query('teacherClaims')
      .withIndex('by_teacher', (q) => q.eq('teacherId', draft.teacherId))
      .filter((q) =>
        q.and(
          q.neq(q.field('_id'), args.claimId),
          q.neq(q.field('status'), 'rejected'),
          q.neq(q.field('status'), 'draft')
        )
      )
      .first();

    if (existingClaim) {
      return { success: false, error: 'Ya existe una solicitud pendiente para este perfil.' };
    }

    // Convert draft to pending_review
    await ctx.db.patch(args.claimId, {
      status: 'pending_review',
      completedSteps: [1, 2, 3, 4], // Mark all steps complete on submit
      lastSavedStep: 4,
      updatedAt: Date.now(),
    });

    return { success: true, claimId: args.claimId };
  },
});
