import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { useParams, Link } from 'react-router-dom';
import { allProducts, toItemListSchema, categoryFromSlug, filterByCategory } from '@/lib/shop/catalog';
import ProductGrid21 from '@/components/commerce21/ProductGrid21';
import { viewItemList } from '@/lib/shop/analytics';

const ShopCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = getOrigin();
  const category = categoryFromSlug(slug || '');
  const base = allProducts();
  const products = useMemo(() => filterByCategory(base, category ? [category] : []), [slug]);
  const title = category ? `Tienda — ${category}` : 'Tienda';
  const desc = category ? `Productos en la categoría ${category}` : 'Productos';
  const itemList = toItemListSchema(origin, products);

  useEffect(() => {
    viewItemList(`shop:${category || 'unknown'}`, products);
  }, [slug, products.length]);

  return (
    <>
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
      <section className="bg-background">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/shop" className="text-primary hover:underline">Tienda</Link>
            <span>›</span>
            <span className="text-foreground">{category || 'Categoría'}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{category || 'Categoria'}</h1>
          <div className="text-sm text-muted-foreground">{products.length} resultado{products.length === 1 ? '' : 's'}</div>
          <ProductGrid21 products={products} />
        </div>
      </section>
    </>
  );
};

export default ShopCategory;

