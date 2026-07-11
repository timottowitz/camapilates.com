import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import imageCompression from 'browser-image-compression';
import {
  User, Camera, Save, LogOut, Loader2, Check, AlertCircle,
  Plus, X, GripVertical, Instagram, Globe, MessageCircle, Calendar
} from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Id } from '../../../convex/_generated/dataModel';
import { useLoadTimeout } from '@/hooks/useLoadTimeout';

// Specializations options
const SPECIALIZATIONS = [
  'Reformer', 'Mat', 'Prenatal', 'Postnatal', 'Rehabilitación',
  'Deportivo', 'Senior', 'Barre', 'Cadillac', 'Chair', 'Tower'
];

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form state
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number | undefined>();
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [photos, setPhotos] = useState<Array<{
    id: Id<'teacherPhotos'>;
    storageId: Id<'_storage'>;
    url: string | null;
    displayOrder: number;
  }>>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);

  // Mutations
  const updateProfileMutation = useMutation(api.instructorProfile.updateProfile);
  const logoutMutation = useMutation(api.instructorAuth.logout);
  const generateUploadUrlMutation = useMutation(api.instructorProfile.generatePhotoUploadUrl);
  const addPhotoMutation = useMutation(api.instructorProfile.addPhoto);
  const deletePhotoMutation = useMutation(api.instructorProfile.deletePhoto);
  const reorderPhotosMutation = useMutation(api.instructorProfile.reorderPhotos);

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('instructor_token');
    if (!storedToken) {
      navigate('/mi-perfil');
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  // Validate session
  const sessionData = useQuery(
    api.instructorAuth.validateSession,
    token ? { token } : 'skip'
  );

  // Get profile data
  const profileData = useQuery(
    api.instructorProfile.getMyProfile,
    token ? { token } : 'skip'
  );

  // Escape the loading spinner if the backend never responds.
  const loadTimedOut = useLoadTimeout(checkingAuth || !profileData);

  useEffect(() => {
    if (sessionData !== undefined) {
      if (!sessionData.authenticated) {
        localStorage.removeItem('instructor_token');
        navigate('/mi-perfil');
      } else {
        setCheckingAuth(false);
      }
    }
  }, [sessionData, navigate]);

  // Load profile data into form
  useEffect(() => {
    if (profileData?.ok && profileData.profile) {
      const p = profileData.profile;
      setBio(p.bio || '');
      setSpecializations(p.specializations || []);
      setExperienceYears(p.experienceYears);
      setWhatsapp(p.whatsapp || '');
      setInstagram(p.instagram || '');
      setWebsite(p.website || '');
      setBookingUrl(p.bookingUrl || '');
      setPhotos(p.photos || []);
    }
  }, [profileData]);

  // Auto-save with debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(async () => {
    if (!token) return;

    setSaving(true);
    setError('');

    try {
      const result = await updateProfileMutation({
        token,
        bio,
        specializations,
        experienceYears,
        whatsapp,
        instagram,
        website,
        bookingUrl,
      });

      if (result.ok) {
        setLastSaved(new Date());
      } else {
        setError(result.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }, [token, bio, specializations, experienceYears, whatsapp, instagram, website, bookingUrl, updateProfileMutation]);

  // Debounced auto-save on field changes
  useEffect(() => {
    if (!checkingAuth && profileData?.ok) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(autoSave, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [bio, specializations, experienceYears, whatsapp, instagram, website, bookingUrl, autoSave, checkingAuth, profileData]);

  // Handle logout
  const handleLogout = async () => {
    if (token) {
      await logoutMutation({ token });
    }
    localStorage.removeItem('instructor_token');
    navigate('/mi-perfil');
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingPhoto(true);
    setError('');

    try {
      // Compress and convert to WebP
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        fileType: 'image/webp',
        useWebWorker: true,
      });

      // Get upload URL
      const urlResult = await generateUploadUrlMutation({ token });
      if (!urlResult.ok || !urlResult.uploadUrl) {
        setError(urlResult.error || 'Error al preparar subida');
        return;
      }

      // Upload file
      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/webp' },
        body: compressedFile,
      });

      if (!uploadResponse.ok) {
        setError('Error al subir imagen');
        return;
      }

      const { storageId } = await uploadResponse.json();

      // Save photo metadata
      const addResult = await addPhotoMutation({
        token,
        storageId,
        type: 'gallery',
      });

      if (addResult.ok && addResult.photo) {
        setPhotos(prev => [...prev, addResult.photo as any]);
      } else {
        setError(addResult.error || 'Error al guardar foto');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Error al procesar imagen');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle photo delete
  const handleDeletePhoto = async (photoId: Id<'teacherPhotos'>) => {
    if (!token) return;

    try {
      const result = await deletePhotoMutation({ token, photoId });
      if (result.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
      } else {
        setError(result.error || 'Error al eliminar foto');
      }
    } catch (err) {
      setError('Error al eliminar foto');
    }
  };

  // Handle photo reorder (drag and drop)
  const handleDragStart = (index: number) => {
    setDraggedPhoto(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhoto === null || draggedPhoto === index) return;

    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedPhoto];
    newPhotos.splice(draggedPhoto, 1);
    newPhotos.splice(index, 0, draggedItem);

    setPhotos(newPhotos);
    setDraggedPhoto(index);
  };

  const handleDragEnd = async () => {
    if (!token || draggedPhoto === null) return;
    setDraggedPhoto(null);

    const photoOrder = photos.map(p => p.id);
    await reorderPhotosMutation({ token, photoOrder });
  };

  // Toggle specialization
  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const origin = getOrigin();

  // Loading state
  if ((checkingAuth || !profileData) && !loadTimedOut) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[800px] mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8B7355]" />
          <p className="mt-4 text-[#5D5550]">Cargando perfil...</p>
        </section>
      </LuxuryLayout>
    );
  }

  // Data never arrived (backend unreachable): offer a retry instead of a
  // spinner that never ends.
  if ((checkingAuth || !profileData) && loadTimedOut) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[#5D5550] mb-6">
            No pudimos cargar tu perfil por un problema de conexión. Inténtalo de nuevo.
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

  if (!profileData.ok) {
    return (
      <LuxuryLayout>
        <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[600px] mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{profileData.error}</p>
        </section>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <Helmet>
        <title>Editar Mi Perfil | {DEFAULTS.siteName}</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`${origin}/mi-perfil/editar`} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-8 md:px-24 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#3E2723]" />
            </div>
            <div>
              <h1 className="text-2xl font-serif italic text-[#2A2624]">
                {sessionData?.teacherName || 'Mi Perfil'}
              </h1>
              <p className="text-sm text-[#5D5550]">{sessionData?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Save status */}
            <div className="flex items-center gap-2 text-sm text-[#5D5550]">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Guardado</span>
                </>
              ) : null}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#5D5550] hover:text-[#3E2723] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8E4E1] mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-[#8B7355]" />
            <h2 className="font-medium text-[#2A2624]">Fotos</h2>
            <span className="text-sm text-[#5D5550]">({photos.length}/5)</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square rounded-lg overflow-hidden bg-[#F9F7F5] cursor-move group ${
                  draggedPhoto === index ? 'opacity-50' : ''
                }`}
              >
                {photo.url && (
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Profile photo badge for first photo */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#8B7355] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Perfil
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <GripVertical className="w-5 h-5 text-white" />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add photo button */}
            {photos.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-[#E8E4E1] hover:border-[#8B7355] transition-colors flex flex-col items-center justify-center cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-[#8B7355] animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-[#8B7355] mb-1" />
                    <span className="text-xs text-[#5D5550]">Agregar</span>
                  </>
                )}
              </label>
            )}
          </div>

          <p className="text-xs text-[#5D5550] mt-3">
            Arrastra para reordenar. La primera foto será tu foto principal.
          </p>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8E4E1] mb-8">
          <label className="block font-medium text-[#2A2624] mb-3">
            Biografía
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia, formación y estilo de enseñanza..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-[#5D5550] mt-1 text-right">
            {bio.length}/1000
          </p>
        </div>

        {/* Specializations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8E4E1] mb-8">
          <label className="block font-medium text-[#2A2624] mb-3">
            Especialidades
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map(spec => (
              <button
                key={spec}
                onClick={() => toggleSpecialization(spec)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  specializations.includes(spec)
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-[#F9F7F5] text-[#5D5550] hover:bg-[#E8E4E1]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8E4E1] mb-8">
          <label className="block font-medium text-[#2A2624] mb-3">
            Años de experiencia
          </label>
          <input
            type="number"
            value={experienceYears || ''}
            onChange={(e) => setExperienceYears(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Ej: 5"
            min={0}
            max={50}
            className="w-32 px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
          />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E8E4E1]">
          <h2 className="font-medium text-[#2A2624] mb-4">Información de contacto</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#5D5550] mb-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#5D5550] mb-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                placeholder="tu_usuario"
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#5D5550] mb-2">
                <Globe className="w-4 h-4" />
                Sitio web
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://tusitio.com"
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              />
            </div>

            {/* Booking URL */}
            <div>
              <label className="flex items-center gap-2 text-sm text-[#5D5550] mb-2">
                <Calendar className="w-4 h-4" />
                URL de reservas
              </label>
              <input
                type="url"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                placeholder="https://calendly.com/tu-perfil"
                className="w-full px-4 py-3 rounded-lg border border-[#E8E4E1] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* View profile link */}
        {sessionData?.teacherSlug && (
          <div className="mt-8 text-center">
            <a
              href={`/instructores-pilates/${profileData.profile.citySlug}/${sessionData.teacherSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B7355] hover:underline text-sm"
            >
              Ver mi perfil público →
            </a>
          </div>
        )}
      </section>
    </LuxuryLayout>
  );
};

export default EditarPerfil;
