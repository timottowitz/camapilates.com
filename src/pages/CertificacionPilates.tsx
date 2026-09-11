import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  GraduationCap,
  Video,
  BookOpen,
  Gift,
  Flame,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { EditorialFeatureCards } from '@/components/webapp/EditorialFeatureCards';
import { WhopForumReader } from '@/components/webapp/WhopForumReader';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import {
  CERTIFICATION_COHORTS,
  WEBINAR_INFO,
  getGoogleCalendarUrl
} from '@/content/certification/cohortsData';
import {
  STOTT_COURSES,
  STOTT_PROVIDER,
  STOTT_VENUE,
  formatMXN
} from '@/content/certification/stottCdmx';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';

type CapabilityTab = 'sedes' | 'curriculo' | 'comunidad' | 'oferta' | 'faq';

const PRIMARY_WHATSAPP_BASE = 'https://wa.me/525548468190?text=';
const PRIMARY_WHATSAPP = `${PRIMARY_WHATSAPP_BASE}${encodeURIComponent(
  'Hola, quiero información sobre la certificación de Pilates Reformer (100h) y apartar mi cupo con 50% de descuento.'
)}`;

const CITIES_LIST = [
  { key: 'queretaro', name: 'Querétaro', dates: 'Noviembre 2026 (7–29 Nov)', badge: '50% OFF · 12 Cupos' },
  { key: 'monterrey', name: 'Monterrey', dates: 'Dic 2026 – Ene 2027 (5 Dic–17 Ene)', badge: '50% OFF · 12 Cupos' },
  { key: 'cdmx', name: 'Ciudad de México', dates: 'STOTT PILATES® Santa Fe', badge: 'Merrithew® Oficial' },
  { key: 'guadalajara', name: 'Guadalajara', dates: 'Convocatoria 2027', badge: 'Lista de Espera' },
  { key: 'puebla', name: 'Puebla', dates: 'Convocatoria 2027', badge: 'Lista de Espera' },
];

export const CertificacionPilates: React.FC = () => {
  const origin = getOrigin();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as CapabilityTab) || 'sedes';

  const [activeTab, setActiveTab] = useState<CapabilityTab>(
    ['sedes', 'curriculo', 'comunidad', 'oferta', 'faq'].includes(initialTab) ? initialTab : 'sedes'
  );
  const [selectedCity, setSelectedCity] = useState<'queretaro' | 'monterrey' | 'cdmx'>('queretaro');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const [preRegModalOpen, setPreRegModalOpen] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cama_pilates_whop_enrollment');
      if (saved) {
        setEnrollmentData(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleOpenCheckout = (planId: string) => {
    setCheckoutPlanId(planId);
    setCheckoutModalOpen(true);
  };

  const handleSelectTab = (tab: CapabilityTab) => {
    setActiveTab(tab);
    const element = document.getElementById('capability-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCohort = selectedCity === 'cdmx' ? null : CERTIFICATION_COHORTS[selectedCity];

  const title = 'Certificación Profesional de Pilates Reformer (100h) en México | CAMA Pilates';
  const desc =
    'Certifícate como instructora de Pilates Reformer (100 horas): biomecánica clínica, máquina individual exclusiva por alumna y comunidad de por vida en Whop. Sedes en Querétaro, Monterrey y CDMX con 50% de descuento.';

  const courseSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Certificación Profesional de Instructor de Pilates Reformer — Querétaro',
      description: 'Programa intensivo de 100 horas presenciales y biomecánica en Querétaro. 4 fines de semana en Noviembre 2026. Respaldo curricular CAMA Pilates.',
      provider: {
        '@type': 'Organization',
        name: 'CAMA Pilates',
        url: origin,
      },
      offers: {
        '@type': 'Offer',
        price: '19900',
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Onsite',
        name: 'Cohorte Querétaro Noviembre 2026',
        startDate: '2026-11-07',
        endDate: '2026-11-29',
        location: {
          '@type': 'Place',
          name: CERTIFICATION_COHORTS.queretaro.location.name,
          address: `${CERTIFICATION_COHORTS.queretaro.location.neighborhood}, Querétaro, México`,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Certificación Profesional de Instructor de Pilates Reformer — Monterrey',
      description: 'Programa intensivo de 100 horas presenciales y biomecánica en San Pedro Garza García, Monterrey. Diciembre 2026 – Enero 2027.',
      provider: {
        '@type': 'Organization',
        name: 'CAMA Pilates',
        url: origin,
      },
      offers: {
        '@type': 'Offer',
        price: '19900',
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Onsite',
        name: 'Cohorte Monterrey Dic 2026 – Ene 2027',
        startDate: '2026-12-05',
        endDate: '2027-01-17',
        location: {
          '@type': 'Place',
          name: CERTIFICATION_COHORTS.monterrey.location.name,
          address: `${CERTIFICATION_COHORTS.monterrey.location.neighborhood}, Monterrey, México`,
        },
      },
    },
  ];

  const cityListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: CITIES_LIST.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Certificación de Pilates en ${c.name}`,
      url: `${origin}/certificacion-pilates#${c.key}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo funciona la certificación de 100 horas en Pilates Reformer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El programa consta de 56 horas presenciales intensivas distribuidas en 4 fines de semana prácticos, más 44 horas de observación guiada, práctica personal y videoteca HD en el campus virtual Whop, sumando 100 horas certificadas oficiales.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Tengo un Reformer individual asignado o se comparte entre alumnas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cada participante cuenta con un Reformer profesional exclusivo durante todo el curso presencial. Limitamos el cupo a un máximo estricto de 12 personas por sede para garantizar cero tiempos muertos.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo aseguro mi lugar con el 50% de descuento ($19,900 MXN)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes congelar tu descuento y asegurar 1 de los 12 cupos realizando un anticipo de $4,500 MXN a través de nuestra pasarela oficial de Whop (tarjeta o transferencia) o liquidar la colegiatura completa de $19,900 MXN.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué validez tiene el certificado al concluir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El certificado avala 100 horas profesionales de formación biomecánica, repertorio esencial e intermedio, adaptaciones para patologías de columna y docencia práctica, con validez curricular ante estudios de Pilates en todo México y Latinoamérica.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si tengo dudas después de que termine el curso presencial?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cuentas con acceso vitalicio a la comunidad de CAMA Pilates en Whop y a los foros clínicos con las docentes Gabi y Laura Munive para resolver dudas de tus alumnos, planificar clases y consultar la bolsa de trabajo.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#0F0F0F] font-sans selection:bg-[#111111] selection:text-white antialiased">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates`} />
        <meta property="og:image" content={`${origin}/og/cama-de-pilates-venta-mexico.png`} />
        {courseSchemas.map((schema, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
        <script type="application/ld+json">{JSON.stringify(cityListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Editorial Navigation Header */}
      <header className="border-b border-neutral-200/80 bg-[#F8F8F6]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              • camadepilates.com
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-900">
              [ 100H CERTIFICACIÓN ]
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-300 text-xs font-mono uppercase tracking-wider text-neutral-700 hover:border-neutral-900 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Campus Alumnas</span>
            </Link>

            <button
              onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Apartar Cupo ($4,500)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section — Clean Editorial Style */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        {/* Micro Monospace Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-[11px] uppercase tracking-wider">
            • FORMACIÓN 100H PROFESIONAL
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-[11px] uppercase tracking-wider">
            [ QUERÉTARO · MONTERREY · CDMX ]
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] uppercase tracking-wider">
            ● CONVOCATORIAS ABIERTAS
          </span>
        </div>

        {/* Display Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0F0F0F] max-w-5xl leading-[1.03] mb-8">
          Formación clínica en cada movimiento.
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 font-normal max-w-3xl leading-relaxed mb-10">
          La certificación profesional de 100 horas en Pilates Reformer con ingeniería del movimiento,
          un Reformer profesional exclusivo por alumna(o) y comunidad de por vida integrada en Whop.
          Impartida por las Master Trainers <strong>Gabi</strong> y <strong>Laura Munive</strong>.
        </p>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-3.5 mb-14">
          <button
            onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
            className="px-7 py-3.5 rounded-full bg-[#111111] text-white text-xs md:text-sm font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md flex items-center gap-2"
          >
            <span>Apartar Cupo ($4,500 MXN)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={PRIMARY_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs md:text-sm font-semibold uppercase tracking-wider hover:border-neutral-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Consultar por WhatsApp</span>
          </a>

          <Link
            to="/certificacion-pilates/webinar"
            className="px-7 py-3.5 rounded-full bg-amber-100/70 border border-amber-300 text-amber-950 text-xs md:text-sm font-semibold uppercase tracking-wider hover:bg-amber-100 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Webinar 26 Sep (50% OFF)</span>
          </Link>
        </div>

        {/* Value Proof Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-neutral-200/80">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80">
            <div className="font-mono text-2xl font-bold text-neutral-900">56h</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono mt-1">
              Presenciales Prácticas
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80">
            <div className="font-mono text-2xl font-bold text-neutral-900">1:1</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono mt-1">
              Reformer por Alumna
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80">
            <div className="font-mono text-2xl font-bold text-neutral-900">12</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono mt-1">
              Cupos Máximos por Sede
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80">
            <div className="font-mono text-2xl font-bold text-neutral-900">100%</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono mt-1">
              Comunidad Whop Activa
            </div>
          </div>
        </div>
      </section>

      {/* Signature 3-Color Editorial Cards */}
      <section className="px-6 max-w-7xl mx-auto mb-16">
        <EditorialFeatureCards
          onEnrollClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
          onExploreCurriculum={() => handleSelectTab('curriculo')}
          onCommunityClick={() => handleSelectTab('comunidad')}
        />
      </section>

      {/* Masterclass Pre-Webinar Banner */}
      <section className="px-6 max-w-7xl mx-auto mb-16">
        <div className="bg-gradient-to-r from-amber-900 via-[#1e1b18] to-neutral-900 text-white rounded-[28px] p-8 md:p-10 relative overflow-hidden shadow-xl border border-amber-900/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] uppercase tracking-wider mb-4 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Masterclass en Vivo · Sábado 26 de Septiembre 11:00 AM CST</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-3">
                Cómo Convertirte en Instructora Certificada en Querétaro y Monterrey
              </h2>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-4">
                Sesión de orientación con Gabi y Laura Munive. Desglose del plan de 100 horas y apertura de
                los 12 cupos exclusivos con 50% de descuento ($19,900 MXN en vez de $39,800 MXN).
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
                <span className="text-emerald-400 font-bold">• 100% Gratuito ($0 MXN)</span>
                <span>• Online vía Google Meet (En Directo)</span>
                <span>• 50% Beca Congelada</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link
                to="/certificacion-pilates/webinar"
                className="px-6 py-3.5 rounded-full bg-white text-neutral-900 text-xs font-bold uppercase tracking-wider text-center hover:bg-neutral-100 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Apartar Mi Lugar Gratis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full border border-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider text-center hover:border-neutral-500 transition-colors"
              >
                + Google Calendar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Switcher Bar */}
      <section id="capability-workspace" className="px-6 max-w-7xl mx-auto mb-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/90 pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            // SELECCIONA CAPACIDAD:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('sedes')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'sedes'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Sedes & Fechas
            </button>
            <button
              onClick={() => setActiveTab('curriculo')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'curriculo'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Plan de 100 Horas
            </button>
            <button
              onClick={() => setActiveTab('comunidad')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'comunidad'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Comunidad Whop en Vivo
            </button>
            <button
              onClick={() => setActiveTab('oferta')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'oferta'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Colegiatura & 50% OFF
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'faq'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Preguntas Frecuentes
            </button>
          </div>
        </div>
      </section>

      {/* Capability Workspace Panels */}
      <main className="px-6 max-w-7xl mx-auto pb-24">
        {/* PANEL 1: SEDES & FECHAS */}
        {activeTab === 'sedes' && (
          <div className="space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                  Próximas Cohortes Presenciales en México
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Grupos reducidos con un Reformer individual asignado por alumna (máximo 12 lugares).
                </p>
              </div>

              {/* City Pill Switcher */}
              <div className="flex items-center gap-2 p-1.5 bg-white border border-neutral-200 rounded-full">
                <button
                  onClick={() => setSelectedCity('queretaro')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                    selectedCity === 'queretaro' ? 'bg-[#111111] text-white font-bold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Querétaro (Nov 2026)
                </button>
                <button
                  onClick={() => setSelectedCity('monterrey')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                    selectedCity === 'monterrey' ? 'bg-[#111111] text-white font-bold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Monterrey (Dic–Ene)
                </button>
                <button
                  onClick={() => setSelectedCity('cdmx')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                    selectedCity === 'cdmx' ? 'bg-[#111111] text-white font-bold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  CDMX (Santa Fe)
                </button>
              </div>
            </div>

            {/* Selected City Detail Card */}
            {selectedCity === 'cdmx' ? (
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-12 shadow-sm">
                <div className="max-w-3xl">
                  <span className="inline-block px-3 py-1 bg-neutral-900 text-white rounded-full font-mono text-[10px] uppercase tracking-wider mb-4">
                    HOSTING OFICIAL MERRITHEW® · SANTA FE, CDMX
                  </span>
                  <h3 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                    Certificación STOTT PILATES® en Ciudad de México
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-8">
                    Para alumnas en CDMX, ofrecemos la ruta STOTT PILATES® impartida por {STOTT_PROVIDER.name} en{' '}
                    {STOTT_VENUE.name} (Santa Fe). Programas de Intensive Reformer (125h) e Intensive Mat-Plus™
                    con validez internacional en más de 100 países.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {STOTT_COURSES.map(course => (
                      <div key={course.id} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                        <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">{course.level}</div>
                        <div className="font-bold text-neutral-900 mb-2">{course.name}</div>
                        <div className="text-xl font-bold text-neutral-900 mb-1">
                          {course.price ? formatMXN(course.price) : 'Por anunciar'}
                        </div>
                        <div className="text-xs text-neutral-500">{course.hours.total} horas totales · {course.modality}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={PRIMARY_WHATSAPP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800"
                    >
                      Inscribirme a STOTT CDMX
                    </a>
                    <Link
                      to="/certificacion-pilates/cdmx"
                      className="px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 text-xs font-mono uppercase tracking-wider hover:border-neutral-900"
                    >
                      Ver Detalles Sede CDMX →
                    </Link>
                  </div>
                </div>
              </div>
            ) : currentCohort ? (
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-12 shadow-sm">
                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold uppercase tracking-wider">
                        50% OFF LISTA DE ESPERA
                      </span>
                      <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] uppercase tracking-wider">
                        12 CUPOS DISPONIBLES
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
                      Cohorte {currentCohort.cityName} · {currentCohort.periodLabel}
                    </h3>

                    <p className="text-neutral-600 leading-relaxed">
                      Programa intensivo presencial de 100 horas en 4 fines de semana de inmersión práctica
                      total ({currentCohort.fullDatesLabel}) en {currentCohort.location.name} (
                      {currentCohort.location.neighborhood}). Cada alumna cuenta con un Reformer profesional
                      CAMA individual para toda la formación.
                    </p>

                    {/* Weekend Cards */}
                    <div className="grid sm:grid-cols-2 gap-3.5 pt-4">
                      {currentCohort.weekends.map(w => (
                        <div key={w.weekendNumber} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                            Fin de Semana {w.weekendNumber} · {w.dates}
                          </div>
                          <div className="font-bold text-sm text-neutral-900 mb-1">{w.title}</div>
                          <div className="text-xs text-neutral-600 leading-normal">{w.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-[#F8F8F6] border border-neutral-300 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                        // MATRÍCULA & BECA 50%
                      </div>
                      <div className="text-sm text-neutral-400 line-through">
                        ${currentCohort.regularPrice.toLocaleString('es-MX')} MXN
                      </div>
                      <div className="text-4xl font-bold text-neutral-900 tracking-tight mt-1">
                        ${currentCohort.discountedPrice.toLocaleString('es-MX')} MXN
                      </div>
                      <div className="text-xs text-emerald-800 font-medium mt-1">
                        Ahorro del 50% ($19,900 MXN) reservando con anticipo
                      </div>

                      <div className="my-6 p-4 rounded-xl bg-white border border-neutral-200 space-y-2">
                        <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                          Apartado Oficial de Lugar:
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                          ${currentCohort.depositPrice.toLocaleString('es-MX')} MXN
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-tight">
                          Congela el precio de $19,900 y asegura tu lugar en la sede.
                        </p>
                      </div>

                      <ul className="space-y-2 text-xs text-neutral-600 mb-6 font-mono">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>56h Presenciales + 44h Prácticas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Reformer individual exclusivo</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Acceso vitalicio a Whop</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                        className="w-full py-3.5 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm text-center"
                      >
                        Apartar Lugar (${currentCohort.depositPrice.toLocaleString('es-MX')} MXN)
                      </button>

                      <Link
                        to={`/certificacion-pilates/${selectedCity}`}
                        className="block w-full py-2.5 rounded-full border border-neutral-300 text-neutral-700 text-xs font-mono uppercase tracking-wider hover:border-neutral-900 text-center"
                      >
                        Ver Convocatoria {currentCohort.cityName} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* City Grid Overview */}
            <div className="pt-8 border-t border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Directorio de Sedes de Certificación</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {CITIES_LIST.map(c => (
                  <div key={c.key} className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold mb-1">
                      {c.badge}
                    </div>
                    <div className="font-bold text-neutral-900 mb-1">{c.name}</div>
                    <div className="text-xs text-neutral-500 mb-3">{c.dates}</div>
                    <Link
                      to={`/certificacion-pilates/${c.key}`}
                      className="text-xs font-mono uppercase tracking-wider text-neutral-700 hover:text-black font-semibold flex items-center gap-1"
                    >
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: PLAN DE ESTUDIOS (100 HORAS) */}
        {activeTab === 'curriculo' && (
          <div className="space-y-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                // MAPA CURRICULAR OFICIAL
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                Estructura de Formación (100 Horas Totales)
              </h2>
              <p className="text-neutral-600 max-w-3xl mt-2 leading-relaxed">
                Diseñado para formar instructoras seguras, con criterio biomecánico para adaptar ejercicios
                a cualquier patología o limitación anatómica. 56 horas presenciales intensivas + 44 horas de
                práctica guiada y observación en videoteca digital.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 1 · 14H PRESENCIALES
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Anatomía Funcional Aplicada & Repertorio Esencial
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Biomecánica de la pelvis, caja torácica y columna. Principios de respiración, centrado y
                  ejecución técnica de los 35 ejercicios esenciales (Footwork, Bridging, Feet in Straps,
                  Abdominal Series).
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Ajuste de barra de pies y resortes según antropometría</li>
                  <li>• Análisis de vectores de fuerza y cargas en decúbito supino</li>
                  <li>• Identificación de compensaciones lumbo-pélvicas</li>
                </ul>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 2 · 14H PRESENCIALES
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Repertorio Intermedio, Dinámica de Carro & Cargas
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Transiciones fluidas, trabajo en planos sagital y coronal, manejo de resistencia de
                  resortes según biotipo corporal y progresiones del repertorio intermedio (Short Box, Long
                  Stretch, Stomach Massage).
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Coordinación neuromuscular en cadena cinética abierta y cerrada</li>
                  <li>• Dinámica de inercia y control del retroceso del carro</li>
                  <li>• Modulaciones de tempo y ritmo de clase</li>
                </ul>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 3 · 14H PRESENCIALES
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Modificaciones Clínicas, Patologías & Poblaciones Especiales
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Adaptaciones biomecánicas precisas para alumnos con dolor lumbar, hernias discales,
                  escoliosis, hipermovilidad, embarazo y adultos mayores en Reformer.
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Descompresión espinal asistida por muelles</li>
                  <li>• Protocolos contraindicados en hiperlordosis y cifosis</li>
                  <li>• Posiciones seguras para segundo y tercer trimestre de gestación</li>
                </ul>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 4 · 14H PRESENCIALES
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Metodología de Cueing, Práctica Supervisada & Certificación
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Comandos verbales de alta precisión, ajustes táctiles no invasivos, diseño de planes de
                  clase privados y grupales, examen práctico y acreditación oficial.
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Simulación de clases con retroalimentación en directo</li>
                  <li>• Examen teórico-práctico ante docentes certificadas</li>
                  <li>• Entrega de constancia oficial de 100 horas y vinculación a estudios</li>
                </ul>
              </div>
            </div>

            {/* Practical Proof Banner */}
            <div className="p-8 rounded-[28px] bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold mb-2">¿Quieres consultar el desglose completo del temario?</h4>
                <p className="text-neutral-400 text-sm max-w-xl">
                  Descarga la guía curricular en PDF con los 70+ ejercicios desglosados y criterios de evaluación.
                </p>
              </div>
              <a
                href={PRIMARY_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 shrink-0"
              >
                Solicitar Temario Completo en PDF →
              </a>
            </div>
          </div>
        )}

        {/* PANEL 3: COMUNIDAD WHOP EN VIVO */}
        {activeTab === 'comunidad' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                  // RED DE INSTRUCTORAS & SOPORTE CLÍNICO
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                  Comunidad Oficial de Pilates Reformer México
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Espacio sincronizado con Whop para resolver dudas clínicas, debatir biomecánica y conectar con estudios.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={WHOP_CONFIG.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-white border border-neutral-300 text-xs font-mono uppercase tracking-wider text-neutral-700 hover:border-neutral-900 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Whop Directo</span>
                </a>
              </div>
            </div>

            {/* Enrollment Status Indicator */}
            {enrollmentData ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <div className="text-xs font-mono text-emerald-900 font-bold uppercase tracking-wider">
                      Alumna Verificada: {enrollmentData.customerName || 'Estudiante'}
                    </div>
                    <div className="text-xs text-emerald-700">
                      Membresía activa en el campus virtual de 100 horas.
                    </div>
                  </div>
                </div>
                <Link
                  to="/app"
                  className="px-4 py-2 rounded-full bg-emerald-700 text-white text-xs font-mono uppercase tracking-wider hover:bg-emerald-800"
                >
                  Ir al Campus →
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-600 font-mono">
                <span>¿Ya eres alumna inscrita en la certificación? Ingresa para sincronizar tus canales privados.</span>
                <Link to="/app" className="underline text-neutral-900 font-semibold hover:text-black">
                  Acceder con Whop →
                </Link>
              </div>
            )}

            {/* Channel Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider mr-2">Canales:</span>
              <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700">
                #anuncios-oficiales
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700">
                #preguntas-laura-munive
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700">
                #casos-clinicos-columna
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700">
                #bolsa-de-trabajo
              </span>
            </div>

            {/* Native Forum Reader Component */}
            <WhopForumReader />

            {/* Ethics & Professional Code */}
            <div className="p-8 rounded-[28px] bg-white border border-neutral-200/90 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-neutral-900" />
                <h3 className="text-lg font-bold text-neutral-900">Compromiso Deontológico de la Red</h3>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                Todas las instructoras formadas en CAMA Pilates operan bajo el principio de no daño,
                evaluación postural rigurosa y derivación oportuna a profesionales médicos cuando un cuadro
                clínico excede el alcance del método Pilates.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-100">
                <div>✓ Respeto a las curvas fisiológicas</div>
                <div>✓ Comunicación pedagógica no invasiva</div>
                <div>✓ Actualización clínica continua</div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: COLEGIATURA & OFERTA 50% OFF */}
        {activeTab === 'oferta' && (
          <div className="space-y-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                // MATRÍCULA OFICIAL & BONOS
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                La Oferta Completa de Certificación (50% OFF)
              </h2>
              <p className="text-neutral-500 text-sm mt-1 max-w-2xl">
                Diseñada para que obtengas el retorno de tu inversión desde tu primer mes de clases como instructora.
              </p>
            </div>

            {/* 5-Part Offer Stack */}
            <div className="bg-white border border-neutral-200/90 rounded-[28px] p-8 md:p-10 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Componentes & Bonos Incluidos
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Valor Real
                </span>
              </div>

              <div className="divide-y divide-neutral-100 space-y-4">
                {WHOP_CONFIG.offerStack.bonuses.map((bonus, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900 text-sm md:text-base">{bonus.title}</h4>
                          {bonus.isCore && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111111] text-white uppercase">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">{bonus.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm text-neutral-400 line-through">
                        ${bonus.value.toLocaleString('es-MX')} MXN
                      </div>
                      <div className="text-xs font-mono text-emerald-700 font-semibold">Incluido</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-6 border-t border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-50 p-6 rounded-2xl">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">Valor Total de Mercado</div>
                  <div className="text-2xl font-mono text-neutral-400 line-through">
                    ${WHOP_CONFIG.offerStack.totalValue.toLocaleString('es-MX')} MXN
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold">
                    Precio Lista de Espera (50% Descuento)
                  </div>
                  <div className="text-4xl font-bold text-neutral-900 tracking-tight">
                    ${WHOP_CONFIG.offerStack.waitlistPrice.toLocaleString('es-MX')} MXN
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    O aparta tu cupo hoy con solo <strong>${WHOP_CONFIG.offerStack.depositPrice.toLocaleString('es-MX')} MXN</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                  className="py-4 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md text-center flex items-center justify-center gap-2"
                >
                  <span>Apartar Mi Cupo (${WHOP_CONFIG.offerStack.depositPrice.toLocaleString('es-MX')} MXN)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                  className="py-4 rounded-full bg-white border-2 border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors text-center"
                >
                  Pagar Colegiatura Completa (${WHOP_CONFIG.offerStack.waitlistPrice.toLocaleString('es-MX')} MXN)
                </button>
              </div>
            </div>

            {/* 14-Day Clinical Guarantee */}
            <div className="p-8 rounded-[28px] bg-white border border-neutral-200/90 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-neutral-900">Garantía de Satisfacción Clínica (14 Días)</h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                  Si tras completar el primer fin de semana presencial consideras que el rigor biomecánico,
                  el equipo individual o la pedagogía de las docentes no superan tus expectativas, te reembolsamos
                  el 100% de tu pago sin preguntas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 5: PREGUNTAS FRECUENTES */}
        {activeTab === 'faq' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2 mb-10">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                // RESOLUCIÓN DE DUDAS
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Preguntas Frecuentes sobre la Certificación
              </h2>
              <p className="text-neutral-500 text-sm">
                Información transparente sobre requisitos, avales, máquina exclusiva y pagos.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Cómo funciona la certificación de 100 horas en Pilates Reformer?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  El programa consta de 56 horas presenciales intensivas distribuidas en 4 fines de semana prácticos
                  (sábados y domingos de 9:00 AM a 4:30 PM), más 44 horas de observación guiada, práctica personal
                  y videoteca HD en el campus virtual Whop, sumando 100 horas certificadas oficiales.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Tengo un Reformer individual asignado o se comparte entre alumnas?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Cada participante cuenta con un Reformer profesional exclusivo durante todo el curso presencial.
                  Limitamos el cupo a un máximo estricto de 12 personas por sede para garantizar cero tiempos muertos
                  y máxima práctica supervisada.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Cómo aseguro mi lugar con el 50% de descuento ($19,900 MXN)?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Puedes congelar tu descuento y asegurar 1 de los 12 cupos realizando un anticipo de $4,500 MXN
                  a través de nuestra pasarela oficial de Whop (tarjeta de crédito/débito o transferencia) o liquidando
                  la colegiatura completa de $19,900 MXN.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Qué validez tiene el certificado al concluir?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  El certificado avala 100 horas profesionales de formación biomecánica, repertorio esencial e
                  intermedio, adaptaciones para patologías de columna y docencia práctica, con validez curricular
                  ante estudios de Pilates en todo México y Latinoamérica.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Qué pasa si tengo dudas después de que termine el curso presencial?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Cuentas con acceso vitalicio a la comunidad de CAMA Pilates en Whop y a los foros clínicos con las
                  docentes Gabi y Laura Munive para resolver dudas de tus alumnos, planificar clases y consultar la
                  bolsa de trabajo.
                </p>
              </div>
            </div>

            <div className="text-center pt-6">
              <a
                href={PRIMARY_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs font-mono uppercase tracking-wider hover:border-neutral-900"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>¿Tienes otra pregunta? Escríbenos por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Cross-sell: Equipment for Future Studios */}
      <section className="py-20 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="block text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">
                // BENEFICIO EXCLUSIVO DE GRADUADAS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mb-6">
                Equipa Tu Futuro Estudio con Precios Preferenciales
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Al graduarte de la certificación de 100 horas, accedes a un 15% de descuento directo en la
                compra de camas de Pilates Reformer profesionales CAMA con madera noble, cuero genuino y resortes
                alemanes, además de financiamiento a 12 meses sin intereses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/packs/estudio"
                  className="px-6 py-3.5 bg-[#111111] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Ver Paquetes de Estudio
                </Link>
                <Link
                  to="/shop"
                  className="px-6 py-3.5 border border-neutral-300 text-neutral-800 rounded-full text-xs font-semibold uppercase tracking-wider hover:border-neutral-900 transition-colors"
                >
                  Explorar Reformers
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F8F8F6] p-6 rounded-2xl border border-neutral-200">
                <div className="text-3xl font-mono font-bold text-neutral-900 mb-1">15%</div>
                <p className="text-xs text-neutral-500">Descuento para graduadas en reformers</p>
              </div>
              <div className="bg-[#F8F8F6] p-6 rounded-2xl border border-neutral-200">
                <div className="text-3xl font-mono font-bold text-neutral-900 mb-1">12 MSI</div>
                <p className="text-xs text-neutral-500">Financiamiento disponible en México</p>
              </div>
              <div className="bg-[#F8F8F6] p-6 rounded-2xl border border-neutral-200">
                <div className="text-3xl font-mono font-bold text-neutral-900 mb-1">2+</div>
                <p className="text-xs text-neutral-500">Envío e instalación preferencial</p>
              </div>
              <div className="bg-[#F8F8F6] p-6 rounded-2xl border border-neutral-200">
                <div className="text-3xl font-mono font-bold text-neutral-900 mb-1">1 Año</div>
                <p className="text-xs text-neutral-500">Garantía completa en estructura y muelles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-[#F8F8F6] py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-neutral-500 font-mono">
          <div>
            © {new Date().getFullYear()} CAMA Pilates · Formación Biomecánica Profesional
          </div>
          <div className="flex flex-wrap gap-6">
            <Link to="/certificacion-pilates" className="hover:text-black">Certificación</Link>
            <Link to="/app" className="hover:text-black">Campus Virtual</Link>
            <Link to="/shop" className="hover:text-black">Tienda</Link>
            <Link to="/legal/terminos" className="hover:text-black">Términos</Link>
            <Link to="/legal/privacidad" className="hover:text-black">Privacidad</Link>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Conversion Bar for Mobile & Quick Action */}
      <aside aria-label="Apartado de cupo" className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-40 md:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Anticipo de Cupo</div>
            <div className="text-base font-bold text-neutral-900">$4,500 MXN</div>
          </div>
          <button
            onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
            className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Apartar Cupo →
          </button>
        </div>
      </aside>

      {/* Whop Checkout Modal */}
      <WhopCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        planId={checkoutPlanId}
      />

      {/* PreRegistration Modal Fallback */}
      <PreRegistrationModal
        isOpen={preRegModalOpen}
        onClose={() => setPreRegModalOpen(false)}
        source="/certificacion-pilates"
      />
    </div>
  );
};

export default CertificacionPilates;
