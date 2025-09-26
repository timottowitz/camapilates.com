import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';

const Accesorios: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/accesorios`;
  const title = 'Accesorios para Cama de Pilates: Imprescindibles y Materiales Naturales';
  const desc = 'Accesorios clave para cama de Pilates (Reformer): box, correas, poleas y muelles; además calcetines antideslizantes y ropa 100% materiales naturales para un contacto seguro con la piel.';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Accesorios para Cama de Pilates',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/store`, name: 'Calcetines antideslizantes (material natural)' },
      { '@type': 'ListItem', position: 2, url: `${origin}/store`, name: 'Ropa para Pilates (100% natural)' },
      { '@type': 'ListItem', position: 3, url: `${origin}/blog/accesorios-cama-de-pilates`, name: 'Guía de accesorios (box, correas, poleas)' },
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
      </Helmet>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Accesorios para Cama de Pilates</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Selección de accesorios esenciales para el Reformer y opciones de indumentaria con materiales 100% naturales, sin plástico en contacto con la piel.</p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Calcetines antideslizantes</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Material natural transpirable</li>
                <li>Agarre alto para estabilidad</li>
                <li>Tallas y colores básicos</li>
              </ul>
              <Link to="/store" className="inline-block mt-4 text-primary">Comprar en tienda →</Link>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Ropa para Pilates (100% natural)</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Contacto seguro y cómodo</li>
                <li>Colores neutros y cortes funcionales</li>
                <li>Combina con estética de estudio</li>
              </ul>
              <Link to="/store" className="inline-block mt-4 text-primary">Comprar en tienda →</Link>
            </div>

            <Link to="/blog/accesorios-cama-de-pilates" className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">Guía de accesorios del Reformer</h2>
              <p className="text-sm text-muted-foreground mt-2">Box, correas, poleas y muelles: qué elegir según tu uso (casa vs estudio).</p>
              <span className="inline-block mt-3 text-primary">Leer guía →</span>
            </Link>
          </div>

          <div className="mt-12 border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">¿Buscas Reformers?</h3>
            <p className="text-muted-foreground">Explora nuestros Reformers silenciosos y precisos para elevar tu práctica en casa o en estudio.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link to="/product/reformer-profesional" className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Ver Reformer de Estudio</Link>
              <Link to="/product/reformer-casa" className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Ver Reformer para Casa</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Accesorios;
