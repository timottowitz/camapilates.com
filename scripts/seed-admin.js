#!/usr/bin/env node

/**
 * Seed Admin User via API
 * Usage:
 *   ADMIN_URL=https://your-site.com ADMIN_USER=admin ADMIN_PASS=secret node scripts/seed-admin.js
 */

const url = process.env.ADMIN_URL || process.env.SITE_URL;
const user = process.env.ADMIN_USER || 'admin';
const pass = process.env.ADMIN_PASS || '';

async function main() {
  if (!url) {
    console.error('Please set ADMIN_URL (or SITE_URL) to your deployed site origin, e.g., https://camadepilates.com');
    process.exit(1);
  }
  if (!pass) {
    console.error('Please set ADMIN_PASS to desired password. Optionally ADMIN_USER (default: admin).');
    process.exit(1);
  }
  const endpoint = url.replace(/\/$/, '') + '/api/admin/init';
  console.log(`Seeding admin at ${endpoint} for user ${user}...`);
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const text = await resp.text();
    if (!resp.ok) {
      console.error(`Failed (${resp.status}): ${text}`);
      process.exit(1);
    }
    console.log(text);
    console.log('✅ Admin seeded');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();

