import { v } from 'convex/values';
import { action } from './_generated/server';
import { api, internal } from './_generated/api';

import { getGoogleAccessToken } from './lib/googleAuth';

// Helper to get Project ID and Location
async function getVertexConfig(ctx: any) {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || 'us-central1';

    if (!projectId) {
        // Try app settings
        const p = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'GOOGLE_PROJECT_ID' });
        const l = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'GOOGLE_LOCATION' });
        if (p) return { projectId: p, location: l || location };
        return null;
    }
    return { projectId, location };
}

async function getGeminiKey(ctx: any): Promise<string | null> {
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (envKey) return envKey;

    const stored = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'GEMINI_API_KEY' });
    if (stored) return stored as string;

    const row = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'provider_key_gemini' }); // Fallback check
    return row || null;
}

const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-pro-preview';

export const analyzeBlogContent = action({
    args: {
        slug: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Determine Auth Mode
        const vertexConfig = await getVertexConfig(ctx);
        const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

        let useVertex = false;
        let accessToken = '';
        let apiKey = '';

        if (vertexConfig && serviceAccountJson) {
            useVertex = true;
            accessToken = await getGoogleAccessToken(ctx);
        } else {
            apiKey = await getGeminiKey(ctx);
            if (!apiKey) throw new Error('No valid Auth found: Configure GOOGLE_SERVICE_ACCOUNT_JSON (Vertex) or GEMINI_API_KEY (AI Studio).');
        }

        const prompt = `
      You are an expert visual editor for a high-end Pilates blog.
      Your task is to analyze the following blog post content and identify 1-3 key concepts that would benefit from a visual explanation (infographic, diagram, or chart).
      
      Focus on:
      - Complex processes (e.g., "How a Reformer works").
      - Anatomical explanations (e.g., "Muscle groups used").
      - Comparisons (e.g., "Mat vs. Reformer").
      - Step-by-step guides.

      For each concept, provide:
      - concept: Short title.
      - type: "infographic" | "diagram" | "chart".
      - description: Detailed explanation of what to visualize.
      - dataSource: Key facts or steps to include in the visual.
      
      Return the result as a JSON array of objects.
      
      Blog Content:
      ${args.content.slice(0, 10000)} // Truncate to avoid token limits if necessary
    `;

        let text = '';

        if (useVertex) {
            const { projectId, location } = vertexConfig!;
            const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${GEMINI_TEXT_MODEL}:predict`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    instances: [{ content: prompt }],
                    parameters: { temperature: 0.7 }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vertex AI analysis failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            text = data?.predictions?.[0]?.content;
        } else {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`;
            const resp = await fetch(`${url}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });

            if (!resp.ok) {
                const errorText = await resp.text();
                throw new Error(`Gemini analysis failed: ${resp.status} - ${errorText}`);
            }

            const data = await resp.json();
            text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        if (!text) throw new Error('No content returned from AI provider');

        let concepts: any[] = [];
        try {
            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            concepts = JSON.parse(cleanText);
        } catch (e) {
            console.error('Failed to parse JSON:', text);
            throw new Error('Invalid JSON response from AI provider');
        }

        if (!Array.isArray(concepts)) {
            concepts = [concepts]; // Handle single object response
        }

        const results = [];
        for (let i = 0; i < concepts.length; i++) {
            const c = concepts[i];
            const placeholderId = `blog-${args.slug}-context-${i + 1}`;

            // Register the placeholder
            await ctx.runMutation(api.placeholders.register, {
                placeholderId,
                pageType: 'blog',
                pageSlug: args.slug,
                location: `context-inline-${i + 1}`,
                headingAbove: c.concept,
                contextBefore: typeof c.description === 'string' ? c.description : JSON.stringify(c.description),
                contextAfter: typeof c.dataSource === 'string' ? c.dataSource : JSON.stringify(c.dataSource),
                preferredAspectRatio: '16:9',
                preferredStyle: c.type, // 'infographic', 'diagram', etc.
                requiredSubjects: [c.concept],
                priority: 70,
            });

            results.push({ placeholderId, concept: c.concept });
        }

        return { success: true, concepts: results };
    }
});
