import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogList from '@/components/blog/BlogList';
import { getAllPostsMeta, getPostsByTag } from '@/lib/content';

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

const BlogTag: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filtered = tag ? getPostsByTag(tag) : getAllPostsMeta();
    setPosts(filtered);
    setLoading(false);
  }, [tag]);

  const title = `Tag: ${tag}`;

  if (loading) return <div className="container mx-auto px-4 py-8">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>{title} | SolarPanelFraud.org</title>
        <meta name="description" content={`Articles tagged with ${tag}`} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${window.location.origin}/blog/tag/${tag}`} />
        <meta property="og:site_name" content="SolarPanelFraud.org" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Articles tagged with ${tag}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog/tag/${tag}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": `Articles tagged with ${tag}`,
            "url": `${window.location.origin}/blog/tag/${tag}`,
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": (posts || []).slice(0, 20).map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `${window.location.origin}/blog/${p.slug}`,
                "name": p.title
              }))
            }
          })}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{title}</h1>
            <Link to="/blog" className="text-primary">All Articles</Link>
          </div>
          {posts.length > 0 ? (
            <BlogList posts={posts} />
          ) : (
            <p className="text-muted-foreground">No posts with this tag yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogTag;
