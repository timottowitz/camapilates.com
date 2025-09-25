import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface BlogListProps {
  posts: BlogPostMeta[];
}

const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <>
      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Featured Article</h2>
          <Card className="card-hover group max-w-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <Link to={`/blog/category/${encodeURIComponent(featuredPost.category)}`}>
                  <Badge variant="secondary">{featuredPost.category}</Badge>
                </Link>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(featuredPost.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
              <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                <Link to={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed mb-4">
                {featuredPost.excerpt}
              </CardDescription>
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group"
              >
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Latest Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Card key={post.slug} className="card-hover group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <Badge variant="outline">{post.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 leading-relaxed">
                  {post.excerpt}
                </CardDescription>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-primary hover:text-primary/80 font-semibold text-sm group"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3 inline group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="mt-3">
                  <Link to={`/blog/category/${encodeURIComponent(post.category)}`} className="text-xs text-muted-foreground hover:text-primary">
                    #{post.category}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-foreground">
          Stay Updated on Solar Fraud Protection
        </h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter for the latest updates on solar fraud cases, consumer protection laws, and expert legal insights delivered to your inbox.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Contact Us for Updates
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </>
  );
};

export default BlogList;
