import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export type CategoryItem = {
  label: string;
  href: string;
  img?: string;
  count?: number;
  description?: string;
};

const CategoryCard: React.FC<{ item: CategoryItem }> = ({ item }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={item.href}
      className="group relative flex flex-col p-3 rounded-2xl bg-white/70 hover:bg-white border border-[#2A2624]/10 hover:border-[#2A2624]/25 shadow-[0_2px_12px_-4px_rgba(42,38,36,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(42,38,36,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Image container with rounded corners */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#F2F0ED] border border-[#2A2624]/10 mb-3">
        {item.img && !imgError ? (
          <img
            src={item.img}
            alt={`${item.label} - Colección de Pilates`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            loading="lazy"
            decoding="async"
            onError={() => {
              console.warn('Failed to load category image, using fallback:', item.img);
              setImgError(true);
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#EAE8E4] text-[#5D5550]">
            <Sparkles className="w-6 h-6 stroke-1 text-[#2A2624]/40" />
          </div>
        )}

        {/* Subtle hover gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Floating subtle arrow indicator on hover */}
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#2A2624]" />
        </div>
      </div>

      {/* Label and product count */}
      <div className="flex flex-col flex-1 justify-between px-0.5">
        <div className="font-serif italic text-base sm:text-lg text-[#2A2624] group-hover:text-[#EB4C42] transition-colors leading-tight line-clamp-1">
          {item.label}
        </div>
        {typeof item.count === 'number' && (
          <div className="text-xs text-[#5D5550] mt-1 tracking-wide font-sans">
            {item.count} producto{item.count === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </Link>
  );
};

const CategoryIcons21: React.FC<{ items: CategoryItem[] }> = ({ items }) => {
  if (!items?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
      {items.map((item) => (
        <CategoryCard key={item.label} item={item} />
      ))}
    </div>
  );
};

export default CategoryIcons21;
