#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SCAN_FILE = path.join(ROOT, 'data', 'placeholder-scan.json');
const OUT_FILE = path.join(ROOT, 'data', 'placeholder-report.csv');

function toCSVRow(fields) {
  return fields.map(v => {
    const s = v == null ? '' : String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }).join(',');
}

function main() {
  if (!fs.existsSync(SCAN_FILE)) {
    console.error('Scan file not found. Run scan first.');
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(SCAN_FILE, 'utf8'));
  const items = Array.isArray(json?.placeholders) ? json.placeholders : [];
  const header = ['placeholderId','pageType','pageSlug','location','filePath','line','aspect','priority','heading'];
  const rows = [toCSVRow(header)];
  for (const p of items) {
    rows.push(toCSVRow([
      p.placeholderId,
      p.pageType || '',
      p.pageSlug || '',
      p.location || '',
      p.filePath || '',
      p.line || '',
      p.preferredAspectRatio || '',
      p.priority || '',
      (p.headingAbove || '').slice(0, 100)
    ]));
  }
  fs.writeFileSync(OUT_FILE, rows.join('\n'), 'utf8');
  console.log(`Written: ${path.relative(ROOT, OUT_FILE)}`);
}

main();

