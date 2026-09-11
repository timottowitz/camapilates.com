import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Calendar,
  Mail,
  ArrowRight,
  Clock,
  Bell,
  User,
  Phone,
  MessageSquare,
  Sparkle,
} from 'lucide-react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';

interface WhopCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  planName?: string;
  price?: number;
  cohort?: string;
  prefill?: {
    email?: string;
    fullName?: string;
    phone?: string;
  };
}

export const WhopCheckoutModal: React.FC<WhopCheckoutModalProps> = ({
  isOpen,
  onClose,
  planId = WHOP_CONFIG.plans.apartado.id,
  planName = WHOP_CONFIG.plans.apartado.name,
  price = WHOP_CONFIG.plans.apartado.price,
  cohort = 'queretaro-nov-2026',
  prefill = {},
}) => {
  const [completed, setCompleted] = useState(false);
  const [activePlanId, setActivePlanId] = useState(planId);
  const [embedError, setEmbedError] = useState(false);

  // Waitlist form state
  const [waitlistEmail, setWaitlistEmail] = useState(prefill.email || '');
  const [waitlistName, setWaitlistName] = useState(prefill.fullName || '');
  const [waitlistPhone, setWaitlistPhone] = useState(prefill.phone || '');
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');

  const recordPayment = useMutation(api.whopPayments.recordPayment);
  const submitWaitlist = useMutation(api.certificationPreRegistrations.submitServiceWaitlist);

  // Sync if prop changes
  React.useEffect(() => {
    setActivePlanId(planId);
    setCompleted(false);
    setEmbedError(false);
    setWaitlistSubmitted(false);
    setWaitlistError('');
    if (prefill.email) setWaitlistEmail(prefill.email);
    if (prefill.fullName) setWaitlistName(prefill.fullName);
    if (prefill.phone) setWaitlistPhone(prefill.phone);
  }, [planId, isOpen, prefill.email, prefill.fullName, prefill.phone]);

  const activePlan =
    Object.values(WHOP_CONFIG.plans).find((p) => p.id === activePlanId) ||
    WHOP_CONFIG.plans.apartado;

  const handleComplete = async (purchasedPlanId: string, receiptId?: string, result?: any) => {
    try {
      await recordPayment({
        email: prefill.email || 'alumna@camadepilates.com',
        fullName: prefill.fullName,
        phone: prefill.phone,
        planId: purchasedPlanId,
        planName: activePlan.name,
        amount: activePlan.price,
        currency: 'MXN',
        receiptId: receiptId || (result as any)?.receipt_id,
        cohort,
        source: 'whop-modal',
      });

      // Save local access token for instant webapp unlocks
      try {
        localStorage.setItem(
          'cama_pilates_whop_enrollment',
          JSON.stringify({
            enrolled: true,
            planId: purchasedPlanId,
            planName: activePlan.name,
            email: prefill.email,
            cohort,
            date: new Date().toISOString(),
          })
        );
      } catch (_) {}

      setCompleted(true);
    } catch (e) {
      console.error('Error saving payment record:', e);
      setCompleted(true);
    }
  };

  const handleWebinarChannel = () => {
    onClose();
    const el = document.getElementById('webinar-section') || document.getElementById('webinar-rsvp');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/certificacion-pilates/webinar';
    }
  };

  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim() || !waitlistEmail.includes('@')) {
      setWaitlistError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmittingWaitlist(true);
    setWaitlistError('');

    try {
      await submitWaitlist({
        email: waitlistEmail.trim(),
        fullName: waitlistName.trim() || undefined,
        phone: waitlistPhone.trim() || undefined,
        serviceOrPlan: `${activePlan.name} ($${activePlan.price.toLocaleString('es-MX')} MXN)`,
        cohort,
        source: 'service-waitlist-modal',
      });
      setWaitlistSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting waitlist:', err);
      setWaitlistError(err?.message || 'Ocurrió un error al guardar tu registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/app?payment=success&plan=${encodeURIComponent(activePlan.id)}`
    : 'https://camadepilates.com/app?payment=success';

  const paymentsDeactivated = !WHOP_CONFIG.paymentsEnabled;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col bg-white border border-neutral-200 text-neutral-900 p-0 overflow-hidden shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-200/80 bg-neutral-50/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={WHOP_CONFIG.assets.avatarUrl}
                alt="CAMA Pilates"
                className="w-7 h-7 rounded-lg object-cover border border-neutral-200"
              />
              {paymentsDeactivated ? (
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Próximamente · Servicio en Construcción
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-semibold uppercase tracking-wider">
                  Whop Secure Checkout
                </span>
              )}
            </div>
            <div className="text-right">
              {paymentsDeactivated ? (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold uppercase tracking-wider">
                  Cobros Desactivados
                </span>
              ) : (
                <span className="text-2xl font-bold tracking-tight text-neutral-900">
                  ${activePlan.price.toLocaleString('es-MX')} MXN
                </span>
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900 mt-2">
            {paymentsDeactivated
              ? 'Estamos construyendo este servicio en este momento'
              : activePlan.name}
          </DialogTitle>

          <DialogDescription className="text-xs text-neutral-600 mt-1 leading-relaxed">
            {paymentsDeactivated
              ? 'Estamos afinando la plataforma oficial de pagos y la logística de asignación de Reformers individuales para Querétaro y Monterrey. En este momento ningún cobro será procesado.'
              : activePlan.tagline}
          </DialogDescription>

          {/* Quick Plan Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-2 border-t border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.apartado.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.apartado.id ||
                activePlanId === WHOP_CONFIG.plans.apartadoQueretaro.id ||
                activePlanId === WHOP_CONFIG.plans.apartadoMonterrey.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.apartado.id || activePlanId === WHOP_CONFIG.plans.apartadoQueretaro.id || activePlanId === WHOP_CONFIG.plans.apartadoMonterrey.id ? 'text-white' : 'text-neutral-900'}`}>Pre-reserva</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.apartado.id || activePlanId === WHOP_CONFIG.plans.apartadoQueretaro.id || activePlanId === WHOP_CONFIG.plans.apartadoMonterrey.id ? 'text-orange-300' : 'text-orange-600'}`}>$400 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.apartado.id || activePlanId === WHOP_CONFIG.plans.apartadoQueretaro.id || activePlanId === WHOP_CONFIG.plans.apartadoMonterrey.id ? 'text-neutral-300' : 'text-neutral-400'}`}>12 cupos / sede</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.cursoBasico.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.cursoBasico.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.cursoBasico.id ? 'text-white' : 'text-neutral-900'}`}>Básico 28h</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.cursoBasico.id ? 'text-orange-300' : 'text-orange-600'}`}>$25,000 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.cursoBasico.id ? 'text-neutral-300' : 'text-neutral-400'}`}>2 Fines de Sem</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-white' : 'text-neutral-900'}`}>Completo 48h</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-orange-300' : 'text-orange-600'}`}>$38,000 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-neutral-300' : 'text-neutral-400'}`}>4 Fines de Sem</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.cursoOnline.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.cursoOnline.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.cursoOnline.id ? 'text-white' : 'text-neutral-900'}`}>Curso Digital</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.cursoOnline.id ? 'text-orange-300' : 'text-orange-600'}`}>$1,999 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.cursoOnline.id ? 'text-neutral-300' : 'text-neutral-400'}`}>10 Módulos Whop</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.paseVipWebinar.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.paseVipWebinar.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.paseVipWebinar.id ? 'text-white' : 'text-neutral-900'}`}>Pase VIP</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.paseVipWebinar.id ? 'text-emerald-300' : 'text-emerald-600'}`}>Gratis</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.paseVipWebinar.id ? 'text-neutral-300' : 'text-neutral-400'}`}>Acceso Masterclass</p>
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          {paymentsDeactivated ? (
            /* SERVICE UNDER CONSTRUCTION: 2 CHANNELS (WEBINAR + EMAIL WAITLIST) */
            <div className="space-y-6">
              {/* Selected Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                      Servicio Solicitado
                    </div>
                    <div className="text-sm font-bold text-neutral-900">
                      {activePlan.name} · ${activePlan.price.toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white border border-neutral-300 text-neutral-700 font-semibold uppercase tracking-wider">
                  {cohort.includes('monterrey') ? 'Sede Monterrey' : 'Sede Querétaro'}
                </span>
              </div>

              {/* Two Official Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHANNEL 1: ORIENTATION WEBINAR */}
                <div className="p-5 rounded-2xl bg-[#F8F8F6] border-2 border-neutral-900 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                        Canal 1 · Sin Costo
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-800" />
                        Webinar de Orientación
                      </h4>
                      <p className="text-[11px] font-mono font-semibold text-neutral-700 mt-1">
                        Sábado 26 Sept · 11:00 AM CST (En Vivo)
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Conoce a detalle los programas de 28h y 48h, resuelve preguntas en vivo con Gabi y Laura Munive, y conoce el estudio antes de apartar.
                    </p>

                    <div className="pt-2 text-[11px] text-neutral-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Revisión de temarios oficiales</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sesión de preguntas y respuestas 1-a-1</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={handleWebinarChannel}
                      className="w-full py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Reservar Mi Lugar Gratis en el Webinar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CHANNEL 2: PAID SERVICE WAITLIST (EMAIL NOTIFICATION) */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-300 flex flex-col justify-between shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        Canal 2 · Notificación Inmediata
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      Avisarme Cuando Esté Listo
                    </h4>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Ingresa tu correo para recibir una notificación prioritaria en cuanto habilitemos el pago de $400 MXN para congelar tu lugar.
                    </p>

                    {waitlistSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 mt-2">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                        <div className="text-xs font-bold text-emerald-950">
                          ¡Anotada en la lista de espera!
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-snug">
                          Te hemos guardado en nuestra base prioritaria. Recibirás un correo a <strong className="font-semibold">{waitlistEmail}</strong> en cuanto abramos inscripciones.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitWaitlist} className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                            Tu Correo Electrónico *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              id="modal-waitlist-email"
                              type="email"
                              required
                              value={waitlistEmail}
                              onChange={(e) => setWaitlistEmail(e.target.value)}
                              placeholder="alumna@ejemplo.com"
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                              Nombre (Opcional)
                            </label>
                            <input
                              type="text"
                              value={waitlistName}
                              onChange={(e) => setWaitlistName(e.target.value)}
                              placeholder="Tu nombre"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                              WhatsApp (Opcional)
                            </label>
                            <input
                              type="tel"
                              value={waitlistPhone}
                              onChange={(e) => setWaitlistPhone(e.target.value)}
                              placeholder="10 dígitos"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                          </div>
                        </div>

                        {waitlistError && (
                          <p className="text-[11px] text-red-600 font-medium">
                            {waitlistError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmittingWaitlist}
                          className="w-full mt-2 py-3 rounded-full bg-[#111111] hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                          {isSubmittingWaitlist ? (
                            <span>Guardando en lista...</span>
                          ) : (
                            <>
                              <span>Avisarme cuando esté listo</span>
                              <Mail className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Reassurance & WhatsApp Help */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CAMA Pilates (Edelweiss) · Respaldo y atención directa
                </span>
                <a
                  href="https://wa.me/528120274299?text=Hola%2C%20tengo%20dudas%20sobre%20la%20certificaci%C3%B3n%20y%20la%20lista%20de%20espera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-800 hover:text-neutral-950 font-medium underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Preguntar directo a Gabi y Laura por WhatsApp
                </a>
              </div>
            </div>
          ) : completed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
                ¡Tu lugar y acceso a la Comunidad Whop están confirmados!
              </h3>

              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                Hemos enviado tu recibo oficial a tu correo. Tu cuenta ha sido activada en el nuevo campus virtual y comunidad oficial de Whop.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/app"
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  Entrar al Campus Virtual →
                </a>
                <a
                  href={WHOP_CONFIG.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-neutral-300 hover:border-neutral-400 text-neutral-800 font-medium rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  Abrir Whop Community
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : embedError ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
              <h4 className="text-lg font-bold text-neutral-900">
                Completar pago seguro en Whop
              </h4>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Haz clic en el enlace para abrir la pasarela protegida de Whop con Apple Pay, Google Pay o tarjeta bancaria:
              </p>
              <div className="pt-2">
                <a
                  href={activePlan.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs uppercase tracking-wider rounded-full transition-all shadow-md"
                >
                  Abrir Checkout Seguro en Whop (${activePlan.price.toLocaleString('es-MX')} MXN)
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden min-h-[460px] bg-neutral-50 border border-neutral-200">
                <WhopCheckoutEmbed
                  key={activePlan.id}
                  planId={activePlan.id}
                  returnUrl={returnUrl}
                  locale="es"
                  theme="light"
                  themeOptions={{
                    accentColor: 'amber',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    buttonText: activePlan.price === 0 ? 'Obtener Pase Gratuito' : 'Confirmar Pago Seguro',
                  }}
                  onComplete={handleComplete}
                  prefill={prefill}
                  fallback={
                    <div className="p-8 text-center space-y-4">
                      <p className="text-xs text-neutral-500">Cargando pasarela de pago protegida de Whop...</p>
                      <a
                        href={activePlan.directLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-full"
                      >
                        Continuar directamente en Whop →
                      </a>
                    </div>
                  }
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Garantía de Satisfacción 100% (Riesgo Cero)
                </span>
                <a
                  href={activePlan.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-neutral-900 font-medium underline flex items-center gap-1"
                >
                  ¿Problemas al cargar? Abrir directo en Whop
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
