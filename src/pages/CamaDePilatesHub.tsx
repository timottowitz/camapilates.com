import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ShoppingBag, DollarSign, Ruler, Package, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const CamaDePilatesHub: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/cama-de-pilates`;
  const { title, description: desc } = requireRouteMeta('/cama-de-pilates');

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
      { '@type': 'ListItem', position: 1, url: `${origin}/shop/category/reformers`, name: 'Catálogo de Reformers' },
      { '@type': 'ListItem', position: 2, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 3, url: `${origin}/blog/dimensiones-cama-de-pilates`, name: 'Dimensiones de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/reformer-para-estudio`, name: 'Reformer de Estudio' },
      { '@type': 'ListItem', position: 5, url: `${origin}/reformer-para-casa`, name: 'Reformer para Casa' },
      { '@type': 'ListItem', position: 6, url: `${origin}/packs/estudio`, name: 'Pack para Estudios (8+)' },
      { '@type': 'ListItem', position: 7, url: `${origin}/shop/category/cadillacs-y-torres`, name: 'Camas de Pilates Cadillac y Torres' },
      { '@type': 'ListItem', position: 8, url: `${origin}/shop/category/ropa`, name: 'Ropa y Calcetines para Pilates Reformer' },
    ],
  };

  const faqs = [
    {
      q: '¿Cuánto cuesta una cama de Pilates Reformer en México?',
      a: 'En México, los precios de camas de Pilates profesionales inician desde $23,234 MXN para modelos clásicos de roble, entre $28,000 y $38,000 MXN para modelos de maple norteamericano y aluminio de alta gama, y entre $51,000 y $85,050 MXN para equipos que incorporan media torre o estructura de Cadillac. Todos nuestros precios incluyen IVA y garantía directa.'
    },
    {
      q: '¿Qué es una cama de Pilates Cadillac y en qué se diferencia del Reformer tradicional?',
      a: 'La cama de Pilates Cadillac (o mesa trapecio) incorpora una estructura tubular superior de acero inoxidable con trapecio, barras de empuje y resortes aéreos. Permite trabajo de suspensión tridimensional y rehabilitación profunda que complementa al Reformer. En Edelweiss Pilates contamos con modelos de cama Cadillac completos en roble, maple y aluminio desde $26,287 MXN con entrega asegurada en México.'
    },
    {
      q: '¿Cuál es la diferencia entre un Reformer de madera y uno de aluminio?',
      a: 'Ambos ofrecen exactamente la misma precisión biomecánica. Los Reformers de madera maciza (como el Maple y Roble) aportan una estética orgánica, cálida y clásica sumamente cotizada en estudios boutique y residencias. Los Reformers de aluminio ofrecen una estética contemporánea e industrial, menor peso total para facilitar reubicaciones y rieles anodizados de altísima resistencia al desgaste.'
    },
    {
      q: '¿Qué espacio necesito para tener un Reformer en casa o departamento?',
      a: 'El equipo mide en promedio 240 cm de largo por 70 cm de ancho. Se aconseja disponer de una superficie de al menos 3.0 m x 1.8 m para entrar y salir con comodidad y extender los brazos lateralmente sin obstáculos.'
    },
    {
      q: '¿Ofrecen opciones de pago a Meses Sin Intereses (MSI)?',
      a: 'Sí. Aceptamos pagos con tarjeta de crédito con planes de hasta 12 Meses Sin Intereses con bancos participantes a través de nuestras pasarelas de pago certificadas. También contamos con descuentos preferenciales en pagos de contado por transferencia bancaria SPEI.'
    },
    {
      q: '¿Hacen envíos a Monterrey, Guadalajara, Querétaro y todo México?',
      a: 'Sí, realizamos envíos asegurados a las 32 entidades federativas del país. La mercancía viaja con seguro contra daños de transporte puerta a puerta en caja de exportación de madera tratada. El tiempo estimado de entrega es de 3 a 8 semanas según el acabado y modelo seleccionado.'
    },
    {
      q: '¿Qué garantía tienen los Reformers y cómo se gestionan las refacciones?',
      a: 'Ofrecemos una garantía directa de 3 años en chasis, rieles y mecanismos estructurales. Contamos con almacén local de refacciones en México con resortes de repuesto, poleas, correas de cuero y microfibra con envío exprés de 24 a 48 horas.'
    },
    {
      q: '¿Cómo se calibra la resistencia de los resortes y qué combinaciones se usan?',
      a: 'Nuestras camas incorporan un sistema de 5 resortes alemanes calibrados por código de color: 1 amarillo (25% ligero), 2 azules (50% medio) y 2 rojos (100% pesado), permitiendo graduar la resistencia con precisión para calentamiento, core abdominal o saltos pliométricos en Jumpboard.'
    },
    {
      q: '¿Qué mantenimiento preventivo requiere un Reformer en México y cada cuándo se cambian los resortes?',
      a: 'Se recomienda limpiar rieles semanalmente con microfibra seca, desinfectar la tapicería sin alcohol y revisar resortes cada 6 meses. En casa duran de 3 a 5 años; en estudios comerciales de alto flujo se sugiere renovación cada 18 a 24 meses.'
    },
    {
      q: '¿Por qué un Reformer de madera maciza o aluminio estructural es superior a una cama plegable económica?',
      a: 'Las camas plegables económicas de menos de $15,000 MXN sufren flexión en articulaciones centrales y usan ruedas plásticas ruidosas. Una estructura de Maple o Roble de 3 cm o aluminio aeronáutico absorbe vibraciones, no se descalibra y soporta hasta 180-200 kg con deslizamiento silencioso.'
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
            <Link to="/shop/category/reformers" className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] hover:scale-105 transition-all">
              Ver catálogo de camas <ArrowRight className="w-4 h-4" />
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
              to="/shop/category/reformers"
              className="group block h-full bg-[#1C1917] text-[#EAE8E4] rounded-[2rem] p-10 md:p-14 relative overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
              <ShoppingBag className="w-8 h-8 mb-8 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4 group-hover:text-white transition-colors">
                Modelos y Venta Directa
              </h2>
              <p className="text-white/60 font-light text-lg mb-8 max-w-md">
                22 modelos de Reformer con entrega asegurada en todo México y garantía de 3 años.
              </p>
              <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
                Explorar catálogo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                Rangos de referencia en México y qué incluye cada nivel.
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
              to="/shop/category/reformers"
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

        {/* Competitor Brand Comparison Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#EB4C42] block mb-2">Análisis de Mercado México 2026</span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624]">
              Edelweiss Pilates vs. Otras Marcas en México
            </h2>
            <p className="text-[#5D5550] max-w-2xl mx-auto mt-4 font-light text-sm md:text-base">
              Compara con total transparencia: materiales del chasis, calibración de resortes, silencio en rodamientos y disponibilidad inmediata de refacciones y garantía en el país.
            </p>
          </div>

          <div className="overflow-x-auto bg-white/70 backdrop-blur-md rounded-3xl border border-[#2A2624]/5 p-6 md:p-8 shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#2A2624]/10 pb-4 text-[#2A2624]">
                  <th className="p-3 md:p-4 font-serif italic text-base">Criterio</th>
                  <th className="p-3 md:p-4 font-serif italic text-base text-[#2A2624] bg-[#2A2624]/5 rounded-t-xl">Edelweiss Pilates®</th>
                  <th className="p-3 md:p-4 font-serif italic text-base text-[#5D5550]">Vanlig / Centurfit</th>
                  <th className="p-3 md:p-4 font-serif italic text-base text-[#5D5550]">Ironside / Tayga</th>
                  <th className="p-3 md:p-4 font-serif italic text-base text-[#5D5550]">Balanced Body / Merrithew</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2624]/5 text-[#5D5550]">
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Origen y Manufactura</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">Ingeniería alemana · Taller en México</td>
                  <td className="p-3 md:p-4">Importación de China (revendedor)</td>
                  <td className="p-3 md:p-4">Marca de crossfit / fitness</td>
                  <td className="p-3 md:p-4">Importado de EE.UU. / Canadá</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Materiales del Chasis</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">Madera maciza (Maple/Roble) o Aluminio</td>
                  <td className="p-3 md:p-4">Acero tubular delgado o contrachapado</td>
                  <td className="p-3 md:p-4">Aluminio plegable básico</td>
                  <td className="p-3 md:p-4">Madera noble o aluminio extrusionado</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Sistema de Resortes</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">5 resortes alemanes de alambre de piano</td>
                  <td className="p-3 md:p-4">Ligas o resortes sin calibración</td>
                  <td className="p-3 md:p-4">Resortes genéricos de tensión media</td>
                  <td className="p-3 md:p-4">Resortes patentados premium</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Rodamientos y Silencio</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">8 rodamientos sellados Whisper-Glide</td>
                  <td className="p-3 md:p-4">Ruedas plásticas propensas a chirridos</td>
                  <td className="p-3 md:p-4">Ruedas estándar de nylon</td>
                  <td className="p-3 md:p-4">Ruedas de uretano de alta precisión</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Capacidad de Carga</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">Hasta 180–200 kg certificados</td>
                  <td className="p-3 md:p-4">100–120 kg (baja estabilidad)</td>
                  <td className="p-3 md:p-4">130–150 kg máximo</td>
                  <td className="p-3 md:p-4">150–180 kg</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Rango de Precios (MXN)</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5">$23,234 a $85,050 MXN (12 MSI)</td>
                  <td className="p-3 md:p-4">$4,489 a $50,999 MXN (stock agotado)</td>
                  <td className="p-3 md:p-4">$19,690 a $25,990 MXN</td>
                  <td className="p-3 md:p-4">$90,000 a $160,000+ MXN</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-semibold text-[#2A2624]">Garantía y Refacciones</td>
                  <td className="p-3 md:p-4 font-bold text-[#2A2624] bg-[#2A2624]/5 rounded-b-xl">3 años · Almacén local en MX (24-48h)</td>
                  <td className="p-3 md:p-4 text-rose-600">3-6 meses · Sin refacciones oficiales</td>
                  <td className="p-3 md:p-4">Garantía genérica de gimnasio</td>
                  <td className="p-3 md:p-4">Garantía en EE.UU. · Refacciones en USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Spring Resistance Calibration Guide */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E2723] opacity-60 block mb-2">Ingeniería Biomecánica</span>
            <h2 className="text-4xl font-serif italic text-[#2A2624]">
              Sistema de 5 Resortes Alemanes Calibrados
            </h2>
            <p className="text-[#5D5550] max-w-2xl mx-auto mt-4 font-light text-sm md:text-base">
              El resorte en Pilates asiste o desafía la estabilidad. Conoce la configuración exacta de resistencia por código de color en nuestras camas:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-amber-50/50 border border-amber-200/60 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-4 h-4 rounded-full bg-amber-400 shadow-sm" />
                <h3 className="font-serif italic text-xl text-[#2A2624]">1 Resorte Amarillo (25%)</h3>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">Tensión Ligera · Asistencia y Control</p>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-4">
                Menor resistencia de retorno para series de brazos sentados, rehabilitación de hombros y ejercicios donde un resorte ligero exige control abdominal máximo.
              </p>
              <span className="text-xs font-medium text-stone-700 bg-white px-3 py-1 rounded-full border border-stone-200">
                Long Spine · Arm Springs
              </span>
            </div>

            <div className="p-8 bg-sky-50/50 border border-sky-200/60 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-4 h-4 rounded-full bg-sky-500 shadow-sm" />
                <h3 className="font-serif italic text-xl text-[#2A2624]">2 Resortes Azules (50% c/u)</h3>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-900 mb-3">Tensión Media · Estándar Funcional</p>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-4">
                La resistencia base para más del 60% del repertorio: Hundred, Stomach Massage, Mermaid y trabajo unilateral de cadera sin fatiga del resorte.
              </p>
              <span className="text-xs font-medium text-stone-700 bg-white px-3 py-1 rounded-full border border-stone-200">
                The Hundred · Elephant · Short Box
              </span>
            </div>

            <div className="p-8 bg-rose-50/50 border border-rose-200/60 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-4 h-4 rounded-full bg-rose-500 shadow-sm" />
                <h3 className="font-serif italic text-xl text-[#2A2624]">2 Resortes Rojos (100% c/u)</h3>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-3">Tensión Fuerte · Carga y Salto</p>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-4">
                Resistencia pesada para cuádriceps y glúteos en Footwork inicial y absorción de impacto controlada en saltos cardiovasculares con tabla de salto (Jumpboard).
              </p>
              <span className="text-xs font-medium text-stone-700 bg-white px-3 py-1 rounded-full border border-stone-200">
                Footwork · Jumpboard Cardiovascular
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pitfalls Framework */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="bg-[#FAF8F5] border border-[#2A2624]/10 rounded-3xl p-8 md:p-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#EB4C42] block mb-2">Guía del Comprador</span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-8">
              4 Errores Críticos al Comprar una Cama de Pilates en México
            </h2>
            <div className="space-y-6">
              {[
                {
                  num: '1',
                  title: 'Elegir aparatos de menos de $10,000 MXN con ligas de goma',
                  desc: 'Las camas con ligas o elásticos tubulares pierden tensión rápidamente, tienen carros inestables sin baleros y carecen de la biomecánica necesaria para el método Pilates real.',
                },
                {
                  num: '2',
                  title: 'Comprar equipo importado sin almacén de refacciones en México',
                  desc: 'Un resorte o polea dañada en un equipo sin piezas locales puede dejar tu estudio sin operar durante meses esperando importaciones costosas en dólares.',
                },
                {
                  num: '3',
                  title: 'Confundir una cama plegable ligera con una de estudio comercial',
                  desc: 'Los modelos plegables son ideales para departamentos, pero no resisten 8 horas continuas de uso con usuarios de más de 100 kg. Para estudios se requiere madera maciza o aluminio estructural indeformable.',
                },
                {
                  num: '4',
                  title: 'Ignorar las posiciones de ajuste de la barra de pies',
                  desc: 'Una barra fija fuerza a alumnos de distintas estaturas a ángulos de rodilla lesivos. Nuestras camas cuentan con 4 a 6 posiciones para estaturas desde 1.45 m hasta 2.05 m.',
                },
              ].map((err, i) => (
                <div key={i} className="flex gap-4 items-start border-b border-[#2A2624]/5 pb-5 last:border-0 last:pb-0">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2A2624] text-[#EAE8E4] flex items-center justify-center text-xs font-bold">{err.num}</span>
                  <div>
                    <h3 className="text-base font-bold text-[#2A2624] mb-1">{err.title}</h3>
                    <p className="text-sm text-[#5D5550] font-light leading-relaxed">{err.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
            to="/reformer-para-estudio"
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
            to="/reformer-para-casa"
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
              { href: '/shop', title: 'Tienda Oficial de Camas de Pilates', desc: 'Explora toda la colección de Reformers, Torres y accesorios.' },
              { href: '/blog/cama-de-pilates-guia-de-compra', title: 'Guía de compra de cama de Pilates', desc: 'Factores clave, resortes, chasis y dimensiones antes de comprar.' },
              { href: '/blog/mejor-cama-de-pilates-para-casa', title: 'Mejor cama de Pilates para casa', desc: 'Cómo elegir por espacio, presupuesto y accesorios.' },
              { href: '/blog/reformer-compacto', title: 'Reformer compacto para departamentos', desc: 'Solución extraordinaria para espacios pequeños sin sacrificar calidad.' },
              { href: '/cama-de-pilates/precio', title: 'Precio de la cama de Pilates', desc: 'Rangos de referencia en México y qué incluye cada nivel.' },
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
            {faqs.map((faqItem, i) => (
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
