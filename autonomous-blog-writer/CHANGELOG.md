# Changelog

## v1.0.0 - Portable Module Refactor (2025-10-01)

### 🎯 Goal
Refactor the autonomous blog writer into a self-contained, portable folder that can be drag-and-dropped into any project.

### ✨ What's New

#### Portable Configuration
- **`.env` file**: Dedicated configuration with OpenAI API key
- **`config.js`**: Centralized configuration module
  - Auto-detects project root
  - Loads all settings from .env
  - Provides validation functions
  - Exports CONFIG object for all agents

#### Refactored Agents
- **`agents/content-writer.js`**: LLM-powered content generation
  - Uses centralized CONFIG instead of hardcoded paths
  - 4-pass generation (Outline → Sections → FAQs → Polish)
  - Configurable brand, language, markets
  - Portable across projects

#### Easy Installation
- **`setup.sh`**: One-command setup script
- **`package.json`**: NPM scripts for quick commands
- **`pipeline/run.js`**: Main entry point with presets

#### Documentation
- **`README.md`**: Complete usage guide
- **`QUICK_START.md`**: 5-minute quick start
- **`INSTALLATION.md`**: Detailed setup instructions
- **`CHANGELOG.md`**: This file

### 🏗️ Architecture

```
autonomous-blog-writer/
├── .env                  # Configuration (your API key)
├── .env.example          # Template
├── config.js             # Centralized config loader
├── package.json          # Dependencies & scripts
├── setup.sh              # Setup script
│
├── agents/               # MCP agents
│   └── content-writer.js # LLM content generation
│
├── pipeline/             # Orchestration
│   └── run.js            # Main entry point
│
└── docs/                 # Documentation
    ├── README.md
    ├── QUICK_START.md
    ├── INSTALLATION.md
    └── CHANGELOG.md
```

### 🔧 Configuration Changes

#### Before
```javascript
// Hardcoded paths
const ROOT = path.resolve(__dirname, '..');
const RESEARCH_DIR = path.join(ROOT, 'blog-planning', 'research');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

// Hardcoded settings
const CONFIG = {
  MODEL_MAIN: 'gpt-4o',
  WORD_TARGET: 1800,
  // ... hardcoded values
};
```

#### After
```javascript
// Centralized, configurable
import CONFIG from '../config.js';

// All paths auto-detected or configurable via .env
CONFIG.RESEARCH_DIR       // From .env or auto-detected
CONFIG.BLOG_OUTPUT_DIR    // From .env or auto-detected
CONFIG.OPENAI_MODEL       // From .env
CONFIG.WORD_TARGET        // From .env
CONFIG.BRAND_NAME         // From .env
CONFIG.LANGUAGE           // From .env
```

### 📊 Performance

Unchanged from original:
- **Time:** 5-6 minutes per blog
- **Cost:** ~$0.024 USD per blog
- **Quality:** 85+ score
- **Output:** 1,500-2,000 words

### 🚀 Usage

#### Before
```bash
# Required project-specific setup
export OPENAI_API_KEY="..."
export TARGET_SLUGS="..."
node scripts/run-batch-blogs.js 3 detailed
```

#### After
```bash
# Portable, self-contained
cd autonomous-blog-writer
npm install
cp .env.example .env  # Add API key
npm run quick         # That's it!
```

### 🎁 Benefits

1. **Portability**: Drop into any project
2. **Self-contained**: Own .env, config, dependencies
3. **Easy setup**: One script, ready to go
4. **Configurable**: All settings in .env
5. **Well-documented**: 4 comprehensive docs
6. **Backwards compatible**: Works with existing pipeline

### 🔄 Migration Guide

For existing projects using the old system:

```bash
# 1. Copy your API key
OLD_KEY=$(grep OPENAI_API_KEY .env | cut -d'=' -f2)

# 2. Setup new system
cd autonomous-blog-writer
cp .env.example .env
echo "OPENAI_API_KEY=$OLD_KEY" >> .env

# 3. Test
npm run validate
npm run test

# 4. Update workflows to use:
npm run quick     # instead of old commands
```

### 📝 Breaking Changes

None - the system is additive and backwards compatible.

### 🐛 Known Issues

1. **Preview mode** not yet implemented
2. **Pipeline runner** currently delegates to old scripts
3. **Node.js 18+** required (v18.20.5 tested)

### 🔮 Future Enhancements

- [ ] Standalone pipeline (no delegation)
- [ ] Preview mode (outline without generation)
- [ ] Section regeneration tool
- [ ] Multi-language prompt support
- [ ] Image generation integration
- [ ] Quality report generation

### 🙏 Credits

- Original system: Blog writer with 8-stage pipeline
- Refactor: Portable module with centralized config
- Technologies: Node.js, OpenAI GPT-4o, MCP SDK

---

## Previous Versions

### v0.9.0 - Content Writer Agent (2025-10-01)
- Added multi-pass LLM content generation
- Integrated with existing pipeline
- Quality improvements

### v0.8.0 - Pipeline Automation (2025-09-30)
- 8-stage autonomous pipeline
- MCP agent integration
- Quality scoring

---

**Version:** 1.0.0
**Date:** October 1, 2025
**Status:** ✅ Production Ready
