import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type Suggestion = {
  title: string;
  slug: string;
  category: string;
  keywords: string[];
  source: string;
  status?: 'in_review' | 'accepted' | 'declined';
};

const DEFAULT_PROMPT = `
Eres el Investigador Senior de CAMA Pilates.
Objetivo: Encontrar temas que la gente pregunta (preguntas reales) y temas únicos con potencial para viralidad.
Reglas:
- Prioriza español y el mercado mexicano (menciona México cuando aplique).
- Fuentes: Reddit (r/pilates, r/fitness, r/physicaltherapy), comunidades y foros relevantes.
- Tipos de temas:
  1) Guías de compra (precio, tamaño, uso en casa vs estudio)
  2) Comparativas (Reformer vs Mat, Casa vs Profesional)
  3) Ejercicios y salud (dolor de espalda, embarazo, rehabilitación)
  4) Equipo y mantenimiento (accesorios, cuidado, repuestos)
- Produce títulos claros y accionables que reflejen intención de búsqueda en MX.
`;

export default function TopicFinder() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT.trim());
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  // Decision map: 'accept' | 'decline' per slug. Default is 'accept'.
  const [decisions, setDecisions] = useState<Record<string, 'accept' | 'decline'>>({});
  const [summary, setSummary] = useState<string>('');
  const suggestionsQuery = useQuery(api.blog.listSuggestions, {} as any) as any[] | undefined;
  const actionFind = useAction(api.topics.findTopicsFromReddit);
  const actionDeep = useAction(api.llm.discoverTopicsDeep as any);
  const actionDeepBatch = useAction(api.llm.batchDiscoverAndScaffold as any);
  const [provider, setProvider] = useState<string>('openai');
  const deepMode = useQuery(api.settings.getDeepMode as any, {} as any) as any;
  const modeDefault = (deepMode?.mode || 'direct') as 'direct'|'agent';
  const [mode, setMode] = useState<'direct'|'agent'>(modeDefault);
  const mutateAccept = useMutation(api.blog.acceptSuggestion);
  const mutateDecline = useMutation(api.blog.declineSuggestion);

  const pending = useMemo(() => items.filter(i => i.status === 'in_review'), [items]);

  function deriveQueries(text: string): string[] {
    const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    // Pick phrases that look like queries (comma-separated or line items)
    const raw: string[] = [];
    for (const line of lines) {
      if (line.startsWith('- ') || line.startsWith('• ')) raw.push(line.replace(/^[-•]\s*/, ''));
      else if (/,/.test(line)) raw.push(...line.split(',').map(s => s.trim()));
      else if (line.length > 6) raw.push(line);
    }
    // Normalize: lowercase, collapse spaces
    const queries = Array.from(new Set(raw
      .map(s => s.toLowerCase())
      .map(s => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    ));
    // Fallback to sensible seeds if prompt yields nothing
    return queries.length ? queries.slice(0, 10) : [];
  }

  async function findTopics() {
    setLoading(true);
    try {
      // Prefer Deep (OpenAI) if available; gracefully fallback to Reddit/Quora/Web
      let data: any;
      if (mode === 'agent') {
        data = await actionDeep({ prompt, limit, provider, mode } as any);
      } else {
        data = await actionDeep({ prompt, limit, provider: provider, mode: 'direct' } as any);
      }
      if (data?.error && /missing_/.test(String(data.error))) {
        const queries = deriveQueries(prompt);
        data = await actionFind({ queries: queries.length ? queries : undefined, limit });
      }
      const suggestions: Suggestion[] = (data?.suggestions || []).map((s: any) => ({ ...s, status: 'in_review' }));
      setItems(suggestions);
      // Default all to accept
      const init: Record<string, 'accept' | 'decline'> = {};
      for (const s of suggestions) init[s.slug] = 'accept';
      setDecisions(init);
    } catch (e) {
      console.warn('Error buscando temas', e);
    } finally {
      setLoading(false);
    }
  }

  async function accept(slug: string) {
    try { await mutateAccept({ slug }); setItems(prev => prev.map(i => i.slug === slug ? { ...i, status: 'accepted' } : i)); }
    catch (e: any) { console.warn('No se pudo aceptar', e?.message || e); }
  }

  async function decline(slug: string) {
    try { await mutateDecline({ slug }); setItems(prev => prev.map(i => i.slug === slug ? { ...i, status: 'declined' } : i)); }
    catch (e: any) { console.warn('No se pudo rechazar', e?.message || e); }
  }

  async function processAll() {
    const accepted = pending.filter(p => (decisions[p.slug] || 'accept') === 'accept').map(p => p.slug);
    const declined = pending.filter(p => (decisions[p.slug] || 'accept') === 'decline').map(p => p.slug);
    let okA = 0, okD = 0, failA = 0, failD = 0;
    // Declines
    for (const slug of declined) {
      // eslint-disable-next-line no-await-in-loop
      try { await mutateDecline({ slug }); okD++; } catch { failD++; }
    }
    // Accepts
    for (const slug of accepted) {
      // eslint-disable-next-line no-await-in-loop
      try { await mutateAccept({ slug }); okA++; } catch { failA++; }
    }
    // Refresh from server to avoid state races
    try {
      const suggs: Suggestion[] = (suggestionsQuery || []).filter((it: any) => it.status === 'in_review') as any;
      setItems(suggs);
      const next: Record<string, 'accept' | 'decline'> = {};
      for (const s of suggs) next[s.slug] = 'accept';
      setDecisions(next);
    } catch {}
    if (okA + okD + failA + failD > 0) {
      setSummary(`Procesado: aceptados ${okA}${failA ? ` (falló ${failA})` : ''}, rechazados ${okD}${failD ? ` (falló ${failD})` : ''}`);
      // Notify Admin screen to show Queued items
      try { window.dispatchEvent(new CustomEvent('topics:accepted')); } catch {}
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">🔎 Encontrar temas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscador de Temas (Investigador Senior)</DialogTitle>
          <DialogDescription>
            Usa websearch (Reddit y comunidades) para descubrir temas que la audiencia pide o que puedan destacar en México. Revisa, acepta o rechaza.
          </DialogDescription>
        </DialogHeader>
        {/* Sync UI list with DB when dialog opens */}
        <SyncSuggestions suggestionsQuery={suggestionsQuery} setItems={setItems} setDecisions={setDecisions} />
        <div className="space-y-4">
          {summary && (
            <div className="text-xs text-muted-foreground">{summary}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div className="md:col-span-5">
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted-foreground">Límite</label>
              <Input type="number" value={limit} min={3} max={30} onChange={(e) => setLimit(Number(e.target.value))} />
              <label className="text-xs text-muted-foreground mt-2">Proveedor</label>
              <select className="w-full border rounded p-2 text-sm" value={provider} onChange={(e)=>setProvider(e.target.value)}>
                <option value="openai">OpenAI</option>
                <option value="perplexity">Perplexity</option>
                <option value="gemini">Gemini</option>
                <option value="exa">Exa</option>
                <option value="firecrawl">Firecrawl</option>
              </select>
              <label className="text-xs text-muted-foreground mt-2">Modo</label>
              <select className="w-full border rounded p-2 text-sm" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
                <option value="direct">Direct API</option>
                <option value="agent">AI SDK Agent</option>
              </select>
              <Button className="mt-2 w-full" onClick={findTopics} disabled={loading}>{loading ? 'Buscando…' : 'Buscar'}</Button>
              <Button className="mt-2 w-full" variant="outline" onClick={async ()=>{
                setLoading(true);
                try {
                  const out = await actionDeepBatch({ prompt, limit: 50, provider, mode } as any);
                  if (out?.created) setSummary(`Deep topics creados: ${out.created}`);
                  // Reload suggestions
                  const suggs: Suggestion[] = (suggestionsQuery || []).filter((it: any) => it.status === 'in_review') as any;
                  setItems(suggs);
                  const next: Record<string, 'accept' | 'decline'> = {};
                  for (const s of suggs as any[]) next[s.slug] = 'accept';
                  setDecisions(next);
                } catch (e) {
                  setSummary('Error creando deep topics');
                } finally { setLoading(false); }
              }} disabled={loading}>Deep 50</Button>
            </div>
          </div>

          <div className="mt-2">
            {pending.length === 0 && !loading && (
              <div className="text-sm text-muted-foreground">Sin sugerencias. Pulsa "Buscar" para empezar.</div>
            )}
            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="text-muted-foreground">Por defecto se aceptarán todos. Marca “Declinar” en los que no quieras añadir.</div>
              <div className="text-muted-foreground">Pendientes: {pending.length} • Aceptar: {pending.filter(p => (decisions[p.slug] || 'accept') === 'accept').length} • Declinar: {pending.filter(p => (decisions[p.slug] || 'accept') === 'decline').length}</div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {pending.map((s) => (
                <div key={s.slug} className="border rounded-md p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">slug: {s.slug}</div>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <Badge variant="secondary">{s.category}</Badge>
                        {s.keywords.slice(0, 4).map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                        <a href={s.source} target="_blank" rel="noreferrer" className="text-xs underline text-primary">ver fuente</a>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant={(decisions[s.slug] || 'accept') === 'accept' ? 'default' : 'outline'}
                        className={(decisions[s.slug] || 'accept') === 'accept' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                        onClick={() => setDecisions(prev => ({ ...prev, [s.slug]: 'accept' }))}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant={(decisions[s.slug] || 'accept') === 'decline' ? 'destructive' : 'outline'}
                        onClick={() => setDecisions(prev => ({ ...prev, [s.slug]: 'decline' }))}
                      >
                        Declinar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
            <Button onClick={processAll} disabled={pending.length === 0}>Procesar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SyncSuggestions({ suggestionsQuery, setItems, setDecisions }: { suggestionsQuery: any[] | undefined, setItems: (x: any[]) => void, setDecisions: (x: Record<string, 'accept' | 'decline'>) => void }) {
  useEffect(() => {
    const suggs = (suggestionsQuery || []).filter((it: any) => it.status === 'in_review');
    if (suggs.length) {
      setItems(suggs as any);
      const next: Record<string, 'accept' | 'decline'> = {};
      for (const s of suggs as any[]) next[s.slug] = 'accept';
      setDecisions(next);
    }
  }, [suggestionsQuery, setItems, setDecisions]);
  return null;
}
