import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useMemo } from 'react';
import { hasConvex } from '@/lib/convexProvider';

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
  // Skip query entirely if Convex is not configured to avoid provider errors
  const image = useQuery(api.siteImages.getByName, hasConvex ? { name } : undefined);

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
  const images = useQuery(api.siteImages.listByCategory, hasConvex ? { category } : undefined);
  return images || [];
}

/**
 * Hook to get all active Convex images
 * Useful for admin/management interfaces
 */
export function useAllConvexImages() {
  const images = useQuery(api.siteImages.listActive, hasConvex ? {} : undefined as any);
  return images || [];
}
