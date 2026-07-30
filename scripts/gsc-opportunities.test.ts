/// <reference lib="deno.ns" />

import {
  analyzeGscOpportunities,
  createServiceAccountJwt,
  loadServiceAccount,
  requireAnalyzerConfig,
  scoreOpportunities,
} from "./gsc-opportunities.ts";
import type { ServiceAccountCredentials } from "./gsc-opportunities.ts";

function assert(
  condition: unknown,
  message = "Assertion failed",
): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  assert(
    actualJson === expectedJson,
    `Expected ${expectedJson}, received ${actualJson}`,
  );
}

async function assertRejects(
  action: () => Promise<unknown>,
  expectedMessage: string,
): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes(expectedMessage),
      `Expected error containing "${expectedMessage}", received "${message}"`,
    );
    return;
  }
  throw new Error(`Expected rejection containing "${expectedMessage}"`);
}

function assertThrows(action: () => unknown, expectedMessage: string): void {
  try {
    action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(
      message.includes(expectedMessage),
      `Expected error containing "${expectedMessage}", received "${message}"`,
    );
    return;
  }
  throw new Error(`Expected error containing "${expectedMessage}"`);
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(
    atob(padded),
    (character) => character.charCodeAt(0),
  );
}

function decodeJwtPart(value: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(value)));
}

function privateKeyPem(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
}

interface TestKeyMaterial {
  credentials: ServiceAccountCredentials;
  publicKey: CryptoKey;
}

async function createTestKeyMaterial(): Promise<TestKeyMaterial> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  return {
    credentials: {
      type: "service_account",
      client_email: "gsc-reader@example.test",
      private_key: privateKeyPem(privateKey),
      token_uri: "https://oauth2.googleapis.com/token",
    },
    publicKey: keyPair.publicKey,
  };
}

function analyzerEnvironment(): Pick<typeof Deno.env, "get"> {
  const values = new Map([
    ["GSC_SITE_URL", "https://camadepilates.com/"],
    ["GOOGLE_APPLICATION_CREDENTIALS", "/test/service-account.json"],
  ]);
  return { get: (name: string) => values.get(name) };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

Deno.test("requireAnalyzerConfig fails loudly for missing configuration", () => {
  const values = new Map<string, string>();
  const env = { get: (name: string) => values.get(name) };
  assertThrows(() => requireAnalyzerConfig(env), "GSC_SITE_URL");

  values.set("GSC_SITE_URL", "https://camadepilates.com/");
  assertThrows(
    () => requireAnalyzerConfig(env),
    "GOOGLE_APPLICATION_CREDENTIALS",
  );
});

Deno.test("loadServiceAccount fails without exposing a missing path", async () => {
  const missingPath = "/private/example/service-account.json";
  await assertRejects(
    () =>
      loadServiceAccount(missingPath, () => {
        throw new Deno.errors.NotFound();
      }),
    "Unable to read Google service account credentials file",
  );
  try {
    await loadServiceAccount(missingPath, () => {
      throw new Deno.errors.NotFound();
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(!message.includes(missingPath));
  }
});

Deno.test("loadServiceAccount rejects malformed credentials", async () => {
  await assertRejects(
    () => loadServiceAccount("unused", () => Promise.resolve("not json")),
    "must be valid JSON",
  );
  await assertRejects(
    () =>
      loadServiceAccount(
        "unused",
        () =>
          Promise.resolve(
            JSON.stringify({ client_email: "reader@example.com" }),
          ),
      ),
    "private_key",
  );
  await assertRejects(
    () =>
      loadServiceAccount(
        "unused",
        () =>
          Promise.resolve(
            JSON.stringify({
              type: "service_account",
              client_email: "reader@example.com",
              private_key: "not a pem",
              token_uri: "https://oauth2.googleapis.com/token",
            }),
          ),
      ),
    "PKCS#8 PEM key",
  );
});

Deno.test("createServiceAccountJwt signs deterministic RS256 claims", async () => {
  const { credentials, publicKey } = await createTestKeyMaterial();
  const now = Date.parse("2024-02-29T12:00:00.000Z");
  const jwt = await createServiceAccountJwt(credentials, now);
  const [encodedHeader, encodedClaims, encodedSignature] = jwt.split(".");

  assertEquals(decodeJwtPart(encodedHeader), { alg: "RS256", typ: "JWT" });
  assertEquals(decodeJwtPart(encodedClaims), {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: credentials.token_uri,
    iat: 1709208000,
    exp: 1709211600,
  });
  assert(
    await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`),
    ),
    "Expected the JWT signature to verify with the test public key",
  );
});

Deno.test("analyzer exchanges OAuth JWT and queries Search Analytics", async () => {
  const { credentials } = await createTestKeyMaterial();
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = ((input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (calls.length === 1) {
      return Promise.resolve(
        new Response(JSON.stringify({ access_token: "test-access-token" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    return Promise.resolve(
      new Response(
        JSON.stringify({
          rows: [
            {
              keys: ["first", "https://camadepilates.com/a"],
              clicks: 5,
              impressions: 100,
              ctr: 0,
              position: 2,
            },
            {
              keys: ["same score", "https://camadepilates.com/b"],
              clicks: 8,
              impressions: 50,
              ctr: 0,
              position: 0,
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
  }) as typeof fetch;

  const opportunities = await analyzeGscOpportunities(
    analyzerEnvironment(),
    () => Promise.resolve(JSON.stringify(credentials)),
    fetcher,
    new Date("2024-02-29T12:00:00.000Z"),
  );

  assertEquals(calls.length, 2);
  assertEquals(calls[0].url, credentials.token_uri);
  assertEquals(calls[0].init?.method, "POST");
  assertEquals(
    new Headers(calls[0].init?.headers).get("content-type"),
    "application/x-www-form-urlencoded",
  );
  const tokenBody = new URLSearchParams(String(calls[0].init?.body));
  assertEquals(
    tokenBody.get("grant_type"),
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
  );
  assertEquals(tokenBody.get("assertion")?.split(".").length, 3);

  assertEquals(
    calls[1].url,
    "https://searchconsole.googleapis.com/webmasters/v3/sites/" +
      "https%3A%2F%2Fcamadepilates.com%2F/searchAnalytics/query",
  );
  assertEquals(calls[1].init?.method, "POST");
  assertEquals(
    new Headers(calls[1].init?.headers).get("authorization"),
    "Bearer test-access-token",
  );
  assertEquals(JSON.parse(String(calls[1].init?.body)), {
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    dimensions: ["query", "page"],
    rowLimit: 25000,
  });
  assertEquals(
    opportunities.map((opportunity) => opportunity.query),
    ["first", "same score"],
  );
});

Deno.test("analyzer sanitizes OAuth and Search Analytics HTTP failures", async () => {
  const { credentials } = await createTestKeyMaterial();
  const credentialJson = JSON.stringify(credentials);
  const oauthSecret = "oauth-response-secret";
  const oauthFailure = (() =>
    Promise.resolve(
      new Response(oauthSecret, { status: 401 }),
    )) as typeof fetch;

  try {
    await analyzeGscOpportunities(
      analyzerEnvironment(),
      () => Promise.resolve(credentialJson),
      oauthFailure,
      new Date("2024-02-29T12:00:00.000Z"),
    );
    throw new Error("Expected OAuth failure");
  } catch (error) {
    const message = errorMessage(error);
    assert(message.includes("status 401"));
    assert(!message.includes(oauthSecret));
    assert(!message.includes(credentials.private_key));
  }

  const accessToken = "access-token-secret";
  let call = 0;
  const analyticsFailure = ((
    _input: string | URL | Request,
    _init?: RequestInit,
  ) => {
    call += 1;
    if (call === 1) {
      return Promise.resolve(
        new Response(JSON.stringify({ access_token: accessToken }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    return Promise.resolve(
      new Response(`failure includes ${accessToken}`, { status: 503 }),
    );
  }) as typeof fetch;

  try {
    await analyzeGscOpportunities(
      analyzerEnvironment(),
      () => Promise.resolve(credentialJson),
      analyticsFailure,
      new Date("2024-02-29T12:00:00.000Z"),
    );
    throw new Error("Expected Search Analytics failure");
  } catch (error) {
    const message = errorMessage(error);
    assert(message.includes("status 503"));
    assert(!message.includes(accessToken));
    assert(!message.includes(credentials.private_key));
  }
});

Deno.test("scoreOpportunities retains fields and sorts scores stably", () => {
  const opportunities = scoreOpportunities([
    {
      keys: ["high potential", "https://camadepilates.com/a"],
      clicks: 5,
      impressions: 100,
      ctr: 0,
      position: 2,
    },
    {
      keys: ["same score", "https://camadepilates.com/b"],
      clicks: 8,
      impressions: 50,
      ctr: 0,
      position: 0,
    },
    {
      keys: ["lower potential", "https://camadepilates.com/c"],
      clicks: 9,
      impressions: 100,
      ctr: 0.1,
      position: 10,
    },
    {
      keys: ["full ctr", "https://camadepilates.com/d"],
      clicks: 20,
      impressions: 20,
      ctr: 1,
      position: 1,
    },
  ]);

  assertEquals(
    opportunities.map((opportunity) => opportunity.query),
    ["high potential", "same score", "lower potential", "full ctr"],
  );
  assertEquals(opportunities[0], {
    query: "high potential",
    page: "https://camadepilates.com/a",
    clicks: 5,
    impressions: 100,
    ctr: 0,
    position: 2,
    score: 50,
  });
  assert(opportunities.every((opportunity) => opportunity.score >= 0));
  assertEquals(opportunities.at(-1)?.score, 0);
});

Deno.test("scoreOpportunities rejects out-of-bounds metrics", () => {
  assertThrows(
    () =>
      scoreOpportunities([
        {
          keys: ["invalid ctr", "https://camadepilates.com/"],
          clicks: 1,
          impressions: 1,
          ctr: 1.1,
          position: 1,
        },
      ]),
    "invalid ctr",
  );
  assertThrows(
    () =>
      scoreOpportunities([
        {
          keys: ["negative impressions", "https://camadepilates.com/"],
          clicks: 0,
          impressions: -1,
          ctr: 0,
          position: 1,
        },
      ]),
    "invalid impressions",
  );
});
