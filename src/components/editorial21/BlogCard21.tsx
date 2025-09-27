import React from 'react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl, getOrigin } from '@/lib/seo';
import Reveal from './Reveal';

export type BlogMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  heroImage?: string;
};

const BlogCard21: React.FC<{ post: BlogMeta; large?: boolean }> = ({ post, large = false }) => {
  const origin = getOrigin();
  const img = toAbsoluteUrl(post.heroImage) || `${origin}/og/${post.slug}.png`;
  return (
    <Reveal>
    <Link to={`/blog/${post.slug}`} className={`group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors ${large ? 'md:col-span-2' : ''}`}>
      <div className={`relative w-full ${large ? 'aspect-[2/1]' : 'aspect-[4/3]'} bg-muted`}> 
        <img src={img} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="inline-flex items-center rounded-md bg-black/60 text-white text-xs px-2 py-0.5">{post.category}</div>
          <h3 className="mt-2 text-white text-lg md:text-xl font-semibold line-clamp-2 group-hover:text-primary">{post.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        <div className="mt-2 text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })} • {post.readTime}</div>
      </div>
    </Link>
    </Reveal>
  );
};

export default BlogCard21;
