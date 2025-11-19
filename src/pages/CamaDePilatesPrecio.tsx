import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { ContextualImage } from '@/components/ContextualImage';
import { Check, Info, DollarSign } from 'lucide-react';

const CamaDePilatesPrecio: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/cama-de-pilates/precio`;
  const title = 'Precio de Cama de Pilates: Rangos 2025 y Qué Incluye';
  const desc = 'Precios de cama de Pilates (casa y estudio) en México: MXN 25,000–50,000. Qué influye en el precio: materiales, tolerancias, muelles y garantía. Envío desde CDMX.';

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: '¿Cuál es el precio de una cama de Pilates para casa?', acceptedAnswer: { '@type': 'Answer', text: 'Nuestras opciones para casa inician alrededor de MXN 25,000 según acabados y accesorios incluidos.' } },
      { '@type': 'Question', name: '¿Cuál es el precio de una cama de Pilates de estudio?', acceptedAnswer: { '@type': 'Answer', text: 'El Reformer de estudio ronda MXN 50,000 con cuero genuino, nogal y acero estructural; garantía 1 año.' } },
      { '@type': 'Question', name: '¿Qué factores influyen en el precio?', acceptedAnswer: { '@type': 'Answer', text: 'Materiales (cuero real, maderas nobles, acero), tolerancias (silencio), muelles, garantía, servicio y tiempos de entrega.' } },
    ],
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              Investment Guide 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              Understanding <br />
              <span className="not-italic font-light font-sans tracking-tight">the Value.</span>
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              Rangos de referencia en México y qué incluye realmente el precio: materiales (cuero, nogal, acero), tolerancias para el silencio, muelles, garantía y servicio.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/store" className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                Ver Modelos
              </Link>
              <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors">
                Guía de Compra
              </Link>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] rounded-sm overflow-hidden">
            <ContextualImage
              placeholderId="pricing-hero"
              pageType="pricing"
              pageSlug="hero"
              location="hero-right"
              aspectRatio="4:3"
              alt="Detalle de materiales premium"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Home Tier */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 md:p-12 bg-white/50 hover:bg-white transition-colors duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2">Home Edition</h2>
                  <p className="text-xs uppercase tracking-widest text-[#5D5550]">Para tu santuario personal</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#5D5550]">Desde</div>
                  <div className="text-2xl font-serif italic text-[#2A2624]">$35,000 <span className="text-sm font-sans not-italic text-[#5D5550]">MXN</span></div>
                </div>
              </div>
              <ul className="space-y-4 mb-8 border-t border-[#2A2624]/10 pt-6">
                <li className="flex items-start gap-3 text-sm text-[#5D5550] font-light">
                  <Check className="w-4 h-4 text-[#3E2723] mt-0.5" />
                  <span>Estructura de madera con cuero genuino</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#5D5550] font-light">
                  <Check className="w-4 h-4 text-[#3E2723] mt-0.5" />
                  <span>Recorrido suave y silencioso</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#5D5550] font-light">
                  <Check className="w-4 h-4 text-[#3E2723] mt-0.5" />
                  <span>Entrega 3 semanas en México</span>
                </li>
              </ul>
              <Link to="/product/reformer-casa" className="block w-full py-4 text-center border border-[#2A2624] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors">
                Ver Detalles
              </Link>
            </div>

            {/* Studio Tier */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 md:p-12 bg-[#2A2624] text-[#EAE8E4]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-serif italic text-[#EAE8E4] mb-2">Studio Professional</h2>
                  <p className="text-xs uppercase tracking-widest text-white/60">Uso comercial intensivo</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/60">Alrededor de</div>
                  <div className="text-2xl font-serif italic text-[#EAE8E4]">$50,000 <span className="text-sm font-sans not-italic text-white/60">MXN</span></div>
                </div>
              </div>
              <ul className="space-y-4 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-start gap-3 text-sm text-white/80 font-light">
                  <Check className="w-4 h-4 text-[#EAE8E4] mt-0.5" />
                  <span>Cuero genuino, nogal y acero estructural</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80 font-light">
                  <Check className="w-4 h-4 text-[#EAE8E4] mt-0.5" />
                  <span>Tolerancias precisas: silencio total</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80 font-light">
                  <Check className="w-4 h-4 text-[#EAE8E4] mt-0.5" />
                  <span>Garantía 1 año • Repuestos exprés</span>
                </li>
              </ul>
              <Link to="/product/reformer-profesional" className="block w-full py-4 text-center bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">
                Ver Detalles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Influences Price */}
      <section className="py-24 px-8 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">What Influences the Price?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <div className="w-10 h-10 rounded-full bg-[#2A2624] flex items-center justify-center mb-6">
                <Star className="w-5 h-5 text-[#EAE8E4]" />
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-4">Premium Materials</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                El uso de cuero genuino (no vinipiel), madera sólida de nogal y acero estructural eleva el costo pero garantiza durabilidad y estética superior.
              </p>
            </div>
            <div className="p-8 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <div className="w-10 h-10 rounded-full bg-[#2A2624] flex items-center justify-center mb-6">
                <Info className="w-5 h-5 text-[#EAE8E4]" />
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-4">Precision & Silence</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Lograr un recorrido sin fricción ni ruido requiere tolerancias de ingeniería más estrictas y componentes de mayor calidad.
              </p>
            </div>
            <div className="p-8 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <div className="w-10 h-10 rounded-full bg-[#2A2624] flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-[#EAE8E4]" />
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-4">Service & Warranty</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Incluimos garantía real de 1 año, soporte en español y disponibilidad inmediata de repuestos desde CDMX.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Discount Banner */}
      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EAE8E4]/10 mb-8">
            <DollarSign className="w-8 h-8 text-[#EAE8E4]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif italic mb-6">Studio Volume Pricing</h2>
          <p className="text-lg text-white/70 font-light mb-8 max-w-2xl mx-auto">
            A partir de 8 unidades aplicamos un <strong>20% de descuento</strong>. Coordinamos instalación profesional y entrega por lotes para tu apertura.
          </p>
          <Link to="/packs/estudio" className="inline-flex items-center px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">
            Ver Packs de Estudio
          </Link>
        </div>
      </section>

    </LuxuryLayout>
  );
};

// Helper icons
function Star(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}

function Shield(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}

export default CamaDePilatesPrecio;
