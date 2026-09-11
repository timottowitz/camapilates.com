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
      <DialogContent className="max-w-2xl bg-[#1C1917] border-stone-800 text-stone-100 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-stone-800/80 bg-[#24201D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[11px] font-semibold uppercase tracking-wider">
                Whop Secure Checkout
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                Cifrado 256-bit
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-serif font-bold text-amber-200">
                ${activePlan.price.toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>

          <DialogTitle className="text-lg font-serif italic text-stone-100 mt-2">
            {activePlan.name}
          </DialogTitle>
          <p className="text-xs text-stone-400 mt-1">
            {activePlan.tagline}
          </p>

          {/* Quick Plan Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-2 border-t border-stone-800/60">
            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.apartado.id)}
              className={`text-left p-2 rounded-lg border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.apartado.id
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-200 font-semibold'
                  : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="text-[11px] font-semibold text-stone-200">Apartar Cupo</div>
              <div className="text-amber-300 font-bold text-xs">$4,500 MXN</div>
              <p className="text-[9px] text-stone-400 mt-0.5">Congela 50% OFF</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
              className={`text-left p-2 rounded-lg border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.colegiaturaCompleta.id
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-200 font-semibold'
                  : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="text-[11px] font-semibold text-stone-200">Colegiatura Total</div>
              <div className="text-amber-300 font-bold text-xs">$19,900 MXN</div>
              <p className="text-[9px] text-stone-400 mt-0.5">Ahorro $19,900</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.cursoOnline.id)}
              className={`text-left p-2 rounded-lg border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.cursoOnline.id
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-200 font-semibold'
                  : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="text-[11px] font-semibold text-stone-200">Curso Digital</div>
              <div className="text-amber-300 font-bold text-xs">$1,999 MXN</div>
              <p className="text-[9px] text-stone-400 mt-0.5">10 Módulos Whop</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePlanId(WHOP_CONFIG.plans.paseVipWebinar.id)}
              className={`text-left p-2 rounded-lg border text-xs transition-all ${
                activePlanId === WHOP_CONFIG.plans.paseVipWebinar.id
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-200 font-semibold'
                  : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-700'
              }`}
            >
              <div className="text-[11px] font-semibold text-stone-200">Pase VIP</div>
              <div className="text-emerald-400 font-bold text-xs">Gratis</div>
              <p className="text-[9px] text-stone-400 mt-0.5">Acceso Masterclass</p>
            </button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {completed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-serif italic text-amber-200">
                ¡Tu lugar y acceso a la Comunidad Whop están confirmados!
              </h3>

              <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                Hemos enviado tu recibo oficial a tu correo. Tu cuenta ha sido activada en el nuevo campus virtual y comunidad oficial de Whop.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/app"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold rounded-full text-xs uppercase tracking-widest transition-all"
                >
                  Entrar a la Webapp / Campus →
                </a>
                <a
                  href={WHOP_CONFIG.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-stone-700 hover:border-stone-500 text-stone-200 font-medium rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  Abrir Whop Community
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : embedError ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="text-lg font-medium text-stone-200">
                Completar pago seguro en Whop
              </h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Haz clic en el enlace para abrir la pasarela protegida de Whop con Apple Pay, Google Pay o tarjeta bancaria:
              </p>
              <div className="pt-2">
                <a
                  href={activePlan.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-lg"
                >
                  Abrir Checkout Seguro en Whop (${activePlan.price.toLocaleString('es-MX')} MXN)
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden min-h-[460px] bg-stone-950/80 border border-stone-800/80">
                <WhopCheckoutEmbed
                  planId={activePlan.id}
                  returnUrl={returnUrl}
                  theme="dark"
                  themeOptions={{
                    accentColor: 'amber',
                    backgroundColor: '#1C1917',
                    borderRadius: 12,
                    buttonText: activePlan.price === 0 ? 'Obtener Pase Gratuito' : 'Confirmar Pago Seguro',
                  }}
                  onComplete={handleComplete}
                  prefill={prefill}
                  fallback={
                    <div className="p-8 text-center space-y-4">
                      <p className="text-xs text-stone-400">Cargando pasarela de pago protegida de Whop...</p>
                      <a
                        href={activePlan.directLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-stone-900 text-xs font-semibold rounded-full"
                      >
                        Continuar directamente en Whop →
                      </a>
                    </div>
                  }
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-800/40">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Garantía de Satisfacción 100% (Riesgo Cero)
                </span>
                <a
                  href={activePlan.directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1"
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
