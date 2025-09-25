import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import products from '@/content/products.json';

type Product = (typeof products)[number];

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const prod: Product | undefined = products.find(p => p.slug === slug);
  if (!prod) return <Navigate to="/store" replace />;

  const url = `${origin}/product/${prod.slug}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prod.name,
    description: prod.description,
    brand: { '@type': 'Brand', name: prod.brand },
    sku: prod.sku,
    image: [origin + prod.image],
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: prod.currency,
      price: prod.price,
      availability: prod.availability,
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  const embedHtml = `
<div class="sr-element sr-products" data-embed="single_product_widget">
  <script type="application/json" data-config="embed">{"publishable_key":"${prod.publishableKey}","options":{"product_to_display":"${prod.productId}","open_product_in":"popup","variation_style":"on_hover"},"includes":{"show_product_name":"0","show_product_price":"0","show_product_image":"0","show_product_summary":"0","open_modal_on_image_click":"0","show_view_product_button":"1","show_add_to_cart_button":"1","show_button_icons":"1"}}</script>
</div>`;

  return (
    <>
      <Helmet>
        <title>{prod.name} | camadepilates.com</title>
        <meta name="description" content={prod.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={prod.name} />
        <meta property="og:description" content={prod.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin}${prod.image}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <img src={prod.image} alt={prod.name} className="w-full h-auto rounded-lg border" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{prod.name}</h1>
            <p className="mt-4 text-gray-700">{prod.description}</p>
            <div className="mt-6 text-xl text-gray-900 font-semibold">$ {prod.price} {prod.currency}</div>
            <div className="mt-8" dangerouslySetInnerHTML={{ __html: embedHtml }} />

            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-900">Características</h2>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li>• Estabilidad y recorrido suave</li>
                <li>• Accesorios básicos incluidos</li>
                <li>• Soporte y garantía</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductPage;

