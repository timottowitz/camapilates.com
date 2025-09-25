import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import products from '@/content/products.json';

const Products: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const title = 'Productos: Camas de Pilates y Accesorios';
  const desc = 'Explora todas nuestras camas de Pilates (Reformer) y accesorios. Compra para casa o estudio.';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${origin}/product/${p.slug}`,
      name: p.name
    }))
  };

  return (
    <>
      <Helmet>
        <title>{title} | camadepilates.com</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/products`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/products`} />
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Todos los productos</h1>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="block group border rounded-lg p-6 hover:border-gray-900 transition-colors">
                <img src={p.image} alt={p.name} className="w-full h-auto rounded mb-4 border" />
                <h2 className="font-semibold text-gray-900 group-hover:text-black">{p.name}</h2>
                <p className="text-sm text-gray-600 mt-2">{p.description}</p>
                <div className="mt-3 font-semibold text-gray-900">$ {p.price} {p.currency}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;

