import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  MessageSquare,
  Pin,
  Send,
  Calendar,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  HelpCircle,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { WHOP_CONFIG } from '@/lib/whop/whopConfig';

interface WhopThread {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  isPinned: boolean;
  isPosterAdmin: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  whopUrl: string;
}

interface WhopComment {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  isPosterAdmin: boolean;
}

interface WhopForumReaderProps {
  initialThreadId?: string;
  className?: string;
  highlightQnA?: boolean;
}

export const WhopForumReader: React.FC<WhopForumReaderProps> = ({
  initialThreadId,
  className = '',
  highlightQnA = false,
}) => {
  const [threads, setThreads] = useState<WhopThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<WhopThread | null>(null);
  const [comments, setComments] = useState<WhopComment[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Thread Modal state
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadAuthor, setNewThreadAuthor] = useState('');
  const [submittingNewThread, setSubmittingNewThread] = useState(false);
  const [newThreadSuccess, setNewThreadSuccess] = useState(false);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'biomecanica' | 'patologias' | 'webinar' | 'cohortes'>('all');

  const getThreadsAction = useAction(api.whopApi.getForumThreads);
  const getCommentsAction = useAction(api.whopApi.getThreadComments);
  const postReplyAction = useAction(api.whopApi.postQuestionOrReply);

  // Load threads
  const loadThreads = async () => {
    setLoadingThreads(true);
    setErrorMsg(null);
    try {
      const res = await getThreadsAction({});
      if (res && res.success && res.threads) {
        setThreads(res.threads);
        if (!selectedThread && res.threads.length > 0) {
          const initial = initialThreadId
            ? res.threads.find((t) => t.id === initialThreadId)
            : res.threads[0];
          setSelectedThread(initial || res.threads[0]);
        }
      } else {
        setErrorMsg(res?.error || 'No se pudieron cargar los debates.');
      }
    } catch (e: any) {
      console.error('Error fetching forum threads:', e);
      setErrorMsg('Error de conexión con la comunidad Whop.');
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [initialThreadId]);

  // Load comments when selected thread changes
  useEffect(() => {
    if (!selectedThread) return;

    let isMounted = true;
    const loadComments = async () => {
      setLoadingComments(true);
      try {
        const res = await getCommentsAction({ threadId: selectedThread.id });
        if (isMounted && res && res.success) {
          setComments(res.comments);
        }
      } catch (e) {
        console.error('Error loading comments:', e);
      } finally {
        if (isMounted) setLoadingComments(false);
      }
    };

    loadComments();
    return () => {
      isMounted = false;
    };
  }, [selectedThread?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedThread) return;

    setSubmittingReply(true);
    setReplySuccess(false);
    try {
      const res = await postReplyAction({
        parentId: selectedThread.id,
        content: newCommentText.trim(),
        authorName: authorNameInput.trim() || 'Alumna de Certificación',
      });

      if (res && res.success) {
        setReplySuccess(true);
        setNewCommentText('');
        const commentsRes = await getCommentsAction({ threadId: selectedThread.id });
        if (commentsRes && commentsRes.success) {
          setComments(commentsRes.comments);
        }
        setTimeout(() => setReplySuccess(false), 6000);
      } else {
        alert(res?.error || 'No se pudo publicar la respuesta en Whop.');
      }
    } catch (err: any) {
      console.error('Error posting reply:', err);
      alert('Error de conexión al enviar tu mensaje a Whop.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCreateNewThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setSubmittingNewThread(true);
    try {
      const res = await postReplyAction({
        title: newThreadTitle.trim(),
        content: newThreadContent.trim(),
        authorName: newThreadAuthor.trim() || 'Alumna de Certificación',
      });

      if (res && res.success && res.post) {
        setNewThreadSuccess(true);
        setNewThreadTitle('');
        setNewThreadContent('');
        setIsNewThreadOpen(false);
        await loadThreads();
        setTimeout(() => setNewThreadSuccess(false), 6000);
      } else {
        alert(res?.error || 'No se pudo crear el hilo en Whop.');
      }
    } catch (err) {
      console.error('Error creating new thread:', err);
      alert('Error de conexión al crear el tema en Whop.');
    } finally {
      setSubmittingNewThread(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Filter threads by category
  const filteredThreads = threads.filter((t) => {
    if (activeCategory === 'all') return true;
    const text = `${t.title} ${t.content}`.toLowerCase();
    if (activeCategory === 'biomecanica') return text.includes('resorte') || text.includes('biomec') || text.includes('carro') || text.includes('cadencia');
    if (activeCategory === 'patologias') return text.includes('hernia') || text.includes('columna') || text.includes('ciatica') || text.includes('lumbar');
    if (activeCategory === 'webinar') return text.includes('masterclass') || text.includes('webinar') || text.includes('septiembre') || text.includes('pregunta');
    if (activeCategory === 'cohortes') return text.includes('queretaro') || text.includes('monterrey') || text.includes('sede') || text.includes('fecha');
    return true;
  });

  return (
    <div className={`bg-white border border-neutral-200/90 rounded-[28px] overflow-hidden shadow-sm ${className}`}>
      {/* Header Bar */}
      <div className="bg-neutral-50/70 border-b border-neutral-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={WHOP_CONFIG.assets.avatarUrl}
            alt="CAMA Pilates"
            className="w-9 h-9 rounded-2xl object-cover border border-neutral-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Foro Oficial de Consultas & Mentoría Whop
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                [ SYNC EN VIVO ]
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Sincronizado vía Whop API con Laura Munive y Gabi · Respuestas directas de formadoras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewThreadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#183844] hover:bg-[#122c35] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nueva Consulta</span>
          </button>

          <button
            type="button"
            onClick={loadThreads}
            disabled={loadingThreads}
            className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 shadow-xs transition-colors"
            title="Actualizar debates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingThreads ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={WHOP_CONFIG.experiences.forums.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Ver en Whop</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Category filter pills bar */}
      <div className="bg-neutral-50/40 px-6 py-2.5 border-b border-neutral-200/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="font-mono text-[11px] text-neutral-400 mr-1">// FILTRAR:</span>
        {[
          { id: 'all', label: 'Todos los Temas' },
          { id: 'biomecanica', label: 'Biomecánica & Resortes' },
          { id: 'patologias', label: 'Patologías & Modificaciones' },
          { id: 'webinar', label: 'Masterclass 26 Sep' },
          { id: 'cohortes', label: 'Querétaro / Monterrey' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 shadow-xs'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Global New Thread Success Alert */}
      {newThreadSuccess && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>¡Consulta publicada con éxito en la Comunidad Whop!</strong> El tema ha sido sincronizado y las formadoras recibirán notificación inmediata.
          </span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Thread List (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-200/80 bg-neutral-50/30 p-4 space-y-2 overflow-y-auto max-h-[660px]">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-mono text-neutral-500 font-medium">
            <span>// HILOS ACTIVOS ({filteredThreads.length})</span>
            {loadingThreads && <span className="text-[10px] text-orange-600 animate-pulse">Sincronizando...</span>}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {filteredThreads.map((thread) => {
            const isSelected = selectedThread?.id === thread.id;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-white border-neutral-900 shadow-md ring-1 ring-neutral-900/10'
                    : 'bg-white/80 border-neutral-200/70 hover:bg-white hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-neutral-950' : 'text-neutral-800'}`}>
                    {thread.title}
                  </h4>
                  {thread.isPinned && (
                    <Pin className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                  )}
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {thread.content}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1">
                  <span className="font-sans font-medium text-neutral-600 truncate max-w-[130px]">{thread.authorName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" />
                      {thread.commentCount}
                    </span>
                    <span>{formatDate(thread.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Thread Detail & Discussion (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white">
          {selectedThread ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[660px]">
              {/* Thread Header */}
              <div className="border-b border-neutral-200/80 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {selectedThread.isPinned && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Anclado Oficial
                      </span>
                    )}
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      {formatDate(selectedThread.createdAt)}
                    </span>
                  </div>

                  <a
                    href={selectedThread.whopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-neutral-700 hover:text-neutral-950 underline flex items-center gap-1"
                  >
                    Abrir hilo en Whop
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
                  {selectedThread.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[10px]">
                    CP
                  </div>
                  <span className="font-semibold text-neutral-900">{selectedThread.authorName}</span>
                  {selectedThread.isPosterAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#183844] text-white uppercase font-mono font-bold tracking-wider">
                      Equipo Docente
                    </span>
                  )}
                </div>
              </div>

              {/* Thread Body Content */}
              <div className="text-xs md:text-sm text-neutral-700 leading-relaxed whitespace-pre-line bg-neutral-50/70 p-5 rounded-2xl border border-neutral-200/70">
                {selectedThread.content}
              </div>

              {/* Replies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <MessageCircle className="w-3.5 h-3.5 text-neutral-700" />
                    Respuestas & Mentoría ({comments.length})
                  </h4>
                  {loadingComments && (
                    <span className="text-[10px] text-neutral-400 font-mono">Cargando comentarios...</span>
                  )}
                </div>

                {comments.length === 0 && !loadingComments && (
                  <div className="text-center py-8 text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                    Aún no hay respuestas en este debate. ¡Sé la primera en compartir tu duda o experiencia!
                  </div>
                )}

                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-2xl border space-y-1.5 ${
                        comment.isPosterAdmin
                          ? 'bg-teal-50/50 border-teal-200/80'
                          : 'bg-neutral-50/90 border-neutral-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">
                            {comment.authorName}
                          </span>
                          {comment.isPosterAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#183844] text-white font-mono font-bold uppercase">
                              Formadora Oficial
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success alert */}
              {replySuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ¡Tu respuesta ha sido publicada en Whop con éxito y sincronizada con el campus!
                  </span>
                </div>
              )}

              {/* Reply Form */}
              <form
                onSubmit={handleSendReply}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral-700">
                  <span className="font-bold text-neutral-900 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-700" />
                    Responder o Consultar a las Formadoras:
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Publicación instantánea en Whop</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={authorNameInput}
                    onChange={(e) => setAuthorNameInput(e.target.value)}
                    placeholder="Tu nombre (ej. Mariana López)"
                    className="px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Escribe tu consulta sobre biomecánica, resortes, temario o casos clínicos..."
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Las preguntas clínicas serán abordadas directamente por Laura Munive y Gabi.
                  </p>
                  <button
                    type="submit"
                    disabled={submittingReply || !newCommentText.trim()}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm self-end sm:self-auto"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingReply ? 'Publicando...' : 'Publicar en Whop'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
              <p>Selecciona un hilo de la columna izquierda para leerlo.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW THREAD MODAL */}
      {isNewThreadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-[28px] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="text-base font-bold text-neutral-900">
                  Publicar Nueva Consulta en la Comunidad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewThreadOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewThread} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                  Tu Nombre Completo
                </label>
                <input
                  type="text"
                  value={newThreadAuthor}
                  onChange={(e) => setNewThreadAuthor(e.target.value)}
                  placeholder="ej. Mariana López (Alumna Querétaro)"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                  Título de la Pregunta / Caso Clínico
                </label>
                <input
                  type="text"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="ej. ¿Cómo adaptar resortes para ciática aguda en alumna principiante?"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={4}
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  placeholder="Explica el contexto del alumno, edad, dolor referido, posición del carro y qué ejercicio estabas aplicando..."
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewThreadOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingNewThread || !newThreadTitle.trim() || !newThreadContent.trim()}
                  className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingNewThread ? 'Publicando...' : 'Publicar en Whop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
