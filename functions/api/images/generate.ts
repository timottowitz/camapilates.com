interface Env {
  DB: D1Database;
  CONFIG_ENC_KEY?: string;
  VERTEX_PROJECT_ID?: string;
  VERTEX_LOCATION?: string; // e.g., us-central1
  VERTEX_MODEL_IMAGE?: string; // e.g., imagegeneration@006
  VERTEX_ACCESS_TOKEN?: string; // optional pre-provisioned token
  VERTEX_SA_EMAIL?: string; // optional service account email
  VERTEX_SA_PRIVATE_KEY?: string; // optional PEM private key
  IMAGES_PUBLIC_BASE?: string; // e.g., https://cdn.example.com
  IMAGES_R2?: R2Bucket; // optional R2 binding for persistent storage
}

type Section = { heading: string; text: string };

type GenerateRequest = {
  slug: string;
  headline: string;
  additionalPrompt?: string;
  sections?: Section[];
  limit?: number; // number of chapters to generate (2-3)
  testOnly?: boolean;
};

type ImageResult = { prompt: string; b64?: string; mime?: string; url?: string; error?: string };

const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' }, ...init });
const bad = (m: string, s = 400) => json({ error: m }, { status: s });

function trimWords(s: string, max = 70) {
  const words = s.trim().split(/\s+/);
  return words.length > max ? words.slice(0, max).join(' ') + '…' : s.trim();
}

function summarize(text: string, maxChars = 350) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars - 1) + '…' : cleaned;
}

function buildNegativePrompt() {
  return [
    'texto, marca de agua, tipografia, logo, texto en la imagen',
    'arte de dibujos animados, CGI obvio, caricatura, 3D, render',
    'manos o dedos extra, anatomía incorrecta, deformaciones',
    'rostros distorsionados, desenfoque excesivo, ruido digital fuerte',
    'colores fluorescentes antinaturales, halos, aberración cromática',
  ].join(', ');
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

async function getVertexAccessToken(env: Env): Promise<string | null> {
  if (env.VERTEX_ACCESS_TOKEN) return env.VERTEX_ACCESS_TOKEN;
  if (!env.VERTEX_SA_EMAIL || !env.VERTEX_SA_PRIVATE_KEY) return null;

  // Service account JWT → OAuth2 access_token
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: env.VERTEX_SA_EMAIL,
    sub: env.VERTEX_SA_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iat: now,
    exp: now + 3600,
  };
  const enc = (obj: any) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
  const data = `${enc(header)}.${enc(payload)}`;
  const pem = env.VERTEX_SA_PRIVATE_KEY.replace(/\\n/g, '\n');
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

async function loadVertexConfig(env: Env): Promise<{
  projectId?: string;
  location?: string;
  model?: string;
  saEmail?: string;
  saKey?: string;
}> {
  try {
    await env.DB.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER);');
    const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>();
    if (!row || !row.value) return {};
    if (!env.CONFIG_ENC_KEY) return {};
    const cfg = await (async () => {
      // decryptJson clone (inline)
      const enc = env.CONFIG_ENC_KEY!;
      const bin = Uint8Array.from(atob(row.value), c => c.charCodeAt(0));
      const iv = bin.slice(0, 12);
      const ct = bin.slice(12);
      const encKeyBytes = new TextEncoder().encode(enc);
      // @ts-ignore
      const hashBuf = await crypto.subtle.digest('SHA-256', encKeyBytes);
      // @ts-ignore
      const key = await crypto.subtle.importKey('raw', hashBuf, { name: 'AES-GCM' }, false, ['decrypt']);
      // @ts-ignore
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
      return obj;
    })();
    return {
      projectId: cfg.projectId,
      location: cfg.location,
      model: cfg.model,
      saEmail: cfg.serviceAccountEmail,
      saKey: cfg.serviceAccountPrivateKey,
    };
  } catch {
    return {};
  }
}

async function getOAuthAccessTokenFromRefresh(env: Env): Promise<string | null> {
  try {
    await env.DB.exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER);');
    const rowCfg = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_config').first<any>();
    const rowRef = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind('vertex_oauth_refresh').first<any>();
    if (!rowCfg?.value || !rowRef?.value || !env.CONFIG_ENC_KEY) return null;
    const dec = async (b64: string) => {
      const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const iv = bin.slice(0, 12); const ct = bin.slice(12);
      const enc = new TextEncoder().encode(env.CONFIG_ENC_KEY!);
      // @ts-ignore
      const hash = await crypto.subtle.digest('SHA-256', enc);
      // @ts-ignore
      const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
      // @ts-ignore
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
    };
    const cfg = await dec(rowCfg.value);
    const ref = await dec(rowRef.value);
    if (!cfg.oauthClientId || !cfg.oauthClientSecret || !ref.refresh) return null;
    const params = new URLSearchParams();
    params.set('client_id', cfg.oauthClientId);
    params.set('client_secret', cfg.oauthClientSecret);
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', ref.refresh);
    const resp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: params });
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    return data.access_token || null;
  } catch { return null; }
}

async function vertexGenerateImage(env: Env, prompt: string, aspect: '16:9' | '4:3'): Promise<ImageResult> {
  const project = env.VERTEX_PROJECT_ID;
  const location = env.VERTEX_LOCATION || 'us-central1';
  const model = env.VERTEX_MODEL_IMAGE || 'imagegeneration@006';
  if (!project) return { prompt, error: 'Missing VERTEX_PROJECT_ID' };
  const access = await getVertexAccessToken(env);
  if (!access) return { prompt, error: 'Missing Vertex access (token or service account creds)' };

  const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateImage`;
  const body = {
    instances: [{
      prompt,
      negativePrompt: buildNegativePrompt(),
    }],
    parameters: {
      sampleCount: 1,
      aspectRatio: aspect,
      // safetyFilterLevel: 'block_few',
    }
  } as any;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'authorization': `Bearer ${access}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { prompt, error: `Vertex error: ${resp.status} ${errText}` };
  }
  const data = await resp.json() as any;
  const imageBase64: string | undefined = data?.predictions?.[0]?.bytesBase64Encoded || data?.images?.[0]?.bytesBase64Encoded;
  if (!imageBase64) return { prompt, error: 'No image in response' };
  return { prompt, b64: imageBase64, mime: 'image/png' };
}

function pickChapters(sections: Section[] | undefined, limit = 3): Section[] {
  const list = (sections || []).filter(s => s.heading && !/^FAQ\b/i.test(s.heading));
  return list.slice(0, Math.max(2, Math.min(3, limit)));
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  if (request.method !== 'POST') return bad('POST required', 405);
  const input = await request.json().catch(() => null) as GenerateRequest | null;
  if (!input || !input.slug || !input.headline) return bad('slug and headline required');

  // Load config from DB if available (overrides env)
  const cfg = await loadVertexConfig(env);
  const projectId = cfg.projectId || env.VERTEX_PROJECT_ID;
  const location = cfg.location || env.VERTEX_LOCATION || 'us-central1';
  const model = cfg.model || env.VERTEX_MODEL_IMAGE || 'imagegeneration@006';
  if (cfg.saEmail && cfg.saKey) {
    (env as any).VERTEX_SA_EMAIL = cfg.saEmail;
    (env as any).VERTEX_SA_PRIVATE_KEY = cfg.saKey;
  }

  const limit = input.limit ?? 3;
  const chapters = pickChapters(input.sections, limit);

  const heroPrompt = buildHeroPrompt(input.headline, input.additionalPrompt);
  const chapterData = chapters.map(ch => ({ heading: ch.heading, summary: summarize(ch.text || ''), prompt: buildChapterPrompt(ch.heading, summarize(ch.text || '')) }));

  // Attempt generation when Vertex is configured; otherwise return prompts only
  const shouldCallVertex = Boolean(projectId);

  // Test-only mode: verify token acquisition and return
  if (input.testOnly) {
    let token = shouldCallVertex ? await getVertexAccessToken(env) : null;
    if (!token) {
      token = await getOAuthAccessTokenFromRefresh(env);
      if (token) (env as any).VERTEX_ACCESS_TOKEN = token;
    }
    return json({ success: Boolean(token), usedVertex: Boolean(token), tested: true });
  }
  let hero: ImageResult = { prompt: heroPrompt };
  const chapterResults: (ImageResult & { heading: string; summary: string })[] = chapterData.map(c => ({ prompt: c.prompt, heading: c.heading, summary: c.summary }));

  if (shouldCallVertex) {
    // Ensure we have an access token (SA or OAuth refresh)
    let token = await getVertexAccessToken(env);
    if (!token) {
      token = await getOAuthAccessTokenFromRefresh(env);
      if (token) (env as any).VERTEX_ACCESS_TOKEN = token;
    }
    hero = await vertexGenerateImage(env, heroPrompt, '16:9');
    for (let i = 0; i < chapterResults.length; i++) {
      const r = await vertexGenerateImage(env, chapterResults[i].prompt, '4:3');
      chapterResults[i] = { ...chapterResults[i], ...r };
    }
  }

  // Optional: persist to R2 and attach public URLs
  const bucket = (env as any).IMAGES_R2 as R2Bucket | undefined;
  const base = env.IMAGES_PUBLIC_BASE?.replace(/\/$/, '');
  if (bucket && base) {
    const folder = `blog/${input.slug}`;
    if (hero.b64) {
      const key = `${folder}/hero.png`;
      await bucket.put(key, Uint8Array.from(atob(hero.b64), c => c.charCodeAt(0)), { httpMetadata: { contentType: hero.mime || 'image/png', cacheControl: 'public, max-age=31536000, immutable' } });
      hero.url = `${base}/${key}`;
    }
    for (let i = 0; i < chapterResults.length; i++) {
      const c = chapterResults[i] as ImageResult & { heading: string; summary: string };
      if (c.b64) {
        const key = `${folder}/chapter-${i + 1}.png`;
        await bucket.put(key, Uint8Array.from(atob(c.b64), ch => ch.charCodeAt(0)), { httpMetadata: { contentType: c.mime || 'image/png', cacheControl: 'public, max-age=31536000, immutable' } });
        (chapterResults[i] as any).url = `${base}/${key}`;
      }
    }
  }

  return json({
    success: true,
    usedVertex: shouldCallVertex,
    hero,
    chapters: chapterResults,
  });
};
