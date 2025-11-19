import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS } from '@/lib/seo';
import products from '@/content/products.json';
import ReformerHero from '@/components/ReformerHero';
import LuxuryContent from '@/components/LuxuryContent';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const Index = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Cama de Pilates (Reformer) en México — Casa y Estudio';
  const desc = 'Cama de Pilates en venta: Reformers silenciosos con cuero genuino, madera de nogal y acero. Precios 2025, entrega 3 semanas desde CDMX y garantía 1 año.';

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Edelweiss Pilates',
    url: origin,
    logo: `${origin}/brand/edelweiss.svg`
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
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Cama de Pilates Reformer – Casa',
    description: 'Reformer compacto para casa. Recorrido suave, estabilidad y accesorios esenciales.',
    brand: { '@type': 'Brand', name: 'CAMA Pilates' },
    sku: 'HOME-REFORMER-001',
    image: [`${origin}/og/cama-de-pilates-venta-mexico.png`],
    url: `${origin}/store#casa`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/store#casa`,
      priceCurrency: 'MXN',
      price: '999.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  const featured = products.slice(0, 2);
  const featuredListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: featured.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const guides = [
    { slug: 'cama-de-pilates-guia-de-compra', title: 'Cama de Pilates: Guía de compra 2025' },
    { slug: 'precio-cama-de-pilates', title: 'Precio de Cama de Pilates' },
    { slug: 'accesorios-cama-de-pilates', title: 'Accesorios para Cama de Pilates' },
    { slug: 'reformer-casa-vs-profesional', title: 'Reformer para casa vs profesional' },
  ];
  const guidesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guides.map((g, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/blog/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={origin} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={origin} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(featuredListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(guidesListSchema)}</script>
      </Helmet>

      <LuxuryLayout noPadding>
        {/* 3D Hero Section */}
        <ReformerHero />

        {/* Editorial Content Sections */}
        <LuxuryContent />
      </LuxuryLayout>
    </>
  );
};

export default Index;
