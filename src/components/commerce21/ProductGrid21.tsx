import React from 'react';
import type { Product } from '@/lib/shop/types';
import ProductCard21 from './ProductCard21';
import type { Product } from '@/lib/shop/types';

type Props = {
  products: Product[];
  onQuickView?: (p: Product) => void;
};

const ProductGrid21: React.FC<Props> = ({ products, onQuickView }) => {
  if (!products?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No hay productos disponibles por ahora.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard21 key={p.slug} product={p} onQuickView={onQuickView} />
      ))}
    </div>
  );
};

export default ProductGrid21;
