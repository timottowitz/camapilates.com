# Pilates Studio Directory - Project Tickets

## Ticket Organization
- **Epic**: Major feature area
- **Story**: User-facing functionality
- **Task**: Technical implementation
- **Size**: XS (0.5h), S (1-2h), M (3-4h), L (5-8h)
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

---

## Phase 1: Foundation Setup (Week 1)

### Epic 1: Infrastructure & Dependencies

#### INFRA-001: Project Dependencies Installation
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Install @googlemaps/google-maps-services-js
- [ ] Install playwright for scraping
- [ ] Install sentiment for review analysis
- [ ] Install bottleneck for rate limiting
- [ ] Update package.json
```

#### INFRA-002: Environment Variables Setup
**Type:** Task | **Size:** XS | **Priority:** P0
```
- [ ] Add GOOGLE_MAPS_API_KEY to .env
- [ ] Add CONVEX_URL and CONVEX_DEPLOY_KEY
- [ ] Add SCRAPING_USER_AGENT
- [ ] Create .env.example file
```

#### INFRA-003: Google Cloud Platform Setup
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Create GCP account
- [ ] Enable Maps JavaScript API
- [ ] Enable Places API
- [ ] Enable Geocoding API
- [ ] Set up API key restrictions
- [ ] Configure billing alerts
```

#### INFRA-004: Create Project Folder Structure
**Type:** Task | **Size:** XS | **Priority:** P0
```
- [ ] Create src/components/studios/
- [ ] Create src/pages/estudios-de-pilates/
- [ ] Create scripts/scraping/
- [ ] Create scripts/enrichment/
- [ ] Create data/raw/
- [ ] Create data/processed/
```

---

### Epic 2: Database Schema

#### DB-001: Create Convex Schema File
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create convex/schema.ts
- [ ] Import defineSchema and defineTable
- [ ] Add necessary imports from values
```

#### DB-002: Define Studios Table Schema
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Create studios table definition
- [ ] Add id, slug, name fields
- [ ] Add address object fields
- [ ] Add contact object fields
- [ ] Add metrics object fields
- [ ] Add timestamps
- [ ] Add indexes (city, rating, price)
```

#### DB-003: Define Cities Table Schema
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create cities table definition
- [ ] Add city metadata fields
- [ ] Add SEO fields
- [ ] Add statistics fields
- [ ] Add active/inactive flag
```

#### DB-004: Define Neighborhoods Table Schema
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create neighborhoods table definition
- [ ] Add cityId foreign key
- [ ] Add boundary coordinates
- [ ] Add demographics fields
```

#### DB-005: Define Scraping Jobs Table
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Create scraping_jobs table
- [ ] Add status enum field
- [ ] Add retry count
- [ ] Add error messages
- [ ] Add timestamps
```

#### DB-006: Define Review Snapshots Table
**Type:** Task | **Size:** S | **Priority:** P2
```
- [ ] Create review_snapshots table
- [ ] Add studioId foreign key
- [ ] Add metrics object
- [ ] Add sample reviews array
- [ ] Add snapshot timestamp
```

#### DB-007: Create Migration Script
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Write migration to create all tables
- [ ] Test migration locally
- [ ] Document rollback procedure
```

---

### Epic 3: Data Types & Models

#### TYPE-001: Create Base Type Definitions
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create types/index.ts
- [ ] Export all studio types
- [ ] Export all location types
- [ ] Export all scraping types
```

#### TYPE-002: Create Validation Functions
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Create utils/validation.ts
- [ ] Add phone number validator (Mexican format)
- [ ] Add email validator
- [ ] Add URL validator
- [ ] Add price range validator
- [ ] Add coordinates validator
```

#### TYPE-003: Create Data Transformers
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Create utils/transformers.ts
- [ ] Add Google Places to Studio transformer
- [ ] Add CSV to Studio transformer
- [ ] Add Studio to SEO metadata transformer
- [ ] Add Studio to JSON-LD transformer
```

---

### Epic 4: Scraping Foundation

#### SCRAPE-001: Create Google Places Service
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Create services/google-places.ts
- [ ] Initialize client with API key
- [ ] Add place search method
- [ ] Add place details method
- [ ] Add photo URL builder
- [ ] Add error handling
```

#### SCRAPE-002: Create Search Query Builder
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create utils/search-queries.ts
- [ ] Add city + "pilates" query
- [ ] Add city + "pilates reformer" query
- [ ] Add city + "pilates studio" query
- [ ] Add city + "pilates classes" query
- [ ] Add neighborhood variations
```

#### SCRAPE-003: Create Rate Limiter
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create utils/rate-limiter.ts
- [ ] Configure Bottleneck instance
- [ ] Set 10 requests per second limit
- [ ] Add retry logic
- [ ] Add backoff strategy
```

#### SCRAPE-004: Create Deduplication Logic
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create utils/deduplication.ts
- [ ] Add place_id based dedup
- [ ] Add name + address similarity check
- [ ] Add phone number dedup
- [ ] Add website URL dedup
```

#### SCRAPE-005: Create Basic Scraping Script
**Type:** Task | **Size:** L | **Priority:** P0
```
- [ ] Create scripts/scrape-city.ts
- [ ] Add command line arguments parser
- [ ] Add city data loader
- [ ] Add search execution
- [ ] Add results processing
- [ ] Add CSV export
- [ ] Add error logging
```

---

## Phase 2: Core Components (Week 1-2)

### Epic 5: Studio Components

#### COMP-001: Create Studio Card Component
**Type:** Story | **Size:** M | **Priority:** P0
```
- [ ] Create components/StudioCard.tsx
- [ ] Add image carousel/placeholder
- [ ] Add title and rating stars
- [ ] Add address and distance
- [ ] Add price range indicator
- [ ] Add "View Details" button
- [ ] Add responsive design
```

#### COMP-002: Create Studio List Component
**Type:** Story | **Size:** S | **Priority:** P0
```
- [ ] Create components/StudioList.tsx
- [ ] Add grid/list view toggle
- [ ] Add loading skeleton
- [ ] Add empty state
- [ ] Add pagination
```

#### COMP-003: Create Rating Stars Component
**Type:** Task | **Size:** XS | **Priority:** P0
```
- [ ] Create components/RatingStars.tsx
- [ ] Add filled/empty star logic
- [ ] Add half stars support
- [ ] Add review count display
```

#### COMP-004: Create Price Range Component
**Type:** Task | **Size:** XS | **Priority:** P1
```
- [ ] Create components/PriceRange.tsx
- [ ] Add peso sign indicators
- [ ] Add tooltip with actual prices
- [ ] Add "Contact for pricing" state
```

#### COMP-005: Create Studio Map Component
**Type:** Story | **Size:** M | **Priority:** P1
```
- [ ] Create components/StudioMap.tsx
- [ ] Integrate Google Maps
- [ ] Add studio markers
- [ ] Add marker clustering
- [ ] Add info windows
- [ ] Add list synchronization
```

#### COMP-006: Create Hours Display Component
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Create components/BusinessHours.tsx
- [ ] Add current day highlighting
- [ ] Add open/closed indicator
- [ ] Add "Opens at" / "Closes at" logic
- [ ] Add holiday hours support
```

---

### Epic 6: Search & Filter Components

#### SEARCH-001: Create Search Bar Component
**Type:** Story | **Size:** M | **Priority:** P0
```
- [ ] Create components/SearchBar.tsx
- [ ] Add text input with icon
- [ ] Add autocomplete suggestions
- [ ] Add recent searches
- [ ] Add clear button
- [ ] Add loading state
```

#### SEARCH-002: Create Filter Panel Component
**Type:** Story | **Size:** L | **Priority:** P0
```
- [ ] Create components/FilterPanel.tsx
- [ ] Add neighborhood multi-select
- [ ] Add price range slider
- [ ] Add rating minimum select
- [ ] Add class types checkboxes
- [ ] Add equipment checkboxes
- [ ] Add amenities checkboxes
- [ ] Add clear all filters
```

#### SEARCH-003: Create Sort Dropdown Component
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Create components/SortDropdown.tsx
- [ ] Add sort by distance
- [ ] Add sort by rating
- [ ] Add sort by review count
- [ ] Add sort by price
```

#### SEARCH-004: Create Active Filters Display
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Create components/ActiveFilters.tsx
- [ ] Show filter chips
- [ ] Add remove individual filter
- [ ] Add filter count badge
```

#### SEARCH-005: Create Location Picker Component
**Type:** Story | **Size:** M | **Priority:** P1
```
- [ ] Create components/LocationPicker.tsx
- [ ] Add current location button
- [ ] Add address search
- [ ] Add map picker
- [ ] Add saved locations
```

---

### Epic 7: Page Templates

#### PAGE-001: Create City Directory Page
**Type:** Story | **Size:** L | **Priority:** P0
```
- [ ] Create pages/estudios-de-pilates/[city].tsx
- [ ] Add city hero section
- [ ] Add search and filters
- [ ] Add studio list
- [ ] Add map view toggle
- [ ] Add pagination
- [ ] Add SEO metadata
- [ ] Add breadcrumbs
```

#### PAGE-002: Create Studio Detail Page
**Type:** Story | **Size:** L | **Priority:** P0
```
- [ ] Create pages/estudios-de-pilates/[city]/[studio].tsx
- [ ] Add hero image gallery
- [ ] Add basic info section
- [ ] Add description
- [ ] Add classes & pricing
- [ ] Add instructors section
- [ ] Add reviews section
- [ ] Add contact form
- [ ] Add map & directions
- [ ] Add nearby studios
```

#### PAGE-003: Create Main Landing Page
**Type:** Story | **Size:** M | **Priority:** P0
```
- [ ] Create pages/estudios-de-pilates/index.tsx
- [ ] Add hero with search
- [ ] Add featured cities grid
- [ ] Add statistics section
- [ ] Add how it works
- [ ] Add recent reviews
- [ ] Add SEO content
```

#### PAGE-004: Create Neighborhood Page
**Type:** Story | **Size:** M | **Priority:** P2
```
- [ ] Create pages/estudios-de-pilates/[city]/[neighborhood].tsx
- [ ] Add neighborhood description
- [ ] Add local studios list
- [ ] Add area highlights
- [ ] Add transport info
```

---

## Phase 3: Data Collection (Week 2)

### Epic 8: Scraping Execution

#### EXEC-001: Scrape Mexico City Studios
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Run scraper for CDMX
- [ ] Review output for quality
- [ ] Fix any parsing errors
- [ ] Deduplicate results
- [ ] Export to CSV
- [ ] Import to database
```

#### EXEC-002: Scrape Querétaro Studios
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Run scraper for Querétaro
- [ ] Review and clean data
- [ ] Import to database
```

#### EXEC-003: Scrape Puebla Studios
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Run scraper for Puebla
- [ ] Review and clean data
- [ ] Import to database
```

#### EXEC-004: Scrape Monterrey Studios
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Run scraper for Monterrey
- [ ] Review and clean data
- [ ] Import to database
```

#### EXEC-005: Scrape Guadalajara Studios
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Run scraper for Guadalajara
- [ ] Review and clean data
- [ ] Import to database
```

---

### Epic 9: Data Enrichment

#### ENRICH-001: Create Website Scraper
**Type:** Task | **Size:** L | **Priority:** P1
```
- [ ] Create scripts/scrape-websites.ts
- [ ] Add Playwright browser setup
- [ ] Add pricing extractor
- [ ] Add schedule extractor
- [ ] Add instructor extractor
- [ ] Add contact info extractor
```

#### ENRICH-002: Create Instagram Scraper
**Type:** Task | **Size:** M | **Priority:** P2
```
- [ ] Create scripts/scrape-instagram.ts
- [ ] Add profile fetcher
- [ ] Add follower count extractor
- [ ] Add recent posts fetcher
- [ ] Add engagement calculator
```

#### ENRICH-003: Create Review Analyzer
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Create scripts/analyze-reviews.ts
- [ ] Add sentiment analysis
- [ ] Add keyword extraction
- [ ] Add topic categorization
- [ ] Add summary generator
```

#### ENRICH-004: Create Quality Scorer
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Create utils/quality-score.ts
- [ ] Implement scoring algorithm
- [ ] Add field weights
- [ ] Add threshold constants
- [ ] Add improvement suggestions
```

#### ENRICH-005: Manual Data Verification
**Type:** Task | **Size:** L | **Priority:** P1
```
- [ ] Create verification checklist
- [ ] Verify top 20 CDMX studios
- [ ] Add missing amenities
- [ ] Verify pricing accuracy
- [ ] Confirm business hours
```

---

## Phase 4: SEO & Performance (Week 2)

### Epic 10: SEO Implementation

#### SEO-001: Create SEO Metadata Generator
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Create utils/seo-metadata.ts
- [ ] Add title generator
- [ ] Add description generator
- [ ] Add keywords generator
- [ ] Add Open Graph tags
- [ ] Add Twitter cards
```

#### SEO-002: Create Schema Markup Generator
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Create utils/schema-markup.ts
- [ ] Add LocalBusiness schema
- [ ] Add AggregateRating schema
- [ ] Add Review schema
- [ ] Add BreadcrumbList schema
- [ ] Add Organization schema
```

#### SEO-003: Create Sitemap Generator
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Create scripts/generate-sitemap.ts
- [ ] Add city pages
- [ ] Add studio pages
- [ ] Add priority scoring
- [ ] Add lastmod dates
```

#### SEO-004: Create Robots.txt
**Type:** Task | **Size:** XS | **Priority:** P1
```
- [ ] Create public/robots.txt
- [ ] Add sitemap reference
- [ ] Add crawl delay
- [ ] Block admin pages
```

#### SEO-005: Implement Canonical URLs
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Add canonical tags to pages
- [ ] Handle duplicate content
- [ ] Add hreflang tags
- [ ] Test with SEO tools
```

---

### Epic 11: Performance Optimization

#### PERF-001: Implement Image Optimization
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Set up image CDN
- [ ] Add lazy loading
- [ ] Create responsive images
- [ ] Add WebP support
- [ ] Add placeholder blur
```

#### PERF-002: Implement Caching Strategy
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Add Redis/cache layer
- [ ] Cache API responses
- [ ] Cache search results
- [ ] Add cache invalidation
- [ ] Set TTL policies
```

#### PERF-003: Add Pagination
**Type:** Task | **Size:** S | **Priority:** P0
```
- [ ] Implement cursor pagination
- [ ] Add infinite scroll option
- [ ] Add page size selector
- [ ] Add jump to page
```

#### PERF-004: Optimize Database Queries
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Add compound indexes
- [ ] Optimize search queries
- [ ] Add query result limits
- [ ] Implement query caching
```

---

## Phase 5: Automation & Monitoring (Week 3)

### Epic 12: Automation Scripts

#### AUTO-001: Create Daily Review Updater
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Create cron/update-reviews.ts
- [ ] Fetch latest reviews
- [ ] Calculate new averages
- [ ] Update sentiment scores
- [ ] Log changes
```

#### AUTO-002: Create Weekly Enrichment Job
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Create cron/enrich-studios.ts
- [ ] Identify low-quality studios
- [ ] Run website scraper
- [ ] Update missing fields
- [ ] Generate report
```

#### AUTO-003: Create Monthly Discovery Job
**Type:** Task | **Size:** M | **Priority:** P2
```
- [ ] Create cron/discover-studios.ts
- [ ] Search for new studios
- [ ] Compare with existing
- [ ] Add new discoveries
- [ ] Alert on closures
```

#### AUTO-004: Create Data Export Job
**Type:** Task | **Size:** S | **Priority:** P2
```
- [ ] Create cron/export-data.ts
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Upload to backup storage
- [ ] Email notification
```

---

### Epic 13: Monitoring & Analytics

#### MONITOR-001: Set Up Error Tracking
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Integrate Sentry/Rollbar
- [ ] Add error boundaries
- [ ] Add API error logging
- [ ] Set up alerts
```

#### MONITOR-002: Add Analytics Tracking
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Integrate Google Analytics
- [ ] Add page view tracking
- [ ] Add event tracking
- [ ] Add conversion tracking
- [ ] Create dashboards
```

#### MONITOR-003: Create Admin Dashboard
**Type:** Story | **Size:** L | **Priority:** P2
```
- [ ] Create admin/dashboard.tsx
- [ ] Add studio statistics
- [ ] Add scraping job status
- [ ] Add quality metrics
- [ ] Add error logs
- [ ] Add manual override tools
```

#### MONITOR-004: Set Up Uptime Monitoring
**Type:** Task | **Size:** S | **Priority:** P1
```
- [ ] Configure uptime checks
- [ ] Add API health endpoint
- [ ] Add database health check
- [ ] Set up alerts
```

---

## Phase 6: Testing & QA (Week 3)

### Epic 14: Testing

#### TEST-001: Write Unit Tests for Utilities
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Test validators
- [ ] Test transformers
- [ ] Test scoring functions
- [ ] Test search queries
- [ ] Test deduplication
```

#### TEST-002: Write Component Tests
**Type:** Task | **Size:** L | **Priority:** P1
```
- [ ] Test StudioCard
- [ ] Test FilterPanel
- [ ] Test SearchBar
- [ ] Test BusinessHours
- [ ] Test RatingStars
```

#### TEST-003: Write Integration Tests
**Type:** Task | **Size:** L | **Priority:** P1
```
- [ ] Test search flow
- [ ] Test filter flow
- [ ] Test pagination
- [ ] Test data loading
- [ ] Test error states
```

#### TEST-004: Performance Testing
**Type:** Task | **Size:** M | **Priority:** P2
```
- [ ] Run Lighthouse audits
- [ ] Test page load times
- [ ] Test search performance
- [ ] Test with 1000+ studios
```

#### TEST-005: Cross-Browser Testing
**Type:** Task | **Size:** S | **Priority:** P2
```
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile browsers
```

---

## Phase 7: Launch Preparation (Week 4)

### Epic 15: Pre-Launch

#### LAUNCH-001: Security Audit
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Review API key security
- [ ] Add rate limiting
- [ ] Add input sanitization
- [ ] Review CORS settings
- [ ] Add CSP headers
```

#### LAUNCH-002: Create Documentation
**Type:** Task | **Size:** M | **Priority:** P1
```
- [ ] Write API documentation
- [ ] Create data dictionary
- [ ] Write deployment guide
- [ ] Create runbook
```

#### LAUNCH-003: Set Up Staging Environment
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Get stakeholder approval
- [ ] Fix identified issues
```

#### LAUNCH-004: Production Deployment
**Type:** Task | **Size:** M | **Priority:** P0
```
- [ ] Deploy database migrations
- [ ] Deploy application
- [ ] Verify all endpoints
- [ ] Monitor for errors
- [ ] Announce launch
```

---

## Phase 8: Post-Launch & Scale (Month 2-3)

### Epic 16: Expansion

#### EXPAND-001: Add Remaining Priority Cities
**Type:** Task | **Size:** L | **Priority:** P1
```
- [ ] Scrape Mazatlán
- [ ] Scrape Tijuana
- [ ] Scrape León
- [ ] Scrape Juárez
- [ ] Scrape Zapopan
```

#### EXPAND-002: Batch Process 20 More Cities
**Type:** Task | **Size:** L | **Priority:** P2
```
- [ ] Create city batch processor
- [ ] Run for cities 21-40
- [ ] Quality check results
- [ ] Import to production
```

#### EXPAND-003: Implement User Features
**Type:** Story | **Size:** L | **Priority:** P2
```
- [ ] Add favorites/bookmarks
- [ ] Add studio comparison
- [ ] Add review submission
- [ ] Add photo uploads
- [ ] Add booking integration
```

#### EXPAND-004: Add Monetization
**Type:** Story | **Size:** L | **Priority:** P3
```
- [ ] Add featured listings
- [ ] Add display ads
- [ ] Add affiliate links
- [ ] Add lead generation
- [ ] Add premium features
```

---

## Ticket Summary

### By Priority:
- **P0 (Critical):** 20 tickets - Must have for launch
- **P1 (High):** 35 tickets - Should have for quality
- **P2 (Medium):** 20 tickets - Nice to have
- **P3 (Low):** 5 tickets - Future enhancements

### By Size:
- **XS (0.5h):** 5 tickets
- **S (1-2h):** 25 tickets
- **M (3-4h):** 35 tickets
- **L (5-8h):** 15 tickets

### Total Estimated Hours: ~200-250 hours

### Recommended Team:
- **1 Full-stack Developer:** 4-5 weeks
- **1 Data Entry Assistant:** 1 week (for manual verification)
- **1 QA Tester:** 3-4 days

---

## Sprint Planning Suggestion

### Sprint 1 (Week 1): Foundation
- Complete Epic 1-4 (Infrastructure, Database, Types, Scraping Foundation)
- Deliverable: Working scraper for 1 city

### Sprint 2 (Week 2): Core Features
- Complete Epic 5-7 (Components, Search, Pages)
- Complete Epic 8-9 (Data Collection, Enrichment)
- Deliverable: Live directory for 2 cities

### Sprint 3 (Week 3): Quality & Scale
- Complete Epic 10-11 (SEO, Performance)
- Complete Epic 12-13 (Automation, Monitoring)
- Deliverable: Optimized site with 5 cities

### Sprint 4 (Week 4): Launch
- Complete Epic 14-15 (Testing, Launch)
- Deliverable: Production launch with 7 cities

### Sprint 5-8 (Month 2-3): Expansion
- Complete Epic 16 (Scale to 100 cities)
- Deliverable: Nationwide coverage

---

## Definition of Done

Each ticket is complete when:
1. ✅ Code is written and tested
2. ✅ Documentation is updated
3. ✅ Code review passed
4. ✅ Deployed to staging
5. ✅ Acceptance criteria met
6. ✅ No critical bugs

---

## Risk Mitigation

### High Risk Items:
1. **Google API Costs** - Monitor usage, implement caching
2. **Data Quality** - Manual verification for top studios
3. **SEO Performance** - Start indexing early, monitor rankings
4. **Scraping Blocks** - Use proxies, respect robots.txt
5. **Scale Issues** - Load test early, optimize queries

### Blockers to Watch:
- API key approval delays
- Incomplete studio data
- Translation quality
- Performance bottlenecks
- Legal/compliance issues