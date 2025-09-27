import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';
import { formatPrice } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';
import { ASSETS } from '@/lib/assets';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

const ProductCard21: React.FC<Props> = ({ product, onQuickView }) => {
  const isMylo = ((product as any).finishes || []).includes('mycelium') || /mycel/i.test(product?.name || '') || /mycel/i.test(product?.slug || '');
  return (
    <Link
      to={`/product/${product.slug}`}
      className="block group rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
      onClick={() => selectItem(product, 'shop')}
    >
      <div className="p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
          <div className="absolute top-2 left-2 z-10 space-y-1">
            {isMylo && (
              <img src={ASSETS.myloBadge} alt="Mylo™" className="h-6 w-auto drop-shadow" />
            )}
            {(product.isNew || product.bestSeller) && (
              <div className="inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5">
                {product.isNew ? 'Nuevo' : 'Más vendido'}
              </div>
            )}
          </div>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-foreground group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="mt-2 text-sm font-semibold text-foreground">{formatPrice(product)}</div>
          {isMylo && (
            <div className="mt-1 text-[10px] text-emerald-800 flex items-center gap-1">
              <a
                href="https://boltthreads.com/technology/mylo/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                title="Material de micelio renovable (Mylo™)"
              >
                Edición Mylo™
              </a>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="¿Qué es Mylo?" className="text-emerald-800/80 hover:text-emerald-900">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Mylo™: material de micelio (no tóxico), tacto refinado & origen renovable.</span>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {onQuickView && (
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onQuickView(product); }}
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background text-xs"
              >
                Vista rápida
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard21;
