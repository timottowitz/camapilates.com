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
        <title>Solar Fraud Legal Blog | Expert Insights & Consumer Protection</title>
        <meta name="description" content="Expert legal insights on solar panel fraud, consumer protection, and your rights. Stay informed with our comprehensive blog covering solar scams and legal solutions." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />

        {/* Open Graph */}
        <meta property="og:site_name" content="SolarPanelFraud.org" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="Solar Fraud Legal Blog | Expert Insights & Consumer Protection" />
        <meta property="og:description" content="Expert legal insights on solar panel fraud, consumer protection, and your rights." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Solar Fraud Legal Blog | Expert Insights & Consumer Protection" />
        <meta name="twitter:description" content="Expert legal insights on solar panel fraud, consumer protection, and your rights." />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Solar Fraud Legal Blog",
            "description": "Expert legal insights on solar panel fraud, consumer protection, and your rights",
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Solar Fraud Legal Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert insights on solar panel fraud, consumer protection, and your legal rights. Stay informed and protected.
            </p>
          </div>

          {/* Blog List */}
          <BlogList posts={posts} />
        </div>
      </div>
    </>
  );
};

export default Blog;
