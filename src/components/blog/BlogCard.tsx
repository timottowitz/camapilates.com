import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false, className }) => {
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg border-0 bg-white/80 backdrop-blur-sm",
        featured ? "md:col-span-2 lg:col-span-3" : "",
        className
      )}
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              {post.readTime}
            </div>
          </div>
          
          <h3 className={cn(
            "font-bold text-foreground group-hover:text-primary transition-colors leading-tight",
            featured ? "text-2xl md:text-3xl" : "text-xl"
          )}>
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent>
          <p className={cn(
            "text-muted-foreground leading-relaxed mb-4",
            featured ? "text-lg" : "text-base"
          )}>
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>by {post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BlogCard;