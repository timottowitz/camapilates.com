// Centralized asset paths for images used across the site.
// All files should live under the public/images folder and be referenced as
// absolute paths like "/images/hero-shop.webp" so they work in dev and prod.
//
// Use hashed URLs for cache-busting in production to avoid stale images.
import { getVersionedImageUrl as v } from '@/hooks/useVersionedImage';

export const ASSETS = {
  // Shop hero background (use known present OG image to avoid 404s)
  shopHero: v('/og/cama-de-pilates-venta-mexico.png'),

  // Shop header addon (use present brand asset)
  shopHeaderAddon: v('/brand/edelweiss.svg'),

  // Category / explore imagery
  // Round category icons (use present OG images to avoid 404)
  catReformers: v('/og/reformer-compacto.png'),
  catAccessories: v('/og/accesorios-cama-de-pilates-esenciales.png'),

  // Featured Product section image (override)
  featuredProducts: v('/images/featured-products.webp'),

  // Mylo (Mycelium) assets
  myloBadge: v('/images/badges/mylo.svg'),
  myloSpecial: v('/images/special/mylo-special.svg'),
} as const;

// Candidate images available in public for randomized visual fill
export const ASSET_CANDIDATES: string[] = [
  '/images/finish-mycelium.webp',
  '/og/reformer-compacto.png',
  '/og/cama-de-pilates-reformer.png',
  '/og/cama-de-pilates-venta-mexico.png',
  '/brand/edelweiss.svg',
];

export function pickImage(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % ASSET_CANDIDATES.length;
  return ASSET_CANDIDATES[idx];
}
