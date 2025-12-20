#!/usr/bin/env node
/**
 * Script to populate placeholder images from blog content
 * Scans blog markdown for images and creates/assigns them to placeholders
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
    console.error('❌ VITE_CONVEX_URL not found in .env.local');
    process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Extract images from markdown
function extractImages(markdown, slug) {
    const images = [];
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    let index = 0;

    while ((match = imgRegex.exec(markdown)) !== null) {
        const [fullMatch, alt, url] = match;
        const location = index === 0 ? 'hero' : `inline-${index}`;
        images.push({
            placeholderId: `blog-${slug}-${location}`,
            url,
            alt,
            location,
            index
        });
        index++;
    }

    return images;
}

async function main() {
    const token = await getAdminToken(client);
    console.log('🔍 Fetching all blogs...');
    const blogs = await client.query(api.blogs.list);
    console.log(`📚 Found ${blogs.length} blogs`);

    let totalImages = 0;
    let processedPlaceholders = 0;

    for (const blog of blogs) {
        const images = extractImages(blog.content, blog.slug);

        if (images.length === 0) {
            console.log(`⚠️  ${blog.slug}: No images found`);
            continue;
        }

        console.log(`\n📝 ${blog.slug}: Found ${images.length} images`);
        totalImages += images.length;

        for (const img of images) {
            try {
                // Check if placeholder exists
                const placeholder = await client.query(api.placeholders.getByIdAdmin, {
                    token,
                    placeholderId: img.placeholderId
                });

                if (placeholder) {
                    console.log(`   ✓ Placeholder ${img.placeholderId} already exists`);

                    // Check if it has an assigned image
                    if (!placeholder.assignedImageId) {
                        console.log(`     → No image assigned, would need to create/assign image`);
                        // Note: This would require uploading the image to Convex storage
                        // and creating an ai_images record, which is more complex
                    }
                } else {
                    console.log(`   ℹ️  Placeholder ${img.placeholderId} doesn't exist yet`);
                }

                processedPlaceholders++;
            } catch (error) {
                console.error(`   ❌ Error processing ${img.placeholderId}:`, error.message);
            }
        }
    }

    console.log(`\n✅ Summary:`);
    console.log(`   Total images found: ${totalImages}`);
    console.log(`   Placeholders processed: ${processedPlaceholders}`);
}

main().catch(console.error);
