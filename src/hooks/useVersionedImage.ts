import { useMemo } from 'react';

// Import the image manifest synchronously
let imageManifest: Record<string, { original: string; hashed: string; hash: string }> = {};

// Synchronous import of manifest
try {
  // Use require for synchronous import in both dev and build
  // @ts-ignore - TypeScript doesn't like require in ES modules
  imageManifest = require('../image-manifest.json');
} catch (error) {
  // Fallback if manifest doesn't exist
  console.warn('Image manifest not found, using original URLs');
}

/**
 * Hook to get versioned image URLs for cache busting
 * @param imagePath - The original image path (e.g., '/images/hero.jpg')
 * @returns The versioned image URL with hash for cache busting
 */
export function useVersionedImage(imagePath: string): string {
  return useMemo(() => {
    // Ensure path starts with /
    const normalizedPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;

    // Return hashed version if available, otherwise original
    const manifestEntry = imageManifest[normalizedPath];
    if (manifestEntry) {
      return manifestEntry.hashed;
    }

    // Fallback to original path
    return normalizedPath;
  }, [imagePath]);
}

/**
 * Utility function to get versioned image URL (non-hook version)
 * @param imagePath - The original image path
 * @returns The versioned image URL
 */
export function getVersionedImageUrl(imagePath: string): string {
  const normalizedPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  const manifestEntry = imageManifest[normalizedPath];
  return manifestEntry ? manifestEntry.hashed : normalizedPath;
}

/**
 * Get all images in the manifest
 */
export function getAllVersionedImages(): Record<string, { original: string; hashed: string; hash: string }> {
  return imageManifest;
}