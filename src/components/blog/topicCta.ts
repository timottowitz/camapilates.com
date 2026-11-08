// The call to action inside a blog post. Every version sells Reformers, matched to who reads that
// kind of article: studio owners get the studio pack, instructors the step to their own studio,
// everyone else a Reformer for home or studio.
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

export const STUDIO_CTA_TITLE = 'La renta del local es la misma con 4 Reformers que con 8';
export const STUDIO_CTA_DESCRIPTION =
  'Lo que cambia es cuántas alumnas caben en cada clase. Si estás armando o creciendo tu estudio, te ayudamos a ver cuántas camas caben en tu espacio; a partir de 8, el pack lleva 20% de descuento.';

export function blogCta(category: string | undefined, articleTitle: string): BlogCta {
  if (category && STUDIO_CATEGORIES.has(category)) {
    return {
      title: STUDIO_CTA_TITLE,
      description: STUDIO_CTA_DESCRIPTION,
      whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quiero cotizar Reformers para mi estudio.`,
      secondaryHref: '/packs/estudio',
      secondaryLabel: 'Calcular mi pack',
    };
  }
  if (category && INSTRUCTOR_CATEGORIES.has(category)) {
    return {
      title: 'Hoy llenas clases en el estudio de alguien más',
      description:
        'Esas mismas alumnas podrían reservar en el tuyo. Cuando quieras dar el paso, te ayudamos a calcular con cuántos Reformers empezar según tu espacio y tu presupuesto.',
      whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quiero saber con cuántos Reformers puedo abrir mi estudio.`,
      secondaryHref: '/packs/estudio',
      secondaryLabel: 'Ver packs para estudio',
    };
  }
  return {
    title: 'Tu clase de Pilates, sin horario y sin reservar lugar',
    description:
      'Con un Reformer en casa practicas cuando tú quieres, y lo que pagas en clases sueltas se queda en algo tuyo. Te ayudamos a elegir el que cabe en tu cuarto y en tu presupuesto.',
    whatsappMessage: `Hola, leí «${articleTitle}» en camadepilates.com y quisiera asesoría para elegir mi Reformer.`,
    secondaryHref: '/shop/category/reformers',
    secondaryLabel: 'Ver Reformers',
  };
}
