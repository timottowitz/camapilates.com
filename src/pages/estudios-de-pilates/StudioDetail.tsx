import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  DollarSign,
  Calendar,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  Navigation,
  CheckCircle,
  Award,
} from 'lucide-react';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import { hasConvex } from '@/lib/convexProvider';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';

const StudioDetail: React.FC = () => {
  const { city, studio } = useParams<{ city: string; studio: string }>();

  // City name mapping - normalize accents in slugs
  const cityNameMap: { [key: string]: string } = {
    'ciudad-de-mexico': 'Ciudad de México',
    'ciudad-de-méxico': 'Ciudad de México', // Handle URL with accent
    'queretaro': 'Querétaro',
    'querétaro': 'Querétaro',
    'puebla': 'Puebla',
    'monterrey': 'Monterrey',
    'guadalajara': 'Guadalajara',
    'mazatlan': 'Mazatlán',
    'mazatlán': 'Mazatlán',
    'tijuana': 'Tijuana',
  };

  const cityName = city ? cityNameMap[city.toLowerCase()] || city : '';

  // Normalize city slug in URL to canonical ASCII form
  React.useEffect(() => {
    if (!cityName || !city || !studio) return;
    const normalized = citySlug(cityName);
    if (normalized && city !== normalized) {
      // Preserve studio segment while normalizing city segment
      window.history.replaceState({}, document.title, `/estudios-de-pilates/${normalized}/${studio}`);
    }
  }, [city, studio, cityName]);

  // Debug logging
  React.useEffect(() => {
    if (city && studio) {
      console.log('StudioDetail params:', {
        urlCity: city,
        urlStudio: studio,
        mappedCityName: cityName
      });
    }
  }, [city, studio, cityName]);

  // Fetch studio data - Convex or local fallback
  const studioData = hasConvex
    ? useQuery(api.studios.getBySlug, cityName && studio ? { city: cityName, slug: studio } : 'skip')
    : (localData.studios as any[]).find((s: any) => (s.address?.city || '').toLowerCase() === (cityName || '').toLowerCase() && s.slug === studio) || null;

  // Debug data state
  React.useEffect(() => {
    console.log('StudioData state:', studioData === undefined ? 'LOADING' : studioData === null ? 'NOT_FOUND' : 'LOADED');
  }, [studioData]);

  // Show loading state while data is being fetched
  if (studioData === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              {/* Breadcrumb skeleton */}
              <div className="h-4 bg-gray-200 rounded w-64"></div>

              {/* Title skeleton */}
              <div className="h-10 bg-gray-300 rounded w-3/4"></div>

              {/* Rating skeleton */}
              <div className="flex gap-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-40"></div>
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found if query returned null
  if (studioData === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Estudio no encontrado</h1>
          <p className="text-gray-600 mb-8">
            No pudimos encontrar el estudio que buscas.
          </p>
          <Button asChild>
            <Link to={`/estudios-de-pilates/${city}`}>
              Volver al directorio
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Format business hours
  const formatHours = () => {
    if (!studioData?.hours) return null;
    const days = [
      { key: 'monday', label: 'Lunes' },
      { key: 'tuesday', label: 'Martes' },
      { key: 'wednesday', label: 'Miércoles' },
      { key: 'thursday', label: 'Jueves' },
      { key: 'friday', label: 'Viernes' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' },
    ];

    return days.map(day => ({
      day: day.label,
      hours: studioData.hours?.[day.key as keyof typeof studioData.hours] || 'Cerrado',
    }));
  };

  // SEO metadata
  const pageTitle = `${studioData.name} - Estudio de Pilates en ${cityName}`;
  const pageDescription = studioData.description ||
    `${studioData.name} es un estudio de Pilates en ${studioData.address.neighborhood || cityName}. ${
      studioData.metrics.googleRating
        ? `Calificación: ${studioData.metrics.googleRating} estrellas con ${studioData.metrics.googleReviewCount} reseñas.`
        : ''
    }`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HealthClub',
            name: studioData.name,
            description: pageDescription,
            address: {
              '@type': 'PostalAddress',
              streetAddress: studioData.address.street,
              addressLocality: studioData.address.city,
              addressRegion: studioData.address.state || 'Ciudad de México',
              postalCode: studioData.address.postalCode || '',
              addressCountry: 'MX',
            },
            geo: studioData.address.coordinates ? {
              '@type': 'GeoCoordinates',
              latitude: studioData.address.coordinates.lat,
              longitude: studioData.address.coordinates.lng,
            } : undefined,
            telephone: studioData.contact?.phone || undefined,
            url: studioData.contact?.website || undefined,
            aggregateRating: studioData.metrics?.googleRating
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: studioData.metrics.googleRating,
                  reviewCount: studioData.metrics.googleReviewCount || 0,
                }
              : undefined,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/estudios-de-pilates">
                    Estudios de Pilates
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/estudios-de-pilates/${city}`}>
                    {cityName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{studioData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {studioData.name}
                    </h1>
                    <div className="flex items-center gap-4">
                      {studioData.isVerified && (
                        <Badge className="gap-1 bg-green-500">
                          <CheckCircle className="w-3 h-3" />
                          Verificado
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Calidad de datos: {studioData.dataQualityScore}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {studioData.metrics.googleRating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(studioData.metrics.googleRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      {studioData.metrics.googleRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({studioData.metrics.googleReviewCount} reseñas)
                    </span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      {studioData.address.street}
                    </p>
                    <p className="text-gray-600">
                      {studioData.address.neighborhood && `${studioData.address.neighborhood}, `}
                      {studioData.address.city}, {studioData.address.state}
                      {studioData.address.postalCode && ` ${studioData.address.postalCode}`}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {studioData.description && (
                  <p className="text-gray-700 mb-6">{studioData.description}</p>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {studioData.contact.phone && (
                    <Button className="gap-2" onClick={() => window.open(`tel:${studioData.contact.phone}`, '_self')}>
                      <Phone className="w-4 h-4" />
                      Llamar
                    </Button>
                  )}
                  {studioData.contact.whatsapp && (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => window.open(`https://wa.me/${studioData.contact.whatsapp}`, '_blank')}>
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  )}
                  {studioData.contact.website && (
                    <Button variant="outline" className="gap-2" onClick={() => window.open(studioData.contact.website, '_blank')}>
                      <Globe className="w-4 h-4" />
                      Sitio Web
                    </Button>
                  )}
                  {studioData.contact.bookingUrl && (
                    <Button variant="outline" className="gap-2" onClick={() => window.open(studioData.contact.bookingUrl, '_blank')}>
                      <Calendar className="w-4 h-4" />
                      Reservar Clase
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo Llegar
                  </Button>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                {/* Photos */}
                <Card>
                  <CardContent className="p-0">
                    <GooglePlacesPhoto
                      placeId={studioData.googlePlaceId || undefined}
                      studioName={studioData.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg"
                      priority="eager"
                      showAttribution={true}
                      fallbackIndex={0}
                    />
                  </CardContent>
                </Card>

                {/* Pricing */}
                {studioData.pricing && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Precios
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {studioData.pricing.singleClassMin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clase individual:</span>
                          <span className="font-semibold">
                            ${studioData.pricing.singleClassMin}
                            {studioData.pricing.singleClassMax && studioData.pricing.singleClassMax !== studioData.pricing.singleClassMin && ` - $${studioData.pricing.singleClassMax}`}
                            {' '}{studioData.pricing.currency}
                          </span>
                        </div>
                      )}
                      {studioData.pricing.monthlyMin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mensualidad:</span>
                          <span className="font-semibold">
                            ${studioData.pricing.monthlyMin}
                            {studioData.pricing.monthlyMax && studioData.pricing.monthlyMax !== studioData.pricing.monthlyMin && ` - $${studioData.pricing.monthlyMax}`}
                            {' '}{studioData.pricing.currency}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Social Media */}
                {studioData.social && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Redes Sociales</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                      {studioData.social.instagram && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(studioData.social!.instagram, '_blank')}
                        >
                          <Instagram className="w-4 h-4" />
                        </Button>
                      )}
                      {studioData.social.facebook && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => window.open(studioData.social!.facebook, '_blank')}
                        >
                          <Facebook className="w-4 h-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="schedule">Horarios</TabsTrigger>
              <TabsTrigger value="features">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studioData.contact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{studioData.contact.phone}</span>
                      </div>
                    )}
                    {studioData.contact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${studioData.contact.email}`} className="text-purple-600 hover:underline">
                          {studioData.contact.email}
                        </a>
                      </div>
                    )}
                    {studioData.contact.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={studioData.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          Visitar sitio web
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Map */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ubicación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}
                    >
                      Ver en Google Maps
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Horarios de Atención</CardTitle>
                </CardHeader>
                <CardContent>
                  {studioData.hours ? (
                    <div className="space-y-2">
                      {formatHours()?.map((day, index) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-0">
                          <span className="font-medium">{day.day}</span>
                          <span className="text-gray-600">{day.hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Horarios no disponibles. Contacta al estudio para más información.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Class Types */}
                {studioData.classTypes && studioData.classTypes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tipos de Clases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studioData.classTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Equipment */}
                {studioData.equipment && studioData.equipment.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipamiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {studioData.equipment.map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Amenities */}
                {studioData.amenities && studioData.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Servicios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studioData.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications */}
                {studioData.certifications && studioData.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certificaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studioData.certifications.map((cert) => (
                          <div key={cert} className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default StudioDetail;
