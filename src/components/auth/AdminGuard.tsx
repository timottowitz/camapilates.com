import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('/api/admin/session', { credentials: 'include' });
        if (!mounted) return;
        setAuthed(resp.ok);
      } catch {
        if (!mounted) return;
        setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12">Cargando…</div>;
  if (!authed) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default AdminGuard;

