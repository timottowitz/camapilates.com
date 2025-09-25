# How to Make Related Articles Dynamic in This Blog

Static “Related Articles” work for a quick launch, but it’s easy to make them dynamic using the metadata you already maintain in `src/utils/blogUtils.ts`. This guide shows a minimal, safe change that keeps your authoring flow (Markdown in `public/blog/*.md` + metadata in code) and replaces hardcoded links with automatic suggestions.

## What We’ll Build

When viewing a post at `/blog/:slug`, the page will show up to 3 related posts:
- Primary signal: same `category` as the current article
- Sort order: newest first by `date`
- Fallback: if fewer than 3 matches, fill from the most recent posts overall (excluding the current one)

This gives relevant suggestions without introducing tags/frontmatter or a CMS.

## Step 1 — Add a helper to pick related posts

Open `src/utils/blogUtils.ts` and add a helper below the existing functions:

```ts
// Returns up to `limit` related posts, excluding the given slug
export function getRelatedPosts(slug: string, limit: number = 3) {
  // Load all metadata, newest first
  const all = BLOG_POSTS_METADATA
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const current = all.find(p => p.slug === slug);
  if (!current) return all.filter(p => p.slug !== slug).slice(0, limit);

  // First pass: same category
  const sameCategory = all.filter(p => p.slug !== slug && p.category === current.category);

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  // Fallback: fill with most recent posts not already included
  const picked = new Set(sameCategory.map(p => p.slug));
  const fallback = all.filter(p => p.slug !== slug && !picked.has(p.slug));
  return [...sameCategory, ...fallback].slice(0, limit);
}
```

Why in `blogUtils`? It centralizes blog metadata behavior in one place, keeping your pages lean and your logic testable.

## Step 2 — Use it in the BlogPost page

In `src/pages/BlogPost.tsx`, after you’ve loaded `content` and `postMeta`, compute related items:

```ts
import { getRelatedPosts } from '@/utils/blogUtils';

// inside the component, after postMeta is available
const related = postMeta ? getRelatedPosts(postMeta.slug, 3) : [];
```

Then render them instead of the hardcoded links. You can keep your current card markup or reuse the existing `BlogCard` component. Here’s an inline version that matches your existing style but pulls from `related`:

```tsx
{/* Related Articles */}
<div className="mt-12">
  <h3 className="text-2xl font-semibold mb-6 text-foreground">Related Articles</h3>
  <div className="grid md:grid-cols-2 gap-6">
    {related.map((p) => (
      <Link key={p.slug} to={`/blog/${p.slug}`} className="block group">
        <div className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <Badge variant="outline" className="mb-3">{p.category}</Badge>
          <h4 className="font-semibold group-hover:text-primary transition-colors mb-2">{p.title}</h4>
          <p className="text-sm text-muted-foreground">{p.excerpt}</p>
        </div>
      </Link>
    ))}
  </div>
  {related.length === 0 && (
    <p className="text-sm text-muted-foreground">No related articles yet.</p>
  )}
}</div>
```

That’s it. No new dependencies. No changes to your content authoring.

## Optional Enhancements

- Add a “same month or quarter” boost by adjusting the sort scoring.
- If you later add `tags` to `BLOG_POSTS_METADATA`, prefer posts that share tags with the current article, then fall back to category, then recency.
- Migrate to Markdown frontmatter to keep metadata and content together; parse it once per post for listing and related-article logic.

## Full Example Diff (Minimal)

1) `src/utils/blogUtils.ts` — add `getRelatedPosts` helper.
2) `src/pages/BlogPost.tsx` — import helper, compute `related`, replace hardcoded links with a map.

These two small changes make the “Related Articles” section maintain itself.

