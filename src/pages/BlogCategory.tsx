import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogList from '@/components/blog/BlogList';
import { loadAllBlogPosts } from '@/utils/blogUtils';
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

const BlogCategory: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const normalized = slugify(category || '');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const all = await loadAllBlogPosts();
      const filtered = all.filter(p => slugify(p.category) === normalized);
      setPosts(filtered);
      setLoading(false);
    };
    run();
  }, [normalized]);

  // Normalize URL to ASCII slug to avoid diacritics in path
  useEffect(() => {
    if (!category) return;
    if (category !== normalized) {
      navigate(`/blog/category/${normalized}`, { replace: true });
    }
  }, [category, normalized]);

  const displayCategory = posts[0]?.category || (category || '').replace(/-/g, ' ');
  const title = `Categoría: ${displayCategory}`;

  if (loading) return <div className="container mx-auto px-4 py-8">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>{title} | Edelweiss Pilates</title>
        <meta name="description" content={`Artículos en la categoría ${displayCategory}`} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${window.location.origin}/blog/category/${normalized}`} />
        <meta property="og:site_name" content="Edelweiss Pilates" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Artículos en la categoría ${displayCategory}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog/category/${normalized}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": title,
            "description": `Artículos en la categoría ${displayCategory}`,
            "url": `${window.location.origin}/blog/category/${normalized}`,
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
            <p className="text-muted-foreground">Aún no hay artículos en esta categoría.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogCategory;
