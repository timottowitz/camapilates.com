import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import EdelweissNav from '@/components/layout/EdelweissNav';
import {
  MessageSquare,
  GraduationCap,
  Video,
  BookOpen,
  CreditCard,
  Sparkles,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  HelpCircle,
  UserCheck,
  ShieldCheck,
  Award,
  Users,
  Compass,
  Zap,
  Loader2,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import { WhopCommunityEmbed } from '@/components/webapp/WhopCommunityEmbed';
import { WhopForumReader } from '@/components/webapp/WhopForumReader';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { EditorialFeatureCards } from '@/components/webapp/EditorialFeatureCards';
import { CourseModuleEditorialCard } from '@/components/webapp/CourseModuleEditorialCard';
import { WEBINAR_INFO, getGoogleCalendarUrl, CERTIFICATION_COHORTS } from '@/content/certification/cohortsData';
import { getOrigin } from '@/lib/seo';

type WebappTab = 'campus' | 'comunidad' | 'webinar' | 'recursos' | 'pagos';

const ONLINE_COURSE_MODULES = [
  {
    number: 1,
    title: 'Fundamentos Anatómicos & Biomecánica del Reformer',
    description: 'Alineación de columna neutra, plano lumbopélvico, respiración costodiafragmática y análisis de vectores articulares.',
    hours: '2.5 Horas',
    lessons: '8 Lecciones',
    badge: 'Anatomía',
    tag: '[ MÓDULO 01 ]',
  },
  {
    number: 2,
    title: 'Sistema de Resortes, Física del Carro & Cargas',
    description: 'Calibración de muelles progresivos (F = -k·x), física de resistencia del carro móvil y protocolos de seguridad.',
    hours: '2.0 Horas',
    lessons: '6 Lecciones',
    badge: 'Mecánica',
    tag: '[ MÓDULO 02 ]',
  },
  {
    number: 3,
    title: 'Repertorio Esencial: Footwork & Serie Supina',
    description: 'Secuencia completa de Footwork (toes, arches, heels, tendon stretch), bridging y alineación cinemática.',
    hours: '3.0 Horas',
    lessons: '10 Lecciones',
    badge: 'Esencial',
    tag: '[ MÓDULO 03 ]',
  },
  {
    number: 4,
    title: 'Trabajo de Brazos, Correas & Articulación Pélvica',
    description: 'Feet in straps, arm work supino y de rodillas, estabilización escapulohumeral y control del transverso abdominal.',
    hours: '2.5 Horas',
    lessons: '8 Lecciones',
    badge: 'Esencial',
    tag: '[ MÓDULO 04 ]',
  },
  {
    number: 5,
    title: 'Repertorio Intermedio: Serie Abdominal & Stomach Massage',
    description: 'Progresiones del Stomach Massage (Round, Flat, Reach, Twist), coordinación en planos sagital y coronal.',
    hours: '3.0 Horas',
    lessons: '9 Lecciones',
    badge: 'Intermedio',
    tag: '[ MÓDULO 05 ]',
  },
  {
    number: 6,
    title: 'Short Box Series, Articulación Espinal & Extensión',
    description: 'Trabajo sobre la caja corta (Round Back, Flat Back, Side to Side, Tree) y extensión torácica controlada.',
    hours: '2.5 Horas',
    lessons: '7 Lecciones',
    badge: 'Intermedio',
    tag: '[ MÓDULO 06 ]',
  },
  {
    number: 7,
    title: 'Dinámica de Cargas & Trabajo en Cadena Cinética',
    description: 'Transición entre cadena abierta y cerrada, ejercicios de estabilidad unipodal y transferencias seguras de peso.',
    hours: '2.0 Horas',
    lessons: '6 Lecciones',
    badge: 'Biomecánica',
    tag: '[ MÓDULO 07 ]',
  },
  {
    number: 8,
    title: 'Patologías de Columna, Hernias & Modificaciones Clínicas',
    description: 'Protocolos de modificación para lumbalgias, hernias L4-L5/S1, escoliosis, hiperlordosis y embarazo.',
    hours: '3.5 Horas',
    lessons: '11 Lecciones',
    badge: 'Clínico',
    tag: '[ MÓDULO 08 ]',
  },
  {
    number: 9,
    title: 'Metodología de Cueing Verbal, Ritmo & Pedagogía',
    description: 'Comandos verbales de alta precisión (400ms), ritmo respiratorio, corrección visual y ajustes táctiles no invasivos.',
    hours: '2.5 Horas',
    lessons: '8 Lecciones',
    badge: 'Pedagogía',
    tag: '[ MÓDULO 09 ]',
  },
  {
    number: 10,
    title: 'Diseño de Clases Boutique, Negocio & Examen Digital',
    description: 'Estructuración de sesiones boutique (50 min), retención de clientes, pricing y evaluación para certificado digital.',
    hours: '2.5 Horas',
    lessons: '8 Lecciones',
    badge: 'Certificación',
    tag: '[ MÓDULO 10 ]',
  },
];

const WebappExperience: React.FC = () => {
  const [searchParams] = useSearchParams();
  const origin = getOrigin();
  const convex = useConvex();

  const tabParam = searchParams.get('tab') as WebappTab | null;

  const [activeTab, setActiveTab] = useState<WebappTab>(
    tabParam && ['campus', 'comunidad', 'webinar', 'recursos', 'pagos'].includes(tabParam)
      ? tabParam
      : 'campus'
  );

  const [selectedCohort, setSelectedCohort] = useState<'queretaro' | 'monterrey'>('queretaro');
  const [curriculumView, setCurriculumView] = useState<'presencial' | 'online'>('presencial');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);

  const handleCopyAssetUrl = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedAsset(label);
    setTimeout(() => setCopiedAsset(null), 2500);
  };

  // Member verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'not_found' | 'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cama_pilates_whop_enrollment');
      if (saved) {
        setEnrollmentData(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = verifyEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setVerifyStatus('error');
      setVerifyMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setVerifying(true);
    setVerifyStatus('idle');
    setVerifyMessage('');

    try {
      const res = await convex.query(api.whopPayments.verifyMemberAccess, {
        email: cleanEmail,
      });

      if (res && res.verified) {
        const session = {
          enrolled: true,
          email: cleanEmail,
          fullName: res.fullName,
          planId: res.planId,
          planName: res.planName,
          cohort: res.cohort,
          type: res.type,
          date: new Date().toISOString(),
        };
        try {
          localStorage.setItem('cama_pilates_whop_enrollment', JSON.stringify(session));
        } catch (_) {}
        setEnrollmentData(session);
        setVerifyStatus('success');
        setVerifyMessage(`¡Bienvenida ${res.fullName}! Tu acceso a "${res.planName}" ha sido verificado.`);
        setTimeout(() => {
          setVerifyModalOpen(false);
          setVerifyStatus('idle');
          setVerifyEmail('');
        }, 1500);
      } else {
        setVerifyStatus('not_found');
        setVerifyMessage(
          'No encontramos una compra o pre-registro activo con este correo. Puedes apartar tu lugar hoy mismo o abrir tu cuenta en Whop.'
        );
      }
    } catch (err: any) {
      console.error('Error verifying member access:', err);
      setVerifyStatus('error');
      setVerifyMessage('Ocurrió un error al verificar tu acceso. Intenta de nuevo o ingresa directamente a Whop.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('cama_pilates_whop_enrollment');
    } catch (_) {}
    setEnrollmentData(null);
  };

  const handleOpenCheckout = (planId: string) => {
    setCheckoutPlanId(planId);
    setCheckoutModalOpen(true);
  };

  const handleSelectTab = (tab: WebappTab) => {
    setActiveTab(tab);
    const element = document.getElementById('capability-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCohortData = CERTIFICATION_COHORTS[selectedCohort];

  return (
    <>
      <Helmet>
        <title>Campus Virtual & Comunidad Whop | Edelweiss Pilates</title>
        <meta
          name="description"
          content="Campus virtual oficial de certificación Pilates Reformer: comunidad Whop en vivo, temario de 28h y 48h, aula de masterclass y biblioteca clínica."
        />
        <link rel="canonical" href={`${origin}/app`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-[#F8F8F6] text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white font-sans">
        {/* Global Luxury Navigation */}
        <EdelweissNav />

        {/* Verified Student Session Banner */}
        {enrollmentData && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 sm:pt-28 pb-2 w-full">
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Bienvenida, <strong>{enrollmentData.fullName || 'Alumna Verificada'}</strong> · {enrollmentData.planName || 'Lugar Confirmado'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] text-emerald-700 hover:text-emerald-950 underline font-medium cursor-pointer"
                title="Cerrar sesión en este navegador"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* HERO SECTION — Matching Screenshot 1 Branding & Typography */}
        <section className={`max-w-7xl mx-auto px-4 lg:px-8 ${enrollmentData ? 'pt-6' : 'pt-24 sm:pt-32'} pb-6 w-full`}>
          {/* Domain micro metadata */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-6 notranslate" translate="no">
            <span className="w-2 h-2 rounded-full bg-[#B8583B]" />
            <span>camadepilates.com — Campus Virtual, Formación 28h / 48h & Comunidad Whop</span>
          </div>

          {/* Giant Display Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.04] max-w-4xl">
            Formación clínica<br />en cada<br />movimiento.
          </h1>

          {/* Structured lead description */}
          <p className="mt-6 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
            Formamos y certificamos a la nueva generación de instructoras de Pilates Reformer en México. De la <strong className="font-semibold text-neutral-900">biomecánica clínica</strong> y el análisis de resortes a la <strong className="font-semibold text-neutral-900">docencia supervisada</strong> y dirección de estudios de alto rendimiento.
          </p>

          {/* Capability Selector Row */}
          <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 mr-1">// SELECT CAPABILITY:</span>
              {[
                { id: 'campus', label: 'Formación 28h / 48h', icon: GraduationCap },
                { id: 'comunidad', label: 'Comunidad Whop', icon: MessageSquare },
                { id: 'webinar', label: 'Masterclass en Vivo', icon: Video },
                { id: 'recursos', label: 'Biblioteca Clínica', icon: BookOpen },
                { id: 'pagos', label: 'Membresía & Pagos', icon: CreditCard },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id as WebappTab)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                      isActive
                        ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-xs'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-2 transition-all"
              >
                <span>Pre-reservar Cupo ($400 MXN)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <a
                href={WHOP_CONFIG.customerPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-medium rounded-full border border-neutral-200 shadow-xs transition-all"
              >
                Portal Alumnas
              </a>
            </div>
          </div>

          {/* The 3 Signature Editorial Visual Cards */}
          <EditorialFeatureCards
            onSelectTab={(tab) => handleSelectTab(tab)}
            activeTab={activeTab}
          />
        </section>

        {/* DETAILED CONTENT SECTION */}
        <main id="capability-section" className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 space-y-8">
          {/* TAB 1: CAMPUS & FORMACIÓN (28H / 48H) */}
          {activeTab === 'campus' && (
            <div className="space-y-8">
              {/* Cohort selector & Curriculum View header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/80 pb-5">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
                    <span>// CURRICULUM SYLLABUS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                    {curriculumView === 'presencial'
                      ? 'Módulos de Formación Presencial (28h Básica / 48h Completa)'
                      : 'Campus Virtual Whop · 10 Módulos Online con Laura Munive'}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
                    {curriculumView === 'presencial'
                      ? 'Desglose módulo por módulo de los 4 fines de semana con Reformer individual asignado por alumna en Querétaro y Monterrey.'
                      : 'Acceso ilimitado a las 10 unidades pedagógicas en video HD, biblioteca clínica y certificación digital en la plataforma Whop.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
                  {/* Presencial vs Online View Switcher */}
                  <div className="flex items-center gap-1 bg-neutral-200/80 p-1 rounded-full text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCurriculumView('presencial')}
                      className={`px-3.5 py-1.5 rounded-full transition-all ${
                        curriculumView === 'presencial'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-700 hover:text-neutral-950'
                      }`}
                    >
                      Presencial (4 Fines)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurriculumView('online')}
                      className={`px-3.5 py-1.5 rounded-full transition-all ${
                        curriculumView === 'online'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-700 hover:text-neutral-950'
                      }`}
                    >
                      Online (10 Módulos)
                    </button>
                  </div>

                  {/* City Selector (Active when viewing Presencial) */}
                  {curriculumView === 'presencial' && (
                    <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200 text-xs font-semibold shadow-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedCohort('queretaro')}
                        className={`px-3.5 py-1 rounded-full transition-all ${
                          selectedCohort === 'queretaro'
                            ? 'bg-neutral-900 text-white shadow-xs font-bold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Querétaro (Nov)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCohort('monterrey')}
                        className={`px-3.5 py-1 rounded-full transition-all ${
                          selectedCohort === 'monterrey'
                            ? 'bg-neutral-900 text-white shadow-xs font-bold'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Monterrey (Dic-Ene)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Syllabus Breakdown Grid */}
              {curriculumView === 'presencial' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {currentCohortData.weekends.map((weekend, idx) => (
                    <CourseModuleEditorialCard
                      key={weekend.weekendNumber}
                      weekend={weekend}
                      index={idx}
                      onPreBook={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ONLINE_COURSE_MODULES.map((mod) => (
                      <div
                        key={mod.number}
                        className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:shadow-md transition-all shadow-xs"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                              {mod.tag}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {mod.hours}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-neutral-900 leading-snug">
                            {mod.title}
                          </h4>

                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-neutral-500 font-medium">
                            {mod.lessons}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                            {mod.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Online Course Whop Direct CTA Banner */}
                  <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-800 shadow-md">
                    <div className="space-y-1.5 text-center sm:text-left">
                      <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest font-bold">
                        CAMPUS DIGITAL WHOP · ACCESO INMEDIATO
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold text-white">
                        ¿Prefieres formarte a tu propio ritmo 100% online?
                      </h4>
                      <p className="text-xs text-neutral-300 max-w-xl">
                        Adquiere los 10 módulos grabados con Laura Munive, manual descargable y examen teórico para obtener tu certificación digital avalada por $1,999 MXN (50% de descuento).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoOnline.id)}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md shrink-0"
                    >
                      Inscribirme al Curso Online ($1,999 MXN)
                    </button>
                  </div>
                </div>
              )}

              {/* Dual Pathway Hours & Price Comparison Cards */}
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      Comparativa de Rutas Formativas Presenciales
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Ambas modalidades incluyen Reformer individual asignado por alumna y acceso al campus virtual Whop.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-neutral-400">
                    OPCIONES: 28H / 48H
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option A: Curso Básico (28h) */}
                  <div className="bg-neutral-50/80 p-6 rounded-2xl border border-neutral-200/80 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                          2 Fines de Semana · Nivel Básico Esencial
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-neutral-950 font-mono">$25,000</p>
                          <p className="text-[10px] text-neutral-400 font-mono">MXN pago único</p>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-neutral-900">
                        Curso Básico Reformer (28 Horas)
                      </h4>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Enfocado en dominar los 35 ejercicios esenciales e intermedios de Reformer, anatomía funcional, biomecánica articular y regulación precisa de resortes para impartir clases particulares con total soltura.
                      </p>

                      <div className="pt-3 border-t border-neutral-200/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-neutral-400 font-mono block text-[10px]">DURACIÓN:</span>
                          <strong className="text-neutral-900">28 Horas Presenciales</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-mono block text-[10px]">CALENDARIO:</span>
                          <strong className="text-neutral-900">Módulos I & II</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoBasico.id)}
                        className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
                      >
                        Inscribirme al Curso Básico ($25,000 MXN)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                        className="w-full py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-xs rounded-xl transition-all"
                      >
                        Pre-reservar Lugar con $400 MXN
                      </button>
                    </div>
                  </div>

                  {/* Option B: Certificación Completa (48h) */}
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 rounded-2xl border border-neutral-800 space-y-4 flex flex-col justify-between shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                          4 Fines de Semana · Aval Profesional Completo
                        </span>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-amber-300 font-mono">$38,000</p>
                          <p className="text-[10px] text-neutral-400 font-mono">MXN pago único</p>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-white">
                        Certificación Completa (48 Horas)
                      </h4>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Formación clínica y pedagógica exhaustiva. Incluye tratamiento de patologías de columna (hernias, lumbalgias, escoliosis), embarazo, metodología de cueing, examen práctico individual, aval curricular y 15% de descuento en camas Edelweiss Reformer.
                      </p>

                      <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-neutral-400 font-mono block text-[10px]">DURACIÓN:</span>
                          <strong className="text-white">48 Horas Presenciales</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 font-mono block text-[10px]">CALENDARIO:</span>
                          <strong className="text-white">Módulos I, II, III & IV</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-xs"
                      >
                        Inscribirme a Certificación Completa ($38,000 MXN)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                        className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-semibold text-xs rounded-xl transition-all"
                      >
                        Pre-reservar Lugar con $400 MXN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMUNIDAD WHOP */}
          {activeTab === 'comunidad' && (
            <div className="space-y-8">
              {/* Community Banner with Visual Showcase */}
              <div className="bg-white border border-neutral-200/90 rounded-[28px] overflow-hidden shadow-xs">
                <div className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] max-h-[360px] overflow-hidden border-b border-neutral-200/80 bg-neutral-100">
                  <img
                    src={WHOP_CONFIG.assets.bannerUrl}
                    alt="Comunidad Whop Edelweiss Pilates México"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                        Canal Oficial en Vivo · Whop Sync
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                      Comunidad de Alumnas e Instructoras Edelweiss Pilates
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                      Interactúa con tus formadoras Gabi & Laura Munive, debate casos clínicos de patologías y conecta con la red de graduadas en Querétaro y Monterrey.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={WHOP_CONFIG.experiences.forums.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-full border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <span>Abrir Foros Whop</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={WHOP_CONFIG.experiences.chat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Entrar al Chat en Vivo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Asset Download Hub for Whop Community Branding */}
              <div className="bg-neutral-900 text-white rounded-[28px] p-6 sm:p-8 space-y-6 shadow-md border border-neutral-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                        [ BRAND IDENTITY KIT · EDELWEISS ]
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">Archivos Originales PNG</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Assets Oficiales para la Comunidad Whop
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                      Descarga los archivos originales en alta resolución (2000px, 1024px, 512px) con composiciones fotográficas reales y el diseño editorial exclusivo para el encabezado, logotipo y avatar de Whop.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href="https://whop.com/dashboard/company/biz_3eUPkeAdggRnrP/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-full border border-neutral-700 flex items-center gap-1.5 transition-all"
                    >
                      <span>Ajustes Whop Dashboard</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </a>
                  </div>
                </div>

                {/* 3 Download Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* CARD 1: HEADER BANNER */}
                  <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
                        <img
                          src={WHOP_CONFIG.assets.bannerUrl}
                          alt="Edelweiss Pilates Community Header Banner"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-amber-300 font-semibold">
                          2000 × 1000 px
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span>Header Banner Oficial</span>
                          <span>825 KB · PNG</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">Banner Comunidad Whop</h4>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          Composición con 3 cards fotográficas (Teal, Terracota, Sage), planos cinemáticos y tipografía oficial Edelweiss Pilates.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row gap-2">
                      <a
                        href="/images/whop/whop-community-banner.png"
                        download="edelweiss-community-banner.png"
                        className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PNG</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyAssetUrl(WHOP_CONFIG.assets.bannerUrl, 'banner')}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1 transition-all"
                        title="Copiar URL directa de Whop CDN"
                      >
                        {copiedAsset === 'banner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedAsset === 'banner' ? 'Copiado' : 'CDN'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: OFFICIAL LOGO */}
                  <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="relative aspect-square max-h-[160px] mx-auto rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
                        <img
                          src={WHOP_CONFIG.assets.logoUrl}
                          alt="Edelweiss Pilates Official Logo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-amber-300 font-semibold">
                          1024 × 1024 px
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span>Logo Oficial Cuadrado</span>
                          <span>187 KB · PNG</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">Logotipo Oficial Edelweiss</h4>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          Tipografía Playfair Display italic con el característico punto rojo de camadepilates.com y plano técnico biomecánico.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row gap-2">
                      <a
                        href="/images/whop/whop-community-logo.png"
                        download="edelweiss-community-logo.png"
                        className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PNG</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyAssetUrl(WHOP_CONFIG.assets.logoUrl, 'logo')}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1 transition-all"
                        title="Copiar URL directa de Whop CDN"
                      >
                        {copiedAsset === 'logo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedAsset === 'logo' ? 'Copiado' : 'CDN'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: APP AVATAR */}
                  <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="relative aspect-square max-h-[160px] mx-auto rounded-full overflow-hidden border-2 border-amber-400/40 bg-neutral-900 group shadow-md">
                        <img
                          src={WHOP_CONFIG.assets.avatarUrl}
                          alt="Edelweiss Pilates App Avatar"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono text-amber-300 font-semibold">
                          512 × 512 px
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                          <span>Avatar Circular Icon</span>
                          <span>142 KB · PNG</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">Avatar de Aplicación</h4>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                          Ícono optimizado para chat móvil, perfiles de comunidad y notificaciones con el logo oficial Edelweiss y punto rojo.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row gap-2">
                      <a
                        href="/images/whop/whop-community-avatar.png"
                        download="edelweiss-community-avatar.png"
                        className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PNG</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyAssetUrl(WHOP_CONFIG.assets.avatarUrl, 'avatar')}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1 transition-all"
                        title="Copiar URL directa de Whop CDN"
                      >
                        {copiedAsset === 'avatar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedAsset === 'avatar' ? 'Copiado' : 'CDN'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions Footer */}
                <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Los 3 assets ya están sincronizados y alojados en Whop S3 CDN con HTTP 200 garantizado.</span>
                  </div>
                  <a
                    href="https://whop.com/dashboard/company/biz_3eUPkeAdggRnrP/products/prod_Iv5ZnKkugonCn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Editar galería en Whop</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 4 Community Highlights / Channels Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[10px] font-bold">
                      #anuncios-oficiales
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Oficial</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900">Avisos & Sedes</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Ubicaciones exactas en Juriquilla y San Pedro, horarios y recordatorios de fechas.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 font-mono text-[10px] font-bold">
                      #preguntas-laura
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Mentoría</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900">Dudas Anatómicas</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Canal directo con Laura Munive para resolver biomecánica y ajustes en clase.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold">
                      #casos-clinicos
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Clínica</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900">Patologías & Carga</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Análisis de casos reales de alumnos con hernias, escoliosis y contraindicaciones.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-mono text-[10px] font-bold">
                      #bolsa-trabajo
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Empleo</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900">Red de Estudios</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Vacantes y oportunidades de docencia en estudios certificados de México.
                  </p>
                </div>
              </div>

              {/* The Embedded Whop Experience */}
              <WhopCommunityEmbed initialTab="reader" />

              {/* Community Values & Ethical Framework */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-[28px] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#14323D]" />
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Valores & Código de Ética de la Comunidad Edelweiss Pilates
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600 leading-relaxed">
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-900">1. Rigor Anatómico</p>
                    <p>Todo ajuste o ejercicio se fundamenta en biomecánica y evidencia clínica, no en modas pasajeras.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-900">2. Confidencialidad Alumno</p>
                    <p>Los casos clínicos compartidos en foros protegen la identidad y privacidad médica de tus alumnos.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-900">3. Mentoría Colaborativa</p>
                    <p>Fomentamos el crecimiento mutuo y el intercambio honesto entre instructoras de todas las ciudades.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBINAR & MASTERCLASS */}
          {activeTab === 'webinar' && (
            <div className="space-y-6">
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Aula de Transmisión Oficial
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                      Masterclass en Vivo: La Ruta para Certificarte en Reformer
                    </h2>
                    <p className="text-xs md:text-sm text-neutral-600">
                      Con <strong>Gabi & Laura Munive</strong> · {WEBINAR_INFO.date}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      Agregar al Calendario
                    </a>
                    <a
                      href="https://wa.me/525549425550?text=Hola,%20tengo%20una%20pregunta%20sobre%20la%20Masterclass%20del%2026%20de%20Septiembre"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-medium rounded-full border border-neutral-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      Ayuda por WhatsApp
                    </a>
                  </div>
                </div>

                {/* Video Player Placeholder / Live Stream Container */}
                <div className="relative aspect-video rounded-3xl bg-neutral-950 border border-neutral-900 flex flex-col items-center justify-center p-8 text-center space-y-4 overflow-hidden shadow-inner">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 z-10 max-w-lg">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Transmisión en Vivo Programada
                    </h3>
                    <p className="text-xs text-neutral-400">
                      La sala abrirá 15 minutos antes de la hora acordada ({WEBINAR_INFO.time}). El enlace directo de acceso se enviará a tu correo y se activará en esta pantalla.
                    </p>
                  </div>
                </div>

                {/* Interactive Q&A linked to Whop Forum */}
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-neutral-700" />
                      <div>
                        <h4 className="text-base font-bold text-neutral-900">
                          Consultas & Dudas en Vivo para Gabi & Laura Munive
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Preguntas publicadas en tiempo real en la Comunidad Oficial Whop para la Masterclass del 26 de Septiembre
                        </p>
                      </div>
                    </div>

                    <a
                      href={WHOP_CONFIG.experiences.forums.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold self-start sm:self-auto transition-all"
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
              <div className="border-b border-neutral-200/80 pb-5">
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
                  <span>// KNOWLEDGE BASE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Biblioteca & Recursos Descargables
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
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
                    className="bg-white border border-neutral-200/90 rounded-[24px] p-6 flex flex-col justify-between space-y-4 hover:border-neutral-300 hover:shadow-md transition-all shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-800 uppercase tracking-wider">
                          [ {item.tag} ]
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {item.format}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <a
                      href={WHOP_CONFIG.communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Descargar desde Whop</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MEMBRESÍA & PAGOS */}
          {activeTab === 'pagos' && (
            <div className="space-y-8">
              <div className="border-b border-neutral-200/80 pb-5">
                <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
                  <span>// TUITION & ACCESS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Membresía & Pasarela de Pagos Whop
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Gestiona tu lugar en la cohorte, liquida tu colegiatura con 50% de descuento o adquiere tu pase VIP.
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Plan 1: Apartado */}
                <div className="bg-white border-2 border-neutral-900 rounded-[24px] p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                      {WHOP_CONFIG.plans.apartado.badge}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {WHOP_CONFIG.plans.apartado.name}
                    </h3>
                    <p className="text-2xl font-extrabold tracking-tight text-neutral-950 font-mono">
                      ${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {WHOP_CONFIG.plans.apartado.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-sm"
                    >
                      Pre-reservar Cupo ($400 MXN)
                    </button>
                  </div>
                </div>

                {/* Plan 2: Curso Básico (28 Horas) */}
                <div className="bg-white border border-neutral-200/90 rounded-[24px] p-5 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition-all">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                      {WHOP_CONFIG.plans.cursoBasico.badge}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {WHOP_CONFIG.plans.cursoBasico.name}
                    </h3>
                    <p className="text-2xl font-extrabold tracking-tight text-neutral-950 font-mono">
                      ${WHOP_CONFIG.plans.cursoBasico.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {WHOP_CONFIG.plans.cursoBasico.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoBasico.id)}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-xs"
                    >
                      Inscribirme Básico ($25k)
                    </button>
                  </div>
                </div>

                {/* Plan 3: Certificación Completa (48 Horas) */}
                <div className="bg-white border-2 border-amber-400/80 rounded-[24px] p-5 flex flex-col justify-between shadow-md hover:border-amber-400 transition-all relative">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.badge}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.name}
                    </h3>
                    <p className="text-2xl font-extrabold tracking-tight text-neutral-950 font-mono">
                      ${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {WHOP_CONFIG.plans.colegiaturaCompleta.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-sm"
                    >
                      Pagar Completo ($38k)
                    </button>
                  </div>
                </div>

                {/* Plan 4: Curso Online 10 Módulos */}
                <div className="bg-white border border-neutral-200/90 rounded-[24px] p-5 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition-all">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                      {WHOP_CONFIG.plans.cursoOnline.badge}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {WHOP_CONFIG.plans.cursoOnline.name}
                    </h3>
                    <p className="text-2xl font-extrabold tracking-tight text-neutral-950 font-mono">
                      ${WHOP_CONFIG.plans.cursoOnline.price.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {WHOP_CONFIG.plans.cursoOnline.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.cursoOnline.id)}
                      className="w-full py-2.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-neutral-300"
                    >
                      Comprar Online ($1,999)
                    </button>
                  </div>
                </div>

                {/* Plan 5: Pase VIP Gratuito */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-[24px] p-5 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-600 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
                      {WHOP_CONFIG.plans.paseVipWebinar.badge}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {WHOP_CONFIG.plans.paseVipWebinar.name}
                    </h3>
                    <p className="text-2xl font-extrabold tracking-tight text-neutral-950 font-mono">
                      Gratis
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {WHOP_CONFIG.plans.paseVipWebinar.tagline}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.paseVipWebinar.id)}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm"
                    >
                      Pase Gratuito ($0 MXN)
                    </button>
                  </div>
                </div>
              </div>

              {/* Offer Stack & Bonuses Sync Box */}
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                      Paquete de Valor Completo (Stack de 5 Bonos)
                    </span>
                    <h3 className="text-xl font-bold text-neutral-900 tracking-tight mt-1">
                      Todo lo que incluye tu inscripción oficial a la formación
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-neutral-400 line-through">Valor Total: ${WHOP_CONFIG.offerStack.totalValue.toLocaleString('es-MX')} MXN</span>
                    <p className="text-lg font-bold text-neutral-900">Básico 28h: $25,000 MXN · Completo 48h: $38,000 MXN</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WHOP_CONFIG.offerStack.bonuses.map((bonus, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/70 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900">{bonus.title}</span>
                        <span className="font-mono text-[11px] font-semibold text-neutral-500">${bonus.value.toLocaleString('es-MX')} MXN</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">{bonus.description}</p>
                    </div>
                  ))}
                </div>

                {/* Risk-free Guarantee */}
                <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 flex items-start gap-3 text-xs text-teal-950">
                  <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-teal-900">{WHOP_CONFIG.offerStack.guarantee.title}</p>
                    <p className="text-teal-800 leading-relaxed">{WHOP_CONFIG.offerStack.guarantee.description}</p>
                  </div>
                </div>
              </div>

              {/* Whop Customer Portal Box */}
              <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider">
                      Autogestión de Alumna
                    </span>
                    <span className="text-xs font-mono text-neutral-400">Whop Customer Portal Oficial</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    ¿Ya te inscribiste o tienes una membresía activa en Whop?
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    Accede a tu portal seguro de cliente en Whop para consultar comprobantes de pago, facturación electrónica, actualizar tus tarjetas o administrar tus accesos al Campus Virtual y canales de chat.
                  </p>
                </div>
                <a
                  href={WHOP_CONFIG.customerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-wider rounded-full transition-all shadow-sm flex items-center gap-2 shrink-0"
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

      {/* Verify Member Access Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-1">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-neutral-950">
              Verificar Acceso de Alumna
            </DialogTitle>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Ingresa el correo electrónico con el que compraste en Whop o te registraste en la lista de espera para activar tu sesión en este dispositivo.
            </p>
          </DialogHeader>

          <form onSubmit={handleVerifySubmit} className="space-y-4 mt-2">
            <div>
              <label htmlFor="verify-email" className="block text-xs font-semibold text-neutral-800 mb-1.5 font-mono">
                CORREO ELECTRÓNICO
              </label>
              <input
                id="verify-email"
                type="email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                autoFocus
                disabled={verifying}
              />
            </div>

            {verifyStatus === 'success' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{verifyMessage}</span>
              </div>
            )}

            {verifyStatus === 'not_found' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                <p className="font-semibold text-amber-900">{verifyMessage}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyModalOpen(false);
                      handleOpenCheckout(WHOP_CONFIG.plans.apartado.id);
                    }}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-full font-semibold text-[11px] hover:bg-neutral-800"
                  >
                    Pre-reservar Cupo ($400 MXN)
                  </button>
                  <a
                    href={WHOP_CONFIG.customerPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-full font-medium text-[11px] hover:bg-amber-100/50 flex items-center gap-1"
                  >
                    <span>Ir a Whop</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {verifyStatus === 'error' && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                {verifyMessage}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando membresía...</span>
                  </>
                ) : (
                  <>
                    <span>Verificar Mi Acceso</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500 pt-1">
                ¿Problemas para acceder? Contacta a soporte en{' '}
                <a href="mailto:soporte@camadepilates.com" className="underline hover:text-neutral-900">
                  soporte@camadepilates.com
                </a>
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebappExperience;
