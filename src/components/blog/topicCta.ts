// The call to action inside a blog post, matched to who reads that kind of article: studio owners
// get the studio packs, instructors the certification courses, everyone else a Reformer.
// The WhatsApp message names the article, so the team knows which post started the chat.
export type BlogCta = {
  title: string;
  description: string;
  whatsappMessage: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const STUDIO_CATEGORIES = new Set(['Estudio', 'Hacer Crecer tu Negocio de Pilates']);
const INSTRUCTOR_CATEGORIES = new Set(['Tips para Instructores de Pilates']);

export function blogCta(category: string | undefined, articleTitle: string): BlogCta {
  if (category && STUDIO_CATEGORIES.has(category)) {
    return {
      title: '¿Vas a abrir o equipar tu estudio?',
      description: 'Packs de 4 a 10 Reformers con precio por volumen, entrega e instalación en todo México.',
      whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quiero cotizar Reformers para mi estudio.`,
      secondaryHref: '/packs/estudio',
      secondaryLabel: 'Ver Packs para Estudio',
    };
  }
  if (category && INSTRUCTOR_CATEGORIES.has(category)) {
    return {
      title: '¿Quieres certificarte como instructora de Reformer?',
      description: 'Cursos presenciales en Querétaro y Monterrey: Básico (28h) o Certificación Completa (48h), con un Reformer individual por alumna.',
      whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quiero información de la certificación en Pilates Reformer.`,
      secondaryHref: '/certificacion-pilates',
      secondaryLabel: 'Ver Cursos y Fechas',
    };
  }
  return {
    title: '¿Listo para tu Cama de Pilates?',
    description: 'Asesoría personalizada para elegir tu Reformer para casa, estudio o gimnasio, con envío a todo México y soporte en español.',
    whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quisiera asesoría para elegir mi cama de Pilates.`,
    secondaryHref: '/shop/category/reformers',
    secondaryLabel: 'Ver Catálogo de Camas',
  };
}
