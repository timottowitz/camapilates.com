import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";

async function runMasterSubmission() {
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
Contact: Tim Ottowitz, Co-Founder & CEO
Email: tim@camadepilates.com
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

  // Check if immediately solved
  let isSolved = await recaptchaAnchor.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count() > 0;
  console.log("Is reCAPTCHA immediately solved?", isSolved);

  // Automated Gemini Vision Solver Loop
  if (!isSolved) {
    console.log("Starting automated Gemini Vision reCAPTCHA challenge loop...");
    const bframeLocator = page.frameLocator('iframe[src*="recaptcha/api2/bframe"]');

    for (let round = 1; round <= 15; round++) {
      // Check if solved
      isSolved = await recaptchaAnchor.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count() > 0;
      if (isSolved) {
        console.log(`reCAPTCHA solved at round ${round}!`);
        break;
      }

      const bframeEl = await page.$('iframe[src*="recaptcha/api2/bframe"]');
      if (!bframeEl) {
        console.log("bframe element gone, checking aria-checked...");
        await page.waitForTimeout(2000);
        break;
      }

      // Screenshot challenge box
      const bframeShotPath = `/tmp/recaptcha_round_${round}.png`;
      await bframeEl.screenshot({ path: bframeShotPath }).catch(() => {});

      const instruction = await bframeLocator.locator('.rc-imageselect-instructions').innerText().catch(() => "");
      console.log(`[Round ${round}] Instruction:`, instruction.replace(/\n/g, " "));

      if (!instruction) {
        console.log("No challenge instruction found, checking aria status...");
        await page.waitForTimeout(2000);
        continue;
      }

      // Solve with Gemini Vision
      try {
        const tileCount = await bframeLocator.locator('td.rc-imageselect-tile').count();
        console.log(`[Round ${round}] Detected tile count: ${tileCount}`);
        const cmd = `python3 scripts/solve_recaptcha_gemini.py "${bframeShotPath}" "${instruction.replace(/"/g, '\\"')}" ${tileCount}`;
        const out = execSync(cmd, { env: process.env, encoding: "utf8" }).trim();
        console.log(`[Round ${round}] Gemini identified tiles:`, out);

        const indices = JSON.parse(out);
        if (Array.isArray(indices) && indices.length > 0) {
          const tiles = bframeLocator.locator('td.rc-imageselect-tile');
          for (const idx of indices) {
            console.log(`Clicking tile index ${idx}...`);
            await tiles.nth(idx).click().catch(e => console.log("Click tile error:", e.message));
            await page.waitForTimeout(700);
          }

          // If "none left", wait for replacement images
          if (instruction.toLowerCase().includes("none left")) {
            console.log("Waiting 3.5s for replacement images to fade in...");
            await page.waitForTimeout(3500);
            continue; // Go to next round to check if replacement tiles also match
          }
        }

        // If no tiles left or not a replacement challenge, click Verify
        console.log("Clicking #recaptcha-verify-button...");
        const verifyBtn = bframeLocator.locator('#recaptcha-verify-button');
        await verifyBtn.click();
        await page.waitForTimeout(3500);

      } catch (err) {
        console.error("Gemini Vision solver error:", err.message);
        await page.waitForTimeout(2000);
      }
    }
  }

  // Final check for aria-checked="true"
  for (let i = 0; i < 10; i++) {
    const isChecked = await recaptchaAnchor.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count();
    if (isChecked > 0) {
      isSolved = true;
      console.log(">>> reCAPTCHA is verified! <<<");
      break;
    }
    await page.waitForTimeout(1500);
  }

  if (!isSolved) {
    console.error("reCAPTCHA could not be automatically verified.");
    await page.screenshot({ path: "/tmp/openpr_master_recaptcha_fail.png" });
    return { ok: false, error: "recaptcha_fail" };
  }

  // 4. Click Preview (Step 1 -> Step 2)
  console.log("Clicking Preview button...");
  const previewBtn = page.locator('input[type="submit"][value*="Preview"], button:has-text("Preview"), #preview, input[value="Preview"]').first();
  await previewBtn.click();

  console.log("Waiting for Preview page (Step 2)...");
  await page.waitForLoadState("networkidle", { timeout: 35000 });
  await page.screenshot({ path: "/tmp/openpr_step2_preview.png", fullPage: true });
  console.log("Step 2 Preview screenshot saved: /tmp/openpr_step2_preview.png");
  console.log("Step 2 URL:", page.url());

  // 5. Click Final Submit on Step 2
  console.log("Saving Step 2 HTML to /tmp/openpr_step2.html...");
  try {
    const step2Html = await page.content();
    fs.writeFileSync("/tmp/openpr_step2.html", step2Html);
  } catch (e) {
    console.log("Could not save step 2 HTML:", e.message);
  }

  console.log("Looking for final Publish button on Step 2...");
  const publishCandidates = [
    'button:has-text("Publish")',
    'a:has-text("Publish")',
    'input[value*="Publish" i]',
    ':is(button, a, input):has-text("Publish")',
    'button:has-text("Veröffentlichen")',
    'a:has-text("Veröffentlichen")',
    'input[value*="Veröffentlichen" i]',
    'button:has-text("Submit")',
    'a:has-text("Submit")',
    'input[value*="Submit" i]',
    'input[type="submit"]',
    'button[type="submit"]'
  ];

  let finalBtn = null;
  for (const selector of publishCandidates) {
    const loc = page.locator(selector).first();
    if ((await loc.count()) > 0 && (await loc.isVisible())) {
      console.log(`>>> Found final button matching: "${selector}" <<<`);
      finalBtn = loc;
      break;
    }
  }

  if (!finalBtn) {
    console.log("Publish button not found with primary selectors. Dumping clickable elements...");
    const dump = await page.$$eval('button, a, input[type="submit"], input[type="button"]', els =>
      els.map(e => ({
        tag: e.tagName,
        text: (e.innerText || e.value || "").trim(),
        href: e.href || "",
        id: e.id || "",
        className: e.className || ""
      }))
    );
    console.log("Found interactive elements:", JSON.stringify(dump.slice(0, 30), null, 2));
    throw new Error("Could not find Publish button on Step 2");
  }

  console.log("Clicking final Publish button...");
  await finalBtn.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(1000);
  await Promise.all([
    page.waitForLoadState("networkidle", { timeout: 35000 }).catch(() => {}),
    finalBtn.click()
  ]);

  console.log("Waiting for Confirmation page (Step 3)...");
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "/tmp/openpr_step3_confirmation.png", fullPage: true });
  console.log("Step 3 Confirmation screenshot saved: /tmp/openpr_step3_confirmation.png");
  console.log("Final URL:", page.url());

  try {
    const step3Html = await page.content();
    fs.writeFileSync("/tmp/openpr_step3.html", step3Html);
  } catch (e) {}

  const confirmationText = await page.innerText("body");
  console.log("Confirmation Text Snippet:\n", confirmationText.slice(0, 600));

  // 6. Monitor Apple Mail for Confirmation Email and activate listing
  console.log("\n=== Monitoring Apple Mail for OpenPR Confirmation Email ===");
  let confirmUrl = null;
  for (let attempt = 1; attempt <= 45; attempt++) {
    console.log(`Checking Apple Mail for new messages (attempt ${attempt}/45)...`);
    try {
      execSync(`osascript -e 'tell application "Mail" to check for new mail for account "CAMA Pilates"'`);
      await page.waitForTimeout(3000);

      // Check INBOX of CAMA Pilates
      const script = `tell application "Mail"
        set d to (current date) - (30 * minutes)
        set targetAccounts to {"CAMA Pilates", "Google"}
        repeat with acctName in targetAccounts
          try
            set acct to account acctName
            set mbList to every mailbox of acct
            repeat with mb in mbList
              try
                set mList to (messages of mb whose date received > d)
                repeat with m in mList
                  set s to (subject of m)
                  set snd to (sender of m)
                  if (s contains "openPR" or snd contains "openpr" or s contains "Confirmation" or s contains "Bestätigung" or s contains "Pressemitteilung" or s contains "Press Release") then
                    return (content of m)
                  end if
                end repeat
              end try
            end repeat
          end try
        end repeat
        return "not_found"
      end tell`;

      const mailContent = execSync(`osascript -e '${script}'`, { encoding: "utf8" }).trim();
      if (mailContent && mailContent !== "not_found" && !mailContent.includes("id=123")) {
        console.log(">>> FOUND NEW CONFIRMATION EMAIL IN APPLE MAIL! <<<");
        fs.writeFileSync("/tmp/openpr_confirmation_email.txt", mailContent);
        console.log("Email Snippet:\n", mailContent.slice(0, 500));

        const match =
          mailContent.match(/https?:\/\/[^\s"<>]+(?:confirm|activation|freischalten|validate|verify|release)[^\s"<>]*/i) ||
          mailContent.match(/https?:\/\/www\.openpr\.[a-z]+[^\s"<>]*/i);
        if (match) {
          confirmUrl = match[0].replace(/[\.,;)]+$/, ""); // trim punctuation
          console.log("Extracted Confirmation Link:", confirmUrl);
          break;
        }
      }
    } catch (e) {
      console.log("Apple Mail check attempt notice:", e.message);
    }
    await page.waitForTimeout(6000);
  }

  if (confirmUrl) {
    console.log("Navigating to Confirmation Link to publish release:", confirmUrl);
    await page.goto(confirmUrl, { timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 });
    await page.screenshot({ path: "/tmp/openpr_published.png", fullPage: true });
    console.log("Published screenshot saved to /tmp/openpr_published.png");
    console.log("Live Published Page URL:", page.url());
    console.log("Live Title:", await page.title());
    try {
      const pubHtml = await page.content();
      fs.writeFileSync("/tmp/openpr_published.html", pubHtml);
    } catch (e) {}
  } else {
    console.log("Confirmation email link not yet found within timeout. Please check Apple Mail inbox.");
  }

  await browser.close();
  return {
    ok: true,
    step3Url: page.url(),
    confirmUrl: confirmUrl,
    confirmationSnippet: confirmationText.slice(0, 300)
  };
}

runMasterSubmission()
  .then(res => console.log("MASTER RESULT:", JSON.stringify(res, null, 2)))
  .catch(console.error);
