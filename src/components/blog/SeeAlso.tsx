import React from 'react';
import { Link } from 'react-router-dom';
import { getRelatedBySignals } from '@/lib/content';

interface SeeAlsoProps {
  slug: string;
  limit?: number;
  title?: string;
}

const SeeAlso: React.FC<SeeAlsoProps> = ({ slug, limit = 3, title = 'See also' }) => {
  const items = getRelatedBySignals(slug, limit);
  if (!items || items.length === 0) return null;
  return (
    <div className="not-prose my-8">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {items.map(p => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`} className="text-primary hover:text-primary/80">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeeAlso;

