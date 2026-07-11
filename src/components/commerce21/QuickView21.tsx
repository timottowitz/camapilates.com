import React from 'react';
import type { Product, FinishKey } from '@/lib/shop/types';
import Gallery21 from './Gallery21';
import { MessageCircle } from 'lucide-react';
import { beginCheckout } from '@/lib/shop/analytics';
import { productWhatsAppUrl } from '@/lib/shop/whatsapp';
import { FINISHES } from '@/components/product/Finishes';

type Props = {
  product: Product;
  onClose: () => void;
};

const QuickView21: React.FC<Props> = ({ product, onClose }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [finish, setFinish] = React.useState<FinishKey>(() => (product.finishes?.[0] as FinishKey) || 'walnut');
  const activeVariant = React.useMemo(() => (product.variants || []).find(v => v.finish === finish), [finish, product.slug]);
  const priceToShow = activeVariant?.price || product.price;
  const displaySku = activeVariant?.sku || product.sku;
  const images = React.useMemo(() => [activeVariant?.image || '', FINISHES[finish]?.img || '', product.image].filter(Boolean) as string[], [finish, product.slug]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-0 grid place-content-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-[95vw] max-w-4xl bg-background rounded-lg border border-border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold text-foreground">Vista rápida — {product.name}</div>
            <button className="text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>Cerrar</button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 p-4">
            <div>
              <Gallery21 images={images} altPrefix={product.name} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{product.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">SKU: {displaySku}</div>
              <div className="mt-2 text-lg font-semibold text-foreground">$ {priceToShow} {product.currency}</div>
              {product.finishes?.length ? (
                <div className="mt-3">
                  <div className="text-sm font-medium text-foreground mb-1">Acabado</div>
                  <div className="flex items-center gap-2">
                    {product.finishes.map((f) => (
                      <button key={f} aria-label={f} title={f} onClick={() => setFinish(f as FinishKey)} className={`h-6 w-6 rounded-full border ${finish === f ? 'border-foreground ring-2 ring-foreground/40' : 'border-border'}`} style={{ background: FINISHES[f]?.swatch || '#E5E7EB' }} />
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-4">
                <a
                  href={productWhatsAppUrl(product, priceToShow, displaySku)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => beginCheckout({ product })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Comprar por WhatsApp
                </a>
                <div className="mt-2 text-xs text-muted-foreground">Se abrirá WhatsApp con los datos de este producto para completar tu compra.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView21;
