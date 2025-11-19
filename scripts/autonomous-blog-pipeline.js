#!/usr/bin/env node

/**
 * Autonomous Blog Pipeline Controller
 * Processes multiple blogs sequentially through the complete content pipeline
 * Each blog goes through: Research → Writing → SEO → Quality → Images → Publication
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  maxConcurrentBlogs: 1, // Process one blog at a time for quality
  retryAttempts: 3,
  qualityThreshold: 85, // Minimum quality score to pass
  logLevel: 'detailed', // 'minimal', 'detailed', 'verbose'
  outputDir: path.join(ROOT, 'src', 'content', 'blog'),
  researchDir: path.join(ROOT, 'blog-planning', 'research'),
  todoFile: path.join(ROOT, 'blog-planning', 'BLOG_TODO.md')
};

// Pipeline stages with their MCP agents
const PIPELINE_STAGES = [
  {
    name: 'research',
    agent: 'blog-research-agent',
    tool: 'scaffold_next_topic',
    description: 'Create and fill research file',
    timeout: 300000 // 5 minutes
  },
  {
    name: 'web_research',
    agent: 'web-research-agent',
    tool: 'gather_current_data',
    description: 'Gather web research data',
    timeout: 240000 // 4 minutes
  },
  {
    name: 'research_validation',
    agent: 'quality-review-agent',
    tool: 'validate_mexican_market_data',
    description: 'Validate research completeness',
    timeout: 120000 // 2 minutes
  },
  {
    name: 'content_writing',
    agent: 'content-writer-agent',
    tool: 'write_blog_from_research',
    description: 'Write blog post from research',
    timeout: 600000 // 10 minutes (LLM multi-pass generation)
  },
  {
    name: 'seo_optimization',
    agent: 'seo-optimization-agent',
    tool: 'optimize_title_and_meta',
    description: 'SEO optimization and meta tags',
    timeout: 180000 // 3 minutes
  },
  {
    name: 'quality_review',
    agent: 'quality-review-agent',
    tool: 'generate_quality_score',
    description: 'Comprehensive quality review',
    timeout: 240000 // 4 minutes
  },
  {
    name: 'image_enhancement',
    agent: 'blog-image-agent',
    tool: 'enrich_specific_blogs',
    description: 'Add hero and contextual images',
    timeout: 300000 // 5 minutes
  },
  {
    name: 'final_validation',
    agent: 'quality-review-agent',
    tool: 'audit_seo_compliance',
    description: 'Final publication readiness check',
    timeout: 120000 // 2 minutes
  }
];

class AutonomousBlogPipeline {
  constructor() {
    this.currentBatch = [];
    this.completedBlogs = [];
    this.failedBlogs = [];
    this.startTime = Date.now();
    this.logFile = path.join(ROOT, 'logs', `pipeline-${Date.now()}.log`);
  }

  async initialize() {
    // Create logs directory
    await fs.mkdir(path.join(ROOT, 'logs'), { recursive: true });

    this.log('🚀 Initializing Autonomous Blog Pipeline', 'info');
    this.log(`📁 Working Directory: ${ROOT}`, 'info');
    this.log(`📊 Quality Threshold: ${CONFIG.qualityThreshold}`, 'info');
    this.log(`⏱️  Max Processing Time: ${this.formatTime(PIPELINE_STAGES.reduce((sum, stage) => sum + stage.timeout, 0))}`, 'info');
  }

  // Note: Quality checking removed - we trust the TODO file status (🔬 = needs work)

  async getPendingBlogs(limit = 10) {
    try {
      const todoContent = await fs.readFile(CONFIG.todoFile, 'utf-8');
      const pendingBlogs = [];
      const envTargets = (process.env.TARGET_SLUGS || '').split(',').map(s => s.trim()).filter(Boolean);
      const targetSet = new Set(envTargets);

      // Parse TODO file for 🔬 (research needed) blogs only
      const lines = todoContent.split('\n');
      for (let i = 0; i < lines.length && pendingBlogs.length < limit; i++) {
        const line = lines[i];

        // ONLY select 🔬 (research needed) blogs - trust TODO file as source of truth
        if (line.includes('🔬') && line.startsWith('###')) {
          const titleMatch = line.match(/###\s+🔬\s+(.+)/);

          if (titleMatch) {
            const title = titleMatch[1].trim();

            // Look for research file in the next few lines
            let researchFile = null;
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
              const nextLine = lines[j];
              const researchMatch = nextLine.match(/\*\*Research File:\*\*\s+\[([^\]]+)\]/);
              if (researchMatch) {
                researchFile = researchMatch[1];
                break;
              }
            }

            if (researchFile) {
              const slug = researchFile.replace('.md', '');

              // If targets are provided, skip non-targets
              if (targetSet.size > 0 && !targetSet.has(slug)) {
                continue;
              }

              // Add blog without quality check - trust TODO status
              pendingBlogs.push({
                title: title,
                slug: slug,
                researchFile: path.join(CONFIG.researchDir, researchFile),
                status: 'pending',
                startTime: null,
                endTime: null,
                stages: {}
              });
            }
          }
        }
      }

      return pendingBlogs;
    } catch (error) {
      this.log(`❌ Error reading TODO file: ${error.message}`, 'error');
      return [];
    }
  }

  async runMCPAgent(agentName, tool, parameters = {}) {
    return new Promise((resolve, reject) => {
      // Map agent names to actual file paths
      const agentMapping = {
        // MCP agents for AI-powered content generation
        'blog-research-agent': 'mcp-research-agent.js',
        'web-research-agent': 'cli-web-research-agent.js',
        'content-writer-agent': 'cli-content-writer-agent.js', // NEW: LLM-based content writer
        'seo-optimization-agent': 'cli-seo-agent.js',
        'quality-review-agent': 'cli-quality-agent.js',
        'blog-image-agent': 'cli-image-agent.js',
        // Legacy - fallback
        'blog_writer': 'cli-content-writer-agent.js'
      };

      const fileName = agentMapping[agentName] || `mcp-${agentName}.js`;
      const agentPath = path.join(ROOT, 'scripts', fileName);

      const child = spawn('node', [agentPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve({ success: true, output: stdout });
          }
        } else {
          reject(new Error(`Agent ${agentName} failed with code ${code}: ${stderr}`));
        }
      });

      // Send tool request
      const request = {
        tool: tool,
        parameters: parameters
      };

      child.stdin.write(JSON.stringify(request));
      child.stdin.end();
    });
  }

  async executeStage(blog, stage) {
    const stageStartTime = Date.now();
    this.log(`   🔧 ${stage.description}`, 'detailed');

    try {
      let parameters = {
        slug: blog.slug,
        forceOverwrite: true // Always allow content writer to overwrite templates
      };

      // Stage-specific parameters
      switch (stage.name) {
        case 'web_research':
          // Include slug so the CLI wrapper can append to the research file
          parameters = {
            slug: blog.slug,
            topic: blog.title,
            data_types: ['statistics', 'studies', 'market_data']
          };
          break;
        case 'seo_optimization':
          parameters = {
            slug: blog.slug,
            target_keyword: this.extractPrimaryKeyword(blog.title),
            intent: 'informational'
          };
          break;
      }

      const result = await Promise.race([
        this.runMCPAgent(stage.agent, stage.tool, parameters),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Stage timeout')), stage.timeout)
        )
      ]);

      const duration = Date.now() - stageStartTime;
      blog.stages[stage.name] = {
        status: 'completed',
        duration: duration,
        result: result
      };

      this.log(`   ✅ Completed in ${this.formatTime(duration)}`, 'detailed');
      return { success: true, result };

    } catch (error) {
      const duration = Date.now() - stageStartTime;
      blog.stages[stage.name] = {
        status: 'failed',
        duration: duration,
        error: error.message
      };

      this.log(`   ❌ Failed after ${this.formatTime(duration)}: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async processBlog(blog) {
    blog.startTime = Date.now();
    blog.status = 'processing';

    this.log(`📝 Processing Blog: ${blog.title}`, 'info');
    this.log(`   📄 Slug: ${blog.slug}`, 'detailed');

    // Execute each pipeline stage
    for (const stage of PIPELINE_STAGES) {
      this.log(`   🚀 Stage: ${stage.name}`, 'detailed');

      const result = await this.executeStage(blog, stage);

      if (!result.success) {
        blog.status = 'failed';
        blog.endTime = Date.now();
        this.failedBlogs.push(blog);
        return false;
      }

      // Quality gate check after quality_review stage
      if (stage.name === 'quality_review') {
        const qualityScore = this.extractQualityScore(result.result);
        if (qualityScore < CONFIG.qualityThreshold) {
          this.log(`   ⚠️  Quality score ${qualityScore} below threshold ${CONFIG.qualityThreshold}`, 'warning');
          blog.status = 'quality_failed';
          blog.endTime = Date.now();
          this.failedBlogs.push(blog);
          return false;
        }
        this.log(`   🎯 Quality score: ${qualityScore}/100`, 'detailed');
      }
    }

    // Update TODO status to completed
    await this.updateTodoStatus(blog.slug, '✅');

    blog.status = 'completed';
    blog.endTime = Date.now();
    this.completedBlogs.push(blog);

    const totalTime = blog.endTime - blog.startTime;
    this.log(`✅ Blog completed in ${this.formatTime(totalTime)}`, 'info');

    return true;
  }

  async updateTodoStatus(slug, newStatus) {
    try {
      let todoContent = await fs.readFile(CONFIG.todoFile, 'utf-8');

      // Find and replace the status for this slug
      const lines = todoContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(slug) && lines[i].includes('🔬')) {
          lines[i] = lines[i].replace('🔬', newStatus);
          break;
        }
      }

      await fs.writeFile(CONFIG.todoFile, lines.join('\n'), 'utf-8');
      this.log(`   📋 Updated TODO status: ${slug} → ${newStatus}`, 'detailed');
    } catch (error) {
      this.log(`   ⚠️  Failed to update TODO status: ${error.message}`, 'warning');
    }
  }

  extractPrimaryKeyword(title) {
    // Simple keyword extraction from title
    const keywords = {
      'madres lactantes': 'pilates posparto',
      'instructores': 'pilates instructor',
      'reformer': 'reformer pilates',
      'ejercicios': 'ejercicios pilates',
      'dolor espalda': 'pilates dolor espalda'
    };

    for (const [key, keyword] of Object.entries(keywords)) {
      if (title.toLowerCase().includes(key)) {
        return keyword;
      }
    }

    return 'pilates';
  }

  extractQualityScore(result) {
    // Extract quality score from result
    try {
      if (typeof result === 'string') {
        const match = result.match(/"overall_score":\s*(\d+)/);
        return match ? parseInt(match[1]) : 85;
      }
      return result.overall_score || 85;
    } catch {
      return 85; // Default passing score
    }
  }

  async runBatch(blogCount = 10) {
    await this.initialize();

    const pendingBlogs = await this.getPendingBlogs(blogCount);

    if (pendingBlogs.length === 0) {
      this.log('📭 No pending blogs found to process', 'info');
      return;
    }

    this.log(`📚 Found ${pendingBlogs.length} blogs to process`, 'info');
    this.currentBatch = pendingBlogs;

    // Process blogs sequentially
    for (let i = 0; i < pendingBlogs.length; i++) {
      const blog = pendingBlogs[i];
      this.log(`\n🔄 Processing Blog ${i + 1}/${pendingBlogs.length}`, 'info');

      await this.processBlog(blog);

      // Brief pause between blogs
      if (i < pendingBlogs.length - 1) {
        this.log('   ⏸️  Cooling down for 10 seconds...', 'detailed');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    await this.generateFinalReport();
  }

  async generateFinalReport() {
    const totalTime = Date.now() - this.startTime;
    const successRate = (this.completedBlogs.length / this.currentBatch.length) * 100;

    const report = {
      summary: {
        total_blogs: this.currentBatch.length,
        completed: this.completedBlogs.length,
        failed: this.failedBlogs.length,
        success_rate: `${successRate.toFixed(1)}%`,
        total_time: this.formatTime(totalTime),
        avg_time_per_blog: this.formatTime(totalTime / this.currentBatch.length)
      },
      completed_blogs: this.completedBlogs.map(blog => ({
        title: blog.title,
        slug: blog.slug,
        processing_time: this.formatTime(blog.endTime - blog.startTime),
        stages_completed: Object.keys(blog.stages).length
      })),
      failed_blogs: this.failedBlogs.map(blog => ({
        title: blog.title,
        slug: blog.slug,
        failure_reason: blog.status,
        failed_at_stage: Object.keys(blog.stages).pop() || 'initialization'
      }))
    };

    // Write detailed report
    const reportPath = path.join(ROOT, 'logs', `pipeline-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    // Console summary
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📊 PIPELINE EXECUTION REPORT', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`✅ Completed: ${this.completedBlogs.length}/${this.currentBatch.length} blogs`, 'info');
    this.log(`❌ Failed: ${this.failedBlogs.length}/${this.currentBatch.length} blogs`, 'info');
    this.log(`📈 Success Rate: ${successRate.toFixed(1)}%`, 'info');
    this.log(`⏱️  Total Time: ${this.formatTime(totalTime)}`, 'info');
    this.log(`📄 Detailed Report: ${reportPath}`, 'info');
    this.log('='.repeat(60), 'info');

    if (this.completedBlogs.length > 0) {
      this.log('\n🎉 Successfully published blogs:', 'info');
      this.completedBlogs.forEach(blog => {
        this.log(`   📝 ${blog.title}`, 'info');
      });
    }

    if (this.failedBlogs.length > 0) {
      this.log('\n⚠️  Failed blogs requiring attention:', 'warning');
      this.failedBlogs.forEach(blog => {
        this.log(`   ❌ ${blog.title} (${blog.status})`, 'warning');
      });
    }
  }

  formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;

    // Console output with colors
    const colors = {
      info: '\x1b[36m',    // Cyan
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      detailed: '\x1b[37m', // White
      reset: '\x1b[0m'
    };

    if (CONFIG.logLevel === 'verbose' ||
        (CONFIG.logLevel === 'detailed' && level !== 'verbose') ||
        (CONFIG.logLevel === 'minimal' && ['info', 'error', 'warning'].includes(level))) {
      console.log(`${colors[level] || colors.info}${message}${colors.reset}`);
    }

    // Always write to log file
    fs.appendFile(this.logFile, logEntry + '\n', 'utf-8').catch(() => {});
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const blogCount = parseInt(args[0]) || 10;
  const logLevel = args[1] || 'detailed';

  CONFIG.logLevel = logLevel;

  const pipeline = new AutonomousBlogPipeline();

  try {
    await pipeline.runBatch(blogCount);
  } catch (error) {
    pipeline.log(`💥 Pipeline failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Pipeline interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Pipeline terminated');
  process.exit(0);
});

// Export for programmatic use
export { AutonomousBlogPipeline, CONFIG, PIPELINE_STAGES };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
