import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
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
  ChevronRight,
  Phone,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { EditorialFeatureCards } from '@/components/webapp/EditorialFeatureCards';
import { WhopForumReader } from '@/components/webapp/WhopForumReader';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import {
  CERTIFICATION_COHORTS,
  WEBINAR_INFO,
  getGoogleCalendarUrl,
  generateIcsContent
} from '@/content/certification/cohortsData';
import {
  STOTT_COURSES,
  STOTT_PROVIDER,
  STOTT_VENUE,
  formatMXN
} from '@/content/certification/stottCdmx';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';

type CapabilityTab = 'curriculo' | 'comunidad' | 'oferta' | 'faq';

const PRIMARY_WHATSAPP_BASE = 'https://wa.me/525548468190?text=';
const PRIMARY_WHATSAPP = `${PRIMARY_WHATSAPP_BASE}${encodeURIComponent(
  'Hola, me interesa información sobre el Curso Básico (28h · $25,000 MXN) y la Certificación Completa (48h · $38,000 MXN) en Pilates Reformer.'
)}`;

export const CertificacionPilates: React.FC = () => {
  const origin = getOrigin();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as CapabilityTab) || 'curriculo';

  const [activeTab, setActiveTab] = useState<CapabilityTab>(
    ['curriculo', 'comunidad', 'oferta', 'faq'].includes(initialTab) ? initialTab : 'curriculo'
  );
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const [preRegModalOpen, setPreRegModalOpen] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  // Webinar & Whitelist Fast-Registration State
  const registerMutation = useMutation(api.certificationPreRegistrations.registerWebinarWaitlist);

  const [selectedCohort, setSelectedCohort] = useState<'queretaro-nov-2026' | 'monterrey-dec-jan-2026-2027' | 'both'>('queretaro-nov-2026');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer to September 26, 2026 11:00 AM CST
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date('2026-09-26T11:00:00-06:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSubmitWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre, correo y teléfono de WhatsApp.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Por favor ingresa un número de WhatsApp válido de 10 dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (registerMutation) {
        await registerMutation({
          fullName,
          email,
          phone: phoneDigits,
          cohort: selectedCohort,
          experienceLevel: 'some-experience',
          source: 'certificacion-pilates-hero-whitelist',
        });
      }
      setIsRegistered(true);
    } catch (err: unknown) {
      console.warn('Convex submission fallback:', err);
      setIsRegistered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadIcs = () => {
    const ics = generateIcsContent();
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Masterclass-Certificacion-Pilates-26Sep.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareWaUrl = `https://wa.me/${WEBINAR_INFO.whatsappSupportNumber}?text=${encodeURIComponent(
    `Hola Gabi y Laura, me registré a la lista de espera para la certificación en Pilates Reformer. Mi nombre es ${fullName || 'aspirante'} y me interesa la sede de ${
      selectedCohort === 'queretaro-nov-2026'
        ? 'Querétaro (Noviembre 2026)'
        : selectedCohort === 'monterrey-dec-jan-2026-2027'
        ? 'Monterrey (Dic 2026 – Ene 2027)'
        : 'Querétaro y Monterrey'
    }. Quiero información sobre el Curso Básico (28h · $25,000 MXN) y la Certificación Completa (48h · $38,000 MXN).`
  )}`;

  const title = 'Certificación Profesional de Pilates Reformer en México | Querétaro y Monterrey (28h Básico / 48h Completo)';
  const desc =
    'Certificación profesional en Pilates Reformer: Curso Básico (28h · $25,000 MXN) y Certificación Completa (48h · $38,000 MXN). Querétaro (Nov 2026) y Monterrey (Dic-Ene 2027). 1:1 Reformer individual con Gabi y Laura Munive.';

  const courseSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Certificación Profesional de Instructor de Pilates Reformer — Querétaro',
      description: 'Formación en Pilates Reformer en Querétaro: Curso Básico (28h) y Certificación Completa (48h). 4 fines de semana en Noviembre 2026. Respaldo curricular CAMA Pilates.',
      provider: {
        '@type': 'Organization',
        name: 'CAMA Pilates',
        url: origin,
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Curso Básico Reformer (28 Horas)',
          price: '25000',
          priceCurrency: 'MXN',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        },
        {
          '@type': 'Offer',
          name: 'Certificación Completa Reformer (48 Horas)',
          price: '38000',
          priceCurrency: 'MXN',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        },
      ],
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
      description: 'Formación en Pilates Reformer en Monterrey: Curso Básico (28h) y Certificación Completa (48h) en San Pedro Garza García. Diciembre 2026 – Enero 2027.',
      provider: {
        '@type': 'Organization',
        name: 'CAMA Pilates',
        url: origin,
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Curso Básico Reformer (28 Horas)',
          price: '25000',
          priceCurrency: 'MXN',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        },
        {
          '@type': 'Offer',
          name: 'Certificación Completa Reformer (48 Horas)',
          price: '38000',
          priceCurrency: 'MXN',
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        },
      ],
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

  const webinarSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: WEBINAR_INFO.title,
    description: WEBINAR_INFO.subtitle,
    startDate: WEBINAR_INFO.isoDateTime,
    endDate: WEBINAR_INFO.isoEndDateTime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `${origin}/certificacion-pilates/webinar`,
    },
    performer: WEBINAR_INFO.hosts.map((h) => ({
      '@type': 'Person',
      name: h.name,
      jobTitle: h.role,
    })),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'MXN',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-01-01',
      url: `${origin}/certificacion-pilates/webinar`,
    },
    organizer: {
      '@type': 'Organization',
      name: 'CAMA Pilates',
      url: origin,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuáles son las modalidades y costos de la formación en Pilates Reformer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ofrecemos dos rutas formativas: el Curso Básico de 28 horas por $25,000 MXN (2 fines de semana con anatomía funcional y repertorio esencial e intermedio), y la Certificación Completa de 48 horas por $38,000 MXN (4 fines de semana con modificaciones clínicas, patologías de columna, metodología de cueing, examen y aval profesional).',
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
        name: '¿Cómo puedo apartar mi lugar para el curso de 28h o 48h?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes asegurar tu lugar realizando una pre-reserva oficial de solo $400 MXN a través de nuestra pasarela de Whop (tarjeta o transferencia) para congelar tu cupo (máximo 12 lugares por sede).',
        },
      },
      {
        '@type': 'Question',
        name: '¿Quiénes son las docentes que imparten la certificación?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La formación es dirigida personalmente por las Master Trainers Gabi y Laura Munive, con más de 400 instructores formados en biomecánica y desarrollo de estudios en México.',
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
        <script type="application/ld+json">{JSON.stringify(webinarSchema)}</script>
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
              [ 28H BÁSICO · 48H COMPLETO ]
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
              <span>Pre-reservar ($400 MXN)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* TOP HERO: MASTERCLASS WEBINAR & COURSE WHITELIST SIGNUP (QUERÉTARO & MONTERREY) */}
      <section className="pt-12 pb-16 px-6 max-w-7xl mx-auto border-b border-neutral-200/80">
        {/* Micro Monospace Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 font-mono text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-700" />
            MASTERCLASS EN VIVO · SÁBADO 26 SEPTIEMBRE 11:00 AM CST
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-mono text-[11px] uppercase tracking-wider">
            [ QUERÉTARO · MONTERREY ]
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold uppercase tracking-wider">
            28H BÁSICO ($25,000) · 48H COMPLETO ($38,000)
          </span>
        </div>

        {/* Display Typography */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F0F0F] max-w-5xl leading-[1.04] mb-6">
          Formación profesional en Pilates Reformer.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-neutral-600 font-normal max-w-3xl leading-relaxed mb-10">
          Convocatorias presenciales en <strong>Querétaro (Noviembre 2026)</strong> y <strong>Monterrey (Dic 2026 – Ene 2027)</strong>.
          Máquina individual asignada por alumna, biomecánica clínica y mentoría directa con las Master Trainers{' '}
          <strong>Gabi</strong> y <strong>Laura Munive</strong>.
        </p>

        {/* 2-Column Webinar & Whitelist Interactive Card */}
        <div className="bg-gradient-to-br from-[#1E1B18] via-[#24201D] to-[#141210] rounded-[32px] p-6 sm:p-8 md:p-12 text-white shadow-2xl border border-neutral-800 relative overflow-hidden mb-12">
          {/* Subtle warm glow background */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Webinar Pitch & Countdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs uppercase tracking-wider border border-amber-400/30">
                <Video className="w-3.5 h-3.5" />
                <span>Webinar Gratuito de Orientación · Vía Google Meet</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Elige entre Curso Básico (28h) o Certificación Completa (48h) con cupos limitados.
              </h2>

              <p className="text-sm md:text-base text-neutral-300 leading-relaxed font-light">
                Únete a la sesión en directo con <strong>Gabi</strong> y <strong>Laura Munive</strong> el{' '}
                <strong>sábado 26 de septiembre a las 11:00 AM CST</strong>. Conoce a detalle el mapa de 28h y 48h,
                resuelve tus dudas y accede antes que nadie a los <strong>12 cupos exclusivos por sede</strong>:{' '}
                <strong>Curso Básico (28h · $25,000 MXN)</strong> o <strong>Certificación Completa (48h · $38,000 MXN)</strong>.
              </p>

              {/* Countdown Clocks */}
              <div className="pt-2">
                <div className="text-[11px] font-mono text-amber-400/90 uppercase tracking-widest mb-2 font-semibold">
                  // TIEMPO RESTANTE PARA LA MASTERCLASS:
                </div>
                <div className="grid grid-cols-4 gap-2.5 max-w-md">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center">
                    <span className="block text-2xl md:text-3xl font-mono font-bold text-white">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Días</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center">
                    <span className="block text-2xl md:text-3xl font-mono font-bold text-white">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Horas</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center">
                    <span className="block text-2xl md:text-3xl font-mono font-bold text-white">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Min</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center">
                    <span className="block text-2xl md:text-3xl font-mono font-bold text-white">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Seg</span>
                  </div>
                </div>
              </div>

              {/* Fast-action CTA and WhatsApp */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                  className="px-6 py-3 rounded-full bg-white text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors shadow-lg flex items-center gap-2"
                >
                  <span>Pre-reservar Cupo Inmediato ($400 MXN)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={PRIMARY_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full border border-white/20 text-neutral-200 text-xs font-mono uppercase tracking-wider hover:border-white/50 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dudas por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Whitelist Signup Form */}
            <div className="lg:col-span-5">
              <div className="bg-[#2C2724] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-xl">
                {!isRegistered ? (
                  <form onSubmit={handleSubmitWebinar} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-amber-300 uppercase tracking-wider font-semibold">
                          Paso 1 · Sede de tu Interés
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">12 cupos máx</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCohort('queretaro-nov-2026')}
                          className={`px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-left transition-all border ${
                            selectedCohort === 'queretaro-nov-2026'
                              ? 'bg-amber-400/20 border-amber-400 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          <div className="font-bold">Querétaro</div>
                          <div className="text-[10px] text-neutral-400">7–29 Nov 2026</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedCohort('monterrey-dec-jan-2026-2027')}
                          className={`px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-left transition-all border ${
                            selectedCohort === 'monterrey-dec-jan-2026-2027'
                              ? 'bg-amber-400/20 border-amber-400 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/30'
                          }`}
                        >
                          <div className="font-bold">Monterrey</div>
                          <div className="text-[10px] text-neutral-400">Dic 26 – Ene 27</div>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ej. Sofía Morales"
                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="sofia@ejemplo.com"
                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                          WhatsApp (10 Dígitos)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="55 1234 5678"
                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Registrando...' : 'Apartar Mi Lugar Gratis en el Webinar →'}</span>
                    </button>

                    <div className="text-[11px] font-mono text-center text-neutral-400">
                      ✓ Acceso 100% Gratuito vía Google Meet · Beca 50% garantizada
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5 text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">¡Registro Confirmado!</h3>
                      <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
                        Estás en la lista de espera prioritaria para{' '}
                        <strong>
                          {selectedCohort === 'queretaro-nov-2026'
                            ? 'Querétaro'
                            : selectedCohort === 'monterrey-dec-jan-2026-2027'
                            ? 'Monterrey'
                            : 'Querétaro y Monterrey'}
                        </strong>
                        . Te enviaremos el enlace de Google Meet para el sábado 26 de septiembre a las 11:00 AM CST.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Agregar a Google Calendar</span>
                      </a>

                      <button
                        onClick={handleDownloadIcs}
                        className="w-full py-2 rounded-full text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                      >
                        Descargar archivo .ICS para Apple / Outlook
                      </button>

                      <a
                        href={shareWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Confirmar con Gabi y Laura por WhatsApp</span>
                      </a>

                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenCheckout(selectedCohort === 'monterrey-dec-jan-2026-2027' ? WHOP_CONFIG.plans.apartadoMonterrey.id : WHOP_CONFIG.plans.apartadoQueretaro.id)}
                          className="w-full py-3 rounded-full bg-white text-neutral-900 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <span>Pre-reservar Cupo Ahora ($400 MXN)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Value Proof Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
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

      {/* THE 2 FLAGSHIP COHORTS SIDE-BY-SIDE: QUERÉTARO & MONTERREY */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            // CONVOCATORIAS OFICIALES 2026–2027
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-2 mb-4">
            Sedes Presenciales: Querétaro y Monterrey
          </h2>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
            Cada sede cuenta con un máximo estricto de 12 lugares para garantizar un Reformer profesional
            CAMA individual por alumna durante toda la formación práctica, sin turnos rotativos ni tiempos muertos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sede 1: Querétaro */}
          <div className="bg-white border-2 border-neutral-900 rounded-[32px] p-8 md:p-10 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#111111] text-white px-5 py-1.5 rounded-bl-2xl font-mono text-[11px] font-bold uppercase tracking-wider">
              Noviembre 2026
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold uppercase tracking-wider">
                  50% OFF · 12 Cupos
                </span>
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] uppercase tracking-wider">
                  Juriquilla
                </span>
              </div>

              <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                Querétaro · Noviembre 2026
              </h3>
              <p className="text-xs font-mono text-neutral-500 mb-6 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                <span>{CERTIFICATION_COHORTS.queretaro.location.name} · {CERTIFICATION_COHORTS.queretaro.location.neighborhood}</span>
              </p>

              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                4 fines de semana intensivos de inmersión práctica total ({CERTIFICATION_COHORTS.queretaro.fullDatesLabel}).
                Sábados y domingos de 9:00 AM a 4:30 PM (56 horas de contacto presencial + 44 horas en campus virtual).
              </p>

              {/* 4 Weekends pills */}
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {CERTIFICATION_COHORTS.queretaro.weekends.map((w) => (
                  <div key={w.weekendNumber} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      FDS {w.weekendNumber} · {w.dates}
                    </div>
                    <div className="font-bold text-xs text-neutral-900 mt-0.5">{w.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 line-through">
                    ${CERTIFICATION_COHORTS.queretaro.regularPrice.toLocaleString('es-MX')} MXN
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                    ${CERTIFICATION_COHORTS.queretaro.discountedPrice.toLocaleString('es-MX')} MXN
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                    Apartado de Cupo
                  </div>
                  <div className="text-xl font-bold text-neutral-900">
                    ${CERTIFICATION_COHORTS.queretaro.depositPrice.toLocaleString('es-MX')} MXN
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartadoQueretaro.id)}
                  className="py-3 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm text-center"
                >
                  Pre-reservar Querétaro ($400 MXN)
                </button>
                <Link
                  to="/certificacion-pilates/queretaro"
                  className="py-3 rounded-full border border-neutral-300 text-neutral-800 text-xs font-mono uppercase tracking-wider hover:border-neutral-900 text-center transition-colors"
                >
                  Ver Convocatoria Querétaro →
                </Link>
              </div>
            </div>
          </div>

          {/* Sede 2: Monterrey */}
          <div className="bg-white border-2 border-neutral-900 rounded-[32px] p-8 md:p-10 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#111111] text-white px-5 py-1.5 rounded-bl-2xl font-mono text-[11px] font-bold uppercase tracking-wider">
              Dic 2026 – Ene 2027
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[11px] font-semibold uppercase tracking-wider">
                  50% OFF · 12 Cupos
                </span>
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] uppercase tracking-wider">
                  San Pedro Garza García
                </span>
              </div>

              <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                Monterrey · Dic 2026 – Ene 2027
              </h3>
              <p className="text-xs font-mono text-neutral-500 mb-6 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                <span>{CERTIFICATION_COHORTS.monterrey.location.name} · {CERTIFICATION_COHORTS.monterrey.location.neighborhood}</span>
              </p>

              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                4 fines de semana intensivos de inmersión práctica total ({CERTIFICATION_COHORTS.monterrey.fullDatesLabel}).
                Sábados y domingos de 9:00 AM a 4:30 PM (56 horas de contacto presencial + 44 horas en campus virtual).
              </p>

              {/* 4 Weekends pills */}
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {CERTIFICATION_COHORTS.monterrey.weekends.map((w) => (
                  <div key={w.weekendNumber} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      FDS {w.weekendNumber} · {w.dates}
                    </div>
                    <div className="font-bold text-xs text-neutral-900 mt-0.5">{w.title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 line-through">
                    ${CERTIFICATION_COHORTS.monterrey.regularPrice.toLocaleString('es-MX')} MXN
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                    ${CERTIFICATION_COHORTS.monterrey.discountedPrice.toLocaleString('es-MX')} MXN
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                    Apartado de Cupo
                  </div>
                  <div className="text-xl font-bold text-neutral-900">
                    ${CERTIFICATION_COHORTS.monterrey.depositPrice.toLocaleString('es-MX')} MXN
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartadoMonterrey.id)}
                  className="py-3 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm text-center"
                >
                  Pre-reservar Monterrey ($400 MXN)
                </button>
                <Link
                  to="/certificacion-pilates/monterrey"
                  className="py-3 rounded-full border border-neutral-300 text-neutral-800 text-xs font-mono uppercase tracking-wider hover:border-neutral-900 text-center transition-colors"
                >
                  Ver Convocatoria Monterrey →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE 3-COLOR EDITORIAL CARDS */}
      <section className="px-6 max-w-7xl mx-auto mb-16">
        <EditorialFeatureCards
          activeTab={activeTab === 'curriculo' ? 'campus' : activeTab === 'comunidad' ? 'comunidad' : 'webinar'}
          onSelectTab={(tab) => {
            if (tab === 'campus') handleSelectTab('curriculo');
            else if (tab === 'comunidad') handleSelectTab('comunidad');
            else if (tab === 'webinar') handleSelectTab('oferta');
          }}
        />
      </section>

      {/* CAPABILITY SWITCHER BAR */}
      <section id="capability-workspace" className="px-6 max-w-7xl mx-auto mb-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/90 pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            // PROFUNDIZAR EN EL PROGRAMA:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('curriculo')}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'curriculo'
                  ? 'bg-[#111111] text-white font-bold shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              • Plan Curricular (28h / 48h)
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
              • Colegiatura & Planes
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

      {/* CAPABILITY WORKSPACE PANELS */}
      <main className="px-6 max-w-7xl mx-auto pb-16">
        {/* PANEL 1: PLAN DE ESTUDIOS (28H / 48H) */}
        {activeTab === 'curriculo' && (
          <div className="space-y-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                // MAPA CURRICULAR OFICIAL
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                Estructura de Formación (28h Básico · 48h Completo)
              </h2>
              <p className="text-neutral-600 max-w-3xl mt-2 leading-relaxed">
                Diseñado para formar instructoras seguras con criterio biomecánico integral. Elige entre el{' '}
                <strong>Curso Básico (28h · $25,000 MXN)</strong> en 2 fines de semana para dominar el repertorio esencial
                e intermedio, o la <strong>Certificación Completa (48h · $38,000 MXN)</strong> en 4 fines de semana para
                incluir patologías de columna, modificaciones clínicas, metodología de cueing y examen práctico avalado.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 1 · 14H PRESENCIALES · BÁSICO (28H) & COMPLETO
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
                  MÓDULO 2 · 14H PRESENCIALES · CIERRE CURSO BÁSICO (28H)
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Repertorio Intermedio, Dinámica de Carro & Cargas
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Transiciones fluidas, trabajo en planos sagital y coronal, manejo de resistencia de
                  resortes según biotipo corporal y progresiones del repertorio intermedio (Short Box, Long
                  Stretch, Stomach Massage). Completa las 28 horas del Curso Básico.
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Coordinación neuromuscular en cadena cinética abierta y cerrada</li>
                  <li>• Dinámica de inercia y control del retroceso del carro</li>
                  <li>• Modulaciones de tempo y ritmo de clase</li>
                </ul>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-[24px] p-7 shadow-sm">
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-4">
                  MÓDULO 3 · 10H PRESENCIALES · CERTIFICACIÓN COMPLETA (48H)
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
                  MÓDULO 4 · 10H PRESENCIALES · CIERRE CERTIFICACIÓN COMPLETA (48H)
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Metodología de Cueing, Práctica Supervisada & Certificación
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Comandos verbales de alta precisión, ajustes táctiles no invasivos, diseño de planes de
                  clase privados y grupales, examen práctico individual y acreditación profesional oficial.
                </p>
                <ul className="text-xs font-mono text-neutral-500 space-y-1.5">
                  <li>• Simulación de clases con retroalimentación en directo</li>
                  <li>• Examen teórico-práctico ante docentes certificadas</li>
                  <li>• Entrega de constancia oficial avalada (28h Básico o 48h Completo) y vinculación a estudios</li>
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

        {/* PANEL 2: COMUNIDAD WHOP EN VIVO */}
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

        {/* PANEL 3: COLEGIATURA & OFERTA 50% OFF */}
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

              {/* Dual Tier Pricing Cards */}
              <div className="pt-6 border-t border-neutral-200 grid md:grid-cols-2 gap-6">
                {/* Curso Básico 28h */}
                <div className="p-7 rounded-[24px] border-2 border-neutral-200 bg-white hover:border-neutral-900 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-neutral-100 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                        2 Fines de Semana · 28 Horas
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900">Curso Básico Reformer</h3>
                    <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                      Repertorio esencial e intermedio, biomecánica funcional aplicada, máquina individual exclusiva por alumna y acceso completo al campus virtual en Whop.
                    </p>
                    <div className="mt-5 pt-4 border-t border-neutral-100">
                      <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                        ${WHOP_CONFIG.plans.cursoBasico.price.toLocaleString('es-MX')}{' '}
                        <span className="text-xs font-mono font-normal text-neutral-500">MXN</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        O aparta hoy tu lugar con solo <strong>${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-neutral-100 flex flex-col gap-2.5">
                    <button
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoBasico.id)}
                      className="w-full py-3.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors text-center shadow-md"
                    >
                      Inscribirme a Básico (${WHOP_CONFIG.plans.cursoBasico.price.toLocaleString('es-MX')} MXN)
                    </button>
                    <button
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                      className="w-full py-2.5 rounded-full border border-neutral-300 text-neutral-700 text-xs font-mono uppercase tracking-wider hover:border-neutral-900 transition-colors text-center"
                    >
                      Apartar Cupo (${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN)
                    </button>
                  </div>
                </div>

                {/* Certificación Completa 48h */}
                <div className="p-7 rounded-[24px] border-2 border-neutral-900 bg-[#111111] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-mono text-[10px] font-bold uppercase tracking-wider">
                      Recomendado
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-neutral-800 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        4 Fines de Semana · 48 Horas
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Certificación Completa</h3>
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                      Formación profesional integral con patologías de columna, poblaciones especiales, metodología de cueing, examen práctico individual y acreditación oficial avalada.
                    </p>
                    <div className="mt-5 pt-4 border-t border-neutral-800">
                      <div className="text-3xl font-bold text-white tracking-tight">
                        ${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')}{' '}
                        <span className="text-xs font-mono font-normal text-neutral-400">MXN</span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        O aparta hoy tu lugar con solo <strong>${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-neutral-800 flex flex-col gap-2.5">
                    <button
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                      className="w-full py-3.5 rounded-full bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors text-center shadow-lg"
                    >
                      Inscribirme a Completa (${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')} MXN)
                    </button>
                    <button
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                      className="w-full py-2.5 rounded-full border border-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider hover:border-white transition-colors text-center"
                    >
                      Apartar Cupo (${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN)
                    </button>
                  </div>
                </div>
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

        {/* PANEL 4: PREGUNTAS FRECUENTES */}
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
                  Puedes congelar tu descuento y asegurar 1 de los 12 cupos realizando una pre-reserva de $400 MXN
                  a través de nuestra pasarela oficial de Whop (tarjeta de crédito/débito o transferencia) o liquidando
                  la colegiatura con tu asesor.
                </p>
              </div>

              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 text-base mb-2">
                  ¿Quiénes son las docentes que imparten la certificación?
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  La formación es guiada por las Master Trainers Gabi y Laura Munive, referentes en México en biomecánica,
                  pedagogía clínica y desarrollo de instructores de alto desempeño.
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

      {/* LOWER SECTION: EXTERNAL ALTERNATIVE IN CDMX (STOTT PILATES® MERRITHEW) */}
      <section className="py-16 px-6 bg-neutral-100/70 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              // OTRA OPCIÓN EN MÉXICO · PROGRAMA ASOCIADO EXTERNO
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mt-2 mb-4">
              Certificación STOTT PILATES® en Ciudad de México (Santa Fe)
            </h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Para alumnas radicadas en la Ciudad de México que buscan específicamente la ruta internacional
              STOTT PILATES® de Merrithew®, mantenemos vinculación académica con el centro anfitrión oficial{' '}
              <strong>{STOTT_PROVIDER.name}</strong> en <strong>{STOTT_VENUE.name}</strong> (Torre 300, Santa Fe).
              Toma en cuenta que esta alternativa cuenta con aranceles externos de certificación internacional
              ($38,000 a $60,000+ MXN) y su propia convocatoria independiente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {STOTT_COURSES.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                    {course.level}
                  </div>
                  <div className="font-bold text-lg text-neutral-900 mb-2">{course.name}</div>
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed line-clamp-3">
                    {course.tagline}
                  </p>
                  <div className="text-2xl font-bold text-neutral-900 mb-1">
                    {course.price ? formatMXN(course.price) : 'Por anunciar'}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    {course.hours.total} horas totales · {course.modality}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-neutral-100 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/525548468190?text=${encodeURIComponent(
                      `Hola, me interesa la información y requisitos para la certificación STOTT PILATES en Santa Fe (${course.name}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider text-center hover:bg-neutral-800 transition-colors"
                  >
                    Consultar por WhatsApp
                  </a>
                  <Link
                    to="/certificacion-pilates/cdmx"
                    className="w-full py-2 rounded-full border border-neutral-300 text-neutral-700 text-xs font-mono uppercase tracking-wider text-center hover:border-neutral-900 transition-colors"
                  >
                    Ver Sede CDMX →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 font-mono">
            <div>
              <strong>Ubicación Sede CDMX:</strong> {STOTT_VENUE.address}
            </div>
            <Link
              to="/certificacion-pilates/cdmx"
              className="text-neutral-900 font-bold hover:underline shrink-0"
            >
              Explorar Guía Completa de STOTT CDMX →
            </Link>
          </div>
        </div>
      </section>

      {/* CROSS-SELL: EQUIPMENT FOR FUTURE STUDIOS */}
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

      {/* MINIMAL FOOTER */}
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

      {/* STICKY BOTTOM CONVERSION BAR FOR MOBILE */}
      <aside aria-label="Apartado de cupo" className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-40 md:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Pre-reserva de Cupo</div>
            <div className="text-base font-bold text-neutral-900">$400 MXN</div>
          </div>
          <button
            onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
            className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Pre-reservar Cupo →
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
