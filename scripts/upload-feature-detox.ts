import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";
import { getAdminToken } from "./lib/adminAuth.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadFeatureDetox() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log("🖼️  Reading feature detox image...");
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/feature-detox.webp";
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

  console.log("💾 Saving metadata to Convex (updating featureSilence)...");
  await client.mutation(api.siteImages.upload, {
    token,
    name: "featureSilence",
    category: "feature",
    storageId,
    mimeType: "image/webp",
    size: imageBlob.size,
    width: 1024,
    height: 1024,
    alt: "Woman practicing Pilates on reformer in nature - green forest landscape",
    description: "Feature image for Detox Your Movement section - woman in white on reformer surrounded by nature",
  });

  console.log("✅ Feature detox image uploaded successfully!");
  console.log("📝 Image name: featureSilence (updated)");
  console.log("📐 Category: feature");
}

uploadFeatureDetox().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
