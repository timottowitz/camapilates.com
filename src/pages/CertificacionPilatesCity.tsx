import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Calendar, MapPin, ArrowLeft, Award } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';
import StottPremiumProgram from '@/components/certification/StottPremiumProgram';
import {
  STOTT_COURSES,
  STOTT_PROVIDER,
  STOTT_VENUE,
  formatMXN,
} from '@/content/certification/stottCdmx';

type CityKey = 'cdmx' | 'guadalajara' | 'monterrey' | 'puebla' | 'queretaro';

const CITY_DATA: Record<CityKey, { name: string; variants: string[] }> = {
  cdmx: {
    name: 'Ciudad de México (CDMX)',
    variants: [
      'certificación pilates cdmx',
      'certificación pilates reformer cdmx',
      'certificación stott pilates cdmx',
      'certificación pilates mexico df',
      'certificación pilates ciudad de mexico'
    ]
  },
  guadalajara: {
    name: 'Guadalajara (Jalisco)',
    variants: [
      'certificación de pilates en guadalajara jalisco',
      'certificación pilates guadalajara'
    ]
  },
  monterrey: {
    name: 'Monterrey (NL)',
    variants: [
      'certificación de pilates en monterrey',
      'certificación pilates monterrey'
    ]
  },
  puebla: {
    name: 'Puebla',
    variants: [
      'certificación pilates puebla'
    ]
  },
  queretaro: {
    name: 'Querétaro',
    variants: [
      'certificación pilates querétaro'
    ]
  }
};

const PRIMARY_WHATSAPP = 'https://wa.me/523222787690?text=';

const FEATURED = STOTT_COURSES.find(c => c.featured) || STOTT_COURSES[0];

const CertificacionPilatesCity: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { city } = useParams();
  const origin = getOrigin();
  const key = (city || 'cdmx').toLowerCase() as CityKey;
  const data = CITY_DATA[key] || CITY_DATA.cdmx;
  const isCdmx = key === 'cdmx' || !CITY_DATA[key];

  const cityName = data.name;
  const title = isCdmx
    ? `Certificación STOTT PILATES® en ${cityName} — Programa Premium`
    : `Certificación de Pilates (Reformer) en ${cityName}`;
  const desc = isCdmx
    ? `Certifícate en STOTT PILATES® en ${cityName}: Intensive Reformer (125h), Mat-Plus™ y niveles avanzados en ${STOTT_VENUE.name}, sede oficial Merrithew® en Santa Fe. Fechas, costos y registro.`
    : `Conecta con certificaciones de Pilates en ${cityName}. Reformer y Mat: requisitos, duración, costos y registro.`;

  const wa = `${PRIMARY_WHATSAPP}${encodeURIComponent(
    isCdmx
      ? 'Hola, quiero inscribirme a la certificación STOTT PILATES® en CDMX'
      : `Hola Edelweiss, quiero inscribirme a la certificación de Pilates en ${cityName}`
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
    name: `Certificación de Pilates en ${cityName}`,
    areaServed: {
      '@type': 'City',
      name: cityName
    },
    provider: { '@type': 'Organization', name: 'Edelweiss / camadepilates.com', url: origin },
    serviceType: 'Orientación e inscripción a certificaciones de Pilates (Reformer y Mat)'
  };

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
        {courseSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link to="/certificacion-pilates" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to All Locations
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              {isCdmx ? 'Programa Premium · STOTT PILATES®' : 'Teacher Training'}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              {cityName}
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              {isCdmx
                ? `Certificación ${STOTT_PROVIDER.method} — el "Gold Standard" de la industria — impartida por ${STOTT_PROVIDER.name} en ${STOTT_VENUE.name}, hosting oficial de Merrithew® en Santa Fe. Validez internacional en más de 100 países.`
                : 'Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={wa} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                Inscribirme
              </a>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
              >
                Pre-registro
              </button>
            </div>

            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <MapPin className="h-4 w-4 text-[#3E2723]" /> {isCdmx ? `${STOTT_VENUE.name}, ${STOTT_VENUE.area}` : cityName}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <Calendar className="h-4 w-4 text-[#3E2723]" /> {isCdmx ? FEATURED.dates[0]?.label : 'Próximas fechas disponibles'}
              </div>
              {isCdmx && (
                <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <Award className="h-4 w-4 text-[#3E2723]" /> Respaldo Merrithew® · CECs incluidos
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">
              {isCdmx ? 'El Programa Incluye' : 'Program Includes'}
            </h2>
            {isCdmx ? (
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Reformer y Mat
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Práctica clínica y mentoreo
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Evaluación teórica y práctica
                </li>
                <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Bolsa de trabajo
                </li>
              </ul>
            )}
            <p className="text-xs text-[#5D5550]/60 mt-8 pt-8 border-t border-[#2A2624]/10">
              Keywords: {data.variants.join(', ')}
            </p>
          </div>
        </div>
      </section>

      {isCdmx && (
        <StottPremiumProgram
          onPreRegister={() => setModalOpen(true)}
          whatsappBase={PRIMARY_WHATSAPP}
        />
      )}

      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requirements</h2>
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
                  <span>18+ y experiencia básica en Pilates o movimiento.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Horas clínicas: observación, asistencia y enseñanza.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                  <span>Compromiso con práctica supervisada para Reformer.</span>
                </li>
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Duration & Investment</h2>
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
                  <span>Rutas de 150–450 horas según alcance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Rangos orientativos: $8,000–$25,000 MXN (módulos) y $30,000–$80,000 MXN (programas profesionales).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                  <span>Planes de pago y descuentos por pronto pago (consulta sedes).</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCity={cityName}
        source={`/certificacion-pilates/${key}`}
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilatesCity;
