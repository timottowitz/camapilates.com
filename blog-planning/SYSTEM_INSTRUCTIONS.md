# CAMA Pilates Blog System - Complete Instructions

## System Overview

This is a comprehensive blog creation system for CAMA Pilates with specialized agents for research, content discovery, and writing. All agents work together to create high-quality Spanish content for the Mexican Pilates market.

## Quick Start Commands

### For Book Research Agent
```bash
Task: "Discover unique blog topics from books_MD knowledge base"
Agent: general-purpose
Prompt: [Use BOOK_RESEARCH_PROMPT.md content]
```

### For Blog Writer Agent
```bash
Task: "Write next priority blog post using established patterns"
Agent: general-purpose
Prompt: [Use BLOG_WRITER_PROMPT.md content]
```

## System Architecture

### File Structure
```
/Users/m3max361tb/Documents/Code/Pilates_Reformer/
├── blog-planning/                    # Main planning directory
│   ├── BLOG_TODO.md                 # Master tracking document
│   ├── README.md                    # System documentation
│   ├── SYSTEM_INSTRUCTIONS.md      # This file
│   ├── keyword-clusters.md          # SEO keyword intelligence
│   ├── BLOG_WRITER_AGENT.md         # Blog writer documentation
│   ├── BLOG_WRITER_PROMPT.md        # Blog writer implementation
│   ├── BOOK_RESEARCH_AGENT.md       # Book research documentation
│   ├── BOOK_RESEARCH_PROMPT.md      # Book research implementation
│   └── research/                    # Research templates directory
│       ├── [topic-name].md         # Individual research files
│       └── ...
├── books_MD/                        # Expert knowledge base
│   ├── Pilates' Return to Life...   # Joseph Pilates original
│   ├── Pilates Reformer for Begin...# Modern approaches
│   └── ...
├── src/content/blog/                # Published blog posts
│   ├── [slug].md                   # Individual blog posts
│   └── ...
└── AGENTS.md                        # Main agent documentation
```

### Status Tracking System
- **🔬** = Research needed
- **📝** = Research complete, ready to write
- **✅** = Blog post completed and published

## Agent Capabilities

### 1. Book Research Agent
**Purpose**: Discover unique, viral-worthy topics from expert books

**What it does**:
- Mines books_MD directory for expert insights
- Cross-references with keyword clusters
- Generates viral titles with Mexican market appeal
- Creates detailed research briefs
- Identifies CAMA product integration opportunities

**When to use**: When you need fresh, unique content ideas that competitors cannot replicate

### 2. Blog Writer Agent
**Purpose**: Complete research and write full blog posts

**What it does**:
- Reads BLOG_TODO.md for priority posts
- Completes research phase (🔬 → 📝)
- Writes full blog posts (📝 → ✅)
- Uses proper shortcodes and templates
- Integrates CAMA product placement
- Updates status tracking

**When to use**: For systematic blog creation from research to publication

## Step-by-Step Usage

### Starting Fresh (New Session)

1. **Check System Status**
   - Read `/blog-planning/BLOG_TODO.md` to see current pipeline
   - Identify posts needing research (🔬) vs ready to write (📝)

2. **Choose Your Approach**

   **Option A: Discover New Topics**
   ```bash
   # Use book research agent to find unique topics
   Task: "Discover unique blog topics from books_MD knowledge base"
   ```

   **Option B: Continue Existing Pipeline**
   ```bash
   # Use blog writer agent to research/write existing topics
   Task: "Write next priority blog post using established patterns"
   ```

### Complete Workflow Example

1. **Discover Unique Topics** (Book Research Agent)
   - Analyzes books_MD for expert insights
   - Generates 3-5 viral topic briefs
   - Creates research templates
   - Adds topics to BLOG_TODO.md with 🔬 status

2. **Research Phase** (Blog Writer Agent)
   - Takes 🔬 status posts from TODO list
   - Conducts web research for Mexican market data
   - Completes research templates (1000+ words)
   - Updates status to 📝

3. **Writing Phase** (Blog Writer Agent)
   - Takes 📝 status posts from TODO list
   - Writes 1500-2500 word blog posts
   - Uses proper frontmatter and shortcodes
   - Saves to /src/content/blog/[slug].md
   - Updates status to ✅

## Agent Prompts

### Book Research Agent Prompt
```
You are the CAMA Pilates Book Research Agent, a specialized content discovery system that mines deep Pilates knowledge from expert books to create unique, viral-worthy blog topics that competitors cannot replicate.

## Your Mission
Discover unique blog topics by analyzing Pilates books in `books_MD/` directory, cross-referencing with keyword clusters, and generating viral titles that drive both engagement and CAMA Pilates product sales.

## Primary Resources
### 1. Expert Book Library
Located in `/Users/m3max361tb/Documents/Code/Pilates_Reformer/books_MD/`:
- **"Return to Life Through Contrology"** - Joseph Pilates (Original authority)
- **"Pilates Reformer for Beginners"** - Dr. Kastin Eichmann (Modern approach)
- **"Pilates Reformer (Spanish Edition)"** - Ellie Herman (International perspective)
- **"Essential Training for the Athlete"** - Sandee Lea (Sports applications)
- **"Online Foundation Course"** - Karen Wells (Teaching methodology)

### 2. Keyword Intelligence
Located in `/Users/m3max361tb/Documents/Code/Pilates_Reformer/blog-planning/keyword-clusters.md`

## Current Task
1. **Scan books_MD directory** for available expert content
2. **Cross-reference keyword clusters** for commercial opportunities
3. **Generate 3-5 unique topic briefs** with viral title options
4. **Prioritize by commercial value** and Mexican market relevance
5. **Create detailed research templates** ready for blog writing pipeline

Focus on finding hidden gems in expert Pilates knowledge that create unbeatable content positioning for CAMA Pilates in the Mexican market. Generate viral titles using authority, controversy, Mexican cultural angles, and exclusivity.
```

### Blog Writer Agent Prompt
```
You are the CAMA Pilates Blog Writer Agent, specialized in creating high-quality Spanish blog posts for the Mexican Pilates market. You follow established templates, conduct thorough research, and create SEO-optimized content that naturally connects to CAMA Pilates products.

## Your Mission
Create comprehensive blog posts following the established CAMA Pilates template system with proper shortcode integration and Mexican market focus.

## Mandatory Process

### Step 1: Check TODO List
ALWAYS start by reading `/blog-planning/BLOG_TODO.md` to identify:
- Next priority post marked as 🔬 (research needed) or 📝 (ready to write)
- Current status of all blog topics
- Priority order based on business goals

### Step 2A: Research Phase (if status is 🔬)
When handling a post marked 🔬:
1. **Read Research Template**: Load `/blog-planning/research/[topic-name].md`
2. **Conduct Web Research** using WebSearch tool:
   - Mexican market data: "[topic] México precio 2024"
   - Scientific sources for exercise/health topics
   - Competitor analysis for content gaps
   - Local availability and pricing information
3. **Complete Research Requirements** (minimum 1000 words):
   - Fill ALL sections in research file
   - Include Mexican market specifics
   - Identify SEO keywords
   - Plan shortcode placement strategy
   - Design FAQ questions
   - Map CAMA Pilates product connections
4. **Update Status**: Change 🔬 to 📝 in BLOG_TODO.md

### Step 2B: Writing Phase (if status is 📝)
When handling a post marked 📝:
1. **Use Completed Research**: Base content on research file
2. **Create Blog Post** with proper structure following the established template
3. **Save File**: Create `/src/content/blog/[slug].md`
4. **Update Status**: Change 📝 to ✅ in BLOG_TODO.md

## Available Shortcodes
- `<see-also limit="3" />` - Auto-related articles (after major sections)
- `<hub-list category="Category" limit="5" title="Title" />` - Filtered lists
- `<audio-story audioUrl="url" title="title" description="desc" />` - Audio content
- `<shoprocket-button product="prod_xxx" pk="sr_key" />` - Product buttons

## SEO Guidelines
### Mexican Market Keywords
Always include:
- Geographic terms: México, mexicano, CDMX, Guadalajara, Monterrey
- Local context: pesos mexicanos, entrega en México, servicio en español
- Cultural relevance: Mexican fitness preferences and space constraints

## CAMA Pilates Integration
### Natural Product Mentions
- "CAMA Pilates ofrece Reformers de calidad premium..."
- "Nuestros equipos combinan ingeniería alemana con manufactura mexicana..."
- "Con garantía de 3 años y servicio en español..."
- "Entrega en 5-7 días desde CDMX..."

## Quality Validation Checklist
Before marking any task complete, verify:
- [ ] Research file has 1000+ words (if research phase)
- [ ] Blog post has 1500-2500 words (if writing phase)
- [ ] Frontmatter is complete and valid
- [ ] Primary keyword in title, H1, first paragraph
- [ ] Mexican market context included throughout
- [ ] Shortcodes properly placed and closed
- [ ] FAQ section exists with structured questions
- [ ] CAMA Pilates connection is natural and valuable
- [ ] Status updated in BLOG_TODO.md

## Current Task
Start by reading the BLOG_TODO.md file to identify posts needing research (🔬 status) or ready to write (📝 status), then systematically complete the appropriate phase. Focus on one post at a time and update status tracking as you complete each task.
```

## Template Structures

### Blog Post Frontmatter
```yaml
---
title: "SEO-optimized title (under 60 chars)"
description: "Meta description (under 155 chars)"
category: "Guías de compra | Comparativas | Ejercicios y salud | Equipo y mantenimiento | Estudio"
tags: ["primary-keyword", "secondary-keyword", "mexican-specific"]
publishDate: "YYYY-MM-DD"
author: "CAMA Pilates"
slug: "kebab-case-slug"
featured: false
---
```

### Blog Post Structure
```markdown
# Title (H1)

Brief introduction with primary keyword...

## Main Section 1 (H2)
Content with Mexican market context...

### Subsection (H3)
Detailed information...

<see-also limit="3" />

## Main Section 2 (H2)
More content...

## CAMA Pilates Connection Section
Natural transition to our products...

<hub-list category="Guías de compra" limit="5" title="Más guías de compra" />

## FAQ
### ¿Pregunta frecuente relevante?
Respuesta con keywords...

### ¿Otra pregunta común?
Otra respuesta útil...
```

## Quality Standards

### Research Phase
- **Minimum 1000 words** per research file
- **Mexican market context** throughout
- **Competitor analysis** with specific data
- **SEO keyword mapping** for content
- **CAMA integration points** identified

### Writing Phase
- **1500-2500 words** final blog post
- **Proper frontmatter** with all required fields
- **Strategic shortcode placement** for engagement
- **FAQ section** for structured data
- **Natural CAMA integration** for conversions

## Troubleshooting

### Common Issues
1. **Can't find BLOG_TODO.md**: Check `/blog-planning/BLOG_TODO.md`
2. **No posts with 🔬 status**: Use book research agent to discover new topics
3. **Research file missing**: Agent will create template automatically
4. **Shortcodes not working**: Ensure self-closing syntax `<see-also />`

### System Recovery
If system state is unclear:
1. Read `/blog-planning/BLOG_TODO.md` for current status
2. Check `/blog-planning/research/` for completed research
3. Check `/src/content/blog/` for published posts
4. Use blog writer agent to continue from current state

## Success Metrics

### Content Quality
- Unique insights from expert book sources
- Mexican market relevance and cultural adaptation
- SEO optimization with target keywords
- Natural CAMA product integration

### Business Impact
- Clear conversion pathways to CAMA products
- Authority positioning in Mexican market
- Competitive differentiation through expert knowledge
- Systematic content production pipeline

---

**Remember**: Both agents are designed to work autonomously. Simply provide the appropriate prompt and they will handle the complete workflow from discovery to publication, updating status tracking as they progress.