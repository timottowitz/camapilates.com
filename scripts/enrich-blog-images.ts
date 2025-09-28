// deno run --allow-read --allow-write --allow-env --allow-net scripts/enrich-blog-images.ts [--slug slug1,slug2] [--force]
// Adds heroImage to frontmatter and injects 2 contextual images after key H2 sections.

import matter from "npm:gray-matter";
import { dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";

interface Frontmatter { title?: string; slug?: string; heroImage?: string; [k: string]: unknown }

let UNSPLASH_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") || "";
if (!UNSPLASH_KEY) {
  // Try to load from .env.mcp at repo root
  try {
    const envRaw = await Deno.readTextFile(".env.mcp").catch(() => "");
    const m = envRaw.match(/^\s*UNSPLASH_ACCESS_KEY\s*=\s*([^\s#]+)\s*$/m);
    if (m) {
      UNSPLASH_KEY = m[1].trim();
      try { Deno.env.set("UNSPLASH_ACCESS_KEY", UNSPLASH_KEY); } catch {}
    }
  } catch {}
}
if (!UNSPLASH_KEY) {
  console.warn("UNSPLASH_ACCESS_KEY not set. Set it in environment or .env.mcp. Skipping downloads.");
}

const BLOG_DIR = "src/content/blog";
const IMG_DIR = "public/images/blog";

function usage() {
  console.log("Usage: enrich-blog-images.ts [--slug slug1,slug2] [--force]");
}

function parseArgs() {
  const args = new Map<string, string | boolean>();
  for (let i = 0; i < Deno.args.length; i++) {
    const a = Deno.args[i];
    if (a === "--help") return { help: true } as any;
    if (a === "--force") args.set("force", true);
    else if (a === "--slug") {
      args.set("slug", Deno.args[++i]);
    }
  }
  return args;
}

async function searchUnsplash(query: string): Promise<any | null> {
  if (!UNSPLASH_KEY) return null;
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "5");
  url.searchParams.set("client_id", UNSPLASH_KEY);
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.results?.[0] || null;
}

async function download(url: string, path: string) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to download ${url}`);
  await Deno.mkdir(dirname(path), { recursive: true }).catch(() => {});
  const arr = new Uint8Array(await resp.arrayBuffer());
  await Deno.writeFile(path, arr);
}

function listMarkdownFiles(): string[] {
  const out: string[] = [];
  for (const e of Deno.readDirSync(BLOG_DIR)) {
    if (e.isFile && e.name.endsWith(".md")) out.push(`${BLOG_DIR}/${e.name}`);
  }
  return out;
}

function pickSectionQueries(md: string, title: string): string[] {
  const q: string[] = [];
  const h2 = Array.from(md.matchAll(/^##\s+([^\n]+)$/gm)).map(m => m[1]);
  const candidates = h2.filter(s => s.length > 3).slice(0, 5);
  for (const c of candidates) {
    if (/precio|presupuesto|tco|garant|financiaci/i.test(c)) continue; // avoid finance visuals
    if (/faq/i.test(c)) continue;
    q.push(`${c} pilates reformer`);
    if (q.length >= 3) break;
  }
  if (q.length === 0) q.push(`${title} pilates reformer`, `reformer pilates estudio`, `reformer pilates casa`);
  return q.slice(0, 3);
}

function insertImageAfterHeading(md: string, heading: string, imgPath: string, caption?: string) {
  const re = new RegExp(`(^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$)`, "m");
  const m = md.match(re);
  if (!m) return md;
  const idx = m.index! + m[0].length;
  const before = md.slice(0, idx);
  const after = md.slice(idx);
  const cap = caption ? `\n<small>${caption}</small>\n` : "\n";
  return `${before}\n\n![${heading}](${imgPath})${cap}${after}`;
}

async function processFile(path: string, force = false) {
  const raw = await Deno.readTextFile(path);
  const fm = matter(raw);
  const data = (fm.data || {}) as Frontmatter;
  const slug = data.slug || path.split("/").pop()!.replace(/\.md$/, "");
  const title = data.title || slug;
  const outDir = `${IMG_DIR}/${slug}`;
  await Deno.mkdir(outDir, { recursive: true });

  // Hero image
  if (!data.heroImage || force) {
    const res = await searchUnsplash(`${title} pilates reformer`);
    if (res?.urls?.regular) {
      const heroFile = `${outDir}/hero.jpg`;
      await download(res.urls.regular, heroFile);
      data.heroImage = `/images/blog/${slug}/hero.jpg`;
      console.log(`Hero set for ${slug}`);
    }
  }

  // Section images
  const sectionQueries = pickSectionQueries(fm.content, title).slice(0, 2);
  let updated = fm.content;
  for (let i = 0; i < sectionQueries.length; i++) {
    const q = sectionQueries[i];
    const res = await searchUnsplash(q);
    if (!res?.urls?.regular) continue;
    const file = `${outDir}/section-${i + 1}.jpg`;
    await download(res.urls.regular, file);
    // Insert after heading if exists; else append at end
    const heading = q.replace(/\s*pilates reformer\s*$/i, "");
    const webPath = `/images/blog/${slug}/section-${i + 1}.jpg`;
    const credit = res.user ? `Foto: ${res.user.name} / Unsplash` : undefined;
    if (new RegExp(`^##\\s+${heading}$`, "m").test(updated)) {
      updated = insertImageAfterHeading(updated, heading, webPath, credit);
    } else {
      updated += `\n\n![${heading}](${webPath})\n${credit ? `<small>${credit}</small>` : ''}\n`;
    }
  }

  const newRaw = matter.stringify(updated, data as any);
  await Deno.writeTextFile(path, newRaw);
}

async function main() {
  const args = parseArgs();
  if ((args as any).help) return usage();
  const force = !!args.get("force");
  const files = listMarkdownFiles();
  let targets = files;
  const slugArg = args.get("slug") as string | undefined;
  if (slugArg) {
    const wanted = new Set(slugArg.split(/[,\s]+/).map(s => s.trim()).filter(Boolean));
    targets = files.filter(f => wanted.has(f.split("/").pop()!.replace(/\.md$/, "")));
  }
  for (const f of targets) {
    try {
      await processFile(f, force);
    } catch (e) {
      console.error("Failed:", f, e);
    }
  }
}

if (import.meta.main) main();
