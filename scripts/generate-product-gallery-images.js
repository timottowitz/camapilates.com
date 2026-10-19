import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'src/content/products.json');
const PUBLIC_DIR = path.join(ROOT, 'public');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is required in environment.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateGeminiImage(prompt, retryCount = 3) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
      }

      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!part || !part.inlineData?.data) {
        throw new Error(`No image data returned in response: ${JSON.stringify(data).slice(0, 200)}`);
      }

      return Buffer.from(part.inlineData.data, 'base64');
    } catch (err) {
      console.warn(`   ⚠️ Attempt ${attempt}/${retryCount} failed: ${err.message}`);
      if (attempt < retryCount) {
        await sleep(4000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

function saveAsWebP(pngBuffer, outputPathWebp) {
  const tempPng = `/tmp/gen_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
  fs.writeFileSync(tempPng, pngBuffer);
  try {
    const dir = path.dirname(outputPathWebp);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    execSync(`cwebp -q 82 "${tempPng}" -o "${outputPathWebp}"`, { stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tempPng)) {
      fs.unlinkSync(tempPng);
    }
  }
}

function buildPromptsForProduct(product) {
  const name = product.name;
  const desc = product.description;
  const category = product.category || 'Reformers';
  const materials = (product.materials || []).join(', ');

  let subjectDesc = `${name}. ${desc}`;
  let settingLifestyle = "Inside an authentic, ultra-luxurious boutique Pilates studio with floor-to-ceiling windows, natural soft morning sunlight pouring onto polished warm oak floor and microcement lime-washed walls. Editorial architectural photography for Architectural Digest.";
  let settingDetail = "Ultra-sharp close-up macro product photograph showing authentic industrial engineering details: precision German piano wire springs, heavy-duty silent Japanese bearings, smooth carriage aluminum glide rail, flawless stitching on high-density microfibre leather upholstery.";

  if (category === 'Accesorios' || category === 'Ropa') {
    settingLifestyle = "Aesthetic minimalist fitness studio shot with warm natural sunlight, clean linen textures, zen luxury wellness aesthetic, 35mm film photography look, completely photorealistic and authentic.";
    settingDetail = "Crisp close-up studio detail photograph showing exquisite organic fabric weave, natural tactile stitching, tactile non-slip rubber grip pattern on clean beige limestone background.";
  }

  const prompt1 = `High-end commercial product photography of authentic ${subjectDesc}. Setting: ${settingLifestyle}. Realistic physical lighting, soft ambient shadows, photorealistic 8k, Hasselblad medium format camera, natural materials (${materials || 'handcrafted hardwood and structural alloy'}), authentic proportions and textures, hyper-realistic, no 3D render look, no CGI plastic feel, no text, no watermarks. 1:1 aspect ratio.`;

  const prompt2 = `Professional commercial macro & mechanical detail photography of authentic ${subjectDesc}. Focus: ${settingDetail}. True-to-life metallic reflections, matte brushed finishes, tactile leather grain, real workshop precision, genuine commercial studio catalog lighting, 8k resolution, crisp depth of field, photorealistic, no CGI, no text, no logos. 1:1 aspect ratio.`;

  return [prompt1, prompt2];
}

async function main() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  console.log(`Starting real-style image generation for ${products.length} products...`);

  let totalGenerated = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.name} (${product.slug})`);

    const img1RelPath = `/images/products/${product.slug}-studio.webp`;
    const img2RelPath = `/images/products/${product.slug}-detail.webp`;
    const img1AbsPath = path.join(PUBLIC_DIR, 'images/products', `${product.slug}-studio.webp`);
    const img2AbsPath = path.join(PUBLIC_DIR, 'images/products', `${product.slug}-detail.webp`);

    const [prompt1, prompt2] = buildPromptsForProduct(product);

    // Image 1: Studio context / lifestyle
    if (!fs.existsSync(img1AbsPath)) {
      console.log(`  📸 Generating image 1 (studio lifestyle)...`);
      try {
        const buf1 = await generateGeminiImage(prompt1);
        saveAsWebP(buf1, img1AbsPath);
        console.log(`  ✓ Saved: ${img1RelPath} (${fs.statSync(img1AbsPath).size} bytes)`);
        totalGenerated++;
        await sleep(2000);
      } catch (e) {
        console.error(`  ❌ Failed image 1 for ${product.slug}:`, e.message);
      }
    } else {
      console.log(`  ⏭️  Image 1 already exists: ${img1RelPath}`);
    }

    // Image 2: Detail / craftsmanship
    if (!fs.existsSync(img2AbsPath)) {
      console.log(`  📸 Generating image 2 (craftsmanship detail)...`);
      try {
        const buf2 = await generateGeminiImage(prompt2);
        saveAsWebP(buf2, img2AbsPath);
        console.log(`  ✓ Saved: ${img2RelPath} (${fs.statSync(img2AbsPath).size} bytes)`);
        totalGenerated++;
        await sleep(2000);
      } catch (e) {
        console.error(`  ❌ Failed image 2 for ${product.slug}:`, e.message);
      }
    } else {
      console.log(`  ⏭️  Image 2 already exists: ${img2RelPath}`);
    }

    // Update product fields
    product.hoverImage = img1RelPath;
    product.galleryImages = [img1RelPath, img2RelPath];

    // Save progress to products.json incrementally
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2) + '\n');
  }

  console.log(`\n🎉 Image generation finished! Total new images created: ${totalGenerated}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
