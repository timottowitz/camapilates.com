# 🤖 Autonomous Blog Generation System

A fully automated content pipeline that creates SEO-optimized blog posts for CAMA Pilates targeting the Mexican market.

## 🚀 Quick Start

### Option 1: Simple Batch Processing (Recommended)

```bash
# Process 3 blogs for testing
npm run blog:quick

# Standard batch of 5 blogs
npm run blog:standard

# Full batch of 10 blogs
npm run blog:full

# Production batch (20 blogs, higher quality threshold)
npm run blog:production
```

### Option 2: Fully Autonomous Scheduling

```bash
# Start autonomous scheduler (runs 24/7)
npm run blog:auto

# Check status
npm run blog:status
```

### Option 3: Custom Configuration

```bash
# Process specific number of blogs
node scripts/run-batch-blogs.js 7 detailed

# Run with minimal logging
node scripts/run-batch-blogs.js 5 minimal
```

## 📊 System Architecture

### Pipeline Stages (Per Blog)
1. **Research Creation** (5min) - Creates comprehensive research file
2. **Web Research** (4min) - Gathers current market data and trends
3. **Research Validation** (2min) - Ensures Mexican market relevance
4. **Content Writing** (8min) - Generates SEO-optimized blog post
5. **SEO Optimization** (3min) - Meta tags, schema markup, optimization
6. **Quality Review** (4min) - Comprehensive quality assurance
7. **Image Enhancement** (5min) - Adds hero and contextual images
8. **Final Validation** (2min) - Publication readiness check

**Total Time Per Blog:** ~33 minutes

### Quality Gates
- **Research completeness:** 1000+ words minimum
- **Mexican market relevance:** 70+ score required
- **Overall quality score:** 85+ required for publication
- **SEO compliance:** Full meta tag and schema validation
- **Template compliance:** All required sections present

## 🎯 Content Targeting

### Primary Focus
- **Market:** Mexican Pilates community
- **Language:** Spanish (es-MX)
- **Cultural Integration:** Respects traditional practices (cuarentena, family dynamics)
- **Product Integration:** Natural CAMA Pilates product placement

### SEO Strategy
- **Target Keywords:** pilates posparto, ejercicios lactancia, reformer pilates
- **Geographic Focus:** CDMX, Guadalajara, Monterrey
- **Content Length:** 1500-2500 words for competitive ranking
- **Schema Markup:** Article, FAQPage, and Product schemas

## 📂 File Structure

```
/Pilates_Reformer/
├── scripts/
│   ├── autonomous-blog-pipeline.js    # Main pipeline orchestrator
│   ├── run-batch-blogs.js            # Simple batch runner
│   ├── scheduled-blog-runner.js      # 24/7 autonomous scheduler
│   ├── mcp-web-research-agent.js     # Live web research
│   ├── mcp-seo-agent.js              # SEO optimization
│   ├── mcp-quality-agent.js          # Quality assurance
│   ├── mcp-research-agent.js         # Research file management
│   └── mcp-image-agent.js            # Image enhancement
├── blog-planning/
│   ├── BLOG_TODO.md                  # Master blog queue
│   └── research/                     # Research files
├── src/content/blog/                 # Published blog posts
├── logs/                             # Pipeline execution logs
└── mcp-config.json                   # MCP agent configuration
```

## ⚙️ Configuration

### Batch Processing Settings
```javascript
const CONFIG = {
  maxConcurrentBlogs: 1,        // Process one at a time
  retryAttempts: 3,             // Retry failed stages
  qualityThreshold: 85,         // Minimum quality score
  logLevel: 'detailed'          // minimal|detailed|verbose
};
```

### Scheduling Settings
```javascript
const schedule = {
  interval: 6 * 60 * 60 * 1000, // 6 hours between runs
  blogsPerRun: 2,               // Blogs per scheduled run
  maxDailyBlogs: 8,             // Daily safety limit
  startHour: 9,                 // Start at 9 AM
  endHour: 21                   // Stop at 9 PM
};
```

## 📈 Monitoring & Reports

### Real-time Monitoring
```bash
# Check current status
npm run blog:status

# View live logs
tail -f logs/pipeline-*.log

# Check scheduler status
npm run blog:status
```

### Generated Reports
- **Pipeline Reports:** `logs/pipeline-report-[timestamp].json`
- **Scheduler Logs:** `logs/scheduler.log`
- **Quality Metrics:** Individual blog quality scores
- **Performance Stats:** Processing times and success rates

### Sample Report Output
```json
{
  "summary": {
    "total_blogs": 10,
    "completed": 9,
    "failed": 1,
    "success_rate": "90.0%",
    "total_time": "4h 52m 15s",
    "avg_time_per_blog": "32m 25s"
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

**No Pending Blogs Found**
```bash
# Check TODO file for 🔬 status blogs
cat blog-planning/BLOG_TODO.md | grep "🔬"
```

**Quality Score Too Low**
- Research file needs more Mexican market context
- Content length below 1500 words
- Missing FAQ section or proper headings

**MCP Agent Failures**
```bash
# Test individual agents
node scripts/mcp-web-research-agent.js
node scripts/mcp-seo-agent.js
```

**Memory Issues (Large Batches)**
- Reduce batch size: use `blog:quick` instead of `blog:production`
- Increase system memory allocation
- Process in smaller chunks

### Error Recovery
The system includes automatic retry logic:
- Failed stages retry up to 3 times
- Quality failures trigger research enhancement
- Timeout protection prevents hanging processes

## 🔧 Advanced Usage

### Custom Pipeline Configuration
```bash
# Run with custom quality threshold
node scripts/autonomous-blog-pipeline.js 5 detailed 90

# Modify agent timeout settings
# Edit CONFIG object in autonomous-blog-pipeline.js
```

### Integration with External Systems
The pipeline can be extended to integrate with:
- **Slack/Discord:** Pipeline completion notifications
- **Analytics:** Track blog performance metrics
- **CMS:** Auto-publish to WordPress/Ghost
- **Social Media:** Auto-post to social platforms

### Development Mode
```bash
# Test single blog with verbose logging
node scripts/run-batch-blogs.js 1 verbose

# Debug specific pipeline stage
# Modify PIPELINE_STAGES array in autonomous-blog-pipeline.js
```

## 📊 Performance Benchmarks

### Expected Performance (per blog)
- **Processing Time:** 30-35 minutes
- **Quality Score:** 85-95 average
- **Success Rate:** 90%+ with proper setup
- **Mexican Relevance:** 75-85 average
- **SEO Compliance:** 95%+ with full optimization

### Scaling Considerations
- **1-5 blogs:** Run locally, single process
- **5-20 blogs:** Use batch processing with monitoring
- **20+ blogs:** Consider distributed processing
- **Production scale:** Use scheduled runner with monitoring

## 🔐 Security & Best Practices

### Safety Limits
- **Daily limits:** Prevents overload (8 blogs/day default)
- **Quality gates:** Ensures content meets standards
- **Timeout protection:** Prevents resource exhaustion
- **Error isolation:** Failed blogs don't affect others

### Content Safety
- **Medical disclaimers:** Automatically added
- **Cultural sensitivity:** Mexican market validation
- **Brand compliance:** Natural CAMA integration
- **Legal compliance:** Appropriate medical language

## 🚀 Getting Started

1. **Prerequisites Check:**
   ```bash
   node --version  # v18+ required
   npm --version   # v8+ required
   ```

2. **Run First Batch:**
   ```bash
   npm run blog:quick
   ```

3. **Monitor Results:**
   ```bash
   ls src/content/blog/        # Check generated blogs
   ls logs/                   # Check execution logs
   ```

4. **Scale Up:**
   ```bash
   npm run blog:standard      # Process more blogs
   npm run blog:auto          # Start autonomous mode
   ```

## 📞 Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review TODO file status in `blog-planning/BLOG_TODO.md`
3. Test individual agents in `scripts/` directory
4. Monitor system resources during large batches

The autonomous blog system is designed to run reliably 24/7, producing high-quality, culturally-appropriate content for the Mexican Pilates market while maintaining CAMA Pilates brand standards.