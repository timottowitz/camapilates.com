import React, { useState, useEffect } from 'react';
import { X, Gift, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExitIntentPopupProps {
  onClose: () => void;
  onSubscribe: (email: string) => void;
}

export function ExitIntentPopup({ onClose, onSubscribe }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSuccess(true);
    onSubscribe(email);

    // Close after showing success message
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">¡Listo!</h3>
          <p className="text-muted-foreground">
            Revisa tu correo para obtener tu código de descuento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-card rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full animate-in zoom-in duration-300">
        <div className="grid md:grid-cols-2">
          {/* Left side - Visual */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 flex flex-col justify-center items-center text-center hidden md:flex">
            <div className="absolute top-4 right-4">
              <Badge variant="destructive" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Oferta limitada
              </Badge>
            </div>

            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Gift className="h-12 w-12 text-primary" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">
              ¡Espera!
            </h2>
            <p className="text-xl text-foreground font-semibold mb-2">
              10% de descuento
            </p>
            <p className="text-muted-foreground">
              en tu primera compra
            </p>

            {/* Benefits */}
            <div className="mt-8 space-y-3 text-left w-full max-w-xs">
              {[
                'Acceso anticipado a nuevos productos',
                'Descuentos exclusivos mensuales',
                'Guías y tips de Pilates gratis'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-8 md:p-10 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="md:hidden mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-3">
                <Gift className="h-5 w-5" />
                10% OFF
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Obtén tu descuento
            </h3>
            <p className="text-muted-foreground mb-6">
              Únete a más de 1,200 instructores y recibe ofertas exclusivas
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Obtener mi descuento
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Al suscribirte, aceptas recibir correos promocionales. Puedes darte de baja en cualquier momento.
              </p>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Sin spam</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Datos seguros</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Únete a <span className="font-semibold text-foreground">1,247 instructores</span> que ya reciben ofertas exclusivas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage exit intent detection
export function useExitIntent(onExitIntent: () => void) {
  useEffect(() => {
    let hasShown = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (e.clientY <= 0 && !hasShown) {
        hasShown = true;
        onExitIntent();
      }
    };

    // Add delay to avoid triggering too early
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onExitIntent]);
}

export default ExitIntentPopup;
