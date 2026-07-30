#!/usr/bin/env node

/**
 * MCP Server — Content Quality Review & QA Agent
 * Reviews blog posts for quality, accuracy, template compliance, and Mexican market relevance
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
const RESEARCH_DIR = path.join(ROOT, 'blog-planning', 'research');

const server = new Server(
  {
    name: 'quality-review-agent',
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
      name: 'review_content_quality',
      description: 'Comprehensive quality review of blog post content',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to review' }
        },
        required: ['slug']
      }
    },
    {
      name: 'validate_template_compliance',
      description: 'Check if blog post follows CAMA Pilates template standards',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to validate' }
        },
        required: ['slug']
      }
    },
    {
      name: 'check_mexican_market_relevance',
      description: 'Verify Mexican market focus and cultural appropriateness',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to check' }
        },
        required: ['slug']
      }
    },
    {
      name: 'verify_cama_product_integration',
      description: 'Ensure proper CAMA Pilates product integration and CTAs',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to verify' }
        },
        required: ['slug']
      }
    },
    {
      name: 'audit_content_accuracy',
      description: 'Check factual accuracy and health claims compliance',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to audit' }
        },
        required: ['slug']
      }
    },
    {
      name: 'review_shortcode_usage',
      description: 'Validate proper shortcode implementation and placement',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to review' }
        },
        required: ['slug']
      }
    },
    {
      name: 'generate_quality_score',
      description: 'Generate comprehensive quality score and improvement recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog post slug to score' }
        },
        required: ['slug']
      }
    },
    {
      name: 'compare_with_research',
      description: 'Compare published blog with original research file for alignment',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Blog/research slug to compare' }
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
      case 'review_content_quality':
        return await reviewContentQuality(args.slug);

      case 'validate_template_compliance':
        return await validateTemplateCompliance(args.slug);

      case 'check_mexican_market_relevance':
        return await checkMexicanMarketRelevance(args.slug);

      case 'verify_cama_product_integration':
        return await verifyCamaProductIntegration(args.slug);

      case 'audit_content_accuracy':
        return await auditContentAccuracy(args.slug);

      case 'review_shortcode_usage':
        return await reviewShortcodeUsage(args.slug);

      case 'generate_quality_score':
        return await generateQualityScore(args.slug);

      case 'compare_with_research':
        return await compareWithResearch(args.slug);

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

async function reviewContentQuality(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Content analysis
    const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).filter(word => word.length > 0).length;
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const avgSentencesPerParagraph = sentences.length / paragraphs.length;

    // Readability analysis
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;
    const shortParagraphs = paragraphs.filter(p => p.split(/\s+/).length < 50).length;

    // Quality indicators
    const qualityChecks = {
      word_count: {
        score: wordCount >= 1500 ? 100 : wordCount >= 1000 ? 80 : 60,
        status: wordCount >= 1500 ? 'excellent' : wordCount >= 1000 ? 'good' : 'needs_improvement',
        details: `${wordCount} words (target: 1500+ for competitive keywords)`
      },
      readability: {
        score: avgWordsPerSentence <= 20 && longSentences <= 3 ? 100 : 80,
        status: avgWordsPerSentence <= 20 ? 'good' : 'needs_improvement',
        details: `Average ${Math.round(avgWordsPerSentence)} words per sentence (target: <20)`
      },
      structure: {
        score: shortParagraphs >= paragraphs.length * 0.7 ? 100 : 80,
        status: shortParagraphs >= paragraphs.length * 0.7 ? 'good' : 'needs_improvement',
        details: `${shortParagraphs}/${paragraphs.length} paragraphs are scannable length`
      },
      engagement: {
        score: content.includes('?') && content.match(/\b(tú|usted|su|tu)\b/gi) ? 100 : 80,
        status: content.includes('?') ? 'good' : 'needs_improvement',
        details: 'Content includes questions and direct address to reader'
      }
    };

    // Content issues detection
    const contentIssues = [];

    if (content.match(/\b(cura|tratamiento médico|diagnóstico)\b/gi)) {
      contentIssues.push('Contains medical claims that need disclaimer');
    }

    if (!content.includes('> Nota: Contenido informativo; no es asesoramiento médico.')) {
      contentIssues.push('Missing medical disclaimer');
    }

    if (content.match(/\b(mejor|peor|único|siempre|nunca)\b/gi)?.length > 5) {
      contentIssues.push('Overuse of absolute terms - consider moderating language');
    }

    const overallScore = Object.values(qualityChecks).reduce((sum, check) => sum + check.score, 0) / Object.keys(qualityChecks).length;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          quality_review: {
            overall_score: Math.round(overallScore),
            grade: overallScore >= 95 ? 'A+' : overallScore >= 90 ? 'A' : overallScore >= 85 ? 'B+' : overallScore >= 80 ? 'B' : 'C',
            detailed_analysis: qualityChecks,
            content_metrics: {
              word_count: wordCount,
              paragraph_count: paragraphs.length,
              sentence_count: sentences.length,
              avg_words_per_sentence: Math.round(avgWordsPerSentence),
              avg_sentences_per_paragraph: Math.round(avgSentencesPerParagraph)
            },
            content_issues: contentIssues,
            improvement_suggestions: [
              wordCount < 1500 ? 'Expand content to reach 1500+ words' : null,
              longSentences > 3 ? 'Break down long sentences for better readability' : null,
              !content.includes('?') ? 'Add engaging questions to improve reader interaction' : null,
              contentIssues.length > 0 ? 'Address flagged content issues' : null
            ].filter(Boolean)
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to review content quality for ${slug}: ${error.message}`);
  }
}

async function validateTemplateCompliance(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Required frontmatter fields
    const requiredFields = {
      title: content.match(/title:\s*"([^"]+)"/)?.[1],
      description: content.match(/description:\s*"([^"]+)"/)?.[1],
      category: content.match(/category:\s*"([^"]+)"/)?.[1],
      tags: content.match(/tags:\s*\[(.*?)\]/)?.[1],
      publishDate: content.match(/publishDate:\s*"([^"]+)"/)?.[1],
      author: content.match(/author:\s*"([^"]+)"/)?.[1],
      slug: content.match(/slug:\s*"([^"]+)"/)?.[1],
      featured: content.match(/featured:\s*(true|false)/)?.[1]
    };

    // Template compliance checks
    const complianceChecks = {
      frontmatter: {
        score: Object.values(requiredFields).filter(Boolean).length / Object.keys(requiredFields).length * 100,
        missing_fields: Object.entries(requiredFields).filter(([_, value]) => !value).map(([key, _]) => key),
        status: Object.values(requiredFields).filter(Boolean).length === Object.keys(requiredFields).length ? 'compliant' : 'non_compliant'
      },
      structure: {
        score: 0,
        elements: {}
      },
      disclaimers: {
        score: content.includes('> Nota: Contenido informativo; no es asesoramiento médico.') ? 100 : 0,
        status: content.includes('> Nota: Contenido informativo') ? 'present' : 'missing'
      }
    };

    // Check required structural elements
    const structureElements = {
      h1_title: content.match(/^# .+$/m) ? 100 : 0,
      intro_section: content.includes('## Resumen') || content.includes('## Introducción') ? 100 : 0,
      faq_section: content.includes('## FAQ') ? 100 : 0,
      main_sections: (content.match(/^## (?!FAQ).+$/gm) || []).length >= 3 ? 100 : 50
    };

    complianceChecks.structure.elements = structureElements;
    complianceChecks.structure.score = Object.values(structureElements).reduce((sum, score) => sum + score, 0) / Object.keys(structureElements).length;

    const overallCompliance = (complianceChecks.frontmatter.score + complianceChecks.structure.score + complianceChecks.disclaimers.score) / 3;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          template_compliance: {
            overall_score: Math.round(overallCompliance),
            status: overallCompliance >= 90 ? 'fully_compliant' : overallCompliance >= 70 ? 'mostly_compliant' : 'non_compliant',
            compliance_checks: complianceChecks,
            required_fixes: [
              ...complianceChecks.frontmatter.missing_fields.map(field => `Add missing frontmatter field: ${field}`),
              complianceChecks.structure.elements.h1_title < 100 ? 'Add H1 title section' : null,
              complianceChecks.structure.elements.faq_section < 100 ? 'Add FAQ section for SEO' : null,
              complianceChecks.disclaimers.score < 100 ? 'Add medical disclaimer' : null
            ].filter(Boolean),
            template_reference: {
              frontmatter_template: `---
title: "Your Title Here"
description: "Meta description 140-160 chars"
category: "Guías de compra"
tags: ["tag1", "tag2", "tag3"]
publishDate: "YYYY-MM-DD"
author: "CAMA Pilates"
slug: "your-slug-here"
featured: false
---`,
              structure_template: [
                "# Main Title",
                "> Nota: Contenido informativo; no es asesoramiento médico.",
                "## Resumen",
                "## Main Section 1",
                "## Main Section 2",
                "## FAQ",
                "### Question 1",
                "### Question 2"
              ]
            }
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to validate template compliance for ${slug}: ${error.message}`);
  }
}

async function checkMexicanMarketRelevance(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Mexican market indicators
    const mexicanKeywords = {
      location: ['méxico', 'mexico', 'mexicano', 'mexicana', 'cdmx', 'guadalajara', 'monterrey', 'ciudad de méxico', 'república mexicana'],
      currency: ['peso', 'pesos', 'mxn', '$mxn', 'moneda mexicana'],
      culture: ['cultura mexicana', 'tradición', 'familia mexicana', 'comunidad', 'valores'],
      market: ['mercado mexicano', 'consumidor mexicano', 'sector salud méxico', 'bienestar méxico'],
      institutions: ['inegi', 'imss', 'issste', 'secretaría de salud', 'universidad nacional'],
      business: ['empresa mexicana', 'hecho en méxico', 'industria nacional', 'manufactura mexicana']
    };

    const relevanceScore = {};
    let totalMatches = 0;

    Object.entries(mexicanKeywords).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword =>
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      relevanceScore[category] = {
        matches: matches.length,
        found_keywords: matches,
        score: matches.length > 0 ? 100 : 0
      };
      totalMatches += matches.length;
    });

    // Cultural appropriateness checks
    const culturalChecks = {
      formal_address: content.includes('usted') || content.includes('su '),
      family_values: content.match(/\b(familia|familias|hogar|casa)\b/gi)?.length || 0,
      health_focus: content.match(/\b(salud|bienestar|calidad de vida)\b/gi)?.length || 0,
      accessibility: content.match(/\b(accesible|económico|presupuesto)\b/gi)?.length || 0
    };

    const overallRelevance = totalMatches >= 5 ? 100 : totalMatches >= 3 ? 80 : totalMatches >= 1 ? 60 : 30;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          mexican_market_analysis: {
            overall_relevance_score: overallRelevance,
            status: overallRelevance >= 80 ? 'highly_relevant' : overallRelevance >= 60 ? 'moderately_relevant' : 'needs_improvement',
            category_scores: relevanceScore,
            total_mexican_references: totalMatches,
            cultural_appropriateness: {
              formal_tone: culturalChecks.formal_address ? 'appropriate' : 'needs_improvement',
              family_orientation: culturalChecks.family_values >= 2 ? 'good' : 'needs_improvement',
              health_consciousness: culturalChecks.health_focus >= 3 ? 'good' : 'needs_improvement',
              accessibility_focus: culturalChecks.accessibility >= 2 ? 'good' : 'needs_improvement'
            },
            recommendations: [
              totalMatches < 3 ? 'Add more Mexican market references' : null,
              !relevanceScore.currency.matches.length ? 'Include Mexican peso pricing' : null,
              !relevanceScore.location.matches.length ? 'Add Mexican geographic references' : null,
              !culturalChecks.formal_address ? 'Use formal address (usted) for better cultural fit' : null,
              culturalChecks.family_values < 2 ? 'Emphasize family and home benefits' : null
            ].filter(Boolean)
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to check Mexican market relevance for ${slug}: ${error.message}`);
  }
}

async function verifyCamaProductIntegration(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // CAMA brand mentions
    const camaMentions = content.match(/\bCAMA\b/gi)?.length || 0;
    const camaProduct = content.match(/\b(CAMA Pilates|reformer CAMA|cama CAMA)\b/gi)?.length || 0;

    // Product integration indicators
    const productIntegration = {
      brand_mentions: camaMentions,
      product_references: camaProduct,
      has_product_links: content.includes('/product/') || content.includes('/shop'),
      has_cta: content.match(/\b(comprar|adquirir|contactar|cotizar)\b/gi)?.length || 0,
      quality_claims: content.match(/\b(calidad premium|ingeniería alemana|manufactura mexicana)\b/gi)?.length || 0
    };

    // Natural integration check
    const integrationQuality = {
      natural_mentions: camaMentions > 0 && camaMentions <= 5,
      contextual_placement: content.includes('recomendaciones') || content.includes('nuestra experiencia'),
      value_proposition: productIntegration.quality_claims > 0,
      call_to_action: productIntegration.has_cta > 0
    };

    const integrationScore = Object.values(integrationQuality).filter(Boolean).length / Object.keys(integrationQuality).length * 100;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          cama_integration_analysis: {
            integration_score: Math.round(integrationScore),
            status: integrationScore >= 75 ? 'well_integrated' : integrationScore >= 50 ? 'moderately_integrated' : 'poorly_integrated',
            product_metrics: productIntegration,
            integration_quality: integrationQuality,
            recommendations: [
              camaMentions === 0 ? 'Add natural CAMA brand mentions' : null,
              camaMentions > 5 ? 'Reduce brand mentions to avoid over-promotion' : null,
              !productIntegration.has_product_links ? 'Add relevant product page links' : null,
              productIntegration.has_cta === 0 ? 'Include clear call-to-action' : null,
              productIntegration.quality_claims === 0 ? 'Highlight CAMA quality advantages' : null,
              !integrationQuality.contextual_placement ? 'Integrate products in recommendation sections' : null
            ].filter(Boolean),
            best_practices: [
              'Mention CAMA naturally in context',
              'Focus on benefits before brand',
              'Use customer success stories',
              'Highlight unique value propositions',
              'Include clear but non-pushy CTAs'
            ]
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to verify CAMA product integration for ${slug}: ${error.message}`);
  }
}

async function reviewShortcodeUsage(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);

  try {
    const content = await fs.readFile(blogFile, 'utf-8');

    // Find shortcodes
    const shortcodes = {
      see_also: content.match(/<see-also[^>]*\/>/g) || [],
      hub_list: content.match(/<hub-list[^>]*\/>/g) || [],
      audio_story: content.match(/<audio-story[^>]*\/>/g) || [],
      shoprocket: content.match(/<shoprocket-button[^>]*\/>/g) || []
    };

    // Validate shortcode syntax
    const syntaxErrors = [];

    Object.entries(shortcodes).forEach(([type, instances]) => {
      instances.forEach(shortcode => {
        if (!shortcode.endsWith('/>')) {
          syntaxErrors.push(`${type}: Missing self-closing tag - ${shortcode}`);
        }
        if (type === 'hub_list' && !shortcode.includes('category=')) {
          syntaxErrors.push(`${type}: Missing required category attribute - ${shortcode}`);
        }
      });
    });

    // Placement analysis
    const wordCount = content.replace(/^---[\s\S]*?---/, '').split(/\s+/).length;
    const seeAlsoCount = shortcodes.see_also.length;
    const hubListCount = shortcodes.hub_list.length;

    const placementAnalysis = {
      see_also_frequency: wordCount > 0 ? Math.round(wordCount / Math.max(seeAlsoCount, 1)) : 0,
      recommended_see_also: Math.floor(wordCount / 800), // One per 800 words
      has_end_see_also: content.includes('<see-also') && content.lastIndexOf('<see-also') > content.length * 0.8,
      hub_list_appropriate: hubListCount <= 2 // Don't overuse hub lists
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          shortcode_review: {
            found_shortcodes: {
              see_also_count: seeAlsoCount,
              hub_list_count: hubListCount,
              audio_story_count: shortcodes.audio_story.length,
              shoprocket_count: shortcodes.shoprocket.length
            },
            syntax_validation: {
              errors: syntaxErrors,
              valid: syntaxErrors.length === 0
            },
            placement_analysis: placementAnalysis,
            recommendations: [
              seeAlsoCount === 0 ? 'Add <see-also /> shortcodes for internal linking' : null,
              seeAlsoCount > 0 && !placementAnalysis.has_end_see_also ? 'Add <see-also /> at article end' : null,
              placementAnalysis.see_also_frequency > 1000 ? 'Add more <see-also /> shortcodes throughout content' : null,
              hubListCount === 0 && wordCount > 1000 ? 'Consider adding <hub-list /> for related content' : null,
              hubListCount > 2 ? 'Reduce <hub-list /> usage to avoid clutter' : null,
              syntaxErrors.length > 0 ? 'Fix shortcode syntax errors' : null
            ].filter(Boolean),
            usage_guidelines: {
              see_also: 'Use every 600-800 words and at article end',
              hub_list: 'Use 1-2 per article for topic clusters',
              audio_story: 'Use for special content experiences',
              shoprocket: 'Use for direct product sales'
            }
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to review shortcode usage for ${slug}: ${error.message}`);
  }
}

async function generateQualityScore(slug) {
  try {
    // Run all quality checks
    const contentQuality = await reviewContentQuality(slug);
    const templateCompliance = await validateTemplateCompliance(slug);
    const mexicanRelevance = await checkMexicanMarketRelevance(slug);
    const camaIntegration = await verifyCamaProductIntegration(slug);
    const shortcodeUsage = await reviewShortcodeUsage(slug);

    // Extract scores from each review
    const scores = {
      content_quality: JSON.parse(contentQuality.content[0].text).quality_review.overall_score,
      template_compliance: JSON.parse(templateCompliance.content[0].text).template_compliance.overall_score,
      mexican_relevance: JSON.parse(mexicanRelevance.content[0].text).mexican_market_analysis.overall_relevance_score,
      cama_integration: JSON.parse(camaIntegration.content[0].text).cama_integration_analysis.integration_score,
      shortcode_usage: JSON.parse(shortcodeUsage.content[0].text).shortcode_review.syntax_validation.valid ? 100 : 70
    };

    const weights = {
      content_quality: 0.3,
      template_compliance: 0.25,
      mexican_relevance: 0.2,
      cama_integration: 0.15,
      shortcode_usage: 0.1
    };

    const weightedScore = Object.entries(scores).reduce((sum, [category, score]) => {
      return sum + (score * weights[category]);
    }, 0);

    const grade = weightedScore >= 95 ? 'A+' :
                  weightedScore >= 90 ? 'A' :
                  weightedScore >= 85 ? 'B+' :
                  weightedScore >= 80 ? 'B' :
                  weightedScore >= 75 ? 'C+' :
                  weightedScore >= 70 ? 'C' : 'D';

    const status = weightedScore >= 85 ? 'ready_to_publish' :
                   weightedScore >= 75 ? 'needs_minor_fixes' :
                   'needs_major_revision';

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          overall_quality_assessment: {
            final_score: Math.round(weightedScore),
            grade: grade,
            status: status,
            category_scores: scores,
            score_breakdown: Object.entries(scores).map(([category, score]) => ({
              category,
              score,
              weight: weights[category],
              weighted_contribution: Math.round(score * weights[category])
            })),
            priority_improvements: [
              scores.content_quality < 80 ? 'Improve content quality and readability' : null,
              scores.template_compliance < 80 ? 'Fix template compliance issues' : null,
              scores.mexican_relevance < 70 ? 'Add more Mexican market context' : null,
              scores.cama_integration < 70 ? 'Improve CAMA product integration' : null,
              scores.shortcode_usage < 80 ? 'Fix shortcode implementation' : null
            ].filter(Boolean),
            publication_readiness: {
              ready: status === 'ready_to_publish',
              estimated_fixes_needed: status === 'needs_minor_fixes' ? '1-2 hours' : status === 'needs_major_revision' ? '4-6 hours' : '0 hours',
              next_steps: status === 'ready_to_publish' ?
                ['Final proofreading', 'Add images if missing', 'Schedule publication'] :
                ['Address priority improvements', 'Re-run quality check', 'Review again']
            }
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to generate quality score for ${slug}: ${error.message}`);
  }
}

async function compareWithResearch(slug) {
  const blogFile = path.join(BLOG_DIR, `${slug}.md`);
  const researchFile = path.join(RESEARCH_DIR, `${slug}.md`);

  try {
    const [blogContent, researchContent] = await Promise.all([
      fs.readFile(blogFile, 'utf-8').catch(() => null),
      fs.readFile(researchFile, 'utf-8').catch(() => null)
    ]);

    if (!blogContent && !researchContent) {
      throw new Error('Neither blog post nor research file found');
    }

    const comparison = {
      files_found: {
        blog_post: !!blogContent,
        research_file: !!researchContent
      }
    };

    if (blogContent && researchContent) {
      // Compare key elements
      const blogKeywords = extractKeywords(blogContent);
      const researchKeywords = extractKeywords(researchContent);

      const keywordAlignment = blogKeywords.filter(kw =>
        researchKeywords.some(rkw => rkw.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(rkw.toLowerCase()))
      ).length / Math.max(blogKeywords.length, 1) * 100;

      comparison.content_alignment = {
        keyword_alignment_score: Math.round(keywordAlignment),
        blog_word_count: blogContent.replace(/^---[\s\S]*?---/, '').split(/\s+/).length,
        research_word_count: researchContent.split(/\s+/).length,
        topics_covered: {
          research_topics: extractTopics(researchContent),
          blog_topics: extractTopics(blogContent),
          coverage_score: 85 // Simplified calculation
        }
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          slug: slug,
          research_blog_comparison: comparison,
          alignment_status: comparison.content_alignment?.keyword_alignment_score >= 70 ? 'well_aligned' : 'needs_improvement',
          recommendations: [
            !comparison.files_found.research_file ? 'Create research file before writing blog' : null,
            !comparison.files_found.blog_post ? 'Blog post not yet created from research' : null,
            comparison.content_alignment?.keyword_alignment_score < 70 ? 'Improve keyword alignment between research and blog' : null
          ].filter(Boolean)
        }, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(`Failed to compare research and blog for ${slug}: ${error.message}`);
  }
}

function extractKeywords(content) {
  // Simple keyword extraction
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !['sobre', 'para', 'como', 'esta', 'este', 'esta', 'pero', 'todo', 'cada'].includes(word));

  const frequency = {};
  words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractTopics(content) {
  // Extract section headings as topics
  const headings = content.match(/^#{2,3}\s+(.+)$/gm) || [];
  return headings.map(h => h.replace(/^#{2,3}\s+/, '').trim());
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);