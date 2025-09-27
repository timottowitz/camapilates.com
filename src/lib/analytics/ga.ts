export const GA_ID = (import.meta as any).env?.VITE_GA_ID || 'G-RP5K1P8VKP';

declare global {
  interface Window { gtag?: (...args: any[]) => void }
}

export function pageview(path: string) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: path });
    }
  } catch { /* noop */ }
}

export function event(name: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  } catch { /* noop */ }
}

// Convenience wrappers for common ecommerce-style actions
export function beginCheckout(params?: Record<string, any>) {
  event('begin_checkout', params);
}

export function addToCart(params: { currency?: string; value?: number; items?: any[] }) {
  event('add_to_cart', params as any);
}

export function purchase(params: { transaction_id: string; value: number; currency?: string; items?: any[] }) {
  event('purchase', params as any);
}

export function viewItem(params: { item_id?: string; item_name?: string; value?: number; currency?: string; items?: any[] }) {
  event('view_item', params as any);
}

// Consent mode update helper (e.g., after user action)
export function setConsent(consent: Partial<{ ad_storage: string; analytics_storage: string; ad_user_data: string; ad_personalization: string }>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consent);
    }
  } catch { /* noop */ }
}
