import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { 
  MapPin, 
  CheckCircle, 
	  Clock,
	  Instagram, 
	  Linkedin, 
	  Globe,
	  Facebook,
	  Award,
	  Building2,
	  Share2,
	  ShieldCheck,
  ChevronRight,
  UserCheck,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { InstagramProfileSection } from '@/components/social/InstagramEmbed';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
	import { toast } from 'sonner';
	import { getTeacherByCityAndSlug } from '@/data/teachers';
	import { hasConvex } from '@/lib/convexProvider';
	import { normalizeTeacherSlugForUrl } from '@/lib/teacherSlug';
	import { instagramProfileUrl, normalizeExternalUrl } from '@/lib/social';

interface TeacherDetail {
  _id: Id<'teachers'>;
  slug: string;
  fullName: { value: string };
  citySlug: string;
  cityName: { value: string };
  bio?: { value: string };
  specializations: { value: string[] };
  experienceYears?: { value: number };
  languages?: { value: string[] };
  certifications: Array<{
    name: string;
    organization?: string;
    year?: { value: number };
    isVerified: boolean;
  }>;
  isVerified: boolean;
  status?: string;
  profilePhoto?: { value: { url?: string; storageId: string; source: string } };
  studios?: Array<{
    studioId: string;
    studioSlug: string;
    studioName: string;
    studioCity: string;
    studioPhoto?: string;
  }>;
  social?: {
    instagram?: { value: string };
    linkedin?: { value: string };
    website?: { value: string };
    facebook?: { value: string };
  };
  contact?: {
    bookingUrl?: { value: string };
    email?: { value: string };
    phone?: { value: string };
    whatsapp?: { value: string };
  };
  teachingHours?: { value: number };
  teachingStyle?: {
    value: {
      vibe?: string[];
      classPace?: string;
      musicStyle?: string;
      classSize?: string;
    };
  };
  instagramPosts?: string[];
}

interface TeacherPhoto {
  _id: Id<'teacherPhotos'>;
  storageId: Id<'_storage'>;
  type: string;
  caption?: string;
  url: string | null;
}

interface InstagramPreview {
  status: 'pending' | 'ok' | 'error';
  username: string;
  profileUrl: string;
  displayName?: string;
  ogDescription?: string;
  profileImageUrl?: string | null;
  followers?: number;
  following?: number;
  posts?: number;
  recentPostUrls: string[];
  updatedAt: number;
}

const TeacherDetail: React.FC = () => {
  const { city: citySlug, slug } = useParams<{ city: string; slug: string }>();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const normalizedCitySlug = citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug;
  
  const seededTeacher = React.useMemo(() => {
    if (!normalizedCitySlug || !slug) return null;
    return getTeacherByCityAndSlug(normalizedCitySlug, slug) as unknown as TeacherDetail | null;
  }, [normalizedCitySlug, slug]);

  // Prefer live Convex data when available (keeps claimed/verified status + uploaded photos in sync)
  const liveTeacher = useQuery(
    api.teachers.getBySlug,
    hasConvex && normalizedCitySlug && slug ? { citySlug: normalizedCitySlug, slug } : 'skip'
  ) as TeacherDetail | null | undefined;

  const isLiveLoading = hasConvex && Boolean(citySlug && slug) && liveTeacher === undefined;
  const teacher = liveTeacher ?? seededTeacher;

  // Fetch photos from Convex only when we have a real Convex teacher id
  const photos = useQuery(
    api.teachers.getPhotos,
    hasConvex && liveTeacher?._id ? { teacherId: liveTeacher._id } : 'skip'
  ) as TeacherPhoto[] | undefined;

  const claimStatus = useQuery(
    api.teacherClaims.getStatus,
    hasConvex && liveTeacher?._id ? { teacherId: liveTeacher._id } : 'skip'
  ) as any;

  const ensureInstagramPreview = useMutation(api.instagram.ensurePreviewForTeacher);
  const ensureInstagramPreviewByInstagram = useMutation(api.instagram.ensurePreviewByInstagram);
  const instagramPreviewForTeacher = useQuery(
    api.instagram.getPreviewForTeacher,
    hasConvex && liveTeacher?._id ? { teacherId: liveTeacher._id } : 'skip'
  ) as InstagramPreview | null | undefined;

  const instagramValue = teacher?.social?.instagram?.value;
  const instagramPreviewByInstagram = useQuery(
    api.instagram.getPreviewByInstagram,
    hasConvex && !liveTeacher?._id && instagramValue ? { instagram: instagramValue } : 'skip'
  ) as InstagramPreview | null | undefined;

  const instagramPreview = instagramPreviewForTeacher ?? instagramPreviewByInstagram;

  const instagramPreviewLoading = Boolean(
    hasConvex && instagramValue && (instagramPreview === undefined || instagramPreview?.status === 'pending')
  );

  useEffect(() => {
    if (!hasConvex) return;
    if (!instagramValue) return;

    if (liveTeacher?._id) {
      ensureInstagramPreview({ teacherId: liveTeacher._id }).catch(() => {});
    } else {
      ensureInstagramPreviewByInstagram({ instagram: instagramValue }).catch(() => {});
    }
  }, [
    ensureInstagramPreview,
    ensureInstagramPreviewByInstagram,
    hasConvex,
    instagramValue,
    liveTeacher?._id,
  ]);

  const hasPendingClaim = claimStatus?.status === 'pending_review';
  // Allow claiming for both Convex teachers and seed-only teachers
  const canClaimLive =
    Boolean(liveTeacher) &&
    !hasPendingClaim &&
    liveTeacher.status !== 'claimed' &&
    liveTeacher.status !== 'verified';
  // Seed teachers without Convex record can also be claimed
  const canClaimSeed = !liveTeacher && seededTeacher && !hasPendingClaim;
  const canClaim = canClaimLive || canClaimSeed;

  const teacherSlugForUrl = normalizeTeacherSlugForUrl(teacher.slug, teacher.citySlug);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: teacher?.fullName.value,
        text: `Conoce a ${teacher?.fullName.value}, instructor de Pilates en ${teacher?.cityName.value}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (isLiveLoading && !seededTeacher) {
    return (
      <LuxuryLayout>
        <div className="pt-32 pb-24 text-center px-4">
          <div className="animate-pulse text-[#5D5550]">Cargando perfil...</div>
        </div>
      </LuxuryLayout>
    );
  }

  if (!teacher) {
    return (
      <LuxuryLayout>
        <div className="pt-32 pb-24 text-center px-4">
          <h1 className="text-3xl font-serif text-[#2A2624] mb-4">Instructor no encontrado</h1>
          <p className="text-[#5D5550] mb-8">No pudimos encontrar el perfil que buscas.</p>
          <Link to="/instructores-pilates">
            <Button>Volver al directorio</Button>
          </Link>
        </div>
      </LuxuryLayout>
    );
  }

	  const pageTitle = `${teacher.fullName.value} - Instructor de Pilates en ${teacher.cityName.value}`;
	  const pageDescription = teacher.bio?.value || `Perfil profesional de ${teacher.fullName.value}, instructor de Pilates certificado en ${teacher.cityName.value}.`;
	  const instagramUrl = instagramProfileUrl(teacher.social?.instagram?.value);
	  const linkedinUrl = teacher.social?.linkedin?.value
	    ? normalizeExternalUrl(teacher.social.linkedin.value) ?? teacher.social.linkedin.value
	    : null;
	  const websiteUrl = teacher.social?.website?.value
	    ? normalizeExternalUrl(teacher.social.website.value) ?? teacher.social.website.value
	    : null;
	  const facebookUrl = teacher.social?.facebook?.value
	    ? normalizeExternalUrl(teacher.social.facebook.value) ?? teacher.social.facebook.value
	    : null;
	  const avatarUrl = teacher.profilePhoto?.value.url || instagramPreview?.profileImageUrl || null;

  return (
    <LuxuryLayout>
	      <Helmet>
	        <title>{pageTitle}</title>
	        <meta name="description" content={pageDescription} />
	        <meta property="og:title" content={pageTitle} />
	        <meta property="og:description" content={pageDescription} />
	        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
	      </Helmet>

      {/* Back Navigation */}
      <div className="pt-28 pb-4 px-8 md:px-24 bg-[#EAE8E4]/30">
        <div className="max-w-[1200px] mx-auto">
          <Link
            to={`/instructores-pilates/${teacher.citySlug}`}
            className="inline-flex items-center gap-2 text-sm text-[#5D5550] hover:text-[#2A2624] transition-colors group"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a instructores en {teacher.cityName.value}</span>
          </Link>
        </div>
      </div>

      <div className="relative pt-8 pb-12 px-8 md:px-24 bg-gradient-to-b from-[#EAE8E4]/30 to-white border-b border-[#2A2624]/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            
	            <div className="flex-shrink-0 relative mx-auto md:mx-0">
	              <Avatar className="w-48 h-48 md:w-64 md:h-64 border-8 border-white shadow-xl">
	                {avatarUrl ? (
	                  <AvatarImage src={avatarUrl} alt={teacher.fullName.value} className="object-cover" />
	                ) : (
	                  <AvatarFallback className="bg-[#EAE8E4] text-[#2A2624] text-5xl font-serif">
	                    {teacher.fullName.value.slice(0, 2).toUpperCase()}
	                  </AvatarFallback>
	                )}
	              </Avatar>
              {teacher.isVerified && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#3E2723] px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-md border border-[#3E2723]/10">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Verificado
                </div>
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] mb-2">
                    {teacher.fullName.value}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[#5D5550] mb-4">
                    <MapPin className="w-4 h-4" />
                    <Link to={`/instructores-pilates/${teacher.citySlug}`} className="hover:underline">
                      {teacher.cityName.value}
                    </Link>
                    {teacher.experienceYears && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{teacher.experienceYears.value} años de experiencia</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  {canClaim && (
                    <Link to={`/claim-teacher?slug=${teacherSlugForUrl}&city=${teacher.citySlug}`}>
                      <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <UserCheck className="w-4 h-4" />
                        Reclamar perfil
                      </Button>
                    </Link>
                  )}
                  {hasPendingClaim && (
                    <Button
                      variant="outline"
                      className="gap-2 border-emerald-600/30 text-emerald-700"
                      disabled
                      title="Ya existe una solicitud en revisión"
                    >
                      <Clock className="w-4 h-4" />
                      En revisión
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={handleShare} title="Compartir perfil">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {teacher.specializations.value.map((spec, i) => (
                  <Badge key={i} variant="secondary" className="bg-[#EAE8E4] text-[#2A2624] hover:bg-[#D9865B] hover:text-white transition-colors">
                    {spec}
                  </Badge>
                ))}
              </div>

              {teacher.bio && (
                <p className="text-lg text-[#5D5550] font-light leading-relaxed max-w-3xl">
                  {teacher.bio.value}
                </p>
              )}
              
	              <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
	                {instagramUrl && (
	                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
	                    <Button variant="outline" className="gap-2 border-[#2A2624]/20">
	                      <Instagram className="w-4 h-4" /> Instagram
	                    </Button>
	                  </a>
	                )}
	                {linkedinUrl && (
	                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
	                    <Button variant="outline" className="gap-2 border-[#2A2624]/20">
	                      <Linkedin className="w-4 h-4" /> LinkedIn
	                    </Button>
	                  </a>
	                )}
	                {websiteUrl && (
	                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
	                    <Button variant="outline" className="gap-2 border-[#2A2624]/20">
	                      <Globe className="w-4 h-4" /> Sitio web
	                    </Button>
	                  </a>
	                )}
	                {facebookUrl && (
	                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
	                    <Button variant="outline" className="gap-2 border-[#2A2624]/20">
	                      <Facebook className="w-4 h-4" /> Facebook
	                    </Button>
	                  </a>
	                )}
	              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-24 py-16 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-12">
            
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-serif italic text-[#2A2624] mb-6 border-b border-[#2A2624]/10 pb-2">
                <Award className="w-6 h-6 text-[#3E2723]" />
                Certificaciones
              </h2>
              <div className="space-y-4">
                {teacher.certifications.length > 0 ? (
                  teacher.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#2A2624]/5">
                      <div className="mt-1">
                        {cert.isVerified ? (
                          <ShieldCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <Award className="w-5 h-5 text-[#5D5550]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#2A2624]">{cert.name}</h3>
                        <p className="text-sm text-[#5D5550]">
                          {cert.organization} {cert.year?.value && `• ${cert.year.value}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#5D5550] italic">No hay certificaciones registradas.</p>
                )}
              </div>
            </section>

            {teacher.languages && teacher.languages.value.length > 0 && (
              <section>
                <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Idiomas</h2>
                <div className="flex gap-2">
                  {teacher.languages.value.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-[#EAE8E4]/50 rounded-full text-sm text-[#5D5550]">
                      {lang}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Teaching Style */}
            {teacher.teachingStyle?.value && (
              <section>
                <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Estilo de Enseñanza</h2>
                <div className="space-y-3">
                  {teacher.teachingStyle.value.vibe && teacher.teachingStyle.value.vibe.length > 0 && (
                    <div>
                      <span className="text-sm text-[#5D5550] mr-2">Estilo:</span>
                      <span className="text-[#2A2624]">{teacher.teachingStyle.value.vibe.join(', ')}</span>
                    </div>
                  )}
                  {teacher.teachingStyle.value.classPace && (
                    <div>
                      <span className="text-sm text-[#5D5550] mr-2">Ritmo de clase:</span>
                      <span className="text-[#2A2624]">
                        {teacher.teachingStyle.value.classPace === 'slow' && 'Tranquilo'}
                        {teacher.teachingStyle.value.classPace === 'moderate' && 'Moderado'}
                        {teacher.teachingStyle.value.classPace === 'fast' && 'Dinámico'}
                      </span>
                    </div>
                  )}
                  {teacher.teachingStyle.value.musicStyle && (
                    <div>
                      <span className="text-sm text-[#5D5550] mr-2">Música:</span>
                      <span className="text-[#2A2624]">{teacher.teachingStyle.value.musicStyle}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Teaching Hours */}
            {teacher.teachingHours?.value && (
              <section>
                <h2 className="text-xl font-serif italic text-[#2A2624] mb-4">Experiencia</h2>
                <p className="text-[#5D5550]">
                  <span className="font-medium text-[#2A2624]">{teacher.teachingHours.value.toLocaleString()}</span> horas de enseñanza
                </p>
              </section>
            )}

            {/* Photo Gallery */}
            {photos && photos.length > 0 && (
              <section>
                <h2 className="flex items-center gap-3 text-2xl font-serif italic text-[#2A2624] mb-6 border-b border-[#2A2624]/10 pb-2">
                  <ImageIcon className="w-6 h-6 text-[#3E2723]" />
                  Galería
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.filter(p => p.url).map((photo) => (
                    <button
                      key={photo._id}
                      onClick={() => setLightboxPhoto(photo.url)}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={photo.url!}
                        alt={photo.caption || 'Foto del instructor'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs">{photo.caption}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {teacher.social?.instagram && (
              <InstagramProfileSection
                username={teacher.social.instagram.value}
                instructorName={teacher.fullName.value}
                posts={
                  instagramPreview?.recentPostUrls?.length
                    ? instagramPreview.recentPostUrls
                    : teacher.instagramPosts
                }
                preview={instagramPreview}
                isPreviewLoading={instagramPreviewLoading}
              />
            )}
          </div>

          <div className="space-y-8">
            {/* Claim Profile Card */}
            {hasPendingClaim && (
              <Card className="p-6 border-[#2A2624]/10 bg-[#FAFAFA]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2A2624]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#2A2624]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#2A2624] mb-1">Reclamo en revisión</h3>
                    <p className="text-sm text-[#5D5550] mb-4">
                      Ya hay una solicitud para reclamar este perfil. Si eres el instructor y necesitas ayuda,
                      contáctanos.
                    </p>
                    <Link to="/soporte">
                      <Button variant="outline" className="gap-2 border-[#2A2624]/20">
                        Contactar
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
            {canClaim && (
              <Card className="p-6 border-[#3E2723]/20 bg-gradient-to-br from-[#3E2723]/5 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-[#3E2723]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-[#2A2624] mb-1">¿Eres {teacher.fullName.value}?</h3>
                    <p className="text-sm text-[#5D5550] mb-4">
                      Reclama tu perfil para gestionar tu información y obtener la insignia de verificado.
                    </p>
                    <Link to={`/claim-teacher?slug=${teacherSlugForUrl}&city=${teacher.citySlug}`}>
                      <Button className="bg-[#3E2723] hover:bg-[#2A2624] text-white gap-2">
                        <UserCheck className="w-4 h-4" />
                        Reclamar Perfil
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 border-[#2A2624]/10 shadow-lg shadow-[#2A2624]/5">
              <h3 className="flex items-center gap-2 font-serif text-lg text-[#2A2624] mb-6">
                <Building2 className="w-5 h-5" />
                Trabaja en
              </h3>
              
              {teacher.studios && teacher.studios.length > 0 ? (
                <div className="space-y-4">
                  {teacher.studios.map((studio, i) => (
                    <Link 
                      key={i} 
                      to={`/estudios-de-pilates/${teacher.citySlug}/${studio.studioSlug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EAE8E4] flex items-center justify-center text-[#2A2624] font-serif overflow-hidden">
                        {studio.studioPhoto ? (
                           <img src={studio.studioPhoto} alt={studio.studioName} className="w-full h-full object-cover" />
                        ) : (
                           <span>{studio.studioName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm text-[#2A2624] group-hover:text-[#3E2723] transition-colors leading-tight">
                          {studio.studioName}
                        </p>
                        <p className="text-xs text-[#5D5550]">
                          {studio.studioCity}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5D5550] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5D5550] italic">
                  Este instructor no está vinculado públicamente a ningún estudio.
                </p>
              )}
            </Card>

          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Foto ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </LuxuryLayout>
  );
};

export default TeacherDetail;
