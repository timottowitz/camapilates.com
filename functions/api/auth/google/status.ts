interface Env {
  DB: D1Database;
  CONFIG_ENC_KEY?: string;
}

const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx;
  await env.DB.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)');
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_oauth_refresh').first<any>();
  return json({ connected: Boolean(row?.value) });
};

