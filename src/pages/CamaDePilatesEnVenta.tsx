import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';
import { Truck, Shield, Package, ArrowRight } from 'lucide-react';
import BackLink from '@/components/ui/back-link';

const CamaDePilatesEnVenta: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/cama-de-pilates/en-venta`;
  const title = 'Cama de Pilates en Venta: Envío en México desde CDMX';
  const desc = 'Cama de Pilates (Reformer) en venta con entrega 3 semanas en México. Materiales premium (cuero, nogal, acero), silencio total, garantía 1 año y repuestos exprés.';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/product/reformer-profesional`, name: 'Cama de Pilates Reformer – Profesional' },
      { '@type': 'ListItem', position: 2, url: `${origin}/product/reformer-casa`, name: 'Cama de Pilates Reformer – Casa' },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Cuánto tarda el envío en México?', acceptedAnswer: { '@type': 'Answer', text: 'Desde CDMX entregamos en 3 semanas hábiles. Para pedidos por volumen (8+), coordinamos fechas de instalación.' } },
      { '@type': 'Question', name: '¿Qué garantía ofrecen?', acceptedAnswer: { '@type': 'Answer', text: 'Garantía de 1 año. Repuestos exprés y soporte en español.' } },
      { '@type': 'Question', name: '¿Hay descuento para estudios?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. A partir de 8 unidades aplicamos 20% de descuento y podemos coordinar instalación.' } },
    ],
  };

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-24 max-w-[1800px] mx-auto min-h-[70vh]">
        <BackLink className="mb-8 hidden md:inline-flex opacity-60 hover:opacity-100 transition-opacity" fallbackTo="/cama-de-pilates" label="Volver" />

        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="text-center mb-16 md:mb-24 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60"
          >
            En Venta — México
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-serif italic text-[#2A2624] leading-[0.85] mb-8 tracking-tighter"
          >
            Cama de Pilates<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed tracking-tight"
          >
            Silencio total, estabilidad sin vibraciones. <br className="hidden md:block" />
            Cuero genuino, nogal y acero estructural.
          </motion.p>
        </div>

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-20"
        >
          {[
            { icon: Truck, label: 'Entrega', value: '3 semanas', detail: 'Desde CDMX a todo México' },
            { icon: Shield, label: 'Garantía', value: '1 año', detail: 'Soporte en español' },
            { icon: Package, label: 'Repuestos', value: 'Exprés', detail: 'Piezas y mantenimiento' },
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-500 group">
              <item.icon className="w-5 h-5 text-[#3E2723] mb-4 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550] font-bold mb-1">{item.label}</p>
              <p className="text-2xl font-serif italic text-[#2A2624]">{item.value}</p>
              <p className="text-sm text-[#5D5550] font-light mt-1">{item.detail}</p>
            </div>
          ))}
        </motion.div>

        {/* Product Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-24"
        >
          {/* Profesional */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <Link
              to="/product/reformer-profesional"
              className="group block bg-[#1C1917] text-[#EAE8E4] rounded-[2rem] overflow-hidden transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img
                  src="/images/compare-pro.webp"
                  alt="Reformer Profesional Edelweiss"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-[#EAE8E4] mb-2 group-hover:text-white transition-colors">
                      Reformer Profesional
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Para estudio</p>
                  </div>
                  <span className="text-xl font-serif italic text-white/50">$50,000</span>
                </div>
                <ul className="text-white/70 font-light space-y-2 mb-8 text-sm md:text-base">
                  <li>• Estructura reforzada para uso intensivo</li>
                  <li>• Cuero genuino, nogal y acero estructural</li>
                  <li>• Garantía 1 año, repuestos exprés</li>
                </ul>
                <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                  Ver detalles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Casa */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <Link
              to="/product/reformer-casa"
              className="group block bg-[#F5F4F0] rounded-[2rem] overflow-hidden transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl border border-transparent hover:border-[#2A2624]/5"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src="/images/compare-home.webp"
                  alt="Reformer Casa Edelweiss"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">
                      Reformer Casa
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550] font-bold opacity-60">Para hogar</p>
                  </div>
                  <span className="text-xl font-serif italic text-[#2A2624] opacity-50">$35,000</span>
                </div>
                <ul className="text-[#5D5550] font-light space-y-2 mb-8 text-sm md:text-base">
                  <li>• Compacto sin sacrificar el recorrido</li>
                  <li>• Cuero genuino y estructura de madera</li>
                  <li>• Entrega rápida en México</li>
                </ul>
                <span className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-[#3E2723]/60 group-hover:text-[#2A2624] transition-colors">
                  Ver detalles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Materials Section */}
        <div className="max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-12 text-center">Materiales y acabados</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Cuero genuino', desc: 'Agradable al contacto, mantiene agarre y color con el uso.' },
              { title: 'Madera de nogal', desc: 'Cálida y elegante; acabado protector que respira.' },
              { title: 'Acero estructural', desc: 'Rigidez y precisión para un recorrido silencioso.' },
            ].map((material, i) => (
              <div key={i} className="p-6 md:p-8 bg-white/60 backdrop-blur-sm border border-[#2A2624]/5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-500">
                <h3 className="text-xl font-serif italic text-[#2A2624] mb-2">{material.title}</h3>
                <p className="text-[#5D5550] font-light text-sm leading-relaxed">{material.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Discount CTA */}
        <div className="bg-[#2A2624] text-[#EAE8E4] rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden mb-24">
          <div className="absolute top-1/2 left-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl rounded-full bg-blue-900/40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/50 mb-6">
              Para dueños de estudio
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight mb-6">
              20% descuento en 8+ unidades
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-light mb-10 leading-relaxed">
              Coordinamos instalación, entrega por lotes y soporte prioritario para tu estudio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/packs/estudio"
                className="inline-flex items-center justify-center px-10 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all"
              >
                Ver packs para estudio
              </Link>
              <a
                href="https://wa.me/525548468190"
                className="inline-flex items-center justify-center px-10 py-5 border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#5D5550] font-light mb-6">
            ¿Quieres elegir rápido? Empieza por{' '}
            <Link to="/cama-de-pilates/precio" className="text-[#2A2624] underline underline-offset-4 hover:text-[#EB4C42] transition-colors">precio</Link>
            {' '}y luego explora nuestro{' '}
            <Link to="/products" className="text-[#2A2624] underline underline-offset-4 hover:text-[#EB4C42] transition-colors">catálogo completo</Link>.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all"
            >
              Ir a la tienda
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesEnVenta;
