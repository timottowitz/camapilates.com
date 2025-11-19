#!/usr/bin/env node

/**
 * CLI wrapper for the content writer agent.
 * Accepts JSON on stdin: { tool: string, parameters: object }
 * Forwards to the MCP agent functions and returns JSON result.
 */

import { writeBlogFromResearch, regenerateSection, previewOutline } from './mcp-content-writer-agent.js';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function main() {
  try {
    const request = await readStdin();
    const tool = request?.tool || request?.name;
    const params = request?.parameters || {};
    let result;

    switch (tool) {
      case 'write_blog_from_research':
        result = await writeBlogFromResearch(params.slug, params.forceOverwrite);
        break;
      case 'regenerate_section':
        result = await regenerateSection(params.slug, params.section);
        break;
      case 'preview_outline':
        result = await previewOutline(params.slug);
        break;
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    const message = error?.message || String(error);
    process.stderr.write(message + '\n');
    process.stdout.write(JSON.stringify({ success: false, error: message }));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
