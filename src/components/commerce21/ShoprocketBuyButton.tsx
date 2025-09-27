import React, { useCallback, useMemo } from 'react';
import { beginCheckout } from '@/lib/shop/analytics';

type Props = {
  productId: string;
  publishableKey: string;
  onBeforeOpen?: () => void; // e.g., analytics
  className?: string;
  buttonLabel?: string;
  rootId?: string; // allow external triggers
  showButton?: boolean; // render our visible button (default true)
};

// Minimal Shoprocket Buy Button embed.
// We render the vendor button offscreen and trigger it from our styled button.
const ShoprocketBuyButton: React.FC<Props> = ({ productId, publishableKey, onBeforeOpen, className = '', buttonLabel = 'Comprar ahora', rootId, showButton = true }) => {
  const rid = useMemo(() => rootId || `sr-embed-buy-${Math.random().toString(36).slice(2)}`, [rootId]);
  const html = `
<div class="sr-element sr-products" data-embed="buy_button">
  <script type="application/json" data-config="embed">{"publishable_key":"${publishableKey}","options":{"product_to_display":"${productId}"},"includes":{"show_button_icons":"1"}}</script>
</div>`;

  const onClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try { onBeforeOpen?.(); } catch {}
    const root = document.getElementById(rid);
    if (!root) return;
    const btn = root.querySelector('button, a') as HTMLButtonElement | HTMLAnchorElement | null;
    btn?.click();
  }, [rid, onBeforeOpen]);

  return (
    <div className={className}>
      {showButton && (
        <button onClick={onClick} className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">{buttonLabel}</button>
      )}
      <div id={rid} className="hidden" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default ShoprocketBuyButton;
