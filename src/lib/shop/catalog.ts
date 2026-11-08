import products from '@/content/products.json';
import shopPolicy from '@/content/shop-policy.json';
import type { Product, ReformerType } from './types';
import { slugify } from '@/utils/slug';

export function allProducts(): Product[] {
  return products as Product[];
}

export function getBySlug(slug: string): Product | undefined {
  return (products as Product[]).find(p => p.slug === slug);
}

// "1,234.50" or "21,750": cents only when the amount has them, and then always two digits.
export function formatMXN(amount: string | number): string {
  const n = Number(amount);
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString('es-MX', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 });
}

// "$1,234.50" or "$21,750".
export function priceLabel(price: string | number): string {
  return `$${formatMXN(price)}`;
}

export const REFORMER_TYPE_LABELS: Record<ReformerType, string> = {
  madera: 'Madera',
  plegable: 'Plegables',
  aluminio: 'Aluminio',
  gimnasio: 'Gimnasio',
};

export function formatPrice(p: Product): string {
  return `$ ${formatMXN(p.price)} ${p.currency}`;
}

export function toItemListSchema(origin: string, list: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: list.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        url: `${origin}/product/${p.slug}`,
        image: [origin + p.image],
        brand: { '@type': 'Brand', name: p.brand },
        sku: p.sku,
        offers: {
          '@type': 'Offer',
          url: `${origin}/product/${p.slug}`,
          priceCurrency: p.currency,
          price: p.price,
          availability: shopPolicy.availability,
          itemCondition: 'https://schema.org/NewCondition',
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'MX',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 30,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn'
          },
          shippingDetails: [
            {
              '@type': 'OfferShippingDetails',
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' },
              deliveryTime: shopPolicy.shippingDeliveryTime,
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'MXN'
              }
            }
          ]
        },
      },
    })),
  } as const;
}

export function filterByCategory(list: Product[], cats: string[]): Product[] {
  if (!cats?.length) return list;
  const set = new Set(cats.map((c) => c.toLowerCase()));
  return list.filter((p) => set.has((p.category || 'otros').toLowerCase()));
}

export function toCategorySlug(name: string): string {
  return slugify(name);
}

export function categoryFromSlug(slug: string): string | undefined {
  return allProducts().find((p) => p.category && toCategorySlug(p.category) === slug)?.category;
}

