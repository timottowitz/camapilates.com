#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const ROOT = process.cwd();
const SCAN_FILE = path.join(ROOT, 'data', 'placeholder-scan.json');

function resolveConvexUrl() {
  return process.env.CONVEX_URL
    || process.env.VITE_CONVEX_URL
    || 'https://spotted-raven-102.convex.cloud';
}

function classify(heading = '', location = '') {
  const h = heading.toLowerCase();
  const inlineIdx = Number((location.match(/inline-(\d+)/) || [0, 0])[1] || 0);
  // Defaults
  let preferredStyle = inlineIdx <= 1 ? 'lifestyle' : 'professional';
  let requiredSubjects = ['reformer'];

  // Heuristic rules
  if (/comparativa|comparaci[oó]n|vs|versus|precios|tabla|dimensiones|medidas/.test(h)) {
    preferredStyle = 'technical';
    requiredSubjects = ['reformer', 'comparison'];
  } else if (/ejercicio|beneficio|movimiento|rutina|postura|salud/.test(h)) {
    preferredStyle = 'lifestyle';
    requiredSubjects = ['person', 'reformer', 'instructor'];
  } else if (/mantenimiento|cuidado|limpieza|repuestos|garant[ií]a/.test(h)) {
    preferredStyle = 'product';
    requiredSubjects = ['reformer', 'tools'];
  } else if (/estudio|cdmx|ciudad|directorio|clase|instructor/.test(h)) {
    preferredStyle = 'studio';
    requiredSubjects = ['studio interior', 'reformer lineup'];
  }

  return { preferredStyle, requiredSubjects };
}

async function main() {
  if (!fs.existsSync(SCAN_FILE)) {
    console.error('Scan file not found. Run: npm run scan:placeholders');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(SCAN_FILE, 'utf8'));
  const placeholders = (data.placeholders || []).filter((p) => p.pageType === 'blog');

  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);
  let updated = 0;
  for (const p of placeholders) {
    const { preferredStyle, requiredSubjects } = classify(p.headingAbove, p.location);
    try {
      await client.mutation(api.placeholders.register, {
        token,
        placeholderId: p.placeholderId,
        pageType: 'blog',
        pageSlug: p.pageSlug,
        location: p.location,
        contextBefore: p.contextBefore,
        contextAfter: p.contextAfter,
        headingAbove: p.headingAbove,
        preferredAspectRatio: p.preferredAspectRatio || '16:9',
        preferredStyle,
        requiredSubjects,
        priority: p.priority || 60,
      });
      updated++;
    } catch (e) {
      console.error(`Failed to update ${p.placeholderId}:`, e?.message || e);
    }
  }
  console.log(`Updated preferences for ${updated} blog placeholders.`);
}

main();
