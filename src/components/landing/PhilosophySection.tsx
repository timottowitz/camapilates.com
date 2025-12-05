import React from 'react';
import { motion } from 'framer-motion';
import { useConvexAssets } from '@/lib/convexAssets';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const PhilosophySection: React.FC = () => {
  const assets = useConvexAssets();
  
  return (
    <section className="w-full bg-[#E3E0DB] py-20 md:py-28">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Image */}
          <FadeIn>
            <div className="aspect-[4/3] w-full bg-[#D6D3CD] rounded-sm overflow-hidden relative group">
              <img
                src={assets.featureSilence}
                alt="Hombre practicando plancha lateral en cama de pilates reformer Edelweiss - ejercicio de pilates para fuerza y equilibrio con equipo premium de madera de nogal"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.2}>
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-5xl font-serif italic leading-tight mb-6 text-[#2A2624]">
                Detox Your <span className="not-italic font-sans font-light">Movement</span>
              </h2>
              <div className="w-12 h-[1px] bg-[#3E2723] mb-6"></div>
              <p className="font-light text-lg leading-relaxed text-[#5D5550] mb-6">
                Los microplásticos pertenecen a la basura, no a tus poros. 
                Mientras el mundo corre hacia la moda rápida y plásticos baratos, 
                Edelweiss escala más alto.
              </p>
              <p className="font-light text-lg leading-relaxed text-[#5D5550]">
                Nuestros reformers no son solo equipo de gimnasio—son piezas arquitectónicas 
                de nogal sustentable, aluminio aeroespacial y materiales orgánicos que te sanan desde afuera hacia adentro.
              </p>

              {/* Quick specs */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                <div>
                  <span className="block text-2xl font-serif italic text-[#3E2723]">0%</span>
                  <span className="text-xs uppercase tracking-[0.1em] text-[#5D5550]">Plástico</span>
                </div>
                <div>
                  <span className="block text-2xl font-serif italic text-[#3E2723]">100%</span>
                  <span className="text-xs uppercase tracking-[0.1em] text-[#5D5550]">Orgánico</span>
                </div>
                <div>
                  <span className="block text-2xl font-serif italic text-[#3E2723]">1 Año</span>
                  <span className="text-xs uppercase tracking-[0.1em] text-[#5D5550]">Garantía</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
