/// <reference lib="deno.ns" />

import {
  loadServiceAccount,
  requireAnalyzerConfig,
  scoreOpportunities,
} from "./gsc-opportunities.ts";

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
    () => loadServiceAccount("unused", async () => "not json"),
    "must be valid JSON",
  );
  await assertRejects(
    () =>
      loadServiceAccount(
        "unused",
        async () => JSON.stringify({ client_email: "reader@example.com" }),
      ),
    "private_key",
  );
  await assertRejects(
    () =>
      loadServiceAccount(
        "unused",
        async () =>
          JSON.stringify({
            type: "service_account",
            client_email: "reader@example.com",
            private_key: "not a pem",
            token_uri: "https://oauth2.googleapis.com/token",
          }),
      ),
    "PKCS#8 PEM key",
  );
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
