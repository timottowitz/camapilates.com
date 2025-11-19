import { ConvexHttpClient } from "convex/browser";
// @ts-ignore - Deno TS doesn't understand Convex generated types
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = Deno.env.get("VITE_CONVEX_URL");

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  Deno.exit(1);
}

async function uploadVideo() {
  const client = new ConvexHttpClient(CONVEX_URL);

  console.log("📹 Reading video file...");
  const videoPath = "/Users/m3max361tb/Movies/header_low_2.mov";
  const videoBuffer = await Deno.readFile(videoPath);
  const videoBlob = new Blob([videoBuffer], { type: "video/quicktime" });

  console.log(`📊 Video size: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);

  console.log("🔗 Generating upload URL...");
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl, {});

  console.log("⬆️  Uploading video to Convex...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "video/quicktime" },
    body: videoBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  const { storageId } = await uploadResponse.json();
  console.log("✅ Video uploaded, storageId:", storageId);

  console.log("💾 Saving metadata to Convex...");
  await client.mutation(api.siteImages.upload, {
    name: "heroVideo",
    category: "video",
    storageId,
    mimeType: "video/quicktime",
    size: videoBlob.size,
    width: 1920,
    height: 700,
    alt: "Pilates Reformer in motion - homepage hero",
    description: "Native resolution hero video for homepage (1920x700, 96:35 aspect ratio)",
  });

  console.log("✅ Video uploaded successfully!");
  console.log("📝 Video name: heroVideo");
  console.log("📐 Dimensions: 1920x700 (96:35 aspect ratio)");
}

uploadVideo().catch((error) => {
  console.error("❌ Error:", error);
  Deno.exit(1);
});
