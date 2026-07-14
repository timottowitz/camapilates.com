import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ShoppingBag, DollarSign, Ruler, Package } from 'lucide-react';

const CamaDePilatesHub: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/cama-de-pilates`;
  const title = 'Cama de Pilates: Guía, Precios y Dónde Comprar en México (2025)';
  const desc = 'Todo sobre la cama de Pilates (Reformer): tipos para casa y estudio, precios, dimensiones y dónde comprar en México con envío desde CDMX.';

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Cama de Pilates', item: url },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cama de Pilates — Recursos',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates/en-venta`, name: 'Cama de Pilates en Venta' },
      { '@type': 'ListItem', position: 2, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 3, url: `${origin}/blog/dimensiones-cama-de-pilates`, name: 'Dimensiones de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/product/reformer-profesional`, name: 'Reformer de Estudio' },
      { '@type': 'ListItem', position: 5, url: `${origin}/product/reformer-casa`, name: 'Reformer para Casa' },
      { '@type': 'ListItem', position: 6, url: `${origin}/packs/estudio`, name: 'Pack para Estudios (8+)' },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es una cama de Pilates (Reformer)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La cama de Pilates (Reformer) es un equipo con carro deslizante y resistencia por resortes que permite ejercicios para fuerza, control y movilidad. Se usa tanto en casa como en estudio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta una cama de Pilates en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En México, una cama de Pilates para casa suele iniciar alrededor de MXN 25,000 y una de estudio ronda MXN 50,000, dependiendo de materiales, tolerancias, accesorios y garantía.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué diferencia hay entre un reformer para casa y uno profesional?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El reformer profesional prioriza rigidez estructural, estabilidad y uso diario intensivo; el reformer para casa busca un formato más compacto sin perder recorrido suave y seguro.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué espacio necesito para instalar una cama de Pilates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Además del largo del equipo, considera espacio lateral para entrar/salir y un margen en la parte trasera para accesorios. Revisa nuestra guía de dimensiones antes de comprar.',
        },
      },
    ],
  };

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-24 max-w-[1800px] mx-auto overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60"
          >
            The Definitive Guide
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-8 tracking-tighter"
          >
            Cama de Pilates<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed"
          >
            Todo sobre el Reformer en México: guía de compra, precios, <br className="hidden md:block" />
            dimensiones y dónde comprar con envío desde CDMX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] hover:scale-105 transition-all">
              Ver modelos en venta <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/cama-de-pilates/precio" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-[#2A2624]/20 text-[#2A2624] text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              Guía de precios
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid - Main Resources */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid md:grid-cols-12 gap-4 mb-20"
        >
          {/* En Venta - Large Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="md:col-span-7"
          >
            <Link
              to="/cama-de-pilates/en-venta"
              className="group block h-full bg-[#1C1917] text-[#EAE8E4] rounded-[2rem] p-10 md:p-14 relative overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
              <ShoppingBag className="w-8 h-8 mb-8 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4 group-hover:text-white transition-colors">
                Modelos en Venta
              </h2>
              <p className="text-white/60 font-light text-lg mb-8 max-w-md">
                Reformers con entrega 3 semanas en México y garantía 1 año.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
                Ver opciones <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Precio - Medium Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="md:col-span-5"
          >
            <Link
              to="/cama-de-pilates/precio"
              className="group block h-full bg-[#F5F4F0] rounded-[2rem] p-10 md:p-14 transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:bg-white"
            >
              <DollarSign className="w-8 h-8 text-[#3E2723] mb-8 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4 group-hover:text-[#EB4C42] transition-colors">
                Guía de Precios
              </h2>
              <p className="text-[#5D5550] font-light mb-8">
                Rangos 2025: MXN 25,000–50,000. Qué incluye cada nivel.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
                Ver precios <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Dimensiones */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="md:col-span-4"
          >
            <Link
              to="/blog/dimensiones-cama-de-pilates"
              className="group block h-full bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:bg-white hover:shadow-lg hover:-translate-y-1"
            >
              <Ruler className="w-6 h-6 text-[#3E2723] mb-6 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">
                Dimensiones
              </h2>
              <p className="text-sm text-[#5D5550] font-light mb-6">
                Medidas y espacio de instalación.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
                Ver guía <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            </Link>
          </motion.div>

          {/* Catálogo */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="md:col-span-4"
          >
            <Link
              to="/products"
              className="group block h-full bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:bg-white hover:shadow-lg hover:-translate-y-1"
            >
              <BookOpen className="w-6 h-6 text-[#3E2723] mb-6 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">
                Modelos de Camas
              </h2>
              <p className="text-sm text-[#5D5550] font-light mb-6">
                Colección completa de reformers para casa y estudio.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
                Ver catálogo <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            </Link>
          </motion.div>

          {/* Pack Estudios */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="md:col-span-4"
          >
            <Link
              to="/packs/estudio"
              className="group block h-full bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-[2rem] p-8 md:p-10 transition-all duration-500 hover:bg-white hover:shadow-lg hover:-translate-y-1"
            >
              <Package className="w-6 h-6 text-[#3E2723] mb-6 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-2xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">
                Pack Estudios
              </h2>
              <p className="text-sm text-[#5D5550] font-light mb-6">
                20% descuento en 8+ unidades.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
                Cotizar <ArrowRight className="ml-2 w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* What to Check Section */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Qué revisar antes de comprar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Silencio y recorrido',
                desc: 'El "ruido" casi siempre viene de tolerancias flojas, ruedas y alineación. Prioriza estabilidad y un carro sin vibración.',
              },
              {
                title: 'Materiales reales',
                desc: 'Cuero genuino vs vinipiel, madera sólida (nogal) vs laminados, y acero estructural marcan durabilidad y sensación.',
              },
              {
                title: 'Para casa vs estudio',
                desc: 'Para casa: tamaño y estética. Para estudio: rigidez, uso intensivo, repuestos y soporte.',
              },
              {
                title: 'Entrega, garantía y repuestos',
                desc: 'En México, la diferencia real está en logística: tiempos de entrega, garantía clara y repuestos disponibles.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-500">
                <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">{item.title}</h3>
                <p className="text-[#5D5550] font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-24">
          <Link
            to="/product/reformer-profesional"
            className="group block bg-[#2A2624] text-[#EAE8E4] rounded-[2rem] p-10 md:p-14 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="w-10 h-10 mb-8 border border-[#EAE8E4]/30 rounded-full flex items-center justify-center text-xs font-serif italic opacity-60">P</div>
            <h2 className="text-3xl md:text-4xl font-serif italic mb-4 group-hover:text-white transition-colors">
              Reformer de Estudio
            </h2>
            <p className="text-white/60 font-light mb-8 max-w-md">
              Silencio total, tolerancias precisas y estética premium para uso intensivo.
            </p>
            <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
              Ver Profesional <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/product/reformer-casa"
            className="group block bg-[#EAE8E4] rounded-[2rem] p-10 md:p-14 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:bg-white"
          >
            <div className="w-10 h-10 mb-8 border border-[#2A2624]/30 rounded-full flex items-center justify-center text-xs font-serif italic text-[#2A2624] opacity-60">H</div>
            <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4 group-hover:text-[#EB4C42] transition-colors">
              Reformer de Casa
            </h2>
            <p className="text-[#5D5550] font-light mb-8 max-w-md">
              Compacto y silencioso con cuero genuino. Entrega en 3 semanas.
            </p>
            <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
              Ver Casa <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Recommended Guides */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Guías recomendadas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: '/blog/mejor-cama-de-pilates-para-casa', title: 'Mejor cama de Pilates para casa', desc: 'Cómo elegir por espacio, presupuesto y accesorios.' },
              { href: '/blog/precio-cama-de-pilates-2025', title: 'Precio de la cama de Pilates 2025', desc: 'Rangos reales en México y qué incluye cada nivel.' },
              { href: '/blog/mejores-marcas-cama-de-pilates', title: 'Mejores marcas de cama de Pilates', desc: 'Criterios para comparar calidad, garantía y soporte.' },
              { href: '/blog/reformer-casa-vs-profesional', title: 'Reformer para casa vs profesional', desc: 'Diferencias clave para decidir sin pagar de más.' },
            ].map((guide, i) => (
              <Link
                key={i}
                to={guide.href}
                className="group p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-500"
              >
                <h3 className="text-lg font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">{guide.title}</h3>
                <p className="text-sm text-[#5D5550] font-light">{guide.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Qué es una cama de Pilates (Reformer)?', a: 'Es un equipo con carro deslizante y resistencia por resortes que permite cientos de ejercicios para fuerza, control y movilidad, tanto en casa como en estudio.' },
              { q: '¿Cuánto cuesta una cama de Pilates en México?', a: 'Como referencia, una opción para casa suele iniciar alrededor de MXN 25,000 y una de estudio ronda MXN 50,000 (varía por materiales, tolerancias, accesorios y garantía).' },
              { q: '¿Qué diferencia hay entre un reformer para casa y uno profesional?', a: 'El profesional está pensado para uso intensivo diario y máxima estabilidad; el de casa busca un formato más compacto manteniendo seguridad y recorrido suave.' },
              { q: '¿Qué espacio necesito para instalar una cama de Pilates?', a: 'Considera el largo del equipo más espacio lateral para entrar/salir y un margen trasero para accesorios. Revisa la guía de dimensiones antes de comprar.' },
            ].map((faqItem, i) => (
              <details key={i} className="group bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl overflow-hidden">
                <summary className="p-6 md:p-8 font-serif italic text-xl text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                  {faqItem.q}
                  <span className="text-[#3E2723] group-open:rotate-45 transition-transform text-2xl font-light ml-4 flex-shrink-0">+</span>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-[#5D5550] font-light leading-relaxed">
                  <p>{faqItem.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesHub;
