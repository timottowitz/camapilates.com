export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type DataSource = 
  | 'instagram' 
  | 'facebook' 
  | 'linkedin' 
  | 'website' 
  | 'studio_website'
  | 'user_claim'
  | 'admin_verified'
  | 'scrape_auto';

export interface ConfidenceScore {
  value: number;
  level: ConfidenceLevel;
  source: DataSource;
  observedAt: number;
  evidence?: string;
}

export interface FieldWithConfidence<T> {
  value: T;
  confidence: ConfidenceScore;
}

export const PILATES_CERTIFICATIONS = {
  'BASI_COMPREHENSIVE': {
    normalized: 'BASI Pilates Comprehensive',
    aliases: ['BASI', 'B.A.S.I.', 'BASI Comprehensive', 'Body Arts and Science International'],
    organization: 'BASI Pilates',
    url: 'https://basipilates.com',
  },
  'STOTT_COMPREHENSIVE': {
    normalized: 'Stott Pilates Comprehensive',
    aliases: ['Stott', 'STOTT', 'Stott Comprehensive', 'Merrithew'],
    organization: 'Merrithew (Stott Pilates)',
    url: 'https://merrithew.com',
  },
  'POLESTAR_COMPREHENSIVE': {
    normalized: 'Polestar Pilates Comprehensive',
    aliases: ['Polestar', 'Polestar Comprehensive'],
    organization: 'Polestar Pilates',
    url: 'https://polestarpilates.com',
  },
  'BALANCED_BODY_COMPREHENSIVE': {
    normalized: 'Balanced Body Comprehensive',
    aliases: ['Balanced Body', 'BB Comprehensive'],
    organization: 'Balanced Body',
    url: 'https://www.pilates.com',
  },
  'PEAK_COMPREHENSIVE': {
    normalized: 'Peak Pilates Comprehensive',
    aliases: ['Peak', 'Peak Pilates'],
    organization: 'Peak Pilates',
    url: 'https://www.peakpilates.com',
  },
  'FLETCHER_PILATES': {
    normalized: 'Fletcher Pilates',
    aliases: ['Fletcher', 'Ron Fletcher'],
    organization: 'Fletcher Pilates',
    url: 'https://fletcherpilates.com',
  },
  'POWER_PILATES': {
    normalized: 'Power Pilates',
    aliases: ['Power Pilates', 'Power Pilates NYC'],
    organization: 'Power Pilates',
    url: 'https://powerpilates.com',
  },
  'ROMANA_PILATES': {
    normalized: "Romana's Pilates",
    aliases: ['Romana', "Romana's", 'Romana Kryzanowska'],
    organization: "Romana's Pilates",
    url: 'https://romanaspilates.com',
  },
  'PHI_PILATES': {
    normalized: 'PHI Pilates',
    aliases: ['PHI', 'Pilates Health International'],
    organization: 'PHI Pilates',
    url: 'https://phipilates.com',
  },
  'PMA_CERTIFIED': {
    normalized: 'PMA Certified Pilates Teacher',
    aliases: ['PMA', 'Pilates Method Alliance', 'PMA-CPT'],
    organization: 'Pilates Method Alliance',
    url: 'https://www.pilatesmethodalliance.org',
  },
  'PRENATAL_PILATES': {
    normalized: 'Prenatal Pilates Specialist',
    aliases: ['Prenatal', 'Pre/Postnatal', 'Pregnancy Pilates'],
    organization: null,
    url: null,
  },
  'REHAB_PILATES': {
    normalized: 'Pilates Rehabilitation Specialist',
    aliases: ['Rehab', 'Clinical Pilates', 'Therapeutic Pilates'],
    organization: null,
    url: null,
  },
  'SENIORS_PILATES': {
    normalized: 'Pilates for Seniors Specialist',
    aliases: ['Seniors', 'Elderly', 'Active Aging'],
    organization: null,
    url: null,
  },
  'ATHLETIC_PILATES': {
    normalized: 'Athletic Pilates Specialist',
    aliases: ['Athletic', 'Sports Pilates', 'Performance Pilates'],
    organization: null,
    url: null,
  },
} as const;

export type CertificationKey = keyof typeof PILATES_CERTIFICATIONS;

export const PILATES_SPECIALIZATIONS = {
  'MAT': 'Mat Pilates',
  'REFORMER': 'Reformer',
  'CADILLAC': 'Cadillac/Trapeze Table',
  'WUNDA_CHAIR': 'Wunda Chair',
  'LADDER_BARREL': 'Ladder Barrel',
  'SPINE_CORRECTOR': 'Spine Corrector',
  'MAGIC_CIRCLE': 'Magic Circle',
  'PRENATAL': 'Prenatal/Postnatal',
  'SENIORS': 'Seniors',
  'ATHLETES': 'Athletes',
  'REHABILITATION': 'Rehabilitation',
  'BEGINNERS': 'Beginners',
  'ADVANCED': 'Advanced Practitioners',
  'CLASSICAL': 'Classical Pilates',
  'CONTEMPORARY': 'Contemporary Pilates',
  'CLINICAL': 'Clinical Pilates',
  'ATHLETIC': 'Athletic Pilates',
} as const;

export type SpecializationKey = keyof typeof PILATES_SPECIALIZATIONS;

export const EXPERIENCE_LEVELS = {
  'ENTRY': {
    label: 'Entry Level',
    yearsMin: 0,
    yearsMax: 2,
  },
  'INTERMEDIATE': {
    label: 'Intermediate',
    yearsMin: 2,
    yearsMax: 5,
  },
  'EXPERIENCED': {
    label: 'Experienced',
    yearsMin: 5,
    yearsMax: 10,
  },
  'SENIOR': {
    label: 'Senior Instructor',
    yearsMin: 10,
    yearsMax: 20,
  },
  'MASTER': {
    label: 'Master Instructor',
    yearsMin: 20,
    yearsMax: null,
  },
} as const;

export type ExperienceLevelKey = keyof typeof EXPERIENCE_LEVELS;

export interface PilatesTeacherProfile {
  _id?: string;
  slug: string;
  fullName: FieldWithConfidence<string>;
  displayName?: FieldWithConfidence<string>;
  citySlug: string;
  cityName: FieldWithConfidence<string>;
  neighborhoodSlug?: FieldWithConfidence<string>;
  bio?: FieldWithConfidence<string>;
  profilePhoto?: FieldWithConfidence<{
    storageId: string;
    source: 'upload' | 'instagram_oauth' | 'scrape';
    url?: string;
    updatedAt: number;
  }>;
  specializations: FieldWithConfidence<SpecializationKey[]>;
  experienceYears?: FieldWithConfidence<number>;
  experienceLevel?: FieldWithConfidence<ExperienceLevelKey>;
  languages: FieldWithConfidence<string[]>;
  certifications: Array<{
    key: CertificationKey;
    name: string;
    organization?: string;
    year?: FieldWithConfidence<number>;
    expiryDate?: FieldWithConfidence<string>;
    credentialId?: FieldWithConfidence<string>;
    isVerified: boolean;
    verificationProof?: {
      storageId?: string;
      url?: string;
      uploadedAt?: number;
    };
  }>;
  studioAssociations: Array<{
    studioId?: string;
    studioSlug?: string;
    studioName: FieldWithConfidence<string>;
    status: 'inferred' | 'pending' | 'verified' | 'rejected';
    confidence: ConfidenceScore;
    verifiedAt?: number;
  }>;
  contact?: {
    email?: FieldWithConfidence<string>;
    phone?: FieldWithConfidence<string>;
    whatsapp?: FieldWithConfidence<string>;
    bookingUrl?: FieldWithConfidence<string>;
    isPublic: boolean;
  };
  social?: {
    instagram?: FieldWithConfidence<string>;
    linkedin?: FieldWithConfidence<string>;
    facebook?: FieldWithConfidence<string>;
    tiktok?: FieldWithConfidence<string>;
    website?: FieldWithConfidence<string>;
  };
  status: 'scraped' | 'claimed' | 'verified' | 'suspended';
  isVerified: boolean;
  isActive: boolean;
  dataQualityScore: number;
  createdAt: number;
  updatedAt: number;
}