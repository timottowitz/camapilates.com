import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';

const CamaDePilatesHub: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/cama-de-pilates`;
  const title = 'Cama de Pilates: Guía, Precios y Dónde Comprar en México (2025)';
  const desc = 'Todo sobre la cama de Pilates (Reformer): tipos para casa y estudio, precios, dimensiones y dónde comprar en México con envío desde CDMX.';

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
      { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates/en-venta`, name: 'Cama de Pilates en Venta' },
      { '@type': 'ListItem', position: 2, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 3, url: `${origin}/blog/dimensiones-cama-de-pilates`, name: 'Dimensiones de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/product/reformer-profesional`, name: 'Reformer de Estudio' },
      { '@type': 'ListItem', position: 5, url: `${origin}/product/reformer-casa`, name: 'Reformer para Casa' },
      { '@type': 'ListItem', position: 6, url: `${origin}/packs/estudio`, name: 'Pack para Estudios (8+)' },
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
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Cama de Pilates (Reformer)</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Guía de compra, precios, dimensiones y dónde comprar tu cama de Pilates. Reformers silenciosos y precisos en cuero genuino, madera de nogal y acero. Envío 5–7 días en México y soporte en español.</p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Link to="/cama-de-pilates/en-venta" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Cama de Pilates en Venta</h2>
              <p className="text-sm text-muted-foreground mt-2">Compra Reformers con entrega 5–7 días en México y garantía 3 años.</p>
              <span className="inline-block mt-3 text-primary">Ver opciones →</span>
            </Link>

            <Link to="/cama-de-pilates/precio" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Precio de Cama de Pilates</h2>
              <p className="text-sm text-muted-foreground mt-2">Rangos 2025: MXN 25,000–50,000. Qué incluye y cómo comparar.</p>
              <span className="inline-block mt-3 text-primary">Ver precios →</span>
            </Link>

            <Link to="/product/reformer-profesional" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Para Estudio</h2>
              <p className="text-sm text-muted-foreground mt-2">Silencio total, tolerancias precisas y estética premium (cuero, nogal, acero).</p>
              <span className="inline-block mt-3 text-primary">Ver Reformer de Estudio →</span>
            </Link>

            <Link to="/product/reformer-casa" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Para Casa</h2>
              <p className="text-sm text-muted-foreground mt-2">Reformer compacto y silencioso con cuero genuino. Entrega 5–7 días.</p>
              <span className="inline-block mt-3 text-primary">Ver Reformer para Casa →</span>
            </Link>

            <Link to="/blog/dimensiones-cama-de-pilates" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Dimensiones y Espacios</h2>
              <p className="text-sm text-muted-foreground mt-2">Medidas típicas, espacio lateral/trasero y consejos de instalación.</p>
              <span className="inline-block mt-3 text-primary">Ver guía →</span>
            </Link>

            <Link to="/packs/estudio" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Pack para Estudios (8+)</h2>
              <p className="text-sm text-muted-foreground mt-2">20% de descuento, instalación coordinada y soporte en español.</p>
              <span className="inline-block mt-3 text-primary">Cotizar ahora →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Materials compact */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Qué hace premium a una cama de Pilates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Materiales</h3>
              <p className="text-sm text-muted-foreground mt-1">Cuero genuino, nogal y acero para estética y longevidad.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Tolerancias</h3>
              <p className="text-sm text-muted-foreground mt-1">Ajuste fino que elimina crujidos y vibraciones: silencio total.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-foreground">Servicio</h3>
              <p className="text-sm text-muted-foreground mt-1">Garantía 3 años y repuestos exprés con soporte en español.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CamaDePilatesHub;
