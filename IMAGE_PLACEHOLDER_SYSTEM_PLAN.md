# Image Placeholder Registry & Auto-Generation System
## Implementation Plan

---

## 🎯 **Goal**

Create a system that:
1. **Tracks all image placeholders** across the website (static pages + blog posts)
2. **Extracts context** from surrounding text to understand what the image should show
3. **Automatically generates** contextually appropriate images using DALL-E 3
4. **Assigns generated images** to placeholders
5. **Auto-registers new placeholders** when developers add them

---

## 📊 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE PLACEHOLDER LIFECYCLE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATION                                                     │
│     Developer adds <ContextualImage> component                   │
│     ↓                                                            │
│  2. REGISTRATION                                                 │
│     Component registers in image_placeholders table              │
│     Extracts surrounding text context                            │
│     ↓                                                            │
│  3. PROMPT GENERATION                                            │
│     GPT-4 analyzes context → creates DALL-E prompt              │
│     ↓                                                            │
│  4. IMAGE GENERATION                                             │
│     DALL-E 3 creates image based on prompt                       │
│     ↓                                                            │
│  5. ASSIGNMENT                                                   │
│     Generated image linked to placeholder                        │
│     ↓                                                            │
│  6. DISPLAY                                                      │
│     Component shows generated image                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Database Schema**

### New Table: `image_placeholders`

```typescript
{
  // Identity
  placeholderId: string,           // Unique ID: "blog-post-slug-hero-1"
  pageType: string,                // "blog" | "home" | "shop" | "studios" | "about"
  pageSlug?: string,               // For dynamic pages (blog posts, studio pages)
  location: string,                // "hero" | "section-1" | "inline-3" | "gallery-2"

  // Context for Image Generation
  contextBefore: string,           // Text before placeholder (500 chars)
  contextAfter: string,            // Text after placeholder (500 chars)
  headingAbove?: string,           // Nearest heading (h1-h6)
  altText?: string,                // Provided alt text
  figCaption?: string,             // Provided caption

  // Generation Prompt
  generatedPrompt?: string,        // GPT-4 generated DALL-E prompt
  promptGeneratedAt?: number,      // When prompt was created

  // Image Assignment
  assignedImageId?: Id<"ai_images">, // Generated image
  assignedAt?: number,             // When assigned

  // Requirements
  preferredAspectRatio: string,    // "16:9" | "1:1" | "4:3" | "portrait" | "landscape"
  preferredStyle?: string,         // "professional" | "lifestyle" | "product" | "action"
  requiredSubjects?: string[],     // ["reformer", "instructor"]

  // Status
  status: string,                  // "pending" | "prompt_generated" | "image_assigned" | "active"
  priority: number,                // 1-100 (hero = 100, inline = 50, etc.)

  // Metadata
  createdAt: number,
  updatedAt: number,
  isActive: boolean,
}

Indexes:
- by_placeholder_id (unique)
- by_page_slug
- by_status
- by_priority
- by_page_type_and_slug
```

---

## 🔍 **Phase 1: Discovery - Find All Current Image Locations**

### 1.1 Scan Static Pages

**Script:** `scripts/scan-existing-images.js`

**What to scan:**
- `src/pages/*.tsx` - All page components
- Look for: `<img>`, `<Image>`, `backgroundImage`, `<picture>`

**Extract:**
- File path
- Component name
- Props (src, alt, className)
- Surrounding JSX for context

**Example Output:**
```json
{
  "filePath": "src/pages/Index.tsx",
  "placeholders": [
    {
      "id": "home-hero-1",
      "line": 45,
      "type": "img",
      "context": "Welcome to Premium Pilates - Transform your body...",
      "location": "hero"
    }
  ]
}
```

### 1.2 Scan Blog Posts

**Where:** Blog content stored in Convex or markdown files

**What to scan:**
- Blog HTML/markdown content
- Look for: `<img>`, `![alt](url)` markdown syntax

**Extract:**
- Blog slug
- Position in content (character offset)
- Surrounding text (±500 chars)
- Heading context

---

## 🛠️ **Phase 2: Context Extraction System**

### 2.1 Extract Surrounding Context

**Function:** `extractImageContext(element, document)`

**Extracts:**
1. **Text Before** (500 chars walking backward)
2. **Text After** (500 chars walking forward)
3. **Nearest Heading** (h1-h6 above the image)
4. **Alt Text** (from img alt attribute)
5. **Caption** (from figcaption or nearby text)

**Example:**
```typescript
{
  contextBefore: "...benefits of Pilates. Regular practice improves core strength and flexibility. Our certified instructors...",
  contextAfter: "...guide you through each movement with precision. Classes are suitable for all fitness levels...",
  headingAbove: "Why Choose Professional Pilates Instruction",
  altText: "Instructor teaching reformer class",
  figCaption: null
}
```

### 2.2 Analyze Context with GPT-4

**Function:** `generateImagePrompt(context)`

**Input:** Context object from above

**GPT-4 Prompt:**
```
Analyze this context and create a DALL-E 3 prompt for a professional Pilates image:

Heading: {headingAbove}
Text before image: {contextBefore}
Text after image: {contextAfter}
Alt text: {altText}

Create a detailed DALL-E prompt that:
1. Matches the content context
2. Shows relevant Pilates activity
3. Fits professional fitness photography style
4. Includes specific subjects mentioned in context
```

**Output:**
```typescript
{
  prompt: "Professional Pilates studio photograph showing a certified instructor teaching a small group reformer class. The instructor is demonstrating proper form while students practice. Modern studio with natural lighting, professional atmosphere. Shot with professional camera, magazine quality.",
  subjects: ["instructor", "students", "reformers"],
  mood: "professional, educational",
  style: "modern fitness photography"
}
```

---

## ⚛️ **Phase 3: React Component System**

### 3.1 Create `<ContextualImage>` Component

**File:** `src/components/ContextualImage.tsx`

**Purpose:** Automatically registers placeholders and displays generated images

**Usage:**
```tsx
<ContextualImage
  placeholderId="blog-post-benefits-hero-1"
  pageType="blog"
  pageSlug="benefits-of-pilates"
  location="hero"
  aspectRatio="16:9"
  alt="Pilates instructor teaching class"
  priority={100}
  className="w-full h-96 object-cover"
/>
```

**Behavior:**
1. On mount → Check if placeholder exists in database
2. If not → Register placeholder with context extraction
3. If pending → Show loading skeleton
4. If assigned → Display generated image
5. Track context changes → Re-register if context significantly changes

### 3.2 Component Features

**Context Auto-Extraction:**
```typescript
useEffect(() => {
  // Get parent element
  const parent = ref.current?.parentElement;

  // Walk backward 500 chars
  const contextBefore = extractTextBefore(parent, 500);

  // Walk forward 500 chars
  const contextAfter = extractTextAfter(parent, 500);

  // Find nearest heading
  const heading = findNearestHeading(parent);

  // Register placeholder
  registerPlaceholder({
    placeholderId,
    contextBefore,
    contextAfter,
    headingAbove: heading,
    // ... other props
  });
}, []);
```

**Smart Loading States:**
```tsx
{status === 'pending' && <Skeleton className="w-full h-96" />}
{status === 'prompt_generated' && <GeneratingSpinner />}
{status === 'image_assigned' && <img src={imageUrl} alt={alt} />}
```

---

## 🤖 **Phase 4: Automatic Generation Pipeline**

### 4.1 Placeholder Registration Trigger

**When:** New placeholder registered

**Flow:**
1. Insert placeholder into `image_placeholders` table
2. Set `status: 'pending'`
3. Trigger `generatePromptForPlaceholder(placeholderId)`

### 4.2 Prompt Generation Action

**Convex Action:** `placeholders.generatePrompt`

```typescript
export const generatePrompt = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    // Get placeholder
    const placeholder = await ctx.runQuery(/*...*/);

    // Build GPT-4 prompt from context
    const gptPrompt = buildContextAnalysisPrompt(placeholder);

    // Call GPT-4
    const dallePrompt = await analyzeContext(gptPrompt);

    // Update placeholder
    await ctx.runMutation(internal.placeholders.updatePrompt, {
      placeholderId: args.placeholderId,
      prompt: dallePrompt,
      status: 'prompt_generated'
    });

    // Trigger image generation
    await ctx.scheduler.runAfter(0, internal.placeholders.generateImage, {
      placeholderId: args.placeholderId
    });
  }
});
```

### 4.3 Image Generation Action

**Convex Action:** `placeholders.generateImage`

```typescript
export const generateImage = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    // Get placeholder with prompt
    const placeholder = await ctx.runQuery(/*...*/);

    // Generate with DALL-E 3
    const imageUrl = await generateWithDalle(placeholder.generatedPrompt);

    // Download and upload to Convex
    const storageId = await uploadToConvex(imageUrl);

    // Create ai_images record
    const imageId = await ctx.runMutation(api.aiImages.upload, {
      // ... with context-based description
    });

    // Assign to placeholder
    await ctx.runMutation(internal.placeholders.assignImage, {
      placeholderId: args.placeholderId,
      imageId: imageId,
      status: 'image_assigned'
    });
  }
});
```

---

## 📝 **Phase 5: Blog Post Integration**

### 5.1 Markdown/HTML Parser

**Function:** `extractImagePlaceholdersFromContent(html, slug)`

**Detects:**
- `<img>` tags
- Markdown `![alt](url)`
- Image placeholders like `{{image:hero}}`

**Registers:**
```typescript
{
  placeholderId: `blog-${slug}-${position}`,
  pageType: 'blog',
  pageSlug: slug,
  location: `inline-${index}`,
  // context extracted from surrounding paragraphs
}
```

### 5.2 Blog Writer Integration

**When generating blog posts:**
1. Parse generated HTML
2. Find all `<img>` tags
3. Extract context for each
4. Register placeholders
5. Trigger generation pipeline

---

## 🎛️ **Phase 6: Management Dashboard**

### 6.1 Admin View Component

**Route:** `/admin/image-placeholders`

**Shows:**
- Total placeholders
- Status breakdown (pending, generating, assigned)
- Priority queue
- Recent registrations

**Table Columns:**
- Placeholder ID
- Page/Location
- Context Preview
- Status
- Generated Prompt
- Assigned Image (thumbnail)
- Actions (regenerate, edit prompt, delete)

### 6.2 Bulk Operations

- **Regenerate All Pending** - Trigger prompt generation for all pending
- **Bulk Assign** - Manually assign existing images to placeholders
- **Export Registry** - Download CSV of all placeholders

---

## 🔄 **Phase 7: Monitoring & Automation**

### 7.1 Scheduled Jobs

**Daily:**
- Scan for new placeholders in blog posts
- Generate prompts for pending placeholders
- Generate images for placeholders with prompts

**Weekly:**
- Re-analyze context if pages changed
- Check for orphaned placeholders (page deleted)

### 7.2 Webhook Triggers

**On Blog Post Publish:**
- Scan content for image placeholders
- Register all found placeholders
- Prioritize hero images (priority: 100)
- Start generation pipeline

---

## 📊 **Phase 8: Analytics & Optimization**

### 8.1 Track Metrics

- **Registration Rate** - How many new placeholders per day
- **Generation Success Rate** - % of prompts that generate good images
- **Assignment Time** - Average time from registration to image
- **Context Quality Score** - How well context predicts good images

### 8.2 Prompt Optimization

- **A/B Testing** - Test different prompt templates
- **Feedback Loop** - Track which generated images get used vs. regenerated
- **Context Length Optimization** - Find optimal context window size

---

## 🚀 **Implementation Priority**

### **Week 1: Foundation**
1. ✅ Database schema design
2. ✅ Create `image_placeholders` table
3. ✅ Build placeholder registration mutation
4. ✅ Create basic `<ContextualImage>` component

### **Week 2: Discovery**
1. ✅ Build existing image scanner script
2. ✅ Scan static pages
3. ✅ Scan blog posts
4. ✅ Register all existing placeholders

### **Week 3: Context & Generation**
1. ✅ Build context extraction system
2. ✅ Create GPT-4 prompt generator
3. ✅ Build DALL-E integration for placeholders
4. ✅ Test end-to-end pipeline

### **Week 4: Automation**
1. ✅ Auto-registration in `<ContextualImage>`
2. ✅ Blog post integration
3. ✅ Scheduled jobs
4. ✅ Management dashboard

---

## 🎯 **Success Metrics**

1. **100% Coverage** - Every image placeholder tracked
2. **<5 min Registration** - New placeholder to prompt generation
3. **<30 sec Generation** - Prompt to assigned image
4. **>90% Quality** - Generated images match context
5. **Zero Manual Work** - Fully automated after setup

---

## 🔐 **Security & Safety**

- **Context Sanitization** - Remove PII from context extraction
- **Prompt Validation** - Ensure prompts stay on-brand
- **Content Policy** - DALL-E 3 automatically filters inappropriate content
- **Rate Limiting** - Max 5 generations/min to avoid API limits

---

## 📚 **Documentation Deliverables**

1. **Developer Guide** - How to use `<ContextualImage>`
2. **Context Guide** - Writing context that generates good images
3. **API Reference** - All placeholder functions
4. **Troubleshooting** - Common issues and fixes

---

**Next Step:** Approve this plan, then start with Phase 1 (Discovery)
