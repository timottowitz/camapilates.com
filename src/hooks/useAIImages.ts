import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook for getting all AI images with generated versions
 * PREFERS GENERATED IMAGES - Returns copyright-free AI-generated versions when available
 */
export function useAllAIImages(limit?: number) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  return useQuery(api.aiImages.listAllWithGenerated, token ? ({ token, limit } as any) : ('skip' as any));
}

/**
 * Hook for searching AI-analyzed images by description
 */
export function useAIImageSearch(query: string, limit?: number) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  return useQuery(
    api.aiImages.searchByDescription,
    token ? ({ token, query, limit } as any) : ('skip' as any)
  );
}

/**
 * Hook for getting images by use case (hero, feature, blog, etc.)
 */
export function useAIImagesByUseCase(useCase: string, limit?: number) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  return useQuery(api.aiImages.getByUseCase, token ? ({ token, useCase, limit } as any) : ('skip' as any));
}

/**
 * Hook for getting images by mood/atmosphere
 */
export function useAIImagesByMood(mood: string, limit?: number) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  return useQuery(api.aiImages.getByMood, token ? ({ token, mood, limit } as any) : ('skip' as any));
}

/**
 * Hook for getting images pending generation
 */
export function usePendingGeneration(limit?: number) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  return useQuery(api.aiImages.getPendingGeneration, token ? ({ token, limit } as any) : ('skip' as any));
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
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';

  // Priority: query > useCase > mood
  const byQuery = useQuery(
    query ? api.aiImages.searchByDescription : 'skip',
    query && token ? ({ token, query, limit } as any) : 'skip'
  );

  const byUseCase = useQuery(
    !query && useCase ? api.aiImages.getByUseCase : 'skip',
    !query && useCase && token ? ({ token, useCase, limit } as any) : 'skip'
  );

  const byMood = useQuery(
    !query && !useCase && mood ? api.aiImages.getByMood : 'skip',
    !query && !useCase && mood && token ? ({ token, mood, limit } as any) : 'skip'
  );

  // Return first match from priority order
  return byQuery || byUseCase || byMood;
}
