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
  MapPin,
  Phone,
  Globe,
  Star,
  DollarSign,
  Calendar,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  Navigation,
  CheckCircle,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import { hasConvex } from '@/lib/convexProvider';
import { ContextualImage } from '@/components/ContextualImage';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

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

  // Fetch studio data - Convex
  const convexStudio = hasConvex
    ? useQuery(api.studios.getBySlug, cityName && studio ? { city: cityName, slug: studio } : undefined)
    : undefined;
  const convexCityStudios = hasConvex
    ? useQuery(api.studios.getByCity, cityName ? { city: cityName } : undefined)
    : undefined;
  const convexSearch = hasConvex
    ? useQuery(api.studios.search, studio ? { query: studio.replace(/-/g, ' '), limit: 10 } : undefined)
    : undefined;

  // Failover to local data after a short timeout
  const [failover, setFailover] = React.useState(false);
  React.useEffect(() => {
    setFailover(false);
    const t = setTimeout(() => setFailover(true), 3000);
    return () => clearTimeout(t);
  }, [cityName, studio]);

  const fallbackStudio = (localData.studios as any[]).find(
    (s: any) => (s.address?.city || '').toLowerCase() === (cityName || '').toLowerCase() && s.slug === studio
  ) || null;

  const resolvedConvexStudio =
    convexStudio
    || (convexCityStudios || []).find((s: any) => s.slug === studio)
    || (convexSearch || []).find((s: any) => s.slug === studio)
    || (convexSearch || [])[0];

  const studioSource = hasConvex
    ? (resolvedConvexStudio
      ? resolvedConvexStudio
      : failover
        ? fallbackStudio
        : undefined)
    : fallbackStudio;

  const studioData = React.useMemo(() => {
    if (!studioSource) return studioSource;
    if (!fallbackStudio || studioSource === fallbackStudio) return studioSource;

    return {
      ...fallbackStudio,
      ...studioSource,
      address: {
        ...fallbackStudio.address,
        ...studioSource.address,
      },
      contact: {
        ...fallbackStudio.contact,
        ...studioSource.contact,
      },
      metrics: {
        ...fallbackStudio.metrics,
        ...studioSource.metrics,
      },
      pricing: fallbackStudio.pricing || studioSource.pricing
        ? {
            ...fallbackStudio.pricing,
            ...studioSource.pricing,
          }
        : undefined,
    };
  }, [studioSource, fallbackStudio]);

  // Show loading state while data is being fetched
  if (studioData === undefined) {
    return (
      <LuxuryLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-6 text-center">
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-10 bg-gray-300 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </LuxuryLayout>
    );
  }

  // Show not found if query returned null
  if (studioData === null) {
    return (
      <LuxuryLayout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-serif italic text-[#2A2624] mb-4">Studio Not Found</h1>
          <p className="text-[#5D5550] font-light mb-8">
            No pudimos encontrar el estudio que buscas.
          </p>
          <Link to={`/estudios-de-pilates/${city}`} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
            Volver al directorio
          </Link>
        </div>
      </LuxuryLayout>
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
    `${studioData.name} es un estudio de Pilates en ${studioData.address?.neighborhood || cityName}. ${(studioData.metrics?.googleRating ?? 0) > 0
      ? `Calificación: ${studioData.metrics?.googleRating} estrellas con ${studioData.metrics?.googleReviewCount || 0} reseñas.`
      : ''
    }`;

  return (
    <LuxuryLayout>
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
            address: studioData.address ? {
              '@type': 'PostalAddress',
              streetAddress: studioData.address?.street,
              addressLocality: studioData.address?.city,
              addressRegion: studioData.address?.state || 'Ciudad de México',
              postalCode: studioData.address?.postalCode || '',
              addressCountry: 'MX',
            } : undefined,
            geo: studioData.address?.coordinates ? {
              '@type': 'GeoCoordinates',
              latitude: studioData.address.coordinates.lat,
              longitude: studioData.address.coordinates.lng,
            } : undefined,
            telephone: studioData.contact?.phone || undefined,
            url: studioData.contact?.website || undefined,
            aggregateRating: studioData.metrics?.googleRating
              ? {
                '@type': 'AggregateRating',
                ratingValue: studioData.metrics?.googleRating,
                reviewCount: studioData.metrics?.googleReviewCount || 0,
              }
              : undefined,
          })}
        </script>
      </Helmet>

      <section className="relative pt-32 pb-12 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link to={`/estudios-de-pilates/${citySlug(cityName)}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to {cityName}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-4">
                {studioData.name}
              </h1>
              <div className="flex items-center gap-4">
                {studioData.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2A2624] text-[#EAE8E4] text-[10px] uppercase tracking-widest rounded-sm">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                <span className="text-xs uppercase tracking-widest text-[#5D5550]">
                  Data Quality: {studioData.dataQualityScore}%
                </span>
              </div>
            </div>

            <div className="mb-8 rounded-sm overflow-hidden">
              <ContextualImage
                placeholderId={`studio-${studio}-hero-1`}
                pageType="studios"
                pageSlug={studio || ''}
                location="hero"
                aspectRatio="16:9"
                alt={studioData?.name || 'Estudio de Pilates'}
              />
            </div>

            {/* Rating */}
            {studioData.metrics?.googleRating && (
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#2A2624]/10">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(studioData.metrics?.googleRating || 0)
                          ? 'fill-[#3E2723] text-[#3E2723]'
                          : 'text-[#2A2624]/20'
                        }`}
                    />
                  ))}
                </div>
                <span className="font-serif italic text-xl text-[#2A2624]">
                  {(studioData.metrics?.googleRating || 0).toFixed(1)}
                </span>
                <span className="text-sm text-[#5D5550] font-light">
                  ({studioData.metrics?.googleReviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-3 mb-8">
              <MapPin className="w-5 h-5 text-[#3E2723] mt-1" />
              <div>
                {studioData.address?.street && (
                  <p className="text-lg text-[#2A2624] font-medium">
                    {studioData.address.street}
                  </p>
                )}
                <p className="text-[#5D5550] font-light">
                  {studioData.address?.neighborhood && `${studioData.address.neighborhood}, `}
                  {studioData.address?.city}{studioData.address?.state ? `, ${studioData.address.state}` : ''}
                  {studioData.address?.postalCode && ` ${studioData.address.postalCode}`}
                </p>
              </div>
            </div>

            {/* Description */}
            {studioData.description && (
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-12">
                {studioData.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-16">
              {studioData.contact?.phone && (
                <Button variant="outline" className="gap-2 border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5" onClick={() => window.open(`tel:${studioData.contact.phone}`, '_self')}>
                  <Phone className="w-4 h-4" />
                  Llamar
                </Button>
              )}
              {studioData.contact?.whatsapp && (
                <Button className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none" onClick={() => window.open(`https://wa.me/${studioData.contact.whatsapp}`, '_blank')}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              )}
              {studioData.contact?.website && (
                <Button variant="outline" className="gap-2 border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5" onClick={() => window.open(studioData.contact.website, '_blank')}>
                  <Globe className="w-4 h-4" />
                  Sitio Web
                </Button>
              )}
              {studioData.contact?.bookingUrl && (
                <Button variant="outline" className="gap-2 border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5" onClick={() => window.open(studioData.contact.bookingUrl, '_blank')}>
                  <Calendar className="w-4 h-4" />
                  Reservar
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2 border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5"
                onClick={() => studioData.address?.coordinates && window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}
              >
                <Navigation className="w-4 h-4" />
                Cómo Llegar
              </Button>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-[#2A2624]/5">
                <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Info</TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Horarios</TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Servicios</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Info */}
                  <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                    <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Contact</h3>
                    <div className="space-y-4">
                      {studioData.contact?.phone && (
                        <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                          <Phone className="w-4 h-4 text-[#3E2723]" />
                          <span>{studioData.contact.phone}</span>
                        </div>
                      )}
                      {studioData.contact?.email && (
                        <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                          <Mail className="w-4 h-4 text-[#3E2723]" />
                          <a href={`mailto:${studioData.contact.email}`} className="hover:underline">
                            {studioData.contact.email}
                          </a>
                        </div>
                      )}
                      {studioData.contact?.website && (
                        <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                          <Globe className="w-4 h-4 text-[#3E2723]" />
                          <a
                            href={studioData.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Visitar sitio web
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map */}
                  <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                    <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Location</h3>
                    <div className="aspect-video bg-[#2A2624]/5 rounded-sm flex items-center justify-center mb-4">
                      <MapPin className="w-8 h-8 text-[#2A2624]/20" />
                    </div>
                    {studioData.address?.coordinates && (
                      <Button
                        className="w-full border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5"
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}
                      >
                        Ver en Google Maps
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                  <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Opening Hours</h3>
                  {studioData.hours ? (
                    <div className="space-y-3">
                      {formatHours()?.map((day, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-[#2A2624]/5 last:border-0 text-sm">
                          <span className="font-medium text-[#2A2624]">{day.day}</span>
                          <span className="text-[#5D5550] font-light">{day.hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#5D5550] font-light">
                      Horarios no disponibles. Contacta al estudio para más información.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Class Types */}
                  {studioData.classTypes && studioData.classTypes.length > 0 && (
                    <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                      <h3 className="font-serif italic text-lg text-[#2A2624] mb-4">Classes</h3>
                      <div className="flex flex-wrap gap-2">
                        {studioData.classTypes.map((type) => (
                          <span key={type} className="px-2 py-1 bg-[#2A2624]/5 text-[#5D5550] text-[10px] uppercase tracking-widest rounded-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {studioData.equipment && studioData.equipment.length > 0 && (
                    <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                      <h3 className="font-serif italic text-lg text-[#2A2624] mb-4">Equipment</h3>
                      <div className="flex flex-wrap gap-2">
                        {studioData.equipment.map((item) => (
                          <span key={item} className="px-2 py-1 border border-[#2A2624]/20 text-[#5D5550] text-[10px] uppercase tracking-widest rounded-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {studioData.amenities && studioData.amenities.length > 0 && (
                    <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                      <h3 className="font-serif italic text-lg text-[#2A2624] mb-4">Amenities</h3>
                      <div className="space-y-2">
                        {studioData.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                            <CheckCircle className="w-3 h-3 text-[#3E2723]" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Photos */}
            <div className="rounded-sm overflow-hidden border border-[#2A2624]/10">
              <GooglePlacesPhoto
                placeId={(studioData as any).googlePlaceId || (studioData as any).placeId || undefined}
                studioName={studioData.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                priority="eager"
                showAttribution={true}
                fallbackIndex={0}
              />
            </div>

            {/* Pricing */}
            {studioData.pricing && (
              <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Pricing
                </h3>
                <div className="space-y-4">
                  {studioData.pricing.singleClassMin && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#5D5550] font-light">Clase individual</span>
                      <span className="font-medium text-[#2A2624]">
                        ${studioData.pricing.singleClassMin}
                        {studioData.pricing.singleClassMax && studioData.pricing.singleClassMax !== studioData.pricing.singleClassMin && ` - $${studioData.pricing.singleClassMax}`}
                        {' '}{studioData.pricing.currency}
                      </span>
                    </div>
                  )}
                  {studioData.pricing.monthlyMin && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#5D5550] font-light">Mensualidad</span>
                      <span className="font-medium text-[#2A2624]">
                        ${studioData.pricing.monthlyMin}
                        {studioData.pricing.monthlyMax && studioData.pricing.monthlyMax !== studioData.pricing.monthlyMin && ` - $${studioData.pricing.monthlyMax}`}
                        {' '}{studioData.pricing.currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media */}
            {studioData.social && (
              <div className="bg-white/50 border border-[#2A2624]/10 p-6 rounded-sm">
                <h3 className="font-serif italic text-xl text-[#2A2624] mb-4">Social</h3>
                <div className="flex gap-3">
                  {studioData.social.instagram && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5"
                      onClick={() => window.open(studioData.social!.instagram, '_blank')}
                    >
                      <Instagram className="w-4 h-4" />
                    </Button>
                  )}
                  {studioData.social.facebook && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5"
                      onClick={() => window.open(studioData.social!.facebook, '_blank')}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default StudioDetail;
