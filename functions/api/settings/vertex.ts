interface Env {
  DB: D1Database;
  CONFIG_ENC_KEY?: string; // 32+ chars secret for AES key derivation
}

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;
const json = (data: Json, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
const bad = (m: string, s = 400) => json({ error: m }, { status: s });

type VertexConfig = {
  projectId: string;
  location: string;
  model: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string; // PEM
  oauthClientId?: string;
  oauthClientSecret?: string; // stored encrypted
};

async function ensureSchema(env: Env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    );
  `);
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(secret);
  // Deterministic 32-byte key via SHA-256 of secret
  // @ts-ignore
  const hashBuf = await crypto.subtle.digest('SHA-256', enc);
  // @ts-ignore
  const key = await crypto.subtle.importKey('raw', hashBuf, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return key;
}

async function encryptJson(secret: string, obj: unknown): Promise<string> {
  const key = await deriveAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  // @ts-ignore
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const buff = new Uint8Array(iv.length + (ctBuf as ArrayBuffer).byteLength);
  buff.set(iv, 0);
  buff.set(new Uint8Array(ctBuf as ArrayBuffer), iv.length);
  return btoa(String.fromCharCode(...buff));
}

async function decryptJson(secret: string, b64: string): Promise<any | null> {
  try {
    const key = await deriveAesKey(secret);
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
    // @ts-ignore
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
  } catch {
    return null;
  }
}

async function getConfig(env: Env): Promise<{ config: VertexConfig | null, exists: boolean }>{
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>();
  if (!row || !row.value) return { config: null, exists: false };
  const secret = env.CONFIG_ENC_KEY || '';
  if (!secret) return { config: null, exists: true };
  const obj = await decryptJson(secret, row.value);
  return { config: obj, exists: true };
}

async function setConfig(env: Env, cfg: VertexConfig): Promise<void> {
  if (!env.CONFIG_ENC_KEY) throw new Error('CONFIG_ENC_KEY not set');
  const value = await encryptJson(env.CONFIG_ENC_KEY, cfg);
  const ts = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO app_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at')
    .bind('vertex_config', value, ts).run();
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  if (request.method === 'GET') {
    const { config, exists } = await getConfig(env);
    if (!exists) return json({ configured: false });
    if (!config) return json({ configured: false, error: env.CONFIG_ENC_KEY ? 'Decryption failed' : 'Missing CONFIG_ENC_KEY' });
    return json({
      configured: true,
      projectId: config.projectId,
      location: config.location,
      model: config.model,
      serviceAccountEmail: config.serviceAccountEmail || null,
      hasPrivateKey: Boolean(config.serviceAccountPrivateKey)
    });
  }

  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
  const cfg: VertexConfig = {
    projectId: String(body.projectId || ''),
    location: String(body.location || 'us-central1'),
    model: String(body.model || 'imagegeneration@006'),
    serviceAccountEmail: body.serviceAccountEmail ? String(body.serviceAccountEmail) : undefined,
    serviceAccountPrivateKey: body.serviceAccountPrivateKey ? String(body.serviceAccountPrivateKey) : undefined,
    oauthClientId: body.oauthClientId ? String(body.oauthClientId) : undefined,
    oauthClientSecret: body.oauthClientSecret ? String(body.oauthClientSecret) : undefined,
  };
    if (!cfg.projectId) return bad('projectId required');
    if (!env.CONFIG_ENC_KEY) return bad('Server missing CONFIG_ENC_KEY', 500);
    await setConfig(env, cfg);
    return json({ success: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
};
