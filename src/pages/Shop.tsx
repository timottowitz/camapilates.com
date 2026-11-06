import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { DEFAULTS, getOrigin, generateBreadcrumbSchema } from '@/lib/seo';
import { allProducts, priceLabel, REFORMER_TYPE_LABELS, toItemListSchema } from '@/lib/shop/catalog';
import { viewItemList } from '@/lib/shop/analytics';
import type { Product, ReformerType } from '@/lib/shop/types';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';
import QuickView21 from '@/components/commerce21/QuickView21';

type Filter = 'todos' | ReformerType | 'accesorios';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos los reformers' },
  ...(Object.entries(REFORMER_TYPE_LABELS) as [ReformerType, string][]).map(([key, label]) => ({ key, label })),
  { key: 'accesorios', label: 'Accesorios y ropa' },
];

const WHATSAPP = `https://wa.me/525548468190?text=${encodeURIComponent(
  'Hola, estoy viendo la tienda de camadepilates.com y quiero ayuda para elegir mi reformer.'
)}`;

const isReformer = (p: Product) => p.category === 'Reformers';

const Shop: React.FC = () => {
  const origin = getOrigin();
  const title = 'Tienda de Camas de Pilates Reformer';
  const desc =
    'Reformers de roble, maple y aluminio, plegables y para gimnasio. Precios en MXN, medidas reales y asesoría por WhatsApp con envío a todo México.';

  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tipo') as Filter | null;
  const filter: Filter = FILTERS.some((f) => f.key === requested) ? (requested as Filter) : 'todos';
  const [quick, setQuick] = useState<Product | null>(null);

  const all = allProducts();
  const reformers = all.filter(isReformer);
  const shown = useMemo(() => {
    if (filter === 'todos') return reformers;
    if (filter === 'accesorios') return all.filter((p) => !isReformer(p));
    return reformers.filter((p) => p.type === filter);
  }, [filter, all, reformers]);

  useEffect(() => {
    viewItemList('shop', shown);
  }, [shown]);

  const count = (key: Filter) =>
    key === 'todos' ? reformers.length : key === 'accesorios' ? all.length - reformers.length : reformers.filter((p) => p.type === key).length;

  const setFilter = (key: Filter) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'todos') next.delete('tipo');
    else next.set('tipo', key);
    setSearchParams(next, { replace: true });
  };

  return (
    <LuxuryLayout headerTheme="light">
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
        <meta property="og:image" content={`${origin}${reformers[0]?.image ?? DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(toItemListSchema(origin, reformers))}</script>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema([{ name: 'Inicio', url: '/' }, { name: 'Tienda' }]))}
        </script>
      </Helmet>

      <div className="bg-[#F9F9F8] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-10 md:py-14 space-y-10">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] tracking-tight leading-[1.05]">
                Camas de Pilates Reformer
              </h1>
              <p className="mt-4 text-base md:text-lg text-[#5D5550] font-light leading-relaxed">
                {reformers.length} modelos, de casa a gimnasio: roble, maple, aluminio y plegables. Precios finales en MXN y
                envío a todo México.
              </p>
            </div>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              data-rybbit-event="click_shop_header_whatsapp"
              className="inline-flex items-center justify-center gap-2 self-start md:self-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Te ayudamos a elegir
            </a>
          </header>

          <nav aria-label="Tipo de producto" className="flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                  filter === key
                    ? 'bg-[#2A2624] text-[#EAE8E4] border-[#2A2624]'
                    : 'bg-white text-[#2A2624] border-[#2A2624]/15 hover:border-[#2A2624]/40'
                }`}
              >
                {label} <span className="opacity-60">({count(key)})</span>
              </button>
            ))}
          </nav>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((product) => (
              <ProductCard21Enhanced key={product.slug} product={product} onQuickView={setQuick} />
            ))}
          </div>

          <section aria-labelledby="compare" className="pt-6">
            <h2 id="compare" className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-2">
              Compara los modelos
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-6">
              Medidas y pesos del fabricante. Todos se ofrecen con tapicería negra, gris o blanca.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-[#2A2624]/10 bg-white">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-[#F5F4F0] text-left text-[11px] uppercase tracking-wider text-[#5D5550]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Modelo</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Estructura</th>
                    <th className="px-4 py-3 font-semibold">Medidas</th>
                    <th className="px-4 py-3 font-semibold">Peso</th>
                    <th className="px-4 py-3 font-semibold text-right">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2624]/10">
                  {[...reformers]
                    .sort((a, b) => Number(a.price) - Number(b.price))
                    .map((p) => (
                      <tr key={p.slug} className="hover:bg-[#FAF9F7]">
                        <td className="px-4 py-3">
                          <Link to={`/product/${p.slug}`} className="font-medium text-[#2A2624] hover:text-[#9E4733]">
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[#5D5550]">{p.type ? REFORMER_TYPE_LABELS[p.type] : ''}</td>
                        <td className="px-4 py-3 text-[#5D5550]">
                          {p.specs?.estructura}
                          {p.specs?.torre ? ' + torre' : ''}
                        </td>
                        <td className="px-4 py-3 text-[#5D5550] whitespace-nowrap">
                          {p.specs?.medidas}
                          {p.specs?.medidasPlegado && <span className="block text-xs opacity-70">Plegado: {p.specs.medidasPlegado}</span>}
                        </td>
                        <td className="px-4 py-3 text-[#5D5550] whitespace-nowrap">{p.specs?.peso}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#2A2624] whitespace-nowrap">{priceLabel(p.price)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl bg-[#2A2624] text-[#EAE8E4] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-serif italic">¿Vas a equipar un estudio?</h2>
              <p className="text-sm text-[#EAE8E4]/80 font-light mt-1">Packs de 4 a 10 reformers con precio por volumen.</p>
            </div>
            <Link
              to="/packs/estudio"
              className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-[#EAE8E4] text-[#2A2624] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Ver packs para estudio <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          <section className="pt-6 border-t border-[#2A2624]/10">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-6">Guías de compra</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { to: '/cama-de-pilates/precio', kicker: 'Precios', title: 'Cuánto cuesta un reformer', text: 'Rangos de precio por tipo de modelo.' },
                { to: '/reformer-para-casa', kicker: 'Para casa', title: 'Reformer para casa', text: 'Plegables y modelos para espacios pequeños.' },
                { to: '/reformer-para-estudio', kicker: 'Para estudio', title: 'Reformers para estudio', text: 'Qué elegir para abrir o crecer tu estudio.' },
                { to: '/blog/dimensiones-cama-de-pilates', kicker: 'Espacio', title: 'Medidas y espacio necesario', text: 'Cuánto lugar ocupa cada reformer.' },
              ].map((g) => (
                <Link
                  key={g.to}
                  to={g.to}
                  className="p-4 bg-white border border-[#2A2624]/10 rounded-xl hover:border-[#3E2723] hover:shadow-sm transition-all group block"
                >
                  <span className="text-[10px] text-[#3E2723] font-bold uppercase tracking-wider block mb-1">{g.kicker}</span>
                  <span className="font-serif italic text-sm text-[#2A2624] group-hover:text-[#3E2723]">{g.title} →</span>
                  <span className="text-xs text-[#5D5550] block mt-1">{g.text}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {quick && <QuickView21 product={quick} onClose={() => setQuick(null)} />}
    </LuxuryLayout>
  );
};

export default Shop;
