import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, DollarSign, ArrowRight } from 'lucide-react';
import BackLink from '@/components/ui/back-link';

const CamaDePilatesPrecio: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/cama-de-pilates/precio`;
  const { title, description: desc } = requireRouteMeta('/cama-de-pilates/precio');

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Cuál es el precio de una cama de Pilates para casa?', acceptedAnswer: { '@type': 'Answer', text: 'Nuestras opciones para casa inician alrededor de MXN 25,000 según acabados y accesorios incluidos.' } },
      { '@type': 'Question', name: '¿Cuál es el precio de una cama de Pilates de estudio?', acceptedAnswer: { '@type': 'Answer', text: 'El Reformer de estudio ronda MXN 50,000 con cuero genuino, nogal y acero estructural; garantía 1 año.' } },
      { '@type': 'Question', name: '¿Qué factores influyen en el precio?', acceptedAnswer: { '@type': 'Answer', text: 'Materiales (cuero real, maderas nobles, acero), tolerancias (silencio), muelles, garantía, servicio y tiempos de entrega.' } },
      { '@type': 'Question', name: '¿Vale la pena comprar una cama de Pilates barata?', acceptedAnswer: { '@type': 'Answer', text: 'Solo si cumple seguridad mínima: estabilidad, resortes confiables y carro sin vibración. En equipos muy baratos suele fallar el silencio, el desgaste y el soporte/garantía.' } },
      { '@type': 'Question', name: '¿Qué incluye normalmente el precio?', acceptedAnswer: { '@type': 'Answer', text: 'Además del reformer, revisa si incluye box, jumpboard, correas, muelles, manual y soporte; y si hay disponibilidad real de repuestos.' } },
    ],
  };

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-24 max-w-[1800px] mx-auto overflow-hidden">
        <BackLink className="mb-8 hidden md:inline-flex opacity-60 hover:opacity-100 transition-opacity" fallbackTo="/cama-de-pilates" label="Volver" />

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
            Guía de Precios 2025
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-serif italic text-[#2A2624] leading-[0.85] mb-8 tracking-tighter"
          >
            Precio de Cama de Pilates<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed"
          >
            Rangos de referencia en México y qué incluye el precio: <br className="hidden md:block" />
            materiales, tolerancias, garantía y servicio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] hover:scale-105 transition-all">
              Ver modelos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-[#2A2624]/20 text-[#2A2624] text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              Guía de compra
            </Link>
          </motion.div>
        </div>

        {/* Quick Price Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mb-16 p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl text-center"
        >
          <p className="text-[#5D5550] font-light leading-relaxed">
            La diferencia de precio entre reformers no es solo estética: suele estar en <strong className="text-[#2A2624]">estabilidad</strong>, <strong className="text-[#2A2624]">silencio</strong>, <strong className="text-[#2A2624]">materiales reales</strong> y <strong className="text-[#2A2624]">soporte post-venta</strong>.
          </p>
        </motion.div>

        {/* Pricing Table */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="overflow-x-auto pb-4 md:pb-0">
            <div className="min-w-[700px] bg-white/60 backdrop-blur-md rounded-[2rem] border border-[#2A2624]/5 overflow-hidden shadow-sm">
              <div className="grid grid-cols-5 border-b border-[#2A2624]/5 bg-[#2A2624]/[0.02]">
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">Tipo</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">Rango (MXN)</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">Uso ideal</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">Qué incluye</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">Riesgo común</div>
              </div>

              {[
                { type: 'Casa', range: '$25,000–$40,000', use: 'Hogar / uso moderado', includes: 'Reformer + set básico', risk: 'Carro ruidoso / poca estabilidad' },
                { type: 'Estudio', range: '$45,000–$70,000', use: 'Uso intensivo diario', includes: 'Estructura robusta + accesorios', risk: 'Refacciones lentas / garantía confusa' },
                { type: 'Usada', range: '$15,000–$35,000', use: 'Si puedes inspeccionarla', includes: 'Depende del vendedor', risk: 'Desgaste en ruedas/resortes' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-5 border-b border-[#2A2624]/5 last:border-0 hover:bg-white transition-colors group">
                  <div className="p-6 md:p-8 text-sm font-semibold text-[#2A2624]">{row.type}</div>
                  <div className="p-6 md:p-8 text-sm text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">{row.range}</div>
                  <div className="p-6 md:p-8 text-sm text-[#5D5550] font-light">{row.use}</div>
                  <div className="p-6 md:p-8 text-sm text-[#5D5550] font-light">{row.includes}</div>
                  <div className="p-6 md:p-8 text-sm text-[#5D5550] font-light">{row.risk}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-24"
        >
          {/* Home Edition */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="group bg-[#F5F4F0] rounded-[2rem] p-10 md:p-14 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:bg-white"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">
                  Home Edition
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550] font-bold opacity-60">Para tu santuario personal</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#5D5550] font-light">Desde</p>
                <p className="text-3xl font-serif italic text-[#2A2624]">$35,000</p>
                <p className="text-xs text-[#5D5550]">MXN</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-[#2A2624]/10 pt-8">
              {[
                'Estructura de madera con cuero genuino',
                'Recorrido suave y silencioso',
                'Entrega 3 semanas en México',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5D5550] font-light">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/product/reformer-casa"
              className="block w-full py-5 text-center border border-[#2A2624] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-all"
            >
              Ver detalles
            </Link>
          </motion.div>

          {/* Studio Professional */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="group bg-[#1C1917] text-[#EAE8E4] rounded-[2rem] p-10 md:p-14 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif italic text-[#EAE8E4] mb-2 group-hover:text-white transition-colors">
                  Studio Professional
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Uso comercial intensivo</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/50 font-light">Alrededor de</p>
                <p className="text-3xl font-serif italic text-[#EAE8E4]">$50,000</p>
                <p className="text-xs text-white/50">MXN</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-white/10 pt-8">
              {[
                'Cuero genuino, nogal y acero estructural',
                'Tolerancias precisas: silencio total',
                'Garantía 1 año + repuestos exprés',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 font-light">
                  <Check className="w-5 h-5 text-[#EAE8E4] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/product/reformer-profesional"
              className="block w-full py-5 text-center bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
            >
              Ver detalles
            </Link>
          </motion.div>
        </motion.div>

        {/* What Influences Price */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Qué sube (o baja) el precio</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Star,
                title: 'Materiales Premium',
                desc: 'Cuero genuino (no vinipiel), madera sólida de nogal y acero estructural garantizan durabilidad.',
              },
              {
                icon: Zap,
                title: 'Precisión y Silencio',
                desc: 'Tolerancias de ingeniería más estrictas logran un recorrido sin fricción ni ruido.',
              },
              {
                icon: Shield,
                title: 'Servicio y Garantía',
                desc: 'Garantía real de 1 año, soporte en español y repuestos disponibles desde CDMX.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-500">
                <item.icon className="w-6 h-6 text-[#3E2723] mb-6 opacity-60" strokeWidth={1.5} />
                <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">{item.title}</h3>
                <p className="text-[#5D5550] font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Checklist */}
        <div className="max-w-4xl mx-auto mb-24 p-8 md:p-12 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-[2rem]">
          <h3 className="text-2xl font-serif italic text-[#2A2624] mb-8 text-center">Checklist rápido (60 segundos)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              '¿Se siente estable sin vibraciones?',
              '¿El carro se desliza sin ruido?',
              '¿Incluye muelles/resortes confiables?',
              '¿Hay garantía por escrito y repuestos?',
              '¿Incluye box/jumpboard/correas?',
              '¿Entrega real en México (tiempo estimado)?',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white/60 rounded-xl">
                <div className="w-5 h-5 rounded-full border border-[#2A2624]/20 flex items-center justify-center text-xs text-[#3E2723]">
                  {i + 1}
                </div>
                <span className="text-sm text-[#5D5550] font-light">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Volume CTA */}
        <div className="bg-[#2A2624] text-[#EAE8E4] rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl rounded-full bg-blue-900/40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <DollarSign className="w-12 h-12 mx-auto mb-8 opacity-40" strokeWidth={1} />
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/50 mb-6">
              Precio especial
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight mb-6">
              20% descuento en 8+ unidades
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-light mb-10 leading-relaxed">
              Coordinamos instalación profesional y entrega por lotes para tu apertura.
            </p>
            <Link
              to="/packs/estudio"
              className="inline-flex items-center px-10 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all"
            >
              Ver packs de estudio
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesPrecio;
