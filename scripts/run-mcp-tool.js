#!/usr/bin/env node
// Minimal MCP client over stdio to call tools on the blog-image-agent server
import { spawn } from 'node:child_process';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { tool: null, args: {} };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--tool') {
      out.tool = args[++i];
    } else if (a === '--args') {
      try {
        out.args = JSON.parse(args[++i]);
      } catch (e) {
        console.error('Invalid JSON for --args');
        process.exit(2);
      }
    }
  }
  if (!out.tool) {
    console.error('Usage: run-mcp-tool --tool <name> [--args "{...}"]');
    process.exit(2);
  }
  return out;
}

const { tool, args } = parseArgs();

const child = spawn('node', ['scripts/mcp-image-agent.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buf = Buffer.alloc(0);
const pending = new Map();
let nextId = 1;

function send(method, params) {
  const id = nextId++;
  const payload = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
  const header = Buffer.from(
    `Content-Type: application/json; charset=utf-8\r\nContent-Length: ${payload.length}\r\n\r\n`
  );
  child.stdin.write(header);
  child.stdin.write(payload);
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

function tryParseMessages() {
  while (true) {
    const idx = buf.indexOf('\r\n\r\n');
    if (idx === -1) return;
    const headerPart = buf.slice(0, idx).toString('utf8');
    const match = /Content-Length: (\d+)/i.exec(headerPart);
    if (!match) {
      // Malformed, drop
      buf = buf.slice(idx + 4);
      continue;
    }
    const len = parseInt(match[1], 10);
    const start = idx + 4;
    if (buf.length < start + len) return; // wait for more
    const body = buf.slice(start, start + len).toString('utf8');
    buf = buf.slice(start + len);
    try {
      const msg = JSON.parse(body);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || 'Unknown MCP error'));
        else resolve(msg.result);
      } else {
        // Notifications ignored for this simple client
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

child.stdout.on('data', (data) => {
  buf = Buffer.concat([buf, data]);
  tryParseMessages();
});

let ready = false;
let readyResolve;
const readyPromise = new Promise((r) => (readyResolve = r));
child.stderr.on('data', (data) => {
  // surface server logs for visibility
  const s = data.toString();
  process.stderr.write(s);
  if (!ready && s.includes('MCP server running on stdio')) {
    ready = true;
    readyResolve();
  }
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`MCP server exited with code ${code}`);
    process.exit(code || 1);
  }
});

(async () => {
  try {
    // Wait for server readiness
    await readyPromise;
    // Ensure server is ready by calling tools/list first
    await send('tools/list', {});
    const res = await send('tools/call', { name: tool, arguments: args });
    const content = res && res.content ? res.content : [];
    for (const part of content) {
      if (part.type === 'text' && part.text) {
        console.log(part.text);
      }
    }
  } catch (e) {
    console.error('Error calling MCP tool:', e.message);
    process.exit(1);
  } finally {
    // Graceful shutdown
    child.kill('SIGINT');
  }
})();
