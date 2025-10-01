import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useMemo } from 'react';

/**
 * Hook to get a Convex-stored image by name
 * Returns the image URL with proper cache control
 *
 * @param name - The image name (e.g., "shopHero", "featuredProducts")
 * @param fallback - Optional fallback URL if image not found
 * @returns Image URL or fallback
 *
 * @example
 * const heroUrl = useConvexImage('shopHero', '/og/fallback.png');
 */
export function useConvexImage(name: string, fallback?: string): string | undefined {
  const image = useQuery(api.siteImages.getByName, { name });

  return useMemo(() => {
    if (image?.url) return image.url;
    return fallback;
  }, [image?.url, fallback]);
}

/**
 * Hook to get multiple Convex images by category
 *
 * @param category - The image category (e.g., "hero", "featured", "icon")
 * @returns Array of images with URLs
 */
export function useConvexImagesByCategory(category: string) {
  const images = useQuery(api.siteImages.listByCategory, { category });
  return images || [];
}

/**
 * Hook to get all active Convex images
 * Useful for admin/management interfaces
 */
export function useAllConvexImages() {
  const images = useQuery(api.siteImages.listActive, {});
  return images || [];
}
