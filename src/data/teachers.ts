export interface TeacherCity {
  _id: string;
  slug: string;
  name: string;
  teacherCount?: number;
}

export interface TeacherProfileLite {
  _id: string;
  slug: string;
  fullName: { value: string };
  citySlug: string;
  cityName: { value: string };
  bio?: { value: string };
  specializations: { value: string[] };
  experienceYears?: { value: number };
  languages?: { value: string[] };
  certifications: Array<{
    name: string;
    organization?: string;
    year?: { value: number };
    isVerified: boolean;
  }>;
  isVerified: boolean;
  profilePhoto?: { value: { url?: string; storageId: string; source: string } };
  studios?: any[];
  social?: {
    instagram?: { value: string };
    linkedin?: { value: string };
    website?: { value: string };
    facebook?: { value: string };
  };
  contact?: {
    bookingUrl?: { value: string };
    email?: { value: string };
    phone?: { value: string };
  };
}

export const TEACHER_CITIES: TeacherCity[] = [
  { _id: 'city_guadalajara', slug: 'guadalajara', name: 'Guadalajara' },
  { _id: 'city_cdmx', slug: 'ciudad-de-mexico', name: 'Ciudad de México' },
];

import { TEACHERS_SEED_CDMX } from './teachers_cdmx';

export const TEACHERS_SEED: TeacherProfileLite[] = [
  {
    _id: 'teacher_doris_wakeman',
    slug: 'doris-wakeman',
    fullName: { value: 'Doris Wakeman' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Instructora de Pilates enfocada en rehabilitación, fitness y bienestar.' },
    specializations: { value: ['Rehabilitación', 'Reformer', 'Bienestar'] },
    certifications: [
      { name: 'Pilates (enfoque rehabilitación)', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
    social: {
      linkedin: { value: 'https://mx.linkedin.com/in/doris-wakeman-6282372b' },
    },
  },
  {
    _id: 'teacher_gabriela_calderon',
    slug: 'gabriela-calderon',
    fullName: { value: 'Gabriela Calderón' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Instructor Trainer. Pilates contemporáneo y sesiones privadas.' },
    specializations: { value: ['Formación de instructores', 'Pilates contemporáneo', 'Sesiones privadas'] },
    certifications: [
      { name: 'Instructor Trainer', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
    social: {
      linkedin: { value: 'https://mx.linkedin.com/in/gabriela-calder%C3%B3n-b99952125' },
      instagram: { value: '@gabyotapilates' },
    },
  },
  {
    _id: 'teacher_stephany_rodriguez',
    slug: 'stephany-rodriguez',
    fullName: { value: 'Stephany Rodriguez' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Studio owner e instructora. Fundadora de Smartbody Pilates.' },
    specializations: { value: ['Reformer', 'Sesiones privadas', 'Emprendimiento'] },
    certifications: [
      { name: 'Pilates Instructor', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
    social: {
      linkedin: { value: 'https://mx.linkedin.com/in/stephanyrodriguezlopez' },
    },
  },
  {
    _id: 'teacher_yarely_chavez',
    slug: 'yarely-chavez',
    fullName: { value: 'Yarely Chavez' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Instructora de Reformer Pilates. (Afiliación: FS8, por confirmar sesiones privadas).' },
    specializations: { value: ['Reformer', 'Clases grupales', 'Fitness'] },
    certifications: [],
    isVerified: false,
    social: {
      linkedin: { value: 'https://qa.linkedin.com/in/yarely-chavez-' },
    },
  },
  {
    _id: 'teacher_sara_rehab',
    slug: 'sara-rehabilitacion',
    fullName: { value: 'Sara (Rehabilitación)' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Fisioterapeuta enfocada en terapia manual y ejercicio terapéutico. Pilates individual y reeducación postural (a domicilio).' },
    specializations: { value: ['Fisioterapia', 'Ejercicio terapéutico', 'Pilates terapéutico'] },
    certifications: [
      { name: 'Fisioterapia', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
  },
  {
    _id: 'teacher_alina_duran_roux',
    slug: 'alina-duran-roux',
    fullName: { value: 'Alina Duran Roux' },
    citySlug: 'guadalajara',
    cityName: { value: 'Guadalajara' },
    bio: { value: 'Instructora de Pilates (Real Pilates Certified). Ex‑triatleta.' },
    specializations: { value: ['Reformer', 'Atletas', 'Sesiones privadas'] },
    certifications: [
      { name: 'Real Pilates Certified', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
    social: {
      instagram: { value: '@rouxalinaduran' },
    },
  },
  {
    _id: 'teacher_kristina_fejes',
    slug: 'kristina-fejes',
    fullName: { value: 'Kristina Fejes' },
    citySlug: 'ciudad-de-mexico',
    cityName: { value: 'Ciudad de México' },
    bio: { value: 'Pilates x Health x Body Coach. Certificada en prenatal/postnatal y Pilates para lesiones y patologías.' },
    specializations: { value: ['Prenatal/Postnatal', 'Rehabilitación', 'Online'] },
    certifications: [
      { name: 'Prenatal/Postnatal Pilates', organization: 'Perfil público', isVerified: false },
      { name: 'Pilates para lesiones/patologías', organization: 'Perfil público', isVerified: false },
    ],
    isVerified: false,
    social: {
      linkedin: { value: 'https://www.linkedin.com/in/bodybykristina' },
    },
  },
  ...TEACHERS_SEED_CDMX,
];

export function getTeachersByCitySlug(citySlug: string): TeacherProfileLite[] {
  return TEACHERS_SEED.filter((t) => t.citySlug === citySlug);
}

export function getTeacherByCityAndSlug(citySlug: string, slug: string): TeacherProfileLite | null {
  const safeCity = String(citySlug || '').trim();
  const safeSlug = String(slug || '').trim();
  if (!safeCity || !safeSlug) return null;
  const candidates = new Set<string>([safeSlug]);
  const suffix = `-${safeCity}`;
  if (safeSlug.endsWith(suffix)) candidates.add(safeSlug.slice(0, -suffix.length));
  candidates.add(`${safeSlug}${suffix}`);

  for (const candidate of candidates) {
    const found = TEACHERS_SEED.find((t) => t.citySlug === safeCity && t.slug === candidate);
    if (found) return found;
  }
  return null;
}

export function getFeaturedTeachers(limit = 6): TeacherProfileLite[] {
  return TEACHERS_SEED.slice(0, limit);
}

export function getTeacherCities(): TeacherCity[] {
  const counts = new Map<string, number>();
  const names = new Map<string, string>();
  for (const t of TEACHERS_SEED) {
    counts.set(t.citySlug, (counts.get(t.citySlug) || 0) + 1);
    names.set(t.citySlug, t.cityName.value);
  }
  const baseBySlug = new Map(TEACHER_CITIES.map((c) => [c.slug, c]));

  const fromSeeds: TeacherCity[] = Array.from(counts.keys())
    .filter((slug) => !baseBySlug.has(slug))
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((slug) => ({
      _id: `city_${slug}`,
      slug,
      name: names.get(slug) || slug,
      teacherCount: counts.get(slug) || 0,
    }));

  return [
    ...TEACHER_CITIES.map((c) => ({
      ...c,
      teacherCount: counts.get(c.slug) || 0,
      name: names.get(c.slug) || c.name,
    })),
    ...fromSeeds,
  ];
}
