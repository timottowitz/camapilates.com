import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadReformerEditorial() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("🖼️  Reading reformer editorial image...");
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/reformer-editorial-1.webp";
  const imageBuffer = await Deno.readFile(imagePath);
  const imageBlob = new Blob([imageBuffer], { type: "image/webp" });

  console.log(`📊 Image size: ${(imageBlob.size / 1024).toFixed(2)} KB`);

  console.log("🔗 Generating upload URL...");
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, {});

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
    name: "reformerEditorial1",
    category: "product",
    storageId,
    mimeType: "image/webp",
    size: imageBlob.size,
    width: 1024,
    height: 1024,
    alt: "Artistic editorial photo - Woman on Pilates Reformer with floral headpiece against green backdrop",
    description: "Campaign editorial image for Reformer Casa product - artistic lifestyle shot",
  });

  console.log("✅ Reformer editorial image uploaded successfully!");
  console.log("📝 Image name: reformerEditorial1");
  console.log("📐 Category: product");
}

uploadReformerEditorial().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
