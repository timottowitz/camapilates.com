
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { api } from '../convex/_generated/api.js';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config({ path: path.resolve(process.cwd(), 'autonomous-blog-writer/.env') });
}

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!CONVEX_URL) {
    console.error('Error: CONVEX_URL is not defined.');
    process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

let cachedToken = null;
async function getAdminToken() {
  if (cachedToken) return cachedToken;
  const direct = process.env.ADMIN_TOKEN || process.env.CAMA_ADMIN_TOKEN;
  if (direct) {
    cachedToken = direct;
    return direct;
  }
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  if (username && password) {
    const res = await client.mutation(api.admin.login, { username, password });
    if (res?.ok && res?.token) {
      cachedToken = res.token;
      return res.token;
    }
  }
  throw new Error('Missing admin auth: set ADMIN_TOKEN (or CAMA_ADMIN_TOKEN) or ADMIN_USER + ADMIN_PASS');
}

async function main() {
    const slug = 'reformer-vs-tower';
    const blogPath = path.resolve(process.cwd(), 'src/content/blog', `${slug}.md`);

    if (!fs.existsSync(blogPath)) {
        console.error(`Blog file not found: ${blogPath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(blogPath, 'utf-8');
    console.log(`Analyzing blog: ${slug}...`);

    try {
        const token = await getAdminToken();
        // We use the string path because the type might not be updated yet in the local environment
        const result = await client.action(api.contextualGeneration.analyzeBlogContent, {
            token,
            slug,
            content,
        });

        console.log('Analysis result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error calling analyzeBlogContent:', error);
    }
}

main();
