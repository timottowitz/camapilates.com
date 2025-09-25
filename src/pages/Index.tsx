import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoprocketButton } from '@/integrations/shoprocket';

const Index = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Cama de Pilates (Reformer) para casa y estudio';
  const desc = 'Compra tu cama de Pilates con envío en México. Guías de compra, precios y tienda con carrito integrado.';

  const productPk = 'sr_live_pk_776359bbbe0337c3c8c97bad121b3fbe4e1c'; // TODO: replace with real key
  const productId = 'prod_6569ddc31c17b221072732'; // TODO: replace with real product id

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'camadepilates.com',
    url: origin,
    logo: `${origin}/favicon.ico`
  };
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'camadepilates.com',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/blog?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué cama de Pilates es mejor para casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Busca tamaño compacto, estabilidad y accesorios esenciales. Compara 2–3 opciones y revisa garantía y servicio.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta una cama de Pilates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Depende del uso (casa vs profesional), materiales y accesorios. Consulta nuestra guía de precios para rangos orientativos.'
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{title} | camadepilates.com</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={origin} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={origin} />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Cama de Pilates (Reformer)
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Para casa y estudio. Diseño minimalista, materiales de alto rendimiento y envío en México.
            </p>
            <div className="mt-8 flex gap-4">
              <ShoprocketButton publishableKey={productPk} productId={productId} />
              <a href="/store" className="inline-flex items-center px-6 py-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors rounded-md">Ver tienda</a>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          {[
            { t: 'Para casa', d: 'Compacto, silencioso, fácil de mover.' },
            { t: 'Profesional', d: 'Recorrido suave, robusto y estable.' },
            { t: 'Accesorios', d: 'Box, correas y poleas de calidad.' }
          ].map((x) => (
            <div key={x.t} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
              <h3 className="font-semibold text-lg text-gray-900">{x.t}</h3>
              <p className="text-gray-600 mt-2">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer guide block */}
      <section className="bg-white border-t">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Guía de compra</h2>
            <p className="text-gray-600 mb-6">Cómo elegir tu cama de Pilates: dimensiones, materiales, accesorios y servicio. Rango de precios y consejos prácticos.</p>
            <div className="flex gap-3">
              <a href="/blog/cama-de-pilates-guia-de-compra" className="inline-flex items-center px-5 py-3 bg-black text-white rounded-md hover:bg-gray-800">Ver guía</a>
              <a href="/blog/precio-cama-de-pilates" className="inline-flex items-center px-5 py-3 border border-gray-900 text-gray-900 rounded-md hover:bg-gray-900 hover:text-white">Precios</a>
            </div>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-gray-900">Preguntas frecuentes</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li>• ¿Cuál es la mejor cama de Pilates para casa?</li>
              <li>• ¿Cuánto espacio necesito?</li>
              <li>• ¿Qué accesorios son imprescindibles?</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;

