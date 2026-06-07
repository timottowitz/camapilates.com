import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
  source: string;
}

type Step = 1 | 2 | 3;

type ExperienceLevel = 'beginner' | 'some-experience' | 'advanced';
type Timeline = 'asap' | '1-3-months' | '3-6-months' | 'flexible';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experienceLevel: ExperienceLevel | '';
  preferredTimeline: Timeline | '';
}

const CITIES = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Puebla',
  'Querétaro',
  'Otro',
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Principiante', description: 'Nunca he enseñado Pilates' },
  { value: 'some-experience', label: 'Tengo experiencia', description: 'Algo de experiencia en Pilates' },
  { value: 'advanced', label: 'Avanzado', description: 'Actualmente enseño Pilates' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'Lo antes posible' },
  { value: '1-3-months', label: 'En 1-3 meses' },
  { value: '3-6-months', label: 'En 3-6 meses' },
  { value: 'flexible', label: 'Flexible' },
];

export const PreRegistrationModal: React.FC<PreRegistrationModalProps> = ({
  isOpen,
  onClose,
  defaultCity = '',
  source,
}) => {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    city: defaultCity,
    experienceLevel: '',
    preferredTimeline: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const submitPreRegistration = useMutation(api.certificationPreRegistrations.submitPreRegistration);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          city: defaultCity,
          experienceLevel: '',
          preferredTimeline: '',
        });
        setErrors({});
        setShowSuccess(false);
      }, 300);
    }
  }, [isOpen, defaultCity]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.city) {
      newErrors.city = 'Selecciona una ciudad';
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Selecciona tu nivel de experiencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.preferredTimeline) {
      newErrors.preferredTimeline = 'Selecciona tu línea de tiempo preferida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }

    if (isValid && step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await submitPreRegistration({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        experienceLevel: formData.experienceLevel as ExperienceLevel,
        preferredTimeline: formData.preferredTimeline as Timeline,
        source,
      });

      setShowSuccess(true);

      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error: unknown) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Error al enviar el formulario',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Confirm if user has entered data
    if (formData.fullName || formData.email || formData.phone) {
      if (confirm('¿Estás seguro de que quieres salir? Se perderá tu información.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-[#2A2624]/10">
          <DialogTitle className="sr-only">Registro exitoso</DialogTitle>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3E2723] rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4">
              ¡Registro exitoso!
            </h2>

            <p className="text-[#5D5550] leading-relaxed mb-2">
              Te contactaremos en las próximas <strong>48 horas</strong> con información sobre las próximas certificaciones en{' '}
              <strong>{formData.city}</strong>.
            </p>

            <p className="text-sm text-[#5D5550]/70 mt-6">
              Esta ventana se cerrará automáticamente...
            </p>

            <Button
              onClick={onClose}
              className="mt-8 bg-[#2A2624] hover:bg-[#3E2723] text-white"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl border-[#2A2624]/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Pre-registro para certificación de Pilates</DialogTitle>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[#3E2723]'
                    : s < step
                    ? 'w-2 bg-[#3E2723]'
                    : 'w-2 bg-[#2A2624]/20'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2">
                  Comencemos con lo básico
                </h2>
                <p className="text-sm text-[#5D5550]">Paso 1 de 3</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-[#2A2624] font-medium">
                    Nombre completo *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1.5 border-[#2A2624]/20 focus:border-[#3E2723]"
                    placeholder="Tu nombre"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#2A2624] font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 border-[#2A2624]/20 focus:border-[#3E2723]"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[#2A2624] font-medium">
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5 border-[#2A2624]/20 focus:border-[#3E2723]"
                    placeholder="10 dígitos"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-[#2A2624] hover:bg-[#3E2723] text-white"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2">
                  Cuéntanos sobre tu experiencia
                </h2>
                <p className="text-sm text-[#5D5550]">Paso 2 de 3</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="city" className="text-[#2A2624] font-medium">
                    ¿En qué ciudad estás? *
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger className="mt-1.5 border-[#2A2624]/20">
                      <SelectValue placeholder="Selecciona una ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label className="text-[#2A2624] font-medium mb-3 block">
                    Nivel de experiencia *
                  </Label>
                  <div className="space-y-2">
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, experienceLevel: option.value as ExperienceLevel })}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          formData.experienceLevel === option.value
                            ? 'border-[#3E2723] bg-[#3E2723]/5'
                            : 'border-[#2A2624]/10 hover:border-[#2A2624]/30'
                        }`}
                      >
                        <div className="font-medium text-[#2A2624]">{option.label}</div>
                        <div className="text-xs text-[#5D5550] mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                  {errors.experienceLevel && (
                    <p className="text-xs text-red-600 mt-1">{errors.experienceLevel}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-[#2A2624]/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-[#2A2624] hover:bg-[#3E2723] text-white"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Timeline & Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2">
                  ¿Cuándo te gustaría empezar?
                </h2>
                <p className="text-sm text-[#5D5550]">Paso 3 de 3</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[#2A2624] font-medium mb-3 block">
                    Línea de tiempo preferida *
                  </Label>
                  <div className="space-y-2">
                    {TIMELINE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredTimeline: option.value as Timeline })}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          formData.preferredTimeline === option.value
                            ? 'border-[#3E2723] bg-[#3E2723]/5'
                            : 'border-[#2A2624]/10 hover:border-[#2A2624]/30'
                        }`}
                      >
                        <div className="font-medium text-[#2A2624]">{option.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.preferredTimeline && (
                    <p className="text-xs text-red-600 mt-1">{errors.preferredTimeline}</p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-[#EAE8E4]/30 rounded-lg p-4 mt-6">
                  <h3 className="text-sm font-medium text-[#2A2624] mb-3">
                    Resumen de tu información:
                  </h3>
                  <div className="space-y-1.5 text-sm text-[#5D5550]">
                    <p><strong>Nombre:</strong> {formData.fullName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Teléfono:</strong> {formData.phone}</p>
                    <p><strong>Ciudad:</strong> {formData.city}</p>
                    <p>
                      <strong>Experiencia:</strong>{' '}
                      {EXPERIENCE_OPTIONS.find(o => o.value === formData.experienceLevel)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-[#2A2624]/20"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#D9865B] hover:bg-[#D9865B]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Registrar mi interés'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreRegistrationModal;
