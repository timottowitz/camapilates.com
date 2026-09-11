import React, { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  MessageSquare,
  Pin,
  Send,
  Eye,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MessageCircle,
  HelpCircle,
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
          // If initialThreadId specified, select that, otherwise select first pinned or first thread
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
        // Reload comments
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

  return (
    <div className={`bg-white border border-neutral-200/90 rounded-[24px] overflow-hidden shadow-sm ${className}`}>
      {/* Header Bar */}
      <div className="bg-neutral-50/70 border-b border-neutral-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Foro de Discusión & Consultas Whop
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                [ EN VIVO ]
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Hilos oficiales con Laura Munive y Gabi · Respuestas directas de las formadoras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Thread List (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-200/80 bg-neutral-50/40 p-4 space-y-2 overflow-y-auto max-h-[640px]">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-mono text-neutral-500 font-medium">
            <span>// HILOS OFICIALES ({threads.length})</span>
            {loadingThreads && <span className="text-[10px] text-orange-600 animate-pulse">Cargando...</span>}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {threads.map((thread) => {
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
                  <span className="font-sans font-medium text-neutral-600">{thread.authorName}</span>
                  <div className="flex items-center gap-2">
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
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[640px]">
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
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-neutral-100 text-neutral-700 uppercase font-mono font-bold tracking-wider">
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
                    Respuestas y Preguntas ({comments.length})
                  </h4>
                  {loadingComments && (
                    <span className="text-[10px] text-neutral-400 font-mono">Cargando comentarios...</span>
                  )}
                </div>

                {comments.length === 0 && !loadingComments && (
                  <div className="text-center py-8 text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                    Aún no hay respuestas en este hilo. ¡Sé la primera en escribir!
                  </div>
                )}

                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">
                            {comment.authorName}
                          </span>
                          {comment.isPosterAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-neutral-900 text-white font-mono font-bold uppercase">
                              Formadora
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
                    ¡Tu comentario ha sido publicado en Whop con éxito y será revisado por Laura Munive y Gabi!
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
                    Responder o Enviar Pregunta a las Formadoras:
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Se publica directo en Whop</span>
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
                  placeholder="Escribe tu consulta sobre biomecánica, resortes, temario o logística en Querétaro/Monterrey..."
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Las preguntas seleccionadas se resolverán en vivo el 26 de Septiembre.
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
    </div>
  );
};
