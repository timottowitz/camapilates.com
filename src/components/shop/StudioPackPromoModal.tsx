import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Building2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudioPackPromoModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Badge for Users who want to reopen */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2A2624] text-[#EAE8E4] border border-[#EAE8E4]/20 shadow-xl hover:scale-105 transition-all duration-300 group"
          aria-label="Ver Paquetes de Estudio"
        >
          <Building2 className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            El Pack Estudio · Hasta 20% OFF
          </span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md">
            {/* Modal Overlay Click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#2A2624] text-[#EAE8E4] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE8E4]/15 z-10"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-12 items-stretch">
                {/* Left Column: Reformer A001 Image */}
                <div className="md:col-span-5 relative bg-[#1F1C1A] flex items-center justify-center p-6 min-h-[220px] md:min-h-full">
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" /> Best Seller Estudio
                  </span>
                  
                  <img
                    src="/images/products/reformer-maple-barra-patentada-a001.webp"
                    alt="Reformer de Maple con Barra Patentada A001"
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[260px] object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                  />

                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <span className="text-[10px] text-white/60 uppercase tracking-widest block">
                      Edelweiss Maple A001
                    </span>
                  </div>
                </div>

                {/* Right Column: High-Converting Copy & Discounts */}
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-amber-300" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                        Oportunidad de Equipamiento
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif italic text-white leading-tight mb-3">
                      ¿Construyendo un nuevo Estudio?
                    </h2>

                    <p className="text-sm text-[#EAE8E4]/80 font-light leading-relaxed mb-4">
                      Compra nuestros paquetes <strong className="text-white font-semibold">Studio Reformer</strong> y llévate el descuento directo a tu proyecto.
                    </p>

                    <div className="p-3.5 rounded-xl bg-[#1F1C1A] border border-amber-500/20 mb-4">
                      <p className="text-xs italic text-amber-100 font-serif leading-snug">
                        “Nuestro Reformer de Estudio Premium para la Estética y Funcionalidad que tu Espacio Merece.”
                      </p>
                    </div>

                    {/* Discount Tier Pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-[#EAE8E4]/60 font-semibold block mb-1">
                        Descuentos por Volumen:
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

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <Link
                      to="/product/reformer-maple-barra-patentada-a001"
                      onClick={handleClose}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudioPackPromoModal;
