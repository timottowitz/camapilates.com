import { v } from 'convex/values';
import { internalAction, internalMutation, query, mutation } from './_generated/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

function normalizeInstagramUsername(input: string | undefined | null): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Accept @handle, handle, or https://instagram.com/handle
  const withoutAt = raw.replace(/^@/, '');
  const urlMatch = withoutAt.match(/instagram\.com\/([^/?#]+)/i);
  const candidate = (urlMatch?.[1] || withoutAt)
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();

  // Instagram usernames: 1-30 chars, letters/numbers/._ only
  if (!/^[a-z0-9._]{1,30}$/.test(candidate)) return null;
  return candidate;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

function extractMetaContent(html: string, property: string): string | undefined {
  // Matches: <meta property="og:title" content="...">
  // Also supports single quotes in attributes.
  const re = new RegExp(
    `<meta[^>]+property=['"]${property}['"][^>]+content=['"]([^'"]+)['"][^>]*>`,
    'i'
  );
  const m = html.match(re);
  // Decode HTML entities in the extracted content
  return m?.[1] ? decodeHtmlEntities(m[1]) : undefined;
}

function parseAbbrevNumber(raw: string): number | undefined {
  const s = raw.trim();
  if (!s) return undefined;

  const m = s.match(/^([\d.,]+)\s*([kKmMbB])?$/);
  if (!m) return undefined;

  let numPart = m[1];
  const suffix = m[2]?.toLowerCase();

  // Heuristic: if there is a comma but no dot, treat comma as decimal separator (e.g., "1,2K").
  if (numPart.includes(',') && !numPart.includes('.')) {
    numPart = numPart.replace(',', '.');
  }

  // Remove thousands separators.
  numPart = numPart.replace(/,/g, '');

  const base = Number.parseFloat(numPart);
  if (!Number.isFinite(base)) return undefined;

  const mult =
    suffix === 'k' ? 1_000 : suffix === 'm' ? 1_000_000 : suffix === 'b' ? 1_000_000_000 : 1;

  return Math.round(base * mult);
}

function parseCountsFromDescription(desc: string | undefined): {
  followers?: number;
  following?: number;
  posts?: number;
} {
  if (!desc) return {};
  const text = desc.replace(/\s+/g, ' ').trim();

  const followersMatch =
    text.match(/([\d.,]+)\s*([kKmMbB])?\s*(followers|seguidores)\b/i) ??
    text.match(/\b(followers|seguidores)\s*[:\-]?\s*([\d.,]+)\s*([kKmMbB])?\b/i);

  const followingMatch =
    text.match(/([\d.,]+)\s*([kKmMbB])?\s*(following|seguidos)\b/i) ??
    text.match(/\b(following|seguidos)\s*[:\-]?\s*([\d.,]+)\s*([kKmMbB])?\b/i);

  const postsMatch =
    text.match(/([\d.,]+)\s*([kKmMbB])?\s*(posts|publicaciones)\b/i) ??
    text.match(/\b(posts|publicaciones)\s*[:\-]?\s*([\d.,]+)\s*([kKmMbB])?\b/i);

  const followers =
    followersMatch?.[2] && /^[\d.,]+$/.test(followersMatch[2])
      ? parseAbbrevNumber(`${followersMatch[2]}${followersMatch[3] ?? ''}`)
      : parseAbbrevNumber(`${followersMatch?.[1] ?? ''}${followersMatch?.[2] ?? ''}`);

  const following =
    parseAbbrevNumber(`${followingMatch?.[1] ?? ''}${followingMatch?.[2] ?? ''}`) ??
    (followingMatch?.[2] && /^[\d.,]+$/.test(followingMatch[2])
      ? parseAbbrevNumber(`${followingMatch[2]}${followingMatch[3] ?? ''}`)
      : undefined);

  const posts =
    parseAbbrevNumber(`${postsMatch?.[1] ?? ''}${postsMatch?.[2] ?? ''}`) ??
    (postsMatch?.[2] && /^[\d.,]+$/.test(postsMatch[2])
      ? parseAbbrevNumber(`${postsMatch[2]}${postsMatch[3] ?? ''}`)
      : undefined);

  return {
    followers: followers ?? undefined,
    following: following ?? undefined,
    posts: posts ?? undefined,
  };
}

function extractRecentPostUrlsFromHtml(username: string, html: string, max = 3): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /"shortcode":"([^"]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    const shortcode = m[1];
    if (!shortcode || seen.has(shortcode)) continue;
    seen.add(shortcode);
    out.push(`https://www.instagram.com/p/${shortcode}/`);
    if (out.length >= max) break;
  }

  // Some profiles have no timeline media available without login.
  return out;
}

async function fetchInstagramProfileHtml(username: string): Promise<string> {
  const profileUrl = `https://www.instagram.com/${username}/`;

  // Check for proxy service configuration
  const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY;
  const scraperApiKey = process.env.SCRAPERAPI_KEY;

  let fetchUrl = profileUrl;
  let headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // Use ScrapingBee if configured (preferred)
  if (scrapingBeeKey) {
    fetchUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeKey}&url=${encodeURIComponent(profileUrl)}&render_js=false&premium_proxy=true&country_code=us`;
    headers = {}; // ScrapingBee handles headers
  }
  // Use ScraperAPI if configured
  else if (scraperApiKey) {
    fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(profileUrl)}&render=false`;
    headers = {}; // ScraperAPI handles headers
  }

  const res = await fetch(fetchUrl, {
    redirect: 'follow',
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const proxyUsed = scrapingBeeKey ? 'ScrapingBee' : scraperApiKey ? 'ScraperAPI' : 'direct';
    throw new Error(`Instagram fetch failed (${res.status}) via ${proxyUsed}: ${text.slice(0, 200)}`);
  }
  return await res.text();
}

async function fetchAndStoreProfileImage(ctx: any, imageUrl: string): Promise<Id<'_storage'> | null> {
  // Instagram CDN images often work with direct fetch (less restricted than profile pages)
  // Try direct fetch first, then fall back to alternatives
  const headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    referer: 'https://www.instagram.com/',
  };

  try {
    const res = await fetch(imageUrl, {
      redirect: 'follow',
      headers,
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      // Verify it's actually an image
      if (!contentType.startsWith('image/')) {
        console.log(`[Instagram] Image fetch returned non-image content-type: ${contentType}`);
        return null;
      }

      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) return null;

      // Cap to ~2MB to avoid storing huge assets accidentally.
      if (buf.byteLength > 2 * 1024 * 1024) return null;

      const blob = new Blob([buf], { type: contentType });
      return await ctx.storage.store(blob);
    }

    console.log(`[Instagram] Direct image fetch failed with status ${res.status}`);
  } catch (err: any) {
    console.log(`[Instagram] Direct image fetch error: ${err?.message || err}`);
  }

  return null;
}

async function getPreviewByUsernameInternal(ctx: any, username: string) {
  const row = await ctx.db
    .query('instagramProfiles')
    .withIndex('by_username', (q: any) => q.eq('username', username))
    .first();

  if (!row) return null;

  const profileImageUrl = row.profileImageStorageId
    ? await ctx.storage.getUrl(row.profileImageStorageId)
    : null;

  return {
    status: row.status,
    username: row.username,
    profileUrl: row.profileUrl,
    displayName: row.displayName,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    profileImageUrl,
    followers: row.followers,
    following: row.following,
    posts: row.posts,
    recentPostUrls: row.recentPostUrls ?? [],
    updatedAt: row.updatedAt,
  };
}

export const getPreviewForTeacher = query({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.isActive) return null;

    const username = normalizeInstagramUsername(teacher.social?.instagram?.value);
    if (!username) return null;

    return await getPreviewByUsernameInternal(ctx, username);
  },
});

export const getPreviewByInstagram = query({
  args: { instagram: v.string() },
  handler: async (ctx, args) => {
    const username = normalizeInstagramUsername(args.instagram);
    if (!username) return null;
    return await getPreviewByUsernameInternal(ctx, username);
  },
});

export const ensurePreviewForTeacher = mutation({
  args: { teacherId: v.id('teachers') },
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.isActive) return { ok: false as const, reason: 'Teacher not found' };

    const username = normalizeInstagramUsername(teacher.social?.instagram?.value);
    if (!username) return { ok: false as const, reason: 'No Instagram username' };

    const now = Date.now();
    const row = await ctx.db
      .query('instagramProfiles')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    if (row && row.nextFetchAfter > now) {
      return { ok: true as const, scheduled: false as const };
    }

    // Debounce refresh attempts even if previous fetch errored.
    const nextFetchAfter = now + 12 * 60 * 60 * 1000; // 12h

    if (row) {
      await ctx.db.patch(row._id, {
        nextFetchAfter,
        updatedAt: now,
        // If we were previously in error, flip to pending so the UI can show a loading state.
        status: row.status === 'error' ? 'pending' : row.status,
        error: row.status === 'error' ? undefined : row.error,
      });
    } else {
      await ctx.db.insert('instagramProfiles', {
        username,
        profileUrl: `https://instagram.com/${username}`,
        status: 'pending',
        fetchedAt: 0,
        nextFetchAfter,
        updatedAt: now,
      });
    }

    await ctx.scheduler.runAfter(0, internal.instagram.refreshProfilePreview, { username });
    return { ok: true as const, scheduled: true as const };
  },
});

export const ensurePreviewByInstagram = mutation({
  args: { instagram: v.string() },
  handler: async (ctx, args) => {
    const username = normalizeInstagramUsername(args.instagram);
    if (!username) return { ok: false as const, reason: 'No Instagram username' };

    const now = Date.now();
    const row = await ctx.db
      .query('instagramProfiles')
      .withIndex('by_username', (q: any) => q.eq('username', username))
      .first();

    if (row && row.nextFetchAfter > now) {
      return { ok: true as const, scheduled: false as const };
    }

    const nextFetchAfter = now + 12 * 60 * 60 * 1000; // 12h

    if (row) {
      await ctx.db.patch(row._id, {
        nextFetchAfter,
        updatedAt: now,
        status: row.status === 'error' ? 'pending' : row.status,
        error: row.status === 'error' ? undefined : row.error,
      });
    } else {
      await ctx.db.insert('instagramProfiles', {
        username,
        profileUrl: `https://instagram.com/${username}`,
        status: 'pending',
        fetchedAt: 0,
        nextFetchAfter,
        updatedAt: now,
      });
    }

    await ctx.scheduler.runAfter(0, internal.instagram.refreshProfilePreview, { username });
    return { ok: true as const, scheduled: true as const };
  },
});

export const upsertProfilePreviewInternal = internalMutation({
  args: {
    username: v.string(),
    profileUrl: v.string(),
    displayName: v.optional(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    profileImageStorageId: v.optional(v.id('_storage')),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
    posts: v.optional(v.number()),
    recentPostUrls: v.optional(v.array(v.string())),
    status: v.string(),
    error: v.optional(v.string()),
    fetchedAt: v.number(),
    nextFetchAfter: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('instagramProfiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    const now = Date.now();

    if (existing) {
      // Cleanup old image if replaced.
      if (
        existing.profileImageStorageId &&
        'profileImageStorageId' in args &&
        args.profileImageStorageId &&
        existing.profileImageStorageId !== args.profileImageStorageId
      ) {
        try {
          await ctx.storage.delete(existing.profileImageStorageId);
        } catch {
          // ignore
        }
      }

      const patch: Record<string, any> = {
        profileUrl: args.profileUrl,
        status: args.status,
        error: args.error,
        fetchedAt: args.fetchedAt,
        nextFetchAfter: args.nextFetchAfter,
        updatedAt: now,
      };

      if ('displayName' in args) patch.displayName = args.displayName;
      if ('ogTitle' in args) patch.ogTitle = args.ogTitle;
      if ('ogDescription' in args) patch.ogDescription = args.ogDescription;
      if ('followers' in args) patch.followers = args.followers;
      if ('following' in args) patch.following = args.following;
      if ('posts' in args) patch.posts = args.posts;
      if ('recentPostUrls' in args) patch.recentPostUrls = args.recentPostUrls;
      if ('profileImageStorageId' in args) {
        patch.profileImageStorageId = args.profileImageStorageId ?? existing.profileImageStorageId;
      }

      await ctx.db.patch(existing._id, patch);

      return existing._id;
    }

    const insert: Record<string, any> = {
      username: args.username,
      profileUrl: args.profileUrl,
      status: args.status,
      error: args.error,
      fetchedAt: args.fetchedAt,
      nextFetchAfter: args.nextFetchAfter,
      updatedAt: now,
    };

    if ('displayName' in args) insert.displayName = args.displayName;
    if ('ogTitle' in args) insert.ogTitle = args.ogTitle;
    if ('ogDescription' in args) insert.ogDescription = args.ogDescription;
    if ('profileImageStorageId' in args) insert.profileImageStorageId = args.profileImageStorageId;
    if ('followers' in args) insert.followers = args.followers;
    if ('following' in args) insert.following = args.following;
    if ('posts' in args) insert.posts = args.posts;
    if ('recentPostUrls' in args) insert.recentPostUrls = args.recentPostUrls;

    return await ctx.db.insert('instagramProfiles', insert);
  },
});

export const refreshProfilePreview = internalAction({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const username = normalizeInstagramUsername(args.username);
    if (!username) return;

    const now = Date.now();
    const profileUrl = `https://instagram.com/${username}`;
    const nextFetchAfter = now + 12 * 60 * 60 * 1000; // 12h

    try {
      const html = await fetchInstagramProfileHtml(username);

      const ogTitle = extractMetaContent(html, 'og:title');
      const ogDescription = extractMetaContent(html, 'og:description');
      const ogImage = extractMetaContent(html, 'og:image');

      const displayName = (() => {
        if (!ogTitle) return undefined;
        const before = ogTitle.split('(@')[0]?.trim();
        return before || undefined;
      })();

      const counts = parseCountsFromDescription(ogDescription);
      const recentPostUrls = extractRecentPostUrlsFromHtml(username, html, 3);

      let profileImageStorageId: Id<'_storage'> | undefined;
      if (ogImage) {
        const stored = await fetchAndStoreProfileImage(ctx as any, ogImage);
        if (stored) profileImageStorageId = stored;
      }

      const payload: Record<string, any> = {
        username,
        profileUrl,
        status: 'ok',
        error: undefined,
        fetchedAt: now,
        nextFetchAfter,
      };

      // Only overwrite cached fields when we actually extracted something useful.
      if (displayName) payload.displayName = displayName;
      if (ogTitle) payload.ogTitle = ogTitle;
      if (ogDescription) payload.ogDescription = ogDescription;
      if (profileImageStorageId) payload.profileImageStorageId = profileImageStorageId;
      if (typeof counts.followers === 'number') payload.followers = counts.followers;
      if (typeof counts.following === 'number') payload.following = counts.following;
      if (typeof counts.posts === 'number') payload.posts = counts.posts;
      if (recentPostUrls.length > 0) payload.recentPostUrls = recentPostUrls;

      await ctx.runMutation(internal.instagram.upsertProfilePreviewInternal, payload);
    } catch (err: any) {
      await ctx.runMutation(internal.instagram.upsertProfilePreviewInternal, {
        username,
        profileUrl,
        status: 'error',
        error: String(err?.message || err),
        fetchedAt: now,
        // Backoff longer on errors to reduce hammering.
        nextFetchAfter: now + 24 * 60 * 60 * 1000,
      });
    }
  },
});

// Admin mutation to retry all failed Instagram profile fetches
export const retryAllFailed = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Simple admin token check
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || args.token !== adminToken) {
      throw new Error('Unauthorized');
    }

    const failedProfiles = await ctx.db
      .query('instagramProfiles')
      .filter((q) => q.eq(q.field('status'), 'error'))
      .collect();

    const now = Date.now();
    let scheduled = 0;

    for (const profile of failedProfiles) {
      // Reset the profile to pending and schedule a refresh
      await ctx.db.patch(profile._id, {
        status: 'pending',
        error: undefined,
        nextFetchAfter: now + 5 * 60 * 1000, // 5 min from now
        updatedAt: now,
      });

      // Stagger refreshes to avoid hammering
      await ctx.scheduler.runAfter(scheduled * 2000, internal.instagram.refreshProfilePreview, {
        username: profile.username,
      });
      scheduled++;
    }

    return { retriedCount: scheduled };
  },
});

// Query to get Instagram proxy status (for admin diagnostics)
export const getProxyStatus = query({
  args: {},
  handler: async () => {
    const hasScrapingBee = Boolean(process.env.SCRAPINGBEE_API_KEY);
    const hasScraperApi = Boolean(process.env.SCRAPERAPI_KEY);
    return {
      proxyConfigured: hasScrapingBee || hasScraperApi,
      provider: hasScrapingBee ? 'ScrapingBee' : hasScraperApi ? 'ScraperAPI' : 'none',
    };
  },
});

// Query to list all Instagram profiles with their status
export const listProfiles = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query('instagramProfiles')
      .order('desc')
      .take(100);

    return profiles.map((p) => ({
      username: p.username,
      status: p.status,
      error: p.error,
      hasImage: Boolean(p.profileImageStorageId),
      followers: p.followers,
      updatedAt: p.updatedAt,
    }));
  },
});

// Force refresh a profile (bypasses backoff period)
export const forceRefresh = mutation({
  args: { instagram: v.string() },
  handler: async (ctx, args) => {
    const username = normalizeInstagramUsername(args.instagram);
    if (!username) return { ok: false as const, reason: 'Invalid username' };

    const now = Date.now();
    const row = await ctx.db
      .query('instagramProfiles')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    if (row) {
      // Reset backoff and mark as pending
      await ctx.db.patch(row._id, {
        status: 'pending',
        error: undefined,
        nextFetchAfter: now + 12 * 60 * 60 * 1000,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('instagramProfiles', {
        username,
        profileUrl: `https://instagram.com/${username}`,
        status: 'pending',
        fetchedAt: 0,
        nextFetchAfter: now + 12 * 60 * 60 * 1000,
        updatedAt: now,
      });
    }

    // Schedule immediate refresh
    await ctx.scheduler.runAfter(0, internal.instagram.refreshProfilePreview, { username });
    return { ok: true as const, username };
  },
});
