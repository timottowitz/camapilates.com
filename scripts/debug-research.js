
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../autonomous-blog-writer/.env') });

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || (GEMINI_API_KEY ? 'gemini' : 'openai');

console.log('Env check:');
console.log('GEMINI_API_KEY present:', !!GEMINI_API_KEY);
console.log('OPENAI_API_KEY present:', !!OPENAI_API_KEY);
console.log('LLM_PROVIDER:', LLM_PROVIDER);

function getModel() {
    if (LLM_PROVIDER === 'gemini' && GEMINI_API_KEY) {
        const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
        return google('gemini-2.5-flash-preview-09-2025');
    }
    if (OPENAI_API_KEY) {
        const openai = createOpenAI({ apiKey: OPENAI_API_KEY });
        return openai('gpt-4o-mini');
    }
    throw new Error('No API key configured for Research Agent');
}

async function gatherLLMKnowledge(topic) {
    try {
        console.log(`Gathering knowledge for: ${topic}`);
        const model = getModel();
        const prompt = `Act as a market researcher for the Pilates industry in Mexico.
Topic: "${topic}"

Provide a JSON object with the following arrays (3-5 items each):
- statistics: Key stats/numbers relevant to the topic.
- studies: Relevant scientific or market studies (summarized).
- market_data: Prices, costs, or consumer behavior in Mexico.
- trends: Current trends for 2024-2025.

Ensure the data is realistic, specific to Mexico where possible, and professional.
Return ONLY the JSON object.`;

        const { text } = await generateText({
            model,
            prompt,
            temperature: 0.4,
            format: 'json'
        });

        console.log('Raw text:', text);
        const cleaned = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Error in gatherLLMKnowledge:', e);
        return { error: e.message };
    }
}


async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log('No key');
        return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        const models = data.models || [];
        const v15 = models.filter(m => m.name.includes('1.5'));
        console.log('1.5 Models:', JSON.stringify(v15.map(m => m.name), null, 2));
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
gatherLLMKnowledge('Pilates Reformer para Corredores').then(res => console.log(JSON.stringify(res, null, 2)));

