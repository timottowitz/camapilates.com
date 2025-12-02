import React from 'react';
import ShoprocketCart from './ShoprocketCart';
import { allProducts } from '@/lib/shop/catalog';
import { SHOPROCKET_ENABLED } from '@/lib/shoprocket/config';

const FloatingCart21: React.FC = () => {
  if (!SHOPROCKET_ENABLED) return null;
  const p = allProducts()[0];
  if (!p) return null;
  return (
    <>
      {/* Mobile floating cart */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <ShoprocketCart publishableKey={p.publishableKey} />
      </div>
      {/* Desktop floating cart */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <ShoprocketCart publishableKey={p.publishableKey} />
      </div>
    </>
  );
};

export default FloatingCart21;
