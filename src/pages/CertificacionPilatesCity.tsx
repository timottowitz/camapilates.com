import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Calendar, MapPin, ArrowLeft, Award, Clock, Sparkles, Building2 } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';
import StottPremiumProgram from '@/components/certification/StottPremiumProgram';
import CertificationWebinarBanner from '@/components/certification/CertificationWebinarBanner';
import CityListicleNav from '@/components/certification/CityListicleNav';
import CertificationPartnerCard from '@/components/certification/CertificationPartnerCard';
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
import {
  CERTIFICATION_CITIES,
  CERTIFICATION_PARTNERS,
  getCityInfo,
  getPartnersByCitySlug,
  normalizeCitySlug,
} from '@/content/certification/certificationsData';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';

const PRIMARY_WHATSAPP = 'https://wa.me/525548468190?text=';
const FEATURED = STOTT_COURSES.find((c) => c.featured) || STOTT_COURSES[0];

export const CertificacionPilatesCity: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [whopCheckoutOpen, setWhopCheckoutOpen] = useState(false);
  const [whopPlan, setWhopPlan] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const origin = getOrigin();

  const normalizedKey = normalizeCitySlug(city || 'cdmx');

  // Handle redirects for non-canonical slugs like ciudad-de-mexico -> cdmx, zapopan -> guadalajara
  useEffect(() => {
    if (city && city !== normalizedKey) {
      navigate(`/certificacion-pilates/${normalizedKey}`, { replace: true });
    }
  }, [city, normalizedKey, navigate]);

  const cityInfo = getCityInfo(normalizedKey) || CERTIFICATION_CITIES[0];
  const partners = getPartnersByCitySlug(normalizedKey);
  const isCdmx = normalizedKey === 'cdmx';
  const cohort = (normalizedKey === 'queretaro' || normalizedKey === 'monterrey')
    ? CERTIFICATION_COHORTS[normalizedKey as 'queretaro' | 'monterrey']
    : null;

  const cityName = cityInfo.name;
  const shortCityName = cityInfo.shortName;

  const title = normalizedKey === 'monterrey'
    ? 'Certificación Pilates Monterrey [Fechas 2026 y Academias]'
    : normalizedKey === 'queretaro'
      ? 'Certificación Pilates Querétaro [Nov 2026 y Sedes]'
      : normalizedKey === 'puebla'
        ? 'Certificación Pilates Puebla 2026: Costos, Fechas y Aval Oficial'
        : normalizedKey === 'guadalajara'
          ? 'Certificación Pilates Guadalajara 2026 [Costos, Escuelas y Fechas]'
          : isCdmx
            ? 'Certificación Pilates CDMX [STOTT & Linaje Clásico 2026]'
            : `Certificación Pilates ${shortCityName} [2026: Escuelas y Avales]`;

  const desc = isCdmx
    ? `Certifícate en STOTT PILATES® en ${cityName}: Intensive Reformer (125h) en ${STOTT_VENUE.name} Santa Fe, y escuelas clásicas de 2da generación en Polanco y Roma Norte. Sedes, costos y registro.`
    : cohort
      ? `Certifícate como instructora de Pilates Reformer en ${shortCityName} (${cohort.periodLabel}): Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). Cupos limitados con Reformer individual y directorio de academias.`
      : `Directorio de academias y escuelas de certificación de Pilates en ${shortCityName}. Compara opciones en Reformer y Mat, horas avaladas (NPCP/SEP), requisitos, costos y contacto directo.`;

  const wa = `${PRIMARY_WHATSAPP}${encodeURIComponent(
    isCdmx
      ? 'Hola, quiero inscribirme a la certificación STOTT PILATES® en CDMX'
      : cohort
        ? `Hola, quiero información sobre la certificación de Pilates Reformer en ${shortCityName} (${cohort.periodLabel}) (Curso Básico 28h $25,000 / Completa 48h $38,000).`
        : `Hola, quiero informes sobre escuelas y certificación de Pilates en ${shortCityName}`
  )}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Certificación de Pilates', item: `${origin}/certificacion-pilates` },
      { '@type': 'ListItem', position: 2, name: cityName, item: `${origin}/certificacion-pilates/${normalizedKey}` }
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
    provider: { '@type': 'Organization', name: 'Edelweiss Pilates', url: origin },
    serviceType: isCdmx
      ? 'Inscripción a certificación STOTT PILATES y directorio de escuelas'
      : 'Directorio y convocatoria de certificaciones de Pilates (Reformer y Mat)'
  };

  // Generate EducationalOrganization schemas for all partner academies in this city
  const partnerSchemas = partners.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: p.partnerName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.studioLocations,
      addressLocality: p.city,
      addressRegion: p.state,
      addressCountry: 'MX'
    },
    telephone: p.phone,
    email: p.email,
    url: p.website || `${origin}/certificacion-pilates/${normalizedKey}`,
    description: `${p.roleTitle}: ${p.aboutCredentials}. Certificaciones: ${p.certificationsOffered}`,
  }));

  const faqItems = cohort
    ? [
        {
          question: `¿Cuándo son las fechas exactas de la cohorte en ${shortCityName}?`,
          answer: `La cohorte de ${shortCityName} se lleva a cabo en 4 fines de semana intensivos (${cohort.fullDatesLabel}) en horario de ${cohort.scheduleHours}.`,
        },
        {
          question: `¿Cuáles son los costos y modalidades en ${shortCityName}?`,
          answer: `Ofrecemos el Curso Básico de 28 horas (2 fines de semana) por $25,000 MXN y la Certificación Completa de 48 horas (4 fines de semana) por $38,000 MXN. Puedes pre-reservar tu lugar con solo $400 MXN.`,
        },
        {
          question: `¿Tengo un Reformer individual asignado durante las clases?`,
          answer: `Sí. En Edelweiss limitamos cada cohorte a un máximo estricto de 12 alumnas(os) para que cada participante cuente con un Reformer profesional exclusivo sin tener que compartir turnos de máquina.`,
        },
        {
          question: `¿Qué otras academias de Pilates certifican en ${shortCityName}?`,
          answer: `En ${shortCityName} contamos con ${partners.length} academias aliadas indexadas en nuestro directorio, incluyendo ${partners.map(p => p.partnerName).join(', ')}.`,
        },
      ]
    : [
        {
          question: `¿Qué escuelas y academias de Pilates certifican en ${shortCityName}?`,
          answer: `En ${shortCityName} están activas las academias: ${partners.map(p => `${p.partnerName} (${p.leadPerson})`).join(', ')}. Cada una ofrece programas desde 30h hasta más de 550h en Reformer y Mat.`,
        },
        {
          question: `¿Qué validez tienen los certificados en ${shortCityName}?`,
          answer: 'Las academias cuentan con avales reconocidos como NPCP (National Pilates Certification Program de EE.UU.), SEP-CONOCER en México, linajes clásicos directos (Romana Kryzanowska, The New York Pilates Studio) y STOTT PILATES®. Revisa cada ficha para detalles específicos.',
        },
        {
          question: '¿Una certificación de Pilates es lo mismo que tomar clases en un estudio?',
          answer: 'No. Una certificación capacita técnica, anatómica y pedagógicamente para impartir clases y programar entrenamientos; mientras que los estudios locales ofrecen clases guiadas para practicantes.',
        },
        {
          question: `¿Cómo contacto a las escuelas de Pilates en ${shortCityName}?`,
          answer: 'En cada ficha de academia encontrarás botones directos a su WhatsApp verificado, sitio web oficial, Instagram, teléfono y correo electrónico.',
        },
      ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates/${normalizedKey}`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={`${title} | ${DEFAULTS.siteName}`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates/${normalizedKey}`} />
        <meta property="og:image" content={`${origin}${cityInfo.landmarkImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        {partnerSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      {/* City Switcher Listicle Bar (Sticky Top) */}
      <section className="pt-28 pb-4 px-6 md:px-16 max-w-[1800px] mx-auto border-b border-[#2A2624]/10 bg-[#EAE8E4]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <Link
            to="/certificacion-pilates"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Ver Directorio Nacional Completo
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#3E2723]">
            Sedes Disponibles: 10 Ciudades Clave
          </span>
        </div>
        <CityListicleNav currentCitySlug={normalizedKey} />
      </section>

      {/* Hero Section with City Landmark Imagery */}
      <section className="relative pt-12 pb-16 px-6 md:px-16 max-w-[1800px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#3E2723] text-[#EAE8E4] text-[11px] font-sans tracking-[0.2em] uppercase rounded-full">
                {cohort ? `Convocatoria Abierta · ${cohort.periodLabel}` : isCdmx ? 'Sede STOTT & Linaje Clásico' : 'Directorio de Certificación'}
              </span>
              <span className="text-xs font-mono text-[#5D5550]">
                {partners.length} {partners.length === 1 ? 'Academia Registrada' : 'Academias Registradas'}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.95] mb-6">
              Certificación de Pilates en {shortCityName}
            </h1>

            <p className="text-sm md:text-base text-[#3E2723] font-medium tracking-wide uppercase mb-4">
              {cityInfo.tagline}
            </p>

            <p className="text-base md:text-lg text-[#5D5550] font-light leading-relaxed mb-8 max-w-2xl">
              {cohort
                ? `Formación presencial intensiva en ${shortCityName}: Curso Básico (28h · $25,000 MXN) o Certificación Completa (48h · $38,000 MXN). Cada alumna(o) cuenta con un Reformer individual asignado con las Master Trainers Gabi y Laura Munive. Explora también las academias aliadas locales en ${shortCityName}.`
                : isCdmx
                  ? `Sede oficial STOTT PILATES® en Santa Fe y escuelas clásicas de élite en Polanco y Roma Norte. Consulta fechas, programas completos de Reformer y Mat, y contacto directo.`
                  : `Compara las mejores opciones de certificación de instructor de Pilates Reformer y Mat en ${shortCityName}. Revisa horas lectivas, avales oficiales (NPCP, SEP-CONOCER, linajes internacionales), costos y ubicación de sede.`}
            </p>

            <div className="flex flex-wrap gap-4">
              {cohort ? (
                <>
                  <button
                    onClick={() => {
                      setWhopPlan(
                        normalizedKey === 'monterrey'
                          ? WHOP_CONFIG.plans.apartadoMonterrey.id
                          : WHOP_CONFIG.plans.apartadoQueretaro.id
                      );
                      setWhopCheckoutOpen(true);
                    }}
                    className="px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-all shadow-md font-semibold"
                  >
                    {WHOP_CONFIG.paymentsEnabled ? 'Pre-reservar Cupo ($400 MXN)' : 'Apartar Cupo ($400 MXN)'}
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-4 border border-[#2A2624]/30 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    Pre-registro gratis
                  </button>
                  <a
                    href="#academias"
                    className="px-6 py-4 bg-white/70 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    Ver {partners.length} Academias ↓
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#academias"
                    className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors shadow-md"
                  >
                    Ver Escuelas en {shortCityName} ({partners.length})
                  </a>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 border border-[#2A2624]/30 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors"
                  >
                    Asesoría de Certificación
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Beautiful Rendered City Landmark Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-[#2A2624]/15 shadow-2xl bg-white">
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#2A2624]/10 relative">
                <img
                  src={cityInfo.landmarkImage}
                  alt={`Sede de certificación de Pilates en ${cityInfo.name} - ${cityInfo.landmarkTitle}`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2624]/90 via-[#2A2624]/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#D9865B] block mb-1">
                    Icono de la Ciudad
                  </span>
                  <h3 className="text-xl font-serif italic text-white mb-1">
                    {cityInfo.landmarkTitle}
                  </h3>
                  <p className="text-xs text-[#EAE8E4]/80 font-light line-clamp-2">
                    {cityInfo.description}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#F5F4F0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5D5550] block">
                    Estado / Región
                  </span>
                  <span className="text-sm font-semibold text-[#2A2624]">{cityInfo.state}</span>
                </div>
                {cityInfo.directorySlug && (
                  <Link
                    to={`/estudios-de-pilates/${cityInfo.directorySlug}`}
                    className="text-xs uppercase tracking-wider text-[#3E2723] hover:underline font-semibold"
                  >
                    Ver Estudios Locales →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Cohort Section (For Monterrey & Querétaro) */}
      {cohort && (
        <section className="py-12 px-6 md:px-16 max-w-[1800px] mx-auto">
          <CertificationWebinarBanner city={normalizedKey as 'queretaro' | 'monterrey'} className="mb-12" />

          <div className="mb-10 text-center max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-[#3E2723] font-semibold block mb-2">
              Convocatoria Exclusiva Edelweiss · {cohort.periodLabel}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
              4 Fines de Semana Intensivos en {shortCityName}
            </h2>
            <p className="text-base text-[#5D5550] font-light mt-3">
              {cohort.scheduleHours} en {cohort.location.name}. Un Reformer profesional individual asignado por alumna(o) sin rotación ni esperas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cohort.weekends.map((w, idx) => (
              <div key={idx} className="bg-white border border-[#2A2624]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2A2624] text-white text-[10px] font-semibold uppercase tracking-wider">
                      FDS {w.weekendNumber}
                    </span>
                    <span className="text-xs font-mono text-[#D9865B]">{w.dates}</span>
                  </div>
                  <h3 className="text-lg font-serif italic text-[#2A2624] mb-2">{w.title}</h3>
                  <p className="text-xs text-[#5D5550] font-light leading-relaxed mb-4">{w.description}</p>
                </div>
                <div className="pt-3 border-t border-[#2A2624]/10 text-[11px] font-mono text-[#5D5550] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#3E2723]" />
                  <span>{w.hours}h presenciales</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#2A2624] text-[#EAE8E4] rounded-3xl p-8 sm:p-12 shadow-xl border border-[#3E2723] text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D9865B] font-semibold block mb-2">
              Inversión Oficial · Cupo Limitado a 12 Alumnas(os)
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif italic text-white mb-3">
              Básico: $25,000 MXN (28h) · Completo: $38,000 MXN (48h)
            </h3>
            <p className="text-sm text-[#EAE8E4]/80 max-w-xl mx-auto mb-6 font-light">
              Reformer propio durante cada sesión y acceso vitalicio al campus digital. Congela tu cupo con solo <strong>$400 MXN</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setWhopPlan(
                    normalizedKey === 'monterrey'
                      ? WHOP_CONFIG.plans.apartadoMonterrey.id
                      : WHOP_CONFIG.plans.apartadoQueretaro.id
                  );
                  setWhopCheckoutOpen(true);
                }}
                className="px-8 py-4 rounded-full bg-[#EAE8E4] text-[#2A2624] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-colors shadow-lg"
              >
                {WHOP_CONFIG.paymentsEnabled ? 'Pre-reservar mi lugar ($400 MXN)' : 'Apartar Cupo ($400 MXN)'}
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 rounded-full border border-white/30 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                Pre-registro sin costo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Flagship STOTT Program Section (For CDMX) */}
      {isCdmx && (
        <section className="py-8 px-6 md:px-16 max-w-[1800px] mx-auto mb-12">
          <StottPremiumProgram
            onPreRegister={() => setModalOpen(true)}
            whatsappBase={PRIMARY_WHATSAPP}
          />
        </section>
      )}

      {/* Researched Partner Academies Directory */}
      <section id="academias" className="py-16 px-6 md:px-16 max-w-[1800px] mx-auto border-t border-[#2A2624]/10">
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E2723]/10 text-[#3E2723] text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Directorio Oficial en {shortCityName}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624] mb-4">
            Escuelas y Academias de Certificación en {shortCityName}
          </h2>
          <p className="text-base text-[#5D5550] font-light leading-relaxed">
            Hemos investigado y verificado a los formadores, master trainers y centros con aval oficial en {shortCityName}. Consulta su linaje, programas (Reformer, Mat, Implementos), dirección y contacta directamente a la dirección académica:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {partners.map((partner) => (
            <CertificationPartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      {/* Requirements & Investment Guide */}
      <section className="py-20 px-6 md:px-16 bg-white/50 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requisitos de Inscripción</h3>
            <ul className="space-y-4 text-[#5D5550] font-light text-sm md:text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] shrink-0"></span>
                <span><strong>Experiencia previa recomendada:</strong> Al menos 20 a 30 horas de práctica previa en Pilates Reformer o Mat, o perfil en ciencias del deporte / danza / fisioterapia.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] shrink-0"></span>
                <span><strong>Horas de práctica supervisada:</strong> Para obtener diplomas con validez oficial, la mayoría de programas requieren cumplir horas de observación, práctica personal y docencia guiada.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] shrink-0"></span>
                <span><strong>Evaluación final:</strong> Examen teórico anatómico y demostración práctica de enseñanza y cueing ante evaluadores certificados.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-3xl font-serif italic text-[#2A2624] mb-6">Duración e Inversión en México</h3>
            <ul className="space-y-4 text-[#5D5550] font-light text-sm md:text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 shrink-0"></span>
                <span><strong>Cursos Básicos Reformer (28h - 55h):</strong> $20,000 a $28,000 MXN. Ideal para instructores que inician en aparatología.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 shrink-0"></span>
                <span><strong>Certificaciones Comprensivas / Sistema Completo (125h - 600h):</strong> $38,000 a $75,000+ MXN. Incluyen Reformer, Cadillac, Silla Wunda y Barriles con preparación para el examen internacional NPCP.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 shrink-0"></span>
                <span><strong>Financiamiento:</strong> La mayoría de escuelas ofrecen pago en mensualidades o esquemas de apartado anticipado.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-6 md:px-16 border-t border-[#2A2624]/10 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-10 text-center">
            Preguntas Frecuentes sobre Certificación en {shortCityName}
          </h2>
          <div className="space-y-8">
            {faqItems.map((item, idx) => (
              <article key={idx} className="border-b border-[#2A2624]/10 pb-6">
                <h3 className="text-lg font-medium text-[#2A2624] mb-2">{item.question}</h3>
                <p className="text-[#5D5550] font-light leading-relaxed text-sm md:text-base">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativa con otras Sedes */}
      <section className="py-16 px-6 md:px-16 border-t border-[#2A2624]/10 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-3 text-center md:text-left">
            Compara Sedes de Certificación en México
          </h2>
          <p className="text-sm md:text-base text-[#5D5550] font-light leading-relaxed mb-8 text-center md:text-left">
            Si deseas contrastar fechas, costos, horarios de fin de semana o programas de aval internacional en otras entidades, consulta nuestras guías por sede:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CERTIFICATION_CITIES.filter((c) => c.key !== normalizedKey).map((c) => (
              <Link
                key={c.key}
                to={`/certificacion-pilates/${c.key}`}
                className="p-3 bg-white border border-[#2A2624]/10 rounded-xl text-center hover:border-[#3E2723] hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-[#2A2624] group-hover:text-[#3E2723]">{c.shortName}</div>
                <div className="text-[10px] text-[#5D5550]/80 mt-0.5">Compara opciones →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking / Equipment Section for Future Studio Owners */}
      <section className="py-16 px-6 md:px-16 bg-[#F5F4F0] border-t border-[#2A2624]/10">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <span className="text-xs font-bold font-sans tracking-[0.25em] uppercase text-[#3E2723] mb-3 block opacity-70">
            Equipamiento para Nuevos Estudios & Entrenadores en {shortCityName}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-4">
            ¿Planeas abrir un estudio boutique o equipar tu espacio en {shortCityName}?
          </h2>
          <p className="text-sm md:text-base text-[#5D5550] font-light leading-relaxed mb-8">
            Diseñamos y fabricamos camas de Pilates Reformer profesionales con ingeniería alemana, nogal americano, roble blanco, aluminio anodizado y cuero genuino libre de plásticos. Envíos directos a {shortCityName} y a todo México con 1 año de garantía y refacciones inmediatas.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Link
              to="/cama-de-pilates"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#3E2723] hover:scale-105 transition-all"
            >
              Camas de Pilates Reformer en México
            </Link>
            <Link
              to="/cama-de-pilates/precio"
              className="inline-flex items-center px-6 py-3 rounded-full border border-[#2A2624]/20 bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#EAE8E4] transition-all"
            >
              Precios de Camas de Pilates
            </Link>
            <Link
              to="/reformer-para-estudio"
              className="inline-flex items-center px-6 py-3 rounded-full border border-[#2A2624]/20 bg-white text-[#2A2624] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#EAE8E4] transition-all"
            >
              Packs Comerciales para Estudio
            </Link>
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCity={cityName}
        source={`/certificacion-pilates/${normalizedKey}`}
      />

      <WhopCheckoutModal
        isOpen={whopCheckoutOpen}
        onClose={() => setWhopCheckoutOpen(false)}
        planId={whopPlan}
        cohort={cohort ? (normalizedKey === 'queretaro' ? 'queretaro-nov-2026' : 'monterrey-dec-jan-2026-2027') : undefined}
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilatesCity;
