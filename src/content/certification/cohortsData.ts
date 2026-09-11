/**
 * Datos y calendario de las cohortes de certificación en Querétaro y Monterrey.
 * Incluye la información de la Masterclass / Pre-Webinar en vivo con Gabi y Laura Munive.
 */

export interface CohortWeekend {
  weekendNumber: number;
  dates: string;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string;   // ISO format YYYY-MM-DD
  title: string;
  description: string;
  hours: number;
  image?: string;
  localImage?: string;
  bracketTag?: string;
  colorTheme?: {
    bg: string;
    headerGradient: string;
    accent: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    pillBg: string;
    pillText: string;
  };
  competencies?: string[];
}

export interface CityCertificationCohort {
  id: string;
  cityKey: 'queretaro' | 'monterrey';
  cityName: string;
  stateName: string;
  periodLabel: string;
  fullDatesLabel: string;
  totalHours: number;
  contactHours: number;
  scheduleHours: string;
  basicPrice: number; // $25,000 MXN (28h)
  basicHours: number; // 28h
  fullPrice: number; // $38,000 MXN (48h)
  fullHours: number; // 48h
  regularPrice: number;
  discountedPrice: number;
  depositPrice: number;
  capacityPerCity: number;
  location: {
    name: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  weekends: CohortWeekend[];
  benefits: string[];
}

export const WEBINAR_INFO = {
  title: "Masterclass Gratuita: Certificación Pilates Reformer (Querétaro y Monterrey)",
  subtitle: "Sesión online en vivo 100% GRATUITA vía Google Meet. Orientación profesional, desglose del plan de estudios y acceso prioritario a los 12 cupos con 50% de descuento para las cohortes presenciales.",
  date: "Sábado 26 de Septiembre de 2026",
  isoDateTime: "2026-09-26T11:00:00-06:00",
  isoEndDateTime: "2026-09-26T12:15:00-06:00",
  time: "11:00 AM – 12:15 PM CST (Hora de CDMX / Querétaro / Monterrey)",
  platform: "Transmisión Online en Vivo vía Google Meet (100% Gratuito)",
  hosts: [
    {
      name: "Gabi",
      role: "Master Trainer Internacional de Pilates",
      bio: "Especialista en biomecánica funcional, pedagogía del movimiento y formación de más de 400 instructores certificados en México y Latinoamérica.",
    },
    {
      name: "Laura Munive",
      role: "Master Instructor & Mentora de Estudios de Pilates",
      bio: "Directora técnica, formadora de instructores de alto rendimiento y consultora en desarrollo de carrera y rentabilidad para estudios de Pilates Reformer.",
    }
  ],
  agenda: [
    {
      time: "11:00 AM",
      topic: "El auge del Pilates Reformer en México y por qué Querétaro y Monterrey tienen escasez de instructoras certificadas de alto nivel."
    },
    {
      time: "11:15 AM",
      topic: "Qué diferencia una certificación profesional seria (100h) de cursos acelerados sin práctica ni biomecánica clínica."
    },
    {
      time: "11:35 AM",
      topic: "Desglose módulo por módulo de los 4 fines de semana en Querétaro (Noviembre) y Monterrey (Diciembre – Enero)."
    },
    {
      time: "11:50 AM",
      topic: "Apertura de los 12 cupos exclusivos con 50% de descuento ($19,900 MXN en vez de $39,800 MXN) para la lista de espera."
    },
    {
      time: "12:00 PM",
      topic: "Sesión de preguntas y respuestas en directo con Gabi y Laura Munive."
    }
  ],
  whatsappSupportNumber: "525548468190",
  whatsappMessage: "Hola, me registré al webinar de certificación con Gabi y Laura Munive para Querétaro y Monterrey. Quiero confirmar mi acceso y asegurar mi cupo del 50% de descuento.",
};

export const CERTIFICATION_COHORTS: Record<'queretaro' | 'monterrey', CityCertificationCohort> = {
  queretaro: {
    id: "queretaro-nov-2026",
    cityKey: "queretaro",
    cityName: "Querétaro",
    stateName: "Querétaro",
    periodLabel: "Noviembre 2026",
    fullDatesLabel: "7 al 29 de Noviembre de 2026 (2 Fines de Sem. Básico / 4 Fines de Sem. Completo)",
    totalHours: 48,
    contactHours: 48,
    scheduleHours: "Sábados y Domingos de 9:00 AM a 4:30 PM",
    basicPrice: 25000,
    basicHours: 28,
    fullPrice: 38000,
    fullHours: 48,
    regularPrice: 38000,
    discountedPrice: 25000,
    depositPrice: 400,
    capacityPerCity: 12,
    location: {
      name: "CAMA Studio Querétaro",
      neighborhood: "Juriquilla / Álamos",
      city: "Santiago de Querétaro",
      state: "Querétaro",
    },
    weekends: [
      {
        weekendNumber: 1,
        dates: "7 y 8 de Noviembre 2026",
        startDate: "2026-11-07",
        endDate: "2026-11-08",
        title: "Módulo I: Anatomía Funcional Aplicada & Repertorio Esencial Reformer",
        description: "Biomecánica de la pelvis, caja torácica y columna. Principios de respiración, centrado y ejecución técnica de los 35 ejercicios esenciales (Footwork, Bridging, Feet in Straps, Abdominal Series). Parte del Curso Básico (28h).",
        hours: 14,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/28c65fb2-8459-443d-ade5-67790beaf2bd/image.webp",
        localImage: "/images/courses/module-1-biomechanics.webp",
        bracketTag: "[ 14 HORAS · BÁSICO & COMPLETO ]",
        colorTheme: {
          bg: "#14323D",
          headerGradient: "from-[#183D4A] via-[#14323D] to-transparent",
          accent: "text-teal-200",
          badgeBorder: "border-teal-300/30",
          badgeBg: "bg-teal-900/40",
          badgeText: "text-teal-100",
          pillBg: "bg-teal-50",
          pillText: "text-teal-800",
        },
        competencies: [
          "Biomecánica articular, eje lumbopélvico y alineación C1-L5",
          "Calibración de barra de pies y resortes según antropometría",
          "Dominio técnico de los 35 ejercicios esenciales de Reformer",
        ],
      },
      {
        weekendNumber: 2,
        dates: "14 y 15 de Noviembre 2026",
        startDate: "2026-11-14",
        endDate: "2026-11-15",
        title: "Módulo II: Repertorio Intermedio, Dinámica de Carro & Cargas",
        description: "Transiciones fluidas, trabajo en planos sagital y coronal, manejo de resistencia de resortes (muelles) según biotipo corporal y progresiones del repertorio intermedio. Concluye el Curso Básico (28h totales).",
        hours: 14,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/4bd1938d-5e92-48d1-b506-e60d17410e01/image.webp",
        localImage: "/images/courses/module-2-intermediate.webp",
        bracketTag: "[ 14 HORAS · CIERRE BÁSICO 28H ]",
        colorTheme: {
          bg: "#B8583B",
          headerGradient: "from-[#C8542A] via-[#B8583B] to-transparent",
          accent: "text-orange-200",
          badgeBorder: "border-orange-300/30",
          badgeBg: "bg-orange-950/40",
          badgeText: "text-orange-100",
          pillBg: "bg-orange-50",
          pillText: "text-orange-800",
        },
        competencies: [
          "Dinámica de inercia y control del retroceso del carro móvil",
          "Física de resortes (F = -k·x) y regulación de resistencia de 24.5 kg",
          "Repertorio intermedio (Short Box, Teaser, Long Stretch, Stomach Massage)",
        ],
      },
      {
        weekendNumber: 3,
        dates: "21 y 22 de Noviembre 2026",
        startDate: "2026-11-21",
        endDate: "2026-11-22",
        title: "Módulo III: Modificaciones Clínicas, Poblaciones Especiales & Columna",
        description: "Adaptaciones precisas para alumnos con dolor lumbar, hernias discales, escoliosis, hipermovilidad, embarazo y adultos mayores en Reformer. Requisito de la Certificación Completa (48h).",
        hours: 10,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/714793a2-98af-4899-849a-da91d54bdb8f/image.webp",
        localImage: "/images/courses/module-3-clinical.webp",
        bracketTag: "[ 10 HORAS · EXCLUSIVO COMPLETA 48H ]",
        colorTheme: {
          bg: "#72927C",
          headerGradient: "from-[#7A9A84] via-[#72927C] to-transparent",
          accent: "text-emerald-200",
          badgeBorder: "border-emerald-900/20",
          badgeBg: "bg-emerald-950/20",
          badgeText: "text-neutral-900",
          pillBg: "bg-emerald-50",
          pillText: "text-emerald-800",
        },
        competencies: [
          "Descompresión espinal asistida por resortes en dolor lumbar L4-L5",
          "Protocolos clínicos seguros en hernias discales, escoliosis y cifosis",
          "Adaptaciones seguras para embarazo (2° y 3° trimestre) y adultos mayores",
        ],
      },
      {
        weekendNumber: 4,
        dates: "28 y 29 de Noviembre 2026",
        startDate: "2026-11-28",
        endDate: "2026-11-29",
        title: "Módulo IV: Metodología de Cueing, Práctica Supervisada & Certificación",
        description: "Comandos verbales, ajustes táctiles no invasivos, planificación de clases privadas y grupales, examen teórico-práctico y entrega de constancias oficiales. Concluye la Certificación Completa (48h totales).",
        hours: 10,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/4fad1010-ea6d-4b64-962f-3210313b2b6f/image.webp",
        localImage: "/images/courses/module-4-pedagogy.webp",
        bracketTag: "[ 10 HORAS · AVAL PROFESIONAL 48H ]",
        colorTheme: {
          bg: "#18232C",
          headerGradient: "from-[#23333F] via-[#18232C] to-transparent",
          accent: "text-blue-200",
          badgeBorder: "border-blue-300/30",
          badgeBg: "bg-blue-950/50",
          badgeText: "text-blue-100",
          pillBg: "bg-neutral-100",
          pillText: "text-neutral-800",
        },
        competencies: [
          "Metodología de cueing verbal (400ms) y ajuste táctil propioceptivo",
          "Simulación docente en vivo y diseño de secuencias individuales/grupales",
          "Examen práctico ante Master Trainers y entrega de Aval Oficial Certificado",
        ],
      },
    ],
    benefits: [
      "Modalidad flexible: Curso Básico (28 horas por $25,000 MXN) o Certificación Completa (48 horas por $38,000 MXN)",
      "Un Reformer profesional de Parota asignado individualmente por alumna(o) (sin turnos compartidos)",
      "Manual impreso a color con repertorio completo y desglose anatómico biomecánico",
      "Acceso de por vida al campus virtual en Whop con videoteca HD de cada movimiento",
      "Bolsa de trabajo y vinculación prioritaria con estudios de Pilates en Querétaro y Bajío",
      "Pre-reserva oficial con $400 MXN para congelar 1 de los 12 cupos presenciales",
    ],
  },

  monterrey: {
    id: "monterrey-dec-jan-2026-2027",
    cityKey: "monterrey",
    cityName: "Monterrey",
    stateName: "Nuevo León",
    periodLabel: "Diciembre 2026 – Enero 2027",
    fullDatesLabel: "5 de Diciembre 2026 al 17 de Enero 2027 (2 Fines Dic Básico / 4 Fines Dic-Ene Completo)",
    totalHours: 48,
    contactHours: 48,
    scheduleHours: "Sábados y Domingos de 9:00 AM a 4:30 PM",
    basicPrice: 25000,
    basicHours: 28,
    fullPrice: 38000,
    fullHours: 48,
    regularPrice: 38000,
    discountedPrice: 25000,
    depositPrice: 400,
    capacityPerCity: 12,
    location: {
      name: "CAMA Studio Monterrey",
      neighborhood: "San Pedro Garza García / Valle Oriente",
      city: "San Pedro Garza García",
      state: "Nuevo León",
    },
    weekends: [
      {
        weekendNumber: 1,
        dates: "5 y 6 de Diciembre 2026",
        startDate: "2026-12-05",
        endDate: "2026-12-06",
        title: "Módulo I: Principios de Contrología, Biomecánica & Repertorio Esencial",
        description: "Fundamentos de cinemática articular, análisis postural estático/dinámico y repertorio fundamental en Reformer con atención a la estabilidad lumbopélvica. Parte del Curso Básico (28h).",
        hours: 14,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/28c65fb2-8459-443d-ade5-67790beaf2bd/image.webp",
        localImage: "/images/courses/module-1-biomechanics.webp",
        bracketTag: "[ 14 HORAS · BÁSICO & COMPLETO ]",
        colorTheme: {
          bg: "#14323D",
          headerGradient: "from-[#183D4A] via-[#14323D] to-transparent",
          accent: "text-teal-200",
          badgeBorder: "border-teal-300/30",
          badgeBg: "bg-teal-900/40",
          badgeText: "text-teal-100",
          pillBg: "bg-teal-50",
          pillText: "text-teal-800",
        },
        competencies: [
          "Cinemática articular, análisis postural estático y dinámico",
          "Estabilidad lumbopélvica y regulación del centro de gravedad",
          "Repertorio fundamental: Footwork, Spine Articulation y Cargas iniciales",
        ],
      },
      {
        weekendNumber: 2,
        dates: "12 y 13 de Diciembre 2026",
        startDate: "2026-12-12",
        endDate: "2026-12-13",
        title: "Módulo II: Repertorio Intermedio, Coreografía & Regulación de Fuerza",
        description: "Repertorio de coordinación y resistencia muscular. Estrategias para regular tensión de resortes y diseñar secuencias de alto impacto articular bajo. Concluye el Curso Básico (28h totales).",
        hours: 14,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/4bd1938d-5e92-48d1-b506-e60d17410e01/image.webp",
        localImage: "/images/courses/module-2-intermediate.webp",
        bracketTag: "[ 14 HORAS · CIERRE BÁSICO 28H ]",
        colorTheme: {
          bg: "#B8583B",
          headerGradient: "from-[#C8542A] via-[#B8583B] to-transparent",
          accent: "text-orange-200",
          badgeBorder: "border-orange-300/30",
          badgeBg: "bg-orange-950/40",
          badgeText: "text-orange-100",
          pillBg: "bg-orange-50",
          pillText: "text-orange-800",
        },
        competencies: [
          "Coordinación neuromuscular en cadena cinética abierta y cerrada",
          "Coreografía de transiciones seguras y cadencia de clase boutique",
          "Modulaciones de tempo y equilibrio dinámico sobre el carro móvil",
        ],
      },
      {
        weekendNumber: 3,
        dates: "9 y 10 de Enero 2027",
        startDate: "2027-01-09",
        endDate: "2027-01-10",
        title: "Módulo III: Modificaciones Clínicas, Prevención de Lesiones & Casos Reales",
        description: "Reanudación tras la pausa decembrina. Abordaje de patologías de rodilla, hombro y columna vertebral. Modificaciones seguras para el cliente boutique contemporáneo. Requisito de la Certificación Completa (48h).",
        hours: 10,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/714793a2-98af-4899-849a-da91d54bdb8f/image.webp",
        localImage: "/images/courses/module-3-clinical.webp",
        bracketTag: "[ 10 HORAS · EXCLUSIVO COMPLETA 48H ]",
        colorTheme: {
          bg: "#72927C",
          headerGradient: "from-[#7A9A84] via-[#72927C] to-transparent",
          accent: "text-emerald-200",
          badgeBorder: "border-emerald-900/20",
          badgeBg: "bg-emerald-950/20",
          badgeText: "text-neutral-900",
          pillBg: "bg-emerald-50",
          pillText: "text-emerald-800",
        },
        competencies: [
          "Abordaje clínico de lesiones en hombro, rodilla y columna vertebral",
          "Diseño de modificaciones seguras para poblaciones de alto riesgo",
          "Análisis de casos clínicos reales con supervisión de Master Trainers",
        ],
      },
      {
        weekendNumber: 4,
        dates: "16 y 17 de Enero 2027",
        startDate: "2027-01-16",
        endDate: "2027-01-17",
        title: "Módulo IV: Pedagogía de Clase, Enseñanza en Vivo & Certificación Final",
        description: "Simulación de clases grupales y privadas en vivo, evaluación práctica individual por los Master Trainers, retroalimentación clínica y graduación. Concluye la Certificación Completa (48h totales).",
        hours: 10,
        image: "https://assets-2-prod.whop.com/public/uploads/2026-09-11/4fad1010-ea6d-4b64-962f-3210313b2b6f/image.webp",
        localImage: "/images/courses/module-4-pedagogy.webp",
        bracketTag: "[ 10 HORAS · AVAL PROFESIONAL 48H ]",
        colorTheme: {
          bg: "#18232C",
          headerGradient: "from-[#23333F] via-[#18232C] to-transparent",
          accent: "text-blue-200",
          badgeBorder: "border-blue-300/30",
          badgeBg: "bg-blue-950/50",
          badgeText: "text-blue-100",
          pillBg: "bg-neutral-100",
          pillText: "text-neutral-800",
        },
        competencies: [
          "Simulación de enseñanza real con retroalimentación docente en directo",
          "Evaluación práctica individual por Gabi y Laura Munive",
          "Graduación oficial, constancia curricular y red de estudios CAMA",
        ],
      },
    ],
    benefits: [
      "Modalidad flexible: Curso Básico (28 horas por $25,000 MXN) o Certificación Completa (48 horas por $38,000 MXN)",
      "Formato amigable de fines de semana (2 en diciembre para Curso Básico, 2 en enero para completar Certificación)",
      "Máximo 12 personas por cohorte con Reformer exclusivo en San Pedro Garza García / Valle Oriente",
      "Manual clínico y metodológico oficial CAMA Pilates",
      "Acceso de por vida a la comunidad y campus virtual en Whop",
      "Pre-reserva oficial con $400 MXN para congelar 1 de los 12 cupos presenciales",
    ],
  },
};

/**
 * Helper to generate Google Calendar Event URL
 */
export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent("Masterclass Gratuita Online: Certificación Pilates Reformer (Google Meet)");
  const details = encodeURIComponent(
    "Masterclass 100% GRATUITA en vivo con Gabi y Laura Munive vía Google Meet.\\n\\n" +
    "Conoce cómo certificarte en Pilates Reformer (100h) y cómo asegurar tu lugar en la lista de espera con 50% de descuento para las cohortes presenciales en Querétaro (Nov 2026) y Monterrey (Dic 2026 - Ene 2027).\\n\\n" +
    "Enlace de Google Meet: Se enviará por WhatsApp y correo antes de iniciar.\\n" +
    "Contacto WhatsApp: https://wa.me/525548468190"
  );
  const location = encodeURIComponent("Transmisión Online en Vivo vía Google Meet");
  const dates = "20260926T170000Z/20260926T181500Z"; // 11:00 AM CST is 17:00 UTC

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Helper to generate .ics file content for Apple Calendar / Outlook
 */
export function generateIcsContent(): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CAMA Pilates//Certificacion Masterclass//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "SUMMARY:Masterclass Gratuita: Certificación Pilates Reformer (Google Meet)",
    "DESCRIPTION:Webinar 100% gratuito en vivo con Gabi y Laura Munive vía Google Meet. Presentación de las cohortes presenciales de Querétaro y Monterrey y apertura de 12 cupos con 50% de descuento.",
    "DTSTART:20260926T170000Z",
    "DTEND:20260926T181500Z",
    "LOCATION:Online vía Google Meet",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
