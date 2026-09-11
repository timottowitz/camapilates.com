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
    <div className={`bg-[#181512] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header Bar */}
      <div className="bg-[#221E1B] border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-200">
                Foro de Discusión & Consultas Whop
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sincronizado en Vivo
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Hilos oficiales con Laura Munive y Gabi · Respuestas directas de las formadoras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadThreads}
            disabled={loadingThreads}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title="Actualizar debates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingThreads ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={WHOP_CONFIG.experiences.forums.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold shadow-sm transition-all"
          >
            <span>Ver en Whop</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left: Thread List (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-800 bg-[#141210] p-3 space-y-2 overflow-y-auto max-h-[640px]">
          <div className="px-2 py-1 flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Hilos Oficiales ({threads.length})</span>
            {loadingThreads && <span className="text-[10px] text-amber-400">Cargando...</span>}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200">
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
                className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-[#26211C] border-amber-400/50 shadow-md'
                    : 'bg-stone-900/40 border-stone-800/80 hover:bg-stone-800/40 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className={`text-xs font-semibold line-clamp-2 ${isSelected ? 'text-amber-200' : 'text-stone-200'}`}>
                    {thread.title}
                  </h4>
                  {thread.isPinned && (
                    <Pin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  )}
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {thread.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                  <span>{thread.authorName}</span>
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
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#191613]">
          {selectedThread ? (
            <div className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[640px]">
              {/* Thread Header */}
              <div className="border-b border-stone-800 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {selectedThread.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Anclado Oficial
                      </span>
                    )}
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      {formatDate(selectedThread.createdAt)}
                    </span>
                  </div>

                  <a
                    href={selectedThread.whopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Abrir hilo en Whop
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h2 className="text-lg md:text-xl font-serif italic text-stone-100 font-bold leading-snug">
                  {selectedThread.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                    CP
                  </div>
                  <span className="font-semibold text-stone-300">{selectedThread.authorName}</span>
                  {selectedThread.isPosterAdmin && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-stone-800 text-amber-300 uppercase font-bold tracking-wider">
                      Equipo Docente
                    </span>
                  )}
                </div>
              </div>

              {/* Thread Body Content */}
              <div className="text-xs md:text-sm text-stone-300 leading-relaxed whitespace-pre-line bg-stone-900/40 p-4 rounded-xl border border-stone-800/80">
                {selectedThread.content}
              </div>

              {/* Replies Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-stone-800/60 pb-2">
                  <h4 className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                    Respuestas y Preguntas ({comments.length})
                  </h4>
                  {loadingComments && (
                    <span className="text-[10px] text-stone-500">Cargando comentarios...</span>
                  )}
                </div>

                {comments.length === 0 && !loadingComments && (
                  <div className="text-center py-6 text-xs text-stone-500 bg-stone-950/40 rounded-xl border border-stone-800/40">
                    Aún no hay respuestas en este hilo. ¡Sé la primera en escribir!
                  </div>
                )}

                <div className="space-y-2.5">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-200">
                            {comment.authorName}
                          </span>
                          {comment.isPosterAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400/20 text-amber-300 font-bold uppercase">
                              Formadora
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success alert */}
              {replySuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ¡Tu comentario ha sido publicado en Whop con éxito y será revisado por Laura Munive y Gabi!
                  </span>
                </div>
              )}

              {/* Reply Form */}
              <form
                onSubmit={handleSendReply}
                className="bg-stone-950/90 border border-stone-800 rounded-xl p-3.5 space-y-3 pt-3"
              >
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-semibold text-stone-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Responder o Enviar Pregunta a las Formadoras:
                  </span>
                  <span className="text-[10px] text-stone-500">Se publica directo en Whop</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={authorNameInput}
                    onChange={(e) => setAuthorNameInput(e.target.value)}
                    placeholder="Tu nombre (ej. Mariana López)"
                    className="px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-lg text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Escribe tu consulta sobre biomecánica, resortes, temario o logística en Querétaro/Monterrey..."
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-lg text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-stone-500">
                    Las preguntas seleccionadas se resolverán en vivo el 26 de Septiembre.
                  </p>
                  <button
                    type="submit"
                    disabled={submittingReply || !newCommentText.trim()}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingReply ? 'Publicando...' : 'Publicar en Whop'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-stone-500 space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-700 mx-auto" />
              <p>Selecciona un hilo de la columna izquierda para leerlo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
