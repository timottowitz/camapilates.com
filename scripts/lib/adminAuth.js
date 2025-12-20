import { api } from '../../convex/_generated/api.js';

function getEnv(name) {
  try {
    // Deno
    if (globalThis.Deno?.env?.get) return globalThis.Deno.env.get(name);
  } catch {}
  try {
    // Node
    return globalThis.process?.env?.[name];
  } catch {}
  return undefined;
}

export async function getAdminToken(client) {
  const token =
    getEnv('ADMIN_TOKEN') ||
    getEnv('CAMA_ADMIN_TOKEN') ||
    getEnv('VITE_ADMIN_TOKEN') ||
    getEnv('ADMINT');
  if (token) return token;

  const username = getEnv('ADMIN_USER') || getEnv('CAMA_ADMIN_USER');
  const password = getEnv('ADMIN_PASS') || getEnv('CAMA_ADMIN_PASS');
  if (username && password) {
    const res = await client.mutation(api.admin.login, { username, password });
    if (!res?.ok || !res?.token) {
      throw new Error(`Admin login failed: ${res?.error || 'unknown_error'}`);
    }
    return res.token;
  }

  throw new Error(
    'Missing admin credentials: set ADMIN_TOKEN (recommended) or ADMIN_USER + ADMIN_PASS'
  );
}

