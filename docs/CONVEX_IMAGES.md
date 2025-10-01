# Convex Image Storage System

This project uses Convex for image storage instead of committing large images to Git. This provides several benefits:

## Benefits

✅ **No repo bloat** - Images stored in Convex, not Git
✅ **Update without redeploying** - Change images instantly
✅ **Built-in CDN** - Convex serves images via global CDN
✅ **Automatic caching** - Cloudflare caches Convex URLs
✅ **Version control** - Track image metadata in database

## Architecture

```
User Request → Cloudflare CDN → Convex Storage → User
                    ↓ (caches for 1 year)
```

### Cache Flow:
1. **First request**: Cloudflare fetches from Convex, caches response
2. **Subsequent requests**: Served from Cloudflare edge (fast!)
3. **Image update**: New hash in URL → cache miss → fetches new image

## Schema

Images are stored in the `site_images` table:

```typescript
{
  name: string           // "shopHero", "featuredProducts", etc.
  category: string       // "hero" | "featured" | "icon" | "logo"
  storageId: Id          // Convex storage file ID
  mimeType: string       // "image/webp", "image/jpeg", etc.
  size: number          // File size in bytes
  width?: number
  height?: number
  alt?: string
  isActive: boolean
  cacheControl: string   // "public, max-age=31536000, immutable"
  createdAt: number
  updatedAt: number
}
```

## Usage in React Components

### Option 1: Use the hook (Recommended)

```typescript
import { useConvexAssets } from '@/lib/convexAssets';

function MyComponent() {
  const assets = useConvexAssets();

  return <img src={assets.shopHero} alt="Hero" />;
}
```

### Option 2: Individual image hook

```typescript
import { useConvexImage } from '@/hooks/useConvexImage';

function MyComponent() {
  const heroUrl = useConvexImage('shopHero', '/fallback.webp');

  return <img src={heroUrl} alt="Hero" />;
}
```

## Uploading Images

### From TypeScript/React

```typescript
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function ImageUploader() {
  const upload = useMutation(api.siteImages.upload);

  async function handleUpload(file: File) {
    // 1. Upload file to Convex storage
    const storageId = await uploadFile(file);

    // 2. Create database entry
    await upload({
      name: 'shopHero',
      category: 'hero',
      storageId,
      mimeType: file.type,
      size: file.size,
      alt: 'Shop hero image',
    });
  }

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />;
}
```

### From Convex Dashboard

1. Go to your Convex dashboard
2. Navigate to "Storage"
3. Upload image file → note the `storageId`
4. Run mutation in dashboard:

```javascript
api.siteImages.upload({
  name: "shopHero",
  category: "hero",
  storageId: "YOUR_STORAGE_ID_HERE",
  mimeType: "image/webp",
  size: 84000,
  width: 1920,
  height: 1080,
  alt: "Shop hero banner"
})
```

## API Endpoints

### Get image by name
```
GET /api/images/:name
Example: /api/images/shopHero
```

Response headers:
```
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/webp
X-Image-Name: shopHero
X-Image-Size: 84000
```

## Available Images

Current image names (from `CONVEX_IMAGE_NAMES`):

- `shopHero` - Shop page hero banner
- `featuredProducts` - Featured product section
- `catReformers` - Reformers category icon
- `catAccessories` - Accessories category icon
- `finishMycelium` - Mycelium finish texture
- `myloBadge` - Mylo™ badge
- `myloSpecial` - Mylo special banner
- `edelweissLogo` - Edelweiss brand logo

## Migration from Local Images

### Before (local images):
```typescript
import { ASSETS } from '@/lib/assets';
<img src={ASSETS.shopHero} />
```

### After (Convex images):
```typescript
import { useConvexAssets } from '@/lib/convexAssets';
const assets = useConvexAssets();
<img src={assets.shopHero} />
```

The system automatically falls back to local images if Convex image doesn't exist yet.

## Cache Headers Explained

```
Cache-Control: public, max-age=31536000, immutable
```

- `public` - Can be cached by any cache (Cloudflare, browser)
- `max-age=31536000` - Cache for 1 year (31536000 seconds)
- `immutable` - Won't change during cache lifetime

When you upload a new image with the same name, Convex generates a new URL, so caches won't serve stale content.

## Cloudflare Integration

Cloudflare automatically caches responses from Convex based on the `Cache-Control` header. No additional configuration needed!

### Cache Purging

If you need to purge Cloudflare cache after updating images:

```bash
gh workflow run cloudflare-purge.yml
```

This is rarely needed since new images get new URLs.

## Best Practices

1. **Use WebP format** for best compression
2. **Optimize images** before uploading (use tools like Squoosh)
3. **Set descriptive names** like "shopHero" not "image1"
4. **Add alt text** for accessibility
5. **Keep original dimensions** in metadata

## Troubleshooting

### Image not loading?

1. Check Convex dashboard → Storage → verify file exists
2. Check database → `site_images` → verify entry exists
3. Check browser console for errors
4. Try clearing Cloudflare cache

### Images updating slowly?

- Cloudflare caches for 1 year
- Use cache purge workflow or wait for CDN propagation (~5 minutes)

## Cost

Convex storage pricing (as of 2025):
- First 1 GB free
- $0.10/GB/month after that
- Bandwidth included in plan

Typical costs for this app: **~$0** (well under 1GB)
