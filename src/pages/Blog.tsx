import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import BlogList from '@/components/blog/BlogList';
import { loadAllBlogPosts } from '@/utils/blogUtils';

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

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const blogPosts = await loadAllBlogPosts();
        setPosts(blogPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Loading Blog Posts...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog de Pilates Reformer | {DEFAULTS.siteName}</title>
        <meta name="description" content="Guías de compra de camas de Pilates, ejercicios con Reformer, mantenimiento y comparativas. Recomendaciones para casa y estudio." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />

        {/* Open Graph */}
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Blog de Pilates Reformer | Guías, ejercicios y equipo" />
        <meta property="og:description" content="Guías de compra, ejercicios y comparativas de camas de Pilates (Reformer)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog de Pilates Reformer | Guías, ejercicios y equipo" />
        <meta name="twitter:description" content="Guías de compra, ejercicios y comparativas de camas de Pilates (Reformer)." />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Blog de Pilates Reformer",
            "description": "Guías de compra de camas de Pilates, ejercicios con Reformer, mantenimiento y comparativas",
            "url": `${window.location.origin}/blog`,
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
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog de Pilates Reformer</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Guías de compra, ejercicios, mantenimiento y comparativas. Todo sobre la cama de Pilates (Reformer) para casa y estudio.</p>
          </div>

          {/* Blog List */}
          <BlogList posts={posts} />
        </div>
      </div>
    </>
  );
};

export default Blog;
