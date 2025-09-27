import products from '@/content/products.json';
import type { Product, Region } from './types';

export function allProducts(): Product[] {
  return products as Product[];
}

export function getBySlug(slug: string): Product | undefined {
  return (products as Product[]).find(p => p.slug === slug);
}

export function productUrl(origin: string, p: Product): string {
  return `${origin}/product/${p.slug}`;
}

export function formatPrice(p: Product): string {
  // keep currency code next to price for clarity (no localization here yet)
  return `$ ${p.price} ${p.currency}`;
}

export function availabilityLabel(avail: string): string {
  if (/InStock/i.test(avail)) return 'En stock';
  if (/PreOrder/i.test(avail)) return 'Preorden';
  if (/OutOfStock/i.test(avail)) return 'Agotado';
  return 'Disponibilidad variable';
}

export function regionEstimate(region: Region): string {
  if (region === 'MX') return 'Entrega estimada: 5–7 días';
  if (region === 'US') return 'Entrega estimada: 12–18 días (estimado)';
  return 'Entrega estimada: 12–21 días (estimado)';
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
        url: `${origin}/product/${p.slug}`,
        image: [origin + p.image],
        brand: { '@type': 'Brand', name: p.brand },
        offers: {
          '@type': 'Offer',
          priceCurrency: p.currency,
          price: p.price,
          availability: p.availability,
        },
      },
    })),
  } as const;
}

