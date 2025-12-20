import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { CheckCircle, UserCheck, ArrowLeft, ArrowRight, User, Briefcase, Phone, Image as ImageIcon, Save, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { ClaimPhotoUpload, UploadedPhoto } from '@/components/teachers/ClaimPhotoUpload';
import { hasConvex } from '@/lib/convexProvider';

const ROLES = [
  { value: 'self', label: 'Soy este instructor' },
  { value: 'manager', label: 'Representante / Manager' },
  { value: 'colleague', label: 'Colega / Referencia' },
  { value: 'other', label: 'Otro' },
];

const SPECIALIZATIONS = [
  'Reformer', 'Mat', 'Cadillac', 'Wunda Chair', 'Ladder Barrel',
  'Prenatal/Postnatal', 'Rehabilitación', 'Seniors', 'Atletas',
  'Principiantes', 'Avanzado', 'Pilates Clásico', 'Pilates Contemporáneo',
];

const TEACHING_VIBES = [
  'Motivador', 'Técnico', 'Relajante', 'Intenso', 'Paciente', 'Energético',
];

const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués'];

interface Teacher {
  _id: Id<'teachers'>;
  fullName: { value: string };
  specializations?: { value: string[] };
  languages?: { value: string[] };
  status?: string;
}

const STEPS = [
  { id: 1, title: 'Identidad', icon: User },
  { id: 2, title: 'Perfil', icon: Briefcase },
  { id: 3, title: 'Contacto', icon: Phone },
  { id: 4, title: 'Fotos', icon: ImageIcon },
];

const ClaimTeacher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teacherSlug = searchParams.get('slug') || '';
  const citySlug = searchParams.get('city') || '';
  const normalizedCitySlug = citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug;

  const teacher = useQuery(api.teachers.getBySlug, 
    hasConvex && teacherSlug && normalizedCitySlug ? { slug: teacherSlug, citySlug: normalizedCitySlug } : 'skip'
  ) as Teacher | undefined | null;

  const claimStatus = useQuery(
    api.teacherClaims.getStatus,
    hasConvex && teacher?._id ? { teacherId: teacher._id } : 'skip'
  ) as any;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Draft/checkpoint state
  const [draftId, setDraftId] = useState<Id<'teacherClaims'> | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Step 1: Identity
  const [identity, setIdentity] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'self',
    message: '',
  });

  // Step 2: Profile
  const [profile, setProfile] = useState({
    bio: '',
    specializations: [] as string[],
    experienceYears: '',
    languages: [] as string[],
    teachingStyle: {
      vibe: [] as string[],
      classPace: 'moderate',
      musicStyle: '',
      classSize: '',
    },
    trainingLineage: '',
    teachingHours: '',
  });

  // Step 3: Contact
  const [contact, setContact] = useState({
    whatsapp: '',
    bookingUrl: '',
    instagram: '',
    website: '',
  });

  // Step 4: Photos
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  // Mutations
  const submitClaim = useMutation(api.teacherClaims.submitWithProfile);
  const saveDraftMutation = useMutation(api.teacherClaims.saveDraft);
  const submitDraftMutation = useMutation(api.teacherClaims.submitDraft);

  const didPrefillProfile = useRef(false);
  useEffect(() => {
    if (didPrefillProfile.current) return;
    if (!teacher) return;

    setProfile((prev) => {
      const next = { ...prev };
      if (prev.specializations.length === 0 && teacher.specializations?.value?.length) {
        const allowed = new Set(SPECIALIZATIONS);
        const filtered = teacher.specializations.value.filter((s) => allowed.has(s));
        if (filtered.length > 0) next.specializations = filtered;
      }
      if (prev.languages.length === 0 && teacher.languages?.value?.length) {
        const allowed = new Set(LANGUAGES);
        const filtered = teacher.languages.value.filter((s) => allowed.has(s));
        if (filtered.length > 0) next.languages = filtered;
      }
      return next;
    });

    didPrefillProfile.current = true;
  }, [teacher]);

  useEffect(() => {
    if (!teacherSlug || !normalizedCitySlug) {
      navigate('/instructores-pilates');
    }
  }, [teacherSlug, normalizedCitySlug, navigate]);

  // Query for existing draft when we have teacher and valid email
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email);
  const existingDraft = useQuery(
    api.teacherClaims.getDraft,
    hasConvex && teacher?._id && isValidEmail && !draftLoaded
      ? { teacherId: teacher._id, email: identity.email }
      : 'skip'
  );

  // Load draft data into form when found
  useEffect(() => {
    if (!existingDraft || draftLoaded) return;

    // Restore identity
    setIdentity({
      name: existingDraft.claimantName || '',
      email: existingDraft.email || '',
      phone: existingDraft.phone || '',
      role: existingDraft.relationship || 'self',
      message: existingDraft.message || '',
    });

    // Restore profile from proposedProfile
    if (existingDraft.proposedProfile) {
      const pp = existingDraft.proposedProfile;
      setProfile({
        bio: pp.bio || '',
        specializations: pp.specializations || [],
        experienceYears: pp.experienceYears?.toString() || '',
        languages: pp.languages || [],
        teachingStyle: {
          vibe: pp.teachingStyle?.vibe || [],
          classPace: pp.teachingStyle?.classPace || 'moderate',
          musicStyle: pp.teachingStyle?.musicStyle || '',
          classSize: pp.teachingStyle?.classSize || '',
        },
        trainingLineage: pp.trainingLineage || '',
        teachingHours: pp.teachingHours?.toString() || '',
      });

      // Restore contact
      setContact({
        whatsapp: pp.whatsapp || '',
        bookingUrl: pp.bookingUrl || '',
        instagram: pp.instagram || '',
        website: pp.website || '',
      });
    }

    // Restore photos (note: photos need storageId mapping)
    if (existingDraft.proposedPhotos && existingDraft.proposedPhotos.length > 0) {
      setPhotos(existingDraft.proposedPhotos.map((p: any) => ({
        storageId: p.storageId,
        type: p.type,
        caption: p.caption || '',
        previewUrl: '', // Will need to be fetched
      })));
    }

    // Set draft tracking state
    setDraftId(existingDraft.claimId);
    setCurrentStep(existingDraft.lastSavedStep || 1);
    setLastSaved(new Date(existingDraft.updatedAt));
    setDraftLoaded(true);
  }, [existingDraft, draftLoaded]);

  // Save checkpoint function
  const saveCheckpoint = useCallback(async (step: number) => {
    if (!teacher || !identity.name || !identity.email || !identity.phone) return;

    setSaving(true);
    try {
      const parseOptionalInt = (value: string): number | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number.parseInt(trimmed, 10);
        if (!Number.isFinite(num)) return undefined;
        return num;
      };

      const proposedProfile = {
        bio: profile.bio || undefined,
        specializations: profile.specializations.length > 0 ? profile.specializations : undefined,
        experienceYears: parseOptionalInt(profile.experienceYears),
        languages: profile.languages.length > 0 ? profile.languages : undefined,
        teachingStyle: profile.teachingStyle.vibe.length > 0 ? {
          vibe: profile.teachingStyle.vibe,
          classPace: profile.teachingStyle.classPace || undefined,
          musicStyle: profile.teachingStyle.musicStyle || undefined,
          classSize: profile.teachingStyle.classSize || undefined,
        } : undefined,
        trainingLineage: profile.trainingLineage || undefined,
        teachingHours: parseOptionalInt(profile.teachingHours),
        whatsapp: contact.whatsapp || undefined,
        bookingUrl: contact.bookingUrl || undefined,
        instagram: contact.instagram || undefined,
        website: contact.website || undefined,
      };

      const proposedPhotos = photos
        .filter(p => p.storageId)
        .map(p => ({
          storageId: p.storageId as Id<'_storage'>,
          type: p.type,
          caption: p.caption,
        }));

      const result = await saveDraftMutation({
        teacherId: teacher._id,
        teacherSlug,
        teacherName: teacher.fullName.value,
        citySlug: normalizedCitySlug,
        currentStep: step,
        claimantName: identity.name,
        email: identity.email,
        phone: identity.phone,
        relationship: identity.role,
        message: identity.message || undefined,
        proposedProfile: Object.keys(proposedProfile).some(k => proposedProfile[k as keyof typeof proposedProfile] !== undefined)
          ? proposedProfile
          : undefined,
        proposedPhotos: proposedPhotos.length > 0 ? proposedPhotos : undefined,
      });

      if (result.success) {
        setDraftId(result.claimId);
        setLastSaved(new Date());
        setDraftLoaded(true); // Mark as loaded to prevent re-querying
      }
    } catch (err) {
      console.error('Failed to save checkpoint:', err);
    } finally {
      setSaving(false);
    }
  }, [teacher, teacherSlug, normalizedCitySlug, identity, profile, contact, photos, saveDraftMutation]);

  if (!hasConvex) {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-serif italic text-[#2A2624] mb-4">Reclamo no disponible</h1>
          <p className="text-[#5D5550] mb-8">
            El sistema de reclamos requiere conexión al backend.
          </p>
          <Link to="/instructores-pilates" className="text-[#3E2723] underline">
            Volver al directorio
          </Link>
        </div>
      </LuxuryLayout>
    );
  }

  const toggleSpecialization = (spec: string) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleVibe = (vibe: string) => {
    setProfile(prev => ({
      ...prev,
      teachingStyle: {
        ...prev.teachingStyle,
        vibe: prev.teachingStyle.vibe.includes(vibe)
          ? prev.teachingStyle.vibe.filter(v => v !== vibe)
          : [...prev.teachingStyle.vibe, vibe],
      },
    }));
  };

  const toggleLanguage = (lang: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(identity.name && identity.email && identity.phone);
      case 2:
        return true; // Profile is optional
      case 3:
        return true; // Contact is optional
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      // Save checkpoint before moving to next step
      await saveCheckpoint(currentStep);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = async () => {
    // Save current step before going back
    if (validateStep(1)) { // Only save if step 1 is valid (required fields)
      await saveCheckpoint(currentStep);
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!teacher) return;

    setLoading(true);
    setError('');

    try {
      // First save the final step checkpoint
      await saveCheckpoint(4);

      // If we have a draft, use submitDraft to convert it to pending_review
      if (draftId) {
        const result = await submitDraftMutation({ claimId: draftId });
        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || 'Hubo un error al enviar tu solicitud.');
        }
        return;
      }

      // Fallback: submit directly (shouldn't happen if checkpoints work, but kept for safety)
      const parseOptionalInt = (value: string): number | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number.parseInt(trimmed, 10);
        if (!Number.isFinite(num)) return undefined;
        return num;
      };

      const proposedProfile = {
        bio: profile.bio || undefined,
        specializations: profile.specializations.length > 0 ? profile.specializations : undefined,
        experienceYears: parseOptionalInt(profile.experienceYears),
        languages: profile.languages.length > 0 ? profile.languages : undefined,
        teachingStyle: profile.teachingStyle.vibe.length > 0 ? {
          vibe: profile.teachingStyle.vibe,
          classPace: profile.teachingStyle.classPace || undefined,
          musicStyle: profile.teachingStyle.musicStyle || undefined,
          classSize: profile.teachingStyle.classSize || undefined,
        } : undefined,
        trainingLineage: profile.trainingLineage || undefined,
        teachingHours: parseOptionalInt(profile.teachingHours),
        whatsapp: contact.whatsapp || undefined,
        bookingUrl: contact.bookingUrl || undefined,
        instagram: contact.instagram || undefined,
        website: contact.website || undefined,
      };

      const proposedPhotos = photos.map(p => ({
        storageId: p.storageId,
        type: p.type,
        caption: p.caption,
      }));

      const result = await submitClaim({
        teacherId: teacher._id,
        teacherSlug,
        teacherName: teacher.fullName.value,
        citySlug: normalizedCitySlug,
        claimantName: identity.name,
        email: identity.email,
        phone: identity.phone,
        relationship: identity.role,
        message: identity.message || undefined,
        proposedProfile: Object.keys(proposedProfile).some(k => proposedProfile[k as keyof typeof proposedProfile] !== undefined)
          ? proposedProfile
          : undefined,
        proposedPhotos: proposedPhotos.length > 0 ? proposedPhotos : undefined,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Hubo un error al enviar tu solicitud.');
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const origin = getOrigin();

  if (teacher === undefined && teacherSlug && normalizedCitySlug) {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-[#3E2723]">Cargando información...</div>
        </div>
      </LuxuryLayout>
    );
  }

  if (teacher === null) {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-serif italic text-[#2A2624] mb-4">Perfil no encontrado</h1>
          <p className="text-[#5D5550] mb-8">No pudimos encontrar el instructor que buscas.</p>
          <Link to="/instructores-pilates" className="text-[#3E2723] underline">Volver al directorio</Link>
        </div>
      </LuxuryLayout>
    );
  }

  if (teacher && claimStatus?.status === 'pending_review') {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-serif italic text-[#2A2624] mb-4">Solicitud ya recibida</h1>
          <p className="text-[#5D5550] mb-8">
            Ya existe una solicitud para reclamar este perfil. Nuestro equipo la revisará pronto.
          </p>
          <Link to={`/instructores-pilates/${normalizedCitySlug}/${teacherSlug}`} className="text-[#3E2723] underline">
            Volver al perfil
          </Link>
        </div>
      </LuxuryLayout>
    );
  }

  if (teacher && (teacher.status === 'claimed' || teacher.status === 'verified')) {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-serif italic text-[#2A2624] mb-4">Perfil ya reclamado</h1>
          <p className="text-[#5D5550] mb-8">
            Este perfil ya fue reclamado y está en gestión.
          </p>
          <Link to={`/instructores-pilates/${normalizedCitySlug}/${teacherSlug}`} className="text-[#3E2723] underline">
            Volver al perfil
          </Link>
        </div>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Reclama Tu Perfil de Instructor | {DEFAULTS.siteName}</title>
        <meta name="description" content="Reclama tu perfil de instructor de Pilates. Verifica tu identidad y destaca en nuestro directorio exclusivo." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/claim-teacher`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-4 md:px-24 max-w-[1200px] mx-auto">
        <Link 
          to={`/instructores-pilates/${normalizedCitySlug}/${teacherSlug}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#3E2723] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>

        {success ? (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#3E2723]/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-[#3E2723]" />
            </div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4">
              ¡Solicitud Recibida!
            </h2>
            <p className="text-[#5D5550] font-light mb-4">
              Gracias por reclamar el perfil de <strong>{teacher?.fullName.value}</strong>.
            </p>
            <p className="text-[#5D5550] font-light mb-8">
              Revisaremos tu información y fotos, y te contactaremos en 1-2 días hábiles.
            </p>
            <Link
              to={`/instructores-pilates/${normalizedCitySlug}/${teacherSlug}`}
              className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
            >
              Volver al Perfil
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left sidebar - Benefits */}
            <div className="hidden md:block">
              <div className="sticky top-24">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center mb-6">
                  <UserCheck className="w-6 h-6 text-[#3E2723]" />
                </div>
                
                <h1 className="text-2xl font-serif italic text-[#2A2624] leading-tight mb-4">
                  Reclama Tu Perfil
                </h1>
                
                <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-6">
                  Verifica tu identidad para gestionar tu perfil y conectar con más alumnos.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3E2723] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#5D5550]">Insignia de verificado</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3E2723] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#5D5550]">Gestiona tu información</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#3E2723] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#5D5550]">+30% más visibilidad</p>
                  </div>
                </div>

                <p className="text-xs text-[#5D5550] mt-6">
                  El proceso es gratuito. Te contactaremos para confirmar tu identidad.
                </p>
              </div>
            </div>

            {/* Form area */}
            <div className="md:col-span-2">
              {/* Step indicator with save status */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <button
                        type="button"
                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                          currentStep === step.id
                            ? 'bg-[#2A2624] text-white'
                            : currentStep > step.id
                            ? 'bg-[#3E2723]/10 text-[#3E2723] cursor-pointer hover:bg-[#3E2723]/20'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        disabled={step.id > currentStep}
                      >
                        <step.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{step.title}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-[#3E2723]' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
                </div>

                {/* Save status indicator */}
                {(saving || lastSaved) && (
                  <div className="flex items-center gap-2 text-xs text-[#5D5550] flex-shrink-0">
                    {saving ? (
                      <>
                        <Save className="w-3 h-3 animate-pulse" />
                        <span>Guardando...</span>
                      </>
                    ) : lastSaved ? (
                      <>
                        <Cloud className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">Borrador guardado</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#2A2624]/10 rounded-lg p-6 md:p-8 shadow-sm">
                {/* Header with teacher name */}
                <div className="bg-[#F5F5F4] p-4 rounded-lg mb-6 border border-[#E7E5E4]">
                  <p className="text-xs text-[#5D5550] uppercase tracking-wider">Reclamando perfil de</p>
                  <p className="font-serif italic text-lg text-[#2A2624]">{teacher?.fullName.value}</p>
                </div>

                {/* Step 1: Identity */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Información de Contacto</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Tu Nombre Completo *
                      </label>
                      <Input
                        value={identity.name}
                        onChange={(e) => setIdentity(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej. Ana García"
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Correo Electrónico *
                      </label>
                      <Input
                        type="email"
                        value={identity.email}
                        onChange={(e) => setIdentity(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tucorreo@ejemplo.com"
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Teléfono *
                      </label>
                      <Input
                        type="tel"
                        value={identity.phone}
                        onChange={(e) => setIdentity(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="55 1234 5678"
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Relación con el perfil *
                      </label>
                      <select
                        value={identity.role}
                        onChange={(e) => setIdentity(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-2 border border-[#2A2624]/20 rounded-md focus:outline-none focus:border-[#3E2723] transition-colors bg-white"
                      >
                        {ROLES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Mensaje adicional (opcional)
                      </label>
                      <Textarea
                        value={identity.message}
                        onChange={(e) => setIdentity(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Información adicional para verificar tu identidad..."
                        rows={3}
                        className="border-[#2A2624]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Profile */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Tu Perfil Profesional</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Bio / Descripción
                      </label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Cuéntanos sobre tu experiencia, enfoque y qué te hace único como instructor..."
                        rows={4}
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Especialidades
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map(spec => (
                          <Badge
                            key={spec}
                            variant={profile.specializations.includes(spec) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-colors ${
                              profile.specializations.includes(spec)
                                ? 'bg-[#2A2624] hover:bg-[#3E2723]'
                                : 'hover:bg-[#2A2624]/10'
                            }`}
                            onClick={() => toggleSpecialization(spec)}
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#2A2624] mb-2">
                          Años de Experiencia
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={profile.experienceYears}
                          onChange={(e) => setProfile(prev => ({ ...prev, experienceYears: e.target.value }))}
                          placeholder="Ej. 5"
                          className="border-[#2A2624]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2A2624] mb-2">
                          Horas Enseñadas
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={profile.teachingHours}
                          onChange={(e) => setProfile(prev => ({ ...prev, teachingHours: e.target.value }))}
                          placeholder="Ej. 5000"
                          className="border-[#2A2624]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Idiomas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => (
                          <Badge
                            key={lang}
                            variant={profile.languages.includes(lang) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-colors ${
                              profile.languages.includes(lang)
                                ? 'bg-[#2A2624] hover:bg-[#3E2723]'
                                : 'hover:bg-[#2A2624]/10'
                            }`}
                            onClick={() => toggleLanguage(lang)}
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Estilo de Enseñanza
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TEACHING_VIBES.map(vibe => (
                          <Badge
                            key={vibe}
                            variant={profile.teachingStyle.vibe.includes(vibe) ? 'default' : 'outline'}
                            className={`cursor-pointer transition-colors ${
                              profile.teachingStyle.vibe.includes(vibe)
                                ? 'bg-[#D9865B] hover:bg-[#C67A52]'
                                : 'hover:bg-[#D9865B]/10'
                            }`}
                            onClick={() => toggleVibe(vibe)}
                          >
                            {vibe}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Formación / Linaje
                      </label>
                      <Input
                        value={profile.trainingLineage}
                        onChange={(e) => setProfile(prev => ({ ...prev, trainingLineage: e.target.value }))}
                        placeholder="Ej. Formado bajo [Nombre del Maestro] en BASI Pilates..."
                        className="border-[#2A2624]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Contact */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Información de Contacto Público</h2>
                    <p className="text-sm text-[#5D5550] mb-4">
                      Esta información se mostrará en tu perfil público para que los alumnos puedan contactarte.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        WhatsApp
                      </label>
                      <Input
                        type="tel"
                        value={contact.whatsapp}
                        onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="+52 55 1234 5678"
                        className="border-[#2A2624]/20"
                      />
                      <p className="text-xs text-[#5D5550] mt-1">Formato internacional para el botón de WhatsApp</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Instagram
                      </label>
                      <Input
                        value={contact.instagram}
                        onChange={(e) => setContact(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="@tu_usuario"
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        Sitio Web
                      </label>
                      <Input
                        type="url"
                        value={contact.website}
                        onChange={(e) => setContact(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://tusitio.com"
                        className="border-[#2A2624]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2A2624] mb-2">
                        URL de Reservaciones
                      </label>
                      <Input
                        type="url"
                        value={contact.bookingUrl}
                        onChange={(e) => setContact(prev => ({ ...prev, bookingUrl: e.target.value }))}
                        placeholder="https://calendly.com/tu-usuario"
                        className="border-[#2A2624]/20"
                      />
                      <p className="text-xs text-[#5D5550] mt-1">Calendly, Acuity, o tu sistema de reservaciones</p>
                    </div>
                  </div>
                )}

                {/* Step 4: Photos */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-serif italic text-[#2A2624] mb-2">Fotos de Perfil</h2>
                    <p className="text-sm text-[#5D5550] mb-4">
                      Sube hasta 5 fotos profesionales. La primera será tu foto de perfil principal.
                    </p>
                    
                    <ClaimPhotoUpload
                      teacherId={teacher?._id}
                      email={identity.email}
                      photos={photos}
                      onPhotosChange={setPhotos}
                      maxPhotos={5}
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-[#2A2624]/10">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!validateStep(currentStep)}
                      className="gap-2 bg-[#2A2624] hover:bg-[#3E2723]"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="gap-2 bg-[#3E2723] hover:bg-[#2A2624]"
                    >
                      {loading ? 'Enviando...' : 'Enviar Solicitud'}
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
                )}

                <p className="text-[10px] text-[#5D5550] text-center mt-6">
                  Al enviar, aceptas nuestros{' '}
                  <Link to="/legal/terminos" className="underline">Términos de Servicio</Link>
                  {' '}y{' '}
                  <Link to="/legal/privacidad" className="underline">Política de Privacidad</Link>.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </LuxuryLayout>
  );
};

export default ClaimTeacher;
