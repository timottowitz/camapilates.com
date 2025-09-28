#!/usr/bin/env node

/**
 * Scheduled Blog Runner
 * Runs the blog pipeline on a schedule (cron-like) for fully autonomous operation
 */

import { AutonomousBlogPipeline } from './autonomous-blog-pipeline.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class ScheduledBlogRunner {
  constructor() {
    this.isRunning = false;
    this.schedule = {
      // Run every 6 hours, process 2 blogs each time
      interval: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
      blogsPerRun: 2,
      maxDailyBlogs: 8, // Safety limit
      startHour: 9, // Start at 9 AM
      endHour: 21 // Stop at 9 PM
    };
    this.dailyCount = 0;
    this.lastResetDate = new Date().toDateString();
  }

  async start() {
    console.log(`
🤖 CAMA Pilates Scheduled Blog Runner Started

Schedule Configuration:
⏰ Interval: Every ${this.schedule.interval / (60 * 60 * 1000)} hours
📊 Blogs per run: ${this.schedule.blogsPerRun}
📈 Max daily blogs: ${this.schedule.maxDailyBlogs}
🌅 Active hours: ${this.schedule.startHour}:00 - ${this.schedule.endHour}:00

Press Ctrl+C to stop the scheduler
`);

    // Initial run
    await this.checkAndRun();

    // Set up recurring schedule
    setInterval(async () => {
      await this.checkAndRun();
    }, this.schedule.interval);
  }

  async checkAndRun() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toDateString();

    // Reset daily count if new day
    if (currentDate !== this.lastResetDate) {
      this.dailyCount = 0;
      this.lastResetDate = currentDate;
      console.log(`📅 New day: Reset daily blog count`);
    }

    // Check if within operating hours
    if (currentHour < this.schedule.startHour || currentHour >= this.schedule.endHour) {
      console.log(`😴 Outside operating hours (${this.schedule.startHour}:00-${this.schedule.endHour}:00). Sleeping...`);
      return;
    }

    // Check daily limit
    if (this.dailyCount >= this.schedule.maxDailyBlogs) {
      console.log(`📊 Daily limit reached (${this.schedule.maxDailyBlogs} blogs). Waiting for next day...`);
      return;
    }

    // Check if already running
    if (this.isRunning) {
      console.log(`⏳ Pipeline already running. Skipping this cycle...`);
      return;
    }

    // Check if there are pending blogs
    const pendingCount = await this.getPendingBlogCount();
    if (pendingCount === 0) {
      console.log(`📭 No pending blogs found. Waiting for new content...`);
      return;
    }

    // Run the pipeline
    await this.runPipeline();
  }

  async getPendingBlogCount() {
    try {
      const { default: path } = await import('path');
      const todoFile = path.join(process.cwd(), 'blog-planning', 'BLOG_TODO.md');
      const content = await fs.readFile(todoFile, 'utf-8');

      const pendingBlogs = content.split('\n').filter(line => line.includes('🔬'));
      return pendingBlogs.length;
    } catch (error) {
      console.log(`❌ Error checking pending blogs: ${error.message}`);
      return 0;
    }
  }

  async runPipeline() {
    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log(`\n🚀 Starting scheduled pipeline run at ${new Date().toLocaleString()}`);
      console.log(`📊 Processing ${this.schedule.blogsPerRun} blogs...`);

      const pipeline = new AutonomousBlogPipeline();

      // Configure for scheduled run
      const { CONFIG } = await import('./autonomous-blog-pipeline.js');
      CONFIG.logLevel = 'detailed';
      CONFIG.qualityThreshold = 85;

      await pipeline.runBatch(this.schedule.blogsPerRun);

      this.dailyCount += this.schedule.blogsPerRun;
      const duration = Date.now() - startTime;

      console.log(`✅ Scheduled run completed in ${this.formatTime(duration)}`);
      console.log(`📊 Daily progress: ${this.dailyCount}/${this.schedule.maxDailyBlogs} blogs`);

      // Send completion notification
      await this.sendNotification({
        type: 'success',
        message: `Pipeline completed: ${this.schedule.blogsPerRun} blogs processed`,
        duration: this.formatTime(duration),
        dailyCount: this.dailyCount
      });

    } catch (error) {
      console.error(`💥 Scheduled run failed: ${error.message}`);

      await this.sendNotification({
        type: 'error',
        message: `Pipeline failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isRunning = false;
    }
  }

  async sendNotification(data) {
    // Log to file
    const logFile = path.join(process.cwd(), 'logs', 'scheduler.log');
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;

    try {
      await fs.appendFile(logFile, logEntry, 'utf-8');
    } catch (error) {
      console.log(`⚠️  Failed to write to log: ${error.message}`);
    }

    // Could integrate with:
    // - Slack webhook
    // - Email notifications
    // - Discord bot
    // - Database logging

    console.log(`📢 Notification: ${data.message}`);
  }

  formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }

  async getSystemStatus() {
    const pendingBlogs = await this.getPendingBlogCount();

    return {
      isRunning: this.isRunning,
      dailyCount: this.dailyCount,
      maxDailyBlogs: this.schedule.maxDailyBlogs,
      pendingBlogs: pendingBlogs,
      nextRun: new Date(Date.now() + this.schedule.interval).toLocaleString(),
      status: pendingBlogs > 0 ? 'ready' : 'waiting_for_content'
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 CAMA Pilates Scheduled Blog Runner

Usage:
  node scripts/scheduled-blog-runner.js [command]

Commands:
  start              Start the scheduler (default)
  status             Show current status
  config [key=value] Update configuration

Configuration Options:
  interval=hours     Hours between runs (default: 6)
  blogsPerRun=count  Blogs per run (default: 2)
  maxDaily=count     Max blogs per day (default: 8)
  startHour=hour     Start hour (default: 9)
  endHour=hour       End hour (default: 21)

Examples:
  node scripts/scheduled-blog-runner.js start
  node scripts/scheduled-blog-runner.js status
  node scripts/scheduled-blog-runner.js config interval=4
  node scripts/scheduled-blog-runner.js config blogsPerRun=3
`);
    return;
  }

  const command = args[0] || 'start';
  const runner = new ScheduledBlogRunner();

  switch (command) {
    case 'start':
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Scheduler stopped by user');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Scheduler terminated');
        process.exit(0);
      });

      await runner.start();
      break;

    case 'status':
      const status = await runner.getSystemStatus();
      console.log('\n📊 System Status:');
      console.log(`   Running: ${status.isRunning ? '✅ Yes' : '❌ No'}`);
      console.log(`   Daily blogs: ${status.dailyCount}/${status.maxDailyBlogs}`);
      console.log(`   Pending blogs: ${status.pendingBlogs}`);
      console.log(`   Next run: ${status.nextRun}`);
      console.log(`   Status: ${status.status}`);
      break;

    case 'config':
      if (args[1]) {
        const [key, value] = args[1].split('=');
        console.log(`🔧 Configuration update: ${key} = ${value}`);
        console.log('⚠️  Restart scheduler to apply changes');
      } else {
        console.log('❌ Please provide configuration in format: key=value');
      }
      break;

    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Use --help for usage information');
  }
}

main().catch(console.error);