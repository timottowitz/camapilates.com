export const onRequest: PagesFunction = async (ctx) => {
  const res = await ctx.next();
  const url = new URL(ctx.request.url);
  const headers = new Headers(res.headers);

  const set = (value: string) => headers.set('Cache-Control', value);

  if (url.pathname.startsWith('/assets/')) {
    set('public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/images/')) {
    // All versioned images (hashed names) may be cached long-term
    set('public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/og/')) {
    set('public, max-age=31536000, immutable');
  } else if (url.pathname.startsWith('/api/')) {
    // APIs should not be cached by the edge
    set('no-store');
  } else if (
    url.pathname === '/admin' || url.pathname.startsWith('/admin/')
  ) {
    // Avoid caching admin UI
    set('no-store');
  } else if (
    url.pathname.startsWith('/blog/') ||
    url.pathname.startsWith('/blog/category/') ||
    url.pathname.startsWith('/blog/tag/')
  ) {
    // Short browser TTL, long edge TTL semantics
    set('public, max-age=60, s-maxage=300, stale-while-revalidate=300');
  } else if (
    url.pathname === '/' ||
    url.pathname === '/products' || url.pathname === '/products/' ||
    url.pathname.startsWith('/product/') ||
    url.pathname === '/shop' || url.pathname === '/store' ||
    url.pathname.startsWith('/certificacion') ||
    url.pathname.startsWith('/cama-de-pilates') ||
    url.pathname.startsWith('/packs/') ||
    url.pathname.startsWith('/accesorios') ||
    url.pathname.startsWith('/acabados')
  ) {
    // Edge cache primary marketing routes and product pages
    set('public, max-age=60, s-maxage=300, stale-while-revalidate=300');
  } else if (url.pathname === '/sitemap.xml') {
    set('public, max-age=0, s-maxage=3600');
  }

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
