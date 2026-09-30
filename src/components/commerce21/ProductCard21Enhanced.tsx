import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';
import { formatPrice } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';
import { useConvexAssets } from '@/lib/convexAssets';
import { Info, Eye, TrendingUp, Flame, Clock, Star, MessageCircle, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
  showUrgency?: boolean;
};

const ProductCard21Enhanced: React.FC<Props> = ({
  product,
  onQuickView,
  showUrgency = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const assets = useConvexAssets();
  const finishes = (product as Product & { finishes?: string[] }).finishes;
  const isMylo = (finishes || []).includes('mycelium') || /mycel/i.test(product?.name || '') || /mycel/i.test(product?.slug || '');

  // Mock data for urgency (in production, fetch from API)
  const stock = Math.floor(Math.random() * 8) + 3; // 3-10
  const viewingNow = Math.floor(Math.random() * 5) + 2; // 2-6
  const soldRecently = Math.floor(Math.random() * 15) + 5; // 5-19

  return (
    <Link
      to={`/product/${product.slug}`}
      className="block group relative bg-white rounded-[2.5rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
      onClick={() => selectItem(product, 'shop')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3">
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-[#F2F0ED] mb-4">
          {/* Product Image */}
          <img
            src={product.image}
            alt={`${product.name} - ${product.category === 'Reformers' ? 'cama de pilates reformer' : product.category?.toLowerCase() || 'equipo de pilates'} Edelweiss de ${(product.materials || []).slice(0, 2).join(' y ') || 'materiales premium'} - comprar en Mexico`}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          />

          {/* Overlay on Hover */}
          {isHovered && onQuickView && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#2A2624] font-bold text-xs uppercase tracking-widest hover:bg-[#F2F0ED] transform hover:scale-105 transition-all shadow-xl"
              >
                <Eye className="h-3 w-3" />
                Vista Rápida
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-3 pb-3 space-y-3">
          {/* Product Name & Price */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif italic text-xl text-[#2A2624] leading-tight group-hover:text-[#EB4C42] transition-colors">
              {product.name}
            </h3>
            <div className="text-right shrink-0">
              <span translate="no" className="notranslate block text-lg font-bold text-[#2A2624] font-sans">
                ${Number(product.price).toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#5D5550] line-clamp-2 leading-relaxed font-sans opacity-80">
            {product.description}
          </p>

          {/* Micro Trust Line */}
          <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-[#2A2624]/5">
            <span className="inline-flex items-center gap-1 text-[#128C7E] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              12 MSI disponibles
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#5D5550]/70 font-medium">
              Garantía 3 años
            </span>
          </div>

          {/* Urgency Indicators */}
          {showUrgency && (
            <div className="pt-1 space-y-1">
              {viewingNow > 3 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#7A8A6F] rounded-full animate-pulse" />
                    <span>{viewingNow} personas viendo ahora</span>
                  </div>
                </div>
              )}
              {soldRecently > 10 && (
                <div className="flex items-center gap-1.5 text-xs text-[#A45A3E]">
                  <Flame className="h-3 w-3" />
                  <span>{soldRecently} vendidos esta semana</span>
                </div>
              )}
            </div>
          )}

          {/* Mylo Badge */}
          {isMylo && (
            <TooltipProvider>
              <div className="pt-1 flex items-center gap-1.5 text-xs">
                <Badge variant="outline" className="bg-[#F5EFE6] text-[#B08D5B] border-[#C9A875]/30">
                  <a
                    href="https://boltthreads.com/technology/mylo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edición Mylo™
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Mylo™: material de micelio renovable, no tóxico y con tacto refinado.</p>
                      </TooltipContent>
                    </Tooltip>
                  </a>
                </Badge>
              </div>
            </TooltipProvider>
          )}

          {/* CTA Buttons - Always visible and actionable */}
          <div className="pt-2 space-y-2">
            <div className="w-full py-2.5 px-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-[11px] uppercase tracking-[0.15em] font-bold group-hover:bg-[#3E2723] transition-colors shadow-sm flex items-center justify-center gap-1.5">
              <span>Ver Cama y Acabados</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <a
              href={`https://wa.me/525548468190?text=${encodeURIComponent(`Hola, me interesa cotizar el modelo ${product.name} ($${Number(product.price).toLocaleString('es-MX')} MXN) con envío a mi código postal:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              data-rybbit-event="click_card_whatsapp_quote"
              data-rybbit-prop-product={product.name}
              className="w-full py-2 px-3 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-200"
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

export default ProductCard21Enhanced;
