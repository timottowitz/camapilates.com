# Pilates Directory Quick Start Guide

## Overview

This guide will help you get started building the Pilates studio directory in 1-2 weeks, focusing on Ciudad de México as the pilot city.

---

## Week 1: Foundation Setup

### Day 1-2: Infrastructure Setup

**1. Set up Google Cloud Platform**

```bash
# Create a new GCP project
gcloud projects create pilates-directory-mx

# Enable required APIs
gcloud services enable places-api.googleapis.com
gcloud services enable maps-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com

# Create API key
gcloud alpha services api-keys create pilates-scraper-key \
  --display-name="Pilates Scraper Key" \
  --api-target=service=places-backend.googleapis.com

# Save key to .env.local
echo "GOOGLE_MAPS_API_KEY=your-key-here" >> .env.local
```

**2. Install required dependencies**

```bash
# Install scraping libraries
npm install @googlemaps/google-maps-services-js
npm install playwright
npm install sentiment
npm install bottleneck
npm install uuid

# Install development tools
npm install -D tsx @types/uuid
```

**3. Update Convex schema**

```bash
# Add the new tables from the plan
# Edit: convex/schema.ts
# Add: studios, cities, neighborhoods, scraping_jobs, review_snapshots

# Deploy schema
npm run convex:deploy
```

### Day 3-4: Initial Data Collection

**1. Create ciudad-de-mexico directory**

```bash
mkdir -p src/content/studios/ciudad-de-mexico
mkdir -p data/studios
```

**2. Run initial scraping for CDMX**

```bash
# Set your API key
export GOOGLE_MAPS_API_KEY="your-key-here"

# Run the scraper
npx tsx scripts/scrape-studios-example.ts ciudad-de-mexico
```

**Expected output:** 30-50 studios with basic info

**3. Manual verification of top 10 studios**

Create markdown files for the top 10 studios:

```bash
# Example: src/content/studios/ciudad-de-mexico/reforma-pilates.md
---
id: "uuid-123"
name: "Reforma Pilates Studio"
slug: "reforma-pilates"
city: "Ciudad de México"
neighborhood: "Polanco"
rating: 4.8
reviewCount: 127
---

# Reforma Pilates Studio

[Studio description and details]
```

### Day 5: Template Development

**1. Create city directory page**

```tsx
// src/pages/studios/[city]/index.tsx

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { StudioCard } from '../../../components/studios/StudioCard';
import { StudioSearch } from '../../../components/studios/StudioSearch';

export default function CityDirectory() {
  const { city } = useParams();
  const studios = useQuery(api.studios.listByCity, { citySlug: city });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Estudios de Pilates en {city}</h1>
      <StudioSearch city={city} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studios?.map(studio => (
          <StudioCard key={studio._id} studio={studio} />
        ))}
      </div>
    </div>
  );
}
```

**2. Create studio detail page**

```tsx
// src/pages/studios/[city]/[slug].tsx

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { StudioHero } from '../../../components/studios/StudioHero';
import { StudioReviews } from '../../../components/studios/StudioReviews';
import { StudioMap } from '../../../components/studios/StudioMap';

export default function StudioDetail() {
  const { city, slug } = useParams();
  const studio = useQuery(api.studios.getBySlug, { slug });

  if (!studio) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <StudioHero studio={studio} />
      <StudioReviews reviews={studio.reviews} />
      <StudioMap coordinates={studio.address.coordinates} />
    </div>
  );
}
```

### Day 6-7: Component Development

**Create the core components:**

1. **StudioCard.tsx** - Grid/list item display
2. **StudioSearch.tsx** - Search and filter interface
3. **StudioMap.tsx** - Interactive map with markers
4. **StudioFilters.tsx** - Price, rating, amenity filters
5. **StudioHero.tsx** - Top section of studio detail page
6. **StudioReviews.tsx** - Reviews display with sentiment
7. **StudioSchedule.tsx** - Class schedule display
8. **StudioGallery.tsx** - Photo gallery

**Example StudioCard component:**

```tsx
// src/components/studios/StudioCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PilatesStudio } from '@/types/studio';

interface StudioCardProps {
  studio: PilatesStudio;
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {studio.media.photos[0] && (
        <img
          src={studio.media.photos[0].url}
          alt={studio.name}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{studio.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{studio.reviews.googleRating}</span>
          <span className="text-gray-500 text-sm">
            ({studio.reviews.googleReviewCount} reseñas)
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {studio.address.neighborhood}, {studio.address.city}
          </span>
        </div>

        {studio.pricing.dropInClass && (
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">
              Desde ${studio.pricing.dropInClass} MXN
            </span>
          </div>
        )}

        {studio.metadata.verified && (
          <Badge variant="secondary" className="mb-4">
            Verificado
          </Badge>
        )}

        <Link
          to={`/estudios-de-pilates/${studio.address.city.toLowerCase()}/${studio.slug}`}
          className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-primary/90"
        >
          Ver detalles
        </Link>
      </CardContent>
    </Card>
  );
}
```

---

## Week 2: Enrichment & Launch

### Day 8-9: Data Enrichment

**1. Pricing collection**

Manually call or check websites for top 20 studios:

```bash
# Create a spreadsheet or CSV
# columns: studio_slug, drop_in_price, monthly_price, source

# Import using script
npx tsx scripts/import-pricing.ts data/manual/pricing-cdmx.csv
```

**2. Social media enrichment**

```bash
# Instagram scraping (use external API like RapidAPI)
npx tsx scripts/enrich-instagram.ts ciudad-de-mexico
```

**3. Photo downloading**

```bash
# Download Google photos to local storage
npx tsx scripts/download-photos.ts ciudad-de-mexico
```

### Day 10: SEO Setup

**1. Generate sitemaps**

```typescript
// scripts/generate-sitemap-studios.ts

import { writeFile } from 'fs/promises';
import { convexClient } from './convex-client';
import { api } from '../convex/_generated/api';

async function generateSitemap() {
  const cities = await convexClient.query(api.cities.list);
  const studios = await convexClient.query(api.studios.listAll);

  const urls = [
    { loc: '/estudios-de-pilates', priority: '1.0' },
    ...cities.map(city => ({
      loc: `/estudios-de-pilates/${city.slug}`,
      priority: '0.9',
    })),
    ...studios.map(studio => ({
      loc: `/estudios-de-pilates/${studio.citySlug}/${studio.slug}`,
      priority: '0.8',
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>https://yourdomain.com${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('\n')}
</urlset>`;

  await writeFile('public/sitemap-studios.xml', sitemap);
  console.log('✅ Sitemap generated');
}

generateSitemap();
```

**2. Add schema markup to pages**

Already included in the SEO field of PilatesStudio type.

### Day 11-12: Review & Testing

**1. Manual QA checklist**

- [ ] All 30+ CDMX studios have pages
- [ ] City directory page loads and filters work
- [ ] Individual studio pages display correctly
- [ ] Map shows all studios with correct pins
- [ ] Mobile responsive design works
- [ ] Search functionality works
- [ ] Reviews display properly
- [ ] Schema markup validates (Google Rich Results Test)
- [ ] Page speed > 90 on Lighthouse
- [ ] All links work
- [ ] Images load properly

**2. Data quality audit**

```bash
# Check data completeness
npx tsx scripts/audit-data-quality.ts ciudad-de-mexico

# Expected output:
# - Average quality score > 80
# - 100% have name, address, coordinates
# - 80%+ have phone numbers
# - 70%+ have reviews
# - 50%+ have pricing
```

### Day 13: Soft Launch

**1. Deploy to staging**

```bash
# Build
npm run build

# Deploy to Cloudflare Pages (or your platform)
npm run deploy:staging
```

**2. Share with test users**

Get feedback from 5-10 people searching for Pilates studios.

### Day 14: Production Launch

**1. Final deployment**

```bash
npm run build
npm run deploy:production
```

**2. Submit to Google**

```bash
# Submit sitemap to Google Search Console
curl https://www.google.com/ping?sitemap=https://yourdomain.com/sitemap-studios.xml
```

**3. Social media announcement**

Post on relevant Facebook groups, Instagram, etc.

---

## Post-Launch: Weeks 3-4

### Add Cities 2-7

Now that you have the template working, scale quickly:

**Week 3: Querétaro, Puebla, Monterrey**

```bash
# Run scraper for each city
npx tsx scripts/scrape-studios-example.ts queretaro
npx tsx scripts/scrape-studios-example.ts puebla
npx tsx scripts/scrape-studios-example.ts monterrey

# Batch upload to Convex
npx tsx scripts/bulk-upload-studios.ts
```

**Week 4: Guadalajara, Mazatlán, Tijuana**

```bash
npx tsx scripts/scrape-studios-example.ts guadalajara
npx tsx scripts/scrape-studios-example.ts mazatlan
npx tsx scripts/scrape-studios-example.ts tijuana
```

**By end of Month 1:**
- 7 cities live
- 150-200 studios
- SEO pages indexed
- Automated review updates running

---

## Months 2-3: Scale to 100 Cities

### Automated Scaling Process

**1. Create city priority list**

Already done in `data/cities.json` (priority 8-100)

**2. Batch scraping**

```bash
# Run nightly scraping job for 5 cities at a time
npx tsx scripts/batch-scrape-cities.ts --start=8 --end=12
```

**3. Automated QA**

```typescript
// scripts/automated-qa.ts

async function validateCity(citySlug: string) {
  const studios = await getStudiosByCity(citySlug);

  const report = {
    city: citySlug,
    studioCount: studios.length,
    avgQualityScore: calculateAvg(studios.map(s => s.dataQualityScore)),
    missingData: {
      noPhone: studios.filter(s => !s.contact.phone).length,
      noWebsite: studios.filter(s => !s.contact.website).length,
      noReviews: studios.filter(s => s.reviews.googleReviewCount === 0).length,
    },
    readyForLaunch: studios.length >= 5 && avgQualityScore >= 75,
  };

  return report;
}
```

**4. Progressive rollout**

- Week 5-6: Cities 8-20 (13 cities)
- Week 7-8: Cities 21-40 (20 cities)
- Week 9-10: Cities 41-70 (30 cities)
- Week 11-12: Cities 71-100 (30 cities)

---

## Key Metrics to Track

### Data Metrics
- Studios per city (target: 10+ for major cities, 3+ for smaller)
- Average data quality score (target: 85+)
- % with verified pricing (target: 60%+)
- % with recent reviews (<30 days) (target: 80%+)

### SEO Metrics
- Indexed pages (target: 90%+ indexed within 30 days)
- Organic traffic per city (target: 100+ visits/month after 60 days)
- Position for "[ciudad] pilates" (target: top 10)
- Click-through rate (target: 5%+)

### User Metrics
- Bounce rate (target: <60%)
- Pages per session (target: 2.5+)
- Time on site (target: 3+ minutes)
- Studio detail → website clicks (target: 15%+)

---

## Common Issues & Solutions

### Issue: Google API rate limits

**Solution:**
- Use request batching
- Implement exponential backoff
- Spread scraping over multiple days
- Consider using multiple API keys

### Issue: Stale data

**Solution:**
- Set up Convex cron jobs for daily review updates
- Weekly full data refresh for top 100 studios
- User reporting system for incorrect data

### Issue: Low data quality scores

**Solution:**
- Focus on tier-1 automated data first
- Manually verify top 20 studios per city
- Partner with studio owners for verification
- Implement user submissions

### Issue: Duplicate studios

**Solution:**
- Deduplicate by Google Place ID
- Fuzzy matching on name + address
- Manual review of suspected duplicates
- Merge tool in admin interface

---

## Next Steps After 100 Cities

1. **User accounts** - Let users save favorites, leave reviews
2. **Studio claims** - Allow owners to claim and edit listings
3. **Premium listings** - Monetize with featured placements
4. **Booking integration** - Partner with booking platforms
5. **Mobile app** - Native iOS/Android apps
6. **International expansion** - Scale to other countries

---

## Resources

- **Main implementation plan:** `PILATES_DIRECTORY_IMPLEMENTATION_PLAN.md`
- **Type definitions:** `src/types/studio.ts`
- **City data:** `data/cities.json`
- **Template studio:** `data/studio-template.json`
- **Scraping script:** `scripts/scrape-studios-example.ts`

## Support

For questions or issues, create a GitHub issue or contact the development team.

---

**Good luck building the directory! 🏋️‍♀️**
