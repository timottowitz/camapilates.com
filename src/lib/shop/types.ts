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
};

export type Region = 'MX' | 'US' | 'DE';

