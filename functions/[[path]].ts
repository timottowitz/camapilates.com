export const onRequest: PagesFunction = async (ctx) => {
  const res = await ctx.next();
  const url = new URL(ctx.request.url);
  const headers = new Headers(res.headers);

  const set = (value: string) => headers.set('Cache-Control', value);

  // Debug override to bypass caching when `?noCache=1` is present
  if (url.searchParams.get('noCache') === '1') {
    set('no-store');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }

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
    url.pathname.startsWith('/estudios-de-pilates')
  ) {
    // Studio directory routes: short browser TTL, revalidate at edge
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

  // SPA fallback: serve index.html on 404 for HTML navigations
  const accept = ctx.request.headers.get('Accept') || '';
  const isHtmlNav = ctx.request.method === 'GET' && accept.includes('text/html');
  const isAsset = url.pathname.startsWith('/assets/') || url.pathname.startsWith('/images/') || url.pathname.startsWith('/og/') || url.pathname.startsWith('/api/');
  if (res.status === 404 && isHtmlNav && !isAsset) {
    const indexResp = await fetch(new URL('/index.html', ctx.request.url));
    const ih = new Headers(indexResp.headers);
    ih.set('Cache-Control', headers.get('Cache-Control') || 'public, max-age=60, s-maxage=300, stale-while-revalidate=300');
    return new Response(indexResp.body, { status: 200, headers: ih });
  }

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
