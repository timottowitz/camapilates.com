import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, MapPin, Users, ChevronRight, User } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { hasConvex } from '@/lib/convexProvider';
import { getTeacherCities } from '@/data/teachers';

const TeachersLanding: React.FC = () => {
  const pageTitle = 'Instructores de Pilates Certificados en México';
  const pageDescription = 'Encuentra los mejores instructores de Pilates en México. Perfiles verificados, certificaciones internacionales y especialidades en Reformer, Mat, Prenatal y más.';

  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  const cityCounts = useQuery(api.teachers.getCityCounts, hasConvex ? { limit: 50 } : 'skip');

  // Merge Convex and seed data - use the higher count for each city
  const cities = React.useMemo(() => {
    const seedCities = getTeacherCities();

    // If no Convex data, just use seed data
    if (!cityCounts || cityCounts.length === 0) {
      return seedCities.sort((a, b) => (b.teacherCount || 0) - (a.teacherCount || 0));
    }

    // Build a map of Convex counts by slug
    const convexCounts = new Map(
      cityCounts.map((c) => [c.citySlug, { name: c.cityName, count: c.teacherCount }])
    );

    // Merge: use seed cities as base, overlay Convex data where higher
    const merged = seedCities.map((seedCity) => {
      const convexData = convexCounts.get(seedCity.slug);
      // Use the higher count between seed and Convex
      const teacherCount = Math.max(seedCity.teacherCount || 0, convexData?.count || 0);
      return {
        ...seedCity,
        name: convexData?.name || seedCity.name,
        teacherCount,
      };
    });

    // Add any Convex-only cities not in seed data
    for (const [slug, data] of convexCounts) {
      if (!seedCities.find((c) => c.slug === slug)) {
        merged.push({
          _id: `city_${slug}`,
          slug,
          name: data.name,
          teacherCount: data.count,
        });
      }
    }

    return merged.sort((a, b) => (b.teacherCount || 0) - (a.teacherCount || 0));
  }, [cityCounts]);

  const totalInstructors = cities.reduce((sum, c) => sum + (c.teacherCount || 0), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && cities.length > 0) {
      navigate(`/instructores-pilates/${cities[0].slug}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      {/* Hero - Clean & Simple */}
      <section className="pt-32 pb-16 px-8 md:px-24 max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-4">
            Instructores de Pilates
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-xl mx-auto">
            Encuentra instructores certificados en tu ciudad
          </p>
        </div>
      </section>

      {/* Cities Grid - Primary Content */}
      <section className="pb-20 px-8 md:px-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Link
                key={city._id}
                to={`/instructores-pilates/${city.slug}`}
                className="group relative bg-white border border-[#2A2624]/10 rounded-2xl p-8 hover:border-[#2A2624]/30 hover:shadow-xl hover:shadow-[#2A2624]/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#EAE8E4] flex items-center justify-center mb-4 group-hover:bg-[#2A2624] transition-colors">
                      <MapPin className="w-5 h-5 text-[#2A2624] group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="text-2xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723]">
                      {city.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[#5D5550]">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {city.teacherCount || 0} {(city.teacherCount || 0) === 1 ? 'instructor' : 'instructores'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#2A2624]/30 group-hover:text-[#2A2624] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* Total count */}
          {totalInstructors > 0 && (
            <div className="text-center mt-12 pt-8 border-t border-[#2A2624]/10">
              <p className="text-sm text-[#5D5550]">
                <span className="font-medium text-[#2A2624]">{totalInstructors}</span> instructores verificados en México
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Search Section - Secondary */}
      <section className="py-16 px-8 md:px-24 bg-[#EAE8E4]/30 border-y border-[#2A2624]/5">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-xl font-serif italic text-[#2A2624] mb-4">
            ¿Buscas un instructor específico?
          </h3>
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 text-[#2A2624]/40">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              className="w-full h-12 pl-12 pr-28 rounded-full border border-[#2A2624]/20 bg-white focus:border-[#2A2624]/40 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 rounded-full px-5 bg-[#2A2624] hover:bg-[#3E2723] text-white text-xs uppercase tracking-wider"
            >
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* CTA for Instructors */}
      <section className="py-20 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <User className="w-72 h-72" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-4">¿Eres Instructor de Pilates?</h2>
          <p className="text-base text-white/70 font-light mb-8 max-w-xl mx-auto">
            Reclama tu perfil profesional y conecta con alumnos en tu ciudad.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="h-11 px-8 bg-[#EAE8E4] text-[#2A2624] hover:bg-white text-xs uppercase tracking-[0.15em] rounded-full">
              Crear mi Perfil
            </Button>
            <Button variant="outline" className="h-11 px-8 border-[#EAE8E4]/20 text-[#EAE8E4] hover:bg-[#EAE8E4]/10 text-xs uppercase tracking-[0.15em] rounded-full bg-transparent">
              Saber más
            </Button>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default TeachersLanding;
