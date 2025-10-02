# Complete Image Pipeline Analysis
## Every Component, Every Connection, Every Gap

---

## 📊 **DATABASE TABLES** (3 tables)

### 1. **`site_images`** - Legacy Static Images System
```typescript
{
  name: string,           // "shopHero", "featuredProducts"
  category: string,       // "hero" | "featured" | "icon"
  storageId: Id<_storage>, // Convex storage ID
  mimeType, size, width, height, alt, description,
  isActive: boolean,
  cacheControl: string,
  createdAt, updatedAt
}
```
**Purpose:** Original manual image upload system
**Status:** ❌ **NOT CONNECTED** to AI generation
**Used By:** `useConvexImage` hook → `useConvexAssets()` → Shop.tsx
**Images In DB:** Unknown (query error in diagnostic)

---

### 2. **`ai_images`** - AI-Analyzed & Generated Images
```typescript
{
  fileName: string,
  storageId: Id<_storage>,        // Original image
  dimensions: { width, height },

  // GPT-4 Vision analysis
  aiDescription: {
    scene, subjects, activity, mood, colors,
    composition, lighting, setting,
    useCases, tags, quality
  },

  // DALL-E 3 generation (NEW)
  generatedStorageId?: Id<_storage>,  // Generated image
  generationPrompt?: string,
  generatedDimensions?: { width, height },
  generatedAt?: number,
  generationStatus?: 'pending' | 'generating' | 'completed' | 'failed',

  category, isActive, uploadedAt, analyzedAt
}
```
**Purpose:** AI-powered image analysis + automatic generation
**Status:** ✅ **WORKING** but NOT used on website
**Images In DB:** 32 total (2 with generated versions, 30 pending)

---

### 3. **`image_placeholders`** - Context-Aware Placeholder Registry
```typescript
{
  placeholderId: string,         // "blog-slug-hero-1"
  pageType: string,              // "blog" | "home" | "shop"
  pageSlug?: string,
  location: string,              // "hero" | "section-1"

  // Context extraction
  contextBefore?: string,        // 500 chars before
  contextAfter?: string,         // 500 chars after
  headingAbove?: string,
  altText?: string,

  // Prompt generation
  generatedPrompt?: string,
  promptGeneratedAt?: number,

  // Image assignment
  assignedImageId?: Id<ai_images>,
  assignedAt?: number,

  // Requirements
  preferredAspectRatio: string,  // "16:9" | "1:1"
  preferredStyle?: string,
  requiredSubjects?: string[],

  status: 'pending' | 'prompt_generated' | 'image_assigned' | 'active',
  priority: number,              // 1-100
  isActive, createdAt, updatedAt
}
```
**Purpose:** Track all image locations with context
**Status:** ✅ **DATABASE CREATED**, 245 placeholders registered
**Used By:** `<ContextualImage>` component (8 pages)

---

## ⚙️ **CONVEX FUNCTIONS** (5 files)

### **File: `siteImages.ts`**
**Table:** `site_images`
**Functions:**
- `generateUploadUrl()` - Get upload URL
- `upload()` - Upload manual image
- `deleteImage()` - Delete image
- `getByName()` - Get image by name (used by website)
- `listActive()` - List all active
- `listByCategory()` - Filter by category
- `toggleActive()` - Enable/disable
- `updateMetadata()` - Update alt/description

**Connection:** ❌ **ISOLATED** - Not connected to AI system

---

### **File: `aiImages.ts`**
**Table:** `ai_images`
**Functions:**
- `generateUploadUrl()` - Get upload URL
- `upload(fileName, storageId, aiDescription, autoGenerate?)`
  - **TRIGGERS:** `imageGeneration.triggerGeneration` if autoGenerate=true
- `searchByDescription(query)` - Natural language search
- `getByUseCase(useCase)` - Filter by hero/blog/product
- `getByMood(mood)` - Filter by atmosphere
- `listAll()` - Get all images
- `listByPlaceholder(placeholderId)` - Get by placeholder ID
- `listAllWithGenerated()` - Prefer generated versions
- `markForGeneration()` - Mark for gen
- `updateGeneratedImage()` - Save generated image
- `markGenerationFailed()` - Mark as failed
- `getPendingGeneration()` - Get pending
- **INTERNAL:** `getById()`, `updateGenerationStatus()`

**Connection:** ✅ Connected to `imageGeneration.ts` (auto-generation)
**Connection:** ✅ Connected to `placeholders.ts` (assignment)

---

### **File: `imageGeneration.ts`**
**Table:** N/A (action only)
**Functions:**
- `triggerGeneration(imageId)` - **AUTOMATIC TRIGGER**
  - Gets OpenAI key from database
  - Builds DALL-E prompt from aiDescription
  - Calls DALL-E 3 API
  - Downloads generated image
  - Uploads to Convex storage
  - Calls `updateGeneratedImage()`
- `queueForGeneration(imageId)` - Manual queue

**Triggers:** When `aiImages.upload()` is called with `autoGenerate=true` (default)
**Status:** ✅ **WORKING** (tested successfully)

---

### **File: `placeholders.ts`**
**Table:** `image_placeholders`
**Functions:**
- `register()` - Register/update placeholder
- `getById()` - Get placeholder with imageUrl
- `list(status?)` - List placeholders
- `listByPage(pageType, pageSlug)` - Filter by page
- `listWithPreview()` - List with preview URLs
- `updatePrompt()` - Save generated prompt
- `assignImage(placeholderId, imageId)` - Link AI image to placeholder
- `assignLatest(placeholderId)` - Auto-assign latest generated

**Connection:** ✅ Can assign `ai_images` to placeholders
**Status:** ✅ **WORKING** but missing auto-generation trigger

---

### **File: `placeholderGeneration.ts`**
**Table:** N/A (actions only)
**Functions:**
- `generatePrompt(placeholderId)` - **CONTEXT → PROMPT**
  - Gets placeholder with context
  - Calls GPT-4 to analyze context
  - Generates DALL-E prompt
  - Saves prompt to placeholder
- `generateImage(placeholderId)` - **PROMPT → IMAGE**
  - Gets placeholder with prompt
  - Calls DALL-E 3
  - Downloads image
  - Uploads to Convex
  - Creates `ai_images` record
  - Assigns to placeholder

**Status:** ✅ **IMPLEMENTED** but ❌ **NOT AUTO-TRIGGERED**

---

## ⚛️ **REACT COMPONENTS**

### **Component: `<ContextualImage>`**
**File:** `src/components/ContextualImage.tsx`
**Purpose:** Auto-registering image component

**What It Does:**
1. **On Mount:**
   - Extracts surrounding text context (500 chars before/after)
   - Finds nearest heading
   - Calls `placeholders.register()` with all context
2. **Rendering:**
   - Queries `placeholders.getById()` for assigned image
   - Shows `imageUrl` if assigned
   - Shows `fallbackSrc` if not assigned
   - Shows nothing if neither exists

**Status:** ✅ **WORKING** and used on 8+ pages
**Connection:** ✅ Connected to `placeholders` table
**Gap:** ❌ **NO AUTO-TRIGGER** for image generation after registration

---

### **Hook: `useConvexAssets()`**
**File:** `src/lib/convexAssets.ts`
**Purpose:** Fetch images from `site_images` table

**What It Does:**
- Maps named images (shopHero, featuredProducts, etc.)
- Calls `useConvexImage(name, fallback)`
- Falls back to local images if not in Convex

**Status:** ✅ **WORKING**
**Connection:** ✅ Connected to `site_images` table
**Gap:** ❌ **NOT CONNECTED** to AI generation system

---

## 🔄 **COMPLETE PIPELINE FLOWS**

### **FLOW 1: Manual Upload to `site_images` (Legacy)**
```
Developer → Upload script → site_images.upload()
                                    ↓
                             site_images table
                                    ↓
                         useConvexAssets() hook
                                    ↓
                              Shop.tsx renders
```
**Status:** ✅ **WORKS** but manual, no AI

---

### **FLOW 2: AI Image Analysis + Auto-Generation**
```
Images in /images folder
         ↓
  batch-upload-all-webp.js
         ↓
  GPT-4 Vision analysis → aiDescription JSON
         ↓
  aiImages.upload(autoGenerate=true)
         ↓
  ai_images table (original image stored)
         ↓
  [AUTOMATIC TRIGGER] → imageGeneration.triggerGeneration()
         ↓
  DALL-E 3 generates similar image
         ↓
  Downloads & uploads to Convex
         ↓
  ai_images.generatedStorageId updated
```
**Status:** ✅ **WORKS PERFECTLY** (tested)
**Gap:** ❌ **Images NOT used on website**

---

### **FLOW 3: Placeholder Registration (Current)**
```
<ContextualImage placeholderId="home-hero-1" ... />
         ↓
  Component mounts
         ↓
  Extracts surrounding text context
         ↓
  placeholders.register() called
         ↓
  image_placeholders table (status='pending')
         ↓
  [NOTHING HAPPENS] ❌
```
**Status:** ⚠️ **INCOMPLETE** - Registers but doesn't generate

---

### **FLOW 4: Placeholder Generation (NOT CONNECTED)**
```
[MANUAL TRIGGER NEEDED]
         ↓
  placeholderGeneration.generatePrompt(placeholderId)
         ↓
  GPT-4 analyzes context → DALL-E prompt
         ↓
  Saves prompt to placeholder (status='prompt_generated')
         ↓
  [MANUAL TRIGGER NEEDED]
         ↓
  placeholderGeneration.generateImage(placeholderId)
         ↓
  DALL-E 3 creates image
         ↓
  Creates ai_images record
         ↓
  placeholders.assignImage()
         ↓
  placeholder.status = 'image_assigned'
         ↓
  <ContextualImage> shows image
```
**Status:** ❌ **NOT AUTOMATIC** - Needs manual triggers

---

## 🔴 **MISSING CONNECTIONS** (The Gaps)

### **GAP 1: site_images ↔ ai_images**
**Problem:** Website uses `site_images` but AI generates to `ai_images`
**Impact:** Generated images never appear on website
**Fix Options:**
- A) Update `site_images` to reference `ai_images`
- B) Migrate website to use `ai_images` directly
- C) Deprecate `site_images`, use placeholders only

---

### **GAP 2: Placeholder Registration → Prompt Generation**
**Problem:** When placeholder registered, nothing triggers prompt generation
**Impact:** 245 placeholders sit in 'pending' status forever
**Fix:** Add scheduler trigger in `placeholders.register()`:
```typescript
await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generatePrompt, {
  placeholderId: args.placeholderId
});
```

---

### **GAP 3: Prompt Generated → Image Generation**
**Problem:** After prompt is created, nothing triggers image generation
**Impact:** Prompts sit unused
**Fix:** Add trigger in `placeholderGeneration.generatePrompt()`:
```typescript
await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generateImage, {
  placeholderId: args.placeholderId
});
```

---

### **GAP 4: Rate Limiting**
**Problem:** If all 245 placeholders trigger at once = API rate limit
**Impact:** DALL-E API failures
**Fix:** Add queue system with rate limiting (max 5/min)

---

## ✅ **WHAT WORKS**

1. ✅ **AI Image Analysis** - GPT-4 Vision analyzes images perfectly
2. ✅ **Auto-Generation** - DALL-E 3 creates similar images (tested)
3. ✅ **Placeholder Registration** - `<ContextualImage>` registers placeholders
4. ✅ **Context Extraction** - Component reads surrounding text
5. ✅ **Database Storage** - All 3 tables store data correctly
6. ✅ **Manual Generation** - Scripts can generate images on demand

---

## ❌ **WHAT'S BROKEN**

1. ❌ **No Auto-Trigger** - Placeholders don't automatically generate images
2. ❌ **Disconnected Systems** - site_images vs ai_images not linked
3. ❌ **Website Not Using AI** - Generated images sit unused in database
4. ❌ **No Rate Limiting** - Would fail if all 245 triggered at once
5. ❌ **No Queue System** - Can't process 245 images safely

---

## 🎯 **RECOMMENDED FIX** (Priority Order)

### **PHASE 1: Connect Placeholder → Generation**
1. Add auto-trigger in `placeholders.register()` → `generatePrompt()`
2. Add auto-trigger in `generatePrompt()` → `generateImage()`
3. Add rate limiting (max 5 images/min)

### **PHASE 2: Connect to Website**
1. Update `<ContextualImage>` to show loading states
2. Add fallback images for pending placeholders
3. Test with 1-2 placeholders first

### **PHASE 3: Replace site_images**
1. Migrate all `site_images` usage to placeholders
2. Deprecate `useConvexAssets()` hook
3. Use `<ContextualImage>` everywhere

---

## 📈 **CURRENT STATUS BY NUMBERS**

- **site_images**: ? images (query error)
- **ai_images**: 32 images
  - ✅ Generated: 2
  - ⏳ Pending: 30
- **image_placeholders**: 245 placeholders
  - ⏳ Pending: ~245 (none have images assigned)
  - ✅ Assigned: 0
- **Components using <ContextualImage>**: 8 pages
- **Auto-generation working**: ✅ YES
- **Auto-generation connected to website**: ❌ NO

---

**NEXT STEP:** Should I implement the auto-triggers to connect placeholders → generation → website?
