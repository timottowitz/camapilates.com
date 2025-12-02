
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { api } from '../convex/_generated/api.js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
    const placeholderIds = [
        "blog-reformer-vs-tower-context-1",
        "blog-reformer-vs-tower-context-2",
        "blog-reformer-vs-tower-context-3"
    ];

    console.log('Checking placeholder status...');

    for (const id of placeholderIds) {
        const p = await client.query(api.placeholders.getById, { placeholderId: id });
        if (p) {
            console.log(`ID: ${id}`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Prompt: ${p.generatedPrompt ? 'YES' : 'NO'}`);
            console.log(`  Image Assigned: ${p.assignedImageId ? 'YES' : 'NO'}`);
            console.log(`  Image URL: ${p.imageUrl || 'N/A'}`);
            console.log(`  Error: ${p.generationError || 'None'}`);
            console.log('---');
        } else {
            console.log(`ID: ${id} - Not Found`);
        }
    }
}

main();
