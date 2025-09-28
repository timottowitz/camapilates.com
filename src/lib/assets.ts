// Centralized asset paths for images used across the site.
// All files should live under the public/images folder and be referenced as 
// absolute paths like "/images/hero-shop.webp" so they work in dev and prod.

export const ASSETS = {
  // Shop hero background
  shopHero: '/images/hero-shop.webp',

  // Shop header addon (small promo/app graphic)
  shopHeaderAddon: '/images/shop-addon.webp',

  // Category / explore imagery
  // Round category icons (user-provided circular-center images)
  catReformers: '/images/reformers.webp',
  catAccessories: '/images/accessories.webp',

  // Featured Product section image (override)
  featuredProducts: '/images/featured-products.webp',

  // Mylo (Mycelium) assets
  myloBadge: '/images/badges/mylo.svg',
  myloSpecial: '/images/special/mylo-special.svg',
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
