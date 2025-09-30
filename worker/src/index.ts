import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
  DB: D1Database;
  ADMIN_USER?: string;
  ADMIN_PASS?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  GITHUB_TOKEN?: string;
  // Optional config + image generation bindings
  CONFIG_ENC_KEY?: string;
  VERTEX_PROJECT_ID?: string;
  VERTEX_LOCATION?: string;
  VERTEX_MODEL_IMAGE?: string;
  VERTEX_ACCESS_TOKEN?: string;
  VERTEX_SA_EMAIL?: string;
  VERTEX_SA_PRIVATE_KEY?: string;
  IMAGES_PUBLIC_BASE?: string;
  IMAGES_R2?: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all routes
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'https://camadepilates.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Utility functions
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get('cookie') || ''
  return cookie.split(';')
    .map(s => s.trim())
    .find(s => s.startsWith(name + '='))
    ?.split('=')[1]
}

function setCookie(name: string, value: string, url: URL, maxAgeSec?: number, isLocalhost?: boolean): string {
  const attrs = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (maxAgeSec) attrs.push(`Max-Age=${maxAgeSec}`)
  // Don't set Secure flag for localhost development
  if (url.protocol === 'https:' && !isLocalhost) attrs.push('Secure')
  return attrs.join('; ')
}

// Database initialization
async function ensureSchema(env: Env) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      pass_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS blog_images (
      slug TEXT PRIMARY KEY,
      hero_url TEXT,
      sections_json TEXT,
      updated_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS blog_suggestions (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      keywords_json TEXT,
      source TEXT,
      status TEXT NOT NULL,
      created_at INTEGER
    )`
  ]

  for (const statement of statements) {
    await env.DB.prepare(statement).run()
  }
}

// Encryption helpers for settings (AES-GCM with CONFIG_ENC_KEY)
async function importAesKeyFromEnv(env: Env) {
  const encKey = env.CONFIG_ENC_KEY
  if (!encKey) return null
  const bytes = new TextEncoder().encode(encKey)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}
async function encryptJsonWithEnv(env: Env, obj: unknown): Promise<string | null> {
  const key = await importAesKeyFromEnv(env)
  if (!key) return null
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)))
  const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength)
  all.set(iv, 0)
  all.set(new Uint8Array(ct as ArrayBuffer), iv.length)
  return btoa(String.fromCharCode(...all))
}
async function decryptJsonWithEnv<T = any>(env: Env, b64: string): Promise<T | null> {
  try {
    const key = await importAesKeyFromEnv(env)
    if (!key) return null
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const iv = bin.slice(0, 12)
    const ct = bin.slice(12)
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)))
  } catch {
    return null
  }
}

async function seedIfEmpty(env: Env) {
  const { results } = await env.DB.prepare('SELECT COUNT(*) as n FROM users').all()
  const n = (results?.[0] as any)?.n || 0
  if (n === 0) {
    // Create default user with credentials: tim.ottowitz@gmail.com / Milzer1
    const salt = '04d50a51b292e28ad3c16c774a0c80fa'
    const pass_hash = '6c5e217b8d7a837de1868736ad3f5e000153853639126c9346f2222378ecfa0e'
    await env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)')
      .bind('tim.ottowitz@gmail.com', pass_hash, salt).run()
  }
}

// GitHub helpers
async function ghGetFile(env: Env, path: string): Promise<{ sha: string; content: string } | null> {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main'
  if (!repo || !token) return null
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' } })
  if (!resp.ok) return null
  const j: any = await resp.json()
  const content = j.content ? atob(j.content.replace(/\n/g, '')) : ''
  return { sha: j.sha, content }
}
async function ghPutFile(env: Env, path: string, content: string, message: string, sha?: string) {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main'
  if (!repo || !token) throw new Error('GitHub not configured')
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch, sha }
  const resp = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' }, body: JSON.stringify(body) })
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${await resp.text()}`)
}

// Routes

// Health check
app.get('/api/admin/health', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').all()
    const n = (results?.[0] as any)?.n || 0
    return c.json({ db: true, users: Number(n) })
  } catch (error) {
    return c.json({ db: false, users: 0, error: error.message }, 500)
  }
})

// Login
app.post('/api/admin/login', async (c) => {
  const url = new URL(c.req.url)
  const { username, password, captcha_token } = await c.req.json().catch(() => ({}))
  if (!username || !password) {
    return c.json({ error: 'username and password required' }, 400)
  }

  await seedIfEmpty(c.env)

  const row = await c.env.DB.prepare('SELECT id, username, pass_hash, salt FROM users WHERE username = ?')
    .bind(username).first<any>()
  if (!row) {
    console.log('User not found:', username)
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const hash = await sha256Hex(`${row.salt}:${password}`)
  console.log('Login attempt:', { username, providedHash: hash, storedHash: row.pass_hash, match: hash === row.pass_hash })
  if (hash !== row.pass_hash) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = randToken()
  const ttl = 60 * 60 * 24 // 1 day
  const expires = Math.floor(Date.now() / 1000) + ttl
  await c.env.DB.prepare('INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)')
    .bind(token, row.id, expires).run()

  // Always skip Secure flag for development (wrangler dev --remote runs on edge but is for dev)
  // Check if it's development by looking at the URL or environment
  const isDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || c.env.ENVIRONMENT === 'development'
  const cookieValue = setCookie('admint', token, url, ttl, isDevelopment)
  return c.json({ success: true, user: row.username }, 200, {
    'Set-Cookie': cookieValue
  })
})

// Session check
app.get('/api/admin/session', async (c) => {
  const token = getCookie(c.req.raw, 'admint')
  if (!token) {
    return c.json({ authenticated: false }, 401)
  }

  const row = await c.env.DB.prepare('SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?')
    .bind(token).first<any>()

  const now = Math.floor(Date.now() / 1000)
  if (!row || row.expires < now) {
    return c.json({ authenticated: false }, 401)
  }

  return c.json({ authenticated: true, user: row.username })
})

// Logout
app.post('/api/admin/logout', async (c) => {
  const url = new URL(c.req.url)
  const token = getCookie(c.req.raw, 'admint')
  if (token) {
    await ensureSchema(c.env).catch(() => {})
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run().catch(() => {})
  }

  // Always skip Secure flag for development
  const isDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || c.env.ENVIRONMENT === 'development'
  const cookieValue = setCookie('admint', 'deleted', url, 1, isDevelopment)
  return c.json({ success: true }, 200, {
    'Set-Cookie': cookieValue
  })
})

// Captcha endpoint
app.get('/api/admin/captcha', async (c) => {
  return c.json({ siteKey: null })
})

// Admin users management
app.get('/api/admin/users', async (c) => {
  await ensureSchema(c.env)
  const { results } = await c.env.DB.prepare('SELECT username FROM users ORDER BY username ASC').all<any>()
  const users = (results || []).map((r: any) => r.username)
  return c.json({ users })
})
app.post('/api/admin/users', async (c) => {
  await ensureSchema(c.env)
  const { username, password } = await c.req.json().catch(() => ({} as any))
  if (!username || !password || String(password).length < 8) return c.json({ error: 'username and password (min 8 chars) required' }, 400)
  const salt = randToken()
  const pass_hash = await sha256Hex(`${salt}:${password}`)
  try {
    await c.env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?1,?2,?3)')
      .bind(String(username), pass_hash, salt).run()
  } catch (e:any) {
    return c.json({ error: 'could_not_create' }, 400)
  }
  return c.json({ success: true })
})
app.delete('/api/admin/users/:username', async (c) => {
  await ensureSchema(c.env)
  const username = c.req.param('username')
  if (!username) return c.json({ error: 'username required' }, 400)
  await c.env.DB.prepare('DELETE FROM users WHERE username = ?1').bind(username).run()
  return c.json({ success: true })
})
app.get('/api/admin/sessions', async (c) => {
  await ensureSchema(c.env)
  const { results } = await c.env.DB.prepare('SELECT s.token, s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.expires DESC').all<any>()
  const items = (results || []).map((r: any) => ({ token: r.token, tokenShort: String(r.token).slice(0, 8), username: r.username, expires: Number(r.expires) }))
  return c.json({ items })
})
app.post('/api/admin/sessions/revoke', async (c) => {
  await ensureSchema(c.env)
  const { token } = await c.req.json().catch(() => ({} as any))
  if (!token) return c.json({ error: 'token required' }, 400)
  await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?1').bind(String(token)).run()
  return c.json({ success: true })
})
app.post('/api/admin/password', async (c) => {
  await ensureSchema(c.env)
  const cookieHeader = c.req.header('Cookie') || ''
  const token = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('admint='))?.split('=')[1]
  if (!token) return c.json({ error: 'unauthorized' }, 401)
  const row = await c.env.DB.prepare('SELECT u.id, u.username, u.pass_hash, u.salt FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?1').bind(token).first<any>()
  if (!row) return c.json({ error: 'unauthorized' }, 401)
  const body = await c.req.json().catch(() => ({} as any))
  const cur = String(body?.current_password || '')
  const next = String(body?.new_password || '')
  if (next.length < 8) return c.json({ error: 'new password too short' }, 400)
  const curHash = await sha256Hex(`${row.salt}:${cur}`)
  if (curHash !== row.pass_hash) return c.json({ error: 'invalid current password' }, 403)
  const newSalt = randToken()
  const newHash = await sha256Hex(`${newSalt}:${next}`)
  await c.env.DB.prepare('UPDATE users SET pass_hash=?1, salt=?2 WHERE id=?3').bind(newHash, newSalt, row.id).run()
  return c.json({ success: true })
})

// OAuth status placeholder (UI expects this)
app.get('/api/auth/google/status', async (c) => {
  return c.json({ connected: false })
})

// Initialize admin user
app.post('/api/admin/init', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}))
  if (!username || !password) {
    return c.json({ error: 'username and password required' }, 400)
  }

  const { results } = await c.env.DB.prepare('SELECT COUNT(*) as n FROM users').all()
  const n = (results?.[0] as any)?.n || 0
  if (n > 0) {
    return c.json({ error: 'Already initialized' }, 409)
  }

  const salt = randToken()
  const pass_hash = await sha256Hex(`${salt}:${password}`)
  await c.env.DB.prepare('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)')
    .bind(username, pass_hash, salt).run()

  return c.json({ success: true })
})

// Settings: Vertex config (store encrypted in D1)
app.get('/api/settings/vertex', async (c) => {
  await ensureSchema(c.env)
  try {
    const row = await c.env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>()
    if (!row?.value) return c.json({ configured: false })
    const cfg = await decryptJsonWithEnv(c.env, row.value)
    if (!cfg) return c.json({ configured: false, error: 'Decryption failed or missing CONFIG_ENC_KEY' })
    return c.json({ configured: true, ...cfg, hasPrivateKey: Boolean(cfg.serviceAccountPrivateKey) })
  } catch (e:any) {
    return c.json({ configured: false, error: e?.message || String(e) }, 500)
  }
})
app.post('/api/settings/vertex', async (c) => {
  await ensureSchema(c.env)
  const body = await c.req.json().catch(() => ({} as any))
  const cfg = {
    projectId: String(body.projectId || ''),
    location: String(body.location || 'us-central1'),
    model: String(body.model || 'imagegeneration@006'),
    serviceAccountEmail: body.serviceAccountEmail ? String(body.serviceAccountEmail) : undefined,
    serviceAccountPrivateKey: body.serviceAccountPrivateKey ? String(body.serviceAccountPrivateKey) : undefined,
    oauthClientId: body.oauthClientId ? String(body.oauthClientId) : undefined,
    oauthClientSecret: body.oauthClientSecret ? String(body.oauthClientSecret) : undefined,
  }
  if (!cfg.projectId) return c.json({ error: 'projectId required' }, 400)
  const enc = await encryptJsonWithEnv(c.env, cfg)
  if (!enc) return c.json({ error: 'CONFIG_ENC_KEY not set' }, 400)
  const ts = Math.floor(Date.now() / 1000)
  await c.env.DB.prepare('INSERT INTO app_settings (key, value, updated_at) VALUES (?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3')
    .bind('vertex_config', enc, ts).run()
  return c.json({ success: true })
})

// Blog API endpoints
app.get('/api/blog/status', async (c) => {
  const slug = c.req.query('slug')
  if (!slug) return c.json({ error: 'slug parameter required' }, 400)
  // Prefer checking research file existence at origin; fallback to DB state
  try {
    const u = new URL(c.req.url)
    const origin = `${u.protocol}//${u.host}`
    const head = await fetch(`${origin}/blog-planning/research/${encodeURIComponent(slug)}.md`, { method: 'HEAD' })
    const researchExists = head.ok
    if (researchExists) return c.json({ slug, researchExists, blogExists: false, qualityScore: null })
  } catch {}
  const { results } = await c.env.DB.prepare('SELECT * FROM blog_suggestions WHERE slug = ?').bind(slug).all()
  if (results && results.length > 0) {
    const s = results[0] as any
    return c.json({ slug: s.slug, status: s.status || 'pending', title: s.title, category: s.category, created_at: s.created_at })
  }
  return c.json({ slug, status: 'not_found', title: null, category: null, created_at: null })
})

app.get('/api/blog/suggestions', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM blog_suggestions ORDER BY created_at DESC LIMIT 50').all()

  return c.json({
    suggestions: results || [],
    items: results || []
  })
})

app.post('/api/blog/suggestions', async (c) => {
  const { title, slug, category, keywords, source } = await c.req.json().catch(() => ({}))

  if (!title || !slug) {
    return c.json({ error: 'title and slug required' }, 400)
  }

  const now = Math.floor(Date.now() / 1000)
  await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(slug, title, category, JSON.stringify(keywords || []), source || 'manual', 'pending', now).run()

  return c.json({ success: true, slug, status: 'created' })
})

// Blog Pipeline endpoints (lightweight queue placeholder)
app.post('/api/blog/pipeline', async (c) => {
  const body = await c.req.json().catch(() => ({} as any))
  const action = String(body?.action || '').toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  const queued: string[] = []
  await ensureSchema(c.env)

  if (action === 'trigger' && body?.slug) {
    const slug = String(body.slug)
    const title = body.title || slug.replace(/-/g, ' ')
    const category = body.category || 'General'
    const keywords = Array.isArray(body.keywords) ? body.keywords : []
    await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
      .bind(slug, title, category, JSON.stringify(keywords), 'admin_ui', 'queued', now).run()
    queued.push(slug)

    // If GitHub env configured, scaffold research file and update BLOG_TODO.md
    try {
      if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
        const researchPath = `blog-planning/research/${slug}.md`
        const todoPath = `blog-planning/BLOG_TODO.md`
        const existing = await ghGetFile(c.env, researchPath)
        if (!existing) {
          const content = `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n**Priority**: High\n\n## Objetivo\nReunir información mexicana y de calidad para desarrollar un artículo completo sobre ${title.toLowerCase()}.\n\n## Palabras clave y SEO\n- Primaria: ${title.split(' ').slice(0,2).join(' ')}\n\n## Estructura sugerida\n1) Resumen e intención de búsqueda\n2) Beneficios y precauciones (contexto mexicano)\n3) Desarrollo técnico y ejercicios\n4) Recomendaciones CAMA Pilates\n5) FAQ práctica\n`
          await ghPutFile(c.env, researchPath, content, `chore(research): scaffold ${slug}`)
        }
        const todo = await ghGetFile(c.env, todoPath)
        if (todo) {
          const lines = todo.content.split('\n')
          const hdr = `## CATEGORÍA: ${category}`
          let idx = lines.findIndex(l => l.startsWith('## CATEGORÍA:') && l.includes(category))
          if (idx === -1) { lines.push('', hdr, '') ; idx = lines.length - 2 }
          const block = [
            `### 🔬 ${title}`,
            `**Slug:** ${slug}`,
            `**Research File:** [${slug}](./research/${slug}.md)`,
            `**Keywords:** ${(keywords || []).join(', ')}`,
            ''
          ]
          let insertAt = idx + 1
          for (let i = idx + 1; i < lines.length; i++) { if (lines[i].startsWith('## CATEGORÍA:') || lines[i].trim() === '---') { insertAt = i; break } }
          lines.splice(insertAt, 0, ...block)
          await ghPutFile(c.env, todoPath, lines.join('\n'), `chore(todo): add ${slug}`, todo.sha)
        }
      }
    } catch (e) {
      console.log('pipeline/github error', (e as Error).message)
    }
  } else if (action === 'batch' && Array.isArray(body?.topics)) {
    for (const slugRaw of body.topics) {
      const slug = String(slugRaw)
      const title = slug.replace(/-/g, ' ')
      await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
        .bind(slug, title, 'General', JSON.stringify([]), 'admin_ui', 'queued', now).run()
      queued.push(slug)
    }
  } else {
    return c.json({ error: 'invalid_request' }, 400)
  }

  return c.json({ success: true, queued, message: `Queued ${queued.length} topic(s)` })
})

// Blog topics search (Reddit websearch)
app.post('/api/blog/topics/find', async (c) => {
  await ensureSchema(c.env)
  const { prompt, limit = 10, queries } = await c.req.json().catch(() => ({}))
  const seeds: string[] = Array.isArray(queries) && queries.length ? queries : ['pilates reformer', 'cama de pilates', 'reformer pilates', 'pilates mexico', 'pilates casa', 'precio reformer']
  const subs = ['pilates', 'fitness', 'flexibility', 'physicaltherapy']
  const pool: Array<{ title: string; url: string; score: number; num_comments: number }> = []

  for (const s of subs) {
    for (const q of seeds) {
      const u = new URL(`https://www.reddit.com/r/${s}/search.json`)
      u.searchParams.set('q', q)
      u.searchParams.set('restrict_sr', '1')
      u.searchParams.set('sort', 'top')
      u.searchParams.set('t', 'year')

      try {
        const resp = await fetch(u.toString(), { headers: { 'user-agent': 'CAMA-Pilates-TopicFinder/1.0' } })
        if (!resp.ok) continue
        const j: any = await resp.json()

        ;(j?.data?.children || []).forEach((child: any) => {
          const d = child?.data
          const title = String(d?.title || '').trim()
          if (!title || !/pilates|reformer|cama/i.test(title)) return
          pool.push({
            title,
            url: `https://reddit.com${d?.permalink || ''}`.replace(/\/$/, ''),
            score: Number(d?.score || 0),
            num_comments: Number(d?.num_comments || 0)
          })
        })
      } catch (e) {
        console.log('Reddit search error:', e)
      }
    }
  }

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\sáéíóúñü]/gi, '').trim()
  const seen = new Set<string>()
  const ranked = pool
    .sort((a, b) => (b.score + b.num_comments * 2) - (a.score + a.num_comments * 2))
    .filter(r => { const k = norm(r.title); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, Math.min(30, Math.max(3, Number(limit || 10))))

  const guessCategory = (t: string) => {
    const lc = t.toLowerCase()
    if (/vs|contra|comparativa/.test(lc)) return 'Comparativas'
    if (/precio|cost|comprar|guia/.test(lc)) return 'Guías de compra'
    if (/mantenimiento|cuidado|accesorio|equipo/.test(lc)) return 'Equipo y mantenimiento'
    if (/ejercicio|rutina|dolor|rehabilit|salud/.test(lc)) return 'Ejercicios y salud'
    return 'Estudio'
  }

  const toSlug = (t: string) => t.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '')

  const suggestions = ranked.map(r => {
    const title = /mexico|méxico/i.test(r.title) ? r.title : `${r.title} (México)`
    const slug = toSlug(title).slice(0, 80)
    const category = guessCategory(title)
    const keywords = Array.from(new Set(title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean))).slice(0, 5)
    return { slug, title, category, keywords, source: r.url }
  })

  // Persist to database
  const ts = Math.floor(Date.now() / 1000)
  for (const s of suggestions) {
    await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
      .bind(s.slug, s.title, s.category, JSON.stringify(s.keywords), s.source, 'in_review', ts).run()
  }

  return c.json({ suggestions })
})

// Accept suggestion
app.post('/api/blog/suggestions/accept', async (c) => {
  await ensureSchema(c.env)
  const { slug } = await c.req.json().catch(() => ({}))
  if (!slug) return c.json({ error: 'slug required' }, 400)

  await c.env.DB.prepare('UPDATE blog_suggestions SET status=?1 WHERE slug=?2').bind('accepted', slug).run()
  return c.json({ success: true })
})

// Decline suggestion
app.post('/api/blog/suggestions/decline', async (c) => {
  await ensureSchema(c.env)
  const { slug } = await c.req.json().catch(() => ({}))
  if (!slug) return c.json({ error: 'slug required' }, 400)

  await c.env.DB.prepare('UPDATE blog_suggestions SET status=?1 WHERE slug=?2').bind('declined', slug).run()
  return c.json({ success: true })
})

// Update topics
app.post('/api/blog/topics/update', async (c) => {
  const { slug, title, category, keywords } = await c.req.json().catch(() => ({}))
  if (!slug) return c.json({ error: 'slug required' }, 400)

  await ensureSchema(c.env)
  if (title || category || keywords) {
    const updates = []
    const values = []
    if (title) { updates.push('title=?'); values.push(title) }
    if (category) { updates.push('category=?'); values.push(category) }
    if (Array.isArray(keywords)) { updates.push('keywords_json=?'); values.push(JSON.stringify(keywords)) }

    if (updates.length > 0) {
      values.push(slug)
      await c.env.DB.prepare(`UPDATE blog_suggestions SET ${updates.join(', ')} WHERE slug=?`).bind(...values).run()
    }
  }

  return c.json({ success: true })
})

app.post('/api/blog/pipeline/trigger', async (c) => {
  const { slug, title, category, keywords } = await c.req.json().catch(() => ({}))
  if (!slug) return c.json({ error: 'slug required' }, 400)
  const now = Math.floor(Date.now() / 1000)
  await ensureSchema(c.env)
  await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
    .bind(String(slug), title || String(slug).replace(/-/g, ' '), category || 'General', JSON.stringify(Array.isArray(keywords) ? keywords : []), 'admin_ui', 'queued', now).run()
  try {
    if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
      const researchPath = `blog-planning/research/${slug}.md`
      const existing = await ghGetFile(c.env, researchPath)
      if (!existing) {
        await ghPutFile(c.env, researchPath, `# RESEARCH: ${title || slug.replace(/-/g, ' ')}\n\n**Status**: 🔬 Research needed\n`, `chore(research): scaffold ${slug}`)
      }
    }
  } catch (e) { console.log('pipeline/github error', (e as Error).message) }
  return c.json({ success: true, queued: [String(slug)] })
})

// Keyword storage API used by keywordManager.ts
app.post('/api/blog/keywords', async (c) => {
  await ensureSchema(c.env)
  // Simple key-value store under app_settings
  const body = await c.req.json().catch(() => ({} as any))
  const keywords = Array.isArray(body?.keywords) ? body.keywords : []
  const enc = await encryptJsonWithEnv(c.env, { keywords })
  const ts = Math.floor(Date.now() / 1000)
  await c.env.DB.prepare('INSERT INTO app_settings (key, value, updated_at) VALUES (?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3').bind('keywords_store', enc || JSON.stringify({ keywords }), ts).run()
  return c.json({ success: true, keywords })
})

// In-Worker simple pipeline runner: research scaffold + write blog via GitHub
function toSlug(s: string) {
  return s.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '')
}
function titleCase(s: string) { return s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()) }
function todayISO() { return new Date().toISOString().split('T')[0] }

function buildBlogMarkdown(meta: { title: string; description: string; category: string; tags: string[]; slug: string; publishDate?: string }) {
  const { title, description, category, tags, slug } = meta
  const publishDate = meta.publishDate || todayISO()
  const fm = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `category: "${category}"`,
    `tags: [${tags.slice(0,3).map(t => `"${t}"`).join(', ')}]`,
    `publishDate: "${publishDate}"`,
    'author: "CAMA Pilates"',
    `slug: "${slug}"`,
    'featured: false',
    '---',
    '',
    `# ${title}`,
    '',
    '> Nota: Contenido informativo; no es asesoramiento médico.',
    '',
    '## Resumen',
    `${description}`,
    '',
    '## Criterios clave para elegir',
    '- Seguridad y progresión adecuada',
    '- Adaptación al espacio y presupuesto',
    '- Calidad del equipo y soporte',
    '',
    '## Desarrollo y puntos clave',
    '### Beneficios y contexto mexicano',
    'En México, el interés por Pilates crece por su bajo impacto y mejoras en control postural.',
    '',
    '### Ejercicios y técnica',
    'Prioriza control, respiración y alineación. Trabaja con progresiones y evita dolor agudo.',
    '',
    '<see-also limit="3" />',
    '',
    '## Recomendaciones CAMA Pilates',
    'Nuestros Reformers ofrecen calidad premium con ingeniería y manufactura local, soporte y refacciones en México.',
    '',
    '<hub-list category="Guías de compra" limit="5" title="Más guías de compra" />',
    '',
    '## FAQ',
    '### ¿Cuál es la mejor opción para casa?',
    'Depende del espacio, nivel y presupuesto; busca estabilidad, ajustes y soporte local.',
    '',
    '### ¿Vale la pena invertir en calidad?',
    'Sí: mayor durabilidad, precisión en el movimiento y mejor experiencia a largo plazo.',
    ''
  ].join('\n')
  return fm
}

app.post('/api/blog/pipeline/run', async (c) => {
  await ensureSchema(c.env)
  const { slug: rawSlug } = await c.req.json().catch(() => ({} as any))
  const slug = toSlug(String(rawSlug || ''))
  if (!slug) return c.json({ error: 'slug required' }, 400)

  // Load suggestion (optional)
  const srow = await c.env.DB.prepare('SELECT title, category, keywords_json FROM blog_suggestions WHERE slug = ?1').bind(slug).first<any>()
  const title = srow?.title ? String(srow.title) : titleCase(slug)
  const category = srow?.category ? String(srow.category) : 'Estudio'
  let tags: string[] = []
  try { tags = JSON.parse(srow?.keywords_json || '[]') } catch {}
  if (tags.length === 0) tags = title.toLowerCase().split(/[^a-z0-9áéíóúñü]+/).filter(Boolean).slice(0,3)
  const description = `Guía práctica sobre ${title.toLowerCase()} en México: criterios, beneficios y recomendaciones.`

  // Ensure research file exists on GitHub
  if (c.env.GITHUB_REPO && c.env.GITHUB_TOKEN) {
    const researchPath = `blog-planning/research/${slug}.md`
    const existing = await ghGetFile(c.env, researchPath)
    if (!existing) {
      const content = `# RESEARCH: ${title}\n\n**Status**: 🔬 Research needed\n**Priority**: High\n\n## Objetivo\nReunir información mexicana y de calidad para desarrollar un artículo completo sobre ${title.toLowerCase()}.\n\n## Palabras clave y SEO\n- Primaria: ${tags[0] || title.split(' ')[0]}\n`
      await ghPutFile(c.env, researchPath, content, `chore(research): scaffold ${slug}`)
    }
  }

  // Build blog markdown and commit to GitHub
  if (!c.env.GITHUB_REPO || !c.env.GITHUB_TOKEN) return c.json({ error: 'GitHub not configured' }, 500)
  const blogPath = `src/content/blog/${slug}.md`
  const md = buildBlogMarkdown({ title, description, category, tags, slug })
  const existingBlog = await ghGetFile(c.env, blogPath)
  await ghPutFile(c.env, blogPath, md, existingBlog ? `feat(blog): update ${slug}` : `feat(blog): add ${slug}`, existingBlog?.sha)

  // Update BLOG_TODO.md status to ✅ if present
  try {
    const todo = await ghGetFile(c.env, 'blog-planning/BLOG_TODO.md')
    if (todo) {
      const lines = todo.content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(slug) && lines[i].includes('🔬')) { lines[i] = lines[i].replace('🔬', '✅'); break }
      }
      await ghPutFile(c.env, 'blog-planning/BLOG_TODO.md', lines.join('\n'), `chore(todo): mark ${slug} done`, todo.sha)
    }
  } catch {}

  // Mark in DB
  await c.env.DB.prepare('INSERT OR REPLACE INTO blog_suggestions (slug, title, category, keywords_json, source, status, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
    .bind(slug, title, category, JSON.stringify(tags), 'worker', 'completed', Math.floor(Date.now()/1000)).run()

  return c.json({ success: true, slug, committed: blogPath })
})

// Images API (port of Pages Functions → Hono Worker)
app.get('/api/images/list', async (c) => {
  await ensureSchema(c.env)
  const rows = await c.env.DB
    .prepare('SELECT slug, hero_url, updated_at FROM blog_images WHERE hero_url IS NOT NULL AND hero_url != "" ORDER BY updated_at DESC')
    .all<any>()
  const items = (rows?.results || []).map((r: any) => ({ slug: r.slug, hero_url: r.hero_url, updated_at: r.updated_at }))
  return c.json({ items })
})

app.all('/api/images/meta', async (c) => {
  await ensureSchema(c.env)
  const slug = c.req.query('slug') || ''
  if (c.req.method === 'GET') {
    if (!slug) return c.json({ error: 'slug required' }, 400)
    const row = await c.env.DB.prepare('SELECT slug, hero_url, sections_json, updated_at FROM blog_images WHERE slug = ?').bind(slug).first<any>()
    if (!row) return c.json({ slug, hero_url: null, sections: [] })
    let sections: unknown = []
    try { sections = JSON.parse(row.sections_json || '[]') } catch { sections = [] }
    return c.json({ slug: row.slug, hero_url: row.hero_url, sections, updated_at: row.updated_at })
  }
  if (c.req.method === 'POST') {
    const body = await c.req.json().catch(() => ({} as any))
    const s = String(body?.slug || slug || '')
    if (!s) return c.json({ error: 'slug required' }, 400)
    const sections_json = JSON.stringify(body?.sections || [])
    const updated_at = Math.floor(Date.now() / 1000)
    await c.env.DB.prepare('INSERT INTO blog_images (slug, hero_url, sections_json, updated_at) VALUES (?1,?2,?3,?4) ON CONFLICT(slug) DO UPDATE SET hero_url=excluded.hero_url, sections_json=excluded.sections_json, updated_at=excluded.updated_at')
      .bind(s, body?.hero_url || null, sections_json, updated_at).run()
    return c.json({ success: true })
  }
  return c.json({ error: 'Method Not Allowed' }, 405)
})

function trimWords(s: string, max = 70) {
  const words = s.trim().split(/\s+/)
  return words.length > max ? words.slice(0, max).join(' ') + '…' : s.trim()
}
function summarize(text: string, maxChars = 350) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars - 1) + '…' : cleaned
}
function buildNegativePrompt() {
  return [
    'texto, marca de agua, tipografia, logo, texto en la imagen',
    'arte de dibujos animados, CGI obvio, caricatura, 3D, render',
    'manos o dedos extra, anatomía incorrecta, deformaciones',
    'rostros distorsionados, desenfoque excesivo, ruido digital fuerte',
    'colores fluorescentes antinaturales, halos, aberración cromática',
  ].join(', ')
}
function buildHeroPrompt(headline: string, extra?: string) {
  return [
    `Fotografía hiperrealista 16:9 que ilustre: “${headline.trim()}”.`,
    'Ambientación mexicana auténtica (hogar o estudio moderno en México), luz natural cálida de mañana, detalles de madera y acero pulido.',
    'Muestra equipo de Pilates Reformer de alta gama (sin marcas visibles), tonos neutros y elegantes. Composición limpia con sujeto principal en primer tercio.',
    'Óptica: 50mm, f/2.8, ISO 200, velocidad 1/250; profundidad de campo suave, bokeh natural.',
    'Evita cualquier texto o marca en la imagen, sensación premium, realista y acogedora.',
    extra ? `Instrucciones adicionales: ${extra.trim()}` : ''
  ].filter(Boolean).join(' ')
}
function buildChapterPrompt(heading: string, summary: string) {
  return [
    `Fotografía hiperrealista 4:3 que represente el capítulo “${heading.trim()}”.`,
    `Contenido clave: ${trimWords(summary, 40)}.`,
    'Ambientación mexicana coherente con el artículo, iluminación natural, tono editorial premium.',
    'Si aplica, incluir discretamente un Reformer o accesorios de Pilates en contexto realista (sin logos).',
    'Óptica: 50mm o 35mm, f/2.8–4, estilo natural sin exageraciones, sin texto ni marcas.',
  ].join(' ')
}

async function loadVertexConfig(env: Env) {
  try {
    await ensureSchema(env)
    const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>()
    if (!row?.value) return {} as any
    const cfg = await decryptJsonWithEnv<any>(env, row.value)
    return cfg || {}
  } catch { return {} as any }
}
async function getAccessTokenFromSA(env: Env): Promise<string | null> {
  const sa = env.VERTEX_SA_EMAIL
  const keyPem = env.VERTEX_SA_PRIVATE_KEY
  if (!sa || !keyPem) return null
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = { iss: sa, sub: sa, aud: 'https://oauth2.googleapis.com/token', scope: 'https://www.googleapis.com/auth/cloud-platform', iat: now, exp: now + 3600 }
  const enc = (obj: any) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')
  const data = `${enc(header)}.${enc(payload)}`
  const pem = keyPem.replace(/\n/g, '\n')
  const keyData = pem.replace('-----BEGIN PRIVATE KEY-----','').replace('-----END PRIVATE KEY-----','').replace(/\s+/g,'')
  const der = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(data))
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')
  const jwt = `${data}.${sig}`
  const resp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) })
  if (!resp.ok) return null
  const tok: any = await resp.json()
  return tok.access_token || null
}

app.post('/api/images/generate', async (c) => {
  const body = await c.req.json().catch(() => ({} as any))
  const slug = String(body?.slug || '')
  const headline = String(body?.headline || '')
  if (!slug || !headline) return c.json({ error: 'slug and headline required' }, 400)

  // Merge config from DB into env
  const cfg = await loadVertexConfig(c.env)
  if (cfg?.serviceAccountEmail && cfg?.serviceAccountPrivateKey) {
    ;(c.env as any).VERTEX_SA_EMAIL = cfg.serviceAccountEmail
    ;(c.env as any).VERTEX_SA_PRIVATE_KEY = cfg.serviceAccountPrivateKey
  }
  const project = cfg?.projectId || c.env.VERTEX_PROJECT_ID
  const location = cfg?.location || c.env.VERTEX_LOCATION || 'us-central1'
  const model = cfg?.model || c.env.VERTEX_MODEL_IMAGE || 'imagegeneration@006'

  const limit = Math.max(2, Math.min(3, Number(body?.limit ?? 3)))
  const sections = Array.isArray(body?.sections) ? body.sections : []
  const chapters = sections.filter((s:any) => s?.heading && !/^FAQ\b/i.test(s.heading)).slice(0, limit)
  const heroPrompt = buildHeroPrompt(headline, body?.additionalPrompt)
  const chapterPrompts = chapters.map((ch:any) => ({ heading: ch.heading, summary: summarize(String(ch.text||'')), prompt: buildChapterPrompt(ch.heading, summarize(String(ch.text||''))) }))

  const shouldCallVertex = Boolean(project)
  const result: any = { success: true, usedVertex: false, hero: { prompt: heroPrompt }, chapters: chapterPrompts.map((p:any) => ({ ...p })) }
  if (body?.testOnly) {
    // Quick token check
    const token = await getAccessTokenFromSA(c.env)
    return c.json({ success: Boolean(token), usedVertex: Boolean(token), tested: true })
  }

  if (shouldCallVertex) {
    const getToken = async () => {
      if (c.env.VERTEX_ACCESS_TOKEN) return c.env.VERTEX_ACCESS_TOKEN
      const t = await getAccessTokenFromSA(c.env)
      if (t) (c.env as any).VERTEX_ACCESS_TOKEN = t
      return t
    }
    const access = await getToken()
    if (!access) return c.json({ error: 'Missing Vertex access (token or service account creds)' }, 400)
    const baseUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateImage`
    const gen = async (prompt: string, aspect: '16:9' | '4:3') => {
      const resp = await fetch(baseUrl, { method: 'POST', headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' }, body: JSON.stringify({ instances: [{ prompt, negativePrompt: buildNegativePrompt() }], parameters: { sampleCount: 1, aspectRatio: aspect } }) })
      if (!resp.ok) return { prompt, error: `Vertex error: ${resp.status} ${await resp.text()}` }
      const data: any = await resp.json()
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded || data?.images?.[0]?.bytesBase64Encoded
      if (!b64) return { prompt, error: 'No image in response' }
      return { prompt, b64, mime: 'image/png' }
    }
    const hero = await gen(heroPrompt, '16:9')
    result.hero = hero
    for (let i = 0; i < result.chapters.length; i++) {
      const r = await gen(result.chapters[i].prompt, '4:3')
      result.chapters[i] = { ...result.chapters[i], ...r }
    }
    result.usedVertex = true
  }

  // Optional store to R2
  const bucket = (c.env as any).IMAGES_R2 as R2Bucket | undefined
  const base = c.env.IMAGES_PUBLIC_BASE?.replace(/\/$/, '')
  if (bucket && base) {
    const folder = `blog/${slug}`
    const put = async (key: string, b64: string, mime = 'image/png') => {
      await bucket.put(key, Uint8Array.from(atob(b64), c => c.charCodeAt(0)), { httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' } })
      return `${base}/${key}`
    }
    if (result.hero?.b64) result.hero.url = await put(`${folder}/hero.png`, result.hero.b64, result.hero.mime)
    for (let i = 0; i < result.chapters.length; i++) {
      const cpt = result.chapters[i]
      if (cpt?.b64) (result.chapters[i] as any).url = await put(`${folder}/chapter-${i + 1}.png`, cpt.b64, cpt.mime)
    }
  }

  return c.json(result)
})

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'CAMA Pilates API',
    endpoints: [
      'GET /api/admin/health',
      'POST /api/admin/login',
      'GET /api/admin/session',
      'POST /api/admin/logout',
      'GET /api/admin/captcha',
      'POST /api/admin/init',
      'GET /api/settings/vertex',
      'POST /api/settings/vertex',
      'GET /api/blog/status',
      'GET /api/blog/suggestions',
      'POST /api/blog/suggestions',
      'GET /api/images/list',
      'GET/POST /api/images/meta',
      'POST /api/images/generate'
    ]
  })
})

export default app
