import { mutation, query, action, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

// =============================================
// CRYPTO HELPERS
// =============================================

function hex(buf: ArrayBuffer) {
  const b = new Uint8Array(buf);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return hex(digest);
}

function randToken(len = 32) {
  const u = new Uint8Array(len);
  crypto.getRandomValues(u);
  return Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================
// ACCOUNT CREATION (called on claim approval)
// =============================================

export const createAccount = internalMutation({
  args: {
    email: v.string(),
    teacherId: v.id('teachers'),
    teacherName: v.string(),
  },
  handler: async (ctx, { email, teacherId, teacherName }) => {
    // Check if account already exists
    const existing = await ctx.db
      .query('instructorAccounts')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
      .first();

    if (existing) {
      return {
        ok: false,
        error: 'Account already exists',
        accountId: existing._id
      };
    }

    // Generate setup token (valid 7 days)
    const setupToken = randToken(32);
    const setupTokenHash = await sha256Hex(setupToken);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    // Create account with placeholder password (will be set during setup)
    const accountId = await ctx.db.insert('instructorAccounts', {
      email: email.toLowerCase(),
      passwordHash: '', // Set during setupPassword
      salt: '',
      teacherId,
      status: 'pending_setup',
      tier: 'free',
      setupToken: setupTokenHash,
      setupTokenExpiresAt: Date.now() + SEVEN_DAYS,
      createdAt: Date.now(),
    });

    return {
      ok: true,
      accountId,
      setupToken, // Raw token for email link
      teacherName,
    };
  },
});

// =============================================
// PASSWORD SETUP (from welcome email link)
// =============================================

export const getAccountBySetupToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256Hex(token);

    const account = await ctx.db
      .query('instructorAccounts')
      .filter((q) => q.eq(q.field('setupToken'), tokenHash))
      .first();

    if (!account) {
      return { valid: false, error: 'Token inválido' };
    }

    if (account.setupTokenExpiresAt && account.setupTokenExpiresAt < Date.now()) {
      return { valid: false, error: 'Token expirado' };
    }

    if (account.status !== 'pending_setup') {
      return { valid: false, error: 'Cuenta ya configurada' };
    }

    // Get teacher info for display
    const teacher = await ctx.db.get(account.teacherId);

    return {
      valid: true,
      email: account.email,
      teacherName: teacher?.fullName?.value || 'Instructor',
    };
  },
});

export const setupPassword = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { token, password }) => {
    // Validate password
    if (password.length < 8) {
      return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const tokenHash = await sha256Hex(token);

    const account = await ctx.db
      .query('instructorAccounts')
      .filter((q) => q.eq(q.field('setupToken'), tokenHash))
      .first();

    if (!account) {
      return { ok: false, error: 'Token inválido' };
    }

    if (account.setupTokenExpiresAt && account.setupTokenExpiresAt < Date.now()) {
      return { ok: false, error: 'Token expirado. Solicita un nuevo enlace.' };
    }

    // Hash password
    const salt = randToken(16);
    const passwordHash = await sha256Hex(`${salt}:${password}`);

    // Update account
    await ctx.db.patch(account._id, {
      passwordHash,
      salt,
      status: 'active',
      setupToken: undefined,
      setupTokenExpiresAt: undefined,
      passwordSetAt: Date.now(),
    });

    // Create session (30 days)
    const sessionToken = randToken(32);
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert('instructorSessions', {
      token: sessionToken,
      accountId: account._id,
      expiresAt: Date.now() + THIRTY_DAYS,
      createdAt: Date.now(),
    });

    return {
      ok: true,
      token: sessionToken,
      expiresAt: Date.now() + THIRTY_DAYS,
    };
  },
});

// =============================================
// LOGIN / LOGOUT
// =============================================

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const account = await ctx.db
      .query('instructorAccounts')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
      .first();

    if (!account) {
      return { ok: false, error: 'Credenciales inválidas' };
    }

    if (account.status === 'pending_setup') {
      return { ok: false, error: 'Cuenta pendiente de configuración. Revisa tu correo.' };
    }

    if (account.status === 'suspended') {
      return { ok: false, error: 'Cuenta suspendida. Contacta soporte.' };
    }

    // Verify password
    const hash = await sha256Hex(`${account.salt}:${password}`);
    if (hash !== account.passwordHash) {
      return { ok: false, error: 'Credenciales inválidas' };
    }

    // Create session (30 days)
    const sessionToken = randToken(32);
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert('instructorSessions', {
      token: sessionToken,
      accountId: account._id,
      expiresAt: Date.now() + THIRTY_DAYS,
      createdAt: Date.now(),
    });

    // Update last login
    await ctx.db.patch(account._id, {
      lastLoginAt: Date.now(),
    });

    return {
      ok: true,
      token: sessionToken,
      expiresAt: Date.now() + THIRTY_DAYS,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query('instructorSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { ok: true };
  },
});

// =============================================
// SESSION VALIDATION
// =============================================

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token) {
      return { authenticated: false };
    }

    const session = await ctx.db
      .query('instructorSessions')
      .withIndex('by_token', (q) => q.eq('token', token))
      .first();

    if (!session) {
      return { authenticated: false };
    }

    if (session.expiresAt < Date.now()) {
      return { authenticated: false };
    }

    const account = await ctx.db.get(session.accountId);
    if (!account || account.status !== 'active') {
      return { authenticated: false };
    }

    const teacher = await ctx.db.get(account.teacherId);

    return {
      authenticated: true,
      accountId: account._id,
      teacherId: account.teacherId,
      email: account.email,
      tier: account.tier || 'free',
      teacherName: teacher?.fullName?.value || 'Instructor',
      teacherSlug: teacher?.slug,
    };
  },
});

// =============================================
// PASSWORD RESET
// =============================================

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query('instructorAccounts')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
      .first();

    // Always return success to prevent email enumeration
    if (!account || account.status !== 'active') {
      return { ok: true };
    }

    // Generate reset token (valid 24 hours)
    const resetToken = randToken(32);
    const resetTokenHash = await sha256Hex(resetToken);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    await ctx.db.patch(account._id, {
      resetToken: resetTokenHash,
      resetTokenExpiresAt: Date.now() + TWENTY_FOUR_HOURS,
    });

    // Get teacher name for email
    const teacher = await ctx.db.get(account.teacherId);

    return {
      ok: true,
      // These are returned for the action to send email
      _internal: {
        shouldSendEmail: true,
        email: account.email,
        resetToken,
        teacherName: teacher?.fullName?.value || 'Instructor',
      },
    };
  },
});

export const getAccountByResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256Hex(token);

    const account = await ctx.db
      .query('instructorAccounts')
      .filter((q) => q.eq(q.field('resetToken'), tokenHash))
      .first();

    if (!account) {
      return { valid: false, error: 'Token inválido' };
    }

    if (account.resetTokenExpiresAt && account.resetTokenExpiresAt < Date.now()) {
      return { valid: false, error: 'Token expirado' };
    }

    return {
      valid: true,
      email: account.email,
    };
  },
});

export const resetPassword = mutation({
  args: {
    token: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { token, password }) => {
    // Validate password
    if (password.length < 8) {
      return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const tokenHash = await sha256Hex(token);

    const account = await ctx.db
      .query('instructorAccounts')
      .filter((q) => q.eq(q.field('resetToken'), tokenHash))
      .first();

    if (!account) {
      return { ok: false, error: 'Token inválido' };
    }

    if (account.resetTokenExpiresAt && account.resetTokenExpiresAt < Date.now()) {
      return { ok: false, error: 'Token expirado. Solicita un nuevo enlace.' };
    }

    // Hash new password
    const salt = randToken(16);
    const passwordHash = await sha256Hex(`${salt}:${password}`);

    // Update account
    await ctx.db.patch(account._id, {
      passwordHash,
      salt,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
      passwordSetAt: Date.now(),
    });

    // Delete all existing sessions for security
    const sessions = await ctx.db
      .query('instructorSessions')
      .withIndex('by_account', (q) => q.eq('accountId', account._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Create new session
    const sessionToken = randToken(32);
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert('instructorSessions', {
      token: sessionToken,
      accountId: account._id,
      expiresAt: Date.now() + THIRTY_DAYS,
      createdAt: Date.now(),
    });

    return {
      ok: true,
      token: sessionToken,
      expiresAt: Date.now() + THIRTY_DAYS,
    };
  },
});

// =============================================
// RESEND SETUP TOKEN (if expired)
// =============================================

export const resendSetupToken = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query('instructorAccounts')
      .withIndex('by_email', (q) => q.eq('email', email.toLowerCase()))
      .first();

    if (!account) {
      return { ok: false, error: 'No se encontró la cuenta' };
    }

    if (account.status !== 'pending_setup') {
      return { ok: false, error: 'La cuenta ya está configurada. Usa el login normal.' };
    }

    // Generate new setup token
    const setupToken = randToken(32);
    const setupTokenHash = await sha256Hex(setupToken);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(account._id, {
      setupToken: setupTokenHash,
      setupTokenExpiresAt: Date.now() + SEVEN_DAYS,
    });

    const teacher = await ctx.db.get(account.teacherId);

    return {
      ok: true,
      _internal: {
        shouldSendEmail: true,
        email: account.email,
        setupToken,
        teacherName: teacher?.fullName?.value || 'Instructor',
      },
    };
  },
});
