import React from 'react';
import type { Product } from '@/lib/shop/types';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConvexAssets } from '@/lib/convexAssets';
import { beginCheckout } from '@/lib/shop/analytics';
import { productWhatsAppUrl } from '@/lib/shop/whatsapp';

const FeaturedProduct21: React.FC<{ product: Product }> = ({ product }) => {
  const assets = useConvexAssets();
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-3">Producto destacado</h2>
      <div className="grid md:grid-cols-2 gap-6 border border-border rounded-lg bg-card p-4">
        <div className="relative aspect-video w-full bg-muted rounded overflow-hidden">
          {(((product as any).finishes || []).includes('mycelium') || /mycel/i.test(product?.name || '') || /mycel/i.test(product?.slug || '')) && assets.myloBadge && (
            <img src={assets.myloBadge} alt="Mylo™" className="absolute top-3 left-3 h-7 w-auto drop-shadow" />
          )}
          <img src={assets.featuredProducts || product.image} alt={assets.featuredProducts ? `Cama de pilates reformer ${product.name} Edelweiss - producto destacado de madera de nogal y cuero premium` : `${product.name} - cama de pilates reformer Edelweiss Mexico`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        </div>
        <div>
          <Link to={`/product/${product.slug}`} className="text-2xl font-semibold text-foreground hover:text-primary">{product.name}</Link>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 text-lg font-semibold text-foreground">$ {product.price} {product.currency}</div>
          <div className="mt-1 text-xs text-muted-foreground">En stock • Entrega {product.deliveryTime || '3 semanas'} • Garantía {product.warranty || '1 año'}</div>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={productWhatsAppUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => beginCheckout({ product })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Comprar por WhatsApp
            </a>
            <Link to={`/product/${product.slug}`} className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Ver detalles</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct21;
