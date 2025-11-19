import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MapPin, Star, ArrowRight, Search, Building } from 'lucide-react';
import { hasConvex } from '@/lib/convexProvider';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

const StudiosLanding: React.FC = () => {
  // SEO metadata
  const pageTitle = 'Directorio de Estudios de Pilates en México';
  const pageDescription = 'Encuentra los mejores estudios de Pilates en México. Directorio completo con reseñas, precios y horarios en Ciudad de México, Monterrey, Guadalajara y más ciudades.';

  // Observability for Convex fetches - fall back after grace period
  const [failover, setFailover] = React.useState(false);
  React.useEffect(() => {
    if (!hasConvex) return;
    setFailover(false);
    const timer = setTimeout(() => setFailover(true), 3000);
    return () => clearTimeout(timer);
  }, [hasConvex]);

  const fallbackCities = localData.cities as any[];
  const fallbackFeatured = localData.featured
    .map((id) => (localData.studios as any[]).find((s) => s._id === id))
    .filter(Boolean) as any[];

  const remoteCities = hasConvex ? useQuery(api.cities.getPriority, { limit: 10 }) : undefined;
  const remoteFeatured = hasConvex ? useQuery(api.studios.getFeatured, { limit: 6 }) : undefined;

  const cities = React.useMemo(() => {
    if (!hasConvex) return fallbackCities;
    if (Array.isArray(remoteCities) && remoteCities.length > 0) {
      return remoteCities.map((city: any) => {
        if (Array.isArray(city.neighborhoods) && city.neighborhoods.length > 0) {
          return city;
        }
        const fallbackMatch = fallbackCities.find((fallback) => fallback.slug === city.slug);
        return fallbackMatch?.neighborhoods?.length
          ? { ...city, neighborhoods: fallbackMatch.neighborhoods }
          : { ...city, neighborhoods: [] };
      });
    }
    return failover ? fallbackCities : [];
  }, [hasConvex, remoteCities, fallbackCities, failover]);

  const featuredStudios = React.useMemo(() => {
    if (!hasConvex) return fallbackFeatured;
    if (Array.isArray(remoteFeatured) && remoteFeatured.length > 0) {
      return remoteFeatured;
    }
    return failover ? fallbackFeatured : [];
  }, [hasConvex, remoteFeatured, fallbackFeatured, failover]);

  // Statistics (calculated)
  const stats = {
    totalCities: cities.length,
    totalStudios: cities.reduce((sum: number, city: any) => sum + (city.studioCount || 0), 0),
    avgRating: 4.7,
    totalReviews: 12500,
  };

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
            '@type': 'WebPage',
            name: pageTitle,
            description: pageDescription,
            url: 'https://camadepilates.com/estudios-de-pilates',
          })}
        </script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="/images/studios-hero.webp"
            alt="Pilates Studio Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80" />
        </div>
        <div className="relative z-10">
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
            National Directory
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
            Find Your Studio
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Descubre y compara los mejores estudios de Pilates cerca de ti. Reseñas verificadas, precios transparentes y toda la información que necesitas.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/estudios-de-pilates/ciudad-de-mexico" className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
              <Search className="w-4 h-4 mr-2" /> Buscar en CDMX
            </Link>
            <a href="#cities" className="inline-flex items-center px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors">
              Ver Ciudades
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-[#2A2624]/10 py-12">
            <div>
              <div className="text-3xl font-serif italic text-[#2A2624]">{stats.totalCities}</div>
              <div className="text-xs uppercase tracking-widest text-[#5D5550] mt-1">Ciudades</div>
            </div>
            <div>
              <div className="text-3xl font-serif italic text-[#2A2624]">{stats.totalStudios}+</div>
              <div className="text-xs uppercase tracking-widest text-[#5D5550] mt-1">Estudios</div>
            </div>
            <div>
              <div className="text-3xl font-serif italic text-[#2A2624]">{stats.avgRating}</div>
              <div className="text-xs uppercase tracking-widest text-[#5D5550] mt-1">Calificación</div>
            </div>
            <div>
              <div className="text-3xl font-serif italic text-[#2A2624]">{stats.totalReviews.toLocaleString()}</div>
              <div className="text-xs uppercase tracking-widest text-[#5D5550] mt-1">Reseñas</div>
            </div>
          </div>
        </div>
      </section>

      <section id="cities" className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Browse by City</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Link
                key={city._id}
                to={`/estudios-de-pilates/${city.slug}`}
                className="group block p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-serif italic text-[#2A2624] group-hover:text-[#3E2723] transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-[#5D5550] mt-1">{city.state}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#2A2624]/5 text-[#2A2624] text-[10px] uppercase tracking-widest rounded-full">
                    {city.studioCount} estudios
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                    <MapPin className="w-4 h-4 text-[#3E2723]" />
                    <span>{city.neighborhoods.length} colonias</span>
                  </div>
                  {city.averageRating && (
                    <div className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
                      <Star className="w-4 h-4 text-[#3E2723]" />
                      <span>{city.averageRating.toFixed(1)} calificación promedio</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {city.neighborhoods.slice(0, 3).map((neighborhood) => (
                    <span key={neighborhood} className="px-2 py-1 border border-[#2A2624]/10 text-[#5D5550] text-[10px] uppercase tracking-widest rounded-sm">
                      {neighborhood}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block p-8 border border-dashed border-[#2A2624]/20 rounded-sm bg-[#2A2624]/5">
              <Building className="w-8 h-8 mx-auto mb-4 text-[#3E2723]" />
              <h3 className="text-lg font-serif italic text-[#2A2624] mb-2">More Cities Coming Soon</h3>
              <p className="text-sm text-[#5D5550] font-light mb-6">
                Estamos expandiendo nuestro directorio a más ciudades de México
              </p>
              <a href="mailto:soporte@camadepilates.com" className="text-xs uppercase tracking-widest text-[#2A2624] border-b border-[#2A2624] pb-1 hover:opacity-70 transition-opacity">
                Solicitar mi ciudad
              </a>
            </div>
          </div>
        </div>
      </section>

      {featuredStudios.length > 0 && (
        <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
          <div className="max-w-[1800px] mx-auto">
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Featured Studios</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStudios.map((studio) => (
                <Link
                  key={studio._id}
                  to={`/estudios-de-pilates/${citySlug(studio.address.city)}/${studio.slug}`}
                  className="group block p-8 border border-[#2A2624]/10 rounded-sm bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif italic text-xl text-[#2A2624] group-hover:text-[#3E2723] transition-colors line-clamp-2">
                      {studio.name}
                    </h3>
                    {studio.isVerified && (
                      <span className="w-2 h-2 rounded-full bg-[#3E2723]" title="Verificado"></span>
                    )}
                  </div>

                  <p className="text-sm text-[#5D5550] font-light mb-4">
                    {studio.address.neighborhood && `${studio.address.neighborhood}, `}
                    {studio.address.city}
                  </p>

                  <div className="flex items-center gap-2 text-sm mb-6">
                    {studio.metrics.googleRating && (
                      <>
                        <Star className="w-4 h-4 text-[#3E2723] fill-[#3E2723]" />
                        <span className="font-medium text-[#2A2624]">{studio.metrics.googleRating.toFixed(1)}</span>
                        <span className="text-[#5D5550] font-light">({studio.metrics.googleReviewCount})</span>
                      </>
                    )}
                  </div>

                  {studio.classTypes && studio.classTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {studio.classTypes.slice(0, 2).map((type) => (
                        <span key={type} className="px-2 py-1 bg-[#2A2624]/5 text-[#5D5550] text-[10px] uppercase tracking-widest rounded-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-6">Own a Pilates Studio?</h2>
          <p className="text-lg text-white/70 font-light mb-8 max-w-2xl mx-auto">
            Añade tu estudio a nuestro directorio de forma gratuita y conecta con nuevos clientes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:soporte@camadepilates.com" className="inline-flex items-center px-8 py-4 bg-[#EAE8E4] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors">
              Registrar mi Estudio
            </a>
            <a href="#" className="inline-flex items-center px-8 py-4 border border-[#EAE8E4]/20 text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4]/10 transition-colors">
              Más Información
            </a>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default StudiosLanding;
