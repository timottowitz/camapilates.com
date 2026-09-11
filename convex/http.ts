import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';

// Minimal helpers to read/write encrypted settings in Convex DB
async function decryptConfig(b64: string, keyStr: string) {
  try {
    const bin = Uint8Array.from(Buffer.from(b64, 'base64'));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
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
async function encryptJSON(obj: unknown, keyStr: string) {
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

const http = httpRouter();

http.route({
  path: '/auth/google/start',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const CONFIG_ENC_KEY = process.env.CONFIG_ENC_KEY || '';
    if (!CONFIG_ENC_KEY) return new Response('Missing CONFIG_ENC_KEY', { status: 500 });
    // Load client from encrypted app_settings vertex_config
    const row = await ctx.runQuery({
      args: {},
      handler: async (qctx) => {
        return await qctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'vertex_config')).unique();
      }
    } as any);
    const cfg = row?.valueEnc ? await decryptConfig(row.valueEnc, CONFIG_ENC_KEY) : null;
    const clientId = cfg?.oauthClientId as string | undefined;
    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`; // Convex host
    const site = (process.env.CONVEX_SITE_URL as string) || '';
    const redirectApp = (process.env.APP_SETTINGS_REDIRECT as string)
      || (site ? `${site.replace(/\/$/, '')}/admin/settings` : '/admin/settings');
    if (!clientId) {
      const sep = redirectApp.includes('?') ? '&' : '?';
      const target = `${redirectApp}${sep}oauth=error&reason=missing_client`;
      return new Response(null, { status: 302, headers: { Location: target } });
    }

    // Redirect URI points back to Convex
    const redirectUri = `${origin}/api/auth/google/callback`;
    const state = crypto.getRandomValues(new Uint8Array(16));
    const stateHex = Array.from(state).map(b => b.toString(16).padStart(2, '0')).join('');
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/cloud-platform');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', stateHex);

    const headers = new Headers();
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    headers.set('Set-Cookie', `gstate=${stateHex}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=600`);
    headers.set('Location', authUrl.toString());
    return new Response(null, { status: 302, headers });
  }),
});

http.route({
  path: '/auth/google/callback',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const CONFIG_ENC_KEY = process.env.CONFIG_ENC_KEY || '';
    if (!CONFIG_ENC_KEY) return new Response('Missing CONFIG_ENC_KEY', { status: 500 });
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const cookie = request.headers.get('cookie') || '';
    const stateCookie = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('gstate='))?.split('=')[1];
    const origin = `${url.protocol}//${url.host}`;
    const redirectApp = (process.env.APP_SETTINGS_REDIRECT as string) || '/admin/settings';
    const err = (reason: string) => {
      const sep = redirectApp.includes('?') ? '&' : '?';
      const target = `${redirectApp}${sep}oauth=error&reason=${encodeURIComponent(reason)}`;
      return new Response(null, { status: 302, headers: { Location: target } });
    };
    if (!code || !stateParam || stateParam !== stateCookie) return err('invalid_state_or_code');

    // Load client
    const row = await ctx.runQuery({
      args: {},
      handler: async (qctx) => {
        return await qctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', 'vertex_config')).unique();
      }
    } as any);
    const cfg = row?.valueEnc ? await decryptConfig(row.valueEnc, CONFIG_ENC_KEY) : null;
    const clientId = cfg?.oauthClientId as string | undefined;
    const clientSecret = cfg?.oauthClientSecret as string | undefined;
    if (!clientId || !clientSecret) return err('client_not_configured');

    const redirectUri = `${origin}/api/auth/google/callback`;
    const params = new URLSearchParams();
    params.set('code', code);
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
    params.set('redirect_uri', redirectUri);
    params.set('grant_type', 'authorization_code');
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: params
    });
    const body = await resp.json();
    if (!resp.ok || !body?.refresh_token) {
      return err('token_exchange_failed');
    }
    const refresh = body.refresh_token as string;
    const enc = await encryptJSON({ refresh }, CONFIG_ENC_KEY);
    const ts = Math.floor(Date.now() / 1000);
    await ctx.runMutation({
      args: { key: 'vertex_oauth_refresh', valueEnc: enc, ts },
      handler: async (mctx, args: any) => {
        const row = await mctx.db.query('app_settings').withIndex('by_key', q => q.eq('key', args.key)).unique();
        if (row) await mctx.db.patch(row._id, { valueEnc: args.valueEnc, updatedAt: args.ts });
        else await mctx.db.insert('app_settings', { key: args.key, valueEnc: args.valueEnc, updatedAt: args.ts });
        return { ok: true };
      }
    } as any);
    const headers = new Headers();
    headers.set('Set-Cookie', 'gstate=; Path=/; Max-Age=0');
    // Redirect back to the app settings page with a success indicator
    const sep = redirectApp.includes('?') ? '&' : '?';
    const target = `${redirectApp}${sep}oauth=connected`;
    return new Response(null, { status: 302, headers: { Location: target } });
  }),
});

/**
 * Serve images with proper cache-control headers
 * This endpoint allows Cloudflare to cache images properly
 *
 * Usage: GET /api/images/:name
 * Example: GET /api/images/shopHero
 */
http.route({
  path: '/api/images/:name',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const name = url.pathname.split('/').pop();

    if (!name) {
      return new Response('Image name required', { status: 400 });
    }

    // Get image metadata from database
    const image = await ctx.runQuery(api.siteImages.getByName, { name });

    if (!image) {
      return new Response('Image not found', { status: 404 });
    }

    // Get the actual file from storage
    const blob = await ctx.storage.get(image.storageId);

    if (!blob) {
      return new Response('Image file not found', { status: 404 });
    }

    // Return image with cache headers
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': image.cacheControl,
        'Access-Control-Allow-Origin': '*',
        'X-Image-Name': image.name,
        'X-Image-Size': image.size.toString(),
      },
    });
  }),
});

/**
 * Blog image metadata for a given slug
 * GET /api/images/meta?slug=<slug>
 */
http.route({
  path: '/api/images/meta',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug') || '';
    if (!slug) return new Response(JSON.stringify({ error: 'slug required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const meta = await ctx.runQuery(api.images.getImageMeta, { slug });
    // Map to stable keys expected by existing clients
    const body = {
      slug: meta.slug,
      hero_url: meta.heroUrl,
      sections: Array.isArray(meta.sections) ? meta.sections.map((s: any) => ({ heading: s.heading, url: (s as any).url })) : [],
      updated_at: meta.updatedAt || undefined,
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
        'access-control-allow-origin': '*',
      },
    });
  }),
});

/**
 * List all blog images with hero URLs
 * GET /api/images/list
 */
http.route({
  path: '/api/images/list',
  method: 'GET',
  handler: httpAction(async (ctx) => {
    const res = await ctx.runQuery(api.images.listImages, {});
    const items = (res.items || []).map((it: any) => ({ slug: it.slug, hero_url: it.heroUrl, updated_at: it.updatedAt || undefined }));
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300',
        'access-control-allow-origin': '*',
      },
    });
  }),
});

/**
 * Whop webhook handler for automated payment fulfillment and community status sync
 * POST /api/webhooks/whop
 */
http.route({
  path: '/api/webhooks/whop',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const payload: any = await request.json();
      const action = payload.action || payload.event || payload.type;
      const data = payload.data || payload;

      if (!action || !data) {
        return new Response(JSON.stringify({ error: 'invalid_payload' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }

      // Handle payment.succeeded or membership.went_valid
      if (
        action === 'payment.succeeded' ||
        action === 'membership.went_valid' ||
        action === 'payment.created'
      ) {
        const email = (
          data.email ||
          data.user?.email ||
          data.customer_email ||
          ''
        ).toLowerCase().trim();

        const planId = data.plan_id || data.plan?.id || 'whop-plan';
        const rawAmount = typeof data.amount === 'number' ? data.amount : (data.final_amount || 0);
        // Whop sometimes sends amount in cents if USD or integer
        const amount = rawAmount > 100000 ? Math.round(rawAmount / 100) : rawAmount;
        const currency = (data.currency || 'mxn').toUpperCase();
        const receiptId = data.id || data.receipt_id || data.payment_id;
        const whopUserId = data.user_id || data.user?.id;
        const fullName = data.name || data.user?.name || data.user?.username;

        let planName = 'Whop Membership';
        if (planId === 'plan_tUBQoR2eJxv5v') {
          planName = 'Apartado de Lugar Oficial 50% OFF';
        } else if (planId === 'plan_hqgjSBEjElw3C') {
          planName = 'Colegiatura Completa Lista de Espera 50% OFF';
        } else if (planId === 'plan_QGF4bCYeJj2Nr') {
          planName = 'Curso Online 10 Módulos + Certificado Digital';
        } else if (planId === 'plan_ojBC2a7IkCXNT') {
          planName = 'Pase VIP Masterclass & Acceso Comunidad Whop';
        }

        if (email) {
          await ctx.runMutation(api.whopPayments.recordPayment, {
            email,
            fullName: fullName || undefined,
            planId,
            planName,
            amount:
              amount ||
              (planId === 'plan_tUBQoR2eJxv5v'
                ? 4500
                : planId === 'plan_hqgjSBEjElw3C'
                  ? 19900
                  : planId === 'plan_QGF4bCYeJj2Nr'
                    ? 1999
                    : 0),
            currency,
            receiptId: receiptId || undefined,
            whopUserId: whopUserId || undefined,
            source: 'whop-webhook',
          });
        }
      }

      return new Response(JSON.stringify({ received: true, success: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      });
    } catch (err: any) {
      console.error('Whop webhook processing error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'internal_error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }),
});

http.route({
  path: '/api/webhooks/whop',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization, x-whop-signature',
      },
    });
  }),
});

export default http;
