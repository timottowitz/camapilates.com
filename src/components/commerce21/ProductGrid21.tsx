import React from 'react';
import type { Product } from '@/lib/shop/types';
import ProductCard21 from './ProductCard21';

type Props = {
  products: Product[];
};

const ProductGrid21: React.FC<Props> = ({ products }) => {
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
        <ProductCard21 key={p.slug} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid21;

