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
    fullDatesLabel: "7 al 29 de Noviembre de 2026 (4 Fines de Semana)",
    totalHours: 100,
    contactHours: 56,
    scheduleHours: "Sábados y Domingos de 9:00 AM a 4:30 PM",
    regularPrice: 39800,
    discountedPrice: 19900,
    depositPrice: 4500,
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
        description: "Biomecánica de la pelvis, caja torácica y columna. Principios de respiración, centrado y ejecución técnica de los 35 ejercicios esenciales (Footwork, Bridging, Feet in Straps, Abdominal Series).",
        hours: 14,
      },
      {
        weekendNumber: 2,
        dates: "14 y 15 de Noviembre 2026",
        startDate: "2026-11-14",
        endDate: "2026-11-15",
        title: "Módulo II: Repertorio Intermedio, Dinámica de Carro & Cargas",
        description: "Transiciones fluidas, trabajo en planos sagital y coronal, manejo de resistencia de resortes (muelles) según biotipo corporal y progresiones del repertorio intermedio.",
        hours: 14,
      },
      {
        weekendNumber: 3,
        dates: "21 y 22 de Noviembre 2026",
        startDate: "2026-11-21",
        endDate: "2026-11-22",
        title: "Módulo III: Modificaciones Clínicas, Poblaciones Especiales & Columna",
        description: "Adaptaciones precisas para alumnos con dolor lumbar, hernias discales, escoliosis, hipermovilidad, embarazo y adultos mayores en Reformer.",
        hours: 14,
      },
      {
        weekendNumber: 4,
        dates: "28 y 29 de Noviembre 2026",
        startDate: "2026-11-28",
        endDate: "2026-11-29",
        title: "Módulo IV: Metodología de Cueing, Práctica Supervisada & Certificación",
        description: "Comandos verbales, ajustes táctiles no invasivos, planificación de clases privadas y grupales, examen teórico-práctico y entrega de constancias oficiales.",
        hours: 14,
      },
    ],
    benefits: [
      "100 horas totales certificadas (56 presenciales intensivas + 44 de práctica y observación guiada)",
      "Un Reformer profesional asignado individualmente por alumna(o) (sin turnos compartidos)",
      "Manual impreso a color con repertorio completo y desglose anatómico",
      "Acceso a biblioteca digital privada con videos HD de cada movimiento",
      "Bolsa de trabajo y vinculación prioritaria con estudios en Querétaro y Bajío",
      "50% de descuento en matrícula para pre-registrados en la Masterclass ($19,900 MXN en vez de $39,800 MXN)",
    ],
  },

  monterrey: {
    id: "monterrey-dec-jan-2026-2027",
    cityKey: "monterrey",
    cityName: "Monterrey",
    stateName: "Nuevo León",
    periodLabel: "Diciembre 2026 – Enero 2027",
    fullDatesLabel: "5 de Diciembre 2026 al 17 de Enero 2027 (4 Fines de Semana)",
    totalHours: 100,
    contactHours: 56,
    scheduleHours: "Sábados y Domingos de 9:00 AM a 4:30 PM",
    regularPrice: 39800,
    discountedPrice: 19900,
    depositPrice: 4500,
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
        description: "Fundamentos de cinemática articular, análisis postural estático/dinámico y repertorio fundamental en Reformer con atención a la estabilidad lumbopélvica.",
        hours: 14,
      },
      {
        weekendNumber: 2,
        dates: "12 y 13 de Diciembre 2026",
        startDate: "2026-12-12",
        endDate: "2026-12-13",
        title: "Módulo II: Repertorio Intermedio, Coreografía & Regulación de Fuerza",
        description: "Repertorio de coordinación y resistencia muscular. Estrategias para regular tensión de resortes y diseñar secuencias de alto impacto articular bajo.",
        hours: 14,
      },
      {
        weekendNumber: 3,
        dates: "9 y 10 de Enero 2027",
        startDate: "2027-01-09",
        endDate: "2027-01-10",
        title: "Módulo III: Modificaciones Clínicas, Prevención de Lesiones & Casos Reales",
        description: "Reanudación tras la pausa decembrina. Abordaje de patologías de rodilla, hombro y columna vertebral. Modificaciones seguras para el cliente boutique contemporáneo.",
        hours: 14,
      },
      {
        weekendNumber: 4,
        dates: "16 y 17 de Enero 2027",
        startDate: "2027-01-16",
        endDate: "2027-01-17",
        title: "Módulo IV: Pedagogía de Clase, Enseñanza en Vivo & Certificación Final",
        description: "Simulación de clases grupales y privadas en vivo, evaluación práctica individual por los Master Trainers, retroalimentación clínica y graduación.",
        hours: 14,
      },
    ],
    benefits: [
      "100 horas totales avaladas con validez curricular en México e internacional",
      "Formato híbrido-amigable de 4 fines de semana (2 en diciembre antes de vacaciones, 2 en enero)",
      "Máximo 12 personas por cohorte en San Pedro Garza García / Valle Oriente",
      "Manual clínico y metodológico oficial CAMA Pilates",
      "Acceso de por vida a la comunidad exclusiva de instructores certificados",
      "Ahorro directo de $19,900 MXN (50% de descuento) reservando tu lugar en el webinar",
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
