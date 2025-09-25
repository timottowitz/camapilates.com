interface Env {
  SITE_URL?: string
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const origin = (env.SITE_URL || 'https://solarpanelfraud.org').replace(/\/$/, '');
    const sitemapUrl = `${origin}/sitemap.xml`;
    try {
      const resp = await fetch(sitemapUrl, { cf: { cacheEverything: true, cacheTtl: 3600 } });
      const xml = await resp.text();
      const urls: string[] = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
      // Limit to reasonable batch size
      const batch = urls.slice(0, 500);
      await Promise.allSettled(batch.map(u => fetch(u, { cf: { cacheEverything: true, cacheTtl: 86400 } })));
    } catch (e) {
      // noop — next run will try again
    }
  }
};

