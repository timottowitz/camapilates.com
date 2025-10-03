import { v } from 'convex/values';
import { action, internalAction } from './_generated/server';
import { internal } from './_generated/api';

function buildPromptFromContext(p: any): string {
  const parts: string[] = [];
  if (p.headingAbove) parts.push(`Heading: ${p.headingAbove}`);
  if (p.contextBefore) parts.push(`Before: ${p.contextBefore}`);
  if (p.contextAfter) parts.push(`After: ${p.contextAfter}`);
  if (p.altText) parts.push(`Alt text: ${p.altText}`);
  const base = parts.join('\n');
  const style = p.preferredStyle || 'professional';
  const subjects = Array.isArray(p.requiredSubjects) && p.requiredSubjects.length ? `Subjects: ${p.requiredSubjects.join(', ')}` : '';
  const framing = p.preferredAspectRatio || '16:9';
  return [
    'Create a detailed prompt for a photorealistic image related to Pilates/Reformer that will be used with Google Gemini Flash image generation.',
    'Make the prompt specific, coherent, and brand-safe (no logos/text in image).',
    `Aspect: ${framing}. Style: ${style}. ${subjects}`,
    base,
    'Output only the final prompt text, no explanations.'
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

async function getOpenAIKey(ctx: any): Promise<string | null> {
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) return envKey;

  const direct = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'OPENAI_API_KEY' });
  if (direct) return direct as string;

  const row = await ctx.db.query('app_settings').withIndex('by_key', (q: any) => q.eq('key', 'provider_key_openai')).unique();
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

export const generatePrompt = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    try {
      const row = await ctx.runQuery(internal.placeholders.getByIdInternal, { placeholderId: args.placeholderId });
      if (!row) throw new Error('Placeholder not found');

      const OPENAI_API_KEY = await getOpenAIKey(ctx);
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

      const prompt = buildPromptFromContext(row);
      // Call OpenAI chat completions API
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        })
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Prompt gen failed: ${resp.status} - ${errorText}`);
      }
      const data = await resp.json();
      const text = String(data?.choices?.[0]?.message?.content || '').trim() || prompt;

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

function appendPhotorealisticDirectives(basePrompt: string): string {
  const trimmed = basePrompt?.trim() ?? '';
  if (!trimmed.includes('Photorealistic Image Directives')) {
    return `${trimmed}

${PHOTOREALISTIC_DIRECTIVES}`.trim();
  }
  return trimmed;
}

const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_IMAGE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateImage`;
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
  const subjects = Array.isArray(row?.requiredSubjects) && row.requiredSubjects.length
    ? row.requiredSubjects.join(', ')
    : 'modern pilates reformer equipment';
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

export const generateImage = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Get placeholder row
      const row = await ctx.runQuery(internal.placeholders.getByIdInternal, { placeholderId: args.placeholderId });
      if (!row) throw new Error('Placeholder not found');

      const GEMINI_API_KEY = await getGeminiKey(ctx);
      if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

      // Ensure we have a prompt
      let basePrompt = row.generatedPrompt;
      if (!basePrompt) {
        const p = await generatePrompt.handler(ctx, { placeholderId: args.placeholderId });
        basePrompt = p.prompt;
      }

      const { width, height } = dimensionsFromAspect(row.preferredAspectRatio);

      let promptToUse = appendPhotorealisticDirectives(basePrompt);
      let lastError: any;
      let imageBuffer: Buffer | null = null;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const aspectPref = (row.preferredAspectRatio || '').toLowerCase();
          const body: Record<string, any> = {
            prompt: {
              text: promptToUse,
            },
          };
          if (GEMINI_ASPECT_MAP[aspectPref]) {
            body.aspectRatio = GEMINI_ASPECT_MAP[aspectPref];
          }

          const url = new URL(GEMINI_IMAGE_ENDPOINT);
          url.searchParams.set('key', GEMINI_API_KEY);

          const response = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          const base64 = result?.images?.[0]?.image?.bytesBase64;
          if (!base64) {
            throw new Error('Gemini response missing image data');
          }

          imageBuffer = Buffer.from(base64, 'base64');
          break;
        } catch (err) {
          lastError = err;
          if (attempt === 0 && isContentFilterError(err)) {
            const fallbackBase = buildFallbackPromptBase(row);
            promptToUse = appendPhotorealisticDirectives(fallbackBase);
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
      const storageId = await ctx.storage.store(new Blob([imageBuffer], { type: 'image/png' }));

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
