import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { TrustedBy } from '@/components/ui/trusted-by';
import { FeatureSplit } from '@/components/ui/feature-split';
import RibbonBanner from '@/components/ui/ribbon-banner';

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
      { '@type': 'Question', name: '¿Cuál es el precio de una cama de Pilates de estudio?', acceptedAnswer: { '@type': 'Answer', text: 'El Reformer de estudio ronda MXN 50,000 con cuero genuino, nogal y acero estructural; garantía 3 años.' } },
      { '@type': 'Question', name: '¿Qué factores influyen en el precio?', acceptedAnswer: { '@type': 'Answer', text: 'Materiales (cuero real, maderas nobles, acero), tolerancias (silencio), muelles, garantía, servicio y tiempos de entrega.' } },
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
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      <RibbonBanner />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Precio de Cama de Pilates (2025)</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Rangos de referencia en México y qué incluye realmente el precio: <strong>materiales</strong> (cuero, nogal, acero), <strong>tolerancias</strong> para el <strong>silencio</strong>, muelles, garantía y servicio. Entrega 5–7 días desde CDMX.</p>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Para Casa — desde MXN 25,000</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Estructura de madera con cuero genuino</li>
                <li>Recorrido suave y silencioso</li>
                <li>Entrega 5–7 días en México</li>
              </ul>
              <Link to="/product/reformer-casa" className="inline-block mt-4 text-primary">Ver Reformer de Casa →</Link>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Para Estudio — alrededor de MXN 50,000</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Cuero genuino, nogal y acero estructural</li>
                <li>Tolerancias precisas: silencio total</li>
                <li>Garantía 3 años • Repuestos exprés</li>
              </ul>
              <Link to="/product/reformer-profesional" className="inline-block mt-4 text-primary">Ver Reformer de Estudio →</Link>
            </div>
          </div>

          <div className="mt-12 border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Qué influye en el precio</h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
              <ul className="list-disc pl-5 space-y-1">
                <li>Materiales (cuero real, maderas nobles, acero)</li>
                <li>Tolerancias y estabilidad (silencio sin vibraciones)</li>
                <li>Calidad de muelles y recorrido</li>
              </ul>
              <ul className="list-disc pl-5 space-y-1">
                <li>Garantía, repuestos y servicio</li>
                <li>Tiempo de entrega e instalación</li>
                <li>Volumen (8+ con 20% de descuento)</li>
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center px-5 py-3 rounded-md bg-[#6B4F3B] text-white hover:bg-[#5f4636]">Ver todos los productos</Link>
              <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Cama de Pilates en venta</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Materials compact */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Cómo se compone el precio</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Materiales premium</h3>
              <p className="text-sm text-muted-foreground mt-1">Cuero genuino, madera de nogal y acero estructural.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Tolerancias y silencio</h3>
              <p className="text-sm text-muted-foreground mt-1">Ajustes finos que eliminan crujidos y vibraciones.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Garantía y servicio</h3>
              <p className="text-sm text-muted-foreground mt-1">3 años de garantía y repuestos exprés con soporte ES.</p>
            </div>
          </div>
        </div>
      </section>

      <TrustedBy />

      <FeatureSplit
        title="Materiales y tolerancias que justifican el precio"
        copy="El costo real está en la estabilidad, el silencio y la longevidad. Cuero genuino, nogal y acero — más garantía y servicio en español."
        cta={{ href: '/cama-de-pilates/en-venta', label: 'Cama de Pilates en venta' }}
        image={{ src: '/og/cama-de-pilates-venta-mexico.png', alt: 'Cama de Pilates Edelweiss' }}
      />
    </>
  );
};

export default CamaDePilatesPrecio;
