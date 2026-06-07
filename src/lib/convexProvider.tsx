import React from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

const PRODUCTION_CONVEX_URL = 'https://scintillating-hornet-482.convex.cloud';

function resolveConvexUrl(): string | null {
  const env = import.meta.env;

  try {
    const envUrl = env.VITE_CONVEX_URL;
    if (envUrl) return new URL(envUrl).origin;

    const host = window.location.hostname;
    const isHostedBuild = env.PROD || /camadepilates\.com$|pages\.dev$/i.test(host);
    return isHostedBuild ? PRODUCTION_CONVEX_URL : null;
  } catch {
    return env.PROD ? PRODUCTION_CONVEX_URL : null;
  }
}

const url = resolveConvexUrl();
const client = url ? new ConvexReactClient(url) : null;

export const hasConvex = Boolean(client);

export const ConvexProviderMaybe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
};
