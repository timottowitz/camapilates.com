#!/usr/bin/env node

/**
 * Simple Batch Blog Runner
 * Easy-to-use interface for running the autonomous blog pipeline
 */

import { AutonomousBlogPipeline } from './autonomous-blog-pipeline.js';

const PRESETS = {
  quick: {
    count: 3,
    description: "Process 3 blogs quickly for testing",
    qualityThreshold: 80
  },
  standard: {
    count: 5,
    description: "Standard batch of 5 blogs",
    qualityThreshold: 85
  },
  full: {
    count: 10,
    description: "Full batch of 10 blogs",
    qualityThreshold: 85
  },
  production: {
    count: 20,
    description: "Large production batch",
    qualityThreshold: 90
  }
};

function showUsage() {
  console.log(`
🤖 CAMA Pilates Autonomous Blog Pipeline

Usage:
  node scripts/run-batch-blogs.js [preset|count] [log_level]

Presets:
  quick      - Process 3 blogs (quality: 80+)
  standard   - Process 5 blogs (quality: 85+)
  full       - Process 10 blogs (quality: 85+)
  production - Process 20 blogs (quality: 90+)

Custom Count:
  [number]   - Process specific number of blogs

Log Levels:
  minimal    - Only important messages
  detailed   - Default, shows progress (recommended)
  verbose    - Show everything

Examples:
  node scripts/run-batch-blogs.js quick
  node scripts/run-batch-blogs.js 7 minimal
  node scripts/run-batch-blogs.js standard verbose

🎯 Pipeline Stages (per blog):
  1. Research Creation (5min)
  2. Web Research (4min)
  3. Research Validation (2min)
  4. Content Writing (8min)
  5. SEO Optimization (3min)
  6. Quality Review (4min)
  7. Image Enhancement (5min)
  8. Final Validation (2min)

⏱️  Estimated time: ~33 minutes per blog
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  let blogCount = 5;
  let logLevel = 'detailed';
  let qualityThreshold = 85;

  // Parse arguments
  if (args[0]) {
    if (PRESETS[args[0]]) {
      const preset = PRESETS[args[0]];
      blogCount = preset.count;
      qualityThreshold = preset.qualityThreshold;
      console.log(`🎯 Using ${args[0]} preset: ${preset.description}`);
    } else if (!isNaN(parseInt(args[0]))) {
      blogCount = parseInt(args[0]);
    } else {
      console.log(`❌ Unknown preset: ${args[0]}`);
      showUsage();
      return;
    }
  }

  if (args[1]) {
    logLevel = args[1];
  }

  // Validate arguments
  if (blogCount < 1 || blogCount > 50) {
    console.log('❌ Blog count must be between 1 and 50');
    return;
  }

  if (!['minimal', 'detailed', 'verbose'].includes(logLevel)) {
    console.log('❌ Log level must be: minimal, detailed, or verbose');
    return;
  }

  // Show confirmation
  console.log(`
🚀 Starting Autonomous Blog Pipeline
📊 Blogs to process: ${blogCount}
📋 Log level: ${logLevel}
🎯 Quality threshold: ${qualityThreshold}%
⏱️  Estimated total time: ${Math.round(blogCount * 33)} minutes

Press Ctrl+C to cancel in the next 5 seconds...
`);

  // 5 second countdown
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`Starting in ${i}... `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\n');

  // Configure and run pipeline
  const { CONFIG } = await import('./autonomous-blog-pipeline.js');
  CONFIG.logLevel = logLevel;
  CONFIG.qualityThreshold = qualityThreshold;

  const pipeline = new AutonomousBlogPipeline();

  try {
    await pipeline.runBatch(blogCount);

    console.log('\n🎉 Pipeline completed successfully!');
    console.log('📂 Check logs/ directory for detailed reports');
    console.log('📝 Check src/content/blog/ for new blog posts');

  } catch (error) {
    console.error(`\n💥 Pipeline failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);