/**
 * Programa premium de certificación STOTT PILATES® en Ciudad de México.
 * Datos del programa impartido por Pilates EduCare (pilateseducare.com),
 * hosting oficial de Merrithew® en Es.sence Pilates, Santa Fe, CDMX.
 */

export interface StottCourseHours {
  instruccion: number;
  observacion: number;
  practicaPersonal: number;
  ensenanza: number;
  total: number;
}

export interface StottCourseDate {
  label: string;
  status: 'open' | 'lastSpots' | 'full' | 'soon';
}

export interface StottCourse {
  id: string;
  level: 'Nivel 1 · Essential & Intermediate' | 'Nivel 2 · Advanced';
  name: string;
  shortName: string;
  modality: 'Presencial' | 'Online en vivo';
  tagline: string;
  price: number | null;
  priceNote?: string;
  deposit: number | null;
  capacity: number;
  cecs: number;
  exercises: number;
  hours: StottCourseHours;
  dates: StottCourseDate[];
  prerequisites: string;
  curriculum: string[];
  featured?: boolean;
}

export const STOTT_PROVIDER = {
  name: 'Pilates EduCare',
  method: 'STOTT PILATES®',
  backing: 'Merrithew®',
  countries: '100+ países',
  description:
    'Formación contemporánea que une el método original de Joseph Pilates con los principios más avanzados de la ciencia del ejercicio, la biomecánica y la rehabilitación. Reconocida mundialmente como el "Gold Standard" de la industria.',
};

export const STOTT_VENUE = {
  name: 'Es.sence Pilates',
  status: 'Hosting oficial de Merrithew®',
  address: 'Torre 300 – Local 8, Av. Santa Fe 546, Lomas de Santa Fe, Cuajimalpa de Morelos, CDMX 05348',
  area: 'Santa Fe, Ciudad de México',
  equipment: 'Equipo Merrithew® de última generación conforme a estándares internacionales STOTT PILATES®',
};

export const STOTT_STATUS_LABEL: Record<StottCourseDate['status'], string> = {
  open: 'Inscripciones abiertas',
  lastSpots: 'Últimos lugares',
  full: 'Cupo lleno',
  soon: 'Próximamente',
};

export const STOTT_COURSES: StottCourse[] = [
  {
    id: 'intensive-reformer',
    level: 'Nivel 1 · Essential & Intermediate',
    name: 'STOTT PILATES® Intensive Reformer',
    shortName: 'Intensive Reformer',
    modality: 'Presencial',
    tagline: 'La certificación insignia de Reformer: 125 horas de formación presencial en Santa Fe, CDMX.',
    price: 44000,
    deposit: 8000,
    capacity: 12,
    cecs: 5.0,
    exercises: 139,
    hours: { instruccion: 50, observacion: 10, practicaPersonal: 40, ensenanza: 25, total: 125 },
    dates: [
      { label: '17 – 28 de octubre 2026', status: 'lastSpots' },
      { label: '13 – 24 de febrero 2027', status: 'open' },
    ],
    prerequisites: 'Profesionales del fitness/salud o practicantes con mínimo 30 horas de experiencia en Reformer.',
    curriculum: [
      'Fundamentos STOTT PILATES® para movimiento seguro y efectivo',
      'Teoría y aplicación práctica del análisis postural',
      '139 ejercicios completos (repertorio esencial e intermedio)',
      'Técnicas avanzadas de fuerza, flexibilidad y coordinación',
      'Modificaciones personalizadas según postura y tipo de cuerpo',
    ],
    featured: true,
  },
  {
    id: 'intensive-mat-plus',
    level: 'Nivel 1 · Essential & Intermediate',
    name: 'STOTT PILATES® Intensive Mat-Plus™ + Advanced Mat',
    shortName: 'Intensive Mat-Plus™',
    modality: 'Online en vivo',
    tagline: 'Ruta completa de Matwork (Mat-Plus™ + Advanced Mat incluido) con instrucción en vivo por cámara.',
    price: 36800,
    priceNote: 'Incluye manuales oficiales Merrithew® (envío por cuenta del alumno) y el módulo Advanced Matwork.',
    deposit: 8000,
    capacity: 12,
    cecs: 4.0,
    exercises: 63,
    hours: { instruccion: 40, observacion: 10, practicaPersonal: 30, ensenanza: 15, total: 95 },
    dates: [{ label: '29 de agosto – 8 de septiembre 2026', status: 'open' }],
    prerequisites: 'Profesionales del fitness/salud o practicantes con 30+ horas de experiencia en Pilates.',
    curriculum: [
      'Biomecánica fundamental y control corporal',
      '63 ejercicios completos (niveles esencial e intermedio)',
      'Análisis postural, técnicas de cueing y estrategias de progresión',
      'Accesorios funcionales: Flex-Band®, Fitness Circle® y Arc Barrel',
      'Instrucción intensiva en grupos reducidos',
    ],
  },
  {
    id: 'advanced-reformer',
    level: 'Nivel 2 · Advanced',
    name: 'STOTT PILATES® Advanced Reformer',
    shortName: 'Advanced Reformer',
    modality: 'Presencial',
    tagline: 'Intensivo de 3 días con los 28 ejercicios avanzados de máxima exigencia técnica.',
    price: 20000,
    deposit: 5000,
    capacity: 12,
    cecs: 1.8,
    exercises: 28,
    hours: { instruccion: 18, observacion: 2, practicaPersonal: 4, ensenanza: 3, total: 27 },
    dates: [{ label: '4 – 6 de diciembre 2026', status: 'full' }],
    prerequisites: 'Haber completado STOTT PILATES® Intensive Reformer.',
    curriculum: [
      '28 ejercicios avanzados de máxima fuerza y flexibilidad',
      'Precisión y control de secuenciación neuromuscular',
      'Variantes de acondicionamiento atlético de alta intensidad',
      'Análisis técnico profundo de movimientos complejos',
    ],
  },
  {
    id: 'matwork-presencial',
    level: 'Nivel 1 · Essential & Intermediate',
    name: 'STOTT PILATES® Matwork Presencial',
    shortName: 'Matwork Presencial',
    modality: 'Presencial',
    tagline: 'La ruta de Matwork en formato 100% presencial en Santa Fe, CDMX.',
    price: 39500,
    deposit: 8000,
    capacity: 12,
    cecs: 4.0,
    exercises: 63,
    hours: { instruccion: 40, observacion: 10, practicaPersonal: 30, ensenanza: 15, total: 95 },
    dates: [{ label: 'Fechas por anunciar', status: 'soon' }],
    prerequisites: 'Profesionales del fitness/salud o practicantes con 30+ horas de experiencia en Pilates.',
    curriculum: [
      'Biomecánica fundamental y control corporal',
      '63 ejercicios completos (niveles esencial e intermedio)',
      'Análisis postural, técnicas de cueing y estrategias de progresión',
      'Accesorios funcionales: Flex-Band®, Fitness Circle® y Arc Barrel',
    ],
  },
];

export const STOTT_EXAM_PROCESS = [
  'Al completar la fase presencial recibes tu Carta de Finalización (Completion Certificate).',
  'Completa tus horas de observación, práctica personal y enseñanza supervisada.',
  'El Examen de Certificación Internacional se agenda de forma independiente (costo adicional).',
  'Al aprobar, obtienes la certificación STOTT PILATES® con validez en más de 100 países.',
];

export const formatMXN = (value: number): string =>
  `$${value.toLocaleString('es-MX')} MXN`;
