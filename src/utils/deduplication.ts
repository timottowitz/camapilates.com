/**
 * Deduplication utilities for Pilates studio data
 */

import { PlaceSearchResult } from '../services/google-places';

export interface StudioRecord {
  place_id?: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
}

/**
 * Deduplicate places by Google Place ID
 */
export function deduplicateByPlaceId(places: PlaceSearchResult[]): PlaceSearchResult[] {
  const seen = new Set<string>();
  const unique: PlaceSearchResult[] = [];

  for (const place of places) {
    if (!seen.has(place.place_id)) {
      seen.add(place.place_id);
      unique.push(place);
    }
  }

  return unique;
}

/**
 * Calculate similarity between two strings (0-1 score)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2[i - 1] === s1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLength);
}

/**
 * Calculate distance between two coordinates in meters
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if two studios are likely duplicates
 */
export function areDuplicates(studio1: StudioRecord, studio2: StudioRecord): boolean {
  // If they have the same Google Place ID, they're definitely duplicates
  if (studio1.place_id && studio2.place_id && studio1.place_id === studio2.place_id) {
    return true;
  }

  // Check name similarity (>80% similar)
  const nameSimilarity = stringSimilarity(studio1.name, studio2.name);
  if (nameSimilarity < 0.8) return false;

  // Check distance (within 50 meters could be the same place)
  const distance = calculateDistance(
    studio1.lat, studio1.lng,
    studio2.lat, studio2.lng
  );
  if (distance > 50) return false;

  // Additional checks for high confidence

  // If phone numbers match (and exist), they're likely duplicates
  if (studio1.phone && studio2.phone) {
    const cleanPhone1 = studio1.phone.replace(/\D/g, '');
    const cleanPhone2 = studio2.phone.replace(/\D/g, '');
    if (cleanPhone1 === cleanPhone2) return true;
  }

  // If websites match (and exist), they're likely duplicates
  if (studio1.website && studio2.website) {
    const cleanUrl1 = studio1.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const cleanUrl2 = studio2.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (cleanUrl1 === cleanUrl2) return true;
  }

  // If name is very similar AND location is very close, likely duplicate
  return nameSimilarity > 0.9 && distance < 20;
}

/**
 * Deduplicate an array of studios using multiple strategies
 */
export function deduplicateStudios(studios: StudioRecord[]): StudioRecord[] {
  const deduplicated: StudioRecord[] = [];

  for (const studio of studios) {
    const isDuplicate = deduplicated.some(existing =>
      areDuplicates(existing, studio)
    );

    if (!isDuplicate) {
      deduplicated.push(studio);
    }
  }

  return deduplicated;
}

/**
 * Merge duplicate studios, keeping the most complete data
 */
export function mergeStudioDuplicates(studio1: StudioRecord, studio2: StudioRecord): StudioRecord {
  return {
    place_id: studio1.place_id || studio2.place_id,
    name: studio1.name.length > studio2.name.length ? studio1.name : studio2.name,
    address: studio1.address.length > studio2.address.length ? studio1.address : studio2.address,
    phone: studio1.phone || studio2.phone,
    website: studio1.website || studio2.website,
    lat: studio1.lat,
    lng: studio1.lng,
  };
}

/**
 * Group studios by proximity (useful for chain detection)
 */
export function groupByProximity(studios: StudioRecord[], maxDistance: number = 100): StudioRecord[][] {
  const groups: StudioRecord[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < studios.length; i++) {
    if (assigned.has(i)) continue;

    const group = [studios[i]];
    assigned.add(i);

    for (let j = i + 1; j < studios.length; j++) {
      if (assigned.has(j)) continue;

      const distance = calculateDistance(
        studios[i].lat, studios[i].lng,
        studios[j].lat, studios[j].lng
      );

      if (distance <= maxDistance) {
        // Check if names are similar (might be same chain)
        const nameSim = stringSimilarity(studios[i].name, studios[j].name);
        if (nameSim > 0.7) {
          group.push(studios[j]);
          assigned.add(j);
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

/**
 * Clean and normalize studio name for comparison
 */
export function normalizeStudioName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

/**
 * Check if studio name contains chain indicators
 */
export function isChainStudio(name: string): boolean {
  const chainIndicators = [
    'sucursal',
    'branch',
    'sede',
    'franquicia',
    'cadena',
    '#',
    '1', '2', '3', '4', '5', // Location numbers
  ];

  const normalized = name.toLowerCase();
  return chainIndicators.some(indicator => normalized.includes(indicator));
}