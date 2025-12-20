import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // If no token, show request form. If token, show reset form.
  if (token) {
    return <ResetPasswordWithToken token={token} />;
  }

  return <RequestPasswordReset />;
};

// Request password reset (enter email)
const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const requestResetMutation = useMutation(api.instructorAuth.requestPasswordReset);
  const sendResetEmailAction = useAction(api.instructorEmail.sendPasswordResetEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requestResetMutation({ email });

      // Check if we should send email
      if (result.ok && result._internal?.shouldSendEmail) {
        await sendResetEmailAction({
          email: result._internal.email,
          teacherName: result._internal.teacherName,
          resetToken: result._internal.resetToken,
        });
      }

      // Always show success (even if email doesn't exist) to prevent enumeration
      setSuccess(true);
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const origin = getOrigin();

  if (success) {
    return (
      <LuxuryLayout>
        <Helmet>
          <title>Correo Enviado | {DEFAULTS.siteName}</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#2A2624] mb-4">
            Revisa tu correo
          </h1>

          <p className="text-[#5D5550] mb-8">
            Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
            El enlace expira en 24 horas.
          </p>

          <Link
            to="/mi-perfil"
            className="text-[#8B7355] hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </section>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Restablecer Contraseña | {DEFAULTS.siteName}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/reset-password`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#3E2723]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4">
            ¿Olvidaste tu contraseña?
          </h1>

          <p className="text-[#5D5550]">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3E2723] text-white py-4 rounded-lg font-medium hover:bg-[#5D4037] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#5D5550] mt-8">
          <Link to="/mi-perfil" className="text-[#8B7355] hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </section>
    </LuxuryLayout>
  );
};

// Reset password with token
const ResetPasswordWithToken: React.FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tokenData = useQuery(api.instructorAuth.getAccountByResetToken, { token });
  const resetPasswordMutation = useMutation(api.instructorAuth.resetPassword);

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
      const result = await resetPasswordMutation({ token, password });

      if (result.ok && result.token) {
        localStorage.setItem('instructor_token', result.token);
        setSuccess(true);

        setTimeout(() => {
          navigate('/mi-perfil/editar');
        }, 2000);
      } else {
        setError(result.error || 'Error al restablecer contraseña');
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (tokenData === undefined) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355]" />
          <p className="mt-4 text-[#5D5550]">Verificando enlace...</p>
        </section>
      </LuxuryLayout>
    );
  }

  // Invalid token
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
          </p>

          <Link
            to="/reset-password"
            className="inline-block bg-[#3E2723] text-white px-8 py-3 rounded-lg hover:bg-[#5D4037] transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </section>
      </LuxuryLayout>
    );
  }

  // Success
  if (success) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif italic text-[#2A2624] mb-4">
            ¡Contraseña actualizada!
          </h1>

          <p className="text-[#5D5550] mb-4">
            Tu contraseña ha sido cambiada exitosamente.
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
        <title>Nueva Contraseña | {DEFAULTS.siteName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#3E2723]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-4">
            Crear nueva contraseña
          </h1>

          <p className="text-[#5D5550]">
            Cuenta: <strong>{tokenData.email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3E2723] text-white py-4 rounded-lg font-medium hover:bg-[#5D4037] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      </section>
    </LuxuryLayout>
  );
};

export default ResetPassword;
