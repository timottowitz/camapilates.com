import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Building2, MapPin, BookOpen } from 'lucide-react';

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

const paths = [
  {
    icon: Home,
    title: 'Para Tu Casa',
    description: 'Reformers compactos, ropa orgánica y accesorios para tu santuario personal.',
    cta: 'Ver Colección Casa',
    href: '/shop?cats=Reformers',
    color: '#7A8A6F',
  },
  {
    icon: Building2,
    title: 'Para Tu Estudio',
    description: 'Reformers profesionales, sistemas de luz terapéutica y paquetes para estudios.',
    cta: 'Equipar Mi Estudio',
    href: '/packs/estudio',
    color: '#A0593D',
  },
  {
    icon: MapPin,
    title: 'Buscar Estudio',
    description: 'Encuentra estudios de pilates cerca de ti. +500 estudios en todo México.',
    cta: 'Explorar Estudios',
    href: '/estudios-de-pilates',
    color: '#5D7A99',
  },
  {
    icon: BookOpen,
    title: 'Aprender Pilates',
    description: 'Guías de compra, ejercicios, comparativas y todo sobre pilates reformer.',
    cta: 'Leer Guías',
    href: '/blog',
    color: '#8B7355',
  },
];

const UserPathSelector: React.FC = () => {
  return (
    <section className="w-full bg-[#EAE8E4] py-20 md:py-28">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4">
              ¿Qué te trae por aquí?
            </h2>
            <p className="text-[#5D5550] font-light max-w-xl mx-auto">
              Ya sea que busques equipar tu espacio, encontrar un estudio o aprender más sobre pilates.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, index) => (
            <FadeIn key={path.title} delay={index * 0.1}>
              <Link
                to={path.href}
                className="group block bg-white/50 hover:bg-white rounded-lg p-8 transition-all duration-300 hover:shadow-lg border border-[#2A2624]/5 hover:border-[#2A2624]/10"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${path.color}15` }}
                >
                  <path.icon className="w-6 h-6" style={{ color: path.color }} />
                </div>

                <h3 className="text-xl font-serif italic text-[#2A2624] mb-3 group-hover:text-[#3E2723] transition-colors">
                  {path.title}
                </h3>

                <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-6">
                  {path.description}
                </p>

                <span className="inline-flex items-center text-xs uppercase tracking-[0.15em] text-[#3E2723] group-hover:gap-3 gap-2 transition-all duration-300">
                  {path.cta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserPathSelector;
