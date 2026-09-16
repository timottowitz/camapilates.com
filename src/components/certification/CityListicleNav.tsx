import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles } from 'lucide-react';
import { CERTIFICATION_CITIES, normalizeCitySlug } from '@/content/certification/certificationsData';

interface CityListicleNavProps {
  currentCitySlug?: string;
  className?: string;
  showAllOption?: boolean;
}

export const CityListicleNav: React.FC<CityListicleNavProps> = ({
  currentCitySlug,
  className = '',
  showAllOption = true,
}) => {
  const activeKey = currentCitySlug ? normalizeCitySlug(currentCitySlug) : '';

  return (
    <nav
      aria-label="Directorio de Sedes por Ciudad"
      className={`w-full overflow-x-auto scrollbar-none py-3 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {showAllOption && (
          <Link
            to="/certificacion-pilates#directorio"
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              !activeKey
                ? 'bg-[#2A2624] text-[#EAE8E4] shadow-md scale-105'
                : 'bg-white/60 text-[#5D5550] hover:bg-white hover:text-[#2A2624] border border-[#2A2624]/10'
            }`}
          >
            Todas las Sedes (10)
          </Link>
        )}

        {CERTIFICATION_CITIES.map((city) => {
          const isActive = activeKey === city.key;

          return (
            <Link
              key={city.key}
              to={`/certificacion-pilates/${city.key}`}
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                isActive
                  ? 'bg-[#2A2624] text-[#EAE8E4] shadow-md ring-2 ring-[#2A2624]/20 scale-105'
                  : 'bg-white/60 text-[#5D5550] hover:bg-white hover:text-[#2A2624] border border-[#2A2624]/10 hover:border-[#2A2624]/30'
              }`}
            >
              <MapPin
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? 'text-[#D9865B]' : 'text-[#5D5550]/60 group-hover:text-[#2A2624]'
                }`}
              />
              <span>{city.shortName}</span>

              {city.hasActiveCohort && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    isActive
                      ? 'bg-[#D9865B] text-white'
                      : 'bg-[#3E2723]/10 text-[#3E2723] group-hover:bg-[#3E2723] group-hover:text-white'
                  }`}
                  title="Convocatoria o Sede Oficial Abierta"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Cohorte</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default CityListicleNav;
