import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";

// Check Apple Mail for PressReleasePoint activation email
function checkAppleMailForPRPoint() {
  const script = `tell application "Mail"
    check for new mail for account "CAMA Pilates"
    set d to (current date) - (15 * minutes)
    try
      set mb to mailbox "INBOX" of account "CAMA Pilates"
      set mList to (messages of mb whose date received > d)
      repeat with m in mList
        set s to (subject of m)
        set snd to (sender of m)
        if (s contains "PressReleasePoint" or snd contains "pressreleasepoint" or s contains "Account details" or s contains "Activation" or s contains "Welcome") then
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
    viewport: { width: 1300, height: 1100 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  console.log("Navigating to PressReleasePoint Registration: https://www.pressreleasepoint.com/user/register...");
  await page.goto("https://www.pressreleasepoint.com/user/register", { timeout: 35000 });
  await page.waitForSelector("form#user-register-form", { timeout: 25000 });
  console.log("Form loaded! Title:", await page.title());

  // Canonical Data adhering to strict rules
  const canonicalEmail = "tim@camadepilates.com";
  const canonicalPhone = "+52 322 278 7690";
  const canonicalUsername = "camapilates";
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/press/edelweiss-founders-pr.jpg";
  const founderName = "Tim Ottowitz & Valery Munive";

  console.log("Filling canonical user credentials (tim@camadepilates.com)...");
  await page.fill("#edit-name--2", canonicalUsername);
  await page.fill("#edit-mail", canonicalEmail);
  await page.fill("#edit-conf-mail", canonicalEmail);

  // Business Profile: Must start with "Edelweiss / CAMA Pilates" AND mention it at least twice
  console.log("Filling business profile (mentioning Edelweiss / CAMA Pilates at least twice)...");
  await page.fill("#edit-profile-company", "Edelweiss / CAMA Pilates");
  await page.fill("#edit-profile-homepage", "https://camadepilates.com");
  await page.fill(
    "#edit-profile-company-profile",
    "Edelweiss / CAMA Pilates es una empresa pionera de ingeniería de equipamiento y ecosistema formativo de Pilates que impulsa la disciplina en México y el mundo. A través de manufactura de alta precisión, Edelweiss / CAMA Pilates diseña y fabrica camas de Pilates Reformer de uso rudo comercial con ingeniería alemana y ebanistería sustentable en maderas finas (nogal americano y roble blanco). Además, operamos el primer Directorio Nacional de Certificaciones de Pilates en México (https://camadepilates.com/certificacion-pilates), conectando a instructores con academias acreditadas sin intermediarios ni comisiones."
  );

  await page.fill("#edit-profile-ceo", "Tim Ottowitz");
  await page.fill("#edit-profile-founder", founderName);
  
  // Management must be at least 50 words AND include the exact founder name "Tim Ottowitz & Valery Munive"
  console.log("Filling management with founder name and >50 words...");
  const managementText = `Founders Tim Ottowitz & Valery Munive lead the executive management team. Tim Ottowitz acts as Co-Founder, Chief Executive Officer (CEO) and Chief Architect, overseeing international product development, German mechanical engineering, and digital infrastructure. Valery Munive acts as Co-Founder and Master Trainer, directing teacher certification standards, biomechanics, curriculum design, and instructor relations. Together, the executive leadership team manages commercial manufacturing operations in Mexico and expansion across Latin America and Europe.`;
  await page.fill("#edit-profile-management", managementText);

  // Year Founded (2025)
  try {
    await page.selectOption("#edit-profile-yearfounded-year", "2025");
  } catch (e) {
    console.log("Year founded option notice:", e.message);
  }

  await page.fill("#edit-profile-empcount", "10");
  await page.fill(
    "#edit-profile-address",
    "Zona Hotelera Norte / Marina Vallarta, Puerto Vallarta, Jalisco 48333, Mexico"
  );
  await page.fill("#edit-profile-phonenumber", canonicalPhone);

  // Dropdown Selections
  console.log("Selecting Country: Mexico...");
  await page.selectOption("#edit-profile-location", "Mexico");

  console.log("Selecting Industry: Wellness / Manufacturing...");
  try {
    await page.selectOption("#edit-profile-industry", "Wellness");
  } catch (e) {
    await page.selectOption("#edit-profile-industry", "Manufacturing");
  }

  // PR Contact info
  await page.fill("#edit-profile-prperson", "Tim Ottowitz");
  await page.fill("#edit-profile-prcontact", canonicalEmail);
  await page.fill("#edit-profile-instagram", "https://www.instagram.com/camapilates");

  // Press Release Content: Must include "Edelweiss / CAMA Pilates" in title and summary
  console.log("Populating Press Release fields...");
  await page.fill(
    "#edit-profile-prtitle",
    "Edelweiss / CAMA Pilates Announces Democratization of Pilates: Mexico's First Open Certification Directory"
  );
  await page.fill(
    "#edit-profile-prsummary",
    "Edelweiss / CAMA Pilates launches Mexico's first comprehensive open-access directory connecting aspiring instructors with 22 accredited academies alongside German-engineered commercial Reformer manufacturing."
  );

  // Body must have "/PressReleasePoint/ --" after place and date
  const prBody = `Puerto Vallarta, Jalisco, Mexico., September 17, 2026 /PressReleasePoint/ -- Edelweiss / CAMA Pilates, the pioneering Pilates design and manufacturing firm behind CAMA Pilates (https://camadepilates.com), today announced a groundbreaking initiative aimed at the complete democratization of the Pilates industry: the official launch of Mexico's first comprehensive, open-access Pilates Certification Directory (https://camadepilates.com/certificacion-pilates).

Historically, prospective Pilates instructors in Latin America faced severe informational asymmetry, fragmented training standards, hidden exam fees, and steep commissions from digital gatekeepers. Edelweiss's new directory dismantles these barriers by mapping 22 accredited partner academies and master trainers across 10 strategic Mexican metropolises: Ciudad de México (CDMX), Monterrey, Guadalajara/Zapopan, Puebla, Querétaro, Puerto Vallarta, Tijuana, Riviera Maya, León, and Mérida.

Through the platform, aspiring teachers can freely examine curricula, course durations (ranging from 28-hour essential modules to 600-hour comprehensive apparatus certifications), credential accreditations (STOTT PILATES, PMA/NPCP, SEP, and Classical 2nd Generation lineages), and connect directly with academy coordinators via one-click WhatsApp—completely commission-free.

Connecting Back to the Roots of Joseph Pilates
Simultaneously, Edelweiss announced that Germany has been selected as the second country in its international directory roadmap, scheduled for launch in late 2026 / early 2027. Joseph Hubertus Pilates was born in 1883 in Mönchengladbach, Germany, where he developed his revolutionary mind-body philosophy (Contrology) before engineering the iconic Universal Reformer. Edelweiss honors this lineage by uniting precision German mechanical engineering with master Mexican woodworking craftsmanship.

"Pilates was never intended to be an exclusive, gatekept luxury reserved for a privileged few," said Tim Ottowitz, Founder & Chief Architect at Edelweiss / CAMA Pilates. "Our mission is the radical democratization of the discipline. By providing a free, transparent national directory in Mexico—and soon across Germany—we empower future instructors to choose the highest caliber education with total clarity. Furthermore, we eliminate the equipment barrier by manufacturing world-class, German-engineered commercial Reformers locally in North America, ensuring newly graduated teachers can launch viable boutique studios without drowning in debt or prohibitive import costs."

B2B Synergy for New Studio Owners
In tandem with the directory, Edelweiss is offering certified graduates of allied academies preferential equipment packages on its flagship Commercial Reformers for Studios (https://camadepilates.com/reformer-para-estudio), custom logo laser-engraving, natural solid American walnut and white oak finishes, direct studio leasing terms, and nationwide 48-hour replacement parts delivery.

About Edelweiss & CAMA Pilates:
Edelweiss is an international Pilates equipment and education platform founded on the principles of mechanical precision, uncompromising craftsmanship, and radical accessibility. Through its flagship brand CAMA Pilates (https://camadepilates.com), the enterprise engineers commercial-grade Reformers, Cadillacs, and studio apparatus crafted from solid American walnut, white oak, and aerospace-grade aluminum. Headquartered in Mexico and Germany, the company unites German engineering heritage with local sustainable artisan woodworking, while operating open digital directories to connect aspiring instructors with premier certified academies.

Media Relations & Corporate Communications:
Edelweiss / CAMA Pilates
Contact: Tim Ottowitz, Co-Founder & CEO
Email: tim@camadepilates.com
Phone / WhatsApp: +52 322 278 7690
Website: https://camadepilates.com
Zona Hotelera Norte / Marina Vallarta, Puerto Vallarta, Jalisco 48333, Mexico`;

  await page.fill("#edit-profile-prbody", prBody);

  // ALWAYS UPLOAD THE APPROVED MEDIA IMAGE
  console.log("Attaching approved press image (Valery & Tim bust portrait, no baby belly):", imagePath);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Required image not found at ${imagePath}`);
  }
  await page.setInputFiles("#edit-picture-upload", imagePath);
  console.log("Image attached successfully!");

  await page.screenshot({ path: "/tmp/prpoint_filled_v3.png", fullPage: true });

  console.log("Submitting registration form...");
  const submitBtn = page.locator("#edit-submit--2");
  await Promise.all([
    page.waitForNavigation({ timeout: 45000 }).catch(e => console.log("Navigation timeout:", e.message)),
    submitBtn.click()
  ]);

  await page.waitForTimeout(5000);
  console.log("URL after submit:", page.url());
  console.log("Title after submit:", await page.title());
  const bodyText = await page.innerText("body");
  console.log("Body snippet after submit:\n", bodyText.slice(0, 1000));
  await page.screenshot({ path: "/tmp/prpoint_after_submit_v3.png", fullPage: true });

  // Check Apple Mail for verification email
  console.log("\n=== Monitoring Apple Mail for PressReleasePoint Activation Email ===");
  let activationUrl = null;
  for (let attempt = 1; attempt <= 30; attempt++) {
    console.log(`Checking Apple Mail (attempt ${attempt}/30)...`);
    const mailContent = checkAppleMailForPRPoint();
    if (mailContent) {
      console.log(">>> FOUND PRESSRELEASEPOINT ACTIVATION EMAIL IN APPLE MAIL! <<<");
      fs.writeFileSync("/tmp/prpoint_activation_email.txt", mailContent);
      console.log("Email Snippet:\n", mailContent.slice(0, 500));

      const match = mailContent.match(/https?:\/\/[^\s"<>]+pressreleasepoint\.com\/user\/reset[^\s"<>]*/i) ||
                    mailContent.match(/https?:\/\/[^\s"<>]+pressreleasepoint\.com[^\s"<>]*(?:confirm|verify|auth|reset)[^\s"<>]*/i);
      if (match) {
        activationUrl = match[0].replace(/[\.,;)]+$/, "");
        console.log(">>> Extracted Activation Link:", activationUrl);
        break;
      }
    }
    await page.waitForTimeout(6000);
  }

  if (activationUrl) {
    console.log("Navigating to Activation Link:", activationUrl);
    await page.goto(activationUrl, { timeout: 35000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "/tmp/prpoint_activated.png", fullPage: true });
    console.log("Activated Page Title:", await page.title());
    console.log("Activated Page URL:", page.url());
  } else {
    console.log("Activation email link not yet found within timeout. Please check Apple Mail.");
  }

  await browser.close();
  return { ok: true, url: page.url(), activationUrl };
}

run().catch(console.error);
