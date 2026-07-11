import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { DEFAULTS, generateBreadcrumbSchema, getOrigin } from '@/lib/seo';
import {
  allProducts,
  availableFinishes,
  filterByAvailability,
  filterByFinishes,
  toItemListSchema,
} from '@/lib/shop/catalog';
import type { FinishKey, Product } from '@/lib/shop/types';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';
import ActiveChips21, { Chip } from '@/components/commerce21/ActiveChips21';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import EnhancedButton from '@/components/ui/enhanced-button';
import { ArrowRight, Filter, Sparkles } from 'lucide-react';
import BackLink from '@/components/ui/back-link';

const AVAILABILITY_OPTIONS = [
  { label: 'En stock', value: 'https://schema.org/InStock' },
  { label: 'Preorden', value: 'https://schema.org/PreOrder' },
] as const;

function isReformerProduct(p: Product): boolean {
  const cat = (p.category || '').toLowerCase();
  if (cat.includes('reformer')) return true;
  const slug = (p.slug || '').toLowerCase();
  if (slug.includes('reformer')) return true;
  const name = (p.name || '').toLowerCase();
  return name.includes('reformer');
}

function inferUseCase(p: Product): 'casa' | 'estudio' | 'ambos' {
  const haystack = `${p.slug} ${p.name} ${p.description}`.toLowerCase();
  const casa = /\bcasa\b/.test(haystack);
  const estudio = /\bestudio\b|\bprofesional\b/.test(haystack);
  if (casa && estudio) return 'ambos';
  if (estudio) return 'estudio';
  if (casa) return 'casa';
  return 'ambos';
}

const ReformersNew: React.FC = () => {
  const origin = getOrigin();
  const title = 'Reformers nuevas — Modelos, filtros y comparativa';
  const desc = 'Explora reformers nuevas en México: filtra por precio, acabados y disponibilidad. Cotiza por WhatsApp y compara modelos.';

  const base = useMemo(() => allProducts().filter(isReformerProduct), []);
  const finishes = useMemo(() => availableFinishes(base), [base]);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeFinishes, setActiveFinishes] = useState<FinishKey[]>([]);
  const [activeAvailability, setActiveAvailability] = useState<string[]>([]);
  const [useCase, setUseCase] = useState<'all' | 'casa' | 'estudio'>('all');
  const [sort, setSort] = useState<'recommended' | 'price_asc' | 'price_desc'>('recommended');

  const list = useMemo(() => {
    let items = base;

    if (useCase !== 'all') {
      items = items.filter((p) => {
        const inferred = inferUseCase(p);
        return inferred === 'ambos' || inferred === useCase;
      });
    }

    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined || max !== undefined) {
      items = items.filter((p) => {
        const val = Number(p.price);
        if (!Number.isFinite(val)) return true;
        if (min !== undefined && val < min) return false;
        if (max !== undefined && val > max) return false;
        return true;
      });
    }

    items = filterByFinishes(items, activeFinishes);
    items = filterByAvailability(items, activeAvailability);

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((p) => `${p.name} ${p.description} ${p.slug}`.toLowerCase().includes(q));
    }

    if (sort === 'price_asc') {
      return [...items].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sort === 'price_desc') {
      return [...items].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return items;
  }, [base, useCase, minPrice, maxPrice, activeFinishes, activeAvailability, search, sort]);

  const itemList = useMemo(() => toItemListSchema(origin, list), [origin, list]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Reformers', url: '/reformers/nuevas' },
    { name: 'Nuevas' },
  ]);

  const chips = useMemo((): Chip[] => {
    const out: Chip[] = [];
    if (useCase !== 'all') out.push({ label: `Uso: ${useCase}`, onRemove: () => setUseCase('all') });
    activeFinishes.forEach((f) => out.push({ label: `Acabado: ${f}`, onRemove: () => setActiveFinishes((prev) => prev.filter((x) => x !== f)) }));
    activeAvailability.forEach((a) => {
      const label = /instock/i.test(a) ? 'En stock' : /preorder/i.test(a) ? 'Preorden' : a;
      out.push({ label, onRemove: () => setActiveAvailability((prev) => prev.filter((x) => x !== a)) });
    });
    if (minPrice) out.push({ label: `≥ $${minPrice}`, onRemove: () => setMinPrice('') });
    if (maxPrice) out.push({ label: `≤ $${maxPrice}`, onRemove: () => setMaxPrice('') });
    if (search) out.push({ label: `Buscar: ${search}`, onRemove: () => setSearch('') });
    return out;
  }, [useCase, activeFinishes, activeAvailability, minPrice, maxPrice, search]);

  const clearAll = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setActiveFinishes([]);
    setActiveAvailability([]);
    setUseCase('all');
    setSort('recommended');
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Búsqueda</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Modelo, marca, keyword..."
          className="mt-3 w-full rounded-xl border border-[#2A2624]/15 bg-white/60 px-4 py-3 text-sm text-[#2A2624] placeholder:text-[#5D5550] focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20"
        />
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Uso</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'casa', label: 'Casa' },
              { id: 'estudio', label: 'Estudio' },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setUseCase(o.id)}
              className={
                useCase === o.id
                  ? 'rounded-full bg-[#3E2723] text-white px-3 py-2 uppercase tracking-[0.18em]'
                  : 'rounded-full border border-[#2A2624]/15 bg-white/60 text-[#2A2624] px-3 py-2 uppercase tracking-[0.18em] hover:bg-white'
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-[#5D5550]">El filtro se infiere por texto (casa/estudio) y se puede afinar.</div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Precio (MXN)</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-xl border border-[#2A2624]/15 bg-white/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-xl border border-[#2A2624]/15 bg-white/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20"
          />
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Disponibilidad</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {AVAILABILITY_OPTIONS.map((o) => {
            const checked = activeAvailability.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setActiveAvailability((prev) => checked ? prev.filter((x) => x !== o.value) : [...prev, o.value]);
                }}
                className={
                  checked
                    ? 'rounded-full bg-[#3E2723] text-white px-3 py-2 text-[11px] uppercase tracking-[0.18em]'
                    : 'rounded-full border border-[#2A2624]/15 bg-white/60 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#2A2624] hover:bg-white'
                }
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Acabados</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {finishes.map((f) => {
            const checked = activeFinishes.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setActiveFinishes((prev) => checked ? prev.filter((x) => x !== f) : [...prev, f]);
                }}
                className={
                  checked
                    ? 'rounded-full bg-[#3E2723] text-white px-3 py-2 text-[11px] uppercase tracking-[0.18em]'
                    : 'rounded-full border border-[#2A2624]/15 bg-white/60 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#2A2624] hover:bg-white'
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={clearAll} className="text-xs uppercase tracking-[0.22em] text-[#5D5550] hover:text-[#3E2723]">Limpiar</button>
        <div className="text-xs uppercase tracking-[0.22em] text-[#5D5550]">{list.length} resultados</div>
      </div>
    </div>
  );

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/reformers/nuevas`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/reformers/nuevas`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(circle_at_center,rgba(62,39,35,0.14),rgba(234,232,228,0)_60%)]" />

        <div className="container mx-auto px-6 md:px-10 py-10 relative">
          <BackLink className="mb-6" fallbackTo="/" label="Volver" />
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="text-[11px] uppercase tracking-[0.25em] text-[#5D5550] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Catálogo curado
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[1.05]">Reformers nuevas</h1>
              <p className="mt-3 text-sm md:text-base text-[#5D5550] max-w-2xl">
                Encuentra tu reformer ideal en minutos. Filtra por uso (casa/estudio), acabados y disponibilidad; luego compara y cotiza con una lista corta.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <EnhancedButton asChild className="rounded-full bg-[#3E2723] text-white hover:bg-[#3E2723]/90">
                  <a href="https://wa.me/525548468190">Cotizar por WhatsApp</a>
                </EnhancedButton>
                <EnhancedButton asChild variant="outline" className="rounded-full border-[#2A2624]/20 bg-white/60">
                  <Link to="/compare">Comparar modelos</Link>
                </EnhancedButton>
                <Link to="/reformers/usadas" className="text-xs uppercase tracking-[0.22em] text-[#5D5550] hover:text-[#3E2723]">Ver usadas →</Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <EnhancedCard variant="glass" hover={false} className="rounded-3xl">
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Cómo comprar mejor</div>
                  <div className="mt-2 text-sm text-[#2A2624]">Elige 2–3 opciones, confirma disponibilidad y pide una cotización comparable.</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#5D5550]">Resultados</div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#5D5550]">{list.length}</div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 xl:col-span-3 hidden lg:block">
              <div className="sticky top-6">
                <EnhancedCard variant="glass" hover={false} className="rounded-3xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Filtros</div>
                      <button type="button" onClick={clearAll} className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550] hover:text-[#3E2723]">Limpiar</button>
                    </div>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </div>
                </EnhancedCard>
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9">
              <div className="sticky top-4 z-30 rounded-2xl border border-[#2A2624]/10 bg-white/70 backdrop-blur px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#5D5550]">{list.length} resultados</div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSort('recommended')}
                        className={sort === 'recommended' ? 'rounded-full bg-[#2A2624] text-white px-3 py-2 text-[10px] uppercase tracking-[0.22em]' : 'rounded-full border border-[#2A2624]/15 bg-white/60 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#2A2624] hover:bg-white'}
                      >
                        Recomendado
                      </button>
                      <button
                        type="button"
                        onClick={() => setSort('price_asc')}
                        className={sort === 'price_asc' ? 'rounded-full bg-[#2A2624] text-white px-3 py-2 text-[10px] uppercase tracking-[0.22em]' : 'rounded-full border border-[#2A2624]/15 bg-white/60 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#2A2624] hover:bg-white'}
                      >
                        Precio ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => setSort('price_desc')}
                        className={sort === 'price_desc' ? 'rounded-full bg-[#2A2624] text-white px-3 py-2 text-[10px] uppercase tracking-[0.22em]' : 'rounded-full border border-[#2A2624]/15 bg-white/60 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#2A2624] hover:bg-white'}
                      >
                        Precio ↓
                      </button>
                    </div>

                    <Sheet>
                      <SheetTrigger asChild>
                        <button type="button" className="lg:hidden inline-flex items-center gap-2 rounded-full border border-[#2A2624]/15 bg-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#2A2624] hover:bg-white">
                          <Filter className="h-4 w-4" />
                          Filtros
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="rounded-t-3xl p-6">
                        <SheetHeader>
                          <SheetTitle className="font-serif italic">Filtros</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 max-h-[70vh] overflow-auto pr-1">
                          <FilterContent />
                        </div>
                        <div className="mt-6 flex gap-3">
                          <EnhancedButton onClick={clearAll} variant="outline" className="flex-1 rounded-full border-[#2A2624]/20">Limpiar</EnhancedButton>
                          <EnhancedButton className="flex-1 rounded-full bg-[#3E2723] text-white hover:bg-[#3E2723]/90" onClick={() => {}}>Ver resultados</EnhancedButton>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                <div className="mt-3">
                  <ActiveChips21 chips={chips} onClearAll={clearAll} />
                </div>
              </div>

              {list.length === 0 ? (
                <EnhancedCard variant="glass" hover={false} className="mt-6">
                  <div className="p-8">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Sin resultados</div>
                    <div className="mt-2 text-xl font-serif italic text-[#2A2624]">Prueba con filtros más amplios</div>
                    <div className="mt-3 text-sm text-[#5D5550]">Quita un filtro o limpia para ver todo el catálogo de reformers.</div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <EnhancedButton onClick={clearAll} className="rounded-full bg-[#3E2723] text-white hover:bg-[#3E2723]/90">Limpiar filtros</EnhancedButton>
                      <EnhancedButton asChild variant="outline" className="rounded-full border-[#2A2624]/20 bg-white/60">
                        <Link to="/compare">Ir a comparar</Link>
                      </EnhancedButton>
                    </div>
                  </div>
                </EnhancedCard>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {list.map((p) => (
                    <ProductCard21Enhanced key={p.slug} product={p} onQuickView={() => {}} showUrgency={false} />
                  ))}
                </div>
              )}

              <EnhancedCard variant="glass" hover={false} className="mt-10">
                <div className="p-7">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-[#5D5550]">Siguiente paso</div>
                      <div className="mt-2 text-xl font-serif italic text-[#2A2624]">Compara y cierra con claridad</div>
                      <div className="mt-2 text-sm text-[#5D5550]">Te recomendamos elegir 2–3 modelos y pedir cotización con disponibilidad y tiempos.</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <EnhancedButton asChild className="rounded-full bg-[#3E2723] text-white hover:bg-[#3E2723]/90">
                        <Link to="/compare">Ir a comparar</Link>
                      </EnhancedButton>
                      <EnhancedButton asChild variant="outline" className="rounded-full border-[#2A2624]/20 bg-white/60">
                        <a href="https://wa.me/525548468190" className="inline-flex items-center gap-2">Cotizar <ArrowRight className="h-4 w-4" /></a>
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          </div>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default ReformersNew;
