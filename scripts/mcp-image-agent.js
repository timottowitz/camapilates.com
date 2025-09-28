#!/usr/bin/env node

/**
 * MCP Server for Blog Image Agent
 * Provides tools to enrich blog posts with images from Unsplash
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'blog-image-agent',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'enrich_all_blogs',
      description: 'Add hero and contextual images to all blog posts',
      inputSchema: {
        type: 'object',
        properties: {
          force: {
            type: 'boolean',
            description: 'Force refresh of existing images',
            default: false
          }
        }
      }
    },
    {
      name: 'enrich_specific_blogs',
      description: 'Add images to specific blog posts by slug',
      inputSchema: {
        type: 'object',
        properties: {
          slugs: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of blog slugs to process'
          },
          force: {
            type: 'boolean',
            description: 'Force refresh of existing images',
            default: false
          }
        },
        required: ['slugs']
      }
    },
    {
      name: 'list_blog_posts',
      description: 'List all blog posts and their image status',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'enrich_all_blogs':
        return await enrichAllBlogs(args?.force);

      case 'enrich_specific_blogs':
        return await enrichSpecificBlogs(args?.slugs, args?.force);

      case 'list_blog_posts':
        return await listBlogPosts();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

async function enrichAllBlogs(force = false) {
  const cmd = force ? 'deno task images -- --force' : 'deno task images';

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: path.resolve(__dirname, '..')
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully enriched all blog posts with images.\n${stdout}\n${stderr}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to enrich blogs: ${error.message}`);
  }
}

async function enrichSpecificBlogs(slugs, force = false) {
  if (!slugs || slugs.length === 0) {
    throw new Error('No slugs provided');
  }

  const slugList = slugs.join(',');
  const cmd = force
    ? `deno task images -- --slug ${slugList} --force`
    : `deno task images -- --slug ${slugList}`;

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: path.resolve(__dirname, '..')
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully enriched blogs: ${slugList}\n${stdout}\n${stderr}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to enrich specific blogs: ${error.message}`);
  }
}

async function listBlogPosts() {
  const blogDir = path.resolve(__dirname, '..', 'src/content/blog');
  const imageDir = path.resolve(__dirname, '..', 'public/images/blog');

  try {
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const posts = [];
    for (const file of mdFiles) {
      const slug = file.replace('.md', '');
      const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
      const hasHeroImage = content.includes('heroImage:');

      // Check for actual image files
      let imageCount = 0;
      try {
        const imgPath = path.join(imageDir, slug);
        const images = await fs.readdir(imgPath);
        imageCount = images.filter(img => img.endsWith('.jpg') || img.endsWith('.png')).length;
      } catch {
        // Directory doesn't exist
      }

      posts.push({
        slug,
        hasHeroImage,
        imageCount,
        status: hasHeroImage ? '✅' : '❌'
      });
    }

    const summary = posts.map(p =>
      `${p.status} ${p.slug} (${p.imageCount} images${p.hasHeroImage ? ', has hero' : ''})`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Blog posts image status:\n\n${summary}\n\nTotal: ${posts.length} posts, ${posts.filter(p => p.hasHeroImage).length} with hero images`
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to list blog posts: ${error.message}`);
  }
}

// Error handling
server.onerror = (error) => console.error('[MCP Error]', error);

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Blog Image Agent MCP server running on stdio');
}

main().catch(console.error);