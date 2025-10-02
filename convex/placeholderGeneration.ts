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

export const generatePrompt = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.runQuery(internal.placeholders.getById, { placeholderId: args.placeholderId });
    if (!row) throw new Error('Placeholder not found');

    const OPENAI_API_KEY = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'OPENAI_API_KEY' });
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    const prompt = buildPromptFromContext(row);
    // Minimal call to OpenAI text endpoint using Responses-compatible API via fetch for simplicity
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: [{ role: 'user', content: prompt }],
      })
    });
    if (!resp.ok) throw new Error(`Prompt gen failed: ${resp.status}`);
    const data = await resp.json();
    const text = String(data?.output_text || data?.choices?.[0]?.message?.content || '').trim() || prompt;

    await ctx.runMutation(internal.placeholders.updatePrompt, { placeholderId: args.placeholderId, prompt: text });
    return { prompt: text };
  }
});

function sizeForAspect(aspect?: string): '1024x1024' | '1792x1024' | '1024x1792' {
  const a = (aspect || '').toLowerCase();
  if (a === '16:9' || a === 'landscape') return '1792x1024';
  if (a === 'portrait') return '1024x1792';
  return '1024x1024';
}

export const generateImage = internalAction({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    // Get placeholder row
    const row = await ctx.runQuery(internal.placeholders.getById, { placeholderId: args.placeholderId });
    if (!row) throw new Error('Placeholder not found');

    const OPENAI_API_KEY = await ctx.runQuery(internal.appSettings.getApiKey, { key: 'OPENAI_API_KEY' });
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

    // Ensure we have a prompt
    let prompt = row.generatedPrompt;
    if (!prompt) {
      const p = await generatePrompt.handler(ctx, { placeholderId: args.placeholderId });
      prompt = p.prompt;
    }

    const size = sizeForAspect(row.preferredAspectRatio);
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'hd',
        style: 'natural',
      }),
    });
    if (!response.ok) throw new Error(`DALL-E error: ${await response.text()}`);
    const result = await response.json();
    const imageUrl = result.data[0].url as string;
    const revisedPrompt = result.data[0].revised_prompt as string | undefined;

    // Download generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to download generated image');
    const imageBuffer = await imageResponse.arrayBuffer();

    // Upload to Convex storage
    const storageId = await ctx.storage.store(new Blob([imageBuffer], { type: 'image/png' }));

    // Create ai_images row (minimal)
    const now = Date.now();
    const aiId = await ctx.db.insert('ai_images', {
      fileName: `${args.placeholderId}.png`,
      storageId,
      mimeType: 'image/png',
      size: (imageBuffer as any).byteLength || 0,
      dimensions: { width: size.includes('1792') ? (size === '1792x1024' ? 1792 : 1024) : 1024, height: size.includes('1792') ? (size === '1024x1792' ? 1792 : 1024) : 1024 },
      aiDescription: {
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
      },
      generatedStorageId: storageId,
      generationPrompt: revisedPrompt || prompt,
      generatedDimensions: { width: 1024, height: 1024 },
      generatedAt: now,
      generationStatus: 'completed',
      generationError: undefined,
      category: 'blog',
      isActive: true,
      uploadedAt: now,
      analyzedAt: now,
    });

    // Assign to placeholder
    await ctx.runMutation(internal.placeholders.assignImage, { placeholderId: args.placeholderId, imageId: aiId, activate: true });
    return { ok: true, imageId: aiId };
  }
});

// Public action to queue generation for a placeholder (schedules internal action)
export const queue = action({
  args: { placeholderId: v.string() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.placeholderGeneration.generateImage, { placeholderId: args.placeholderId });
    return { queued: true };
  }
});
