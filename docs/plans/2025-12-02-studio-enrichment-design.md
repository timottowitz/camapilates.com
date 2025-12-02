# Studio Enrichment Pipeline Design

**Date:** 2025-12-02
**Status:** Approved
**Scope:** CDMX ~170 studios, full Google Places API enrichment

## Overview

Build a complete data warehouse for Pilates studio data by:
1. Fetching full Place Details from Google Places API (New)
2. Storing raw API responses in Convex for future-proofing
3. Downloading and storing photos in Convex file storage
4. Mapping enriched data to existing studio schema

## Architecture

### New Tables

```
placesRawData
├── googlePlaceId: string (indexed)
├── studioId: Id<"studios">
├── rawResponse: object (complete API response)
├── fetchedAt: number
├── apiVersion: string ("v1")
└── fieldMask: string

studioPhotos
├── studioId: Id<"studios">
├── googlePlaceId: string
├── storageId: Id<"_storage">
├── photoIndex: number (0-9)
├── width: number
├── height: number
├── attribution: object
└── uploadedAt: number
```

### API Field Mask

```
displayName, formattedAddress, nationalPhoneNumber,
internationalPhoneNumber, websiteUri, googleMapsUri,
regularOpeningHours, rating, userRatingCount,
priceLevel, editorialSummary, reviews,
photos, types, primaryType, primaryTypeDisplayName,
accessibilityOptions, paymentOptions, parkingOptions,
businessStatus, utcOffsetMinutes, adrFormatAddress,
shortFormattedAddress, addressComponents, location
```

### Cost Estimate

| Item | Cost |
|------|------|
| Place Details per studio | ~$0.008 |
| Photos (5 per studio) | ~$0.035 |
| **Per studio total** | ~$0.043 |
| **170 CDMX studios** | ~$7-8 |

## Process Flow

```
npx convex run studios:enrichAll

1. Query studios (city = "Ciudad de México", has googlePlaceId)
2. Batch loop (5 studios, 500ms delay):
   a. Fetch Place Details → store in placesRawData
   b. Download 5 photos → upload to Convex storage → studioPhotos
   c. Map fields → update studios table
3. Return summary
```

### Rate Limiting
- 5 studios per batch
- 500ms between batches
- ~10 studios/minute
- Total: ~17 minutes for 170 studios

### Error Handling
- Continue on individual failure
- Log errors, don't halt
- Return error summary

## Field Mapping

```typescript
// Metrics
metrics.googleRating      ← rating
metrics.googleReviewCount ← userRatingCount
metrics.lastReviewDate    ← reviews[0].publishTime

// Contact
contact.phone    ← nationalPhoneNumber
contact.website  ← websiteUri

// Hours
hours.monday-sunday ← regularOpeningHours.weekdayDescriptions
hours.timezone      ← utcOffsetMinutes

// Description
description ← editorialSummary.text

// Amenities (merged)
amenities ← accessibilityOptions + parkingOptions + paymentOptions

// Quality
lastEnriched     ← Date.now()
dataQualityScore ← calculated (0-100)
```

## Implementation Tasks

1. Add `placesRawData` table to schema
2. Add `studioPhotos` table to schema
3. Create `enrichAll` action in studios.ts
4. Create helper for photo download/upload
5. Create field mapping utility
6. Test with 1 studio
7. Run full enrichment for CDMX
8. Verify data in dashboard

## Future: Cron Jobs

Architecture supports adding scheduled enrichment:
```typescript
// convex/crons.ts
crons.weekly("enrich-studios", { ... }, api.studios.enrichAll)
```
