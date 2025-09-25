import React from 'react';
import { Link } from 'react-router-dom';
import { getAllPostsMeta } from '@/lib/content';
import { Badge } from '@/components/ui/badge';

interface HubListProps {
  tags?: string[];
  category?: string;
  limit?: number;
  excludeSlug?: string;
  title?: string;
}

const HubList: React.FC<HubListProps> = ({ tags, category, limit = 20, excludeSlug, title }) => {
  const all = getAllPostsMeta();
  const tagSet = new Set((tags || []).map(t => t.toLowerCase().trim()).filter(Boolean));
  const filtered = all.filter(p => {
    if (excludeSlug && p.slug === excludeSlug) return false;
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (tagSet.size > 0) {
      const ptags = new Set((p.tags || []).map(t => t.toLowerCase()));
      let hit = false;
      tagSet.forEach(t => { if (ptags.has(t)) hit = true; });
      if (!hit) return false;
    }
    return true;
  }).slice(0, limit);

  if (filtered.length === 0) return null;

  return (
    <div className="not-prose my-8">
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="block group">
            <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <Badge variant="outline" className="mb-2">{p.category}</Badge>
              <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">{p.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HubList;

