import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Lock, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
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
  const recordPayment = useMutation(api.whopPayments.recordPayment);

  // Sync if prop changes
  React.useEffect(() => {
    setActivePlanId(planId);
    setCompleted(false);
    setEmbedError(false);
  }, [planId, isOpen]);

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

  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/app?payment=success&plan=${encodeURIComponent(activePlan.id)}`
    : 'https://camadepilates.com/app?payment=success';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col bg-white border border-neutral-200 text-neutral-900 p-0 overflow-hidden shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-200/80 bg-neutral-50/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-semibold uppercase tracking-wider">
                Whop Secure Checkout
              </span>
              <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Cifrado 256-bit
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-neutral-900">
                ${activePlan.price.toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900 mt-2">
            {activePlan.name}
          </DialogTitle>
          <p className="text-xs text-neutral-600 mt-1">
            {activePlan.tagline}
          </p>

          {/* Quick Plan Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-2 border-t border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.apartado.id)}
              className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.apartado.id
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.apartado.id ? 'text-white' : 'text-neutral-900'}`}>Apartar Cupo</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.apartado.id ? 'text-orange-300' : 'text-orange-600'}`}>$4,500 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.apartado.id ? 'text-neutral-300' : 'text-neutral-400'}`}>Congela 50% OFF</p>
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
              <div className={`text-[11px] font-bold ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-white' : 'text-neutral-900'}`}>Colegiatura Total</div>
              <div className={`font-mono text-xs font-semibold ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-orange-300' : 'text-orange-600'}`}>$19,900 MXN</div>
              <p className={`text-[9px] mt-0.5 ${activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id ? 'text-neutral-300' : 'text-neutral-400'}`}>Ahorro $19,900</p>
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
          {completed ? (
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
