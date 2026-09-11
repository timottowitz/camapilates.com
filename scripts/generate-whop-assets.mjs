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

  // 1. GENERATE LOGO (1024x1024)
  console.log('📐 Rendering Edelweiss Whop Community Official Logo (1024x1024)...');
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
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
      padding: 70px 60px;
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
      gap: 22px;
      position: relative;
      z-index: 10;
    }
    .brand-mark-card {
      width: 400px;
      height: 400px;
      background: #14323D;
      border-radius: 48px;
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
      opacity: 0.25;
      mix-blend-mode: luminosity;
      filter: contrast(125%);
    }
    .brand-title {
      font-size: 56px;
      font-weight: 900;
      color: #0F0F0F;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      line-height: 1;
      text-align: center;
    }
    .brand-sub {
      font-size: 18px;
      font-weight: 700;
      color: #52525B;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      text-align: center;
      margin-top: 8px;
    }
    .color-pills {
      display: flex;
      gap: 12px;
      margin-top: 6px;
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
      <span>[ EDELWEISS · COMUNIDAD WHOP ]</span>
    </div>
    <span>// FORMACIÓN 2026</span>
  </div>

  <div class="center-symbol">
    <div class="brand-mark-card">
      <img class="card-photo-bg" src="${certHeroBase64}" alt="Edelweiss Pilates" />
      <svg width="360" height="360" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: relative; z-index: 2;">
        <!-- Technical concentric blueprint guides -->
        <circle cx="170" cy="170" r="140" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.25"/>
        <circle cx="170" cy="170" r="100" stroke="#38BDF8" stroke-width="1" stroke-dasharray="3 3" opacity="0.3"/>
        <circle cx="170" cy="170" r="60" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.35"/>

        <!-- 3D Isometric Reformer Apparatus Frame -->
        <path d="M 50 190 L 130 140 L 290 170 L 210 220 Z" fill="rgba(255, 255, 255, 0.08)" stroke="#7DD3FC" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="50" y1="190" x2="50" y2="230" stroke="#7DD3FC" stroke-width="2"/>
        <line x1="210" y1="220" x2="210" y2="260" stroke="#7DD3FC" stroke-width="2"/>
        <line x1="290" y1="170" x2="290" y2="210" stroke="#7DD3FC" stroke-width="2"/>
        <path d="M 50 230 L 210 260 L 290 210" stroke="#7DD3FC" stroke-width="2"/>

        <!-- Carriage Platform -->
        <path d="M 100 180 L 150 150 L 240 168 L 190 198 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
        
        <!-- Shoulder Blocks in Terracotta -->
        <circle cx="170" cy="163" r="6" fill="#BF4A20"/>
        <circle cx="195" cy="168" r="6" fill="#BF4A20"/>

        <!-- Biomechanical Joint Angle Arc -->
        <circle cx="140" cy="115" r="4" fill="#38BDF8"/>
        <circle cx="195" cy="90" r="4" fill="#38BDF8"/>
        <circle cx="240" cy="125" r="4" fill="#38BDF8"/>
        <line x1="140" y1="115" x2="195" y2="90" stroke="#38BDF8" stroke-width="2"/>
        <line x1="195" y1="90" x2="240" y2="125" stroke="#38BDF8" stroke-width="2"/>
        <text x="180" y="80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#BAE6FD">118° EXT</text>

        <!-- Spring Tension Vector -->
        <line x1="85" y1="200" x2="125" y2="185" stroke="#FDE047" stroke-width="2.5" stroke-dasharray="3 2"/>
        <text x="60" y="278" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#BAE6FD">[ 3R / 1A · 18.5kg ]</text>
        <text x="185" y="278" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="#7DD3FC">AXIS: C1-L5</text>
      </svg>
    </div>

    <div>
      <h1 class="brand-title">EDELWEISS</h1>
      <p class="brand-sub">Pilates Reformer · Formación Clínica</p>
    </div>

    <div class="color-pills">
      <span class="pill-item pill-teal">● 28h Básico</span>
      <span class="pill-item pill-terracotta">● 48h Completo</span>
      <span class="pill-item pill-sage">● Aval Clínico</span>
    </div>
  </div>

  <div class="technical-bottom">
    <span>[ QUERÉTARO · MONTERREY ]</span>
    <span>// MÁQUINA INDIVIDUAL POR ALUMNA</span>
    <span>whop.com/mexico-reformer-community</span>
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

  // 2. GENERATE SQUARE PROFILE AVATAR (512x512)
  console.log('📐 Rendering Edelweiss Whop Avatar Icon (512x512)...');
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 512px;
      height: 512px;
      background-color: #14323D;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      color: #FFFFFF;
    }
    .photo-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.22;
      mix-blend-mode: luminosity;
      filter: contrast(120%);
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(125, 211, 252, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(125, 211, 252, 0.08) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .symbol-box {
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }
    .title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.03em;
      text-align: center;
      text-transform: uppercase;
      line-height: 1;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 16px;
      border-radius: 9999px;
      color: #BAE6FD;
    }
  </style>
</head>
<body>
  <img class="photo-bg" src="${certHeroBase64}" alt="Edelweiss Pilates" />
  <div class="grid"></div>
  <div class="symbol-box">
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
      <circle cx="110" cy="90" r="75" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.4"/>
      <!-- Reformer 3D isometric box -->
      <path d="M 30 100 L 85 70 L 190 90 L 135 120 Z" fill="rgba(255,255,255,0.1)" stroke="#7DD3FC" stroke-width="2"/>
      <line x1="30" y1="100" x2="30" y2="125" stroke="#7DD3FC" stroke-width="1.8"/>
      <line x1="135" y1="120" x2="135" y2="145" stroke="#7DD3FC" stroke-width="1.8"/>
      <line x1="190" y1="90" x2="190" y2="115" stroke="#7DD3FC" stroke-width="1.8"/>
      <path d="M 30 125 L 135 145 L 190 115" stroke="#7DD3FC" stroke-width="1.8"/>
      <!-- Carriage -->
      <path d="M 65 95 L 100 75 L 155 88 L 120 108 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
      <circle cx="112" cy="85" r="4.5" fill="#BF4A20"/>
      <circle cx="128" cy="89" r="4.5" fill="#BF4A20"/>
      <!-- Angle Arc -->
      <circle cx="95" cy="55" r="3" fill="#38BDF8"/>
      <circle cx="130" cy="40" r="3" fill="#38BDF8"/>
      <line x1="95" y1="55" x2="130" y2="40" stroke="#38BDF8" stroke-width="1.8"/>
      <text x="135" y="44" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" fill="#BAE6FD">118°</text>
    </svg>
    <div class="title">EDELWEISS</div>
    <div class="badge">[ PILATES MÉXICO ]</div>
  </div>
</body>
</html>
  `;

  await avatarPage.setContent(avatarHtml);
  await avatarPage.waitForTimeout(800);
  const avatarPath = '/tmp/whop-community-avatar.png';
  await avatarPage.screenshot({ path: avatarPath, type: 'png' });
  console.log('✅ Avatar captured successfully:', avatarPath);
  await avatarPage.close();

  // 3. GENERATE HEADER BANNER (2000x1000) WITH REAL REFERENCE PHOTO COMPOSITION
  console.log('📐 Rendering Edelweiss Whop Community Header Banner with Photo Composition (2000x1000)...');
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2000px;
      height: 1000px;
      background-color: #F8F8F6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 70px;
      position: relative;
      overflow: hidden;
      color: #0F0F0F;
    }
    .blueprint-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(42, 38, 36, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 38, 36, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 10;
    }
    .brand-identity {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .brand-logo-pill {
      background: #0F0F0F;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.05em;
      padding: 10px 24px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22C55E;
      box-shadow: 0 0 8px #22C55E;
    }
    .brand-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #71717A;
      letter-spacing: 0.03em;
    }
    .top-badges {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: 9999px;
      border: 1px solid #E4E4E7;
      background: #FFFFFF;
      color: #27272A;
    }
    .badge-pill.dark {
      background: #0F0F0F;
      color: #FFFFFF;
      border-color: #0F0F0F;
    }
    .hero-strip {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 10px;
      margin-bottom: 12px;
      z-index: 10;
    }
    .headline-main {
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.02;
      max-width: 1200px;
      color: #0F0F0F;
    }
    .headline-sub {
      font-size: 16px;
      font-weight: 400;
      color: #52525B;
      max-width: 600px;
      line-height: 1.5;
      text-align: right;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      height: 520px;
      z-index: 10;
    }
    .card {
      border-radius: 32px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 45px rgba(0,0,0,0.12);
    }
    .card-photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.5s ease;
    }
    .card-overlay {
      position: absolute;
      inset: 0;
    }
    .card-content {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .card-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: #FFFFFF;
    }
    .card-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .card-desc {
      font-size: 14px;
      line-height: 1.5;
      margin-top: 8px;
      max-width: 440px;
      opacity: 0.92;
    }
    .card-vector-area {
      flex: 1;
      width: 100%;
      position: relative;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #E4E4E7;
      padding-top: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13.5px;
      color: #71717A;
      z-index: 10;
    }
    .status-active {
      color: #16A34A;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-action-circle {
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

  <div class="top-bar">
    <div class="brand-identity">
      <div class="brand-logo-pill">
        <span class="brand-logo-dot"></span>
        <span>EDELWEISS PILATES</span>
      </div>
      <div class="brand-meta">
        • edelweisspilates.mx &nbsp;// &nbsp;WHOP COMMUNITY PLATFORM
      </div>
    </div>
    <div class="top-badges">
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
            [ 28H $25K · 48H $38K ]
          </span>
        </div>

        <div class="card-vector-area">
          <svg width="480" height="260" viewBox="0 0 480 260" fill="none">
            <!-- Blueprint grid lines -->
            <line x1="40" y1="20" x2="40" y2="240" stroke="#7FE0DE" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.3"/>
            <line x1="440" y1="20" x2="440" y2="240" stroke="#7FE0DE" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.3"/>
            
            <!-- 3D Wireframe Box / Reformer Frame -->
            <path d="M 70 140 L 190 90 L 410 130 L 290 180 Z" stroke="#7DD3FC" stroke-width="1.8" stroke-dasharray="5 3" opacity="0.75"/>
            <line x1="70" y1="140" x2="70" y2="195" stroke="#7DD3FC" stroke-width="1.5" opacity="0.65"/>
            <line x1="290" y1="180" x2="290" y2="235" stroke="#7DD3FC" stroke-width="1.5" opacity="0.65"/>
            <line x1="410" y1="130" x2="410" y2="185" stroke="#7DD3FC" stroke-width="1.5" opacity="0.65"/>
            <path d="M 70 195 L 290 235 L 410 185" stroke="#7DD3FC" stroke-width="1.5" opacity="0.5"/>

            <!-- Biomechanical angle arc -->
            <circle cx="210" cy="70" r="4.5" fill="#38BDF8"/>
            <circle cx="280" cy="40" r="4.5" fill="#38BDF8"/>
            <circle cx="340" cy="80" r="4.5" fill="#38BDF8"/>
            <line x1="210" y1="70" x2="280" y2="40" stroke="#38BDF8" stroke-width="2"/>
            <line x1="280" y1="40" x2="340" y2="80" stroke="#38BDF8" stroke-width="2"/>
            <path d="M 265 52 A 20 20 0 0 1 295 55" stroke="#7DD3FC" stroke-width="1.2" stroke-dasharray="2 2" />
            <text x="290" y="32" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#BAE6FD">118° EXT</text>
            
            <!-- Spring tension vector -->
            <path d="M 120 160 Q 180 150 240 175" stroke="#FDE047" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="240" cy="175" r="4" fill="#FDE047"/>
            <text x="50" y="225" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#FDE047">[ RESORTES: 3R / 1A · 18.5kg ]</text>
            <text x="275" y="225" font-family="'JetBrains Mono', monospace" font-size="11" fill="#7DD3FC" opacity="0.85">// AXIS: C1-L5 KINEMATICS</text>
          </svg>
        </div>
      </div>
      <div class="card-action-circle">↗</div>
    </div>

    <!-- CARD 2: WARM TERRACOTTA (with about-hero.webp photo + live community sync) -->
    <div class="card" style="background: #BF4A20;">
      <img class="card-photo" src="${aboutHeroBase64}" alt="Comunidad Whop" style="opacity: 0.85; filter: contrast(115%) saturate(110%);" />
      <div class="card-overlay" style="background: linear-gradient(180deg, rgba(200, 84, 42, 0.88) 0%, rgba(191, 74, 32, 0.45) 45%, rgba(110, 36, 11, 0.92) 100%);"></div>

      <div class="card-content">
        <div class="card-header">
          <div>
            <h2 class="card-title">Comunidad Whop</h2>
            <p class="card-desc" style="color: #FED7AA;">Red en vivo de alumnas e instructoras en México. Consultas y casos clínicos.</p>
          </div>
          <span class="card-badge" style="background: rgba(255, 255, 255, 0.22); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.45);">
            [ RED EN VIVO ]
          </span>
        </div>

        <div class="card-vector-area">
          <div style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; padding-bottom: 20px;">
            <div style="background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(8px); padding: 14px 20px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.2); max-width: 360px;">
              <div style="display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #FFEDD5; text-transform: uppercase;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 8px #4ADE80;"></span>
                <span>Whop Sync: 240+ Alumnas Activas</span>
              </div>
              <p style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 6px;">
                QUERÉTARO · CDMX · MONTERREY
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="card-action-circle">↗</div>
    </div>

    <!-- CARD 3: SAGE GREEN (with hero-edelweiss.webp photo + clinical flowchart) -->
    <div class="card" style="background: #72927C;">
      <img class="card-photo" src="${edelweissHeroBase64}" alt="Mentoría Clínica" style="opacity: 0.35; filter: contrast(125%) saturate(60%);" />
      <div class="card-overlay" style="background: linear-gradient(180deg, rgba(122, 154, 132, 0.92) 0%, rgba(114, 146, 124, 0.6) 50%, rgba(49, 72, 56, 0.95) 100%);"></div>

      <div class="card-content">
        <div class="card-header">
          <div>
            <h2 class="card-title" style="color: #0F291E;">Mentoría Clínica</h2>
            <p class="card-desc" style="color: #1A3D2E;">Impartida directamente por las Master Trainers Gabi y Laura Munive.</p>
          </div>
          <span class="card-badge" style="background: rgba(15, 41, 30, 0.15); color: #0F291E; border: 1px solid rgba(15, 41, 30, 0.3);">
            [ GABI & LAURA MUNIVE ]
          </span>
        </div>

        <div class="card-vector-area">
          <svg width="480" height="260" viewBox="0 0 480 260" fill="none">
            <!-- Box 1: Evaluación Postural -->
            <rect x="25" y="40" width="165" height="42" rx="10" fill="rgba(255,255,255,0.75)" stroke="#0F291E" stroke-width="1.5"/>
            <text x="38" y="66" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#0F291E">EVALUACIÓN POSTURAL</text>

            <!-- Arrow across -->
            <line x1="190" y1="61" x2="250" y2="61" stroke="#0F291E" stroke-width="1.8" stroke-dasharray="3 3"/>
            <polygon points="250,61 242,57 242,65" fill="#0F291E"/>

            <!-- Box 2: Patología Lumbar -->
            <rect x="255" y="40" width="195" height="42" rx="10" fill="rgba(255,255,255,0.75)" stroke="#0F291E" stroke-width="1.5"/>
            <text x="268" y="66" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#0F291E">PATOLOGÍA LUMBAR / MODIF</text>

            <!-- Downward arrow to Box 3 -->
            <line x1="352" y1="82" x2="352" y2="128" stroke="#0F291E" stroke-width="1.8"/>
            <polygon points="352,128 348,120 356,120" fill="#0F291E"/>

            <!-- Box 3: Docencia Práctica -->
            <rect x="240" y="130" width="220" height="42" rx="10" fill="#0F291E"/>
            <text x="252" y="156" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#E8F5E9">DOCENCIA PRÁCTICA SUPERV</text>

            <!-- Backwards arrow to Box 4 -->
            <line x1="240" y1="151" x2="180" y2="151" stroke="#0F291E" stroke-width="1.8" stroke-dasharray="3 3"/>
            <polygon points="180,151 188,147 188,155" fill="#0F291E"/>

            <!-- Box 4: Aval Oficial -->
            <rect x="25" y="130" width="150" height="42" rx="10" fill="rgba(255,255,255,0.9)" stroke="#0F291E" stroke-width="1.5"/>
            <text x="38" y="156" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="800" fill="#0F291E">AVAL OFICIAL (48H)</text>

            <text x="130" y="215" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" fill="#0F291E">// DOCENCIA PRÁCTICA CLÍNICA</text>
          </svg>
        </div>
      </div>
      <div class="card-action-circle" style="color: #0F291E; background: rgba(15, 41, 30, 0.15); border-color: rgba(15, 41, 30, 0.3);">↗</div>
    </div>
  </div>

  <div class="bottom-bar">
    <div class="status-active">
      <span>●</span>
      <span>INSCRIPCIONES ABIERTAS 2026</span>
    </div>
    <div>
      <span>SEDES: QUERÉTARO (NOV 2026) · MONTERREY (DIC-ENE 2026-2027)</span>
    </div>
    <div>
      <span>WHOP.COM/MEXICO-REFORMER-COMMUNITY</span>
    </div>
  </div>
</body>
</html>
  `;

  await bannerPage.setContent(bannerHtml);
  await bannerPage.waitForTimeout(1000);
  const bannerPath = '/tmp/whop-community-banner.png';
  await bannerPage.screenshot({ path: bannerPath, type: 'png' });
  console.log('✅ Banner captured successfully:', bannerPath);
  await bannerPage.close();

  await browser.close();
  console.log('🎉 All 3 Edelweiss community assets generated successfully!');
}

generateAssets().catch(console.error);
