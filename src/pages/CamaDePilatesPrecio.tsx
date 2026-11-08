import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Zap, DollarSign, ArrowRight, MessageCircle } from 'lucide-react';
import BackLink from '@/components/ui/back-link';
import { priceLabel } from '@/lib/shop/catalog';
import { GYM, GYM_SLUGS, HOME_SLUGS, CATALOG_MAX, CATALOG_MIN, TOWER, TOWER_SLUGS, priceOf, rangeLabel } from '@/lib/shop/priceRanges';

const CamaDePilatesPrecio: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/cama-de-pilates/precio`;
  const { title, description: desc } = requireRouteMeta('/cama-de-pilates/precio');

  const faqs = [
    {
      q: '¿Cuánto cuesta una cama de Pilates en México en 2026?',
      a: `En México, el precio de una cama de Pilates Reformer Edelweiss va de ${CATALOG_MIN} MXN para los modelos clásicos de roble, aluminio y plegables, a ${priceLabel(TOWER.min)}–${priceLabel(TOWER.max)} MXN para las versiones con torre de acero inoxidable o maple alta gama, y hasta ${CATALOG_MAX} MXN para los gym reformers multiestación.`
    },
    {
      q: '¿Cuál es el precio de una cama de Pilates para casa?',
      a: `Nuestras opciones residenciales inician desde ${CATALOG_MIN} MXN. Cuentan con chasis rígido que elimina vibraciones, carro silencioso con rodamientos sellados y sistema de 5 resortes alemanes de alambre de piano.`
    },
    {
      q: '¿Cuál es el precio de una cama de Pilates de estudio profesional?',
      a: `Para un estudio, los Reformers con torre de acero inoxidable cuestan entre ${priceLabel(TOWER.min)} y ${priceLabel(TOWER.max)} MXN, y los gym reformers multiestación para gimnasios y estudios de alto volumen entre ${priceLabel(GYM.min)} y ${priceLabel(GYM.max)} MXN. Todos con garantía directa de 1 año.`
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
      q: '¿Qué incluye normalmente el precio de un Reformer Edelweiss Pilates?',
      a: 'Incluye el chasis completo ensamblado, carro tapizado en microfibra de alta resistencia, barra de pies ajustable multidireccional, sistema de 5 resortes alemanes calibrados por color, cabecera ajustable de 3 posiciones, hombreras ergonómicas, juego de poleas silenciosas, correas dobles de manos/pies y caja (box) según el modelo seleccionado.'
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
            Precios y modelos 2026 para casa y estudio: desde {CATALOG_MIN} MXN. Qué incluye el precio, diferencias de materiales, garantía directa y servicio técnico en México.
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
            En México en 2026, el precio de una cama de Pilates Reformer profesional oscila entre <strong>{CATALOG_MIN} MXN y {CATALOG_MAX} MXN</strong> según el material, la torre y la configuración:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Reformer para Casa</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">{rangeLabel(HOME_SLUGS)}</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Roble, maple o aluminio, con versiones plegables que se guardan al terminar.</span>
            </div>
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Con Torre o Alta Gama</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">{rangeLabel(TOWER_SLUGS)}</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Roble o maple con torre de acero inoxidable, o la versión Alta Gama en maple blanco.</span>
            </div>
            <div className="p-4 bg-[#F5F4F0] rounded-xl border border-[#2A2624]/5">
              <span className="block font-semibold text-[#2A2624] mb-1">Gym Reformer Multiestación</span>
              <span className="text-lg font-serif italic text-[#3E2723] block mb-1">{rangeLabel(GYM_SLUGS)}</span>
              <span className="text-xs text-[#5D5550] leading-snug block">Máquinas para gimnasios y estudios de alto volumen, con varias estaciones en un mismo carro.</span>
            </div>
          </div>
          <p className="text-xs text-[#5D5550]/80 mt-4 italic">
            *Todos los precios de Edelweiss Pilates incluyen IVA, garantía directa de 1 año en México y refacciones en 1 semana.
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
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg">A considerar</div>
              </div>

              {[
                { type: 'Reformer Clásico de Roble', link: '/product/reformer-clasico-roble-pl006', range: `${priceLabel(priceOf('reformer-clasico-roble-pl006'))} MXN`, use: 'Hogar / uso personal diario', includes: 'Roble macizo, caja de salto y barra de pies abatible', risk: 'Mide 238 × 73 cm: confirma el espacio libre' },
                { type: 'Reformer Elite de Aluminio', link: '/product/reformer-elite-aluminio-pl019', range: `${priceLabel(priceOf('reformer-elite-aluminio-pl019'))} MXN`, use: 'Hogar, departamento o estudio moderno', includes: 'Aluminio con detalles de madera, 70 kg', risk: 'Mide 245 cm de largo y no se pliega' },
                { type: 'Reformer Plegable de Aluminio', link: '/product/reformer-plegable-aluminio-pl019f', range: `${priceLabel(priceOf('reformer-plegable-aluminio-pl019f'))} MXN`, use: 'Departamentos y espacios pequeños', includes: 'Aluminio, se pliega y se guarda de pie (128 × 68 × 50 cm)', risk: 'Revisa dónde lo vas a guardar plegado' },
                { type: 'Reformer Clásico con Torre', link: '/product/reformer-clasico-roble-torre-pl006a', range: rangeLabel(['reformer-clasico-roble-torre-pl006a', 'reformer-clasico-maple-torre-pl001a']), use: 'Estudio que quiere reformer y torre en una máquina', includes: 'Roble o maple con torre de acero inoxidable', risk: 'Mide más de 2 m de alto: revisa la altura del techo' },
                { type: 'Gym Reformer Multiestación', link: '/product/gym-reformer-l009bt', range: rangeLabel(GYM_SLUGS), use: 'Gimnasios y estudios de alto volumen', includes: 'Aleación de aluminio, carro central con estaciones en los extremos', risk: 'Mide 319 cm de largo y pesa 185 kg' },
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
                <p className="text-3xl font-serif italic text-[#2A2624]">{CATALOG_MIN}</p>
                <p className="text-xs text-[#5D5550]">MXN</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-[#2A2624]/10 pt-8">
              {[
                'Roble macizo, maple blanco o aluminio, con versiones plegables',
                'Juego de resortes Normal, Estándar o Top a elegir',
                'Tapicería en negro, gris o blanco (otros colores bajo pedido)',
                'Garantía directa de 1 año y entrega asegurada en México',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5D5550] font-light">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <a
                href={`https://wa.me/525548468190?text=${encodeURIComponent(`Hola, me interesa cotizar un Reformer para casa (desde ${CATALOG_MIN} MXN). ¿Cuál sería el costo de flete a mi código postal?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-rybbit-event="click_price_home_whatsapp"
                className="flex items-center justify-center gap-2 w-full py-4 text-center bg-[#25D366] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#20ba59] transition-all shadow-md hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" /> Cotizar Home Edition por WhatsApp
              </a>
              <Link
                to="/reformer-para-casa"
                className="block w-full py-3.5 text-center border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-all"
              >
                Ver especificaciones para casa
              </Link>
            </div>
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
                <p className="text-3xl font-serif italic text-[#EAE8E4]">{priceLabel(TOWER.min)}</p>
                <p className="text-xs text-white/50">MXN · Gym reformers hasta {CATALOG_MAX}</p>
              </div>
            </div>
            <ul className="space-y-4 mb-10 border-t border-white/10 pt-8">
              {[
                'Roble o maple con torre de acero inoxidable, o gym reformers multiestación',
                'Tapicería en negro, gris o blanco (otros colores bajo pedido)',
                'Medidas y peso de cada modelo en su ficha técnica',
                'Garantía directa de 1 año y refacciones en 1 semana',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 font-light">
                  <Check className="w-5 h-5 text-[#EAE8E4] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <a
                href={`https://wa.me/525548468190?text=${encodeURIComponent(`Hola, me interesa cotizar camas Reformer para mi estudio de Pilates (con torre desde ${priceLabel(TOWER.min)} MXN). Solicito cotización con descuento por volumen.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-rybbit-event="click_price_studio_whatsapp"
                className="flex items-center justify-center gap-2 w-full py-4 text-center bg-[#25D366] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#20ba59] transition-all shadow-md hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" /> Cotizar Studio por WhatsApp
              </a>
              <Link
                to="/reformer-para-estudio"
                className="block w-full py-3.5 text-center bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
              >
                Ver especificaciones para estudio
              </Link>
            </div>
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
                desc: 'Roble macizo, maple blanco o aluminio aseguran rigidez indeformable y años de vida útil.',
              },
              {
                icon: Zap,
                title: 'Resortes y Silencio',
                desc: 'Alambre de piano alemán calibrado por color y rodamientos sellados de precisión japonesa garantizan fluidez total sin ruidos.',
              },
              {
                icon: Shield,
                title: 'Garantía y Refacciones Locales',
                desc: 'Garantía directa de 1 año en México y refacciones en 1 semana, sin aranceles de importación.',
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

        {/* Related Guides & Comparisons */}
        <div className="max-w-4xl mx-auto mb-24 p-8 md:p-12 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-[2rem]">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4 text-center">
            Guías de Compra y Comparativas Relacionadas
          </h2>
          <p className="text-sm text-[#5D5550] font-light text-center mb-8 max-w-xl mx-auto">
            Profundiza en especificaciones técnicas, diferencias estructurales y consejos de inversión para elegir el equipo perfecto:
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/reformer-para-estudio" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Equipamiento Estudio</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Reformers para Estudio →</span>
            </Link>
            <Link to="/blog/cama-de-pilates-guia-de-compra" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Guía Definitiva</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Guía de Compra Reformer →</span>
            </Link>
            <Link to="/blog/cama-de-pilates-reformer" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Aparatología</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Qué es y Cómo Funciona →</span>
            </Link>
            <Link to="/blog/mejor-cama-de-pilates-para-casa" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Uso Residencial</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Mejor Cama para Casa 2026 →</span>
            </Link>
            <Link to="/blog/cama-de-pilates-barata" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Presupuesto</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Cama de Pilates Barata →</span>
            </Link>
            <Link to="/product/reformer-clasico-roble-torre-pl006a" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Reformer con Torre</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Reformer Clásico de Roble con Torre →</span>
            </Link>
            <Link to="/blog/mejores-marcas-cama-de-pilates" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Marcas México</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Mejores Marcas de Camas →</span>
            </Link>
            <Link to="/blog/cama-de-pilates-segunda-mano" className="p-4 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#3E2723] hover:shadow-sm transition-all group block">
              <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">Evaluación</span>
              <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">Cama de Segunda Mano →</span>
            </Link>
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
            <div className="flex flex-wrap justify-center items-center gap-4">
              <a
                href={`https://wa.me/525548468190?text=${encodeURIComponent("Hola, me interesa la promoción del 20% de descuento en 8+ Reformers para mi estudio. Quisiera cotización formal y tiempos de entrega.")}`}
                target="_blank"
                rel="noopener noreferrer"
                data-rybbit-event="click_price_studio_pack_whatsapp"
                className="inline-flex items-center gap-2 px-8 py-5 bg-[#25D366] text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#20ba59] hover:scale-105 transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" /> Cotizar Descuento 8+ Unidades
              </a>
              <Link
                to="/packs/estudio"
                className="inline-flex items-center px-8 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all"
              >
                Ver packs de estudio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesPrecio;
