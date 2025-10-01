import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogList from '@/components/blog/BlogList';
import { getAllPostsMeta, getPostsByTag } from '@/lib/content';
import { slugify } from '@/utils/slug';

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
  const navigate = useNavigate();
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const normalized = slugify(tag || '');

  useEffect(() => {
    setLoading(true);
    const filtered = tag ? getPostsByTag(normalized) : getAllPostsMeta();
    setPosts(filtered);
    setLoading(false);
  }, [normalized]);

  // Normalize URL to ASCII slug
  useEffect(() => {
    if (!tag) return;
    if (tag !== normalized) {
      navigate(`/blog/tag/${normalized}`, { replace: true });
    }
  }, [tag, normalized]);

  const displayTag = posts[0]?.tags?.find(t => slugify(t) === normalized) || (tag || '').replace(/-/g, ' ');
  const title = `Etiqueta: ${displayTag}`;

  if (loading) return <div className="container mx-auto px-4 py-8">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>{title} | Edelweiss Pilates</title>
        <meta name="description" content={`Artículos con la etiqueta ${displayTag}`} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${window.location.origin}/blog/tag/${normalized}`} />
        <meta property="og:site_name" content="Edelweiss Pilates" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Artículos con la etiqueta ${displayTag}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog/tag/${normalized}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": `Artículos con la etiqueta ${displayTag}`,
            "url": `${window.location.origin}/blog/tag/${normalized}`,
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
            <Link to="/blog" className="text-primary">Ver todos</Link>
          </div>
          {posts.length > 0 ? (
            <BlogList posts={posts} />
          ) : (
            <p className="text-muted-foreground">Aún no hay artículos con esta etiqueta.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogTag;
