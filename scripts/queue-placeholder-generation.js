#!/usr/bin/env node
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

function resolveConvexUrl() {
  return process.env.CONVEX_URL
    || process.env.VITE_CONVEX_URL
    || 'https://spotted-raven-102.convex.cloud';
}

async function main() {
  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);
  const pending = await client.query(api.placeholders.list, { token, status: 'pending' }).catch(() => []);
  const prompts = await client.query(api.placeholders.list, { token, status: 'prompt_generated' }).catch(() => []);
  const todos = [...pending, ...prompts];
  console.log(`Found ${todos.length} placeholders to generate`);
  let queued = 0, failed = 0;
  for (const p of todos) {
    try {
      await client.action(api.placeholderGeneration.queue, { token, placeholderId: p.placeholderId });
      queued++;
    } catch (e) {
      failed++;
      console.error(`Queue failed ${p.placeholderId}:`, e?.message || e);
    }
  }
  console.log(`Queued: ${queued}, Failed: ${failed}`);
}

main();
