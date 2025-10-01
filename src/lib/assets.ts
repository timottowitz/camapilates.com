// Centralized asset paths for images used across the site.
// All files should live under the public/images folder and be referenced as
// absolute paths like "/images/hero-shop.webp" so they work in dev and prod.
//
// Use hashed URLs for cache-busting in production to avoid stale images.
import { getVersionedImageUrl as v } from '@/hooks/useVersionedImage';

export const ASSETS = {
  // Shop hero background
  shopHero: v('/images/hero-shop.webp'),

  // Shop header addon (small promo/app graphic)
  shopHeaderAddon: v('/images/shop-addon.webp'),

  // Category / explore imagery
  // Round category icons (user-provided circular-center images)
  catReformers: v('/images/reformers.webp'),
  catAccessories: v('/images/accessories.webp'),

  // Featured Product section image (override)
  featuredProducts: v('/images/featured-products.webp'),

  // Mylo (Mycelium) assets
  myloBadge: v('/images/badges/mylo.svg'),
  myloSpecial: v('/images/special/mylo-special.svg'),
} as const;

// Candidate images available in public for randomized visual fill
export const ASSET_CANDIDATES: string[] = [
  '/images/finish-walnut.jpg',
  '/images/finish-white.jpg',
  '/images/finish-black.jpg',
  '/images/finish-mycelium.webp',
  '/images/hero-shop.webp',
  '/og/cama-de-pilates-venta-mexico.png',
];

export function pickImage(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % ASSET_CANDIDATES.length;
  return ASSET_CANDIDATES[idx];
}
