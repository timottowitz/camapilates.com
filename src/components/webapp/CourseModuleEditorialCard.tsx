import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Sparkles, Clock, Calendar } from 'lucide-react';
import { CohortWeekend } from '@/content/certification/cohortsData';

interface CourseModuleEditorialCardProps {
  weekend: CohortWeekend;
  onPreBook: () => void;
  index: number;
}

export const CourseModuleEditorialCard: React.FC<CourseModuleEditorialCardProps> = ({
  weekend,
  onPreBook,
  index,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(weekend.image || weekend.localImage || '');

  const theme = weekend.colorTheme || {
    bg: '#14323D',
    headerGradient: 'from-[#183D4A] via-[#14323D] to-transparent',
    accent: 'text-teal-200',
    badgeBorder: 'border-teal-300/30',
    badgeBg: 'bg-teal-900/40',
    badgeText: 'text-teal-100',
    pillBg: 'bg-teal-50',
    pillText: 'text-teal-800',
  };

  const isBasicAndFull = weekend.weekendNumber <= 2;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-[30px] sm:rounded-[34px] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/10"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Card Header */}
      <div className={`p-6 sm:p-7 pb-4 bg-gradient-to-b ${theme.headerGradient} z-10 space-y-3`}>
        {/* Top meta row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              Fin de Semana {weekend.weekendNumber} · {weekend.dates}
            </span>
            <span className="font-mono text-[10px] text-white/70 hidden sm:inline-block">
              [ {weekend.hours}H PRESENCIALES ]
            </span>
          </div>

          <span
            className={`font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full border uppercase ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}
          >
            {weekend.bracketTag || `[ MÓDULO 0${weekend.weekendNumber} ]`}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
          {weekend.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
          {weekend.description}
        </p>
      </div>

      {/* Visual Center: Editorial Artwork with Blueprint Overlays */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-black/20 flex items-center justify-center">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={weekend.title}
            onError={() => {
              if (weekend.localImage && imgSrc !== weekend.localImage) {
                setImgSrc(weekend.localImage);
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
            loading="lazy"
          />
        )}

        {/* Subtle gradient vignette to merge seamlessly with card base */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Badge tag on image */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] sm:text-[11px] font-medium tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Biomecánica & Cinemática Reformer</span>
          </span>
        </div>

        <div className="absolute top-3 right-4 z-20">
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 font-mono text-[9px] border border-white/10 uppercase">
            {isBasicAndFull ? '28h Básica & 48h Completa' : 'Exclusivo 48h Completa'}
          </span>
        </div>
      </div>

      {/* Key Competencies / Technical Highlights */}
      {weekend.competencies && weekend.competencies.length > 0 && (
        <div className="p-6 sm:p-7 pt-4 pb-4 space-y-2.5 bg-black/15 border-t border-white/10">
          <p className="font-mono text-[10px] text-white/60 uppercase tracking-wider font-semibold">
            // COMPETENCIAS CLAVE EVALUADAS:
          </p>
          <ul className="space-y-1.5 text-xs text-white/90">
            {weekend.competencies.map((item, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Footer Bar */}
      <div className="p-5 sm:p-6 bg-black/30 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3 text-xs text-white/80">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white/60" />
            <span className="font-mono font-bold text-white">{weekend.hours} Horas</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[11px] text-white/80">{weekend.dates}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPreBook}
          className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:shadow-lg active:scale-98"
        >
          <span>Pre-reservar Cupo ($400 MXN)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
