# Autonomous Blog Writer

**Portable LLM-powered blog content generation system**

Drop this folder into any project to get automated, high-quality blog content generation with minimal setup.

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- OpenAI API key

### 2. Installation

```bash
# 1. Copy this folder to your project
cp -r autonomous-blog-writer /path/to/your/project/

# 2. Install dependencies
cd autonomous-blog-writer
npm install

# 3. Configure API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Validate configuration
npm run config
npm run validate
```

### 3. Run Your First Blog

```bash
# Test with 1 blog
npm run test

# Quick batch (3 blogs)
npm run quick

# Standard batch (5 blogs)
npm run standard

# Full batch (10 blogs)
npm run full
```

---

## 📋 Configuration

All configuration is in the `.env` file. Copy `.env.example` to `.env` and customize:

### Required Settings

```bash
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

### Optional Settings

```bash
# Models
OPENAI_MODEL=gpt-4o              # Main model for content
OPENAI_MODEL_FAST=gpt-4o-mini    # Fast model for outlines/FAQs

# Content Generation
CONTENT_WORD_TARGET=1800         # Target word count
CONTENT_TEMPERATURE=0.7          # Creativity (0.1-1.0)
CONTENT_MIN_WORDS=1200           # Minimum words
CONTENT_MAX_WORDS=2500           # Maximum words
CONTENT_MIN_FAQS=5               # Min FAQ count
CONTENT_MAX_FAQS=8               # Max FAQ count

# Localization
CONTENT_LANGUAGE=es-MX           # Primary language
CONTENT_MARKETS=CDMX,Guadalajara,Monterrey  # Geographic focus
CONTENT_CURRENCY=MXN             # Currency symbol

# Brand
BRAND_NAME=Your Brand            # Your brand name
BRAND_DESCRIPTION=your description
BLOG_AUTHOR=Your Name            # Author name for posts

# Project Paths (auto-detected if not set)
# PROJECT_ROOT=/path/to/project
# BLOG_OUTPUT_DIR=src/content/blog
# RESEARCH_DIR=blog-planning/research
# TODO_FILE=blog-planning/BLOG_TODO.md

# Advanced
CONTENT_PARALLEL_SECTIONS=false  # Parallel generation (faster, more $)
LLM_TIMEOUT=600000               # Timeout (ms)
LLM_RETRY_ATTEMPTS=3             # Retry count
LOG_LEVEL=detailed               # minimal|detailed|verbose
```

---

## 📁 Project Structure

```
autonomous-blog-writer/
├── .env                  # Your configuration (create from .env.example)
├── .env.example          # Configuration template
├── config.js             # Centralized config loader
├── package.json          # Dependencies and npm scripts
├── README.md             # This file
│
├── agents/               # MCP agents (LLM-powered)
│   └── content-writer.js # Main content generation agent
│
├── pipeline/             # Orchestration
│   └── run.js            # Main entry point
│
└── docs/                 # Documentation
    └── (future docs)
```

---

## 🎯 How It Works

### 1. **Topic Discovery** (Manual/Dashboard)
- User discovers topics via search dashboard
- Topics added to queue with research files

### 2. **Web Research** (Automated)
- System gathers market-specific data
- Enriches research files with current information

### 3. **Content Generation** (This System)
- **Pass 1:** Generate structured outline (GPT-4o-mini, 30s)
- **Pass 2:** Write sections with facts & references (GPT-4o, ~40s/section)
- **Pass 3:** Generate FAQs (GPT-4o-mini, 30s)
- **Pass 4:** Polish & consistency check (GPT-4o-mini, 20s)

### 4. **Output**
- Publication-ready markdown with frontmatter
- SEO-optimized metadata
- Proper shortcode integration
- Quality score 85+

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Processing Time** | 5-6 minutes/blog |
| **Cost per Blog** | ~$0.024 USD |
| **Word Count** | 1,500-2,000 words |
| **Quality Score** | 85+ |
| **100 blogs** | ~$2.40, ~8 hours |
| **1000 blogs** | ~$24, ~80 hours |

---

## 🛠️ Usage

### NPM Scripts

```bash
npm run test       # Process 1 blog (test mode)
npm run quick      # Process 3 blogs
npm run standard   # Process 5 blogs
npm run full       # Process 10 blogs
npm run config     # Show current configuration
npm run validate   # Validate API key
```

### Direct Usage

```bash
# Process specific number of blogs
node pipeline/run.js 7 detailed

# Use presets
node pipeline/run.js quick
node pipeline/run.js standard verbose

# Preview outline only (no generation)
node pipeline/run.js preview
```

---

## 🔧 Integration with Your Project

### Option 1: Standalone (Recommended)

The system auto-detects your project structure. Just ensure these directories exist:

```
your-project/
├── autonomous-blog-writer/    # This folder
├── blog-planning/
│   ├── research/              # Research markdown files
│   └── BLOG_TODO.md           # Queue of blogs to generate
└── src/content/blog/          # Output directory
```

### Option 2: Custom Paths

Override paths in `.env`:

```bash
PROJECT_ROOT=/custom/path
BLOG_OUTPUT_DIR=content/posts
RESEARCH_DIR=research
TODO_FILE=queue.md
```

---

## 📝 Input Requirements

### Research File Format

Each blog needs a research file at `{RESEARCH_DIR}/{slug}.md`:

```markdown
# Topic Title — Research

## Palabras clave
Primarias: keyword1, keyword2
Secundarias: keyword3, keyword4

## Público objetivo
Target audience description

## Intención del artículo
Article purpose and goals

## Secciones sugeridas
1. Introduction
2. Main concepts
3. Technical details
4. Practical applications

## Datos del mercado mexicano
- CDMX specific info
- Pricing in MXN
- Local availability

## Referencias de libros
- Herman (2019), page 42: Stability principles
- Pilates (1945), page 12: Core concepts

## FAQ
1) Common question?
2) Technical question?
```

### TODO File Format

Queue blogs in `{TODO_FILE}`:

```markdown
## CATEGORÍA: Equipment

### 🔬 blog-slug-here
- **Title:** Full blog title
- **Keywords:** keyword1, keyword2
- **Status:** Research ready
```

The `🔬` emoji indicates "research ready, needs content generation".

---

## 🎨 Output Format

Generated blogs include:

- **Frontmatter:** title, description, category, tags, date, author
- **Content:**
  - H1 title
  - Medical disclaimer
  - 8-10 sections with technical depth
  - Brand recommendations
  - Hub list shortcode
  - 5-8 detailed FAQs
- **Shortcodes:** `<see-also>`, `<hub-list>`, etc.
- **Book citations:** Proper academic format
- **Market context:** Local cities, MXN pricing

---

## 🐛 Troubleshooting

### "OpenAI API key not found"

```bash
# Check .env file exists
ls -la autonomous-blog-writer/.env

# Verify key is set
grep OPENAI_API_KEY autonomous-blog-writer/.env

# Re-run validation
npm run validate
```

### "Research file not found"

```bash
# Check research directory
ls blog-planning/research/

# Verify slug matches filename
# Research file: blog-planning/research/my-topic.md
# Slug in TODO: my-topic
```

### "No pending blogs"

```bash
# Check TODO file for 🔬 status
cat blog-planning/BLOG_TODO.md | grep "🔬"

# Ensure research files exist for queued topics
```

### Processing takes too long

- **Normal:** LLM generation takes 5-6 minutes per blog
- **Check:** Monitor logs in `logs/` directory
- **Timeout:** Increase `LLM_TIMEOUT` in `.env`

---

## 🔐 Security

- **API Key:** Never commit `.env` to version control
- **Gitignore:** Add `.env` to `.gitignore`
- **Rotation:** Rotate API keys periodically
- **Limits:** Set usage limits in OpenAI dashboard

---

## 📚 Advanced Usage

### Custom Configuration

Import and extend `config.js`:

```javascript
import CONFIG from './autonomous-blog-writer/config.js';

console.log(CONFIG.WORD_TARGET);  // 1800
console.log(CONFIG.BLOG_OUTPUT_DIR);  // /path/to/src/content/blog
```

### Programmatic API

```javascript
import { spawn } from 'child_process';

const runner = spawn('node', [
  'autonomous-blog-writer/pipeline/run.js',
  '5',  // 5 blogs
  'minimal'  // log level
]);

runner.on('exit', (code) => {
  console.log(`Completed with code ${code}`);
});
```

---

## 🌍 Localization

The system is pre-configured for Spanish (Mexico) but can be adapted:

```bash
# Change language
CONTENT_LANGUAGE=en-US
CONTENT_MARKETS=New York,Los Angeles,Chicago
CONTENT_CURRENCY=USD

# Update brand
BRAND_NAME=Your Brand
BRAND_DESCRIPTION=your brand tagline
```

**Note:** Prompts in `agents/content-writer.js` may need adjustment for non-Spanish languages.

---

## 🚧 Roadmap

- [ ] Preview mode (outline generation without content)
- [ ] Section regeneration tool
- [ ] Multi-language support
- [ ] Image generation integration
- [ ] Batch quality reports
- [ ] API for programmatic access

---

## 📄 License

MIT License - See parent project for details

---

## 🤝 Support

For issues specific to this autonomous blog writer:

1. Check `.env` configuration
2. Verify API key has sufficient credits
3. Review logs in `logs/` directory
4. Check research file format

---

**Ready to generate!** 🎉

```bash
cd autonomous-blog-writer
npm install
cp .env.example .env
# Add your API key to .env
npm run test
```
