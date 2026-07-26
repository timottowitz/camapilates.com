import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StickyMobileCTAProps {
  productName: string;
  price: number;
  currency?: string;
  whatsappUrl: string; // pre-filled WhatsApp link for this product
  onBuy?: () => void; // e.g., analytics
  warranty?: string;
  productSlug?: string;
  className?: string;
  selectedQuantity?: number;
  totalSavings?: number;
}

export function StickyMobileCTA({
  productName,
  price,
  currency = 'MXN',
  whatsappUrl,
  onBuy,
  warranty = '1 año',
  productSlug = '',
  className = '',
  selectedQuantity = 1,
  totalSavings = 0
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Mira esta cama de Pilates: ${productName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-x-0 bottom-0 z-50 md:hidden
        bg-card/95 backdrop-blur-lg border-t border-border
        shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
        animate-in slide-in-from-bottom duration-300
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-3">
        {/* Product info row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {productName}
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">
                ${price.toLocaleString('es-MX')}
              </span>
              <span className="text-xs text-muted-foreground">{currency}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                0% interés
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`
                p-2 rounded-lg border transition-colors
                ${isFavorite
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }
              `}
              aria-label="Agregar a favoritos"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Compartir producto"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CTA buttons row */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+525548468190"
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors shadow-md"
            aria-label="Llamar"
          >
            <Phone className="h-4 w-4" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onBuy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Comprar por WhatsApp</span>
          </a>
        </div>

        {/* Trust indicator */}
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Envío gratis</span>
          </div>
          <span>•</span>
          <span>Garantía {warranty}</span>
          <span>•</span>
          <span>Pago seguro</span>
        </div>
      </div>
    </div>
  );
}

export default StickyMobileCTA;
