import React, { useMemo, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from '@/components/ui/sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const StatusBadge: React.FC<{ s: string }> = ({ s }) => {
  const color = s === 'active' ? 'bg-green-100 text-green-800' : s === 'image_assigned' ? 'bg-blue-100 text-blue-800' : s === 'prompt_generated' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800';
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{s}</span>;
};

const AdminPlaceholders: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const rows = useQuery(api.placeholders.listWithPreview, status ? { status } as any : {} as any) as any[] | undefined;
  const queue = useAction(api.placeholderGeneration.queue) as any;
  const assignImage = useMutation(api.placeholders.assignImage) as any;
  const assignLatest = useMutation(api.placeholders.assignLatest) as any;
  const updatePrompt = useMutation(api.placeholders.updatePrompt) as any;

  // History drawer
  const [openHistory, setOpenHistory] = useState(false);
  const [histPhId, setHistPhId] = useState<string | null>(null);
  const historyItems = useQuery(api.aiImages.listByPlaceholder as any, histPhId ? { placeholderId: histPhId } : undefined as any) as any[] | undefined;

  // Prompt dialog
  const [openPrompt, setOpenPrompt] = useState(false);
  const [promptPhId, setPromptPhId] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');

  const filtered = rows || [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of filtered) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [filtered]);

  // Selection and working states
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [working, setWorking] = useState<Record<string, boolean>>({});

  async function queueAllPending() {
    const pending = filtered.filter(r => r.status === 'pending' || r.status === 'prompt_generated');
    for (const r of pending.slice(0, 50)) {
      try { await queue({ placeholderId: r.placeholderId }); } catch {}
    }
    toast.success(`Queued ${pending.length} placeholders`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Image Placeholders</h1>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm">Filter status:</label>
        <select className="border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">pending</option>
          <option value="prompt_generated">prompt_generated</option>
          <option value="image_assigned">image_assigned</option>
          <option value="active">active</option>
        </select>
        <button onClick={queueAllPending} className="ml-auto bg-primary text-white px-3 py-1 rounded">Queue generation</button>
        <div className="ml-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async ()=>{
              const ids = Object.keys(selected).filter(k => selected[k]);
              if (!ids.length) return toast('No items selected');
              let ok = 0;
              for (const id of ids) { try { await queue({ placeholderId: id }); ok++; } catch {} }
              toast.success(`Queued ${ok} selected`);
            }}
          >Queue selected</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async ()=>{
              const ids = Object.keys(selected).filter(k => selected[k]);
              if (!ids.length) return toast('No items selected');
              let ok = 0;
              for (const id of ids) { try { await assignLatest({ placeholderId: id, activate: true }); ok++; } catch {} }
              toast.success(`Assigned latest for ${ok} selected`);
            }}
          >Assign latest (selected)</Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-4">Totals: {Object.entries(counts).map(([k,v]) => `${k}: ${v}`).join(' · ') || '—'}</div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  onChange={(e)=>{
                    const on = e.currentTarget.checked;
                    const next: Record<string, boolean> = {};
                    for (const r of filtered) next[r.placeholderId] = on;
                    setSelected(next);
                  }}
                />
              </th>
              <th className="text-left px-3 py-2">Preview</th>
              <th className="text-left px-3 py-2">Placeholder</th>
              <th className="text-left px-3 py-2">Page</th>
              <th className="text-left px-3 py-2">Location</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Aspect</th>
              <th className="text-left px-3 py-2">Heading</th>
              <th className="text-left px-3 py-2">Actions</th>
              <th className="text-left px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(filtered || []).map((r) => (
              <tr key={r.placeholderId} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[r.placeholderId])}
                    onChange={(e)=> setSelected(prev => ({ ...prev, [r.placeholderId]: e.currentTarget.checked }))}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="relative group h-14 w-24 rounded border overflow-hidden">
                    {r.previewUrl ? (
                      <img src={r.previewUrl} alt={r.headingAbove || r.placeholderId} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                    <button
                      className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50 text-white text-xs"
                      onClick={async ()=>{
                        setWorking(prev => ({ ...prev, [r.placeholderId]: true }));
                        try { await queue({ placeholderId: r.placeholderId }); toast('Generation queued'); }
                        catch { toast.error('Failed to queue'); }
                        finally { setWorking(prev => { const n = { ...prev }; delete n[r.placeholderId]; return n; }); }
                      }}
                      title="Cycle (regenerate)"
                    >Cycle</button>
                    {working[r.placeholderId] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{r.placeholderId}</td>
                <td className="px-3 py-2">{r.pageType}{r.pageSlug ? `/${r.pageSlug}` : ''}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td className="px-3 py-2"><StatusBadge s={r.status} /></td>
                <td className="px-3 py-2">{r.preferredAspectRatio}</td>
                <td className="px-3 py-2">{r.headingAbove?.slice(0, 80)}</td>
                <td className="px-3 py-2 space-x-2">
                  <Button size="sm" variant="outline" onClick={()=>{ setHistPhId(r.placeholderId); setOpenHistory(true); }}>History</Button>
                  <Button size="sm" onClick={()=>{ setPromptPhId(r.placeholderId); setPromptText(r.generatedPrompt || ''); setOpenPrompt(true); }}>Regenerate Prompt</Button>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Drawer */}
      <Sheet open={openHistory} onOpenChange={setOpenHistory}>
        <SheetContent side="right" className="w-[420px] sm:w-[520px]">
          <SheetHeader>
            <SheetTitle>History: {histPhId}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(historyItems || []).map((img) => (
              <div key={img._id} className="border rounded overflow-hidden">
                <HistoryCard img={img} />
                <div className="p-2 text-xs text-muted-foreground">
                  {(img.generatedAt || img.uploadedAt) && new Date(img.generatedAt || img.uploadedAt).toLocaleString()}
                </div>
                <div className="p-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={async ()=>{
                      if (!histPhId) return;
                      try {
                        await assignImage({ placeholderId: histPhId, imageId: img._id, activate: true });
                        toast.success('Assigned');
                        setOpenHistory(false);
                      } catch { toast.error('Failed to assign'); }
                    }}
                  >Use this</Button>
                </div>
              </div>
            ))}
            {(!historyItems || historyItems.length === 0) && (
              <div className="text-sm text-muted-foreground">No history yet.</div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Prompt Dialog */}
      <Dialog open={openPrompt} onOpenChange={setOpenPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Prompt</label>
            <Textarea value={promptText} onChange={(e)=>setPromptText(e.target.value)} rows={6} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenPrompt(false)}>Cancel</Button>
            <Button onClick={async ()=>{
              if (!promptPhId) return;
              try {
                await updatePrompt({ placeholderId: promptPhId, prompt: promptText });
                await queue({ placeholderId: promptPhId });
                toast.success('Prompt updated and generation queued');
                setOpenPrompt(false);
              } catch { toast.error('Failed to update prompt'); }
            }}>Save & Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const HistoryCard: React.FC<{ img: any }> = ({ img }) => {
  const [mode, setMode] = React.useState<'gen' | 'orig'>(img.isGenerated ? 'gen' : 'orig');
  const showUrl = mode === 'orig' && img.originalUrl ? img.originalUrl : img.url;
  return (
    <div>
      <img src={showUrl} className="w-full h-28 object-cover" />
      {img.originalUrl && img.isGenerated && (
        <div className="flex gap-2 p-2">
          <button className={`text-xs px-2 py-1 rounded border ${mode==='gen' ? 'bg-primary text-white' : ''}`} onClick={()=>setMode('gen')}>Generated</button>
          <button className={`text-xs px-2 py-1 rounded border ${mode==='orig' ? 'bg-primary text-white' : ''}`} onClick={()=>setMode('orig')}>Original</button>
        </div>
      )}
    </div>
  );
};

export default AdminPlaceholders;
