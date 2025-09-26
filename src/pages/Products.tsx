import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import products from '@/content/products.json';
import products from '@/content/products.json';

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
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/products`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/products`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h1 className="text-3xl font-bold text-foreground">Todos los productos</h1>
            <RegionNote />
          </div>
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Mercado Pago</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Soporte en español</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Ensamblado en CDMX</div>
            <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Repuestos exprés</div>
            <div className="hidden lg:flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary"></span> Garantía 3 años</div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="block group border border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-card">
                <img src={p.image} alt={p.name} className="w-full h-auto rounded mb-4 border border-border" />
                <h2 className="font-semibold text-foreground group-hover:text-primary">{p.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                <div className="mt-3 font-semibold text-foreground">$ {p.price} {p.currency}</div>
                <div className="mt-1 text-xs text-muted-foreground"><RegionSmall /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Guides block to strengthen internal linking */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Top guías sobre Cama de Pilates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { slug: 'cama-de-pilates-guia-de-compra', title: 'Cama de Pilates: Guía de compra 2025' },
              { slug: 'precio-cama-de-pilates', title: 'Precio de Cama de Pilates' },
              { slug: 'accesorios-cama-de-pilates', title: 'Accesorios para Cama de Pilates' },
              { slug: 'reformer-casa-vs-profesional', title: 'Reformer para casa vs profesional' },
            ].map((g) => (
              <Link key={g.slug} to={`/blog/${g.slug}`} className="block group border border-border rounded-lg p-6 bg-card hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground group-hover:text-primary">{g.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">Lee nuestra guía sobre {g.title.toLowerCase()} y elige tu cama de Pilates con seguridad.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
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
    if (region === 'MX') return 'Entrega estimada: 5–7 días';
    if (region === 'US') return 'Entrega estimada: 12–18 días (estimado)';
    return 'Entrega estimada: 12–21 días (estimado)';
  }, [region]);
  const change = (val: 'MX' | 'US' | 'DE') => {
    setRegion(val);
    try { if (typeof window !== 'undefined') window.localStorage.setItem('regionPref', val); } catch {}
  };
  return { region, estimate, change };
}

function RegionNote() {
  const { region, estimate, change } = useRegion();
  return (
    <div className="text-sm text-muted-foreground">
      <label htmlFor="regionList" className="mr-2">Región:</label>
      <select id="regionList" className="rounded-md border border-border bg-background px-2 py-1 text-foreground" value={region} onChange={(e) => change(e.target.value as any)}>
        <option value="MX">México</option>
        <option value="US">Estados Unidos</option>
        <option value="DE">Alemania / Europa</option>
      </select>
      <span className="ml-3">{estimate}</span>
    </div>
  );
}

function RegionSmall() {
  const { estimate } = useRegion();
  return <>{estimate}</>;
}
