/**
 * Helper functions for studio data processing
 */

/**
 * Generate a deterministic color based on studio name
 */
export function getStudioColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'from-purple-100 to-pink-100', text: 'text-purple-600' },
    { bg: 'from-blue-100 to-cyan-100', text: 'text-blue-600' },
    { bg: 'from-green-100 to-emerald-100', text: 'text-green-600' },
    { bg: 'from-yellow-100 to-orange-100', text: 'text-yellow-600' },
    { bg: 'from-pink-100 to-rose-100', text: 'text-pink-600' },
    { bg: 'from-indigo-100 to-purple-100', text: 'text-indigo-600' },
  ];

  // Get a deterministic index based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colors.length;

  return colors[index];
}

/**
 * Get placeholder image URL for studio
 * Using Unsplash for high-quality Pilates images
 */
export function getPlaceholderImage(index: number = 0): string {
  const pilatesImages = [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop', // Pilates reformer
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop', // Pilates studio
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', // Woman on reformer
    'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=400&h=300&fit=crop', // Pilates class
    'https://images.unsplash.com/photo-1540206063137-4a88ca974d1a?w=400&h=300&fit=crop', // Pilates mat
    'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=300&fit=crop', // Studio interior
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', // Yoga/Pilates
    'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&h=300&fit=crop', // Exercise equipment
  ];

  return pilatesImages[index % pilatesImages.length];
}

/**
 * Process photo URL from Google Places
 * Important: Google Places photo references expire quickly and cannot be cached
 * For production, photos should be fetched on-demand via server-side API
 */
export function processPhotoUrl(url: string | undefined, studioName: string, index: number = 0): string {
  if (!url) {
    // Return a placeholder image if no URL provided
    return getPlaceholderImage(index);
  }

  // Check if it's a Google Places photo URL
  if (url.includes('places.googleapis.com')) {
    // Google Places photo references expire, so we can't reliably use cached URLs
    // Return a placeholder for now - in production, fetch fresh URLs on-demand
    return getPlaceholderImage(index);
  }

  // Return the URL as-is if it's not a Google Places URL
  return url;
}

/**
 * Generate Google Places Photo URL from photo name
 * @param photoName - The photo resource name from Places API (e.g., "places/ChIJ.../photos/...")
 * @param maxWidth - Maximum width in pixels (1-4800)
 * @param maxHeight - Maximum height in pixels (1-4800)
 */
export function generatePlacesPhotoUrl(
  photoName: string,
  maxWidth: number = 800,
  maxHeight: number = 600
): string {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || !photoName) {
    return getPlaceholderImage(0);
  }

  // Ensure the photo name starts with the correct format
  const fullPhotoName = photoName.startsWith('places/')
    ? photoName
    : `places/${photoName}`;

  // Construct the URL according to Google's specification
  const baseUrl = 'https://places.googleapis.com/v1';
  const photoUrl = `${baseUrl}/${fullPhotoName}/media`;

  // Add required parameters
  const params = new URLSearchParams({
    maxHeightPx: Math.min(maxHeight, 4800).toString(),
    maxWidthPx: Math.min(maxWidth, 4800).toString(),
    key: apiKey
  });

  return `${photoUrl}?${params.toString()}`;
}

/**
 * Format price for display
 */
export function formatPrice(min?: number, max?: number, currency: string = 'MXN'): string {
  if (!min && !max) return 'Contactar para precios';

  const symbol = currency === 'MXN' ? '$' : currency;

  if (!max || min === max) {
    return `${symbol}${min}`;
  }

  return `${symbol}${min} - ${symbol}${max}`;
}

/**
 * Format distance for display
 */
export function formatDistance(distance?: number): string | null {
  if (!distance) return null;

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }

  return `${distance.toFixed(1)}km`;
}

/**
 * Get quality badge color based on score
 */
export function getQualityBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get initials from studio name
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}