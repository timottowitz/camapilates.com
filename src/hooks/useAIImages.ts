import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook for getting all AI images with generated versions
 * PREFERS GENERATED IMAGES - Returns copyright-free AI-generated versions when available
 */
export function useAllAIImages(limit?: number) {
  return useQuery(api.aiImages.listAllWithGenerated, { limit });
}

/**
 * Hook for searching AI-analyzed images by description
 */
export function useAIImageSearch(query: string, limit?: number) {
  return useQuery(api.aiImages.searchByDescription, {
    query,
    limit,
  });
}

/**
 * Hook for getting images by use case (hero, feature, blog, etc.)
 */
export function useAIImagesByUseCase(useCase: string, limit?: number) {
  return useQuery(api.aiImages.getByUseCase, {
    useCase,
    limit,
  });
}

/**
 * Hook for getting images by mood/atmosphere
 */
export function useAIImagesByMood(mood: string, limit?: number) {
  return useQuery(api.aiImages.getByMood, {
    mood,
    limit,
  });
}

/**
 * Hook for getting images pending generation
 */
export function usePendingGeneration(limit?: number) {
  return useQuery(api.aiImages.getPendingGeneration, { limit });
}

/**
 * Higher-level hook for smart image selection
 *
 * Usage:
 * ```tsx
 * const heroImage = useSmartImage({
 *   useCase: 'hero',
 *   mood: 'professional',
 *   query: 'instructor teaching class'
 * });
 * ```
 */
export function useSmartImage(options: {
  useCase?: string;
  mood?: string;
  query?: string;
  limit?: number;
}) {
  const { useCase, mood, query, limit = 1 } = options;

  // Priority: query > useCase > mood
  const byQuery = useQuery(
    query ? api.aiImages.searchByDescription : 'skip',
    query ? { query, limit } : 'skip'
  );

  const byUseCase = useQuery(
    !query && useCase ? api.aiImages.getByUseCase : 'skip',
    !query && useCase ? { useCase, limit } : 'skip'
  );

  const byMood = useQuery(
    !query && !useCase && mood ? api.aiImages.getByMood : 'skip',
    !query && !useCase && mood ? { mood, limit } : 'skip'
  );

  // Return first match from priority order
  return byQuery || byUseCase || byMood;
}
