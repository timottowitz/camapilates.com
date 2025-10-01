# ⚡ Quick Start: LLM Content Writer

**Generated blog posts in 5 minutes!**

---

## 🚀 Setup (One-time)

```bash
# 1. Set OpenAI API key
export OPENAI_API_KEY="sk-proj-YOUR-KEY-HERE"

# 2. Verify it's set
echo $OPENAI_API_KEY
```

---

## 📝 Generate Your First Blog

```bash
# Pick a blog that has research ready
export TARGET_SLUGS="pilates-has-changed-my-life-mexico"

# Run the pipeline (1 blog)
node scripts/run-batch-blogs.js 1 detailed

# Wait 5-6 minutes... ☕

# Check output
cat src/content/blog/pilates-has-changed-my-life-mexico.md
```

---

## 📊 Batch Processing

```bash
# Process 3 blogs (preset)
npm run blog:quick

# Process 5 blogs (preset)
npm run blog:standard

# Process 10 blogs (preset)
npm run blog:full

# Custom amount
node scripts/run-batch-blogs.js 7 detailed
```

---

## 🔍 Preview Before Generating

```bash
# See the outline without using API credits
echo '{"tool":"preview_outline","parameters":{"slug":"YOUR-SLUG-HERE"}}' | \
  node scripts/mcp-content-writer-agent.js
```

---

## 🔄 Complete Flow

```
1. Dashboard → Search topics
2. Select topics → Added to queue (🔬 status)
3. Run pipeline → npm run blog:quick
4. Done! → Blogs in src/content/blog/
```

---

## 💰 Cost

- **Per blog:** $0.024 USD
- **100 blogs:** $2.40 USD
- **1000 blogs:** $24 USD

---

## ⏱️ Time

- **Per blog:** 5-6 minutes
- **3 blogs:** ~15 minutes
- **10 blogs:** ~50 minutes

---

## 📋 What You Get

✅ 1500-2000 words in Spanish
✅ Mexican market focus (CDMX/GDL/MTY, MXN)
✅ 8-10 sections with technical details
✅ 5-8 detailed FAQs
✅ Book references (Herman, Pilates, Lea)
✅ Proper shortcodes (`<see-also>`, `<hub-list>`)
✅ SEO-optimized
✅ Quality score 85+

---

## 🐛 Troubleshooting

**Pipeline returns "No pending blogs":**
```bash
# Check TODO file
cat blog-planning/BLOG_TODO.md | grep "🔬"
```

**"OpenAI API key not found":**
```bash
export OPENAI_API_KEY="sk-proj-..."
```

**Blog is still template:**
```bash
# Check if research file exists and has content
cat blog-planning/research/YOUR-SLUG.md
```

**Processing takes too long:**
```bash
# Normal! LLM generation takes 5-6 minutes per blog
# Check logs for progress:
tail -f logs/pipeline-*.log
```

---

## 📚 Documentation

- **Master Plan:** `CONTENT_WRITER_MASTER_PLAN.md`
- **Integration Guide:** `CONTENT_WRITER_INTEGRATION.md`
- **Complete Summary:** `IMPLEMENTATION_COMPLETE.md`

---

**Ready to generate!** 🎉

```bash
export OPENAI_API_KEY="sk-proj-..."
npm run blog:quick
```
