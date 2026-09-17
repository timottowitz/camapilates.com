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

  const faqs = [
    {
      q: '¿Cuánto cuesta una cama de Pilates en México en 2026?',
      a: 'En México, el precio de una cama de Pilates Reformer profesional oscila entre $23,234 MXN para modelos clásicos de roble o aluminio de entrada, y entre $32,900 y $85,050 MXN para modelos profesionales de estudio con acabados de nogal, roble macizo, aluminio anodizado estructural y aditamentos de media torre o Cadillac.'
    },
    {
      q: '¿Cuál es el precio de una cama de Pilates para casa?',
      a: 'Nuestras opciones residenciales inician desde $23,234 MXN (o desde $1,936 MXN/mes a 12 MSI). Cuentan con chasis rígido que elimina vibraciones, carro silencioso con rodamientos sellados y sistema de 5 resortes alemanes de alambre de piano.'
    },
    {
      q: '¿Cuál es el precio de una cama de Pilates de estudio profesional?',
      a: 'Los Reformers profesionales para estudio boutique rondan entre $36,716 y $69,617 MXN para camas fijas de madera maciza o aluminio aeroespacial, y hasta $85,050 MXN para modelos con media torre o estructura de Cadillac. Todos con garantía directa de 3 años y tolerancias para uso comercial continuo.'
    },
    {
      q: '¿Qué factores influyen en el precio de una cama de Pilates?',
      a: 'Los cuatro factores determinantes son: 1) Materiales del chasis (madera maciza de 30 mm o aluminio estructural vs MDF/perfiles delgados), 2) Calibración y origen de los resortes (alambre de piano alemán vs resortes genéricos o ligas), 3) Rodamientos y rieles (deslizamiento ultra silencioso de alta precisión), y 4) Disponibilidad de refacciones locales y garantía con soporte directo en México.'
    },
    {
      q: '¿Vale la pena comprar una cama de Pilates económica o plegable de importación?',
      a: 'Las camas plegables de menos de $15,000 MXN suelen sacrificar rigidez estructural, flexionándose en el punto de pliegue y descalibrando la alineación de columna del practicante. Además, la mayoría utiliza cuerdas elásticas en lugar de resortes calibrados y carecen totalmente de refacciones en México cuando se desgastan las poleas.'
    },
    {
      q: '¿Qué incluye normalmente el precio de un Reformer CAMA Pilates?',
      a: 'Incluye el chasis completo ensamblado, carro tapizado en microfibra de alta resistencia, barra de pies ajustable multidireccional, sistema de 5 resortes alemanes calibrados por color, cabecera ajustable de 3 posiciones, hombreras ergonómicas, juego de poleas silenciosas, correas dobles de manos/pies y caja (box) según el modelo seleccionado.'
    },
    {
      q: '¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?',
      a: 'Sí, contamos con financiamiento de hasta 12 Meses Sin Intereses con tarjetas de crédito de bancos participantes en México a través de pasarelas de pago seguras, además de descuentos preferenciales por pago de contado vía transferencia SPEI.'
    },
    {
      q: '¿Cuánto cuesta el envío y cómo se protege el equipo durante el transporte?',
      a: 'Realizamos envíos asegurados a toda la República Mexicana (CDMX, Monterrey, Guadalajara, Querétaro, Puebla, Mérida, etc.). Cada cama viaja embalada en un huacal de madera tratada para exportación con seguro de transporte puerta a puerta.'
    }
  ];

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
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
            Guía de Precios 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.95] mb-8 tracking-tighter"
          >
            ¿Cuánto Cuesta una Cama de Pilates en México?<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed"
          >
            Precios y modelos 2026 para casa y estudio: desde $23,234 MXN (hasta 12 MSI). Qué incluye el precio, diferencias de materiales, garantía directa y servicio técnico en México.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] hover:scale-105 transition-all">
              Ver modelos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/cama-de-pilates" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-[#2A2624]/20 text-[#2A2624] text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all">
              Catálogo de Camas
            </Link>
          </motion.div>
        </div>

        {/* Quick Answer for Featured Snippet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mb-16 p-8 bg-white/80 backdrop-blur-md border-l-4 border-[#3E2723] border border-[#2A2624]/10 rounded-2xl shadow-sm text-left"
        >
          <h2 className="text-xl md:text-2xl font-serif italic text-[#2A2624] mb-3">
            ¿Cuánto cuesta una cama de Pilates Reformer en México? (Respuesta Rápida)
          </h2>
          <p className="text-[#5D5550] text-base leading-relaxed mb-5">
            En México en 2026, el precio de una cama de Pilates Reformer profesional oscila entre <strong>$23,234 MXN y $85,050 MXN</strong> según el chasis, la madera y los aditamentos incluidos:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Reformer para Casa</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">$23,234 – $36,716 MXN</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Roble macizo o aluminio, 5 resortes alemanes calibrados, chasis silencioso.</span>
            </div>
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Reformer de Estudio</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">$36,716 – $69,617 MXN</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Uso continuo comercial (8+ hrs/día), riel de ultra precisión y mayor resistencia.</span>
            </div>
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Con Torre o Cadillac</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">$33,240 – $85,050 MXN</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Estación completa combinada con trapecio, resortes aéreos y torre vertical.</span>
            </div>
          </div>
          <p className="text-xs text-[#5D5550]/80 mt-4 italic">
            *Todos los precios de CAMA Pilates incluyen IVA, garantía directa de 3 años en México, refacciones inmediatas y opción de pago a 12 Meses Sin Intereses (desde $1,936 MXN/mes).
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
                { type: 'Reformer Clásico (Roble)', link: '/product/reformer-roble-a015', range: '$23,234 MXN', use: 'Hogar / uso personal diario', includes: 'Madera maciza + 5 resortes alemanes + box', risk: 'Comparativa: modelos importados usan ligas o aglomerado' },
                { type: 'Reformer de Aluminio', link: '/product/reformer-aluminio-a070', range: '$23,488 MXN', use: 'Hogar o departamento', includes: 'Chasis ligero anodizado + silencioso', risk: 'Comparativa: modelos plegables pierden rigidez axial' },
                { type: 'Reformer Studio (Maple)', link: '/shop/category/reformers', range: '$36,716–$42,400 MXN', use: 'Uso comercial continuo (8+ hrs)', includes: 'Maple norteamericano + riel de precisión', risk: 'Marcas extranjeras tardan 4–6 meses en repuestos' },
                { type: 'Cadillac de Aluminio', link: '/product/cadillac-aluminio-a048', range: '$33,240 MXN', use: 'Estudio / rehabilitación física', includes: 'Estructura trapecio completa + resortes aéreos', risk: 'Requiere techo de al menos 2.40 m de altura' },
                { type: 'Reformer con Torre Completa', link: '/shop/category/cadillacs-y-torres', range: '$51,000–$85,050 MXN', use: 'Estudio boutique alta gama', includes: 'Reformer 2 en 1 + torre de acero inox', risk: 'Inversión mayor; recuperable con clases privadas' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-5 border-b border-[#2A2624]/5 last:border-0 hover:bg-white transition-colors group">
                  <div className="p-6 md:p-8 text-sm font-semibold text-[#2A2624]">
                    <Link to={row.link} className="hover:text-[#EB4C42] underline decoration-[#2A2624]/20 hover:decoration-[#EB4C42] transition-colors">
                      {row.type}
                    </Link>
                  </div>
                  <div className="p-6 md:p-8 text-sm font-medium text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">{row.range}</div>
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
                <p className="text-3xl font-serif italic text-[#2A2624]">$23,234</p>
                <p className="text-xs text-[#5D5550]">MXN · 12 MSI de $1,936</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-[#2A2624]/10 pt-8">
              {[
                'Madera maciza de Roble o Maple / Aluminio aeroespacial',
                '5 resortes alemanes de alambre de piano calibrados',
                'Deslizamiento ultra silencioso con rodamientos sellados',
                'Garantía directa de 3 años y entrega asegurada en México',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5D5550] font-light">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/reformer-para-casa"
              className="block w-full py-5 text-center border border-[#2A2624] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-all"
            >
              Ver detalles para casa
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
                <p className="text-sm text-white/50 font-light">Desde</p>
                <p className="text-3xl font-serif italic text-[#EAE8E4]">$36,716</p>
                <p className="text-xs text-white/50">MXN · Torres hasta $85,050</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-white/10 pt-8">
              {[
                'Madera maciza o Aluminio con opción a Media Torre o Cadillac',
                'Tolerancias alemanas: cero vibración bajo uso continuo',
                'Tapicería de microfibra de alta densidad y fácil desinfección',
                'Garantía directa de 3 años con stock de refacciones en México',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 font-light">
                  <Check className="w-5 h-5 text-[#EAE8E4] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/reformer-para-estudio"
              className="block w-full py-5 text-center bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
            >
              Ver detalles para estudio
            </Link>
          </motion.div>
        </motion.div>

        {/* What Influences Price */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Qué determina el precio de un Reformer</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Star,
                title: 'Materiales del Chasis',
                desc: 'Roble macizo, Maple canadiense o aleación de aluminio aeroespacial aseguran rigidez indeformable y años de vida útil.',
              },
              {
                icon: Zap,
                title: 'Resortes y Silencio',
                desc: 'Alambre de piano alemán calibrado por color y rodamientos sellados de precisión japonesa garantizan fluidez total sin ruidos.',
              },
              {
                icon: Shield,
                title: 'Garantía y Refacciones Locales',
                desc: 'Garantía directa de 3 años con almacén de piezas en México, evitando meses de espera y aranceles de importación.',
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
          <h3 className="text-2xl font-serif italic text-[#2A2624] mb-8 text-center">Checklist para evaluar precio antes de comprar</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              '¿El chasis es de madera sólida o aluminio reforzado (sin tambaleo)?',
              '¿El carro se desliza con suavidad absoluta y sin fricción?',
              '¿Utiliza resortes de alambre de piano calibrados o cuerdas elásticas?',
              '¿El proveedor cuenta con bodega de refacciones y garantía en México?',
              '¿El precio incluye accesorios básicos (caja/box, correas, poleas)?',
              '¿El flete incluye seguro puerta a puerta y embalaje rígido?',
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

        {/* Interactive FAQ Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Preguntas Frecuentes sobre Precios</h2>
          <div className="space-y-4">
            {faqs.map((faqItem, i) => (
              <details key={i} className="group bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl overflow-hidden">
                <summary className="p-6 md:p-8 font-serif italic text-xl text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                  {faqItem.q}
                  <span className="text-[#3E2723] group-open:rotate-45 transition-transform text-2xl font-light ml-4 flex-shrink-0">+</span>
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-[#5D5550] font-light leading-relaxed border-t border-[#2A2624]/5 pt-4">
                  <p>{faqItem.a}</p>
                </div>
              </details>
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
