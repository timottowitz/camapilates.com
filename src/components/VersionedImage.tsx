import React from 'react';
import { useVersionedImage } from '../hooks/useVersionedImage';

interface VersionedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The original image path (e.g., '/images/hero.webp') */
  src: string;
  /** Alt text for the image */
  alt: string;
}

/**
 * VersionedImage component that automatically uses cache-busted image URLs
 *
 * Usage:
 * <VersionedImage src="/images/hero.webp" alt="Hero image" />
 *
 * This will automatically resolve to the hashed version like:
 * "/images/hero.a1b2c3d4.jpg"
 */
export const VersionedImage: React.FC<VersionedImageProps> = ({
  src,
  alt,
  ...props
}) => {
  const versionedSrc = useVersionedImage(src);

  return (
    <img
      {...props}
      src={versionedSrc}
      alt={alt}
      loading="lazy"
    />
  );
};

export default VersionedImage;