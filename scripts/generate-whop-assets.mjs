import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  console.log('🎨 Launching Playwright Chromium for asset generation...');
  const browser = await chromium.launch();

  // Load local base64 images for reliable rendering without an HTTP server
  console.log('📸 Loading local photograph textures as Base64...');
  const certHeroBase64 = `data:image/webp;base64,${fs.readFileSync('public/images/certification-hero.webp').toString('base64')}`;
  const aboutHeroBase64 = `data:image/webp;base64,${fs.readFileSync('public/images/about-hero.webp').toString('base64')}`;
  const edelweissHeroBase64 = `data:image/webp;base64,${fs.readFileSync('public/images/hero-edelweiss.webp').toString('base64')}`;

  // ==========================================
  // 1. GENERATE OFFICIAL LOGO (1024x1024)
  // ==========================================
  console.log('📐 Rendering Edelweiss Official Logo (1024x1024)...');
  const logoPage = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
  });

  const logoHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1024px;
      height: 1024px;
      background-color: #F8F8F6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 64px 60px;
      position: relative;
      overflow: hidden;
      color: #0F0F0F;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(42, 38, 36, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 38, 36, 0.04) 1px, transparent 1px);
      background-size: 36px 36px;
    }
    .technical-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      color: #71717A;
      z-index: 10;
    }
    .badge {
      background: #0F0F0F;
      color: #FFFFFF;
      padding: 8px 22px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22C55E;
      box-shadow: 0 0 8px #22C55E;
    }
    .center-symbol {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      position: relative;
      z-index: 10;
    }
    .brand-mark-card {
      width: 420px;
      height: 380px;
      background: #14323D;
      border-radius: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 30px 70px rgba(20, 50, 61, 0.28), 0 0 0 1px rgba(255,255,255,0.1);
      overflow: hidden;
    }
    .card-photo-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.26;
      mix-blend-mode: luminosity;
      filter: contrast(125%);
    }

    /* Official Top-Left Logo Styling with Red Dot */
    .brand-lockup {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }
    .brand-title-serif {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-weight: 700;
      font-size: 76px;
      color: #0F0F0F;
      letter-spacing: -0.02em;
      line-height: 0.95;
    }
    .brand-red-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #EB4C42;
      display: inline-block;
      margin-left: 2px;
      margin-bottom: 6px;
      box-shadow: 0 0 12px rgba(235, 76, 66, 0.45);
    }

    .brand-sub {
      font-size: 17px;
      font-weight: 700;
      color: #52525B;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      text-align: center;
      margin-top: 4px;
    }
    .color-pills {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }
    .pill-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 9999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(0,0,0,0.06);
    }
    .pill-teal { background: #E0F2FE; color: #0369A1; }
    .pill-terracotta { background: #FFEDD5; color: #C2410C; }
    .pill-sage { background: #DCFCE7; color: #15803D; }

    .technical-bottom {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E4E4E7;
      padding-top: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #71717A;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  
  <div class="technical-top">
    <span>• camadepilates.com</span>
    <div class="badge">
      <span class="badge-dot"></span>
      <span>[ COMUNIDAD OFICIAL WHOP ]</span>
    </div>
    <span>// FORMACIÓN CLÍNICA 2026</span>
  </div>

  <div class="center-symbol">
    <div class="brand-mark-card">
      <img class="card-photo-bg" src="${certHeroBase64}" alt="Edelweiss Pilates" />
      <svg width="360" height="340" viewBox="0 0 340 320" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: relative; z-index: 2;">
        <!-- Technical concentric blueprint guides -->
        <circle cx="170" cy="160" r="135" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.25"/>
        <circle cx="170" cy="160" r="95" stroke="#38BDF8" stroke-width="1" stroke-dasharray="3 3" opacity="0.3"/>

        <!-- 3D Isometric Reformer Apparatus Frame -->
        <path d="M 50 180 L 130 130 L 290 160 L 210 210 Z" fill="rgba(255, 255, 255, 0.08)" stroke="#7DD3FC" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="50" y1="180" x2="50" y2="220" stroke="#7DD3FC" stroke-width="2"/>
        <line x1="210" y1="210" x2="210" y2="250" stroke="#7DD3FC" stroke-width="2"/>
        <line x1="290" y1="160" x2="290" y2="200" stroke="#7DD3FC" stroke-width="2"/>
        <path d="M 50 220 L 210 250 L 290 200" stroke="#7DD3FC" stroke-width="2"/>

        <!-- Carriage Platform -->
        <path d="M 100 170 L 150 140 L 240 158 L 190 188 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
        
        <!-- Shoulder Blocks in Terracotta -->
        <circle cx="170" cy="153" r="6" fill="#BF4A20"/>
        <circle cx="195" cy="158" r="6" fill="#BF4A20"/>

        <!-- Biomechanical Joint Angle Arc -->
        <circle cx="140" cy="105" r="4" fill="#38BDF8"/>
        <circle cx="195" cy="80" r="4" fill="#38BDF8"/>
        <circle cx="240" cy="115" r="4" fill="#38BDF8"/>
        <line x1="140" y1="105" x2="195" y2="80" stroke="#38BDF8" stroke-width="2"/>
        <line x1="195" y1="80" x2="240" y2="115" stroke="#38BDF8" stroke-width="2"/>
        <text x="180" y="70" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#BAE6FD">118° EXT</text>

        <!-- Spring Tension Vector -->
        <line x1="85" y1="190" x2="125" y2="175" stroke="#FDE047" stroke-width="2.5" stroke-dasharray="3 2"/>
        <text x="60" y="268" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#BAE6FD">[ 3R / 1A · 18.5kg ]</text>
        <text x="185" y="268" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#7DD3FC">AXIS: C1-L5</text>
      </svg>
    </div>

    <!-- Official Brand Logo with Red Dot -->
    <div>
      <div class="brand-lockup">
        <span class="brand-title-serif">Edelweiss</span>
        <span class="brand-red-dot"></span>
      </div>
      <p class="brand-sub">Pilates Reformer · Formación Clínica</p>
    </div>

    <div class="color-pills">
      <span class="pill-item pill-teal">● 28h Básico ($25,000)</span>
      <span class="pill-item pill-terracotta">● 48h Completo ($38,000)</span>
      <span class="pill-item pill-sage">● Aval Clínico</span>
    </div>
  </div>

  <div class="technical-bottom">
    <span>[ QUERÉTARO · MONTERREY ]</span>
    <span>// MÁQUINA INDIVIDUAL POR ALUMNA</span>
    <span>camadepilates.com</span>
  </div>
</body>
</html>
  `;

  await logoPage.setContent(logoHtml);
  await logoPage.waitForTimeout(1000);
  const logoPath = '/tmp/whop-community-logo.png';
  await logoPage.screenshot({ path: logoPath, type: 'png' });
  console.log('✅ Logo captured successfully:', logoPath);
  await logoPage.close();

  // ==========================================
  // 2. GENERATE AVATAR (512x512)
  // ==========================================
  console.log('📐 Rendering Edelweiss Avatar Icon with Red Dot (512x512)...');
  const avatarPage = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  });

  const avatarHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,700;1,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 512px;
      height: 512px;
      background: #0B1D24;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .circle-frame {
      width: 512px;
      height: 512px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #1A3D4A 0%, #14323D 55%, #0B1D24 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 8px solid rgba(235, 76, 66, 0.35);
      box-shadow: inset 0 0 60px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.6);
    }
    .photo-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.28;
      mix-blend-mode: luminosity;
      filter: contrast(130%) saturate(80%);
    }
    .blueprint-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }
    .avatar-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .logo-row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 3px;
    }
    .logo-serif {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-weight: 700;
      font-size: 68px;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      line-height: 1;
      text-shadow: 0 4px 20px rgba(0,0,0,0.6);
    }
    .logo-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #EB4C42;
      display: inline-block;
      margin-left: 2px;
      margin-bottom: 6px;
      box-shadow: 0 0 14px rgba(235, 76, 66, 0.85);
    }
    .tagline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #FDE047;
      margin-top: 14px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .url-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.12em;
      color: #BAE6FD;
      margin-top: 6px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="circle-frame">
    <img class="photo-bg" src="${certHeroBase64}" alt="Edelweiss Pilates" />
    
    <svg class="blueprint-svg" viewBox="0 0 512 512" fill="none">
      <circle cx="256" cy="256" r="236" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.4"/>
      <circle cx="256" cy="256" r="180" stroke="#FDE047" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
      <circle cx="256" cy="256" r="120" stroke="#38BDF8" stroke-width="0.8" opacity="0.25"/>
      <line x1="256" y1="20" x2="256" y2="492" stroke="#38BDF8" stroke-width="0.75" stroke-dasharray="4 8" opacity="0.2"/>
      <line x1="20" y1="256" x2="492" y2="256" stroke="#38BDF8" stroke-width="0.75" stroke-dasharray="4 8" opacity="0.2"/>
    </svg>

    <div class="avatar-content">
      <div class="logo-row">
        <span class="logo-serif">Edelweiss</span>
        <span class="logo-dot"></span>
      </div>
      <div class="tagline">PILATES REFORMER</div>
      <div class="url-tag">camadepilates.com</div>
    </div>
  </div>
</body>
</html>
  `;

  await avatarPage.setContent(avatarHtml);
  await avatarPage.waitForTimeout(1000);
  const avatarPath = '/tmp/whop-community-avatar.png';
  await avatarPage.screenshot({ path: avatarPath, type: 'png' });
  console.log('✅ Avatar captured successfully:', avatarPath);
  await avatarPage.close();

  // =========================================================================
  // 3. GENERATE HEADER BANNER WITH PHOTO COMPOSITION (2000x1000)
  // =========================================================================
  console.log('📐 Rendering Edelweiss Header Banner with Official Top-Left Logo (2000x1000)...');
  const bannerPage = await browser.newPage({
    viewport: { width: 2000, height: 1000 },
    deviceScaleFactor: 1,
  });

  const bannerHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2000px;
      height: 1000px;
      background-color: #F8F8F6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 44px 54px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      color: #0F172A;
    }

    /* Subtle Architectural Grid */
    .blueprint-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(42, 38, 36, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 38, 36, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
    }

    /* Top Metadata Bar */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      position: relative;
    }

    /* Official Logo from camadepilates.com top-left corner */
    .brand-identity {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .site-logo-lockup {
      display: inline-flex;
      align-items: baseline;
      gap: 3px;
      text-decoration: none;
    }
    .logo-serif {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-weight: 700;
      font-size: 38px;
      color: #0F172A;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .logo-red-dot {
      width: 9px;
      height: 9px;
      background-color: #EB4C42;
      border-radius: 50%;
      display: inline-block;
      margin-left: 2px;
      margin-bottom: 4px;
      box-shadow: 0 0 10px rgba(235, 76, 66, 0.5);
    }
    .site-logo-pipe {
      font-size: 20px;
      color: #CBD5E1;
      font-weight: 300;
    }
    .site-logo-domain {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 600;
      color: #64748B;
      letter-spacing: 0.06em;
    }

    .top-badges {
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
    }
    .badge-pill {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      padding: 8px 18px;
      border-radius: 9999px;
      color: #334155;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-pill.dark {
      background: #0F172A;
      color: #FFFFFF;
      border-color: #0F172A;
    }
    .badge-live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22C55E;
      box-shadow: 0 0 6px #22C55E;
    }

    /* Hero Strip */
    .hero-strip {
      z-index: 10;
      position: relative;
      margin-top: 4px;
      margin-bottom: 12px;
    }
    .headline-main {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0F172A;
      line-height: 1.15;
    }
    .headline-sub {
      font-size: 17px;
      color: #475569;
      margin-top: 6px;
      max-width: 1100px;
      line-height: 1.5;
    }

    /* 3 Beautiful Duotone Photographic Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: 600px;
      z-index: 10;
      position: relative;
    }

    .card {
      border-radius: 36px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 34px 30px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
    }

    .card-photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      z-index: 1;
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    .card-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .card-title {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .card-desc {
      font-size: 14px;
      margin-top: 6px;
      line-height: 1.45;
      font-weight: 500;
    }

    .card-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 9999px;
      white-space: nowrap;
      letter-spacing: 0.08em;
    }

    .card-illustration-box {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
    }

    .card-meta-bar {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 14px;
      padding-right: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
    }

    /* Footer Strip */
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      position: relative;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
      padding-top: 18px;
    }
    .footer-domain {
      font-weight: 700;
      color: #0F172A;
    }
    .footer-action {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .arrow-icon-circle {
      position: absolute;
      bottom: 24px;
      right: 24px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 18px;
      z-index: 15;
    }
  </style>
</head>
<body>
  <div class="blueprint-grid"></div>

  <!-- TOP BAR WITH OFFICIAL EDELWEISS LOGO & CAMADEPILATES.COM -->
  <div class="top-bar">
    <div class="brand-identity">
      <div class="site-logo-lockup">
        <span class="logo-serif">Edelweiss</span>
        <span class="logo-red-dot"></span>
      </div>
      <span class="site-logo-pipe">|</span>
      <span class="site-logo-domain">camadepilates.com</span>
    </div>
    <div class="top-badges">
      <div class="badge-pill">
        <span class="badge-live-dot"></span>
        <span>[ WHOP COMMUNITY · EN VIVO ]</span>
      </div>
      <div class="badge-pill">[ QUERÉTARO · MONTERREY ]</div>
      <div class="badge-pill dark">[ 28H BÁSICO · 48H COMPLETO ]</div>
    </div>
  </div>

  <div class="hero-strip">
    <h1 class="headline-main">Formación clínica en cada movimiento.</h1>
    <p class="headline-sub">
      Campus virtual oficial en Whop, videoteca técnica HD, análisis biomecánico de muelles y docencia supervisada en cama de Pilates Reformer individual.
    </p>
  </div>

  <div class="cards-grid">
    <!-- CARD 1: SLATE TEAL (with certification-hero.webp photo + technical blueprint) -->
    <div class="card" style="background: #14323D;">
      <img class="card-photo" src="${certHeroBase64}" alt="Formación 28h / 48h" style="opacity: 0.32; mix-blend-mode: luminosity; filter: contrast(125%);" />
      <div class="card-overlay" style="background: linear-gradient(180deg, rgba(20, 50, 61, 0.92) 0%, rgba(16, 43, 53, 0.65) 50%, rgba(11, 30, 37, 0.95) 100%);"></div>
      
      <div class="card-content">
        <div class="card-header">
          <div>
            <h2 class="card-title">Formación 28h / 48h</h2>
            <p class="card-desc" style="color: #BAE6FD;">Módulos clínicos intensivos con máquina profesional individual exclusiva por alumna.</p>
          </div>
          <span class="card-badge" style="background: rgba(56, 189, 248, 0.2); color: #E0F2FE; border: 1px solid rgba(56, 189, 248, 0.4);">
            [ PRESENCIAL ]
          </span>
        </div>

        <div class="card-illustration-box">
          <svg width="340" height="230" viewBox="0 0 340 230" fill="none">
            <!-- Isometric Reformer Blueprints -->
            <path d="M 40 130 L 120 80 L 290 115 L 210 165 Z" fill="rgba(56, 189, 248, 0.12)" stroke="#7DD3FC" stroke-width="2"/>
            <line x1="40" y1="130" x2="40" y2="165" stroke="#7DD3FC" stroke-width="2"/>
            <line x1="210" y1="165" x2="210" y2="200" stroke="#7DD3FC" stroke-width="2"/>
            <line x1="290" y1="115" x2="290" y2="150" stroke="#7DD3FC" stroke-width="2"/>
            <path d="M 40 165 L 210 200 L 290 150" stroke="#7DD3FC" stroke-width="2"/>
            
            <!-- Carriage & Shoulder Rests -->
            <path d="M 90 120 L 140 90 L 230 110 L 180 140 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
            <circle cx="160" cy="103" r="5" fill="#BF4A20"/>
            <circle cx="185" cy="108" r="5" fill="#BF4A20"/>

            <!-- Spring Lines & Vectors -->
            <line x1="75" y1="140" x2="115" y2="125" stroke="#FDE047" stroke-width="2.5" stroke-dasharray="3 2"/>
            <line x1="79" y1="144" x2="119" y2="129" stroke="#EF4444" stroke-width="2.5"/>

            <!-- Biomechanical Angle Arc -->
            <path d="M 170 50 A 30 30 0 0 1 200 65" stroke="#38BDF8" stroke-width="2" stroke-dasharray="2 2"/>
            <circle cx="170" cy="50" r="3.5" fill="#38BDF8"/>
            <circle cx="200" cy="65" r="3.5" fill="#38BDF8"/>
            <text x="210" y="58" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#BAE6FD">118° EXT</text>

            <text x="30" y="210" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#7DD3FC">AXIS: C1-L5</text>
            <text x="200" y="210" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#FDE047">TORQUE: 24.5 Nm</text>
          </svg>
        </div>

        <div class="card-meta-bar" style="color: #BAE6FD;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #38BDF8;"></span>
            <span>Básico $25,000 / Completo $38,000</span>
          </div>
          <span>QRO · MTY</span>
        </div>
      </div>
      <div class="arrow-icon-circle">↗</div>
    </div>

    <!-- CARD 2: WARM TERRACOTTA (with about-hero.webp photo + live community sync) -->
    <div class="card" style="background: #BF4A20;">
      <img class="card-photo" src="${aboutHeroBase64}" alt="Comunidad Whop" style="opacity: 0.38; filter: contrast(120%) saturate(110%);" />
      <div class="card-overlay" style="background: linear-gradient(180deg, rgba(191, 74, 32, 0.90) 0%, rgba(155, 55, 20, 0.65) 50%, rgba(110, 36, 11, 0.95) 100%);"></div>

      <div class="card-content">
        <div class="card-header">
          <div>
            <h2 class="card-title">Comunidad Whop</h2>
            <p class="card-desc" style="color: #FFEDD5;">Canal oficial en vivo, bolsa de trabajo y red colaborativa de Querétaro y Monterrey.</p>
          </div>
          <span class="card-badge" style="background: rgba(254, 215, 170, 0.25); color: #FFF7ED; border: 1px solid rgba(254, 215, 170, 0.4);">
            [ RED EN VIVO ]
          </span>
        </div>

        <div class="card-illustration-box">
          <!-- Community Live Wave & Network Nodes -->
          <svg width="340" height="230" viewBox="0 0 340 230" fill="none">
            <circle cx="170" cy="110" r="70" stroke="#FFEDD5" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.35"/>
            <circle cx="170" cy="110" r="40" stroke="#FFEDD5" stroke-width="1.5" opacity="0.5"/>
            
            <!-- Center Hub Node -->
            <circle cx="170" cy="110" r="18" fill="#FFFFFF" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.2))"/>
            <circle cx="170" cy="110" r="7" fill="#BF4A20"/>

            <!-- Satellite Nodes (Instructor network) -->
            <line x1="170" y1="110" x2="100" y2="60" stroke="#FFEDD5" stroke-width="1.8" stroke-dasharray="3 3"/>
            <circle cx="100" cy="60" r="12" fill="#FFEDD5"/>
            <text x="75" y="40" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF7ED">CDMX</text>

            <line x1="170" y1="110" x2="245" y2="70" stroke="#FFEDD5" stroke-width="1.8" stroke-dasharray="3 3"/>
            <circle cx="245" cy="70" r="14" fill="#FFEDD5"/>
            <text x="235" y="48" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF7ED">MTY</text>

            <line x1="170" y1="110" x2="90" y2="160" stroke="#FFEDD5" stroke-width="1.8" stroke-dasharray="3 3"/>
            <circle cx="90" cy="160" r="10" fill="#FFEDD5"/>
            <text x="70" y="185" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF7ED">QRO</text>

            <line x1="170" y1="110" x2="240" y2="165" stroke="#FFEDD5" stroke-width="1.8" stroke-dasharray="3 3"/>
            <circle cx="240" cy="165" r="11" fill="#FFEDD5"/>
            <text x="230" y="190" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFF7ED">GDL</text>

            <!-- Active Pulses -->
            <circle cx="170" cy="110" r="95" stroke="#FED7AA" stroke-width="0.75" opacity="0.2"/>
          </svg>
        </div>

        <div class="card-meta-bar" style="color: #FFEDD5;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;"></span>
            <span>Whop Sync: 240+ Alumnas Activas</span>
          </div>
          <span>CANAL 24/7</span>
        </div>
      </div>
      <div class="arrow-icon-circle">↗</div>
    </div>

    <!-- CARD 3: SAGE GREEN (with hero-edelweiss.webp photo + clinical flowchart) -->
    <div class="card" style="background: #72927C;">
      <img class="card-photo" src="${edelweissHeroBase64}" alt="Mentoría Clínica" style="opacity: 0.35; filter: contrast(125%) saturate(60%);" />
      <div class="card-overlay" style="background: linear-gradient(180deg, rgba(114, 146, 124, 0.92) 0%, rgba(95, 126, 105, 0.65) 50%, rgba(55, 82, 64, 0.95) 100%);"></div>

      <div class="card-content">
        <div class="card-header">
          <div>
            <h2 class="card-title">Mentoría Clínica</h2>
            <p class="card-desc" style="color: #DCFCE7;">Patologías de columna, hernias discales, análisis postural y adaptaciones seguras.</p>
          </div>
          <span class="card-badge" style="background: rgba(220, 252, 231, 0.25); color: #F0FDF4; border: 1px solid rgba(220, 252, 231, 0.4);">
            [ BIOMECÁNICA ]
          </span>
        </div>

        <div class="card-illustration-box">
          <svg width="340" height="230" viewBox="0 0 340 230" fill="none">
            <!-- Spine Axis Flowchart -->
            <path d="M 170 30 C 185 70, 155 120, 170 170" stroke="#DCFCE7" stroke-width="3" stroke-dasharray="4 2"/>
            
            <!-- Vertebrae Nodes -->
            <rect x="148" y="38" width="44" height="20" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="1.5"/>
            <text x="156" y="52" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#166534">C1-C7</text>

            <rect x="146" y="80" width="48" height="22" rx="6" fill="#FFFFFF" stroke="#15803D" stroke-width="1.5"/>
            <text x="154" y="95" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#166534">T1-T12</text>

            <rect x="144" y="125" width="52" height="24" rx="6" fill="#DCFCE7" stroke="#15803D" stroke-width="2"/>
            <text x="152" y="141" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" fill="#14532D">L1-L5</text>

            <!-- Decompression Vector Arrows -->
            <line x1="120" y1="137" x2="90" y2="137" stroke="#FEF08A" stroke-width="2.5"/>
            <polygon points="85,137 93,133 93,141" fill="#FEF08A"/>
            <text x="45" y="132" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FEF08A">DESCOMPRESIÓN</text>

            <line x1="220" y1="137" x2="250" y2="137" stroke="#FEF08A" stroke-width="2.5"/>
            <polygon points="255,137 247,133 247,141" fill="#FEF08A"/>
            <text x="215" y="156" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#DCFCE7">MUELLE 1/2 AZUL</text>
          </svg>
        </div>

        <div class="card-meta-bar" style="color: #DCFCE7;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #86EFAC;"></span>
            <span>Gabi & Laura Munive</span>
          </div>
          <span>AVAL OFICIAL</span>
        </div>
      </div>
      <div class="arrow-icon-circle">↗</div>
    </div>
  </div>

  <!-- FOOTER BAR: STRICTLY CAMADEPILATES.COM AND WHOP -->
  <div class="footer-bar">
    <div>
      <span class="footer-domain">• camadepilates.com</span>
      <span>&nbsp;// &nbsp;PLATAFORMA OFICIAL WHOP & CURSOS PRESENCIALES</span>
    </div>
    <div style="color: #0F172A; font-weight: 700;">
      Curso Básico (28h · $25,000 MXN) &nbsp;· &nbsp;Certificación Completa (48h · $38,000 MXN)
    </div>
    <div class="footer-action">
      <span>whop.com/mexico-reformer-community</span>
      <span style="color: #059669; font-weight: 700;">● PRE-RESERVA $400 MXN</span>
    </div>
  </div>
</body>
</html>
  `;

  await bannerPage.setContent(bannerHtml);
  await bannerPage.waitForTimeout(1000);
  const bannerPath = '/tmp/whop-community-banner.png';
  await bannerPage.screenshot({ path: bannerPath, type: 'png' });
  console.log('✅ Header Banner captured successfully:', bannerPath);
  await bannerPage.close();

  await browser.close();

  // Copy rendered assets to public/images/whop/
  console.log('\n📂 Copying generated PNGs to public/images/whop/ and artifacts...');
  fs.mkdirSync('public/images/whop', { recursive: true });
  fs.copyFileSync(bannerPath, 'public/images/whop/whop-community-banner.png');
  fs.copyFileSync(logoPath, 'public/images/whop/whop-community-logo.png');
  fs.copyFileSync(avatarPath, 'public/images/whop/whop-community-avatar.png');

  const artifactDir = '/Users/m3max361tb/.gemini/antigravity/brain/f5fd5f09-3c53-40d6-b6f1-ddef24c82536';
  fs.copyFileSync(bannerPath, path.join(artifactDir, 'edelweiss-community-banner.png'));
  fs.copyFileSync(logoPath, path.join(artifactDir, 'edelweiss-community-logo.png'));
  fs.copyFileSync(avatarPath, path.join(artifactDir, 'edelweiss-community-avatar.png'));

  console.log('🎉 All 3 Edelweiss community assets generated successfully!');
  console.log('   Banner: 2000x1000 PNG -> public/images/whop/whop-community-banner.png');
  console.log('   Logo: 1024x1024 PNG -> public/images/whop/whop-community-logo.png');
  console.log('   Avatar: 512x512 PNG -> public/images/whop/whop-community-avatar.png');
}

generateAssets().catch((err) => {
  console.error('❌ Error generating assets:', err);
  process.exit(1);
});
