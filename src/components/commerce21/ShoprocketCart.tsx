import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

type Props = {
  publishableKey: string;
  className?: string;
  label?: string;
};

// Minimal Shoprocket Cart feature embed with a button to open the cart.
const ShoprocketCart: React.FC<Props> = ({ publishableKey, className = '', label = 'Carrito' }) => {
  const rootId = useMemo(() => `sr-embed-cart-${Math.random().toString(36).slice(2)}`, []);
  const [count, setCount] = useState(0);
  const html = `
<div class="sr-element sr-cart" data-embed="cart_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${publishableKey}"}</script>
</div>`;

  const openCart = useCallback(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    // Try to find cart open control
    const buttons = Array.from(root.querySelectorAll('button, a')) as HTMLElement[];
    const match = buttons.find((el) => /(cart|carrito|view cart|ver carrito|checkout)/i.test(el.textContent || ''));
    (match as HTMLButtonElement | HTMLAnchorElement | undefined)?.click();
  }, [rootId]);

  useEffect(() => {
    const onVendorCount = (e: Event) => {
      const ev = e as CustomEvent<{ count?: number }>;
      if (typeof ev.detail?.count === 'number') setCount(ev.detail.count);
    };
    window.addEventListener('shoprocket:cart-count', onVendorCount as EventListener);
    return () => window.removeEventListener('shoprocket:cart-count', onVendorCount as EventListener);
  }, []);

  return (
    <div className={className}>
      <button onClick={openCart} className="relative inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-foreground hover:text-background">
        <ShoppingCart className="h-4 w-4" /> {label}
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-5 min-w-5 px-1">{count}</span>
        )}
      </button>
      <div id={rootId} className="hidden" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default ShoprocketCart;

