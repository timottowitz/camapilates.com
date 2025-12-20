import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";
import { getAdminToken } from "./lib/adminAuth.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadHeroImage() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log("🖼️  Reading hero image file...");
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/hero-edelweiss.webp";
  const imageBuffer = await Deno.readFile(imagePath);
  const imageBlob = new Blob([imageBuffer], { type: "image/webp" });

  console.log(`📊 Image size: ${(imageBlob.size / 1024).toFixed(2)} KB`);

  console.log("🔗 Generating upload URL...");
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, { token });

  console.log("⬆️  Uploading image to Convex...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
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
    name: "heroEdelweiss",
    category: "hero",
    storageId,
    mimeType: "image/webp",
    size: imageBlob.size,
    width: 1920,
    height: 1080,
    alt: "Mujer practicando pilates en reformer de madera con luz natural matutina - Edelweiss Pilates",
    description: "Hero image: Model stretching on wood reformer wearing organic cotton leggings, bright morning light",
  });

  console.log("✅ Hero image uploaded successfully!");
  console.log("📝 Image name: heroEdelweiss");
  console.log("📐 Category: hero");
}

uploadHeroImage().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
