import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import BlogGrid21 from '@/components/editorial21/BlogGrid21';
import FilterChips21 from '@/components/editorial21/FilterChips21';
import TagCloud21 from '@/components/editorial21/TagCloud21';
import FeaturedRow21 from '@/components/editorial21/FeaturedRow21';
import { loadAllBlogPosts } from '@/utils/blogUtils';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { getAllCategories, getAllTags } from '@/lib/content';

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
  const [cat, setCat] = useState<string>('Todos');
  const [visible, setVisible] = useState<number>(9);

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

  // Hooks must remain in stable order; avoid early returns before hooks
  const categories = useMemo(() => ['Todos', ...getAllCategories()], []);
  const filtered = useMemo(() => (cat === 'Todos' ? posts : posts.filter(p => p.category === cat)), [cat, posts]);
  const featured = useMemo(() => filtered.filter(p => p.featured), [filtered]);
  const nonFeatured = useMemo(() => filtered.filter(p => !p.featured), [filtered]);
  const visiblePosts = useMemo(() => nonFeatured.slice(0, visible), [nonFeatured, visible]);
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach(p => (p as any).tags?.forEach((t: string) => counts.set(t, (counts.get(t) || 0) + 1)));
    return Array.from(counts.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 30);
  }, [posts]);

  return (
    <>
      <Helmet>
        <title>Centro de Conocimiento | {DEFAULTS.siteName}</title>
        <meta name="description" content="Centro de Conocimiento: guías de compra, ejercicios con Reformer, mantenimiento y comparativas. Recomendaciones para casa y estudio." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${getOrigin()}/blog`} />

        {/* Open Graph */}
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Centro de Conocimiento | Guías, ejercicios y equipo" />
        <meta property="og:description" content="Centro de Conocimiento: guías de compra, ejercicios y comparativas de camas de Pilates (Reformer)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${getOrigin()}/blog`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Centro de Conocimiento | Guías, ejercicios y equipo" />
        <meta name="twitter:description" content="Centro de Conocimiento: guías de compra, ejercicios y comparativas de camas de Pilates (Reformer)." />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Blog de Pilates Reformer",
            "description": "Guías de compra de camas de Pilates, ejercicios con Reformer, mantenimiento y comparativas",
            "url": `${getOrigin()}/blog`,
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": (posts || []).slice(0, 20).map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `${getOrigin()}/blog/${p.slug}`,
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Centro de Conocimiento</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Guías de compra, ejercicios, mantenimiento y comparativas. Todo sobre la cama de Pilates (Reformer) para casa y estudio.</p>
          </div>

          {/* Loading Notice */}
          {loading && (
            <div className="mb-6 text-center text-sm text-muted-foreground">Cargando artículos…</div>
          )}

          {/* Category filter chips */}
          <div className="mb-6">
            <FilterChips21 items={categories.map(c => ({ label: c, value: c, count: c === 'Todos' ? posts.length : posts.filter(p => p.category === c).length }))} value={cat} onChange={(v) => { setCat(v); setVisible(9); }} />
          </div>

          {/* Featured row (within category) */}
          <FeaturedRow21 posts={featured as any} />

          {/* Content + Sidebar */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <BlogGrid21 posts={visiblePosts as any} />
              {visible < nonFeatured.length && (
                <div className="mt-8 flex justify-center">
                  <button onClick={() => setVisible(v => v + 9)} className="inline-flex items-center px-5 py-3 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Cargar más</button>
                </div>
              )}
            </div>
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Etiquetas</h3>
                  <TagCloud21 tags={tagCounts} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
