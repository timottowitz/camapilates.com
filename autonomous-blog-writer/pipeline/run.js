#!/usr/bin/env node

/**
 * Autonomous Blog Writer - Main Entry Point
 * Portable blog content generation system
 */

import CONFIG, { validateConfig } from '../config.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PRESETS = {
  quick: {
    count: 3,
    description: "Process 3 blogs quickly for testing"
  },
  standard: {
    count: 5,
    description: "Standard batch of 5 blogs"
  },
  full: {
    count: 10,
    description: "Full batch of 10 blogs"
  },
  preview: {
    count: 1,
    description: "Preview single blog (outline only, no API cost)"
  }
};

function showUsage() {
  console.log(`
🤖 ${CONFIG.BRAND_NAME} Autonomous Blog Writer

Usage:
  node pipeline/run.js [preset|count] [log_level]
  npm run [quick|standard|full|test]

Presets:
  quick      - Process 3 blogs
  standard   - Process 5 blogs
  full       - Process 10 blogs
  preview    - Preview outline only (no generation)

Custom Count:
  [number]   - Process specific number of blogs

Log Levels:
  minimal    - Only important messages
  detailed   - Default, shows progress (recommended)
  verbose    - Show everything

Examples:
  npm run quick
  npm run standard
  npm run test                    # Process 1 blog with detailed logging
  node pipeline/run.js 7 minimal

🎯 Pipeline Flow:
  1. Topic Discovery (Dashboard) → Research files created
  2. Web Research → Market data added
  3. Content Generation → LLM writes blog (4 passes)
  4. Quality Review → Validation & scoring
  5. Output → ${path.relative(CONFIG.PROJECT_ROOT, CONFIG.BLOG_OUTPUT_DIR)}

⏱️  Processing time: ~5-6 minutes per blog
💰 Cost: ~$0.024 USD per blog (GPT-4o + GPT-4o-mini)
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  // Validate configuration first
  if (!validateConfig()) {
    process.exit(1);
  }

  let blogCount = 1;
  let logLevel = CONFIG.LOG_LEVEL;
  let previewMode = false;

  // Parse arguments
  if (args[0]) {
    if (PRESETS[args[0]]) {
      const preset = PRESETS[args[0]];
      blogCount = preset.count;
      previewMode = args[0] === 'preview';
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

  // Show configuration
  console.log(`
🚀 Starting Blog Writer
📊 Blogs to process: ${blogCount}
📋 Log level: ${logLevel}
🌍 Language: ${CONFIG.LANGUAGE}
🎯 Markets: ${CONFIG.MARKETS.join(', ')}
📝 Word target: ${CONFIG.WORD_TARGET}
🔧 Model: ${CONFIG.OPENAI_MODEL} (main), ${CONFIG.OPENAI_MODEL_FAST} (fast)
${previewMode ? '👁️  PREVIEW MODE (no generation, no cost)\n' : ''}
⏱️  Estimated time: ${blogCount * 6} minutes
💰 Estimated cost: $${(blogCount * 0.024).toFixed(2)} USD
`);

  if (previewMode) {
    console.log('📋 Running in preview mode - will generate outlines only\n');
    // TODO: Implement preview mode using preview_outline tool
    console.log('⚠️  Preview mode not yet implemented');
    return;
  }

  // Delegate to the existing pipeline script for now
  // TODO: Refactor to use portable pipeline
  const pipelineScript = path.resolve(CONFIG.PROJECT_ROOT, 'scripts', 'run-batch-blogs.js');

  console.log('⚠️  Using existing project pipeline (refactor in progress)...\n');

  const child = spawn('node', [pipelineScript, blogCount.toString(), logLevel], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...Object.fromEntries(
        Object.entries(CONFIG)
          .filter(([_, v]) => typeof v === 'string' || typeof v === 'number')
          .map(([k, v]) => [k, String(v)])
      )
    }
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}

main().catch(console.error);
