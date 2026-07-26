import React from 'react';
import { Link } from 'react-router-dom';
import { X, Building2, Sparkles, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface ExitIntentPopupProps {
  onClose: () => void;
  onSubscribe?: (email: string) => void;
}

export function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative bg-[#2A2624] text-[#EAE8E4] rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full border border-[#EAE8E4]/15 animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-12 items-stretch">
          {/* Left side - Product Image */}
          <div className="md:col-span-5 relative bg-[#1F1C1A] flex items-center justify-center p-6 min-h-[220px] md:min-h-full">
            <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> Best Seller Estudio
            </span>

            <img
              src="/images/products/reformer-maple-barra-patentada-a001.webp"
              alt="Reformer de Maple con Barra Patentada A001"
              className="w-full h-auto max-h-[250px] object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
            />

            <div className="absolute bottom-3 left-4 right-4 text-center">
              <span className="text-[10px] text-white/60 uppercase tracking-widest block">
                Edelweiss Maple A001
              </span>
            </div>
          </div>

          {/* Right side - Studio Pack Pitch & Discounts */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                  The Studio Pack · El Pack Estudio
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif italic text-white leading-tight mb-2">
                ¿Construyendo un nuevo Estudio?
              </h2>

              <p className="text-xs sm:text-sm text-[#EAE8E4]/80 font-light leading-relaxed mb-4">
                Compra nuestros paquetes <strong className="text-white font-semibold">Studio Reformer</strong> y llévate el descuento a casa.
              </p>

              <div className="p-3 rounded-xl bg-[#1F1C1A] border border-amber-500/20 mb-4">
                <p className="text-xs italic text-amber-100 font-serif leading-snug">
                  “Nuestro Reformer de Estudio Premium para la Estética y Funcionalidad que tu Espacio Merece.”
                </p>
              </div>

              {/* Discount Tier Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#EAE8E4]/60 font-semibold block mb-1">
                  Descuentos Directos por Volumen:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                    <span className="text-xs font-bold text-white block">Pack 4</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">13% OFF</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                    <span className="text-xs font-bold text-white block">Pack 6</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">16% OFF</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-center">
                    <span className="text-xs font-bold text-amber-200 block">Pack 8</span>
                    <span className="text-[10px] text-amber-300 font-extrabold">20% OFF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-3 pt-2">
              <Link
                to="/product/reformer-maple-barra-patentada-a001"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-[#EAE8E4] text-[#2A2624] rounded-full py-3.5 px-6 uppercase tracking-[0.15em] text-xs font-bold hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-xl"
              >
                Ver Reformer de Maple A001 & Paquetes <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#EAE8E4]/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-300" /> Garantía 3 Años
                </span>
                <span>•</span>
                <span>Envíos a todo México</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage exit intent detection
export function useExitIntent(onExitIntent: () => void) {
  React.useEffect(() => {
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
    }, 4000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onExitIntent]);
}

export default ExitIntentPopup;
