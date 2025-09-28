#!/usr/bin/env node

/**
 * MCP Server — SEO Metatag Optimization Agent
 * Optimizes blog posts for SEO with advanced meta tags, schema markup, and internal linking
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

const server = new Server(
  {
    name: 'seo-optimization-agent',
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
      name: 'optimize_title_and_meta',
      description: 'Optimize title and meta description for maximum CTR and SEO',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug' },
          target_keyword: { type: 'string', description: 'Primary target keyword' },
          intent: {
            type: 'string',
            enum: ['informational', 'commercial', 'transactional', 'navigational'],
            description: 'Search intent type'
          }
        },
        required: ['slug', 'target_keyword']
      }
    },
    {
      name: 'generate_schema_markup',
      description: 'Generate JSON-LD schema markup for blog post',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug' },
          schema_types: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Article', 'FAQPage', 'HowTo', 'Product', 'Review']
            },
            description: 'Schema types to generate'
          }
        },
        required: ['slug']
      }
    },
    {
      name: 'analyze_internal_linking',
      description: 'Analyze and suggest internal linking opportunities',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to analyze' }
        },
        required: ['slug']
      }
    },
    {
      name: 'optimize_headings_structure',
      description: 'Optimize H1-H6 structure for SEO and readability',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug' }
        },
        required: ['slug']
      }
    },
    {
      name: 'generate_meta_tags',
      description: 'Generate comprehensive meta tags including Open Graph and Twitter Cards',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug' }
        },
        required: ['slug']
      }
    },
    {
      name: 'audit_seo_compliance',
      description: 'Comprehensive SEO audit of blog post',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to audit' }
        },
        required: ['slug']
      }
    },
    {
      name: 'optimize_for_featured_snippets',
      description: 'Optimize content structure for featured snippets',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug' },
          snippet_type: {
            type: 'string',
            enum: ['paragraph', 'list', 'table', 'video'],
            description: 'Target featured snippet type'
          }
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
      case 'optimize_title_and_meta':
        return await optimizeTitleAndMeta(args.slug, args.target_keyword, args.intent);

      case 'generate_schema_markup':
        return await generateSchemaMarkup(args.slug, args.schema_types);

      case 'analyze_internal_linking':
        return await analyzeInternalLinking(args.slug);

      case 'optimize_headings_structure':
        return await optimizeHeadingsStructure(args.slug);

      case 'generate_meta_tags':
        return await generateMetaTags(args.slug);

      case 'audit_seo_compliance':
        return await auditSEOCompliance(args.slug);

      case 'optimize_for_featured_snippets':
        return await optimizeForFeaturedSnippets(args.slug, args.snippet_type);

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

async function optimizeTitleAndMeta(slug, targetKeyword, intent = 'informational') {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      throw new Error('No frontmatter found');
    }

    const currentTitle = content.match(/title:\s*"([^"]+)"/)?.[1] || '';
    const currentDescription = content.match(/description:\s*"([^"]+)"/)?.[1] || '';

    // Generate optimized titles based on intent
    const titleVariations = {
      informational: [
        `${targetKeyword}: Guía Completa 2025 | CAMA Pilates`,
        `Todo sobre ${targetKeyword} - Guía Experta México`,
        `${targetKeyword} Explicado: Beneficios y Técnicas`
      ],
      commercial: [
        `Mejor ${targetKeyword} México 2025 - Comparativa`,
        `${targetKeyword}: Cuál Elegir y Dónde Comprar`,
        `Top ${targetKeyword} Calidad-Precio México`
      ],
      transactional: [
        `Comprar ${targetKeyword} México - CAMA Pilates`,
        `${targetKeyword} Precio México - Ofertas 2025`,
        `${targetKeyword} Venta Online - Envío Gratis`
      ]
    };

    const metaDescriptions = {
      informational: `Descubre todo sobre ${targetKeyword} en nuestra guía completa. Beneficios, técnicas y consejos de expertos. ✓ Información actualizada 2025`,
      commercial: `Encuentra el mejor ${targetKeyword} para ti. Comparativas, precios y reseñas reales. ✓ Calidad garantizada ✓ Envío a toda México`,
      transactional: `Compra ${targetKeyword} con la mejor relación calidad-precio. ✓ Garantía extendida ✓ Financiamiento disponible ✓ Soporte técnico`
    };

    const optimizedTitles = titleVariations[intent] || titleVariations.informational;
    const optimizedDescription = metaDescriptions[intent] || metaDescriptions.informational;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          target_keyword: targetKeyword,
          intent: intent,
          current: {
            title: currentTitle,
            description: currentDescription
          },
          optimized: {
            title_suggestions: optimizedTitles,
            description_suggestion: optimizedDescription,
            title_length_check: optimizedTitles.map(t => ({ title: t, length: t.length, seo_score: t.length <= 60 ? 'good' : 'too_long' })),
            description_length_check: {
              length: optimizedDescription.length,
              seo_score: optimizedDescription.length >= 140 && optimizedDescription.length <= 160 ? 'perfect' : 'needs_adjustment'
            }
          },
          recommendations: [
            'Use primary keyword in first 60 characters of title',
            'Include brand name for branded queries',
            'Add year for freshness signals',
            'Use power words for higher CTR',
            'Ensure description includes call-to-action'
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to optimize title and meta for ${slug}: ${error.message}`);
  }
}

async function generateSchemaMarkup(slug, schemaTypes = ['Article']) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');
    const title = content.match(/title:\s*"([^"]+)"/)?.[1] || '';
    const description = content.match(/description:\s*"([^"]+)"/)?.[1] || '';
    const author = content.match(/author:\s*"([^"]+)"/)?.[1] || 'CAMA Pilates';
    const publishDate = content.match(/publishDate:\s*"([^"]+)"/)?.[1] || '';

    const schemas = {};

    if (schemaTypes.includes('Article')) {
      schemas.Article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "author": {
          "@type": "Organization",
          "name": author,
          "url": "https://camadepilates.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "CAMA Pilates",
          "logo": {
            "@type": "ImageObject",
            "url": "https://camadepilates.com/logo.png"
          }
        },
        "datePublished": publishDate,
        "dateModified": publishDate,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://camadepilates.com/blog/${slug}`
        }
      };
    }

    if (schemaTypes.includes('FAQPage')) {
      // Extract FAQ sections from content
      const faqMatches = content.match(/###\s+(.+?)\n([\s\S]*?)(?=###|\n##|\n$)/g);
      const faqItems = faqMatches?.map(match => {
        const [, question] = match.match(/###\s+(.+?)\n/) || [];
        const answer = match.replace(/###\s+.+?\n/, '').trim();
        return {
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        };
      }) || [];

      if (faqItems.length > 0) {
        schemas.FAQPage = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems
        };
      }
    }

    if (schemaTypes.includes('Product')) {
      schemas.Product = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Cama de Pilates Reformer CAMA",
        "description": "Reformer de Pilates profesional fabricado en México con ingeniería alemana",
        "brand": {
          "@type": "Brand",
          "name": "CAMA Pilates"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://camadepilates.com/products/reformer-premium",
          "priceCurrency": "MXN",
          "price": "2499.00",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "CAMA Pilates"
          }
        }
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          schema_markup: schemas,
          implementation_note: "Add these schemas to the blog post frontmatter or inject via script tags",
          seo_benefits: [
            "Enhanced search result appearance",
            "Rich snippets eligibility",
            "Better content understanding by search engines",
            "Improved click-through rates"
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to generate schema markup for ${slug}: ${error.message}`);
  }
}

async function analyzeInternalLinking(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Find existing internal links
    const internalLinks = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || [];
    const externalLinks = content.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g) || [];

    // Suggest internal linking opportunities
    const linkOpportunities = [
      {
        anchor_text: "cama de pilates para casa",
        target_url: "/blog/mejor-cama-de-pilates-para-casa",
        relevance_score: 9,
        context: "When discussing home Pilates equipment"
      },
      {
        anchor_text: "ejercicios de pilates",
        target_url: "/blog/ejercicios-pilates-principiantes",
        relevance_score: 8,
        context: "When mentioning specific exercises"
      },
      {
        anchor_text: "beneficios del pilates",
        target_url: "/blog/beneficios-pilates-salud",
        relevance_score: 8,
        context: "When discussing health benefits"
      },
      {
        anchor_text: "reformer profesional",
        target_url: "/products/reformer-premium",
        relevance_score: 9,
        context: "When discussing professional equipment"
      }
    ];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          current_links: {
            internal_links: internalLinks.length,
            external_links: externalLinks.length,
            link_list: internalLinks
          },
          link_opportunities: linkOpportunities,
          recommendations: [
            "Add 3-5 internal links per 1000 words",
            "Use descriptive anchor text with target keywords",
            "Link to both related blog posts and product pages",
            "Ensure links add value to user experience",
            "Balance between blog posts and commercial pages"
          ],
          seo_impact: {
            page_authority_distribution: "Spreads authority to linked pages",
            user_engagement: "Increases time on site and pages per session",
            crawlability: "Helps search engines discover and index content"
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to analyze internal linking for ${slug}: ${error.message}`);
  }
}

async function auditSEOCompliance(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Extract frontmatter
    const title = content.match(/title:\s*"([^"]+)"/)?.[1] || '';
    const description = content.match(/description:\s*"([^"]+)"/)?.[1] || '';
    const category = content.match(/category:\s*"([^"]+)"/)?.[1] || '';
    const tags = content.match(/tags:\s*\[(.*?)\]/)?.[1] || '';

    // Analyze content
    const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length;
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    const images = content.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
    const internalLinks = content.match(/\[([^\]]+)\]\(\/[^)]+\)/g) || [];
    const hasMetaDescription = !!description;
    const hasTags = !!tags;
    const hasFAQ = content.includes('## FAQ') || content.includes('# FAQ');

    const seoScore = {
      title: {
        score: title && title.length <= 60 && title.length >= 30 ? 100 : 70,
        issues: title.length > 60 ? ['Title too long'] : title.length < 30 ? ['Title too short'] : []
      },
      description: {
        score: hasMetaDescription && description.length >= 140 && description.length <= 160 ? 100 : 70,
        issues: !hasMetaDescription ? ['Missing meta description'] : description.length > 160 ? ['Description too long'] : description.length < 140 ? ['Description too short'] : []
      },
      content: {
        score: wordCount >= 1500 ? 100 : wordCount >= 1000 ? 80 : 60,
        issues: wordCount < 1000 ? ['Content too short for competitive keywords'] : []
      },
      structure: {
        score: headings.length >= 3 ? 100 : 70,
        issues: headings.length < 3 ? ['Needs more heading structure'] : []
      },
      engagement: {
        score: hasFAQ && internalLinks.length >= 3 ? 100 : 80,
        issues: !hasFAQ ? ['Missing FAQ section'] : internalLinks.length < 3 ? ['Needs more internal links'] : []
      }
    };

    const overallScore = Object.values(seoScore).reduce((sum, item) => sum + item.score, 0) / Object.keys(seoScore).length;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          seo_audit: {
            overall_score: Math.round(overallScore),
            grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : 'D',
            detailed_scores: seoScore,
            content_metrics: {
              word_count: wordCount,
              headings_count: headings.length,
              images_count: images.length,
              internal_links_count: internalLinks.length
            },
            critical_issues: Object.values(seoScore).flatMap(item => item.issues).filter(Boolean),
            quick_wins: [
              'Optimize title length (30-60 characters)',
              'Add meta description (140-160 characters)',
              'Include FAQ section for featured snippets',
              'Add 3-5 internal links',
              'Ensure minimum 1500 words for competitive keywords'
            ]
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to audit SEO compliance for ${slug}: ${error.message}`);
  }
}

async function optimizeForFeaturedSnippets(slug, snippetType = 'paragraph') {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    const optimizations = {
      paragraph: {
        structure: "Answer the question directly in 40-60 words",
        example: "¿Qué es una cama de pilates? Una cama de pilates o reformer es un equipo de ejercicio que utiliza poleas, resortes y una plataforma deslizable para realizar ejercicios de resistencia controlada, mejorando la fuerza, flexibilidad y postura corporal.",
        implementation: [
          "Start section with the exact question as H2/H3",
          "Provide direct answer in first paragraph",
          "Keep answer between 40-60 words",
          "Use simple, clear language"
        ]
      },
      list: {
        structure: "Create numbered or bulleted lists",
        example: "Beneficios del pilates:\n1. Mejora la postura corporal\n2. Fortalece el core\n3. Aumenta la flexibilidad\n4. Reduce el dolor de espalda\n5. Mejora la coordinación",
        implementation: [
          "Use clear list formatting (numbered or bulleted)",
          "Keep list items concise (5-10 words each)",
          "Include 3-8 items for optimal snippet length",
          "Use parallel structure for all items"
        ]
      },
      table: {
        structure: "Organize comparative data in tables",
        example: "| Modelo | Precio | Dimensiones | Peso |\n|--------|--------|-------------|------|\n| Basic | $1,999 MXN | 220x60cm | 45kg |\n| Premium | $2,499 MXN | 240x65cm | 52kg |",
        implementation: [
          "Use markdown table format",
          "Include relevant comparison data",
          "Keep column headers descriptive",
          "Limit to 3-5 columns for readability"
        ]
      }
    };

    const optimization = optimizations[snippetType];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          snippet_type: snippetType,
          optimization_guide: optimization,
          content_analysis: {
            current_structure: "Analyze existing content for snippet opportunities",
            recommended_sections: [
              "What is... (definition snippets)",
              "How to... (process snippets)",
              "Best... (list snippets)",
              "Comparison tables (table snippets)"
            ]
          },
          implementation_tips: [
            "Use question-based headings",
            "Provide immediate, direct answers",
            "Structure content for scanability",
            "Include target keywords naturally",
            "Optimize for voice search queries"
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to optimize for featured snippets ${slug}: ${error.message}`);
  }
}

async function optimizeHeadingsStructure(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');
    const headings = content.match(/^(#{1,6})\s+(.+)$/gm) || [];

    const headingAnalysis = headings.map(heading => {
      const level = heading.match(/^#{1,6}/)[0].length;
      const text = heading.replace(/^#{1,6}\s+/, '');
      return { level, text, heading };
    });

    const structureIssues = [];
    let currentLevel = 1;

    headingAnalysis.forEach((heading, index) => {
      if (index === 0 && heading.level !== 1) {
        structureIssues.push(`First heading should be H1, found H${heading.level}`);
      }
      if (heading.level > currentLevel + 1) {
        structureIssues.push(`Heading level jumps from H${currentLevel} to H${heading.level}: "${heading.text}"`);
      }
      currentLevel = heading.level;
    });

    const optimizedStructure = [
      "# Main Title (H1) - Only one per page",
      "## Introduction/Overview (H2)",
      "## Main Topic 1 (H2)",
      "### Subtopic 1.1 (H3)",
      "### Subtopic 1.2 (H3)",
      "## Main Topic 2 (H2)",
      "### Subtopic 2.1 (H3)",
      "## FAQ (H2)",
      "### Question 1 (H3)",
      "### Question 2 (H3)"
    ];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          current_structure: headingAnalysis,
          structure_issues: structureIssues,
          seo_score: structureIssues.length === 0 ? 'Excellent' : structureIssues.length <= 2 ? 'Good' : 'Needs Improvement',
          recommended_structure: optimizedStructure,
          best_practices: [
            "Use only one H1 per page (usually the title)",
            "Create logical hierarchy (H1 → H2 → H3, etc.)",
            "Don't skip heading levels",
            "Include target keywords in headings naturally",
            "Keep headings descriptive and scannable",
            "Use H2 for main sections, H3 for subsections"
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to optimize heading structure for ${slug}: ${error.message}`);
  }
}

async function generateMetaTags(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');
    const title = content.match(/title:\s*"([^"]+)"/)?.[1] || '';
    const description = content.match(/description:\s*"([^"]+)"/)?.[1] || '';
    const heroImage = content.match(/heroImage:\s*"([^"]+)"/)?.[1] || '/images/default-og.jpg';

    const metaTags = {
      basic: [
        `<title>${title}</title>`,
        `<meta name="description" content="${description}">`,
        `<meta name="keywords" content="pilates, reformer, ejercicios, mexico, cama pilates">`,
        `<meta name="author" content="CAMA Pilates">`,
        `<meta name="robots" content="index, follow">`
      ],
      openGraph: [
        `<meta property="og:title" content="${title}">`,
        `<meta property="og:description" content="${description}">`,
        `<meta property="og:image" content="https://camadepilates.com${heroImage}">`,
        `<meta property="og:url" content="https://camadepilates.com/blog/${slug}">`,
        `<meta property="og:type" content="article">`,
        `<meta property="og:site_name" content="CAMA Pilates">`,
        `<meta property="og:locale" content="es_MX">`
      ],
      twitter: [
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${title}">`,
        `<meta name="twitter:description" content="${description}">`,
        `<meta name="twitter:image" content="https://camadepilates.com${heroImage}">`,
        `<meta name="twitter:site" content="@CamaPilates">`
      ],
      technical: [
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        `<meta http-equiv="X-UA-Compatible" content="IE=edge">`,
        `<meta name="theme-color" content="#2563eb">`,
        `<link rel="canonical" href="https://camadepilates.com/blog/${slug}">`
      ]
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          meta_tags: metaTags,
          implementation_note: "Add these meta tags to the HTML head section",
          validation_checklist: [
            "Title length: 30-60 characters",
            "Description length: 140-160 characters",
            "OG image: 1200x630px minimum",
            "Canonical URL matches page URL",
            "All URLs use HTTPS protocol"
          ],
          testing_tools: [
            "Facebook Sharing Debugger",
            "Twitter Card Validator",
            "Google Rich Results Test",
            "SEO meta tag analyzers"
          ]
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to generate meta tags for ${slug}: ${error.message}`);
  }
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);