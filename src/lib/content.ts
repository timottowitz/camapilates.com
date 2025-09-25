import matter from 'gray-matter';

export interface Frontmatter {
  title: string;
  description: string;
  category: string; // e.g., Scam | Company | Legal | State | Investigation | Fraud Prevention etc.
  tags?: string[];
  publishDate: string; // ISO date
  author?: string;
  slug?: string;
  updatedDate?: string;
  featured?: boolean;
  heroImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface PostIndexItem {
  slug: string;
  title: string;
  excerpt: string; // derived from description
  date: string; // publishDate
  readTime: string; // e.g., "7 min read"
  category: string;
  author: string;
  featured?: boolean;
  tags: string[];
}

export interface PostFull extends PostIndexItem {
  content: string;
  updatedDate?: string;
  canonical?: string;
  noindex?: boolean;
}

function slugFromPath(path: string): string {
  // Expect paths like /src/content/blog/<folders...>/<file>.md
  const parts = path.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.md$/i, '');
}

function estimateReadTime(text: string): string {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

// Eagerly import markdown as raw text
const files = import.meta.glob('/src/content/blog/**/*.md', { query: '?raw', import: 'default', eager: true });

const INDEX: PostFull[] = Object.entries(files).map(([path, raw]) => {
  const { data, content } = matter((raw as unknown as string) || '');
  const fm = (data || {}) as Partial<Frontmatter>;
  const slug = (fm.slug || slugFromPath(path)).toLowerCase();
  const title = fm.title || slug;
  const description = fm.description || '';
  const category = fm.category || 'General';
  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const author = fm.author || 'Bennett Legal';
  const date = fm.publishDate || new Date().toISOString().slice(0, 10);
  const featured = Boolean(fm.featured);
  const excerpt = description;
  const readTime = estimateReadTime(content);

  return {
    slug,
    title,
    excerpt,
    date,
    readTime,
    category,
    author,
    featured,
    tags,
    content,
    updatedDate: fm.updatedDate,
    canonical: fm.canonical,
    noindex: fm.noindex,
  };
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getAllPostsMeta(): PostIndexItem[] {
  return INDEX.map(({ content: _c, updatedDate: _u, canonical: _ca, noindex: _n, ...meta }) => meta);
}

export function getPostBySlug(slug: string): PostFull | undefined {
  return INDEX.find(p => p.slug === slug);
}

export function getPostsByCategory(category: string): PostIndexItem[] {
  const lc = category.toLowerCase();
  return getAllPostsMeta().filter(p => p.category.toLowerCase() === lc);
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  INDEX.forEach(p => p.tags.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

export function getPostsByTag(tag: string): PostIndexItem[] {
  const lt = tag.toLowerCase();
  return getAllPostsMeta().filter(p => p.tags.map(t => t.toLowerCase()).includes(lt));
}

export function getAllCategories(): string[] {
  const set = new Set<string>();
  INDEX.forEach(p => set.add(p.category));
  return Array.from(set).sort();
}

export function getRelatedBySignals(slug: string, limit = 3): PostIndexItem[] {
  const current = getPostBySlug(slug);
  if (!current) return getAllPostsMeta().filter(p => p.slug !== slug).slice(0, limit);

  const byTag = getAllPostsMeta().filter(p => p.slug !== slug && p.tags.some(t => current.tags.includes(t)));
  if (byTag.length >= limit) return byTag.slice(0, limit);

  const byCategory = getAllPostsMeta().filter(p => p.slug !== slug && p.category === current.category);
  const picked = new Set(byTag.map(p => p.slug));
  const merged = [...byTag, ...byCategory.filter(p => !picked.has(p.slug))];
  if (merged.length >= limit) return merged.slice(0, limit);

  const fallback = getAllPostsMeta().filter(p => p.slug !== slug && !new Set(merged.map(m => m.slug)).has(p.slug));
  return [...merged, ...fallback].slice(0, limit);
}
