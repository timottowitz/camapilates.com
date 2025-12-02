import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  const sess = useQuery(api.admin.session as any, token ? ({ token } as any) : 'skip' as any) as any;
  useEffect(() => {
    if (token && sess) {
      const isAuthenticated = Boolean(sess?.authenticated);
      setAuthed(isAuthenticated);
      setLoading(false);
      if (!isAuthenticated) {
        localStorage.removeItem('admint');
      }
    } else if (!token) {
      setAuthed(false);
      setLoading(false);
    }
  }, [token, sess]);

  if (loading) return <div className="container mx-auto px-4 py-12">Cargando...</div>;
  if (!authed) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default AdminGuard;
