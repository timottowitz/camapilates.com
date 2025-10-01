import { actionGeneric as action } from 'convex/server';
import { v } from 'convex/values';

type GhFile = { sha: string; content: string };

async function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CAMA-Pilates-Convex'
  } as Record<string, string>;
}

function repoInfo() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!repo) throw new Error('GITHUB_REPO not set');
  return { repo, branch };
}

export const ghGetFile = action({
  args: { path: v.string() },
  handler: async (ctx, { path }): Promise<GhFile | null> => {
    const { repo, branch } = repoInfo();
    const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    const resp = await fetch(url, { headers: await ghHeaders() });
    if (!resp.ok) return null;
    const j: any = await resp.json();
    const content = j.content ? Buffer.from(j.content.replace(/\n/g, ''), 'base64').toString('utf-8') : '';
    return { sha: j.sha, content };
  }
});

export const ghPutFile = action({
  args: { path: v.string(), content: v.string(), message: v.string(), sha: v.optional(v.string()) },
  handler: async (ctx, { path, content, message, sha }) => {
    const { repo, branch } = repoInfo();
    const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
    const body = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch,
      sha,
    };
    const resp = await fetch(url, { method: 'PUT', headers: { ...(await ghHeaders()), 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`GitHub PUT failed: ${resp.status} ${txt}`);
    }
    return { ok: true };
  }
});

