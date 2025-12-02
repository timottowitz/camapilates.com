/**
 * Pilates Studio Directory Type Definitions
 *
 * These types define the complete data structure for Pilates studios
 * in the Mexican directory system. Designed for maximum automation
 * while maintaining data quality and scalability.
 */

// ============================================================================
// CORE STUDIO TYPE
// ============================================================================

export interface PilatesStudio {
  // === IDENTIFIERS ===
  id: string;
  slug: string;
  googlePlaceId: string | null;

  // === BASIC INFO ===
  name: string;
  legalName: string | null;
  brand: string | null;

  // === LOCATION ===
  address: Address;

  // === CONTACT ===
  contact: Contact;

  // === BUSINESS HOURS ===
  hours: BusinessHours;

  // === REVIEWS & METRICS ===
  reviews: ReviewMetrics;

  // === PRICING ===
  pricing: Pricing;

  // === CLASSES & OFFERINGS ===
  classes: ClassOfferings;

  // === EQUIPMENT ===
  equipment: Equipment;

  // === INSTRUCTORS ===
  instructors: InstructorInfo;

  // === AMENITIES ===
  amenities: Amenities;

  // === FACILITIES DETAILED ===
  parking: ParkingDetails | null;
  payment: PaymentMethods | null;
  
  // === AI CONTENT ===
  generatedSummary: {
    overview: string | null;
    vibe: string | null; // e.g. "Relaxing", "High Energy"
    highlight: string | null; // e.g. "Best for beginners"
  } | null;

  // === ACCESSIBILITY ===
  accessibility: Accessibility;

  // === TRANSPORTATION ===
  transportation: Transportation;

  // === MEDIA ===
  media: Media;

  // === SOCIAL MEDIA ===
  social: SocialMedia;

  // === BOOKING SYSTEM ===
  booking: BookingSystem;

  // === METADATA ===
  metadata: StudioMetadata;

  // === SEO ===
  seo: SEO;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface Address {
  street: string;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

export interface Contact {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  bookingUrl: string | null;
}

export interface BusinessHours {
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
  sunday: TimeRange[];
  timezone: string;
}

export interface TimeRange {
  open: string;
  close: string;
  is24Hours: boolean;
  isClosed: boolean;
}

export interface ReviewMetrics {
  googleRating: number | null;
  googleReviewCount: number;
  googleReviewsUrl: string | null;
  lastScraped: string;

  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  sentimentScores: {
    positive: number;
    neutral: number;
    negative: number;
    overallSentiment: 'positive' | 'neutral' | 'negative';
  };

  commonThemes: {
    instructorQuality: number;
    cleanliness: number;
    equipment: number;
    atmosphere: number;
    customerService: number;
    pricingValue: number;
  };

  recentReviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number | null;
  response: {
    text: string;
    date: string;
  } | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  themes: string[];
}

export interface Pricing {
  currency: 'MXN';
  dropInClass: number | null;
  classPackages: {
    size: number;
    price: number;
    validityDays: number | null;
  }[];
  monthlyUnlimited: number | null;
  membershipOptions: string[];
  promotions: {
    description: string;
    validUntil: string | null;
  }[];
  lastUpdated: string;
  source: 'website' | 'phone' | 'google' | 'manual';
}

export interface ClassOfferings {
  types: ClassType[];
  schedule: ClassSchedule[] | null;
  levels: ('beginner' | 'intermediate' | 'advanced' | 'all-levels')[];
  specialties: string[];
  maxClassSize: number | null;
}

export interface ClassType {
  name: string;
  description: string | null;
  duration: number | null;
  difficulty: string | null;
}

export interface ClassSchedule {
  dayOfWeek: string;
  time: string;
  className: string;
  instructor: string | null;
  availableSpots: number | null;
}

export interface Equipment {
  reformers: number | null;
  cadillac: boolean;
  wundaChair: boolean;
  barrels: boolean;
  matOnly: boolean;
  brands: string[];
}

export interface InstructorInfo {
  count: number | null;
  headInstructor: string | null;
  certifications: string[];
  profiles: InstructorProfile[];
}

export interface InstructorProfile {
  name: string;
  bio: string | null;
  certifications: string[];
  photoUrl: string | null;
  specialties: string[];
}

export interface Amenities {
  parking: boolean | null;
  showers: boolean | null;
  lockers: boolean | null;
  wifi: boolean | null;
  airConditioning: boolean | null;
  changingRooms: boolean | null;
  waterStation: boolean | null;
  retailShop: boolean | null;
}

export interface ParkingDetails {
  hasParking: boolean;
  isFree: boolean | null;
  isValet: boolean | null;
  structure: 'street' | 'lot' | 'garage' | null;
  notes: string | null;
}

export interface PaymentMethods {
  card: boolean;
  cash: boolean;
  digital: boolean; // Apple Pay, Google Pay
  transfer: boolean;
}

export interface Accessibility {
  wheelchairAccessible: boolean | null;
  elevator: boolean | null;
  groundFloor: boolean | null;
  accessibleBathroom: boolean | null;
}

export interface Transportation {
  nearbyMetro: {
    station: string;
    line: string;
    walkingMinutes: number;
  }[] | null;
  nearbyBusStops: string[] | null;
  parkingInfo: string | null;
}

export interface Media {
  logo: string | null;
  photos: {
    url: string;
    caption: string | null;
    source: 'google' | 'website' | 'instagram' | 'manual';
  }[];
  virtualTour: string | null;
  videoUrl: string | null;
}

export interface SocialMedia {
  instagram: {
    handle: string | null;
    followers: number | null;
    posts: number | null;
    lastUpdated: string | null;
  };
  facebook: {
    url: string | null;
    likes: number | null;
    lastUpdated: string | null;
  };
  tiktok: string | null;
  youtube: string | null;
}

export interface BookingSystem {
  hasOnlineBooking: boolean;
  systems: ('mindbody' | 'gympass' | 'classpass' | 'custom' | 'none')[];
  requiresMembership: boolean | null;
  allowsDropIns: boolean | null;
}

export interface StudioMetadata {
  verified: boolean;
  featured: boolean;
  claimedByOwner: boolean;
  createdAt: string;
  updatedAt: string;
  lastVerified: string | null;
  dataQualityScore: number;
  scrapingSources: string[];
  automationStatus: {
    basicInfo: 'complete' | 'partial' | 'pending';
    reviews: 'complete' | 'partial' | 'pending';
    pricing: 'complete' | 'partial' | 'pending';
    schedule: 'complete' | 'partial' | 'pending';
    media: 'complete' | 'partial' | 'pending';
  };
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schemaMarkup: object;
}

// ============================================================================
// CITY TYPES
// ============================================================================

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  neighborhoods: Neighborhood[];
  studioCount: number;
  averageRating: number | null;
  priceRange: {
    min: number | null;
    max: number | null;
    average: number | null;
  };
  seo: CitySEO;
  priority: number;
  timezone: string;
}

export interface Neighborhood {
  name: string;
  slug: string;
  studioCount: number;
  description: string | null;
}

export interface CitySEO {
  metaTitle: string;
  metaDescription: string;
  h1: string;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchFilters {
  city: string;
  neighborhood?: string;
  priceRange?: [number, number];
  minRating?: number;
  hasOnlineBooking?: boolean;
  wheelchairAccessible?: boolean;
  hasParking?: boolean;
  classTypes?: string[];
  openNow?: boolean;
  sortBy?: 'rating' | 'reviewCount' | 'price' | 'distance';
}

export interface SearchResult {
  studios: PilatesStudio[];
  totalCount: number;
  filters: SearchFilters;
}

// ============================================================================
// SCRAPING TYPES
// ============================================================================

export interface ScrapingJob {
  id: string;
  type: 'google_places' | 'reviews' | 'enrichment' | 'website';
  citySlug?: string;
  studioId?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  results?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface GooglePlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  userRatingsTotal?: number;
  photos?: {
    photoReference: string;
    width: number;
    height: number;
  }[];
  openingHours?: {
    weekdayText: string[];
    periods: {
      open: { day: number; time: string };
      close: { day: number; time: string };
    }[];
  };
  website?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AutomationTier = 'automated' | 'semi-automated' | 'manual';

export interface DataQualityReport {
  score: number;
  completeness: {
    basicInfo: number;
    contact: number;
    hours: number;
    reviews: number;
    pricing: number;
    classes: number;
    equipment: number;
    media: number;
    social: number;
  };
  issues: string[];
  lastChecked: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  score: number;
}

// ============================================================================
// EXPORT FORMAT TYPES
// ============================================================================

export interface StudioExport {
  version: string;
  exportDate: string;
  city: string;
  studioCount: number;
  studios: PilatesStudio[];
}

export interface StudioCSVRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  neighborhood: string | null;
  address: string;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  reviewCount: number;
  dropInPrice: number | null;
  monthlyPrice: number | null;
  dataQualityScore: number;
  lastUpdated: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const;

export const CLASS_TYPES = [
  'Reformer',
  'Mat',
  'Cadillac',
  'Chair',
  'Barrel',
  'Prenatal',
  'Postnatal',
  'Clinical',
  'Rehabilitation',
  'Beginners',
  'Advanced',
  'Private',
  'Duet',
  'Group',
] as const;

export const CERTIFICATION_TYPES = [
  'Stott Pilates',
  'BASI Pilates',
  'Polestar Pilates',
  'Balanced Body',
  'Peak Pilates',
  'Fletcher Pilates',
  'Power Pilates',
  'Romana\'s Pilates',
  'PHI Pilates',
] as const;
