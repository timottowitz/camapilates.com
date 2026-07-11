import type { Product } from './types';
import { getOrigin } from '@/lib/seo';

export const WHATSAPP_PHONE = '525548468190';

/**
 * WhatsApp deep link with a pre-filled message referencing the product
 * of interest (name, SKU, price and product URL).
 */
export function productWhatsAppUrl(p: Product, priceOverride?: string, skuOverride?: string): string {
  const price = priceOverride || p.price;
  const sku = skuOverride || p.sku;
  const msg = [
    `Hola, me interesa comprar: ${p.name}`,
    `SKU: ${sku} · $ ${price} ${p.currency}`,
    `${getOrigin()}/product/${p.slug}`,
  ].join('\n');
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}
