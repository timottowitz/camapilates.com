# Image Upload Guide for Claude Code

This guide explains how to handle image uploads when users drop images in the chat.

---

## 🖼️ When User Drops an Image

**User says:** "Add this image to [area]" *[drops image]*

**You must:**

1. **Save the image temporarily**
2. **Upload to Convex storage** (ALL images go to Convex)
3. **Update convexAssets.ts** with the new image name
4. **Verify the change works**

---

## 📁 Image Storage Architecture

### Convex Storage (ALL Images)
**CRITICAL:** We ONLY use Convex for all images. No public folder images.

**Categories:**
- `hero` - Hero/header images
- `product` - Product images
- `feature` - Feature section images
- `logo` - Brand logos
- `badge` - Badges and icons
- `finish` - Material/finish images
- `testimonial` - User testimonials
- `team` - Team member photos
- `blog` - Blog post images (including OG images)

**Database:** `site_images` table in Convex

---

## 🔄 Upload Process

### Convex Storage (ONLY Method)

**Step 1: Create upload script**
```typescript
// scripts/upload-convex-image.ts
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import fs from 'fs';
import path from 'path';

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function uploadImage(params: {
  filePath: string;
  name: string;
  category: string;
  alt?: string;
  description?: string;
}) {
  const { filePath, name, category, alt, description } = params;

  // 1. Read file
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);

  // 2. Generate upload URL
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl);

  // 3. Upload file
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    body: blob,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

  const { storageId } = await response.json();

  // 4. Save metadata
  const result = await client.mutation(api.siteImages.upload, {
    name,
    category,
    storageId,
    mimeType: blob.type || 'image/webp',
    size: blob.size,
    alt,
    description,
  });

  console.log(`✅ Image uploaded: ${name} (${category})`);
  return result;
}

// Usage
uploadImage({
  filePath: './temp-image.webp',
  name: 'heroVideo',
  category: 'hero',
  alt: 'Pilates Reformer en movimiento',
  description: 'Hero video background image',
});
```

**Step 2: Run upload**
```bash
deno run --allow-all scripts/upload-convex-image.ts
```

**Step 3: Update code to use Convex image**
```typescript
// src/lib/convexAssets.ts
export const CONVEX_IMAGE_NAMES = {
  // Add your new image
  HERO_VIDEO: 'heroVideo',
  // ... existing
} as const;

// Add fallback
const FALLBACKS = {
  heroVideo: '/images/hero-video-fallback.webp',
  // ... existing
};

// Export in useConvexAssets
export function useConvexAssets() {
  const heroVideo = useConvexImage(
    CONVEX_IMAGE_NAMES.HERO_VIDEO,
    getVersionedImageUrl(FALLBACKS.heroVideo)
  );

  return {
    heroVideo,
    // ... existing
  };
}
```

**Step 4: Use in component**
```typescript
import { useConvexAssets } from '@/lib/convexAssets';

function HeroSection() {
  const assets = useConvexAssets();

  return (
    <img src={assets.heroVideo} alt="Hero" />
  );
}
```

---

## 📋 Category-Specific Instructions

### Hero Images (Homepage, Landing Pages)
**Location:** Convex `category: "hero"`
**Size:** 1920x1080 minimum (16:9)
**Format:** WebP, AVIF, or optimized JPEG
**Name:** Descriptive (e.g., `heroHomepage`, `heroShop`)

### Product Images
**Location:** Convex `category: "product"`
**Size:** 1000x1000 minimum (1:1)
**Format:** WebP with transparent background
**Name:** Product slug (e.g., `reformerPremium`)

### Blog Post Images (OG Images)
**Location:** Convex `category: "blog"`
**Size:** 1200x630 (Facebook OG standard)
**Format:** PNG or JPEG
**Name:** Blog slug (e.g., `mejor-cama-de-pilates-casa`)

### Feature Section Images
**Location:** Convex `category: "feature"`
**Size:** 800x600 minimum (4:3)
**Format:** WebP
**Name:** Feature identifier (e.g., `featureSilence`, `featureQuality`)

### Logos and Badges
**Location:** Convex `category: "logo"` or `"badge"`
**Size:** SVG preferred, or PNG at 2x size
**Format:** SVG > WebP > PNG
**Name:** Logo name (e.g., `edelweissLogo`, `myloBadge`)

---

## ✅ Upload Checklist

When a user drops an image:

- [ ] **Identify the area** (hero, product, feature, blog, etc.)
- [ ] **Optimize image** (WebP, correct size, compressed)
- [ ] **Upload to Convex** (run upload script)
- [ ] **Update convexAssets.ts** (add image name constant and hook)
- [ ] **Test locally** (verify image loads correctly)
- [ ] **Commit changes** (code changes only - image is in Convex)
- [ ] **Deploy** (push to main for Cloudflare deployment)

---

## 🔧 Helper Scripts

### Create Upload Script
```bash
# Create script for user's image
cat > scripts/upload-{name}.ts << 'EOF'
// Script content from Option 1 above
EOF

# Make executable
chmod +x scripts/upload-{name}.ts

# Run
deno run --allow-all scripts/upload-{name}.ts
```

### Bulk Upload
```typescript
// scripts/bulk-upload-images.ts
const images = [
  { path: './img1.webp', name: 'hero1', category: 'hero' },
  { path: './img2.webp', name: 'product1', category: 'product' },
];

for (const img of images) {
  await uploadImage(img);
}
```

---

## 🚨 Common Pitfalls

### 1. Wrong Image Size
**Problem:** Image too large, slow page load
**Solution:** Resize before upload
```bash
# Resize to max 1920px width
npx sharp-cli resize 1920 --input large.jpg --output optimized.webp
```

### 2. Wrong Format
**Problem:** PNG when WebP is better
**Solution:** Convert to WebP
```bash
npx @squoosh/cli --webp auto image.png
```

### 3. Missing Fallback
**Problem:** Convex image breaks, no fallback
**Solution:** Always provide fallback in `FALLBACKS` object in convexAssets.ts

### 4. Forgot to Update convexAssets.ts
**Problem:** Image uploaded to Convex but not accessible in code
**Solution:** Always add image name to `CONVEX_IMAGE_NAMES` and `useConvexAssets()` hook

---

## 📝 Example Conversation

**User:** "Add this image as the homepage hero" *[drops silence-image.webp]*

**You should:**

1. **Acknowledge:**
   "I'll add this image as the homepage hero background using Convex storage."

2. **Save image temporarily:**
   ```bash
   # Save to temp location first
   cp silence-image.webp /tmp/hero-homepage.webp
   ```

3. **Create upload script:**
   ```typescript
   // scripts/upload-hero-homepage.ts
   uploadImage({
     filePath: '/tmp/hero-homepage.webp',
     name: 'heroHomepage',
     category: 'hero',
     alt: 'Silence that is felt in each repetition',
     description: 'Homepage hero image showing premium Reformer quality'
   });
   ```

4. **Run upload:**
   ```bash
   deno run --allow-all scripts/upload-hero-homepage.ts
   ```

5. **Update convexAssets.ts:**
   Add `HERO_HOMEPAGE` constant and hook

6. **Update Index.tsx:**
   Use the new Convex asset via `assets.heroHomepage`

7. **Test and commit:**
   ```bash
   npm run build  # Test
   git add .
   git commit -m "feat(hero): add new homepage hero image via Convex"
   git push
   ```

8. **Confirm:**
   "✅ Hero image uploaded to Convex and updated in homepage. Changes pushed to main."

---

## 🔗 Related Files

- `convex/siteImages.ts` - Convex image mutations/queries
- `src/lib/convexAssets.ts` - Image name constants and hooks
- `src/hooks/useConvexImage.ts` - Hook for fetching Convex images

---

**Remember:** We ONLY use Convex for images. Always upload to Convex and provide fallback URLs in convexAssets.ts for reliability!
