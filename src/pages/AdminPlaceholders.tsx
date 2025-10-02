import React, { useMemo, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const StatusBadge: React.FC<{ s: string }> = ({ s }) => {
  const color = s === 'active' ? 'bg-green-100 text-green-800' : s === 'image_assigned' ? 'bg-blue-100 text-blue-800' : s === 'prompt_generated' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800';
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{s}</span>;
};

const AdminPlaceholders: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const rows = useQuery(api.placeholders.listWithPreview, status ? { status } as any : {} as any) as any[] | undefined;
  const queue = useAction(api.placeholderGeneration.queue) as any;

  const filtered = rows || [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of filtered) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [filtered]);

  async function queueAllPending() {
    const pending = filtered.filter(r => r.status === 'pending' || r.status === 'prompt_generated');
    for (const r of pending.slice(0, 50)) {
      try { await queue({ placeholderId: r.placeholderId }); } catch {}
    }
    alert(`Queued ${pending.length} placeholders`);
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
      </div>
      <div className="text-sm text-muted-foreground mb-4">Totals: {Object.entries(counts).map(([k,v]) => `${k}: ${v}`).join(' · ') || '—'}</div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">Preview</th>
              <th className="text-left px-3 py-2">Placeholder</th>
              <th className="text-left px-3 py-2">Page</th>
              <th className="text-left px-3 py-2">Location</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Aspect</th>
              <th className="text-left px-3 py-2">Heading</th>
              <th className="text-left px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(filtered || []).map((r) => (
              <tr key={r.placeholderId} className="border-t">
                <td className="px-3 py-2">
                  {r.previewUrl ? (
                    <img
                      src={r.previewUrl}
                      alt={r.headingAbove || r.placeholderId}
                      className="h-14 w-24 object-cover rounded cursor-pointer border"
                      title="Click to cycle (regenerate)"
                      onClick={async ()=>{ try { await queue({ placeholderId: r.placeholderId }); alert('Regeneration queued'); } catch {} }}
                    />
                  ) : (
                    <div className="h-14 w-24 bg-muted rounded border" />
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{r.placeholderId}</td>
                <td className="px-3 py-2">{r.pageType}{r.pageSlug ? `/${r.pageSlug}` : ''}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td className="px-3 py-2"><StatusBadge s={r.status} /></td>
                <td className="px-3 py-2">{r.preferredAspectRatio}</td>
                <td className="px-3 py-2">{r.headingAbove?.slice(0, 80)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPlaceholders;
