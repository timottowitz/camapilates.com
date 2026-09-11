import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Video,
  Gift,
  ArrowRight,
  Flame,
  Clock,
  Lock,
} from 'lucide-react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import { WhopCheckoutModal } from '@/components/whop/WhopCheckoutModal';

interface IrresistibleOfferStackProps {
  city?: 'queretaro' | 'monterrey';
  className?: string;
  onOpenModal?: (planId: string) => void;
}

export const IrresistibleOfferStack: React.FC<IrresistibleOfferStackProps> = ({
  city = 'queretaro',
  className = '',
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const cohortName = city === 'queretaro' ? 'Querétaro (Noviembre 2026)' : 'Monterrey (Dic 2026 – Ene 2027)';
  const cohortKey = city === 'queretaro' ? 'queretaro-nov-2026' : 'monterrey-dec-jan-2026-2027';

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setModalOpen(true);
  };

  const icons = [Award, Users, BookOpen, Video, Gift, Flame];

  return (
    <section className={`py-16 bg-[#161412] text-stone-100 relative overflow-hidden rounded-3xl border border-stone-800 ${className}`}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header Badge */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oferta Exclusiva Webinar & Lista de Espera · 50% OFF</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif italic text-stone-100 leading-tight">
            La Oferta Completa de Certificación Reformer
          </h2>

          <p className="text-stone-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Diseñada con el estándar de formación más riguroso de México, integrando soporte clínico, mentoría de negocio y comunidad de por vida en Whop.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-amber-200/90 bg-stone-900/80 px-4 py-1 rounded-full border border-stone-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Cohorte Oficial: <strong>{cohortName}</strong> · Solo 12 cupos disponibles</span>
          </div>
        </div>

        {/* The Value Stack List */}
        <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-6 md:p-8 space-y-5 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
              Desglose de Componentes & Bonos
            </span>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
              Valor Real de Mercado
            </span>
          </div>

          <div className="divide-y divide-stone-800/60 space-y-4">
            {WHOP_CONFIG.offerStack.bonuses.map((item, index) => {
              const IconComponent = icons[index % icons.length];
              return (
                <div key={index} className="pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-stone-200 text-sm md:text-base">
                          {item.title}
                        </h4>
                        {item.isCore && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-950 uppercase">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="md:text-right shrink-0">
                    <span className="text-sm font-semibold text-stone-300">
                      ${item.value.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Value Summary Bar */}
          <div className="border-t-2 border-stone-700/80 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-950/60 p-6 rounded-xl">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400">
                Valor Total del Programa Completo
              </p>
              <p className="text-2xl font-serif line-through text-stone-500">
                ${WHOP_CONFIG.offerStack.totalValue.toLocaleString('es-MX')} MXN
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Cupos Limitados por Sede (12 Máx)
              </span>
              <p className="text-xs text-stone-400">Inversión Directa Oficial</p>
              <p className="text-2xl md:text-3xl font-serif font-bold text-amber-300">
                ${WHOP_CONFIG.plans.cursoBasico.price.toLocaleString('es-MX')} (28h) · ${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')} (48h)
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards with Whop Checkout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* Card 1: Apartado Oficial */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-400/40 rounded-2xl p-6 relative flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono uppercase tracking-wider rounded-full">
                  Asegurar Cupo
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif italic text-stone-100">
                  Apartado Oficial de Lugar
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Congela tu cupo para el Curso Básico (28h) o la Certificación Completa (48h).
                </p>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-amber-300">
                    ${WHOP_CONFIG.plans.apartado.price.toLocaleString('es-MX')}
                  </span>
                  <span className="text-xs text-stone-400 uppercase">MXN Anticipo</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Resto liquidable antes del inicio de tu cohorte.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>1 de los 12 cupos exclusivos asegurado.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Acceso inmediato a la Comunidad Whop.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Válido para Querétaro o Monterrey.</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-stone-800">
              <button
                type="button"
                onClick={() => handleSelectPlan(WHOP_CONFIG.plans.apartado.id)}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Apartar Lugar ($4,500 MXN)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Curso Básico 28h */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 relative flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-mono uppercase tracking-wider rounded-full">
                  2 Fines de Sem · 28 Horas
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif italic text-stone-100">
                  Curso Básico Reformer
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Repertorio esencial e intermedio, biomecánica y máquina individual.
                </p>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-stone-100">
                    ${WHOP_CONFIG.plans.cursoBasico.price.toLocaleString('es-MX')}
                  </span>
                  <span className="text-xs text-stone-400 uppercase">MXN Contado</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Incluye 28h presenciales y campus virtual en Whop.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>28 horas presenciales en máquina propia.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Manual de repertorio y biomecánica esencial.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Constancia de 28 horas avalada por CAMA.</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-stone-800">
              <button
                type="button"
                onClick={() => handleSelectPlan(WHOP_CONFIG.plans.cursoBasico.id)}
                className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs uppercase tracking-widest rounded-xl transition-all border border-stone-700 flex items-center justify-center gap-2"
              >
                <span>Inscribirme a Básico ($25,000 MXN)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Certificación Completa 48h */}
          <div className="bg-gradient-to-b from-stone-900 to-black border-2 border-amber-400 rounded-2xl p-6 relative flex flex-col justify-between shadow-2xl">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
              Recomendado
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono uppercase tracking-wider rounded-full">
                  4 Fines de Sem · 48 Horas
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif italic text-stone-100">
                  Certificación Completa
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Patologías de columna, metodología de cueing y acreditación docente.
                </p>
              </div>

              <div className="py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-amber-300">
                    ${WHOP_CONFIG.plans.colegiaturaCompleta.price.toLocaleString('es-MX')}
                  </span>
                  <span className="text-xs text-stone-400 uppercase">MXN Contado</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Formación profesional completa con aval curricular oficial.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>48 horas presenciales intensivas (4 fines de semana).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Patologías clínicas, modificaciones y poblaciones especiales.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Examen práctico, certificación oficial y bolsa de trabajo.</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-5 border-t border-stone-800">
              <button
                type="button"
                onClick={() => handleSelectPlan(WHOP_CONFIG.plans.colegiaturaCompleta.id)}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Inscribirme a Completa ($38,000 MXN)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Fladlien Risk-Reversal Guarantee Box */}
        <div className="mt-10 bg-[#1E1B18] border border-stone-700/60 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-serif italic text-amber-200">
              {WHOP_CONFIG.offerStack.guarantee.title}
            </h4>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              {WHOP_CONFIG.offerStack.guarantee.description}
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Whop Checkout Modal */}
      <WhopCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        planId={selectedPlanId || WHOP_CONFIG.plans.apartado.id}
        cohort={cohortKey}
      />
    </section>
  );
};
