#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'src', 'content', 'blog');

const pages = [
  // General
  { slug: 'is-solar-a-scam', title: 'Is Solar a Scam or Legit?', category: 'General', description: 'Debunking the myth that solar is a scam and explaining where real scams occur in the marketplace.', tags: ['solar', 'myth', 'education'] },
  { slug: 'solar-panel-scams-ripoffs', title: 'Solar Panel Scams & Rip-Offs: What to Watch For', category: 'Scam', description: 'Common solar scam tactics, red flags, and how to protect yourself as a homeowner.', tags: ['scams', 'consumer-protection'] },
  { slug: 'what-they-dont-tell-you-about-solar', title: "What They Don’t Tell You About Solar Panels", category: 'General', description: 'Hidden facts sales reps may skip: costs, contracts, performance, and maintenance realities.', tags: ['education'] },
  { slug: 'solar-companies-to-avoid', title: 'Solar Panel Companies to Avoid', category: 'Scam', description: 'A cautionary list of patterns and practices to avoid when choosing a solar provider.', tags: ['scams', 'due-diligence'] },
  { slug: 'renewable-energy-scam', title: 'Is Renewable Energy a Scam? Facts vs Fiction', category: 'General', description: 'Clarifying how renewable energy works and distinguishing legitimate projects from frauds.', tags: ['renewables', 'education'] },
  // Scam Types
  { slug: 'door-to-door-solar-scams', title: 'Door-to-Door Solar Scams: Don’t Get Pressured', category: 'Scam', description: 'How high-pressure doorstep tactics work and how to respond safely.', tags: ['door-to-door', 'sales'] },
  { slug: 'solar-spam-calls-scams', title: 'Solar Spam Calls & Telemarketing Scams', category: 'Scam', description: 'Phone and robocall scams using “free solar” or utility imposters—how to spot and stop them.', tags: ['telemarketing', 'robocalls'] },
  { slug: 'solares-enterprises-charge', title: '“Solares Enterprises” Charge on Your Card?', category: 'Scam', description: 'What a mysterious “Solares Enterprises” charge might mean and what to do next.', tags: ['billing', 'credit-card'] },
  { slug: 'solar-financing-scams', title: 'Solar Financing Traps & Credit Pitfalls', category: 'Scam', description: 'Understanding solar loans, PPAs, hidden fees, and how to protect your credit.', tags: ['financing', 'contracts'] },
  { slug: 'free-solar-panel-scams', title: '“Free Solar Panels” Offers — The Catch', category: 'Scam', description: 'Why “free solar” offers are rarely free, and how to verify genuine programs.', tags: ['marketing', 'offers'] },
  { slug: 'fake-solar-panels-scam', title: 'Fake or Substandard Solar Panels: How to Avoid', category: 'Scam', description: 'Signs of counterfeit or low-quality equipment and how to verify authenticity.', tags: ['equipment', 'quality'] },
  { slug: 'solar-installation-problems', title: 'Common Solar Installation Problems & Fixes', category: 'General', description: 'From roof leaks to delays—how to diagnose issues and pursue remedies.', tags: ['installation', 'issues'] },
  // Company-Specific (neutral phrasing; informational)
  { slug: 'stia-energy-scam', title: 'Stia Energy: Allegations & Consumer Guidance', category: 'Company', description: 'Summarizing publicly reported allegations and offering neutral consumer advice.', tags: ['company'] },
  { slug: 'national-solar-savings-scam', title: '“National Solar Savings”: Legit or Not?', category: 'Company', description: 'Investigating claims and signals to assess legitimacy of “National Solar Savings.”', tags: ['company'] },
  { slug: 'qualified-solar-survey-scam', title: '“Qualified Solar Survey” Calls — What to Know', category: 'Company', description: 'Explaining the reported “survey” calls and how to respond safely.', tags: ['telemarketing'] },
  { slug: 'vitl-power-pyramid-scheme', title: 'Vitl Power: Pyramid Scheme Allegations?', category: 'Company', description: 'Overview of public allegations and how to evaluate MLM-style pitches.', tags: ['company', 'mlm'] },
  { slug: 'ptm-solar-scam', title: 'PTM Solar: Reports & Consumer Options', category: 'Company', description: 'Summarizing public reports; how to document issues and file complaints.', tags: ['company'] },
  { slug: 'sunder-energy-pyramid-scheme', title: 'Sunder Energy: Pyramid Scheme Questions', category: 'Company', description: 'Understanding dealer networks and evaluating pyramid-scheme claims.', tags: ['company', 'mlm'] },
  { slug: 'better-earth-solar-lawsuit', title: 'Better Earth Solar: Lawsuit Overview', category: 'Company', description: 'High-level view of publicly reported legal actions; what customers can do.', tags: ['lawsuit', 'company'] },
  { slug: 'bright-planet-solar-lawsuit', title: 'Bright Planet Solar: Lawsuit Overview', category: 'Company', description: 'Summarizing publicly available lawsuit info and customer steps.', tags: ['lawsuit', 'company'] },
  { slug: 'cleanchoice-energy-scam', title: 'CleanChoice Energy: Scam or Legit Supplier?', category: 'Company', description: 'Context on retail energy suppliers and how to vet offers.', tags: ['supplier'] },
  { slug: 'everbright-solar-lawsuit', title: 'EverBright: Legal Actions & Customer Guidance', category: 'Company', description: 'Overview of reported legal matters involving EverBright; financing context.', tags: ['financing', 'lawsuit'] },
  { slug: 'goodleap-complaints-solar', title: 'GoodLeap Solar Loan Complaints — What to Know', category: 'Company', description: 'Understanding common loan complaints and borrower protections.', tags: ['financing', 'loans'] },
  { slug: 'delmar-energy-scam', title: 'Delmar Energy: Reports & Scam Signals', category: 'Company', description: 'What consumers report about Delmar Energy; how to verify claims.', tags: ['company'] },
  { slug: 'solar-relief-center-reviews', title: '“Solar Relief Center” Reviews & Legitimacy', category: 'Company', description: 'What people report about “Solar Relief Center”; legitimacy signals.', tags: ['reviews'] },
  { slug: 'solarquote-org-reviews', title: 'SolarQuote.org Reviews — How to Evaluate', category: 'Company', description: 'Lead-gen platforms explained; how to use safely and avoid spam.', tags: ['reviews', 'leadgen'] },
  { slug: 'is-nexamp-a-scam', title: 'Is Nexamp a Scam or Legit?', category: 'Company', description: 'Community solar context; how to evaluate Nexamp offerings safely.', tags: ['community-solar'] },
  { slug: 'lumio-solar-pyramid-scheme', title: 'Lumio Solar: Pyramid Scheme Claim Context', category: 'Company', description: 'Sales networks vs pyramid schemes—what’s the difference?', tags: ['mlm'] },
  { slug: 'trinity-solar-pyramid-scheme', title: 'Trinity Solar: Pyramid Scheme or Sales Network?', category: 'Company', description: 'Understanding referral networks and how to vet offers.', tags: ['mlm'] },
  { slug: 'nusun-power-pyramid-scheme', title: 'Nusun Power: Pyramid Scheme Allegations?', category: 'Company', description: 'Evaluating recruiting-heavy pitches and consumer safeguards.', tags: ['mlm'] },
  { slug: 'residence-energy-scam', title: 'Residence Energy: Scam Allegations & Tips', category: 'Company', description: 'Retail energy offers: how to verify terms and avoid lock-ins.', tags: ['supplier'] },
  { slug: 'smart-energy-gift-card-scam', title: '“Smart Energy” Gift Card Offers — Beware', category: 'Company', description: 'Gift-card incentives and the fine print to watch.', tags: ['telemarketing'] },
  { slug: 'sunrun-scam-controversy', title: 'Sunrun: Controversies & Customer Considerations', category: 'Company', description: 'Context on large installers: complaints vs legitimacy; contract tips.', tags: ['company'] },
  { slug: 'vivint-solar-fraud-texas', title: 'Vivint Solar Fraud in Texas — Overview', category: 'Company', description: 'Summarizing publicly reported Texas actions; guidance for affected consumers.', tags: ['texas', 'company'] },
  // Legal & Consumer
  { slug: 'solar-fraud-attorney', title: 'How to Sue a Solar Company — Finding an Attorney', category: 'Legal', description: 'When to consider legal action, how to choose counsel, and expected steps. Not legal advice.', tags: ['legal', 'attorney'] },
  { slug: 'solar-attorney-florida', title: 'Solar Fraud Attorneys in Florida', category: 'Legal', description: 'Florida-specific rights, agencies, and how to find counsel. Not legal advice.', tags: ['florida', 'legal'] },
  { slug: 'solar-attorney-california', title: 'Solar Fraud Attorneys in California', category: 'Legal', description: 'California protections and how to locate qualified counsel. Not legal advice.', tags: ['california', 'legal'] },
  { slug: 'energy-investment-fraud-attorneys', title: 'Energy Investment Fraud — Find an Attorney', category: 'Legal', description: 'Securities/investment issues in renewables and when to seek counsel. Not legal advice.', tags: ['investment', 'legal'] },
  { slug: 'solar-company-lawsuits', title: 'Major Lawsuits Against Solar Companies — Overview', category: 'Legal', description: 'A hub summarizing notable cases and consumer lessons.', tags: ['lawsuit'] },
  { slug: 'complaints-against-solar-companies', title: 'How to File Complaints Against Solar Companies', category: 'Legal', description: 'Agencies, BBB, and contractor boards — how to write effective complaints.', tags: ['complaints'] },
  // States
  { slug: 'solar-scams-texas', title: 'Solar Panel Scams in Texas — What to Know', category: 'State', description: 'Texas-specific scams, rights, and reporting resources.', tags: ['texas', 'state'] },
  { slug: 'solar-scams-florida', title: 'Solar Panel Scams in Florida — A Guide', category: 'State', description: 'Common Florida scams and how to report them.', tags: ['florida', 'state'] },
  { slug: 'solar-scams-california', title: 'Solar Panel Scams in California — A Guide', category: 'State', description: 'California trends, protections, and vetting tips.', tags: ['california', 'state'] },
  { slug: 'solar-scams-new-york', title: 'Solar Panel Scams in New York — A Guide', category: 'State', description: 'New York scam patterns and official resources.', tags: ['new-york', 'state'] },
  { slug: 'solar-scams-arizona', title: 'Solar Panel Scams in Arizona — A Guide', category: 'State', description: 'Arizona-specific scam notes and reporting.', tags: ['arizona', 'state'] },
  { slug: 'solar-scams-new-jersey', title: 'Solar Panel Scams in New Jersey — A Guide', category: 'State', description: 'New Jersey scams, door-to-door issues, and consumer resources.', tags: ['new-jersey', 'state'] },
  // Additional Resources
  { slug: 'community-solar-pyramid-scheme', title: 'Is Community Solar a Pyramid Scheme?', category: 'General', description: 'Explaining community solar vs pyramid schemes; consumer tips.', tags: ['community-solar'] },
  { slug: 'american-solar-calls-scam', title: '“American Solar” Telemarketing Calls — Inside the Scam', category: 'Scam', description: 'What these calls are, why you get them, and how to stop/report.', tags: ['telemarketing'] },
  { slug: 'solar-panels-are-a-joke', title: '“Solar Panels Are a Joke” — Debunking 5 Claims', category: 'General', description: 'Addressing common criticisms with facts and context.', tags: ['myth'] },
  { slug: 'avoid-solar-scams', title: 'How to Avoid Solar Panel Scams — 7 Tips', category: 'Scam', description: 'A practical checklist to vet offers, contracts, and financing.', tags: ['checklist'] },
];

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function fm(entry) {
  const now = new Date().toISOString().slice(0,10);
  return `---\n`+
    `title: "${entry.title}"\n`+
    `description: "${entry.description}"\n`+
    `category: "${entry.category}"\n`+
    `tags: [${(entry.tags||[]).map(t => `"${t}"`).join(', ')}]\n`+
    `publishDate: "${now}"\n`+
    `author: "Bennett Legal"\n`+
    `slug: "${entry.slug}"\n`+
    `featured: false\n`+
    `---\n\n`;
}

function body(entry) {
  return `# ${entry.title}\n\n`+
    `> Disclaimer: This article is informational, not legal advice. Allegations discussed are based on public reports as of ${new Date().toISOString().slice(0,10)}.\n\n`+
    `## Overview\n${entry.description}\n\n`+
    `## Key Points\n- Red flags and how to respond\n- How to verify offers and companies\n- Where to report concerns\n\n`+
    `## What To Do Next\nIf you believe you were misled or harmed, document everything (contracts, communications, invoices) and consider filing complaints with your state consumer protection agencies or consulting qualified counsel.\n`;
}

function run() {
  ensureDir(DEST);
  let created = 0;
  for (const p of pages) {
    const outFile = path.join(DEST, `${p.slug}.md`);
    if (fs.existsSync(outFile)) continue; // don’t overwrite existing
    fs.writeFileSync(outFile, fm(p) + body(p), 'utf8');
    created++;
  }
  console.log(`Seeded ${created} programmatic pages.`);
}

run();

