interface Env {
  DB: D1Database;
  CONFIG_ENC_KEY?: string;
}

async function ensureSchema(env: Env) {
  await env.DB.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)');
}

async function getClient(env: Env): Promise<{ id?: string; secret?: string }>{
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>();
  if (!row?.value || !env.CONFIG_ENC_KEY) return {} as any;
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
    return { id: cfg.oauthClientId, secret: cfg.oauthClientSecret };
  } catch { return {} as any; }
}

async function saveRefreshToken(env: Env, refresh: string) {
  if (!env.CONFIG_ENC_KEY) throw new Error('Missing CONFIG_ENC_KEY');
  const encKey = new TextEncoder().encode(env.CONFIG_ENC_KEY);
  // @ts-ignore
  const hash = await crypto.subtle.digest('SHA-256', encKey);
  // @ts-ignore
  const aes = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // @ts-ignore
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(JSON.stringify({ refresh })));
  const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
  all.set(iv, 0); all.set(new Uint8Array(ct as ArrayBuffer), iv.length);
  const b64 = btoa(String.fromCharCode(...all));
  const ts = Math.floor(Date.now() / 1000);
  await ensureSchema(env);
  await env.DB.prepare('INSERT INTO app_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at')
    .bind('vertex_oauth_refresh', b64, ts).run();
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const cookie = request.headers.get('cookie') || '';
  const stateCookie = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('gstate='))?.split('=')[1];
  if (!code || !stateParam || stateParam !== stateCookie) {
    return new Response('Invalid state or code', { status: 400 });
  }
  const { id, secret } = await getClient(env);
  if (!id || !secret) return new Response('OAuth client not configured', { status: 400 });

  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const params = new URLSearchParams();
  params.set('code', code);
  params.set('client_id', id);
  params.set('client_secret', secret);
  params.set('redirect_uri', redirectUri);
  params.set('grant_type', 'authorization_code');

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: params
  });
  const body = await resp.json();
  if (!resp.ok) {
    return new Response(`Token exchange failed: ${resp.status} ${JSON.stringify(body)}`, { status: 400 });
  }
  const refresh = body.refresh_token;
  if (!refresh) {
    return new Response('No refresh_token returned. Ensure access_type=offline and prompt=consent.', { status: 400 });
  }
  await saveRefreshToken(env, refresh);
  const headers = new Headers();
  headers.set('Set-Cookie', `gstate=; Path=/; Max-Age=0`);
  headers.set('Location', '/admin/settings');
  return new Response(null, { status: 302, headers });
};

