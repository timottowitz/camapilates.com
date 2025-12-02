import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogList from '@/components/blog/BlogList';
import { slugify } from '@/utils/slug';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { ArrowLeft } from 'lucide-react';
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

const BlogCategory: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const normalized = slugify(category || '');

  const blogs = useQuery(api.blogs.list, { status: 'published' });

  useEffect(() => {
    if (blogs) {
      const filtered = blogs.filter(p => slugify(p.category) === normalized);
      setPosts(filtered as any);
      setLoading(false);
    }
  }, [blogs, normalized]);

  // Normalize URL to ASCII slug to avoid diacritics in path
  useEffect(() => {
    if (!category) return;
    if (category !== normalized) {
      navigate(`/blog/category/${normalized}`, { replace: true });
    }
  }, [category, normalized]);

  const displayCategory = posts[0]?.category || (category || '').replace(/-/g, ' ');
  const title = `Categoría: ${displayCategory}`;

  if (loading) {
    return (
      <LuxuryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-6 text-center">
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-10 bg-gray-300 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
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

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Journal
        </Link>

        <div className="mb-16">
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
            Category
          </span>
          <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9]">
            {displayCategory}
          </h1>
        </div>

        {posts.length > 0 ? (
          <BlogList posts={posts} />
        ) : (
          <div className="text-center py-24 border border-dashed border-[#2A2624]/20 rounded-sm bg-[#2A2624]/5">
            <p className="text-[#5D5550] font-light">Aún no hay artículos en esta categoría.</p>
          </div>
        )}
      </section>
    </LuxuryLayout>
  );
};

export default BlogCategory;
