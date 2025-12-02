import { internal } from '../_generated/api';

/**
 * Helper to get a Google Cloud Access Token using a Service Account JSON.
 * This is required for Vertex AI authentication.
 */
export async function getGoogleAccessToken(ctx: any): Promise<string> {
    // 1. Get Service Account JSON
    let serviceAccountStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    // Fallback to app_settings if not in env
    if (!serviceAccountStr) {
        const row = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'GOOGLE_SERVICE_ACCOUNT_JSON' });
        if (row) serviceAccountStr = row;
    }

    if (!serviceAccountStr) {
        throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON. Please add it to .env.local or app_settings.');
    }

    let serviceAccount;
    try {
        // Debug logging to see what we received
        console.log('Parsing service account JSON, length:', serviceAccountStr.length);
        console.log('First 20 chars:', serviceAccountStr.substring(0, 20));
        console.log('Last 20 chars:', serviceAccountStr.substring(serviceAccountStr.length - 20));

        serviceAccount = JSON.parse(serviceAccountStr);
    } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON format. Received string starting with: ${serviceAccountStr.substring(0, 10)}...`);
    }

    const { client_email, private_key } = serviceAccount;
    if (!client_email || !private_key) {
        throw new Error('Invalid Service Account JSON: missing client_email or private_key.');
    }

    // 2. Create JWT
    // We use a minimal JWT implementation using Web Crypto API available in Convex
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaim = btoa(JSON.stringify(claim));
    const unsignedToken = `${encodedHeader}.${encodedClaim}`;

    // Import private key
    // PEM to binary
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = private_key.substring(
        private_key.indexOf(pemHeader) + pemHeader.length,
        private_key.indexOf(pemFooter)
    ).replace(/\s/g, ''); // Remove newlines

    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(unsignedToken)
    );

    // Convert signature to base64url
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const jwt = `${unsignedToken}.${signatureBase64}`;

    // 3. Exchange JWT for Access Token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!tokenResp.ok) {
        const txt = await tokenResp.text();
        throw new Error(`Failed to get Google Access Token: ${tokenResp.status} - ${txt}`);
    }

    const tokenData = await tokenResp.json();
    return tokenData.access_token;
}
