import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!key) {
    console.error('No API key found');
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Failed: ${resp.status} ${await resp.text()}`);
        }
        const data = await resp.json();
        console.log('Available Models:');
        data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (e) {
        console.error(e);
    }
}

listModels();
