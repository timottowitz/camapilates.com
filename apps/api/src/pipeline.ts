import type { Env } from './types';

type PipelineMessage = {
  slug: string;
  stage?: 'web_research' | 'write_blog' | 'seo' | 'quality' | 'finalize';
  title?: string;
  category?: string;
  keywords?: string[];
};

async function ghGetFile(env: Env, path: string): Promise<{ sha: string; content: string } | null> {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !token) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' } });
  if (!resp.ok) return null;
  const j: any = await resp.json();
  const content = j.content ? atob(j.content.replace(/\n/g, '')) : '';
  return { sha: j.sha, content };
}
async function ghPutFile(env: Env, path: string, content: string, message: string, sha?: string) {
  const repo = env.GITHUB_REPO; const token = env.GITHUB_TOKEN; const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !token) throw new Error('GitHub not configured');
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch, sha };
  const resp = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CAMA-Pilates-API' }, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${await resp.text()}`);
}

async function appendWebResearch(env: Env, slug: string, title?: string, category?: string) {
  const p = `blog-planning/research/${slug}.md`;
  const f = await ghGetFile(env, p);
  if (!f) return;
  const date = new Date().toISOString().split('T')[0];
  const block = `\n\n## Web Research Data\n\n> Fecha: ${date}\n> Tema: ${title || slug}\n\n### Datos recopilados\n- statistics:\n  - Mercado MX en crecimiento\n- studies:\n  - Beneficios documentados en dolor lumbar\n\n### Fuentes necesarias\n- INEGI\n- Secretaría de Salud\n\n### Próximos pasos\n- Validar cifras y precios en MXN\n`;
  const updated = f.content.includes('## Web Research Data') ? f.content.replace(/## Web Research Data[\s\S]*$/m, block) : (f.content + block);
  await ghPutFile(env, p, updated, `chore(pipeline): append web research ${slug}`, f.sha);
}

async function writeBlogFromResearch(env: Env, slug: string, title: string, category: string, keywords: string[]) {
  const outPath = `src/content/blog/${slug}.md`;
  const existing = await ghGetFile(env, outPath);
  if (existing) return; // don't overwrite
  const desc = `Guía práctica sobre ${title.toLowerCase()} con enfoque en México: consejos y pasos accionables.`.slice(0, 155);
  const fm = [
    '---',
    `title: "${title}"`,
    `description: "${desc}"`,
    `category: "${category}"`,
    `tags: [${keywords.map(k => `"${k}"`).join(', ')}]`,
    `publishDate: "${new Date().toISOString().slice(0, 10)}"`,
    `author: "CAMA Pilates"`,
    `slug: "${slug}"`,
    'featured: false',
    '---',
    '',
    `# ${title}`,
    '',
    '> Nota: Contenido informativo; no es asesoramiento médico.',
    '',
    '## Resumen',
    'Introducción breve al tema con enfoque mexicano, beneficios principales y a quién le sirve.',
    '',
    '<see-also limit="3" />',
    '',
    '## Recomendaciones CAMA Pilates',
    'CAMA Pilates ofrece calidad premium con ingeniería alemana y manufactura mexicana.',
    '',
    `## FAQ\n### ¿Cuál es el primer paso recomendado?\nEmpieza con una evaluación básica y progresiones seguras; prioriza la técnica.\n`
  ].join('\n');
  await ghPutFile(env, outPath, fm, `feat(blog): create post ${slug}`);
}

function clampDescription(d: string) { return d.length > 155 ? d.slice(0, 152) + '…' : d; }

async function optimizeSeo(env: Env, slug: string, targetKeyword?: string) {
  const file = `src/content/blog/${slug}.md`;
  const f = await ghGetFile(env, file);
  if (!f) return;
  const txt = f.content;
  const m = txt.match(/^---([\s\S]*?)---/);
  if (!m) return;
  let fm = m[0];
  // Description clamp
  const dm = /\ndescription:\s*"([^"]*)"/;
  const dMatch = dm.exec(fm);
  if (dMatch) fm = fm.replace(dm, `\ndescription: "${clampDescription(dMatch[1])}"`);
  // Title keyword (soft)
  if (targetKeyword) {
    const tm = /\ntitle:\s*"([^"]+)"/;
    const tMatch = tm.exec(fm);
    if (tMatch && !tMatch[1].toLowerCase().includes(targetKeyword.toLowerCase()) && tMatch[1].length < 54) {
      const newTitle = `${tMatch[1]} – ${targetKeyword}`;
      fm = fm.replace(tm, `\ntitle: "${newTitle}"`);
    }
  }
  const updated = fm + txt.slice(fm.length);
  if (updated !== txt) await ghPutFile(env, file, updated, `chore(seo): optimize ${slug}`, f.sha);
}

function qualityScoreOf(content: string) {
  const body = content.replace(/^---[\s\S]*?---/, '');
  const words = (body.match(/\b\w+\b/g) || []).length;
  const hasH1 = /^\s*#\s+/m.test(body);
  const hasFAQ = /\n##\s*FAQ\b/i.test(body);
  const hasSeeAlso = /<see-also\b[^>]*\/>/i.test(body);
  const hasHubList = /<hub-list\b[^>]*\/>/i.test(body);
  let score = 80;
  if (words >= 800) score += 5;
  if (hasH1) score += 2;
  if (hasFAQ) score += 4;
  if (hasSeeAlso) score += 3;
  if (hasHubList) score += 3;
  return { score: Math.min(100, score), words, hasH1, hasFAQ, hasSeeAlso, hasHubList };
}

async function runQuality(env: Env, slug: string) {
  const file = `src/content/blog/${slug}.md`;
  const f = await ghGetFile(env, file);
  if (!f) return;
  const q = qualityScoreOf(f.content);
  const ts = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT OR REPLACE INTO blog_quality (slug, overall_score, words, has_h1, has_faq, has_seealso, has_hublist, updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)')
    .bind(slug, q.score, q.words, q.hasH1 ? 1 : 0, q.hasFAQ ? 1 : 0, q.hasSeeAlso ? 1 : 0, q.hasHubList ? 1 : 0, ts).run();
}

export default {
  async queue(batch: MessageBatch<PipelineMessage>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      const { slug, stage, title, category, keywords = [] } = msg.body;
      try {
        switch (stage) {
          case 'web_research':
            await appendWebResearch(env, slug, title, category);
            break;
          case 'write_blog':
            if (title && category) await writeBlogFromResearch(env, slug, title, category, keywords);
            break;
          case 'seo':
            await optimizeSeo(env, slug, keywords?.[0]);
            break;
          case 'quality':
            await runQuality(env, slug);
            break;
          default:
            // Simple default: append research then write blog
            await appendWebResearch(env, slug, title, category);
            if (title && category) await writeBlogFromResearch(env, slug, title, category, keywords);
        }
      } catch (e) {
        // log and continue
        console.error('pipeline error', slug, e);
        throw e; // let retry handle it
      }
    }
  }
}
