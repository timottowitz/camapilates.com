import type { Product } from './types';
import { event as gaEvent, beginCheckout as gaBegin, addToCart as gaAdd, viewItem as gaView, viewItemList as gaViewList } from '@/lib/analytics/ga';

const DEBUG = (import.meta as any).env?.VITE_ANALYTICS_DEBUG === '1';

function safeDispatch(name: string, payload: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent('shop_analytics', { detail: { name, payload } }));
  } catch {
    // noop
  }
}

function emit(name: string, payload: Record<string, any>) {
  if (DEBUG && typeof console !== 'undefined') console.log('[analytics]', name, payload);
  safeDispatch(name, payload);
  try { gaEvent(name, payload); } catch {}
}

export function viewItem(product: Product) {
  const data = {
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
  };
  try { gaView(data as any); } catch {}
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
  try { gaViewList({ items: payload.items } as any); } catch {}
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
  try { gaBegin(p ? { items: [{ item_id: p.sku, item_name: p.name, price: Number(p.price), currency: p.currency }] } : {}); } catch {}
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
  try { gaAdd({ value: Number(product.price), currency: product.currency, items: [{ item_id: product.sku, item_name: product.name }] }); } catch {}
  emit('add_to_cart', data);
}
