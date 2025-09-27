import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';
import { formatPrice } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

const ProductCard21: React.FC<Props> = ({ product, onQuickView }) => {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="block group rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
      onClick={() => selectItem(product, 'shop')}
    >
      <div className="p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
          {(product.isNew || product.bestSeller) && (
            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5">
              {product.isNew ? 'Nuevo' : 'Más vendido'}
            </div>
          )}
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
