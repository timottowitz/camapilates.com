import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { useLoadTimeout } from '@/hooks/useLoadTimeout';

const MiPerfil: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const loginMutation = useMutation(api.instructorAuth.login);

  // Check for existing session
  const existingToken = typeof window !== 'undefined' ? localStorage.getItem('instructor_token') : null;
  const sessionData = useQuery(
    api.instructorAuth.validateSession,
    existingToken ? { token: existingToken } : 'skip'
  );

  useEffect(() => {
    if (sessionData !== undefined) {
      if (sessionData.authenticated) {
        // Already logged in, redirect to edit page
        navigate('/mi-perfil/editar');
      } else {
        // Invalid session, clear token
        localStorage.removeItem('instructor_token');
        setCheckingSession(false);
      }
    } else if (!existingToken) {
      setCheckingSession(false);
    }
  }, [sessionData, navigate, existingToken]);

  // If session validation never resolves (backend unreachable), stop blocking
  // on the spinner and let the user log in normally instead of hanging.
  const sessionCheckTimedOut = useLoadTimeout(checkingSession && sessionData === undefined);
  useEffect(() => {
    if (sessionCheckTimedOut) setCheckingSession(false);
  }, [sessionCheckTimedOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginMutation({ email, password });

      if (result.ok && result.token) {
        localStorage.setItem('instructor_token', result.token);
        navigate('/mi-perfil/editar');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const origin = getOrigin();

  // Loading state while checking session
  if (checkingSession) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355]" />
          <p className="mt-4 text-[#5D5550]">Verificando sesión...</p>
        </section>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Iniciar Sesión - Instructores | {DEFAULTS.siteName}</title>
        <meta name="description" content="Inicia sesión para gestionar tu perfil de instructor en el directorio de CAMA Pilates." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/mi-perfil`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-[#3E2723]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4">
            Acceso Instructores
          </h1>

          <p className="text-[#5D5550]">
            Inicia sesión para editar tu perfil en el directorio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#2A2624] mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#2A2624] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5D5550] hover:text-[#3E2723]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3E2723] text-white py-4 rounded-lg font-medium hover:bg-[#5D4037] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 space-y-4 text-center text-sm">
          <p className="text-[#5D5550]">
            <Link to="/reset-password" className="text-[#8B7355] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <div className="border-t border-[#E8E4E1] pt-4">
            <p className="text-[#5D5550]">
              ¿Eres instructor y no tienes cuenta?{' '}
              <Link to="/instructores-pilates" className="text-[#8B7355] hover:underline">
                Reclama tu perfil
              </Link>
            </p>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default MiPerfil;
