import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";
import { getAdminToken } from "./lib/adminAuth.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadShopHero() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log("🖼️  Reading shop hero image file...");
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/shop-hero-bohemian.png";
  const imageBuffer = await Deno.readFile(imagePath);
  const imageBlob = new Blob([imageBuffer], { type: "image/png" });

  console.log(`📊 Image size: ${(imageBlob.size / 1024).toFixed(2)} KB`);

  console.log("🔗 Generating upload URL...");
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, { token });

  console.log("⬆️  Uploading image to Convex...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/png" },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  const { storageId } = await uploadResponse.json();
  console.log("✅ Image uploaded, storageId:", storageId);

  console.log("💾 Saving metadata to Convex...");
  await client.mutation(api.siteImages.upload, {
    token,
    name: "shopHero",
    category: "hero",
    storageId,
    mimeType: "image/png",
    size: imageBlob.size,
    width: 1024,
    height: 683,
    alt: "Modelo con vestimenta bohemia colorida frente a reformer de pilates de madera - coleccion Edelweiss Mexico",
    description: "Shop hero: Model in colorful bohemian outfit standing in front of wooden pilates reformer with artistic painted background",
  });

  console.log("✅ Shop hero image uploaded successfully!");
  console.log("📝 Image name: shopHero");
  console.log("📐 Category: hero");
}

uploadShopHero().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
