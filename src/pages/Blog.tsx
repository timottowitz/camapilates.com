import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogGrid21 from '@/components/editorial21/BlogGrid21';
import FilterChips21 from '@/components/editorial21/FilterChips21';
import TagCloud21 from '@/components/editorial21/TagCloud21';
import FeaturedRow21 from '@/components/editorial21/FeaturedRow21';
import { loadAllBlogPosts } from '@/utils/blogUtils';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { getAllCategories, getContentPost, getAllPostsMeta } from '@/lib/content';
import { slugify } from '@/utils/slug';
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
  heroImage?: string;
}

const Blog: React.FC = () => {
  const postsData = useQuery(api.blogs.list, { status: 'published' });
  const [posts, setPosts] = useState<BlogPostMeta[]>(() => {
    return getAllPostsMeta().map(p => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      readTime: p.readTime,
      category: p.category,
      author: p.author,
      featured: p.featured,
      heroImage: p.heroImage,
    }));
  });
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState<string>('Todos');
  const [visible, setVisible] = useState<number>(9);

  useEffect(() => {
    if (postsData) {
      const merged = postsData.map((p) => {
        const staticP = getContentPost(p.slug);
        return {
          ...p,
          date: staticP?.date || (p as any).publishDate || (p as any).date,
          readTime: staticP?.readTime || (p as any).readTime || '5 min de lectura',
          heroImage: staticP?.heroImage || (p as any).heroImage,
        };
      });
      const convexSlugs = new Set(postsData.map(p => p.slug));
      const staticOnly = getAllPostsMeta()
        .filter(sp => !convexSlugs.has(sp.slug))
        .map(sp => ({
          slug: sp.slug,
          title: sp.title,
          excerpt: sp.excerpt,
          date: sp.date,
          readTime: sp.readTime,
          category: sp.category,
          author: sp.author,
          featured: sp.featured,
          heroImage: sp.heroImage,
        }));
      setPosts([...merged, ...staticOnly] as BlogPostMeta[]);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } as any }
  };

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>Centro de Conocimiento | {DEFAULTS.siteName}</title>
        <meta name="description" content="Centro de Conocimiento: guías de compra, ejercicios con Reformer, mantenimiento y comparativas." />
      </Helmet>

      <div className="relative min-h-screen bg-[#E6E3DE] text-[#2A2624]">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        <div className="absolute top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-24 md:py-32 relative z-10">
          <div className="max-w-[1800px] mx-auto">

            {/* Header */}
            <div className="text-center mb-20 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif italic text-[#2A2624] tracking-tighter mb-8 leading-[0.9]">
                  The Journal<span className="text-[#EB4C42]">.</span>
                </h1>
                <p className="text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
                  Expert guides on buying, practice, and maintenance. <br className="hidden md:block" />
                  Everything you need to know about the Pilates Reformer.
                </p>
              </motion.div>
            </div>

            {/* Loading Notice */}
            {loading && (
              <div className="mb-6 text-center text-xs uppercase tracking-widest text-[#5D5550] animate-pulse">Loading articles...</div>
            )}

            {/* Category filter chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <FilterChips21 items={categories.map(c => ({ label: c, value: c, count: c === 'Todos' ? posts.length : posts.filter(p => p.category === c).length }))} value={cat} onChange={(v) => { setCat(v); setVisible(9); }} />
            </motion.div>

            {/* Direct crawlable category hubs for Googlebot & users */}
            <div className="mb-14 flex flex-wrap justify-center gap-2.5 text-xs">
              {categories.filter(c => c !== 'Todos').map(c => (
                <Link
                  key={c}
                  to={`/blog/category/${slugify(c)}`}
                  className="px-4 py-2 rounded-full border border-[#2A2624]/15 bg-white/60 text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-all font-medium"
                >
                  {c}
                </Link>
              ))}
            </div>

            {/* Featured row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <FeaturedRow21 posts={featured as any} />
            </motion.div>

            {/* Content + Sidebar */}
            <div className="grid lg:grid-cols-4 gap-12 mt-20">
              <motion.div
                className="lg:col-span-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <BlogGrid21 posts={visiblePosts as any} />

                {visible < nonFeatured.length && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-20 flex justify-center"
                  >
                    <button
                      onClick={() => setVisible(v => v + 9)}
                      className="px-10 py-5 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      Load More
                    </button>
                  </motion.div>
                )}
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-32 space-y-10">
                  {/* Essential Guides Pillar Box for internal linking & crawl budget */}
                  <div className="p-6 bg-white/60 rounded-[2rem] border border-[#2A2624]/10 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#2A2624] mb-4 opacity-70">Guías Esenciales</h3>
                    <ul className="space-y-3 text-xs">
                      <li>
                        <Link to="/blog/cama-de-pilates-guia-de-compra" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Guía Completa para Comprar Cama de Pilates
                        </Link>
                      </li>
                      <li>
                        <Link to="/cama-de-pilates/precio" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          ¿Cuánto Cuesta una Cama de Pilates en México?
                        </Link>
                      </li>
                      <li>
                        <Link to="/blog/accesorios-esenciales-reformer" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Accesorios Indispensables para Reformer
                        </Link>
                      </li>
                      <li>
                        <Link to="/blog/cama-de-pilates-plegable" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Camas de Pilates Plegables para Casa
                        </Link>
                      </li>
                      <li>
                        <Link to="/blog/beneficios-pilates-en-cama" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Beneficios Clínicos de Pilates en Cama
                        </Link>
                      </li>
                      <li>
                        <Link to="/blog/mantenimiento-cama-de-pilates" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Mantenimiento y Cuidado del Reformer
                        </Link>
                      </li>
                      <li>
                        <Link to="/cama-de-pilates" className="text-[#2A2624] hover:text-[#EB4C42] transition-colors block font-medium">
                          Camas de Pilates Reformer en México
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#2A2624] mb-6 opacity-40">Categorías y Temas</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.filter(c => c !== 'Todos').map(c => (
                        <Link
                          key={c}
                          to={`/blog/category/${slugify(c)}`}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-[#EAE8E4] text-[#2A2624] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors font-medium"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                    <TagCloud21 tags={tagCounts} />
                  </div>

                  <div className="p-8 bg-[#EAE8E4] rounded-[2rem] border border-white/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="w-32 h-32 rounded-full border border-[#2A2624]" />
                    </div>
                    <h3 className="font-serif italic text-3xl mb-4 text-[#2A2624]">Newsletter</h3>
                    <p className="text-sm font-light text-[#5D5550] mb-6 leading-relaxed">
                      Join 2,000+ pilates enthusiasts receiving our weekly digest.
                    </p>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full bg-white/50 border-none rounded-xl px-4 py-3 text-[#2A2624] text-sm focus:ring-1 focus:ring-[#2A2624]/20 mb-4 placeholder:text-[#2A2624]/30"
                    />
                    <button className="w-full py-4 bg-[#2A2624] text-[#EAE8E4] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#3E2723] transition-colors shadow-lg">
                      Subscribe
                    </button>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default Blog;
