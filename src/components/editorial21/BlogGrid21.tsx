import React from 'react';
import BlogCard21, { BlogMeta } from './BlogCard21';

const BlogGrid21: React.FC<{ posts: BlogMeta[] }> = ({ posts }) => {
  if (!posts?.length) return null;
  const [first, ...rest] = posts;
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Large hero card */}
      <div className="lg:col-span-2">
        <BlogCard21 post={first} large />
      </div>
      {/* Right column top of grid if exists */}
      {rest.slice(0, 2).map((p) => (
        <BlogCard21 key={p.slug} post={p} />
      ))}
      {/* Remaining full grid */}
      {rest.slice(2).map((p) => (
        <BlogCard21 key={p.slug} post={p} />
      ))}
    </div>
  );
};

export default BlogGrid21;

