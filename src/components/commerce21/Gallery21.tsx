import React from 'react';

type Props = {
  images: string[];
  altPrefix?: string;
};

const Gallery21: React.FC<Props> = ({ images, altPrefix = 'Producto' }) => {
  const [idx, setIdx] = React.useState(0);
  const current = images?.[idx] || images?.[0];
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') setIdx((i) => Math.min((images.length - 1), i + 1));
    if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
  };
  return (
    <div className="w-full" onKeyDown={onKey} tabIndex={0} aria-label="Galería de imágenes del producto">
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted mb-3">
        {current && (
          <img
            src={current}
            alt={`${altPrefix} - imagen ${idx + 1}`}
            className="h-full w-full object-cover"
            loading="eager"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={idx === i}
            className={`aspect-square overflow-hidden rounded-md border ${idx === i ? 'border-foreground' : 'border-border'} bg-card`}
            title={`Ver imagen ${i + 1}`}
          >
            <img src={src} alt={`${altPrefix} miniatura ${i + 1}`} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery21;

