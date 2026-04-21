import React from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

function resolveConvexUrl(): string | null {
  try {
    const envUrl = (import.meta as any).env?.VITE_CONVEX_URL as string | undefined;
    if (!envUrl) return null;
    return new URL(envUrl).origin;
  } catch {
    return null;
  }
}

const url = resolveConvexUrl();
const client = url ? new ConvexReactClient(url) : null;

export const hasConvex = Boolean(client);

export const ConvexProviderMaybe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
};
