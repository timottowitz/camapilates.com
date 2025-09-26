import React from 'react';

export type FinishKey = 'walnut' | 'white' | 'black' | 'mycelium';

export const FINISHES: Record<FinishKey, { name: string; img: string; description: string; sustainable?: boolean; swatch?: string }> = {
  walnut: {
    name: 'Nogal',
    img: '/images/finish-walnut.jpg',
    description: 'Madera de nogal con veta cálida y acabado protector que respira.',
    swatch: '#6B4F3B'
  },
  white: {
    name: 'Blanco',
    img: '/images/finish-white.jpg',
    description: 'Superficie limpia y luminosa que realza la luz del estudio.',
    swatch: '#F3F4F6'
  },
  black: {
    name: 'Negro',
    img: '/images/finish-black.jpg',
    description: 'Elegante y sobrio; oculta marcas de uso con facilidad.',
    swatch: '#111827'
  },
  mycelium: {
    name: 'Micelio (sostenible)',
    img: '/images/finish-mycelium.webp',
    description: 'Cuero de micelio: alternativa renovable con tacto cálido y alta resistencia en pruebas de flexión y abrasión.',
    sustainable: true,
    swatch: '#C8B9A6'
  },
};

export const Finishes: React.FC<{
  value: FinishKey;
  onChange: (f: FinishKey) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const gallery = [FINISHES[value].img].filter(Boolean);
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Acabados disponibles</h2>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {(Object.keys(FINISHES) as FinishKey[]).map((key) => (
          <button
            key={`sw-${key}`}
            type="button"
            onClick={() => onChange(key)}
            className={`h-7 w-7 rounded-full border ${value === key ? 'border-foreground ring-2 ring-foreground/50' : 'border-border'}`}
            style={{ background: FINISHES[key].swatch || '#E5E7EB' }}
            aria-label={FINISHES[key].name}
            aria-pressed={value === key}
            title={FINISHES[key].name}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {(Object.keys(FINISHES) as FinishKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-md border px-3 py-2 text-sm ${
              value === key ? 'border-foreground' : 'border-border'
            }`}
            aria-pressed={value === key}
          >
            {FINISHES[key].name}
          </button>
        ))}
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="aspect-video w-full bg-muted grid place-content-center">
            <img src={FINISHES[value].img} alt={FINISHES[value].name} className="h-full w-full object-cover cursor-zoom-in" loading="lazy" onClick={() => setOpen(true)} onError={(e) => ((e.currentTarget.style.display = 'none'))} />
            {/* if image missing, keep neutral background */}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{FINISHES[value].description}</p>
          {FINISHES[value].sustainable && (
            <p className="mt-2"><strong>Opción sostenible:</strong> cuero a base de micelio con menor impacto ambiental, alineado con la energía de protección y gracia que buscamos en el estudio.</p>
          )}
          <button type="button" onClick={() => setOpen(true)} className="mt-3 text-primary hover:underline text-xs">Ver galería</button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 grid place-content-center p-6" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-4xl w-[90vw] bg-background rounded-lg overflow-hidden border border-border shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="text-sm font-semibold text-foreground">{FINISHES[value].name}</div>
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)} aria-label="Cerrar">Cerrar</button>
              </div>
              <div className="p-4 grid gap-4 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <img key={i} src={src} alt={`${FINISHES[value].name} ${i+1}`} className="w-full h-auto rounded-md border border-border" loading="lazy" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
