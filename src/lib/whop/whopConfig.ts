/**
 * Whop Integration Configuration for CAMA Pilates
 * Deep integration with Whop payments, course LMS, community chat, and forums.
 */

export const WHOP_CONFIG = {
  companyId: 'biz_3eUPkeAdggRnrP',
  productId: 'prod_Iv5ZnKkugonCn',
  productRoute: 'mexico-reformer-community',
  communityUrl: 'https://whop.com/mexico-reformer-community',
  companyRouteUrl: 'https://whop.com/legalintakesoftware',
  customerPortalUrl: 'https://whop.com/@me/settings/memberships',

  experiences: {
    courses: {
      id: 'exp_q4ce6BU5Av2iKZ',
      name: 'Curso de Pilates Reformer',
      appName: 'Courses',
      url: 'https://whop.com/joined/exp_q4ce6BU5Av2iKZ',
      directUrl: 'https://whop.com/exp_q4ce6BU5Av2iKZ/',
      description: 'Campus y temario de 100 horas de formación presencial y teórica',
    },
    chat: {
      id: 'exp_YDogCARDIL9mxE',
      name: 'Comunidad Reformer México',
      appName: 'Chat',
      url: 'https://whop.com/joined/exp_YDogCARDIL9mxE',
      directUrl: 'https://whop.com/exp_YDogCARDIL9mxE/',
      description: 'Canales en vivo de comunicación entre alumnas, instructoras y formadoras',
    },
    forums: {
      id: 'exp_CY1aVHXdSlxCCb',
      name: 'Foro Oficial & Preguntas Masterclass',
      appName: 'Forums',
      url: 'https://whop.com/joined/exp_CY1aVHXdSlxCCb',
      directUrl: 'https://whop.com/exp_CY1aVHXdSlxCCb/',
      description: 'Hilos temáticos de biomecánica, casos clínicos y preguntas para Gabi & Laura Munive',
    },
    portal: {
      id: 'customer_portal',
      name: 'Portal de Alumna & Membresía Whop',
      appName: 'Portal',
      url: 'https://whop.com/@me/settings/memberships',
      directUrl: 'https://whop.com/@me/settings/memberships',
      description: 'Gestión de membresías activas, recibos de compra y datos de facturación',
    },
  },

  plans: {
    apartado: {
      id: 'plan_tUBQoR2eJxv5v',
      price: 4500,
      currency: 'MXN',
      name: 'Apartado Oficial de Cupo',
      badge: 'Asegura Cupo (1 de 12)',
      tagline: 'Congela tu lugar para el Curso Básico (28h) o la Certificación Completa (48h) en Querétaro o Monterrey.',
      directLink: 'https://whop.com/checkout/plan_tUBQoR2eJxv5v',
      unlimitedStock: true,
    },
    cursoBasico: {
      id: 'plan_tUBQoR2eJxv5v',
      price: 25000,
      hours: 28,
      currency: 'MXN',
      name: 'Curso Básico Reformer (28 Horas)',
      badge: '28 Horas · Nivel Básico Esencial',
      tagline: '2 fines de semana presenciales (28 horas), anatomía funcional, repertorio esencial e intermedio, máquina individual y campus virtual.',
      directLink: 'https://whop.com/checkout/plan_tUBQoR2eJxv5v',
      unlimitedStock: true,
    },
    colegiaturaCompleta: {
      id: 'plan_hqgjSBEjElw3C',
      price: 38000,
      hours: 48,
      currency: 'MXN',
      name: 'Certificación Completa Reformer (48 Horas)',
      badge: '48 Horas · Nivel Profesional Completo',
      tagline: '4 fines de semana presenciales (48 horas), repertorio clínico completo, patologías de columna, metodología de cueing, examen práctico y aval.',
      directLink: 'https://whop.com/checkout/plan_hqgjSBEjElw3C',
      unlimitedStock: true,
    },
    cursoOnline: {
      id: 'plan_QGF4bCYeJj2Nr',
      price: 1999,
      regularPrice: 3999,
      discountPercent: 50,
      currency: 'MXN',
      name: 'Curso Online 10 Módulos + Certificado Digital',
      badge: '100% Digital en Whop',
      tagline: 'Acceso completo e ilimitado a los 10 módulos con Laura Munive en el campus virtual Whop y certificado.',
      directLink: 'https://whop.com/checkout/plan_QGF4bCYeJj2Nr',
      unlimitedStock: true,
    },
    paseVipWebinar: {
      id: 'plan_ojBC2a7IkCXNT',
      price: 0,
      currency: 'MXN',
      name: 'Pase VIP Gratuito Masterclass + Acceso a Comunidad Whop',
      badge: '100% Gratuito',
      tagline: 'Entrada al webinar del 26 de Septiembre y acceso inmediato a los canales de la comunidad.',
      directLink: 'https://whop.com/checkout/plan_ojBC2a7IkCXNT',
      unlimitedStock: true,
    },
  },

  offerStack: {
    totalValue: 78200,
    basicPrice: 25000,
    basicHours: 28,
    fullPrice: 38000,
    fullHours: 48,
    depositPrice: 4500,
    currency: 'MXN',
    bonuses: [
      {
        title: 'Certificación Presencial en Reformer (28h Básica / 48h Completa)',
        value: 38000,
        description: 'Formación presencial intensiva con un Reformer individual exclusivo por alumna en Juriquilla (Querétaro) o San Pedro (Monterrey).',
        isCore: true,
      },
      {
        title: 'Bono #1: Campus Virtual & Comunidad Whop de Por Vida',
        value: 12000,
        description: 'Acceso ilimitado y vitalicio al campus en Whop, biblioteca de actualizaciones, bolsa de trabajo y red de instructoras en México.',
      },
      {
        title: 'Bono #2: Atlas Clínico de Biomecánica & Patologías de Columna',
        value: 7500,
        description: 'Protocolos paso a paso de ajustes y resortes para hernias de disco, ciática, escoliosis, dolor lumbar y modificaciones para embarazo.',
      },
      {
        title: 'Bono #3: Masterclass de Negocio & Apertura de Estudio',
        value: 9900,
        description: 'Sesión exclusiva con Gabi & Laura Munive sobre cómo llenar tus primeros 20 clientes privados y estructurar precios rentables.',
      },
      {
        title: 'Bono #4: Cupón de Fábrica CAMA Pilates Reformer',
        value: 5000,
        description: 'Descuento directo de $5,000 MXN en la compra de tu primera cama Reformer profesional de madera o aluminio para tu casa o estudio.',
      },
      {
        title: 'Bono #5: Fast-Action Webinar Bonus (Primeras 6 Alumnas por Ciudad)',
        value: 4000,
        description: 'Sesión privada 1-a-1 de 45 minutos con Gabi o Laura Munive para diagnóstico biomecánico, corrección postural y plan de carrera.',
      },
    ],
    guarantee: {
      title: 'Garantía Incondicional "Riesgo Cero" (Fladlien Protocol)',
      description: 'Asiste al primer fin de semana completo presencial (14 horas). Si al terminar el domingo sientes que la formación no supera con creces lo prometido, te devolvemos el 100% de tu dinero en 24 horas sin preguntas.',
    },
  },
};
