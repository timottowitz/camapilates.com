import React from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

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
    return chosen || null;
  } catch {
    const envUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
    return envUrl || null;
  }
}

const url = resolveConvexUrl();
const client = url ? new ConvexReactClient(url) : null;

export const hasConvex = Boolean(client);

export const ConvexProviderMaybe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
};
