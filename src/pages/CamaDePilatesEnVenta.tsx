import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { TrustedBy } from '@/components/ui/trusted-by';
import { FeatureSplit } from '@/components/ui/feature-split';
import RibbonBanner from '@/components/ui/ribbon-banner';

const CamaDePilatesEnVenta: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/cama-de-pilates/en-venta`;
  const title = 'Cama de Pilates en Venta: Envío en México desde CDMX';
  const desc = 'Cama de Pilates (Reformer) en venta con entrega 5–7 días en México. Materiales premium (cuero, nogal, acero), silencio total, garantía 3 años y repuestos exprés.';

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
      { '@type': 'Question', name: '¿Cuánto tarda el envío en México?', acceptedAnswer: { '@type': 'Answer', text: 'Desde CDMX entregamos en 5–7 días hábiles. Para pedidos por volumen (8+), coordinamos fechas de instalación.' } },
      { '@type': 'Question', name: '¿Qué garantía ofrecen?', acceptedAnswer: { '@type': 'Answer', text: 'Garantía de 3 años. Repuestos exprés y soporte en español.' } },
      { '@type': 'Question', name: '¿Hay descuento para estudios?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. A partir de 8 unidades aplicamos 20% de descuento y podemos coordinar instalación.' } },
    ],
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
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      <RibbonBanner />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Cama de Pilates en Venta</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Compra tu cama de Pilates (Reformer) con <strong>silencio total</strong>, <strong>estabilidad sin vibraciones</strong> y acabados premium en cuero genuino, nogal y acero. Entrega <strong>5–7 días</strong> desde CDMX y <strong>garantía 3 años</strong>.</p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Link to="/product/reformer-profesional" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Cama de Pilates Reformer – Profesional</h2>
              <ul className="mt-3 text-muted-foreground list-disc pl-5 space-y-1">
                <li>Silencio total y estabilidad sin vibraciones</li>
                <li>Cuero genuino, nogal y acero estructural</li>
                <li>Garantía 3 años • Repuestos exprés</li>
              </ul>
              <span className="inline-block mt-4 text-primary">Ver detalles →</span>
            </Link>

            <Link to="/product/reformer-casa" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Cama de Pilates Reformer – Casa</h2>
              <ul className="mt-3 text-muted-foreground list-disc pl-5 space-y-1">
                <li>Reformer compacto, recorrido suave</li>
                <li>Cuero genuino y estructura de madera</li>
                <li>Entrega rápida en México</li>
              </ul>
              <span className="inline-block mt-4 text-primary">Ver detalles →</span>
            </Link>
          </div>

          <div className="mt-12 border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Descuento para estudios</h3>
            <p className="text-muted-foreground">A partir de 8 unidades aplicamos <strong>20% de descuento</strong>. Coordinamos instalación y entrega por lotes. </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center px-5 py-3 rounded-md bg-[#6B4F3B] text-white hover:bg-[#5f4636]">Ver todos los productos</Link>
              <Link to="/store" className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Ir a la tienda</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Materials compact */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Materiales y acabados</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Cuero genuino</h3>
              <p className="text-sm text-muted-foreground mt-1">Agradable al contacto, mantiene agarre y color.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Madera de nogal</h3>
              <p className="text-sm text-muted-foreground mt-1">Cálida y elegante; acabado protector que respira.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Acero estructural</h3>
              <p className="text-sm text-muted-foreground mt-1">Rigidez y precisión para un recorrido silencioso.</p>
            </div>
          </div>
        </div>
      </section>

      <TrustedBy />

      <FeatureSplit
        title="Silencio y estabilidad para tu estudio"
        copy="Tolerancias precisas, cuero genuino, madera de nogal y acero estructural. Garantía 3 años y repuestos exprés."
        cta={{ href: '/packs/estudio', label: 'Pack para estudios (8+)' }}
        image={{ src: '/og/cama-de-pilates-venta-mexico.png', alt: 'Reformer de Estudio Edelweiss' }}
      />
    </>
  );
};

export default CamaDePilatesEnVenta;
