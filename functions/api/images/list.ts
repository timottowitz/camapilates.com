interface Env {
  DB: D1Database;
}

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;
const json = (data: Json, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });

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
  const { env } = ctx;
  await ensureSchema(env);
  const rows = await env.DB
    .prepare('SELECT slug, hero_url, updated_at FROM blog_images WHERE hero_url IS NOT NULL AND hero_url != "" ORDER BY updated_at DESC')
    .all<any>();
  const items = (rows?.results || []).map((r: any) => ({ slug: r.slug, hero_url: r.hero_url, updated_at: r.updated_at }));
  return json({ items });
};

