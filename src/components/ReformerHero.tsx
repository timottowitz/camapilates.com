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
      {/* Video Background - Native 1920x700 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Refined Overlay */}
        {assets.heroVideo && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          >
            <source src={assets.heroVideo} type="video/quicktime" />
          </video>
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-8 md:px-24 py-20 md:py-28">
        <div className="max-w-3xl">

          {/* Super-title */}
          <FadeIn delay={0.1}>
            <p className="text-xs md:text-sm font-sans tracking-[0.3em] uppercase text-white/80 mb-6">
              German Engineering • Mexican Soul
            </p>
          </FadeIn>

          {/* Main Title */}
          <FadeIn delay={0.2}>
            <h1 className="text-6xl md:text-9xl font-serif italic text-white leading-[0.9] mb-8">
              The <br />
              <span className="not-italic font-light font-sans tracking-tight">Reformer.</span>
            </h1>
          </FadeIn>

          {/* Description */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-6">
              <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed max-w-xl">
                Complete silence. Vibration-free stability. Crafted from sustainable American Walnut and structural steel.
              </p>
              <p className="text-sm font-sans tracking-wide text-white/70 italic max-w-lg border-l border-white/30 pl-4">
                "The last Reformer you'll ever need. Develop your grace with materials that honor the body."
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
