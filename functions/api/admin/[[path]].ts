interface Env {
  DB: D1Database;
  ADMIN_USER?: string;
  ADMIN_PASS?: string;
}

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

const json = (data: Json, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });

function bad(msg = 'Bad Request', code = 400) { return json({ error: msg }, { status: code }); }
function unauthorized(msg = 'Unauthorized') { return json({ error: msg }, { status: 401 }); }

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  // @ts-ignore
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest as ArrayBuffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randToken(): string {
  const bytes = new Uint8Array(16);
  // @ts-ignore
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function ensureSchema(env: Env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      pass_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires INTEGER NOT NULL
    );
  `);
}

async function seedIfEmpty(env: Env) {
  const { results } = await env.DB.prepare('SELECT COUNT(*) as n FROM users').all();
  const n = (results?.[0] as any)?.n || 0;
  if (n === 0 && env.ADMIN_USER && env.ADMIN_PASS) {
    const salt = randToken();
    const pass_hash = await sha256Hex(`${salt}:${env.ADMIN_PASS}`);
    await env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)')
      .bind(env.ADMIN_USER, pass_hash, salt).run();
  }
}

function cookie(name: string, value: string, url: URL, maxAgeSec?: number) {
  const attrs = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (maxAgeSec) attrs.push(`Max-Age=${maxAgeSec}`);
  if (url.protocol === 'https:') attrs.push('Secure');
  return attrs.join('; ');
}

async function handleLogin(request: Request, env: Env) {
  const url = new URL(request.url);
  const { username, password } = await request.json().catch(() => ({}));
  if (!username || !password) return bad('username and password required');

  await ensureSchema(env);
  await seedIfEmpty(env);

  const row = await env.DB.prepare('SELECT id, username, pass_hash, salt FROM users WHERE username = ?')
    .bind(username).first<any>();
  if (!row) return unauthorized('Invalid credentials');

  const hash = await sha256Hex(`${row.salt}:${password}`);
  if (hash !== row.pass_hash) return unauthorized('Invalid credentials');

  const token = randToken();
  const ttl = 60 * 60 * 24; // 1 day
  const expires = Math.floor(Date.now() / 1000) + ttl;
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)')
    .bind(token, row.id, expires).run();

  const headers = new Headers({ 'Set-Cookie': cookie('admint', token, url, ttl) });
  return new Response(JSON.stringify({ success: true, user: row.username }), { status: 200, headers: { 'content-type': 'application/json', ...Object.fromEntries(headers) } });
}

async function handleLogout(request: Request, env: Env) {
  const url = new URL(request.url);
  const token = (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith('admint='))?.split('=')[1];
  if (token) {
    await ensureSchema(env).catch(() => {});
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run().catch(() => {});
  }
  const headers = new Headers({ 'Set-Cookie': cookie('admint', 'deleted', url, 1) });
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json', ...Object.fromEntries(headers) } });
}

async function handleSession(request: Request, env: Env) {
  const token = (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith('admint='))?.split('=')[1];
  if (!token) return unauthorized();
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?')
    .bind(token).first<any>();
  const now = Math.floor(Date.now() / 1000);
  if (!row || row.expires < now) return unauthorized();
  return json({ authenticated: true, user: row.username });
}

async function handleInit(request: Request, env: Env) {
  const { username, password } = await request.json().catch(() => ({}));
  if (!username || !password) return bad('username and password required');
  await ensureSchema(env);
  const { results } = await env.DB.prepare('SELECT COUNT(*) as n FROM users').all();
  const n = (results?.[0] as any)?.n || 0;
  if (n > 0) return bad('Already initialized', 409);
  const salt = randToken();
  const pass_hash = await sha256Hex(`${salt}:${password}`);
  await env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)')
    .bind(username, pass_hash, salt).run();
  return json({ success: true });
}

async function handleHealth(_request: Request, env: Env) {
  try {
    await ensureSchema(env);
    const { results } = await env.DB.prepare('SELECT COUNT(*) as n FROM users').all();
    const n = (results?.[0] as any)?.n || 0;
    return json({ db: true, users: Number(n) });
  } catch {
    return json({ db: false, users: 0 });
  }
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/api\/admin\/?/, '');

  try {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

    if (pathname === '' || pathname === '/') {
      return json({ ok: true, endpoints: ['POST /login', 'POST /logout', 'GET /session', 'POST /init'] });
    }
    if (pathname === 'login' && request.method === 'POST') return handleLogin(request, env);
    if (pathname === 'logout' && request.method === 'POST') return handleLogout(request, env);
    if (pathname === 'session' && request.method === 'GET') return handleSession(request, env);
    if (pathname === 'init' && request.method === 'POST') return handleInit(request, env);
    if (pathname === 'health' && request.method === 'GET') return handleHealth(request, env);

    return new Response('Not Found', { status: 404 });
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, { status: 500 });
  }
};
