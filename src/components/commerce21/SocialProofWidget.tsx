import React, { useState, useEffect } from 'react';
import { CheckCircle2, MapPin, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Purchase {
  id: string;
  customerName: string;
  location: string;
  product: string;
  timeAgo: string;
  verified: boolean;
}

// Mock purchase data (in production, fetch from API)
const mockPurchases: Purchase[] = [
  { id: '1', customerName: 'María G.', location: 'Ciudad de México', product: 'Reformer Profesional', timeAgo: 'hace 3 minutos', verified: true },
  { id: '2', customerName: 'Carlos R.', location: 'Monterrey', product: 'Reformer Casa', timeAgo: 'hace 12 minutos', verified: true },
  { id: '3', customerName: 'Ana L.', location: 'Guadalajara', product: 'Reformer Mycelium', timeAgo: 'hace 23 minutos', verified: true },
  { id: '4', customerName: 'Roberto M.', location: 'Puebla', product: 'Pack Estudio (8 unidades)', timeAgo: 'hace 1 hora', verified: true },
  { id: '5', customerName: 'Laura S.', location: 'Querétaro', product: 'Reformer Profesional', timeAgo: 'hace 2 horas', verified: true },
  { id: '6', customerName: 'Diego P.', location: 'Cancún', product: 'Reformer Casa', timeAgo: 'hace 3 horas', verified: true },
];

export function LivePurchaseNotifications() {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let index = 0;

    const showNextPurchase = () => {
      setCurrentPurchase(mockPurchases[index]);
      setIsVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);

      index = (index + 1) % mockPurchases.length;
    };

    // Show first notification after 5 seconds
    const initialTimer = setTimeout(showNextPurchase, 5000);

    // Show new notification every 15 seconds
    const interval = setInterval(showNextPurchase, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!currentPurchase || !isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-20 left-4 z-40 max-w-sm
        animate-in slide-in-from-left duration-500
        ${!isVisible ? 'animate-out slide-out-to-left' : ''}
      `}
    >
      <div className="bg-card border border-border rounded-lg shadow-xl p-4 pr-10 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground text-sm">
                {currentPurchase.customerName}
              </span>
              {currentPurchase.verified && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  ✓ Verificado
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              acaba de comprar <span className="font-medium text-foreground">{currentPurchase.product}</span>
            </p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{currentPurchase.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{currentPurchase.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrustMetrics({ className = '' }: { className?: string }) {
  const [counts, setCounts] = useState({
    customers: 0,
    studios: 0,
    rating: 0,
  });

  useEffect(() => {
    // Animate counters
    const targets = {
      customers: 1247,
      studios: 156,
      rating: 4.9,
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        customers: Math.floor(targets.customers * progress),
        studios: Math.floor(targets.studios * progress),
        rating: +(targets.rating * progress).toFixed(1),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`grid grid-cols-3 gap-6 ${className}`}>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
          {counts.customers.toLocaleString('es-MX')}+
        </div>
        <div className="text-sm text-muted-foreground">Clientes satisfechos</div>
      </div>

      <div className="text-center border-x border-border">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
          {counts.studios}+
        </div>
        <div className="text-sm text-muted-foreground">Estudios equipados</div>
      </div>

      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1 flex items-center justify-center gap-1">
          {counts.rating}
          <span className="text-yellow-400">★</span>
        </div>
        <div className="text-sm text-muted-foreground">Calificación promedio</div>
      </div>
    </div>
  );
}

export function CustomerReviewsPreview({ className = '' }: { className?: string }) {
  const reviews = [
    {
      id: 1,
      name: 'Laura M.',
      location: 'CDMX',
      rating: 5,
      text: 'El reformer transformó mi estudio. Silencioso y elegante.',
      verified: true,
    },
    {
      id: 2,
      name: 'Carlos R.',
      location: 'Monterrey',
      rating: 5,
      text: 'Excelente calidad de materiales. Vale cada peso.',
      verified: true,
    },
    {
      id: 3,
      name: 'Ana G.',
      location: 'Guadalajara',
      rating: 5,
      text: 'La inversión se pagó sola en 6 meses. Mis clientas encantadas.',
      verified: true,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Lo que dicen nuestros clientes</h3>
        <Badge variant="secondary" className="text-xs">
          4.9★ (127 reseñas)
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              {review.verified && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  ✓ Verificado
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              "{review.text}"
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{review.name}</span>
              <span>•</span>
              <span>{review.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default { LivePurchaseNotifications, TrustMetrics, CustomerReviewsPreview };
