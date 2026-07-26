import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '@/lib/analytics/ga';
import { addToCart as gaAdd } from '@/lib/analytics/ga';

const GAListener = () => {
  const location = useLocation();
  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
  useEffect(() => {
    let lastPurchase = 0;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button, a') as HTMLElement | null;
      const text = (btn?.textContent || '').toLowerCase();
      if (/agregar al carrito|add to cart|comprar ahora/.test(text)) {
        try { gaAdd({}); } catch {}
      }
      if (/ver carrito|view cart|carrito/.test(text)) {
        try { if (window.gtag) window.gtag('event', 'view_cart', {}); } catch { /* analytics is best effort */ }
      }
    };
    const obs = new MutationObserver((recs) => {
      for (const r of recs) {
        for (const node of Array.from(r.addedNodes)) {
          const el = node as HTMLElement;
          const txt = (el?.textContent || '').toLowerCase();
          if (/gracias|thank you|pedido|orden|order/.test(txt)) {
            const now = Date.now();
            if (now - lastPurchase > 5000) {
              lastPurchase = now;
              try { if (window.gtag) window.gtag('event', 'purchase', {}); } catch { /* analytics is best effort */ }
            }
          }
        }
      }
    });
    document.addEventListener('click', onClick, true);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener('click', onClick, true); obs.disconnect(); };
  }, []);
  return null;
};

export default GAListener;
