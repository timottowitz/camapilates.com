#!/usr/bin/env node

/**
 * MCP Server — Content Writer Agent
 * Multi-pass LLM-based blog content generation from research files
 *
 * Flow integration:
 * 1. Dashboard → User discovers topics via TopicFinder
 * 2. Convex → batchDiscoverAndScaffold creates research files
 * 3. Web Research Agent → Adds Mexican market data to research
 * 4. THIS AGENT → Transforms research into publication-ready blog
 * 5. SEO/Quality Agents → Optimize and validate
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import CONFIG from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let openaiClient = null;
let geminiClient = null;

function getModel(kind = 'main') {
  if (CONFIG.LLM_PROVIDER === 'gemini') {
    if (!geminiClient) {
      geminiClient = createGoogleGenerativeAI({ apiKey: CONFIG.GEMINI_API_KEY });
    }
    const modelName = kind === 'fast' ? CONFIG.GEMINI_MODEL_FAST : CONFIG.GEMINI_MODEL;
    return geminiClient(modelName);
  }

  if (!openaiClient) {
    openaiClient = createOpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
  }
  const modelName = kind === 'fast' ? CONFIG.OPENAI_MODEL_FAST : CONFIG.OPENAI_MODEL;
  return openaiClient(modelName);
}

function extractJsonPayload(text) {
  if (!text) return '';
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

const server = new Server(
  {
    name: 'content-writer-agent',
    version: '1.0.0',
  },
  {
    capabilities: { tools: {} },
  }
);

// Tools manifest
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'write_blog_from_research',
      description: 'Generate publication-ready blog content from research file using multi-pass LLM approach. Integrates with dashboard topic discovery → web research → content generation pipeline.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Blog slug (must have corresponding research file)'
          },
          forceOverwrite: {
            type: 'boolean',
            default: false,
            description: 'Overwrite existing blog file if present'
          }
        },
        required: ['slug']
      }
    },
    {
      name: 'regenerate_section',
      description: 'Regenerate a specific section of an existing blog (for iterative improvement)',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog slug' },
          section: { type: 'string', description: 'Section heading (H2) to regenerate' }
        },
        required: ['slug', 'section']
      }
    },
    {
      name: 'preview_outline',
      description: 'Generate and preview the content outline without writing the full blog (for planning)',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog slug' }
        },
        required: ['slug']
      }
    }
  ]
}));

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'write_blog_from_research':
        return await writeBlogFromResearch(args.slug, args.forceOverwrite);

      case 'regenerate_section':
        return await regenerateSection(args.slug, args.section);

      case 'preview_outline':
        return await previewOutline(args.slug);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

// ============================================================================
// MAIN FUNCTION: Multi-pass content generation
// ============================================================================

async function writeBlogFromResearch(slug, forceOverwrite = false) {
  const startTime = Date.now();
  log(`🚀 Starting content generation for: ${slug}`);

  // Check if blog already exists
  const blogFile = path.join(CONFIG.BLOG_OUTPUT_DIR, `${slug}.md`);
  const exists = await fileExists(blogFile);
  if (exists && !forceOverwrite) {
    return {
      content: [{
        type: 'text',
        text: `Blog already exists: ${blogFile}\nUse forceOverwrite: true to regenerate.`
      }]
    };
  }

  // 1. Load research file
  log(`📖 [1/5] Loading research file...`);
  const researchFile = path.join(CONFIG.RESEARCH_DIR, `${slug}.md`);
  if (!await fileExists(researchFile)) {
    throw new Error(`Research file not found: ${researchFile}`);
  }
  const researchContent = await fs.readFile(researchFile, 'utf-8');

  // 2. Parse metadata from research and TODO file
  log(`🔍 [2/5] Parsing metadata...`);
  const metadata = await parseMetadata(slug, researchContent);

  // 3. Pass 1: Generate outline
  log(`📋 [3/5] Generating content outline (Pass 1)...`);
  const outline = await generateOutline(researchContent, metadata);
  log(`   ✓ Outline created: ${outline.sections.length} sections, ${outline.total_word_target} words target`);

  // 4. Pass 2: Generate sections
  log(`✍️  [4/5] Generating content sections (Pass 2)...`);
  const sections = [];
  for (let i = 0; i < outline.sections.length; i++) {
    const sectionPlan = outline.sections[i];
    log(`   → Section ${i + 1}/${outline.sections.length}: ${sectionPlan.h2}`);
    const content = await generateSection(sectionPlan, researchContent, metadata, outline);
    sections.push({ heading: sectionPlan.h2, content });
  }

  // 5. Pass 3: Generate FAQs
  log(`❓ [5/5] Generating FAQs (Pass 3)...`);
  const faqs = await generateFAQs(researchContent, metadata, outline);
  log(`   ✓ Generated ${faqs.length} FAQs`);

  // 6. Pass 4: Assemble and polish
  log(`✨ Polishing content (Pass 4)...`);
  let fullContent = assembleContent(sections, faqs, metadata);
  fullContent = await polishContent(fullContent, researchContent, metadata);

  // 7. Add frontmatter
  const frontmatter = buildFrontmatter(metadata);
  const final = `${frontmatter}\n${fullContent}\n`;

  // 8. Write to file
  await fs.mkdir(CONFIG.BLOG_OUTPUT_DIR, { recursive: true });
  await fs.writeFile(blogFile, final, 'utf-8');

  const processingTime = Date.now() - startTime;
  const wordCount = countWords(fullContent);

  log(`✅ Blog generated successfully!`);
  log(`   📄 File: ${blogFile}`);
  log(`   📊 Word count: ${wordCount}`);
  log(`   ⏱️  Processing time: ${formatTime(processingTime)}`);

  const summary = `Blog generated successfully!
- File: ${blogFile}
- Word count: ${wordCount}
- Sections: ${sections.length}
- FAQs: ${faqs.length}
- Processing time: ${formatTime(processingTime)}

Sections generated:
${sections.map(s => `  • ${s.heading}`).join('\n')}

Next steps in pipeline:
  5. SEO optimization (title + meta tags)
  6. Quality review (score + validation)
  7. Image enhancement (Unsplash)
  8. Final validation (publication readiness)`;

  return {
    content: [{ type: 'text', text: summary }]
  };
}

// ============================================================================
// PASS 1: Generate Outline (GPT-4o-mini, 30s)
// ============================================================================

async function generateOutline(researchContent, metadata) {
  const model = getModel('fast');

  const systemPrompt = `Eres un estratega de contenido senior para ${CONFIG.BRAND_NAME}.

Tu tarea es crear un esquema detallado para un blog post basándote en el archivo de investigación proporcionado.`;

  const userPrompt = `ARCHIVO DE INVESTIGACIÓN:
${researchContent}

METADATOS:
- Título: ${metadata.title}
- Categoría: ${metadata.category}
- Palabras clave: ${metadata.keywords.join(', ')}
- Público objetivo: ${metadata.targetAudience || `Mercado ${CONFIG.LANGUAGE} de Pilates`}

TAREA:
Analiza el archivo de investigación y crea un esquema estructurado para el blog.

REQUISITOS:
1. Extrae TODOS los hechos clave, estadísticas, referencias de libros, y especificaciones técnicas
2. Identifica la estructura propuesta en el research (secciones sugeridas)
3. Crea talking points específicos para cada sección (no genéricos)
4. Asigna word count target a cada sección (total: ${CONFIG.WORD_TARGET} palabras)
5. Identifica gaps o información faltante

SECCIONES OBLIGATORIAS:
- Resumen (150-200 palabras)
- [Secciones del tema según research]
- Recomendaciones ${CONFIG.BRAND_NAME} (100-150 palabras)
- FAQ (${CONFIG.MIN_FAQS}-${CONFIG.MAX_FAQS} preguntas)

FORMATO DE RESPUESTA (JSON):
{
  "sections": [
    {
      "h2": "Resumen",
      "talking_points": ["Qué es", "Por qué importa", "Quién se beneficia"],
      "facts_to_include": ["Estadística X", "Referencia libro Y (página Z)"],
      "word_count_target": 180,
      "include_shortcode": null
    },
    {
      "h2": "Nombre de sección técnica",
      "talking_points": ["Punto 1", "Punto 2"],
      "facts_to_include": ["Dato técnico", "Herman (2019, p.42): cita"],
      "word_count_target": 350,
      "include_shortcode": "<see-also limit=\\"3\\" />"
    }
  ],
  "total_word_target": ${CONFIG.WORD_TARGET},
  "book_references": [
    {"source": "Herman (2019)", "page": 42, "topic": "estabilidad del carro"}
  ],
  "mexican_context": ["${CONFIG.MARKETS.join('", "')}"],
  "technical_specs": ["Box dimensions", "Pulley specs"],
  "gaps": ["Información faltante si existe"]
}`;

  const result = await generateText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: CONFIG.TEMPERATURE_STRUCTURED,
    maxTokens: 2500
  });

  const payload = extractJsonPayload(result.text);
  try {
    return JSON.parse(payload);
  } catch (e) {
    throw new Error(`Failed to parse outline JSON: ${e.message}\n\nResponse: ${result.text}`);
  }
}

// ============================================================================
// PASS 2: Generate Section (GPT-4o, ~40s per section)
// ============================================================================

async function generateSection(sectionPlan, researchContent, metadata, outline) {
  const model = getModel('main');

  const systemPrompt = `Eres un experto redactor de contenido Pilates para el mercado ${CONFIG.LANGUAGE}.

ESTILO:
- Profesional pero accesible
- Español mexicano natural
- Tono "tú" para engagement
- Práctico y accionable
- Enfocado en el usuario

REQUISITOS ESTRICTOS:
- Incluye TODOS los hechos y referencias mencionados
- Cita libros correctamente: "Según Herman (2019, p. 42), ..."
- Menciona contexto de mercado (${CONFIG.MARKETS.join('/')}, precios ${CONFIG.CURRENCY})
- Usa ejemplos específicos, no generalizaciones
- Añade notas de seguridad donde aplique
- NO hagas claims médicos (usa "consulta con un profesional")`;

  const userPrompt = `SECCIÓN A GENERAR: ${sectionPlan.h2}

TALKING POINTS:
${sectionPlan.talking_points.map(p => `- ${p}`).join('\n')}

HECHOS A INCLUIR (OBLIGATORIO):
${sectionPlan.facts_to_include.map(f => `- ${f}`).join('\n')}

CONTEXTO DEL BLOG:
- Título completo: ${metadata.title}
- Categoría: ${metadata.category}
- Keywords: ${metadata.keywords.slice(0, 3).join(', ')}

REFERENCIAS DE LIBROS DISPONIBLES:
${outline.book_references?.map(r => `- ${r.source}: ${r.topic}`).join('\n') || 'Ninguna'}

ESPECIFICACIONES TÉCNICAS:
${outline.technical_specs?.join(', ') || 'N/A'}

REQUISITOS:
- Longitud: ${sectionPlan.word_count_target} palabras (±20%)
- Incluye TODOS los hechos listados arriba
- Usa ejemplos específicos del mercado
- Segunda persona ("tú") para engagement
- Sin markdown headings (solo el contenido)

${sectionPlan.include_shortcode ? `\n⚠️ IMPORTANTE: Termina esta sección con el shortcode:\n${sectionPlan.include_shortcode}\n` : ''}

ESCRIBE SOLO EL CONTENIDO DE ESTA SECCIÓN (sin heading H2):`;

  const result = await generateText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: CONFIG.TEMPERATURE_CREATIVE,
    maxTokens: Math.ceil(sectionPlan.word_count_target * 2) // ~2 tokens per word in Spanish
  });

  let content = result.text.trim();

  // Add shortcode if specified and not already present
  if (sectionPlan.include_shortcode && !content.includes(sectionPlan.include_shortcode)) {
    content += `\n\n${sectionPlan.include_shortcode}`;
  }

  return content;
}

// ============================================================================
// PASS 3: Generate FAQs (GPT-4o-mini, 30s)
// ============================================================================

async function generateFAQs(researchContent, metadata, outline) {
  const model = getModel('fast');

  // Extract FAQ candidates from research
  const faqSection = extractSection(researchContent, /^##\s*(FAQ|Preguntas)/im);
  const faqCandidates = faqSection.match(/^\d+\).+/gm) || [];

  const systemPrompt = `Eres un experto en Pilates creando contenido FAQ para consumidores de ${CONFIG.LANGUAGE}.

ESTILO FAQ:
- Pregunta: directa y conversacional ("¿Cuál...?", "¿Cómo...?")
- Respuesta: 80-120 palabras, práctica y específica
- Incluye datos del mercado (precios ${CONFIG.CURRENCY}, ciudades, disponibilidad)
- Referencias a libros cuando aplique
- Disclaimers de seguridad para temas de salud`;

  const userPrompt = `TEMA: ${metadata.title}
CATEGORÍA: ${metadata.category}

CANDIDATOS DE FAQ DEL RESEARCH:
${faqCandidates.join('\n')}

CONTEXTO DE MERCADO:
${CONFIG.MARKETS.join(', ')}

REFERENCIAS DISPONIBLES:
${outline.book_references?.map(r => `- ${r.source}`).join('\n') || 'N/A'}

TAREA:
Genera ${CONFIG.MIN_FAQS}-${CONFIG.MAX_FAQS} FAQs con respuestas detalladas.

MEZCLA:
- 2-3 preguntas básicas (principiantes)
- 2-3 preguntas técnicas (intermedios/avanzados)
- 1-2 preguntas de mercado local (precios, disponibilidad)

FORMATO JSON:
{
  "faqs": [
    {
      "question": "¿Cuál es el tamaño ideal de box para mi reformer?",
      "answer": "El tamaño del box debe ser compatible con... [80-120 palabras con datos específicos]"
    }
  ]
}`;

  const result = await generateText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: CONFIG.TEMPERATURE_CREATIVE,
    maxTokens: 1500
  });

  const payload = extractJsonPayload(result.text);
  try {
    const parsed = JSON.parse(payload);
    return parsed.faqs || [];
  } catch (e) {
    // Fallback: try to extract FAQs from text
    log(`   ⚠️  JSON parse failed, attempting text extraction`);
    return extractFallbackFAQs(result.text);
  }
}

// ============================================================================
// PASS 4: Polish Content (GPT-4o-mini, 20s)
// ============================================================================

async function polishContent(fullContent, researchContent, metadata) {
  const model = getModel('fast');

  const systemPrompt = `Eres un editor de contenido senior para ${CONFIG.BRAND_NAME}.

TAREA:
Revisa y pule el contenido del blog para consistencia, fluidez y precisión.

VERIFICA:
1. Factual accuracy (compara con research)
2. Consistencia de tono y voz
3. Transiciones suaves entre secciones
4. Gramática y ortografía en ${CONFIG.LANGUAGE}
5. Referencias de libros citadas correctamente
6. Disclaimers de seguridad presentes
7. No hay texto de placeholder`;

  const userPrompt = `CONTENIDO DEL BLOG:
${fullContent}

ARCHIVO DE INVESTIGACIÓN (para verificar hechos):
${researchContent.slice(0, 3000)}...

TAREA:
- Corrige errores gramaticales
- Mejora transiciones entre secciones
- Verifica que todos los hechos sean precisos según el research
- Asegura consistencia en el uso de "tú"
- Ajusta cualquier frase awkward o poco natural

DEVUELVE EL CONTENIDO COMPLETO PULIDO (Markdown, sin frontmatter):`;

  const result = await generateText({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2, // Low for precision
    maxTokens: 4000
  });

  return result.text.trim();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function parseMetadata(slug, researchContent) {
  // Parse research file for title, category, keywords
  const titleMatch = researchContent.match(/^#\s*(.+?)(?:\s*—\s*Research|\s*\(MX)?$/m);
  const title = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, ' ');

  // Get category from TODO file
  const todoContent = await fs.readFile(CONFIG.TODO_FILE, 'utf-8');
  const category = extractCategoryFromTodo(todoContent, slug) || 'General';

  // Extract keywords from research
  const keywordsSection = extractSection(researchContent, /^##\s*(Palabras clave|Keywords)/im);
  const keywords = extractKeywords(keywordsSection);

  // Extract target audience
  const audienceSection = extractSection(researchContent, /^##\s*(Público|Target|Audience|Intención)/im);
  const targetAudience = audienceSection.split('\n')[0]?.replace(/^[-•*]\s*/, '').trim() || '';

  return {
    slug,
    title,
    category,
    keywords,
    targetAudience
  };
}

function extractCategoryFromTodo(todoContent, slug) {
  const lines = todoContent.split('\n');
  let currentCategory = '';

  for (const line of lines) {
    const catMatch = line.match(/^##\s*CATEGOR[ÍI]A:\s*(.+)$/i);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
    }
    if (line.includes(slug)) {
      return currentCategory;
    }
  }
  return '';
}

function extractSection(text, heading) {
  const match = text.match(new RegExp(`${heading.source}([\\s\\S]*?)(?=^##\\s|$)`, 'im'));
  return match ? match[1].trim() : '';
}

function extractKeywords(keywordsSection) {
  const keywords = [];
  const primaryMatch = keywordsSection.match(/Primar[ia][s]?:\s*(.+)/i);
  const secondaryMatch = keywordsSection.match(/Secundar[ia][s]?:\s*(.+)/i);

  if (primaryMatch) {
    keywords.push(...primaryMatch[1].split(',').map(k => k.trim()).filter(Boolean));
  }
  if (secondaryMatch) {
    keywords.push(...secondaryMatch[1].split(',').map(k => k.trim()).filter(Boolean).slice(0, 4));
  }

  return keywords.length ? keywords.slice(0, 5) : ['pilates', 'reformer'];
}

function assembleContent(sections, faqs, metadata) {
  const parts = [];

  // Title
  parts.push(`# ${metadata.title}\n`);

  // Medical disclaimer
  parts.push('> Nota: Contenido informativo; no es asesoramiento médico.\n');

  // Sections
  for (const section of sections) {
    parts.push(`## ${section.heading}\n`);
    parts.push(`${section.content}\n`);
  }

  // Brand recommendations section
  const brandSection = sections.find(s => s.heading.toLowerCase().includes(CONFIG.BRAND_NAME.toLowerCase()));
  if (!brandSection) {
    parts.push(`## Recomendaciones ${CONFIG.BRAND_NAME}\n`);
    parts.push(`${CONFIG.BRAND_NAME} ofrece ${CONFIG.BRAND_DESCRIPTION}. Asesoría en español, envío nacional y garantía.\n`);
  }

  // Hub list shortcode (if not already present)
  const hasHubList = sections.some(s => s.content.includes('<hub-list'));
  if (!hasHubList) {
    parts.push(`<hub-list category="${metadata.category}" limit="5" title="Más contenidos relacionados" />\n`);
  }

  // FAQs
  parts.push(`## FAQ\n`);
  for (const faq of faqs) {
    parts.push(`### ${faq.question}\n`);
    parts.push(`${faq.answer}\n`);
  }

  return parts.join('\n');
}

function buildFrontmatter(metadata) {
  const description = `Guía práctica sobre ${metadata.title.toLowerCase()} con enfoque en México: consejos y pasos accionables.`.slice(0, 155);
  const date = new Date().toISOString().split('T')[0];

  const lines = [
    '---',
    `title: "${metadata.title}"`,
    `description: "${description}"`,
    `category: "${metadata.category}"`,
    `tags: [${metadata.keywords.slice(0, 5).map(k => `"${k}"`).join(', ')}]`,
    `publishDate: "${date}"`,
    `author: "${CONFIG.BLOG_AUTHOR}"`,
    `slug: "${metadata.slug}"`,
    'featured: false',
    '---',
    ''
  ];

  return lines.join('\n');
}

function extractFallbackFAQs(text) {
  const faqs = [];
  const questionPattern = /(?:###?\s*)?(¿[^?]+\?)/g;
  let match;

  while ((match = questionPattern.exec(text)) !== null && faqs.length < CONFIG.MAX_FAQS) {
    const question = match[1].trim();
    const startIdx = match.index + match[0].length;
    const nextQuestionIdx = text.indexOf('¿', startIdx);
    const endIdx = nextQuestionIdx > 0 ? nextQuestionIdx : startIdx + 500;
    const answer = text.slice(startIdx, endIdx).trim().split('\n')[0] || 'Ver research file para detalles.';

    faqs.push({ question, answer });
  }

  return faqs.length ? faqs : [
    { question: '¿Cómo empiezo?', answer: 'Consulta el research file para detalles específicos.' }
  ];
}

function countWords(text) {
  const cleaned = text
    .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[#*_`]/g, ''); // Remove markdown syntax

  return cleaned.split(/\s+/).filter(Boolean).length;
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function log(message) {
  console.error(message); // Use stderr for logs (MCP convention)
}

// ============================================================================
// ADDITIONAL TOOLS: Regenerate Section & Preview Outline
// ============================================================================

async function regenerateSection(slug, sectionHeading) {
  log(`🔄 Regenerating section: ${sectionHeading}`);

  const blogFile = path.join(CONFIG.BLOG_OUTPUT_DIR, `${slug}.md`);
  if (!await fileExists(blogFile)) {
    throw new Error(`Blog file not found: ${blogFile}`);
  }

  const researchFile = path.join(CONFIG.RESEARCH_DIR, `${slug}.md`);
  const researchContent = await fs.readFile(researchFile, 'utf-8');
  const metadata = await parseMetadata(slug, researchContent);
  const outline = await generateOutline(researchContent, metadata);

  // Find section in outline
  const sectionPlan = outline.sections.find(s => s.h2 === sectionHeading);
  if (!sectionPlan) {
    throw new Error(`Section "${sectionHeading}" not found in outline`);
  }

  // Generate new content for this section
  const newContent = await generateSection(sectionPlan, researchContent, metadata, outline);

  // Replace section in blog file
  const blogContent = await fs.readFile(blogFile, 'utf-8');
  const sectionRegex = new RegExp(`(^##\\s*${escapeRegex(sectionHeading)}\\s*$[\\s\\S]*?)(?=^##\\s|$)`, 'im');
  const updated = blogContent.replace(sectionRegex, `## ${sectionHeading}\n${newContent}\n\n`);

  await fs.writeFile(blogFile, updated, 'utf-8');

  return {
    content: [{
      type: 'text',
      text: `Section "${sectionHeading}" regenerated successfully.\nWord count: ${countWords(newContent)}`
    }]
  };
}

async function previewOutline(slug) {
  const researchFile = path.join(CONFIG.RESEARCH_DIR, `${slug}.md`);
  if (!await fileExists(researchFile)) {
    throw new Error(`Research file not found: ${researchFile}`);
  }

  const researchContent = await fs.readFile(researchFile, 'utf-8');
  const metadata = await parseMetadata(slug, researchContent);
  const outline = await generateOutline(researchContent, metadata);

  const preview = `OUTLINE PREVIEW: ${metadata.title}

Category: ${metadata.category}
Target word count: ${outline.total_word_target}
Sections: ${outline.sections.length}

STRUCTURE:
${outline.sections.map((s, i) => `
${i + 1}. ${s.h2} (${s.word_count_target} words)
   Talking points:
${s.talking_points.map(p => `     - ${p}`).join('\n')}
   Facts to include:
${s.facts_to_include.map(f => `     - ${f}`).join('\n')}
   ${s.include_shortcode ? `Shortcode: ${s.include_shortcode}` : ''}
`).join('\n')}

BOOK REFERENCES:
${outline.book_references?.map(r => `- ${r.source} (p.${r.page}): ${r.topic}`).join('\n') || 'None'}

MEXICAN CONTEXT:
${outline.mexican_context?.join(', ') || 'N/A'}

GAPS IDENTIFIED:
${outline.gaps?.join('\n- ') || 'None'}`;

  return {
    content: [{ type: 'text', text: preview }]
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

server.onerror = (error) => console.error('[MCP Error]', error);

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Content Writer Agent MCP server running on stdio');
  const modelSummary = CONFIG.LLM_PROVIDER === 'gemini'
    ? `${CONFIG.GEMINI_MODEL} (main), ${CONFIG.GEMINI_MODEL_FAST} (fast)`
    : `${CONFIG.OPENAI_MODEL} (main), ${CONFIG.OPENAI_MODEL_FAST} (fast)`;
  console.error(`Provider: ${CONFIG.LLM_PROVIDER}`);
  console.error(`Model: ${modelSummary}`);
  console.error(`Target word count: ${CONFIG.WORD_TARGET}`);
}

main().catch(console.error);
