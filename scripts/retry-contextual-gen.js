
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
    const token = await getAdminToken(client);
    const placeholderId = "blog-reformer-vs-tower-context-1";
    console.log(`Retrying generation for: ${placeholderId}`);

    try {
        await client.action(api.placeholderGeneration.queue, { token, placeholderId });
        console.log('Queued successfully.');
    } catch (error) {
        console.error('Error queuing generation:', error);
    }
}

main();
