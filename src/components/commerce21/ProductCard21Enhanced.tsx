import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/shop/types';
import { formatPrice } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';
import { useConvexAssets } from '@/lib/convexAssets';
import { Info, Eye, TrendingUp, Flame, Clock, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

type Props = {
  product: Product;
  onQuickView?: (p: Product) => void;
  showFinancing?: boolean;
  showUrgency?: boolean;
};

const ProductCard21Enhanced: React.FC<Props> = ({
  product,
  onQuickView,
  showFinancing = true,
  showUrgency = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const assets = useConvexAssets();
  const isMylo = ((product as any).finishes || []).includes('mycelium') || /mycel/i.test(product?.name || '') || /mycel/i.test(product?.slug || '');

  // Mock data for urgency (in production, fetch from API)
  const stock = Math.floor(Math.random() * 8) + 3; // 3-10
  const viewingNow = Math.floor(Math.random() * 5) + 2; // 2-6
  const soldRecently = Math.floor(Math.random() * 15) + 5; // 5-19

  const calculateMonthly = () => {
    const price = Number(product.price);
    return Math.ceil(price / 12);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="block group rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300"
      onClick={() => selectItem(product, 'shop')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Image Section with Badges */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted mb-3">
          {/* Top Badges */}
          <div className="absolute top-2 left-2 z-10 space-y-1.5">
            {isMylo && assets.myloBadge && (
              <div className="backdrop-blur-sm bg-white/90 rounded-md p-1 shadow-sm">
                <img src={assets.myloBadge} alt="Mylo™" className="h-5 w-auto" />
              </div>
            )}
            {product.bestSeller && (
              <Badge className="bg-gradient-to-r from-[#B8735F] to-[#A0593D] text-white border-0 shadow-lg">
                <TrendingUp className="h-3 w-3 mr-1" />
                Más vendido
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-gradient-to-r from-[#8B9A7A] to-[#6B7D5C] text-white border-0 shadow-lg">
                <Flame className="h-3 w-3 mr-1" />
                Nuevo
              </Badge>
            )}
          </div>

          {/* Urgency Badge - Top Right */}
          {showUrgency && stock <= 5 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-[#A45A3E] text-white border-0 shadow-lg animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Solo {stock} disponibles
              </Badge>
            </div>
          )}

          {/* Product Image with Hover Swap */}
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ${
              isHovered && !product.hoverImage ? 'scale-110' : 'scale-100'
            } ${isHovered && product.hoverImage ? 'animate-fade-in' : ''}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />

          {/* Plastic Free Badge - Bottom Left */}
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="outline" className="bg-white/90 text-[#2C4F59] border-[#2C4F59]/20 backdrop-blur-sm text-[10px] font-medium">
              Plastic-Free
            </Badge>
          </div>

          {/* Overlay on Hover */}
          {isHovered && onQuickView && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-foreground font-medium hover:bg-white/90 transform hover:scale-105 transition-all shadow-xl"
              >
                <Eye className="h-4 w-4" />
                Vista rápida
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating (mock data) */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">(127 reseñas)</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>

          {/* Price Section */}
          <div className="space-y-1 pt-2 border-t border-border">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${Number(product.price).toLocaleString('es-MX')}
              </span>
              <span className="text-sm text-muted-foreground">{product.currency}</span>
            </div>

            {/* Financing Info */}
            {showFinancing && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">o desde</span>
                <span className="font-semibold text-primary">
                  ${calculateMonthly().toLocaleString('es-MX')}/mes
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  0% interés
                </Badge>
              </div>
            )}
          </div>

          {/* Urgency Indicators */}
          {showUrgency && (
            <div className="pt-2 space-y-1">
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
              <div className="pt-2 flex items-center gap-1.5 text-xs">
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

          {/* CTA Button - Appears on hover */}
          <div className={`pt-3 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard21Enhanced;
