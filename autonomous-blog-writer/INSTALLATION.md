# Installation Guide

Complete setup guide for the Autonomous Blog Writer system.

---

## 📦 Installation Methods

### Method 1: Use Parent Project Dependencies (Recommended for existing projects)

If you're adding this to an existing Node.js project:

```bash
# 1. Copy the folder to your project
cp -r autonomous-blog-writer /path/to/your/project/

# 2. Ensure parent project has dependencies
# Add to your project's package.json:
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "ai": "^4.0.36",
    "@ai-sdk/openai": "^2.0.39",
    "dotenv": "^16.4.7"
  }
}

# 3. Install parent dependencies
npm install

# 4. Configure
cd autonomous-blog-writer
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Method 2: Standalone Installation

For completely standalone usage:

```bash
# 1. Navigate to the folder
cd autonomous-blog-writer

# 2. Install dependencies locally
npm install

# 3. Configure
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Validate
npm run validate
```

---

## ⚙️ Configuration

### Required Settings

Edit `.env` and set:

```bash
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
```

### Project Structure Setup

The system expects this structure:

```
your-project/
├── autonomous-blog-writer/    # This folder
├── blog-planning/
│   ├── research/              # Research markdown files
│   └── BLOG_TODO.md           # Queue file
└── src/content/blog/          # Output directory
```

If your project uses different paths, customize in `.env`:

```bash
PROJECT_ROOT=/custom/path
BLOG_OUTPUT_DIR=content/posts
RESEARCH_DIR=research
TODO_FILE=queue.md
```

---

## 🔍 Verification

### 1. Check Configuration

```bash
cd autonomous-blog-writer
npm run config
```

Should output:
```
✓ Loaded config from: /path/to/.env

📋 Configuration Summary:
   Project Root: /your/project
   Blog Output: /your/project/src/content/blog
   Research Dir: /your/project/blog-planning/research
   Model (Main): gpt-4o
   ...
```

### 2. Validate API Key

```bash
npm run validate
```

Should exit with code 0 (success).

### 3. Test Import

```bash
node -e "import('./config.js').then(c => console.log('✓ Config loaded:', c.default.BRAND_NAME))"
```

Should print your brand name.

---

## 🧪 Testing

### Option 1: Dry Run (No API cost)

```bash
# Check what blogs are queued
grep "🔬" ../blog-planning/BLOG_TODO.md

# Preview configuration
npm run config
```

### Option 2: Generate Test Blog

```bash
# Process 1 blog
npm run test

# Wait 5-6 minutes
# Check output in ../src/content/blog/
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module 'ai'"

**Solution:** Install dependencies

```bash
# Method 1: In parent project
cd ..
npm install ai @ai-sdk/openai @modelcontextprotocol/sdk dotenv

# Method 2: In this folder
cd autonomous-blog-writer
npm install
```

### Error: "OPENAI_API_KEY is required"

**Solution:** Check .env file

```bash
# Verify .env exists
ls -la .env

# Check key is set
cat .env | grep OPENAI_API_KEY

# Should output: OPENAI_API_KEY=sk-proj-...
```

### Error: "Research file not found"

**Solution:** Verify folder structure

```bash
# Check research directory exists
ls -la ../blog-planning/research/

# Check TODO file exists
ls -la ../blog-planning/BLOG_TODO.md

# Verify paths in config
npm run config
```

### Error: "Package subpath './v4' is not defined"

**Solution:** Node.js version issue

```bash
# Check Node.js version (need 18+)
node -v

# Upgrade if needed:
# nvm install 18
# nvm use 18
```

---

## 🔄 Updating

To update the system:

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
cd autonomous-blog-writer
npm install

# Verify still works
npm run validate
```

---

## 🗑️ Uninstallation

To remove:

```bash
# 1. Remove folder
rm -rf autonomous-blog-writer

# 2. (Optional) Remove generated content
rm -rf src/content/blog/*

# 3. (Optional) Clean research files
rm -rf blog-planning/research/*
```

---

## 📚 Next Steps

After successful installation:

1. ✅ Read the [README](README.md)
2. ✅ Review [QUICK_START](QUICK_START.md)
3. ✅ Generate your first blog: `npm run test`
4. ✅ Scale up: `npm run quick`

---

## 🆘 Support Checklist

Before asking for help, verify:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] Dependencies installed (`ls node_modules` shows packages)
- [ ] `.env` file exists and has valid API key
- [ ] Project structure matches expected layout
- [ ] `npm run validate` succeeds
- [ ] Research files exist for queued topics

---

**Ready to generate content!** 🚀
