export function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return (import.meta as any).env?.VITE_SITE_URL || 'https://camadepilates.com';
}

export function canonicalUrl(pathname: string): string {
  const base = getOrigin().replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function toAbsoluteUrl(maybePath: string | undefined | null): string | undefined {
  if (!maybePath) return undefined;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  return canonicalUrl(maybePath);
}

export const DEFAULTS = {
  siteName: (import.meta as any).env?.VITE_SITE_NAME || 'CAMA Pilates',
  twitterSite: (import.meta as any).env?.VITE_TWITTER_SITE || '',
  ogImage: '/og/cama-de-pilates-venta-mexico.png',
  locale: 'es_MX'
};
