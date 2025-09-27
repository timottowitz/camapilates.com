import products from '@/content/products.json';
import type { Product, Region, FinishKey } from './types';

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

export function categoriesWithCounts(list: Product[] = allProducts()): { name: string; slug: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of list) {
    const cat = (p.category || 'Otros').trim();
    map.set(cat, (map.get(cat) || 0) + 1);
  }
  const items = Array.from(map.entries()).map(([name, count]) => ({ name, count, slug: toCategorySlug(name) }));
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterByCategory(list: Product[], cats: string[]): Product[] {
  if (!cats?.length) return list;
  const set = new Set(cats.map((c) => c.toLowerCase()));
  return list.filter((p) => set.has((p.category || 'otros').toLowerCase()));
}

export function toCategorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function categoryFromSlug(slug: string): string | undefined {
  const cats = categoriesWithCounts();
  return cats.find((c) => c.slug === slug)?.name;
}

export function availableFinishes(list: Product[] = allProducts()): FinishKey[] {
  const set = new Set<FinishKey>();
  for (const p of list) {
    (p.finishes || []).forEach((f) => set.add(f));
  }
  return Array.from(set);
}

export function filterByFinishes(list: Product[], fins: FinishKey[]): Product[] {
  if (!fins?.length) return list;
  const set = new Set(fins);
  return list.filter((p) => (p.finishes || []).some((f) => set.has(f)));
}

export function filterByAvailability(list: Product[], statuses: string[]): Product[] {
  if (!statuses?.length) return list;
  const set = new Set(statuses.map((s) => s.toLowerCase()));
  return list.filter((p) => set.has((p.availability || '').toLowerCase()));
}
