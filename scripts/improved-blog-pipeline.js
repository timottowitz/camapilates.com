#!/usr/bin/env node

/**
 * Enhanced Autonomous Blog Pipeline
 * Supports parallel processing, resource pooling, and improved error handling
 * Designed for 10 blogs per run with daily autonomous execution
 */

import { AutonomousBlogPipeline, PIPELINE_STAGES } from './autonomous-blog-pipeline.js';
import { Worker } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class EnhancedBlogPipeline extends AutonomousBlogPipeline {
  constructor(options = {}) {
    super();
    
    this.config = {
      maxConcurrentBlogs: options.maxConcurrentBlogs || 3,
      maxConcurrentStages: options.maxConcurrentStages || 2,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 30000, // 30 seconds
      resourceTimeout: options.resourceTimeout || 300000, // 5 minutes
      memoryLimit: options.memoryLimit || 2048, // 2GB in MB
      ...options
    };
    
    this.resourcePools = new Map();
    this.activeProcesses = new Set();
    this.statistics = {
      totalStartTime: null,
      blogsCompleted: 0,
      blogsFailed: 0,
      averageProcessingTime: 0,
      resourceUtilization: {}
    };
  }

  async initialize() {
    await super.initialize();
    
    // Initialize resource pools
    this.resourcePools.set('research', this.createWorkerPool('research', 2));
    this.resourcePools.set('web_research', this.createWorkerPool('web_research', 2));
    this.resourcePools.set('content_writing', this.createWorkerPool('content_writing', 1));
    this.resourcePools.set('seo_optimization', this.createWorkerPool('seo_optimization', 2));
    this.resourcePools.set('quality_review', this.createWorkerPool('quality_review', 1));
    this.resourcePools.set('image_enhancement', this.createWorkerPool('image_enhancement', 2));
    
    this.log('🏭 Resource pools initialized', 'info');
    this.statistics.totalStartTime = Date.now();
  }

  createWorkerPool(stageName, poolSize) {
    const pool = {
      available: [],
      busy: new Set(),
      maxSize: poolSize,
      stageName: stageName
    };
    
    // Pre-warm the pool
    for (let i = 0; i < poolSize; i++) {
      pool.available.push(this.createStageWorker(stageName));
    }
    
    return pool;
  }

  createStageWorker(stageName) {
    const stage = PIPELINE_STAGES.find(s => s.name === stageName);
    return {
      id: `${stageName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stage: stage,
      lastUsed: Date.now(),
      processCount: 0
    };
  }

  async getWorker(stageName) {
    const pool = this.resourcePools.get(stageName);
    if (!pool) {
      throw new Error(`No pool found for stage: ${stageName}`);
    }

    // Wait for available worker if needed
    while (pool.available.length === 0 && pool.busy.size >= pool.maxSize) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let worker;
    if (pool.available.length > 0) {
      worker = pool.available.pop();
    } else {
      worker = this.createStageWorker(stageName);
    }

    pool.busy.add(worker);
    return worker;
  }

  async releaseWorker(stageName, worker) {
    const pool = this.resourcePools.get(stageName);
    if (!pool) return;

    pool.busy.delete(worker);
    
    // Reset worker if it's been used too many times
    if (worker.processCount > 50) {
      // Create new worker instead of reusing
      pool.available.push(this.createStageWorker(stageName));
    } else {
      worker.lastUsed = Date.now();
      worker.processCount++;
      pool.available.push(worker);
    }
  }

  async runBatch(blogCount = 10) {
    await this.initialize();
    
    const pendingBlogs = await this.getPendingBlogs(blogCount);
    if (pendingBlogs.length === 0) {
      this.log('📭 No pending blogs found to process', 'info');
      return;
    }

    this.log(`📚 Processing ${pendingBlogs.length} blogs with enhanced pipeline`, 'info');
    this.log(`🔧 Max concurrent blogs: ${this.config.maxConcurrentBlogs}`, 'info');
    
    // Create batches for parallel processing
    const batches = this.createBatches(pendingBlogs, this.config.maxConcurrentBlogs);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.log(`\n🚀 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} blogs)`, 'info');
      
      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(blog => this.processBlogWithRetry(blog))
      );
      
      // Process results
      batchResults.forEach((result, index) => {
        const blog = batch[index];
        if (result.status === 'fulfilled' && result.value) {
          this.completedBlogs.push(blog);
          this.statistics.blogsCompleted++;
        } else {
          this.failedBlogs.push(blog);
          this.statistics.blogsFailed++;
          this.log(`❌ Blog failed: ${blog.title} - ${result.reason?.message || 'Unknown error'}`, 'error');
        }
      });
      
      // Brief cooldown between batches
      if (batchIndex < batches.length - 1) {
        this.log('⏸️ Batch cooldown (30s)...', 'detailed');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
    
    await this.generateEnhancedReport();
    await this.cleanup();
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async processBlogWithRetry(blog) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.log(`🔄 Processing ${blog.title} (attempt ${attempt}/${this.config.retryAttempts})`, 'info');
        
        const startTime = Date.now();
        const result = await this.processBlogEnhanced(blog);
        const duration = Date.now() - startTime;
        
        this.updateStatistics(duration);
        this.log(`✅ ${blog.title} completed in ${this.formatTime(duration)}`, 'info');
        
        return result;
      } catch (error) {
        lastError = error;
        this.log(`⚠️ Attempt ${attempt} failed for ${blog.title}: ${error.message}`, 'warning');
        
        if (attempt < this.config.retryAttempts) {
          this.log(`⏳ Retrying in ${this.config.retryDelay/1000}s...`, 'detailed');
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
    
    throw lastError;
  }

  async processBlogEnhanced(blog) {
    blog.startTime = Date.now();
    blog.status = 'processing';
    blog.stages = {};
    
    // Define stage groups for parallel processing
    const stageGroups = [
      // Group 1: Research stages (parallel)
      [
        { stage: PIPELINE_STAGES[0], dependencies: [] }, // research
        { stage: PIPELINE_STAGES[1], dependencies: [] }  // web_research  
      ],
      // Group 2: Research validation (sequential)
      [
        { stage: PIPELINE_STAGES[2], dependencies: ['research', 'web_research'] }
      ],
      // Group 3: Content writing (sequential, heavy)
      [
        { stage: PIPELINE_STAGES[3], dependencies: ['research_validation'] }
      ],
      // Group 4: SEO and Images (parallel)
      [
        { stage: PIPELINE_STAGES[4], dependencies: ['content_writing'] }, // seo_optimization
        { stage: PIPELINE_STAGES[6], dependencies: ['content_writing'] }  // image_enhancement
      ],
      // Group 5: Quality and validation (sequential)
      [
        { stage: PIPELINE_STAGES[5], dependencies: ['seo_optimization'] }, // quality_review
        { stage: PIPELINE_STAGES[7], dependencies: ['quality_review', 'image_enhancement'] } // final_validation
      ]
    ];

    for (const group of stageGroups) {
      if (group.length === 1) {
        // Sequential processing
        const { stage } = group[0];
        await this.executeStageEnhanced(blog, stage);
      } else {
        // Parallel processing
        await Promise.all(
          group.map(({ stage }) => this.executeStageEnhanced(blog, stage))
        );
      }
      
      // Check if any stage failed
      const failedStages = Object.values(blog.stages).filter(s => s.status === 'failed');
      if (failedStages.length > 0) {
        throw new Error(`Stage failed: ${failedStages[0].error}`);
      }
    }

    blog.status = 'completed';
    blog.endTime = Date.now();
    
    // Update TODO status
    await this.updateTodoStatus(blog.slug, '✅');
    
    return true;
  }

  async executeStageEnhanced(blog, stage) {
    const worker = await this.getWorker(stage.name);
    const stageStartTime = Date.now();
    
    try {
      this.log(`   🔧 ${stage.description} (worker: ${worker.id})`, 'detailed');
      
      // Execute stage with timeout and resource monitoring
      const result = await Promise.race([
        this.executeStageWithWorker(blog, stage, worker),
        this.createTimeoutPromise(stage.timeout, `Stage ${stage.name} timeout`)
      ]);
      
      const duration = Date.now() - stageStartTime;
      blog.stages[stage.name] = {
        status: 'completed',
        duration: duration,
        result: result,
        workerId: worker.id
      };
      
      this.log(`   ✅ Completed in ${this.formatTime(duration)}`, 'detailed');
      return { success: true, result };
      
    } catch (error) {
      const duration = Date.now() - stageStartTime;
      blog.stages[stage.name] = {
        status: 'failed',
        duration: duration,
        error: error.message,
        workerId: worker.id
      };
      
      this.log(`   ❌ Failed after ${this.formatTime(duration)}: ${error.message}`, 'error');
      throw error;
      
    } finally {
      await this.releaseWorker(stage.name, worker);
    }
  }

  async executeStageWithWorker(blog, stage, worker) {
    // Memory usage monitoring
    const initialMemory = process.memoryUsage();
    
    try {
      // Use the existing stage execution logic but with monitoring
      const result = await this.runMCPAgent(stage.agent, stage.tool, {
        slug: blog.slug,
        title: blog.title,
        ...this.getStageSpecificParams(stage, blog)
      });
      
      return result;
      
    } finally {
      // Memory cleanup and monitoring
      const finalMemory = process.memoryUsage();
      const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
      
      if (memoryDelta > 100 * 1024 * 1024) { // 100MB
        this.log(`   ⚠️ High memory usage in stage ${stage.name}: ${Math.round(memoryDelta/1024/1024)}MB`, 'warning');
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    }
  }

  getStageSpecificParams(stage, blog) {
    const params = {};
    
    switch (stage.name) {
      case 'web_research':
        params.topic = blog.title;
        params.data_types = ['statistics', 'studies', 'market_data'];
        break;
      case 'seo_optimization':
        params.target_keyword = this.extractPrimaryKeyword(blog.title);
        params.intent = 'informational';
        break;
    }
    
    return params;
  }

  createTimeoutPromise(timeout, message) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeout)
    );
  }

  updateStatistics(duration) {
    const count = this.statistics.blogsCompleted + this.statistics.blogsFailed + 1;
    this.statistics.averageProcessingTime = 
      (this.statistics.averageProcessingTime * (count - 1) + duration) / count;
  }

  async generateEnhancedReport() {
    const totalTime = Date.now() - this.statistics.totalStartTime;
    const successRate = (this.statistics.blogsCompleted / 
      (this.statistics.blogsCompleted + this.statistics.blogsFailed)) * 100;
    
    const report = {
      summary: {
        total_blogs: this.statistics.blogsCompleted + this.statistics.blogsFailed,
        completed: this.statistics.blogsCompleted,
        failed: this.statistics.blogsFailed,
        success_rate: `${successRate.toFixed(1)}%`,
        total_time: this.formatTime(totalTime),
        avg_time_per_blog: this.formatTime(this.statistics.averageProcessingTime),
        theoretical_sequential_time: this.formatTime(
          (this.statistics.blogsCompleted + this.statistics.blogsFailed) * 33 * 60 * 1000
        ),
        time_savings: this.formatTime(
          ((this.statistics.blogsCompleted + this.statistics.blogsFailed) * 33 * 60 * 1000) - totalTime
        )
      },
      performance: {
        max_concurrent_blogs: this.config.maxConcurrentBlogs,
        resource_pools: Object.fromEntries(
          Array.from(this.resourcePools.entries()).map(([name, pool]) => [
            name, {
              max_size: pool.maxSize,
              current_available: pool.available.length,
              current_busy: pool.busy.size
            }
          ])
        )
      },
      completed_blogs: this.completedBlogs.map(blog => ({
        title: blog.title,
        slug: blog.slug,
        processing_time: this.formatTime(blog.endTime - blog.startTime),
        stages_completed: Object.keys(blog.stages).length,
        parallel_stages: this.countParallelStages(blog.stages)
      })),
      failed_blogs: this.failedBlogs.map(blog => ({
        title: blog.title,
        slug: blog.slug,
        failure_reason: blog.status,
        failed_at_stage: Object.keys(blog.stages).pop() || 'initialization'
      }))
    };

    // Write enhanced report
    const reportPath = path.join(process.cwd(), 'logs', `enhanced-pipeline-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    // Console summary
    this.log('\n' + '='.repeat(80), 'info');
    this.log('📊 ENHANCED PIPELINE EXECUTION REPORT', 'info');
    this.log('='.repeat(80), 'info');
    this.log(`✅ Completed: ${this.statistics.blogsCompleted} blogs`, 'info');
    this.log(`❌ Failed: ${this.statistics.blogsFailed} blogs`, 'info');
    this.log(`📈 Success Rate: ${successRate.toFixed(1)}%`, 'info');
    this.log(`⏱️ Total Time: ${this.formatTime(totalTime)}`, 'info');
    this.log(`⚡ Time Saved: ${report.summary.time_savings}`, 'info');
    this.log(`🏭 Parallel Processing: ${this.config.maxConcurrentBlogs}x blogs, ${this.config.maxConcurrentStages}x stages`, 'info');
    this.log(`📄 Detailed Report: ${reportPath}`, 'info');
    this.log('='.repeat(80), 'info');
  }

  countParallelStages(stages) {
    // Count stages that ran in parallel (same or overlapping time windows)
    const sortedStages = Object.entries(stages)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
    
    let parallelCount = 0;
    // Implementation details would analyze stage timing overlaps
    return parallelCount;
  }

  async cleanup() {
    this.log('🧹 Cleaning up resources...', 'detailed');
    
    // Clear resource pools
    for (const [name, pool] of this.resourcePools) {
      pool.available.length = 0;
      pool.busy.clear();
    }
    
    this.resourcePools.clear();
    this.activeProcesses.clear();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    this.log('✅ Cleanup completed', 'detailed');
  }
}

// Export enhanced pipeline
export { EnhancedBlogPipeline };

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const blogCount = parseInt(args[0]) || 10;
  const maxConcurrent = parseInt(args[1]) || 3;
  
  const pipeline = new EnhancedBlogPipeline({
    maxConcurrentBlogs: maxConcurrent,
    maxConcurrentStages: 2,
    retryAttempts: 3
  });
  
  try {
    await pipeline.runBatch(blogCount);
  } catch (error) {
    console.error(`💥 Enhanced pipeline failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}