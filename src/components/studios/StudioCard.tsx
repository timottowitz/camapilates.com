import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Star, CheckCircle } from 'lucide-react';
import { citySlug } from '@/utils/slug';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import { formatPrice, formatDistance } from '@/utils/studio-helpers';

// Google Place type translations
const placeTypeTranslations: Record<string, string> = {
  'gym': 'Gimnasio',
  'health': 'Salud',
  'sports_complex': 'Complejo Deportivo',
  'sports_activity_location': 'Centro Deportivo',
  'fitness_center': 'Centro Fitness',
  'yoga_studio': 'Estudio Yoga',
  'pilates_studio': 'Estudio Pilates',
  'spa': 'Spa',
  'point_of_interest': '',
  'establishment': '',
};

export interface StudioCardProps {
  studio: {
    _id?: string;
    id?: string;
    slug: string;
    name: string;
    googlePlaceId?: string | null;
    address: {
      street: string;
      neighborhood?: string;
      city: string;
    };
    contact: {
      phone?: string;
      website?: string;
    };
    metrics: {
      googleRating?: number;
      googleReviewCount?: number;
    };
    pricing?: {
      singleClassMin?: number;
      singleClassMax?: number;
      currency: string;
    };
    photos?: string[];
    classTypes?: string[];
    dataQualityScore: number;
    distance?: number;
    generatedSummary?: {
      overview?: string;
      vibe?: string;
    };
    isVerified?: boolean;
  };
}

const StudioCard: React.FC<StudioCardProps> = ({ studio }) => {
  const studioUrl = `/estudios-de-pilates/${citySlug(studio.address.city)}/${studio.slug}`;

  // Filter out generic/empty types and translate
  const displayTypes = (studio.classTypes || [])
    .map(type => placeTypeTranslations[type] || type.replace(/_/g, ' '))
    .filter(type => type.length > 0)
    .slice(0, 3);

  return (
    <div className="group relative h-full">
      <Card className="relative overflow-hidden h-full flex flex-col bg-white border-[#2A2624]/10 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#3E2723]/20 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          <GooglePlacesPhoto
            placeId={studio.googlePlaceId || undefined}
            studioName={studio.name}
            width={600}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            priority="lazy"
            showAttribution={false}
            fallbackIndex={0}
          />

          {/* Distance Badge */}
          {studio.distance && (
            <div className="absolute top-4 right-0 bg-[#3E2723] text-white px-4 py-1.5 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                {formatDistance(studio.distance)}
              </div>
            </div>
          )}

          {/* Quality Score */}
          <div className="absolute top-4 left-4">
            <div
              className={`px-3 py-1.5 text-white text-xs font-bold tracking-wider shadow-lg rounded ${
                studio.dataQualityScore >= 80 ? 'bg-[#3E2723]' :
                studio.dataQualityScore >= 60 ? 'bg-[#5D5550]' :
                'bg-[#8B7E74]'
              }`}
            >
              {studio.dataQualityScore}% MATCH
            </div>
          </div>

          {/* Verified Badge */}
          {studio.isVerified && (
            <div className="absolute top-4 left-28 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verificado
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-grow p-6 bg-gradient-to-br from-white to-[#EAE8E4]/30">
          {/* Name */}
          <h3 className="font-serif text-2xl mb-3 text-[#2A2624] leading-tight line-clamp-2">
            {studio.name}
          </h3>

          {/* Rating */}
          {studio.metrics?.googleRating && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#2A2624]/10">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-[#D9865B] text-[#D9865B]" />
                <span className="font-serif text-xl text-[#2A2624] font-medium">
                  {studio.metrics.googleRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-[#5D5550] font-light">
                {studio.metrics.googleReviewCount || 0} reseñas
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-4 h-4 text-[#5D5550] mt-1 flex-shrink-0" />
            <p className="text-sm text-[#5D5550] leading-relaxed line-clamp-2">
              {studio.address.neighborhood && (
                <span className="font-medium text-[#2A2624]">{studio.address.neighborhood}</span>
              )}
              {studio.address.neighborhood && ', '}
              {studio.address.city}
            </p>
          </div>

          {/* Price */}
          {studio.pricing && (studio.pricing.singleClassMin || studio.pricing.singleClassMax) ? (
            <div className="mb-4">
              <p className="text-sm text-[#5D5550]">
                {studio.pricing.singleClassMin ? (
                  <>
                    Desde{' '}
                    <span className="font-serif text-lg text-[#2A2624] font-medium">
                      ${studio.pricing.singleClassMin}
                    </span>
                    {' '}por clase
                  </>
                ) : (
                  <span className="text-[#2A2624] font-medium">Contactar para precios</span>
                )}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-[#5D5550]">
                <span className="text-[#2A2624] font-medium">Contactar</span> para precios
              </p>
            </div>
          )}

          {/* Class Types / Categories */}
          {displayTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {displayTypes.map((type, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-[#2A2624]/5 text-[#2A2624] border-none px-3 py-1"
                >
                  {type}
                </Badge>
              ))}
              {(studio.classTypes?.length || 0) > 3 && (
                <Badge variant="outline" className="text-xs border-[#2A2624]/20 text-[#5D5550] px-3 py-1">
                  +{(studio.classTypes?.length || 0) - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Vibe (from AI summary) */}
          {studio.generatedSummary?.vibe && (
            <p className="text-xs text-[#5D5550] italic mb-4 line-clamp-1">
              ✨ {studio.generatedSummary.vibe}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-2 mt-auto">
          <Link
            to={studioUrl}
            className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-[#2A2624] hover:bg-[#3E2723] text-white font-sans tracking-wide transition-all duration-300 hover:shadow-lg text-sm font-medium"
          >
            Ver Detalles
          </Link>

          <div className="flex gap-2">
            {studio.contact?.phone && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${studio.contact.phone}`, '_self');
                }}
                className="border-[#2A2624]/20 hover:bg-[#2A2624] hover:text-white"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {studio.contact?.website && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(studio.contact.website, '_blank');
                }}
                className="border-[#2A2624]/20 hover:bg-[#2A2624] hover:text-white"
              >
                <Globe className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudioCard;
