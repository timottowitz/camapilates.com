# AI-Powered Image Management System with Auto-Generation

## 🎯 Overview

This system uses **GPT-4 Vision** to automatically analyze images and generate detailed JSON descriptions, then uses **DALL-E 3** to create copyright-free similar images. This enables intelligent image selection based on natural language queries while avoiding copyright issues.

## 📊 Architecture

### Database Schema

**Table:** `ai_images` in Convex

```typescript
{
  fileName: string,
  storageId: Id<"_storage">,              // Original image
  mimeType: string,
  size: number,
  dimensions: {
    width: number,
    height: number
  },

  // AI Vision Analysis (GPT-4 Vision)
  aiDescription: {
    scene: string,              // "Pilates instructor teaching reformer class"
    subjects: string[],          // ["instructor", "students", "reformers"]
    activity: string,            // "Group Pilates instruction"
    mood: string,                // "Professional, welcoming"
    colors: string[],            // ["neutral", "gray", "beige"]
    composition: string,         // "Instructor in foreground, students behind"
    lighting: string,            // "Natural studio lighting"
    setting: string,             // "Indoor Pilates studio"
    useCases: string[],          // ["hero", "feature", "about"]
    tags: string[],              // ["pilates", "instructor", "class", ...]
    quality: string              // "Excellent"
  },

  // AI-Generated Similar Image (DALL-E 3)
  generatedStorageId?: Id<"_storage">,    // Generated copyright-free image
  generationPrompt?: string,              // Prompt used for generation
  generatedDimensions?: {
    width: number,
    height: number
  },
  generatedAt?: number,
  generationStatus?: string,              // 'pending' | 'generating' | 'completed' | 'failed'
  generationError?: string,

  category: string,              // Auto-detected from useCases[0]
  isActive: boolean,
  uploadedAt: number,
  analyzedAt: number
}
```

### API Functions

**Convex:** `convex/aiImages.ts`

#### Original Image Upload & Analysis
- `generateUploadUrl()` - Get upload URL
- `upload()` - Upload image with AI description
- `searchByDescription(query, limit?)` - Natural language search
- `getByUseCase(useCase, limit?)` - Filter by use case
- `getByMood(mood, limit?)` - Filter by mood/atmosphere
- `listAll(limit?)` - Get all images

#### Generated Image Management
- `markForGeneration(imageId)` - Mark image for DALL-E generation
- `updateGeneratedImage(imageId, storageId, prompt, dimensions)` - Save generated image
- `markGenerationFailed(imageId, error)` - Mark generation as failed
- `getPendingGeneration(limit?)` - Get images pending generation
- `listAllWithGenerated(limit?)` - **Get images preferring generated versions**

## 🚀 Usage

### 1. Upload & Analyze Images

```bash
# Set OpenAI API key
export OPENAI_API_KEY="sk-proj-..."

# Analyze and upload all images in /images folder
node scripts/batch-upload-all-webp.js
```

**What it does:**
1. Reads all images from `/images` folder
2. Analyzes each with GPT-4 Vision
3. Generates detailed JSON description
4. Uploads to Convex with metadata
5. Makes searchable by description

### 2. Generate Copyright-Free Similar Images

After uploading original images, generate copyright-free alternatives using DALL-E 3:

```bash
# Test with single image first
node scripts/test-generate-one.js

# Generate for ALL images (rate-limited to 5/min)
node scripts/generate-similar-images.js
```

**What it does:**
1. Fetches images without generated versions
2. Builds DALL-E prompt from AI description
3. Generates similar-but-different image with DALL-E 3
4. Downloads generated image
5. Uploads to Convex
6. Links generated image to original
7. **Website automatically uses generated version**

**Rate Limiting:** DALL-E 3 allows 5 images/min (tier 1). Script waits 15s between generations.

**Cost:** ~$0.04 per HD image (1024x1024)

### 3. Search Images in React

**Note:** All hooks automatically prefer generated (copyright-free) images when available!

#### By Natural Language Query

```tsx
import { useAIImageSearch } from '@/hooks/useAIImages';

function MyComponent() {
  const images = useAIImageSearch('instructor teaching class');

  return (
    <div>
      {images?.map(img => (
        <img key={img._id} src={img.url} alt={img.aiDescription.scene} />
      ))}
    </div>
  );
}
```

#### By Use Case

```tsx
import { useAIImagesByUseCase } from '@/hooks/useAIImages';

function HeroSection() {
  const heroImages = useAIImagesByUseCase('hero', 3);

  return (
    <div className="hero">
      {heroImages?.[0] && (
        <img src={heroImages[0].url} alt={heroImages[0].aiDescription.scene} />
      )}
    </div>
  );
}
```

#### By Mood/Atmosphere

```tsx
import { useAIImagesByMood } from '@/hooks/useAIImages';

function Features() {
  const professionalImages = useAIImagesByMood('professional', 5);

  return (
    <div className="features">
      {professionalImages?.map(img => (
        <div key={img._id}>
          <img src={img.url} alt={img.aiDescription.scene} />
          <p>{img.aiDescription.scene}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Smart Image Selection

```tsx
import { useSmartImage } from '@/hooks/useAIImages';

function HeroSection() {
  const heroImage = useSmartImage({
    useCase: 'hero',
    mood: 'professional',
    query: 'instructor teaching reformer'
  });

  if (!heroImage?.[0]) return null;

  const img = heroImage[0];

  return (
    <div
      className="hero"
      style={{ backgroundImage: `url(${img.url})` }}
    >
      <h1>{img.aiDescription.scene}</h1>
      <p>Tags: {img.aiDescription.tags.join(', ')}</p>
    </div>
  );
}
```

### 4. Query from Anywhere

The AI descriptions are stored as searchable JSON, so you can query programmatically:

```tsx
// Get all images (prefers generated versions)
const allImages = await client.query(api.aiImages.listAllWithGenerated, {
  limit: 50
});

// Find images with specific subjects
const reformerImages = await client.query(api.aiImages.searchByDescription, {
  query: 'reformer equipment',
  limit: 10
});

// Find images for blog posts
const blogImages = await client.query(api.aiImages.getByUseCase, {
  useCase: 'blog',
  limit: 20
});

// Find energetic/dynamic images
const energeticImages = await client.query(api.aiImages.getByMood, {
  mood: 'energetic',
  limit: 5
});

// Check which images need generation
const pendingGen = await client.query(api.aiImages.getPendingGeneration);
```

## 📝 Example AI Description

**Input Image:** Pilates instructor teaching a class

**Generated Description:**
```json
{
  "scene": "Professional Pilates instructor guiding students on reformers in modern studio",
  "subjects": [
    "instructor",
    "students",
    "reformers",
    "studio equipment"
  ],
  "activity": "Group Pilates reformer class instruction",
  "mood": "Professional, welcoming, focused",
  "colors": [
    "neutral tones",
    "gray",
    "beige",
    "white"
  ],
  "composition": "Instructor in foreground with outstretched arm, students in background on reformers",
  "lighting": "Natural studio lighting with soft shadows",
  "setting": "Indoor Pilates studio with minimalist design",
  "useCases": [
    "hero",
    "feature",
    "about",
    "blog"
  ],
  "tags": [
    "pilates",
    "instructor",
    "class",
    "reformer",
    "studio",
    "professional",
    "teaching",
    "fitness",
    "wellness"
  ],
  "quality": "Excellent - high resolution, good composition, professional photography"
}
```

## 🔍 Search Examples

| Query | What It Finds |
|-------|---------------|
| `"instructor teaching"` | Images with instructors guiding classes |
| `"reformer close-up"` | Close-up shots of reformer equipment |
| `"welcoming atmosphere"` | Images with warm, inviting mood |
| `"group class"` | Multiple people doing Pilates together |
| `"studio interior"` | Studio environment shots |

## 🛠️ Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema for `ai_images` table with generation fields |
| `convex/aiImages.ts` | Convex mutations/queries for AI images + generation |
| `scripts/batch-upload-all-webp.js` | Batch upload with GPT-4 Vision analysis |
| `scripts/generate-similar-images.js` | **Generate copyright-free images with DALL-E 3** |
| `scripts/test-generate-one.js` | Test generation with single image |
| `src/hooks/useAIImages.ts` | React hooks for smart image selection (prefers generated) |

## 💡 Benefits

1. **No Manual Tagging** - AI automatically describes every image
2. **Natural Language Search** - Find images by describing what you want
3. **Smart Selection** - Query by use case, mood, or specific details
4. **Copyright-Free** - DALL-E 3 generates similar images you own
5. **Automatic Preference** - Website uses generated images automatically
6. **Scalable** - Add hundreds of images, search stays fast
7. **Flexible** - Description JSON can be extended with more fields

## 🚦 Getting Started

### Complete Workflow

1. **Add images to `/images` folder**

2. **Run analysis & upload:**
   ```bash
   export OPENAI_API_KEY="your-key"
   node scripts/batch-upload-all-webp.js
   ```

3. **Generate copyright-free versions:**
   ```bash
   # Test with one first
   node scripts/test-generate-one.js

   # Generate all (takes ~6.5 min for 26 images)
   node scripts/generate-similar-images.js
   ```

4. **Use in React components:**
   ```tsx
   // Automatically gets generated version if available!
   const images = useAllAIImages();

   // Or search with natural language
   const heroImg = useSmartImage({
     query: 'professional instructor teaching'
   });
   ```

## 📊 Cost

### Per Image
- **GPT-4 Vision Analysis:** ~$0.01-0.02
- **DALL-E 3 Generation (HD):** ~$0.04
- **Total per image:** ~$0.05-0.06

### For 26 Images (Current)
- **Analysis:** ~$0.26-0.52
- **Generation:** ~$1.04
- **Total:** ~$1.30-1.56

### For 100 Images
- **Analysis:** ~$1-2
- **Generation:** ~$4
- **Total:** ~$5-6

**Convex Storage:** Free tier covers ~1000 images

## 🎯 Next Steps

- [x] AI Vision analysis with GPT-4
- [x] Natural language search
- [x] AI-generated copyright-free images
- [x] Automatic preference for generated images
- [ ] Add image similarity search
- [ ] Auto-categorize by dominant color
- [ ] Generate alt text from AI descriptions
- [ ] Create admin UI for browsing AI images
- [ ] Add batch re-analysis for updated descriptions

---

## 🔄 Workflow Summary

```
Original Image (reference)
    ↓
GPT-4 Vision Analysis
    ↓
Detailed JSON Description
    ↓
DALL-E 3 Generation
    ↓
Copyright-Free Similar Image
    ↓
Website Uses Generated Version
```

**Built with:** Convex + GPT-4 Vision + DALL-E 3 + React
