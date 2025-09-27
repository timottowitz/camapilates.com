import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { allProducts, regionEstimate } from '@/lib/shop/catalog';
import type { Region } from '@/lib/shop/types';
import { toItemListSchema } from '@/lib/shop/catalog';
import ProductGrid21 from '@/components/commerce21/ProductGrid21';
import FilterBar21 from '@/components/commerce21/FilterBar21';
import { Link } from 'react-router-dom';
import { viewItemList } from '@/lib/shop/analytics';

function getInitialRegion(): Region {
  if (typeof window === 'undefined') return 'MX';
  const v = window.localStorage?.getItem('regionPref');
  return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
}

const Shop: React.FC = () => {
  const origin = getOrigin();
  const title = 'Tienda — Camas de Pilates y Accesorios';
  const desc = 'Compra tu Cama de Pilates (Reformer) y accesorios. Modelos para casa y estudio con envío en México.';

  const [region, setRegion] = useState<Region>(getInitialRegion());
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [reformers, setReformers] = useState<boolean>(true); // only category for now

  const products = useMemo(() => {
    let base = allProducts();
    // Category filter (stub): only Reformers available now.
    if (!reformers) base = [];
    // Price filter
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined || max !== undefined) {
      base = base.filter((p) => {
        const val = Number(p.price);
        if (!Number.isFinite(val)) return true;
        if (min !== undefined && val < min) return false;
        if (max !== undefined && val > max) return false;
        return true;
      });
    }
    // Sort
    if (sort === 'price_asc') return [...base].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') return [...base].sort((a, b) => Number(b.price) - Number(a.price));
    return base;
  }, [sort, minPrice, maxPrice, reformers]);

  const itemList = toItemListSchema(origin, products);

  useEffect(() => {
    viewItemList('shop', products);
  }, [products]);

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/shop`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/shop`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl font-bold text-foreground">Tienda</h1>
            <div className="text-sm text-muted-foreground">
              <span className="hidden sm:inline">¿Buscas comparar modelos? </span>
              <Link to="/store" className="text-primary hover:underline">Ver comparación Casa vs Profesional</Link>
            </div>
          </div>

          <FilterBar21 sort={sort} onSort={(v) => setSort(v as any)} region={region} onRegion={(v) => { setRegion(v); try { window.localStorage.setItem('regionPref', v); } catch {} }} />
          <div className="-mt-2 text-xs text-muted-foreground" aria-live="polite">{regionEstimate(region)}</div>

          <div className="grid md:grid-cols-4 gap-6">
            <aside className="md:col-span-1 space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Categorías</h2>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground">
                      <input id="cat-reformers" type="checkbox" checked={reformers} onChange={(e) => setReformers(e.target.checked)} />
                      <label htmlFor="cat-reformers">Reformers</label>
                    </div>
                    <span className="text-xs text-muted-foreground" aria-label="Cantidad de productos">{products.length}</span>
                  </li>
                  <li className="flex items-center justify-between opacity-60"><span>Accesorios</span> <span className="text-xs">0</span></li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Ayuda</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  <li><Link to="/cama-de-pilates/precio" className="text-primary hover:underline">Precio de la Cama de Pilates</Link></li>
                  <li><Link to="/blog/reformer-casa-vs-profesional" className="text-primary hover:underline">Casa vs Profesional</Link></li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Precio</h2>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label htmlFor="minp" className="block text-xs text-muted-foreground">Mín</label>
                    <input id="minp" type="number" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-md border border-border bg-background px-2 py-1" placeholder="0" />
                  </div>
                  <div>
                    <label htmlFor="maxp" className="block text-xs text-muted-foreground">Máx</label>
                    <input id="maxp" type="number" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full rounded-md border border-border bg-background px-2 py-1" placeholder="" />
                  </div>
                </div>
                {/* Simple dual range sliders (optional to use) */}
                <PriceSliders minPrice={minPrice} maxPrice={maxPrice} onMin={(v) => setMinPrice(String(v))} onMax={(v) => setMaxPrice(String(v))} />
                <div className="mt-2 flex gap-2">
                  <button type="button" className="text-xs underline text-primary" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Limpiar</button>
                </div>
              </div>
            </aside>
            <div className="md:col-span-3">
              <ProductGrid21 products={products} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;

// Local helper: lightweight dual range sliders synced with inputs
function PriceSliders({
  minPrice,
  maxPrice,
  onMin,
  onMax,
}: {
  minPrice: string;
  maxPrice: string;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  const all = allProducts();
  const domain = React.useMemo(() => {
    const vals = all.map((p) => Number(p.price)).filter((n) => Number.isFinite(n));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [all.length]);
  const minVal = minPrice ? Math.max(domain.min, Math.min(Number(minPrice), domain.max)) : domain.min;
  const maxVal = maxPrice ? Math.max(domain.min, Math.min(Number(maxPrice), domain.max)) : domain.max;
  const step = Math.max(1, Math.round((domain.max - domain.min) / 50));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>${'{'}{minVal}{'}'} MXN</span>
        <span>${'{'}{maxVal}{'}'} MXN</span>
      </div>
      <div className="mt-2 space-y-2">
        <input
          type="range"
          min={domain.min}
          max={domain.max}
          step={step}
          value={minVal}
          onChange={(e) => onMin(Math.min(Number(e.target.value), maxVal))}
          aria-label="Precio mínimo"
          className="w-full"
        />
        <input
          type="range"
          min={domain.min}
          max={domain.max}
          step={step}
          value={maxVal}
          onChange={(e) => onMax(Math.max(Number(e.target.value), minVal))}
          aria-label="Precio máximo"
          className="w-full"
        />
      </div>
    </div>
  );
}
