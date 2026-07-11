import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { motion } from 'framer-motion';

const StudioPack: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/packs/estudio`;
  const title = 'Pack para Estudios: 8+ Camas de Pilates con 20% de Descuento';
  const desc = 'Pack para estudios: a partir de 8 camas de Pilates (Reformer) obtén 20% de descuento. Instalación coordinada, garantía 1 año y repuestos exprés. Envío desde CDMX.';

  const [qty, setQty] = useState(8);
  const unitPrice = 50000; // MXN studio reformer base
  const discounted = Math.round(unitPrice * 0.8);
  const subtotal = qty * discounted;

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Cuál es el descuento para estudios?', acceptedAnswer: { '@type': 'Answer', text: '20% de descuento a partir de 8 unidades.' } },
      { '@type': 'Question', name: '¿Coordinan instalación?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. Coordinamos entrega por lotes e instalación según agenda del estudio.' } },
      { '@type': 'Question', name: '¿Cuánto tarda la entrega?', acceptedAnswer: { '@type': 'Answer', text: 'Entregas desde CDMX en 3 semanas dentro de México. Para pedidos voluminosos, confirmamos fecha de instalación.' } },
    ],
  };

  const aggregateOffer = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Pack de Estudio Edelweiss (8+ Reformers)',
    description: 'Pack para estudios con descuento del 20% a partir de 8 unidades. Instalación coordinada y garantía de 1 año.',
    brand: { '@type': 'Brand', name: 'Edelweiss Pilates' },
    url,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'MXN',
      lowPrice: 8 * Math.round(50000 * 0.8),
      highPrice: 20 * Math.round(50000 * 0.8),
      offerCount: 2,
      availability: 'https://schema.org/InStock',
    },
  };

  const mailto = () => {
    const subject = encodeURIComponent('Cotización Pack Estudio Edelweiss');
    const body = encodeURIComponent(
      `Hola, me interesa el pack de estudio.\n\nCantidad: ${qty}\nSubtotal estimado: MXN ${subtotal.toLocaleString()}\n\nNombre:\nEstudio/Ciudad:\nTeléfono/WhatsApp:\nNotas:`
    );
    window.location.href = `mailto:ventas@camadepilates.com?subject=${subject}&body=${body}`;
  };

  return (
    <LuxuryLayout>
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
        <script type="application/ld+json">{JSON.stringify(aggregateOffer)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8">
            Professional Studios
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
            Equip your studio <br />
            <span className="not-italic font-light font-sans tracking-tight">with Excellence.</span>
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-2xl leading-relaxed">
            20% de descuento a partir de 8 Reformers. Coordinamos instalación, ofrecemos garantía de 1 año y repuestos exprés. Envío desde CDMX.
          </p>
        </motion.div>

        <div className="mt-24 grid lg:grid-cols-3 gap-12">
          {/* Pricing Block */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
              <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Estimated Investment</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">Precio Unitario</div>
                  <div className="text-3xl font-serif italic text-[#2A2624]">$ {unitPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">Con 20% OFF</div>
                  <div className="text-3xl font-serif italic text-[#3E2723]">$ {discounted.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">Total (x{qty})</div>
                  <div className="text-3xl font-serif italic text-[#2A2624]">$ {subtotal.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-6 border-t border-[#2A2624]/10 pt-8">
                <label htmlFor="qty" className="text-sm font-sans text-[#2A2624]">Cantidad de Reformers:</label>
                <input
                  id="qty"
                  type="number"
                  min={8}
                  max={50}
                  value={qty}
                  onChange={(e) => setQty(Math.max(8, parseInt(e.target.value || '8', 10)))}
                  className="w-24 rounded-none border-b border-[#2A2624] bg-transparent px-2 py-1 text-xl font-serif italic text-[#2A2624] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Included</h3>
                <ul className="space-y-3 text-[#5D5550] font-light">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                    Reformers de estudio (cuero, nogal y acero)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                    Garantía 1 año
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                    Soporte y repuestos exprés
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Optional</h3>
                <ul className="space-y-3 text-[#5D5550] font-light">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D5550]/50"></span>
                    Instalación y calibración en sitio
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D5550]/50"></span>
                    Ropa y calcetines (materiales naturales)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D5550]/50"></span>
                    Financiamiento bajo cotización
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lead Form */}
          <div className="bg-[#2A2624] text-[#EAE8E4] p-8 md:p-12 rounded-sm">
            <h2 className="text-2xl font-serif italic mb-2">Request Quote</h2>
            <p className="text-white/60 font-light text-sm mb-8">Responde y nos pondremos en contacto hoy mismo.</p>

            <form onSubmit={(e) => { e.preventDefault(); mailto(); }} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40">Nombre</label>
                <input className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-white transition-colors" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
                <input className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-white transition-colors" type="email" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40">Teléfono</label>
                <input className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-white transition-colors" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40">Estudio / Ciudad</label>
                <input className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-white transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-white/40">Notas</label>
                <textarea className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-white transition-colors resize-none" rows={3} />
              </div>

              <button type="submit" className="w-full mt-4 px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">
                Enviar cotización
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-white/40 mb-2">Prefer direct contact?</p>
              <a href="https://wa.me/525548468190" className="text-sm hover:text-white transition-colors border-b border-white/20 pb-1">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Trusted by Studios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Placeholder for studio logos - using text for now as per design system */}
            {['Equilibrium', 'Pilates Center', 'Movement Lab', 'Core Studio'].map((studio, i) => (
              <div key={i} className="flex items-center justify-center h-24 border border-[#2A2624]/10 rounded-sm">
                <span className="font-serif italic text-xl text-[#2A2624]">{studio}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default StudioPack;
