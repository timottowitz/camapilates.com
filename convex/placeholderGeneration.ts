import { v } from 'convex/values';
import { action, internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

function buildPromptFromContext(p: any): string {
  const parts: string[] = [];
  const isHero = p.location === 'hero' || p.location === 'featured';

  // Context building
  if (p.headingAbove) parts.push(`Heading: ${p.headingAbove}`);
  if (p.contextBefore) parts.push(`Context: ${p.contextBefore}`);
  if (p.altText) parts.push(`Subject focus: ${p.altText}`);

  const base = parts.join('\n');
  const style = p.preferredStyle || 'professional';
  const subjects = Array.isArray(p.requiredSubjects) && p.requiredSubjects.length ? `Subjects: ${p.requiredSubjects.join(', ')}` : '';
  const framing = p.preferredAspectRatio || '16:9';

  // Specific directives based on location
  const role = isHero
    ? 'Create a single, powerful "Hero" image that summarizes the entire theme of the article. It should be symbolic, atmospheric, and visually striking.'
    : 'Create a specific, illustrative image that visually explains the section content. It should be literal, detailed, and directly related to the text provided.';

  return [
    'Role: Director of Photography for CAMA Pilates (Premium Mexican Brand).',
    `Task: ${role}`,
    'Style: Hyper-realistic photography, 8k resolution, highly detailed.',
    'Setting: Modern, high-end Pilates studio in Mexico (warm lighting, wood accents, clean lines).',
    'Constraints: NO TEXT, NO LOGOS, NO WATERMARKS. Avoid distorted anatomy.',
    `Technical: Aspect Ratio ${framing}. Style: ${style}. ${subjects}`,
    '--- INPUT CONTEXT ---',
    base,
    '--- END CONTEXT ---',
    'Output: Provide ONLY the detailed image generation prompt.'
  ].join('\n');
}

async function getGeminiKey(ctx: any): Promise<string | null> {
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (envKey) return envKey;

  const stored = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'GEMINI_API_KEY' });
  if (stored) return stored as string;

  const row = await ctx.db.query('app_settings').withIndex('by_key', (q: any) => q.eq('key', 'provider_key_gemini')).unique();
  if (!row?.valueEnc) return null;
  try {
    const cfgKey = process.env.CONFIG_ENC_KEY || '';
    if (!cfgKey) return null;
    const bin = Uint8Array.from(Buffer.from(row.valueEnc, 'base64'));
    const iv = bin.slice(0, 12);
    const ct = bin.slice(12);
    const enc = new TextEncoder().encode(cfgKey);
    const hash = await crypto.subtle.digest('SHA-256', enc) as ArrayBuffer;
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct) as ArrayBuffer;
    const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
    return obj?.key || null;
  } catch {
    return null;
  }
}

const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-pro-preview';

export const generatePrompt = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    try {
      const row = await ctx.runQuery(internal.placeholders.getByIdInternal, { placeholderId: args.placeholderId });
      if (!row) throw new Error('Placeholder not found');

      const GEMINI_API_KEY = await getGeminiKey(ctx);
      if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

      const prompt = buildPromptFromContext(row);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`;
      const resp = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Prompt gen failed: ${resp.status} - ${errorText}`);
      }
      const data = await resp.json();
      const text = String(data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '').trim() || prompt;

      await ctx.runMutation(internal.placeholders.updatePrompt, { placeholderId: args.placeholderId, prompt: text });

      // Schedule image generation
      await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generateImage, {
        placeholderId: args.placeholderId,
      });

      return { prompt: text };
    } catch (error) {
      throw error;
    }
  }
});

function sizeForAspect(aspect?: string): '1024x1024' | '1792x1024' | '1024x1792' {
  const a = (aspect || '').toLowerCase();
  if (a === '16:9' || a === 'landscape') return '1792x1024';
  if (a === 'portrait' || a === '3:4' || a === '9:16') return '1024x1792';
  return '1024x1024';
}

function dimensionsFromAspect(aspect?: string) {
  const size = sizeForAspect(aspect);
  const [w, h] = size.split('x').map((v) => parseInt(v, 10));
  return {
    width: Number.isFinite(w) ? w : 1024,
    height: Number.isFinite(h) ? h : 1024,
  };
}

const PHOTOREALISTIC_DIRECTIVES = `**--- Photorealistic Image Directives ---**

**Style:** Strive for absolute photorealism. The final image should be indistinguishable from a high-resolution photograph. Avoid any artistic, painterly, or stylized effects.

**Camera and Lens:**
* Shot Type: Choose the shot type that best suits the contextual prompt (close-up, medium, wide, or macro).
* Camera: Full-frame DSLR with a high-resolution sensor.
* Lens: Select a realistic lens for the scene (for example, 50mm prime, 85mm portrait, or 24-70mm zoom).
* Aperture: Use an aperture appropriate for the desired depth of field (e.g., f/1.8 for shallow focus, f/8 for full-scene sharpness).
* Shutter Speed: Use a natural shutter speed (around 1/250s for static scenes, faster for motion).
* ISO: Keep ISO low (around ISO 100) to avoid noise.

**Lighting:**
* Light Source: Choose believable lighting such as soft natural daylight, golden-hour sun, or realistic studio softboxes.
* Light Quality: Ensure natural highlights and shadows that wrap around subjects and create depth.

**Details and Texture:**
* Focus: Keep the main subject tack-sharp.
* Texture: Render surfaces with realistic texture (wood grain, skin, fabric, metal, etc.).
* Imperfections: Include subtle real-world imperfections like minor wrinkles, stray hairs, or light dust to enhance authenticity.

**Color:**
* Color Palette: Natural, lifelike color grading without oversaturation or unnatural color casts.
* White Balance: Neutral unless the context suggests a warm or cool mood.

**Composition:**
* Framing: Apply photographic composition techniques (rule of thirds, leading lines, symmetry) when fitting for the scene.

**Negative Prompt:** Exclude: cartoon, anime, illustration, painting, digital art, unrealistic, fake, CGI, 3D render, oversaturated, watermark, signature, text.`;

const INFOGRAPHIC_DIRECTIVES = `**--- Infographic & Diagram Directives ---**

**Style:** Clean, modern, and educational. Focus on clarity, data visualization, and easy-to-understand graphics.
* Use flat vector art or high-quality digital illustration.
* Avoid noise, clutter, or unnecessary realistic textures.
* Use a cohesive color palette (neutral background with accent colors for key data).

**Typography:**
* Render text clearly and legibly.
* Use bold, sans-serif fonts for headings and labels.
* Ensure high contrast between text and background.

**Composition:**
* Organize information logically (left-to-right or top-to-bottom flow).
* Use white space effectively to separate sections.
* Use arrows, lines, and icons to guide the viewer's eye.

**Negative Prompt:** Exclude: photorealistic, photograph, grainy, blurry, messy, chaotic, unreadable text, 3d render, complex shading.`;

function appendStyleDirectives(basePrompt: string, style: string): string {
  const trimmed = basePrompt?.trim() ?? '';
  const s = style.toLowerCase();
  if (s.includes('infographic') || s.includes('diagram') || s.includes('chart') || s.includes('poster')) {
    if (!trimmed.includes('Infographic & Diagram Directives')) {
      return `${trimmed}\n\n${INFOGRAPHIC_DIRECTIVES}`.trim();
    }
  } else {
    if (!trimmed.includes('Photorealistic Image Directives')) {
      return `${trimmed}\n\n${PHOTOREALISTIC_DIRECTIVES}`.trim();
    }
  }
  return trimmed;
}

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
const GEMINI_IMAGE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;
const GEMINI_ASPECT_MAP: Record<string, string> = {
  '16:9': '16:9',
  '4:3': '4:3',
  '3:4': '3:4',
  '9:16': '9:16',
  '1:1': '1:1',
  'portrait': '3:4',
  'landscape': '16:9',
};

function buildFallbackPromptBase(row: any): string {
  const heading = row?.headingAbove || 'Pilates reformer scene';
  const aspect = row?.preferredAspectRatio || 'landscape';
  const style = row?.preferredStyle || 'professional';
  const subjects = Array.isArray(row?.requiredSubjects) && row.requiredSubjects.length
    ? row.requiredSubjects.join(', ')
    : 'modern pilates reformer equipment';

  if (style === 'infographic' || style === 'diagram') {
    return [
      `Create a clean, modern infographic about "${heading}".`,
      `Focus on explaining: ${subjects}.`,
      `Use a neutral background and clear, legible text labels.`,
      `Aspect ratio ${aspect}.`
    ].join(' ');
  }

  return [
    `Photorealistic interior photograph of a high-end Pilates studio in Mexico with ${subjects}.`,
    `Highlight clean architectural lines, warm natural light, premium materials, and a calm, welcoming atmosphere.`,
    `Focus on the reformer setup inspired by "${heading}".`,
    `No text, no logos, no people, no NSFW content.`,
    `Aspect ratio ${aspect}. Ensure the image complies with safety policies.`
  ].join(' ');
}

function isContentFilterError(error: any): boolean {
  const message = (error?.message || '').toString().toLowerCase();
  return message.includes('content_policy_violation')
    || message.includes('blocked by our content filters')
    || message.includes('safety')
    || message.includes('blocked');
}

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

export const generateImage = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Get placeholder row
      const row = await ctx.runQuery(internal.placeholders.getByIdInternal, { placeholderId: args.placeholderId });
      if (!row) throw new Error('Placeholder not found');

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

      // Ensure we have a prompt
      let basePrompt = row.generatedPrompt;
      if (!basePrompt) {
        const p = await generatePrompt.handler(ctx, { placeholderId: args.placeholderId });
        basePrompt = p.prompt;
      }

      const { width, height } = dimensionsFromAspect(row.preferredAspectRatio);

      let promptToUse = appendStyleDirectives(basePrompt, row.preferredStyle || 'professional');
      // Append aspect ratio to prompt since generationConfig doesn't support it for this model
      promptToUse += `\n\nAspect Ratio: ${row.preferredAspectRatio || '16:9'}`;
      let lastError: any;
      let imageBuffer: Buffer | Uint8Array | null = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const aspectPref = (row.preferredAspectRatio || '').toLowerCase();
          const aspectRatio = GEMINI_ASPECT_MAP[aspectPref] || '16:9';

          let response;

          if (useVertex) {
            // Vertex AI Payload
            const { projectId, location } = vertexConfig!;

            // Gemini models often use 'global' location but the endpoint might differ
            // For gemini-3-pro-image-preview, it seems to be available in 'global'
            // The standard endpoint for global is aiplatform.googleapis.com

            let hostname = `${location}-aiplatform.googleapis.com`;
            let loc = location;

            // Special handling for Gemini 3 Image which might be global
            if (GEMINI_IMAGE_MODEL.includes('gemini-3')) {
              hostname = 'aiplatform.googleapis.com'; // Global endpoint
              loc = 'global'; // Force global location for this model
            }

            // Use generateContent for Gemini models (v1beta1 is safer for preview models)
            const endpoint = `https://${hostname}/v1beta1/projects/${projectId}/locations/${loc}/publishers/google/models/${GEMINI_IMAGE_MODEL}:generateContent`;

            const body = {
              contents: [{
                role: 'user',
                parts: [{ text: promptToUse }]
              }],
              generationConfig: {
                candidateCount: 1
              }
            };

            response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Vertex error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Handle Gemini response format (inlineData)
            const candidate = data.candidates?.[0];
            const part = candidate?.content?.parts?.find((p: any) => p.inlineData);

            if (!part || !part.inlineData || !part.inlineData.data) {
              console.error('Unexpected Gemini response:', JSON.stringify(data, null, 2));
              throw new Error('No image data found in Gemini response');
            }

            // Gemini returns base64 directly in inlineData.data
            const base64Image = part.inlineData.data;
            // Convert base64 to Uint8Array (Convex doesn't have Buffer)
            const binaryString = atob(base64Image);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            imageBuffer = bytes;
          } else {
            // AI Studio Payload (Legacy)
            const body = {
              contents: [{ parts: [{ text: promptToUse }] }],
              generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: { aspectRatio: aspectRatio, imageSize: '1024x1024' }
              }
            };
            const url = new URL(GEMINI_IMAGE_ENDPOINT);
            url.searchParams.set('key', apiKey);

            response = await fetch(url.toString(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
          }

          if (!useVertex) {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Gemini error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            let base64: string | undefined;

            const candidates = result?.candidates || [];
            for (const candidate of candidates) {
              const parts = candidate?.content?.parts || [];
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  base64 = part.inlineData.data;
                  break;
                }
              }
              if (base64) break;
            }

            if (!base64) {
              throw new Error('Response missing image data');
            }

            imageBuffer = Buffer.from(base64, 'base64');
          }
          break;
        } catch (err) {
          lastError = err;
          if (attempt === 0 && isContentFilterError(err)) {
            const fallbackBase = buildFallbackPromptBase(row);
            promptToUse = appendStyleDirectives(fallbackBase, row.preferredStyle || 'professional');
            await ctx.runMutation(internal.placeholders.updatePrompt, {
              placeholderId: args.placeholderId,
              prompt: fallbackBase,
            });
            continue;
          }
          throw err;
        }
      }

      if (!imageBuffer) {
        throw lastError || new Error('Failed to obtain generated image');
      }

      // Upload to Convex storage
      const storageId = await ctx.storage.store(new Blob([imageBuffer as any], { type: 'image/png' }));

      const sizeBytes = imageBuffer.byteLength || 0;
      const aiDescription = {
        scene: row.headingAbove || 'Pilates scene',
        subjects: row.requiredSubjects || ['reformer', 'pilates'],
        activity: undefined,
        mood: row.preferredStyle || 'professional',
        colors: ['neutral'],
        composition: 'Clean, centered subject',
        lighting: 'natural',
        setting: 'indoor studio',
        useCases: ['blog', 'feature', 'hero'],
        tags: ['pilates', 'reformer', 'studio'],
        quality: 'Excellent',
      } as const;

      const imageId = await ctx.runMutation(internal.aiImages.upload, {
        fileName: `${args.placeholderId}.png`,
        storageId,
        mimeType: 'image/png',
        size: sizeBytes,
        dimensions: { width, height },
        aiDescription,
        category: 'blog',
        autoGenerate: false,
      });

      await ctx.runMutation(internal.aiImages.updateGeneratedImage, {
        imageId,
        generatedStorageId: storageId,
        generationPrompt: promptToUse,
        dimensions: { width, height },
      });

      // Assign to placeholder
      await ctx.runMutation(internal.placeholders.assignImage, { placeholderId: args.placeholderId, imageId, activate: true });

      return { ok: true, imageId };
    } catch (error) {
      const message = (error as Error)?.message || String(error);
      console.error(`placeholderGeneration.generateImage failed for ${args.placeholderId}: ${message}`);
      await ctx.runMutation(internal.placeholders.markStatus, {
        placeholderId: args.placeholderId,
        status: 'error',
        error: message,
      });
      throw error;
    }
  }
});

// Public action to queue generation for a placeholder (schedules internal action)
export const queue = action({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    // Start with prompt generation (which will check if prompt exists)
    await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generatePrompt, { placeholderId: args.placeholderId });
    return { queued: true };
  }
});
