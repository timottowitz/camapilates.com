export function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return (import.meta as any).env?.VITE_SITE_URL || 'https://solarpanelfraud.org';
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
  siteName: (import.meta as any).env?.VITE_SITE_NAME || 'camadepilates.com',
  twitterSite: (import.meta as any).env?.VITE_TWITTER_SITE || '',
  ogImage: '/lovable-uploads/cafd9240-68ad-4e1e-a695-6a0ba14f9afe.png',
  locale: 'en_US'
};

