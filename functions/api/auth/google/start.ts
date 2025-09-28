interface Env {
  DB: D1Database;
  CONFIG_ENC_KEY?: string;
}

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;
const json = (data: Json, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });

async function ensureSchema(env: Env) {
  await env.DB.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)');
}

async function getVertexOauthClient(env: Env): Promise<{ clientId?: string; clientSecret?: string }>{
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>();
  if (!row?.value || !env.CONFIG_ENC_KEY) return {};
  try {
    const bin = Uint8Array.from(atob(row.value), c => c.charCodeAt(0));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
    const enc = new TextEncoder().encode(env.CONFIG_ENC_KEY);
    // @ts-ignore
    const hash = await crypto.subtle.digest('SHA-256', enc);
    // @ts-ignore
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    // @ts-ignore
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    const cfg = JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
    return { clientId: cfg.oauthClientId, clientSecret: cfg.oauthClientSecret };
  } catch { return {}; }
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const { clientId } = await getVertexOauthClient(env);
  if (!clientId) return json({ error: 'Missing OAuth clientId in settings' }, { status: 400 });

  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const state = crypto.getRandomValues(new Uint8Array(16));
  const stateHex = Array.from(state).map(b => b.toString(16).padStart(2, '0')).join('');
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/cloud-platform');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', stateHex);

  const headers = new Headers();
  headers.set('Set-Cookie', `gstate=${stateHex}; Path=/; HttpOnly; SameSite=Lax${url.protocol==='https:'?'; Secure':''}; Max-Age=600`);
  headers.set('Location', authUrl.toString());
  return new Response(null, { status: 302, headers });
};

