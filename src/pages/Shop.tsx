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
import MobileFilterSheet, { MobileFilterTrigger } from '@/components/commerce21/MobileFilterSheet';
import { ChevronDown, Mail, ArrowRight } from 'lucide-react';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/shop`} />
        {assets.shopHero && <link rel="preload" as="image" href={assets.shopHero} fetchPriority="high" />}
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

      <div className="relative min-h-screen bg-[#F9F9F8]">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
        <div className="absolute top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="container mx-auto px-6 md:px-24 py-12 space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* SEO H1 - Visually hidden */}
            <h1 className="sr-only">Tienda de Camas de Pilates Reformer y Accesorios en México - Edelweiss Pilates</h1>
            {/* Visual Title */}
            <p className="text-5xl md:text-7xl font-serif italic text-[#2A2624] tracking-tighter loading-[0.9]" aria-hidden="true">
              Shop<span className="text-[#EB4C42]">.</span>
            </p>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
              <a href="https://wa.me/525548468190" className="hover:text-[#EB4C42] transition-colors">WhatsApp</a>
              <a href="tel:+525548468190" className="hover:text-[#EB4C42] transition-colors">Llamar</a>
              <div className="hidden sm:block text-[#5D5550]">
                <Link to="/shop/category/reformers" className="hover:text-[#EB4C42] transition-colors">Ver Reformers</Link>
              </div>
            </div>
          </div>

          {/* Enhanced Hero */}
          <EnhancedHero
            title="Redescubre tu gracia"
            subtitle="Tejidos no tóxicos & materiales premium (cuero genuino, nogal & acero). Pago seguro & entrega en 3 semanas."
            backgroundImage={assets.shopHero || DEFAULTS.ogImage}
            showTrustMetrics={false}
            ctaPrimary={{ text: 'Ver promoción', href: '/product/reformer-aluminio-riel-deslizante-a068' }}
            ctaSecondary={{ text: 'Ver Reformers', href: '/shop/category/reformers' }}
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

          {/* Best sellers rail */}
          <ProductRail21 title="Más vendidos" products={(allProducts() as any).filter((p: any) => p.bestSeller).slice(0, 8)} />

          {/* Sticky listing header */}
          {/* Sticky listing header */}
          <div className="sticky top-4 z-40 mx-auto max-w-7xl">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-full py-3 px-8 flex items-center justify-between gap-6 transition-all hover:shadow-md hover:bg-white/90">
              <div className="text-[#5D5550] font-sans text-[10px] tracking-widest uppercase font-bold">{products.length} Items</div>
              <FilterBar21 sort={sort} onSort={(v) => setSort(v as any)} region={region} onRegion={(v) => { setRegion(v); try { window.localStorage.setItem('regionPref', v); } catch { } }} search={search} onSearch={setSearch} />
            </div>

            <div className="mt-4 px-4">
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
            {/* Enhanced Desktop Filter Sidebar */}
            <aside className="hidden md:block md:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-serif italic text-xl text-[#2A2624]">Filtros</h2>
                  {(activeCats.length > 0 || activeFinishes.length > 0 || minPrice || maxPrice) && (
                    <button
                      onClick={() => { setActiveCats([]); setActiveFinishes([]); setActiveAvailability([]); setMinPrice(''); setMaxPrice(''); setSearch(''); }}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#EB4C42] font-bold hover:underline"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>

                {/* Categories */}
                <FilterAccordion title="Categorías" defaultOpen>
                  <div className="space-y-1">
                    {cats.map((c) => (
                      <label
                        key={c.slug}
                        className={`
                          flex items-center justify-between p-3 rounded-xl cursor-pointer
                          transition-all duration-200
                          ${activeCats.includes(c.name)
                            ? 'bg-[#2A2624] text-white'
                            : 'hover:bg-[#2A2624]/5'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                            ${activeCats.includes(c.name)
                              ? 'bg-white border-white'
                              : 'border-[#2A2624]/20'}
                          `}>
                            {activeCats.includes(c.name) && (
                              <svg className="w-3 h-3 text-[#2A2624]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm">{c.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeCats.includes(c.name) ? 'bg-white/20 text-white' : 'bg-[#2A2624]/5 text-[#5D5550]'}`}>
                          {c.count}
                        </span>
                        <input
                          type="checkbox"
                          checked={activeCats.includes(c.name)}
                          onChange={(e) => {
                            setActiveCats((prev) => e.target.checked ? Array.from(new Set([...prev, c.name])) : prev.filter((x) => x !== c.name));
                          }}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </FilterAccordion>

                {/* Finishes */}
                <FilterAccordion title="Acabados">
                  <div className="flex flex-wrap gap-2">
                    {finishes.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFinishes((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f])}
                        className={`
                          px-4 py-2 rounded-full text-sm transition-all duration-200
                          ${activeFinishes.includes(f)
                            ? 'bg-[#2A2624] text-white'
                            : 'bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10'}
                        `}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </FilterAccordion>

                {/* Price Range */}
                <FilterAccordion title="Precio">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550]/60 font-bold mb-2 block">
                          Mínimo
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D5550]/60 text-sm">$</span>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#2A2624]/10 bg-white text-sm focus:outline-none focus:border-[#2A2624]/30 focus:ring-2 focus:ring-[#2A2624]/5 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550]/60 font-bold mb-2 block">
                          Máximo
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D5550]/60 text-sm">$</span>
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="100,000"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#2A2624]/10 bg-white text-sm focus:outline-none focus:border-[#2A2624]/30 focus:ring-2 focus:ring-[#2A2624]/5 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Quick ranges */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '< $1k', min: '', max: '1000' },
                        { label: '$1-10k', min: '1000', max: '10000' },
                        { label: '$10-50k', min: '10000', max: '50000' },
                        { label: '> $50k', min: '50000', max: '' },
                      ].map(range => (
                        <button
                          key={range.label}
                          onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); }}
                          className="px-2.5 py-1 rounded-lg text-[10px] bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10 transition-colors font-medium"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </FilterAccordion>

                {/* Delivery Info */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7A8A6F]/10 to-[#7A8A6F]/5 border border-[#7A8A6F]/20">
                  <p className="text-xs text-[#5D5550] leading-relaxed">
                    <span className="font-bold text-[#7A8A6F]">Envío gratis</span> en pedidos mayores a $5,000 MXN. Entrega en 3 semanas.
                  </p>
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
                    showUrgency={true}
                  />
                ))}
              </div>

              {/* Customer Reviews Preview */}
              <CustomerReviewsPreview className="my-12" />

              {/* Explore range blocks */}
              <ExploreTiles21 items={[
                { label: 'Reformers', desc: 'Silenciosos y precisos para casa y estudio', href: '/shop/category/reformers', img: '/images/explore-reformers.webp' },
                { label: 'Accesorios', desc: 'Cintas, calcetines grip y mantenimiento', href: '/shop/category/accesorios', img: '/images/explore-accessories.webp' },
                { label: 'Ropa', desc: 'Algodón orgánico: fitted y relaxed', href: '/shop/category/ropa', img: '/images/conjunto-fitted.webp' },
                { label: 'Terapia de Luz', desc: 'Luz roja e infrarroja para estudios y casa', href: '/shop/category/terapia-de-luz', img: '/images/luz-studio-4.webp' },
              ]} />

              {/* Premium Newsletter Section */}
              <section className="mt-16 relative overflow-hidden">
                <div className="relative bg-gradient-to-br from-[#2A2624] via-[#3E2723] to-[#2A2624] rounded-[2rem] p-8 md:p-12">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EB4C42]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                        <Mail className="h-3 w-3 text-[#EB4C42]" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold">Newsletter</span>
                      </div>
                      <h3 className="font-serif italic text-2xl md:text-3xl text-white mb-2">
                        Únete a la comunidad
                      </h3>
                      <p className="text-sm text-white/60 max-w-md">
                        Recibe actualizaciones exclusivas, promociones y consejos de pilates directamente en tu bandeja.
                      </p>
                    </div>

                    {/* Form */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <form
                        action="mailto:valery@camadepilates.com"
                        method="post"
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <div className="relative flex-1 md:w-72">
                          <input
                            type="email"
                            required
                            placeholder="tu@email.com"
                            className="
                              w-full px-5 py-4 rounded-xl
                              bg-white/10 backdrop-blur-sm border border-white/20
                              text-white placeholder:text-white/40
                              focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10
                              transition-all text-sm
                            "
                          />
                        </div>
                        <button
                          type="submit"
                          className="
                            inline-flex items-center justify-center gap-2
                            px-6 py-4 rounded-xl
                            bg-white text-[#2A2624]
                            text-sm font-bold uppercase tracking-[0.1em]
                            hover:bg-[#EB4C42] hover:text-white
                            active:scale-[0.98]
                            transition-all duration-200
                            shadow-lg shadow-black/20
                          "
                        >
                          Suscribirse
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>
                      <p className="text-[10px] text-white/40 mt-3 text-center md:text-left">
                        Sin spam. Cancela cuando quieras.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Trigger Button */}
      <MobileFilterTrigger
        onClick={() => setShowMobileFilters(true)}
        activeCount={activeCats.length + activeFinishes.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
      />

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        categories={cats}
        activeCats={activeCats}
        setActiveCats={setActiveCats}
        finishes={finishes}
        activeFinishes={activeFinishes}
        setActiveFinishes={setActiveFinishes}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        resultsCount={products.length}
        onClearAll={() => { setActiveCats([]); setActiveFinishes([]); setActiveAvailability([]); setMinPrice(''); setMaxPrice(''); setSearch(''); }}
      />

      {/* Live Purchase Notifications */}
      <LivePurchaseNotifications />

      {/* Exit Intent Popup */}
      {
        showExitPopup && (
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
        )
      }

      {quick && <QuickView21 product={quick as any} onClose={() => setQuick(null)} />}
    </LuxuryLayout >
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

// FilterAccordion component for desktop sidebar
function FilterAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-[#2A2624]/10 pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#5D5550] font-bold group-hover:text-[#2A2624] transition-colors">
          {title}
        </h3>
        <ChevronDown
          className={`h-4 w-4 text-[#5D5550] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}
