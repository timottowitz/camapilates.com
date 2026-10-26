import React from 'react';
import { Link } from 'react-router-dom';
import { getRelatedBySignals } from '@/lib/content';

interface SeeAlsoProps {
  slug: string;
  limit?: number;
  title?: string;
}

const SeeAlso: React.FC<SeeAlsoProps> = ({ slug, limit = 3, title = 'También te puede interesar' }) => {
  const items = getRelatedBySignals(slug, limit);
  if (!items || items.length === 0) return null;
  return (
    <div className="not-prose my-8 p-6 bg-[#EAE8E4]/70 border border-[#2A2624]/10 rounded-sm">
      <h3 className="text-lg font-serif italic text-[#2A2624] mb-3">{title}</h3>
      <ul className="list-disc pl-5 space-y-1.5 text-[#5D5550]">
        {items.map(p => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`} className="text-[#3E2723] hover:text-[#2A2624] hover:underline font-medium text-sm">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeeAlso;

