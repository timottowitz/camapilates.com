import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import https from "https";

// Gemini OCR for static base64 captcha
async function solveBase64Captcha(b64Data) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const prompt = `Look at this captcha image carefully. It consists of 4 to 6 lowercase alphanumeric characters (letters and digits).
Watch out for:
- 'd' vs 'ct' or 'cl': 'd' has a tall right stem with a left round loop.
- 'g' vs '9' or 'q'
- 'b' vs '6'
- 'r', 'z', 'e', 'i', 'a', 'u', 'w', 'm', 'n'
Return ONLY the raw lowercase characters. Do not include spaces, quotes, or any formatting.`;
  const payload = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: b64Data } }
      ]
    }],
    generationConfig: { temperature: 0.0 }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            const clean = text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            resolve(clean);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Check Apple Mail for verification email
function checkAppleMailForPRLog() {
  const script = `tell application "Mail"
    check for new mail for account "CAMA Pilates"
    set d to (current date) - (15 * minutes)
    try
      set mb to mailbox "INBOX" of account "CAMA Pilates"
      set mList to (messages of mb whose date received > d)
      repeat with m in mList
        set s to (subject of m)
        set snd to (sender of m)
        if (s contains "PRLog" or snd contains "prlog" or s contains "Account" or s contains "Activation" or s contains "Confirm") then
          return (content of m)
        end if
      end repeat
    end try
    return "not_found"
  end tell`;

  try {
    const out = execSync(`osascript -e '${script}'`, { encoding: "utf8" }).trim();
    if (out && out !== "not_found") {
      return out;
    }
  } catch (e) {
    console.log("Apple Mail check notice:", e.message);
  }
  return null;
}

async function run() {
  console.log("=== Launching Chromium via SOCKS proxy 127.0.0.1:1080 ===");
  const browser = await chromium.launch({
    headless: false,
    proxy: { server: "socks5://127.0.0.1:1080" },
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"]
  });

  const context = await browser.newContext({
    viewport: { width: 1300, height: 1000 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  console.log("Navigating to PRLog Account Signup: https://www.prlog.org/pub/account2.html...");
  await page.goto("https://www.prlog.org/pub/account2.html", { timeout: 35000 });
  await page.waitForTimeout(2000);

  let lastDialog = null;
  page.on("dialog", async dialog => {
    lastDialog = dialog.message();
    console.log(">>> BROWSER DIALOG ALERT:", lastDialog);
    await dialog.accept();
  });

  let signupSuccess = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`\n--- PRLog Signup Attempt ${attempt}/6 ---`);

    // Extract Captcha image data
    console.log("Extracting captcha image...");
    const captchaImgSrc = await page.$eval('img[alt="Are you human?"]', el => el.src);
    const b64Data = captchaImgSrc.replace(/^data:image\/[a-z]+;base64,/, "");

    console.log("Solving captcha via Gemini Vision...");
    const solvedCaptcha = await solveBase64Captcha(b64Data);
    console.log("Gemini Vision captcha solution:", solvedCaptcha);

    // Fill in form fields matching canonical citations skill
    console.log("Filling canonical business information (Email: tim@camadepilates.com)...");
    await page.fill("#email", "tim@camadepilates.com");
    await page.fill("#orgName", "Edelweiss / CAMA Pilates");
    await page.fill("#acorgtype", "Manufacturer");
    await page.fill("#acUrl", "https://camadepilates.com");
    await page.fill("#fname", "Tim");
    await page.fill("#lname", "Ottowitz");
    await page.fill("#acRole", "Co-Founder & CEO");

    await page.selectOption("#acPhoneIsd", "MX52");
    await page.fill("#acPhoneTel", "3222787690");

    try {
      await page.selectOption("#idtz2", "145");
    } catch (e) {
      console.log("Time zone select fallback:", e.message);
    }

    const password = "CamaPilatesTim2026!";
    await page.fill("#pwd", password);
    await page.fill("#pwd2", password);

    await page.fill("#captcha_hash", solvedCaptcha);
    await page.check("#agree");

    await page.screenshot({ path: `/tmp/prlog_signup_attempt_${attempt}.png` });

    console.log("Clicking Create Account button...");
    const createBtn = page.locator('button:has-text("Create Account"), input[value="Create Account"]').first();
    await createBtn.click();
    await page.waitForTimeout(6000);

    const bodyText = await page.innerText("body");
    const currentUrl = page.url();
    console.log("Current URL after submit:", currentUrl);
    console.log("Body snippet:\n", bodyText.slice(0, 400));

    if (!bodyText.toLowerCase().includes("invalid input") && !bodyText.toLowerCase().includes("issue found")) {
      console.log(">>> SUCCESS: PRLog Account form accepted! <<<");
      signupSuccess = true;
      await page.screenshot({ path: "/tmp/prlog_signup_success.png", fullPage: true });
      break;
    }

    console.log("Captcha not accepted or issue found, retrying next round...");
    await page.waitForTimeout(2000);
  }

  if (!signupSuccess) {
    console.error("Could not complete signup within 6 attempts.");
    await browser.close();
    return { ok: false, error: "signup_retry_exhausted" };
  }

  // Monitor Apple Mail for PRLog verification email
  console.log("\n=== Monitoring Apple Mail for PRLog Activation Email ===");
  let activationUrl = null;
  for (let attempt = 1; attempt <= 30; attempt++) {
    console.log(`Checking Apple Mail (attempt ${attempt}/30)...`);
    const mailContent = checkAppleMailForPRLog();
    if (mailContent) {
      console.log(">>> FOUND PRLOG ACTIVATION EMAIL IN APPLE MAIL! <<<");
      fs.writeFileSync("/tmp/prlog_activation_email.txt", mailContent);
      console.log("Email Snippet:\n", mailContent.slice(0, 400));

      const match = mailContent.match(/https?:\/\/[^\s"<>]+prlog\.org[^\s"<>]*(?:act|verify|confirm|auth)[^\s"<>]*/i) ||
                    mailContent.match(/https?:\/\/[^\s"<>]+prlog\.org[^\s"<>]*/i);
      if (match) {
        activationUrl = match[0].replace(/[\.,;)]+$/, "");
        console.log(">>> Extracted PRLog Activation Link:", activationUrl);
        break;
      }
    }
    await page.waitForTimeout(6000);
  }

  if (activationUrl) {
    console.log("Navigating to PRLog Activation Link:", activationUrl);
    await page.goto(activationUrl, { timeout: 35000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "/tmp/prlog_activated.png", fullPage: true });
    console.log("Activated URL:", page.url());
    console.log("Activated Page Title:", await page.title());
  } else {
    console.log("Activation email link not yet found within timeout. Check Apple Mail.");
  }

  await browser.close();
  return { ok: true, activationUrl };
}

run().catch(console.error);
