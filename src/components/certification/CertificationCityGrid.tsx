import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, Award } from 'lucide-react';
import {
  CERTIFICATION_CITIES,
  CERTIFICATION_PARTNERS,
  CertificationCity,
} from '@/content/certification/certificationsData';

interface CertificationCityGridProps {
  filterQuery?: string;
  className?: string;
}

export const CertificationCityGrid: React.FC<CertificationCityGridProps> = ({
  filterQuery = '',
  className = '',
}) => {
  const query = filterQuery.toLowerCase().trim();

  // Filter cities by query matching city name, state, or partners in that city
  const filteredCities = React.useMemo(() => {
    if (!query) return CERTIFICATION_CITIES;

    return CERTIFICATION_CITIES.filter((city) => {
      const cityMatches =
        city.name.toLowerCase().includes(query) ||
        city.shortName.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query) ||
        city.tagline.toLowerCase().includes(query);

      if (cityMatches) return true;

      // Check if any partner in this city matches
      const partnersInCity = CERTIFICATION_PARTNERS.filter(
        (p) => p.citySlug === city.key
      );
      return partnersInCity.some(
        (p) =>
          p.partnerName.toLowerCase().includes(query) ||
          p.leadPerson.toLowerCase().includes(query) ||
          p.certificationsOffered.toLowerCase().includes(query) ||
          p.aboutCredentials.toLowerCase().includes(query)
      );
    });
  }, [query]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${className}`}>
      {filteredCities.map((city) => {
        const partnersInCity = CERTIFICATION_PARTNERS.filter(
          (p) => p.citySlug === city.key
        );

        // Extract key badges across partners in this city
        const cityBadges = Array.from(
          new Set(
            partnersInCity
              .flatMap((p) => p.featuredBadges || [])
              .slice(0, 3)
          )
        );

        return (
          <Link
            key={city.key}
            to={`/certificacion-pilates/${city.key}`}
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#2A2624]/10 shadow-sm hover:shadow-2xl hover:border-[#2A2624]/20 transition-all duration-500 hover:-translate-y-1"
          >
            {/* Landmark Image Container */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAE8E4]">
              <img
                src={city.landmarkImage}
                alt={`${city.name} - ${city.landmarkTitle}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2624]/80 via-[#2A2624]/20 to-transparent" />

              {/* Landmark Name Badge */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-xs font-mono font-medium tracking-wide drop-shadow-sm flex items-center gap-1.5 opacity-90">
                  <MapPin className="w-3.5 h-3.5 text-[#D9865B]" />
                  {city.landmarkTitle}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold border border-white/20">
                  {partnersInCity.length} {partnersInCity.length === 1 ? 'Sede' : 'Sedes'}
                </span>
              </div>

              {/* Active Cohort Tag */}
              {city.hasActiveCohort && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2A2624]/90 text-[#EAE8E4] backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-[#D9865B]/40 shadow-lg">
                    <Sparkles className="w-3 h-3 text-[#D9865B]" />
                    <span>{city.cohortLabel || 'Convocatoria Abierta'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-2xl font-serif italic text-[#2A2624] group-hover:text-[#3E2723] transition-colors">
                    {city.name}
                  </h3>
                </div>

                <p className="text-xs text-[#3E2723] font-medium uppercase tracking-wider mb-3">
                  {city.tagline}
                </p>

                <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-4 line-clamp-2">
                  {city.description}
                </p>

                {/* Key Certification Lineages in this City */}
                {cityBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cityBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#F5F4F0] border border-[#2A2624]/5 text-[#2A2624] text-[10px] font-mono"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Link */}
              <div className="pt-4 border-t border-[#2A2624]/10 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#2A2624] group-hover:text-[#3E2723]">
                <span>Ver Sedes y Formación</span>
                <span className="w-8 h-8 rounded-full bg-[#F5F4F0] group-hover:bg-[#2A2624] text-[#2A2624] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CertificationCityGrid;
