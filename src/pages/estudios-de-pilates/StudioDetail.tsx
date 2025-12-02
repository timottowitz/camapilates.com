import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  Car,
  CreditCard,
  Accessibility,
  Info,
  Share2
} from 'lucide-react';
import { GooglePlacesPhoto } from '@/components/studio/GooglePlacesPhoto';
import { GoogleReviews } from '@/components/studio/GoogleReviews';
import { hasConvex } from '@/lib/convexProvider';
import { ContextualImage } from '@/components/ContextualImage';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

// Helper component for "Know Before You Go" items
const InfoItem = ({ icon: Icon, title, children, className = "" }: { icon: any, title: string, children: React.ReactNode, className?: string }) => (
  <div className={`flex gap-4 p-4 rounded-lg bg-[#F9F8F6] border border-[#2A2624]/5 ${className}`}>
    <div className="mt-1">
      <div className="w-8 h-8 rounded-full bg-[#2A2624]/5 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#3E2723]" />
      </div>
    </div>
    <div>
      <h4 className="font-medium text-[#2A2624] text-sm mb-1">{title}</h4>
      <div className="text-sm text-[#5D5550] font-light leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const formatCoordinate = (value: number, axis: 'lat' | 'lng') => {
  const direction = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
};

const StudioDetail: React.FC = () => {
  const { city, studio } = useParams<{ city: string; studio: string }>();

  // City name mapping - normalize accents in slugs
  const cityNameMap: { [key: string]: string } = {
    'cdmx': 'Ciudad de México', // Common abbreviation
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

  // Fetch studio data - Convex (always call hooks, use 'skip' pattern)
  const convexStudio = useQuery(
    api.studios.getBySlug,
    hasConvex && cityName && studio ? { city: cityName, slug: studio } : 'skip'
  );
  const convexCityStudios = useQuery(
    api.studios.getByCity,
    hasConvex && cityName ? { city: cityName } : 'skip'
  );
  const convexSearch = useQuery(
    api.studios.search,
    hasConvex && studio ? { query: studio.replace(/-/g, ' '), limit: 10 } : 'skip'
  );

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

      <section className="relative pt-24 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <Link to={`/estudios-de-pilates/${citySlug(cityName)}`} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-6 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to {cityName}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-4">
                {studioData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5D5550]">
                 <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#3E2723]" />
                    <span className="border-b border-transparent hover:border-[#3E2723] transition-colors cursor-pointer"
                          onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      {studioData.address?.neighborhood || cityName}
                    </span>
                 </div>
                 {studioData.metrics?.googleRating && (
                   <div className="flex items-center gap-2">
                     <Star className="w-4 h-4 fill-[#3E2723] text-[#3E2723]" />
                     <span className="font-medium text-[#2A2624]">{studioData.metrics.googleRating.toFixed(1)}</span>
                     <span className="text-[#5D5550]/60">({studioData.metrics.googleReviewCount} reviews)</span>
                   </div>
                 )}
                 {studioData.isVerified && (
                    <Badge variant="secondary" className="bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10 border-none rounded-sm text-[10px] tracking-widest uppercase">
                       Verified Studio
                    </Badge>
                 )}
              </div>
            </div>

            {/* Desktop Quick Actions */}
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

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-4 h-[50vh] md:h-[60vh] mb-12 rounded-2xl overflow-hidden">
          <div className="col-span-1 md:col-span-2 md:row-span-2 relative group">
            <ContextualImage
              placeholderId={`studio-${studio}-hero-1`}
              pageType="studios"
              pageSlug={studio || ''}
              location="hero"
              aspectRatio="square"
              alt={studioData.name}
            />
          </div>
          <div className="hidden md:block md:col-span-1 md:row-span-1 relative bg-[#F9F8F6]">
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
          <div className="hidden md:block md:col-span-1 md:row-span-1 relative bg-[#F9F8F6]">
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
          <div className="hidden md:block md:col-span-2 md:row-span-1 relative bg-[#2A2624]/5 flex items-center justify-center">
              {studioData.address?.coordinates ? (
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:brown%7C${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&style=feature:all|element:labels|visibility:on&style=feature:poi|visibility:off`}
                  alt="Studio location map"
                  className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}
                />
              ) : (
                <div className="text-[#2A2624]/20 flex flex-col items-center">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="text-xs uppercase tracking-widest">Map View</span>
                </div>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* About / Summary */}
            <section>
              <h2 className="font-serif italic text-3xl text-[#2A2624] mb-6">About the Studio</h2>
              <div className="prose prose-brown max-w-none">
                 {(studioData.generatedSummary?.overview || studioData.description) ? (
                    <p className="text-lg text-[#5D5550] font-light leading-relaxed whitespace-pre-line">
                      {studioData.generatedSummary?.overview || studioData.description}
                    </p>
                 ) : (
                   <p className="text-lg text-[#5D5550] font-light italic">
                     No description available yet for this studio.
                   </p>
                 )}
              </div>

              {/* Highlights / Vibe */}
              {(studioData.generatedSummary?.vibe || studioData.generatedSummary?.highlight) && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {studioData.generatedSummary.vibe && (
                    <Badge variant="outline" className="px-4 py-2 rounded-full border-[#2A2624]/20 text-[#5D5550] font-normal">
                      ✨ Vibe: {studioData.generatedSummary.vibe}
                    </Badge>
                  )}
                  {studioData.generatedSummary.highlight && (
                    <Badge variant="outline" className="px-4 py-2 rounded-full border-[#2A2624]/20 text-[#5D5550] font-normal">
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
            </section>

            {/* Google Reviews Section */}
            <GoogleReviews
              googlePlaceId={studioData.googlePlaceId || undefined}
              studioName={studioData.name}
              maxReviews={4}
            />

            {/* Know Before You Go - NEW SECTION */}
            <section>
               <h2 className="font-serif italic text-3xl text-[#2A2624] mb-8">Know Before You Go</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parking */}
                  <InfoItem icon={Car} title="Parking">
                     {studioData.parking?.hasParking ? (
                        <>
                          {studioData.parking.structure === 'valet' && <span className="block">Valet parking available.</span>}
                          {studioData.parking.isFree && <span className="block text-green-700">Free parking onsite.</span>}
                          {!studioData.parking.isFree && studioData.parking.structure === 'lot' && <span className="block">Paid parking lot available.</span>}
                          {studioData.parking.notes && <span className="block text-xs mt-1 opacity-80">{studioData.parking.notes}</span>}
                        </>
                     ) : (
                        "Street parking only. Please plan ahead."
                     )}
                  </InfoItem>

                  {/* Payments */}
                  <InfoItem icon={CreditCard} title="Payment Methods">
                     <div className="flex flex-wrap gap-2 mt-1">
                        {studioData.payment?.card && <Badge variant="secondary" className="text-[10px]">Cards</Badge>}
                        {studioData.payment?.cash && <Badge variant="secondary" className="text-[10px]">Cash</Badge>}
                        {studioData.payment?.transfer && <Badge variant="secondary" className="text-[10px]">Transfer</Badge>}
                        {!studioData.payment && "Contact studio for details."}
                     </div>
                  </InfoItem>

                  {/* Accessibility */}
                  <InfoItem icon={Accessibility} title="Accessibility">
                     {studioData.accessibility?.wheelchairAccessible ? (
                        "Wheelchair accessible entrance and facilities."
                     ) : (
                        "Accessibility details not confirmed. Please call ahead."
                     )}
                  </InfoItem>

                  {/* Amenities - using existing data */}
                  <InfoItem icon={CheckCircle} title="Amenities">
                     <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {studioData.amenities?.airConditioning && <span>❄️ A/C</span>}
                        {studioData.amenities?.showers && <span>🚿 Showers</span>}
                        {studioData.amenities?.lockers && <span>🔒 Lockers</span>}
                        {studioData.amenities?.wifi && <span>Wi-Fi</span>}
                        {(!studioData.amenities || Object.values(studioData.amenities).every(v => !v)) && "Standard amenities."}
                     </div>
                  </InfoItem>
               </div>
            </section>

            {/* Location & Hours */}
            <section id="location-section" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif italic text-3xl text-[#2A2624]">Location & Hours</h2>
                <Button variant="link" className="text-[#3E2723]" onClick={() => studioData.address?.coordinates && window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address.coordinates.lat},${studioData.address.coordinates.lng}`, '_blank')}>
                  Open in Maps <Navigation className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="bg-[#F9F8F6] rounded-xl p-1 overflow-hidden border border-[#2A2624]/5">
                 {studioData.address?.coordinates && (
                    <div
                       className="aspect-[21/9] w-full rounded-lg overflow-hidden relative bg-[#201A18] cursor-pointer group"
                       onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${studioData.address!.coordinates!.lat},${studioData.address!.coordinates!.lng}`, '_blank')}
                    >
                       <div className="absolute inset-0" style={{
                         backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
                         backgroundSize: '28px 28px'
                       }} />
                       <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBF5]/10 via-transparent to-[#2A2624]/40" />
                       <div className="relative z-10 h-full flex items-center justify-between px-6">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center">
                                <MapPin className="w-7 h-7 text-white" />
                             </div>
                             <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-1">Coordenadas</p>
                                <p className="font-mono text-white text-lg">
                                   {formatCoordinate(studioData.address.coordinates.lat, 'lat')}, {formatCoordinate(studioData.address.coordinates.lng, 'lng')}
                                </p>
                                <p className="text-white/70 text-sm">
                                   {studioData.address.neighborhood || studioData.address.city}
                                </p>
                             </div>
                          </div>
                          <div className="hidden md:flex items-center gap-3 text-white/80 text-sm group-hover:text-white transition-colors">
                             <span>Ver en Google Maps</span>
                             <Navigation className="w-4 h-4" />
                          </div>
                       </div>
                    </div>
                 )}
                 {!studioData.address?.coordinates && (
                    <div className="aspect-[21/9] w-full rounded-lg bg-[#E8E6E2] flex flex-col items-center justify-center text-center p-6">
                       <MapPin className="w-8 h-8 text-[#3E2723] mb-3" />
                       <p className="text-[#5D5550] text-sm">Coordenadas no disponibles. Consulta la dirección para llegar.</p>
                    </div>
                 )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    <div>
                       <h4 className="font-medium text-[#2A2624] mb-2">Address</h4>
                       <p className="text-[#5D5550] font-light mb-6">
                          {studioData.address?.street}<br/>
                          {studioData.address?.neighborhood}, {studioData.address?.postalCode}<br/>
                          {studioData.address?.city}, {studioData.address?.state}
                       </p>
                       
                       {studioData.contact?.phone && (
                          <div className="flex items-center gap-3 text-[#5D5550] mb-2">
                             <Phone className="w-4 h-4" />
                             <a href={`tel:${studioData.contact.phone}`} className="hover:underline decoration-[#3E2723]">{studioData.contact.phone}</a>
                          </div>
                       )}
                       {studioData.contact?.website && (
                          <div className="flex items-center gap-3 text-[#5D5550]">
                             <Globe className="w-4 h-4" />
                             <a href={studioData.contact.website} target="_blank" rel="noopener" className="hover:underline decoration-[#3E2723]">Official Website</a>
                          </div>
                       )}
                    </div>
                    
                    <div>
                       <h4 className="font-medium text-[#2A2624] mb-2">Opening Hours</h4>
                       {studioData.hours ? (
                          <div className="space-y-2 text-sm">
                             {formatHours()?.map((day, i) => (
                                <div key={i} className="flex justify-between border-b border-[#2A2624]/5 last:border-0 pb-1 last:pb-0">
                                   <span className="text-[#5D5550]">{day.day}</span>
                                   <span className="font-medium text-[#2A2624]">{day.hours}</span>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <p className="text-[#5D5550] italic">Hours not available</p>
                       )}
                    </div>
                 </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Card (Desktop) */}
          <div className="relative hidden lg:block">
            <div className="sticky top-32 space-y-6">
               <Card className="border-[#2A2624]/10 shadow-xl shadow-[#2A2624]/5 overflow-hidden">
                  <CardContent className="p-6 space-y-6">
                     <div className="text-center pb-6 border-b border-[#2A2624]/5">
                        <p className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">Drop-in Class</p>
                        <div className="flex items-center justify-center gap-1 text-[#2A2624]">
                           <span className="text-3xl font-serif italic">
                              {studioData.pricing?.dropInClass ? `$${studioData.pricing.dropInClass}` : 'Contact'}
                           </span>
                           {studioData.pricing?.dropInClass && <span className="text-sm font-light">MXN</span>}
                        </div>
                     </div>

                     <div className="space-y-3">
                        {studioData.contact?.bookingUrl && (
                           <Button className="w-full bg-[#2A2624] hover:bg-[#3E2723] text-[#EAE8E4] h-12 text-sm tracking-widest uppercase" onClick={() => window.open(studioData.contact!.bookingUrl, '_blank')}>
                              Book Class
                           </Button>
                        )}
                        
                        {studioData.contact?.whatsapp ? (
                           <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 h-12" onClick={() => window.open(`https://wa.me/${studioData.contact!.whatsapp}`, '_blank')}>
                              <MessageCircle className="w-4 h-4 mr-2" /> Chat on WhatsApp
                           </Button>
                        ) : (
                           studioData.contact?.phone && (
                              <Button variant="outline" className="w-full border-[#2A2624]/20 text-[#2A2624] hover:bg-[#2A2624]/5 h-12" onClick={() => window.location.href = `tel:${studioData.contact!.phone}`}>
                                 <Phone className="w-4 h-4 mr-2" /> Call Studio
                              </Button>
                           )
                        )}
                     </div>

                     <div className="text-center">
                        <p className="text-[10px] text-[#5D5550]/60 uppercase tracking-widest">
                           Satisfaction Guaranteed
                        </p>
                     </div>
                  </CardContent>
               </Card>

               {/* Social Links Mini-Card */}
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

        {/* Mobile Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2A2624]/10 p-4 md:hidden z-50 flex items-center gap-3 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           <div className="flex-1">
              <p className="text-xs text-[#5D5550] uppercase tracking-wider">Class from</p>
              <p className="text-lg font-serif text-[#2A2624]">
                 {studioData.pricing?.dropInClass ? `$${studioData.pricing.dropInClass}` : 'Ask price'}
              </p>
           </div>
           <div className="flex gap-2">
              {studioData.contact?.whatsapp && (
                 <Button size="icon" className="bg-[#25D366] hover:bg-[#128C7E] rounded-full w-12 h-12 shadow-lg" onClick={() => window.open(`https://wa.me/${studioData.contact!.whatsapp}`, '_blank')}>
                    <MessageCircle className="w-5 h-5 text-white" />
                 </Button>
              )}
              <Button className="bg-[#2A2624] text-[#EAE8E4] rounded-full px-6 h-12 shadow-lg" onClick={() => {
                 if (studioData.contact?.bookingUrl) window.open(studioData.contact.bookingUrl, '_blank');
                 else if (studioData.contact?.phone) window.location.href = `tel:${studioData.contact.phone}`;
              }}>
                 {studioData.contact?.bookingUrl ? 'Book Now' : 'Call'}
              </Button>
           </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default StudioDetail;
