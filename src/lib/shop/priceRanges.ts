import { allProducts, priceLabel } from './catalog';
import type { Product } from './types';

// Price groups for the landing and price pages, derived from products.json so their copy
// follows the catalogue: gym machines, reformers with a tower, and everything else (home).
const reformers = allProducts().filter((p) => p.category === 'Reformers');
export const REFORMER_COUNT = reformers.length;
const slugsWhere = (test: (p: Product) => boolean) => reformers.filter(test).map((p) => p.slug);

export const GYM_SLUGS = slugsWhere((p) => p.type === 'gimnasio');
export const TOWER_SLUGS = slugsWhere((p) => p.type !== 'gimnasio' && Boolean(p.specs?.torre));
export const HOME_SLUGS = slugsWhere((p) => p.type !== 'gimnasio' && !p.specs?.torre);

export const priceOf = (slug: string) => Number(reformers.find((p) => p.slug === slug)?.price);

export function rangeOf(slugs: string[]) {
  const values = slugs.map(priceOf);
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function rangeLabel(slugs: string[]) {
  const { min, max } = rangeOf(slugs);
  return `${priceLabel(min)} – ${priceLabel(max)} MXN`;
}

export const HOME = rangeOf(HOME_SLUGS);
export const TOWER = rangeOf(TOWER_SLUGS);
export const GYM = rangeOf(GYM_SLUGS);

export const CATALOG_MIN = priceLabel(HOME.min);
export const CATALOG_MAX = priceLabel(GYM.max);
