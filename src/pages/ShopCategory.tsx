import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { useParams, Link } from 'react-router-dom';
import { allProducts, toItemListSchema, categoryFromSlug, filterByCategory } from '@/lib/shop/catalog';
import { viewItemList } from '@/lib/shop/analytics';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import ProductCard21Enhanced from '@/components/commerce21/ProductCard21Enhanced';
import QuickView21 from '@/components/commerce21/QuickView21';
import type { Product as PType } from '@/lib/shop/types';

const ShopCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const category = categoryFromSlug(slug || '');
  const base = allProducts();
  const products = useMemo(() => filterByCategory(base, category ? [category] : []), [slug]);
  const title = category ? `Tienda — ${category}` : 'Tienda';
  const desc = category ? `Productos en la categoría ${category}` : 'Productos';
  const itemList = toItemListSchema(origin, products);
  const [quick, setQuick] = useState<PType | null>(null);

  useEffect(() => {
    viewItemList(`shop:${category || 'unknown'}`, products);
  }, [slug, products.length]);

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/shop/category/${slug}`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/shop/category/${slug}`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <div className="container mx-auto px-8 md:px-24 py-12 space-y-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5D5550]">
            <Link to="/shop" className="hover:text-[#3E2723] transition-colors border-b border-transparent hover:border-[#3E2723]">Tienda</Link>
            <span className="opacity-50">/</span>
            <span className="text-[#2A2624]">{category || 'Categoría'}</span>
          </div>

          <div className="border-b border-[#2A2624]/10 pb-8">
            <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] mb-4">{category || 'Categoría'}</h1>
            <div className="text-sm text-[#5D5550] font-light">{products.length} resultado{products.length === 1 ? '' : 's'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard21Enhanced
              key={product.slug}
              product={product}
              onQuickView={(p) => setQuick(p)}
              showFinancing={true}
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
      </div>

      {quick && <QuickView21 product={quick as any} onClose={() => setQuick(null)} />}
    </LuxuryLayout>
  );
};

export default ShopCategory;
