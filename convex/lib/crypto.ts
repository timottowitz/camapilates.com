// AES-GCM encryption helpers for server-side settings
import { internalAction } from '../_generated/server';
import { v } from 'convex/values';

async function importAesKey() {
  const keyStr = process.env.CONFIG_ENC_KEY;
  if (!keyStr) throw new Error('CONFIG_ENC_KEY not set');
  const bytes = new TextEncoder().encode(keyStr);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export const encryptJson = internalAction({
  args: { obj: v.any() },
  handler: async (ctx, { obj }) => {
    const key = await importAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
    const all = new Uint8Array(iv.length + (ct as ArrayBuffer).byteLength);
    all.set(iv, 0); all.set(new Uint8Array(ct as ArrayBuffer), iv.length);
    return Buffer.from(all).toString('base64');
  }
});

export const decryptJson = internalAction({
  args: { b64: v.string() },
  handler: async (ctx, { b64 }) => {
    try {
      const key = await importAesKey();
      const bin = Uint8Array.from(Buffer.from(b64, 'base64'));
      const iv = bin.slice(0, 12); const ct = bin.slice(12);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      return JSON.parse(new TextDecoder().decode(new Uint8Array(pt as ArrayBuffer)));
    } catch (e) {
      return null;
    }
  }
});
