import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GalleryImage {
  src: string;
  alt: string;
  label?: string;
  type?: 'main' | 'lifestyle' | 'detail' | 'inuse';
}

interface EnhancedGalleryProps {
  images: GalleryImage[];
  className?: string;
  showLabels?: boolean;
}

export function EnhancedGallery({
  images,
  className = '',
  showLabels = true
}: EnhancedGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getImageTypeLabel = (type?: string) => {
    switch (type) {
      case 'lifestyle': return 'En contexto';
      case 'detail': return 'Detalle';
      case 'inuse': return 'En uso';
      default: return 'Principal';
    }
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div className="relative group">
          <div
            ref={imageRef}
            className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Image Type Badge */}
            {showLabels && selectedImage.type && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="backdrop-blur-sm bg-white/90">
                  {getImageTypeLabel(selectedImage.type)}
                </Badge>
              </div>
            )}

            {/* Main Image */}
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className={`
                w-full h-full object-cover transition-transform duration-300
                ${isZoomed ? 'scale-150 cursor-zoom-in' : 'scale-100'}
              `}
              style={isZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : undefined}
            />

            {/* Zoom Hint */}
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-3 w-3" />
                Hover para zoom
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/70 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Ver en pantalla completa"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Image Label */}
          {showLabels && selectedImage.label && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {selectedImage.label}
            </p>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`
                  relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${index === selectedIndex
                    ? 'border-primary shadow-md scale-105'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {image.type && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-medium">
                      {getImageTypeLabel(image.type)}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image Type Filters */}
        <div className="flex flex-wrap gap-2">
          {['main', 'lifestyle', 'detail', 'inuse'].map((type) => {
            const count = images.filter(img => img.type === type).length;
            if (count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => {
                  const index = images.findIndex(img => img.type === type);
                  if (index !== -1) setSelectedIndex(index);
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                {getImageTypeLabel(type)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-w-6xl w-full">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto max-h-[85vh] object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-2 rounded-lg backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EnhancedGallery;
