// Validate blog content frontmatter for SEO quality
// - unique, non-empty descriptions
// - presence of title and publishDate
// - warn on duplicate slugs

// deno run --allow-read scripts/validate-content.ts

import matter from 'gray-matter';

type Issue = { file: string; message: string };
type Warning = { file: string; message: string };

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isFile && path.endsWith('.md')) yield path;
    else if (entry.isDirectory) yield* walk(path);
  }
}

function slugFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1].replace(/\.md$/i, '');
}

const issues: Issue[] = [];
const warnings: Warning[] = [];
const descSet = new Map<string, string>(); // desc -> file
const slugSet = new Map<string, string>(); // slug -> file

for await (const file of walk('src/content/blog')) {
  const raw = await Deno.readTextFile(file);
  const sanitized = raw.replace(/^\uFEFF/, '').replace(/^\s*\n(?=---)/, '');
  const { data, content } = matter(sanitized);
  const fm = (data || {}) as Record<string, unknown>;

  const title = String(fm.title || '').trim();
  if (!title) issues.push({ file, message: 'Missing frontmatter: title' });

  const publishDate = String(fm.publishDate || '').trim();
  if (!publishDate) issues.push({ file, message: 'Missing frontmatter: publishDate' });
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) warnings.push({ file, message: 'publishDate should be YYYY-MM-DD' });

  const description = String(fm.description || '').trim();
  if (!description) {
    issues.push({ file, message: 'Missing frontmatter: description' });
  } else {
    const key = description.toLowerCase();
    const existing = descSet.get(key);
    if (existing && existing !== file) {
      issues.push({ file, message: `Duplicate description also in: ${existing}` });
    } else {
      descSet.set(key, file);
    }
    if (description.length < 80 || description.length > 180) {
      issues.push({ file, message: `Description length should be ~150 chars (80–180). Got ${description.length}` });
    }
  }

  const slug = String(fm.slug || slugFromPath(file)).toLowerCase();
  const existingSlug = slugSet.get(slug);
  if (existingSlug && existingSlug !== file) {
    issues.push({ file, message: `Duplicate slug "${slug}" also in: ${existingSlug}` });
  } else {
    slugSet.set(slug, file);
  }

  // Canonical URL should be absolute if present
  const canonical = String(fm.canonical || '').trim();
  if (canonical && !/^https?:\/\//i.test(canonical)) {
    warnings.push({ file, message: 'canonical should be an absolute URL (https://...)' });
  }

  // H1 should include the primary keyword at least once (recommendation)
  const m = content.match(/^\s*#\s+([^\n]+)/m);
  if (!m) {
    warnings.push({ file, message: 'No H1 found in markdown content (a top-level # heading is recommended).' });
  } else {
    const h1 = m[1].toLowerCase();
    if (!h1.includes('cama de pilates')) {
      warnings.push({ file, message: "H1 doesn't contain the primary keyword 'cama de pilates'" });
    }
  }
}

if (issues.length > 0) {
  console.error('\nContent validation failed:\n');
  for (const i of issues) console.error(`- ${i.file}: ${i.message}`);
  if (warnings.length) {
    console.error('\nWarnings:\n');
    for (const w of warnings) console.error(`- ${w.file}: ${w.message}`);
  }
  Deno.exit(1);
} else {
  if (warnings.length) {
    console.warn('\nContent validation warnings:\n');
    for (const w of warnings) console.warn(`- ${w.file}: ${w.message}`);
  }
  console.log('Content validation passed.');
}
