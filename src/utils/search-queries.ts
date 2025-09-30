/**
 * Search Query Generator for Pilates Studios in Mexican Cities
 */

export interface CitySearchQueries {
  city: string;
  queries: string[];
}

/**
 * Generate search queries for a Mexican city
 * Returns multiple query variations to maximize discovery
 */
export function generateCityQueries(cityName: string, neighborhoods?: string[]): string[] {
  const baseQueries = [
    // Spanish queries (primary)
    `pilates ${cityName}`,
    `estudio pilates ${cityName}`,
    `clases pilates ${cityName}`,
    `pilates reformer ${cityName}`,
    `studio pilates ${cityName}`,

    // English queries (secondary)
    `pilates studio ${cityName}`,
    `pilates classes ${cityName}`,
    `reformer pilates ${cityName}`,

    // Brand/method specific
    `pilates clasico ${cityName}`,
    `pilates contemporaneo ${cityName}`,
    `pilates mat ${cityName}`,
    `pilates maquinas ${cityName}`,

    // Fitness center variations
    `gimnasio pilates ${cityName}`,
    `centro pilates ${cityName}`,
    `wellness pilates ${cityName}`,
  ];

  // Add neighborhood-specific queries if provided
  const neighborhoodQueries: string[] = [];
  if (neighborhoods && neighborhoods.length > 0) {
    // Only use top 5 neighborhoods to avoid excessive API calls
    const topNeighborhoods = neighborhoods.slice(0, 5);
    for (const neighborhood of topNeighborhoods) {
      neighborhoodQueries.push(
        `pilates ${neighborhood} ${cityName}`,
        `estudio pilates ${neighborhood}`
      );
    }
  }

  return [...baseQueries, ...neighborhoodQueries];
}

/**
 * Generate queries for multiple cities
 */
export function generateBatchQueries(cities: Array<{ name: string; neighborhoods?: string[] }>): CitySearchQueries[] {
  return cities.map(city => ({
    city: city.name,
    queries: generateCityQueries(city.name, city.neighborhoods),
  }));
}

/**
 * Priority cities for initial rollout
 */
export const PRIORITY_CITIES = [
  {
    name: 'Ciudad de México',
    aliases: ['CDMX', 'Mexico City', 'DF'],
    neighborhoods: [
      'Polanco',
      'Roma Norte',
      'Condesa',
      'Santa Fe',
      'Coyoacán',
      'Del Valle',
      'Lomas de Chapultepec',
      'San Ángel',
      'Nápoles',
      'Juárez',
    ],
  },
  {
    name: 'Querétaro',
    aliases: ['Santiago de Querétaro'],
    neighborhoods: [
      'Centro Histórico',
      'Juriquilla',
      'El Refugio',
      'Zibatá',
      'El Campanario',
    ],
  },
  {
    name: 'Puebla',
    aliases: ['Puebla de Zaragoza'],
    neighborhoods: [
      'Angelópolis',
      'La Paz',
      'San Manuel',
      'Cholula',
      'Centro Histórico',
    ],
  },
  {
    name: 'Monterrey',
    aliases: ['MTY'],
    neighborhoods: [
      'San Pedro Garza García',
      'Valle Oriente',
      'Cumbres',
      'Contry',
      'Del Valle',
    ],
  },
  {
    name: 'Guadalajara',
    aliases: ['GDL'],
    neighborhoods: [
      'Zapopan',
      'Providencia',
      'Chapalita',
      'Puerta de Hierro',
      'Andares',
    ],
  },
  {
    name: 'Mazatlán',
    aliases: [],
    neighborhoods: [
      'Zona Dorada',
      'Marina Mazatlán',
      'El Cid',
      'Sábalo Country',
      'Centro Histórico',
    ],
  },
  {
    name: 'Tijuana',
    aliases: ['TJ'],
    neighborhoods: [
      'Zona Río',
      'Playas de Tijuana',
      'Otay',
      'La Mesa',
      'Hipódromo',
    ],
  },
];

/**
 * Get search queries for all priority cities
 */
export function getAllPriorityCityQueries(): CitySearchQueries[] {
  return PRIORITY_CITIES.map(city => ({
    city: city.name,
    queries: generateCityQueries(city.name, city.neighborhoods),
  }));
}

/**
 * Filter queries to avoid duplicates
 * Useful when combining results from multiple queries
 */
export function deduplicateQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const query of queries) {
    const normalized = query.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(query);
    }
  }

  return unique;
}