import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadFeatureSilence() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("🖼️  Reading feature image file...");
  const imagePath = "/Users/m3max361tb/Documents/Code/Pilates_Reformer/public/images/feature_1.webp";
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
    name: "featureSilence",
    category: "feature",
    storageId,
    mimeType: "image/webp",
    size: imageBlob.size,
    alt: "Man performing side plank on Pilates reformer - Detox Your Movement section",
    description: "Feature image for Philosophy section showing athletic movement on reformer",
  });

  console.log("✅ Feature image uploaded successfully!");
  console.log("📝 Image name: featureSilence");
  console.log("📐 Category: feature");
}

uploadFeatureSilence().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
