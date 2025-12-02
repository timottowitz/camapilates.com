import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
    console.error("Error: VITE_CONVEX_URL is not defined in .env.local");
    process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Path to blog directory
const BLOG_DIR = path.resolve(__dirname, '../src/content/blog');

async function migrate() {
    console.log(`🚀 Starting migration from ${BLOG_DIR} to Convex...`);
    console.log(`Target: ${CONVEX_URL}`);

    if (!fs.existsSync(BLOG_DIR)) {
        console.error(`Error: Blog directory not found at ${BLOG_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} markdown files.`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const slug = file.replace('.md', '');
        const filePath = path.join(BLOG_DIR, file);

        try {
            const rawContent = fs.readFileSync(filePath, 'utf-8');

            // Fix potential BOM or whitespace issues
            const sanitized = rawContent
                .replace(/^\uFEFF/, '')
                .replace(/^\s*\n(?=---)/, '');

            const { data, content } = matter(sanitized);

            // Normalize data
            const blogData = {
                slug: (data.slug || slug).toLowerCase(),
                title: data.title || slug,
                content: content, // The markdown string
                excerpt: data.description || data.excerpt || '',
                category: data.category || 'General',
                tags: Array.isArray(data.tags) ? data.tags : [],
                author: data.author || 'CAMA Pilates',
                publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString(),
                heroImage: data.heroImage,
                featured: Boolean(data.featured),
                status: 'published', // Default to published for existing files
                canonical: data.canonical,
                noindex: Boolean(data.noindex),
            };

            // Push to Convex
            // We use the internal mutation name usually, but here we need to use the API path
            // Since we are running this via node, we can't use the generated API types easily without more setup
            // So we'll use the generic mutation call

            console.log(`Importing: ${blogData.title} (${blogData.slug})...`);

            // Check if exists first to avoid duplicates (or just upsert logic in mutation)
            // Our mutation 'create' throws if exists, 'update' updates.
            // Let's try to 'create', if fails, 'update'.

            try {
                await client.mutation("blogs:create", blogData);
                console.log(`  ✅ Created`);
            } catch (e) {
                if (e.message && e.message.includes('already exists')) {
                    console.log(`  ⚠️  Exists, updating...`);
                    await client.mutation("blogs:update", blogData);
                    console.log(`  ✅ Updated`);
                } else {
                    throw e;
                }
            }

            successCount++;
        } catch (err) {
            console.error(`  ❌ Failed to import ${file}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\nMigration Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

migrate().catch(console.error);
