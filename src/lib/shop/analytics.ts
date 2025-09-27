import type { Product } from './types';

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
}

export function viewItem(product: Product) {
  emit('view_item', {
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
  });
}

export function viewItemList(listName: string, items: Product[]) {
  emit('view_item_list', {
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
  });
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
  emit('begin_checkout', p
    ? {
        item_id: p.sku,
        item_name: p.name,
        price: Number(p.price),
        currency: p.currency,
        item_brand: p.brand,
      }
    : { product_to_display: payload.productId }
  );
}

export function addToCart(product: Product) {
  emit('add_to_cart', {
    item_id: product.sku,
    item_name: product.name,
    price: Number(product.price),
    currency: product.currency,
    item_brand: product.brand,
    quantity: 1,
  });
}

