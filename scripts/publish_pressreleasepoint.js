import { chromium } from "playwright";
import fs from "fs";

async function run() {
  console.log("=== Launching browser for PressReleasePoint final publish ===");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1300, height: 1100 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();

  console.log("Logging into PressReleasePoint...");
  await page.goto("https://www.pressreleasepoint.com/user/login", { timeout: 25000 });
  await page.fill("#edit-name", "tim@camadepilates.com");
  await page.fill("#edit-pass", "CamaPilatesTim2026!");
  await page.click("#edit-submit");
  await page.waitForTimeout(3000);

  console.log("Navigating to https://www.pressreleasepoint.com/press-release-submit...");
  await page.goto("https://www.pressreleasepoint.com/press-release-submit", { timeout: 35000 });
  await page.waitForTimeout(2000);

  // Check form values
  const title = await page.$eval("#edit-title, input[name=\"title\"]", el => el.value).catch(() => "");
  console.log("Current loaded title:", title);

  if (!title) {
    console.log("Populating title...");
    await page.fill("#edit-title, input[name=\"title\"]", "Edelweiss / CAMA Pilates Announces Democratization of Pilates: Mexico's First Open Certification Directory");
  }

  // Topic selection
  try {
    console.log("Selecting Topic: Health (9)...");
    await page.selectOption("#edit-taxonomy-vocabulary-1-und-hierarchical-select-selects-0", "9");
    await page.waitForTimeout(1500);
    const addTopicBtn = page.locator("#edit-taxonomy-vocabulary-1-und-hierarchical-select-dropbox-add");
    if (await addTopicBtn.isVisible()) {
      await addTopicBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("Topic select notice:", e.message);
  }

  // Location selection
  try {
    console.log("Selecting Location: America (2755417)...");
    await page.selectOption("#edit-taxonomy-vocabulary-2-und-hierarchical-select-selects-0", "2755417");
    await page.waitForTimeout(1500);
    const addLocBtn = page.locator("#edit-taxonomy-vocabulary-2-und-hierarchical-select-dropbox-add");
    if (await addLocBtn.isVisible()) {
      await addLocBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("Location select notice:", e.message);
  }

  // Ensure contact fields
  console.log("Ensuring canonical contact info (tim@camadepilates.com, +52 322 278 7690)...");
  await page.fill("#edit-contact-prname, input[name=\"contact[prname]\"]", "Tim Ottowitz");
  await page.fill("#edit-contact-email, input[name=\"contact[email]\"]", "tim@camadepilates.com");
  await page.fill("#edit-contact-phone, input[name=\"contact[phone]\"]", "+52 322 278 7690");
  await page.fill("#edit-contact-website, input[name=\"contact[website]\"]", "https://camadepilates.com");
  await page.fill("#edit-contact-address, textarea[name=\"contact[address]\"]", "Zona Hotelera Norte / Marina Vallarta, Puerto Vallarta, Jalisco 48333, Mexico");

  await page.screenshot({ path: "/tmp/prpoint_ready_to_publish.png", fullPage: true });

  console.log("Clicking Submit button...");
  const submitBtn = page.locator("#edit-submit");
  await Promise.all([
    page.waitForNavigation({ timeout: 45000 }).catch(e => console.log("Navigation timeout:", e.message)),
    submitBtn.click()
  ]);

  await page.waitForTimeout(5000);
  console.log("URL after publish submit:", page.url());
  console.log("Title after publish submit:", await page.title());
  const bodyText = await page.innerText("body");
  console.log("Snippet:\n", bodyText.slice(0, 1000));
  await page.screenshot({ path: "/tmp/prpoint_published_result.png", fullPage: true });

  await browser.close();
}

run().catch(console.error);
