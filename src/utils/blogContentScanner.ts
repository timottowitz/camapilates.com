/**
 * Blog Content Scanner
 * Scans all blog posts to count actual keyword usage
 */

import { type Keyword } from './keywordManager';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface KeywordUsageDetail {
  keyword: string;
  count: number;
  posts: {
    slug: string;
    title: string;
    occurrences: {
      inTitle: number;
      inDescription: number;
      inHeaders: number;
      inContent: number;
      inTags: number;
      total: number;
    };
  }[];
}

export class BlogContentScanner {
  private blogPosts: Map<string, BlogPost> = new Map();
  private keywordUsage: Map<string, KeywordUsageDetail> = new Map();

  /**
   * Load all blog posts from markdown files
   */
  async loadBlogPosts(): Promise<void> {
    // Import all markdown files from blog directory
    const blogFiles = import.meta.glob('/src/content/blog/*.md', {
      query: '?raw',
      import: 'default',
      eager: true
    }) as Record<string, string>;

    for (const [path, content] of Object.entries(blogFiles)) {
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      const blogPost = this.parseMarkdown(content, slug);
      this.blogPosts.set(slug, blogPost);
    }

    console.log(`Loaded ${this.blogPosts.size} blog posts for scanning`);
  }

  /**
   * Parse markdown file content to extract metadata and content
   */
  private parseMarkdown(raw: string, slug: string): BlogPost {
    const lines = raw.split('\n');
    let inFrontmatter = false;
    const frontmatterLines: string[] = [];
    const contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === '---') {
        if (!inFrontmatter && i === 0) {
          inFrontmatter = true;
        } else if (inFrontmatter) {
          inFrontmatter = false;
          continue;
        }
      } else if (inFrontmatter) {
        frontmatterLines.push(line);
      } else {
        contentLines.push(line);
      }
    }

    // Parse frontmatter
    const frontmatter: any = {};
    frontmatterLines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();

        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');

        // Parse arrays (tags)
        if (key === 'tags' && value.startsWith('[')) {
          value = value.replace(/^\[|\]$/g, '');
          frontmatter[key] = value.split(',').map(t => t.trim().replace(/["']/g, ''));
        } else {
          frontmatter[key] = value;
        }
      }
    });

    return {
      slug,
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      tags: frontmatter.tags || [],
      category: frontmatter.category || '',
      content: contentLines.join('\n')
    };
  }

  /**
   * Scan all blog posts for keyword usage
   */
  scanKeywordUsage(keywords: Keyword[]): Map<string, KeywordUsageDetail> {
    this.keywordUsage.clear();

    // Initialize usage details for each keyword
    keywords.forEach(keyword => {
      this.keywordUsage.set(keyword.id, {
        keyword: keyword.term,
        count: 0,
        posts: []
      });
    });

    // Scan each blog post
    this.blogPosts.forEach((post, slug) => {
      keywords.forEach(keyword => {
        const usage = this.countKeywordInPost(keyword.term, post);

        if (usage.total > 0) {
          const usageDetail = this.keywordUsage.get(keyword.id)!;
          usageDetail.count += usage.total;
          usageDetail.posts.push({
            slug: post.slug,
            title: post.title,
            occurrences: usage
          });
        }
      });
    });

    return this.keywordUsage;
  }

  /**
   * Count keyword occurrences in a single blog post
   */
  private countKeywordInPost(keyword: string, post: BlogPost) {
    // Prepare keyword for matching (case-insensitive, whole word)
    const keywordPattern = this.createKeywordPattern(keyword);

    // Count in different sections
    const inTitle = this.countMatches(post.title, keywordPattern);
    const inDescription = this.countMatches(post.description || '', keywordPattern);
    const inTags = post.tags?.reduce((count, tag) =>
      count + this.countMatches(tag, keywordPattern), 0) || 0;

    // Extract headers from content
    const headers = this.extractHeaders(post.content);
    const inHeaders = headers.reduce((count, header) =>
      count + this.countMatches(header, keywordPattern), 0);

    // Clean content for counting (remove shortcodes, code blocks, etc.)
    const cleanContent = this.cleanContent(post.content);
    const inContent = this.countMatches(cleanContent, keywordPattern);

    return {
      inTitle,
      inDescription,
      inHeaders,
      inContent,
      inTags,
      total: inTitle + inDescription + inHeaders + inContent + inTags
    };
  }

  /**
   * Create regex pattern for keyword matching
   */
  private createKeywordPattern(keyword: string): RegExp {
    // Escape special regex characters
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match whole word or phrase, case-insensitive
    // Handle Spanish characters like ñ, á, é, í, ó, ú
    return new RegExp(`\\b${escaped}\\b`, 'gi');
  }

  /**
   * Count matches of a pattern in text
   */
  private countMatches(text: string, pattern: RegExp): number {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }

  /**
   * Extract headers from markdown content
   */
  private extractHeaders(content: string): string[] {
    const headerPattern = /^#{1,6}\s+(.+)$/gm;
    const headers: string[] = [];
    let match;

    while ((match = headerPattern.exec(content)) !== null) {
      headers.push(match[1]);
    }

    return headers;
  }

  /**
   * Clean content for keyword counting
   */
  private cleanContent(content: string): string {
    let cleaned = content;

    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`[^`]+`/g, '');

    // Remove shortcodes
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Remove markdown links but keep text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove markdown formatting
    cleaned = cleaned.replace(/[*_~#]/g, '');

    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');

    return cleaned;
  }

  /**
   * Get usage summary for a specific keyword
   */
  getKeywordUsage(keywordId: string): KeywordUsageDetail | undefined {
    return this.keywordUsage.get(keywordId);
  }

  /**
   * Get all usage details
   */
  getAllUsage(): Map<string, KeywordUsageDetail> {
    return this.keywordUsage;
  }

  /**
   * Get top used keywords
   */
  getTopKeywords(limit: number = 10): KeywordUsageDetail[] {
    return Array.from(this.keywordUsage.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get unused keywords
   */
  getUnusedKeywords(): string[] {
    return Array.from(this.keywordUsage.entries())
      .filter(([_, detail]) => detail.count === 0)
      .map(([id, _]) => id);
  }

  /**
   * Export usage report
   */
  exportUsageReport(): string {
    const report: string[] = ['# Keyword Usage Report'];
    report.push(`\nGenerated: ${new Date().toISOString()}`);
    report.push(`Total Blog Posts: ${this.blogPosts.size}`);
    report.push(`Total Keywords Tracked: ${this.keywordUsage.size}\n`);

    report.push('## Top 10 Keywords\n');
    this.getTopKeywords(10).forEach((detail, index) => {
      report.push(`${index + 1}. **${detail.keyword}**: ${detail.count} occurrences in ${detail.posts.length} posts`);
    });

    report.push('\n## Unused Keywords\n');
    const unused = this.getUnusedKeywords();
    if (unused.length > 0) {
      unused.forEach(id => {
        const detail = this.keywordUsage.get(id);
        if (detail) {
          report.push(`- ${detail.keyword}`);
        }
      });
    } else {
      report.push('All keywords are being used!');
    }

    return report.join('\n');
  }

  /**
   * Get blog posts containing a specific keyword
   */
  getPostsWithKeyword(keywordId: string): { slug: string; title: string; count: number }[] {
    const usage = this.keywordUsage.get(keywordId);
    if (!usage) return [];

    return usage.posts.map(post => ({
      slug: post.slug,
      title: post.title,
      count: post.occurrences.total
    }));
  }
}

// Singleton instance
let scannerInstance: BlogContentScanner | null = null;

export function getBlogScanner(): BlogContentScanner {
  if (!scannerInstance) {
    scannerInstance = new BlogContentScanner();
  }
  return scannerInstance;
}