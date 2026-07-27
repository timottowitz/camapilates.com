import routeMeta from '@/content/route-meta.json';

/**
 * Title and description for the static landing pages, shared by the page components
 * and scripts/static-prerender.cjs.
 *
 * These pages used to declare their own head tags and nothing else, so the prerenderer
 * could not emit them and they fell back to index.html's generic title and description
 * for anything that does not run JS. Prerendering them from a copy of the strings would
 * have created a second source that drifts — the same defect that put percent-encoded
 * canonicals and homepage canonicals on every page — so both sides read this file.
 *
 * Titles are stored fully rendered, suffix included, because the pages did not agree on
 * whether to append the site name.
 */
export type RouteMeta = { title: string; description: string };

const META = routeMeta as Record<string, RouteMeta>;

export function getRouteMeta(path: string): RouteMeta | undefined {
  return META[path];
}

/**
 * Throws at build time rather than silently rendering an empty title if a route is
 * renamed without updating route-meta.json.
 */
export function requireRouteMeta(path: string): RouteMeta {
  const meta = META[path];
  if (!meta) throw new Error(`No route metadata for "${path}" — add it to src/content/route-meta.json`);
  return meta;
}

export const ROUTE_META = META;
