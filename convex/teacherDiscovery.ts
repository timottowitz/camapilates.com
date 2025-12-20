import { v } from 'convex/values';
import { action, internalAction, internalMutation, internalQuery, query, mutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { Id, Doc } from './_generated/dataModel';
import { getAdminUserId } from './lib/adminAuth';

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 2000;
const MAX_PAGES_PER_SITE = 10;

const TEAM_PAGE_PATTERNS = [
  /\/equipo\/?$/i,
  /\/nuestro-equipo\/?$/i,
  /\/instructores?\/?$/i,
  /\/profesores?\/?$/i,
  /\/maestros?\/?$/i,
  /\/staff\/?$/i,
  /\/team\/?$/i,
  /\/teachers?\/?$/i,
  /\/trainers?\/?$/i,
  /\/coaches?\/?$/i,
  /\/about-us\/team\/?$/i,
  /\/sobre-nosotros\/equipo\/?$/i,
  /\/about\/?$/i,
  /\/nosotros\/?$/i,
  /\/quienes-somos\/?$/i,
  /\/conocenos\/?$/i,
];

const TEAM_PAGE_KEYWORDS = [
  'equipo', 'instructores', 'instructoras', 'profesores', 'profesoras',
  'maestros', 'maestras', 'staff', 'team', 'teachers', 'trainers',
  'coaches', 'nuestro equipo', 'conoce a', 'meet our',
];

const INSTRUCTOR_ROLE_KEYWORDS = [
  'instructor', 'instructora', 'profesor', 'profesora',
  'maestro', 'maestra', 'coach', 'trainer', 'teacher',
  'pilates', 'reformer', 'mat', 'barre', 'yoga',
];

interface TeamPageCandidate {
  url: string;
  score: number;
  matchedPatterns: string[];
  source: 'sitemap' | 'nav' | 'crawl' | 'homepage';
}

interface ExtractedPerson {
  fullName: string;
  role?: string;
  bio?: string;
  photoUrl?: string;
  social?: {
    instagram?: string;
    website?: string;
    linkedin?: string;
  };
  certifications?: string[];
  specializations?: string[];
  evidence: {
    sourceUrl: string;
    snippet: string;
  };
  confidence: number;
}

interface ExtractionResult {
  people: ExtractedPerson[];
  pageConfidence: number;
  pageUrl: string;
}

interface ActionContext {
  runQuery: <T>(query: any, args: any) => Promise<T>;
  runMutation: <T>(mutation: any, args: any) => Promise<T>;
}

export const discoverTeachersInCity = action({
  args: {
    token: v.string(),
    citySlug: v.string(),
    limit: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    total: number;
    processed: number;
    teachersFound: number;
    linksCreated: number;
    errors: Array<{ studioSlug: string; error: string }>;
    startTime: number;
    duration: number;
  }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');

    console.log(`Starting teacher discovery for city: ${args.citySlug}`);

    const studios = await ctx.runQuery(internal.teacherDiscovery.getStudiosWithWebsites, {
      citySlug: args.citySlug,
      limit: args.limit,
    });

    console.log(`Found ${studios.length} studios with websites`);

    const results = {
      total: studios.length,
      processed: 0,
      teachersFound: 0,
      linksCreated: 0,
      errors: [] as Array<{ studioSlug: string; error: string }>,
      startTime: Date.now(),
    };

    for (let i = 0; i < studios.length; i += BATCH_SIZE) {
      const batch = studios.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(studios.length / BATCH_SIZE)}`);

      for (const studio of batch) {
        try {
          const studioResult = await processStudio(ctx as ActionContext, studio, args.dryRun);
          results.processed++;
          results.teachersFound += studioResult.teachersFound;
          results.linksCreated += studioResult.linksCreated;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error processing ${studio.slug}:`, errorMessage);
          results.errors.push({ studioSlug: studio.slug, error: errorMessage });
        }
      }

      if (i + BATCH_SIZE < studios.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const duration = Date.now() - results.startTime;
    console.log(`Discovery complete: ${results.teachersFound} teachers from ${results.processed} studios in ${Math.round(duration / 1000)}s`);

    return { ...results, duration };
  },
});

export const discoverTeachersFromStudio = action({
  args: {
    token: v.string(),
    studioId: v.id('studios'),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ teachersFound: number; linksCreated: number; teamPages: string[] }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');

    const studio = await ctx.runQuery(internal.teacherDiscovery.getStudioById, {
      studioId: args.studioId,
    });

    if (!studio) {
      throw new Error('Studio not found');
    }

    if (!studio.contact?.website) {
      throw new Error('Studio has no website');
    }

    return processStudio(ctx as ActionContext, studio, args.dryRun);
  },
});

async function processStudio(
  ctx: ActionContext,
  studio: Doc<'studios'>,
  dryRun?: boolean
): Promise<{ teachersFound: number; linksCreated: number; teamPages: string[] }> {
  const websiteUrl = studio.contact?.website;
  if (!websiteUrl) {
    return { teachersFound: 0, linksCreated: 0, teamPages: [] };
  }

  console.log(`Processing studio: ${studio.name} (${websiteUrl})`);

  const teamPages = await findTeamPages(websiteUrl);
  console.log(`Found ${teamPages.length} potential team pages for ${studio.slug}`);

  if (teamPages.length === 0) {
    return { teachersFound: 0, linksCreated: 0, teamPages: [] };
  }

  const allPeople: ExtractedPerson[] = [];
  for (const page of teamPages.slice(0, MAX_PAGES_PER_SITE)) {
    try {
      const result = await extractPeopleFromPage(page.url, studio);
      allPeople.push(...result.people);
    } catch (error) {
      console.error(`Error extracting from ${page.url}:`, error);
    }
  }

  const uniquePeople = deduplicatePeople(allPeople);
  console.log(`Extracted ${uniquePeople.length} unique instructors from ${studio.slug}`);

  if (dryRun) {
    return {
      teachersFound: uniquePeople.length,
      linksCreated: 0,
      teamPages: teamPages.map(p => p.url),
    };
  }

  let linksCreated = 0;
  for (const person of uniquePeople) {
    try {
      const teacherId = await ctx.runMutation<Id<'teachers'>>(internal.teacherDiscovery.upsertTeacher, {
        person,
        citySlug: getCitySlugFromStudio(studio),
        cityName: studio.address.city,
      });

      await ctx.runMutation<Id<'teacherStudioLinks'>>(internal.teacherDiscovery.createTeacherStudioLink, {
        teacherId,
        studioId: studio._id,
        person,
        studio,
      });

      linksCreated++;
    } catch (error) {
      console.error(`Error creating teacher ${person.fullName}:`, error);
    }
  }

  return {
    teachersFound: uniquePeople.length,
    linksCreated,
    teamPages: teamPages.map(p => p.url),
  };
}

async function findTeamPages(websiteUrl: string): Promise<TeamPageCandidate[]> {
  const candidates: TeamPageCandidate[] = [];
  const baseUrl = normalizeUrl(websiteUrl);

  try {
    const commonPaths = [
      '/equipo', '/nuestro-equipo', '/instructores', '/profesores',
      '/staff', '/team', '/about/team', '/nosotros/equipo',
      '/conocenos', '/about-us', '/nosotros',
    ];

    for (const path of commonPaths) {
      const url = new URL(path, baseUrl).toString();
      const score = scoreTeamPageUrl(url);
      if (score > 0) {
        candidates.push({
          url,
          score,
          matchedPatterns: [path],
          source: 'crawl',
        });
      }
    }

    const homepageLinks = await extractLinksFromPage(baseUrl);
    for (const link of homepageLinks) {
      if (link.href.startsWith(baseUrl) || link.href.startsWith('/')) {
        const fullUrl = link.href.startsWith('http') ? link.href : new URL(link.href, baseUrl).toString();
        const urlScore = scoreTeamPageUrl(fullUrl);
        const textScore = scoreTeamPageLinkText(link.text);
        const totalScore = urlScore + textScore;

        if (totalScore > 30) {
          candidates.push({
            url: fullUrl,
            score: totalScore,
            matchedPatterns: [link.text],
            source: 'nav',
          });
        }
      }
    }

    const uniqueCandidates = deduplicateCandidates(candidates);
    uniqueCandidates.sort((a, b) => b.score - a.score);

    return uniqueCandidates.slice(0, 5);
  } catch (error) {
    console.error(`Error finding team pages for ${websiteUrl}:`, error);
    return [];
  }
}

function scoreTeamPageUrl(url: string): number {
  let score = 0;
  for (const pattern of TEAM_PAGE_PATTERNS) {
    if (pattern.test(url)) {
      score += 50;
      break;
    }
  }
  return score;
}

function scoreTeamPageLinkText(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  for (const keyword of TEAM_PAGE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += 40;
      break;
    }
  }
  return score;
}

async function extractLinksFromPage(url: string): Promise<Array<{ href: string; text: string }>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CamaPilatesBot/1.0 (+https://camadepilates.com/bot)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const links: Array<{ href: string; text: string }> = [];

    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      if (href && text && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push({ href, text });
      }
    }

    return links;
  } catch (error) {
    console.error(`Error extracting links from ${url}:`, error);
    return [];
  }
}

async function extractPeopleFromPage(
  pageUrl: string,
  studio: Doc<'studios'>
): Promise<ExtractionResult> {
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'CamaPilatesBot/1.0 (+https://camadepilates.com/bot)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return { people: [], pageConfidence: 0, pageUrl };
    }

    const html = await response.text();
    const cleanedContent = cleanHtmlForExtraction(html);
    
    if (!looksLikeTeamPage(cleanedContent)) {
      return { people: [], pageConfidence: 0.2, pageUrl };
    }

    const people = extractPeopleFromContent(cleanedContent, pageUrl, studio);

    return {
      people,
      pageConfidence: people.length > 0 ? 0.7 : 0.3,
      pageUrl,
    };
  } catch (error) {
    console.error(`Error extracting people from ${pageUrl}:`, error);
    return { people: [], pageConfidence: 0, pageUrl };
  }
}

function cleanHtmlForExtraction(html: string): string {
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function looksLikeTeamPage(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  let keywordCount = 0;
  for (const keyword of INSTRUCTOR_ROLE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      keywordCount++;
    }
  }

  const namePattern = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/g;
  const potentialNames = content.match(namePattern) || [];

  return keywordCount >= 2 || potentialNames.length >= 3;
}

function extractPeopleFromContent(
  content: string,
  sourceUrl: string,
  _studio: Doc<'studios'>
): ExtractedPerson[] {
  const people: ExtractedPerson[] = [];

  const namePattern = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\b/g;
  const rolePattern = new RegExp(`(${INSTRUCTOR_ROLE_KEYWORDS.join('|')})`, 'gi');

  let nameMatch;
  const foundNames = new Set<string>();

  while ((nameMatch = namePattern.exec(content)) !== null) {
    const name = nameMatch[1];
    
    if (isCommonPhrase(name) || foundNames.has(name.toLowerCase())) {
      continue;
    }

    const contextStart = Math.max(0, nameMatch.index - 100);
    const contextEnd = Math.min(content.length, nameMatch.index + name.length + 200);
    const context = content.slice(contextStart, contextEnd);

    if (rolePattern.test(context)) {
      foundNames.add(name.toLowerCase());
      
      const bioStart = nameMatch.index + name.length;
      const bioEnd = Math.min(content.length, bioStart + 500);
      const bioCandidate = content.slice(bioStart, bioEnd).trim();
      const bio = bioCandidate.split(/[.!?]/).slice(0, 3).join('. ').trim();

      people.push({
        fullName: name,
        role: extractRole(context),
        bio: bio.length > 20 ? bio : undefined,
        specializations: extractSpecializations(context),
        evidence: {
          sourceUrl,
          snippet: context.slice(0, 200),
        },
        confidence: 0.6,
      });
    }
  }

  return people;
}

function extractRole(context: string): string | undefined {
  const lowerContext = context.toLowerCase();
  for (const keyword of INSTRUCTOR_ROLE_KEYWORDS) {
    if (lowerContext.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  return undefined;
}

function extractSpecializations(context: string): string[] {
  const specs: string[] = [];
  const lowerContext = context.toLowerCase();

  const specKeywords = [
    'reformer', 'mat', 'cadillac', 'chair', 'barrel',
    'prenatal', 'postnatal', 'embarazo', 'rehabilitación', 'rehabilitation',
    'barre', 'yoga', 'stretching', 'flexibilidad',
  ];

  for (const spec of specKeywords) {
    if (lowerContext.includes(spec)) {
      specs.push(spec.charAt(0).toUpperCase() + spec.slice(1));
    }
  }

  return specs;
}

function isCommonPhrase(name: string): boolean {
  const common = [
    'pilates studio', 'pilates reformer', 'clase de', 'horario de',
    'lunes viernes', 'todos los', 'más información', 'contacto para',
    'reserva tu', 'ciudad de', 'mexico city', 'nueva york',
  ];
  return common.some(phrase => name.toLowerCase().includes(phrase));
}

function deduplicatePeople(people: ExtractedPerson[]): ExtractedPerson[] {
  const seen = new Map<string, ExtractedPerson>();

  for (const person of people) {
    const key = normalizeName(person.fullName);
    const existing = seen.get(key);

    if (!existing || person.confidence > existing.confidence) {
      seen.set(key, person);
    }
  }

  return Array.from(seen.values());
}

function deduplicateCandidates(candidates: TeamPageCandidate[]): TeamPageCandidate[] {
  const seen = new Map<string, TeamPageCandidate>();

  for (const candidate of candidates) {
    const key = normalizeUrl(candidate.url);
    const existing = seen.get(key);

    if (!existing || candidate.score > existing.score) {
      seen.set(key, candidate);
    }
  }

  return Array.from(seen.values());
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCitySlugFromStudio(studio: Doc<'studios'>): string {
  return studio.address.city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function generateTeacherSlug(name: string, citySlug: string): string {
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `${nameSlug}-${citySlug}`;
}

export const getStudiosWithWebsites = internalQuery({
  args: {
    citySlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const city = await ctx.db
      .query('cities')
      .withIndex('by_slug', (q: any) => q.eq('slug', args.citySlug))
      .first();

    if (!city) {
      return [];
    }

    const studios = await ctx.db
      .query('studios')
      .withIndex('by_city', (q: any) => q.eq('address.city', city.name))
      .filter((q: any) => q.eq(q.field('isActive'), true))
      .collect();

    const withWebsites = studios.filter((s: Doc<'studios'>) => s.contact?.website);

    if (args.limit) {
      return withWebsites.slice(0, args.limit);
    }

    return withWebsites;
  },
});

export const getStudioById = internalQuery({
  args: {
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.studioId);
  },
});

export const upsertTeacher = internalMutation({
  args: {
    person: v.object({
      fullName: v.string(),
      role: v.optional(v.string()),
      bio: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
      social: v.optional(v.object({
        instagram: v.optional(v.string()),
        website: v.optional(v.string()),
        linkedin: v.optional(v.string()),
      })),
      certifications: v.optional(v.array(v.string())),
      specializations: v.optional(v.array(v.string())),
      evidence: v.object({
        sourceUrl: v.string(),
        snippet: v.string(),
      }),
      confidence: v.number(),
    }),
    citySlug: v.string(),
    cityName: v.string(),
  },
  handler: async (ctx, args) => {
    const { person, citySlug, cityName } = args;
    const slug = generateTeacherSlug(person.fullName, citySlug);

    const existing = await ctx.db
      .query('teachers')
      .withIndex('by_slug', (q: any) => q.eq('slug', slug))
      .first();

    const now = Date.now();
    const confidenceLevel = person.confidence >= 0.7 ? 'high' : person.confidence >= 0.4 ? 'medium' : 'low';
    const source = 'studio_website_scrape';

    if (existing) {
      const updates: Record<string, any> = {
        updatedAt: now,
        lastScrapedAt: now,
      };

      if (person.confidence > (existing.fullName.confidence?.value || 0)) {
        if (person.bio && !existing.bio?.value) {
          updates.bio = {
            value: person.bio,
            confidence: { value: person.confidence, level: confidenceLevel, source, observedAt: now },
          };
        }
        if (person.specializations && person.specializations.length > 0) {
          const existingSpecs = existing.specializations?.value || [];
          const mergedSpecs = [...new Set([...existingSpecs, ...person.specializations])];
          updates.specializations = {
            value: mergedSpecs,
            confidence: { value: person.confidence, level: confidenceLevel, source, observedAt: now },
          };
        }
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    const teacherId = await ctx.db.insert('teachers', {
      slug,
      fullName: {
        value: person.fullName,
        confidence: { value: person.confidence, level: confidenceLevel, source, observedAt: now },
      },
      citySlug,
      cityName: {
        value: cityName,
        confidence: { value: 1.0, level: 'high', source, observedAt: now },
      },
      bio: person.bio ? {
        value: person.bio,
        confidence: { value: person.confidence, level: confidenceLevel, source, observedAt: now },
      } : undefined,
      specializations: {
        value: person.specializations || [],
        confidence: { value: person.confidence, level: confidenceLevel, source, observedAt: now },
      },
      languages: {
        value: ['Español'],
        confidence: { value: 0.8, level: 'medium', source: 'default', observedAt: now },
      },
      certifications: [],
      status: 'scraped',
      isVerified: false,
      isActive: true,
      dataQualityScore: calculateQualityScore(person),
      scrapeSources: [person.evidence.sourceUrl],
      createdAt: now,
      updatedAt: now,
      lastScrapedAt: now,
    });

    return teacherId;
  },
});

export const createTeacherStudioLink = internalMutation({
  args: {
    teacherId: v.id('teachers'),
    studioId: v.id('studios'),
    person: v.object({
      fullName: v.string(),
      evidence: v.object({
        sourceUrl: v.string(),
        snippet: v.string(),
      }),
      confidence: v.number(),
    }),
    studio: v.any(),
  },
  handler: async (ctx, args) => {
    const { teacherId, studioId, person, studio } = args;
    const now = Date.now();

    const existing = await ctx.db
      .query('teacherStudioLinks')
      .withIndex('by_teacher_studio', (q: any) => 
        q.eq('teacherId', teacherId).eq('studioId', studioId)
      )
      .first();

    if (existing) {
      const newSignal = {
        type: 'website_staff_page',
        score: Math.round(person.confidence * 100),
        evidence: person.evidence.snippet,
        url: person.evidence.sourceUrl,
        observedAt: now,
      };

      await ctx.db.patch(existing._id, {
        signals: [...existing.signals, newSignal],
        confidence: Math.max(existing.confidence, Math.round(person.confidence * 100)),
        updatedAt: now,
      });

      return existing._id;
    }

    const teacher = await ctx.db.get(teacherId);
    const citySlug = getCitySlugFromStudio(studio);

    const linkId = await ctx.db.insert('teacherStudioLinks', {
      teacherId,
      studioId,
      status: 'inferred',
      confidence: Math.round(person.confidence * 100),
      source: 'scrape',
      signals: [{
        type: 'website_staff_page',
        score: Math.round(person.confidence * 100),
        evidence: person.evidence.snippet,
        url: person.evidence.sourceUrl,
        observedAt: now,
      }],
      teacherSlug: teacher?.slug || '',
      teacherName: person.fullName,
      studioSlug: studio.slug,
      studioName: studio.name,
      studioCity: citySlug,
      createdAt: now,
      updatedAt: now,
    });

    return linkId;
  },
});

function calculateQualityScore(person: ExtractedPerson): number {
  let score = 0;
  
  if (person.fullName) score += 30;
  if (person.bio && person.bio.length > 50) score += 20;
  if (person.role) score += 15;
  if (person.specializations && person.specializations.length > 0) score += 15;
  if (person.certifications && person.certifications.length > 0) score += 10;
  if (person.photoUrl) score += 10;

  return Math.min(100, score);
}


export const getAllTeacherLinks = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) return [];

    let q = ctx.db.query('teacherStudioLinks');

    if (args.status) {
      q = q.filter((q) => q.eq(q.field('status'), args.status));
    }

    const links = await q.collect();
    
    links.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return b.createdAt - a.createdAt;
    });

    return links.slice(0, args.limit || 100);
  }
});

export const updateTeacherLinkStatus = mutation({
  args: {
    token: v.string(),
    linkId: v.id('teacherStudioLinks'),
    status: v.union(v.literal('verified'), v.literal('rejected')),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) return { ok: false, error: 'Not authenticated' };

    await ctx.db.patch(args.linkId, {
      status: args.status,
      updatedAt: Date.now(),
      verifiedAt: args.status === 'verified' ? Date.now() : undefined,
      rejectedAt: args.status === 'rejected' ? Date.now() : undefined,
    });
    return { ok: true };
  }
});

export const getDiscoveredTeachers = query({

  args: {
    token: v.string(),
    citySlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) return [];
    const teachers = await ctx.db
      .query('teachers')
      .withIndex('by_city', (q: any) => q.eq('citySlug', args.citySlug))
      .filter((q: any) => q.eq(q.field('isActive'), true))
      .take(args.limit || 50);

    return teachers;
  },
});

export const getStudioTeachers = query({
  args: {
    token: v.string(),
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    const adminId = await getAdminUserId(ctx as any, args.token);
    if (!adminId) return [];
    const links = await ctx.db
      .query('teacherStudioLinks')
      .withIndex('by_studio', (q: any) => q.eq('studioId', args.studioId))
      .collect();

    const teachers = await Promise.all(
      links.map(async (link: Doc<'teacherStudioLinks'>) => {
        const teacher = await ctx.db.get(link.teacherId);
        return { ...link, teacher };
      })
    );

    return teachers.filter((t: { teacher: Doc<'teachers'> | null }) => t.teacher !== null);
  },
});

export const enrichTeacher = action({
  args: {
    token: v.string(),
    teacherId: v.id('teachers'),
  },
  handler: async (ctx, args): Promise<{ enriched: boolean; fieldsUpdated: string[] }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');

    const teacher = await ctx.runQuery(internal.teacherDiscovery.getTeacherById, {
      teacherId: args.teacherId,
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const fieldsUpdated: string[] = [];

    const links = await ctx.runQuery(internal.teacherDiscovery.getTeacherLinks, {
      teacherId: args.teacherId,
    });

    for (const link of links) {
      if (!link.signals || link.signals.length === 0) continue;
      
      for (const signal of link.signals) {
        if (signal.url) {
          try {
            const enrichedData = await fetchEnrichmentFromUrl(signal.url, teacher.fullName.value);
            if (enrichedData) {
              await ctx.runMutation(internal.teacherDiscovery.applyEnrichment, {
                teacherId: args.teacherId,
                enrichedData,
              });
              fieldsUpdated.push(...Object.keys(enrichedData));
            }
          } catch (error) {
            console.error(`Error enriching from ${signal.url}:`, error);
          }
        }
      }
    }

    return { enriched: fieldsUpdated.length > 0, fieldsUpdated: [...new Set(fieldsUpdated)] };
  },
});

async function fetchEnrichmentFromUrl(
  url: string,
  teacherName: string
): Promise<Record<string, any> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CamaPilatesBot/1.0 (+https://camadepilates.com/bot)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const content = cleanHtmlForExtraction(html);
    
    const nameLower = teacherName.toLowerCase();
    const nameIndex = content.toLowerCase().indexOf(nameLower);
    
    if (nameIndex === -1) return null;

    const contextWindow = content.slice(
      Math.max(0, nameIndex - 50),
      Math.min(content.length, nameIndex + 1000)
    );

    const enrichedData: Record<string, any> = {};

    const certPatterns = [
      /BASI/gi, /Stott/gi, /Polestar/gi, /Balanced Body/gi,
      /APPI/gi, /Romana/gi, /Fletcher/gi, /Peak Pilates/gi,
    ];

    const foundCerts: string[] = [];
    for (const pattern of certPatterns) {
      if (pattern.test(contextWindow)) {
        foundCerts.push(pattern.source.replace(/\\|\/gi/g, ''));
      }
    }
    
    if (foundCerts.length > 0) {
      enrichedData.certifications = foundCerts;
    }

    const experienceMatch = contextWindow.match(/(\d+)\s*(?:años?|years?)\s*(?:de\s*)?(?:experiencia|experience)/i);
    if (experienceMatch) {
      enrichedData.experienceYears = parseInt(experienceMatch[1], 10);
    }

    return Object.keys(enrichedData).length > 0 ? enrichedData : null;
  } catch {
    return null;
  }
}

export const validateAndPublishTeachers = action({
  args: {
    token: v.string(),
    citySlug: v.string(),
    minQualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    total: number;
    tier1: number;
    tier2: number;
    tier3: number;
  }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');
    const minScore = args.minQualityScore || 40;
    
    const teachers = await ctx.runQuery(internal.teacherDiscovery.getTeachersForValidation, {
      citySlug: args.citySlug,
    });

    const results = { total: teachers.length, tier1: 0, tier2: 0, tier3: 0 };

    for (const teacher of teachers) {
      const qualityScore = computeFullQualityScore(teacher);
      let tier: 'tier1' | 'tier2' | 'tier3';

      if (qualityScore >= 70 && teacher.isVerified) {
        tier = 'tier1';
        results.tier1++;
      } else if (qualityScore >= minScore) {
        tier = 'tier2';
        results.tier2++;
      } else {
        tier = 'tier3';
        results.tier3++;
      }

      await ctx.runMutation(internal.teacherDiscovery.updateTeacherTier, {
        teacherId: teacher._id,
        qualityScore,
        tier,
      });
    }

    return results;
  },
});

function computeFullQualityScore(teacher: Doc<'teachers'>): number {
  let score = 0;
  
  if (teacher.fullName?.value) score += 20;
  if (teacher.bio?.value && teacher.bio.value.length > 100) score += 15;
  if (teacher.bio?.value && teacher.bio.value.length > 300) score += 5;
  if (teacher.specializations?.value?.length > 0) score += 10;
  if (teacher.specializations?.value?.length >= 3) score += 5;
  if (teacher.certifications?.length > 0) score += 15;
  if (teacher.experienceYears?.value) score += 10;
  if (teacher.profilePhoto?.value) score += 10;
  if (teacher.social?.instagram?.value) score += 5;
  if (teacher.social?.website?.value) score += 5;

  return Math.min(100, score);
}

export const getTeacherById = internalQuery({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx, args) => ctx.db.get(args.teacherId),
});

export const getTeacherLinks = internalQuery({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('teacherStudioLinks')
      .withIndex('by_teacher', (q: any) => q.eq('teacherId', args.teacherId))
      .collect();
  },
});

export const applyEnrichment = internalMutation({
  args: {
    teacherId: v.id('teachers'),
    enrichedData: v.any(),
  },
  handler: async (ctx, args) => {
    const { teacherId, enrichedData } = args;
    const now = Date.now();
    const updates: Record<string, any> = { updatedAt: now };

    if (enrichedData.certifications) {
      const teacher = await ctx.db.get(teacherId);
      const existingCerts = teacher?.certifications || [];
      const existingKeys = new Set(existingCerts.map((c: { key: string }) => c.key));
      
      for (const certName of enrichedData.certifications) {
        const key = certName.toLowerCase().replace(/\s+/g, '_');
        if (!existingKeys.has(key)) {
          existingCerts.push({
            key,
            name: certName,
            isVerified: false,
          });
        }
      }
      updates.certifications = existingCerts;
    }

    if (enrichedData.experienceYears && enrichedData.experienceYears > 0) {
      updates.experienceYears = {
        value: enrichedData.experienceYears,
        confidence: { value: 0.6, level: 'medium', source: 'enrichment', observedAt: now },
      };
    }

    await ctx.db.patch(teacherId, updates);
  },
});

export const getTeachersForValidation = internalQuery({
  args: { citySlug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('teachers')
      .withIndex('by_city', (q: any) => q.eq('citySlug', args.citySlug))
      .collect();
  },
});

export const updateTeacherTier = internalMutation({
  args: {
    teacherId: v.id('teachers'),
    qualityScore: v.number(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    const isActive = args.tier !== 'tier3';
    await ctx.db.patch(args.teacherId, {
      dataQualityScore: args.qualityScore,
      isActive,
      updatedAt: Date.now(),
    });
  },
});

const LLM_EXTRACTION_SCHEMA = `{
  "people": [
    {
      "fullName": "Full name of the instructor",
      "role": "Their role (e.g., Instructor, Director, Coach)",
      "bio": "Brief biography or description",
      "certifications": ["BASI", "Stott", "Polestar", etc.],
      "specializations": ["Reformer", "Mat", "Prenatal", etc.],
      "social": {
        "instagram": "@handle or null",
        "website": "personal website or null"
      },
      "photoUrl": "URL to their photo or null",
      "confidence": 0.0-1.0
    }
  ],
  "pageConfidence": 0.0-1.0
}`;

export const extractWithLLM = internalAction({
  args: {
    pageUrl: v.string(),
    studioName: v.string(),
    studioCity: v.string(),
  },
  handler: async (_ctx, args): Promise<ExtractionResult> => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    
    if (!OPENAI_API_KEY) {
      console.log('No OpenAI key, falling back to regex extraction');
      return { people: [], pageConfidence: 0, pageUrl: args.pageUrl };
    }

    try {
      const response = await fetch(args.pageUrl, {
        headers: {
          'User-Agent': 'CamaPilatesBot/1.0 (+https://camadepilates.com/bot)',
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        return { people: [], pageConfidence: 0, pageUrl: args.pageUrl };
      }

      const html = await response.text();
      const cleanedContent = cleanHtmlForExtraction(html);
      
      if (cleanedContent.length < 100) {
        return { people: [], pageConfidence: 0.1, pageUrl: args.pageUrl };
      }

      const truncatedContent = cleanedContent.slice(0, 8000);

      const systemPrompt = `You are an expert at extracting structured data about Pilates instructors from web pages.
Extract ONLY instructors/teachers (people who teach classes). Do NOT include:
- Reception/admin staff
- Testimonials/reviews
- Blog authors
- Anyone without an instructor/teacher role

Return valid JSON matching this schema:
${LLM_EXTRACTION_SCHEMA}

Important:
- Set confidence based on how certain you are (0.9+ for clear instructor bios, 0.5-0.7 for ambiguous)
- pageConfidence should reflect if this looks like a team/staff page
- Only include people who appear to be instructors
- Normalize certifications to standard names: BASI, Stott, Polestar, Balanced Body, APPI, Peak Pilates
- Common specializations: Reformer, Mat, Cadillac, Chair, Barrel, Prenatal, Postnatal, Rehabilitación, Barre`;

      const userPrompt = `Extract Pilates instructors from this page.
Studio: ${args.studioName} (${args.studioCity})
URL: ${args.pageUrl}

Page content:
${truncatedContent}

Return JSON only, no markdown formatting.`;

      const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!llmResponse.ok) {
        console.error(`OpenAI API error: ${llmResponse.status}`);
        return { people: [], pageConfidence: 0, pageUrl: args.pageUrl };
      }

      const llmData = await llmResponse.json();
      const content = llmData.choices?.[0]?.message?.content;
      
      if (!content) {
        return { people: [], pageConfidence: 0, pageUrl: args.pageUrl };
      }

      const parsed = JSON.parse(content);
      
      const people: ExtractedPerson[] = (parsed.people || []).map((p: any) => ({
        fullName: String(p.fullName || '').trim(),
        role: p.role || undefined,
        bio: p.bio || undefined,
        photoUrl: p.photoUrl || undefined,
        social: p.social || undefined,
        certifications: Array.isArray(p.certifications) ? p.certifications : undefined,
        specializations: Array.isArray(p.specializations) ? p.specializations : undefined,
        evidence: {
          sourceUrl: args.pageUrl,
          snippet: `Extracted via LLM from ${args.studioName}`,
        },
        confidence: typeof p.confidence === 'number' ? p.confidence : 0.7,
      })).filter((p: ExtractedPerson) => p.fullName.length > 2);

      return {
        people,
        pageConfidence: typeof parsed.pageConfidence === 'number' ? parsed.pageConfidence : 0.5,
        pageUrl: args.pageUrl,
      };
    } catch (error) {
      console.error(`LLM extraction error for ${args.pageUrl}:`, error);
      return { people: [], pageConfidence: 0, pageUrl: args.pageUrl };
    }
  },
});

export const discoverTeachersWithLLM = action({
  args: {
    token: v.string(),
    citySlug: v.string(),
    limit: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    total: number;
    processed: number;
    teachersFound: number;
    linksCreated: number;
    errors: Array<{ studioSlug: string; error: string }>;
    duration: number;
  }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');

    console.log(`Starting LLM-powered teacher discovery for city: ${args.citySlug}`);

    const studios = await ctx.runQuery(internal.teacherDiscovery.getStudiosWithWebsites, {
      citySlug: args.citySlug,
      limit: args.limit,
    });

    console.log(`Found ${studios.length} studios with websites`);

    const results = {
      total: studios.length,
      processed: 0,
      teachersFound: 0,
      linksCreated: 0,
      errors: [] as Array<{ studioSlug: string; error: string }>,
      startTime: Date.now(),
    };

    for (const studio of studios) {
      try {
        const websiteUrl = studio.contact?.website;
        if (!websiteUrl) continue;

        console.log(`Processing: ${studio.name}`);

        const teamPages = await findTeamPages(websiteUrl);
        
        if (teamPages.length === 0) {
          results.processed++;
          continue;
        }

        const allPeople: ExtractedPerson[] = [];

        for (const page of teamPages.slice(0, 3)) {
          const extractionResult = await ctx.runAction(internal.teacherDiscovery.extractWithLLM, {
            pageUrl: page.url,
            studioName: studio.name,
            studioCity: studio.address.city,
          });

          if (extractionResult.pageConfidence > 0.3) {
            allPeople.push(...extractionResult.people);
          }
        }

        const uniquePeople = deduplicatePeople(allPeople);
        results.teachersFound += uniquePeople.length;

        if (!args.dryRun) {
          for (const person of uniquePeople) {
            try {
              const teacherId = await ctx.runMutation(internal.teacherDiscovery.upsertTeacher, {
                person,
                citySlug: getCitySlugFromStudio(studio),
                cityName: studio.address.city,
              });

              await ctx.runMutation(internal.teacherDiscovery.createTeacherStudioLink, {
                teacherId,
                studioId: studio._id,
                person,
                studio,
              });

              results.linksCreated++;
            } catch (error) {
              console.error(`Error saving teacher ${person.fullName}:`, error);
            }
          }
        }

        results.processed++;

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${studio.slug}:`, errorMessage);
        results.errors.push({ studioSlug: studio.slug, error: errorMessage });
      }
    }

    return {
      ...results,
      duration: Date.now() - results.startTime,
    };
  },
});

export const scrapeInstructorDetailPage = action({
  args: {
    token: v.string(),
    teacherId: v.id('teachers'),
    detailUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; fieldsUpdated: string[] }> => {
    const sess = await ctx.runQuery(api.admin.session as any, { token: args.token } as any);
    if (!sess?.authenticated) throw new Error('Not authenticated');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    
    if (!OPENAI_API_KEY) {
      return { success: false, fieldsUpdated: [] };
    }

    const teacher = await ctx.runQuery(internal.teacherDiscovery.getTeacherById, {
      teacherId: args.teacherId,
    });

    if (!teacher) {
      return { success: false, fieldsUpdated: [] };
    }

    try {
      const response = await fetch(args.detailUrl, {
        headers: {
          'User-Agent': 'CamaPilatesBot/1.0 (+https://camadepilates.com/bot)',
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        return { success: false, fieldsUpdated: [] };
      }

      const html = await response.text();
      const cleanedContent = cleanHtmlForExtraction(html).slice(0, 6000);

      const systemPrompt = `Extract detailed instructor information. Return JSON:
{
  "bio": "Extended biography (2-4 paragraphs if available)",
  "certifications": ["Certification names"],
  "specializations": ["Specialization areas"],
  "experienceYears": number or null,
  "languages": ["Languages they teach in"],
  "social": {
    "instagram": "@handle or null",
    "website": "URL or null",
    "linkedin": "URL or null"
  }
}`;

      const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract details for instructor "${teacher.fullName.value}" from:\n\n${cleanedContent}` },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!llmResponse.ok) {
        return { success: false, fieldsUpdated: [] };
      }

      const llmData = await llmResponse.json();
      const content = llmData.choices?.[0]?.message?.content;
      
      if (!content) {
        return { success: false, fieldsUpdated: [] };
      }

      const parsed = JSON.parse(content);
      const fieldsUpdated: string[] = [];

      await ctx.runMutation(internal.teacherDiscovery.applyDetailEnrichment, {
        teacherId: args.teacherId,
        detailData: parsed,
        sourceUrl: args.detailUrl,
      });

      if (parsed.bio) fieldsUpdated.push('bio');
      if (parsed.certifications?.length) fieldsUpdated.push('certifications');
      if (parsed.specializations?.length) fieldsUpdated.push('specializations');
      if (parsed.experienceYears) fieldsUpdated.push('experienceYears');
      if (parsed.languages?.length) fieldsUpdated.push('languages');
      if (parsed.social) fieldsUpdated.push('social');

      return { success: true, fieldsUpdated };
    } catch (error) {
      console.error(`Error scraping detail page ${args.detailUrl}:`, error);
      return { success: false, fieldsUpdated: [] };
    }
  },
});

export const applyDetailEnrichment = internalMutation({
  args: {
    teacherId: v.id('teachers'),
    detailData: v.any(),
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { teacherId, detailData, sourceUrl } = args;
    const now = Date.now();
    const source = 'instructor_detail_page';
    
    const teacher = await ctx.db.get(teacherId);
    if (!teacher) return;

    const updates: Record<string, any> = { 
      updatedAt: now,
      scrapeSources: [...(teacher.scrapeSources || []), sourceUrl],
    };

    if (detailData.bio && (!teacher.bio?.value || detailData.bio.length > teacher.bio.value.length)) {
      updates.bio = {
        value: detailData.bio,
        confidence: { value: 0.85, level: 'high', source, observedAt: now },
      };
    }

    if (detailData.certifications?.length) {
      const existingCerts = teacher.certifications || [];
      const existingKeys = new Set(existingCerts.map((c: { key: string }) => c.key));
      
      for (const certName of detailData.certifications) {
        const key = certName.toLowerCase().replace(/\s+/g, '_');
        if (!existingKeys.has(key)) {
          existingCerts.push({
            key,
            name: certName,
            isVerified: false,
          });
        }
      }
      updates.certifications = existingCerts;
    }

    if (detailData.specializations?.length) {
      const existingSpecs = teacher.specializations?.value || [];
      const mergedSpecs = [...new Set([...existingSpecs, ...detailData.specializations])];
      updates.specializations = {
        value: mergedSpecs,
        confidence: { value: 0.8, level: 'high', source, observedAt: now },
      };
    }

    if (detailData.experienceYears && detailData.experienceYears > 0) {
      updates.experienceYears = {
        value: detailData.experienceYears,
        confidence: { value: 0.75, level: 'medium', source, observedAt: now },
      };
    }

    if (detailData.languages?.length) {
      updates.languages = {
        value: detailData.languages,
        confidence: { value: 0.8, level: 'high', source, observedAt: now },
      };
    }

    if (detailData.social) {
      const existingSocial = teacher.social || {};
      if (detailData.social.instagram && !existingSocial.instagram?.value) {
        existingSocial.instagram = {
          value: detailData.social.instagram,
          confidence: { value: 0.85, level: 'high', source, observedAt: now },
        };
      }
      if (detailData.social.website && !existingSocial.website?.value) {
        existingSocial.website = {
          value: detailData.social.website,
          confidence: { value: 0.85, level: 'high', source, observedAt: now },
        };
      }
      if (detailData.social.linkedin && !existingSocial.linkedin?.value) {
        existingSocial.linkedin = {
          value: detailData.social.linkedin,
          confidence: { value: 0.85, level: 'high', source, observedAt: now },
        };
      }
      updates.social = existingSocial;
    }

    await ctx.db.patch(teacherId, updates);
  },
});
