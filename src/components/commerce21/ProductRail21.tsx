import React from 'react';
import type { Product } from '@/lib/shop/types';
import { Link } from 'react-router-dom';

const ProductRail21: React.FC<{ title: string; products: Product[] }> = ({ title, products }) => {
  if (!products?.length) return null;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const scrollBy = (dx: number) => {
    const el = ref.current; if (!el) return; el.scrollBy({ left: dx, behavior: 'smooth' });
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') scrollBy(320);
    if (e.key === 'ArrowLeft') scrollBy(-320);
  };
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="relative">
        <button aria-label="Desplazar a la izquierda" className="hidden md:grid place-content-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 border border-border hover:bg-background" onClick={() => scrollBy(-320)}>‹</button>
        <button aria-label="Desplazar a la derecha" className="hidden md:grid place-content-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 border border-border hover:bg-background" onClick={() => scrollBy(320)}>›</button>
        <div ref={ref} className="overflow-x-auto scroll-smooth snap-x snap-mandatory" tabIndex={0} onKeyDown={onKey} role="region" aria-label={title}>
          <div className="flex gap-4 min-w-max pr-6">
            {products.map((p) => (
            <Link key={p.slug} to={`/product/${p.slug}`} className="w-56 shrink-0 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors snap-start focus:outline-none focus:ring-1 focus:ring-primary">
              <div className="aspect-video w-full bg-muted rounded-t-lg overflow-hidden">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-foreground line-clamp-2">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">$ {p.price} {p.currency}</div>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductRail21;
