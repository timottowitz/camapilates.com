import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Instagram, Linkedin, MapPin, Building2, Globe, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizeTeacherSlugForUrl } from '@/lib/teacherSlug';
import { instagramProfileUrl, normalizeExternalUrl, normalizeInstagramUsername } from '@/lib/social';
import { hasConvex } from '@/lib/convexProvider';

export interface TeacherCardProps {
  teacher: {
    slug: string;
    fullName: { value: string };
    citySlug: string;
    cityName: { value: string };
    bio?: { value: string };
    specializations: { value: string[] };
    isVerified: boolean;
    profilePhoto?: { value: { url?: string; storageId: string; source: string } }; 
    studios?: Array<{
      name?: string;
      slug?: string;
      photo?: string;
    }>;
    social?: {
      instagram?: { value: string };
      linkedin?: { value: string };
      website?: { value: string };
      facebook?: { value: string };
    };
  };
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  const teacherUrl = `/instructores-pilates/${teacher.citySlug}/${normalizeTeacherSlugForUrl(
    teacher.slug,
    teacher.citySlug
  )}`;
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

  // Instagram profile image fetching
  const instagramUsername = normalizeInstagramUsername(teacher.social?.instagram?.value);
  const needsInstagramImage = !teacher.profilePhoto?.value?.url && instagramUsername;

  const instagramPreview = useQuery(
    api.instagram.getPreviewByInstagram,
    hasConvex && needsInstagramImage ? { instagram: instagramUsername } : 'skip'
  );

  // Trigger fetching if we have Instagram but no cached preview
  const ensurePreview = useMutation(api.instagram.ensurePreviewByInstagram);
  React.useEffect(() => {
    if (hasConvex && needsInstagramImage && instagramPreview === null) {
      ensurePreview({ instagram: instagramUsername }).catch(() => {});
    }
  }, [needsInstagramImage, instagramPreview, instagramUsername, ensurePreview]);

  // Determine avatar image: profilePhoto > Instagram preview > fallback initials
  const avatarUrl = teacher.profilePhoto?.value?.url || instagramPreview?.profileImageUrl || null;

  return (
    <div className="group relative h-full">
      <Card className="relative overflow-hidden h-full flex flex-col bg-white border-[#2A2624]/10 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#3E2723]/20 hover:-translate-y-1">
        <div className="h-24 bg-[#2A2624]/5 relative">
           {teacher.isVerified && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#3E2723] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm border border-[#3E2723]/10">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Verificado
            </div>
          )}
        </div>

        <div className="px-6 -mt-12 mb-4 flex justify-between items-end">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-[#EAE8E4]">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={teacher.fullName.value} 
                className="object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <AvatarFallback className="bg-[#EAE8E4] text-[#2A2624] text-xl font-serif">
                {teacher.fullName.value.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex gap-2 mb-2">
            {instagramUrl && (
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#3E2723] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {linkedinUrl && (
              <a 
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#0077b5] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624] hover:text-white transition-colors"
                aria-label="Sitio web"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#1877F2] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="flex-grow px-6 pb-6">
          <h3 className="font-serif text-xl mb-1 text-[#2A2624] leading-tight group-hover:text-[#3E2723] transition-colors">
            <Link to={teacherUrl}>
              {teacher.fullName.value}
            </Link>
          </h3>
          
          <div className="flex items-center gap-1.5 text-sm text-[#5D5550] mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{teacher.cityName.value}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {teacher.specializations.value.slice(0, 3).map((spec, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-[10px] bg-[#EAE8E4] text-[#5D5550] hover:bg-[#D9865B] hover:text-white transition-colors border-none px-2 py-0.5"
              >
                {spec}
              </Badge>
            ))}
            {teacher.specializations.value.length > 3 && (
              <Badge variant="outline" className="text-[10px] border-[#2A2624]/20 text-[#5D5550] px-2 py-0.5">
                +{teacher.specializations.value.length - 3}
              </Badge>
            )}
          </div>

          {teacher.studios && teacher.studios.length > 0 && (
            <div className="border-t border-[#2A2624]/10 pt-4 mt-auto">
              <p className="text-xs uppercase tracking-widest text-[#5D5550] mb-2 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                Estudios
              </p>
              <div className="flex flex-wrap gap-2">
                {teacher.studios.map((studio, i) => (
                  <Link 
                    key={i} 
                    to={`/estudios-de-pilates/${teacher.citySlug}/${studio.slug}`}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#2A2624]/5 transition-colors max-w-full"
                    title={studio.name}
                  >
                     <div className="w-5 h-5 rounded-full bg-[#EAE8E4] flex items-center justify-center flex-shrink-0 text-[10px] font-serif text-[#2A2624]">
                        {studio.name?.charAt(0) || <Building2 className="w-3 h-3" />}
                     </div>
                     <span className="text-xs text-[#2A2624] truncate max-w-[120px]">
                       {studio.name}
                     </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2">
          <Link to={teacherUrl} className="w-full block">
            <Button className="w-full bg-[#2A2624] hover:bg-[#3E2723] text-white font-sans tracking-wide text-xs uppercase h-9">
              Ver Perfil
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default TeacherCard;
