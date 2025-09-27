import React from 'react';
import { Star } from 'lucide-react';

interface ReviewItem {
  name: string;
  role?: string;
  quote: string;
  rating?: number; // 1-5
}

export const ReviewsPreview: React.FC<{ items?: ReviewItem[]; productSlug?: string; onAggregate?: (avg: number, count: number) => void }> = ({ items, productSlug, onAggregate }) => {
  const [data, setData] = React.useState<ReviewItem[] | null>(items || null);

  React.useEffect(() => {
    if (data || !productSlug) return;
    (async () => {
      try {
        const res = await fetch('/data/reviews.json');
        if (!res.ok) return;
        const json = await res.json();
        const list: ReviewItem[] = json?.[productSlug] || [];
        setData(list.length ? list : null);
      } catch { /* ignore */ }
    })();
  }, [productSlug, data]);

  const list: ReviewItem[] = data || [
    {
      name: 'Laura • Instructora',
      quote:
        'El deslizamiento es silencioso y estable. Se nota la calidad en cuero y madera — ideal para clases largas.',
      rating: 5,
    },
    {
      name: 'Andrea • Estudio CDMX',
      quote:
        'Fácil de mantener y cero crujidos. La estética suma a la experiencia del estudio.',
      rating: 5,
    },
    {
      name: 'Mariana • Instructora',
      quote:
        'El ajuste de muelles se siente consistente. Transmite confianza al enseñar.',
      rating: 5,
    },
  ];

  const avg = list.length ? list.reduce((a, r) => a + (r.rating || 5), 0) / list.length : 0;
  // Avoid infinite loops: do not depend on onAggregate identity
  React.useEffect(() => {
    if (onAggregate) onAggregate(avg, list.length);
  }, [avg, list.length]);

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Opiniones (piloto)</h2>
        <div className="text-sm text-muted-foreground">Reseñas públicas próximamente</div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {list.map((r, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: r.rating || 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm text-foreground">“{r.quote}”</p>
            <div className="text-xs text-muted-foreground">{r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
