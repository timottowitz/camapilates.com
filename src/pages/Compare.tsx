import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateCompareSchema } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Check, ArrowRight, Star, Shield, Truck, Clock } from 'lucide-react';
import { ContextualImage } from '@/components/ContextualImage';
import { motion } from 'framer-motion';
import BackLink from '@/components/ui/back-link';

const Compare = () => {
  const origin = getOrigin();
  const title = 'The Collection | Edelweiss Pilates';
  const desc = 'Compare our professional and home reformer models. German engineering, Mexican soul. 3-week delivery.';

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
            Handcrafted in Mexico City
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-serif italic text-[#2A2624] leading-[0.85] mb-8 tracking-tighter"
          >
            The Collection<span className="text-[#EB4C42]">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed tracking-tight"
          >
            Two distinct models, one shared philosophy: <br className="hidden md:block" />
            absolute silence, organic materials, and precision engineering.
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#5D5550] font-bold opacity-60">For Your Sanctuary</p>
                </div>
                <div className="text-2xl font-serif italic text-[#2A2624] opacity-50">$35,000</div>
              </div>
              <p className="text-[#5D5550] font-light mb-12 leading-relaxed text-lg max-w-md">
                Compact footprint without compromising the smooth, silent glide. Designed to blend seamlessly into your living space.
              </p>
              <Link
                to="/product/reformer-casa"
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Shop Home
              </Link>
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">For The Studio</p>
                </div>
                <div className="text-2xl font-serif italic text-white/50">$50,000</div>
              </div>
              <p className="text-white/70 font-light mb-12 leading-relaxed text-lg max-w-md">
                Engineered for continuous use. Reinforced structure, extended carriage, and complete accessory kit for the demanding instructor.
              </p>
              <Link
                to="/product/reformer-profesional"
                className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Shop Professional
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-32">
          <h2 className="text-4xl fn-serif italic text-[#2A2624] mb-12 text-center">Technical Comparison</h2>

          <div className="overflow-x-auto pb-4 md:pb-0">
            <div className="min-w-[600px] bg-white/60 backdrop-blur-md rounded-[2rem] border border-[#2A2624]/5 overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 border-b border-[#2A2624]/5 bg-[#2A2624]/[0.02]">
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-lg md:text-xl">Feature</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-center text-lg md:text-xl">Home</div>
                <div className="p-6 md:p-8 font-serif italic text-[#2A2624] text-center text-lg md:text-xl">Professional</div>
              </div>

              {[
                { label: 'Ideal For', home: 'Home Use (1-2 users)', pro: 'Studio / Commercial' },
                { label: 'Structure', home: 'Walnut & Standard Steel', pro: 'Walnut & Reinforced Steel' },
                { label: 'Carriage', home: 'Silent Glide', pro: 'Silent Glide + Heavy Duty' },
                { label: 'Footbar', home: '3 Positions', pro: '5 Positions Quick-Adjust' },
                { label: 'Springs', home: '5 Standard', pro: '5 High-Precision' },
                { label: 'Box & Jumpboard', home: 'Included', pro: 'Included (Studio Grade)' },
                { label: 'Warranty', home: '1 Year', pro: '1 Year Commercial' },
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
              For Studio Owners
            </span>
            <h2 className="text-5xl md:text-6xl font-serif italic leading-tight mb-8">
              Equipping a Studio?
            </h2>
            <p className="text-xl text-white/70 font-light mb-12 leading-relaxed">
              We offer exclusive pricing for orders of 8+ units, including coordinated installation and priority support.
            </p>
            <Link
              to="/packs/estudio"
              className="inline-flex items-center px-10 py-5 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all"
            >
              View Studio Packs
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-32">
          <h2 className="text-4xl font-serif italic text-[#2A2624] mb-16 text-center">Common Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How long does delivery take?', a: 'We deliver nationwide in Mexico within 3 weeks. International shipping times vary by location.' },
              { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos pago con tarjeta y transferencia. Si necesitas ayuda para cotizar, escríbenos por WhatsApp.' },
              { q: 'Can I customize the finish?', a: 'We offer standard Walnut and Black finishes. Custom finishes are available for bulk orders.' },
              { q: 'Is assembly required?', a: 'Our reformers arrive 90% assembled. Final setup takes about 20 minutes with included tools.' }
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
