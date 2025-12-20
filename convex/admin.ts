import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';

function hex(buf: ArrayBuffer) {
  const b = new Uint8Array(buf as ArrayBuffer);
  return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  // @ts-ignore
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return hex(digest);
}

function randToken(len = 16) {
  const u = new Uint8Array(len);
  // @ts-ignore
  crypto.getRandomValues(u);
  return Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const init = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const exists = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', username)).unique();
    const count = (await ctx.db.query('users').collect()).length;
    if (count > 0) return { ok: false, error: 'Already initialized' };
    const salt = randToken(16);
    const passHash = await sha256Hex(`${salt}:${password}`);
    await ctx.db.insert('users', { username, passHash, salt, createdAt: Date.now() });
    return { ok: true };
  }
});

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const user = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', username)).unique();
    if (!user) return { ok: false, error: 'Invalid credentials' };
    const hash = await sha256Hex(`${user.salt}:${password}`);
    if (hash !== user.passHash) return { ok: false, error: 'Invalid credentials' };
    const token = randToken(16);
    const ttl = 86400; // 1 day
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    await ctx.db.insert('sessions', { token, userId: user._id, expiresAt });
    return { ok: true, token, username: user.username, expiresAt };
  }
});

export const session = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { authenticated: false };
    const now = Math.floor(Date.now() / 1000);
    if (s.expiresAt < now) return { authenticated: false };
    const user = await ctx.db.get(s.userId);
    return { authenticated: true, user: user?.username };
  }
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (s) await ctx.db.delete(s._id);
    return { ok: true };
  }
});

export const users = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return [];
    const now = Math.floor(Date.now() / 1000);
    if (s.expiresAt < now) return [];
    const user = await ctx.db.get(s.userId);
    if (!user) return [];

    const rows = await ctx.db.query('users').collect();
    return rows.map(r => r.username);
  }
});

export const sessions = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { items: [] as Array<{ token: string; tokenShort: string; username: string; expires: number }> };
    const now = Math.floor(Date.now() / 1000);
    if (s.expiresAt < now) return { items: [] as Array<{ token: string; tokenShort: string; username: string; expires: number }> };
    const user = await ctx.db.get(s.userId);
    if (!user) return { items: [] as Array<{ token: string; tokenShort: string; username: string; expires: number }> };

    const items = await ctx.db.query('sessions').collect();
    const list = await Promise.all(items.map(async (sess) => {
      const sessUser = await ctx.db.get(sess.userId);
      return { token: sess.token, tokenShort: sess.token.slice(0, 8), username: sessUser?.username || '', expires: sess.expiresAt };
    }));
    return { items: list };
  }
});

export const changePassword = mutation({
  args: { token: v.string(), current_password: v.string(), new_password: v.string() },
  handler: async (ctx, { token, current_password, new_password }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { ok: false, error: 'Not authenticated' };
    const user = await ctx.db.get(s.userId);
    if (!user) return { ok: false, error: 'Not authenticated' };
    const currHash = await sha256Hex(`${user.salt}:${current_password}`);
    if (currHash !== user.passHash) return { ok: false, error: 'Incorrect password' };
    const salt = randToken(16);
    const passHash = await sha256Hex(`${salt}:${new_password}`);
    await ctx.db.patch(user._id, { salt, passHash });
    return { ok: true };
  }
});

export const addUser = mutation({
  args: { token: v.string(), username: v.string(), password: v.string() },
  handler: async (ctx, { token, username, password }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { ok: false, error: 'Not authenticated' };
    const exists = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', username)).unique();
    if (exists) return { ok: false, error: 'User exists' };
    const salt = randToken(16);
    const passHash = await sha256Hex(`${salt}:${password}`);
    await ctx.db.insert('users', { username, passHash, salt, createdAt: Date.now() });
    return { ok: true };
  }
});

export const deleteUser = mutation({
  args: { token: v.string(), username: v.string() },
  handler: async (ctx, { token, username }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { ok: false, error: 'Not authenticated' };
    const u = await ctx.db.query('users').withIndex('by_username', q => q.eq('username', username)).unique();
    if (!u) return { ok: false, error: 'Not found' };
    await ctx.db.delete(u._id);
    return { ok: true };
  }
});

export const revokeSession = mutation({
  args: { token: v.string(), revoke: v.string() },
  handler: async (ctx, { token, revoke }) => {
    const s = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', token)).unique();
    if (!s) return { ok: false, error: 'Not authenticated' };
    const target = await ctx.db.query('sessions').withIndex('by_token', q => q.eq('token', revoke)).unique();
    if (!target) return { ok: false, error: 'Not found' };
    await ctx.db.delete(target._id);
    return { ok: true };
  }
});

export const health = query({
  args: {},
  handler: async (ctx) => {
    try {
      const count = (await ctx.db.query('users').collect()).length;
      return { db: true, users: count };
    } catch {
      return { db: false, users: 0 };
    }
  }
});
