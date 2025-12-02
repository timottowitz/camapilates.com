import { v } from 'convex/values';
import { action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

/**
 * Studio Summary Generation
 * Generates AI summaries from Google reviews for each studio
 */

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

interface ReviewForSummary {
  rating: number;
  text: string;
  authorName: string;
}

/**
 * Generate summary for a single studio
 */
export const generateSummaryForStudio = action({
  args: {
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Get studio data
    const studio = await ctx.runQuery(internal.studioSummary.getStudioById, {
      studioId: args.studioId,
    });

    if (!studio) {
      throw new Error('Studio not found');
    }

    if (!studio.googlePlaceId) {
      throw new Error('Studio has no googlePlaceId');
    }

    // Get reviews from raw data
    const reviews = await ctx.runQuery(internal.studioSummary.getReviewsForStudio, {
      googlePlaceId: studio.googlePlaceId,
    });

    if (!reviews || reviews.length === 0) {
      return { success: false, error: 'No reviews found for this studio' };
    }

    // Generate summary using OpenAI
    const summary = await generateSummaryWithOpenAI(
      apiKey,
      studio.name,
      studio.address.neighborhood || studio.address.city,
      studio.address.city,
      reviews
    );

    if (!summary) {
      return { success: false, error: 'Failed to generate summary' };
    }

    // Save summary to studio
    await ctx.runMutation(internal.studioSummary.updateStudioSummary, {
      studioId: args.studioId,
      summary,
    });

    return {
      success: true,
      studioSlug: studio.slug,
      summary,
    };
  },
});

/**
 * Generate summaries for all studios with reviews
 */
export const generateAllSummaries = action({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
    forceRegenerate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const city = args.city || 'Ciudad de México';
    const limit = args.limit;
    const forceRegenerate = args.forceRegenerate || false;

    console.log(`Starting summary generation for city: ${city}`);

    // Get studios that need summaries
    const studios = await ctx.runQuery(internal.studioSummary.getStudiosNeedingSummaries, {
      city,
      limit,
      forceRegenerate,
    });

    console.log(`Found ${studios.length} studios needing summaries`);

    const results = {
      total: studios.length,
      generated: 0,
      skipped: 0,
      errors: [] as Array<{ studioSlug: string; error: string }>,
      startTime: Date.now(),
    };

    // Process in batches
    for (let i = 0; i < studios.length; i += BATCH_SIZE) {
      const batch = studios.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(studios.length / BATCH_SIZE)}`);

      for (const studio of batch) {
        try {
          if (!studio.googlePlaceId) {
            results.skipped++;
            continue;
          }

          // Get reviews
          const reviews = await ctx.runQuery(internal.studioSummary.getReviewsForStudio, {
            googlePlaceId: studio.googlePlaceId,
          });

          if (!reviews || reviews.length < 2) {
            results.skipped++;
            continue;
          }

          // Generate summary
          const summary = await generateSummaryWithOpenAI(
            apiKey,
            studio.name,
            studio.address.neighborhood || studio.address.city,
            studio.address.city,
            reviews
          );

          if (summary) {
            await ctx.runMutation(internal.studioSummary.updateStudioSummary, {
              studioId: studio._id,
              summary,
            });
            results.generated++;
          } else {
            results.skipped++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error generating summary for ${studio.slug}:`, errorMessage);
          results.errors.push({ studioSlug: studio.slug, error: errorMessage });
        }
      }

      // Rate limiting delay
      if (i + BATCH_SIZE < studios.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const duration = Date.now() - results.startTime;
    console.log(`Summary generation complete: ${results.generated}/${results.total} generated, ${results.skipped} skipped, ${results.errors.length} errors`);

    return {
      ...results,
      duration,
      estimatedCost: `$${(results.generated * 0.003).toFixed(3)}`,
    };
  },
});

// ============================================
// OpenAI Integration
// ============================================

async function generateSummaryWithOpenAI(
  apiKey: string,
  studioName: string,
  neighborhood: string,
  city: string,
  reviews: ReviewForSummary[]
): Promise<{ overview: string; vibe?: string; highlight?: string; reviewInsights?: string; generatedAt: number } | null> {
  const reviewsText = reviews
    .slice(0, 10) // Use up to 10 reviews
    .map((r, i) => `[${r.rating}★] ${r.text}`)
    .join('\n\n');

  const ratingCounts = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const systemPrompt = `Eres un escritor de contenido para un directorio de estudios de Pilates en México. Tu tarea es crear resúmenes positivos y promocionales basados en reseñas de Google.

Reglas IMPORTANTES:
- Escribe en español mexicano natural y profesional
- SIEMPRE mantén un tono POSITIVO y constructivo
- Destaca SOLO los aspectos positivos y fortalezas del estudio
- NUNCA menciones quejas, críticas, o aspectos negativos de las reseñas
- Enfócate en lo que hace especial y recomendable al estudio
- Usa un tono cálido, entusiasta y acogedor
- Si hay pocas reseñas positivas, enfócate en la ubicación y el tipo de servicio
- Evita cualquier comentario que pueda interpretarse como crítica`;

  const userPrompt = `Analiza las siguientes reseñas del estudio "${studioName}" ubicado en ${neighborhood}, ${city}.

Calificación promedio: ${avgRating.toFixed(1)}★ (${reviews.length} reseñas)
Distribución: ${Object.entries(ratingCounts).map(([r, c]) => `${r}★: ${c}`).join(', ')}

RESEÑAS:
${reviewsText}

Genera un JSON con esta estructura exacta:
{
  "overview": "Resumen de 2-3 oraciones que capture la esencia del estudio y lo que los clientes más valoran",
  "vibe": "2-4 palabras que describan el ambiente (ej: 'Profesional y acogedor', 'Energético y motivador')",
  "highlight": "Lo más destacado según las reseñas en una frase corta",
  "reviewInsights": "Resumen de los temas principales que mencionan los clientes (máx 2 oraciones)"
}

Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      overview: parsed.overview || '',
      vibe: parsed.vibe,
      highlight: parsed.highlight,
      reviewInsights: parsed.reviewInsights,
      generatedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

// ============================================
// Internal Queries and Mutations
// ============================================

export const getStudioById = internalQuery({
  args: {
    studioId: v.id('studios'),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.studioId);
  },
});

export const getReviewsForStudio = internalQuery({
  args: {
    googlePlaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const rawData = await ctx.db
      .query('placesRawData')
      .withIndex('by_place_id', (q) => q.eq('googlePlaceId', args.googlePlaceId))
      .first();

    if (!rawData?.rawResponse?.reviews) {
      return [];
    }

    const reviews = rawData.rawResponse.reviews;
    if (!Array.isArray(reviews)) {
      return [];
    }

    return reviews
      .filter((r: any) => r && typeof r === 'object')
      .map((r: any) => ({
        rating: typeof r.rating === 'number' ? r.rating : 0,
        text: r.text?.text || r.originalText?.text || '',
        authorName: r.authorAttribution?.displayName || 'Anónimo',
      }))
      .filter((r: ReviewForSummary) => r.text.length > 0);
  },
});

export const getStudiosNeedingSummaries = internalQuery({
  args: {
    city: v.string(),
    limit: v.optional(v.number()),
    forceRegenerate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const studios = await ctx.db
      .query('studios')
      .withIndex('by_city', (q) => q.eq('address.city', args.city))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Filter to studios with googlePlaceId
    let filtered = studios.filter((s) => s.googlePlaceId);

    // Unless force regenerate, only get those without summaries
    if (!args.forceRegenerate) {
      filtered = filtered.filter((s) => !s.generatedSummary);
    }

    if (args.limit) {
      return filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const updateStudioSummary = internalMutation({
  args: {
    studioId: v.id('studios'),
    summary: v.object({
      overview: v.string(),
      vibe: v.optional(v.string()),
      highlight: v.optional(v.string()),
      reviewInsights: v.optional(v.string()),
      generatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studioId, {
      generatedSummary: args.summary,
      updatedAt: Date.now(),
    });
  },
});
