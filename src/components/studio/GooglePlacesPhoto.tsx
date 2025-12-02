import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPlaceholderImage, getStudioColor, getInitials } from '@/utils/studio-helpers';
import { hasConvex } from '@/lib/convexProvider';

interface GooglePlacesPhotoProps {
  placeId?: string;
  studioName: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: 'eager' | 'lazy';
  showAttribution?: boolean;
  fallbackIndex?: number;
}

/**
 * Compliant Google Places Photo Component
 *
 * This component implements the canonical architecture for displaying Google Places photos:
 * 1. Uses place_id (permanently cacheable) as the key
 * 2. Fetches fresh photo references on-demand via server proxy
 * 3. Implements multi-layer fallback strategy
 * 4. Properly displays required attribution
 * 5. Optimizes for performance with lazy loading
 */
export const GooglePlacesPhoto: React.FC<GooglePlacesPhotoProps> = ({
  placeId,
  studioName,
  width = 800,
  height = 600,
  className = '',
  priority = 'lazy',
  showAttribution = true,
  fallbackIndex = 0,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'success' | 'fallback'>('loading');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [attribution, setAttribution] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(priority === 'eager');

  // useAction requires being inside ConvexProvider
  // Since hasConvex is a module-level constant, the conditional hook is safe
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fetchPhotoUrl = hasConvex ? useAction(api.googlePlaces.getStudioPhotoUrl) : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    const element = document.getElementById(`photo-${placeId}-${fallbackIndex}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [placeId, fallbackIndex, priority]);

  // Fetch photo when visible
  useEffect(() => {
    if (!isVisible || !placeId || !fetchPhotoUrl) {
      // No place_id or no Convex, use fallback immediately
      if (!placeId || !fetchPhotoUrl) {
        setImageSrc(getPlaceholderImage(fallbackIndex));
        setImageState('fallback');
      }
      return;
    }

    let mounted = true;

    const loadPhoto = async () => {
      try {
        const result = await fetchPhotoUrl({
          placeId,
          maxWidth: width,
          maxHeight: height,
          photoIndex: fallbackIndex,
          includeAttribution: showAttribution,
        });

        if (!mounted) return;

        if (result.success && result.photoUrl) {
          setImageSrc(result.photoUrl);
          setAttribution(result.attribution);
          setImageState('success');
        } else {
          // API call failed, use fallback
          console.log(`Photo fetch failed for ${placeId}: ${result.error}`);
          setImageSrc(getPlaceholderImage(fallbackIndex));
          setImageState('fallback');
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Error fetching photo:', error);
        setImageSrc(getPlaceholderImage(fallbackIndex));
        setImageState('fallback');
      }
    };

    loadPhoto();

    return () => {
      mounted = false;
    };
  }, [isVisible, placeId, width, height, fallbackIndex, showAttribution]);

  // Generate deterministic placeholder while loading
  const studioColor = getStudioColor(studioName);
  const initials = getInitials(studioName);

  if (imageState === 'loading') {
    return (
      <div
        id={`photo-${placeId}-${fallbackIndex}`}
        className={`relative ${className}`}
        style={{ width, height }}
      >
        {/* Initial placeholder with studio initials */}
        <div
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${studioColor.bg}`}
        >
          <span className={`text-6xl font-bold ${studioColor.text} opacity-20`}>
            {initials}
          </span>
        </div>

        {/* Loading skeleton overlay */}
        <Skeleton className="absolute inset-0" />
      </div>
    );
  }

  return (
    <div
      id={`photo-${placeId}-${fallbackIndex}`}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      <img
        src={imageSrc}
        alt={studioName}
        className="w-full h-full object-cover"
        loading={priority === 'eager' ? 'eager' : 'lazy'}
        onError={(e) => {
          // Final fallback if even the placeholder fails
          const target = e.target as HTMLImageElement;
          target.src = getPlaceholderImage(fallbackIndex);
          setImageState('fallback');
        }}
      />

      {/* Attribution overlay (required by Google ToS) */}
      {attribution && showAttribution && imageState === 'success' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-md cursor-pointer hover:bg-black/80 transition-colors">
                <Info className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="flex items-start gap-2">
                {attribution.photoUri && (
                  <img
                    src={attribution.photoUri}
                    alt={attribution.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Photo by</p>
                  <a
                    href={attribution.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    {attribution.displayName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* (Removed debug-only fallback label to keep dev/prod identical) */}

      {/* "Powered by Google" attribution (required when not showing a map) */}
      <img
        src="/powered-by-google.png"
        alt="Powered by Google"
        className="absolute bottom-2 left-2 h-4"
      />
    </div>
  );
};

/**
 * Gallery component for displaying multiple photos
 */
interface PhotoGalleryProps {
  placeId?: string;
  studioName: string;
  photoCount?: number;
  className?: string;
}

export const GooglePlacesPhotoGallery: React.FC<PhotoGalleryProps> = ({
  placeId,
  studioName,
  photoCount = 5,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 ${className}`}>
      {Array.from({ length: photoCount }).map((_, index) => (
        <GooglePlacesPhoto
          key={index}
          placeId={placeId}
          studioName={studioName}
          width={400}
          height={300}
          fallbackIndex={index}
          priority={index === 0 ? 'eager' : 'lazy'}
          showAttribution={index === 0} // Only show on first image
          className="rounded-lg overflow-hidden"
        />
      ))}
    </div>
  );
};
