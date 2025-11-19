import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { citySlug } from '@/utils/slug';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import {
  formatPrice,
  formatDistance,
  getQualityBadgeColor,
} from '@/utils/studio-helpers';

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
    distance?: number; // In km from user
  };
}

const StudioCard: React.FC<StudioCardProps> = ({ studio }) => {
  return (
    <div className="group relative h-full">
      {/* Atmospheric shadow layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3E2723]/5 to-transparent rounded-2xl transform translate-y-2 translate-x-2 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <Card className="relative overflow-hidden h-full flex flex-col bg-white border-[#2A2624]/10 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#3E2723]/20 hover:-translate-y-1">
        {/* Image Section with Grain Overlay */}
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

          {/* Subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Distance Badge - Diagonal Ribbon Style */}
          {studio.distance && (
            <div className="absolute top-4 right-0 bg-[#3E2723] text-white px-6 py-2 pr-8 transform rotate-2 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide">
                <MapPin className="w-3 h-3" />
                {formatDistance(studio.distance)}
              </div>
            </div>
          )}

          {/* Quality Score - Custom Shape */}
          <div className="absolute top-4 left-4">
            <div
              className={`relative px-4 py-2 text-white text-xs font-bold tracking-wider shadow-lg ${
                studio.dataQualityScore >= 80 ? 'bg-[#3E2723]' :
                studio.dataQualityScore >= 60 ? 'bg-[#5D5550]' :
                'bg-[#8B7E74]'
              }`}
              style={{
                clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)',
              }}
            >
              {studio.dataQualityScore}% MATCH
            </div>
          </div>

          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="flex-grow p-6 bg-gradient-to-br from-white to-[#EAE8E4]/30">
          {/* Studio Name - Editorial Typography */}
          <h3 className="font-serif text-2xl mb-3 text-[#2A2624] leading-tight line-clamp-2 tracking-tight">
            {studio.name}
          </h3>

          {/* Rating - Elegant Display */}
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

          {/* Location - Refined */}
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

          {/* Price Range - Elegant */}
          {studio.pricing && (
            <div className="mb-4">
              <p className="text-sm text-[#5D5550]">
                Desde{' '}
                <span className="font-serif text-lg text-[#2A2624] font-medium">
                  {formatPrice(studio.pricing.singleClassMin, studio.pricing.singleClassMax, studio.pricing.currency)}
                </span>
                {' '}por clase
              </p>
            </div>
          )}

          {/* Class Types - Refined Badges */}
          {studio.classTypes && studio.classTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {studio.classTypes.slice(0, 3).map((type, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs font-sans bg-[#2A2624]/5 text-[#2A2624] border-none px-3 py-1 hover:bg-[#2A2624]/10 transition-colors"
                >
                  {type}
                </Badge>
              ))}
              {studio.classTypes.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs font-sans border-[#2A2624]/20 text-[#5D5550] px-3 py-1"
                >
                  +{studio.classTypes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions - Editorial Layout */}
        <div className="p-6 pt-0 flex gap-2 mt-auto">
          <Button
            asChild
            className="flex-1 bg-[#2A2624] hover:bg-[#3E2723] text-white font-sans tracking-wide transition-all duration-300 hover:shadow-lg"
          >
            <Link to={`/estudios-de-pilates/${citySlug(studio.address.city)}/${studio.slug}`}>
              Ver Detalles
            </Link>
          </Button>

          <div className="flex gap-2">
            {studio.contact?.phone && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`tel:${studio.contact.phone}`, '_self')}
                className="border-[#2A2624]/20 hover:bg-[#2A2624] hover:text-white transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {studio.contact?.website && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(studio.contact.website, '_blank')}
                className="border-[#2A2624]/20 hover:bg-[#2A2624] hover:text-white transition-all duration-300"
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
