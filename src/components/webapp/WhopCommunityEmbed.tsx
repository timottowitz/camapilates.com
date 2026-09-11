import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  ExternalLink,
  Sparkles,
  Smartphone,
  Shield,
  HelpCircle,
  GraduationCap,
  MessagesSquare,
  CheckCircle2,
} from 'lucide-react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';

interface WhopCommunityEmbedProps {
  initialTab?: 'chat' | 'forum' | 'courses';
  className?: string;
}

export const WhopCommunityEmbed: React.FC<WhopCommunityEmbedProps> = ({
  initialTab = 'forum',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'forum' | 'courses'>(initialTab);

  const activeExperience =
    activeTab === 'chat'
      ? WHOP_CONFIG.experiences.chat
      : activeTab === 'courses'
        ? WHOP_CONFIG.experiences.courses
        : WHOP_CONFIG.experiences.forums;

  return (
    <div className={`flex flex-col bg-[#161412] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Community Top Navigation Bar */}
      <div className="bg-[#201D1A] border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-xs">
            CAMA
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-stone-200">
                Comunidad Oficial Reformer México
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Whop Live
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Campus y red de instructoras de Querétaro y Monterrey
            </p>
          </div>
        </div>

        {/* Experience Switcher */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'forum'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Foros & Preguntas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat en Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'courses'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Curso LMS</span>
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <a
            href={activeExperience.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Abrir en Whop App</span>
            <ExternalLink className="w-3 h-3 text-stone-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Sub-header with Channel Information */}
      <div className="bg-[#191613] px-4 py-2 border-b border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          <span className="font-semibold text-stone-300">Canales activos:</span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-amber-300 text-[11px] font-mono">
            #webinar-vip-lobby
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono">
            #anuncios-oficiales
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono">
            #preguntas-gabi-laura
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono">
            #cohorte-queretaro-nov
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono">
            #cohorte-monterrey-dic-ene
          </span>
        </div>
        <span className="text-[11px] text-stone-500 hidden sm:inline">
          {activeExperience.description}
        </span>
      </div>

      {/* Embedded Iframe Container */}
      <div className="relative w-full h-[640px] bg-stone-950">
        <iframe
          src={activeExperience.directUrl}
          title={activeExperience.name}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; clipboard-write"
          loading="lazy"
        />

        {/* Fallback Overlay Trigger in case browser third-party cookie blocks frame */}
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={activeExperience.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-xl transition-all"
          >
            <span>Ver {activeExperience.name} en Pantalla Completa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-[#201D1A] border-t border-stone-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Acceso privado protegido por Whop. Disponible en Web, iOS y Android.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/certificacion-pilates/webinar"
            className="text-amber-400 hover:underline"
          >
            Detalles del Webinar 26 Sep →
          </a>
          <a
            href={WHOP_CONFIG.communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white flex items-center gap-1"
          >
            Página de la Comunidad
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
