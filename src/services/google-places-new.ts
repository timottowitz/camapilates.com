/**
 * Google Places API (New) Service
 * Using the new Places API for better features and data
 * Documentation: https://developers.google.com/maps/documentation/places/web-service/overview
 */

import axios from 'axios';
import Bottleneck from 'bottleneck';

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

export interface PlaceNewSearchResult {
  id: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  displayName: {
    text: string;
    languageCode: string;
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
    weekdayDescriptions?: string[];
  };
  priceLevel?: 'PRICE_LEVEL_FREE' | 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE';
  businessStatus?: string;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
  }>;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
    languageCode: string;
  }>;
  plusCode?: {
    globalCode: string;
    compoundCode: string;
  };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: {
    text: string;
    languageCode: string;
  };
  reviews?: Array<{
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    originalText: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      uri: string;
      photoUri: string;
    };
    publishTime: string;
  }>;
  currentOpeningHours?: {
    openNow?: boolean;
    periods?: Array<{
      open: {
        date: { year: number; month: number; day: number };
        time?: { hour: number; minute: number };
        truncated?: boolean;
      };
      close?: {
        date: { year: number; month: number; day: number };
        time?: { hour: number; minute: number };
        truncated?: boolean;
      };
    }>;
    weekdayDescriptions?: string[];
    secondaryHoursType?: string;
    specialDays?: Array<{
      date: { year: number; month: number; day: number };
    }>;
  };
  secondaryOpeningHours?: Array<{
    openNow?: boolean;
    periods?: Array<any>;
    weekdayDescriptions?: string[];
    secondaryHoursType?: string;
  }>;
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  parkingOptions?: {
    paidParkingLot?: boolean;
    paidStreetParking?: boolean;
    valetParking?: boolean;
    freeGarageParking?: boolean;
    freeStreetParking?: boolean;
    freeParkingLot?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  generativeSummary?: {
    overview?: {
      text: string;
      languageCode: string;
    };
    description?: {
      text: string;
      languageCode: string;
    };
  };
}

export class GooglePlacesNewService {
  private apiKey: string;
  private limiter: Bottleneck;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Maps API key is required');
    }

    this.apiKey = apiKey;

    // Rate limiter: 10 requests per second
    this.limiter = new Bottleneck({
      minTime: 100, // 100ms between requests = 10/second
      maxConcurrent: 5,
      reservoir: 100,
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 60 * 1000, // Refill every minute
    });
  }

  /**
   * Search for places using text search (New API)
   */
  async searchPlacesText(query: string, locationBias?: { lat: number; lng: number; radius: number }): Promise<PlaceNewSearchResult[]> {
    return this.limiter.schedule(async () => {
      try {
        const requestBody: any = {
          textQuery: query,
          languageCode: 'es-MX',
          maxResultCount: 20,
          rankPreference: 'RELEVANCE',
          includedType: 'gym', // Pilates studios often categorized as gyms
          locationBias: locationBias ? {
            circle: {
              center: {
                latitude: locationBias.lat,
                longitude: locationBias.lng,
              },
              radius: locationBias.radius,
            },
          } : undefined,
        };

        const response = await axios.post(
          `${PLACES_API_BASE}:searchText`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.regularOpeningHours,places.priceLevel,places.businessStatus,places.photos,places.types,places.primaryType,places.primaryTypeDisplayName',
            },
          }
        );

        return response.data.places || [];
      } catch (error) {
        console.error('Error searching places (New API):', error);
        if (axios.isAxiosError(error) && error.response) {
          console.error('API Response:', error.response.data);
        }
        throw error;
      }
    });
  }

  /**
   * Search nearby places
   */
  async searchNearby(location: { lat: number; lng: number }, radius: number = 5000): Promise<PlaceNewSearchResult[]> {
    return this.limiter.schedule(async () => {
      try {
        const requestBody = {
          includedTypes: ['gym', 'health'],
          excludedTypes: ['night_club'],
          maxResultCount: 20,
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              radius: radius,
            },
          },
          languageCode: 'es-MX',
        };

        const response = await axios.post(
          `${PLACES_API_BASE}:searchNearby`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.priceLevel,places.businessStatus,places.photos,places.types,places.primaryType',
            },
          }
        );

        // Filter for Pilates studios
        const places = response.data.places || [];
        return places.filter((place: any) => {
          const name = place.displayName?.text?.toLowerCase() || '';
          const types = place.types || [];
          return name.includes('pilates') ||
                 name.includes('reformer') ||
                 types.includes('pilates_studio') ||
                 types.includes('gym');
        });
      } catch (error) {
        console.error('Error searching nearby (New API):', error);
        throw error;
      }
    });
  }

  /**
   * Get detailed place information
   */
  async getPlaceDetails(placeId: string): Promise<PlaceNewSearchResult> {
    return this.limiter.schedule(async () => {
      try {
        const response = await axios.get(
          `${PLACES_API_BASE}/${placeId}`,
          {
            headers: {
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': '*', // Get all available fields
            },
            params: {
              languageCode: 'es-MX',
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error('Error getting place details (New API):', error);
        throw error;
      }
    });
  }

  /**
   * Get photo URL for a place photo
   */
  getPhotoUrl(photoName: string, maxWidth: number = 400, maxHeight: number = 400): string {
    // Photo reference format: places/PLACE_ID/photos/PHOTO_ID
    // The photoName from API already includes "places/" prefix
    // PLACES_API_BASE already ends with "/places", so we need to construct the URL carefully

    // If photoName starts with "places/", use it directly after the base URL (without /places)
    if (photoName.startsWith('places/')) {
      const baseUrlWithoutPlaces = 'https://places.googleapis.com/v1';
      return `${baseUrlWithoutPlaces}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${this.apiKey}`;
    }

    // Otherwise append to the full base URL
    return `${PLACES_API_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${this.apiKey}`;
  }

  /**
   * Extract neighborhood from address components
   */
  extractNeighborhood(addressComponents?: Array<{ longText: string; types: string[] }>): string | null {
    if (!addressComponents) return null;

    const neighborhoodTypes = [
      'neighborhood',
      'sublocality',
      'sublocality_level_1',
      'administrative_area_level_2',
    ];

    for (const component of addressComponents) {
      if (component.types && Array.isArray(component.types) && component.types.some(type => neighborhoodTypes.includes(type))) {
        return component.longText;
      }
    }

    return null;
  }

  /**
   * Extract postal code from address components
   */
  extractPostalCode(addressComponents?: Array<{ longText: string; types: string[] }>): string | null {
    if (!addressComponents) return null;

    const postalComponent = addressComponents.find(component =>
      component.types && Array.isArray(component.types) && component.types.includes('postal_code')
    );

    return postalComponent?.longText || null;
  }

  /**
   * Convert price level to numeric range
   */
  convertPriceLevel(priceLevel?: string): { min: number; max: number } | null {
    const priceMap = {
      'PRICE_LEVEL_FREE': { min: 0, max: 0 },
      'PRICE_LEVEL_INEXPENSIVE': { min: 100, max: 300 },
      'PRICE_LEVEL_MODERATE': { min: 300, max: 600 },
      'PRICE_LEVEL_EXPENSIVE': { min: 600, max: 1000 },
      'PRICE_LEVEL_VERY_EXPENSIVE': { min: 1000, max: 2000 },
    };

    return priceLevel && priceLevel in priceMap
      ? priceMap[priceLevel as keyof typeof priceMap]
      : null;
  }

  /**
   * Batch search with multiple queries using the new API
   */
  async batchSearchText(
    queries: string[],
    locationBias?: { lat: number; lng: number; radius: number }
  ): Promise<Map<string, PlaceNewSearchResult[]>> {
    const results = new Map<string, PlaceNewSearchResult[]>();

    for (const query of queries) {
      try {
        console.log(`Searching for: ${query}`);
        const places = await this.searchPlacesText(query, locationBias);
        results.set(query, places);
        console.log(`Found ${places.length} results for "${query}"`);
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
        results.set(query, []);
      }
    }

    return results;
  }
}

export default GooglePlacesNewService;