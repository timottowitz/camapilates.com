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

