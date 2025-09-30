import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminBlogWriter from './AdminBlogWriter';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type Session = { authenticated: boolean; user?: string };

const Admin: React.FC = () => {
  const [session, setSession] = useState<Session>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState<{ db: boolean; users: number } | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);

  const healthQuery = useQuery(api.admin.health as any, {} as any) as any;
  useEffect(() => {
    if (healthQuery) { setHealth(healthQuery); setLoading(false); }
  }, [healthQuery]);

  // Load Turnstile and render widget if site key provided
  useEffect(() => {
    (async () => {
      try {
        // Attempt to read site key from global var set by server var (if proxied) or window.__TURNSTILE_SITE_KEY
        const key = (window as any).__TURNSTILE_SITE_KEY || '';
        if (key) setSiteKey(key);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    if (!siteKey || !captchaRef.current) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => {
      try {
        // @ts-ignore
        window.turnstile.render(captchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => { (window as any).__turnstileToken = token; }
        });
      } catch {}
    };
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch {} };
  }, [siteKey]);

  const mutateLogin = useMutation(api.admin.login as any);
  const mutateLogout = useMutation(api.admin.logout as any);
  const mutateInit = useMutation(api.admin.init as any);
  const usersQuery = useQuery(api.admin.users as any, {} as any) as string[] | undefined;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await mutateLogin({ username, password } as any);
      if (res?.ok && res?.token) {
        localStorage.setItem('admint', res.token);
        setSession({ authenticated: true, user: res.username });
      } else {
        setError(res?.error || 'Credenciales inválidas');
      }
    } catch { setError('Credenciales inválidas'); }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admint') || '';
      if (token) await mutateLogout({ token } as any);
    } catch {}
    localStorage.removeItem('admint');
    setSession({ authenticated: false });
  };

  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  const sessQuery = useQuery(api.admin.session as any, token ? ({ token } as any) : 'skip' as any) as any;
  useEffect(() => {
    if (token && sessQuery) setSession({ authenticated: Boolean(sessQuery?.authenticated), user: sessQuery?.user });
    else setSession({ authenticated: false });
  }, [token, sessQuery]);

  if (loading) return <div className="container mx-auto px-4 py-12">Cargando…</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {!session.authenticated ? (
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h1 className="text-2xl font-bold">Iniciar sesión</h1>
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-sm">Usuario</label>
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
                </div>
                <div>
                  <label className="text-sm">Contraseña</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                {siteKey && (
                  <div className="pt-1">
                    <div ref={captchaRef} className="cf-turnstile" />
                  </div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
              <div className="text-xs text-muted-foreground">
                {Array.isArray(usersQuery) && usersQuery.length === 0 ? (
                  <div className="space-y-2">
                    <div>No hay usuarios aún. Inicializa credenciales:</div>
                    <Button variant="outline" onClick={async ()=>{
                      try {
                        const res = await mutateInit({ username, password } as any);
                        if (res?.ok) {
                          const r = await mutateLogin({ username, password } as any);
                          if (r?.ok && r?.token) {
                            localStorage.setItem('admint', r.token);
                            setSession({ authenticated: true, user: r.username });
                          }
                        } else setError(res?.error || 'No se pudo inicializar');
                      } catch { setError('No se pudo inicializar'); }
                    }}>Inicializar con estos datos</Button>
                  </div>
                ) : (
                  <>Si es la primera vez, pida a un admin que le cree usuario en Configuración.</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <div className="flex items-center gap-3">
              <Link to="/admin/settings" className="text-sm underline text-primary hover:text-primary/80">Configuración</Link>
              <Link to="/admin/blog-writer" className="text-sm underline text-primary hover:text-primary/80">Blog Writer</Link>
              <div className="text-sm text-muted-foreground">{session.user}</div>
              <Button variant="outline" onClick={handleLogout}>Salir</Button>
            </div>
          </div>
          <div className="mb-6 p-4 border rounded bg-muted/30 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${health?.db ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Convex: {health?.db ? 'Conectado' : 'Sin conexión'}</span>
            </div>
            <div className="text-sm text-muted-foreground">Usuarios: {health?.users ?? 0}</div>
            {session.user && <Badge variant="secondary">{session.user}</Badge>}
          </div>
          <AdminBlogWriter />
        </div>
      )}
    </div>
  );
};

export default Admin;
