import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminBlogWriter from './AdminBlogWriter';
import { Badge } from '@/components/ui/badge';

type Session = { authenticated: boolean; user?: string };

async function fetchSession(): Promise<Session> {
  const resp = await fetch('/api/admin/session', { credentials: 'include' });
  if (!resp.ok) return { authenticated: false };
  return resp.json();
}

async function login(username: string, password: string): Promise<boolean> {
  const resp = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  return resp.ok;
}

async function logout(): Promise<void> {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
}

const Admin: React.FC = () => {
  const [session, setSession] = useState<Session>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState<{ db: boolean; users: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          fetchSession(),
          fetch('/api/admin/health', { credentials: 'include' }).then(r => r.ok ? r.json() : { db: false, users: 0 })
        ]);
        setSession(s); setHealth(h);
      } catch {
        setHealth({ db: false, users: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(username, password);
    if (ok) {
      const s = await fetchSession();
      setSession(s);
    } else {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = async () => {
    await logout();
    setSession({ authenticated: false });
  };

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
                {error && <div className="text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
              <div className="text-xs text-muted-foreground">
                Si es la primera vez, configure credenciales en el entorno (D1 + ADMIN_USER/ADMIN_PASS) o inicialice vía API.
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
              <span className="text-sm">D1: {health?.db ? 'Conectado' : 'Sin conexión'}</span>
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
