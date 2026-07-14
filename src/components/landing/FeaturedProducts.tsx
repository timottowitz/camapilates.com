import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import products from '@/content/products.json';

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const FeaturedProducts: React.FC = () => {
  // Select diverse featured products: 2 reformers, 1 clothing, 1 accessory, 1 light therapy
  const featured = [
    products.find(p => p.slug === 'reformer-aluminio-riel-deslizante-a068'),
    products.find(p => p.slug === 'reformer-maple-barra-patentada-a001'),
    products.find(p => p.slug === 'conjunto-fitted-organico'),
    products.find(p => p.slug === 'calcetines-antideslizantes'),
    products.find(p => p.slug === 'silla-wunda-roble-premium-a101'),
  ].filter(Boolean);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Cotizar';
    return `$${num.toLocaleString('es-MX')} MXN`;
  };

  return (
    <section className="w-full bg-[#E3E0DB] py-20 md:py-28">
      <div className="max-w-[1800px] mx-auto px-8 md:px-24">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#3E2723] mb-4 block">
                Colección
              </span>
              <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
                Lo Más Destacado
              </h2>
            </div>
            <Link
              to="/shop"
              className="mt-6 md:mt-0 text-xs uppercase tracking-[0.15em] text-[#3E2723] hover:text-[#2A2624] transition-colors flex items-center gap-2"
            >
              Ver Toda la Colección
              <span>→</span>
            </Link>
          </div>
        </FadeIn>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-8 px-8 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
          {featured.map((product, index) => (
            <FadeIn key={product!.slug} delay={index * 0.1}>
              <Link
                to={`/product/${product!.slug}`}
                className="group flex-shrink-0 w-[260px] md:w-auto"
              >
                <div className="aspect-square bg-[#EAE8E4] rounded-lg overflow-hidden mb-4 relative">
                  <img
                    src={product!.image}
                    alt={product!.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product!.isNew && (
                    <span className="absolute top-3 left-3 bg-[#3E2723] text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                      Nuevo
                    </span>
                  )}
                  {product!.bestSeller && !product!.isNew && (
                    <span className="absolute top-3 left-3 bg-[#7A8A6F] text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                      Popular
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#5D5550]">
                    {product!.category}
                  </span>
                  <h3 className="text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723] transition-colors line-clamp-2">
                    {product!.name}
                  </h3>
                  <p className="text-sm text-[#5D5550]">
                    {formatPrice(product!.price)}
                  </p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
