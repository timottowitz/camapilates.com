import React from 'react';
import BlogCard21, { BlogMeta } from './BlogCard21';

const FeaturedRow21: React.FC<{ posts: BlogMeta[] }> = ({ posts }) => {
  if (!posts?.length) return null;
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Destacados</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {posts.slice(0, 3).map(p => (
          <BlogCard21 key={p.slug} post={p} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedRow21;

