import type { Product } from './types';
import { event as gaEvent, beginCheckout as gaBegin, addToCart as gaAdd, viewItem as gaView, viewItemList as gaViewList } from '@/lib/analytics/ga';
import { track } from '@/lib/analytics/track';

const DEBUG = (import.meta as ImportMeta).env?.VITE_ANALYTICS_DEBUG === '1';

function safeDispatch(name: string, payload: Record<string, unknown>) {
  try {
    window.dispatchEvent(new CustomEvent('shop_analytics', { detail: { name, payload } }));
  } catch { /* noop */ }
}

// Rybbit takes flat properties only, so nested values (item lists) stay in GA4.
function flatProps(payload: Record<string, unknown>): Record<string, string | number | boolean> {
  const flat: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') flat[key] = value;
  }
  return flat;
}

function emit(name: string, payload: Record<string, unknown>) {
  if (DEBUG && typeof console !== 'undefined') console.log('[analytics]', name, payload);
  safeDispatch(name, payload);
  try { gaEvent(name, payload as Record<string, unknown>); } catch { /* noop */ }
  track(name, flatProps(payload));
}

export function viewItem(product: Product) {
  const data = {
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
  };
  try { gaView(data as unknown as Parameters<typeof gaView>[0]); } catch { /* noop */ }
  emit('view_item', data);
}

export function viewItemList(listName: string, items: Product[]) {
  const payload = {
    item_list_name: listName,
    item_count: items.length,
    items: items.map((p, index) => ({
      index,
      item_id: p.sku,
      item_name: p.name,
      price: Number(p.price),
      currency: p.currency,
      item_brand: p.brand,
    })),
  };
  try { gaViewList({ items: payload.items } as unknown as Parameters<typeof gaViewList>[0]); } catch { /* noop */ }
  emit('view_item_list', payload);
}

export function selectItem(product: Product, listName = 'shop') {
  emit('select_item', {
    item_list_name: listName,
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
  });
}

export function selectModel(payload: {
  model: 'casa' | 'profesional';
  product: Product;
  source: 'compare' | 'products' | 'shop';
}) {
  emit('select_model', {
    source: payload.source,
    model: payload.model,
    item_id: payload.product.sku,
    item_name: payload.product.name,
    price: Number(payload.product.price),
    currency: payload.product.currency,
    item_brand: payload.product.brand,
  });
}

export function beginCheckout(payload: { product?: Product; productId?: string }) {
  const p = payload.product;
  const data = p
    ? {
        item_id: p.sku,
        item_name: p.name,
        price: Number(p.price),
        currency: p.currency,
        item_brand: p.brand,
      }
    : { product_to_display: payload.productId };
  try {
    gaBegin(p ? { items: [{ item_id: p.sku, item_name: p.name, price: Number(p.price), currency: p.currency }] } : {});
  } catch { /* noop */ }
  emit('begin_checkout', data);
}

export function addToCart(product: Product) {
  const data = {
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
    quantity: 1,
  };
  try {
    gaAdd({ value: Number(product.price), currency: product.currency, items: [{ item_id: product.sku, item_name: product.name }] });
  } catch { /* noop */ }
  emit('add_to_cart', data);
}

// The order flow at /pedido. Every step reports when it is shown and when it is completed, so the
// funnel shows where buyers stop. No name, phone, email or address ever goes into these events.
export type OrderStep = 'producto' | 'entrega' | 'contacto';

function orderItem(product: Product, quantity: number, value: number) {
  return {
    item_id: product.sku,
    item_name: product.name,
    quantity,
    value,
    currency: product.currency,
  };
}

export function orderStepViewed(step: OrderStep, product: Product, quantity: number, value: number) {
  emit('order_step_view', { step, ...orderItem(product, quantity, value) });
}

export function orderStepCompleted(
  step: OrderStep,
  product: Product,
  quantity: number,
  value: number,
  detail: Record<string, string | boolean> = {},
) {
  emit('order_step_complete', { step, ...orderItem(product, quantity, value), ...detail });
}

export function orderFieldError(step: OrderStep, fields: string[]) {
  emit('order_field_error', { step, fields: fields.join(',') });
}

// `via` says how the order reached us: stored on the server, or handed to WhatsApp because storing failed.
export function orderSubmitted(product: Product, quantity: number, value: number, state: string, via: 'stored' | 'whatsapp') {
  emit('order_submitted', { ...orderItem(product, quantity, value), state, via });
}
