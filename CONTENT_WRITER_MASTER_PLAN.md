# 🎯 Content Writer Master Plan
## The Ultimate LLM-Based Blog Content Generator

**Date:** October 1, 2025
**Goal:** Create the absolute best research-driven content writer for the autonomous blog pipeline

---

## 📊 Current System Analysis

### **What We Have:**

1. **Rich Research Files** ✅
   - Detailed structure proposals (8-9 sections)
   - Book references (Herman, Pilates, Lea, Wells) with page numbers and quotes
   - Technical specifications (box dimensions, pulley specs, maintenance schedules)
   - FAQ candidates with detailed answers
   - CTA/interlink suggestions
   - Mexican market context (CDMX, GDL, MTY, MXN pricing)
   - Keywords (primary + 5-10 secondaries)

2. **Structured Blog Templates** ✅
   - Frontmatter (title, description, category, tags, publishDate, author, slug, featured)
   - Required sections: Resumen, Claves prácticas, Desarrollo del tema, FAQ
   - Custom shortcodes: `<see-also>`, `<hub-list>`, `<shoprocket-button>`, `<audio-story>`
   - CAMA Pilates branding section
   - Medical disclaimer

3. **Sequential Pipeline** ✅
   - Stage 1-2: Research creation & web data gathering
   - Stage 3: Research validation
   - **Stage 4: Content writing** ← WE ARE HERE
   - Stage 5-8: SEO, quality, images, validation

### **What's Missing:**

❌ **LLM-powered content generation** that transforms research → publication-ready Spanish blog prose

---

## 🏗️ Architecture Design

### **Agent Name:** `mcp-content-writer-agent.js`

### **Purpose:**
Transform rich research files into **extremely well-researched, engaging, SEO-optimized blog posts** in Spanish with Mexican market focus.

### **Input:**
```javascript
{
  slug: "accesorios-esenciales-reformer",
  researchFile: "blog-planning/research/accesorios-esenciales-reformer.md",
  category: "Equipo y mantenimiento",
  keywords: ["accesorios reformer", "box reformer", "correas reformer"],
  forceOverwrite: false
}
```

### **Output:**
```javascript
{
  success: true,
  blogFile: "src/content/blog/accesorios-esenciales-reformer.md",
  wordCount: 1842,
  sections: ["Resumen", "Accesorios esenciales", "Ajuste y calibración", "FAQ"],
  quality_score: 92,
  processing_time_ms: 45000
}
```

---

## 🧠 LLM Strategy: Multi-Pass Content Generation

### **Why Multi-Pass?**

Single-pass generation produces generic content. We need **depth, accuracy, and structure**.

### **Pass 1: Content Planning & Outline** (GPT-4o-mini, 30s)

**Purpose:** Validate structure and extract key facts from research

**Prompt:**
```
You are a senior content strategist for CAMA Pilates, Mexico's premium Reformer manufacturer.

RESEARCH FILE:
{researchFileContent}

TASK:
1. Review the proposed structure
2. Extract all key facts, statistics, book references, and technical specs
3. Identify gaps or missing details
4. Create a detailed outline with section-by-section talking points

Return JSON:
{
  "outline": [
    {
      "section": "Resumen",
      "h2": "Resumen",
      "talking_points": ["...", "..."],
      "facts_to_include": ["Box dimensions: ...", "Herman (2019, p. 42): ..."],
      "word_count_target": 150
    },
    ...
  ],
  "total_word_target": 1800,
  "key_facts": ["...", "..."],
  "book_references": [{"source": "Herman (2019)", "page": 42, "quote": "..."}],
  "gaps": ["Missing pricing for boxes", "No maintenance frequency mentioned"]
}
```

**Model:** `gpt-4o-mini` (fast, cheap, good at structured extraction)
**Estimated cost:** $0.002 per blog
**Time:** ~30 seconds

---

### **Pass 2: Section-by-Section Content Generation** (GPT-4o, 3-5min)

**Purpose:** Generate rich, engaging prose for each section

**For each section in outline:**

**Prompt:**
```
You are an expert Pilates content writer for the Mexican market.

SECTION: {section.h2}
TALKING POINTS:
{section.talking_points.join('\n- ')}

FACTS TO INCLUDE:
{section.facts_to_include.join('\n- ')}

CONTEXT:
- Category: {category}
- Target audience: {targetAudience}
- Tone: Professional, practical, Mexican Spanish
- Word count: {section.word_count_target} words

REQUIREMENTS:
1. Write in clear, engaging Spanish (Mexican variant)
2. Include ALL facts and book references naturally
3. Use specific examples (CDMX, Guadalajara, Monterrey)
4. Include prices in MXN when mentioned
5. Add practical tips and actionable advice
6. Use second person ("tú" form) for engagement
7. Include safety notes where relevant
8. NO medical claims (use "consulta con profesional")

WRITE ONLY THIS SECTION (DO NOT INCLUDE HEADING):
```

**Model:** `gpt-4o` (best quality, accurate facts, natural Spanish)
**Estimated cost:** $0.02 per blog (8 sections × $0.0025 each)
**Time:** ~3-5 minutes total

**Why section-by-section?**
- Better fact retention (smaller context windows)
- More control over length and structure
- Can parallelize for speed (future optimization)
- Easier to debug quality issues

---

### **Pass 3: FAQ Generation** (GPT-4o-mini, 30s)

**Purpose:** Generate 5-8 FAQs with detailed answers

**Prompt:**
```
You are a Pilates expert creating FAQ content for Mexican consumers.

RESEARCH FILE:
{researchFileContent}

FAQ CANDIDATES FROM RESEARCH:
{faqCandidates.join('\n- ')}

TASK:
Generate 5-8 FAQs with detailed answers (80-120 words each).

REQUIREMENTS:
- Mix basic and advanced questions
- Include Mexican market specifics (prices in MXN, cities, local availability)
- Reference book sources where relevant (Herman, Pilates, Lea)
- Add safety disclaimers for health-related questions
- Use "tú" form, conversational but professional

Return JSON:
{
  "faqs": [
    {"question": "¿Qué tamaño de box elegir?", "answer": "..."},
    ...
  ]
}
```

**Model:** `gpt-4o-mini` (cheaper, good at FAQ format)
**Estimated cost:** $0.001 per blog
**Time:** ~30 seconds

---

### **Pass 4: Quality Check & Polish** (GPT-4o-mini, 20s)

**Purpose:** Fix inconsistencies, add transitions, check tone

**Prompt:**
```
You are a copy editor reviewing a Pilates blog post for CAMA Pilates.

FULL BLOG CONTENT:
{generatedContent}

RESEARCH FILE (for fact-checking):
{researchFileContent}

TASK:
1. Check factual accuracy against research
2. Ensure consistent tone and voice
3. Add smooth transitions between sections
4. Fix any grammatical errors or awkward phrasing
5. Verify all book references are cited correctly
6. Ensure Mexican Spanish conventions
7. Check that safety disclaimers are present

Return the polished blog content (Markdown, no frontmatter).
```

**Model:** `gpt-4o-mini` (fast, good at editing)
**Estimated cost:** $0.001 per blog
**Time:** ~20 seconds

---

## 📐 Complete Content Structure

### **Frontmatter (Generated from research + pipeline)**
```yaml
---
title: "{title from research}"
description: "{generated SEO description, 120-155 chars}"
category: "{category from TODO file}"
tags: ["{primary keyword}", "{secondary 1}", "{secondary 2}"]
publishDate: "{today's date}"
author: "CAMA Pilates"
slug: "{slug}"
featured: false
---
```

### **Body Structure (Generated by LLM)**

```markdown
# {title}

> Nota: Contenido informativo; no es asesoramiento médico.

## Resumen
{2-3 párrafos: qué, por qué importa, quién se beneficia. 150-200 palabras}

## {H2 from research outline - e.g., "Accesorios esenciales"}
{Detailed content with facts, book references, specific examples. 300-400 palabras}

### {H3 subsection if needed}
{Technical details, maintenance, etc.}

<see-also limit="3" />

## {H2 continued}
{More detailed content...}

## Recomendaciones CAMA Pilates
CAMA Pilates ofrece {specific product mention with benefits}. {Specific value props: German engineering, Mexican manufacturing, Spanish support, national shipping, warranty}.

{Include relevant CTAs from research}

<hub-list category="{category}" limit="5" title="Más contenidos relacionados" />

## FAQ
### {Question 1}
{Detailed answer 1}

### {Question 2}
{Detailed answer 2}

{... 5-8 total FAQs}
```

---

## 🔧 Implementation Plan

### **File:** `scripts/mcp-content-writer-agent.js`

**Structure:**
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';

// MCP Server setup
const server = new Server({
  name: 'content-writer-agent',
  version: '1.0.0',
}, {
  capabilities: { tools: {} },
});

// Tool: write_blog_from_research
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'write_blog_from_research',
      description: 'Generate publication-ready blog content from research file using multi-pass LLM approach',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog slug' },
          forceOverwrite: { type: 'boolean', default: false }
        },
        required: ['slug']
      }
    },
    {
      name: 'regenerate_section',
      description: 'Regenerate a specific section of an existing blog',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          section: { type: 'string', description: 'Section heading to regenerate' }
        },
        required: ['slug', 'section']
      }
    }
  ]
}));

// Multi-pass generation workflow
async function writeBlogFromResearch(slug) {
  const startTime = Date.now();

  // 1. Load research file
  const researchFile = path.join(ROOT, 'blog-planning', 'research', `${slug}.md`);
  const researchContent = await fs.readFile(researchFile, 'utf-8');

  // 2. Parse research metadata
  const metadata = parseResearchMetadata(researchContent);

  // 3. Pass 1: Generate outline
  console.error(`[Pass 1/4] Generating outline for ${slug}...`);
  const outline = await generateOutline(researchContent, metadata);

  // 4. Pass 2: Generate sections
  console.error(`[Pass 2/4] Generating ${outline.sections.length} sections...`);
  const sections = [];
  for (const sectionPlan of outline.sections) {
    const content = await generateSection(sectionPlan, researchContent, metadata);
    sections.push({ heading: sectionPlan.h2, content });
  }

  // 5. Pass 3: Generate FAQs
  console.error(`[Pass 3/4] Generating FAQs...`);
  const faqs = await generateFAQs(researchContent, metadata);

  // 6. Pass 4: Polish & combine
  console.error(`[Pass 4/4] Final polish...`);
  const fullContent = assembleBlog(sections, faqs, metadata);
  const polished = await polishContent(fullContent, researchContent);

  // 7. Add frontmatter
  const frontmatter = buildFrontmatter(metadata, slug);
  const final = `${frontmatter}\n\n${polished}\n`;

  // 8. Write to file
  const blogFile = path.join(ROOT, 'src', 'content', 'blog', `${slug}.md`);
  await fs.writeFile(blogFile, final, 'utf-8');

  const processingTime = Date.now() - startTime;
  const wordCount = countWords(polished);

  return {
    success: true,
    blogFile,
    wordCount,
    sections: sections.map(s => s.heading),
    processing_time_ms: processingTime
  };
}

// Helper: Generate outline with GPT-4o-mini
async function generateOutline(researchContent, metadata) {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a senior content strategist for CAMA Pilates...

RESEARCH FILE:
${researchContent}

TASK:
... (see prompt above)
`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    temperature: 0.3,  // Lower for structured output
    maxTokens: 2000
  });

  return JSON.parse(result.text);
}

// Helper: Generate section with GPT-4o
async function generateSection(sectionPlan, researchContent, metadata) {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are an expert Pilates content writer...

SECTION: ${sectionPlan.h2}
... (see prompt above)
`;

  const result = await generateText({
    model: openai('gpt-4o'),
    prompt,
    temperature: 0.7,  // Higher for creative writing
    maxTokens: 800
  });

  return result.text.trim();
}

// Similar functions for generateFAQs(), polishContent(), etc.
```

---

## 💰 Cost & Performance

### **Per Blog:**
- Pass 1 (Outline): $0.002
- Pass 2 (8 sections): $0.020
- Pass 3 (FAQs): $0.001
- Pass 4 (Polish): $0.001

**Total: ~$0.024 per blog** (1000 blogs = $24)

### **Time:**
- Pass 1: 30 seconds
- Pass 2: 4 minutes (sequential) or 30 seconds (parallel)
- Pass 3: 30 seconds
- Pass 4: 20 seconds

**Total: ~5-6 minutes per blog** (sequential) or **~2 minutes** (parallel)

### **Quality Metrics:**
- Word count: 1500-2000 words
- Sections: 8-10
- FAQs: 5-8 detailed answers
- Book references: 3-5 citations
- Mexican context: CDMX/GDL/MTY mentions, MXN pricing
- Shortcodes: `<see-also>`, `<hub-list>`, CTAs

---

## 🎛️ Configuration Options

### **Environment Variables:**
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL_MAIN=gpt-4o          # Main content generation
OPENAI_MODEL_FAST=gpt-4o-mini     # Outline, FAQs, polish
CONTENT_WORD_TARGET=1800          # Target word count
CONTENT_TEMPERATURE=0.7           # Creativity level
CONTENT_PARALLEL_SECTIONS=false   # Generate sections in parallel (faster but more expensive)
```

### **Quality Gates:**
```javascript
const QUALITY_CHECKS = {
  min_word_count: 1200,
  max_word_count: 2500,
  required_sections: ['Resumen', 'FAQ'],
  required_shortcodes: ['<see-also', '<hub-list'],
  required_disclaimer: true,
  min_faqs: 5,
  max_template_text: 0,  // No placeholder text allowed
  mexican_context_required: true,  // Must mention CDMX/GDL/MTY or MXN
  book_references_min: 1
};
```

---

## 🔄 Integration with Pipeline

### **Current `blog-writer.js` (templates):**
```javascript
// OLD: Hardcoded templates
function buildBody({ title, category }) {
  return `## Resumen\nIntroducción breve...`;  // ❌ Template
}
```

### **New `mcp-content-writer-agent.js` (LLM):**
```javascript
// NEW: Multi-pass LLM generation
async function writeBlogFromResearch(slug) {
  const outline = await generateOutline(research);
  const sections = await Promise.all(
    outline.sections.map(s => generateSection(s, research))
  );
  const faqs = await generateFAQs(research);
  return assembleBlog(sections, faqs);  // ✅ Real content
}
```

### **Pipeline Integration:**
```javascript
// autonomous-blog-pipeline.js:174-182
const agentMapping = {
  'blog-research-agent': 'mcp-research-agent.js',
  'web-research-agent': 'mcp-web-research-agent.js',
  'seo-optimization-agent': 'mcp-seo-agent.js',
  'quality-review-agent': 'mcp-quality-agent.js',
  'blog-image-agent': 'mcp-image-agent.js',
  'blog_writer': 'mcp-content-writer-agent.js'  // ✅ NEW: LLM-based
};
```

### **MCP Config:**
```json
{
  "mcpServers": {
    "content-writer-agent": {
      "command": "node",
      "args": ["scripts/mcp-content-writer-agent.js"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      },
      "disabled": false,
      "autoApprove": ["write_blog_from_research"]
    }
  }
}
```

---

## 🧪 Testing Strategy

### **Phase 1: Single Blog Test**
```bash
# Test with existing rich research file
export TARGET_SLUGS="accesorios-esenciales-reformer"
node scripts/run-batch-blogs.js 1 detailed

# Verify:
# - Word count 1500-2000 ✅
# - No template text ✅
# - Book references present ✅
# - Mexican context (CDMX/MXN) ✅
# - FAQs detailed ✅
# - Shortcodes present ✅
```

### **Phase 2: Quality Comparison**
```bash
# Generate 3 blogs and compare with manual content
# Metrics:
# - Factual accuracy (vs research file)
# - Readability score
# - SEO optimization
# - Engagement (questions, direct address)
```

### **Phase 3: Production Test**
```bash
# Generate 10 blogs
npm run blog:full

# Monitor:
# - Success rate (target: 95%+)
# - Average word count
# - Processing time
# - API costs
# - Quality scores (85+)
```

---

## 🚀 Rollout Plan

### **Week 1: Development**
- [ ] Create `mcp-content-writer-agent.js` scaffold
- [ ] Implement Pass 1 (outline generation)
- [ ] Implement Pass 2 (section generation)
- [ ] Test single-section generation

### **Week 2: Integration**
- [ ] Implement Pass 3 (FAQ generation)
- [ ] Implement Pass 4 (polish)
- [ ] Add frontmatter generation
- [ ] Integration with pipeline

### **Week 3: Testing & Optimization**
- [ ] Single blog tests (5 blogs)
- [ ] Quality comparison vs manual
- [ ] Parallel section generation (performance)
- [ ] Cost optimization

### **Week 4: Production**
- [ ] Generate 10 production blogs
- [ ] Monitor quality scores
- [ ] Fine-tune prompts based on results
- [ ] Documentation & handoff

---

## 📝 Success Criteria

### **Functional:**
- ✅ Generates 1500-2000 word blogs
- ✅ No template placeholders
- ✅ Includes 3-5 book references
- ✅ 5-8 detailed FAQs
- ✅ Mexican context (cities, MXN pricing)
- ✅ Proper shortcode integration
- ✅ Medical disclaimers where appropriate

### **Quality:**
- ✅ Quality score 85+ (from quality-review-agent)
- ✅ Readability: avg sentence length <20 words
- ✅ Factual accuracy: 100% match with research
- ✅ SEO: keyword density 1-2%, natural usage
- ✅ Engagement: questions, direct address ("tú")

### **Performance:**
- ✅ Processing time: <6 minutes per blog
- ✅ Cost: <$0.03 per blog
- ✅ Success rate: 95%+
- ✅ No manual editing required

---

## 🎯 Why This Approach is "The Absolute Best"

1. **Multi-Pass = Depth**: Single-pass LLMs are superficial. Multi-pass allows planning → execution → refinement.

2. **Research-Driven**: Every fact, statistic, and book reference from research is deliberately included via outline planning.

3. **Section-by-Section**: Smaller context windows = better fact retention and accuracy.

4. **Quality-First**: 4 passes ensure structure, content, FAQs, and polish are all optimized.

5. **Mexican Market**: Explicit prompts for CDMX/GDL/MTY mentions, MXN pricing, and local context.

6. **Book Integration**: Herman, Pilates, Lea references are extracted and cited naturally.

7. **Cost-Optimized**: Use GPT-4o only where needed (section generation), GPT-4o-mini for structure/polish.

8. **Template-Aware**: Understands shortcodes (`<see-also>`, `<hub-list>`), CTAs, and CAMA branding.

9. **Measurable**: Every blog tracked for word count, quality score, processing time, cost.

10. **Scalable**: Can generate 1000 blogs/month at $24 total cost with consistent quality.

---

## 📚 Next Steps

1. **Review this plan** with team/stakeholders
2. **Get OpenAI API key** with sufficient credits
3. **Start with Phase 1** (single blog test)
4. **Iterate on prompts** based on initial results
5. **Scale gradually** (1 → 5 → 10 → 50 → production)

---

**This is the blueprint for the absolute best LLM-based blog content writer.** Ready to implement! 🚀
