import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { MapPin, Calendar, Award } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';
import StottPremiumProgram from '@/components/certification/StottPremiumProgram';
import {
  STOTT_COURSES,
  STOTT_PROVIDER,
  STOTT_STATUS_LABEL,
  STOTT_VENUE,
  formatMXN,
} from '@/content/certification/stottCdmx';

const CITIES = [
  { key: 'cdmx', name: 'Ciudad de México (CDMX)', kw: ['certificación pilates cdmx', 'certificación pilates reformer cdmx', 'certificación pilates mexico df'] },
  { key: 'guadalajara', name: 'Guadalajara (Jalisco)', kw: ['certificación de pilates en guadalajara jalisco', 'certificación pilates guadalajara'] },
  { key: 'monterrey', name: 'Monterrey (NL)', kw: ['certificación de pilates en monterrey', 'certificación pilates monterrey'] },
  { key: 'puebla', name: 'Puebla', kw: ['certificación pilates puebla'] },
  { key: 'queretaro', name: 'Querétaro', kw: ['certificación pilates querétaro'] },
];

const PRIMARY_WHATSAPP_BASE = 'https://wa.me/523222787690?text=';
const PRIMARY_WHATSAPP = `${PRIMARY_WHATSAPP_BASE}${encodeURIComponent('Hola, quiero inscribirme a la certificación STOTT PILATES® en CDMX')}`;

const FEATURED = STOTT_COURSES.find(c => c.featured) || STOTT_COURSES[0];

const CertificacionPilates: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const origin = getOrigin();
  const title = 'Certificación STOTT PILATES® en CDMX — Reformer y Mat | México';
  const desc = 'Certifícate en STOTT PILATES® en Ciudad de México: Intensive Reformer (125h), Mat-Plus™ y niveles avanzados. Sede oficial Merrithew® en Santa Fe. Fechas, costos y registro.';

  const courseSchemas = STOTT_COURSES.map(course => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.tagline,
    provider: {
      '@type': 'Organization',
      name: STOTT_PROVIDER.name,
      url: 'https://www.pilateseducare.com',
    },
    ...(course.price
      ? {
          offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: 'MXN',
            availability: course.dates.some(d => d.status === 'open' || d.status === 'lastSpots')
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
          },
        }
      : {}),
    hasCourseInstance: course.dates.map(d => ({
      '@type': 'CourseInstance',
      courseMode: course.modality === 'Presencial' ? 'Onsite' : 'Online',
      name: `${course.shortName} — ${d.label}`,
      location: {
        '@type': 'Place',
        name: STOTT_VENUE.name,
        address: STOTT_VENUE.address,
      },
    })),
  }));

  const cityListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: CITIES.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Certificación de Pilates en ${c.name}`,
      url: `${origin}/certificacion-pilates#${c.key}`
    }))
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es STOTT PILATES® y por qué es el "Gold Standard"?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'STOTT PILATES® es una formación contemporánea que une el método original de Joseph Pilates con la ciencia del ejercicio, la biomecánica y la rehabilitación. Está respaldada por Merrithew® y reconocida en más de 100 países.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto dura la certificación Intensive Reformer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El Intensive Reformer suma 125 horas: 50 horas de instrucción presencial, 10 de observación, 40 de práctica personal y 25 de práctica de enseñanza. Cubre 139 ejercicios del repertorio esencial e intermedio.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuál es el costo de la certificación en CDMX?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Intensive Reformer: $44,000 MXN (apartado $8,000). Intensive Mat-Plus™ + Advanced Mat: $36,800 MXN con manuales oficiales incluidos. Advanced Reformer: $20,000 MXN. Grupos limitados a 12 personas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿La certificación tiene validez internacional?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Al aprobar el Examen de Certificación Internacional (proceso independiente con costo adicional), obtienes la certificación STOTT PILATES® con validez en más de 100 países y créditos de educación continua (CECs) de Merrithew®.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Dónde se imparte el programa en Ciudad de México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `En ${STOTT_VENUE.name}, hosting oficial de Merrithew®, ubicado en ${STOTT_VENUE.address}, con equipo Merrithew® de última generación.`
        }
      }
    ]
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        {courseSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
        <script type="application/ld+json">{JSON.stringify(cityListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8">
              Education · STOTT PILATES®
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              The Gold <br />
              <span className="not-italic font-light font-sans tracking-tight">Standard<span className="text-[#EB4C42]">.</span></span>
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              Certificación STOTT PILATES® en Ciudad de México, impartida por {STOTT_PROVIDER.name} en{' '}
              {STOTT_VENUE.name}, hosting oficial de Merrithew® en Santa Fe. Reformer y Mat con validez
              internacional en más de 100 países.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={PRIMARY_WHATSAPP} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                Inscribirme
              </a>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
              >
                Pre-registro
              </button>
            </div>

            <ul className="mt-12 grid sm:grid-cols-2 gap-4">
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Respaldo Merrithew®
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Intensive Reformer 125h
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Grupos de 12 personas
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Validez en 100+ países
              </li>
            </ul>
          </div>

          <div className="bg-white/50 border-2 border-[#3E2723]/30 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <span className="inline-block mb-6 px-3 py-1 bg-[#3E2723] text-[#EAE8E4] rounded-full text-[10px] uppercase tracking-[0.2em]">
              Programa Premium · CDMX
            </span>
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-2">{FEATURED.name}</h2>
            <p className="text-sm text-[#5D5550] font-light mb-6">{FEATURED.level} · {FEATURED.modality}</p>

            <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#2A2624]/10">
              <div>
                <div className="text-3xl font-serif italic text-[#3E2723]">{FEATURED.price ? formatMXN(FEATURED.price) : ''}</div>
                {FEATURED.deposit && (
                  <div className="text-xs text-[#5D5550] font-light mt-1">Apartado: {formatMXN(FEATURED.deposit)}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-serif italic text-[#2A2624]">{FEATURED.hours.total}h</div>
                <div className="text-xs uppercase tracking-widest text-[#5D5550]">{FEATURED.exercises} ejercicios</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {FEATURED.dates.map(d => (
                <div key={d.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                    <Calendar className="w-3.5 h-3.5 text-[#3E2723]" /> {d.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#3E2723]">
                    {STOTT_STATUS_LABEL[d.status]}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                <MapPin className="w-3.5 h-3.5 text-[#3E2723]" /> {STOTT_VENUE.name}, {STOTT_VENUE.area}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                <Award className="w-3.5 h-3.5 text-[#3E2723]" /> {FEATURED.cecs.toFixed(1)} CECs Merrithew®
              </div>
            </div>

            <a
              href="#programa-stott"
              className="block w-full text-center px-6 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
            >
              Ver Programa Completo
            </a>
          </div>
        </div>
      </section>

      {/* Premium STOTT PILATES program — course catalog, venue & certification path */}
      <StottPremiumProgram
        onPreRegister={() => setModalOpen(true)}
        whatsappBase={PRIMARY_WHATSAPP_BASE}
      />

      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4 text-center">Otras Sedes en México</h2>
          <p className="text-center text-[#5D5550] font-light mb-12 max-w-2xl mx-auto">
            ¿No estás en CDMX? También te conectamos con certificaciones de Pilates (Reformer y Mat) en otras ciudades.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {CITIES.map((c) => (
              <div key={c.key} id={c.key} className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white transition-colors duration-500">
                <h3 className="text-2xl font-serif italic text-[#2A2624] mb-4">
                  {c.name}
                </h3>
                <p className="text-sm text-[#5D5550] font-light mb-8 leading-relaxed">
                  {c.key === 'cdmx'
                    ? 'Sede del programa premium STOTT PILATES® en Santa Fe. Intensivos de Reformer y Mat con respaldo Merrithew®.'
                    : 'Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.'}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={`${PRIMARY_WHATSAPP_BASE}${encodeURIComponent(`Hola, quiero inscribirme a la certificación de Pilates en ${c.name}`)}`} className="px-6 py-3 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors">
                    Inscribirme
                  </a>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-widest hover:bg-[#EAE8E4] transition-colors"
                  >
                    Pre-registro
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requisitos & Duración</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Profesionales del fitness/salud o practicantes con 30+ horas de experiencia en Pilates (Reformer para la ruta de Reformer).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Intensive Reformer: 125 horas (50h instrucción + 10h observación + 40h práctica personal + 25h enseñanza).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Intensive Mat-Plus™: 95 horas con Advanced Mat incluido en la ruta online en vivo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Carta de finalización al terminar el curso y Examen de Certificación Internacional independiente.</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Por Qué Elegir Este Programa</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Método reconocido como el "Gold Standard" de la industria, con respaldo de Merrithew®.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Sede oficial Merrithew® con equipo de última generación en Santa Fe, CDMX.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Grupos reducidos de máximo 12 personas con atención personalizada.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Créditos de educación continua (CECs) y validez internacional en más de 100 países.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif italic mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Puedo certificarme solo en Reformer?</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Sí. El Intensive Reformer es una certificación independiente de 125 horas. Solo necesitas
                experiencia previa mínima de 30 horas en Reformer o ser profesional del fitness/salud.
              </p>
            </div>
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Existen opciones online?</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Sí. El Intensive Mat-Plus™ se imparte online en vivo (por cámara) e incluye el módulo
                Advanced Mat. Las rutas de Reformer son 100% presenciales en Santa Fe, CDMX.
              </p>
            </div>
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Cómo funciona el pago?</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Apartas tu lugar con un depósito (no reembolsable) desde $5,000–$8,000 MXN según el curso,
                y liquidas antes del primer día de clases. Hay pago con tarjeta disponible en cursos individuales
                y descuentos por inscripción a rutas completas.
              </p>
            </div>
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿El examen internacional está incluido?</h3>
              <p className="text-white/60 font-light leading-relaxed">
                El examen de certificación internacional se agenda de forma independiente al finalizar tus horas
                de práctica y tiene un costo adicional. Al terminar el curso recibes tu carta de finalización
                (Completion Certificate) y CECs de Merrithew®.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell: Equipment for Future Studios */}
      <section className="py-20 px-8 md:px-24 bg-[#EAE8E4]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
                Para Futuros Instructores
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] leading-tight mb-6">
                Equipa Tu Futuro Estudio
              </h2>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-8">
                Al graduarte, tendrás acceso a precios especiales en equipamiento.
                Reformers profesionales, sistemas de luz terapéutica y todo lo que
                necesitas para abrir tu propio espacio.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/packs/estudio"
                  className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
                >
                  Ver Paquetes de Estudio
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                >
                  Explorar Equipamiento
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-sm border border-[#2A2624]/10">
                <div className="text-3xl font-serif italic text-[#3E2723] mb-2">15%</div>
                <p className="text-sm text-[#5D5550]">Descuento para graduados en reformers</p>
              </div>
              <div className="bg-white p-6 rounded-sm border border-[#2A2624]/10">
                <div className="text-3xl font-serif italic text-[#3E2723] mb-2">MSI</div>
                <p className="text-sm text-[#5D5550]">Financiamiento a 12 meses</p>
              </div>
              <div className="bg-white p-6 rounded-sm border border-[#2A2624]/10">
                <div className="text-3xl font-serif italic text-[#3E2723] mb-2">2+</div>
                <p className="text-sm text-[#5D5550]">Reformers con envío gratis</p>
              </div>
              <div className="bg-white p-6 rounded-sm border border-[#2A2624]/10">
                <div className="text-3xl font-serif italic text-[#3E2723] mb-2">1 Año</div>
                <p className="text-sm text-[#5D5550]">Garantía completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        source="/certificacion-pilates"
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilates;
