import React from 'react';
import {
  SHOPROCKET_BASKET_CONFIG,
  SHOPROCKET_ENABLED,
  SHOPROCKET_PUBLISHABLE_KEY,
} from '@/lib/shoprocket/config';

const SHOPROCKET_SCRIPT_ID = 'shoprocket-loader-script';

const ShoprocketLoader: React.FC = () => {
  React.useEffect(() => {
    if (!SHOPROCKET_ENABLED) return;
    if (document.getElementById(SHOPROCKET_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.shoprocket.io/loader.js';
    script.dataset.cfasync = 'false';
    script.id = SHOPROCKET_SCRIPT_ID;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  if (!SHOPROCKET_ENABLED) return null;

  const config = JSON.stringify({
    publishable_key: SHOPROCKET_PUBLISHABLE_KEY,
    ...SHOPROCKET_BASKET_CONFIG,
  });

  return (
    <>
      <div
        className="sr-element"
        data-embed="basket"
        dangerouslySetInnerHTML={{
          __html: `<script type="application/json" data-config="embed">${config}</script>`,
        }}
      />
      <div className="sr-products-embed" aria-hidden="true" style={{ display: 'none' }} />
    </>
  );
};

export default ShoprocketLoader;
