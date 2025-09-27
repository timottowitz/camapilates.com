export type FinishKey = 'walnut' | 'white' | 'black' | 'mycelium';

export type ProductVariant = {
  id: string;
  name?: string;
  sku?: string;
  price?: string; // override
  image?: string;
  finish?: FinishKey;
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  brand: string;
  sku: string;
  image: string;
  price: string; // keep as string in content; format for UI
  currency: string; // e.g., MXN
  availability: string; // schema URL
  productId: string; // Shoprocket product id
  publishableKey: string; // Shoprocket key
  category?: string; // e.g., Reformers, Accesorios
  finishes?: FinishKey[];
  materials?: string[];
  warranty?: string;
  variants?: ProductVariant[];
  bestSeller?: boolean;
  isNew?: boolean;
};

export type Region = 'MX' | 'US' | 'DE';
