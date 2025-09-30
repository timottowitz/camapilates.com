import { queryGeneric as query, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';

async function encrypt(obj: unknown): Promise<string> {
  const keyStr = process.env.CONFIG_ENC_KEY;
  if (!keyStr) throw new Error('CONFIG_ENC_KEY not set');
  const bytes = new TextEncoder().encode(keyStr);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
  all.set(iv, 0); all.set(new Uint8Array(ct as ArrayBuffer), iv.length);
  return Buffer.from(all).toString('base64');
}
async function decrypt(b64: string): Promise<any | null> {
  try {
    const keyStr = process.env.CONFIG_ENC_KEY!;
    const bytes = new TextEncoder().encode(keyStr);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    const bin = Uint8Array.from(Buffer.from(b64, 'base64'));
    const iv = bin.slice(0, 12); const ct = bin.slice(12);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
  } catch { return null; }
}

export const getVertexConfig = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'vertex_config')).unique();
    if (!row) return { configured: false };
    const cfg = await decrypt(row.valueEnc);
    if (!cfg) return { configured: false };
    return { configured: true, ...cfg };
  }
});

export const setVertexConfig = mutation({
  args: { projectId: v.string(), location: v.optional(v.string()), model: v.optional(v.string()), serviceAccountEmail: v.optional(v.string()), serviceAccountPrivateKey: v.optional(v.string()), oauthClientId: v.optional(v.string()), oauthClientSecret: v.optional(v.string()) },
  handler: async (ctx, body) => {
    if (!body.projectId) throw new Error('projectId required');
    const enc = await encrypt({ ...body, location: body.location || 'us-central1', model: body.model || 'imagegeneration@006' });
    const now = Date.now();
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'vertex_config')).unique();
    if (row) { await ctx.db.patch(row._id, { valueEnc: enc, updatedAt: now }); }
    else { await ctx.db.insert('app_settings', { key: 'vertex_config', valueEnc: enc, updatedAt: now }); }
    return { success: true };
  }
});

export const getOAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    // If we ever store OAuth refresh, check it here; otherwise infer from config
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'vertex_oauth_refresh')).unique();
    return { connected: Boolean(row) };
  }
});

// Provider API keys management (encrypted at rest)
async function encJson(obj: unknown) {
  const keyStr = process.env.CONFIG_ENC_KEY || '';
  if (!keyStr) throw new Error('CONFIG_ENC_KEY not set');
  const encKey = new TextEncoder().encode(keyStr);
  // @ts-ignore
  const hash = await crypto.subtle.digest('SHA-256', encKey);
  // @ts-ignore
  const aes = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // @ts-ignore
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(JSON.stringify(obj)));
  const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
  all.set(iv, 0); all.set(new Uint8Array(ct as ArrayBuffer), iv.length);
  return Buffer.from(all).toString('base64');
}
async function decJson(b64: string) {
  try {
    const keyStr = process.env.CONFIG_ENC_KEY || '';
    if (!keyStr) return null;
    const bin = Uint8Array.from(Buffer.from(b64, 'base64'));
    const iv = bin.slice(0, 12); const ct = bin.slice(12);
    const enc = new TextEncoder().encode(keyStr);
    // @ts-ignore
    const hash = await crypto.subtle.digest('SHA-256', enc);
    // @ts-ignore
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    // @ts-ignore
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
  } catch { return null; }
}

export const setProviderKey = mutation({
  args: { provider: v.string(), key: v.string() },
  handler: async (ctx, { provider, key }) => {
    const now = Date.now();
    const valueEnc = await encJson({ key });
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', `provider_key_${provider}`)).unique();
    if (row) await ctx.db.patch(row._id, { valueEnc, updatedAt: now });
    else await ctx.db.insert('app_settings', { key: `provider_key_${provider}`, valueEnc, updatedAt: now });
    return { success: true };
  }
});

export const deleteProviderKey = mutation({
  args: { provider: v.string() },
  handler: async (ctx, { provider }) => {
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', `provider_key_${provider}`)).unique();
    if (row) await ctx.db.delete(row._id);
    return { success: true };
  }
});

export const getProviderKeysStatus = query({
  args: {},
  handler: async (ctx) => {
    const keys = ['openai','gemini','perplexity','exa','firecrawl'];
    const status: Record<string, boolean> = {};
    for (const p of keys) {
      const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', `provider_key_${p}`)).unique();
      status[p] = Boolean(row);
    }
    return status;
  }
});

export const setDeepMode = mutation({
  args: { mode: v.string() },
  handler: async (ctx, { mode }) => {
    const now = Date.now();
    const valueEnc = await encJson({ mode });
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'deep_mode')).unique();
    if (row) await ctx.db.patch(row._id, { valueEnc, updatedAt: now });
    else await ctx.db.insert('app_settings', { key: 'deep_mode', valueEnc, updatedAt: now });
    return { success: true };
  }
});

export const getDeepMode = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'deep_mode')).unique();
    if (!row?.valueEnc) return { mode: 'direct' };
    const cfg = await decJson(row.valueEnc);
    return { mode: cfg?.mode === 'agent' ? 'agent' : 'direct' };
  }
});

// Rate limiting settings for Google Places API
export const enableRateLimiting = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'rateLimitingEnabled'))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.enabled,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('settings', {
        key: 'rateLimitingEnabled',
        value: args.enabled,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const isRateLimitingEnabled = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'rateLimitingEnabled'))
      .first();

    return setting?.value ?? false;
  },
});
