export type FinishKey = 'walnut' | 'white' | 'black' | 'mycelium';

export type ProductVariant = {
  id: string;
  name?: string;
  sku?: string;
  price?: string; // override
  image?: string;
  finish?: FinishKey;
};

export type LightSpecifications = {
  wavelengths?: string;
  power?: string;
  coverage?: string;
  panels?: number;
  timer?: string;
  control?: string;
  mounting?: string;
  support?: string;
  type?: string;
  includes?: string;
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
  category?: string; // e.g., Reformers, Accesorios, Ropa, Terapia de Luz
  finishes?: FinishKey[];
  materials?: string[];
  warranty?: string;
  variants?: ProductVariant[];
  bestSeller?: boolean;
  isNew?: boolean;
  hoverImage?: string;
  // Light therapy specific fields
  specifications?: LightSpecifications;
  studioPackage?: boolean;
  reformerCount?: number;
  customQuote?: boolean;
};

export type Region = 'MX' | 'US' | 'DE';\n
