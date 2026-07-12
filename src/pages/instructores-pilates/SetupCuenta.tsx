import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { useLoadTimeout } from '@/hooks/useLoadTimeout';

const SetupCuenta: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tokenData = useQuery(api.instructorAuth.getAccountBySetupToken, { token });
  const setupPasswordMutation = useMutation(api.instructorAuth.setupPassword);
  const verifyTimedOut = useLoadTimeout(tokenData === undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const result = await setupPasswordMutation({ token, password });

      if (result.ok && result.token) {
        // Store session token
        localStorage.setItem('instructor_token', result.token);
        setSuccess(true);

        // Redirect to profile edit after 2 seconds
        setTimeout(() => {
          navigate('/mi-perfil/editar');
        }, 2000);
      } else {
        setError(result.error || 'Error al configurar la contraseña');
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const origin = getOrigin();

  // Loading state
  if (tokenData === undefined && !verifyTimedOut) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355]" />
          <p className="mt-4 text-[#5D5550]">Verificando enlace...</p>
        </section>
      </LuxuryLayout>
    );
  }

  // Verification never completed (backend unreachable): let the user retry.
  if (tokenData === undefined && verifyTimedOut) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-serif italic text-[#2A2624] mb-4">Problema de conexión</h1>
          <p className="text-[#5D5550] mb-8">
            No pudimos verificar tu enlace. Revisa tu conexión e inténtalo de nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3E2723] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5D4037] transition-colors"
          >
            Reintentar
          </button>
        </section>
      </LuxuryLayout>
    );
  }

  // Invalid or expired token
  if (!tokenData?.valid) {
    return (
      <LuxuryLayout>
        <Helmet>
          <title>Enlace Inválido | {DEFAULTS.siteName}</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#2A2624] mb-4">
            {tokenData?.error || 'Enlace inválido'}
          </h1>

          <p className="text-[#5D5550] mb-8">
            Este enlace ha expirado o ya fue utilizado.
            Si necesitas un nuevo enlace, puedes solicitarlo desde la página de inicio de sesión.
          </p>

          <Link
            to="/mi-perfil"
            className="inline-block bg-[#3E2723] text-white px-8 py-3 rounded-lg hover:bg-[#5D4037] transition-colors"
          >
            Ir a inicio de sesión
          </Link>
        </section>
      </LuxuryLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#2A2624] mb-4">
            ¡Cuenta configurada!
          </h1>

          <p className="text-[#5D5550] mb-4">
            Tu contraseña ha sido creada exitosamente.
            Redirigiendo a tu perfil...
          </p>

          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#8B7355]" />
        </section>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Configura Tu Cuenta | {DEFAULTS.siteName}</title>
        <meta name="description" content="Configura tu cuenta de instructor para gestionar tu perfil en el directorio de CAMA Pilates." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/setup-cuenta`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#3E2723]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4">
            ¡Hola {tokenData.teacherName}!
          </h1>

          <p className="text-[#5D5550]">
            Crea una contraseña para acceder a tu perfil de instructor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-[#2A2624] mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={tokenData.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] bg-[#F9F7F5] text-[#5D5550]"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-[#2A2624] mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
                required
                minLength={8}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[#2A2624] mb-2">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              required
              minLength={8}
            />
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
                Configurando...
              </>
            ) : (
              'Crear mi cuenta'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#5D5550] mt-8">
          ¿Ya tienes cuenta?{' '}
          <Link to="/mi-perfil" className="text-[#8B7355] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </section>
    </LuxuryLayout>
  );
};

export default SetupCuenta;
