import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seo';
import products from '@/content/products.json';
import ReformerHero from '@/components/ReformerHero';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import UserPathSelector from '@/components/landing/UserPathSelector';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import StudioDiscoveryTeaser from '@/components/landing/StudioDiscoveryTeaser';
import BlogPreview from '@/components/landing/BlogPreview';
import CertificationTeaser from '@/components/landing/CertificationTeaser';
import PhilosophySection from '@/components/landing/PhilosophySection';
import SocialProof from '@/components/landing/SocialProof';

const Index = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Edelweiss Pilates — Cama de Pilates sin Plásticos | Reformer Ecológico México';
  const desc = 'El primer ecosistema de pilates libre de plásticos. Reformers de madera maciza, ropa orgánica de algodón y bambú. Pure form. Pure materials. Entrega 3 semanas, garantía 1 año.';

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
    description: 'Reformer ecológico de madera maciza para casa. Sin plásticos, materiales orgánicos, silencioso.',
    brand: { '@type': 'Brand', name: 'Edelweiss Pilates' },
    sku: 'HOME-REFORMER-001',
    image: [`${origin}/og/cama-de-pilates-venta-mexico.png`],
    url: `${origin}/compare#casa`,
    offers: {
      '@type': 'Offer',
      url: `${origin}/compare#casa`,
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

  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio' }
  ]);

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
        <meta property="og:image:alt" content="Cama de Pilates Reformer Edelweiss - equipo premium de madera de nogal para casa y estudio en Mexico" />
        <meta name="twitter:image:alt" content="Cama de Pilates Reformer Edelweiss - equipo premium de madera de nogal para casa y estudio en Mexico" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(featuredListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(guidesListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <LuxuryLayout noPadding>
        {/* Hero Section */}
        <ReformerHero />

        {/* User Journey Selector */}
        <UserPathSelector />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Studio Discovery */}
        <StudioDiscoveryTeaser />

        {/* Philosophy (Condensed) */}
        <PhilosophySection />

        {/* Blog/Guides Preview */}
        <BlogPreview />

        {/* Certification CTA */}
        <CertificationTeaser />

        {/* Social Proof */}
        <SocialProof />
      </LuxuryLayout>
    </>
  );
};

export default Index;
