import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Props = {
  productId: string;
  publishableKey: string;
  className?: string;
};

// Minimal mini-cart that triggers Shoprocket cart via an offscreen embed.
// Note: Count is not shown (no reliable API without vendor SDK).
const MiniCart21: React.FC<Props> = ({ productId, publishableKey, className = '' }) => {
  const rootId = React.useMemo(() => `sr-embed-cart-${Math.random().toString(36).slice(2)}`, []);
  const [count, setCount] = React.useState<number>(0);

  const html = `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${publishableKey}","options":{"product_to_display":"${productId}","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_button_icons":"1"}}</script>
</div>`;

  const openCart = React.useCallback(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const els = Array.from(root.querySelectorAll('button, a')) as HTMLElement[];
    // Try to find a Cart button
    const cartRegex = /(cart|carrito|ver carrito)/i;
    const match = els.find((el) => cartRegex.test(el.textContent || ''));
    if (match) {
      (match as HTMLButtonElement).click();
      return;
    }
    // Fallback: open product popup to enable cart UI
    const productRegex = /(view|ver|product|producto)/i;
    const open = els.find((el) => productRegex.test(el.textContent || ''));
    (open as HTMLButtonElement | undefined)?.click();
  }, [rootId]);

  // Optional cart count support: listen for vendor or app events
  React.useEffect(() => {
    const onVendorCount = (e: Event) => {
      const ev = e as CustomEvent<{ count?: number }>;
      if (typeof ev.detail?.count === 'number') setCount(ev.detail.count);
    };
    const onAnalytics = (e: Event) => {
      const ev = e as CustomEvent<{ name: string; payload: any }>;
      if (ev.detail?.name === 'add_to_cart') setCount((c) => c + 1);
    };
    window.addEventListener('shoprocket:cart-count', onVendorCount as EventListener);
    window.addEventListener('shop_analytics', onAnalytics as EventListener);
    return () => {
      window.removeEventListener('shoprocket:cart-count', onVendorCount as EventListener);
      window.removeEventListener('shop_analytics', onAnalytics as EventListener);
    };
  }, []);

  return (
    <div className={className}>
      <button onClick={openCart} className="relative inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground hover:text-background">
        <ShoppingCart className="h-4 w-4" /> Carrito
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-5 min-w-5 px-1">{count}</span>
        )}
      </button>
      <div id={rootId} className="hidden" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default MiniCart21;
