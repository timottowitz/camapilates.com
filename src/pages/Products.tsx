import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import products from '@/content/products.json';
import { ContextualImage } from '@/components/ContextualImage';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { ArrowRight, ShoppingBag, Shield, Truck, Wrench } from 'lucide-react';
import BackLink from '@/components/ui/back-link';

const Products: React.FC = () => {
  const origin = getOrigin();
  const title = 'Productos: Camas de Pilates y Accesorios';
  const desc = 'Explora todas nuestras camas de Pilates (Reformer) y accesorios. Compra para casa o estudio.';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `${origin}/product/${p.slug}`,
        image: [origin + p.image],
        brand: { '@type': 'Brand', name: p.brand },
        offers: {
          '@type': 'Offer',
          priceCurrency: p.currency,
          price: p.price,
          availability: p.availability,
          shippingDetails: [
            { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'MX' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY' } } },
            { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 14, unitCode: 'DAY' } } },
            { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 10, maxValue: 16, unitCode: 'DAY' } } }
          ]
        }
      }
    }))
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/products`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <BackLink className="mb-8" fallbackTo="/" label="Volver" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              The Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9]">
              All Products<span className="text-[#EB4C42]">.</span>
            </h1>
          </div>
          <RegionNote />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 border-y border-[#2A2624]/10 py-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#5D5550]">
            <ShoppingBag className="w-4 h-4 text-[#3E2723]" /> Mercado Pago
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#5D5550]">
            <Shield className="w-4 h-4 text-[#3E2723]" /> 1 Year Warranty
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#5D5550]">
            <Truck className="w-4 h-4 text-[#3E2723]" /> Nationwide Shipping
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#5D5550]">
            <Wrench className="w-4 h-4 text-[#3E2723]" /> Express Parts
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {products.map((p) => (
            <Link key={p.slug} to={`/product/${p.slug}`} className="group block">
              <div className="aspect-[4/5] bg-[#F5F5F5] mb-6 overflow-hidden rounded-sm relative">
                <ContextualImage
                  placeholderId={`product-${p.slug}-main`}
                  pageType="product"
                  pageSlug={p.slug}
                  location="main"
                  aspectRatio="4:5"
                  alt={p.name}
                  fallbackSrc={p.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white">
                    View Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-sm text-[#5D5550] font-light line-clamp-2 mb-3">
                    {p.description}
                  </p>
                  <div className="text-xs text-[#5D5550]/60 uppercase tracking-widest">
                    <RegionSmall />
                  </div>
                </div>
                <div className="text-lg font-serif text-[#2A2624]">
                  ${p.price.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="border-t border-[#2A2624]/10 pt-24">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Essential Guides</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { slug: 'cama-de-pilates-guia-de-compra', title: 'Guía de Compra 2025', desc: 'Todo lo que necesitas saber antes de invertir.' },
              { slug: 'precio-cama-de-pilates', title: 'Análisis de Precios', desc: 'Entendiendo el valor y los costos.' },
              { slug: 'accesorios-cama-de-pilates', title: 'Accesorios Esenciales', desc: 'Maximiza tu práctica con los complementos correctos.' },
              { slug: 'reformer-casa-vs-profesional', title: 'Casa vs. Estudio', desc: '¿Cuál es el modelo ideal para ti?' },
            ].map((g) => (
              <Link key={g.slug} to={`/blog/${g.slug}`} className="group p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors">
                <h3 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
                  {g.title}
                </h3>
                <p className="text-sm text-[#5D5550] font-light mb-4">
                  {g.desc}
                </p>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
                  Read Article <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default Products;

// Small region helpers (inline to keep simple)
function getInitialRegion(): 'MX' | 'US' | 'DE' {
  if (typeof window === 'undefined') return 'MX';
  const v = window.localStorage?.getItem('regionPref');
  return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
}

function useRegion() {
  const [region, setRegion] = useState<'MX' | 'US' | 'DE'>(getInitialRegion());
  const estimate = useMemo(() => {
    if (region === 'MX') return 'Entrega: 3 semanas';
    if (region === 'US') return 'Delivery: 4–5 weeks';
    return 'Delivery: 4–6 weeks';
  }, [region]);
  const change = (val: 'MX' | 'US' | 'DE') => {
    setRegion(val);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', val); } catch { /* ignore */ }
  };
  return { region, estimate, change };
}

function RegionNote() {
  const { region, estimate, change } = useRegion();
  return (
    <div className="flex items-center gap-4 text-sm text-[#5D5550] font-light">
      <div className="flex items-center gap-2">
        <label htmlFor="regionList" className="uppercase tracking-widest text-xs">Region:</label>
        <select
          id="regionList"
          className="bg-transparent border-b border-[#2A2624]/20 py-1 pr-8 text-[#2A2624] focus:outline-none focus:border-[#2A2624]"
          value={region}
          onChange={(e) => change(e.target.value as 'MX' | 'US' | 'DE')}
        >
          <option value="MX">México</option>
          <option value="US">USA</option>
          <option value="DE">Europe</option>
        </select>
      </div>
      <span className="hidden md:inline text-[#2A2624]/40">|</span>
      <span className="italic">{estimate}</span>
    </div>
  );
}

function RegionSmall() {
  const { estimate } = useRegion();
  return <>{estimate}</>;
}
