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
} from 'lucide-react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import { WhopCommunityEmbed } from '@/components/webapp/WhopCommunityEmbed';
import { WhopForumReader } from '@/components/webapp/WhopForumReader';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';
import { EditorialFeatureCards } from '@/components/webapp/EditorialFeatureCards';
import { WEBINAR_INFO, getGoogleCalendarUrl, CERTIFICATION_COHORTS } from '@/content/certification/cohortsData';
import { getOrigin } from '@/lib/seo';

type WebappTab = 'campus' | 'comunidad' | 'webinar' | 'recursos' | 'pagos';

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
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string>(WHOP_CONFIG.plans.apartado.id);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

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
        <title>Campus Virtual & Comunidad Whop | CAMA Pilates</title>
        <meta
          name="description"
          content="Campus virtual oficial de certificación Pilates Reformer: comunidad Whop en vivo, temario de 28h y 48h, aula de masterclass y biblioteca clínica."
        />
        <link rel="canonical" href={`${origin}/app`} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-[#F8F8F6] text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white font-sans">
        {/* Top App Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo & Portal Badge */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-extrabold text-xl tracking-tight text-neutral-950 group-hover:text-neutral-700 transition-colors">
                  CAMA
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-semibold font-sans">
                  Pilates
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-200">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Campus Virtual & Whop
                </span>
                <Link
                  to="/certificacion-pilates"
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors ml-2"
                >
                  <span>• Certificación Presencial</span>
                </Link>
              </div>
            </div>

            {/* Quick Live Masterclass Notice */}
            <div className="hidden md:flex items-center gap-2.5 bg-neutral-50 px-3.5 py-1.5 rounded-full border border-neutral-200/80 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-600">
                Masterclass en Vivo: <strong className="text-neutral-900">{WEBINAR_INFO.date}</strong>
              </span>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 hover:text-black font-semibold underline ml-1"
              >
                + Calendar
              </a>
            </div>

            {/* User status & Primary CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {enrollmentData ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">{enrollmentData.fullName || 'Alumna Verificada'}</span>
                  <span className="hidden md:inline text-emerald-600">· {enrollmentData.planName || 'Lugar Confirmado'}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="ml-1 text-[10px] text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                    title="Cerrar sesión en este navegador"
                  >
                    (Salir)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors font-medium border border-transparent hover:border-neutral-200"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>¿Ya tienes cuenta?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(WHOP_CONFIG.plans.apartado.id)}
                    className="px-4 sm:px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Pre-reservar Cupo ($400 MXN)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <a
                href={WHOP_CONFIG.customerPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium border border-neutral-200 shadow-xs transition-all"
                title="Acceder a tus membresías y recibos en Whop"
              >
                <UserCheck className="w-3.5 h-3.5 text-neutral-600" />
                <span>Mi Portal Whop</span>
              </a>

              <a
                href={WHOP_CONFIG.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                title="Abrir Whop en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* HERO SECTION — Matching Screenshot 1 Branding & Typography */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 sm:pt-14 pb-6 w-full">
          {/* Domain micro metadata */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C8542A]" />
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
              {/* Cohort selector header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
                    <span>// CURRICULUM SYLLABUS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                    Modalidades de Formación Presencial (28h Básica / 48h Completa)
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                    Elige entre el Curso Básico de 28 horas ($25,000 MXN · 2 fines de semana) o la Certificación Profesional Completa de 48 horas ($38,000 MXN · 4 fines de semana).
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-full border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setSelectedCohort('queretaro')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCohort === 'queretaro'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Querétaro (Nov 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCohort('monterrey')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCohort === 'monterrey'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Monterrey (Dic-Ene)
                  </button>
                </div>
              </div>

              {/* Syllabus Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentCohortData.weekends.map((weekend) => (
                  <div
                    key={weekend.weekendNumber}
                    className="bg-white border border-neutral-200/90 rounded-[24px] p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 font-mono text-[11px] font-semibold uppercase tracking-wider">
                          Fin de Semana {weekend.weekendNumber} · {weekend.dates}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                          {weekend.hours} Horas
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                        {weekend.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {weekend.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                      <span className="flex items-center gap-1.5 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {weekend.weekendNumber <= 2 ? 'Curso Básico & Completo' : 'Exclusivo Certificación Completa'}
                      </span>
                      <span className="font-mono font-bold text-neutral-900">{weekend.hours} Horas</span>
                    </div>
                  </div>
                ))}
              </div>

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
                        Formación clínica y pedagógica exhaustiva. Incluye tratamiento de patologías de columna (hernias, lumbalgias, escoliosis), embarazo, metodología de cueing, examen práctico individual, aval curricular y 15% de descuento en camas CAMA.
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
                    alt="Comunidad Whop CAMA Pilates México"
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
                      Comunidad de Alumnas e Instructoras CAMA Pilates
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
                    Valores & Código de Ética de la Comunidad CAMA Pilates
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
