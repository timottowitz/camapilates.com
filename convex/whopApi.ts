import { v } from 'convex/values';
import { action } from './_generated/server';

const WHOP_API_BASE = 'https://api.whop.com';
const FORUM_EXP_ID = 'exp_CY1aVHXdSlxCCb';
const PRODUCT_ID = 'prod_Iv5ZnKkugonCn';

function getApiKey(): string {
  return (
    process.env.WHOP_API_KEY ||
    'apik_rKu6KhWJYxtaz_C6408634_C_37dee9ea7ba242beb2f2a311ae8b3ba48bc5664de188fd7710ef5085f9e8a4'
  );
}

// Clean names and sanitize content
function sanitizeContent(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/Laura Munif/gi, 'Laura Munive')
    .replace(/Laura Monive/gi, 'Laura Munive');
}

/**
 * Fetch forum threads from Whop official forum experience
 */
export const getForumThreads = action({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const url = `${WHOP_API_BASE}/api/v1/forum_posts?experience_id=${FORUM_EXP_ID}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Whop API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const rawPosts: any[] = json.data || [];

      // Filter and format threads (only parent posts, not replies)
      const threads = rawPosts
        .filter((post) => !post.parent_id)
        .map((post) => ({
          id: post.id,
          title: sanitizeContent(post.title || 'Consulta de Comunidad'),
          content: sanitizeContent(post.content || ''),
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          authorName: post.user?.name || post.user?.username || 'CAMA Pilates Formación',
          authorUsername: post.user?.username || 'camapilates',
          isPinned: !!post.is_pinned,
          isPosterAdmin: !!post.is_poster_admin,
          likeCount: post.like_count || 0,
          commentCount: post.comment_count || 0,
          viewCount: post.view_count || 1,
          whopUrl: `https://whop.com/joined/${FORUM_EXP_ID}`,
        }));

      // Sort: pinned first, then newest
      threads.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        success: true,
        experienceId: FORUM_EXP_ID,
        threads: args.limit ? threads.slice(0, args.limit) : threads,
        total: threads.length,
      };
    } catch (error: any) {
      console.error('Failed to fetch Whop forum threads:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        threads: [],
        total: 0,
      };
    }
  },
});

/**
 * Fetch comments for a specific forum thread
 */
export const getThreadComments = action({
  args: {
    threadId: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const url = `${WHOP_API_BASE}/api/v1/forum_posts?experience_id=${FORUM_EXP_ID}&parent_id=${encodeURIComponent(args.threadId)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Whop API error: ${response.status}`);
      }

      const json = await response.json();
      const rawReplies: any[] = json.data || [];

      const comments = rawReplies.map((c) => ({
        id: c.id,
        content: sanitizeContent(c.content || ''),
        createdAt: c.created_at,
        authorName: c.user?.name || c.user?.username || 'Alumna',
        authorUsername: c.user?.username || 'alumna',
        isPosterAdmin: !!c.is_poster_admin,
      }));

      comments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return {
        success: true,
        comments,
      };
    } catch (error: any) {
      console.error('Failed to fetch thread comments:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        comments: [],
      };
    }
  },
});

/**
 * Post a question or reply directly into the Whop forum
 */
export const postQuestionOrReply = action({
  args: {
    content: v.string(),
    parentId: v.optional(v.string()),
    title: v.optional(v.string()),
    authorName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = getApiKey();
    const url = `${WHOP_API_BASE}/api/v1/forum_posts`;

    const authorSignature = args.authorName
      ? `\n\n— Pregunta enviada por ${args.authorName} desde camadepilates.com`
      : '';

    const payload: any = {
      experience_id: FORUM_EXP_ID,
      content: sanitizeContent(args.content) + authorSignature,
    };

    if (args.parentId) {
      payload.parent_id = args.parentId;
    } else if (args.title) {
      payload.title = sanitizeContent(args.title);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Whop POST failed (${response.status}): ${errText}`);
      }

      const result = await response.json();
      return {
        success: true,
        post: {
          id: result.id,
          title: sanitizeContent(result.title),
          content: sanitizeContent(result.content),
          createdAt: result.created_at,
        },
      };
    } catch (error: any) {
      console.error('Failed to post question to Whop forum:', error);
      return {
        success: false,
        error: error.message || 'Error al publicar en Whop',
      };
    }
  },
});

/**
 * Get product and plans overview status
 */
export const getWhopOverview = action({
  args: {},
  handler: async () => {
    const apiKey = getApiKey();
    try {
      const res = await fetch(`${WHOP_API_BASE}/api/v2/products/${PRODUCT_ID}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      return {
        success: true,
        title: data.title,
        plansCount: data.plans?.length || 0,
        experiencesCount: data.experiences?.length || 0,
        whopLive: true,
      };
    } catch (e: any) {
      return {
        success: false,
        whopLive: false,
        error: e.message,
      };
    }
  },
});
