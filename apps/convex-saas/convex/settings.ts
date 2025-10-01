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

