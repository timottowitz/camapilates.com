import { Client, Language, PlaceType1 } from '@googlemaps/google-maps-services-js';
import Bottleneck from 'bottleneck';

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

export interface PlaceDetailsResult extends PlaceSearchResult {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string; // Google Maps URL
  price_level?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    // The Places API documents this as a Unix timestamp, but the SDK types it as a
    // string, and that single disagreement was enough to make the response cast below
    // fail. Nothing reads it yet, so accept both rather than assert one is wrong.
    time: number | string;
    relative_time_description: string;
  }>;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export class GooglePlacesService {
  private client: Client;
  private limiter: Bottleneck;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Maps API key is required');
    }

    this.apiKey = apiKey;
    this.client = new Client({});

    // Rate limiter: 10 requests per second
    this.limiter = new Bottleneck({
      minTime: 100, // 100ms between requests = 10/second
      maxConcurrent: 5,
      reservoir: 100, // Start with 100 tokens
      reservoirRefreshAmount: 100,
      reservoirRefreshInterval: 60 * 1000, // Refill every minute
    });
  }

  /**
   * Search for places using text query
   */
  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<PlaceSearchResult[]> {
    return this.limiter.schedule(async () => {
      try {
        const response = await this.client.textSearch({
          params: {
            query,
            ...(location && {
              location: `${location.lat},${location.lng}`,
              radius: radius || 20000, // Default 20km radius
            }),
            language: Language.es, // Spanish results
            key: this.apiKey,
          },
        });

        if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
          return response.data.results.map((result: any) => ({
            place_id: result.place_id,
            name: result.name,
            formatted_address: result.formatted_address,
            geometry: result.geometry,
            rating: result.rating,
            user_ratings_total: result.user_ratings_total,
            types: result.types,
            business_status: result.business_status,
            opening_hours: result.opening_hours,
          }));
        } else {
          throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || ''}`);
        }
      } catch (error) {
        console.error('Error searching places:', error);
        throw error;
      }
    });
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
    return this.limiter.schedule(async () => {
      try {
        const response = await this.client.placeDetails({
          params: {
            place_id: placeId,
            fields: [
              'name',
              'formatted_address',
              'geometry',
              'rating',
              'user_ratings_total',
              'types',
              'business_status',
              'opening_hours',
              'formatted_phone_number',
              'international_phone_number',
              'website',
              'url',
              'price_level',
              'review',
              'photo',
              'address_component',
            ],
            language: Language.es,
            key: this.apiKey,
          },
        });

        if (response.data.status === 'OK') {
          return response.data.result as PlaceDetailsResult;
        } else {
          throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || ''}`);
        }
      } catch (error) {
        console.error('Error getting place details:', error);
        throw error;
      }
    });
  }

  /**
   * Search for places nearby a location
   */
  async nearbySearch(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<PlaceSearchResult[]> {
    return this.limiter.schedule(async () => {
      try {
        const response = await this.client.placesNearby({
          params: {
            location: `${location.lat},${location.lng}`,
            radius,
            ...(type && { type: type as PlaceType1 }),
            keyword: 'pilates',
            language: Language.es,
            key: this.apiKey,
          },
        });

        if (response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS') {
          return response.data.results.map((result: any) => ({
            place_id: result.place_id,
            name: result.name,
            formatted_address: result.vicinity || result.formatted_address,
            geometry: result.geometry,
            rating: result.rating,
            user_ratings_total: result.user_ratings_total,
            types: result.types,
            business_status: result.business_status,
            opening_hours: result.opening_hours,
          }));
        } else {
          throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || ''}`);
        }
      } catch (error) {
        console.error('Error with nearby search:', error);
        throw error;
      }
    });
  }

  /**
   * Build photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Batch search with multiple queries
   */
  async batchSearch(
    queries: string[],
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<Map<string, PlaceSearchResult[]>> {
    const results = new Map<string, PlaceSearchResult[]>();

    for (const query of queries) {
      try {
        console.log(`Searching for: ${query}`);
        const places = await this.searchPlaces(query, location, radius);
        results.set(query, places);
        console.log(`Found ${places.length} results for "${query}"`);
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
        results.set(query, []);
      }
    }

    return results;
  }

  /**
   * Extract neighborhood from address components
   */
  extractNeighborhood(addressComponents?: Array<{ long_name: string; types: string[] }>): string | null {
    if (!addressComponents) return null;

    // Look for neighborhood, sublocality, or administrative_area_level_2
    const neighborhoodTypes = [
      'neighborhood',
      'sublocality',
      'sublocality_level_1',
      'administrative_area_level_2',
    ];

    for (const component of addressComponents) {
      if (component.types.some(type => neighborhoodTypes.includes(type))) {
        return component.long_name;
      }
    }

    return null;
  }

  /**
   * Extract postal code from address components
   */
  extractPostalCode(addressComponents?: Array<{ long_name: string; types: string[] }>): string | null {
    if (!addressComponents) return null;

    const postalComponent = addressComponents.find(component =>
      component.types.includes('postal_code')
    );

    return postalComponent?.long_name || null;
  }
}

export default GooglePlacesService;