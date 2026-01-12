import type { Product } from './types';
import { event as gaEvent, beginCheckout as gaBegin, addToCart as gaAdd, viewItem as gaView, viewItemList as gaViewList } from '@/lib/analytics/ga';

const DEBUG = (import.meta as ImportMeta).env?.VITE_ANALYTICS_DEBUG === '1';

function safeDispatch(name: string, payload: Record<string, unknown>) {
  try {
    window.dispatchEvent(new CustomEvent('shop_analytics', { detail: { name, payload } }));
  } catch { /* noop */ }
}

function emit(name: string, payload: Record<string, unknown>) {
  if (DEBUG && typeof console !== 'undefined') console.log('[analytics]', name, payload);
  safeDispatch(name, payload);
  try { gaEvent(name, payload as Record<string, unknown>); } catch { /* noop */ }
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
