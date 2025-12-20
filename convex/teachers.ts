import { v } from 'convex/values';
import { query, mutation, QueryCtx, MutationCtx } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import { getAdminUserId } from './lib/adminAuth';

async function withProfilePhotoUrl(ctx: QueryCtx, teacher: Doc<'teachers'>): Promise<Doc<'teachers'>> {
  const storageId = teacher.profilePhoto?.value?.storageId;
  if (!storageId) return teacher;
  if (teacher.profilePhoto?.value?.url) return teacher;

  try {
    const url = await ctx.storage.getUrl(storageId as unknown as Id<'_storage'>);
    if (!url) return teacher;
    return {
      ...teacher,
      profilePhoto: {
        ...teacher.profilePhoto,
        value: { ...teacher.profilePhoto!.value, url },
      },
    };
  } catch {
    return teacher;
  }
}

function sanitizeTeacherForPublic<T extends Record<string, any>>(teacher: T): T {
  const isPublic = teacher?.contact?.isPublic === true;
  if (isPublic) return teacher;
  if (!teacher?.contact) return teacher;

  return {
    ...teacher,
    contact: { isPublic: false },
  };
}

export const getByCity = query({
  args: { citySlug: v.string() },
  handler: async (ctx: QueryCtx, args: any) => {
    const teachers = await ctx.db
      .query('teachers')
      .withIndex('by_city_active', (q: any) => 
        q.eq('citySlug', args.citySlug).eq('isActive', true)
      )
      .collect();

    teachers.sort((a: Doc<'teachers'>, b: Doc<'teachers'>) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return b.dataQualityScore - a.dataQualityScore;
    });

    const enriched = await Promise.all(
      teachers.map(async (teacher: Doc<'teachers'>) => {
        const teacherWithPhoto = await withProfilePhotoUrl(ctx, teacher);
        const links = await ctx.db
          .query('teacherStudioLinks')
          .withIndex('by_teacher_status', (q: any) => 
            q.eq('teacherId', teacher._id).eq('status', 'verified')
          )
          .collect();

        const studios = await Promise.all(
          links.map(async (link: Doc<'teacherStudioLinks'>) => {
            const studio = await ctx.db.get(link.studioId);
            return {
              name: studio?.name,
              slug: studio?.slug,
              photo: studio?.photos?.[0],
            };
          })
        );
        return sanitizeTeacherForPublic({ ...teacherWithPhoto, studios });
      })
    );

    return enriched;
  },
});

export const getBySlug = query({
  args: {
    citySlug: v.string(),
    slug: v.string(),
  },
  handler: async (ctx: QueryCtx, args: any) => {
    const find = async (slug: string) => {
      return await ctx.db
        .query('teachers')
        .withIndex('by_slug', (q: any) => q.eq('slug', slug))
        .filter((q: any) => q.eq(q.field('citySlug'), args.citySlug))
        .filter((q: any) => q.eq(q.field('isActive'), true))
        .first();
    };

    let teacher = await find(args.slug);

    // Backwards/forwards compatibility:
    // - Some teacher slugs include the city suffix (e.g. "maria-gonzalez-cdmx")
    // - Public routes already include the city segment, so we also support clean slugs.
    if (!teacher) {
      const suffix = `-${args.citySlug}`;
      const candidates: string[] = [];
      if (args.slug.endsWith(suffix)) {
        candidates.push(args.slug.slice(0, -suffix.length));
      } else {
        candidates.push(`${args.slug}${suffix}`);
      }
      for (const candidate of candidates) {
        // eslint-disable-next-line no-await-in-loop
        teacher = await find(candidate);
        if (teacher) break;
      }
    }

    if (!teacher) return null;
    const teacherWithPhoto = await withProfilePhotoUrl(ctx, teacher);

    const links = await ctx.db
      .query('teacherStudioLinks')
      .withIndex('by_teacher_status', (q: any) => 
        q.eq('teacherId', teacher._id).eq('status', 'verified')
      )
      .collect();

    const studios = await Promise.all(
      links.map(async (link: Doc<'teacherStudioLinks'>) => {
        const studio = await ctx.db.get(link.studioId);
        return {
          ...link,
          studioSlug: studio?.slug,
          studioName: studio?.name,
          studioPhoto: studio?.photos?.[0],
        };
      })
    );

    return sanitizeTeacherForPublic({ ...teacherWithPhoto, studios });
  },
});

export const search = query({
  args: {
    query: v.string(),
    citySlug: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: any) => {
    let teachersQuery = ctx.db.query('teachers');

    if (args.citySlug) {
      teachersQuery = teachersQuery.withIndex('by_city_active', (q: any) =>
        q.eq('citySlug', args.citySlug).eq('isActive', true)
      );
    } else {
      teachersQuery = teachersQuery.filter((q: any) => q.eq(q.field('isActive'), true));
    }

    const teachers = await teachersQuery.collect();

    const query = args.query.toLowerCase();
    const filtered = teachers.filter((teacher: Doc<'teachers'>) => {
      const nameMatch = teacher.fullName.value.toLowerCase().includes(query);
      
      const specializationMatch = teacher.specializations?.value.some((s: string) => 
        s.toLowerCase().includes(query)
      );
      
      const bioMatch = teacher.bio?.value.toLowerCase().includes(query);
      
      return nameMatch || specializationMatch || bioMatch;
    });

    const scored = filtered.map((teacher: Doc<'teachers'>) => {
      let score = 0;
      if (teacher.fullName.value.toLowerCase().includes(query)) score += 10;
      if (teacher.specializations?.value.some((s: string) => s.toLowerCase().includes(query))) score += 5;
      if (teacher.isVerified) score += 5;
      return { ...teacher, score };
    });

    scored.sort((a: any, b: any) => b.score - a.score);
    const limit = args.limit || 20;
    const sliced = scored.slice(0, limit).map(({ score, ...teacher }: any) => teacher);

    const enriched = await Promise.all(
      sliced.map(async (teacher: Doc<'teachers'>) => {
        const teacherWithPhoto = await withProfilePhotoUrl(ctx, teacher);
        const links = await ctx.db
          .query('teacherStudioLinks')
          .withIndex('by_teacher_status', (q: any) => 
            q.eq('teacherId', teacher._id).eq('status', 'verified')
          )
          .collect();

        const studios = await Promise.all(
          links.map(async (link: Doc<'teacherStudioLinks'>) => {
            const studio = await ctx.db.get(link.studioId);
            return {
              name: studio?.name,
              slug: studio?.slug,
              photo: studio?.photos?.[0],
            };
          })
        );
        return sanitizeTeacherForPublic({ ...teacherWithPhoto, studios });
      })
    );

    return enriched;
  },
});

export const getFeatured = query({
  args: {
    citySlug: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: QueryCtx, args: any) => {
    let q = ctx.db.query('teachers');

    if (args.citySlug) {
      q = q.withIndex('by_city_active', (q: any) => 
        q.eq('citySlug', args.citySlug).eq('isActive', true)
      );
    } else {
      q = q.withIndex('by_active_verified', (q: any) => 
        q.eq('isActive', true).eq('isVerified', true)
      );
    }

    const teachers = await q.take(args.limit || 10);

    const enriched = await Promise.all(
      teachers.map(async (teacher: Doc<'teachers'>) => {
        const teacherWithPhoto = await withProfilePhotoUrl(ctx, teacher);
        const links = await ctx.db
          .query('teacherStudioLinks')
          .withIndex('by_teacher_status', (q: any) => 
            q.eq('teacherId', teacher._id).eq('status', 'verified')
          )
          .collect();

        const studios = await Promise.all(
          links.map(async (link: Doc<'teacherStudioLinks'>) => {
            const studio = await ctx.db.get(link.studioId);
            return {
              name: studio?.name,
              slug: studio?.slug,
              photo: studio?.photos?.[0],
            };
          })
        );
        return sanitizeTeacherForPublic({ ...teacherWithPhoto, studios });
      })
    );

    return enriched;
  },
});

// Get teacher counts per city (for directory landing pages)
export const getCityCounts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args: { limit?: number }) => {
    // Use existing composite index to avoid a full table scan.
    const [verified, unverified] = await Promise.all([
      ctx.db
        .query('teachers')
        .withIndex('by_active_verified', (q: any) => q.eq('isActive', true).eq('isVerified', true))
        .collect(),
      ctx.db
        .query('teachers')
        .withIndex('by_active_verified', (q: any) => q.eq('isActive', true).eq('isVerified', false))
        .collect(),
    ]);

    const all = verified.concat(unverified);

    const map = new Map<
      string,
      { citySlug: string; cityName: string; teacherCount: number; verifiedCount: number }
    >();

    for (const teacher of all as Array<Doc<'teachers'>>) {
      const citySlug = teacher.citySlug;
      const cityName = teacher.cityName?.value || citySlug;

      const existing = map.get(citySlug) || {
        citySlug,
        cityName,
        teacherCount: 0,
        verifiedCount: 0,
      };

      existing.teacherCount += 1;
      if (teacher.isVerified) existing.verifiedCount += 1;

      // Prefer a real name if present.
      if (cityName && (!existing.cityName || existing.cityName === citySlug)) {
        existing.cityName = cityName;
      }

      map.set(citySlug, existing);
    }

    const out = Array.from(map.values()).sort((a, b) => b.teacherCount - a.teacherCount);
    const limit = typeof args.limit === 'number' ? Math.max(0, args.limit) : undefined;
    return limit ? out.slice(0, limit) : out;
  },
});

// Get photos for a teacher
export const getPhotos = query({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx: QueryCtx, args: { teacherId: any }) => {
    const photos = await ctx.db
      .query('teacherPhotos')
      .withIndex('by_teacher_active', (q: any) => 
        q.eq('teacherId', args.teacherId).eq('isActive', true)
      )
      .collect();

    // Sort by display order
    photos.sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    // Get URLs for each photo
    const photosWithUrls = await Promise.all(
      photos.map(async (photo: any) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        return {
          ...photo,
          url,
        };
      })
    );

    return photosWithUrls;
  },
});

export const upsert = mutation({
  args: {
    token: v.string(),
    teacher: v.object({
      slug: v.string(),
      fullName: v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
          source: v.string(),
          observedAt: v.number(),
          evidence: v.optional(v.string()),
        }),
      }),
      displayName: v.optional(v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      citySlug: v.string(),
      cityName: v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      }),
      neighborhoodSlug: v.optional(v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      bio: v.optional(v.object({
        value: v.string(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      specializations: v.object({
        value: v.array(v.string()),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      }),
      experienceYears: v.optional(v.object({
        value: v.number(),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      experienceLevel: v.optional(v.object({
        value: v.union(
          v.literal('ENTRY'),
          v.literal('INTERMEDIATE'),
          v.literal('EXPERIENCED'),
          v.literal('SENIOR'),
          v.literal('MASTER')
        ),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      languages: v.object({
        value: v.array(v.string()),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      }),
      certifications: v.array(v.object({
        key: v.string(),
        name: v.string(),
        organization: v.optional(v.string()),
        year: v.optional(v.object({
          value: v.number(),
          confidence: v.object({
            value: v.number(),
            level: v.string(),
            source: v.string(),
            observedAt: v.number(),
          }),
        })),
        expiryDate: v.optional(v.object({
          value: v.string(),
          confidence: v.object({
            value: v.number(),
            level: v.string(),
            source: v.string(),
            observedAt: v.number(),
          }),
        })),
        credentialId: v.optional(v.object({
          value: v.string(),
          confidence: v.object({
            value: v.number(),
            level: v.string(),
            source: v.string(),
            observedAt: v.number(),
          }),
        })),
        isVerified: v.boolean(),
        verificationProof: v.optional(v.object({
          storageId: v.optional(v.id('_storage')),
          url: v.optional(v.string()),
          uploadedAt: v.optional(v.number()),
        })),
      })),
      profilePhoto: v.optional(v.object({
        value: v.object({
          storageId: v.string(),
          source: v.union(v.literal('upload'), v.literal('instagram_oauth'), v.literal('scrape')),
          url: v.optional(v.string()),
          updatedAt: v.number(),
        }),
        confidence: v.object({
          value: v.number(),
          level: v.string(),
          source: v.string(),
          observedAt: v.number(),
        }),
      })),
      social: v.optional(v.object({
        instagram: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        linkedin: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        facebook: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        tiktok: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        website: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
      })),
      contact: v.optional(v.object({
        email: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        phone: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        whatsapp: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        bookingUrl: v.optional(v.object({
          value: v.string(),
          confidence: v.object({ value: v.number(), level: v.string(), source: v.string(), observedAt: v.number() })
        })),
        isPublic: v.boolean(),
      })),
      status: v.union(
        v.literal('scraped'),
        v.literal('claimed'),
        v.literal('verified'),
        v.literal('suspended')
      ),
      isVerified: v.boolean(),
      isActive: v.boolean(),
      dataQualityScore: v.number(),
      scrapeSources: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx: MutationCtx, args: any) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('teachers')
      .withIndex('by_slug', (q: any) => q.eq('slug', args.teacher.slug))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.teacher,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('teachers', {
        ...args.teacher,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const syncSeedTeachers = mutation({
  args: {
    token: v.string(),
    normalizeSlugs: v.optional(v.boolean()),
    seeds: v.array(
      v.object({
        slug: v.string(),
        citySlug: v.string(),
        cityName: v.string(),
        fullName: v.string(),
        bio: v.optional(v.string()),
        specializations: v.optional(v.array(v.string())),
        experienceYears: v.optional(v.number()),
        languages: v.optional(v.array(v.string())),
        certifications: v.optional(
          v.array(
            v.object({
              name: v.string(),
              organization: v.optional(v.string()),
              year: v.optional(v.number()),
              isVerified: v.optional(v.boolean()),
            })
          )
        ),
        social: v.optional(
          v.object({
            instagram: v.optional(v.string()),
            linkedin: v.optional(v.string()),
            facebook: v.optional(v.string()),
            website: v.optional(v.string()),
          })
        ),
        isVerified: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args: any) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    const now = Date.now();
    const confidence = {
      value: 0.9,
      level: 'high',
      source: 'seed',
      observedAt: now,
    } as const;

    const normalizeSlugs = Boolean(args.normalizeSlugs);

    const results = {
      inserted: 0,
      updated: 0,
      renamed: 0,
      conflicts: [] as Array<{ citySlug: string; slug: string; reason: string }>,
    };

    const findTeacher = async (citySlug: string, slug: string) => {
      return await ctx.db
        .query('teachers')
        .withIndex('by_slug', (q: any) => q.eq('slug', slug))
        .filter((q: any) => q.eq(q.field('citySlug'), citySlug))
        .first();
    };

    const patchTeacherSlugEverywhere = async (teacherId: Id<'teachers'>, nextSlug: string) => {
      const links = await ctx.db
        .query('teacherStudioLinks')
        .withIndex('by_teacher', (q: any) => q.eq('teacherId', teacherId))
        .collect();
      for (const link of links) {
        // eslint-disable-next-line no-await-in-loop
        await ctx.db.patch(link._id, { teacherSlug: nextSlug, updatedAt: now });
      }

      const claims = await ctx.db
        .query('teacherClaims')
        .withIndex('by_teacher', (q: any) => q.eq('teacherId', teacherId))
        .collect();
      for (const claim of claims) {
        // eslint-disable-next-line no-await-in-loop
        await ctx.db.patch(claim._id, { teacherSlug: nextSlug, updatedAt: now });
      }
    };

    for (const seed of args.seeds) {
      const citySlug = String(seed.citySlug).trim();
      const cleanSlug = String(seed.slug).trim();
      const legacySlug = `${cleanSlug}-${citySlug}`;

      let teacher = await findTeacher(citySlug, cleanSlug);

      if (!teacher) {
        const legacyTeacher = await findTeacher(citySlug, legacySlug);
        if (legacyTeacher) {
          if (normalizeSlugs) {
            // Avoid creating a duplicate slug within the same city.
            const conflicting = await findTeacher(citySlug, cleanSlug);
            if (conflicting && conflicting._id !== legacyTeacher._id) {
              results.conflicts.push({
                citySlug,
                slug: cleanSlug,
                reason: `Slug conflict: both "${legacyTeacher.slug}" and "${conflicting.slug}" exist`,
              });
              teacher = legacyTeacher;
            } else {
              await ctx.db.patch(legacyTeacher._id, { slug: cleanSlug, updatedAt: now });
              await patchTeacherSlugEverywhere(legacyTeacher._id, cleanSlug);
              results.renamed += 1;
              teacher = { ...legacyTeacher, slug: cleanSlug };
            }
          } else {
            teacher = legacyTeacher;
          }
        }
      }

      const seedSocial = seed.social || {};
      const seedSpecializations = Array.isArray(seed.specializations) ? seed.specializations : [];
      const seedLanguages = Array.isArray(seed.languages) ? seed.languages : [];
      const seedCertifications = Array.isArray(seed.certifications) ? seed.certifications : [];

      const mappedCerts = seedCertifications
        .filter((c: any) => c?.name)
        .slice(0, 20)
        .map((c: any, idx: number) => ({
          key: `${cleanSlug}-cert-${idx}-${String(c.name).slice(0, 50).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80),
          name: String(c.name).slice(0, 120),
          organization: c.organization ? String(c.organization).slice(0, 120) : undefined,
          year:
            typeof c.year === 'number'
              ? { value: c.year, confidence }
              : undefined,
          isVerified: Boolean(c.isVerified),
        }));

      if (teacher) {
        const updates: Record<string, any> = { updatedAt: now };
        let changed = false;

        if (seed.bio && !teacher.bio?.value) {
          updates.bio = { value: String(seed.bio).slice(0, 2000), confidence };
          changed = true;
        }

        if (seedSpecializations.length > 0) {
          const existing = teacher.specializations?.value || [];
          const merged = Array.from(new Set([...existing, ...seedSpecializations])).slice(0, 30);
          if (merged.length !== existing.length) {
            updates.specializations = { value: merged, confidence };
            changed = true;
          }
        }

        if (typeof seed.experienceYears === 'number' && !teacher.experienceYears?.value) {
          updates.experienceYears = { value: seed.experienceYears, confidence };
          changed = true;
        }

        if (seedLanguages.length > 0) {
          const existing = teacher.languages?.value || [];
          const merged = Array.from(new Set([...existing, ...seedLanguages])).slice(0, 10);
          if (merged.length !== existing.length) {
            updates.languages = { value: merged, confidence };
            changed = true;
          }
        }

        if (mappedCerts.length > 0 && (!teacher.certifications || teacher.certifications.length === 0)) {
          updates.certifications = mappedCerts;
          changed = true;
        }

      if (seedSocial.instagram || seedSocial.linkedin || seedSocial.facebook || seedSocial.website) {
          const existingSocial = teacher.social || {};
          const nextSocial: Record<string, any> = { ...existingSocial };
          let socialChanged = false;

          if (seedSocial.instagram && !existingSocial.instagram?.value) {
            nextSocial.instagram = { value: String(seedSocial.instagram).slice(0, 60), confidence };
            socialChanged = true;
          }
          if (seedSocial.linkedin && !existingSocial.linkedin?.value) {
            nextSocial.linkedin = { value: String(seedSocial.linkedin).slice(0, 300), confidence };
            socialChanged = true;
          }
          if (seedSocial.facebook && !existingSocial.facebook?.value) {
            nextSocial.facebook = { value: String(seedSocial.facebook).slice(0, 300), confidence };
            socialChanged = true;
          }
          if (seedSocial.website && !existingSocial.website?.value) {
            nextSocial.website = { value: String(seedSocial.website).slice(0, 300), confidence };
            socialChanged = true;
          }

          if (socialChanged) {
            updates.social = nextSocial;
            changed = true;
          }
        }

        if (typeof seed.isVerified === 'boolean' && seed.isVerified !== teacher.isVerified) {
          updates.isVerified = seed.isVerified;
          if (seed.isVerified && teacher.status !== 'verified') {
            updates.status = 'verified';
            updates.verifiedAt = now;
          }
          changed = true;
        }

        if (changed) {
          await ctx.db.patch(teacher._id, updates);
          results.updated += 1;
        }

        continue;
      }

      // Insert a new teacher from seed
      const languages = seedLanguages.length > 0 ? seedLanguages.slice(0, 10) : ['Español'];
      const specializations = seedSpecializations.slice(0, 30);

      let dataQualityScore = 20;
      if (seed.bio) dataQualityScore += 20;
      dataQualityScore += Math.min(15, specializations.length * 5);
      dataQualityScore += Math.min(15, mappedCerts.length * 5);
      if (seedSocial.instagram) dataQualityScore += 10;
      if (seedSocial.linkedin) dataQualityScore += 5;
      if (seedSocial.facebook) dataQualityScore += 3;
      if (seedSocial.website) dataQualityScore += 5;
      if (typeof seed.experienceYears === 'number') dataQualityScore += 5;
      if (languages.length > 1) dataQualityScore += 5;
      dataQualityScore = Math.min(100, dataQualityScore);

      await ctx.db.insert('teachers', {
        slug: cleanSlug,
        fullName: {
          value: String(seed.fullName).slice(0, 120),
          confidence: { ...confidence, evidence: undefined },
        },
        citySlug,
        cityName: {
          value: String(seed.cityName).slice(0, 80),
          confidence: { value: 0.95, level: 'high', source: 'seed', observedAt: now },
        },
        bio: seed.bio ? { value: String(seed.bio).slice(0, 2000), confidence } : undefined,
        specializations: { value: specializations, confidence },
        experienceYears:
          typeof seed.experienceYears === 'number' ? { value: seed.experienceYears, confidence } : undefined,
        languages: { value: languages, confidence },
        certifications: mappedCerts,
        social:
          seedSocial.instagram || seedSocial.linkedin || seedSocial.facebook || seedSocial.website
            ? {
                instagram: seedSocial.instagram
                  ? { value: String(seedSocial.instagram).slice(0, 60), confidence }
                  : undefined,
                linkedin: seedSocial.linkedin
                  ? { value: String(seedSocial.linkedin).slice(0, 300), confidence }
                  : undefined,
                facebook: seedSocial.facebook
                  ? { value: String(seedSocial.facebook).slice(0, 300), confidence }
                  : undefined,
                website: seedSocial.website
                  ? { value: String(seedSocial.website).slice(0, 300), confidence }
                  : undefined,
              }
            : undefined,
        status: typeof seed.isVerified === 'boolean' && seed.isVerified ? 'verified' : 'scraped',
        isVerified: Boolean(seed.isVerified),
        isActive: true,
        dataQualityScore,
        createdAt: now,
        updatedAt: now,
        verifiedAt: typeof seed.isVerified === 'boolean' && seed.isVerified ? now : undefined,
      });

      results.inserted += 1;
    }

    return results;
  },
});

export const getSeedSyncStatus = query({
  args: {
    token: v.string(),
    seeds: v.array(
      v.object({
        slug: v.string(),
        citySlug: v.string(),
      })
    ),
  },
  handler: async (ctx: QueryCtx, args: any) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) throw new Error('Not authenticated');

    const findTeacher = async (citySlug: string, slug: string) => {
      return await ctx.db
        .query('teachers')
        .withIndex('by_slug', (q: any) => q.eq('slug', slug))
        .filter((q: any) => q.eq(q.field('citySlug'), citySlug))
        .first();
    };

    const out: Array<{
      citySlug: string;
      slug: string;
      found: boolean;
      teacherId?: Id<'teachers'>;
      storedSlug?: string;
    }> = [];

    for (const seed of args.seeds) {
      const citySlug = String(seed.citySlug).trim();
      const cleanSlug = String(seed.slug).trim();
      const legacySlug = `${cleanSlug}-${citySlug}`;

      // eslint-disable-next-line no-await-in-loop
      const exact = await findTeacher(citySlug, cleanSlug);
      if (exact) {
        out.push({
          citySlug,
          slug: cleanSlug,
          found: true,
          teacherId: exact._id,
          storedSlug: exact.slug,
        });
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const legacy = await findTeacher(citySlug, legacySlug);
      if (legacy) {
        out.push({
          citySlug,
          slug: cleanSlug,
          found: true,
          teacherId: legacy._id,
          storedSlug: legacy.slug,
        });
        continue;
      }

      out.push({
        citySlug,
        slug: cleanSlug,
        found: false,
      });
    }

    return out;
  },
});
