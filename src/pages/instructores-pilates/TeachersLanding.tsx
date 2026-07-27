import React, { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { requireRouteMeta } from '@/lib/routeMeta';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, MapPin, Users, ChevronRight, User } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { hasConvex } from '@/lib/convexProvider';
import { getTeacherCities, getTeachersByCitySlug } from '@/data/teachers';
import BackLink from '@/components/ui/back-link';
import { motion, AnimatePresence } from 'framer-motion';

// Prefetch city data on hover
const prefetchedCities = new Set<string>();
const prefetchCity = (citySlug: string) => {
  if (prefetchedCities.has(citySlug)) return;
  prefetchedCities.add(citySlug);
  // Trigger the import of seed data (already loaded, but ensures it's ready)
  const normalizedSlug = citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug;
  getTeachersByCitySlug(normalizedSlug);
};

const TeachersLanding: React.FC = () => {
  const { title: pageTitle, description: pageDescription } = requireRouteMeta('/instructores-pilates');

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cityCounts = useQuery(api.teachers.getCityCounts, hasConvex ? { limit: 50 } : 'skip');

  // Merge Convex and seed data - use the higher count for each city
  const cities = useMemo(() => {
    const seedCities = getTeacherCities();

    // If no Convex data, just use seed data
    if (!cityCounts || cityCounts.length === 0) {
      return seedCities.sort((a, b) => (b.teacherCount || 0) - (a.teacherCount || 0));
    }

    // Build a map of Convex counts by slug. Annotated because the query is typed as
    // unknown without a generated return type, which left every read off it untyped.
    const convexCounts = new Map<string, { name: string; count: number }>(
      (cityCounts as Array<{ citySlug: string; cityName: string; teacherCount: number }>)
        .map((c) => [c.citySlug, { name: c.cityName, count: c.teacherCount }])
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 50,
        damping: 20
      }
    },
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div className="relative min-h-screen bg-[#E6E3DE] text-[#2A2624]">

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-24 max-w-[1400px] mx-auto overflow-hidden">
          {/* Subtle Background Mesh for Depth */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl">
            <div className="h-full w-full bg-gradient-to-r from-[#e0dcd9] via-[#dcd8d4] to-[#e0dcd9] rounded-full animate-pulse duration-[5000ms]" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <BackLink className="mb-12 self-center opacity-60 hover:opacity-100 transition-opacity" fallbackTo="/" label="Volver" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="max-w-4xl font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.9] text-[#2A2624] tracking-tighter mb-8">
                <span className="block text-[#2A2624] italic">Pilates Instructors<span className="text-[#EB4C42]">.</span></span>
                <span className="block font-sans text-lg md:text-xl font-light tracking-widest uppercase mt-6 text-[#5D5550]">
                  Find Certified Professionals
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-xl text-base md:text-lg text-[#5D5550] font-light leading-relaxed mb-12"
            >
              Access the largest directory of verified Pilates instructors in Mexico.
              Search by city, specialty, and availability.
            </motion.p>

            {/* Elegant Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-full max-w-lg"
            >
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-[#2A2624]/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/40 backdrop-blur-md border border-[#2A2624]/10 rounded-full shadow-sm group-hover:shadow-md group-hover:border-[#2A2624]/20 transition-all duration-300">
                  <div className="pl-6 text-[#2A2624]/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search instructors by name or specialty..."
                    className="w-full h-14 bg-transparent border-none focus:ring-0 placeholder:text-[#5D5550]/50 text-[#2A2624]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="pr-1.5 py-1.5">
                    <Button
                      type="submit"
                      className="h-11 rounded-full px-6 bg-[#2A2624] hover:bg-[#3E2723] text-[#EAE8E4] text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg transition-transform active:scale-95"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="pb-24 px-4 md:px-12 lg:px-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-[1400px] mx-auto"
          >
            {cities.map((city) => (
              <motion.div key={city._id} variants={itemVariants}>
                <Link
                  to={`/instructores-pilates/${city.slug}`}
                  className="group relative block bg-[#F5F4F0] rounded-[1.5rem] p-6 md:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:bg-white border border-transparent hover:border-[#2A2624]/5"
                  onMouseEnter={() => prefetchCity(city.slug)}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-full bg-[#EAE8E4] group-hover:bg-[#2A2624] text-[#2A2624] group-hover:text-[#EAE8E4] flex items-center justify-center transition-colors duration-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-[#2A2624]/10 text-[#2A2624]/40 group-hover:border-[#2A2624] group-hover:text-[#2A2624] transition-all duration-500">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div>
                    <h2 className="text-3xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">{city.name}</h2>
                    <div className="flex items-center gap-2 text-[#5D5550]">
                      <span className="flex items-center justify-center bg-[#2A2624]/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {city.teacherCount || 0} PROS
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Divider */}
          {totalInstructors > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-20 pt-12 border-t border-[#2A2624]/10 text-center max-w-lg mx-auto"
            >
              <p className="font-serif italic text-2xl text-[#2A2624] mb-2">{totalInstructors}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#5D5550]">Verified Instructors in Mexico</p>
            </motion.div>
          )}
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-24 bg-[#2A2624] text-[#EAE8E4] relative overflow-hidden">
          {/* Abstract Background Element */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <User className="w-[500px] h-[500px] rotate-12" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif italic mb-6">Are you a Pilates Instructor?</h2>
              <p className="text-lg md:text-xl text-white/70 font-light mb-12 max-w-xl mx-auto leading-relaxed">
                Join the network. Create your professional profile, showcase your certifications, and connect with students in your area.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <Button className="h-14 px-10 bg-[#EAE8E4] text-[#2A2624] hover:bg-white text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Create Profile
                </Button>
                <Button variant="outline" className="h-14 px-10 border-white/20 text-[#EAE8E4] hover:bg-white/10 text-xs font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm transition-all duration-300">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </LuxuryLayout>
  );
};

export default TeachersLanding;
