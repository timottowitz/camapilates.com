import React from 'react';
import type { Product } from '@/lib/shop/types';
import ShoprocketBuyButton from './ShoprocketBuyButton';
import { Link } from 'react-router-dom';
import { ASSETS } from '@/lib/assets';

const FeaturedProduct21: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">Producto destacado</h2>
      <div className="grid md:grid-cols-2 gap-6 border border-border rounded-lg bg-card p-4">
        <div className="aspect-video w-full bg-muted rounded overflow-hidden">
          <img src={ASSETS.featuredProducts || product.image} alt={ASSETS.featuredProducts ? 'Productos destacados' : product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div>
          <Link to={`/product/${product.slug}`} className="text-2xl font-semibold text-foreground hover:text-primary">{product.name}</Link>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 text-lg font-semibold text-foreground">$ {product.price} {product.currency}</div>
          <div className="mt-1 text-xs text-muted-foreground">En stock • Entrega 5–7 días • Garantía 3 años</div>
          <div className="mt-4 flex items-center gap-3">
            <ShoprocketBuyButton productId={product.productId} publishableKey={product.publishableKey} />
            <Link to={`/product/${product.slug}`} className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Ver detalles</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct21;
