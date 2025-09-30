import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  const [siteKey, setSiteKey] = useState('');
  // Users & Sessions
  const [users, setUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [sessions, setSessions] = useState<Array<{ token: string; tokenShort: string; username: string; expires: number }>>([]);
  const [sessMsg, setSessMsg] = useState('');
  // Password change
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [loadedConfig, setLoadedConfig] = useState(false);
  const [oauthRefreshTick, setOauthRefreshTick] = useState(0);
  const [oauthBanner, setOauthBanner] = useState<string | null>(null);
  const [oauthBannerError, setOauthBannerError] = useState(false);

  // Convex: Vertex settings
  const vertexCfg = useQuery(api.settings.getVertexConfig, {} as any) as any;
  const setVertex = useMutation(api.settings.setVertexConfig);
  const testImages = useAction(api.images.generateImages);

  const uQuery = useQuery(api.admin.users as any, {} as any) as string[] | undefined;
  const sQuery = useQuery(api.admin.sessions as any, {} as any) as any;
  const mutateChangePassword = useMutation(api.admin.changePassword as any);
  const mutateAddUser = useMutation(api.admin.addUser as any);
  const mutateDeleteUser = useMutation(api.admin.deleteUser as any);
  const mutateRevokeSession = useMutation(api.admin.revokeSession as any);

  const oauthStatus = useQuery(api.settings.getOAuthStatus as any, {} as any) as any;
  const providerStatus = useQuery(api.settings.getProviderKeysStatus as any, {} as any) as any;
  const saveProviderKey = useMutation(api.settings.setProviderKey as any);
  const delProviderKey = useMutation(api.settings.deleteProviderKey as any);
  const deepModeQuery = useQuery(api.settings.getDeepMode as any, {} as any) as any;
  const setDeepMode = useMutation(api.settings.setDeepMode as any);
  const hasOAuthClient = Boolean(vertexCfg?.oauthClientId && vertexCfg?.oauthClientSecret);
  useEffect(() => {
    (async () => {
      try {
        if (vertexCfg && vertexCfg.configured && !loadedConfig) {
          setProjectId(vertexCfg.projectId || '');
          setLocation(vertexCfg.location || 'us-central1');
          setModel(vertexCfg.model || 'imagegeneration@006');
          setSaEmail(vertexCfg.serviceAccountEmail || '');
          setMessage('Configuración cargada');
          setLoadedConfig(true);
        }
        if (typeof oauthStatus?.connected === 'boolean') setOauthConnected(Boolean(oauthStatus.connected));
        if (Array.isArray(uQuery)) setUsers(uQuery);
        if (sQuery?.items) setSessions(sQuery.items);
      } catch {}
    })();
  }, [vertexCfg, loadedConfig, uQuery, sQuery, oauthStatus]);

  // Detect OAuth callback success and show banner briefly
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const ok = u.searchParams.get('oauth');
      if (ok === 'connected') {
        setOauthBanner('OAuth conectado correctamente');
        setOauthBannerError(false);
        // Clean URL param
        u.searchParams.delete('oauth');
        window.history.replaceState({}, document.title, u.toString());
        // Refresh status
        setTimeout(() => setOauthRefreshTick(v => v + 1), 300);
        // Hide banner after a few seconds
        setTimeout(() => setOauthBanner(null), 4000);
      } else if (ok === 'error') {
        const reason = u.searchParams.get('reason') || 'error_desconocido';
        setOauthBanner(`Error de OAuth: ${reason.replace(/_/g, ' ')}`);
        setOauthBannerError(true);
        u.searchParams.delete('oauth'); u.searchParams.delete('reason');
        window.history.replaceState({}, document.title, u.toString());
        setTimeout(() => setOauthBanner(null), 6000);
      }
    } catch {}
  }, []);

  const save = async () => {
    setStatus('saving'); setMessage('');
    try {
      await setVertex({ projectId, location, model, serviceAccountEmail: saEmail || undefined, serviceAccountPrivateKey: saKey || undefined, oauthClientId: oauthId || undefined, oauthClientSecret: oauthSecret || undefined } as any);
      setStatus('saved'); setMessage('Guardado');
    } catch { setStatus('error'); setMessage('No se pudo guardar'); }
  };

  const test = async () => {
    setStatus('testing'); setMessage('');
    try {
      const data = await testImages({ slug: 'test-connection', headline: 'Prueba de conexión', testOnly: true } as any);
      if (data?.success) { setStatus('idle'); setMessage('Conexión correcta con Vertex'); }
      else { setStatus('error'); setMessage('Fallo de conexión con Vertex'); }
    } catch { setStatus('error'); setMessage('Fallo de conexión con Vertex'); }
  };

  const changePassword = async () => {
    setPwMsg('');
    if (!curPass || !newPass || !newPass2) { setPwMsg('Completa todos los campos'); return; }
    if (newPass !== newPass2) { setPwMsg('Las contraseñas no coinciden'); return; }
    if (newPass.length < 8) { setPwMsg('La contraseña debe tener al menos 8 caracteres'); return; }
    try {
      const token = localStorage.getItem('admint') || '';
      if (!token) { setPwMsg('No autenticado'); return; }
      const out = await mutateChangePassword({ token, current_password: curPass, new_password: newPass } as any);
      if (out?.ok) { setPwMsg('Contraseña actualizada'); setCurPass(''); setNewPass(''); setNewPass2(''); }
      else setPwMsg(out?.error || 'No se pudo actualizar');
    } catch { setPwMsg('No se pudo actualizar'); }
  };

  const addUser = async () => {
    setUserMsg('');
    if (!newUser || !newUserPass) { setUserMsg('Usuario y contraseña requeridos'); return; }
    if (newUserPass.length < 8) { setUserMsg('Contraseña mínima de 8 caracteres'); return; }
    try {
      const token = localStorage.getItem('admint') || '';
      if (!token) { setUserMsg('No autenticado'); return; }
      const out = await mutateAddUser({ token, username: newUser, password: newUserPass } as any);
      if (out?.ok) {
        setUserMsg('Usuario creado'); setNewUser(''); setNewUserPass('');
        const uq = (await import('convex/react')).useQuery as any; // hint only
      } else setUserMsg(out?.error || 'No se pudo crear');
    } catch { setUserMsg('No se pudo crear'); }
  };

  const deleteUser = async (username: string) => {
    setUserMsg('');
    if (!confirm(`Eliminar usuario ${username}?`)) return;
    try {
      const token = localStorage.getItem('admint') || '';
      if (!token) { setUserMsg('No autenticado'); return; }
      const out = await mutateDeleteUser({ token, username } as any);
      if (out?.ok) { setUserMsg('Usuario eliminado'); setUsers(prev => prev.filter(u => u !== username)); }
      else setUserMsg(out?.error || 'No se pudo eliminar');
    } catch { setUserMsg('No se pudo eliminar'); }
  };

  const revokeSession = async (tok: string) => {
    setSessMsg('');
    try {
      const token = localStorage.getItem('admint') || '';
      if (!token) { setSessMsg('No autenticado'); return; }
      const out = await mutateRevokeSession({ token, revoke: tok } as any);
      if (out?.ok) { setSessMsg('Sesión revocada'); setSessions(prev => prev.filter(s => s.token !== tok)); }
      else setSessMsg(out?.error || 'No se pudo revocar');
    } catch { setSessMsg('No se pudo revocar'); }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Admin Settings</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      {oauthBanner && (
        <div className={`mb-4 text-sm rounded px-3 py-2 ${oauthBannerError ? 'text-red-700 border border-red-200 bg-red-50' : 'text-emerald-700 border border-emerald-200 bg-emerald-50'}`}>
          {oauthBanner}
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Deep Research Mode</h2>
            <div className="text-sm text-muted-foreground">Selecciona el modo por defecto para descubrimiento profundo.</div>
            <div className="flex items-center gap-3">
              <select
                className="border rounded p-2 text-sm"
                value={deepModeQuery?.mode || 'direct'}
                onChange={async (e)=>{ try { await setDeepMode({ mode: e.target.value } as any); } catch {} }}
              >
                <option value="direct">Direct API Calls</option>
                <option value="agent">AI SDK Agent</option>
              </select>
              <div className="text-xs text-muted-foreground">Usa agente para orquestar búsqueda y síntesis multi‑proveedor.</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">AI Providers</h2>
            <div className="text-sm text-muted-foreground">Administra API keys para investigadores profundos.</div>
            {['openai','perplexity','gemini','exa','firecrawl'].map((p) => (
              <ProviderKeyRow key={p} provider={p} status={Boolean(providerStatus?.[p])} onSave={async (k)=>{ await saveProviderKey({ provider: p, key: k } as any); }} onDelete={async ()=>{ await delProviderKey({ provider: p } as any); }} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Cuenta (Administrador)</h2>
            <div className="grid gap-3 max-w-md">
              <div>
                <label className="text-sm">Turnstile site key (opcional)</label>
                <Input value={siteKey} onChange={(e) => setSiteKey(e.target.value)} placeholder="0x4AAAA... (opcional)" />
                <div className="text-xs text-muted-foreground">Si se establece, el login mostrará CAPTCHA Turnstile para reducir ataques. Configure TURNSTILE_SECRET en el Worker.</div>
              </div>
              <div>
                <label className="text-sm">Contraseña actual</label>
                <Input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Nueva contraseña</label>
                <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Confirmar nueva contraseña</label>
                <Input type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} />
              </div>
              {pwMsg && <div className={`text-sm ${/actualizada|ok/i.test(pwMsg) ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg}</div>}
              <Button onClick={changePassword}>Actualizar contraseña</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Usuarios</h2>
            <div className="grid gap-3 max-w-md">
              <div className="flex gap-2">
                <Input placeholder="Usuario" value={newUser} onChange={(e)=>setNewUser(e.target.value)} />
                <Input placeholder="Contraseña" type="password" value={newUserPass} onChange={(e)=>setNewUserPass(e.target.value)} />
                <Button onClick={addUser}>Añadir</Button>
              </div>
              {userMsg && <div className={`text-sm ${/creado|eliminado/i.test(userMsg) ? 'text-emerald-600' : 'text-red-600'}`}>{userMsg}</div>}
              <div className="text-sm text-muted-foreground">Lista:</div>
              <ul className="space-y-1 text-sm">
                {users.map(u => (
                  <li key={u} className="flex items-center justify-between border rounded px-2 py-1">
                    <span>{u}</span>
                    <Button size="sm" variant="outline" onClick={()=>deleteUser(u)}>Eliminar</Button>
                  </li>
                ))}
                {users.length === 0 && <li className="text-muted-foreground">Sin usuarios</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Vertex (Imágenes)</h2>
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
                {hasOAuthClient ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="secondary" onClick={() => { const base = (import.meta as any).env?.VITE_CONVEX_URL || ''; window.location.href = `${base}/api/auth/google/start`; }}>Conectar con Google</Button>
                      {oauthConnected !== null && (
                        <span className={`text-sm ${oauthConnected ? 'text-emerald-600' : 'text-red-600'}`}>OAuth: {oauthConnected ? 'Conectado' : 'Desconectado'}</span>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => setOauthRefreshTick(v=>v+1)}>Actualizar estado</Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Agrega <code>{(import.meta as any).env?.VITE_CONVEX_URL || 'https://<your-convex>.convex.cloud'}/api/auth/google/callback</code> como redirect URI en tu OAuth Client en GCP. El usuario que autorice debe tener permisos de Vertex en el proyecto.</div>
                  </>
                ) : (
                  <div className="text-sm text-red-600">OAuth no configurado: agrega Client ID y Secret arriba y guarda los cambios para habilitar la conexión con Google.</div>
                )}
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
              Nota: Estos valores se guardan cifrados en Convex. Configura el secreto <code>CONFIG_ENC_KEY</code> en el entorno del servidor de Convex.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Sesiones</h2>
            {sessMsg && <div className={`text-sm ${/revocada/i.test(sessMsg) ? 'text-emerald-600' : 'text-red-600'}`}>{sessMsg}</div>}
            <div className="text-xs text-muted-foreground">Activas:</div>
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.token} className="flex items-center justify-between border rounded px-2 py-1 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{s.tokenShort}</span>
                    <span>{s.username}</span>
                    <span className="text-muted-foreground">exp: {new Date(s.expires*1000).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={()=>revokeSession(s.token)}>Revocar</Button>
                </div>
              ))}
              {sessions.length === 0 && <div className="text-muted-foreground text-sm">Sin sesiones activas</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

function ProviderKeyRow({ provider, status, onSave, onDelete }: { provider: string; status: boolean; onSave: (k: string)=>Promise<void>; onDelete: ()=>Promise<void> }) {
  const [value, setValue] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        <div className={`text-xs ${status ? 'text-emerald-600' : 'text-red-600'}`}>{status ? 'Guardado' : 'No configurado'}</div>
      </div>
      {!status ? (
        <div className="flex items-center gap-2">
          <Input type="password" placeholder={`${label} API Key`} value={value} onChange={(e)=>setValue(e.target.value)} />
          <Button size="sm" onClick={async ()=>{ try { await onSave(value.trim()); setValue(''); setMsg('Guardado'); setTimeout(()=>setMsg(''), 3000);} catch { setMsg('Error'); } }}>Guardar</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={async ()=>{ try { await onDelete(); setMsg('Eliminado'); setTimeout(()=>setMsg(''), 3000);} catch { setMsg('Error'); } }}>Eliminar</Button>
          <div className="text-xs text-muted-foreground">Para actualizar, primero elimina y luego guarda la nueva.</div>
        </div>
      )}
      {msg && <div className="text-xs text-muted-foreground">{msg}</div>}
    </div>
  );
}
