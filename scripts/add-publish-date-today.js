#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

function walkBlogs() {
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(BLOG_DIR, f));
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function main() {
  const files = walkBlogs();
  const today = todayISO();
  let updated = 0, skipped = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = matter(raw);
    if (fm.data && fm.data.publishDate) { skipped++; continue; }
    // Ensure frontmatter object exists
    const data = { ...(fm.data || {}) };
    data.publishDate = today;
    const out = matter.stringify(fm.content, data);
    fs.writeFileSync(file, out, 'utf8');
    updated++;
    console.log(`Updated publishDate: ${path.basename(file)} -> ${today}`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already had publishDate): ${skipped}`);
}

main();

