interface Env {
  DB: D1Database;
}

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;
const json = (data: Json, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
const bad = (m: string, s = 400) => json({ error: m }, { status: s });

async function ensureSchema(env: Env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS blog_images (
      slug TEXT PRIMARY KEY,
      hero_url TEXT,
      sections_json TEXT,
      updated_at INTEGER
    );
  `);
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || '';
  await ensureSchema(env);

  if (request.method === 'GET') {
    if (!slug) return bad('slug required');
    const row = await env.DB.prepare('SELECT slug, hero_url, sections_json, updated_at FROM blog_images WHERE slug = ?').bind(slug).first<any>();
    if (!row) return json({ slug, hero_url: null, sections: [] });
    let sections: unknown = [];
    try { sections = JSON.parse(row.sections_json || '[]'); } catch { sections = []; }
    return json({ slug: row.slug, hero_url: row.hero_url, sections, updated_at: row.updated_at });
  }

  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({} as any));
    const { slug: bodySlug, hero_url, sections } = body || {};
    const s = (bodySlug || slug || '').toString();
    if (!s) return bad('slug required');
    const sections_json = JSON.stringify(sections || []);
    const updated_at = Math.floor(Date.now() / 1000);
    await env.DB.prepare('INSERT INTO blog_images (slug, hero_url, sections_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET hero_url=excluded.hero_url, sections_json=excluded.sections_json, updated_at=excluded.updated_at')
      .bind(s, hero_url || null, sections_json, updated_at).run();
    return json({ success: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

