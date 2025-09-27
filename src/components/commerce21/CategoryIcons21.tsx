import React from 'react';
import { Link } from 'react-router-dom';

type Cat = { label: string; href: string; img?: string; emoji?: string; count?: number };

const Circle: React.FC<{ img?: string; emoji?: string; alt: string }> = ({ img, emoji, alt }) => (
  <div className="h-16 w-16 rounded-full border border-border bg-card grid place-content-center overflow-hidden">
    {img ? (
      <img
        src={img}
        alt={alt}
        className="h-full w-full object-cover scale-[1.9]"
        loading="lazy"
        decoding="async"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    ) : (
      <span className="text-xl" aria-hidden>{emoji || '🛍️'}</span>
    )}
  </div>
);

const CategoryIcons21: React.FC<{ items: Cat[] }> = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-6">
      {items.map((c) => (
        <Link key={c.label} to={c.href} className="flex items-center gap-3 group">
          <Circle img={c.img} emoji={c.emoji} alt={c.label} />
          <div className="text-sm">
            <div className="font-medium text-foreground group-hover:text-primary">{c.label}</div>
            {typeof c.count === 'number' && (
              <div className="text-xs text-muted-foreground">{c.count} producto{c.count === 1 ? '' : 's'}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryIcons21;
