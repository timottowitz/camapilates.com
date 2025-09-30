import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();
// CORS only for blog endpoints if needed; keep admin endpoints same-origin only
app.use('/api/blog/*', cors());

// Ensure tables
async function ensureSchema(db: D1Database) {
  // Run lightweight create-if-not-exists
  await db.exec(`CREATE TABLE IF NOT EXISTS blog_suggestions (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    keywords_json TEXT,
    source TEXT,
    status TEXT NOT NULL,
    created_at INTEGER
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS blog_quality (
    slug TEXT PRIMARY KEY,
    overall_score INTEGER,
    words INTEGER,
    has_h1 INTEGER,
    has_faq INTEGER,
    has_seealso INTEGER,
    has_hublist INTEGER,
    updated_at INTEGER
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    pass_hash TEXT NOT NULL,
    salt TEXT NOT NULL
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires INTEGER NOT NULL
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    count INTEGER,
    window_start INTEGER
  );`);
}

// Helpers
function okJson<T>(data: T, init?: ResponseInit) {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
}
function badJson(msg: string, code = 400) { return okJson({ error: msg }, { status: code }); }

// GitHub helpers
async function ghGetFile(env: Env, path: string): Promise<{ sha: string; content: string } | null> {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !token) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' } });
  if (!resp.ok) return null;
  const j: any = await resp.json();
  const content = j.content ? atob(j.content.replace(/\n/g, '')) : '';
  return { sha: j.sha, content };
}
async function ghPutFile(env: Env, path: string, content: string, message: string, sha?: string) {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !token) throw new Error('GitHub not configured');
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
    sha,
  };
  const resp = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' }, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${await resp.text()}`);
}
async function triggerBuild(env: Env) {
  if (!env.BUILD_HOOK_URL) return;
  try { await fetch(env.BUILD_HOOK_URL, { method: 'POST' }); } catch {}
}

// Content scaffolds
function scaffoldResearch(title: string, category: string) {
  return `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n**Priority**: High\n**Target Blog Date**: TBD\n**Estimated Research Time**: 2-4 hours\n\n## Objetivo\nReunir información mexicana y de calidad para desarrollar un artículo completo sobre ${title.toLowerCase()}.\n\n## Palabras clave y SEO\n- Primaria: ${title.split(' ').slice(0,2).join(' ')}\n- Secundarias: \n- Long-tail: \n\n## Estructura sugerida\n1) Resumen e intención de búsqueda\n2) Beneficios y precauciones (contexto mexicano)\n3) Desarrollo técnico y ejercicios\n4) Recomendaciones CAMA Pilates\n5) FAQ práctica\n\n## Plan de shortcodes\n- <see-also limit=\"3\" /> tras la primera sección\n- <hub-list category=\"${category}\" limit=\"5\" title=\"Más contenidos relacionados\" /> al final\n\n## Plan de imágenes\n- Hero: ${title.toLowerCase()} en contexto mexicano (estudio o hogar)\n- 2 imágenes contextuales en secciones clave\n\n## Fuentes y referencias (añadir URL y citas)\n- [Pendiente: investigación web]\n`;
}

// Routes
const r = new Hono<{ Bindings: Env }>();

// Find topics (Reddit)
r.post('/topics/find', async (c) => {
  await ensureSchema(c.env.DB);
  const { prompt, limit = 10, queries } = await c.req.json().catch(() => ({}));
  const seeds: string[] = Array.isArray(queries) && queries.length ? queries : ['pilates reformer', 'cama de pilates', 'reformer pilates', 'pilates mexico', 'pilates casa', 'precio reformer'];
  const subs = ['pilates', 'fitness', 'flexibility', 'physicaltherapy'];
  const pool: Array<{ title: string; url: string; score: number; num_comments: number }> = [];
  for (const s of subs) {
    for (const q of seeds) {
      const u = new URL(`https://www.reddit.com/r/${s}/search.json`);
      u.searchParams.set('q', q); u.searchParams.set('restrict_sr', '1'); u.searchParams.set('sort', 'top'); u.searchParams.set('t', 'year');
      const resp = await fetch(u.toString(), { headers: { 'user-agent': 'CAMA-Pilates-TopicFinder/1.0' } });
      if (!resp.ok) continue;
      const j: any = await resp.json();
      (j?.data?.children || []).forEach((child: any) => {
        const d = child?.data;
        const title = String(d?.title || '').trim();
        if (!title || !/pilates|reformer|cama/i.test(title)) return;
        pool.push({ title, url: `https://reddit.com${d?.permalink || ''}`.replace(/\/$/, ''), score: Number(d?.score || 0), num_comments: Number(d?.num_comments || 0) });
      });
    }
  }
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\sáéíóúñü]/gi, '').trim();
  const seen = new Set<string>();
  const ranked = pool
    .sort((a, b) => (b.score + b.num_comments * 2) - (a.score + a.num_comments * 2))
    .filter(r => { const k = norm(r.title); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, Math.min(30, Math.max(3, Number(limit || 10))));
  const guessCategory = (t: string) => {
    const lc = t.toLowerCase();
    if (/vs|contra|comparativa/.test(lc)) return 'Comparativas';
    if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra';
    if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento';
    if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud';
    return 'Estudio';
  };
  const toSlug = (t: string) => t.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
  const suggestions = ranked.map(r => {
    const title = /mexico|méxico/i.test(r.title) ? r.title : `${r.title} (México)`;
    const slug = toSlug(title).slice(0, 80);
    const category = guessCategory(title);
    const keywords = Array.from(new Set(title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean))).slice(0, 5);
    return { slug, title, category, keywords, source: r.url };
  });
  // Persist
  const ts = Math.floor(Date.now() / 1000);
  const stmt = await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)');
  for (const s of suggestions) {
    await stmt.bind(s.slug, s.title, s.category, JSON.stringify(s.keywords), s.source, 'in_review', ts).run();
  }
  return okJson({ suggestions });
});

// List suggestions
r.get('/suggestions', async (c) => {
  await ensureSchema(c.env.DB);
  const { results } = await c.env.DB.prepare('SELECT slug, title, category, keywords_json, source, status, created_at FROM blog_suggestions ORDER BY created_at DESC LIMIT 100').all();
  const items = (results || []).map((r: any) => ({ slug: r.slug, title: r.title, category: r.category, keywords: JSON.parse(r.keywords_json || '[]'), source: r.source, status: r.status, created_at: r.created_at }));
  return okJson({ items });
});

// Decline suggestion
r.post('/suggestions/decline', async (c) => {
  const { slug } = await c.req.json().catch(() => ({}));
  if (!slug) return badJson('slug required');
  await c.env.DB.prepare('UPDATE blog_suggestions SET status=?1 WHERE slug=?2').bind('declined', slug).run();
  return okJson({ success: true });
});

// Accept suggestion: update BLOG_TODO.md and create research file via GitHub
r.post('/suggestions/accept', async (c) => {
  await ensureSchema(c.env.DB);
  const { slug } = await c.req.json().catch(() => ({}));
  if (!slug) return badJson('slug required');
  // Load suggestion
  const row = await c.env.DB.prepare('SELECT title, category, keywords_json FROM blog_suggestions WHERE slug=?1').bind(slug).first<any>();
  if (!row) return badJson('not found', 404);
  const title = row.title as string; const category = row.category as string; const keywords: string[] = JSON.parse(row.keywords_json || '[]');

  // Fetch BLOG_TODO.md from GitHub
  const todoPath = 'blog-planning/BLOG_TODO.md';
  const gh = await ghGetFile(c.env, todoPath);
  if (!gh) return badJson('GitHub not configured', 500);
  const lines = gh.content.split('\n');

  // Check duplicate
  if (lines.some(l => l.includes(`./research/${slug}.md`))) {
    await c.env.DB.prepare('UPDATE blog_suggestions SET status=?1 WHERE slug=?2').bind('accepted', slug).run();
    return okJson({ success: true, message: 'Topic already exists' });
  }

  // Insert block under category
  const categoryHeader = `## CATEGORÍA: ${category}`;
  const newEntry = `\n### 🔬 ${title}\n**Research File:** [${slug}.md](./research/${slug}.md)\n**Target:** Público general interesado en Pilates\n**Keywords:** ${keywords.join(', ')}\n`;
  let insertIdx = -1; let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## CATEGORÍA:') && lines[i].includes(category)) {
      found = true;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('## CATEGORÍA:') || lines[j].trim() === '---') { insertIdx = j; break; }
      }
      if (insertIdx === -1) insertIdx = lines.length; break;
    }
  }
  if (!found) {
    const end = lines.findIndex(l => l.trim() === '---');
    const at = end === -1 ? lines.length : end;
    lines.splice(at, 0, '', categoryHeader, newEntry);
  } else {
    lines.splice(insertIdx, 0, newEntry);
  }
  const newTodo = lines.join('\n');
  await ghPutFile(c.env, todoPath, newTodo, `feat(blog): add topic ${slug}`, gh.sha);

  // Create research file
  const researchPath = `blog-planning/research/${slug}.md`;
  const rf = await ghGetFile(c.env, researchPath);
  if (!rf) {
    const scaffold = scaffoldResearch(title, category);
    await ghPutFile(c.env, researchPath, scaffold, `feat(blog): scaffold research ${slug}`);
  }

  await triggerBuild(c.env);
  await c.env.DB.prepare('UPDATE blog_suggestions SET status=?1 WHERE slug=?2').bind('accepted', slug).run();
  return okJson({ success: true, slug });
});

// Update topic block in BLOG_TODO.md
r.post('/topics/update', async (c) => {
  const { slug, title, category, keywords, target } = await c.req.json().catch(() => ({}));
  if (!slug) return badJson('slug required');
  const gh = await ghGetFile(c.env, 'blog-planning/BLOG_TODO.md');
  if (!gh) return badJson('GitHub not configured', 500);
  const lines = gh.content.split('\n');
  // Find block by research link
  let rfIdx = lines.findIndex(l => /\*\*Research File:\*\*/i.test(l) && l.includes(`./research/${slug}.md`));
  if (rfIdx === -1) return badJson('topic not found', 404);
  let start = rfIdx; for (let i = rfIdx; i >= 0; i--) { if (/^###\s+/.test(lines[i])) { start = i; break; } }
  let end = lines.length; for (let i = rfIdx + 1; i < lines.length; i++) { if (/^###\s+/.test(lines[i]) || /^##\s+CATEGOR[ÍI]A:/.test(lines[i]) || /^---$/.test(lines[i])) { end = i; break; } }
  const block = lines.slice(start, end);
  const head = block[0] || '';
  const m = head.match(/^(###\s+)([🔬📝✅🚫])\s+(.+)$/);
  const statusSym = m ? m[2] : '🔬';
  if (title) block[0] = `${m ? m[1] : '### '}${statusSym} ${title}`;
  for (let i = 1; i < block.length; i++) {
    if (target && /^\*\*Target:\*\*/i.test(block[i])) block[i] = `**Target:** ${target}`;
    if (Array.isArray(keywords) && /^\*\*Keywords:\*\*/i.test(block[i])) block[i] = `**Keywords:** ${keywords.join(', ')}`;
  }
  // Replace current block
  lines.splice(start, end - start, ...block);
  if (category) {
    // Move block to new category
    const blk = lines.splice(start, block.length);
    const hdr = `## CATEGORÍA: ${category}`;
    let catIdx = lines.findIndex(l => l.startsWith('## CATEGORÍA:') && l.includes(category));
    if (catIdx === -1) {
      let ins = lines.findIndex(l => l.trim() === '---'); if (ins === -1) ins = lines.length; lines.splice(ins, 0, '', hdr); catIdx = ins + 1;
    }
    let insertAt = catIdx + 1; for (let i = catIdx + 1; i < lines.length; i++) { if (lines[i].startsWith('## CATEGORÍA:') || lines[i].trim() === '---') { insertAt = i; break; } }
    lines.splice(insertAt, 0, ...blk);
  }
  await ghPutFile(c.env, 'blog-planning/BLOG_TODO.md', lines.join('\n'), `chore(blog): update topic ${slug}`, gh.sha);
  await triggerBuild(c.env);
  return okJson({ success: true });
});

// Status endpoint used by Admin UI for queued tooltip
r.get('/status', async (c) => {
  await ensureSchema(c.env.DB);
  const slug = c.req.query('slug') || '';
  if (!slug) return badJson('slug required');
  // Check via GitHub for research/blog presence (best-effort)
  let researchExists = false; let blogExists = false;
  try { researchExists = !!(await ghGetFile(c.env, `blog-planning/research/${slug}.md`)); } catch {}
  try { blogExists = !!(await ghGetFile(c.env, `src/content/blog/${slug}.md`)); } catch {}
  let qualityScore: number | null = null;
  try {
    const row = await c.env.DB.prepare('SELECT overall_score FROM blog_quality WHERE slug=?1').bind(slug).first<any>();
    if (row && typeof row.overall_score === 'number') qualityScore = row.overall_score;
  } catch {}
  return okJson({ slug, researchExists, blogExists, qualityScore });
});

// Pipeline trigger (enqueue job)
r.post('/pipeline/trigger', async (c) => {
  const { slug, title, category, keywords } = await c.req.json().catch(() => ({}));
  if (!slug) return badJson('slug required');
  await c.env.PIPELINE.send({ slug, title, category, keywords, stage: 'web_research' });
  await c.env.PIPELINE.send({ slug, title, category, keywords, stage: 'write_blog' });
  await c.env.PIPELINE.send({ slug, title, category, keywords, stage: 'seo' });
  await c.env.PIPELINE.send({ slug, title, category, keywords, stage: 'quality' });
  return okJson({ success: true });
});

// Mount under /api/blog
app.route('/api/blog', r);

// =========================
// Admin auth (D1 based)
// =========================
function parseCookie(cookie: string | null, name: string): string | null {
  if (!cookie) return null;
  const parts = cookie.split(';').map(s => s.trim());
  const entry = parts.find(p => p.startsWith(name + '='));
  return entry ? entry.substring(name.length + 1) : null;
}
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function randToken(len = 16): string {
  const u = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');
}

const admin = new Hono<{ Bindings: Env }>();

admin.get('/health', async (c) => {
  try {
    await ensureSchema(c.env.DB);
    const row = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<any>();
    return okJson({ db: true, users: Number(row?.n || 0) });
  } catch {
    return okJson({ db: false, users: 0 });
  }
});

admin.get('/session', async (c) => {
  await ensureSchema(c.env.DB);
  const token = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (!token) return okJson({ authenticated: false }, { status: 401 });
  const row = await c.env.DB.prepare('SELECT s.expires, u.username FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?1').bind(token).first<any>();
  if (!row) return okJson({ authenticated: false }, { status: 401 });
  if (Number(row.expires) < Math.floor(Date.now() / 1000)) return okJson({ authenticated: false }, { status: 401 });
  return okJson({ authenticated: true, user: row.username });
});

admin.post('/login', async (c) => {
  await ensureSchema(c.env.DB);
  const { username, password, captcha_token } = await c.req.json().catch(() => ({}));
  if (!username || !password) return badJson('username and password required');
  // Turnstile verification (if secret configured)
  const secret = (c.env as any).TURNSTILE_SECRET;
  if (secret) {
    try {
      const form = new FormData();
      form.append('secret', secret);
      form.append('response', String(captcha_token || ''));
      form.append('remoteip', c.req.header('CF-Connecting-IP') || '');
      const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
      const jr: any = await resp.json();
      if (!jr?.success) return badJson('captcha_failed', 403);
    } catch {
      return badJson('captcha_error', 403);
    }
  }
  // Rate limit by IP (5 attempts / 10 minutes)
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const now = Math.floor(Date.now() / 1000);
  const la = await c.env.DB.prepare('SELECT count, window_start FROM login_attempts WHERE ip=?1').bind(ip).first<any>();
  if (la) {
    const within = now - Number(la.window_start) < 600; // 10 min window
    const cnt = Number(la.count || 0);
    if (within && cnt >= 5) return badJson('Too many attempts, try later', 429);
  }
  // Optional: dev auto-init when no users and flag set
  const devAuto = String((c.env as any).ADMIN_DEV_AUTO_INIT || '').toLowerCase() === 'true';
  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<any>();
  const count = Number(countRow?.n || 0);
  if (count === 0 && devAuto) {
    const saltInit = randToken(16);
    const pass_init = await sha256Hex(`${saltInit}:${password}`);
    await c.env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?1,?2,?3)').bind(username, pass_init, saltInit).run();
  }
  const user = await c.env.DB.prepare('SELECT id, pass_hash, salt FROM users WHERE username=?1').bind(username).first<any>();
  const bad = async () => {
    // update attempts
    if (!la || now - Number(la.window_start) >= 600) {
      await c.env.DB.prepare('INSERT OR REPLACE INTO login_attempts (ip, count, window_start) VALUES (?1,?2,?3)').bind(ip, 1, now).run();
    } else {
      await c.env.DB.prepare('UPDATE login_attempts SET count=?1 WHERE ip=?2').bind(Number(la.count || 0) + 1, ip).run();
    }
    return badJson('Invalid credentials', 401);
  };
  if (!user) return bad();
  const hash = await sha256Hex(`${user.salt}:${password}`);
  if (hash !== user.pass_hash) return bad();
  // clear attempts on success
  await c.env.DB.prepare('DELETE FROM login_attempts WHERE ip=?1').bind(ip).run();
  const token = randToken(16);
  const expires = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days
  await c.env.DB.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?1,?2,?3)').bind(token, user.id, expires).run();
  const headers = new Headers();
  const secure = new URL(c.req.url).protocol === 'https:';
  headers.set('Set-Cookie', `admint=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${86400 * 7}${secure ? '; Secure' : ''}`);
  return okJson({ authenticated: true, user: username }, { headers });
});

admin.post('/logout', async (c) => {
  await ensureSchema(c.env.DB);
  const token = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token=?1').bind(token).run();
  const headers = new Headers();
  const secure = new URL(c.req.url).protocol === 'https:';
  headers.set('Set-Cookie', `admint=deleted; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
  return okJson({ success: true }, { headers });
});

// One-time init: create first admin (best practice) using ADMIN_INIT_TOKEN
admin.post('/init', async (c) => {
  await ensureSchema(c.env.DB);
  const { token, username, password } = await c.req.json().catch(() => ({}));
  if (!token || token !== (c.env as any).ADMIN_INIT_TOKEN) return badJson('forbidden', 403);
  if (!username || !password) return badJson('username/password required');
  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<any>();
  const count = Number(countRow?.n || 0);
  if (count > 0) return badJson('already initialized', 400);
  const salt = randToken(16);
  const pass_hash = await sha256Hex(`${salt}:${password}`);
  await c.env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?1,?2,?3)').bind(username, pass_hash, salt).run();
  return okJson({ success: true });
});

// Admin Users management
admin.get('/users', async (c) => {
  await ensureSchema(c.env.DB);
  const list = await c.env.DB.prepare('SELECT username FROM users ORDER BY username').all<any>();
  return okJson({ users: (list.results || []).map((r:any) => r.username) });
});
admin.post('/users', async (c) => {
  await ensureSchema(c.env.DB);
  // Require session
  const token = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (!token) return badJson('unauthorized', 401);
  const sess = await c.env.DB.prepare('SELECT s.user_id, s.expires FROM sessions s WHERE s.token=?1').bind(token).first<any>();
  if (!sess || Number(sess.expires) < Math.floor(Date.now() / 1000)) return badJson('unauthorized', 401);
  const { username, password } = await c.req.json().catch(() => ({}));
  if (!username || !password) return badJson('username/password required');
  if (String(password).length < 8) return badJson('password too short', 400);
  const salt = randToken(16);
  const pass_hash = await sha256Hex(`${salt}:${password}`);
  try {
    await c.env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?1,?2,?3)').bind(username, pass_hash, salt).run();
  } catch (e) {
    return badJson('username exists', 400);
  }
  return okJson({ success: true });
});
admin.delete('/users/:username', async (c) => {
  await ensureSchema(c.env.DB);
  const token = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (!token) return badJson('unauthorized', 401);
  const sess = await c.env.DB.prepare('SELECT s.user_id, u.username FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?1').bind(token).first<any>();
  if (!sess) return badJson('unauthorized', 401);
  const username = c.req.param('username');
  if (!username) return badJson('username required', 400);
  if (username === sess.username) return badJson('cannot delete self', 400);
  // Ensure at least one user remains
  const row = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').first<any>();
  if (Number(row?.n || 0) <= 1) return badJson('cannot delete last user', 400);
  await c.env.DB.prepare('DELETE FROM users WHERE username=?1').bind(username).run();
  return okJson({ success: true });
});
admin.get('/sessions', async (c) => {
  await ensureSchema(c.env.DB);
  const rows = await c.env.DB.prepare('SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id=s.user_id ORDER BY s.expires DESC').all<any>();
  const items = (rows.results || []).map((r:any) => ({ token: r.token, tokenShort: String(r.token).slice(0,8)+'…', username: r.username, expires: r.expires }));
  return okJson({ items });
});
admin.post('/sessions/revoke', async (c) => {
  await ensureSchema(c.env.DB);
  const auth = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (!auth) return badJson('unauthorized', 401);
  const { token } = await c.req.json().catch(()=>({}));
  if (!token) return badJson('token required', 400);
  await c.env.DB.prepare('DELETE FROM sessions WHERE token=?1').bind(token).run();
  return okJson({ success: true });
});

admin.post('/password', async (c) => {
  await ensureSchema(c.env.DB);
  const token = parseCookie(c.req.header('Cookie') || null, 'admint');
  if (!token) return badJson('unauthorized', 401);
  const sess = await c.env.DB.prepare('SELECT s.user_id, s.expires, u.username, u.pass_hash, u.salt FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?1').bind(token).first<any>();
  if (!sess || Number(sess.expires) < Math.floor(Date.now() / 1000)) return badJson('unauthorized', 401);
  const { current_password, new_password } = await c.req.json().catch(() => ({}));
  if (!current_password || !new_password) return badJson('missing fields');
  if (String(new_password).length < 8) return badJson('password too short', 400);
  const currHash = await sha256Hex(`${sess.salt}:${current_password}`);
  if (currHash !== sess.pass_hash) return badJson('invalid current password', 400);
  const newSalt = randToken(16);
  const newHash = await sha256Hex(`${newSalt}:${new_password}`);
  await c.env.DB.prepare('UPDATE users SET pass_hash=?1, salt=?2 WHERE id=?3').bind(newHash, newSalt, sess.user_id).run();
  return okJson({ success: true });
});

app.route('/api/admin', admin);

export default app;
