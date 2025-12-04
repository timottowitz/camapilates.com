import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { CheckCircle, Building2, ArrowLeft } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const ROLES = [
  { value: 'owner', label: 'Dueño/a del estudio' },
  { value: 'manager', label: 'Gerente/Administrador' },
  { value: 'instructor', label: 'Instructor principal' },
  { value: 'other', label: 'Otro rol' },
];

const ClaimStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studioSlug = searchParams.get('studio') || '';
  const studioCity = searchParams.get('city') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'owner',
    studioName: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submitClaim = useMutation(api.studioClaims.submit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await submitClaim({
        studioSlug,
        studioCity,
        studioName: formData.studioName || undefined,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        message: formData.message || undefined,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Hubo un error al enviar tu solicitud.');
      }
    } catch (err) {
      setError('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const origin = getOrigin();

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Reclama Tu Estudio | {DEFAULTS.siteName}</title>
        <meta name="description" content="Reclama tu listado de estudio de Pilates en nuestro directorio. Verifica tu negocio y obtén acceso a funciones premium." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/claim-studio`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[1200px] mx-auto">
        <Link 
          to={studioSlug && studioCity ? `/estudios-de-pilates/${studioCity}/${studioSlug}` : '/estudios-de-pilates'}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#3E2723] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al estudio
        </Link>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mb-8">
              <Building2 className="w-8 h-8 text-[#3E2723]" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-6">
              Reclama Tu Estudio
            </h1>
            
            <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-8">
              Verifica que eres el propietario o administrador de este estudio para obtener acceso 
              a funciones exclusivas y mantener tu información actualizada.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#2A2624] font-medium">Actualiza tu información</p>
                  <p className="text-sm text-[#5D5550]">Horarios, precios, fotos y descripción</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#2A2624] font-medium">Responde a reseñas</p>
                  <p className="text-sm text-[#5D5550]">Conecta con tus clientes potenciales</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#2A2624] font-medium">Insignia de verificado</p>
                  <p className="text-sm text-[#5D5550]">Muestra que tu listado está actualizado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#3E2723] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#2A2624] font-medium">Descuentos en equipo</p>
                  <p className="text-sm text-[#5D5550]">Acceso a precios especiales en reformers</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5D5550]">
              El proceso de verificación toma 1-2 días hábiles. Te contactaremos por teléfono 
              para confirmar tu identidad.
            </p>
          </div>

          {/* Right: Form */}
          <div className="bg-white border border-[#2A2624]/10 rounded-sm p-8 md:p-10">
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-[#3E2723]" />
                </div>
                <h2 className="text-2xl font-serif italic text-[#2A2624] mb-4">
                  ¡Solicitud Enviada!
                </h2>
                <p className="text-[#5D5550] font-light mb-8">
                  Revisaremos tu solicitud y te contactaremos en 1-2 días hábiles 
                  para verificar tu identidad.
                </p>
                <Link
                  to={studioSlug && studioCity ? `/estudios-de-pilates/${studioCity}/${studioSlug}` : '/estudios-de-pilates'}
                  className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
                >
                  Volver al Estudio
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="studioName" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Nombre del Estudio
                  </label>
                  <input
                    id="studioName"
                    name="studioName"
                    type="text"
                    value={formData.studioName}
                    onChange={handleChange}
                    placeholder="Confirma el nombre de tu estudio"
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Tu Nombre Completo *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Teléfono *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="55 1234 5678"
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Tu Rol en el Estudio *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors bg-white"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#2A2624] mb-2">
                    Mensaje Adicional (opcional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="¿Algo más que debamos saber?"
                    className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-sm focus:outline-none focus:border-[#3E2723] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitud de Reclamo'}
                </button>

                <p className="text-[10px] text-[#5D5550] text-center">
                  Al enviar, aceptas nuestros{' '}
                  <Link to="/legal/terminos" className="underline">Términos de Servicio</Link>
                  {' '}y{' '}
                  <Link to="/legal/privacidad" className="underline">Política de Privacidad</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default ClaimStudio;
