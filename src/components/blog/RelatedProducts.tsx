import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import products from '@/content/products.json';

interface RelatedProductsProps {
  tags?: string[];
  category?: string;
  maxProducts?: number;
}

const TAG_PRODUCT_MAP: Record<string, string[]> = {
  'reformer': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107'],
  'cama de pilates': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107'],
  'reformer casa': ['reformer-aluminio-riel-deslizante-a068'],
  'reformer profesional': ['reformer-roble-barra-patentada-a107'],
  'accesorios': ['calcetines-antideslizantes', 'cintas-de-pilates', 'calcetines-pack-3'],
  'calcetines': ['calcetines-antideslizantes', 'calcetines-pack-3'],
  'ropa': ['conjunto-fitted-organico', 'leggings-organicos-fitted', 'top-organico-fitted'],
  'espalda': ['reformer-aluminio-riel-deslizante-a068'],
  'dolor': ['reformer-aluminio-riel-deslizante-a068'],
  'estudio': ['reformer-roble-barra-patentada-a107', 'silla-wunda-roble-premium-a101'],
  'luz': ['silla-wunda-roble-premium-a101'],
  'terapia': ['silla-wunda-roble-premium-a101'],
  'principiante': ['reformer-aluminio-riel-deslizante-a068', 'calcetines-antideslizantes'],
  'casa': ['reformer-aluminio-riel-deslizante-a068', 'silla-wunda-maple-a022m'],
  'profesional': ['reformer-roble-barra-patentada-a107', 'silla-wunda-roble-premium-a101'],
  'ejercicios': ['reformer-aluminio-riel-deslizante-a068', 'calcetines-antideslizantes'],
  'mantenimiento': ['cintas-de-pilates'],
  'precio': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107'],
  'compra': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107'],
};

const CATEGORY_PRODUCT_MAP: Record<string, string[]> = {
  'Guías de compra': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107', 'calcetines-antideslizantes'],
  'Comparativas': ['reformer-aluminio-riel-deslizante-a068', 'reformer-roble-barra-patentada-a107'],
  'Ejercicios y salud': ['reformer-aluminio-riel-deslizante-a068', 'calcetines-antideslizantes', 'conjunto-fitted-organico'],
  'Equipo y mantenimiento': ['cintas-de-pilates', 'calcetines-antideslizantes'],
  'Estudio': ['reformer-roble-barra-patentada-a107', 'silla-wunda-roble-premium-a101'],
};

const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  tags = [], 
  category = '', 
  maxProducts = 3 
}) => {
  const matchedProducts = useMemo(() => {
    const slugSet = new Set<string>();

    // Match by tags
    tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      Object.entries(TAG_PRODUCT_MAP).forEach(([key, slugs]) => {
        if (normalizedTag.includes(key) || key.includes(normalizedTag)) {
          slugs.forEach(s => slugSet.add(s));
        }
      });
    });

    // Match by category
    if (category && CATEGORY_PRODUCT_MAP[category]) {
      CATEGORY_PRODUCT_MAP[category].forEach(s => slugSet.add(s));
    }

    // If no matches, show bestsellers
    if (slugSet.size === 0) {
      return products.filter(p => p.bestSeller).slice(0, maxProducts);
    }

    // Get actual products
    const matched = Array.from(slugSet)
      .map(slug => products.find(p => p.slug === slug))
      .filter(Boolean)
      .slice(0, maxProducts);

    return matched;
  }, [tags, category, maxProducts]);

  if (matchedProducts.length === 0) return null;

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return 'Cotizar';
    return `$${num.toLocaleString('es-MX')}`;
  };

  return (
    <div className="my-12 p-8 bg-[#E3E0DB] rounded-sm not-prose">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif italic text-xl text-[#2A2624]">Productos Relacionados</h3>
        <Link 
          to="/shop" 
          className="text-xs uppercase tracking-widest text-[#3E2723] hover:underline"
        >
          Ver todos →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {matchedProducts.map((product: any) => (
          <Link
            key={product.slug}
            to={`/product/${product.slug}`}
            className="group block bg-white rounded-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-[#EAE8E4] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#5D5550] mb-1">
                {product.category}
              </p>
              <h4 className="text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723] transition-colors line-clamp-2 mb-2">
                {product.name}
              </h4>
              <p className="text-sm text-[#3E2723] font-serif italic">
                {formatPrice(product.price)} <span className="text-[10px] font-sans not-italic text-[#5D5550]">MXN</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
