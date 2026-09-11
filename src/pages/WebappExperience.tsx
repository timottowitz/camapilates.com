import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  GraduationCap,
  Video,
  BookOpen,
  CreditCard,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Users,
  Award,
  ChevronRight,
  PlayCircle,
  HelpCircle,
  Lock,
  UserCheck,
} from 'lucide-react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import { WhopCommunityEmbed } from '@/components/webapp/WhopCommunityEmbed';
import { WhopForumReader } from '@/components/webapp/WhopForumReader';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { WEBINAR_INFO, getGoogleCalendarUrl, CERTIFICATION_COHORTS } from '@/content/certification/cohortsData';
import { DEFAULTS, getOrigin } from '@/lib/seo';

type WebappTab = 'comunidad' | 'campus' | 'webinar' | 'recursos' | 'pagos';

const WebappExperience: React.FC = () => {
  const [searchParams] = useSearchParams();
  const origin = getOrigin();

  const tabParam = searchParams.get('tab') as WebappTab | null;
  const paymentParam = searchParams.get('payment');

  const [activeTab, setActiveTab] = useState<WebappTab>(
    tabParam && ['comunidad', 'campus', 'webinar', 'recursos', 'pagos'].includes(tabParam)
      ? tabParam
      : 'comunidad'
  );

  const [selectedCohort, setSelectedCohort] = useState<'queretaro' | 'monterrey'>('queretaro');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>(WHOP_CONFIG.plans.apartado.id);
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

  const currentCohortData = CERTIFICATION_COHORTS[selectedCohort];

  return (
    <>
      <Helmet>
        <title>Campus Virtual & Comunidad Whop | CAMA Pilates</title>
        <meta
          name="description"
          content="Campus virtual oficial de certificación Pilates Reformer: comunidad Whop en vivo, temario de 100 horas, aula de masterclass y biblioteca clínica."
        />
        <link rel="canonical" href={`${origin}/app`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-[#12100E] text-stone-100 flex flex-col selection:bg-amber-400 selection:text-stone-950 font-sans">
        {/* Top App Header */}
        <header className="sticky top-0 z-40 bg-[#1A1715]/95 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo & Portal Badge */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-wider font-bold text-stone-100">
                  CAMA
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400 font-sans">
                  Pilates
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-700/60">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Campus Virtual & Whop
                </span>
              </div>
            </div>

            {/* Quick Live Masterclass Notice */}
            <div className="hidden md:flex items-center gap-3 bg-stone-900/80 px-3.5 py-1.5 rounded-full border border-stone-800 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-stone-300">
                Masterclass en Vivo: <strong>{WEBINAR_INFO.date}</strong>
              </span>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
              >
                + Calendar
              </a>
            </div>

            {/* User status & Primary CTA */}
            <div className="flex items-center gap-3">
              {enrollmentData ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-medium">Lugar Confirmado</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apartar Cupo ($4,500 MXN)</span>
                </button>
              )}

              <a
                href={WHOP_CONFIG.customerPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
                title="Acceder a tus membresías y recibos en Whop"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Mi Portal Whop</span>
              </a>

              <a
                href={WHOP_CONFIG.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Abrir Whop en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-[#161412] border-b border-stone-800 sticky top-[57px] z-30 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
            {[
              { id: 'comunidad', label: 'Comunidad & Chat', icon: MessageSquare },
              { id: 'campus', label: 'Plan de Formación 100h', icon: GraduationCap },
              { id: 'webinar', label: 'Webinar & Masterclass', icon: Video },
              { id: 'recursos', label: 'Biblioteca Clínica', icon: BookOpen },
              { id: 'pagos', label: 'Membresía & Pagos', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as WebappTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-6">
          {/* TAB 1: COMUNIDAD WHOP */}
          {activeTab === 'comunidad' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                      Canal Oficial en Vivo
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-serif italic text-stone-100">
                    Comunidad de Alumnas e Instructorias CAMA Pilates
                  </h2>
                  <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                    Interactúa con tus formadoras Gabi & Laura Munive, formula preguntas para la Masterclass del 26 de Septiembre y conecta con colegas de Querétaro y Monterrey.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={WHOP_CONFIG.experiences.forums.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 flex items-center gap-1.5 transition-all"
                  >
                    <span>Abrir Foros Whop</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={WHOP_CONFIG.experiences.chat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <span>Entrar al Chat en Vivo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* The Embedded Whop Experience */}
              <WhopCommunityEmbed initialTab="forum" />
            </div>
          )}

          {/* TAB 2: CAMPUS & FORMACIÓN 100H */}
          {activeTab === 'campus' && (
            <div className="space-y-8">
              {/* Cohort selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <h2 className="text-2xl font-serif italic text-stone-100">
                    Plan de Estudios Académico (100 Horas Avaladas)
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    56 horas presenciales intensivas en 4 fines de semana + 44 horas clínicas y docencia supervisada.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setSelectedCohort('queretaro')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCohort === 'queretaro'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Querétaro (Nov 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCohort('monterrey')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCohort === 'monterrey'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Monterrey (Dic-Ene)
                  </button>
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentCohortData.weekends.map((weekend) => (
                  <div
                    key={weekend.weekendNumber}
                    className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-stone-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[11px] font-semibold uppercase tracking-wider">
                        Fin de Semana {weekend.weekendNumber} · {weekend.dates}
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        {weekend.hours}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif italic text-stone-100">
                      {weekend.title}
                    </h3>

                    <p className="text-xs text-stone-400 leading-relaxed mb-3">
                      {weekend.description}
                    </p>

                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1.5 text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Modalidad Presencial Intensiva
                      </span>
                      <span className="font-semibold text-amber-300">{weekend.hours} Horas</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours Breakdown Progress Bar */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-stone-200">
                  Desglose Curricular para Certificación Oficial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
                    <p className="text-3xl font-serif font-bold text-amber-300">56h</p>
                    <p className="text-xs text-stone-400 mt-1">Instrucción Directa Presencial</p>
                    <p className="text-[11px] text-stone-500">4 fines de semana en estudio</p>
                  </div>
                  <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
                    <p className="text-3xl font-serif font-bold text-stone-200">24h</p>
                    <p className="text-xs text-stone-400 mt-1">Observación Clínica & Práctica</p>
                    <p className="text-[11px] text-stone-500">Bitácora supervisada</p>
                  </div>
                  <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800">
                    <p className="text-3xl font-serif font-bold text-emerald-400">20h</p>
                    <p className="text-xs text-stone-400 mt-1">Docencia de Práctica Guiada</p>
                    <p className="text-[11px] text-stone-500">Sesiones a alumnos reales</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBINAR CHANNEL & LIVE AULA */}
          {activeTab === 'webinar' && (
            <div className="space-y-6">
              <div className="bg-[#1C1917] border border-stone-800 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Aula de Transmisión Oficial
                    </span>
                    <h2 className="text-2xl md:text-3xl font-serif italic text-stone-100">
                      Masterclass en Vivo: La Ruta para Certificarte en Reformer
                    </h2>
                    <p className="text-xs md:text-sm text-stone-400">
                      Con <strong>Gabi & Laura Munive</strong> · {WEBINAR_INFO.date}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      Agregar al Calendario
                    </a>
                    <a
                      href="https://wa.me/525549425550?text=Hola,%20tengo%20una%20pregunta%20sobre%20la%20Masterclass%20del%2026%20de%20Septiembre"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      Ayuda por WhatsApp
                    </a>
                  </div>
                </div>

                {/* Video Player Placeholder / Live Stream Container */}
                <div className="relative aspect-video rounded-2xl bg-stone-950 border border-stone-800 flex flex-col items-center justify-center p-8 text-center space-y-4 overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 z-10 max-w-lg">
                    <h3 className="text-lg font-serif italic text-stone-200">
                      Transmisión en Vivo Programada
                    </h3>
                    <p className="text-xs text-stone-400">
                      La sala abrirá 15 minutos antes de la hora acordada ({WEBINAR_INFO.time}). El enlace directo de acceso se enviará a tu correo y se activará en esta pantalla.
                    </p>
                  </div>
                </div>

                {/* Interactive Q&A linked to Whop Forum */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="text-base font-serif italic text-stone-100 font-semibold">
                          Consultas & Dudas en Vivo para Gabi & Laura Munive
                        </h4>
                        <p className="text-xs text-stone-400">
                          Preguntas publicadas en tiempo real en la Comunidad Oficial Whop para la Masterclass del 26 de Septiembre
                        </p>
                      </div>
                    </div>

                    <a
                      href={WHOP_CONFIG.experiences.forums.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-amber-400/20 self-start sm:self-auto transition-all"
                    >
                      <span>Abrir Foro en Whop</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <WhopForumReader initialThreadId="post_1Cevz43didoC8sPLfCEBXj" highlightQnA={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECURSOS & BIBLIOTECA */}
          {activeTab === 'recursos' && (
            <div className="space-y-6">
              <div className="border-b border-stone-800 pb-4">
                <h2 className="text-2xl font-serif italic text-stone-100">
                  Biblioteca & Recursos Descargables
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Manuales técnicos, fichas clínicas y guías de negocio para alumnas de certificación.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Atlas Clínico de Patologías de Columna',
                    desc: 'Ajustes de resortes y contraindicaciones para hernias discales, ciática y lordosis en Reformer.',
                    format: 'PDF · 48 Páginas',
                    tag: 'Clínico',
                  },
                  {
                    title: 'Manual de Biomecánica & Resortes',
                    desc: 'Física aplicada al carro móvil: cálculo de resistencia progresiva y cadencia del movimiento.',
                    format: 'PDF · 32 Páginas',
                    tag: 'Técnico',
                  },
                  {
                    title: 'Ficha de Evaluación Postural',
                    desc: 'Plantilla descargable para evaluar a nuevos alumnos antes de su primera sesión en Reformer.',
                    format: 'PDF Editable / Sheets',
                    tag: 'Plantilla',
                  },
                  {
                    title: 'Modelo Financiero de Estudio',
                    desc: 'Calculadora de costos operativos, punto de equilibrio y precios por clase privada en México.',
                    format: 'Excel / Google Sheets',
                    tag: 'Negocio',
                  },
                  {
                    title: 'Contrato de Consentimiento Alumno',
                    desc: 'Documento legal de exención de responsabilidad y consentimiento médico para estudios en México.',
                    format: 'Word / PDF',
                    tag: 'Legal',
                  },
                  {
                    title: 'Guía de Mantenimiento Preventivo',
                    desc: 'Protocolo de lubricación de rieles, cambio de poleas y revisión de tensión de resortes.',
                    format: 'PDF · Guía Rápida',
                    tag: 'Equipamiento',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 uppercase tracking-wider">
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          {item.format}
                        </span>
                      </div>
                      <h3 className="text-base font-serif italic text-stone-100">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <a
                      href={WHOP_CONFIG.communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Descargar desde Whop</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MEMBRESÍA & PAGOS */}
          {activeTab === 'pagos' && (
            <div className="space-y-6">
              <div className="border-b border-stone-800 pb-4">
                <h2 className="text-2xl font-serif italic text-stone-100">
                  Membresía & Pasarela de Pagos Whop
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Gestiona tu lugar en la cohorte, liquida tu colegiatura con 50% de descuento o adquiere tu pase VIP.
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Plan 1: Apartado */}
                <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-400/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      {WHOP_CONFIG.plans.apartado.badge}
                    </span>
                    <h3 className="text-base font-serif italic text-stone-100">
                      {WHOP_CONFIG.plans.apartado.name}
                    </h3>
                    <p className="text-2xl font-serif font-bold text-amber-300">
                      ${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {WHOP_CONFIG.plans.apartado.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Apartar con $4,500 MXN
                    </button>
                  </div>
                </div>

                {/* Plan 2: Colegiatura Completa */}
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.badge}
                    </span>
                    <h3 className="text-base font-serif italic text-stone-100">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.name}
                    </h3>
                    <p className="text-2xl font-serif font-bold text-stone-100">
                      ${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all border border-stone-700"
                    >
                      Pagar Colegiatura Completa
                    </button>
                  </div>
                </div>

                {/* Plan 3: Curso Online 10 Módulos */}
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {WHOP_CONFIG.plans.cursoOnline.badge}
                    </span>
                    <h3 className="text-base font-serif italic text-stone-100">
                      {WHOP_CONFIG.plans.cursoOnline.name}
                    </h3>
                    <p className="text-2xl font-serif font-bold text-amber-200">
                      ${WHOP_CONFIG.plans.cursoOnline.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {WHOP_CONFIG.plans.cursoOnline.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoOnline.id)}
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all border border-stone-700"
                    >
                      Comprar Curso Online
                    </button>
                  </div>
                </div>

                {/* Plan 4: Pase VIP Gratuito */}
                <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                      {WHOP_CONFIG.plans.paseVipWebinar.badge}
                    </span>
                    <h3 className="text-base font-serif italic text-stone-100">
                      {WHOP_CONFIG.plans.paseVipWebinar.name}
                    </h3>
                    <p className="text-2xl font-serif font-bold text-stone-300">
                      Gratis
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {WHOP_CONFIG.plans.paseVipWebinar.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.paseVipWebinar.id)}
                      className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium uppercase tracking-wider rounded-xl transition-all border border-stone-700"
                    >
                      Obtener Pase Gratuito
                    </button>
                  </div>
                </div>
              </div>

              {/* Whop Customer Portal Box */}
              <div className="bg-gradient-to-r from-[#1C1814] via-stone-900 to-[#221D18] border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Autogestión de Alumna
                    </span>
                    <span className="text-xs text-stone-400">Whop Customer Portal Oficial</span>
                  </div>
                  <h3 className="text-xl font-serif italic text-stone-100">
                    ¿Ya te inscribiste o tienes una membresía activa en Whop?
                  </h3>
                  <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                    Accede a tu portal seguro de cliente en Whop para consultar comprobantes de pago, facturación electrónica, actualizar tus tarjetas o administrar tus accesos al Campus Virtual y canales de chat.
                  </p>
                </div>
                <a
                  href={WHOP_CONFIG.customerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Gestionar Mi Cuenta en Whop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Whop Checkout Modal */}
      <WhopCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        planId={checkoutPlanId}
        cohort={`${selectedCohort}-2026`}
      />
    </>
  );
};

export default WebappExperience;
