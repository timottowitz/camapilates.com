import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import BlogGrid21 from '@/components/editorial21/BlogGrid21';
import FilterChips21 from '@/components/editorial21/FilterChips21';
import TagCloud21 from '@/components/editorial21/TagCloud21';
import FeaturedRow21 from '@/components/editorial21/FeaturedRow21';
import { loadAllBlogPosts } from '@/utils/blogUtils';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { getAllCategories } from '@/lib/content';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  const postsData = useQuery(api.blogs.list, { status: 'published' });
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>('Todos');
  const [visible, setVisible] = useState<number>(9);

  useEffect(() => {
    if (postsData) {
      setPosts(postsData as any);
      setLoading(false);
    }
  }, [postsData]);

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
    <LuxuryLayout>
      <Helmet>
        <title>Centro de Conocimiento | {DEFAULTS.siteName}</title>
        <meta name="description" content="Centro de Conocimiento: guías de compra, ejercicios con Reformer, mantenimiento y comparativas. Recomendaciones para casa y estudio." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${getOrigin()}/blog`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:title" content="Centro de Conocimiento | Guías, ejercicios y equipo" />
        <meta property="og:description" content="Centro de Conocimiento: guías de compra, ejercicios y comparativas de camas de Pilates (Reformer)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${getOrigin()}/blog`} />
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

      <div className="container mx-auto px-8 md:px-24 py-12">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            {/* SEO H1 - Visually hidden */}
            <h1 className="sr-only">
              Blog de Pilates Reformer: Guías de Compra, Ejercicios y Consejos para México
            </h1>
            {/* Visual Title */}
            <p className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-6" aria-hidden="true">The Journal</p>
            <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
              Guías de compra, ejercicios, mantenimiento y comparativas. Todo sobre la cama de Pilates (Reformer) para casa y estudio.
            </p>
          </div>

          {/* Loading Notice */}
          {loading && (
            <div className="mb-6 text-center text-xs uppercase tracking-widest text-[#5D5550]">Loading articles...</div>
          )}

          {/* Category filter chips */}
          <div className="mb-12 flex justify-center">
            <FilterChips21 items={categories.map(c => ({ label: c, value: c, count: c === 'Todos' ? posts.length : posts.filter(p => p.category === c).length }))} value={cat} onChange={(v) => { setCat(v); setVisible(9); }} />
          </div>

          {/* Featured row (within category) */}
          <FeaturedRow21 posts={featured as any} />

          {/* Content + Sidebar */}
          <div className="grid lg:grid-cols-4 gap-12 mt-12">
            <div className="lg:col-span-3">
              <BlogGrid21 posts={visiblePosts as any} />
              {visible < nonFeatured.length && (
                <div className="mt-16 flex justify-center">
                  <button
                    onClick={() => setVisible(v => v + 9)}
                    className="px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Topics</h3>
                  <TagCloud21 tags={tagCounts} />
                </div>

                <div className="p-6 bg-[#2A2624] text-[#EAE8E4] rounded-sm">
                  <h3 className="font-serif italic text-xl mb-2">Newsletter</h3>
                  <p className="text-xs font-light text-white/60 mb-4">Get the latest guides and pilates tips.</p>
                  <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-white/20 py-2 text-white text-sm focus:outline-none mb-4" />
                  <button className="w-full py-2 bg-[#EAE8E4] text-[#2A2624] text-xs uppercase tracking-widest hover:bg-white transition-colors">Subscribe</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default Blog;
