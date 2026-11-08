import type { Product } from './types';
import { getOrigin } from '@/lib/seo';
import type { BundlePriceCalculation } from './bundles';
import { formatMXN } from './catalog';

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
      `Paquete Preferencial de Estudio (${bundleCalc.quantity} Unidades)`,
      `Precio Unitario: $${formatMXN(bundleCalc.discountedUnitPrice)} ${p.currency}`,
      `Total Paquete (${bundleCalc.quantity} Reformers): $${formatMXN(bundleCalc.discountedTotalPrice)} ${p.currency}`,
      `Ahorro total: $${formatMXN(bundleCalc.totalSavings)} ${p.currency}`,
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
