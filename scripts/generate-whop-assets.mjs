import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  console.log('🎨 Launching Playwright Chromium for asset generation...');
  const browser = await chromium.launch();

  // 1. GENERATE LOGO / AVATAR (1024x1024)
  console.log('📐 Rendering Whop Community Logo (1024x1024)...');
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
      padding: 8px 20px;
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
      gap: 20px;
      position: relative;
      z-index: 10;
    }
    .brand-mark-card {
      width: 380px;
      height: 380px;
      background: #14323D;
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 25px 60px rgba(20, 50, 61, 0.25), 0 0 0 1px rgba(255,255,255,0.1);
      overflow: hidden;
    }
    .brand-title {
      font-size: 64px;
      font-weight: 900;
      color: #0F0F0F;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      line-height: 1;
      text-align: center;
    }
    .brand-sub {
      font-size: 19px;
      font-weight: 600;
      color: #52525B;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: center;
      margin-top: 6px;
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
      padding: 7px 16px;
      border-radius: 9999px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(0,0,0,0.05);
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
    <span>// FORMACIÓN 2026</span>
  </div>

  <div class="center-symbol">
    <div class="brand-mark-card">
      <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <h1 class="brand-title" style="font-size: 50px; letter-spacing: -0.02em;">EDELWEISS PILATES</h1>
      <p class="brand-sub">Formación Clínica Reformer</p>
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

  // 2. GENERATE SQUARE PROFILE AVATAR (512x512) for Whop community avatar
  console.log('📐 Rendering Whop Avatar Icon (512x512)...');
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
      gap: 12px;
    }
    .title {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.04em;
      text-align: center;
      text-transform: uppercase;
      line-height: 1;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 5px 14px;
      border-radius: 9999px;
      color: #BAE6FD;
    }
  </style>
</head>
<body>
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
    <div class="title" style="font-size: 22px; letter-spacing: -0.02em;">EDELWEISS PILATES</div>
    <div class="badge">[ REFORMER MÉXICO ]</div>
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

  // 3. GENERATE HEADER BANNER (2000x1000)
  console.log('📐 Rendering Whop Community Header Banner (2000x1000)...');
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
      padding: 60px 80px;
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
      margin-top: 15px;
      margin-bottom: 15px;
      z-index: 10;
    }
    .headline-main {
      font-size: 68px;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.02;
      max-width: 1200px;
      color: #0F0F0F;
    }
    .headline-sub {
      font-size: 17px;
      font-weight: 400;
      color: #52525B;
      max-width: 580px;
      line-height: 1.5;
      text-align: right;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      height: 480px;
      z-index: 10;
    }
    .card {
      border-radius: 36px;
      padding: 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.06);
    }
    .card-teal { background: #14323D; color: #FFFFFF; }
    .card-terracotta { background: #BF4A20; color: #FFFFFF; }
    .card-sage { background: #72927C; color: #142018; }
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      z-index: 2;
    }
    .card-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .card-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }
    .card-desc {
      font-size: 14px;
      line-height: 1.5;
      margin-top: 10px;
      max-width: 440px;
      opacity: 0.9;
    }
    .card-vector-area {
      flex: 1;
      width: 100%;
      position: relative;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bottom-bar {
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
    .status-active {
      color: #16A34A;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="blueprint-grid"></div>

  <div class="top-bar">
    <div class="brand-identity">
      <div class="brand-logo-pill">
        <span>EDELWEISS PILATES</span>
      </div>
      <div class="brand-meta">
        • camadepilates.com &nbsp;// &nbsp;WHOP COMMUNITY PLATFORM
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
    <!-- CARD 1: SLATE TEAL -->
    <div class="card card-teal">
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
        <svg width="480" height="240" viewBox="0 0 480 240" fill="none">
          <path d="M 60 135 L 180 85 L 420 125 L 300 175 Z" stroke="#7DD3FC" stroke-width="1.8" stroke-dasharray="5 3" opacity="0.7"/>
          <line x1="60" y1="135" x2="60" y2="185" stroke="#7DD3FC" stroke-width="1.5" opacity="0.6"/>
          <line x1="300" y1="175" x2="300" y2="225" stroke="#7DD3FC" stroke-width="1.5" opacity="0.6"/>
          <line x1="420" y1="125" x2="420" y2="175" stroke="#7DD3FC" stroke-width="1.5" opacity="0.6"/>
          <circle cx="210" cy="65" r="4.5" fill="#38BDF8"/>
          <circle cx="280" cy="35" r="4.5" fill="#38BDF8"/>
          <circle cx="340" cy="75" r="4.5" fill="#38BDF8"/>
          <line x1="210" y1="65" x2="280" y2="35" stroke="#38BDF8" stroke-width="2"/>
          <line x1="280" y1="35" x2="340" y2="75" stroke="#38BDF8" stroke-width="2"/>
          <text x="290" y="28" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#BAE6FD">118° EXT</text>
          
          <text x="40" y="215" font-family="'JetBrains Mono', monospace" font-size="11" fill="#FDE047">[ RESORTES: 3R / 1A · 18.5kg ]</text>
          <text x="270" y="215" font-family="'JetBrains Mono', monospace" font-size="11" fill="#7DD3FC" opacity="0.8">// AXIS: C1-L5 KINEMATICS</text>
        </svg>
      </div>
    </div>

    <!-- CARD 2: WARM TERRACOTTA -->
    <div class="card card-terracotta">
      <div class="card-header">
        <div>
          <h2 class="card-title">Comunidad Whop</h2>
          <p class="card-desc" style="color: #FED7AA;">Red en vivo de alumnas e instructoras en México. Consultas y casos clínicos.</p>
        </div>
        <span class="card-badge" style="background: rgba(255, 255, 255, 0.2); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.4);">
          [ 240+ ALUMNAS ACTIVAS ]
        </span>
      </div>
      <div class="card-vector-area">
        <svg width="480" height="240" viewBox="0 0 480 240" fill="none">
          <circle cx="240" cy="110" r="70" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="4 4"/>
          <circle cx="240" cy="110" r="110" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          <circle cx="240" cy="110" r="18" fill="#FFFFFF"/>
          <text x="230" y="116" font-family="'Plus Jakarta Sans'" font-size="14" font-weight="900" fill="#BF4A20">CP</text>
          <circle cx="150" cy="80" r="9" fill="#FFEDD5"/>
          <circle cx="330" cy="70" r="9" fill="#FFEDD5"/>
          <circle cx="180" cy="160" r="9" fill="#FFEDD5"/>
          <circle cx="310" cy="160" r="9" fill="#FFEDD5"/>
          <line x1="240" y1="110" x2="150" y2="80" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <line x1="240" y1="110" x2="330" y2="70" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <line x1="240" y1="110" x2="180" y2="160" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <line x1="240" y1="110" x2="310" y2="160" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <text x="100" y="215" font-family="'JetBrains Mono', monospace" font-size="12" fill="#FFEDD5">[ CANALES: #CASOS-CLÍNICOS · #MENTORÍA ]</text>
        </svg>
      </div>
    </div>

    <!-- CARD 3: SAGE GREEN -->
    <div class="card card-sage">
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
        <svg width="480" height="240" viewBox="0 0 480 240" fill="none">
          <rect x="25" y="45" width="165" height="42" rx="10" fill="rgba(255,255,255,0.7)" stroke="#0F291E" stroke-width="1.5"/>
          <text x="38" y="71" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#0F291E">EVALUACIÓN POSTURAL</text>

          <line x1="190" y1="66" x2="250" y2="66" stroke="#0F291E" stroke-width="1.8" stroke-dasharray="3 3"/>
          <polygon points="250,66 242,62 242,70" fill="#0F291E"/>

          <rect x="255" y="45" width="195" height="42" rx="10" fill="rgba(255,255,255,0.7)" stroke="#0F291E" stroke-width="1.5"/>
          <text x="268" y="71" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#0F291E">PATOLOGÍA LUMBAR / MODIF</text>

          <line x1="352" y1="87" x2="352" y2="130" stroke="#0F291E" stroke-width="1.8"/>
          <polygon points="352,130 348,122 356,122" fill="#0F291E"/>

          <rect x="240" y="133" width="220" height="42" rx="10" fill="#0F291E"/>
          <text x="252" y="159" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#E8F5E9">DOCENCIA PRÁCTICA SUPERV</text>

          <line x1="240" y1="154" x2="180" y2="154" stroke="#0F291E" stroke-width="1.8" stroke-dasharray="3 3"/>
          <polygon points="180,154 188,150 188,158" fill="#0F291E"/>

          <rect x="25" y="133" width="150" height="42" rx="10" fill="rgba(255,255,255,0.9)" stroke="#0F291E" stroke-width="1.5"/>
          <text x="38" y="159" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="800" fill="#0F291E">AVAL OFICIAL (48H)</text>

          <text x="130" y="215" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" fill="#0F291E">// DOCENCIA PRÁCTICA CLÍNICA</text>
        </svg>
      </div>
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
  console.log('🎉 All 3 assets generated successfully!');
}

generateAssets().catch(console.error);
