export type BundleQuantity = 1 | 4 | 6 | 8;

export interface BundleOption {
  quantity: BundleQuantity;
  discountPercentage: number;
  label: string;
  sublabel: string;
  badge?: string;
  isBestValue?: boolean;
}

export const REFORMER_BUNDLES: BundleOption[] = [
  {
    quantity: 1,
    discountPercentage: 0,
    label: '1 Unidad',
    sublabel: 'Individual',
  },
  {
    quantity: 4,
    discountPercentage: 13,
    label: 'Pack 4',
    sublabel: 'Estudio Starter',
    badge: '13% DESC.',
  },
  {
    quantity: 6,
    discountPercentage: 16,
    label: 'Pack 6',
    sublabel: 'Estudio Pro',
    badge: '16% DESC.',
  },
  {
    quantity: 8,
    discountPercentage: 20,
    label: 'Pack 8',
    sublabel: 'Estudio Completo',
    badge: '20% DESC.',
    isBestValue: true,
  },
];

export interface BundlePriceCalculation {
  quantity: BundleQuantity;
  discountPercentage: number;
  originalUnitPrice: number;
  discountedUnitPrice: number;
  originalTotalPrice: number;
  discountedTotalPrice: number;
  totalSavings: number;
}

/**
 * Check if a product is a Reformer or Machine (Reformers, Cadillacs, Wunda Chairs, Ladder Barrels)
 * that qualifies for studio volume package discounts.
 */
export function isReformerBed(p: { category?: string; name?: string; slug?: string }): boolean {
  if (!p) return false;
  const category = (p.category || '').trim().toLowerCase();
  
  // Non-machine categories (accessories and apparel are excluded)
  if (category === 'accesorios' || category === 'ropa') {
    return false;
  }
  
  return true;
}

/**
 * Calculates unit and total rebated prices for a given base price and quantity option
 */
export function calculateBundlePrice(basePrice: number | string, quantity: BundleQuantity): BundlePriceCalculation {
  const priceNum = typeof basePrice === 'number' ? basePrice : parseFloat(String(basePrice).replace(/[^0-9.]/g, '')) || 0;
  
  const bundle = REFORMER_BUNDLES.find(b => b.quantity === quantity) || REFORMER_BUNDLES[0];
  const discountPercentage = bundle.discountPercentage;
  
  const originalUnitPrice = priceNum;
  const discountedUnitPrice = Math.round(priceNum * (1 - discountPercentage / 100));
  
  const originalTotalPrice = priceNum * quantity;
  const discountedTotalPrice = discountedUnitPrice * quantity;
  const totalSavings = originalTotalPrice - discountedTotalPrice;
  
  return {
    quantity,
    discountPercentage,
    originalUnitPrice,
    discountedUnitPrice,
    originalTotalPrice,
    discountedTotalPrice,
    totalSavings,
  };
}
