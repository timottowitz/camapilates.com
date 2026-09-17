import { chromium } from "playwright";
import fs from "fs";

async function submitOpenPR() {
  console.log("Launching browser via SOCKS proxy 127.0.0.1:1080...");
  const browser = await chromium.launch({
    headless: false,
    proxy: { server: "socks5://127.0.0.1:1080" },
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  console.log("Navigating to https://www.openpr.com/news/submit.html...");
  await page.goto("https://www.openpr.com/news/submit.html", { timeout: 45000 });

  console.log("Waiting for form#formular...");
  await page.waitForSelector("form#formular", { timeout: 30000 });
  console.log("Form found!");

  // 1. Dismiss / Accept Cookie banner if present
  try {
    console.log("Checking for cookie banner...");
    const acceptBtn = page.locator('button:has-text("Accept all"), #cmpwelcomebtnok, a:has-text("Accept all")').first();
    if (await acceptBtn.isVisible({ timeout: 4000 })) {
      console.log("Clicking Accept all cookie banner...");
      await acceptBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("No cookie banner or already dismissed:", e.message);
  }

  // Double check and remove any leftover modal overlay
  await page.evaluate(() => {
    document.querySelectorAll('#cmpbox, .cmpbox, .cmpmodal, [id^="cmp"]').forEach(el => el.remove());
  });

  // 2. Fill in form using label discovery
  console.log("Populating form fields...");
  await page.evaluate(() => {
    const form = document.querySelector("#formular");
    function findByLabel(labelText) {
      const labels = Array.from(form.querySelectorAll("label"));
      const match = labels.find(l => l.innerText.toLowerCase().includes(labelText.toLowerCase()));
      if (!match) return null;
      const parent = match.closest(".form-group") || match.parentElement;
      return parent ? parent.querySelector("input, select, textarea") : null;
    }

    // 1. Name
    const nameEl = findByLabel("Your name");
    if (nameEl) { nameEl.value = "Tim Ottowitz"; nameEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // 2. Email
    const emailEl = findByLabel("Your email");
    if (emailEl) { emailEl.value = "tim@camadepilates.com"; emailEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // 3. Phone
    const phoneEl = findByLabel("Your telephone");
    if (phoneEl) { phoneEl.value = "+523222787690"; phoneEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // 4. Company
    const compEl = document.querySelector("#archivnmfield");
    if (compEl) { compEl.value = "Edelweiss"; compEl.dispatchEvent(new Event("input", { bubbles: true })); }

    // 5. Category (select Health & Medicine: value 6)
    const catEl = findByLabel("Category") || document.querySelector("select");
    if (catEl) {
      const opts = Array.from(catEl.options);
      const targetOpt = opts.find(o => o.text.toLowerCase().includes("health") || o.value === "6");
      if (targetOpt) {
        catEl.value = targetOpt.value;
      } else {
        catEl.value = "6";
      }
      catEl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 6. Title
    const titleEl = findByLabel("Title of your press release");
    if (titleEl) {
      titleEl.value = "Edelweiss Announces Democratization of Pilates: Mexico's First Open Certification Directory";
      titleEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // 7. Body text
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

    // 8. About
    const aboutEl = findByLabel("ABOUT / Portrait");
    if (aboutEl) {
      aboutEl.value = `About Edelweiss & CAMA Pilates:
Edelweiss is an international Pilates equipment and education platform founded on the principles of mechanical precision, uncompromising craftsmanship, and radical accessibility. Through its flagship brand CAMA Pilates (https://camadepilates.com), the enterprise engineers commercial-grade Reformers, Cadillacs, and studio apparatus crafted from solid American walnut, white oak, and aerospace-grade aluminum. Headquartered in Mexico and Germany, the company unites German engineering heritage with local sustainable artisan woodworking, while operating open digital directories to connect aspiring instructors with premier certified academies.`;
      aboutEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // 9. Contact
    const contactEl = findByLabel("FULL POSTAL ADDRESS");
    if (contactEl) {
      contactEl.value = `Edelweiss / CAMA Pilates
Media Relations & Corporate Communications
Contact: Tim Ottowitz, Co-Founder
Email: tim@camadepilates.com
Phone / WhatsApp: +52 322 278 7690
Website: https://camadepilates.com
Puerto Vallarta, Jalisco / Mexico City, Mexico`;
      contactEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // 10. Caption
    const captionEl = findByLabel("Image, Caption");
    if (captionEl) {
      captionEl.value = "Edelweiss Founders Tim Ottowitz and Valery Munive announce Mexico's first open Pilates certification directory and equipment initiative.";
      captionEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // 11. Notes
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

  // Attach image
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/press/edelweiss-founders-pr.jpg";
  console.log("Attaching image file:", imagePath);
  await page.setInputFiles("#bild", imagePath);

  // Scroll down to the reCAPTCHA
  console.log("Scrolling to reCAPTCHA...");
  const recaptchaContainer = page.locator('#g-recaptcha-response, iframe[title*="reCAPTCHA"]').first();
  await recaptchaContainer.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(2000);

  // Find reCAPTCHA anchor iframe
  console.log("Waiting for reCAPTCHA anchor iframe...");
  const recaptchaIframe = page.frameLocator('iframe[src*="recaptcha/api2/anchor"]');
  const checkbox = recaptchaIframe.locator('#recaptcha-anchor, .recaptcha-checkbox');
  await checkbox.waitFor({ timeout: 15000 });
  console.log("Clicking reCAPTCHA checkbox...");
  await checkbox.click();

  console.log("Waiting 6 seconds after reCAPTCHA click...");
  await page.waitForTimeout(6000);

  // Take screenshot of reCAPTCHA state
  await page.screenshot({ path: "/tmp/openpr_recaptcha_clicked.png" });
  console.log("Screenshot saved to /tmp/openpr_recaptcha_clicked.png");

  // Check if reCAPTCHA is checked
  const isChecked = await recaptchaIframe.locator('#recaptcha-anchor[aria-checked="true"], .recaptcha-checkbox-checked').count();
  console.log("reCAPTCHA aria-checked count:", isChecked);

  if (isChecked > 0) {
    console.log("reCAPTCHA is verified! Clicking Preview button...");
    const previewBtn = page.locator('input[type="submit"][value*="Preview"], button:has-text("Preview"), #preview, input[value="Preview"]');
    await previewBtn.click();
    console.log("Clicked Preview button. Waiting for navigation...");
    await page.waitForLoadState("networkidle", { timeout: 30000 });
    await page.screenshot({ path: "/tmp/openpr_preview_page.png", fullPage: true });
    console.log("Preview page screenshot saved: /tmp/openpr_preview_page.png");
    console.log("Current URL:", page.url());

    // Check if on preview page (Step 2)
    const pageText = await page.innerText("body");
    console.log("Page text snippet:", pageText.slice(0, 400));

    // Look for confirm / final submit button on Step 2
    const finalSubmit = page.locator('input[type="submit"][value*="Submit"], input[type="submit"][value*="Publish"], button:has-text("Submit"), input[value*="Save"]');
    if (await finalSubmit.count() > 0) {
      console.log("Found final submit button on Step 2! Clicking...");
      await finalSubmit.first().click();
      await page.waitForLoadState("networkidle", { timeout: 30000 });
      await page.screenshot({ path: "/tmp/openpr_final_submission.png", fullPage: true });
      console.log("Final submission screenshot saved: /tmp/openpr_final_submission.png");
      console.log("Final URL:", page.url());
      console.log("Final body snippet:", (await page.innerText("body")).slice(0, 500));
    }
  } else {
    console.log("reCAPTCHA requires interactive challenge! Keeping browser open for inspection...");
    // Check if challenge iframe is visible
    const bframe = page.locator('iframe[src*="recaptcha/api2/bframe"]');
    console.log("bframe count:", await bframe.count());
  }

  return { url: page.url(), checked: isChecked > 0 };
}

submitOpenPR()
  .then(res => console.log("Result:", JSON.stringify(res)))
  .catch(console.error);
