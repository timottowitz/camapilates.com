import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { DEFAULTS, generateBreadcrumbSchema, generateLocalBusinessSchema, getOrigin } from '@/lib/seo';
import { ArrowUpRight, ArrowRight, Clock, FileText, ShieldCheck, Truck } from 'lucide-react';
import CertificationWebinarBanner from '@/components/certification/CertificationWebinarBanner';
import { OFFER_OWN_COURSES } from '@/content/certification/cohortsData';
import { allProducts, priceLabel, REFORMER_TYPE_LABELS } from '@/lib/shop/catalog';
import { selectItem } from '@/lib/shop/analytics';
import type { Product, ReformerType } from '@/lib/shop/types';
import shopPolicy from '@/content/shop-policy.json';

type HubCard = {
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  colSpan: string;
  rowSpan?: string;
  image: string;
};

const HUB_CARDS: HubCard[] = [
  {
    eyebrow: 'DIRECTORIO',
    title: 'Estudios de Pilates',
    description: 'Encuentra estudios top en México. Vista de mapa y valoraciones.',
    to: '/estudios-de-pilates',
    colSpan: 'md:col-span-7 lg:col-span-6',
    rowSpan: 'md:row-span-2',
    image: '/images/reformer-editorial-1.webp',
  },
  {
    eyebrow: 'COMUNIDAD',
    title: 'Instructores',
    description: 'Conecta con profesionales del método Reformer.',
    to: '/instructores-pilates',
    colSpan: 'md:col-span-5 lg:col-span-3',
    image: '/images/about-hero.webp',
  },
  OFFER_OWN_COURSES
    ? {
        eyebrow: 'FORMACIÓN OFICIAL',
        title: 'Curso Reformer',
        description: 'Querétaro y Monterrey. Aprende con Laura Munive (28h / 48h).',
        to: '/certificacion-pilates',
        colSpan: 'md:col-span-5 lg:col-span-3',
        image: '/images/certification-hero.webp',
      }
    : {
        eyebrow: 'FORMACIÓN',
        title: 'Certificaciones',
        description: 'Las academias que forman instructoras en México, en un solo lugar.',
        to: '/certificacion-pilates',
        colSpan: 'md:col-span-5 lg:col-span-3',
        image: '/images/certification-hero.webp',
      },
  {
    eyebrow: 'EDITORIAL',
    title: 'The Journal',
    description: 'Guías expertas de compra, biomecánica y mantenimiento.',
    to: '/blog',
    colSpan: 'md:col-span-12 lg:col-span-6',
    image: '/images/studios-hero.webp',
  },
  {
    eyebrow: 'EQUIPAMIENTO',
    title: 'Nuevos Reformers',
    description: 'Madera de maple y aluminio. Distribución y soporte en México.',
    to: '/shop/category/reformers',
    colSpan: 'md:col-span-6 lg:col-span-6',
    image: '/images/explore-reformers.webp',
  },
  {
    eyebrow: 'TIENDA',
    title: 'Accesorios & Cajas',
    description: 'Cajas de estudio, tablas de salto, resortes alemanes y refacciones.',
    to: '/shop',
    colSpan: 'md:col-span-6 lg:col-span-6',
    image: '/images/hero-shop.webp',
  },
];

const TOPIC_LINKS = [
  { label: 'Cama de Pilates', to: '/cama-de-pilates' },
  { label: 'Cursos', to: '/certificacion-pilates' },
  { label: 'Catálogo', to: '/shop/category/reformers' },
  { label: 'Precio', to: '/cama-de-pilates/precio' },
  { label: 'Tienda', to: '/shop' },
  { label: 'Software para Estudios', to: '/blog/mejor-software-para-estudios-de-pilates' },
];

const FOOTER_LINKS = [
  { label: 'Garantía y Soporte', to: '/soporte' },
  { label: 'Packs para Estudio', to: '/packs/estudio' },
  { label: 'Software para Estudios', to: '/blog/mejor-software-para-estudios-de-pilates' },
  { label: 'Campus Virtual & Whop', to: '/app' },
];

const PURCHASE_FACTS = [
  { icon: Truck, title: 'Envío asegurado', detail: 'A los 32 estados de México, en huacal.' },
  { icon: ShieldCheck, title: 'Garantía de 1 año', detail: 'Directa, en chasis y mecanismos.' },
  { icon: FileText, title: 'Factura fiscal', detail: 'Mexicana, con IVA desglosado.' },
  { icon: Clock, title: `Entrega en ${shopPolicy.deliveryWindow}`, detail: 'Fabricación bajo pedido.' },
];

// One reformer per construction type, so the row shows the range of the catalog.
const SHOWCASE_TYPES: ReformerType[] = ['madera', 'plegable', 'aluminio', 'gimnasio'];

const reformers = allProducts().filter((p) => p.category === 'Reformers');
const showcase = SHOWCASE_TYPES
  .map((type) => reformers.find((p) => p.type === type))
  .filter((p): p is Product => Boolean(p));

const IndexAuthority: React.FC = () => {
  const origin = getOrigin();
  const title = 'Cama de Pilates (Reformer) en México — Guías, Precios y Venta';
  const desc = 'Compra tu cama de Pilates Reformer en México: modelos para casa y estudio. Distribución y soporte en México, con envíos asegurados a los 32 estados de la República Mexicana.';

  const breadcrumbSchema = generateBreadcrumbSchema([{ name: 'Inicio', url: '/' }]);
  const localBusinessSchema = generateLocalBusinessSchema();
  const homeItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cama de Pilates (Reformer) — Enlaces clave',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates`, name: 'Cama de Pilates' },
      { '@type': 'ListItem', position: 2, url: `${origin}/reformer-para-casa`, name: 'Reformer para Casa' },
      { '@type': 'ListItem', position: 3, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/shop`, name: 'Catálogo de Camas' },
      { '@type': 'ListItem', position: 5, url: `${origin}/blog/mejor-software-para-estudios-de-pilates`, name: 'Software para Estudios de Pilates' },
    ],
  };

  return (
    <LuxuryLayout noPadding headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(homeItemListSchema)}</script>
      </Helmet>

      <div className="relative min-h-screen bg-[#F2F0ED] text-[#2A2624] selection:bg-[#EB4C42] selection:text-white">
        <div className="relative mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-16 lg:px-12">

          <div className="relative mb-10 md:mb-20 pt-10 md:pt-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="max-w-4xl min-w-0">
                <div className="font-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-tighter text-[#2A2624] mb-6">
                  Edelweiss<span className="text-[#EB4C42]">.</span>
                </div>
                <h1 className="font-sans text-2xl md:text-3xl text-[#2A2624] max-w-3xl leading-tight font-medium tracking-tight">
                  Cama de Pilates Reformer en México
                </h1>
                <p className="mt-4 mb-0 font-sans text-lg md:text-2xl text-[#5D5550] max-w-2xl leading-relaxed font-normal tracking-tight">
                  Encuentra más de <span className="text-[#EB4C42] font-medium">580 Estudios</span> de Pilates, <span className="text-[#EB4C42] font-medium">Cursos</span>, <span className="text-[#EB4C42] font-medium">Instructores</span> y <span className="text-[#EB4C42] font-medium">Reformers</span>.
                  La plataforma de Pilates más grande de México.
                </p>

                {/* One swipeable row on phones so the cards below stay close to the fold. */}
                <nav
                  aria-label="Temas principales"
                  className="mt-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
                >
                  {TOPIC_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="shrink-0 rounded-full border border-[#2A2624]/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2A2624] transition-colors hover:border-[#2A2624]/40"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                  <Link
                    to="/shop/category/reformers"
                    data-rybbit-event="click_home_hero_catalog"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#EB4C42] text-white text-sm font-bold tracking-wide hover:bg-[#D43D33] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#EB4C42]/20"
                  >
                    Ver Catálogo de Reformers <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/certificacion-pilates"
                    data-rybbit-event="click_home_hero_certification"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2A2624] text-[#EAE8E4] text-sm font-bold tracking-wide hover:bg-[#3E2723] transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    {OFFER_OWN_COURSES ? 'Certificación 2026' : 'Certificaciones de Pilates'}
                  </Link>
                  <Link
                    to="/estudios-de-pilates"
                    data-rybbit-event="click_home_hero_studios"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#2A2624] text-sm font-bold tracking-wide hover:bg-[#F5F4F1] transition-all hover:scale-105 active:scale-95 border border-[#2A2624]/10 shadow-sm"
                  >
                    Directorio de Estudios
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5D5550] pt-1">
                  <span className="flex items-center gap-1.5 font-medium text-[#2A2624]">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Distribución y soporte en México
                  </span>
                  <span className="hidden sm:inline opacity-40">•</span>
                  <span className="basis-full sm:basis-auto">Envíos asegurados a los 32 estados · 1 año de garantía</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section heading for crawlers and screen readers; the cards speak for themselves visually. */}
          <h2 className="sr-only">
            Ecosistema de Cama de Pilates: Modelos Reformer, Estudios, Instructores y Certificación en México
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[220px] md:auto-rows-[240px]">
            {HUB_CARDS.map((c, i) => (
              <div
                key={c.to}
                className={`relative group overflow-hidden rounded-[2rem] bg-[#EAE8E4] ${c.colSpan} ${c.rowSpan || ''}`}
              >
                <Link to={c.to} className="block h-full w-full relative">
                  <div className="absolute inset-0 z-0 select-none">
                    {/* The first image is the LCP element and is preloaded from index.html. */}
                    <img
                      src={c.image}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding={i === 0 ? 'sync' : 'async'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  </div>

                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#EB4C42]/50 rounded-[2rem] transition-colors duration-300 z-20 pointer-events-none" />

                  <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                    <div className="self-end opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <div className="bg-[#EB4C42] p-2 rounded-full text-white shadow-lg">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-white/15 backdrop-blur-md px-2 py-1 rounded mb-2">
                        {c.eyebrow}
                      </span>
                      <h3 className="font-serif text-3xl md:text-4xl text-white leading-none tracking-tight mb-2 mt-0">
                        {c.title}
                      </h3>
                      <p className="m-0 text-white/80 text-sm font-medium leading-relaxed max-w-xs">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <section aria-labelledby="home-reformers" className="mt-20 md:mt-28">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-8">
              <div>
                <h2 id="home-reformers" className="m-0 font-serif italic text-4xl md:text-5xl text-[#2A2624] leading-tight">
                  Camas de Pilates Reformer
                </h2>
                <p className="mt-3 mb-0 text-base md:text-lg text-[#5D5550]">
                  {reformers.length} modelos, de casa a gimnasio. Precios finales en MXN.
                </p>
              </div>
              <Link
                to="/shop/category/reformers"
                data-rybbit-event="click_home_reformers_all"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2A2624] underline decoration-[#EB4C42] decoration-2 underline-offset-8 hover:text-[#EB4C42] transition-colors"
              >
                Ver los {reformers.length} modelos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
              {showcase.map((product) => (
                <Link
                  key={product.slug}
                  to={`/product/${product.slug}`}
                  onClick={() => selectItem(product, 'home')}
                  className="group flex w-[78%] shrink-0 snap-start flex-col rounded-[2rem] bg-white p-3 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#2A2624]/10 sm:w-[46%] md:w-auto"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#EAE8E4]">
                    <img
                      src={product.image}
                      alt={`${product.name}, cama de Pilates Reformer`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                    {product.type && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EB4C42]">
                        {REFORMER_TYPE_LABELS[product.type]}
                      </span>
                    )}
                    <h3 className="mt-2 mb-0 font-serif italic text-2xl leading-snug text-[#2A2624]">
                      {product.name}
                    </h3>
                    <div className="mt-auto flex items-baseline justify-between gap-3 pt-5">
                      <span className="text-lg font-bold text-[#2A2624]">
                        {priceLabel(product.price)} <span className="text-xs font-medium text-[#5D5550]">{product.currency}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] text-[#5D5550] group-hover:text-[#EB4C42] transition-colors">
                        Ver <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <ul className="mt-10 grid list-none grid-cols-2 gap-x-6 gap-y-8 border-t border-[#2A2624]/10 p-0 pt-10 lg:grid-cols-4">
              {PURCHASE_FACTS.map(({ icon: Icon, title: factTitle, detail }) => (
                <li key={factTitle} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <Icon className="h-6 w-6 shrink-0 text-[#EB4C42]" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <div className="text-sm font-bold text-[#2A2624]">{factTitle}</div>
                    <div className="mt-1 text-sm text-[#5D5550]">{detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-20 md:mt-28 overflow-hidden rounded-[2rem] bg-[#2A2624] text-[#EAE8E4]">
            <div className="flex flex-col gap-8 p-8 md:p-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EB4C42]">Para estudios</span>
                <h2 className="mt-4 mb-0 font-serif italic text-4xl md:text-5xl leading-tight">
                  ¿Abres o amplías tu estudio?
                </h2>
                <p className="mt-4 mb-0 text-base md:text-lg text-[#EAE8E4]/75">
                  Packs de 4, 6 y 8 Reformers con precio por volumen. Te ayudamos a calcular cuántas camas caben en tu espacio.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/packs/estudio"
                  data-rybbit-event="click_home_studio_pack"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#EAE8E4] text-[#2A2624] text-sm font-bold tracking-wide hover:bg-white transition-colors"
                >
                  Ver Packs para Estudio <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/reformer-para-estudio"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#EAE8E4]/30 text-sm font-bold tracking-wide hover:border-[#EAE8E4] transition-colors"
                >
                  Reformers para estudio
                </Link>
              </div>
            </div>
          </section>

          {OFFER_OWN_COURSES && (
            <div className="mt-12">
              <CertificationWebinarBanner />
            </div>
          )}

          <nav aria-label="Enlaces rápidos" className="mt-16 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs font-bold uppercase tracking-widest text-[#5D5550] hover:text-[#EB4C42] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

        </div>
      </div>
    </LuxuryLayout>
  );
};

export default IndexAuthority;
