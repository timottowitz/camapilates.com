import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { generateAboutPageSchema } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import { allProducts } from '@/lib/shop/catalog';

const reformerCount = allProducts().filter((p) => p.category === 'Reformers').length;

// Descriptions follow the catalog entry each card links to.
const MATERIALS = [
  {
    title: 'Roble Macizo',
    desc: 'La estructura de nuestros Reformers clásicos. Una base sólida para casa o estudio.',
    img: '/images/products/reformer-clasico-roble-pl006.webp',
    to: '/product/reformer-clasico-roble-pl006',
  },
  {
    title: 'Maple Blanco',
    desc: 'De tono claro y acabado limpio, con poleas en postes de madera.',
    img: '/images/products/reformer-clasico-maple-pl001.webp',
    to: '/product/reformer-clasico-maple-pl001',
  },
  {
    title: 'Aluminio',
    desc: 'Con detalles de madera: ligero, estable y de líneas limpias para estudios modernos.',
    img: '/images/products/reformer-elite-aluminio-pl019.webp',
    to: '/product/reformer-elite-aluminio-pl019',
  },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const About = () => {
  const { title, description: desc } = requireRouteMeta('/about');
  const aboutSchema = generateAboutPageSchema();

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${window.location.origin}/about`} />
        <script type="application/ld+json">
          {JSON.stringify(aboutSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-24 max-w-[1800px] mx-auto overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <FadeIn>
          <span className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60">
            Nuestra Filosofía
          </span>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-12 tracking-tighter">
            Ingeniería Alemana<span className="text-[#EB4C42]">.</span> <br />
            <span className="not-italic font-light font-sans tracking-tight text-[#5D5550]">Hecha para México</span>
          </h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mt-24">
          <div className="md:col-span-5">
            <FadeIn delay={0.2}>
              <div className="aspect-[3/4] w-full bg-[#D6D3CD] rounded-[2rem] overflow-hidden relative shadow-2xl">
                <img
                  src="/images/about-hero.webp"
                  alt="Estudio de Pilates"
                  className="absolute inset-0 w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-[1.5s]"
                />
              </div>
              <div className="mt-6 flex justify-between text-[10px] uppercase tracking-widest text-[#5D5550] font-bold opacity-60">
                <span>Edelweiss Pilates</span>
                <span>Ciudad de México</span>
              </div>
            </FadeIn>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <FadeIn delay={0.4}>
              <p className="text-xl md:text-3xl font-light text-[#2A2624] leading-relaxed mb-12 tracking-tight">
                Unimos una <span className="font-normal border-b border-[#EB4C42]">ingeniería cuidadosa</span> con la calidez de los materiales naturales.
                Nuestra meta era simple: un Reformer silencioso, estable
                y lo bastante bello para vivir en tu casa.
              </p>
              <p className="text-lg font-light text-[#5D5550] leading-relaxed mb-12 max-w-2xl">
                Cada Reformer Edelweiss viene en roble macizo, maple o aluminio, con torres de acero inoxidable en los modelos con torre,
                y cuenta con entrega y soporte en todo México. Descubre nuestros{' '}
                <Link to="/reformer-para-casa" className="underline hover:text-[#2A2624]">Pilates Reformers silenciosos para casa</Link>{' '}
                y nuestro modelo insignia, el{' '}
                <Link to="/product/reformer-elite-aluminio-pl019" className="underline hover:text-[#2A2624]">Reformer Elite de Aluminio</Link>.
                No solo fabricamos equipo; creamos instrumentos para el movimiento.
              </p>

              <div className="grid grid-cols-2 gap-12 border-t border-[#2A2624]/10 pt-12">
                <div>
                  <span className="block text-5xl md:text-6xl font-serif italic text-[#2A2624] mb-2">{reformerCount}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#5D5550] font-bold">Modelos de Reformer</span>
                </div>
                <div>
                  <span className="block text-5xl md:text-6xl font-serif italic text-[#2A2624] mb-2">32</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#5D5550] font-bold">Estados con Envío Asegurado</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="bg-[#EAE8E4] py-32 px-6 md:px-24 mt-0 relative">
        <div className="max-w-[1800px] mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-24 text-center">
              Materiales Honestos<span className="text-[#EB4C42]">.</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MATERIALS.map((item, i) => (
              <FadeIn delay={i * 0.2} key={item.title}>
                <Link
                  to={item.to}
                  className="group block bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-[#2A2624]/5"
                >
                  <div className="aspect-square w-full bg-[#D6D3CD] mb-8 overflow-hidden rounded-[1.5rem] relative">
                    <img
                      src={item.img}
                      alt={`Reformer Edelweiss de ${item.title.toLowerCase()}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-0 text-2xl font-serif italic mb-4 text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">{item.title}</h3>
                  <p className="mb-0 text-sm text-[#5D5550] leading-relaxed max-w-xs opacity-80 group-hover:opacity-100">
                    {item.desc}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-8 md:px-24 bg-[#FAF9F6] border-t border-[#2A2624]/10 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4">Servicios para Estudios y Casas</h2>
          <p className="text-sm text-[#5D5550] font-light mb-8">
            Conoce nuestros servicios de mantenimiento, equipamiento comercial y asesoría en diseño de espacios.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center px-8 py-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all"
          >
            Ver Servicios →
          </Link>
        </div>
      </section>

    </LuxuryLayout>
  );
};

export default About;
