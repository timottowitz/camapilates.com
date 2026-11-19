// Order requests: the buyer configures a product and tells us where it goes; freight is quoted
// afterwards and nothing is charged until they accept the total.
//
// This module is shared by the site and by the Convex functions that store the order, so it uses
// relative imports only and touches nothing from the browser.
import products from '../../content/products.json';
import { calculateBundlePrice, isReformerBed, REFORMER_BUNDLES, type BundleQuantity } from './bundles';
import { isPostalCodeFormat, stateForPostalCode } from '../shipping/postalCodes';
import type { Product } from './types';

// Shown to the buyer as the time we take to send the freight quote.
export const QUOTE_RESPONSE_TIME = '1 día hábil';

export const MAX_ACCESSORY_QUANTITY = 10;

export const UPHOLSTERY_OPTIONS = ['Negro', 'Gris', 'Blanco', 'Otro color'] as const;
export type Upholstery = (typeof UPHOLSTERY_OPTIONS)[number];

export const PLACE_TYPES = ['Casa', 'Estudio o negocio'] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

export const ACCESS_TYPES = ['Planta baja', 'Con elevador', 'Solo escaleras'] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];

export const CONTACT_CHANNELS = ['WhatsApp', 'Correo'] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export type OrderDelivery = {
  postalCode: string;
  city: string;
  neighborhood: string;
  street: string;
  placeType: PlaceType;
  access: AccessType;
  notes: string;
};

export type OrderContact = {
  name: string;
  phone: string;
  email: string;
  channel: ContactChannel;
};

export type OrderDraft = {
  quantity: number;
  upholstery: Upholstery;
  delivery: OrderDelivery;
  contact: OrderContact;
  invoiceRequired: boolean;
};

export const EMPTY_DRAFT: OrderDraft = {
  quantity: 1,
  upholstery: 'Negro',
  delivery: {
    postalCode: '',
    city: '',
    neighborhood: '',
    street: '',
    placeType: 'Casa',
    access: 'Planta baja',
    notes: '',
  },
  contact: { name: '', phone: '', email: '', channel: 'WhatsApp' },
  invoiceRequired: false,
};

export type OrderPricing = {
  quantity: number;
  unitPrice: number;
  listUnitPrice: number;
  subtotal: number;
  savings: number;
  currency: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function findProduct(slug: string): Product | undefined {
  return (products as Product[]).find((p) => p.slug === slug);
}

// Reformers are sold as one unit or as the studio packs; everything else by the piece.
export function allowedQuantities(product: Product): number[] {
  if (isReformerBed(product)) return REFORMER_BUNDLES.map((b) => b.quantity);
  return Array.from({ length: MAX_ACCESSORY_QUANTITY }, (_, i) => i + 1);
}

export function hasUpholsteryChoice(product: Product): boolean {
  return isReformerBed(product);
}

export function priceOrder(product: Product, quantity: number): OrderPricing {
  if (!allowedQuantities(product).includes(quantity)) {
    throw new Error(`Cantidad no disponible para ${product.slug}: ${quantity}`);
  }
  const listUnitPrice = Number(product.price);
  if (isReformerBed(product)) {
    const pack = calculateBundlePrice(listUnitPrice, quantity as BundleQuantity);
    return {
      quantity,
      unitPrice: pack.discountedUnitPrice,
      listUnitPrice,
      subtotal: pack.discountedTotalPrice,
      savings: pack.totalSavings,
      currency: product.currency,
    };
  }
  return {
    quantity,
    unitPrice: listUnitPrice,
    listUnitPrice,
    subtotal: listUnitPrice * quantity,
    savings: 0,
    currency: product.currency,
  };
}

// Ten national digits, however the buyer typed them ("+52 1 55 1234 5678", "(55) 1234-5678").
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('521')) return digits.slice(3);
  if (digits.length === 12 && digits.startsWith('52')) return digits.slice(2);
  return digits;
}

export function validateDelivery(delivery: OrderDelivery): FieldErrors<OrderDelivery> {
  const errors: FieldErrors<OrderDelivery> = {};
  if (!isPostalCodeFormat(delivery.postalCode)) errors.postalCode = 'Escribe los 5 dígitos de tu código postal.';
  if (delivery.city.trim().length < 2) errors.city = 'Escribe tu ciudad o municipio.';
  if (delivery.street.trim().length < 3) errors.street = 'Escribe la calle y el número.';
  return errors;
}

export function validateContact(contact: OrderContact): FieldErrors<OrderContact> {
  const errors: FieldErrors<OrderContact> = {};
  if (contact.name.trim().length < 3) errors.name = 'Escribe tu nombre completo.';
  if (normalizePhone(contact.phone).length !== 10) errors.phone = 'Escribe los 10 dígitos de tu número.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) errors.email = 'Revisa tu correo electrónico.';
  return errors;
}

// "Guadalajara, Jalisco", but just "Ciudad de México" when city and state are the same name.
export function placeLabel(city: string, state?: string | null): string {
  const name = city.trim();
  if (!state) return name;
  return name && name.toLowerCase() !== state.toLowerCase() ? `${name}, ${state}` : state;
}

export function deliveryPlace(delivery: OrderDelivery): string {
  return placeLabel(delivery.city, stateForPostalCode(delivery.postalCode));
}

export function formatAmount(amount: number, currency = 'MXN'): string {
  return `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ${currency}`;
}

// The whole order as one WhatsApp message. It is the handoff when the order cannot be stored, so
// it has to stand on its own.
export function orderMessage(product: Product, draft: OrderDraft, pricing: OrderPricing, orderNumber?: string): string {
  const { delivery, contact } = draft;
  const address = [delivery.street.trim(), delivery.neighborhood.trim(), deliveryPlace(delivery), `C.P. ${delivery.postalCode}`]
    .filter(Boolean)
    .join(', ');
  const blocks = [
    [orderNumber ? `Hola, hice el pedido ${orderNumber} en camadepilates.com.` : 'Hola, quiero hacer este pedido de camadepilates.com:'],
    [
      `${pricing.quantity} × ${product.name} (${product.sku})`,
      hasUpholsteryChoice(product) ? `Tapicería: ${draft.upholstery}` : '',
      `Subtotal: ${formatAmount(pricing.subtotal, pricing.currency)}`,
    ],
    [
      `Entrega: ${address}`,
      `Lugar: ${delivery.placeType} · ${delivery.access}`,
      delivery.notes.trim() ? `Notas: ${delivery.notes.trim()}` : '',
    ],
    [
      `Nombre: ${contact.name.trim()}`,
      `Correo: ${contact.email.trim()}`,
      draft.invoiceRequired ? 'Necesito factura.' : '',
    ],
    ['Quedo en espera de la cotización de envío.'],
  ];
  return blocks.map((block) => block.filter(Boolean).join('\n')).join('\n\n');
}
