import { queryGeneric as query, mutationGeneric as mutation, actionGeneric as action } from 'convex/server';
import { v } from 'convex/values';

function trimWords(s: string, max = 70) {
  const words = s.trim().split(/\s+/);
  return words.length > max ? words.slice(0, max).join(' ') + '…' : s.trim();
}
function summarize(text: string, maxChars = 350) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars - 1) + '…' : cleaned;
}
function buildNegativePrompt() {
  return [
    'texto, marca de agua, tipografia, logo, texto en la imagen',
    'arte de dibujos animados, CGI obvio, caricatura, 3D, render',
    'manos o dedos extra, anatomía incorrecta, deformaciones',
    'rostros distorsionados, desenfoque excesivo, ruido digital fuerte',
    'colores fluorescentes antinaturales, halos, aberración cromática',
  ].join(', ');
}
function buildHeroPrompt(headline: string, extra?: string) {
  return [
    `Fotografía hiperrealista 16:9 que ilustre: “${headline.trim()}”.`,
    'Ambientación mexicana auténtica (hogar o estudio moderno en México), luz natural cálida de mañana, detalles de madera y acero pulido.',
    'Muestra equipo de Pilates Reformer de alta gama (sin marcas visibles), tonos neutros y elegantes. Composición limpia con sujeto principal en primer tercio.',
    'Óptica: 50mm, f/2.8, ISO 200, velocidad 1/250; profundidad de campo suave, bokeh natural.',
    'Evita cualquier texto o marca en la imagen, sensación premium, realista y acogedora.',
    extra ? `Instrucciones adicionales: ${extra.trim()}` : ''
  ].filter(Boolean).join(' ');
}
function buildChapterPrompt(heading: string, summary: string) {
  return [
    `Fotografía hiperrealista 4:3 que represente el capítulo “${heading.trim()}”.`,
    `Contenido clave: ${trimWords(summary, 40)}.`,
    'Ambientación mexicana coherente con el artículo, iluminación natural, tono editorial premium.',
    'Si aplica, incluir discretamente un Reformer o accesorios de Pilates en contexto realista (sin logos).',
    'Óptica: 50mm o 35mm, f/2.8–4, estilo natural sin exageraciones, sin texto ni marcas.',
  ].join(' ');
}

export const listImages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('blog_images').collect();
    rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    // Resolve signed URLs
    const items = await Promise.all(rows.map(async (r) => ({
      slug: r.slug,
      heroUrl: r.heroStorageId ? await ctx.storage.getUrl(r.heroStorageId) : null,
      updatedAt: r.updatedAt,
    })));
    return { items };
  }
});

export const getImageMeta = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db.query('blog_images').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (!row) return { slug, heroUrl: null, sections: [] };
    const heroUrl = row.heroStorageId ? await ctx.storage.getUrl(row.heroStorageId) : null;
    const sections = [] as Array<{ heading: string; url?: string }>;
    if (row.sectionStorageIds?.length) {
      for (const id of row.sectionStorageIds) {
        const url = await ctx.storage.getUrl(id);
        sections.push({ heading: 'Capítulo', url: url || undefined });
      }
    }
    return { slug, heroUrl, sections, updatedAt: row.updatedAt };
  }
});

export const saveImageMeta = mutation({
  args: { slug: v.string(), heroStorageId: v.optional(v.id('_storage')), sectionStorageIds: v.optional(v.array(v.id('_storage'))) },
  handler: async (ctx, { slug, heroStorageId, sectionStorageIds }) => {
    const now = Date.now();
    const row = await ctx.db.query('blog_images').withIndex('by_slug', q => q.eq('slug', slug)).unique();
    if (row) {
      await ctx.db.patch(row._id, { heroStorageId, sectionStorageIds, updatedAt: now });
      return { updated: true };
    }
    await ctx.db.insert('blog_images', { slug, heroStorageId, sectionStorageIds, updatedAt: now });
    return { created: true };
  }
});

export const generateImages = action({
  args: { slug: v.string(), headline: v.string(), additionalPrompt: v.optional(v.string()), sections: v.optional(v.array(v.object({ heading: v.string(), text: v.string() }))), limit: v.optional(v.number()), testOnly: v.optional(v.boolean()) },
  handler: async (ctx, { slug, headline, additionalPrompt, sections, limit, testOnly }) => {
    // Build prompts
    const heroPrompt = buildHeroPrompt(headline, additionalPrompt || undefined);
    const useSections = (sections || []).filter(s => s.heading && !/^FAQ\b/i.test(s.heading)).slice(0, Math.max(2, Math.min(3, limit || 3)));
    const chapterPrompts = useSections.map(ch => ({ heading: ch.heading, summary: summarize(ch.text || ''), prompt: buildChapterPrompt(ch.heading, summarize(ch.text || '')) }));

    if (testOnly) {
      // Basic sanity check: ensure env vars present
      const ok = Boolean(process.env.VERTEX_PROJECT_ID);
      return { success: ok, usedVertex: ok, tested: true };
    }

    // For initial integration we return prompts only (no external call)
    return { success: true, usedVertex: false, hero: { prompt: heroPrompt }, chapters: chapterPrompts };
  }
});

