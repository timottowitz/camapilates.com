import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, ArrowRight, Video, Users, Award } from 'lucide-react';
import { CERTIFICATION_COHORTS, WEBINAR_INFO } from '@/content/certification/cohortsData';
import { useConvexAssets } from '@/lib/convexAssets';

interface CertificationWebinarBannerProps {
  city?: 'queretaro' | 'monterrey';
  className?: string;
}

export const CertificationWebinarBanner: React.FC<CertificationWebinarBannerProps> = ({
  city,
  className = '',
}) => {
  const { pilatesGroupClass } = useConvexAssets();
  const isQueretaro = city === 'queretaro';
  const isMonterrey = city === 'monterrey';
  const courseUrl = city ? `/certificacion-pilates/${city}` : '/certificacion-pilates';

  const title = isQueretaro
    ? 'Curso de Pilates Reformer en Querétaro · Noviembre 2026'
    : isMonterrey
      ? 'Curso de Pilates Reformer en Monterrey · Dic 2026 – Ene 2027'
      : 'Curso de Pilates Reformer en Querétaro y Monterrey (2026–2027)';

  const datesSubtitle = isQueretaro
    ? CERTIFICATION_COHORTS.queretaro.fullDatesLabel
    : isMonterrey
      ? CERTIFICATION_COHORTS.monterrey.fullDatesLabel
      : 'Querétaro (Noviembre 2026) y Monterrey (Diciembre 2026 – Enero 2027)';

  return (
    <div
      className={`relative group overflow-hidden rounded-[2rem] bg-[#141210] text-[#EAE8E4] p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 hover:border-[#D9865B]/40 transition-all duration-500 ${className}`}
    >
      {/* Background Image - Group of women training on Pilates Reformers in sunlit boutique studio */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
        <img
          src={pilatesGroupClass || '/images/pilates-group-class.webp'}
          alt="Grupo de mujeres entrenando en clase de Pilates Reformer en estudio boutique"
          className="h-full w-full object-cover object-[center_60%] sm:object-[65%_60%] md:object-[70%_58%] lg:object-[72%_55%] transition-transform duration-700 ease-out group-hover:scale-105"
          loading="eager"
          decoding="async"
        />

        {/* Directional gradient: solid dark vignette on the left behind text, transitioning to clear view of the women & reformers on the right */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#141210]/95 via-[#141210]/75 via-45% to-transparent md:from-[#141210]/95 md:via-[#141210]/70 md:via-50% md:to-transparent" />

        {/* Soft right-edge shadow so buttons stay legible without obscuring the women */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-52 bg-gradient-to-l from-[#141210]/35 to-transparent pointer-events-none" />

        {/* Warm architectural studio ambient glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#D9865B]/15 blur-3xl pointer-events-none" />

        {/* Bottom grounding gradient for metadata pills */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141210]/60 to-transparent pointer-events-none" />
      </div>

      {/* Red/terracotta accent border on hover (matching bento grid style) */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D9865B]/40 rounded-[2rem] transition-colors duration-300 z-20 pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#D9865B] border border-[#D9865B]/30 text-[11px] uppercase tracking-widest font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#EB4C42] animate-pulse"></span>
            <Award className="w-3.5 h-3.5" /> Formación Presencial Oficial · Cupos Limitados
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-white leading-tight mb-2 tracking-tight drop-shadow-sm">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-[#EAE8E4]/90 font-light leading-relaxed mb-5 drop-shadow-sm">
            Certificación presencial intensiva con <strong>Gabi</strong> y <strong>Laura Munive</strong>: Curso Básico (28h · $25,000 MXN) y Curso Completo (48h · $38,000 MXN). Práctica en Reformer, cupos reducidos (12 por sede) y sesión informativa online previa (Info Day · Sábado 26 de Septiembre).
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#EAE8E4]/95">
            <div className="flex items-center gap-1.5 bg-[#D9865B]/20 backdrop-blur-md text-[#F3C5A8] px-3.5 py-1.5 rounded-xl border border-[#D9865B]/40 font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D9865B]" />
              <span>Desde $25,000 MXN · 28h y 48h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-[#D9865B]" />
              <span>{datesSubtitle}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
              <Users className="w-3.5 h-3.5 text-[#D9865B]" />
              <span>12 lugares por ciudad</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link
            to={courseUrl}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#EAE8E4] text-[#2A2624] font-semibold text-xs uppercase tracking-[0.18em] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl group/btn text-center"
          >
            <span>Ver Curso y Fechas</span>
            <ArrowRight className="w-4 h-4 text-[#2A2624] group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/certificacion-pilates/webinar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white/95 text-xs uppercase tracking-wider font-medium hover:bg-white/15 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-300 text-center shadow-lg"
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Info Day Online Gratis (26 Sep)</span>
          </Link>

          <a
            href={`https://wa.me/${WEBINAR_INFO.whatsappSupportNumber}?text=${encodeURIComponent(
              `Hola, me interesa información sobre el curso presencial de Pilates Reformer en ${city || 'Querétaro / Monterrey'} (Básico 28h · $25,000 / Completo 48h · $38,000).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[11px] text-[#EAE8E4]/70 hover:text-white uppercase tracking-wider transition-colors py-0.5"
          >
            Consultar dudas por WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificationWebinarBanner;
