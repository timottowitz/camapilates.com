/// <reference lib="deno.ns" />

export interface ServiceAccountCredentials {
  type: "service_account";
  client_email: string;
  private_key: string;
  token_uri: string;
}

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows?: unknown[];
}

export interface GscOpportunity {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  score: number;
}

interface AnalyzerConfig {
  siteUrl: string;
  credentialsPath: string;
}

type Environment = Pick<typeof Deno.env, "get">;
type ReadTextFile = (path: string) => Promise<string>;

function requireValue(
  env: Environment,
  name: "GSC_SITE_URL" | "GOOGLE_APPLICATION_CREDENTIALS",
): string {
  const value = env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function requireAnalyzerConfig(
  env: Environment = Deno.env,
): AnalyzerConfig {
  const siteUrl = requireValue(env, "GSC_SITE_URL");
  if (
    !siteUrl.startsWith("sc-domain:") &&
    !/^https?:\/\/[^/]+/i.test(siteUrl)
  ) {
    throw new Error(
      "GSC_SITE_URL must be an http(s) URL or sc-domain property",
    );
  }
  return {
    siteUrl,
    credentialsPath: requireValue(env, "GOOGLE_APPLICATION_CREDENTIALS"),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function loadServiceAccount(
  credentialsPath: string,
  readTextFile: ReadTextFile = Deno.readTextFile,
): Promise<ServiceAccountCredentials> {
  let raw: string;
  try {
    raw = await readTextFile(credentialsPath);
  } catch {
    throw new Error("Unable to read Google service account credentials file");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Google service account credentials must be valid JSON");
  }
  if (!isRecord(parsed)) {
    throw new Error("Google service account credentials must be a JSON object");
  }

  const requiredString = (field: string): string => {
    const value = parsed[field];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(
        `Google service account credentials are missing required field: ${field}`,
      );
    }
    return value;
  };
  const clientEmail = requiredString("client_email");
  const privateKey = requiredString("private_key");
  const tokenUri = requiredString("token_uri");
  if (parsed.type !== "service_account") {
    throw new Error(
      "Google service account credentials have invalid type",
    );
  }
  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "Google service account private_key is not a PKCS#8 PEM key",
    );
  }
  let parsedTokenUri: URL;
  try {
    parsedTokenUri = new URL(tokenUri);
  } catch {
    throw new Error("Google service account token_uri must be a valid URL");
  }
  if (parsedTokenUri.protocol !== "https:") {
    throw new Error("Google service account token_uri must use HTTPS");
  }

  return {
    type: "service_account",
    client_email: clientEmail,
    private_key: privateKey,
    token_uri: tokenUri,
  };
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeJson(value: unknown): string {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToDer(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  try {
    return Uint8Array.from(
      atob(base64),
      (character) => character.charCodeAt(0),
    );
  } catch {
    throw new Error(
      "Google service account private_key contains invalid PEM data",
    );
  }
}

export async function createServiceAccountJwt(
  credentials: ServiceAccountCredentials,
  now = Date.now(),
): Promise<string> {
  const issuedAt = Math.floor(now / 1000);
  const unsigned = [
    encodeJson({ alg: "RS256", typ: "JWT" }),
    encodeJson({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: credentials.token_uri,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  ].join(".");
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "pkcs8",
      pemToDer(credentials.private_key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
  } catch {
    throw new Error(
      "Google service account private_key could not be imported",
    );
  }
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

async function fetchAccessToken(
  credentials: ServiceAccountCredentials,
  fetcher: typeof fetch,
  now: Date,
): Promise<string> {
  const assertion = await createServiceAccountJwt(credentials, now.getTime());
  const response = await fetcher(credentials.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Google OAuth token request failed with status ${response.status}`,
    );
  }
  const body: unknown = await response.json();
  if (
    !isRecord(body) || typeof body.access_token !== "string" ||
    !body.access_token
  ) {
    throw new Error(
      "Google OAuth token response did not include an access token",
    );
  }
  return body.access_token;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function searchDateRange(
  now = new Date(),
): { startDate: string; endDate: string } {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function fetchSearchAnalytics(
  siteUrl: string,
  accessToken: string,
  fetcher: typeof fetch,
  now: Date,
): Promise<SearchAnalyticsRow[]> {
  const { startDate, endDate } = searchDateRange(now);
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${
    encodeURIComponent(siteUrl)
  }/searchAnalytics/query`;
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 25000,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Search Console Search Analytics request failed with status ${response.status}`,
    );
  }
  const body: unknown = await response.json();
  if (!isRecord(body)) {
    throw new Error("Search Console returned a malformed response");
  }
  const rows = (body as SearchAnalyticsResponse).rows;
  if (rows === undefined) return [];
  if (!Array.isArray(rows)) {
    throw new Error("Search Console returned malformed rows");
  }
  return rows.map((row) => {
    if (!isRecord(row)) {
      throw new Error("Search Console returned a malformed row");
    }
    return row as unknown as SearchAnalyticsRow;
  });
}

function validateMetric(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Search Console row has invalid ${field}`);
  }
  return value;
}

export function scoreOpportunities(
  rows: SearchAnalyticsRow[],
): GscOpportunity[] {
  return rows
    .map((row, index) => {
      if (
        !Array.isArray(row.keys) ||
        row.keys.length < 2 ||
        row.keys.some((key) => typeof key !== "string")
      ) {
        throw new Error("Search Console row must include query and page keys");
      }
      const clicks = validateMetric(row.clicks, "clicks");
      const impressions = validateMetric(row.impressions, "impressions");
      const ctr = validateMetric(row.ctr, "ctr");
      const position = validateMetric(row.position, "position");
      if (ctr > 1) {
        throw new Error("Search Console row has invalid ctr");
      }
      return {
        index,
        opportunity: {
          query: row.keys[0],
          page: row.keys[1],
          clicks,
          impressions,
          ctr,
          position,
          score: impressions * (1 - ctr) / Math.max(position, 1),
        },
      };
    })
    .sort((left, right) =>
      right.opportunity.score - left.opportunity.score ||
      left.index - right.index
    )
    .map(({ opportunity }) => opportunity);
}

export async function analyzeGscOpportunities(
  env: Environment = Deno.env,
  readTextFile: ReadTextFile = Deno.readTextFile,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<GscOpportunity[]> {
  const config = requireAnalyzerConfig(env);
  const credentials = await loadServiceAccount(
    config.credentialsPath,
    readTextFile,
  );
  const accessToken = await fetchAccessToken(credentials, fetcher, now);
  const rows = await fetchSearchAnalytics(
    config.siteUrl,
    accessToken,
    fetcher,
    now,
  );
  return scoreOpportunities(rows);
}

if (import.meta.main) {
  try {
    const opportunities = await analyzeGscOpportunities();
    console.log(JSON.stringify(opportunities, null, 2));
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unknown analyzer error";
    console.error(`GSC opportunity analysis failed: ${message}`);
    Deno.exit(1);
  }
}
