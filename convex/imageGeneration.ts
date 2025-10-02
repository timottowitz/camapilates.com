import { v } from 'convex/values';
import { action, internalAction } from './_generated/server';
import { internal } from './_generated/api';

/**
 * AUTOMATIC IMAGE GENERATION TRIGGER
 *
 * This action is called automatically after an image is uploaded with AI description.
 * It generates a copyright-free similar image using DALL-E 3.
 */
export const triggerGeneration = internalAction({
  args: {
    imageId: v.id('ai_images'),
  },
  handler: async (ctx, args) => {
    // Get image with AI description
    const image = await ctx.runQuery(internal.aiImages.getById, {
      imageId: args.imageId,
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Build DALL-E prompt from AI description
    const prompt = buildDallePrompt(image.aiDescription);

    try {
      // Mark as generating
      await ctx.runMutation(internal.aiImages.updateGenerationStatus, {
        imageId: args.imageId,
        status: 'generating',
      });

      // Get OpenAI API key from database
      const openaiApiKey = await ctx.runQuery(internal.appSettings.getApiKey, {
        key: 'OPENAI_API_KEY',
      });

      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured. Run: node scripts/setup-api-key.js');
      }

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DALL-E API error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      const imageUrl = result.data[0].url;
      const revisedPrompt = result.data[0].revised_prompt;

      // Download generated image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download generated image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload to Convex storage
      const storageId = await ctx.storage.store(new Blob([imageBuffer], { type: 'image/png' }));

      // Update record with generated image
      await ctx.runMutation(internal.aiImages.updateGeneratedImage, {
        imageId: args.imageId,
        generatedStorageId: storageId,
        generationPrompt: revisedPrompt,
        dimensions: { width: 1024, height: 1024 },
      });

      console.log(`✅ Generated image for ${image.fileName}`);

    } catch (error: any) {
      console.error(`❌ Generation failed for ${image.fileName}:`, error.message);

      // Mark as failed
      await ctx.runMutation(internal.aiImages.markGenerationFailed, {
        imageId: args.imageId,
        error: error.message,
      });
    }
  },
});

/**
 * Build DALL-E prompt from AI description
 */
function buildDallePrompt(aiDescription: any): string {
  const {
    scene,
    subjects,
    activity,
    mood,
    colors,
    composition,
    lighting,
    setting,
  } = aiDescription;

  const prompt = `Professional Pilates studio photograph:

Scene: ${scene}
Subjects: ${subjects.join(', ')}
${activity ? `Activity: ${activity}` : ''}
Mood: ${mood}
Colors: ${colors.slice(0, 3).join(', ')} tones
Composition: ${composition}
${lighting ? `Lighting: ${lighting}` : ''}
${setting ? `Setting: ${setting}` : ''}

Style: Modern fitness photography, high quality, professional, unique perspective.
Shot with professional camera, 8K resolution, magazine quality.
Photorealistic but with unique artistic interpretation.`;

  return prompt;
}

/**
 * PUBLIC ACTION: Queue image for generation
 * Can be called from client or scripts
 */
export const queueForGeneration = action({
  args: {
    imageId: v.id('ai_images'),
  },
  handler: async (ctx, args) => {
    // Schedule the generation
    await ctx.scheduler.runAfter(0, internal.imageGeneration.triggerGeneration, {
      imageId: args.imageId,
    });

    return { success: true, message: 'Image queued for generation' };
  },
});
