#!/usr/bin/env node

/**
 * Autonomous Blog Writer - Centralized Configuration
 *
 * This module loads configuration from .env and provides
 * a single source of truth for all settings.
 */

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { config } from 'dotenv';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the autonomous-blog-writer folder
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
  console.error(`✓ Loaded config from: ${envPath}`);
} else {
  console.error(`⚠️  No .env file found at: ${envPath}`);
  console.error(`   Copy .env.example to .env and add your API key`);
}

// Auto-detect project root (parent of autonomous-blog-writer folder)
const WRITER_DIR = __dirname;
const PROJECT_ROOT = process.env.PROJECT_ROOT || resolve(__dirname, '..');

/**
 * Configuration object
 * All paths are resolved relative to PROJECT_ROOT
 */
const DEFAULT_PROVIDER = process.env.LLM_PROVIDER
  || (process.env.OPENAI_API_KEY ? 'openai' : (process.env.GEMINI_API_KEY ? 'gemini' : 'openai'));

export const CONFIG = {
  // ============================================================================
  // Paths
  // ============================================================================
  WRITER_DIR,
  PROJECT_ROOT,

  BLOG_OUTPUT_DIR: resolve(PROJECT_ROOT, process.env.BLOG_OUTPUT_DIR || 'src/content/blog'),
  RESEARCH_DIR: resolve(PROJECT_ROOT, process.env.RESEARCH_DIR || 'blog-planning/research'),
  TODO_FILE: resolve(PROJECT_ROOT, process.env.TODO_FILE || 'blog-planning/BLOG_TODO.md'),
  LOGS_DIR: join(WRITER_DIR, 'logs'),

  // ============================================================================
  // LLM Providers
  // ============================================================================
  LLM_PROVIDER: DEFAULT_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  OPENAI_MODEL_FAST: process.env.OPENAI_MODEL_FAST || 'gpt-4o-mini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_MODEL_FAST: process.env.GEMINI_MODEL_FAST || 'gemini-1.5-flash',

  // ============================================================================
  // Content Generation
  // ============================================================================
  WORD_TARGET: parseInt(process.env.CONTENT_WORD_TARGET || '1800'),
  MIN_WORD_COUNT: parseInt(process.env.CONTENT_MIN_WORDS || '1200'),
  MAX_WORD_COUNT: parseInt(process.env.CONTENT_MAX_WORDS || '2500'),
  MIN_FAQS: parseInt(process.env.CONTENT_MIN_FAQS || '5'),
  MAX_FAQS: parseInt(process.env.CONTENT_MAX_FAQS || '8'),
  TEMPERATURE_CREATIVE: parseFloat(process.env.CONTENT_TEMPERATURE || '0.7'),
  TEMPERATURE_STRUCTURED: 0.3,

  // ============================================================================
  // Localization
  // ============================================================================
  LANGUAGE: process.env.CONTENT_LANGUAGE || 'es-MX',
  MARKETS: (process.env.CONTENT_MARKETS || 'CDMX,Guadalajara,Monterrey').split(',').map(s => s.trim()),
  CURRENCY: process.env.CONTENT_CURRENCY || 'MXN',

  // ============================================================================
  // Brand
  // ============================================================================
  BRAND_NAME: process.env.BRAND_NAME || 'CAMA Pilates',
  BRAND_DESCRIPTION: process.env.BRAND_DESCRIPTION || 'calidad premium con ingeniería alemana y manufactura mexicana',
  BLOG_AUTHOR: process.env.BLOG_AUTHOR || 'CAMA Pilates',

  // ============================================================================
  // Pipeline
  // ============================================================================
  MAX_CONCURRENT_BLOGS: parseInt(process.env.MAX_CONCURRENT_BLOGS || '1'),
  RETRY_ATTEMPTS: parseInt(process.env.LLM_RETRY_ATTEMPTS || '3'),
  QUALITY_THRESHOLD: parseInt(process.env.QUALITY_THRESHOLD || '85'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'detailed', // minimal|detailed|verbose

  // ============================================================================
  // Advanced
  // ============================================================================
  PARALLEL_SECTIONS: process.env.CONTENT_PARALLEL_SECTIONS === 'true',
  LLM_TIMEOUT: parseInt(process.env.LLM_TIMEOUT || '600000'), // 10 minutes

  // ============================================================================
  // Pipeline Stages
  // ============================================================================
  STAGES: [
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
      timeout: 600000 // 10 minutes
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
  ]
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors = [];

  if (CONFIG.LLM_PROVIDER === 'openai') {
    if (!CONFIG.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required when LLM_PROVIDER=openai');
    }
    if (CONFIG.OPENAI_API_KEY && !CONFIG.OPENAI_API_KEY.startsWith('sk-')) {
      errors.push('OPENAI_API_KEY appears invalid (should start with sk-)');
    }
  } else if (CONFIG.LLM_PROVIDER === 'gemini') {
    if (!CONFIG.GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY is required when LLM_PROVIDER=gemini');
    }
  } else {
    errors.push(`Unsupported LLM_PROVIDER: ${CONFIG.LLM_PROVIDER}`);
  }

  if (errors.length > 0) {
    console.error('\n❌ Configuration errors:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n📝 Update autonomous-blog-writer/.env with your API key\n');
    return false;
  }

  return true;
}

/**
 * Print configuration summary
 */
export function printConfig() {
  console.error('\n📋 Configuration Summary:');
  console.error(`   Project Root: ${CONFIG.PROJECT_ROOT}`);
  console.error(`   Blog Output: ${CONFIG.BLOG_OUTPUT_DIR}`);
  console.error(`   Research Dir: ${CONFIG.RESEARCH_DIR}`);
  if (CONFIG.LLM_PROVIDER === 'gemini') {
    console.error(`   Provider: Gemini`);
    console.error(`   Model (Main): ${CONFIG.GEMINI_MODEL}`);
    console.error(`   Model (Fast): ${CONFIG.GEMINI_MODEL_FAST}`);
  } else {
    console.error(`   Provider: OpenAI`);
    console.error(`   Model (Main): ${CONFIG.OPENAI_MODEL}`);
    console.error(`   Model (Fast): ${CONFIG.OPENAI_MODEL_FAST}`);
  }
  console.error(`   Word Target: ${CONFIG.WORD_TARGET}`);
  console.error(`   Language: ${CONFIG.LANGUAGE}`);
  console.error(`   Markets: ${CONFIG.MARKETS.join(', ')}`);
  console.error(`   Brand: ${CONFIG.BRAND_NAME}\n`);
}

export default CONFIG;
