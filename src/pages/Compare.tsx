import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateCompareSchema } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Check, ArrowRight, Star, Shield, Truck, Clock } from 'lucide-react';
import { ContextualImage } from '@/components/ContextualImage';
import { motion } from 'framer-motion';
import BackLink from '@/components/ui/back-link';
import { selectModel } from '@/lib/shop/analytics';
import products from '@/content/products.json';
import type { Product as ShopProduct } from '@/lib/shop/types';

const Compare = () => {
  const origin = getOrigin();
  const title = 'Comparar Reformers: Casa vs Profesional | Edelweiss Pilates';
  const desc = 'Compara nuestro Reformer para casa vs profesional. Elige el ideal para tu espacio (hogar o estudio) con entrega en 3 semanas en México.';

  const casa = products.find((p) => p.slug === 'reformer-casa') as unknown as ShopProduct | undefined;
  const profesional = products.find((p) => p.slug === 'reformer-profesional') as unknown as ShopProduct | undefined;

  const compareSchema = generateCompareSchema();

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/compare`} />
        <script type="application/ld+json">
          {JSON.stringify(compareSchema)}
        </script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "¿Cuál es la diferencia entre el Reformer Casa y Profesional?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "El Reformer Casa ($35,000 MXN) es compacto y diseñado para uso personal en el hogar. El Profesional ($50,000 MXN) tiene construcción más robusta para uso intensivo en estudios, con mayor durabilidad y capacidad de peso."
              }
            },
            {
              "@type": "Question",
              "name": "¿Qué reformer es mejor para principiantes?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Para principiantes recomendamos el Reformer Casa. Ofrece todas las funcionalidades esenciales a un precio accesible y es perfecto para práctica personal en casa."
              }
            },
            {
              "@type": "Question",
              "name": "¿Qué es el acabado Mycelium?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Mycelium (Mylo™) es un material sostenible hecho de micelio de hongos. Es una alternativa ecológica al cuero tradicional, con tacto premium y origen 100% renovable. Disponible como opción premium (+$3,000-5,000 MXN)."
              }
            },
            {
              "@type": "Question",
              "name": "¿Ambos modelos son silenciosos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sí, ambos modelos incluyen nuestro sistema Whisper Glide con 8 ruedas que garantiza un deslizamiento completamente silencioso, sin diferencia entre el modelo Casa y Profesional."
              }
            }
          ]
        })}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-24 max-w-[1800px] mx-auto min-h-screen overflow-hidden">
        <BackLink className="mb-8 hidden md:inline-flex opacity-60 hover:opacity-100 transition-opacity" fallbackTo="/" label="Volver" />

        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="text-center mb-24 md:mb-32 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="block text-xs font-bold font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 opacity-60"
          >
            Hecho en Ciudad de México
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-8 tracking-tighter"
          >
            Comparar Reformers<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed tracking-tight"
          >
            Dos modelos, una misma filosofía: <br className="hidden md:block" />
            silencio total, materiales premium y tolerancias precisas.
          </motion.p>
        </div>

        {/* Model Split */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid lg:grid-cols-2 gap-6 md:gap-12 mb-32"
        >
          {/* Home Model */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="group relative bg-[#F5F4F0] rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl border border-transparent hover:border-[#2A2624]/5"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/images/compare-home.webp"
                alt="Edelweiss Home Reformer"
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-14">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#EB4C42] transition-colors">The Home</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550] font-bold opacity-60">Para casa</p>
                </div>
                <div className="text-2xl font-serif italic text-[#2A2624] opacity-50">$35,000</div>
              </div>
              <p className="text-[#5D5550] font-light mb-12 leading-relaxed text-lg max-w-md">
                Compacto sin sacrificar el recorrido suave y silencioso. Diseñado para integrarse en tu espacio.
              </p>
              <Link
                to="/product/reformer-casa"
                onClick={() => { if (casa) selectModel({ model: 'casa', product: casa, source: 'compare' }); }}
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Ver y comprar
              </Link>
              <a
                href="https://wa.me/523222787690"
                className="mt-3 inline-flex items-center justify-center w-full px-8 py-5 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Professional Model */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="group relative bg-[#1C1917] text-[#EAE8E4] rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="aspect-[4/3] overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/images/compare-pro.webp"
                alt="Edelweiss Professional Reformer"
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
              />
            </div>
            <div className="p-8 md:p-14">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-serif italic text-[#EAE8E4] mb-2 group-hover:text-white transition-colors">The Pro</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Para estudio</p>
                </div>
                <div className="text-2xl font-serif italic text-white/50">$50,000</div>
              </div>
              <p className="text-white/70 font-light mb-12 leading-relaxed text-lg max-w-md">
                Diseñado para uso continuo. Estructura reforzada y estabilidad para estudios.
              </p>
              <Link
                to="/product/reformer-profesional"
                onClick={() => { if (profesional) selectModel({ model: 'profesional', product: profesional, source: 'compare' }); }}
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Ver y comprar
              </Link>
              <a
                href="https://wa.me/523222787690"
                className="mt-3 inline-flex items-center justify-center w-full px-8 py-5 border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-32">
          <h2 className="text-4xl fn-serif italic text-[#2A2624] mb-12 text-center">Comparativa técnica</h2>

          <div className="overflow-x-auto pb-4 md:pb-0">
            <div className="min-w-[600px] bg-white/60 backdrop-blur-md rounded-[2rem] border border-[#2A2624]/5 overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 border-b border-[#2A2624]/5 bg-[#2A2624]/[0.02]">
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg md:text-xl">Característica</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-center text-lg md:text-xl">Casa</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-center text-lg md:text-xl">Profesional</div>
              </div>

              {[
                { label: 'Ideal para', home: 'Casa (1–2 usuarios)', pro: 'Estudio / comercial' },
                { label: 'Estructura', home: 'Nogal y acero', pro: 'Nogal y acero reforzado' },
                { label: 'Carro', home: 'Deslizamiento silencioso', pro: 'Silencioso + uso intensivo' },
                { label: 'Barra de pies', home: '3 posiciones', pro: 'Más posiciones / ajuste rápido' },
                { label: 'Resortes', home: 'Set estándar', pro: 'Set de precisión' },
                { label: 'Box y jumpboard', home: 'Incluidos', pro: 'Incluidos (grado estudio)' },
                { label: 'Garantía', home: '1 año', pro: '1 año (uso estudio)' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-[#2A2624]/5 last:border-0 hover:bg-white transition-colors group">
                  <div className="p-6 md:p-8 text-xs md:text-sm font-bold text-[#2A2624] uppercase tracking-wider opacity-60">{row.label}</div>
                  <div className="p-6 md:p-8 text-sm md:text-base text-[#5D5550] text-center font-light group-hover:text-[#2A2624] transition-colors">{row.home}</div>
                  <div className="p-6 md:p-8 text-sm md:text-base text-[#5D5550] text-center font-light group-hover:text-[#2A2624] transition-colors">{row.pro}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Studio Pack CTA */}
        <div className="bg-[#2A2624] text-[#EAE8E4] rounded-[2rem] p-12 md:p-24 text-center relative overflow-hidden">
          {/* Background Mesh */}
          <div className="absolute top-1/2 left-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl rounded-full bg-blue-900/40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/50 mb-6">
              Para dueños de estudio
            </span>
            <h2 className="text-5xl md:text-6xl font-serif italic leading-tight mb-8">
              ¿Montando un estudio?
            </h2>
            <p className="text-xl text-white/70 font-light mb-12 leading-relaxed">
              Ofrecemos precio especial para pedidos de 8+ unidades, con instalación coordinada y soporte prioritario.
            </p>
            <Link
              to="/packs/estudio"
              className="inline-flex items-center px-10 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all"
            >
              Ver packs para estudio
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-32">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-16 text-center">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
              { q: '¿Cuánto tarda la entrega?', a: 'Entregamos en México en 3 semanas. Envíos internacionales varían según destino.' },
              { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos pago con tarjeta y transferencia. Si necesitas ayuda para cotizar, escríbenos por WhatsApp.' },
              { q: '¿Puedo personalizar el acabado?', a: 'Tenemos acabados estándar y opciones bajo pedido para compras por volumen (8+).' },
              { q: '¿Requiere instalación?', a: 'Los reformers llegan casi listos. El setup final toma ~20 minutos con las herramientas incluidas.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-transparent border-b border-[#2A2624]/10 pb-6">
                <summary className="font-serif italic text-xl text-[#2A2624] cursor-pointer hover:text-[#3E2723] transition-colors list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#3E2723] group-open:rotate-45 transition-transform text-2xl font-light">+</span>
                </summary>
                <div className="mt-4 text-[#5D5550] font-light leading-relaxed text-lg">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default Compare;
