import React from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

// Default production Convex URL to ensure live builds always connect
// when VITE_CONVEX_URL wasn't injected at build time.
const DEFAULT_PROD_CONVEX_URL = 'https://spotted-raven-102.convex.cloud';

function resolveConvexUrl(): string | null {
  try {
    const envUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
    const u = new URL(window.location.href);
    const qp = u.searchParams.get('convexUrl');
    if (qp) {
      // Persist override
      localStorage.setItem('convex_url', qp);
      // Clean the URL param
      u.searchParams.delete('convexUrl');
      window.history.replaceState({}, document.title, u.toString());
      return qp;
    }
    const ls = localStorage.getItem('convex_url') || '';
    const chosen = ls || envUrl || '';
    if (chosen) return chosen;
    // Ensure production (and previews) use the production Convex URL by default
    const isProdBuild = (import.meta as any).env?.PROD;
    const host = window.location.hostname || '';
    const isLiveHost = /camadepilates\.com$|pages\.dev$/i.test(host);
    if (isProdBuild || isLiveHost) return DEFAULT_PROD_CONVEX_URL;
    return null;
  } catch {
    const envUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
    // Fallback for SSR/unknown environments: prefer production URL in prod builds
    const isProdBuild = (import.meta as any).env?.PROD;
    return envUrl || (isProdBuild ? DEFAULT_PROD_CONVEX_URL : null);
  }
}

const url = resolveConvexUrl();
const client = url ? new ConvexReactClient(url) : null;

export const hasConvex = Boolean(client);

export const ConvexProviderMaybe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
};
