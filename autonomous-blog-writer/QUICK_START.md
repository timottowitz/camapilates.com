# ⚡ Quick Start Guide

Get your first blog generated in **5 minutes**.

---

## 🚀 Installation

```bash
# 1. Go to the folder
cd autonomous-blog-writer

# 2. Run setup script
./setup.sh

# 3. Edit .env and add your OpenAI API key
nano .env
# Replace: OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
# With your actual key

# 4. Verify setup
npm run validate
```

---

## 📝 Generate Your First Blog

### Prerequisites

You need:
1. ✅ A research file in `../blog-planning/research/{slug}.md`
2. ✅ The topic queued in `../blog-planning/BLOG_TODO.md` with 🔬 status

### Run Generation

```bash
# Test with 1 blog
npm run test

# Wait 5-6 minutes... ☕

# Check output
ls ../src/content/blog/
```

---

## 🎯 Common Commands

```bash
# Configuration
npm run config          # Show current settings
npm run validate        # Check API key

# Generation
npm run test            # 1 blog (test)
npm run quick           # 3 blogs
npm run standard        # 5 blogs
npm run full            # 10 blogs

# Custom
node pipeline/run.js 7  # 7 blogs
```

---

## 📊 What You Get

Each generated blog includes:

✅ **1,500-2,000 words** in configured language
✅ **8-10 sections** with technical depth
✅ **5-8 FAQs** with detailed answers
✅ **Book references** (if in research)
✅ **Market-specific data** (cities, pricing, availability)
✅ **SEO metadata** (title, description, tags)
✅ **Shortcodes** (`<see-also>`, `<hub-list>`)
✅ **Quality score 85+**

---

## 🔧 Customize Configuration

Edit `.env` to change:

```bash
# Language & Market
CONTENT_LANGUAGE=es-MX
CONTENT_MARKETS=CDMX,Guadalajara,Monterrey
CONTENT_CURRENCY=MXN

# Content Settings
CONTENT_WORD_TARGET=1800
CONTENT_TEMPERATURE=0.7  # 0.1-1.0 (higher = more creative)

# Brand
BRAND_NAME=CAMA Pilates
BLOG_AUTHOR=CAMA Pilates
```

---

## 🐛 Troubleshooting

### "OpenAI API key not found"

```bash
# Check .env exists
ls -la .env

# Verify key format (should start with sk-proj- or sk-)
cat .env | grep OPENAI_API_KEY
```

### "Research file not found"

```bash
# List available research files
ls ../blog-planning/research/

# Make sure slug in TODO matches filename
# File: ../blog-planning/research/my-topic.md
# Slug: my-topic (without .md)
```

### "No pending blogs"

```bash
# Check TODO file for 🔬 status
cat ../blog-planning/BLOG_TODO.md | grep "🔬"

# Add topics to TODO file:
## CATEGORÍA: Equipment

### 🔬 my-blog-slug
- **Title:** My Blog Title
- **Keywords:** keyword1, keyword2
```

---

## 💰 Cost & Performance

| Metric | Value |
|--------|-------|
| Time per blog | 5-6 minutes |
| Cost per blog | ~$0.024 USD |
| Quality score | 85+ |
| 10 blogs | ~$0.24, ~1 hour |
| 100 blogs | ~$2.40, ~10 hours |

---

## 📚 Next Steps

1. **Read the full README:** `cat README.md`
2. **Generate test content:** `npm run test`
3. **Review output:** Check `../src/content/blog/`
4. **Scale up:** Use `npm run quick` or `npm run standard`

---

## 🎉 You're Ready!

```bash
npm run test
```

Watch your first blog being generated in real-time! ✨
