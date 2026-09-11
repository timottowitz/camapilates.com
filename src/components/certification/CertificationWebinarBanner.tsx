import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Sparkles, ArrowRight, Video, Users } from 'lucide-react';
import { CERTIFICATION_COHORTS, WEBINAR_INFO } from '@/content/certification/cohortsData';

interface CertificationWebinarBannerProps {
  city?: 'queretaro' | 'monterrey';
  className?: string;
}

export const CertificationWebinarBanner: React.FC<CertificationWebinarBannerProps> = ({
  city,
  className = '',
}) => {
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
    <div className={`relative overflow-hidden rounded-3xl bg-[#2A2624] text-[#EAE8E4] p-6 sm:p-8 shadow-xl border border-[#3E2723] ${className}`}>
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#D9865B]/15 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D9865B] text-[11px] uppercase tracking-widest font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Video className="w-3 h-3" /> Masterclass Online Gratuita · Vía Google Meet · Sábado 26 de Septiembre
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif italic text-white leading-tight mb-2">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-[#EAE8E4]/80 font-light leading-relaxed mb-4">
            Masterclass <strong>100% gratuita y online</strong> de orientación con <strong>Gabi</strong> y <strong>Laura Munive</strong>. Conoce el Curso Básico (28h · $25,000 MXN) y el Curso Completo (48h · $38,000 MXN) y asegura 1 de los 12 cupos presenciales por sede.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#EAE8E4]/90">
            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso 100% Gratuito ($0 MXN)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#D9865B]" />
              <span>{datesSubtitle}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Users className="w-3.5 h-3.5 text-[#D9865B]" />
              <span>12 lugares por ciudad</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link
            to="/certificacion-pilates/webinar"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-[#EAE8E4] text-[#2A2624] font-medium text-xs uppercase tracking-[0.18em] hover:bg-white transition-all duration-300 shadow-md group"
          >
            <span>Registrarme Gratis al Webinar</span>
            <ArrowRight className="w-4 h-4 text-[#2A2624] group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href={`https://wa.me/${WEBINAR_INFO.whatsappSupportNumber}?text=${encodeURIComponent(
              `Hola, vi la convocatoria para el curso de Pilates en ${city || 'Querétaro / Monterrey'} con Gabi y Laura Munive. Me interesa información sobre el Curso Básico (28h · $25,000) y el Curso Completo (48h · $38,000).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white/90 text-xs uppercase tracking-wider hover:bg-white/10 transition-colors text-center"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificationWebinarBanner;
