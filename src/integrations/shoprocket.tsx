import React, { useEffect } from 'react';

declare global {
  interface Window { Shoprocket?: any }
}

export const SHOPROCKET_PK = import.meta.env.VITE_SHOPROCKET_PK as string | undefined;

function loadScriptOnce(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

export const ShoprocketLoader: React.FC<{ storeId?: string } & React.PropsWithChildren> = ({ storeId, children }) => {
  useEffect(() => {
    // Load Shoprocket once
    const attrs: Record<string, string> = {};
    if (storeId) attrs['data-shoprocket-store'] = storeId;
    loadScriptOnce('https://cdn.shoprocket.io/loader.js', attrs);
  }, [storeId]);

  // Re-init on route changes if SR exposes init
  useEffect(() => {
    if (window.Shoprocket && typeof window.Shoprocket.init === 'function') {
      try { window.Shoprocket.init(); } catch {}
    }
  });

  return <>{children}</>;
};

function JsonScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/json"
      data-config="embed"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const ShoprocketSingleProduct: React.FC<{
  config: any;
  className?: string;
}> = ({ config, className }) => (
  <div className={['sr-element sr-products', className].filter(Boolean).join(' ')} data-embed="single_product_widget">
    <JsonScript data={config} />
  </div>
);

export const ShoprocketMultipleProducts: React.FC<{ config: any; className?: string }> = ({ config, className }) => (
  <div className={['sr-element sr-products', className].filter(Boolean).join(' ')} data-embed="multiple_products">
    <JsonScript data={config} />
  </div>
);

export const ShoprocketBasket: React.FC<{ config: any; className?: string }> = ({ config, className }) => (
  <div className={['sr-element', className].filter(Boolean).join(' ')} data-embed="basket">
    <JsonScript data={config} />
  </div>
);

// Button-focused single product embed with minimal UI, opening popup modal.
export const ShoprocketButton: React.FC<{
  publishableKey: string;
  productId: string;
  className?: string;
}> = ({ publishableKey, productId, className }) => (
  <div className={['sr-element sr-products', className].filter(Boolean).join(' ')} data-embed="single_product_widget">
    <JsonScript
      data={{
        publishable_key: publishableKey,
        options: { product_to_display: productId, open_product_in: 'popup', variation_style: 'on_hover' },
        includes: {
          show_product_name: '0',
          show_product_price: '0',
          show_product_image: '0',
          show_product_summary: '0',
          open_modal_on_image_click: '0',
          show_view_product_button: '1',
          show_add_to_cart_button: '1',
          show_min_max_order_quantity: '0',
          show_sale: '0',
          show_free_shipping: '0',
          show_new_product: '0',
          show_digital_download: '0',
          show_pwyw: '0',
          image_swap: '0',
          show_button_icons: '1'
        },
        product_popup: {
          show_product_name: '1',
          show_product_price: '1',
          show_product_summary: '1',
          show_product_description: '1',
          show_product_image: '1',
          show_add_to_cart_button: '1',
          show_select_quantity: '1',
          show_image_thumbnails: '1',
          show_product_reviews: '1',
          show_product_sku: '1',
          show_product_categories: '1',
          show_social_sharing_icons: '1',
          show_related_products: '1',
          thumbnail_layout: 'horizontal_below',
          image_dimension_value: 'crop',
          image_aspect_ratio: 'portrait',
          variation_styling: '',
          show_min_max_order_quantity: '1',
          show_sale: '1',
          show_free_shipping: '1',
          show_new_product: '1',
          show_digital_download: '1',
          show_pwyw: '1',
          show_product_tabs: '1',
          image_zoom: '1',
          show_stock: '0'
        },
        styles: {
          align_content: 'center',
          button_background: '#233642',
          button_color: '#ffffff',
          view_product_button_background: '#233642',
          view_product_button_color: '#ffffff',
          view_cart_button_background: '#233642',
          view_cart_button_color: '#ffffff',
          product_background: 'transparent',
          modal_background: '#ffffff',
          button_font_weight: 'normal',
          popup: {
            colors: {
              product_title: '#333',
              product_price: '#666666',
              product_summary: '#666666',
              button_background: '#233642',
              button_color: '#ffffff',
              product_active_tab_background: '#f5f5f5'
            }
          }
        }
      }}
    />
  </div>
);
