import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Calendar,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  Navigation,
  CheckCircle,
  ArrowLeft,
  Car,
  CreditCard,
  Accessibility,
  Share2,
  Clock,
  Users,
  Award
} from 'lucide-react';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import { GoogleReviews } from '@/components/studio/GoogleReviews';
import { citySlug } from '@/utils/slug';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

// City name mapping
const cityNameMap: Record<string, string> = {
  'cdmx': 'Ciudad de México',
  'ciudad-de-mexico': 'Ciudad de México',
  'queretaro': 'Querétaro',
  'puebla': 'Puebla',
  'monterrey': 'Monterrey',
  'guadalajara': 'Guadalajara',
};

// Google Place type translations
const placeTypeTranslations: Record<string, string> = {
  'gym': 'Gimnasio',
  'health': 'Salud',
  'sports_complex': 'Complejo Deportivo',
  'sports_activity_location': 'Centro de Actividad Física',
  'fitness_center': 'Centro de Fitness',
  'yoga_studio': 'Estudio de Yoga',
  'pilates_studio': 'Estudio de Pilates',
  'spa': 'Spa',
  'point_of_interest': 'Punto de Interés',
  'establishment': 'Establecimiento',
};

const formatCoordinate = (value: number, axis: 'lat' | 'lng') => {
  const direction = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
};

const InfoItem = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="flex gap-4 p-4 rounded-lg bg-[#F9F8F6] border border-[#2A2624]/5">
    <div className="mt-1">
      <div className="w-8 h-8 rounded-full bg-[#2A2624]/5 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#3E2723]" />
      </div>
    </div>
    <div>
      <h4 className="font-medium text-[#2A2624] text-sm mb-1">{title}</h4>
      <div className="text-sm text-[#5D5550] font-light leading-relaxed">{children}</div>
    </div>
  </div>
);

const StudioDetail: React.FC = () => {
  const { city, studio: studioSlug } = useParams<{ city: string; studio: string }>();
  const navigate = useNavigate();

  const cityName = city ? cityNameMap[city.toLowerCase()] || city : '';
  const normalizedCitySlug = cityName ? citySlug(cityName) : city || '';

  // Simple Convex queries
  const studioData = useQuery(
    api.studios.getBySlug,
    cityName && studioSlug ? { city: cityName, slug: studioSlug } : 'skip'
  );

  // Loading state
  if (studioData === undefined) {
    return (
      <LuxuryLayout>
        <div className="min-h-screen pt-32 px-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-16 bg-gray-300 rounded w-2/3"></div>
              <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </LuxuryLayout>
    );
  }

  // Not found
  if (!studioData) {
    return (
      <LuxuryLayout>
        <div className="min-h-screen pt-32 px-4 text-center">
          <h1 className="text-4xl font-serif italic text-[#2A2624] mb-4">Studio Not Found</h1>
          <p className="text-[#5D5550] mb-8">No pudimos encontrar el estudio que buscas.</p>
          <Button onClick={() => navigate(`/estudios-de-pilates/${normalizedCitySlug}`)}>
            Volver al directorio
          </Button>
        </div>
      </LuxuryLayout>
    );
  }

  // Format hours
  const formatHours = () => {
    if (!studioData.hours) return null;
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

  // SEO
  const pageTitle = `${studioData.name} - Estudio de Pilates en ${cityName}`;
  const pageDescription = studioData.generatedSummary?.overview || studioData.description ||
    `${studioData.name} es un estudio de Pilates en ${studioData.address?.neighborhood || cityName}.`;

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <section className="relative pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/estudios-de-pilates/${normalizedCitySlug}`}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-6"
          >
            <ArrowLeft className="w-3 h-3" /> Volver a {cityName}
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-4">
                {studioData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5D5550]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3E2723]" />
                  <span>{studioData.address?.neighborhood || cityName}</span>
                </div>
                {studioData.metrics?.googleRating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-[#3E2723] text-[#3E2723]" />
                    <span className="font-medium text-[#2A2624]">{studioData.metrics.googleRating.toFixed(1)}</span>
                    <span className="text-[#5D5550]/60">({studioData.metrics.googleReviewCount} reseñas)</span>
                  </div>
                )}
                {studioData.isVerified && (
                  <Badge variant="secondary" className="bg-[#2A2624]/5 text-[#2A2624]">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>

            <div className="hidden md:flex gap-3">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="w-4 h-4" />
              </Button>
              {studioData.contact?.whatsapp && (
                <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-6" onClick={() => window.open(`https://wa.me/${studioData.contact!.whatsapp}`, '_blank')}>
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-4 h-[50vh] md:h-[60vh] mb-12 rounded-2xl overflow-hidden">
          <div className="col-span-1 md:col-span-2 md:row-span-2 relative">
            <GooglePlacesPhoto
              placeId={studioData.googlePlaceId || undefined}
              studioName={studioData.name}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              showAttribution={true}
              fallbackIndex={0}
              priority="eager"
            />
          </div>
          <div className="hidden md:block relative bg-[#F9F8F6]">
            <GooglePlacesPhoto
              placeId={studioData.googlePlaceId || undefined}
              studioName={studioData.name}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              showAttribution={false}
              fallbackIndex={1}
            />
          </div>
          <div className="hidden md:block relative bg-[#F9F8F6]">
            <GooglePlacesPhoto
              placeId={studioData.googlePlaceId || undefined}
              studioName={studioData.name}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              showAttribution={false}
              fallbackIndex={2}
            />
          </div>
          <div className="hidden md:block md:col-span-2 relative bg-[#2A2624]/5">
            {studioData.address?.coordinates ? (
              <div
                className="w-full h-full bg-[#201A18] cursor-pointer group relative overflow-hidden"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address!.coordinates!.lat},${studioData.address!.coordinates!.lng}`, '_blank')}
              >
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
                  backgroundSize: '28px 28px'
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="font-mono text-white text-lg">
                      {formatCoordinate(studioData.address.coordinates.lat, 'lat')}, {formatCoordinate(studioData.address.coordinates.lng, 'lng')}
                    </p>
                    <p className="text-white/60 text-sm mt-1">Click para ver en Google Maps</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-[#2A2624]/20" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">

            {/* About */}
            <section>
              <h2 className="font-serif italic text-3xl text-[#2A2624] mb-6">Sobre el Estudio</h2>

              {studioData.generatedSummary?.overview || studioData.description ? (
                <p className="text-lg text-[#5D5550] font-light leading-relaxed">
                  {studioData.generatedSummary?.overview || studioData.description}
                </p>
              ) : (
                <p className="text-lg text-[#5D5550] font-light italic">
                  Información del estudio próximamente disponible.
                </p>
              )}

              {/* Vibe & Highlights */}
              {(studioData.generatedSummary?.vibe || studioData.generatedSummary?.highlight) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {studioData.generatedSummary.vibe && (
                    <Badge variant="outline" className="px-4 py-2 rounded-full">
                      ✨ {studioData.generatedSummary.vibe}
                    </Badge>
                  )}
                  {studioData.generatedSummary.highlight && (
                    <Badge variant="outline" className="px-4 py-2 rounded-full">
                      🏆 {studioData.generatedSummary.highlight}
                    </Badge>
                  )}
                </div>
              )}

              {/* Review Insights */}
              {studioData.generatedSummary?.reviewInsights && (
                <div className="mt-6 p-4 bg-[#F9F8F6] rounded-lg border border-[#2A2624]/5">
                  <p className="text-sm text-[#5D5550] font-light italic">
                    💬 {studioData.generatedSummary.reviewInsights}
                  </p>
                </div>
              )}

              {/* Class Types from Google */}
              {studioData.classTypes && studioData.classTypes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-[#2A2624] mb-3">Categorías</h4>
                  <div className="flex flex-wrap gap-2">
                    {studioData.classTypes.map((type, i) => (
                      <Badge key={i} variant="secondary" className="bg-[#2A2624]/5 text-[#2A2624]">
                        {placeTypeTranslations[type] || type.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Google Reviews */}
            <GoogleReviews
              googlePlaceId={studioData.googlePlaceId || undefined}
              studioName={studioData.name}
              maxReviews={6}
            />

            {/* Info Grid */}
            <section>
              <h2 className="font-serif italic text-3xl text-[#2A2624] mb-8">Información Útil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Clock} title="Horarios">
                  {studioData.hours ? 'Ver horarios completos abajo' : 'Contactar para horarios'}
                </InfoItem>
                <InfoItem icon={CreditCard} title="Formas de Pago">
                  Efectivo, Tarjeta, Transferencia
                </InfoItem>
                <InfoItem icon={Car} title="Estacionamiento">
                  Estacionamiento disponible en la zona
                </InfoItem>
                <InfoItem icon={Users} title="Tipo de Clases">
                  Grupales e Individuales
                </InfoItem>
              </div>
            </section>

            {/* Location & Hours */}
            <section id="location-section" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif italic text-3xl text-[#2A2624]">Ubicación y Horarios</h2>
                {studioData.address?.coordinates && (
                  <Button variant="link" className="text-[#3E2723]" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address!.coordinates!.lat},${studioData.address!.coordinates!.lng}`, '_blank')}>
                    Abrir en Maps <Navigation className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <div className="bg-[#F9F8F6] rounded-xl p-8 border border-[#2A2624]/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-[#2A2624] mb-2">Dirección</h4>
                    <p className="text-[#5D5550] font-light mb-6">
                      {studioData.address?.street}<br/>
                      {studioData.address?.neighborhood && `${studioData.address.neighborhood}, `}
                      {studioData.address?.postalCode}<br/>
                      {studioData.address?.city}, {studioData.address?.state}
                    </p>

                    {studioData.contact?.phone && (
                      <div className="flex items-center gap-3 text-[#5D5550] mb-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${studioData.contact.phone}`} className="hover:underline">{studioData.contact.phone}</a>
                      </div>
                    )}
                    {studioData.contact?.website && (
                      <div className="flex items-center gap-3 text-[#5D5550]">
                        <Globe className="w-4 h-4" />
                        <a href={studioData.contact.website} target="_blank" rel="noopener" className="hover:underline">Sitio Web</a>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-[#2A2624] mb-2">Horarios</h4>
                    {studioData.hours ? (
                      <div className="space-y-2 text-sm">
                        {formatHours()?.map((day, i) => (
                          <div key={i} className="flex justify-between border-b border-[#2A2624]/5 last:border-0 pb-1">
                            <span className="text-[#5D5550]">{day.day}</span>
                            <span className="font-medium text-[#2A2624]">{day.hours}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#5D5550] italic">Horarios no disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="relative hidden lg:block">
            <div className="sticky top-32 space-y-6">
              <Card className="border-[#2A2624]/10 shadow-xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center pb-6 border-b border-[#2A2624]/5">
                    <p className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">Clase Individual</p>
                    <div className="flex items-center justify-center gap-1 text-[#2A2624]">
                      <span className="text-3xl font-serif italic">
                        {studioData.pricing?.singleClassMin ? `$${studioData.pricing.singleClassMin}` : 'Contactar'}
                      </span>
                      {studioData.pricing?.singleClassMin && <span className="text-sm font-light">MXN</span>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {studioData.contact?.bookingUrl && (
                      <Button className="w-full bg-[#2A2624] hover:bg-[#3E2723] h-12" onClick={() => window.open(studioData.contact!.bookingUrl, '_blank')}>
                        Reservar Clase
                      </Button>
                    )}

                    {studioData.contact?.whatsapp ? (
                      <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] h-12" onClick={() => window.open(`https://wa.me/${studioData.contact!.whatsapp}`, '_blank')}>
                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                      </Button>
                    ) : studioData.contact?.phone && (
                      <Button variant="outline" className="w-full h-12" onClick={() => window.location.href = `tel:${studioData.contact!.phone}`}>
                        <Phone className="w-4 h-4 mr-2" /> Llamar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social */}
              {(studioData.social?.instagram || studioData.social?.facebook) && (
                <div className="flex justify-center gap-4">
                  {studioData.social.instagram && (
                    <a href={studioData.social.instagram} target="_blank" rel="noopener" className="p-3 bg-white border border-[#2A2624]/10 rounded-full hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5 text-[#2A2624]" />
                    </a>
                  )}
                  {studioData.social.facebook && (
                    <a href={studioData.social.facebook} target="_blank" rel="noopener" className="p-3 bg-white border border-[#2A2624]/10 rounded-full hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5 text-[#2A2624]" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2A2624]/10 p-4 md:hidden z-50 flex items-center gap-3 shadow-lg">
          <div className="flex-1">
            <p className="text-xs text-[#5D5550]">Desde</p>
            <p className="text-lg font-serif text-[#2A2624]">
              {studioData.pricing?.singleClassMin ? `$${studioData.pricing.singleClassMin}` : 'Consultar'}
            </p>
          </div>
          <div className="flex gap-2">
            {studioData.contact?.whatsapp && (
              <Button size="icon" className="bg-[#25D366] hover:bg-[#128C7E] rounded-full w-12 h-12" onClick={() => window.open(`https://wa.me/${studioData.contact!.whatsapp}`, '_blank')}>
                <MessageCircle className="w-5 h-5 text-white" />
              </Button>
            )}
            <Button className="bg-[#2A2624] rounded-full px-6 h-12" onClick={() => {
              if (studioData.contact?.bookingUrl) window.open(studioData.contact.bookingUrl, '_blank');
              else if (studioData.contact?.phone) window.location.href = `tel:${studioData.contact.phone}`;
            }}>
              {studioData.contact?.bookingUrl ? 'Reservar' : 'Llamar'}
            </Button>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default StudioDetail;
