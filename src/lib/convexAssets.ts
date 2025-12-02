/**
 * Convex-based asset configuration
 *
 * This file provides asset URLs from Convex storage instead of local files.
 * Images are fetched from Convex and served via CDN with proper cache headers.
 *
 * Benefits:
 * - No repo bloat from large images
 * - Update images without redeploying
 * - Built-in CDN from Convex
 * - Automatic cache-control headers
 * - Works with Cloudflare cache
 */

import { useConvexImage } from '@/hooks/useConvexImage';
import { getVersionedImageUrl } from '@/hooks/useVersionedImage';

/**
 * Image name constants
 * These map to the 'name' field in the site_images table
 */
export const CONVEX_IMAGE_NAMES = {
  // Shop images
  SHOP_HERO: 'shopHero',
  FEATURED_PRODUCTS: 'featuredProducts',

  // Category icons
  CAT_REFORMERS: 'catReformers',
  CAT_ACCESSORIES: 'catAccessories',

  // Finish/material images
  FINISH_MYCELIUM: 'finishMycelium',

  // Badges
  MYLO_BADGE: 'myloBadge',
  MYLO_SPECIAL: 'myloSpecial',

  // Brand
  EDELWEISS_LOGO: 'edelweissLogo',

  // Feature sections
  FEATURE_SILENCE: 'featureSilence',

  // Videos
  HERO_VIDEO: 'heroVideo',
} as const;

/**
 * Fallback URLs for images not yet in Convex
 * These are the current local image paths
 */
const FALLBACKS = {
  shopHero: '/images/reformer-pro.png',
  featuredProducts: '/images/reformer-home.png',
  catReformers: '/images/cat-icon-reformers.png',
  catAccessories: '/images/cat-icon-accessories.png',
  finishMycelium: '/images/reformer-mycelium.png',
  myloBadge: '/images/badges/mylo.svg',
  myloSpecial: '/images/special/mylo-special.svg',
  edelweissLogo: '/brand/edelweiss.svg',
  featureSilence: '/images/feature_1.webp',
  heroVideo: '', // No local fallback for video
} as const;

/**
 * Hook-based assets - use these in React components
 * These will automatically fetch from Convex or fall back to local images
 */
export function useConvexAssets() {
  const shopHero = useConvexImage(CONVEX_IMAGE_NAMES.SHOP_HERO, getVersionedImageUrl(FALLBACKS.shopHero));
  const featuredProducts = useConvexImage(CONVEX_IMAGE_NAMES.FEATURED_PRODUCTS, getVersionedImageUrl(FALLBACKS.featuredProducts));
  const catReformers = useConvexImage(CONVEX_IMAGE_NAMES.CAT_REFORMERS, getVersionedImageUrl(FALLBACKS.catReformers));
  const catAccessories = useConvexImage(CONVEX_IMAGE_NAMES.CAT_ACCESSORIES, getVersionedImageUrl(FALLBACKS.catAccessories));
  const finishMycelium = useConvexImage(CONVEX_IMAGE_NAMES.FINISH_MYCELIUM, getVersionedImageUrl(FALLBACKS.finishMycelium));
  const myloBadge = useConvexImage(CONVEX_IMAGE_NAMES.MYLO_BADGE, getVersionedImageUrl(FALLBACKS.myloBadge));
  const myloSpecial = useConvexImage(CONVEX_IMAGE_NAMES.MYLO_SPECIAL, getVersionedImageUrl(FALLBACKS.myloSpecial));
  const edelweissLogo = useConvexImage(CONVEX_IMAGE_NAMES.EDELWEISS_LOGO, getVersionedImageUrl(FALLBACKS.edelweissLogo));
  const featureSilence = useConvexImage(CONVEX_IMAGE_NAMES.FEATURE_SILENCE, getVersionedImageUrl(FALLBACKS.featureSilence));
  const heroVideo = useConvexImage(CONVEX_IMAGE_NAMES.HERO_VIDEO, FALLBACKS.heroVideo);

  return {
    shopHero,
    featuredProducts,
    catReformers,
    catAccessories,
    finishMycelium,
    myloBadge,
    myloSpecial,
    featureSilence,
    heroVideo,
    shopHeaderAddon: edelweissLogo, // Alias for compatibility
  };
}

/**
 * Migration guide:
 *
 * 1. OLD WAY (local images):
 *    import { ASSETS } from '@/lib/assets';
 *    <img src={ASSETS.shopHero} />
 *
 * 2. NEW WAY (Convex images):
 *    import { useConvexAssets } from '@/lib/convexAssets';
 *    const assets = useConvexAssets();
 *    <img src={assets.shopHero} />
 *
 * The hook will automatically:
 * - Fetch from Convex if image exists there
 * - Fall back to local versioned image if not
 * - Handle loading states
 * - Provide CDN URLs with cache headers
 */
