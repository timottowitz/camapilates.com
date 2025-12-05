import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin, generateBreadcrumbSchema } from '@/lib/seo';
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
import { EnhancedHero } from '@/components/commerce21/EnhancedHero';
import { LivePurchaseNotifications, CustomerReviewsPreview } from '@/components/commerce21/SocialProofWidget';
import ExitIntentPopup, { useExitIntent } from '@/components/commerce21/ExitIntentPopup';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

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
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/shop`} />
        {assets.shopHero && <link rel="preload" as="image" href={assets.shopHero} fetchpriority="high" />}
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/shop`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <meta property="og:image:alt" content="Tienda de Camas de Pilates Reformer Edelweiss - comprar equipo premium en Mexico" />
        <meta name="twitter:image:alt" content="Tienda de Camas de Pilates Reformer Edelweiss - comprar equipo premium en Mexico" />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Tienda' }
        ]))}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "¿Cuánto cuesta una cama de Pilates Reformer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nuestros reformers van desde $35,000 MXN (modelo Casa) hasta $55,000 MXN (modelo Profesional con acabado Mycelium). Ofrecemos financiamiento a 12 meses sin intereses."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cuánto tiempo tarda la entrega?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "La entrega en México es de 3 semanas. Para envíos a EE.UU. y Europa, el tiempo estimado es de 4-6 semanas."
              }
            },
            {
              "@type": "Question",
              "name": "¿Qué garantía incluyen los reformers?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Todos nuestros reformers incluyen garantía de 1 año que cubre defectos de fabricación en estructura, muelles y accesorios básicos."
              }
            },
            {
              "@type": "Question",
              "name": "¿Los reformers son silenciosos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sí, nuestro sistema Whisper Glide con 8 ruedas garantiza un deslizamiento completamente silencioso, ideal para práctica en casa o estudios."
              }
            }
          ]
        })}</script>
      </Helmet>

      <div className="container mx-auto px-8 md:px-24 py-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* SEO H1 - Visually hidden */}
          <h1 className="sr-only">Tienda de Camas de Pilates Reformer y Accesorios en México - Edelweiss Pilates</h1>
          {/* Visual Title */}
          <p className="text-4xl md:text-6xl font-serif italic text-[#2A2624]" aria-hidden="true">Colección</p>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.15em]">
            <a href="https://wa.me/523222787690" className="hover:text-[#3E2723] transition-colors">WhatsApp</a>
            <a href="tel:+523222787690" className="hover:text-[#3E2723] transition-colors">Llamar</a>
            <div className="hidden sm:block text-[#5D5550]">
              <Link to="/compare" className="hover:text-[#3E2723] transition-colors">Comparar Modelos</Link>
            </div>
          </div>
        </div>

        {/* Enhanced Hero */}
        <EnhancedHero
          title="Redescubre tu gracia"
          subtitle="Tejidos no tóxicos & materiales premium (cuero genuino, nogal & acero). Pago seguro & entrega en 3 semanas."
          backgroundImage={assets.shopHero || DEFAULTS.ogImage}
          showTrustMetrics={false}
          ctaPrimary={{ text: 'Ver promoción', href: '/product/reformer-profesional' }}
          ctaSecondary={{ text: 'Comparar modelos', href: '/compare' }}
        />

        {/* Shop by category icons */}
        <div>
          <h2 className="text-2xl font-serif italic text-[#2A2624] mb-6">Categorías</h2>
          <CategoryIcons21 items={cats.map(c => {
            const imgMap: Record<string, string | undefined> = {
              'reformers': assets.catReformers,
              'accesorios': assets.catAccessories,
              'ropa': assets.catRopa,
              'terapia-de-luz': assets.catLuz
            };
            return {
              label: c.name,
              href: `/shop/category/${c.slug}`,
              count: c.count,
              img: imgMap[c.slug],
            };
          })} />
        </div>

        {/* Featured product (curated) */}
        {getBySlug ? (getBySlug('reformer-profesional') ? <FeaturedProduct21 product={getBySlug('reformer-profesional') as any} /> : null) : (products[0] && <FeaturedProduct21 product={products[0] as any} />)}

        {/* Best sellers and newest rails */}
        <ProductRail21 title="Más vendidos" products={(allProducts() as any).filter((p: any) => p.bestSeller).slice(0, 8)} />
        <ProductRail21 title="Novedades" products={(allProducts() as any).filter((p: any) => p.isNew).slice(0, 8)} />

        {/* Sticky listing header */}
        <div className="sticky top-0 z-40 bg-[#EAE8E4]/95 backdrop-blur border-b border-[#2A2624]/10 py-4 -mx-8 px-8 md:-mx-24 md:px-24">
          <div className="flex items-center justify-between gap-3 text-sm mb-2">
            <div className="text-[#5D5550] font-sans text-xs tracking-widest uppercase">{products.length} Resultados</div>
            <FilterBar21 sort={sort} onSort={(v) => setSort(v as any)} region={region} onRegion={(v) => { setRegion(v); try { window.localStorage.setItem('regionPref', v); } catch { } }} search={search} onSearch={setSearch} />
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#5D5550]" aria-live="polite">{regionEstimate(region)}</div>
          <div className="mt-2">
            <ActiveChips21 chips={((): Chip[] => {
              const chips: Chip[] = [];
              activeCats.forEach((c) => chips.push({ label: `Categoría: ${c}`, onRemove: () => setActiveCats((prev) => prev.filter(x => x !== c)) }));
              activeFinishes.forEach((f) => chips.push({ label: `Acabado: ${f}`, onRemove: () => setActiveFinishes((prev) => prev.filter(x => x !== f)) }));
              activeAvailability.forEach((a) => chips.push({ label: a.includes('InStock') ? 'En stock' : 'Preorden', onRemove: () => setActiveAvailability((prev) => prev.filter(x => x !== a)) }));
              if (minPrice) chips.push({ label: `≥ $${minPrice}`, onRemove: () => setMinPrice('') });
              if (maxPrice) chips.push({ label: `≤ $${maxPrice}`, onRemove: () => setMaxPrice('') });
              if (search) chips.push({ label: `Buscar: ${search}`, onRemove: () => setSearch('') });
              return chips;
            })()} onClearAll={() => { setActiveCats([]); setActiveFinishes([]); setActiveAvailability([]); setMinPrice(''); setMaxPrice(''); setSearch(''); }} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-12">
          <aside className="hidden md:block md:col-span-1 space-y-8">
            <div className="border-b border-[#2A2624]/10 pb-8">
              <h2 className="font-serif italic text-xl text-[#2A2624] mb-4">Filtros</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#5D5550] mb-3">Categorías</h3>
                  <ul className="space-y-2 text-sm text-[#2A2624]">
                    {cats.map((c) => (
                      <li key={c.slug} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            id={`cat-${c.slug}`}
                            type="checkbox"
                            checked={activeCats.includes(c.name)}
                            onChange={(e) => {
                              setActiveCats((prev) => e.target.checked ? Array.from(new Set([...prev, c.name])) : prev.filter((x) => x !== c.name));
                            }}
                            className="accent-[#3E2723]"
                          />
                          <label htmlFor={`cat-${c.slug}`} className="cursor-pointer group-hover:text-[#3E2723] transition-colors">{c.name}</label>
                        </div>
                        <span className="text-xs text-[#5D5550]">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#5D5550] mb-3">Acabados</h3>
                  <ul className="space-y-2 text-sm text-[#2A2624]">
                    {finishes.map((f) => (
                      <li key={f} className="flex items-center gap-2 group cursor-pointer">
                        <input id={`fin-${f}`} type="checkbox" checked={activeFinishes.includes(f)} onChange={(e) => setActiveFinishes((prev) => e.target.checked ? [...prev, f] : prev.filter((x) => x !== f))} className="accent-[#3E2723]" />
                        <label htmlFor={`fin-${f}`} className="cursor-pointer group-hover:text-[#3E2723] transition-colors">{f}</label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[#5D5550] mb-3">Precio</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-transparent border-b border-[#2A2624]/20 py-1 px-0 focus:outline-none focus:border-[#3E2723]" placeholder="Min" />
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-transparent border-b border-[#2A2624]/20 py-1 px-0 focus:outline-none focus:border-[#3E2723]" placeholder="Max" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="md:col-span-3">
            {/* Enhanced Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
              { label: 'Reformers', desc: 'Silenciosos y precisos para casa y estudio', href: '/shop/category/reformers', img: '/images/explore-reformers.png' },
              { label: 'Accesorios', desc: 'Cintas, calcetines grip y mantenimiento', href: '/shop/category/accesorios', img: '/images/explore-accessories.png' },
              { label: 'Ropa', desc: 'Algodón orgánico: fitted y relaxed', href: '/shop/category/ropa', img: '/images/explore-ropa.png' },
              { label: 'Terapia de Luz', desc: 'Luz roja e infrarroja para estudios y casa', href: '/shop/category/terapia-de-luz', img: '/images/explore-luz.png' },
            ]} />

            {/* Newsletter stub */}
            <section className="mt-12 border-t border-[#2A2624]/10 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="font-serif italic text-xl text-[#2A2624]">Join the Community</div>
                  <div className="text-sm text-[#5D5550] mt-1">Updates, promotions, and pilates tips.</div>
                </div>
                <form action="mailto:valery@camadepilates.com" method="post" className="flex items-center gap-4 w-full md:w-auto">
                  <input type="email" required placeholder="email@example.com" className="flex-1 md:w-64 bg-transparent border-b border-[#2A2624]/20 py-2 px-0 focus:outline-none focus:border-[#3E2723]" />
                  <button className="text-xs uppercase tracking-widest text-[#3E2723] hover:opacity-70 transition-opacity" type="submit">Subscribe</button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>

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
    </LuxuryLayout>
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
          className="w-full accent-[#3E2723]"
        />
        <input
          type="range"
          min={domain.min}
          max={domain.max}
          step={step}
          value={maxVal}
          onChange={(e) => onMax(Math.max(Number(e.target.value), minVal))}
          aria-label="Precio máximo"
          className="w-full accent-[#3E2723]"
        />
      </div>
    </div>
  );
}
