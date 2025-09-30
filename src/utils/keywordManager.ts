/**
 * Keyword Management System
 * Systematic approach to keyword integration and tracking
 */

export interface Keyword {
  id: string;
  term: string;
  category: string;
  searchVolume?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  usageCount: number;
  lastUsed?: string;
  synonyms?: string[];
  relatedTerms?: string[];
  targetDensity?: number; // Target keyword density (0.5-2.5%)
}

export interface KeywordContext {
  primary: string;
  secondary: string[];
  longtail: string[];
  semantic: string[];
}

export interface BlogKeywordStrategy {
  title: KeywordContext;
  headers: KeywordContext;
  content: KeywordContext;
  meta: KeywordContext;
}

/**
 * Core keyword categories for Pilates content
 */
export const PILATES_KEYWORD_CATEGORIES = {
  'Ejercicios': [
    'pilates reformer',
    'ejercicios pilates',
    'pilates mat',
    'pilates embarazo',
    'pilates posparto',
    'pilates lactancia',
    'pilates espalda',
    'pilates abdominales',
    'ejercicios core'
  ],
  'Equipamiento': [
    'reformer pilates precio',
    'cama pilates',
    'equipo pilates',
    'maquina pilates',
    'aparatos pilates',
    'reformer pilates mexico',
    'pilates tower',
    'cadillac pilates'
  ],
  'Condiciones Médicas': [
    'pilates terapéutico',
    'pilates rehabilitación',
    'pilates lesiones',
    'pilates cáncer mama',
    'pilates dolor espalda',
    'pilates artritis',
    'pilates fibromialgia'
  ],
  'Negocio': [
    'estudio pilates',
    'instructor pilates',
    'certificación pilates',
    'negocio pilates',
    'franquicia pilates',
    'clases pilates precio',
    'marketing pilates'
  ],
  'Deportes': [
    'pilates golf',
    'pilates tenis',
    'pilates runners',
    'pilates futbol',
    'pilates crossfit',
    'entrenamiento deportivo'
  ],
  'Ubicación México': [
    'pilates mexico',
    'pilates cdmx',
    'pilates guadalajara',
    'pilates monterrey',
    'pilates cancun',
    'clases pilates df'
  ]
} as const;

/**
 * Semantic keyword relationships for natural content flow
 */
export const SEMANTIC_RELATIONS = {
  'reformer': ['cama', 'máquina', 'aparato', 'equipo'],
  'pilates': ['ejercicio', 'entrenamiento', 'acondicionamiento', 'método'],
  'instructor': ['maestro', 'profesor', 'entrenador', 'especialista'],
  'estudio': ['gimnasio', 'centro', 'escuela', 'academia'],
  'certificación': ['capacitación', 'formación', 'curso', 'diploma']
} as const;

export class KeywordManager {
  private keywords: Map<string, Keyword> = new Map();

  constructor(initialKeywords: Keyword[] = []) {
    this.loadInitialKeywords(initialKeywords);
  }

  private loadInitialKeywords(keywords: Keyword[]) {
    keywords.forEach(keyword => {
      this.keywords.set(keyword.id, keyword);
    });
  }

  /**
   * Add a new keyword to the system
   */
  addKeyword(keyword: Omit<Keyword, 'id' | 'usageCount'>): Keyword {
    const id = keyword.term.toLowerCase().trim().replace(/\s+/g, '-');
    const newKeyword: Keyword = {
      ...keyword,
      id,
      usageCount: 0,
    };

    this.keywords.set(id, newKeyword);
    return newKeyword;
  }

  /**
   * Get keyword by ID
   */
  getKeyword(id: string): Keyword | undefined {
    return this.keywords.get(id);
  }

  /**
   * Get all keywords, optionally filtered by category
   */
  getKeywords(category?: string): Keyword[] {
    const keywords = Array.from(this.keywords.values());
    return category
      ? keywords.filter(k => k.category === category)
      : keywords.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get keyword suggestions for a topic
   */
  suggestKeywords(topic: string, category?: string): Keyword[] {
    const searchTerm = topic.toLowerCase();
    return this.getKeywords(category).filter(keyword =>
      keyword.term.toLowerCase().includes(searchTerm) ||
      keyword.synonyms?.some(syn => syn.toLowerCase().includes(searchTerm)) ||
      keyword.relatedTerms?.some(rel => rel.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Record keyword usage
   */
  recordUsage(keywordId: string, context: 'title' | 'header' | 'content' | 'meta') {
    const keyword = this.keywords.get(keywordId);
    if (keyword) {
      keyword.usageCount++;
      keyword.lastUsed = new Date().toISOString();
      this.keywords.set(keywordId, keyword);
    }
  }

  /**
   * Generate keyword strategy for a blog post
   */
  generateStrategy(
    title: string,
    category: string,
    targetKeywords: string[]
  ): BlogKeywordStrategy {
    const primaryKeyword = targetKeywords[0] || '';
    const categoryKeywords = this.getKeywords(category);

    // Generate semantic variations
    const getSemanticVariations = (term: string): string[] => {
      const variations: string[] = [];
      Object.entries(SEMANTIC_RELATIONS).forEach(([key, synonyms]) => {
        if (term.toLowerCase().includes(key)) {
          variations.push(...synonyms.map(syn => term.replace(new RegExp(key, 'gi'), syn)));
        }
      });
      return variations;
    };

    return {
      title: {
        primary: primaryKeyword,
        secondary: targetKeywords.slice(1, 3),
        longtail: this.generateLongtailVariations(primaryKeyword),
        semantic: getSemanticVariations(primaryKeyword)
      },
      headers: {
        primary: primaryKeyword,
        secondary: targetKeywords.slice(1, 4),
        longtail: this.generateLongtailVariations(primaryKeyword, 'header'),
        semantic: getSemanticVariations(primaryKeyword)
      },
      content: {
        primary: primaryKeyword,
        secondary: targetKeywords,
        longtail: this.generateLongtailVariations(primaryKeyword, 'content'),
        semantic: categoryKeywords.slice(0, 5).map(k => k.term)
      },
      meta: {
        primary: primaryKeyword,
        secondary: targetKeywords.slice(0, 3),
        longtail: this.generateLongtailVariations(primaryKeyword, 'meta'),
        semantic: []
      }
    };
  }

  /**
   * Generate long-tail keyword variations
   */
  private generateLongtailVariations(
    keyword: string,
    context: 'header' | 'content' | 'meta' = 'content'
  ): string[] {
    const modifiers = {
      header: ['cómo', 'qué es', 'beneficios de', 'guía de'],
      content: ['en méxico', 'para principiantes', 'paso a paso', 'técnicas de'],
      meta: ['mexico', 'cdmx', 'guadalajara', 'monterrey']
    };

    return modifiers[context].map(modifier => `${modifier} ${keyword}`);
  }

  /**
   * Calculate keyword density for content
   */
  calculateDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    return (keywordCount / words) * 100;
  }

  /**
   * Optimize keyword distribution in content
   */
  optimizeDistribution(content: string, strategy: BlogKeywordStrategy): {
    suggestions: string[];
    currentDensity: Record<string, number>;
    recommendations: string[];
  } {
    const suggestions: string[] = [];
    const currentDensity: Record<string, number> = {};
    const recommendations: string[] = [];

    // Calculate current density for primary keywords
    [strategy.content.primary, ...strategy.content.secondary].forEach(keyword => {
      if (keyword) {
        const density = this.calculateDensity(content, keyword);
        currentDensity[keyword] = density;

        if (density < 0.5) {
          recommendations.push(`Increase density of "${keyword}" (current: ${density.toFixed(2)}%)`);
          suggestions.push(...strategy.content.semantic.filter(sem => sem.includes(keyword.split(' ')[0])));
        } else if (density > 2.5) {
          recommendations.push(`Reduce density of "${keyword}" (current: ${density.toFixed(2)}%)`);
        }
      }
    });

    return {
      suggestions: [...new Set(suggestions)],
      currentDensity,
      recommendations
    };
  }

  /**
   * Export keywords to JSON
   */
  exportKeywords(): string {
    return JSON.stringify(Array.from(this.keywords.values()), null, 2);
  }

  /**
   * Import keywords from JSON
   */
  importKeywords(json: string): void {
    try {
      const keywords: Keyword[] = JSON.parse(json);
      this.keywords.clear();
      this.loadInitialKeywords(keywords);
    } catch (error) {
      console.error('Failed to import keywords:', error);
    }
  }

  /**
   * Save keywords to localStorage for persistence
   */
  saveToStorage(): void {
    try {
      const keywordData = {
        keywords: Array.from(this.keywords.values()),
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('pilates_keywords', JSON.stringify(keywordData));
    } catch (error) {
      console.error('Failed to save keywords to storage:', error);
    }
  }

  /**
   * Load keywords from localStorage
   */
  loadFromStorage(): boolean {
    try {
      const stored = localStorage.getItem('pilates_keywords');
      if (!stored) return false;

      const data = JSON.parse(stored);
      if (data.keywords && Array.isArray(data.keywords)) {
        // Merge with existing keywords (prioritize stored data)
        data.keywords.forEach((keyword: Keyword) => {
          this.keywords.set(keyword.id, keyword);
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to load keywords from storage:', error);
    }
    return false;
  }

  /**
   * Add keywords from blog topics with deduplication
   */
  addKeywordsFromTopics(topics: Array<{keywords: string[], category: string}>): void {
    let hasChanges = false;

    topics.forEach(topic => {
      topic.keywords.forEach(keywordTerm => {
        const normalizedTerm = keywordTerm.toLowerCase().trim();
        const id = normalizedTerm.replace(/\s+/g, '-');

        if (this.keywords.has(id)) {
          // Keyword exists, increment usage count
          const existing = this.keywords.get(id)!;
          existing.usageCount++;
          existing.lastUsed = new Date().toISOString();
          this.keywords.set(id, existing);
          hasChanges = true;
        } else {
          // New keyword, add it
          const newKeyword: Keyword = {
            id,
            term: keywordTerm,
            category: topic.category,
            usageCount: 1,
            difficulty: keywordTerm.length > 20 ? 'hard' : keywordTerm.length > 10 ? 'medium' : 'easy',
            lastUsed: new Date().toISOString()
          };
          this.keywords.set(id, newKeyword);
          hasChanges = true;
        }
      });
    });

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  /**
   * Sync keywords with server API
   */
  async syncWithServer(): Promise<void> {
    // No-op: handled via Convex in callers
    return;
  }

  /**
   * Update usage counts from blog scanner results
   */
  updateUsageFromScanner(usageMap: Map<string, { count: number; posts: any[] }>): void {
    usageMap.forEach((usage, keywordId) => {
      const keyword = this.keywords.get(keywordId);
      if (keyword) {
        keyword.usageCount = usage.count;
        keyword.lastUsed = usage.count > 0 ? new Date().toISOString() : undefined;
        this.keywords.set(keywordId, keyword);
      }
    });
    this.saveToStorage();
  }

  /**
   * Reset all usage counts to zero
   */
  resetUsageCounts(): void {
    this.keywords.forEach((keyword, id) => {
      keyword.usageCount = 0;
      keyword.lastUsed = undefined;
      this.keywords.set(id, keyword);
    });
    this.saveToStorage();
  }

  /**
   * Get usage statistics
   */
  getStatistics(): {
    totalKeywords: number;
    totalUsage: number;
    averageUsage: number;
    topKeywords: Keyword[];
    unusedKeywords: Keyword[];
    categoryCounts: Record<string, number>;
  } {
    const keywords = Array.from(this.keywords.values());
    const totalUsage = keywords.reduce((sum, k) => sum + k.usageCount, 0);

    return {
      totalKeywords: keywords.length,
      totalUsage,
      averageUsage: totalUsage / keywords.length || 0,
      topKeywords: keywords.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10),
      unusedKeywords: keywords.filter(k => k.usageCount === 0),
      categoryCounts: keywords.reduce((acc, k) => {
        acc[k.category] = (acc[k.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

/**
 * Initialize keyword manager with predefined Pilates keywords
 */
export function createPilatesKeywordManager(): KeywordManager {
  const initialKeywords: Keyword[] = [];

  Object.entries(PILATES_KEYWORD_CATEGORIES).forEach(([category, terms]) => {
    terms.forEach(term => {
      initialKeywords.push({
        id: term.toLowerCase().replace(/\s+/g, '-'),
        term,
        category,
        usageCount: 0,
        difficulty: term.length > 20 ? 'hard' : term.length > 10 ? 'medium' : 'easy',
        targetDensity: 1.5
      });
    });
  });

  const manager = new KeywordManager(initialKeywords);

  // Try to load persisted keywords
  const hasStoredData = manager.loadFromStorage();

  if (!hasStoredData) {
    // First time setup - save initial keywords
    manager.saveToStorage();
  }

  return manager;
}

/**
 * Content optimization utilities
 */
export const ContentOptimizer = {
  /**
   * Suggest keyword placement in content
   */
  suggestPlacements(content: string, keywords: string[]): {
    title: string[];
    firstParagraph: string[];
    headers: string[];
    conclusion: string[];
  } {
    const lines = content.split('\n');
    const headers = lines.filter(line => line.startsWith('#'));

    return {
      title: keywords.slice(0, 2),
      firstParagraph: keywords.slice(0, 3),
      headers: keywords.slice(1, 4),
      conclusion: keywords.slice(0, 2)
    };
  },

  /**
   * Generate SEO-friendly meta description
   */
  generateMetaDescription(title: string, primaryKeyword: string, category: string): string {
    const templates = [
      `Descubre ${primaryKeyword} en México: guía completa con técnicas, beneficios y recomendaciones para ${category.toLowerCase()}.`,
      `Todo sobre ${primaryKeyword}: técnicas, ejercicios y consejos para tu práctica de Pilates en México.`,
      `Guía práctica de ${primaryKeyword} con enfoque mexicano: ejercicios, técnicas y recomendaciones profesionales.`
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return randomTemplate.slice(0, 155); // SEO limit
  }
};
