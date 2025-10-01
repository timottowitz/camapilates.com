import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Star, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { citySlug } from '@/utils/slug';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import {
  getStudioColor,
  getInitials,
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
  const studioColor = getStudioColor(studio.name);
  const studioInitials = getInitials(studio.name);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="p-0">
        {/* Studio Image using Google Places Photo */}
        <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <GooglePlacesPhoto
            placeId={studio.googlePlaceId || undefined}
            studioName={studio.name}
            width={400}
            height={300}
            className="w-full h-full object-cover"
            priority="lazy"
            showAttribution={false}
            fallbackIndex={0}
          />

          {/* Distance Badge */}
          {studio.distance && (
            <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800">
              <MapPin className="w-3 h-3 mr-1" />
              {formatDistance(studio.distance)}
            </Badge>
          )}

          {/* Quality Score Badge */}
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs font-semibold ${getQualityBadgeColor(
              studio.dataQualityScore
            )}`}
          >
            {studio.dataQualityScore}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4">
        {/* Studio Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{studio.name}</h3>

        {/* Rating */}
        {studio.metrics?.googleRating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-semibold">{studio.metrics?.googleRating?.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({studio.metrics?.googleReviewCount || 0} reseñas)
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">
            {studio.address.neighborhood && `${studio.address.neighborhood}, `}
            {studio.address.city}
          </p>
        </div>

        {/* Price Range */}
        {studio.pricing && (
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              Clase: {formatPrice(studio.pricing.singleClassMin, studio.pricing.singleClassMax, studio.pricing.currency)}
            </p>
          </div>
        )}

        {/* Class Types */}
        {studio.classTypes && studio.classTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {studio.classTypes.slice(0, 3).map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {studio.classTypes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{studio.classTypes.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1">
          <Link to={`/estudios-de-pilates/${citySlug(studio.address.city)}/${studio.slug}`}>
            Ver Detalles
          </Link>
        </Button>
        {studio.contact?.phone && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(`tel:${studio.contact.phone}`, '_self')}
          >
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {studio.contact?.website && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(studio.contact.website, '_blank')}
          >
            <Globe className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StudioCard;
