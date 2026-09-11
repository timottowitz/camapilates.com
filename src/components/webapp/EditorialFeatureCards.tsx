import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface EditorialFeatureCardsProps {
  onSelectTab: (tabId: 'campus' | 'comunidad' | 'webinar') => void;
  activeTab: string;
}

export const EditorialFeatureCards: React.FC<EditorialFeatureCardsProps> = ({
  onSelectTab,
  activeTab,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
      {/* CARD 1: FORMACIÓN 28H / 48H (SLATE TEAL) */}
      <div
        onClick={() => onSelectTab('campus')}
        className={`group relative flex flex-col justify-between rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-[#14323D] ${
          activeTab === 'campus' ? 'ring-2 ring-neutral-900 shadow-xl' : 'shadow-md'
        }`}
        style={{ minHeight: '520px' }}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-[#183D4A] via-[#14323D] to-transparent z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Formación 28h / 48h
            </h3>
            <span className="font-mono text-[10px] font-medium text-teal-100/90 tracking-wider px-2.5 py-1 rounded-full border border-teal-300/30 bg-teal-900/30 uppercase">
              [ 28H $25K · 48H $38K ]
            </span>
          </div>
          <p className="text-xs text-teal-100/80 leading-relaxed max-w-[260px]">
            Curso Básico (28h) y Certificación Completa (48h) con Reformer individual exclusivo.
          </p>
        </div>

        {/* Visual / Blueprint Schematic Overlay */}
        <div className="relative flex-1 w-full overflow-hidden flex items-end justify-center min-h-[360px]">
          {/* Subtle Background Portrait Silhouette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E25] via-[#102B35] to-[#14323D]">
            <img
              src="/images/certification-hero.webp"
              alt="Formación Reformer"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125 scale-105 group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Precision Architectural & Biomechanical Blueprint Vectors */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 380 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid system lines */}
            <line x1="20" y1="40" x2="20" y2="400" stroke="#7FE0DE" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
            <line x1="360" y1="40" x2="360" y2="400" stroke="#7FE0DE" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
            <line x1="20" y1="220" x2="360" y2="220" stroke="#7FE0DE" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />

            {/* 3D Wireframe Box / Reformer Frame representation */}
            <path
              d="M 60 260 L 140 220 L 320 250 L 240 290 Z"
              stroke="#A5F3FC"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            <line x1="60" y1="260" x2="60" y2="330" stroke="#A5F3FC" strokeWidth="1" opacity="0.5" />
            <line x1="240" y1="290" x2="240" y2="360" stroke="#A5F3FC" strokeWidth="1" opacity="0.5" />
            <line x1="320" y1="250" x2="320" y2="320" stroke="#A5F3FC" strokeWidth="1" opacity="0.5" />
            <path d="M 60 330 L 240 360 L 320 320" stroke="#A5F3FC" strokeWidth="1" opacity="0.4" />

            {/* Biomechanical Kinematic Angle Vector */}
            <circle cx="170" cy="180" r="3.5" fill="#38BDF8" />
            <circle cx="230" cy="140" r="3.5" fill="#38BDF8" />
            <circle cx="280" cy="190" r="3.5" fill="#38BDF8" />
            <line x1="170" y1="180" x2="230" y2="140" stroke="#38BDF8" strokeWidth="1.5" />
            <line x1="230" y1="140" x2="280" y2="190" stroke="#38BDF8" strokeWidth="1.5" />
            
            {/* Angle Arc */}
            <path d="M 215 152 A 20 20 0 0 1 245 155" stroke="#7DD3FC" strokeWidth="1" strokeDasharray="2 2" />
            <text x="245" y="145" fill="#BAE6FD" fontSize="9" fontFamily="monospace" fontWeight="600">
              118° EXT
            </text>

            {/* Spring Tension & Coordinates Vector */}
            <path d="M 90 280 Q 140 270 190 295" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="190" cy="295" r="3" fill="#FDE047" />
            <text x="140" y="320" fill="#FEF08A" fontSize="8.5" fontFamily="monospace">
              [ RESORTES: 3R / 1A · 18.5kg ]
            </text>

            {/* Node indicators & flow arrows */}
            <g opacity="0.75">
              <circle cx="90" cy="110" r="2.5" fill="#A5F3FC" />
              <line x1="90" y1="110" x2="150" y2="110" stroke="#A5F3FC" strokeWidth="0.8" />
              <line x1="150" y1="110" x2="170" y2="140" stroke="#A5F3FC" strokeWidth="0.8" />
              <text x="70" y="100" fill="#E0F2FE" fontSize="8" fontFamily="monospace">
                AXIS: C1-L5
              </text>
            </g>

            <text x="25" y="390" fill="#7DD3FC" fontSize="8" fontFamily="monospace" opacity="0.7">
              // BIOMECHANICS V2.4 [ REFORMER KINEMATICS ]
            </text>
          </svg>

          {/* Interactive Card Action Indicator */}
          <div className="absolute bottom-5 right-5 z-20">
            <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: COMUNIDAD WHOP (WARM TERRACOTTA) */}
      <div
        onClick={() => onSelectTab('comunidad')}
        className={`group relative flex flex-col justify-between rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-[#BF4A20] ${
          activeTab === 'comunidad' ? 'ring-2 ring-neutral-900 shadow-xl' : 'shadow-md'
        }`}
        style={{ minHeight: '520px' }}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-[#C8542A] via-[#BF4A20] to-transparent z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Comunidad Whop
            </h3>
            <span className="font-mono text-[11px] font-medium text-orange-100/90 tracking-wider px-2.5 py-1 rounded-full border border-orange-200/30 bg-orange-950/20 uppercase">
              [ RED EN VIVO ]
            </span>
          </div>
          <p className="text-xs text-orange-100/80 leading-relaxed max-w-[260px]">
            Canal oficial en vivo, bolsa de trabajo y red colaborativa de Querétaro y Monterrey.
          </p>
        </div>

        {/* Visual / Warm Editorial Photography Composition */}
        <div className="relative flex-1 w-full overflow-hidden flex items-end justify-center min-h-[360px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#6E240B] via-[#9B3714] to-[#BF4A20]">
            <img
              src="/images/about-hero.webp"
              alt="Comunidad de Instructoras Edelweiss Pilates"
              className="w-full h-full object-cover object-center opacity-85 filter contrast-110 saturate-110 group-hover:scale-105 transition-transform duration-700"
            />
            {/* Warm Golden Hour Gradient Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4D1705]/80 via-transparent to-[#BF4A20]/40 mix-blend-multiply" />
          </div>

          {/* Subtle Community Micro-annotations */}
          <div className="absolute bottom-5 left-5 z-20 text-orange-100/90 font-mono text-[9px] uppercase tracking-wider space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Whop Sync: 240+ Alumnas Activas</span>
            </div>
            <p className="text-orange-200/70">Querétaro · CDMX · Monterrey</p>
          </div>

          {/* Action indicator */}
          <div className="absolute bottom-5 right-5 z-20">
            <span className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* CARD 3: MENTORÍA CLÍNICA (SAGE GREEN) */}
      <div
        onClick={() => onSelectTab('webinar')}
        className={`group relative flex flex-col justify-between rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-[#72927C] ${
          activeTab === 'webinar' ? 'ring-2 ring-neutral-900 shadow-xl' : 'shadow-md'
        }`}
        style={{ minHeight: '520px' }}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-[#7A9A84] via-[#72927C] to-transparent z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Mentoría Clínica
            </h3>
            <span className="font-mono text-[11px] font-semibold text-neutral-900 tracking-wider px-2.5 py-1 rounded-full border border-neutral-800/20 bg-emerald-950/10 uppercase">
              [ GABI & LAURA MUNIVE ]
            </span>
          </div>
          <p className="text-xs text-neutral-800/80 leading-relaxed max-w-[260px]">
            Supervisión directa, análisis de patologías y docencia práctica con fundadoras.
          </p>
        </div>

        {/* Visual / Chalkboard Clinical Architecture Overlay */}
        <div className="relative flex-1 w-full overflow-hidden flex items-end justify-center min-h-[360px]">
          {/* Base Instructor Portrait with Sage tone */}
          <div className="absolute inset-0 bg-[#56745F]">
            <img
              src="/images/hero-edelweiss.webp"
              alt="Mentoría Clínica Gabi y Laura Munive"
              className="w-full h-full object-cover object-top opacity-35 filter contrast-125 saturate-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#314838] via-[#56745F]/70 to-[#72927C]/30" />
          </div>

          {/* Chalkboard Clinical Flowchart SVG (mimicking the whiteboard architecture in screenshot 1) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 380 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Flowchart Box 1: ANATOMÍA CLÍNICA */}
            <rect x="35" y="60" width="130" height="34" rx="6" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" fill="#3D5A46" fillOpacity="0.4" />
            <text x="47" y="81" fill="#FFFFFF" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              EVALUACIÓN POSTURAL
            </text>

            {/* Connecting Arrow */}
            <line x1="165" y1="77" x2="215" y2="77" stroke="#E2F7E6" strokeWidth="1.2" />
            <polygon points="215,74 222,77 215,80" fill="#E2F7E6" />

            {/* Flowchart Box 2: CADENA MIOFASCIAL */}
            <rect x="225" y="60" width="125" height="34" rx="6" stroke="#E2F7E6" strokeWidth="1" fill="#3D5A46" fillOpacity="0.4" />
            <text x="238" y="81" fill="#FFFFFF" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              PATOLOGÍA LUMBAR
            </text>

            {/* Branching downwards */}
            <line x1="100" y1="94" x2="100" y2="150" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="100" y1="150" x2="140" y2="150" stroke="#FFFFFF" strokeWidth="1" />
            <polygon points="140,147 147,150 140,153" fill="#FFFFFF" />

            {/* Box 3: AJUSTE DE RESORTE */}
            <rect x="150" y="132" width="140" height="36" rx="6" stroke="#FFFFFF" strokeWidth="1.2" fill="#2E4636" fillOpacity="0.6" />
            <text x="162" y="154" fill="#FEF08A" fontSize="8.5" fontFamily="monospace" fontWeight="700">
              RESI-MODIFICACIÓN
            </text>

            {/* Box 4: DOCENCIA SUPERVISADA */}
            <rect x="40" y="210" width="140" height="34" rx="6" stroke="#E2F7E6" strokeWidth="1" strokeDasharray="4 2" fill="#3D5A46" fillOpacity="0.4" />
            <text x="52" y="231" fill="#E2F7E6" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              DOCENCIA PRÁCTICA
            </text>

            {/* Arrow down to final box */}
            <line x1="110" y1="244" x2="110" y2="280" stroke="#E2F7E6" strokeWidth="1" />
            <polygon points="107,280 110,287 113,280" fill="#E2F7E6" />

            {/* Final Target Box: CERTIFICACIÓN OFICIAL */}
            <rect x="40" y="290" width="160" height="38" rx="8" stroke="#FFFFFF" strokeWidth="1.5" fill="#1C3023" fillOpacity="0.7" />
            <text x="52" y="313" fill="#FFFFFF" fontSize="9.5" fontFamily="monospace" fontWeight="700">
              AVAL 28H / 48H
            </text>

            {/* Annotation text */}
            <text x="25" y="390" fill="#E2F7E6" fontSize="8" fontFamily="monospace" opacity="0.8">
              // SUPERVISION SYSTEM [ GABI & LAURA MUNIVE ]
            </text>
          </svg>

          {/* Action indicator */}
          <div className="absolute bottom-5 right-5 z-20">
            <span className="w-8 h-8 rounded-full bg-neutral-900/20 hover:bg-neutral-900/30 border border-neutral-900/30 text-neutral-900 flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
