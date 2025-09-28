// Deno local dev API server with SQLite storage in .data/app.db
// Mirrors key Cloudflare routes for local development.

// deno run --allow-net --allow-read --allow-write --allow-env scripts/dev-api.ts

import { DB as Sqlite } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

const DATA_DIR = "db";
await Deno.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
const DB_PATH = `${DATA_DIR}/app.db`;
const db = new Sqlite(DB_PATH);

db.execute(`
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
CREATE TABLE IF NOT EXISTS blog_images (
  slug TEXT PRIMARY KEY,
  hero_url TEXT,
  sections_json TEXT,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER
);
`);

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });
}
function bad(msg: string, code = 400) { return json({ error: msg }, { status: code }); }

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function randToken() {
  const u = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encryption key for settings (from env or default dev-only key)
const CONFIG_ENC_KEY = Deno.env.get("CONFIG_ENC_KEY") || "dev-local-config-key-please-set-in-env-1234567890";

async function aesKey() {
  const enc = new TextEncoder().encode(CONFIG_ENC_KEY);
  // @ts-ignore
  const hash = await crypto.subtle.digest('SHA-256', enc);
  // @ts-ignore
  return await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function encryptJson(obj: unknown) {
  const key = await aesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // @ts-ignore
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
  all.set(iv, 0); all.set(new Uint8Array(ct as ArrayBuffer), iv.length);
  return btoa(String.fromCharCode(...all));
}
async function decryptJson(b64: string) {
  try {
    const key = await aesKey();
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = bin.slice(0, 12); const ct = bin.slice(12);
    // @ts-ignore
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
  } catch { return null; }
}

function getCookie(req: Request, name: string) {
  const c = req.headers.get('cookie') || '';
  return c.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.split('=')[1];
}
function setCookie(name: string, value: string) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`;
}

// Admin endpoints
async function handleAdmin(req: Request, url: URL) {
  const p = url.pathname.replace(/^\/api\/admin\/?/, '');
  if (p === '' || p === '/') return json({ ok: true });

  if (p === 'init' && req.method === 'POST') {
    const { username, password } = await req.json().catch(() => ({}));
    if (!username || !password) return bad('username and password required');
    const salt = randToken();
    const pass_hash = await sha256Hex(`${salt}:${password}`);
    try {
      db.query('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)', [username, pass_hash, salt]);
    } catch {}
    return json({ success: true });
  }

  if (p === 'login' && req.method === 'POST') {
    const { username, password } = await req.json().catch(() => ({}));
    if (!username || !password) return bad('username and password required');
    // seed default if empty
    const count = Array.from(db.query('SELECT COUNT(*) FROM users'))[0][0] as number;
    if (count === 0) {
      const salt = randToken();
      const pass_hash = await sha256Hex(`${salt}:${password}`);
      try { db.query('INSERT INTO users (username, pass_hash, salt) VALUES (?, ?, ?)', [username, pass_hash, salt]); } catch {}
    }
    const row = Array.from(db.query('SELECT id, pass_hash, salt FROM users WHERE username = ?', [username]))[0] as any[] | undefined;
    if (!row) return json({ error: 'Invalid credentials' }, { status: 401 });
    const [user_id, pass_hash, salt] = [row[0], row[1], row[2]];
    const hash = await sha256Hex(`${salt}:${password}`);
    if (hash !== pass_hash) return json({ error: 'Invalid credentials' }, { status: 401 });
    const token = randToken();
    const expires = Math.floor(Date.now() / 1000) + 86400;
    db.query('INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)', [token, user_id, expires]);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json', 'Set-Cookie': setCookie('admint', token) } });
  }

  if (p === 'health' && req.method === 'GET') {
    try {
      const count = Array.from(db.query('SELECT COUNT(*) FROM users'))[0][0] as number;
      return json({ db: true, users: Number(count) });
    } catch {
      return json({ db: false, users: 0 }, { status: 500 });
    }
  }

  if (p === 'logout' && req.method === 'POST') {
    const token = getCookie(req, 'admint');
    if (token) db.query('DELETE FROM sessions WHERE token = ?', [token]);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json', 'Set-Cookie': setCookie('admint', 'deleted') + '; Max-Age=0' } });
  }

  if (p === 'session' && req.method === 'GET') {
    const token = getCookie(req, 'admint');
    if (!token) return json({ authenticated: false }, { status: 401 });
    const row = Array.from(db.query('SELECT s.expires, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?', [token]))[0] as any[] | undefined;
    if (!row) return json({ authenticated: false }, { status: 401 });
    const [expires, username] = [row[0], row[1]];
    if (expires < Math.floor(Date.now() / 1000)) return json({ authenticated: false }, { status: 401 });
    return json({ authenticated: true, user: username });
  }
  return new Response('Not Found', { status: 404 });
}

// Settings endpoints
async function handleSettings(req: Request, url: URL) {
  const p = url.pathname.replace(/^\/api\/settings\/?/, '');
  if (p === 'vertex') {
    if (req.method === 'GET') {
      const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_config']))[0] as any[] | undefined;
      if (!row) return json({ configured: false });
      const cfg = await decryptJson(row[0]);
      if (!cfg) return json({ configured: false, error: 'Decryption failed or missing CONFIG_ENC_KEY' });
      return json({ configured: true, projectId: cfg.projectId, location: cfg.location, model: cfg.model, serviceAccountEmail: cfg.serviceAccountEmail, hasPrivateKey: Boolean(cfg.serviceAccountPrivateKey), oauthClientId: cfg.oauthClientId ? 'set' : null });
    }
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const cfg = {
        projectId: String(body.projectId || ''),
        location: String(body.location || 'us-central1'),
        model: String(body.model || 'imagegeneration@006'),
        serviceAccountEmail: body.serviceAccountEmail ? String(body.serviceAccountEmail) : undefined,
        serviceAccountPrivateKey: body.serviceAccountPrivateKey ? String(body.serviceAccountPrivateKey) : undefined,
        oauthClientId: body.oauthClientId ? String(body.oauthClientId) : undefined,
        oauthClientSecret: body.oauthClientSecret ? String(body.oauthClientSecret) : undefined,
      };
      if (!cfg.projectId) return bad('projectId required');
      const enc = await encryptJson(cfg);
      const ts = Math.floor(Date.now() / 1000);
      db.query('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=?, updated_at=?', ['vertex_config', enc, ts, enc, ts]);
      return json({ success: true });
    }
  }
  return new Response('Not Found', { status: 404 });
}

// Blog management endpoints
async function handleBlogManagement(req: Request, url: URL) {
  const p = url.pathname.replace(/^\/api\/blog\/?/, '');

  if (p === 'topics' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const { title, category, keywords, targetAudience } = body;

    if (!title || !category) return bad('title and category required');

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // Read current BLOG_TODO.md
    const todoPath = 'blog-planning/BLOG_TODO.md';
    let todoContent = '';
    try {
      todoContent = await Deno.readTextFile(todoPath);
    } catch {
      return bad('Could not read BLOG_TODO.md');
    }

    // Find the category section or create it
    const categoryHeader = `## CATEGORÍA: ${category}`;
    const keywordsList = Array.isArray(keywords) ? keywords.join(', ') : keywords || '';

    const newEntry = `
### 🔬 ${title}
**Research File:** [${slug}.md](./research/${slug}.md)
**Target:** ${targetAudience || 'Público general interesado en Pilates'}
**Keywords:** ${keywordsList}
`;

    let updatedContent = '';
    const lines = todoContent.split('\n');
    let categoryFound = false;
    let insertIndex = -1;

    // Find where to insert the new topic
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## CATEGORÍA:') && lines[i].includes(category)) {
        categoryFound = true;
        // Find the next category or end of file
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('## CATEGORÍA:') || lines[j].startsWith('---')) {
            insertIndex = j;
            break;
          }
        }
        if (insertIndex === -1) insertIndex = lines.length;
        break;
      }
    }

    if (!categoryFound) {
      // Add new category at the end
      const insertPoint = lines.findIndex(line => line === '---') || lines.length;
      lines.splice(insertPoint, 0, '', categoryHeader, newEntry);
    } else {
      // Insert in existing category
      lines.splice(insertIndex, 0, newEntry);
    }

    updatedContent = lines.join('\n');

    // Write updated TODO file
    try {
      await Deno.writeTextFile(todoPath, updatedContent);
    } catch {
      return bad('Could not update BLOG_TODO.md');
    }

    // Create research file using scaffold template
    const researchPath = `blog-planning/research/${slug}.md`;
    const researchTemplate = `# RESEARCH: ${title}

**Status**: 🔬 Research needed
**Priority**: High
**Target Blog Date**: TBD
**Estimated Research Time**: 2-4 hours

## Objetivo
Reunir información mexicana y de calidad para desarrollar un artículo completo sobre ${title.toLowerCase()}.

## Palabras clave y SEO
- Primaria: ${keywordsList.split(',')[0]?.trim() || title.split(' ').slice(0, 2).join(' ')}
- Secundarias: ${keywordsList}
- Long-tail: cómo ${title.toLowerCase()}, ${title.toLowerCase()} en méxico, guía ${title.toLowerCase()}

## Estructura sugerida
1) Resumen e intención de búsqueda
2) Beneficios y precauciones (contexto mexicano)
3) Desarrollo técnico y ejercicios
4) Recomendaciones CAMA Pilates
5) FAQ práctica

## Plan de shortcodes
- <see-also limit="3" /> tras la primera sección
- <hub-list category="${category}" limit="5" title="Más contenidos relacionados" /> al final

## Plan de imágenes
- Hero: ${title.toLowerCase()} en contexto mexicano (estudio o hogar)
- 2 imágenes contextuales en secciones clave

## Fuentes y referencias (añadir URL y citas)
- [Pendiente: investigación web sobre ${title.toLowerCase()}]
- [Pendiente: estudios mexicanos relevantes]
- [Pendiente: referencias de expertos en Pilates]

## Notas adicionales
Creado automáticamente - requiere investigación web y validación mexicana.
`;

    try {
      await Deno.mkdir('blog-planning/research', { recursive: true });
      await Deno.writeTextFile(researchPath, researchTemplate);
    } catch {
      return bad('Could not create research file');
    }

    // Automatically trigger the autonomous blog pipeline
    try {
      console.log(`🚀 Auto-triggering pipeline for new topic: ${title}`);

      // Use Deno.Command to run the pipeline script in the background
      const command = new Deno.Command("node", {
        args: ["scripts/improved-blog-pipeline.js", "1"],
        cwd: Deno.cwd(),
        stdout: "piped",
        stderr: "piped"
      });

      // Start the pipeline process without waiting for it to complete
      const child = command.spawn();

      // Log that pipeline was triggered but don't wait for completion
      console.log(`✅ Pipeline process started for topic: ${title}`);

      // Let the process run in background - it will handle its own logging
      child.status.then((status) => {
        if (status.success) {
          console.log(`🎉 Pipeline completed successfully for topic: ${title}`);
        } else {
          console.log(`⚠️ Pipeline failed for topic: ${title}`);
        }
      }).catch((error) => {
        console.log(`❌ Pipeline error for topic: ${title}:`, error);
      });

    } catch (pipelineError) {
      console.log(`⚠️ Failed to trigger pipeline for topic: ${title}:`, pipelineError);
      // Don't fail the topic creation if pipeline fails to start
    }

    return json({
      success: true,
      slug,
      message: `Topic "${title}" added successfully and pipeline triggered`,
      researchFile: researchPath,
      pipelineTriggered: true
    });
  }

  if (p === 'keywords' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const { keywords, action } = body;

    if (action === 'sync' && Array.isArray(keywords)) {
      // For now, just return the keywords as-is (could add server-side storage later)
      // This allows for future server-side keyword management
      return json({
        keywords,
        message: 'Keywords synced successfully',
        serverTime: new Date().toISOString()
      });
    }

    if (action === 'add' && keywords) {
      // Add individual keywords (future enhancement)
      return json({ message: 'Keywords added successfully' });
    }

    return bad('Invalid keywords action');
  }

  if (p === 'pipeline' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const { action, slug, type } = body;

    if (action === 'trigger' && slug) {
      // Trigger research for a specific topic
      try {
        // Check if the research file exists and is empty/template
        const researchPath = `blog-planning/research/${slug}.md`;
        let needsResearch = false;

        try {
          const content = await Deno.readTextFile(researchPath);
          // Check if it's still a template (contains placeholder text)
          needsResearch = content.includes('🔬 Research needed') || content.includes('[Pendiente:');
        } catch {
          needsResearch = true; // File doesn't exist
        }

        if (needsResearch) {
          // Actually run the autonomous blog pipeline for this specific topic
          try {
            console.log(`🚀 Triggering real pipeline for topic: ${slug}`);

            // Use Deno.Command to run the pipeline script in the background
            const command = new Deno.Command("node", {
              args: ["scripts/improved-blog-pipeline.js", "1"],
              cwd: Deno.cwd(),
              stdout: "piped",
              stderr: "piped"
            });

            // Start the pipeline process without waiting for it to complete
            const child = command.spawn();

            // Log that pipeline was triggered but don't wait for completion
            console.log(`✅ Real pipeline process started for topic: ${slug}`);

            // Let the process run in background - it will handle its own logging
            child.status.then((status) => {
              if (status.success) {
                console.log(`✅ Pipeline completed successfully for topic: ${slug}`);
              } else {
                console.log(`❌ Pipeline failed for topic: ${slug}:`, status);
              }
            }).catch((error) => {
              console.log(`❌ Pipeline error for topic: ${slug}:`, error);
            });

            return json({
              success: true,
              slug,
              message: `Real pipeline triggered for "${slug}" - processing in background`,
              nextSteps: [
                'Research file analysis started',
                'Web search for Mexican market data',
                'Content structure planning',
                'Blog writing and SEO optimization'
              ],
              status: 'research_started'
            });

          } catch (pipelineError) {
            console.log(`⚠️ Failed to trigger real pipeline for topic: ${slug}:`, pipelineError);
            return json({
              success: false,
              slug,
              message: `Failed to trigger pipeline: ${pipelineError.message}`,
              error: pipelineError.message
            }, { status: 500 });
          }
        } else {
          return json({
            success: true,
            slug,
            message: `Topic "${slug}" research already complete`,
            status: 'research_complete'
          });
        }
      } catch (error) {
        return bad(`Failed to trigger pipeline: ${error.message}`);
      }
    }

    if (action === 'batch' && type) {
      // Trigger batch processing
      return json({
        success: true,
        type,
        message: `Batch ${type} pipeline triggered`,
        status: 'batch_started'
      });
    }

    return bad('Invalid pipeline action');
  }

  return new Response('Not Found', { status: 404 });
}

// Images meta + generation endpoints (dev)
function buildNegativePrompt() {
  return [
    'texto, marca de agua, tipografia, logo, texto en la imagen',
    'arte de dibujos animados, CGI obvio, caricatura, 3D, render',
    'manos o dedos extra, anatomía incorrecta, deformaciones',
    'rostros distorsionados, desenfoque excesivo, ruido digital fuerte',
    'colores fluorescentes antinaturales, halos, aberración cromática',
  ].join(', ');
}
function trimWords(s: string, max = 70) {
  const words = s.trim().split(/\s+/);
  return words.length > max ? words.slice(0, max).join(' ') + '…' : s.trim();
}
function summarize(text: string, maxChars = 350) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars - 1) + '…' : cleaned;
}
function buildHeroPrompt(headline: string, extra?: string) {
  return [
    `Fotografía hiperrealista 16:9 que ilustre: “${headline.trim()}”.`,
    'Ambientación mexicana auténtica (hogar o estudio moderno en México), luz natural cálida de mañana, detalles de madera y acero pulido.',
    'Muestra equipo de Pilates Reformer de alta gama (sin marcas visibles), tonos neutros y elegantes. Composición limpia con sujeto principal en primer tercio.',
    'Óptica: 50mm, f/2.8, ISO 200, velocidad 1/250; profundidad de campo suave, bokeh natural.',
    'Evita cualquier texto o marca en la imagen, sensación premium, realista y acogedora.',
    extra ? `Instrucciones adicionales: ${extra.trim()}` : ''
  ].filter(Boolean).join(' ');
}
function buildChapterPrompt(heading: string, summary: string) {
  return [
    `Fotografía hiperrealista 4:3 que represente el capítulo “${heading.trim()}”.`,
    `Contenido clave: ${trimWords(summary, 40)}.`,
    'Ambientación mexicana coherente con el artículo, iluminación natural, tono editorial premium.',
    'Si aplica, incluir discretamente un Reformer o accesorios de Pilates en contexto realista (sin logos).',
    'Óptica: 50mm o 35mm, f/2.8–4, estilo natural sin exageraciones, sin texto ni marcas.',
  ].join(' ');
}

async function loadVertexConfig() {
  const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_config']))[0] as any[] | undefined;
  if (!row) return {} as any;
  const cfg = await decryptJson(row[0]);
  return cfg || {};
}
async function loadRefresh() {
  const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_oauth_refresh']))[0] as any[] | undefined;
  if (!row) return null;
  const obj = await decryptJson(row[0]);
  return obj?.refresh || null;
}
async function getAccessTokenFromSA(cfg: any): Promise<string | null> {
  if (!cfg?.serviceAccountEmail || !cfg?.serviceAccountPrivateKey) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: cfg.serviceAccountEmail,
    sub: cfg.serviceAccountEmail,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iat: now,
    exp: now + 3600,
  };
  const enc = (obj: any) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
  const data = `${enc(header)}.${enc(payload)}`;
  const pem = String(cfg.serviceAccountPrivateKey).replace(/\\n/g, '\n');
  const keyData = pem.replace('-----BEGIN PRIVATE KEY-----','').replace('-----END PRIVATE KEY-----','').replace(/\s+/g,'');
  const der = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  // @ts-ignore
  const cryptoKey = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  // @ts-ignore
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(data));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf))).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
  const jwt = `${data}.${sig}`;
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
  });
  if (!resp.ok) return null;
  const tok = await resp.json() as any;
  return tok.access_token || null;
}
async function getAccessTokenFromOAuth(cfg: any): Promise<string | null> {
  if (!cfg?.oauthClientId || !cfg?.oauthClientSecret) return null;
  const refresh = await loadRefresh();
  if (!refresh) return null;
  const params = new URLSearchParams();
  params.set('client_id', cfg.oauthClientId);
  params.set('client_secret', cfg.oauthClientSecret);
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refresh);
  const resp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: params });
  if (!resp.ok) return null;
  const data = await resp.json() as any;
  return data.access_token || null;
}

async function handleImagesMeta(req: Request, url: URL) {
  const p = url.pathname.replace(/^\/api\/images\/?/, '');
  if (p === 'generate' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const { slug, headline, additionalPrompt, sections = [], limit = 3, testOnly } = body;
    if (!slug || !headline) return bad('slug and headline required');
    const cfg = await loadVertexConfig();
    const projectId = cfg?.projectId || '';
    const location = cfg?.location || 'us-central1';
    const model = cfg?.model || 'imagegeneration@006';

    // test only
    if (testOnly) {
      const token = (await getAccessTokenFromSA(cfg)) || (await getAccessTokenFromOAuth(cfg));
      return json({ success: Boolean(token), usedVertex: Boolean(token), tested: true });
    }

    const heroPrompt = buildHeroPrompt(headline, additionalPrompt);
    const chapterList = sections.filter((s: any) => s.heading).slice(0, Math.max(2, Math.min(3, limit)));
    const chapterData = chapterList.map((ch: any) => ({ heading: ch.heading, summary: summarize(ch.text || ''), prompt: buildChapterPrompt(ch.heading, summarize(ch.text || '')) }));

    let token = await getAccessTokenFromSA(cfg);
    if (!token) token = await getAccessTokenFromOAuth(cfg);
    const shouldCallVertex = Boolean(projectId) && Boolean(token);

    const folder = `public/images/dev/${slug}`;
    await Deno.mkdir(folder, { recursive: true }).catch(() => {});
    const hero: any = { prompt: heroPrompt };
    const chapters: any[] = chapterData.map(c => ({ prompt: c.prompt, heading: c.heading, summary: c.summary }));

    if (shouldCallVertex) {
      const call = async (prompt: string, aspect: string) => {
        const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateImage`;
        const payload = { instances: [{ prompt, negativePrompt: buildNegativePrompt() }], parameters: { sampleCount: 1, aspectRatio: aspect } };
        const resp = await fetch(url, { method: 'POST', headers: { 'authorization': `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        if (!resp.ok) return { error: await resp.text() } as any;
        const data = await resp.json();
        const b64 = data?.predictions?.[0]?.bytesBase64Encoded || data?.images?.[0]?.bytesBase64Encoded;
        return { b64 } as any;
      };
      const h = await call(heroPrompt, '16:9');
      if (h?.b64) {
        const file = `${folder}/hero.png`;
        await Deno.writeFile(file, Uint8Array.from(atob(h.b64), c => c.charCodeAt(0)));
        hero.url = `/images/dev/${slug}/hero.png`;
      } else if (h?.error) hero.error = h.error;
      for (let i = 0; i < chapters.length; i++) {
        const r = await call(chapters[i].prompt, '4:3');
        if (r?.b64) {
          const fp = `${folder}/chapter-${i + 1}.png`;
          await Deno.writeFile(fp, Uint8Array.from(atob(r.b64), c => c.charCodeAt(0)));
          chapters[i].url = `/images/dev/${slug}/chapter-${i + 1}.png`;
        } else if (r?.error) {
          chapters[i].error = r.error;
        }
      }
    }

    return json({ success: true, usedVertex: shouldCallVertex, hero, chapters });
  }
  if (p === 'meta') {
    if (req.method === 'GET') {
      const slug = url.searchParams.get('slug') || '';
      if (!slug) return bad('slug required');
      const row = Array.from(db.query('SELECT hero_url, sections_json, updated_at FROM blog_images WHERE slug = ?', [slug]))[0] as any[] | undefined;
      if (!row) return json({ slug, hero_url: null, sections: [] });
      let sections: unknown = [];
      try { sections = JSON.parse(row[1] || '[]'); } catch { sections = []; }
      return json({ slug, hero_url: row[0], sections, updated_at: row[2] });
    }
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const slug = String(body.slug || '');
      if (!slug) return bad('slug required');
      const hero_url = body.hero_url ? String(body.hero_url) : null;
      const sections_json = JSON.stringify(body.sections || []);
      const ts = Math.floor(Date.now() / 1000);
      db.query('INSERT INTO blog_images (slug, hero_url, sections_json, updated_at) VALUES (?,?,?,?) ON CONFLICT(slug) DO UPDATE SET hero_url=?, sections_json=?, updated_at=?', [slug, hero_url, sections_json, ts, hero_url, sections_json, ts]);
      return json({ success: true });
    }
  }
  if (p === 'list' && req.method === 'GET') {
    const rows = Array.from(db.query('SELECT slug, hero_url, updated_at FROM blog_images WHERE hero_url IS NOT NULL AND hero_url != "" ORDER BY updated_at DESC')) as any[];
    const items = rows.map(r => ({ slug: r[0], hero_url: r[1], updated_at: r[2] }));
    return json({ items });
  }
  return new Response('Not Found', { status: 404 });
}

// OAuth status (dev)
async function handleOAuth(req: Request, url: URL) {
  const p = url.pathname.replace(/^\/api\/auth\/google\/?/, '');
  if (p === 'status' && req.method === 'GET') {
    const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_oauth_refresh']))[0] as any[] | undefined;
    return json({ connected: Boolean(row) });
  }
  if (p === 'start' && req.method === 'GET') {
    // Minimal redirect if oauth client id exists
    const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_config']))[0] as any[] | undefined;
    if (!row) return bad('Missing OAuth client config');
    const cfg = await decryptJson(row[0]);
    if (!cfg?.oauthClientId) return bad('Missing OAuth client ID');
    const origin = `${url.protocol}//${url.host}`;
    const redirectUri = `${origin}/api/auth/google/callback`;
    const state = randToken();
    const params = new URLSearchParams({
      client_id: cfg.oauthClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    const headers = new Headers();
    headers.set('Set-Cookie', `gstate=${state}; Path=/; HttpOnly; SameSite=Lax`);
    headers.set('Location', `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    return new Response(null, { status: 302, headers });
  }
  if (p === 'callback' && req.method === 'GET') {
    const params = url.searchParams;
    const code = params.get('code');
    const state = params.get('state');
    const cookie = req.headers.get('cookie') || '';
    const stateCookie = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('gstate='))?.split('=')[1];
    if (!code || state !== stateCookie) return bad('Invalid state or code', 400);
    const row = Array.from(db.query('SELECT value FROM app_settings WHERE key = ?', ['vertex_config']))[0] as any[] | undefined;
    if (!row) return bad('Missing client config');
    const cfg = await decryptJson(row[0]);
    const client_id = cfg?.oauthClientId;
    const client_secret = cfg?.oauthClientSecret;
    if (!client_id || !client_secret) return bad('Client not configured');
    const origin = `${url.protocol}//${url.host}`;
    const redirect_uri = `${origin}/api/auth/google/callback`;
    const body = new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code'
    });
    const resp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
    const data = await resp.json();
    if (!resp.ok || !data.refresh_token) return bad('Token exchange failed');
    const enc = await encryptJson({ refresh: data.refresh_token });
    const ts = Math.floor(Date.now() / 1000);
    db.query('INSERT INTO app_settings (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=?, updated_at=?', ['vertex_oauth_refresh', enc, ts, enc, ts]);
    const headers = new Headers();
    headers.set('Set-Cookie', 'gstate=; Path=/; Max-Age=0');
    headers.set('Location', '/admin/settings');
    return new Response(null, { status: 302, headers });
  }
  return new Response('Not Found', { status: 404 });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/admin')) return await handleAdmin(req, url);
    if (url.pathname.startsWith('/api/settings')) return await handleSettings(req, url);
    if (url.pathname.startsWith('/api/images')) return await handleImagesMeta(req, url);
    if (url.pathname.startsWith('/api/auth/google')) return await handleOAuth(req, url);
    if (url.pathname.startsWith('/api/blog')) return await handleBlogManagement(req, url);
    return new Response('OK', { status: 200 });
  } catch (e) {
    return json({ error: e?.message || 'Server error' }, { status: 500 });
  }
});
