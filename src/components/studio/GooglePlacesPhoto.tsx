import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
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
 * Inner component that uses Convex hooks (only rendered when Convex is available)
 */
const GooglePlacesPhotoWithConvex: React.FC<GooglePlacesPhotoProps & { placeId: string }> = ({
  placeId,
  studioName,
  width = 800,
  height = 600,
  className = '',
  priority = 'lazy',
  showAttribution = true,
  fallbackIndex = 0,
}) => {
  const [isVisible, setIsVisible] = useState(priority === 'eager');
  const [imgError, setImgError] = useState(false);

  // Always call hook unconditionally, use 'skip' for conditional fetching
  const storedPhoto = useQuery(
    api.studioEnrichment.getStoredPhoto,
    isVisible ? { googlePlaceId: placeId, photoIndex: fallbackIndex } : 'skip'
  );

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
        rootMargin: '100px',
        threshold: 0.01,
      }
    );

    const element = document.getElementById(`photo-${placeId}-${fallbackIndex}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [placeId, fallbackIndex, priority]);

  // Determine image state
  const imageState = storedPhoto === undefined
    ? 'loading'
    : (storedPhoto?.url && !imgError)
      ? 'success'
      : 'fallback';

  const imageSrc = (storedPhoto?.url && !imgError) ? storedPhoto.url : getPlaceholderImage(fallbackIndex);
  const attribution = storedPhoto?.attribution || null;
  const studioColor = getStudioColor(studioName);
  const initials = getInitials(studioName);

  if (imageState === 'loading') {
    return (
      <div
        id={`photo-${placeId}-${fallbackIndex}`}
        className={`relative ${className}`}
        style={{ width, height }}
      >
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${studioColor.bg}`}>
          <span className={`text-6xl font-bold ${studioColor.text} opacity-20`}>
            {initials}
          </span>
        </div>
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
        onError={() => setImgError(true)}
      />

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

      <img
        src="/powered-by-google.png"
        alt="Powered by Google"
        className="absolute bottom-2 left-2 h-4"
      />
    </div>
  );
};

/**
 * Fallback component when Convex is not available
 */
const GooglePlacesPhotoFallback: React.FC<GooglePlacesPhotoProps> = ({
  placeId,
  studioName,
  width = 800,
  height = 600,
  className = '',
  fallbackIndex = 0,
}) => {
  const imageSrc = getPlaceholderImage(fallbackIndex);

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
        loading="lazy"
      />
      <img
        src="/powered-by-google.png"
        alt="Powered by Google"
        className="absolute bottom-2 left-2 h-4"
      />
    </div>
  );
};

/**
 * Main component - wrapper that checks Convex availability
 */
export const GooglePlacesPhoto: React.FC<GooglePlacesPhotoProps> = (props) => {
  // If no Convex or no placeId, use fallback
  if (!hasConvex || !props.placeId) {
    return <GooglePlacesPhotoFallback {...props} />;
  }

  return <GooglePlacesPhotoWithConvex {...props} placeId={props.placeId} />;
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
          showAttribution={index === 0}
          className="rounded-lg overflow-hidden"
        />
      ))}
    </div>
  );
};
