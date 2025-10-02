# AI-Powered Image Management System

## 🎯 Overview

This system uses **GPT-4 Vision** to automatically analyze images and generate detailed JSON descriptions, enabling intelligent image selection based on natural language queries.

## 📊 Architecture

### Database Schema

**Table:** `ai_images` in Convex

```typescript
{
  fileName: string,
  storageId: Id<"_storage">,
  mimeType: string,
  size: number,
  dimensions: {
    width: number,
    height: number
  },
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
  category: string,              // Auto-detected from useCases[0]
  isActive: boolean,
  uploadedAt: number,
  analyzedAt: number
}
```

### API Functions

**Convex:** `convex/aiImages.ts`

- `generateUploadUrl()` - Get upload URL
- `upload()` - Upload image with AI description
- `searchByDescription(query, limit?)` - Natural language search
- `getByUseCase(useCase, limit?)` - Filter by use case
- `getByMood(mood, limit?)` - Filter by mood/atmosphere
- `listAll(limit?)` - Get all images

## 🚀 Usage

### 1. Upload & Analyze Images

```bash
# Set OpenAI API key
export OPENAI_API_KEY="sk-proj-..."

# Analyze and upload all images in /images folder
node scripts/analyze-and-upload-images.js
```

**What it does:**
1. Reads all images from `/images` folder
2. Analyzes each with GPT-4 Vision
3. Generates detailed JSON description
4. Uploads to Convex with metadata
5. Makes searchable by description

### 2. Search Images in React

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

### 3. Query from Anywhere

The AI descriptions are stored as searchable JSON, so you can query programmatically:

```tsx
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
| `convex/schema.ts` | Database schema for `ai_images` table |
| `convex/aiImages.ts` | Convex mutations/queries for AI images |
| `scripts/analyze-and-upload-images.js` | Upload script with GPT-4 Vision analysis |
| `src/hooks/useAIImages.ts` | React hooks for smart image selection |

## 💡 Benefits

1. **No Manual Tagging** - AI automatically describes every image
2. **Natural Language Search** - Find images by describing what you want
3. **Smart Selection** - Query by use case, mood, or specific details
4. **Scalable** - Add hundreds of images, search stays fast
5. **Flexible** - Description JSON can be extended with more fields

## 🚦 Getting Started

1. **Add images to `/images` folder**
2. **Run analysis script:**
   ```bash
   export OPENAI_API_KEY="your-key"
   node scripts/analyze-and-upload-images.js
   ```
3. **Use in React components:**
   ```tsx
   const images = useSmartImage({
     query: 'professional instruction'
   });
   ```

## 📊 Cost

- **GPT-4 Vision:** ~$0.01-0.02 per image
- **Convex Storage:** Free tier covers ~1000 images
- **Total for 50 images:** ~$0.50-1.00

## 🎯 Next Steps

- [ ] Add image similarity search (find similar images)
- [ ] Auto-categorize by dominant color
- [ ] Generate alt text from AI descriptions
- [ ] Create admin UI for browsing AI images
- [ ] Add batch re-analysis for updated descriptions

---

**Built with:** Convex + GPT-4 Vision + React
