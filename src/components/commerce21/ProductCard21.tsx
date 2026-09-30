import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';
import { formatPrice } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';
import { useConvexAssets } from '@/lib/convexAssets';
import { Info, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
};

const ProductCard21: React.FC<Props> = ({ product, onQuickView }) => {
  const assets = useConvexAssets();
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
            {isMylo && assets.myloBadge && (
              <img src={assets.myloBadge} alt="Mylo™" className="h-6 w-auto drop-shadow" />
            )}
            {(product.isNew || product.bestSeller) && (
              <div className="inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5">
                {product.isNew ? 'Nuevo' : 'Más vendido'}
              </div>
            )}
          </div>
          <img
            src={product.image}
            alt={`${product.name} - ${product.category === 'Reformers' ? 'cama de pilates reformer' : product.category?.toLowerCase() || 'equipo de pilates'} Edelweiss de ${(product.materials || []).slice(0, 2).join(' y ') || 'materiales premium'} Mexico`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
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
          {/* Dual CTAs */}
          <div className="mt-3 space-y-2">
            <div className="w-full py-2 px-3 rounded-md bg-[#2A2624] text-[#EAE8E4] text-xs font-semibold text-center group-hover:bg-[#3E2723] transition-colors">
              Ver Cama y Acabados →
            </div>
            <a
              href={`https://wa.me/525548468190?text=${encodeURIComponent(`Hola, me interesa cotizar el modelo ${product.name} ($${Number(product.price).toLocaleString('es-MX')} MXN) con envío a mi código postal:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              data-rybbit-event="click_card_whatsapp_quote"
              data-rybbit-prop-product={product.name}
              className="w-full py-2 px-3 rounded-md bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard21;
