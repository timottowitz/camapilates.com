import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  ExternalLink,
  Sparkles,
  Smartphone,
  Shield,
  GraduationCap,
  MessagesSquare,
  Maximize2,
  Minimize2,
  RefreshCw,
  BookOpen,
  UserCheck,
  CheckCircle2,
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
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cama_pilates_whop_enrollment');
      if (saved) {
        setEnrollmentData(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

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
      className={`flex flex-col bg-white border border-neutral-200/90 rounded-[28px] overflow-hidden shadow-sm transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
          : className
      }`}
    >
      {/* Community Top Navigation Bar */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={WHOP_CONFIG.assets.avatarUrl}
            alt="CAMA Pilates Logo"
            className="w-10 h-10 rounded-2xl object-cover border border-neutral-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Comunidad Oficial Reformer México
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                [ WHOP LIVE ]
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Campus virtual oficial y red de instructoras de Querétaro y Monterrey
            </p>
          </div>
        </div>

        {/* Experience Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/80 overflow-x-auto scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'reader'
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Debates & Preguntas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'forum'
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Foros Whop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat en Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'courses'
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Campus LMS (100h)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'portal'
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mi Membresía</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeTab !== 'reader' && (
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-xs transition-colors"
              title="Recargar frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-xs transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-medium border border-neutral-200 shadow-xs transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-neutral-700" />
            <span className="hidden sm:inline">Abrir en</span>
            <span>Whop</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Member Sync Status Banner */}
      {enrollmentData ? (
        <div className="bg-emerald-50/70 border-b border-emerald-200/70 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Alumna Verificada:</strong> Tu membresía para <strong className="uppercase">{enrollmentData.cohort || 'Cohorte 2026'}</strong> está activa. Tienes acceso prioritario a canales privados y soporte.
            </span>
          </div>
          <a
            href={WHOP_CONFIG.customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver Recibo en Whop</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="bg-neutral-50 px-6 py-2.5 border-b border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#BF4A20] shrink-0" />
            <span>
              <strong>Comunidad Abierta & Canales Oficiales:</strong> Consulta dudas en el foro en vivo o accede a los canales de chat.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] text-neutral-500">240+ Alumnas Activas</span>
            <span className="text-neutral-300">·</span>
            <a
              href="/app?tab=pagos"
              className="text-neutral-900 hover:underline font-semibold"
            >
              Apartar Cupo →
            </a>
          </div>
        </div>
      )}

      {/* Channels Directory Strip */}
      <div className="bg-neutral-50/40 px-6 py-2.5 border-b border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-0.5 scrollbar-none">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 whitespace-nowrap">// CANALES WHOP:</span>
          {[
            { tag: '#webinar-vip-lobby', name: 'Lobby VIP' },
            { tag: '#anuncios-oficiales', name: 'Avisos de Cohortes' },
            { tag: '#preguntas-laura-munive', name: 'Mentoría Técnica' },
            { tag: '#casos-clinicos', name: 'Patologías & Biomecánica' },
            { tag: '#cohorte-queretaro-nov', name: 'Querétaro' },
            { tag: '#cohorte-monterrey-dic', name: 'Monterrey' },
            { tag: '#bolsa-trabajo', name: 'Estudios & Empleo' },
          ].map((ch, idx) => (
            <a
              key={idx}
              href={WHOP_CONFIG.communityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-400 text-[11px] font-mono whitespace-nowrap shadow-xs transition-colors"
              title={`Abrir canal ${ch.tag} en Whop`}
            >
              <span>{ch.tag}</span>
            </a>
          ))}
        </div>
        <span className="text-[11px] text-neutral-400 font-mono hidden lg:inline ml-2 whitespace-nowrap">
          {activeExperience.description}
        </span>
      </div>

      {/* Main Content Area */}
      <div
        className={`relative w-full bg-neutral-100 ${
          isFullscreen ? 'flex-1' : 'h-[680px]'
        }`}
      >
        {activeTab === 'reader' ? (
          <div className="h-full overflow-y-auto">
            <WhopForumReader />
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            {/* Whop Auth & Direct Access Banner */}
            <div className="bg-white border-b border-neutral-200 px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-neutral-600 text-[11px] sm:text-xs">
                  <strong>Acceso Oficial Whop:</strong> Si tu navegador bloquea cookies de terceros o deseas iniciar sesión con Google/Apple sin restricciones, abre en nueva pestaña.
                </span>
              </div>
              <a
                href={activeExperience.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-all shadow-xs shrink-0"
              >
                <span>Abrir {activeExperience.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex-1 w-full h-full bg-white">
              <iframe
                key={iframeKey}
                src={activeExperience.directUrl}
                title={activeExperience.name}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; clipboard-write; payment; autoplay; encrypted-media"
                loading="lazy"
              />

              {/* Quick Open Overlay */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <a
                  href={activeExperience.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider shadow-lg transition-all"
                >
                  <span>Abrir {activeExperience.name} Completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-neutral-50/90 border-t border-neutral-200/80 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Acceso privado protegido por Whop. Disponible en Web, iOS y Android.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/certificacion-pilates/webinar"
            className="text-neutral-800 hover:text-neutral-950 font-medium underline"
          >
            Detalles Masterclass 26 Sep →
          </a>
          <a
            href={WHOP_CONFIG.customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 hover:text-neutral-950 font-medium flex items-center gap-1"
          >
            Mi Cuenta Whop
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
