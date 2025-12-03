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
  name: 'CAMA Pilates',
  url: 'https://camadepilates.com',
  logo: {
    url: 'https://camadepilates.com/logo.png',
    width: 512,
    height: 512,
  },
  sameAs: [
    'https://www.instagram.com/camadepilates/',
    'https://www.facebook.com/camadepilates',
  ],
};

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
