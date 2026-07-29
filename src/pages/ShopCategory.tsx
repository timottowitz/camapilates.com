import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, generateBreadcrumbSchema, getOrigin } from '@/lib/seo';
import { useParams, Link } from 'react-router-dom';
import { allProducts, toItemListSchema, categoryFromSlug, filterByCategory } from '@/lib/shop/catalog';
import { getRelatedShopCategories, getShopCategorySeo } from '@/lib/shop/categorySeo';
import { viewItemList } from '@/lib/shop/analytics';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';
import QuickView21 from '@/components/commerce21/QuickView21';
import type { Product as PType } from '@/lib/shop/types';
import BackLink from '@/components/ui/back-link';

const ShopCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const categorySlug = slug || '';
  const categorySeo = getShopCategorySeo(categorySlug);
  const category = categorySeo?.category || categoryFromSlug(categorySlug);
  const base = allProducts();
  const products = useMemo(() => filterByCategory(base, category ? [category] : []), [base, category]);
  const title = categorySeo?.title || (category ? `${category} de Pilates | ${DEFAULTS.siteName}` : `Categoría no encontrada | ${DEFAULTS.siteName}`);
  const desc = categorySeo?.description || (category ? `Explora productos de ${category} para Pilates.` : 'La categoría solicitada no está disponible.');
  const canonical = `${origin}/shop/category/${categorySlug}`;
  const itemList = toItemListSchema(origin, products);
  const relatedCategories = getRelatedShopCategories(categorySlug);
  const [quick, setQuick] = useState<PType | null>(null);

  useEffect(() => {
    viewItemList(`shop:${category || 'unknown'}`, products);
  }, [category, products]);

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        {!categorySeo && <meta name="robots" content="noindex,follow" />}
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Tienda', url: '/shop' },
          { name: categorySeo?.h1 || category || 'Categoría' },
        ]))}</script>
        {categorySeo && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: categorySeo.h1,
            description: categorySeo.description,
            url: canonical,
            inLanguage: 'es-MX',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: products.length,
              itemListElement: products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: product.name,
                url: `${origin}/product/${product.slug}`,
              })),
            },
          })}</script>
        )}
        {categorySeo && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: categorySeo.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          })}</script>
        )}
      </Helmet>

      <div className="relative min-h-screen bg-[#F2F0ED]">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
        <div className="absolute top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl">
          <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
        </div>

        <div className="container mx-auto px-8 md:px-24 py-12 space-y-12 relative z-10">
          <div className="flex flex-col gap-4">
            <BackLink className="mb-2" fallbackTo="/shop" label="Volver" />
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5D5550]">
              <Link to="/shop" className="hover:text-[#3E2723] transition-colors border-b border-transparent hover:border-[#3E2723]">Tienda</Link>
              <span className="opacity-50">/</span>
              <span className="text-[#2A2624]">{category || 'Categoría'}</span>
            </div>

            <div className="border-b border-[#2A2624]/10 pb-8">
              <h1 className="max-w-5xl text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-4">
                {categorySeo?.h1 || category || 'Categoría no encontrada'}
              </h1>
              {categorySeo && (
                <p className="max-w-3xl text-base md:text-lg leading-relaxed text-[#5D5550] font-light mb-5">
                  {categorySeo.intro}
                </p>
              )}
              <div className="text-sm text-[#5D5550] font-light">{products.length} resultado{products.length === 1 ? '' : 's'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard21Enhanced
                key={product.slug}
                product={product}
                onQuickView={(p) => setQuick(p)}
                showUrgency={false}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-xl font-serif italic text-[#5D5550]">No products found in this category.</p>
              <Link to="/shop" className="mt-4 inline-block px-6 py-3 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors">
                Return to Shop
              </Link>
            </div>
          )}

          {categorySeo && (
            <section className="border-t border-[#2A2624]/10 pt-14 md:pt-20 space-y-16" aria-labelledby="category-guide-title">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
                <div className="space-y-10">
                  <h2 id="category-guide-title" className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
                    Guía de la colección
                  </h2>
                  {categorySeo.sections.map((section) => (
                    <div key={section.heading} className="max-w-3xl">
                      <h3 className="text-xl md:text-2xl font-serif italic text-[#2A2624] mb-3">{section.heading}</h3>
                      <p className="leading-8 text-[#5D5550] font-light">{section.body}</p>
                    </div>
                  ))}
                </div>

                <aside className="lg:border-l lg:border-[#2A2624]/10 lg:pl-10">
                  <h2 className="text-xl font-serif italic text-[#2A2624] mb-6">Guías para elegir mejor</h2>
                  <div className="space-y-4">
                    {categorySeo.guides.map((guide) => (
                      <Link
                        key={guide.href}
                        to={guide.href}
                        className="block border-b border-[#2A2624]/10 pb-4 group"
                      >
                        <span className="block text-sm font-semibold text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">
                          {guide.label}
                        </span>
                        <span className="block mt-1 text-sm leading-6 text-[#5D5550] font-light">{guide.description}</span>
                      </Link>
                    ))}
                  </div>
                </aside>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-6">Explora otras colecciones</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedCategories.map((related) => (
                    <Link
                      key={related.slug}
                      to={`/shop/category/${related.slug}`}
                      className="group rounded-2xl border border-[#2A2624]/10 bg-white/50 p-5 hover:bg-white transition-colors"
                    >
                      <h3 className="font-serif italic text-lg text-[#2A2624] group-hover:text-[#EB4C42] transition-colors">
                        {related.label}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5D5550] font-light line-clamp-3">{related.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-6">Preguntas frecuentes</h2>
                <div className="divide-y divide-[#2A2624]/10 border-y border-[#2A2624]/10">
                  {categorySeo.faq.map((item) => (
                    <div key={item.question} className="py-6">
                      <h3 className="text-lg font-semibold text-[#2A2624]">{item.question}</h3>
                      <p className="mt-2 max-w-4xl leading-7 text-[#5D5550] font-light">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {quick && <QuickView21 product={quick} onClose={() => setQuick(null)} />}
    </LuxuryLayout>
  );
};

export default ShopCategory;
