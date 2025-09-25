interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  featured?: boolean;
}

// New content loader (frontmatter-based). Fallback to static list when empty.
import { getAllPostsMeta as getAllContentMeta, getPostBySlug as getContentPost, getRelatedBySignals as getRelatedFromContent } from '@/lib/content';

// Fast blog listing - prefers content index; falls back to static metadata
export async function loadAllBlogPosts(): Promise<BlogPostMeta[]> {
  return getAllContentMeta();
}

// Load a single blog post content (only when viewing individual posts)
export async function loadBlogPost(slug: string): Promise<{ content: string; metadata: BlogPostMeta } | null> {
  try {
    // Try new content store first
    const post = getContentPost(slug);
    if (post) {
      const { content, ...meta } = post;
      return { content, metadata: meta };
    }

    return null;
  } catch (error) {
    console.error(`Failed to load blog post: ${slug}`, error);
    return null;
  }
}

// Get unique categories from all blog posts
export function getUniqueCategories(posts: BlogPostMeta[]): string[] {
  const categories = Array.from(new Set(posts.map(post => post.category)));
  return categories.sort();
}

// Related posts - prefer content signals, fallback to category+recency from static metadata
export function getRelatedPosts(slug: string, limit: number = 3): BlogPostMeta[] {
  return getRelatedFromContent(slug, limit);
}

// (legacy static-only related helper removed in favor of getRelatedPosts above)
