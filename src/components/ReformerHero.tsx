'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ShieldCheck } from 'lucide-react';
import { useConvexAssets } from '@/lib/convexAssets';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const ReformerHero = () => {
  const assets = useConvexAssets();

  return (
    <section className="relative w-full bg-[#EAE8E4] pt-2 px-2 md:pt-3 md:px-3">
      <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl bg-[#2A2624] text-[#EAE8E4]">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10 rounded-xl md:rounded-2xl" />
          {assets.heroEdelweiss && (
            <img
              src={assets.heroEdelweiss}
              alt="Mujer practicando pilates en cama de pilates reformer Edelweiss de madera de nogal con luz natural - equipo premium libre de plasticos para casa y estudio en Mexico"
              className="absolute inset-0 w-full h-full object-cover object-center rounded-xl md:rounded-2xl"
              loading="eager"
              fetchPriority="high"
            />
          )}
        </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-8 md:px-24 py-20 md:py-28">
        <div className="max-w-3xl">

          {/* SEO H1 - Visually hidden but read by Google and screen readers */}
          <h1 className="sr-only">
            Cama de Pilates Reformer en México - Edelweiss Pilates | Equipo Premium de Madera de Nogal
          </h1>

          {/* Visual Title */}
          <FadeIn delay={0.1}>
            <p className="text-6xl md:text-9xl font-serif italic text-white leading-[0.9] mb-4" aria-hidden="true">
              Edelweiss.
            </p>
          </FadeIn>

          {/* Tagline */}
          <FadeIn delay={0.2}>
            <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed mb-8">
              Forma pura. Materiales puros.
            </p>
          </FadeIn>

          {/* Sub-headline */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-6">
              <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-xl">
                El primer ecosistema de pilates libre de plásticos. Camas no tóxicas, ropa orgánica, piel sana.
                <br /><br />
                <span className="italic text-white/90">Tu piel absorbe lo que usas. Desintoxica tu movimiento.</span>
              </p>
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.4}>
            <div className="mt-12 flex flex-wrap gap-6 items-center">
              <Link
                to="/shop"
                className="px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors duration-300"
              >
                Ver Colección
              </Link>
              <Link
                to="/compare"
                className="px-8 py-4 border border-white/30 text-white rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm"
              >
                Comparar Modelos
              </Link>
            </div>
          </FadeIn>

          {/* Trust Indicators (Minimal) */}
          <FadeIn delay={0.6}>
            <div className="mt-16 flex flex-wrap gap-6 md:gap-8 text-xs font-sans tracking-widest uppercase text-white/50">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                Entrega 3 Semanas
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                Garantía 1 Año
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                Silencio Garantizado
              </div>
            </div>
          </FadeIn>

          {/* Secondary CTAs */}
          <FadeIn delay={0.7}>
            <div className="mt-10 flex flex-wrap gap-6 text-xs font-sans tracking-widest uppercase">
              <Link
                to="/estudios-de-pilates"
                className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-[#5D7A99] rounded-full"></span>
                Buscar Estudio
              </Link>
              <Link
                to="/blog"
                className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-[#8B7355] rounded-full"></span>
                Leer Guías
              </Link>
            </div>
          </FadeIn>

        </div>
      </div>
      </div>
    </section>
  );
};

export default ReformerHero;
