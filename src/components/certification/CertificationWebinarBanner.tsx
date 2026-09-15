import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, ArrowRight, Video, Users } from 'lucide-react';
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
      className={`relative group overflow-hidden rounded-[2rem] bg-[#1a1715] text-[#EAE8E4] p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10 hover:border-[#D9865B]/40 transition-all duration-500 ${className}`}
    >
      {/* Background Image - Group of women training in Pilates Reformer class */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
        <img
          src={pilatesGroupClass}
          alt="Grupo de mujeres entrenando en clase de Pilates Reformer"
          className="h-full w-full object-cover object-[center_60%] md:object-[center_45%] lg:object-[center_40%] transition-transform duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-105"
          loading="lazy"
        />
        {/* Layer 1: Base dark tint for overall contrast balance */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Layer 2: Editorial directional gradient - deep dark vignette behind text, opening up to reveal the women & sunlit studio on the right */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#141210]/95 via-[#141210]/85 to-[#141210]/35 md:from-[#141210]/95 md:via-[#141210]/80 md:to-[#141210]/30" />

        {/* Layer 3: Warm architectural studio glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-[#D9865B]/20 blur-3xl pointer-events-none" />

        {/* Layer 4: Bottom shadow for grounding text & badge pills */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#141210]/80 to-transparent pointer-events-none" />
      </div>

      {/* Red/terracotta accent border on hover (matching bento grid style) */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D9865B]/40 rounded-[2rem] transition-colors duration-300 z-20 pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#D9865B] border border-[#D9865B]/30 text-[11px] uppercase tracking-widest font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Video className="w-3 h-3" /> Info Day Online Gratuito · Sábado 26 de Septiembre
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-white leading-tight mb-2 tracking-tight drop-shadow-sm">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-[#EAE8E4]/90 font-light leading-relaxed mb-5 drop-shadow-sm">
            Sesión informativa (Info Day) <strong>100% gratuita y online</strong> con <strong>Gabi</strong> y <strong>Laura Munive</strong> para explicar los próximos cursos presenciales: Curso Básico (28h · $25,000 MXN) y Curso Completo (48h · $38,000 MXN), fechas, sedes y resolución de dudas.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#EAE8E4]/95">
            <div className="flex items-center gap-1.5 bg-emerald-500/25 backdrop-blur-md text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400/40 font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso 100% Gratuito ($0 MXN)</span>
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
            to="/certificacion-pilates/webinar"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#EAE8E4] text-[#2A2624] font-semibold text-xs uppercase tracking-[0.18em] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl group/btn"
          >
            <span>Registrarme Gratis al Info Day</span>
            <ArrowRight className="w-4 h-4 text-[#2A2624] group-hover/btn:translate-x-1 transition-transform" />
          </Link>

          <a
            href={`https://wa.me/${WEBINAR_INFO.whatsappSupportNumber}?text=${encodeURIComponent(
              `Hola, vi la convocatoria para el curso de Pilates en ${city || 'Querétaro / Monterrey'} con Gabi y Laura Munive. Me interesa información sobre el Curso Básico (28h · $25,000) y el Curso Completo (48h · $38,000).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white/95 text-xs uppercase tracking-wider font-medium hover:bg-white/15 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-300 text-center shadow-lg"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificationWebinarBanner;
