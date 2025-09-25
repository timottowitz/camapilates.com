#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'blog');
const DEST = path.join(ROOT, 'src', 'content', 'blog');

const POSTS = [
  { slug: 'solar-panel-fraud-7-red-flags-2025-guide', date: '2025-03-01', category: 'Fraud Prevention', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Solar panel fraud is rising. Learn 7 red flags, how to verify companies and financing, and your first steps if you\'re targeted. Free case reviews from Bennett Legal.' },
  { slug: 'solar-dealer-fees-explained', date: '2025-02-28', category: 'Financing', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Many solar loans hide "dealer fees" in the price. See how fees change your total cost, what to ask lenders, and how to protect yourself. Free reviews from Bennett Legal.' },
  { slug: 'solar-installer-ghosted-action-plan', date: '2025-02-27', category: 'Legal Guidance', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'If your solar installer vanished, here\'s a day-by-day plan to secure records, push for activation/repairs, and escalate complaints. Free reviews from Bennett Legal.' },
  { slug: 'solar-panel-fraud-surge-protection-guide', date: '2025-02-28', category: 'Investigation', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Federal complaints about solar fraud jumped 746% since 2018. Learn how to spot the red flags, protect yourself from deceptive practices, and understand your legal options if you\'ve been victimized.' },
  { slug: 'free-ebook-texas-solar-fraud-guide', date: '2025-02-25', category: 'Free Resources', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Download our comprehensive free guide covering your legal rights, warning signs to watch for, and step-by-step actions to protect yourself from solar panel fraud in Texas.' },
  { slug: 'solar-fraud-crisis-2008-parallels', date: '2025-02-20', category: 'Investigation', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'An in-depth investigation into the solar fraud epidemic affecting 160,000 Americans, revealing disturbing parallels to the 2008 financial crisis and how AI technology is being used to fight back.' },
  { slug: 'texas-senate-bill-1036-solar-regulations', date: '2025-02-15', category: 'Legal Updates', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Comprehensive analysis of Texas\'s groundbreaking legislation to combat solar panel fraud and protect consumers from deceptive practices.' },
  { slug: 'how-to-spot-solar-panel-scams-texas', date: '2025-02-10', category: 'Fraud Prevention', author: 'Charles Bennett, Bennett Legal', featured: true, description: 'Essential guide to identifying solar panel fraud before you become a victim. Learn the warning signs that protect Texas homeowners.' },
  { slug: 'texas-homeowners-legal-rights-solar-fraud', date: '2025-02-08', category: 'Legal Guidance', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Comprehensive guide to your legal rights under Texas law when solar companies fail to deliver on their promises.' },
  { slug: 'texas-solar-panel-boom-fraud-crisis', date: '2025-02-05', category: 'Industry Analysis', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Investigation into how Texas\'s solar energy expansion created opportunities for widespread consumer fraud and financial devastation.' },
  { slug: 'texas-solar-panel-financing-fraud-compensation', date: '2025-02-03', category: 'Legal Guidance', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Detailed analysis of predatory solar financing practices and how Texas homeowners can recover compensation under consumer protection laws.' },
  { slug: 'understanding-solar-panel-fraud-red-flags', date: '2025-01-15', category: 'Fraud Prevention', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Learn to identify the warning signs of solar panel scams and protect yourself from fraudulent solar companies.' },
  { slug: 'legal-rights-solar-companies', date: '2025-01-20', category: 'Legal Guidance', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Know your consumer rights and legal protections when purchasing solar panels in Texas.' },
  { slug: 'how-to-report-solar-panel-fraud', date: '2025-02-01', category: 'Legal Guidance', author: 'Charles Bennett, Bennett Legal', featured: false, description: 'Complete guide on reporting solar fraud to authorities and taking legal action to recover your losses.' },
  { slug: 'how-to-make-related-articles-dynamic', date: '2025-09-24', category: 'Site Updates', author: 'Bennett Legal Team', featured: false, description: 'Replace hardcoded related links with automatic suggestions using metadata signals.' }
];

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function toFrontmatter(obj) {
  const safe = (v) => String(v).replace(/"/g, '\\"');
  const tags = obj.tags && obj.tags.length ? `\ntags: [${obj.tags.map(t => '"'+safe(t)+'"').join(', ')}]` : '';
  const featured = obj.featured ? '\nfeatured: true' : '';
  return `---\ntitle: "${safe(obj.title)}"\ndescription: "${safe(obj.description)}"\ncategory: "${safe(obj.category)}"${tags}\npublishDate: "${safe(obj.date)}"\nauthor: "${safe(obj.author)}"\nslug: "${safe(obj.slug)}"${featured}\n---\n\n`;
}

function run() {
  ensureDir(DEST);
  for (const p of POSTS) {
    const srcFile = path.join(SRC, `${p.slug}.md`);
    if (!fs.existsSync(srcFile)) {
      console.warn('Missing source post:', p.slug);
      continue;
    }
    const md = fs.readFileSync(srcFile, 'utf8');
    const title = extractTitle(md) || p.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const fm = toFrontmatter({ ...p, title });
    const out = fm + md;
    const destFile = path.join(DEST, `${p.slug}.md`);
    fs.writeFileSync(destFile, out, 'utf8');
    console.log('Migrated', p.slug);
  }
}

run();

