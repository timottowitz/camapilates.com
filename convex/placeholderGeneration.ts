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
    'Create a DALL-E 3 prompt for a photorealistic image related to Pilates/Reformer.',
    'Make the prompt specific, coherent, and brand-safe (no logos/text in image).',
    `Aspect: ${framing}. Style: ${style}. ${subjects}`,
    base,
    'Output only the final prompt text, no explanations.'
  ].join('\n');
}

async function getOpenAIKey(ctx: any): Promise<string | null> {
  // 1) Direct key stored via appSettings.saveApiKey('OPENAI_API_KEY')
  const direct = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'OPENAI_API_KEY' });
  if (direct) return direct as string;
  // 2) Provider key fallback: app_settings key `provider_key_openai` (encrypted)
  const row = await ctx.db.query('app_settings').withIndex('by_key', (q: any) => q.eq('key', 'provider_key_openai')).unique();
  if (!row?.valueEnc) return null;
  try {
    const cfgKey = process.env.CONFIG_ENC_KEY || '';
    if (!cfgKey) return null;
    const bin = Uint8Array.from(Buffer.from(row.valueEnc, 'base64'));
    const iv = bin.slice(0, 12); const ct = bin.slice(12);
    const enc = new TextEncoder().encode(cfgKey);
    const hash = await crypto.subtle.digest('SHA-256', enc) as ArrayBuffer;
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct) as ArrayBuffer;
    const obj = JSON.parse(new TextDecoder().decode(new Uint8Array(pt)));
    return obj?.key || null;
  } catch { return null; }
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
  if (a === 'portrait') return '1024x1792';
  return '1024x1024';
}

function dimensionsFromAspect(aspect?: string) {
  const size = sizeForAspect(aspect);
  const [w, h] = size.split('x').map((v) => parseInt(v, 10));
  return {
    width: Number.isFinite(w) ? w : 1024,
    height: Number.isFinite(h) ? h : 1024,
    sizeLabel: size,
  };
}

function buildFallbackPrompt(row: any): string {
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
    `Aspect ratio ${aspect}. Ensure the image complies with all OpenAI content policies.`
  ].join(' ');
}

function isContentFilterError(error: any): boolean {
  const message = (error?.message || '').toString().toLowerCase();
  return message.includes('content_policy_violation') || message.includes('blocked by our content filters');
}

export const generateImage = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Get placeholder row
      const row = await ctx.runQuery(internal.placeholders.getByIdInternal, { placeholderId: args.placeholderId });
      if (!row) throw new Error('Placeholder not found');

      const OPENAI_API_KEY = await getOpenAIKey(ctx);
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

      // Ensure we have a prompt
      let prompt = row.generatedPrompt;
      if (!prompt) {
        const p = await generatePrompt.handler(ctx, { placeholderId: args.placeholderId });
        prompt = p.prompt;
      }

      const { width, height, sizeLabel } = dimensionsFromAspect(row.preferredAspectRatio);

      let promptToUse = prompt;
      let revisedPrompt: string | undefined;
      let imageUrl: string | undefined;
      let lastError: any;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: promptToUse,
              n: 1,
              size: sizeLabel,
              quality: 'hd',
              style: 'natural',
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DALL-E error: ${errorText}`);
          }

          const result = await response.json();
          imageUrl = result.data[0].url as string;
          revisedPrompt = result.data[0].revised_prompt as string | undefined;
          break;
        } catch (err) {
          lastError = err;
          if (attempt === 0 && isContentFilterError(err)) {
            promptToUse = buildFallbackPrompt(row);
            await ctx.runMutation(internal.placeholders.updatePrompt, {
              placeholderId: args.placeholderId,
              prompt: promptToUse,
            });
            continue;
          }
          throw err;
        }
      }

      if (!imageUrl) {
        throw lastError || new Error('Failed to obtain generated image URL');
      }

      // Download generated image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error('Failed to download generated image');
      const imageBuffer = await imageResponse.arrayBuffer();

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
        generationPrompt: revisedPrompt || prompt,
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
