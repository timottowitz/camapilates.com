export function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return (import.meta as any).env?.VITE_SITE_URL || 'https://camadepilates.com';
}

export function canonicalUrl(pathname: string): string {
  const base = getOrigin().replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function toAbsoluteUrl(maybePath: string | undefined | null): string | undefined {
  if (!maybePath) return undefined;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  return canonicalUrl(maybePath);
}

import { getVersionedImageUrl } from '@/hooks/useVersionedImage';

export const DEFAULTS = {
  siteName: (import.meta as any).env?.VITE_SITE_NAME || 'CAMA Pilates',
  twitterSite: (import.meta as any).env?.VITE_TWITTER_SITE || '',
  ogImage: getVersionedImageUrl('/og/cama-de-pilates-venta-mexico.png'),
  locale: 'es_MX'
};

// Organization schema constants
export const ORGANIZATION = {
  name: 'Edelweiss Pilates',
  legalName: 'CAMA Pilates',
  url: 'https://camadepilates.com',
  logo: {
    url: 'https://camadepilates.com/brand/edelweiss.svg',
    width: 512,
    height: 512,
  },
  sameAs: [
    'https://www.instagram.com/camadepilates/',
    'https://www.facebook.com/camadepilates',
  ],
  address: {
    streetAddress: 'Av. Insurgentes Sur 1234',
    addressLocality: 'Ciudad de México',
    addressRegion: 'CDMX',
    postalCode: '03100',
    addressCountry: 'MX',
  },
  geo: {
    latitude: 19.4326,
    longitude: -99.1332,
  },
  telephone: '+52-322-278-7690',
  email: 'info@camadepilates.com',
};

// Generate LocalBusiness schema for homepage
export function generateLocalBusinessSchema() {
  const origin = getOrigin();
  
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Store', 'SportsActivityLocation'],
    '@id': `${origin}/#localbusiness`,
    name: ORGANIZATION.name,
    alternateName: ORGANIZATION.legalName,
    description: 'Fabricante y tienda de Camas de Pilates (Reformer) premium en México. Equipos de madera de nogal, cuero genuino y materiales orgánicos libres de plásticos.',
    url: ORGANIZATION.url,
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION.logo.url,
      width: ORGANIZATION.logo.width,
      height: ORGANIZATION.logo.height,
    },
    image: `${origin}/og/cama-de-pilates-venta-mexico.png`,
    telephone: ORGANIZATION.telephone,
    email: ORGANIZATION.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION.address.streetAddress,
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      postalCode: ORGANIZATION.address.postalCode,
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ORGANIZATION.geo.latitude,
      longitude: ORGANIZATION.geo.longitude,
    },
    areaServed: [
      { '@type': 'Country', name: 'México' },
      { '@type': 'City', name: 'Ciudad de México' },
      { '@type': 'City', name: 'Monterrey' },
      { '@type': 'City', name: 'Guadalajara' },
    ],
    priceRange: '$$$',
    currenciesAccepted: 'MXN',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: ORGANIZATION.sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Camas de Pilates',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Cama de Pilates Reformer Casa',
            category: 'Reformers',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Cama de Pilates Reformer Profesional',
            category: 'Reformers',
          },
        },
      ],
    },
  };
}

// Generate simple breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>) {
  const origin = getOrigin();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      ...(item.url && { item: item.url.startsWith('http') ? item.url : `${origin}${item.url}` }),
    })),
  };
}

// Author info for blog posts
export const AUTHOR = {
  name: 'CAMA Pilates',
  url: 'https://camadepilates.com',
  description: 'Recursos y guías sobre camas de Pilates (Reformer) para casa y estudio: compra, ejercicios y mantenimiento.',
};

// Generate full blog post schema with @graph structure
export function generateBlogPostSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  category,
  tags,
  imageUrl,
  articleUrl,
  wordCount,
  faqs,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  category: string;
  tags: string[];
  imageUrl: string;
  articleUrl: string;
  wordCount: number;
  faqs: { q: string; a: string }[];
}) {
  const origin = getOrigin();
  const orgId = `${origin}/#organization`;
  const authorId = `${origin}/#author`;
  const articleId = `${articleUrl}#article`;
  const webPageId = `${articleUrl}#webpage`;
  const imageId = `${articleUrl}#primaryimage`;
  const breadcrumbId = `${articleUrl}#breadcrumb`;

  const graph: any[] = [
    // Article
    {
      '@type': 'Article',
      '@id': articleId,
      isPartOf: { '@id': webPageId },
      author: { '@id': authorId },
      headline: title,
      description: description,
      datePublished: datePublished,
      dateModified: dateModified,
      mainEntityOfPage: { '@id': webPageId },
      wordCount: wordCount,
      publisher: { '@id': orgId },
      image: { '@id': imageId },
      thumbnailUrl: imageUrl,
      articleSection: category,
      keywords: tags.join(', '),
      inLanguage: 'es-MX',
      url: articleUrl,
    },
    // WebPage
    {
      '@type': 'WebPage',
      '@id': webPageId,
      url: articleUrl,
      name: title,
      isPartOf: { '@id': `${origin}/#website` },
      primaryImageOfPage: { '@id': imageId },
      image: { '@id': imageId },
      thumbnailUrl: imageUrl,
      datePublished: datePublished,
      dateModified: dateModified,
      description: description,
      breadcrumb: { '@id': breadcrumbId },
      inLanguage: 'es-MX',
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: [articleUrl],
        },
      ],
    },
    // ImageObject
    {
      '@type': 'ImageObject',
      '@id': imageId,
      inLanguage: 'es-MX',
      url: imageUrl,
      contentUrl: imageUrl,
      width: 1200,
      height: 630,
    },
    // BreadcrumbList
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: origin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${origin}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
        },
      ],
    },
    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: ORGANIZATION.name,
      description: 'Camas de Pilates Reformer para casa y estudio en México',
      publisher: { '@id': orgId },
      inLanguage: 'es-MX',
    },
    // Organization
    {
      '@type': 'Organization',
      '@id': orgId,
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
      logo: {
        '@type': 'ImageObject',
        '@id': `${origin}/#logo`,
        url: ORGANIZATION.logo.url,
        contentUrl: ORGANIZATION.logo.url,
        width: ORGANIZATION.logo.width,
        height: ORGANIZATION.logo.height,
        caption: ORGANIZATION.name,
      },
      image: { '@id': `${origin}/#logo` },
      sameAs: ORGANIZATION.sameAs,
    },
    // Person (Author)
    {
      '@type': 'Person',
      '@id': authorId,
      name: authorName || AUTHOR.name,
      description: AUTHOR.description,
      url: AUTHOR.url,
    },
  ];

  // Add FAQPage if FAQs exist
  if (faqs && faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${articleUrl}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

// Generate LocalBusiness schema for studio detail pages
export function generateStudioSchema({
  name,
  description,
  address,
  geo,
  phone,
  website,
  rating,
  reviewCount,
  hours,
  imageUrl,
  studioUrl,
  cityName,
  priceRange,
}: {
  name: string;
  description?: string;
  address?: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  geo?: { lat: number; lng: number };
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  hours?: Record<string, string>;
  imageUrl?: string;
  studioUrl: string;
  cityName: string;
  priceRange?: string;
}) {
  const origin = getOrigin();
  const studioId = `${studioUrl}#localbusiness`;
  const breadcrumbId = `${studioUrl}#breadcrumb`;

  const localBusiness: any = {
    '@type': ['LocalBusiness', 'SportsActivityLocation', 'HealthAndBeautyBusiness'],
    '@id': studioId,
    name: name,
    url: studioUrl,
    ...(description && { description }),
    ...(priceRange && { priceRange }),
  };

  // Address
  if (address) {
    localBusiness.address = {
      '@type': 'PostalAddress',
      ...(address.street && { streetAddress: address.street }),
      ...(address.neighborhood && { addressLocality: address.neighborhood }),
      ...(address.city && { addressRegion: address.city }),
      ...(address.state && { addressRegion: address.state }),
      ...(address.postalCode && { postalCode: address.postalCode }),
      addressCountry: address.country || 'MX',
    };
  }

  // Geo coordinates
  if (geo?.lat && geo?.lng) {
    localBusiness.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.lat,
      longitude: geo.lng,
    };
  }

  // Contact
  if (phone) localBusiness.telephone = phone;
  if (website) localBusiness.sameAs = [website];

  // Rating
  if (rating && reviewCount && reviewCount > 0) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Opening hours
  if (hours) {
    const dayMap: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };
    const openingHours: any[] = [];
    Object.entries(hours).forEach(([day, time]) => {
      if (time && time !== 'Cerrado' && time !== 'Closed') {
        const match = time.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
        if (match) {
          openingHours.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: dayMap[day] || day,
            opens: match[1],
            closes: match[2],
          });
        }
      }
    });
    if (openingHours.length > 0) {
      localBusiness.openingHoursSpecification = openingHours;
    }
  }

  // Image
  if (imageUrl) {
    localBusiness.image = imageUrl;
  }

  // Breadcrumb
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Estudios de Pilates',
        item: `${origin}/estudios-de-pilates`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: `${origin}/estudios-de-pilates/${cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: name,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [localBusiness, breadcrumb],
  };
}

// Generate CollectionPage schema for city directory
export function generateCityDirectorySchema({
  cityName,
  citySlug,
  studioCount,
  avgRating,
  studios,
}: {
  cityName: string;
  citySlug: string;
  studioCount: number;
  avgRating?: number;
  studios: Array<{ name: string; slug: string; rating?: number; reviewCount?: number }>;
}) {
  const origin = getOrigin();
  const pageUrl = `${origin}/estudios-de-pilates/${citySlug}`;

  const collectionPage: any = {
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: `Estudios de Pilates en ${cityName}`,
    description: `Directorio de ${studioCount} estudios de Pilates en ${cityName}, México. Encuentra clases, horarios y reseñas.`,
    url: pageUrl,
    inLanguage: 'es-MX',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: studioCount,
      itemListElement: studios.slice(0, 20).map((studio, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${origin}/estudios-de-pilates/${citySlug}/${studio.slug}`,
        name: studio.name,
      })),
    },
  };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Estudios de Pilates',
        item: `${origin}/estudios-de-pilates`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [collectionPage, breadcrumb],
  };
}

// Generate ItemList schema for studios landing page
export function generateStudiosLandingSchema({
  cities,
  totalStudios,
  totalReviews,
}: {
  cities: Array<{ name: string; slug: string; studioCount: number }>;
  totalStudios: number;
  totalReviews: number;
}) {
  const origin = getOrigin();
  const pageUrl = `${origin}/estudios-de-pilates`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: 'Directorio de Estudios de Pilates en México',
        description: `El directorio más completo de México con ${totalStudios}+ estudios de Pilates y ${totalReviews.toLocaleString()}+ reseñas de Google.`,
        url: pageUrl,
        inLanguage: 'es-MX',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Ciudades con Estudios de Pilates',
          numberOfItems: cities.length,
          itemListElement: cities.map((city, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${origin}/estudios-de-pilates/${city.slug}`,
            name: `${city.name} (${city.studioCount} estudios)`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Estudios de Pilates',
          },
        ],
      },
    ],
  };
}

// Generate AboutPage schema
export function generateAboutPageSchema() {
  const origin = getOrigin();
  const pageUrl = `${origin}/about`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#aboutpage`,
        name: 'Sobre Edelweiss Pilates',
        description: 'Conoce Edelweiss Pilates: Reformers silenciosos y precisos en cuero genuino, nogal y acero. Ingeniería alemana con manufactura en CDMX.',
        url: pageUrl,
        inLanguage: 'es-MX',
        mainEntity: {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'Edelweiss Pilates',
          alternateName: 'CAMA Pilates',
          url: origin,
          foundingDate: '2015',
          foundingLocation: {
            '@type': 'Place',
            name: 'Ciudad de México',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Ciudad de México',
              addressCountry: 'MX',
            },
          },
          description: 'Fabricante de Reformers de Pilates premium con ingeniería alemana y manufactura mexicana.',
          logo: {
            '@type': 'ImageObject',
            url: ORGANIZATION.logo.url,
            width: ORGANIZATION.logo.width,
            height: ORGANIZATION.logo.height,
          },
          sameAs: ORGANIZATION.sameAs,
          numberOfEmployees: {
            '@type': 'QuantitativeValue',
            minValue: 10,
            maxValue: 50,
          },
          knowsAbout: ['Pilates', 'Reformer', 'Fitness Equipment', 'Studio Design'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sobre Nosotros',
          },
        ],
      },
    ],
  };
}

// Generate Service schema for services page
export function generateServicesSchema() {
  const origin = getOrigin();
  const pageUrl = `${origin}/services`;

  const services = [
    {
      name: 'Diseño de Estudio',
      description: 'Planificación de espacios para flujo óptimo y armonía estética. Desde layout hasta iluminación.',
      url: `${origin}/contact`,
    },
    {
      name: 'Mantenimiento',
      description: 'Mantén tus reformers deslizándose silenciosamente. Paquetes de servicio anual y entrega exprés de repuestos.',
      url: `${origin}/contact`,
    },
    {
      name: 'Capacitación',
      description: 'Programas de certificación para instructores en equipos Edelweiss. Domina la mecánica del movimiento.',
      url: `${origin}/certificacion-pilates`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: 'Servicios | Edelweiss Pilates',
        description: 'Servicios profesionales para estudios de Pilates: Diseño, Mantenimiento y Capacitación.',
        url: pageUrl,
        inLanguage: 'es-MX',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#services`,
        name: 'Servicios de Edelweiss Pilates',
        numberOfItems: services.length,
        itemListElement: services.map((service, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Service',
            name: service.name,
            description: service.description,
            url: service.url,
            provider: {
              '@type': 'Organization',
              name: 'Edelweiss Pilates',
              '@id': `${origin}/#organization`,
            },
            areaServed: {
              '@type': 'Country',
              name: 'México',
            },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Servicios',
          },
        ],
      },
    ],
  };
}

// Generate Product comparison schema
export function generateCompareSchema() {
  const origin = getOrigin();
  const pageUrl = `${origin}/compare`;

  const products = [
    {
      name: 'Edelweiss Home Reformer',
      description: 'Diseño compacto sin comprometer el deslizamiento suave y silencioso. Diseñado para integrarse perfectamente en tu espacio.',
      price: 35000,
      url: `${origin}/product/reformer-casa`,
      image: `${origin}/images/compare-home.png`,
    },
    {
      name: 'Edelweiss Studio Reformer',
      description: 'Precisión de grado profesional para uso diario intensivo. El estándar para estudios de élite.',
      price: 50000,
      url: `${origin}/product/reformer-profesional`,
      image: `${origin}/images/compare-studio.png`,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: 'The Collection | Comparativa de Reformers Edelweiss',
        description: 'Compara nuestros modelos de reformer profesional y para casa. Ingeniería alemana, alma mexicana. Entrega en 3 semanas.',
        url: pageUrl,
        inLanguage: 'es-MX',
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#products`,
        name: 'Comparativa de Reformers Edelweiss',
        numberOfItems: products.length,
        itemListElement: products.map((product, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            url: product.url,
            brand: {
              '@type': 'Brand',
              name: 'Edelweiss Pilates',
            },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'MXN',
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Comparar',
          },
        ],
      },
    ],
  };
}
