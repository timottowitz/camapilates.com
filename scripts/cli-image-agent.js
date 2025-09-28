#!/usr/bin/env node

/**
 * Lightweight CLI wrapper for Blog Image Agent
 * Tool: enrich_specific_blogs { slugs?, slug?, force? }
 * No-ops (does not call Unsplash). Returns success with echo of inputs.
 */

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function main() {
  try {
    const req = await readStdin();
    const tool = req?.tool || req?.name;
    const p = req?.parameters || {};
    switch (tool) {
      case 'enrich_specific_blogs': {
        const slugs = Array.isArray(p.slugs) ? p.slugs : (p.slug ? [p.slug] : []);
        const res = { success: true, processed: slugs, note: 'Wrapper no-op (images not fetched in this mode)' };
        process.stdout.write(JSON.stringify(res));
        process.exit(0);
        return;
      }
      default:
        process.stdout.write(JSON.stringify({ success: false, error: `Unknown tool: ${tool}` }));
        process.exit(1);
    }
  } catch (err) {
    const msg = err?.message || String(err);
    process.stderr.write(msg + '\n');
    process.stdout.write(JSON.stringify({ success: false, error: msg }));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

