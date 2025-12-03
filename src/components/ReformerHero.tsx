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
    <section className="relative w-full overflow-hidden bg-[#2A2624] text-[#EAE8E4]">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10" />
        {assets.heroEdelweiss && (
          <img
            src={assets.heroEdelweiss}
            alt="Mujer practicando pilates en reformer de madera con luz natural matutina - Edelweiss Pilates"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-8 md:px-24 py-20 md:py-28">
        <div className="max-w-3xl">

          {/* Main Title */}
          <FadeIn delay={0.1}>
            <h1 className="text-6xl md:text-9xl font-serif italic text-white leading-[0.9] mb-4">
              Edelweiss.
            </h1>
          </FadeIn>

          {/* Tagline */}
          <FadeIn delay={0.2}>
            <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed mb-8">
              Pure form. Pure materials.
            </p>
          </FadeIn>

          {/* Sub-headline */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-6">
              <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-xl">
                The world's first plastic-free pilates ecosystem. Non-toxic beds, organic wear, healthy skin.
                <br /><br />
                <span className="italic text-white/90">Your skin drinks what you wear. Detox your movement.</span>
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
                Shop Collection
              </Link>
              <Link
                to="/compare"
                className="px-8 py-4 border border-white/30 text-white rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm"
              >
                Compare Models
              </Link>
            </div>
          </FadeIn>

          {/* Trust Indicators (Minimal) */}
          <FadeIn delay={0.6}>
            <div className="mt-16 flex gap-8 text-xs font-sans tracking-widest uppercase text-white/50">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                3 Week Delivery
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                1 Year Warranty
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                Silence Guaranteed
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default ReformerHero;
