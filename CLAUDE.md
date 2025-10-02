# Claude AI Guidelines for CAMA Pilates

This document provides guidelines for all Claude-based AI assistants (Claude Code, Cursor with Claude, API integrations, etc.) working on this project.

---

## 🎯 Mission

Build and maintain a high-quality, SEO-optimized Pilates Reformer e-commerce site for the Mexican market with autonomous blog content generation.

---

## 🚀 Deployment Protocol (MANDATORY)

**Every push to `main` triggers automatic deployment to production.**

### Before Every Commit

1. **Test Locally**
   ```bash
   npm run build
   ```
   ✅ Must succeed before proceeding

2. **Review Changes**
   ```bash
   git status
   git diff
   ```
   ✅ Verify all changes are intentional
   ✅ No secrets or API keys in changes

### Commit Process

```bash
# 1. Stage changes
git add .

# 2. Commit with conventional format
git commit -m "type(scope): brief description

Detailed explanation:
- Change 1
- Change 2
- Change 3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push to main
git push
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting/styling
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Testing
- `chore`: Maintenance

### After Push - Verify Deployment

**Monitor in this order:**

1. **GitHub Actions** (2-3 minutes)
   - URL: https://github.com/timottowitz/camapilates.com/actions
   - Look for "Deploy to Cloudflare Pages" workflow
   - ✅ Green checkmark = success
   - ❌ Red X = check logs and fix

2. **Cloudflare Pages** (1 minute after GitHub)
   - URL: https://dash.cloudflare.com/
   - Navigate: Workers & Pages → camadepilates
   - Check deployment status

3. **Live Site** (1-2 minutes after deployment)
   - Visit production URL
   - Verify changes are live
   - Test functionality

---

## 📁 Project Structure

```
camapilates.com/
├── src/
│   ├── components/        # React components (shadcn/ui)
│   ├── content/
│   │   ├── blog/         # Blog markdown files
│   │   └── products.json # Product catalog
│   ├── pages/            # Route components
│   └── lib/              # Utilities
├── blog-planning/
│   ├── BLOG_TODO.md      # Blog queue (status tracking)
│   └── research/         # Research files per topic
├── autonomous-blog-writer/
│   ├── agents/           # LLM agents
│   ├── pipeline/         # Orchestration
│   ├── config.js         # Configuration
│   └── .env              # API keys (DO NOT COMMIT)
├── public/               # Static assets
├── .github/workflows/    # CI/CD pipelines
├── AGENTS.md             # Agent documentation
├── .clinerules           # Claude Code rules
├── .cursorrules          # Cursor AI rules
└── CLAUDE.md             # This file
```

---

## 🔒 Security Rules

### API Keys & Secrets

**NEVER commit:**
- `.env` files
- API keys in code
- Secrets of any kind
- Private configuration

**ALWAYS:**
- Use environment variables
- Reference `.env.example` for structure
- Verify `.gitignore` is correct
- Check staged files before committing

**Verification:**
```bash
# Before committing, check for secrets:
git diff --staged | grep -i "api.*key\|secret\|token\|password"
```

### Current API Keys

**Main Project** (`.env`):
- `VITE_GA_ID` - Google Analytics
- `GOOGLE_MAPS_API_KEY` - Maps integration
- `CONVEX_DEPLOYMENT` - Convex backend
- Never commit this file

**Autonomous Blog Writer** (`autonomous-blog-writer/.env`):
- `OPENAI_API_KEY` - OpenAI GPT-4o/mini
- Separate from main project
- Never commit this file

---

## 📝 Blog Writing System

### Workflow

**ALWAYS check before writing:**
```bash
cat blog-planning/BLOG_TODO.md
```

### Status Emojis
- 🔬 **Research needed** - Ready for research phase
- 📝 **Writing** - Research complete, ready for writing
- ✅ **Published** - Blog published and live
- 🚫 **Cancelled** - Not proceeding

### Process

1. **Research Phase**
   - File: `blog-planning/research/{slug}.md`
   - Minimum 1000 words
   - Mexican market focus
   - CAMA Pilates connections
   - SEO keywords
   - Mark 📝 when complete

2. **Writing Phase**
   - File: `src/content/blog/{slug}.md`
   - 1500-2500 words
   - Proper frontmatter
   - Shortcodes (`<see-also>`, `<hub-list>`)
   - FAQ section
   - Mark ✅ when published

### Autonomous Blog Writer

**Location:** `autonomous-blog-writer/`

**Usage:**
```bash
cd autonomous-blog-writer
npm run test      # 1 blog
npm run quick     # 3 blogs
npm run standard  # 5 blogs
```

**Features:**
- Multi-pass LLM generation (GPT-4o + GPT-4o-mini)
- Research → Outline → Sections → FAQs → Polish
- ~$0.024 per blog, 5-6 minutes
- Quality score 85+

---

## 🎨 Code Style

### TypeScript
- Strict mode enabled
- Explicit types preferred
- No `any` unless absolutely necessary
- Use interfaces for complex objects

### React
- Functional components only
- Hooks for state management
- Props destructuring
- Meaningful component names

### Styling
- Tailwind CSS utility classes
- shadcn/ui components
- Responsive design (mobile-first)
- Consistent spacing/colors

### Imports
- ESM only (`import` not `require()`)
- Absolute imports with `@/` prefix
- Group imports (React → libs → local)

---

## 🔧 Common Tasks

### Add New Blog Post

1. Check TODO: `cat blog-planning/BLOG_TODO.md`
2. Create research: `blog-planning/research/{slug}.md`
3. Use autonomous writer OR write manually
4. Publish: `src/content/blog/{slug}.md`
5. Commit and push

### Add New Component

1. Create in `src/components/{category}/`
2. Use shadcn/ui if available
3. Add TypeScript types
4. Export from index
5. Document props

### Fix Build Error

1. Check error message
2. Common issues:
   - TypeScript errors → fix types
   - ESM/CommonJS → use `import`
   - Missing deps → `npm install`
3. Test: `npm run build`
4. Commit fix

### Update Product

1. Edit: `src/content/products.json`
2. Update schema fields
3. Verify JSON valid
4. Test: build and check `/products`
5. Commit

---

## 🐛 Troubleshooting

### Build Fails

**Check GitHub Actions logs:**
```bash
gh run list --workflow "cloudflare-pages.yml" --limit 1
gh run view {run-id} --log-failed
```

**Common causes:**
- TypeScript errors
- ESM/CommonJS conflicts
- Missing dependencies
- Syntax errors

**Fix:**
1. Read error message
2. Fix locally
3. Test: `npm run build`
4. Commit and push

### Deployment Not Updating

**Steps:**
1. Check GitHub Actions passed
2. Check Cloudflare deployment succeeded
3. Clear browser cache
4. Wait 2-3 minutes for propagation
5. Purge Cloudflare cache if needed

### Autonomous Blog Writer Issues

**API Key:**
```bash
cd autonomous-blog-writer
npm run validate
```

**Common issues:**
- Missing `.env` file
- Invalid API key
- No pending blogs in TODO
- Missing research files

---

## 📊 Quality Standards

### Blog Posts
- 1500-2500 words
- Mexican market focus
- SEO optimized
- Proper frontmatter
- FAQ section
- Internal links
- Quality score 85+

### Code
- TypeScript strict
- No console.logs in production
- Meaningful variable names
- Comments for complex logic
- Tests for critical paths

### Git Commits
- Conventional format
- Descriptive messages
- Co-authorship attribution
- One logical change per commit

---

## 🔗 Important Links

### Monitoring
- GitHub Actions: https://github.com/timottowitz/camapilates.com/actions
- Cloudflare Pages: https://dash.cloudflare.com/
- Repository: https://github.com/timottowitz/camapilates.com

### Documentation
- Full agent guide: `AGENTS.md`
- Blog writer: `autonomous-blog-writer/README.md`
- Quick start: `autonomous-blog-writer/QUICK_START.md`

---

## ✅ Pre-Commit Checklist

Before every commit:

- [ ] Local build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console.logs or debug code
- [ ] No secrets in changes
- [ ] Git status reviewed
- [ ] Changes are intentional
- [ ] Commit message follows convention
- [ ] Co-authorship included

---

## 🎯 Success Criteria

**A successful deployment has:**

1. ✅ Green checkmark on GitHub Actions
2. ✅ Successful Cloudflare deployment
3. ✅ Changes visible on live site
4. ✅ No console errors
5. ✅ Mobile and desktop working
6. ✅ SEO metadata correct
7. ✅ Performance maintained

---

## 🖼️ Image Upload Protocol

**CRITICAL: We ONLY use Convex for ALL images. No public folder images.**

**When user drops an image in chat:**

### Quick Reference
1. **Identify area** (hero, product, blog, feature, logo, badge)
2. **Optimize** (WebP, correct size, compressed)
3. **Upload to Convex** (run upload script)
4. **Update convexAssets.ts** (add image name and hook)
5. **Test** (`npm run build`)
6. **Commit and push**

### Convex Storage (ONLY Method)

**For:** ALL images (hero, product, blog, feature, logo, badge, etc.)

**Process:**
```typescript
// 1. Create upload script: scripts/upload-{name}.ts
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import fs from 'fs';

async function uploadImage({
  filePath,
  name,        // e.g., 'heroHomepage'
  category,    // e.g., 'hero', 'product', 'blog', 'feature'
  alt,
  description
}) {
  const client = new ConvexHttpClient(process.env.CONVEX_URL!);
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);

  // Get upload URL
  const uploadUrl = await client.mutation(api.siteImages.generateUploadUrl);

  // Upload file
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'image/webp' },
    body: blob,
  });

  const { storageId } = await response.json();

  // Save metadata to Convex
  await client.mutation(api.siteImages.upload, {
    name,
    category,
    storageId,
    mimeType: blob.type || 'image/webp',
    size: blob.size,
    alt,
    description,
  });
}

// 2. Run upload
uploadImage({
  filePath: '/tmp/hero-homepage.webp',
  name: 'heroHomepage',
  category: 'hero',
  alt: 'Homepage hero image',
  description: 'Hero background for homepage'
});

// 3. Update convexAssets.ts
export const CONVEX_IMAGE_NAMES = {
  HERO_HOMEPAGE: 'heroHomepage',
  // ... add new image
};

const FALLBACKS = {
  heroHomepage: '/images/fallback-hero.webp',
  // ... add fallback
};

export function useConvexAssets() {
  const heroHomepage = useConvexImage(
    CONVEX_IMAGE_NAMES.HERO_HOMEPAGE,
    getVersionedImageUrl(FALLBACKS.heroHomepage)
  );

  return { heroHomepage, ... };
}

// 4. Use in component
const assets = useConvexAssets();
<img src={assets.heroHomepage} alt="Hero" />
```

### Categories (ALL in Convex)

- **`hero`** - Hero/header images (1920x1080, WebP)
- **`product`** - Product images (1000x1000, WebP)
- **`feature`** - Feature sections (800x600, WebP)
- **`logo`** - Brand logos (SVG preferred)
- **`badge`** - Badges and icons (SVG or WebP)
- **`finish`** - Material/finish images (800x800, WebP)
- **`blog`** - Blog OG images (1200x630, PNG/JPEG)

### Checklist

When user drops image:
- [ ] Identify area and category
- [ ] Save image temporarily
- [ ] Optimize (WebP, correct size)
- [ ] Create upload script in `scripts/`
- [ ] Run upload to Convex
- [ ] Update `convexAssets.ts` (name + hook + fallback)
- [ ] Update component to use asset
- [ ] Test: `npm run build`
- [ ] Commit: code changes only (image is in Convex)
- [ ] Push to deploy

### Example

**User:** "Add this as homepage hero" *[drops image]*

**You:**
1. Save to `/tmp/hero-homepage.webp`
2. Create `scripts/upload-hero-homepage.ts`
3. Run: `deno run --allow-all scripts/upload-hero-homepage.ts`
4. Update `convexAssets.ts`: Add `HERO_HOMEPAGE` constant + hook + fallback
5. Update `Index.tsx`: Use `assets.heroHomepage`
6. Test: `npm run build` ✅
7. Commit: `git add . && git commit -m "feat(hero): add homepage hero image via Convex"`
8. Push: `git push`
9. Confirm: "✅ Hero image uploaded to Convex and deployed"

**See:** `IMAGE_UPLOAD_GUIDE.md` for complete documentation

---

**Remember**: You're deploying to production with every push.
Test thoroughly and follow the process! 🚀

---

*Last updated: October 2025*
*For questions or issues, check AGENTS.md, .clinerules, or IMAGE_UPLOAD_GUIDE.md*
