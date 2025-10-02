#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const ROOT = process.cwd();
const SCAN_FILE = path.join(ROOT, 'data', 'placeholder-scan.json');

function resolveConvexUrl() {
  return process.env.CONVEX_URL
    || process.env.VITE_CONVEX_URL
    || 'https://spotted-raven-102.convex.cloud';
}

async function main() {
  if (!fs.existsSync(SCAN_FILE)) {
    console.error('Scan file not found. Run: npm run scan:placeholders');
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(SCAN_FILE, 'utf8'));
  const items = Array.isArray(json?.placeholders) ? json.placeholders : [];
  const client = new ConvexHttpClient(resolveConvexUrl());

  let ok = 0, fail = 0;
  for (const p of items) {
    try {
      await client.mutation(api.placeholders.register, {
        placeholderId: p.placeholderId,
        pageType: p.pageType || 'page',
        pageSlug: p.pageSlug,
        location: p.location || 'inline',
        contextBefore: p.contextBefore,
        contextAfter: p.contextAfter,
        headingAbove: p.headingAbove,
        altText: undefined,
        figCaption: undefined,
        preferredAspectRatio: p.preferredAspectRatio || '16:9',
        preferredStyle: undefined,
        requiredSubjects: undefined,
        priority: p.priority || 60,
      });
      ok++;
    } catch (e) {
      fail++;
      console.error(`Failed ${p.placeholderId}:`, e?.message || e);
    }
  }

  console.log(`\n✅ Registered: ${ok}  ❌ Failed: ${fail}  Total: ${items.length}`);
}

main();
