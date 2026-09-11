import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Calendar, MapPin, ArrowLeft, Award, Clock } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';
import StottPremiumProgram from '@/components/certification/StottPremiumProgram';
import CertificationWebinarBanner from '@/components/certification/CertificationWebinarBanner';
import {
  CERTIFICATION_COHORTS,
  WEBINAR_INFO,
} from '@/content/certification/cohortsData';
import {
  STOTT_COURSES,
  STOTT_PROVIDER,
  STOTT_VENUE,
  formatMXN,
} from '@/content/certification/stottCdmx';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';

type CityKey = 'cdmx' | 'guadalajara' | 'monterrey' | 'puebla' | 'queretaro';

const CITY_DATA: Record<CityKey, { name: string; shortName: string; directorySlug?: string }> = {
  cdmx: {
    name: 'Ciudad de México (CDMX)',
    shortName: 'Ciudad de México',
    directorySlug: 'ciudad-de-mexico',
  },
  guadalajara: {
    name: 'Guadalajara (Jalisco)',
    shortName: 'Guadalajara',
    directorySlug: 'guadalajara',
  },
  monterrey: {
    name: 'Monterrey (NL)',
    shortName: 'Monterrey',
    directorySlug: 'monterrey',
  },
  puebla: {
    name: 'Puebla',
    shortName: 'Puebla',
  },
  queretaro: {
    name: 'Querétaro',
    shortName: 'Querétaro',
  }
};

const PRIMARY_WHATSAPP = 'https://wa.me/525548468190?text=';

const FEATURED = STOTT_COURSES.find(c => c.featured) || STOTT_COURSES[0];

const CertificacionPilatesCity: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [whopCheckoutOpen, setWhopCheckoutOpen] = useState(false);
  const [whopPlan, setWhopPlan] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const { city } = useParams();
  const origin = getOrigin();
  const key = (city || 'cdmx').toLowerCase() as CityKey;
  const data = CITY_DATA[key] || CITY_DATA.cdmx;
  const isCdmx = key === 'cdmx' || !CITY_DATA[key];
  const cohort = (key === 'queretaro' || key === 'monterrey') ? CERTIFICATION_COHORTS[key] : null;

  const cityName = data.name;
  const shortCityName = data.shortName;
  const title = isCdmx
    ? `Certificación STOTT PILATES® en ${cityName} — Programa Premium`
    : cohort
      ? `Certificación Pilates Reformer en ${shortCityName} (${cohort.periodLabel}) — 50% OFF`
      : `Certificación de Pilates Reformer en ${shortCityName}`;
  const desc = isCdmx
    ? `Certifícate en STOTT PILATES® en ${cityName}: Intensive Reformer (125h), Mat-Plus™ y niveles avanzados en ${STOTT_VENUE.name}, sede oficial Merrithew® en Santa Fe. Fechas, costos y registro.`
    : cohort
      ? `Certifícate como instructora de Pilates Reformer en ${shortCityName} (${cohort.periodLabel}): 4 fines de semana presenciales (100h). Masterclass el 26 de septiembre con Gabi y Laura Munive. Lista de espera con 50% de descuento ($19,900 MXN).`
      : `Compara opciones de certificación de Pilates Reformer en ${shortCityName}. Revisa requisitos, duración, costos y criterios antes de solicitar fechas.`;

  const wa = `${PRIMARY_WHATSAPP}${encodeURIComponent(
    isCdmx
      ? 'Hola, quiero inscribirme a la certificación STOTT PILATES® en CDMX'
      : cohort
        ? `Hola, quiero información sobre la certificación de Pilates Reformer en ${shortCityName} (${cohort.periodLabel}) y asegurar mi cupo con 50% de descuento.`
        : `Hola Edelweiss, quiero información sobre certificación de Pilates en ${shortCityName}`
  )}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Certificación de Pilates', item: `${origin}/certificacion-pilates` },
      { '@type': 'ListItem', position: 2, name: cityName, item: `${origin}/certificacion-pilates/${key}` }
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Certificación de Pilates Reformer en ${shortCityName}`,
    areaServed: {
      '@type': 'City',
      name: cityName
    },
    provider: { '@type': 'Organization', name: 'Edelweiss / camadepilates.com', url: origin },
    serviceType: isCdmx
      ? 'Inscripción a certificación de Pilates'
      : 'Orientación sobre certificaciones de Pilates (Reformer y Mat)'
  };

  const faqItems = isCdmx
    ? []
    : cohort
      ? [
          {
            question: `¿Cuándo son las fechas exactas de la certificación en ${shortCityName}?`,
            answer: `La cohorte de ${shortCityName} se lleva a cabo en 4 fines de semana intensivos (${cohort.fullDatesLabel}) en horario de ${cohort.scheduleHours}.`,
          },
          {
            question: `¿Cómo obtengo el 50% de descuento en ${shortCityName}?`,
            answer: `El precio regular es de $39,800 MXN. Las primeras 12 personas registradas en la lista de espera que asistan a la Masterclass en vivo del Sábado 26 de Septiembre con Gabi y Laura Munive obtienen el precio con beca de $19,900 MXN. Puedes apartar tu lugar con $4,500 MXN.`,
          },
          {
            question: `¿Tengo un Reformer individual asignado durante las clases?`,
            answer: `Sí. En CAMA limitamos cada cohorte a un máximo estricto de 12 alumnas(os) para que cada participante cuente con un Reformer profesional exclusivo sin tener que compartir turnos de máquina.`,
          },
          {
            question: `¿Cuál es el valor del certificado emitido?`,
            answer: `El certificado avala 100 horas profesionales de formación biomecánica, repertorio esencial e intermedio, modificaciones clínicas y docencia práctica, con validez curricular ante estudios de Pilates en todo México.`,
          },
        ]
      : [
          {
            question: `¿Qué debo confirmar antes de elegir una certificación de Pilates en ${shortCityName}?`,
            answer: 'Confirma el organismo que respalda el programa, las horas de formación y práctica, el proceso de evaluación, los materiales incluidos y el costo total.',
          },
          {
            question: '¿Una certificación de Pilates es lo mismo que tomar clases?',
            answer: 'No. Una certificación prepara instructores; las clases son para practicar Pilates como alumno. El directorio local reúne estudios para tomar clases.',
          },
          {
            question: '¿Cómo consulto próximas fechas y costos?',
            answer: 'Solicita información y confirma directamente la sede, el calendario vigente, los requisitos y las políticas de pago antes de inscribirte.',
          },
        ];

  const faqSchema = faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  const courseSchemas = isCdmx
    ? STOTT_COURSES.map(course => ({
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
      }))
    : cohort
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: `Certificación Profesional de Instructor de Pilates Reformer — ${shortCityName}`,
            description: `Programa intensivo de 100 horas presenciales y biomecánica en ${cohort.cityName}. ${cohort.fullDatesLabel}.`,
            provider: {
              '@type': 'Organization',
              name: 'CAMA Pilates',
              url: origin,
            },
            offers: {
              '@type': 'Offer',
              price: cohort.discountedPrice,
              priceCurrency: 'MXN',
              availability: 'https://schema.org/InStock',
              url: `${origin}/certificacion-pilates/${key}`,
            },
            hasCourseInstance: cohort.weekends.map(w => ({
              '@type': 'CourseInstance',
              courseMode: 'Onsite',
              name: `${w.title} (${w.dates})`,
              startDate: w.startDate,
              endDate: w.endDate,
              location: {
                '@type': 'Place',
                name: cohort.location.name,
                address: `${cohort.location.neighborhood}, ${cohort.location.city}, ${cohort.location.state}`,
              },
            })),
          },
        ]
      : [];

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates/${key}`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={`${title} | ${DEFAULTS.siteName}`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates/${key}`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        {faqSchema && (
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        )}
        {courseSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link to="/certificacion-pilates" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Ver todas las sedes
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              {cohort
                ? `Convocatoria Abierta · Cohorte ${cohort.periodLabel} · 50% OFF`
                : isCdmx
                  ? 'Programa Premium · STOTT PILATES®'
                  : 'Formación para instructores'}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              {cohort
                ? `Certificación Pilates Reformer en ${shortCityName}`
                : isCdmx
                  ? cityName
                  : title}
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              {cohort
                ? `Programa intensivo de 100 horas estructurado en 4 fines de semana presenciales (${cohort.fullDatesLabel}). Un Reformer individual asignado por alumna(o), biomecánica clínica y metodología de enseñanza. Masterclass previa el 26 de septiembre con Gabi y Laura Munive. Lista de espera con 50% de descuento ($19,900 MXN).`
                : isCdmx
                  ? `Certificación ${STOTT_PROVIDER.method} — el "Gold Standard" de la industria — impartida por ${STOTT_PROVIDER.name} en ${STOTT_VENUE.name}, hosting oficial de Merrithew® en Santa Fe. Validez internacional en más de 100 países.`
                  : `Compara opciones de formación en Reformer y Mat en ${shortCityName}. Antes de inscribirte, confirma el respaldo del programa, las horas de práctica, la evaluación y el costo total.`}
            </p>

            <div className="flex flex-wrap gap-4">
              {cohort ? (
                <>
                  <button
                    onClick={() => {
                      setWhopPlan(WHOP_CONFIG.plans.apartado.id);
                      setWhopCheckoutOpen(true);
                    }}
                    className="px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors shadow-md font-semibold"
                  >
                    Apartar con 50% OFF ($4,500 MXN)
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-4 border border-[#2A2624]/30 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
                  >
                    Pre-registro gratis
                  </button>
                  <Link
                    to="/certificacion-pilates/webinar"
                    className="px-6 py-4 bg-[#3E2723]/10 border border-[#3E2723]/30 text-[#3E2723] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723]/20 transition-colors flex items-center gap-2"
                  >
                    <span>Masterclass 26 Sep</span>
                  </Link>
                </>
              ) : (
                <>
                  <a href={wa} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                    {isCdmx ? 'Inscribirme' : 'Solicitar información'}
                  </a>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
                  >
                    Pre-registro
                  </button>
                </>
              )}
            </div>

            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <MapPin className="h-4 w-4 text-[#3E2723]" />{' '}
                {cohort
                  ? `${cohort.location.name}, ${cohort.location.neighborhood}`
                  : isCdmx
                    ? `${STOTT_VENUE.name}, ${STOTT_VENUE.area}`
                    : cityName}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <Calendar className="h-4 w-4 text-[#3E2723]" />{' '}
                {cohort
                  ? `${cohort.fullDatesLabel} (${cohort.scheduleHours})`
                  : isCdmx
                    ? FEATURED.dates[0]?.label
                    : 'Consulta fechas vigentes'}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <Award className="h-4 w-4 text-[#3E2723]" />{' '}
                {cohort
                  ? `100 horas totales · 56h presenciales intensivas · Cupo limitado a ${cohort.capacityPerCity} alumnas(os)`
                  : isCdmx
                    ? 'Respaldo Merrithew® · CECs incluidos'
                    : 'Horas avaladas con práctica supervisada'}
              </div>
            </div>
          </div>

          <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">
              {cohort
                ? `El Programa en ${shortCityName} Incluye`
                : isCdmx
                  ? 'El Programa Incluye'
                  : 'Qué comparar en cada programa'}
            </h2>
            {cohort ? (
              <ul className="space-y-4">
                {cohort.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-sm text-[#5D5550] font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723] mt-2 flex-shrink-0"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : isCdmx ? (
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Intensive Reformer 125h — {FEATURED.price ? formatMXN(FEATURED.price) : ''}
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Intensive Mat-Plus™ + Advanced Mat (online en vivo)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Advanced Reformer — intensivo de 3 días
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Grupos reducidos de 12 personas
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Equipo Merrithew® de última generación
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span>
                  Ruta al Examen de Certificación Internacional
                </li>
              </ul>
            ) : (
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Alcance de la formación: Reformer, Mat o ruta integral
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Horas de observación, práctica y enseñanza
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Método de evaluación y requisitos de aprobación
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Organismo que respalda el certificado
                </li>
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Cohort-specific weekend breakdown & webinar callout */}
      {cohort && (
        <section className="py-16 px-8 md:px-24 max-w-[1800px] mx-auto">
          <CertificationWebinarBanner city={key as 'queretaro' | 'monterrey'} className="mb-16" />

          <div className="mb-12 text-center max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-[#3E2723] font-semibold block mb-3">
              Cronograma Académico · {cohort.periodLabel}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
              4 Fines de Semana Intensivos en {shortCityName}
            </h2>
            <p className="text-base text-[#5D5550] font-light mt-4">
              {cohort.scheduleHours} en {cohort.location.name}. Cada alumna(o) cuenta con su propio Reformer profesional de estudio sin rotación ni esperas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {cohort.weekends.map((w, idx) => (
              <div key={idx} className="bg-white/70 border border-[#2A2624]/10 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#2A2624] text-white text-[11px] font-semibold uppercase tracking-wider">
                    Fin de Semana {w.weekendNumber}
                  </span>
                  <span className="text-xs font-medium text-[#D9865B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {w.dates}
                  </span>
                </div>
                <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">{w.title}</h3>
                <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-4">{w.description}</p>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#3E2723]" />
                  <span>{w.hours} horas presenciales de instrucción y práctica guiada</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Waitlist Action Box */}
          <div className="bg-[#2A2624] text-[#EAE8E4] rounded-3xl p-8 sm:p-12 shadow-xl border border-[#3E2723] text-center max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D9865B] font-semibold block mb-2">
              Inversión Especial Lista de Espera · 12 Cupos por Ciudad
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif italic text-white mb-4">
              50% de Descuento: $19,900 MXN
            </h3>
            <p className="text-sm text-[#EAE8E4]/80 max-w-xl mx-auto mb-8 font-light">
              Precio oficial regular: <span className="line-through text-gray-400">$39,800 MXN</span>. Reserva tu lugar congelando el descuento con solo <strong>$4,500 MXN</strong> y liquida el saldo en parcialidades durante las semanas del curso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setWhopPlan(WHOP_CONFIG.plans.apartado.id);
                  setWhopCheckoutOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#EAE8E4] text-[#2A2624] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors shadow-lg"
              >
                Apartar mi lugar con 50% OFF ($4,500 MXN)
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/30 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Pre-registro sin costo
              </button>
              <Link
                to="/certificacion-pilates/webinar"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-xs uppercase tracking-[0.2em] hover:bg-emerald-500/30 transition-colors"
              >
                Masterclass (26 Sep)
              </Link>
            </div>
          </div>
        </section>
      )}

      {isCdmx && (
        <StottPremiumProgram
          onPreRegister={() => setModalOpen(true)}
          whatsappBase={PRIMARY_WHATSAPP}
        />
      )}

      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requisitos</h2>
            {isCdmx ? (
              <ul className="space-y-4 text-[#5D5550] font-light">
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Profesionales del fitness/salud o practicantes con 30+ horas de experiencia.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Horas de observación, práctica personal y enseñanza supervisada incluidas en cada ruta.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Nivel 2 (Advanced) requiere haber completado el intensivo de Nivel 1 correspondiente.</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4 text-[#5D5550] font-light">
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Pregunta por la experiencia previa requerida en Pilates o movimiento.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Confirma si las horas de observación, práctica y enseñanza están incluidas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Solicita por escrito los criterios de evaluación y certificación.</span>
                </li>
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Duración e inversión</h2>
            {isCdmx ? (
              <ul className="space-y-4 text-[#5D5550] font-light">
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Intensive Reformer: 125 horas — $44,000 MXN (apartado $8,000 MXN).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Intensive Mat-Plus™ + Advanced Mat: 95 horas — $36,800 MXN con manuales oficiales incluidos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Advanced Reformer: 27 horas — $20,000 MXN (apartado $5,000 MXN).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Pago con tarjeta disponible y descuentos por rutas completas de formación.</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4 text-[#5D5550] font-light">
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Compara horas lectivas, práctica personal y enseñanza supervisada por separado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Confirma si manuales, evaluaciones, reposiciones e impuestos están incluidos en el precio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Consulta directamente las fechas, costos y políticas de pago vigentes.</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </section>

      {!isCdmx && (
        <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-10">Preguntas frecuentes</h2>
            <div className="space-y-8">
              {faqItems.map(item => (
                <article key={item.question}>
                  <h3 className="text-lg font-medium text-[#2A2624]">{item.question}</h3>
                  <p className="mt-3 text-[#5D5550] font-light leading-relaxed">{item.answer}</p>
                </article>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-4">
              {data.directorySlug && (
                <Link
                  to={`/estudios-de-pilates/${data.directorySlug}`}
                  className="inline-flex items-center px-6 py-3 border border-[#2A2624]/20 rounded-full text-xs uppercase tracking-[0.15em] text-[#2A2624] hover:bg-white transition-colors"
                >
                  Ver clases y estudios en {shortCityName}
                </Link>
              )}
              <Link
                to="/reformer-para-estudio"
                className="inline-flex items-center px-6 py-3 border border-[#2A2624]/20 rounded-full text-xs uppercase tracking-[0.15em] text-[#2A2624] hover:bg-white transition-colors"
              >
                Reformers para abrir un estudio
              </Link>
            </div>
          </div>
        </section>
      )}

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCity={cityName}
        source={`/certificacion-pilates/${key}`}
      />

      <WhopCheckoutModal
        isOpen={whopCheckoutOpen}
        onClose={() => setWhopCheckoutOpen(false)}
        planId={whopPlan}
        cohort={cohort ? (key === 'queretaro' ? 'queretaro-nov-2026' : 'monterrey-dec-jan-2026-2027') : undefined}
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilatesCity;
