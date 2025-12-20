import { v } from 'convex/values';
import { mutation, query, internalQuery } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import { getAdminUserId } from './lib/adminAuth';
import { internal, api } from './_generated/api';

// Internal query to get claim by ID (for admin tooling)
export const getClaimByIdInternal = internalQuery({
  args: { claimId: v.id('teacherClaims') },
  handler: async (ctx, { claimId }) => {
    return await ctx.db.get(claimId);
  },
});

const APPROVABLE_FIELDS = [
  'bio',
  'specializations',
  'experienceYears',
  'languages',
  'whatsapp',
  'bookingUrl',
  'instagram',
  'website',
] as const;

type ApprovableField = (typeof APPROVABLE_FIELDS)[number];

function normalizeApprovedFields(fields: string[]): ApprovableField[] {
  const allowed = new Set<ApprovableField>(APPROVABLE_FIELDS);
  const out: ApprovableField[] = [];
  for (const f of fields) {
    if (allowed.has(f as ApprovableField)) out.push(f as ApprovableField);
  }
  return Array.from(new Set(out));
}

function normalizePhotoIndices(indices: number[], max: number): number[] {
  return Array.from(new Set(indices))
    .filter((i) => Number.isInteger(i) && i >= 0 && i < max)
    .sort((a, b) => a - b);
}

async function approveClaimInternal(
  ctx: any,
  args: {
    token: string;
    claimId: Id<'teacherClaims'>;
    approvedFields: string[];
    approvedPhotoIndices: number[];
    adminNotes?: string;
  }
) {
  const adminId = await getAdminUserId(ctx as any, args.token);
  if (!adminId) {
    return { success: false as const, error: 'Not authenticated' };
  }

  const claim = await (ctx as any).db.get(args.claimId);
  if (!claim) {
    return { success: false as const, error: 'Claim not found' };
  }

  if (claim.status !== 'pending_review') {
    return { success: false as const, error: 'Claim already reviewed' };
  }

  const teacher = await (ctx as any).db.get(claim.teacherId);
  if (!teacher) {
    return { success: false as const, error: 'Teacher not found' };
  }

  const now = Date.now();
  const approvedFields = normalizeApprovedFields(args.approvedFields);
  const proposedProfile = claim.proposedProfile;

  const teacherUpdates: Partial<Doc<'teachers'>> = {
    updatedAt: now,
    status: 'verified',
    isVerified: true,
    verifiedAt: now,
    claimedAt: teacher.claimedAt ?? now,
  };

  if (proposedProfile && approvedFields.length > 0) {
    const confidence = {
      value: 0.95,
      level: 'high' as const,
      source: 'user_claim',
      observedAt: now,
    };

    if (approvedFields.includes('bio') && proposedProfile.bio) {
      teacherUpdates.bio = { value: proposedProfile.bio, confidence };
    }

    if (approvedFields.includes('specializations') && proposedProfile.specializations?.length) {
      teacherUpdates.specializations = { value: proposedProfile.specializations, confidence };
    }

    if (
      approvedFields.includes('experienceYears') &&
      typeof proposedProfile.experienceYears === 'number'
    ) {
      teacherUpdates.experienceYears = { value: proposedProfile.experienceYears, confidence };
    }

    if (approvedFields.includes('languages') && proposedProfile.languages?.length) {
      teacherUpdates.languages = { value: proposedProfile.languages, confidence };
    }

    // Contact (only WhatsApp + booking)
    const contactUpdatesEnabled =
      approvedFields.includes('whatsapp') || approvedFields.includes('bookingUrl');
    if (contactUpdatesEnabled) {
      const existingContact = teacher.contact ?? { isPublic: false };
      const nextContact: typeof existingContact = { ...existingContact, isPublic: true };
      let changed = false;

      if (approvedFields.includes('whatsapp') && proposedProfile.whatsapp) {
        (nextContact as any).whatsapp = { value: proposedProfile.whatsapp, confidence };
        changed = true;
      }
      if (approvedFields.includes('bookingUrl') && proposedProfile.bookingUrl) {
        (nextContact as any).bookingUrl = { value: proposedProfile.bookingUrl, confidence };
        changed = true;
      }

      if (changed) teacherUpdates.contact = nextContact as any;
    }

    // Social (Instagram + website)
    const socialUpdatesEnabled =
      approvedFields.includes('instagram') || approvedFields.includes('website');
    if (socialUpdatesEnabled) {
      const existingSocial = teacher.social ?? {};
      const nextSocial: typeof existingSocial = { ...existingSocial };
      let changed = false;

      if (approvedFields.includes('instagram') && proposedProfile.instagram) {
        (nextSocial as any).instagram = { value: proposedProfile.instagram, confidence };
        changed = true;
      }
      if (approvedFields.includes('website') && proposedProfile.website) {
        (nextSocial as any).website = { value: proposedProfile.website, confidence };
        changed = true;
      }

      if (changed) teacherUpdates.social = nextSocial as any;
    }
  }

  // Approved photos
  const proposedPhotos = claim.proposedPhotos ?? [];
  const approvedPhotoIndices = normalizePhotoIndices(args.approvedPhotoIndices, proposedPhotos.length);
  const approvedPhotosRequested = approvedPhotoIndices
    .map((i) => proposedPhotos[i])
    .filter(Boolean);

  // Filter to photos that still exist in storage (prevents broken gallery entries).
  const approvedPhotos: typeof approvedPhotosRequested = [];
  for (const photo of approvedPhotosRequested) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const url = await (ctx as any).storage.getUrl(photo.storageId);
      if (url) approvedPhotos.push(photo);
    } catch {
      // Ignore storage lookup errors; this photo will be skipped.
    }
  }

  const profilePhotoCandidate = approvedPhotos.find((p) => p.type === 'profile');
  if (profilePhotoCandidate) {
    teacherUpdates.profilePhoto = {
      value: {
        storageId: String(profilePhotoCandidate.storageId),
        source: 'upload',
        updatedAt: now,
      },
      confidence: {
        value: 0.95,
        level: 'high',
        source: 'user_claim',
        observedAt: now,
      },
    };
  }

  await (ctx as any).db.patch(claim.teacherId, teacherUpdates);

  if (approvedPhotos.length > 0) {
    const existingPhotos = await (ctx as any).db
      .query('teacherPhotos')
      .withIndex('by_teacher', (q: any) => q.eq('teacherId', claim.teacherId))
      .collect();

    let displayOrder = existingPhotos.length;

    for (const photo of approvedPhotos) {
      await (ctx as any).db.insert('teacherPhotos', {
        teacherId: claim.teacherId,
        storageId: photo.storageId,
        type: photo.type,
        caption: photo.caption,
        displayOrder: displayOrder++,
        isActive: true,
        uploadedAt: photo.uploadedAt,
        approvedAt: now,
      });
    }
  }

  // Best-effort cleanup: delete unapproved photos from storage to avoid orphaned uploads.
  const unapprovedPhotos = proposedPhotos.filter((_, index) => !approvedPhotoIndices.includes(index));
  if (unapprovedPhotos.length > 0) {
    for (const photo of unapprovedPhotos) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await (ctx as any).storage.delete(photo.storageId);
      } catch {
        // Ignore storage deletion failures; approval should still succeed.
      }
    }
  }

  await (ctx as any).db.patch(args.claimId, {
    status: 'approved',
    adminNotes: args.adminNotes,
    reviewedBy: adminId,
    reviewedAt: now,
    updatedAt: now,
    // Keep only approved photos for long-term storage sanity.
    proposedPhotos: approvedPhotos,
  });

  // Create instructor account for the claimant
  let accountCreated = false;
  let setupToken: string | undefined;

  try {
    const accountResult = await (ctx as any).runMutation(
      internal.instructorAuth.createAccount,
      {
        email: claim.email,
        teacherId: claim.teacherId,
        teacherName: teacher.fullName?.value || claim.teacherName,
      }
    );

    if (accountResult.ok && accountResult.setupToken) {
      accountCreated = true;
      setupToken = accountResult.setupToken;
    }
  } catch (error) {
    // Account creation failure shouldn't block claim approval
    console.error('Failed to create instructor account:', error);
  }

  return {
    success: true as const,
    accountCreated,
    setupToken,
    email: claim.email,
    teacherName: teacher.fullName?.value || claim.teacherName,
  };
}

// List all pending claims with basic info
export const listPending = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];

    const claims = await ctx.db
      .query('teacherClaims')
      .withIndex('by_status', (q) => q.eq('status', 'pending_review'))
      .order('desc')
      .collect();

    // Get photo URLs for each claim
    const claimsWithUrls = await Promise.all(
      claims.map(async (claim) => {
        const photoUrls: string[] = [];
        if (claim.proposedPhotos) {
          for (const photo of claim.proposedPhotos) {
            const url = await ctx.storage.getUrl(photo.storageId);
            if (url) photoUrls.push(url);
          }
        }
        return {
          ...claim,
          photoUrls,
          photoCount: claim.proposedPhotos?.length || 0,
        };
      })
    );

    return claimsWithUrls;
  },
});

// List all claims (for history view)
export const listAll = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return [];

    let claimsQuery = ctx.db.query('teacherClaims');

    if (args.status) {
      claimsQuery = claimsQuery.withIndex('by_status', (q) => 
        q.eq('status', args.status!)
      );
    }

    const claims = await claimsQuery
      .order('desc')
      .take(args.limit || 50);

    return claims;
  },
});

// Get pending claims count (for badge)
export const getPendingCount = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return 0;

    const claims = await ctx.db
      .query('teacherClaims')
      .withIndex('by_status', (q) => q.eq('status', 'pending_review'))
      .collect();
    return claims.length;
  },
});

// Get full claim details with photo URLs and current teacher data
export const getClaimDetails = query({
  args: { token: v.string(), claimId: v.id('teacherClaims') },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return null;

    const claim = await ctx.db.get(args.claimId);
    if (!claim) return null;

    // Get current teacher data for comparison
    const teacher = await ctx.db.get(claim.teacherId);

    // Get photo URLs
    const photos: Array<{
      storageId: Id<'_storage'>;
      url: string | null;
      type: string;
      caption?: string;
      uploadedAt: number;
    }> = [];

    if (claim.proposedPhotos) {
      for (const photo of claim.proposedPhotos) {
        const url = await ctx.storage.getUrl(photo.storageId);
        photos.push({
          storageId: photo.storageId,
          url,
          type: photo.type,
          caption: photo.caption,
          uploadedAt: photo.uploadedAt,
        });
      }
    }

    return {
      claim,
      teacher,
      photos,
    };
  },
});

// Approve claim - merge selected data into teacher profile
export const approve = mutation({
  args: {
    token: v.string(),
    claimId: v.id('teacherClaims'),
    approvedFields: v.array(v.string()),
    approvedPhotoIndices: v.array(v.number()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await approveClaimInternal(ctx as any, {
      token: args.token,
      claimId: args.claimId,
      approvedFields: args.approvedFields,
      approvedPhotoIndices: args.approvedPhotoIndices,
      adminNotes: args.adminNotes,
    });
  },
});

// Reject claim
export const reject = mutation({
  args: {
    token: v.string(),
    claimId: v.id('teacherClaims'),
    reason: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { success: false, error: 'Not authenticated' };

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }
    if (claim.status !== 'pending_review') {
      return { success: false, error: 'Claim already reviewed' };
    }

    const now = Date.now();

    // Best-effort cleanup: delete any uploaded photos for this claim.
    if (claim.proposedPhotos?.length) {
      for (const photo of claim.proposedPhotos) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await ctx.storage.delete(photo.storageId);
        } catch {
          // Ignore storage deletion failures; rejection should still succeed.
        }
      }
    }

    await ctx.db.patch(args.claimId, {
      status: 'rejected',
      adminNotes: args.adminNotes || args.reason,
      reviewedBy: adminId,
      reviewedAt: now,
      updatedAt: now,
      proposedPhotos: [],
    });

    return { success: true };
  },
});

// Delete claim (for spam/abuse)
export const deleteClaim = mutation({
  args: { token: v.string(), claimId: v.id('teacherClaims') },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { success: false, error: 'Not authenticated' };

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }
    if (claim.status === 'approved') {
      return { success: false, error: 'Cannot delete an approved claim' };
    }

    // Delete associated photos from storage
    if (claim.proposedPhotos) {
      for (const photo of claim.proposedPhotos) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await ctx.storage.delete(photo.storageId);
        } catch {
          // Ignore storage deletion failures; proceed with deletion.
        }
      }
    }

    // Delete claim record
    await ctx.db.delete(args.claimId);

    return { success: true };
  },
});

// Quick approve all (for trusted claims)
export const approveAll = mutation({
  args: {
    token: v.string(),
    claimId: v.id('teacherClaims'),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) return { success: false, error: 'Not authenticated' };

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }
    if (claim.status !== 'pending_review') {
      return { success: false, error: 'Claim already reviewed' };
    }

    // Get all field names from proposedProfile
    const allFields: string[] = [];
    if (claim.proposedProfile) {
      const profile = claim.proposedProfile;
      if (profile.bio) allFields.push('bio');
      if (profile.specializations) allFields.push('specializations');
      if (typeof profile.experienceYears === 'number') allFields.push('experienceYears');
      if (profile.languages) allFields.push('languages');
      if (profile.whatsapp) allFields.push('whatsapp');
      if (profile.bookingUrl) allFields.push('bookingUrl');
      if (profile.instagram) allFields.push('instagram');
      if (profile.website) allFields.push('website');
    }

    // Get all photo indices
    const allPhotoIndices = claim.proposedPhotos ? claim.proposedPhotos.map((_, i) => i) : [];

    return await approveClaimInternal(ctx as any, {
      token: args.token,
      claimId: args.claimId,
      approvedFields: allFields,
      approvedPhotoIndices: allPhotoIndices,
      adminNotes: args.adminNotes,
    });
  },
});

// List all claims with photos (internal use - for finding claims to sync)
export const listClaimsWithPhotos = query({
  args: {},
  handler: async (ctx) => {
    const claims = await ctx.db.query('teacherClaims').order('desc').take(50);

    return claims
      .filter((c) => c.proposedPhotos && c.proposedPhotos.length > 0)
      .map((c) => ({
        _id: c._id,
        teacherId: c.teacherId,
        teacherName: c.teacherName,
        claimantName: c.claimantName,
        email: c.email,
        status: c.status,
        photoCount: c.proposedPhotos?.length || 0,
        createdAt: c.createdAt,
      }));
  },
});

// Sync photos from a claim to teacherPhotos (internal use - no auth required)
export const syncPhotosFromClaimInternal = mutation({
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
      return { success: false, error: 'No photos in claim to sync' };
    }

    // Check if photos already exist for this teacher
    const existingPhotos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher', (q) => q.eq('teacherId', claim.teacherId))
      .collect();

    // Filter out photos that are already synced (by storageId)
    const existingStorageIds = new Set(existingPhotos.map((p) => p.storageId));
    const photosToSync = proposedPhotos.filter(
      (p) => !existingStorageIds.has(p.storageId)
    );

    if (photosToSync.length === 0) {
      return { success: true, message: 'Photos already synced', syncedCount: 0 };
    }

    // Validate storage URLs exist before inserting
    const validPhotos = [];
    for (const photo of photosToSync) {
      const url = await ctx.storage.getUrl(photo.storageId);
      if (url) validPhotos.push(photo);
    }

    if (validPhotos.length === 0) {
      return { success: false, error: 'No valid photos found in storage' };
    }

    const now = Date.now();
    let displayOrder = existingPhotos.length;

    for (const photo of validPhotos) {
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
    }

    return {
      success: true,
      message: `Synced ${validPhotos.length} photos for teacher ${claim.teacherName}`,
      syncedCount: validPhotos.length,
      teacherId: claim.teacherId,
    };
  },
});

// Sync photos from an approved claim that had photos missed during approval (admin version)
export const syncPhotosFromClaim = mutation({
  args: {
    token: v.string(),
    claimId: v.id('teacherClaims'),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx, args.token);
    if (!adminId) {
      return { success: false, error: 'Unauthorized' };
    }

    const claim = await ctx.db.get(args.claimId);
    if (!claim) {
      return { success: false, error: 'Claim not found' };
    }

    const proposedPhotos = claim.proposedPhotos || [];
    if (proposedPhotos.length === 0) {
      return { success: false, error: 'No photos in claim to sync' };
    }

    // Check if photos already exist for this teacher
    const existingPhotos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher', (q) => q.eq('teacherId', claim.teacherId))
      .collect();

    // Filter out photos that are already synced (by storageId)
    const existingStorageIds = new Set(existingPhotos.map((p) => p.storageId));
    const photosToSync = proposedPhotos.filter(
      (p) => !existingStorageIds.has(p.storageId)
    );

    if (photosToSync.length === 0) {
      return { success: true, message: 'Photos already synced', syncedCount: 0 };
    }

    // Validate storage URLs exist before inserting
    const validPhotos = [];
    for (const photo of photosToSync) {
      const url = await ctx.storage.getUrl(photo.storageId);
      if (url) validPhotos.push(photo);
    }

    if (validPhotos.length === 0) {
      return { success: false, error: 'No valid photos found in storage' };
    }

    const now = Date.now();
    let displayOrder = existingPhotos.length;

    for (const photo of validPhotos) {
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
    }

    return {
      success: true,
      message: `Synced ${validPhotos.length} photos`,
      syncedCount: validPhotos.length,
    };
  },
});
