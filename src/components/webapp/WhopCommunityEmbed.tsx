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
  Maximize2,
  Minimize2,
  RefreshCw,
  BookOpen,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';
import { WhopForumReader } from './WhopForumReader';

export type WhopEmbedTab = 'reader' | 'forum' | 'chat' | 'courses' | 'portal';

interface WhopCommunityEmbedProps {
  initialTab?: WhopEmbedTab;
  className?: string;
}

export const WhopCommunityEmbed: React.FC<WhopCommunityEmbedProps> = ({
  initialTab = 'reader',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<WhopEmbedTab>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const activeExperience =
    activeTab === 'chat'
      ? WHOP_CONFIG.experiences.chat
      : activeTab === 'courses'
        ? WHOP_CONFIG.experiences.courses
        : activeTab === 'portal'
          ? WHOP_CONFIG.experiences.portal
          : WHOP_CONFIG.experiences.forums;

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className={`flex flex-col bg-[#161412] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
          : className
      }`}
    >
      {/* Community Top Navigation Bar */}
      <div className="bg-[#201D1A] border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
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
              Campus virtual oficial y red de instructoras de Querétaro y Monterrey
            </p>
          </div>
        </div>

        {/* Experience Switcher */}
        <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'reader'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Debates & Preguntas</span>
          </button>

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
            <span>Foros Whop</span>
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
            <span>Campus LMS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'portal'
                ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Portal Alumna</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeTab !== 'reader' && (
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Recargar frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <a
            href={activeExperience.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Abrir en</span>
            <span>Whop</span>
            <ExternalLink className="w-3 h-3 text-stone-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Sub-header with Channel Information */}
      <div className="bg-[#191613] px-4 py-2 border-b border-stone-800/60 flex items-center justify-between text-xs text-stone-400 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
          <span className="font-semibold text-stone-300 whitespace-nowrap">Canales activos:</span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-amber-300 text-[11px] font-mono whitespace-nowrap">
            #webinar-vip-lobby
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono whitespace-nowrap">
            #anuncios-oficiales
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono whitespace-nowrap">
            #preguntas-laura-munive
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono whitespace-nowrap">
            #cohorte-queretaro-nov
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-800/70 text-stone-300 text-[11px] font-mono whitespace-nowrap">
            #cohorte-monterrey-dic-ene
          </span>
        </div>
        <span className="text-[11px] text-stone-500 hidden md:inline ml-2 whitespace-nowrap">
          {activeExperience.description}
        </span>
      </div>

      {/* Main Content Area */}
      <div
        className={`relative w-full bg-stone-950 ${
          isFullscreen ? 'flex-1' : 'h-[680px]'
        }`}
      >
        {activeTab === 'reader' ? (
          <div className="h-full overflow-y-auto">
            <WhopForumReader />
          </div>
        ) : (
          <>
            <iframe
              key={iframeKey}
              src={activeExperience.directUrl}
              title={activeExperience.name}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; clipboard-write"
              loading="lazy"
            />

            {/* Quick Open Overlay in case of iframe blocking or direct full experience preference */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <a
                href={activeExperience.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-xl transition-all"
              >
                <span>Abrir {activeExperience.name} Completo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#201D1A] border-t border-stone-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Acceso privado protegido por Whop. Disponible en Web, iOS y Android.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/certificacion-pilates/webinar"
            className="text-amber-400 hover:underline"
          >
            Detalles Masterclass 26 Sep →
          </a>
          <a
            href={WHOP_CONFIG.customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white flex items-center gap-1"
          >
            Mi Cuenta Whop
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
