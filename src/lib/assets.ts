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
