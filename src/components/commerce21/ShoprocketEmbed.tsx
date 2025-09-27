import React, { useCallback } from 'react';
import { beginCheckout } from '@/lib/shop/analytics';

type Props = {
  productId: string;
  publishableKey: string;
  align?: 'left' | 'center' | 'right';
  rootId?: string; // allow multiple embeds on a page
};

const ShoprocketEmbed: React.FC<Props> = ({ productId, publishableKey, align = 'left', rootId = 'sr-embed-root' }) => {
  const html = `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${publishableKey}","options":{"product_to_display":"${productId}","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_button_icons":"1"}}</script>
</div>`;

  const open = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    const root = document.getElementById(rootId);
    if (!root) return;
    const candidates = Array.from(root.querySelectorAll('button, a')) as HTMLElement[];
    const match = candidates.find((el) => /ver|view|producto|product|comprar|add to cart|agregar/i.test(el.textContent || ''));
    if (match) (match as HTMLButtonElement).click();
    beginCheckout({ productId });
  }, []);

  return (
    <div className={`not-prose ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''}`}>
      <div className="inline-flex items-center gap-2">
        <a href="#comprar" onClick={open} className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Comprar</a>
      </div>
      <div id={rootId} className="hidden" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default ShoprocketEmbed;
