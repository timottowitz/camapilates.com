import { track } from './track';

// One event for every WhatsApp click, whichever button or link it was, so Rybbit funnels and goals
// can end on it. The older per-button data-rybbit-event names keep firing alongside and become the
// `placement` here; links inside blog posts report the nearest heading instead.
const WHATSAPP_LINK = 'a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp.com/send"]';

function placementOf(link: Element): string {
  const tagged = link.closest('[data-rybbit-event]')?.getAttribute('data-rybbit-event');
  if (tagged) return tagged.slice(0, 60);
  let node: Element | null = link;
  while (node) {
    let previous = node.previousElementSibling;
    while (previous) {
      if (/^H[23]$/.test(previous.tagName)) return `after: ${(previous.textContent ?? '').trim().slice(0, 50)}`;
      previous = previous.previousElementSibling;
    }
    node = node.parentElement;
  }
  return 'link';
}

export function startWhatsAppTracking() {
  if (typeof document === 'undefined') return;
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest?.(WHATSAPP_LINK);
      if (!link) return;
      const product = link.closest('[data-rybbit-prop-product]')?.getAttribute('data-rybbit-prop-product');
      track('whatsapp_click', {
        placement: placementOf(link),
        ...(product ? { product: product.slice(0, 60) } : {}),
      });
    },
    { capture: true },
  );
}
