import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";

async function submitOpenPRLive() {
  console.log("=== Launching Chromium via SOCKS proxy 127.0.0.1:1080 ===");
  const browser = await chromium.launch({
    headless: false,
    proxy: { server: "socks5://127.0.0.1:1080" },
    args: [
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1300, height: 1000 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  console.log("Navigating to https://www.openpr.com/news/submit.html...");
  await page.goto("https://www.openpr.com/news/submit.html", { timeout: 45000 });

  console.log("Waiting for form#formular...");
  await page.waitForSelector("form#formular", { timeout: 30000 });
  console.log("Form loaded! Page title:", await page.title());

  // 1. Accept Cookie banner if present
  try {
    console.log("Checking for cookie banner...");
    const acceptBtn = page.locator('button:has-text("Accept all"), #cmpwelcomebtnok, a:has-text("Accept all")').first();
    if (await acceptBtn.isVisible({ timeout: 4000 })) {
      console.log("Accepting cookies...");
      await acceptBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("Cookie banner handled:", e.message);
  }

  // Remove any overlay
  await page.evaluate(() => {
    document.querySelectorAll('#cmpbox, .cmpbox, .cmpmodal, [id^="cmp"]').forEach(el => el.remove());
  });

  // 2. Populate fields
  console.log("Populating all form fields...");
  await page.evaluate(() => {
    const form = document.querySelector("#formular");
    function findByLabel(labelText) {
      const labels = Array.from(form.querySelectorAll("label"));
      const match = labels.find(l => l.innerText.toLowerCase().includes(labelText.toLowerCase()));
      if (!match) return null;
      const parent = match.closest(".form-group") || match.parentElement;
      return parent ? parent.querySelector("input, select, textarea") : null;
    }

    // Name
    const nameEl = findByLabel("Your name");
    if (nameEl) { nameEl.value = "Tim Ottowitz"; nameEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // Email
    const emailEl = findByLabel("Your email");
    if (emailEl) { emailEl.value = "tim@camadepilates.com"; emailEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // Phone
    const phoneEl = findByLabel("Your telephone");
    if (phoneEl) { phoneEl.value = "+523222787690"; phoneEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // Company
    const compEl = document.querySelector("#archivnmfield");
    if (compEl) { compEl.value = "Edelweiss"; compEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // Category (Health & Medicine)
    const catEl = findByLabel("Category") || document.querySelector("select");
    if (catEl) {
      const opts = Array.from(catEl.options);
      const targetOpt = opts.find(o => o.text.toLowerCase().includes("health") || o.value === "6");
      catEl.value = targetOpt ? targetOpt.value : "6";
      catEl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Title
    const titleEl = findByLabel("Title of your press release");
    if (titleEl) {
      titleEl.value = "Edelweiss Announces Democratization of Pilates: Mexico's First Open Certification Directory";
      titleEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Body
    const bodyEl = document.querySelector("#inhalt") || findByLabel("Text of your press release");
    if (bodyEl) {
      bodyEl.value = `Edelweiss, the pioneering Pilates design and manufacturing firm behind CAMA Pilates (https://camadepilates.com), today announced a groundbreaking initiative aimed at the complete democratization of the Pilates industry: the official launch of Mexico's first comprehensive, open-access Pilates Certification Directory (https://camadepilates.com/certificacion-pilates).

Historically, prospective Pilates instructors in Latin America faced severe informational asymmetry, fragmented training standards, hidden exam fees, and steep commissions from digital gatekeepers. Edelweiss's new directory dismantles these barriers by mapping 22 accredited partner academies and master trainers across 10 strategic Mexican metropolises: Ciudad de México (CDMX), Monterrey, Guadalajara/Zapopan, Puebla, Querétaro, Puerto Vallarta, Tijuana, Riviera Maya, León, and Mérida.

Through the platform, aspiring teachers can freely examine curricula, course durations (ranging from 28-hour essential modules to 600-hour comprehensive apparatus certifications), credential accreditations (STOTT PILATES, PMA/NPCP, SEP, and Classical 2nd Generation lineages), and connect directly with academy coordinators via one-click WhatsApp—completely commission-free.

Connecting Back to the Roots of Joseph Pilates
Simultaneously, Edelweiss announced that Germany has been selected as the second country in its international directory roadmap, scheduled for launch in late 2026 / early 2027.

Joseph Hubertus Pilates was born in 1883 in Mönchengladbach, Germany, where he developed his revolutionary mind-body philosophy (Contrology) before engineering the iconic Universal Reformer using hospital bed springs. Edelweiss honors this lineage by uniting precision German mechanical engineering with master Mexican woodworking craftsmanship.

"Pilates was never intended to be an exclusive, gatekept luxury reserved for a privileged few," said Tim Ottowitz, Founder & Chief Architect at Edelweiss / CAMA Pilates. "Our mission is the radical democratization of the discipline. By providing a free, transparent national directory in Mexico—and soon across Germany—we empower future instructors to choose the highest caliber education with total clarity. Furthermore, we eliminate the equipment barrier by manufacturing world-class, German-engineered commercial Reformers locally in North America, ensuring newly graduated teachers can launch viable boutique studios without drowning in debt or prohibitive import costs."

B2B Synergy for New Studio Owners
In tandem with the directory, Edelweiss is offering certified graduates of allied academies preferential equipment packages on its flagship Commercial Reformers for Studios (https://camadepilates.com/reformer-para-estudio), custom logo laser-engraving, natural solid American walnut and white oak finishes, direct studio leasing terms, and nationwide 48-hour replacement parts delivery.

The complete editorial manifesto detailing the initiative can be read on the official CAMA Pilates Announcement (https://camadepilates.com/blog/democratizacion-del-pilates-primer-directorio-mexico-alemania).`;
      bodyEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // About
    const aboutEl = findByLabel("ABOUT / Portrait");
    if (aboutEl) {
      aboutEl.value = `About Edelweiss & CAMA Pilates:
Edelweiss is an international Pilates equipment and education platform founded on the principles of mechanical precision, uncompromising craftsmanship, and radical accessibility. Through its flagship brand CAMA Pilates (https://camadepilates.com), the enterprise engineers commercial-grade Reformers, Cadillacs, and studio apparatus crafted from solid American walnut, white oak, and aerospace-grade aluminum. Headquartered in Mexico and Germany, the company unites German engineering heritage with local sustainable artisan woodworking, while operating open digital directories to connect aspiring instructors with premier certified academies.`;
      aboutEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Press Contact
    const contactEl = findByLabel("FULL POSTAL ADDRESS");
    if (contactEl) {
      contactEl.value = `Edelweiss / CAMA Pilates
Media Relations & Corporate Communications
Contact: Tim Ottowitz, Co-Founder
Email: tim@camadepilates.com
General Press: info@camadepilates.com
Phone / WhatsApp: +52 322 278 7690
Website: https://camadepilates.com
Puerto Vallarta, Jalisco / Mexico City, Mexico`;
      contactEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Caption
    const captionEl = findByLabel("Image, Caption");
    if (captionEl) {
      captionEl.value = "Edelweiss Founders Tim Ottowitz and Valery Munive announce Mexico's first open Pilates certification directory and equipment initiative.";
      captionEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Notes
    const notesEl = findByLabel("Notes");
    if (notesEl) {
      notesEl.value = "Pilates Reformer Mexico, Certificacion Pilates, Directorio Pilates, Joseph Pilates Germany, Edelweiss, CAMA Pilates, Reformer para Estudio";
      notesEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Checkboxes
    const agb = document.querySelector("#input-agb");
    if (agb) { agb.checked = true; agb.dispatchEvent(new Event("change", { bubbles: true })); }

    const ds = document.querySelector("#input-ds");
    if (ds) { ds.checked = true; ds.dispatchEvent(new Event("change", { bubbles: true })); }
  });

  // 3. Attach image (bust portrait crop of Valery, no baby belly)
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/press/edelweiss-founders-pr.jpg";
  console.log("Attaching press image:", imagePath);
  await page.setInputFiles("#bild", imagePath);

  // Scroll down to the reCAPTCHA iframe container on page
  console.log("Scrolling page to reCAPTCHA iframe...");
  const iframeLocator = page.locator('iframe[src*="recaptcha/api2/anchor"]');
  await iframeLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const recaptchaAnchor = page.frameLocator('iframe[src*="recaptcha/api2/anchor"]');
  const checkbox = recaptchaAnchor.locator("#recaptcha-anchor");
  console.log("Clicking reCAPTCHA checkbox...");
  await checkbox.click();
  await page.waitForTimeout(3000);

  // Bring browser to front
  try {
    execSync(`osascript -e 'tell application "Google Chrome for Testing" to activate'`);
  } catch (e) {}

  // Check if already solved
  let isSolved = await recaptchaAnchor.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count() > 0;
  console.log("Is reCAPTCHA immediately solved?", isSolved);

  if (!isSolved) {
    console.log("Attempting automated audio challenge resolution...");
    const bframe = page.frameLocator('iframe[src*="recaptcha/api2/bframe"]');
    const audioBtn = bframe.locator("#recaptcha-audio-button");

    if (await audioBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log("Clicking audio challenge button...");
      await audioBtn.click();
      await page.waitForTimeout(2000);

      // Wait for audio download link
      const audioLink = bframe.locator('a.rc-audiochallenge-tdownload-link');
      let audioUrl = null;
      try {
        await audioLink.waitFor({ timeout: 8000 });
        audioUrl = await audioLink.getAttribute("href");
      } catch (e) {
        console.log("Waiting for audio link failed:", e.message);
      }

      console.log("Audio URL retrieved:", audioUrl ? audioUrl.slice(0, 80) + "..." : "null");

      if (audioUrl) {
        console.log("Transcribing audio using SpeechRecognition via UV...");
        try {
          const uvCmd = `/Users/m3max361tb/.local/bin/uv run --with speechrecognition --with pydub python3 scripts/solve_recaptcha_audio.py "${audioUrl}"`;
          const transcriptOutput = execSync(uvCmd, { encoding: "utf8" });
          const lines = transcriptOutput.trim().split("\n");
          const transcript = lines[lines.length - 1].trim();
          console.log("Transcribed Audio Solution:", transcript);

          const audioInput = bframe.locator("#audio-response");
          await audioInput.fill(transcript);
          await page.waitForTimeout(500);

          const verifyBtn = bframe.locator("#recaptcha-verify-button");
          console.log("Clicking verify button...");
          await verifyBtn.click();
          await page.waitForTimeout(4000);
        } catch (err) {
          console.error("Audio solve error:", err.message);
        }
      }
    }
  }

  // Poll for completion (up to 90s)
  console.log("Waiting for reCAPTCHA verified status...");
  for (let i = 0; i < 45; i++) {
    const isChecked = await recaptchaAnchor.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count();
    if (isChecked > 0) {
      isSolved = true;
      console.log(`reCAPTCHA verified at ${i * 2}s!`);
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!isSolved) {
    console.log("reCAPTCHA not verified within timeout.");
    await page.screenshot({ path: "/tmp/openpr_recaptcha_state.png" });
    return { ok: false, error: "recaptcha_not_verified" };
  }

  // 4. Click Preview (Step 1 -> Step 2)
  console.log("Clicking Preview button...");
  const previewBtn = page.locator('input[type="submit"][value*="Preview"], button:has-text("Preview"), #preview, input[value="Preview"]').first();
  await previewBtn.click();

  console.log("Waiting for Preview page (Step 2)...");
  await page.waitForLoadState("networkidle", { timeout: 35000 });
  await page.screenshot({ path: "/tmp/openpr_step2_preview.png", fullPage: true });
  console.log("Step 2 Preview screenshot saved to /tmp/openpr_step2_preview.png");
  console.log("Step 2 URL:", page.url());

  // 5. Click Final Submit on Step 2
  console.log("Looking for final Submit button on Step 2...");
  const finalBtn = page.locator('input[type="submit"][value*="Submit"], input[type="submit"][value*="Publish"], button:has-text("Submit"), input[value*="Save"], input[type="submit"]').first();
  await finalBtn.waitFor({ timeout: 15000 });
  console.log("Clicking final Submit button...");
  await finalBtn.click();

  console.log("Waiting for Confirmation page (Step 3)...");
  await page.waitForLoadState("networkidle", { timeout: 35000 });
  await page.screenshot({ path: "/tmp/openpr_step3_confirmation.png", fullPage: true });
  console.log("Step 3 Confirmation screenshot saved to /tmp/openpr_step3_confirmation.png");
  console.log("Final URL:", page.url());
  const confirmationText = await page.innerText("body");
  console.log("Confirmation Text Snippet:", confirmationText.slice(0, 600));

  await browser.close();
  return { ok: true, url: page.url(), confirmationSnippet: confirmationText.slice(0, 300) };
}

submitOpenPRLive()
  .then(res => console.log("Done:", JSON.stringify(res)))
  .catch(console.error);
