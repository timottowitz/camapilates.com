import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Status = 'idle' | 'saving' | 'testing' | 'saved' | 'error';

const AdminSettings: React.FC = () => {
  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('us-central1');
  const [model, setModel] = useState('imagegeneration@006');
  const [saEmail, setSaEmail] = useState('');
  const [saKey, setSaKey] = useState('');
  const [oauthId, setOauthId] = useState('');
  const [oauthSecret, setOauthSecret] = useState('');
  const [oauthConnected, setOauthConnected] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/settings/vertex', { credentials: 'include' });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data?.configured) {
          setProjectId(data.projectId || '');
          setLocation(data.location || 'us-central1');
          setModel(data.model || 'imagegeneration@006');
          setSaEmail(data.serviceAccountEmail || '');
          setMessage('Configuración cargada');
        }
        const s2 = await fetch('/api/auth/google/status', { credentials: 'include' });
        if (s2.ok) { const j = await s2.json(); setOauthConnected(Boolean(j.connected)); }
      } catch {}
    })();
  }, []);

  const save = async () => {
    setStatus('saving'); setMessage('');
    try {
      const resp = await fetch('/api/settings/vertex', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ projectId, location, model, serviceAccountEmail: saEmail, serviceAccountPrivateKey: saKey, oauthClientId: oauthId, oauthClientSecret: oauthSecret })
      });
      if (resp.ok) { setStatus('saved'); setMessage('Guardado'); }
      else { setStatus('error'); setMessage('No se pudo guardar'); }
    } catch { setStatus('error'); setMessage('No se pudo guardar'); }
  };

  const test = async () => {
    setStatus('testing'); setMessage('');
    try {
      const resp = await fetch('/api/images/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: 'test-connection', headline: 'Prueba de conexión', testOnly: true })
      });
      const data = await resp.json();
      if (resp.ok && data?.success) { setStatus('idle'); setMessage('Conexión correcta con Vertex'); }
      else { setStatus('error'); setMessage('Fallo de conexión con Vertex'); }
    } catch { setStatus('error'); setMessage('Fallo de conexión con Vertex'); }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Admin Settings</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">Configuración de Vertex (Imágenes)</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm">Project ID</label>
                <Input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="my-gcp-project" />
              </div>
              <div>
                <label className="text-sm">Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="us-central1" />
              </div>
              <div>
                <label className="text-sm">Model</label>
                <Input value={model} onChange={e => setModel(e.target.value)} placeholder="imagegeneration@006" />
              </div>
              <div className="pt-4">
                <div className="text-sm font-semibold mb-2">OAuth (alternativa a Service Account)</div>
                <div className="grid gap-3">
                  <div>
                    <label className="text-sm">OAuth Client ID</label>
                    <Input value={oauthId} onChange={e => setOauthId(e.target.value)} placeholder="xxxxxxxx.apps.googleusercontent.com" />
                  </div>
                  <div>
                    <label className="text-sm">OAuth Client Secret</label>
                    <Input value={oauthSecret} onChange={e => setOauthSecret(e.target.value)} placeholder="GOCSPX-..." />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="secondary" onClick={() => { window.location.href = '/api/auth/google/start'; }}>Conectar con Google</Button>
                    {oauthConnected !== null && (
                      <span className={`text-sm ${oauthConnected ? 'text-emerald-600' : 'text-red-600'}`}>OAuth: {oauthConnected ? 'Conectado' : 'Desconectado'}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Agrega <code>{window.location.origin}/api/auth/google/callback</code> como redirect URI en tu OAuth Client en GCP. El usuario que autorice debe tener permisos de Vertex en el proyecto.</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Service Account Email</label>
                <Input value={saEmail} onChange={e => setSaEmail(e.target.value)} placeholder="service-account@project.iam.gserviceaccount.com" />
              </div>
              <div>
                <label className="text-sm">Service Account Private Key (PEM)</label>
                <Textarea value={saKey} onChange={e => setSaKey(e.target.value)} placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----" rows={8} />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={status==='saving'}>{status==='saving' ? 'Guardando…' : 'Guardar'}</Button>
            <Button variant="outline" onClick={test} disabled={status==='testing'}>{status==='testing' ? 'Probando…' : 'Probar conexión'}</Button>
          </div>
          {message && <div className="text-sm text-muted-foreground">{message}</div>}
          <div className="text-xs text-muted-foreground mt-4">
            Nota: Estos valores se guardan cifrados en D1. Asegúrate de configurar el secreto del servidor <code>CONFIG_ENC_KEY</code> en Cloudflare Pages para cifrar/descifrar los datos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
