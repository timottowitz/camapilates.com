import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { allProducts, regionEstimate, categoriesWithCounts, filterByCategory, availableFinishes, getBySlug } from '@/lib/shop/catalog';
import { filterByFinishes, filterByAvailability } from '@/lib/shop/catalog';
import type { FinishKey } from '@/lib/shop/types';
import type { Region } from '@/lib/shop/types';
import { toItemListSchema } from '@/lib/shop/catalog';
import ProductGrid21 from '@/components/commerce21/ProductGrid21';
import CategoryIcons21 from '@/components/commerce21/CategoryIcons21';
import FeaturedProduct21 from '@/components/commerce21/FeaturedProduct21';
import ProductRail21 from '@/components/commerce21/ProductRail21';
import ExploreTiles21 from '@/components/commerce21/ExploreTiles21';
import ShopHeaderAddon from '@/components/commerce21/ShopHeaderAddon';
import RibbonBanner from '@/components/ui/ribbon-banner';
import { useConvexAssets } from '@/lib/convexAssets';
import TrustStrip from '@/components/ui/trust-strip';
import QuickView21 from '@/components/commerce21/QuickView21';
import type { Product as PType } from '@/lib/shop/types';
import FilterBar21 from '@/components/commerce21/FilterBar21';
import ActiveChips21, { Chip } from '@/components/commerce21/ActiveChips21';
import { Link } from 'react-router-dom';
import { viewItemList } from '@/lib/shop/analytics';
import { EnhancedHero, FeatureHighlights } from '@/components/commerce21/EnhancedHero';
import { LivePurchaseNotifications, CustomerReviewsPreview } from '@/components/commerce21/SocialProofWidget';
import ExitIntentPopup, { useExitIntent } from '@/components/commerce21/ExitIntentPopup';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';

function getInitialRegion(): Region {
  if (typeof window === 'undefined') return 'MX';
  const v = window.localStorage?.getItem('regionPref');
  return (v === 'US' || v === 'DE' || v === 'MX') ? v : 'MX';
}

const Shop: React.FC = () => {
  const origin = getOrigin();
  const title = 'Tienda — Camas de Pilates y Accesorios';
  const desc = 'Compra tu Cama de Pilates (Reformer) y accesorios. Modelos para casa y estudio con envío en México.';

  // Load images from Convex
  const assets = useConvexAssets();

  const [region, setRegion] = useState<Region>(getInitialRegion());
  const [sort, setSort] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [quick, setQuick] = useState<PType | null>(null);
  const [activeFinishes, setActiveFinishes] = useState<FinishKey[]>([]);
  const [activeAvailability, setActiveAvailability] = useState<string[]>([]);
  const [showExitPopup, setShowExitPopup] = useState(false);

  // Exit intent detection
  useExitIntent(() => {
    const hasSeenPopup = sessionStorage.getItem('exitPopupSeen');
    if (!hasSeenPopup) {
      setShowExitPopup(true);
    }
  });

  const products = useMemo(() => {
    let base = allProducts();
    // Category filter(s)
    base = filterByCategory(base, activeCats);
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
    // Finishes filter
    base = filterByFinishes(base, activeFinishes);
    // Availability filter
    base = filterByAvailability(base, activeAvailability);
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    // Sort
    if (sort === 'price_asc') return [...base].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') return [...base].sort((a, b) => Number(b.price) - Number(a.price));
    return base;
  }, [sort, minPrice, maxPrice, activeCats, activeFinishes, activeAvailability, search]);

  const itemList = toItemListSchema(origin, products);
  const cats = categoriesWithCounts();
  const finishes = availableFinishes();

  useEffect(() => {
    viewItemList('shop', products);
  }, [products]);

  // URL sync — read on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setSearch(sp.get('s') || '');
    setSort((sp.get('sort') as any) || 'relevance');
    setMinPrice(sp.get('min') || '');
    setMaxPrice(sp.get('max') || '');
    const catCsv = sp.get('cats');
    if (catCsv) setActiveCats(catCsv.split(',').map(decodeURIComponent));
    const finCsv = sp.get('fins');
    if (finCsv) setActiveFinishes(finCsv.split(',') as any);
    const avlCsv = sp.get('avl');
    if (avlCsv) setActiveAvailability(avlCsv.split(','));
    const r = sp.get('r');
    if (r === 'MX' || r === 'US' || r === 'DE') setRegion(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL sync — write on change (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = setTimeout(() => {
      const sp = new URLSearchParams();
      if (search) sp.set('s', search);
      if (sort && sort !== 'relevance') sp.set('sort', sort);
      if (minPrice) sp.set('min', minPrice);
      if (maxPrice) sp.set('max', maxPrice);
      if (activeCats.length) sp.set('cats', activeCats.map(encodeURIComponent).join(','));
      if (activeFinishes.length) sp.set('fins', activeFinishes.join(','));
      if (activeAvailability.length) sp.set('avl', activeAvailability.join(','));
      if (region !== 'MX') sp.set('r', region);
      const q = sp.toString();
      const url = q ? `/shop?${q}` : '/shop';
      window.history.replaceState(null, '', url);
    }, 300);
    return () => clearTimeout(id);
  }, [search, sort, minPrice, maxPrice, activeCats, activeFinishes, activeAvailability, region]);

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/shop`} />
        {assets.shopHero && <link rel="preload" as="image" href={assets.shopHero} />}
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/shop`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <RibbonBanner id="shop" text="Entrega 3 semanas en México • Garantía 1 año • Repuestos exprés" />
      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl font-bold text-foreground">Tienda</h1>
            <div className="flex items-center gap-3 text-sm">
              <a href="https://wa.me/523222787690" className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700">WhatsApp</a>
              <a href="tel:+523222787690" className="inline-flex items-center px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Llamar</a>
              <div className="hidden sm:block text-muted-foreground">
                <span className="hidden sm:inline">¿Buscas comparar modelos? </span>
                <Link to="/store" className="text-primary hover:underline">Ver comparación Casa vs Profesional</Link>
              </div>
            </div>
          </div>

          {/* Enhanced Hero */}
          <EnhancedHero
            title="Redescubre tu gracia con Reformers Edelweiss"
            subtitle="Tejidos no tóxicos & materiales premium (cuero genuino, nogal & acero). Pago seguro & entrega en 3 semanas."
            backgroundImage={assets.shopHero || DEFAULTS.ogImage}
            showTrustMetrics={true}
            ctaPrimary={{ text: 'Ver promoción', href: '/product/reformer-profesional' }}
            ctaSecondary={{ text: 'Comparar modelos', href: '/store' }}
          />

          {/* Feature Highlights */}
          <FeatureHighlights className="my-8" />

          {/* Shop by category icons */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Compra por categoría</h2>
            <CategoryIcons21 items={cats.map(c => ({
              label: c.name,
              href: `/shop/category/${c.slug}`,
              count: c.count,
              img: c.slug === 'reformers' ? assets.catReformers : (c.slug === 'accesorios' ? assets.catAccessories : undefined),
              emoji: c.slug === 'reformers' ? '🛏️' : '🧰'
            }))} />
          </div>

          {/* Featured product (curated) */}
          {getBySlug ? (getBySlug('reformer-profesional') ? <FeaturedProduct21 product={getBySlug('reformer-profesional') as any} /> : null) : (products[0] && <FeaturedProduct21 product={products[0] as any} />)}

          {/* Best sellers and newest rails */}
          <ProductRail21 title="Más vendidos" products={(allProducts() as any).filter((p: any) => p.bestSeller).slice(0, 8)} />
          <ProductRail21 title="Novedades" products={(allProducts() as any).filter((p: any) => p.isNew).slice(0, 8)} />

          {/* Sticky listing header */}
          <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b border-border py-3">
            <div className="flex items-center justify-between gap-3 text-sm mb-2">
              <div className="text-muted-foreground">{products.length} resultado{products.length === 1 ? '' : 's'}</div>
              <FilterBar21 sort={sort} onSort={(v) => setSort(v as any)} region={region} onRegion={(v) => { setRegion(v); try { window.localStorage.setItem('regionPref', v); } catch {} }} search={search} onSearch={setSearch} />
            </div>
            <div className="text-xs text-muted-foreground" aria-live="polite">{regionEstimate(region)}</div>
            <div className="mt-2">
              <ActiveChips21 chips={((): Chip[] => {
                const chips: Chip[] = [];
                activeCats.forEach((c) => chips.push({ label: `Categoría: ${c}` , onRemove: () => setActiveCats((prev) => prev.filter(x => x !== c)) }));
                activeFinishes.forEach((f) => chips.push({ label: `Acabado: ${f}`, onRemove: () => setActiveFinishes((prev) => prev.filter(x => x !== f)) }));
                activeAvailability.forEach((a) => chips.push({ label: a.includes('InStock') ? 'En stock' : 'Preorden', onRemove: () => setActiveAvailability((prev) => prev.filter(x => x !== a)) }));
                if (minPrice) chips.push({ label: `≥ $${minPrice}`, onRemove: () => setMinPrice('') });
                if (maxPrice) chips.push({ label: `≤ $${maxPrice}`, onRemove: () => setMaxPrice('') });
                if (search) chips.push({ label: `Buscar: ${search}`, onRemove: () => setSearch('') });
                return chips;
              })()} onClearAll={() => { setActiveCats([]); setActiveFinishes([]); setActiveAvailability([]); setMinPrice(''); setMaxPrice(''); setSearch(''); }} />
              <TrustStrip className="mt-2" />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <aside className="md:col-span-1 space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Categorías</h2>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {cats.map((c) => (
                    <li key={c.slug} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground">
                        <input
                          id={`cat-${c.slug}`}
                          type="checkbox"
                          checked={activeCats.includes(c.name)}
                          onChange={(e) => {
                            setActiveCats((prev) => e.target.checked ? Array.from(new Set([...prev, c.name])) : prev.filter((x) => x !== c.name));
                          }}
                        />
                        <label htmlFor={`cat-${c.slug}`}>{c.name}</label>
                      </div>
                      <span className="text-xs text-muted-foreground" aria-label={`Cantidad en ${c.name}`}>{c.count}</span>
                    </li>
                  ))}
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
                <h2 className="font-semibold text-foreground">Acabados</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {finishes.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground">
                      <input id={`fin-${f}`} type="checkbox" checked={activeFinishes.includes(f)} onChange={(e) => setActiveFinishes((prev) => e.target.checked ? [...prev, f] : prev.filter((x) => x !== f))} />
                      <label htmlFor={`fin-${f}`}>{f}</label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="font-semibold text-foreground">Disponibilidad</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {[
                    { key: 'https://schema.org/InStock', label: 'En stock' },
                    { key: 'https://schema.org/PreOrder', label: 'Preorden' },
                  ].map((s) => (
                    <li key={s.key} className="flex items-center gap-2 text-foreground">
                      <input id={`avl-${s.label}`} type="checkbox" checked={activeAvailability.includes(s.key)} onChange={(e) => setActiveAvailability((prev) => e.target.checked ? [...prev, s.key] : prev.filter((x) => x !== s.key))} />
                      <label htmlFor={`avl-${s.label}`}>{s.label}</label>
                    </li>
                  ))}
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
              {/* Enhanced Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {products.map((product) => (
                  <ProductCard21Enhanced
                    key={product.slug}
                    product={product}
                    onQuickView={(p) => setQuick(p)}
                    showFinancing={true}
                    showUrgency={true}
                  />
                ))}
              </div>

              {/* Customer Reviews Preview */}
              <CustomerReviewsPreview className="my-12" />

              {/* Explore range blocks */}
              <ExploreTiles21 items={[
                { label: 'Reformers', desc: 'Silenciosos y precisos para casa y estudio', href: '/shop/category/reformers' },
                { label: 'Accesorios', desc: 'Cintas y mantenimiento para tu Reformer', href: '/shop/category/accesorios' },
              ]} />
              {/* Help strip */}
              <section className="mt-8 border border-border rounded-lg p-4 bg-accent/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">¿Necesitas ayuda para elegir? Estamos para ayudarte.</div>
                  <div className="flex items-center gap-2 text-sm">
                    <a href="https://wa.me/523222787690" className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700">WhatsApp</a>
                    <a href="tel:+523222787690" className="inline-flex items-center px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Llamar</a>
                  </div>
                </div>
              </section>
              {/* Newsletter stub */}
              <section className="mt-6 border border-border rounded-lg p-4 bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">Recibe novedades por correo</div>
                    <div className="text-sm text-muted-foreground">Promociones y nuevas piezas, 1–2 veces al mes.</div>
                  </div>
                  <form action="mailto:valery@camadepilates.com" method="post" className="flex items-center gap-2">
                    <input type="email" required placeholder="tu@email.com" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
                    <button className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm" type="submit">Suscribirme</button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Live Purchase Notifications */}
      <LivePurchaseNotifications />

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <ExitIntentPopup
          onClose={() => {
            setShowExitPopup(false);
            sessionStorage.setItem('exitPopupSeen', 'true');
          }}
          onSubscribe={(email) => {
            console.log('Subscribed:', email);
            // TODO: Connect to email service
          }}
        />
      )}

      {quick && <QuickView21 product={quick as any} onClose={() => setQuick(null)} />}
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
