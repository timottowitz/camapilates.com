import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type MagnetType = 'routine' | 'checklist' | 'pricing';

interface LeadMagnetPopupProps {
  magnet: MagnetType;
  source: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAGNETS: Record<MagnetType, {
  title: string;
  description: string;
  buttonText: string;
  successMessage: string;
  icon: string;
}> = {
  routine: {
    title: 'Rutina Matutina de 5 Minutos',
    description: 'Descarga gratis nuestra rutina de Reformer para empezar el día con energía. Incluye 8 ejercicios esenciales.',
    buttonText: 'Descargar PDF Gratis',
    successMessage: '¡Listo! Revisa tu correo para descargar la rutina.',
    icon: '🌅',
  },
  checklist: {
    title: 'Checklist de Compra de Reformer',
    description: '15 puntos que debes evaluar antes de invertir en tu cama de Pilates. Evita errores costosos.',
    buttonText: 'Obtener Checklist',
    successMessage: '¡Perfecto! Te enviamos el checklist a tu correo.',
    icon: '✅',
  },
  pricing: {
    title: 'Calculadora de Precios para Estudio',
    description: 'Estima tu inversión inicial en equipo profesional. Incluye reformers, accesorios y luz terapéutica.',
    buttonText: 'Calcular Inversión',
    successMessage: '¡Excelente! Te enviamos la calculadora interactiva.',
    icon: '📊',
  },
};

const LeadMagnetPopup: React.FC<LeadMagnetPopupProps> = ({
  magnet,
  source,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const captureLead = useMutation(api.leads.capture);
  const config = MAGNETS[magnet];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await captureLead({
        email,
        magnet,
        source,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        },
      });
      
      setSuccess(true);
      onSuccess?.();
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5D5550] hover:text-[#2A2624] transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-[#2A2624] text-[#EAE8E4] p-8 text-center">
          <span className="text-4xl block mb-4">{config.icon}</span>
          <h2 className="text-2xl font-serif italic mb-2">{config.title}</h2>
          <p className="text-sm text-white/70 font-light">{config.description}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {success ? (
            <div className="text-center py-4">
              <span className="text-4xl block mb-4">🎉</span>
              <p className="text-[#2A2624] font-medium">{config.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="lead-email" className="sr-only">Email</label>
                <input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-[#2A2624]/20 rounded-full text-center focus:outline-none focus:border-[#3E2723] transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : config.buttonText}
              </button>

              <p className="text-[10px] text-[#5D5550] text-center">
                Tu privacidad es importante. No compartimos tu correo con terceros.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadMagnetPopup;
