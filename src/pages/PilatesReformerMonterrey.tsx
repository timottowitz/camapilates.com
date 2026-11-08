import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateBreadcrumbSchema } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { MapPin, Building2, Truck, ShieldCheck, ArrowRight, MessageCircle, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { calculateBundlePrice, type BundleQuantity } from '@/lib/shop/bundles';
import { allProducts } from '@/lib/shop/catalog';
import shopPolicy from '@/content/shop-policy.json';
import CertificationWebinarBanner from '@/components/certification/CertificationWebinarBanner';
import { OFFER_OWN_COURSES } from '@/content/certification/cohortsData';

export const PilatesReformerMonterrey: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/pilates-reformer-monterrey`;
  const title = 'Arma Tu Estudio de Pilates en Monterrey | Paquetes de Reformer para Estudio';
  const desc = `Arma tu estudio de Pilates Reformer en Monterrey y ZMM (San Pedro Garza García, Valle Oriente, Cumbres, Carretera Nacional). Paquetes de Reformers fabricados bajo pedido, con entrega en ${shopPolicy.deliveryWindow}.`;

  // Interactive Configurator State
  const reformers = useMemo(() => {
    const list = allProducts().filter(p => p.category === 'Reformers' || p.slug.startsWith('reformer-'));
    return list.length ? list.slice(0, 3) : allProducts().slice(0, 3);
  }, []);

  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    reformers[0]?.slug || 'reformer-clasico-roble-pl006'
  );
  const [selectedQty, setSelectedQty] = useState<BundleQuantity>(6);

  const selectedProd = useMemo(() => {
    return reformers.find(p => p.slug === selectedProductSlug) || reformers[0];
  }, [reformers, selectedProductSlug]);

  const bundleCalc = useMemo(() => {
    return calculateBundlePrice(selectedProd?.price || 27160, selectedQty);
  }, [selectedProd, selectedQty]);

  const whatsappMessage = useMemo(() => {
    const text = `Hola, me interesa armar mi estudio en Monterrey con el ${selectedProd?.name}. ` +
      `Paquete seleccionado: ${selectedQty} Unidades ($${bundleCalc.discountedTotalPrice.toLocaleString('es-MX')} MXN). ` +
      `Me gustaría confirmar la fecha de entrega en Monterrey.`;
    return `https://wa.me/525548468190?text=${encodeURIComponent(text)}`;
  }, [selectedProd, selectedQty, bundleCalc]);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Edelweiss Pilates - Paquetes de Estudio Monterrey',
    description: `Venta de paquetes de camas de Pilates Reformer para estudios en Monterrey y Zona Metropolitana. Fabricación bajo pedido y entrega en ${shopPolicy.deliveryWindow}.`,
    areaServed: [
      { '@type': 'City', name: 'Monterrey' },
      { '@type': 'City', name: 'San Pedro Garza García' },
      { '@type': 'City', name: 'Santa Catarina' },
      { '@type': 'City', name: 'San Nicolás de los Garza' },
      { '@type': 'City', name: 'Guadalupe' }
    ],
    telephone: '+52-554-846-8190',
    url: url
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto tarda el envío de un paquete de Reformers a Monterrey?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Fabricamos cada Paquete de Estudio bajo pedido y lo entregamos en Monterrey y Zona Metropolitana (San Pedro, Valle Oriente, Cumbres, Carretera Nacional) en ${shopPolicy.deliveryWindow}.`
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué zonas de Monterrey y Nuevo León cubren?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Entregamos con flete especializado en San Pedro Garza García, Monterrey ZMM, Santa Catarina, San Nicolás, Guadalupe, Apodaca y Carretera Nacional.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué accesorios incluye cada Paquete de Reformer para Estudio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cada Reformer incluye Box de Estudio tapizado en cuero genuino/micelio, Extensor de Mat, Tabla de Salto (Jumpboard), Correas de Microfibra y Kit de 5 Resortes Alemanes de alambre de piano.'
        }
      }
    ]
  };

  const zones = [
    'San Pedro Garza García',
    'Valle Oriente & Valle Poniente',
    'Cumbres & Jerónimo',
    'Carretera Nacional & Pueblo Serena',
    'Santa Catarina & Vía Cordillera',
    'San Nicolás & Contry',
  ];

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="geo.region" content="MX-NLE" />
        <meta name="geo.placename" content="Monterrey" />
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema([
          { name: 'Tienda', url: `${origin}/shop` },
          { name: 'Paquetes de Estudio Monterrey', url: url },
        ]))}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 sm:px-12 md:px-24 bg-[#EAE8E4]">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Urgency Banner */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A2624] text-[#EAE8E4] text-[10px] font-semibold uppercase tracking-[0.2em]">
                <MapPin className="w-3.5 h-3.5 text-amber-300" /> Monterrey & San Pedro Garza García
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic text-[#2A2624] leading-[1.02] tracking-tight">
                Arma Tu Propio Estudio de Pilates en Monterrey.
              </h1>

              <p className="text-lg sm:text-xl text-[#5D5550] font-light leading-relaxed max-w-2xl">
                Arma tu <Link to="/packs/estudio" className="font-semibold text-[#2A2624] underline hover:text-[#3E2723]">estudio de Pilates Reformer</Link> en Monterrey y ZMM (San Pedro Garza García, <Link to="/packs/monterrey" className="font-semibold text-[#2A2624] underline hover:text-[#3E2723]">Valle Oriente, Cumbres, Carretera Nacional</Link>). Fabricamos tus Studio Reformer Packs bajo pedido y los entregamos en tu local de Monterrey en <strong className="text-[#3E2723] font-bold underline decoration-amber-400 decoration-2 underline-offset-4">{shopPolicy.deliveryWindow}</strong>.
              </p>

              {/* Delivery Guarantee Pill */}
              <div className="p-4 rounded-2xl bg-white border border-[#2A2624]/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A2624]">
                      Entrega a domicilio en Monterrey
                    </h4>
                    <p className="text-xs text-[#5D5550]">
                      {shopPolicy.deliveryTime} a San Pedro, Valle, Cumbres, Carretera Nacional y ZMM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[#2A2624]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sin aranceles de aduana</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#2A2624]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Flete asegurado a puerta</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#2A2624]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Soporte local en español</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[#2A2624]/10 group">
                <img
                  src="/images/blog/cama-para-pilates/hero.jpg"
                  alt="Estudio de Pilates Reformer en Monterrey"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Build Your Own Studio Configurator Section */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-white border-y border-[#2A2624]/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#3E2723]">
              <Sparkles className="w-4 h-4 text-amber-500" /> Configura Tu Estudio
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#2A2624]">
              Configura tu estudio en Monterrey
            </h2>
            <p className="text-sm sm:text-base text-[#5D5550] font-light">
              Selecciona el modelo de Reformer y la cantidad de unidades para tu local en Monterrey. Obtén precios preferenciales por volumen.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* Configurator Controls */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Step 1: Select Equipment */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#2A2624] block">
                  1. Selecciona el Modelo de Reformer:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {reformers.map((p) => {
                    const isSelected = p.slug === selectedProductSlug;
                    const modelBundle = calculateBundlePrice(p.price, selectedQty);
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setSelectedProductSlug(p.slug)}
                        className={`
                          p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between
                          ${isSelected
                            ? 'border-[#2A2624] bg-[#F8F7F5] ring-2 ring-[#2A2624]/20 shadow-md'
                            : 'border-[#2A2624]/15 bg-white hover:border-[#2A2624]/40'
                          }
                        `}
                      >
                        <div className="space-y-1">
                          <h4 className="font-serif italic text-base text-[#2A2624] leading-tight">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-[#5D5550] uppercase tracking-wider block">
                            {p.brand}
                          </span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#2A2624]/10">
                          <div translate="no" className="notranslate text-xs font-bold text-[#2A2624]">
                            ${modelBundle.discountedUnitPrice.toLocaleString('es-MX')} MXN
                            <span className="text-[10px] font-normal text-[#5D5550]"> / u.</span>
                          </div>
                          <div translate="no" className="notranslate text-[10px] text-[#5D5550] line-through">
                            ${Number(p.price).toLocaleString('es-MX')} MXN
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Quantity Package */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#2A2624] block">
                  2. Elige el Tamaño de Paquete para Tu Estudio:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([4, 6, 8] as BundleQuantity[]).map((qty) => {
                    const isSelected = selectedQty === qty;
                    const tierBundle = calculateBundlePrice(selectedProd?.price || 27160, qty);
                    return (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setSelectedQty(qty)}
                        className={`
                          p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer
                          ${isSelected
                            ? 'border-[#2A2624] bg-[#2A2624] text-white shadow-lg transform scale-[1.02]'
                            : 'border-[#2A2624]/15 bg-white text-[#2A2624] hover:border-[#2A2624]/40'
                          }
                        `}
                      >
                        <span translate="no" className="notranslate block text-2xl font-serif italic font-bold">
                          {qty} Camas
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider block mt-1 ${isSelected ? 'text-amber-200 font-semibold' : 'text-[#5D5550]'}`}>
                          {qty === 4 ? 'Studio Starter' : qty === 6 ? 'Studio Pro' : 'Estudio Completo'}
                        </span>
                        <span translate="no" className={`notranslate text-[10px] font-bold block mt-1.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          ${tierBundle.discountedUnitPrice.toLocaleString('es-MX')} / u.
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What is included in Monterrey Studio Pack */}
              <div className="p-6 rounded-2xl bg-[#F8F7F5] border border-[#2A2624]/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#2A2624] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#3E2723]" /> Equipamiento Completo Incluido por Cada Reformer:
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-[#5D5550]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Box de Estudio Tapizado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Extensor de Mat acolchado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Tabla de Salto (Jumpboard)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 5 Resortes Alemanes Piano Wire
                  </li>
                </ul>
              </div>

            </div>

            {/* Summary & Monterrey Delivery Checkout Card */}
            <div
              key={`summary-${selectedProductSlug}-${selectedQty}`}
              className="lg:col-span-5 p-8 rounded-3xl bg-[#2A2624] text-[#EAE8E4] space-y-6 shadow-2xl border border-[#EAE8E4]/15"
            >
              <div className="space-y-2 border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-bold block">
                  Resumen de Paquete Monterrey
                </span>
                <h3 className="text-2xl font-serif italic text-white">
                  Paquete de <span translate="no" className="notranslate font-sans font-bold">{selectedQty}x</span>{' '}
                  <span translate="no" className="notranslate">{selectedProd?.name}</span>
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-[#EAE8E4]/70">
                  <span>Precio Unitario Preferencial:</span>
                  <span translate="no" className="notranslate font-semibold text-white">
                    ${bundleCalc.discountedUnitPrice.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#EAE8E4]/70">
                  <span>Precio Regular sin Descuento:</span>
                  <span translate="no" className="notranslate line-through">
                    ${bundleCalc.originalTotalPrice.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="flex justify-between text-sm text-emerald-400 font-bold pt-1">
                  <span>Ahorro Total Paquete:</span>
                  <span translate="no" className="notranslate">
                    ${bundleCalc.totalSavings.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#EAE8E4]/60 block">
                  Total Final con Envío a Monterrey:
                </span>
                <div translate="no" className="notranslate text-3xl font-serif italic font-bold text-white">
                  ${bundleCalc.discountedTotalPrice.toLocaleString('es-MX')}{' '}
                  <span className="text-xs font-sans not-italic text-[#EAE8E4]/80">MXN</span>
                </div>
              </div>

              {/* Monterrey Delivery Guarantee Badge */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <Truck className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white block">Entrega en Monterrey: {shopPolicy.deliveryTime}</span>
                  <span className="text-[#EAE8E4]/70 text-[11px]">Entregamos directo a tu local o dirección en ZMM.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappMessage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#EAE8E4] text-[#2A2624] rounded-full py-4 px-6 uppercase tracking-[0.15em] text-xs font-bold hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-xl"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" /> Pedir Paquete Monterrey
                </a>

                <div className="flex items-center justify-center gap-4 text-[10px] text-[#EAE8E4]/60 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-300" /> Garantía {selectedProd?.warranty}
                  </span>
                  <span>•</span>
                  <span>Asesoría en Español</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Coverage Zones in Monterrey */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-[#F8F7F5]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E2723]">
              Cobertura en Monterrey y ZMM
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#2A2624]">
              Entregamos en toda la Zona Metropolitana
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div key={zone} className="p-6 rounded-2xl bg-white border border-[#2A2624]/10 shadow-sm flex items-center justify-between">
                <h4 className="font-serif italic text-lg text-[#2A2624]">{zone}</h4>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider inline-block">
                  {shopPolicy.deliveryWindow}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Cohort & Webinar Banner for Monterrey */}
      {OFFER_OWN_COURSES && (
        <section className="py-12 px-6 sm:px-12 md:px-24 bg-[#F8F7F5]">
          <div className="max-w-[1400px] mx-auto">
            <CertificationWebinarBanner city="monterrey" />
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 px-6 sm:px-12 md:px-24 bg-white border-t border-[#2A2624]/10">
        <div className="max-w-[1000px] mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E2723]">Preguntas Frecuentes</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#2A2624]">
              Preguntas sobre Envíos a Monterrey
            </h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#F8F7F5] border border-[#2A2624]/10 space-y-2">
              <h3 className="text-lg font-serif italic text-[#2A2624]">
                ¿Cuánto tarda la entrega a Monterrey?
              </h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Fabricamos cada reformer bajo pedido, así que la entrega es de {shopPolicy.deliveryWindow}. Cuando se acerca la fecha, coordinamos contigo el día exacto de descarga en tu local.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F7F5] border border-[#2A2624]/10 space-y-2">
              <h3 className="text-lg font-serif italic text-[#2A2624]">
                ¿Los equipos vienen armados o requieren instalación?
              </h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Nuestros Reformers llegan ensamblados al 95% en caja de madera reforzada de exportación. El armado final (colocar la barra de pies y postes de poleas) toma menos de 15 minutos por cama e incluye instructivos detallados en video y asistencia en vivo por WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F7F5] border border-[#2A2624]/10 space-y-2">
              <h3 className="text-lg font-serif italic text-[#2A2624]">
                ¿Qué pasa si necesito refacciones o muelles en el futuro?
              </h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Al contar con distribución y soporte en México, mantenemos un inventario permanente de refacciones (resortes alemanes de alambre de piano, correas de microfibra, poleas silenciosas). Cualquier repuesto adicional se envía a Monterrey con entrega al día siguiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross Links Section */}
      <section className="py-16 px-6 sm:px-12 md:px-24 bg-[#EAE8E4] border-t border-[#2A2624]/10">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-serif italic text-[#2A2624] mb-6 text-center">Opciones para Estudios en Todo México</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link to="/packs/estudio" className="p-6 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#2A2624] transition-all group">
              <h3 className="font-semibold text-[#2A2624] group-hover:text-[#EB4C42] mb-2">Pack para Estudios Nacional</h3>
              <p className="text-xs text-[#5D5550] leading-relaxed">20% de descuento a partir de 8 camas de Pilates Reformer con entrega coordinada.</p>
            </Link>
            <Link to="/reformer-para-estudio" className="p-6 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#2A2624] transition-all group">
              <h3 className="font-semibold text-[#2A2624] group-hover:text-[#EB4C42] mb-2">Reformer para Estudio</h3>
              <p className="text-xs text-[#5D5550] leading-relaxed">Modelos comerciales de madera de maple, roble y aluminio estructural.</p>
            </Link>
            <Link to="/cama-de-pilates" className="p-6 rounded-xl bg-white border border-[#2A2624]/10 hover:border-[#2A2624] transition-all group">
              <h3 className="font-semibold text-[#2A2624] group-hover:text-[#EB4C42] mb-2">Catálogo de Camas de Pilates</h3>
              <p className="text-xs text-[#5D5550] leading-relaxed">Guía completa de modelos, especificaciones técnicas y precios con 12 MSI.</p>
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default PilatesReformerMonterrey;
