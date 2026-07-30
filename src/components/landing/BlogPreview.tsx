import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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

const featuredGuides = [
  {
    href: '/blog/cama-de-pilates-guia-de-compra',
    title: 'Cómo Elegir Tu Cama de Pilates',
    description: 'Guía completa: tamaños, materiales, presupuesto y qué buscar según tu experiencia.',
    category: 'Guías de compra',
    readTime: '8 min',
  },
  {
    href: '/cama-de-pilates/precio',
    title: 'Precios de Cama de Pilates en México',
    description: 'Rangos de precio por tipo, qué incluye cada nivel y cómo maximizar tu inversión.',
    category: 'Guías de compra',
    readTime: '6 min',
  },
  {
    href: '/blog/reformer-casa-vs-profesional',
    title: 'Reformer para Casa vs Profesional',
    description: '¿Cuál necesitas? Diferencias clave en tamaño, resistencia y funcionalidades.',
    category: 'Comparativas',
    readTime: '5 min',
  },
];

const BlogPreview: React.FC = () => {
  return (
    <section className="w-full bg-[#EAE8E4] py-20 md:py-28">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#3E2723] mb-4 block">
                Aprende
              </span>
              <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
                Guías y Recursos
              </h2>
            </div>
            <Link
              to="/blog"
              className="mt-6 md:mt-0 text-xs uppercase tracking-[0.15em] text-[#3E2723] hover:text-[#2A2624] transition-colors flex items-center gap-2 group"
            >
              Ver Todas las Guías
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGuides.map((guide, index) => (
            <FadeIn key={guide.href} delay={index * 0.1}>
              <Link
                to={guide.href}
                className="group block bg-white/50 hover:bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-lg border border-[#2A2624]/5 hover:border-[#2A2624]/10 h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550] bg-[#EAE8E4] px-2 py-1 rounded">
                    {guide.category}
                  </span>
                  <span className="text-[10px] text-[#5D5550]">
                    {guide.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-serif italic text-[#2A2624] mb-3 group-hover:text-[#3E2723] transition-colors leading-snug">
                  {guide.title}
                </h3>

                <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-6">
                  {guide.description}
                </p>

                <span className="inline-flex items-center text-xs uppercase tracking-[0.15em] text-[#3E2723] group-hover:gap-3 gap-2 transition-all duration-300">
                  Leer Guía
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Additional category links */}
        <FadeIn delay={0.4}>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link
              to="/blog?cat=Ejercicios%20y%20salud"
              className="text-xs uppercase tracking-[0.15em] text-[#5D5550] hover:text-[#3E2723] transition-colors px-4 py-2 border border-[#2A2624]/10 rounded-full hover:border-[#2A2624]/30"
            >
              Ejercicios
            </Link>
            <Link
              to="/blog?cat=Equipo%20y%20mantenimiento"
              className="text-xs uppercase tracking-[0.15em] text-[#5D5550] hover:text-[#3E2723] transition-colors px-4 py-2 border border-[#2A2624]/10 rounded-full hover:border-[#2A2624]/30"
            >
              Mantenimiento
            </Link>
            <Link
              to="/blog?cat=Estudio"
              className="text-xs uppercase tracking-[0.15em] text-[#5D5550] hover:text-[#3E2723] transition-colors px-4 py-2 border border-[#2A2624]/10 rounded-full hover:border-[#2A2624]/30"
            >
              Para Estudios
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default BlogPreview;
