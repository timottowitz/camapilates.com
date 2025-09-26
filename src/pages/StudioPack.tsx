import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';
import { TrustedBy } from '@/components/ui/trusted-by';
import { FeatureSplit } from '@/components/ui/feature-split';
import RibbonBanner from '@/components/ui/ribbon-banner';

const StudioPack: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/packs/estudio`;
  const title = 'Pack para Estudios: 8+ Camas de Pilates con 20% de Descuento';
  const desc = 'Pack para estudios: a partir de 8 camas de Pilates (Reformer) obtén 20% de descuento. Instalación coordinada, garantía 3 años y repuestos exprés. Envío desde CDMX.';

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
      { '@type': 'Question', name: '¿Cuánto tarda la entrega?', acceptedAnswer: { '@type': 'Answer', text: 'Entregas desde CDMX en 5–7 días dentro de México. Para pedidos voluminosos, confirmamos fecha de instalación.' } },
    ],
  };

  const aggregateOffer = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Pack de Estudio Edelweiss (8+ Reformers)',
    description: 'Pack para estudios con descuento del 20% a partir de 8 unidades. Instalación coordinada y garantía de 3 años.',
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
    <>
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

      <RibbonBanner id="pack" text="Equipa tu estudio una sola vez. Reformers que perduran y elevan cada clase." />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pack para Estudios (8+)</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">20% de descuento a partir de 8 Reformers. Coordinamos instalación, ofrecemos garantía de 3 años y repuestos exprés. Envío desde CDMX.</p>

          <div className="mt-8 grid lg:grid-cols-3 gap-8">
            {/* Pricing Block */}
            <div className="lg:col-span-2 border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Precios estimados</h2>
              <div className="mt-4 grid md:grid-cols-3 gap-6 text-muted-foreground">
                <div>
                  <div className="text-sm">Precio unitario estudio</div>
                  <div className="text-2xl font-bold text-foreground">MXN {unitPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm">Precio con 20% descuento</div>
                  <div className="text-2xl font-bold text-foreground">MXN {discounted.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm">Subtotal (x{qty})</div>
                  <div className="text-2xl font-bold text-foreground">MXN {subtotal.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <label htmlFor="qty" className="text-sm text-muted-foreground">Cantidad</label>
                <input id="qty" type="number" min={8} max={50} value={qty} onChange={(e) => setQty(Math.max(8, parseInt(e.target.value || '8', 10)))} className="w-24 rounded-md border border-border bg-background px-3 py-2 text-foreground" />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground">Incluye</h3>
                  <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Reformers de estudio (cuero, nogal y acero)</li>
                    <li>Garantía 3 años</li>
                    <li>Soporte y repuestos exprés</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Opcional</h3>
                  <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Instalación y calibración en sitio</li>
                    <li>Ropa y calcetines (materiales naturales)</li>
                    <li>Financiamiento bajo cotización</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lead Form */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-2">Solicitar cotización</h2>
              <p className="text-sm text-muted-foreground mb-4">Responde y nos pondremos en contacto hoy mismo.</p>
              <form onSubmit={(e) => { e.preventDefault(); mailto(); }} className="space-y-3">
                <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" placeholder="Nombre" required />
                <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" placeholder="Email" type="email" required />
                <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" placeholder="Teléfono / WhatsApp" required />
                <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" placeholder="Estudio / Ciudad" />
                <textarea className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" placeholder="Notas" rows={3} />
                <button type="submit" className="w-full rounded-md bg-[#6B4F3B] text-white hover:bg-[#5f4636] px-4 py-2">Enviar cotización</button>
              </form>

              <div className="mt-4 text-sm text-muted-foreground">
                ¿Prefieres WhatsApp? <a href="https://wa.me/5210000000000" className="text-primary hover:underline">Escríbenos</a>
              </div>
            </div>
          </div>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Link to="/product/reformer-profesional" className="block group border border-border rounded-lg p-6 bg-card hover:border-[#6B4F3B]/50 transition-colors">
              <h3 className="font-semibold text-foreground group-hover:text-primary">Ver Reformer de Estudio</h3>
              <p className="text-sm text-muted-foreground mt-2">Tolerancias precisas, silencio total y garantía de 3 años.</p>
            </Link>
            <Link to="/product/reformer-casa" className="block group border border-border rounded-lg p-6 bg-card hover:border-[#6B4F3B]/50 transition-colors">
              <h3 className="font-semibold text-foreground group-hover:text-primary">Ver Reformer de Casa</h3>
              <p className="text-sm text-muted-foreground mt-2">Compacto, silencioso y listo para entrenar en casa.</p>
            </Link>
            <Link to="/cama-de-pilates/en-venta" className="block group border border-border rounded-lg p-6 bg-card hover:border-[#6B4F3B]/50 transition-colors">
              <h3 className="font-semibold text-foreground group-hover:text-primary">Cama de Pilates en Venta</h3>
              <p className="text-sm text-muted-foreground mt-2">Envío 5–7 días en México desde CDMX.</p>
            </Link>
          </div>
        </div>
      </section>

      <TrustedBy title="Elegido por estudios en México" />

      <FeatureSplit
        title="Instalación coordinada y soporte en español"
        copy="Acompañamos el crecimiento de tu estudio con entrega por lotes, instalación y capacitación básica. Repuestos exprés y garantía 3 años."
        cta={{ href: '/product/reformer-profesional', label: 'Ver Reformer de Estudio' }}
        image={{ src: '/og/cama-de-pilates-venta-mexico.png', alt: 'Pack de estudio Edelweiss' }}
      />
    </>
  );
};

export default StudioPack;
