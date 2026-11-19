import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatMXN } from '@/lib/shop/catalog';

const SHOW_AFTER_PX = 400;

interface StickyMobileCTAProps {
  productName: string;
  price: number;
  currency?: string;
  whatsappUrl: string; // pre-filled WhatsApp link for this product
  orderUrl: string; // the order flow for this product and quantity
  onStartOrder?: () => void; // e.g., analytics
  warranty?: string;
}

export function StickyMobileCTA({
  productName,
  price,
  currency = 'MXN',
  whatsappUrl,
  orderUrl,
  onStartOrder,
  warranty = '1 año',
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      // Rejects when the visitor closes the share sheet, which is not an error.
      await navigator.share({ title: productName, text: `Mira esta cama de Pilates: ${productName}`, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    toast('Enlace copiado');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-[#2A2624]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
      <div className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* translate="no": browser translation detaches React's text nodes, freezing live prices */}
            <div translate="no" className="notranslate font-semibold text-foreground text-sm truncate">
              {productName}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span translate="no" className="notranslate text-lg font-bold text-primary">
                ${formatMXN(price)}
              </span>
              <span className="text-xs text-muted-foreground">{currency}</span>
              <span className="ml-2 text-[11px] text-muted-foreground">Garantía {warranty}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full border border-[#2A2624]/15 bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Compartir producto"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-rybbit-event="click_product_sticky_whatsapp"
            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-3 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-colors"
            aria-label="Preguntar por WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>

          <Link
            to={orderUrl}
            onClick={onStartOrder}
            data-rybbit-event="click_product_sticky_start_order"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#EB4C42] text-white hover:bg-[#D43D33] transition-all shadow-md active:scale-95"
          >
            <span className="text-sm font-semibold">Iniciar pedido</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StickyMobileCTA;
