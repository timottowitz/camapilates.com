#!/usr/bin/env node

/**
 * BUZZ & Convex Real-time Lead Sync Daemon for camadepilates.com (Edelweiss)
 * 
 * Watches Convex database instances (`certificationPreRegistrations` table)
 * and posts every new signup/pre-registration or paid booking immediately
 * to the `cama-pilates-signups` channel in Buzz Desktop.
 */

import { ConvexClient } from 'convex/browser';
import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buzz Configuration
const BUZZ_CHANNEL_ID = '8a340e62-a52a-4d70-b322-9659dfa73218';
const BUZZ_RELAY_URL = 'wss://vargas-gonzalez-delombard.communities.buzz.xyz';
const BUZZ_CLI_PATH = '/Users/m3max361tb/.local/bin/buzz';
const BUZZ_PRIVATE_KEY = 'nsec1z85t2xfw69l8jsln6fluxxa7etxexxwtfm9dcur0zalqppnvy8sq77g0jr';
const BUZZ_AUTH_TAG = '["auth","3161e90a315fd1237a8d41bbbbca9f1258f4b8e9762fdbc09a06ab99f3acc0f4","","b48bc6982ca298b02b44cc322fbfac0da3d9ef92adc6a9f515468162d699a990741c27d1bbdc0f3ad9f61a016dbe474b7e4f861d04c63980f452f86e8542e152"]';

// Convex Endpoints (listen to both dev and prod deployments)
const CONVEX_ENDPOINTS = [
  { name: 'dev', url: 'https://scintillating-hornet-482.convex.cloud' },
  { name: 'prod', url: 'https://spotted-raven-102.convex.cloud' },
];

const notifiedIds = new Set();

function sendBuzzMessage(content) {
  try {
    const env = {
      ...process.env,
      BUZZ_RELAY_URL,
      BUZZ_PRIVATE_KEY,
      BUZZ_AUTH_TAG,
    };

    const stdout = execFileSync(
      BUZZ_CLI_PATH,
      ['messages', 'send', '--channel', BUZZ_CHANNEL_ID, '--content', content],
      { env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    const res = JSON.parse(stdout);
    return res.accepted === true;
  } catch (err) {
    console.error(`[BuzzSync] Failed to send message via buzz CLI:`, err.message);
    return false;
  }
}

function formatLeadCard(lead, envName = '') {
  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const waPreFill = encodeURIComponent(`Hola ${lead.fullName || ''}, te contactamos de CAMA Pilates (Edelweiss) respecto a tu registro para la Certificación Reformer.`);
  const waLink = cleanPhone ? `https://wa.me/52${cleanPhone}?text=${waPreFill}` : '';
  const waText = cleanPhone ? `[+52 ${cleanPhone}](${waLink})` : '_No proporcionado_';
  
  const dateStr = new Date(lead.submittedAt || lead._creationTime || Date.now()).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const cityTag = lead.city || 'Por confirmar';
  const cohortTag = lead.selectedCohort === 'queretaro-nov-2026'
    ? 'Querétaro (7 - 29 Nov 2026)'
    : lead.selectedCohort === 'monterrey-dec-jan-2026-2027'
    ? 'Monterrey (26 Dic 2026 - 27 Ene 2027)'
    : lead.selectedCohort || cityTag;

  const experience = lead.experienceLevel === 'beginner'
    ? 'Principiante / Sin experiencia'
    : lead.experienceLevel === 'some-experience'
    ? 'Con experiencia previa en Pilates / Fitness'
    : lead.experienceLevel === 'advanced'
    ? 'Instructora activa / Avanzado'
    : lead.experienceLevel || 'Interesada';

  const isEnrolled = lead.status === 'enrolled' || (lead.notes && lead.notes.toLowerCase().includes('whop'));
  const headerIcon = isEnrolled ? '💳' : '🎉';
  const headerTitle = isEnrolled
    ? '¡PAGO CONFIRMADO / ALUMNA INSCRITA!'
    : 'NUEVO REGISTRO / LISTA DE ESPERA';

  const lines = [
    `${headerIcon} **${headerTitle}** (${cityTag.toUpperCase()})`,
    '',
    `👤 **Aspirante:** **${lead.fullName}**`,
    `📧 **Email:** \`${lead.email}\``,
    `📱 **WhatsApp Directo:** ${waText}`,
    `📍 **Sede:** **${cityTag}**`,
    `🗓️ **Convocatoria:** ${cohortTag}`,
    `🎯 **Nivel:** ${experience}`,
    `🌐 **Canal de Origen:** \`${lead.source || 'web-direct'}\``,
    `⏰ **Fecha / Hora:** ${dateStr} CST`,
  ];

  if (isEnrolled && lead.notes) {
    lines.push(`💰 **Detalle de Pago:** ${lead.notes}`);
  } else if (lead.discountClaimed) {
    lines.push(`🏷️ **Beneficio:** Descuento y acceso prioritario reclamado`);
  }

  lines.push(`💾 **Registro Convex:** \`${lead._id}\` (${envName})`);

  return lines.join('\n');
}

async function processUnnotifiedSignups(client, envName) {
  try {
    const unnotified = await client.query('certificationPreRegistrations:getUnnotifiedSignups');
    if (!unnotified || unnotified.length === 0) return;

    for (const lead of unnotified) {
      if (notifiedIds.has(lead._id)) continue;

      console.log(`[BuzzSync][${envName}] Processing new lead: ${lead.fullName} (${lead.email}) [ID: ${lead._id}]`);
      notifiedIds.add(lead._id);

      const card = formatLeadCard(lead, envName);
      const ok = sendBuzzMessage(card);
      if (ok) {
        console.log(`[BuzzSync][${envName}] ✓ Buzz message sent and accepted!`);
        await client.mutation('certificationPreRegistrations:markSignupNotified', { id: lead._id });
      } else {
        console.warn(`[BuzzSync][${envName}] ✗ Failed to send message for lead ${lead._id}`);
        notifiedIds.delete(lead._id); // allow retry
      }
    }
  } catch (err) {
    console.error(`[BuzzSync][${envName}] Error checking unnotified signups:`, err.message);
  }
}

async function startDaemon() {
  console.log(`[BuzzSync] Initializing Lead Sync Daemon`);
  console.log(`[BuzzSync] Target Channel: cama-pilates-signups (${BUZZ_CHANNEL_ID})`);
  console.log(`[BuzzSync] Relay: ${BUZZ_RELAY_URL}`);

  // Test mode flag
  if (process.argv.includes('--test-lead')) {
    console.log('[BuzzSync] Sending a simulated test lead to Buzz...');
    const testLead = {
      _id: 'test_lead_' + Date.now(),
      fullName: 'Valeria Sotomayor',
      email: 'valeria.sotomayor@gmail.com',
      phone: '8112345678',
      city: 'Monterrey',
      selectedCohort: 'monterrey-dec-jan-2026-2027',
      experienceLevel: 'some-experience',
      source: 'webinar-whitelist',
      discountClaimed: true,
      status: 'new',
      submittedAt: Date.now(),
    };
    const card = formatLeadCard(testLead, 'test');
    const ok = sendBuzzMessage(card);
    console.log('[BuzzSync] Test lead sent:', ok ? 'SUCCESS' : 'FAILED');
    process.exit(ok ? 0 : 1);
  }

  for (const endpoint of CONVEX_ENDPOINTS) {
    try {
      const client = new ConvexClient(endpoint.url);
      console.log(`[BuzzSync] Connected to Convex [${endpoint.name}] (${endpoint.url})`);

      // 1. Check on startup
      await processUnnotifiedSignups(client, endpoint.name);

      // 2. Real-time subscription
      client.onUpdate('certificationPreRegistrations:getUnnotifiedSignups', {}, async (signups) => {
        if (signups && signups.length > 0) {
          console.log(`[BuzzSync][${endpoint.name}] Real-time trigger: ${signups.length} candidate(s) detected`);
          await processUnnotifiedSignups(client, endpoint.name);
        }
      });

      // 3. Fallback polling loop (every 20 seconds)
      setInterval(() => {
        processUnnotifiedSignups(client, endpoint.name);
      }, 20000);

    } catch (err) {
      console.error(`[BuzzSync] Failed to initialize endpoint ${endpoint.name}:`, err.message);
    }
  }

  console.log('[BuzzSync] All listeners active. Daemon running in background...');
}

startDaemon().catch((err) => {
  console.error('[BuzzSync] Fatal daemon error:', err);
  process.exit(1);
});
