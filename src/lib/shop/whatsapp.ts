import type { Product } from './types';
import { getOrigin } from '@/lib/seo';
import type { BundlePriceCalculation } from './bundles';

export const WHATSAPP_PHONE = '525548468190';

/**
 * WhatsApp deep link with a pre-filled message referencing the product
 * of interest (name, SKU, price, bundle options, and product URL).
 */
export function productWhatsAppUrl(
  p: Product,
  priceOverride?: string,
  skuOverride?: string,
  bundleCalc?: BundlePriceCalculation
): string {
  const sku = skuOverride || p.sku;
  const url = `${getOrigin()}/product/${p.slug}`;

  let msgParts: string[] = [];

  if (bundleCalc && bundleCalc.quantity > 1) {
    msgParts = [
      `Hola, me interesa comprar el Paquete de ${bundleCalc.quantity} unidades de: ${p.name}`,
      `Descuento aplicado: ${bundleCalc.discountPercentage}% OFF (Estudio)`,
      `Precio Unitario: $${bundleCalc.discountedUnitPrice.toLocaleString('es-MX')} ${p.currency}`,
      `Total Paquete (${bundleCalc.quantity} Reformers): $${bundleCalc.discountedTotalPrice.toLocaleString('es-MX')} ${p.currency}`,
      `Ahorro total: $${bundleCalc.totalSavings.toLocaleString('es-MX')} ${p.currency}`,
      `SKU: ${sku}`,
      url,
    ];
  } else {
    const price = priceOverride || p.price;
    msgParts = [
      `Hola, me interesa comprar: ${p.name}`,
      `SKU: ${sku} · $ ${price} ${p.currency}`,
      url,
    ];
  }

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msgParts.join('\n'))}`;
}
