import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { DEFAULTS, generateBreadcrumbSchema, generateLocalBusinessSchema, getOrigin } from '@/lib/seo';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

type HubCard = {
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  colSpan?: string; // e.g. "md:col-span-2"
  rowSpan?: string; // e.g. "md:row-span-2"
  image: string;
  overlayText?: string;
  dark?: boolean;
};

const IndexAuthority: React.FC = () => {
  const origin = getOrigin();
  const title = 'Cama de Pilates (Reformer) en México — Guías, Precios y Venta';
  const desc = 'Compra tu cama de Pilates Reformer en México: modelos para casa y estudio, guía de precios, dimensiones y envío desde CDMX.';

  const cards = useMemo<HubCard[]>(() => (
    [
      {
        eyebrow: 'DIRECTORY',
        title: 'Pilates Studios',
        description: 'Find top-rated studios across Mexico. Map view & reviews.',
        to: '/estudios-de-pilates',
        colSpan: 'md:col-span-7 lg:col-span-6',
        rowSpan: 'md:row-span-2', // Tall anchor card
        image: '/images/reformer-editorial-1.webp',
        dark: true,
      },
      {
        eyebrow: 'COMMUNITY',
        title: 'Instructors',
        description: 'Connect with certified pros.',
        to: '/instructores-pilates',
        colSpan: 'md:col-span-5 lg:col-span-3',
        image: '/images/about-hero.webp',
        dark: true,
      },
      {
        eyebrow: 'TRAINING',
        title: 'Courses',
        description: 'Teacher training programs.',
        to: '/certificacion-pilates',
        colSpan: 'md:col-span-5 lg:col-span-3',
        image: '/images/certification-hero.webp',
        dark: false,
      },
      {
        eyebrow: 'EDITORIAL',
        title: 'The Journal',
        description: 'Expert guides on buying, practice, and maintenance.',
        to: '/blog',
        colSpan: 'md:col-span-12 lg:col-span-6',
        image: '/images/studios-hero.webp',
        dark: true,
      },
      {
        eyebrow: 'EQUIPMENT',
        title: 'New Reformers',
        description: 'Shop the collection.',
        to: '/shop/category/reformers',
        colSpan: 'md:col-span-6 lg:col-span-6',
        image: '/images/explore-reformers.webp',
        dark: true,
      },
      {
        eyebrow: 'SHOP',
        title: 'Store',
        description: 'Accessories & parts.',
        to: '/shop',
        colSpan: 'md:col-span-6 lg:col-span-6',
        image: '/images/hero-shop.webp',
        dark: true,
      },
    ]
  ), []);

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: 'Inicio', url: '/' }]);
  const localBusinessSchema = generateLocalBusinessSchema();
  const homeItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cama de Pilates (Reformer) — Enlaces clave',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates`, name: 'Cama de Pilates' },
      { '@type': 'ListItem', position: 2, url: `${origin}/cama-de-pilates/en-venta`, name: 'Cama de Pilates en Venta' },
      { '@type': 'ListItem', position: 3, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/shop`, name: 'Catálogo de Camas' },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 50,
        damping: 20
      }
    },
  };

  return (
    <LuxuryLayout noPadding headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(homeItemListSchema)}</script>
      </Helmet>

      {/* Modern Light Background */}
      <div className="relative min-h-screen bg-[#F2F0ED] text-[#2A2624] selection:bg-[#EB4C42] selection:text-white">

        <div className="relative mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-16 lg:px-12">

          {/* Header Section - Modern Modular */}
          <div className="relative mb-12 md:mb-20 pt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
            >
              <div className="max-w-4xl">
                {/* Brand/Logo Text styled as 'ivan.codes' example */}
                <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-tighter text-[#2A2624] mb-6">
                  Edelweiss<span className="text-[#EB4C42]">.</span>
                </h1>
                <p className="font-sans text-xl md:text-2xl text-[#5D5550] max-w-2xl leading-relaxed font-normal tracking-tight">
                  Encuentra más de <span className="text-[#EB4C42] font-medium">900 Estudios</span> de Pilates, <span className="text-[#EB4C42] font-medium">Cursos</span>, <span className="text-[#EB4C42] font-medium">Instructores</span> y <span className="text-[#EB4C42] font-medium">Reformers</span>.
                  La plataforma de Pilates más grande de México.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/cama-de-pilates"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FFFFFF] transition-colors border border-[#2A2624]/10"
                  >
                    Cama de Pilates
                  </Link>
                  <Link
                    to="/cama-de-pilates/en-venta"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FFFFFF] transition-colors border border-[#2A2624]/10"
                  >
                    En venta
                  </Link>
                  <Link
                    to="/cama-de-pilates/precio"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FFFFFF] transition-colors border border-[#2A2624]/10"
                  >
                    Precio
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FFFFFF] transition-colors border border-[#2A2624]/10"
                  >
                    Tienda
                  </Link>
                </div>
              </div>

              {/* Modern Pill Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/blog"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#EB4C42] text-white text-sm font-bold tracking-wide hover:bg-[#D43D33] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#EB4C42]/20"
                >
                  Explorar Guías <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/estudios-de-pilates"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#EAE8E4] text-[#2A2624] text-sm font-bold tracking-wide hover:bg-white transition-all hover:scale-105 active:scale-95 border border-[#2A2624]/5"
                >
                  Encontrar Estudio
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bento Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[220px] md:auto-rows-[240px]"
          >
            {cards.map((c, i) => (
              <motion.div
                key={c.to}
                variants={itemVariants}
                className={`
                  relative group overflow-hidden rounded-[2rem] bg-[#EAE8E4]
                  ${c.colSpan || 'md:col-span-4'}
                  ${c.rowSpan || ''}
                `}
              >
                <Link to={c.to} className="block h-full w-full relative">
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0 select-none">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
                  </div>

                  {/* Red Accent Border on Hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#EB4C42]/50 rounded-[2rem] transition-colors duration-300 z-20 pointer-events-none" />

                  {/* Overlay Text (e.g., 'Soon') */}
                  {c.overlayText && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mix-blend-overlay">
                      <span className="text-[12vw] md:text-[5vw] font-serif italic text-white/30 leading-none tracking-tighter rotate-[-15deg] select-none">
                        {c.overlayText}
                      </span>
                    </div>
                  )}

                  {/* Content - Bottom Aligned */}
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                    {/* Top Right Arrow */}
                    <div className="self-end opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <div className="bg-[#EB4C42] p-2 rounded-full text-white shadow-lg">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EB4C42] bg-white/10 backdrop-blur-md px-2 py-1 rounded">
                          {c.eyebrow}
                        </span>
                      </div>
                      <h3 className="font-serif text-3xl md:text-4xl text-white leading-none tracking-tight mb-2">
                        {c.title}
                      </h3>
                      <p className="text-white/70 text-sm font-medium leading-relaxed max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 transform translate-y-2 group-hover:translate-y-0">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Links Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center md:justify-start gap-4"
          >
            {['Reviews', 'Warranty', 'FAQ', 'Contact'].map((link) => (
              <Link key={link} to="/soporte" className="text-xs font-bold uppercase tracking-widest text-[#5D5550] hover:text-[#EB4C42] transition-colors">
                {link}
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </LuxuryLayout>
  );
};

export default IndexAuthority;
