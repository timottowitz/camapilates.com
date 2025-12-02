import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const TEXT_MODEL = 'gemini-3-pro-preview';

async function test() {
    // Test Text
    console.log(`Testing text with ${TEXT_MODEL}...`);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const body = { contents: [{ parts: [{ text: "Hi" }] }] };
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!resp.ok) throw new Error(resp.statusText);
        console.log('✅ Text OK');
    } catch (e) { console.error('❌ Text Failed:', e.message); }

    // Test Image
    console.log(`Testing image with ${IMAGE_MODEL}...`);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const body = { contents: [{ parts: [{ text: "Draw a cat" }] }] };
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await resp.json();
        if (data.candidates && data.candidates[0].content.parts) {
            const parts = data.candidates[0].content.parts;
            console.log('✅ Image Parts Count:', parts.length);
            parts.forEach((p, i) => {
                console.log(`Part ${i} keys:`, Object.keys(p));
                if (p.inlineData) {
                    console.log(`Part ${i} inlineData mimeType:`, p.inlineData.mimeType);
                    console.log(`Part ${i} inlineData data length:`, p.inlineData.data.length);
                }
            });
        } else {
            console.log('❌ Unexpected Image Response:', JSON.stringify(data, null, 2));
        }
    } catch (e) { console.error('❌ Image Failed:', e.message); }
}

test();
