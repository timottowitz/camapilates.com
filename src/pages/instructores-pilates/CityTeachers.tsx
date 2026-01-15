import React, { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Filter, Search, ChevronRight } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import TeacherCard from '@/components/teachers/TeacherCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { hasConvex } from '@/lib/convexProvider';
import { getTeacherCities, getTeachersByCitySlug } from '@/data/teachers';
import { normalizeTeacherSlugForUrl } from '@/lib/teacherSlug';

// Whitelist of valid Pilates-related specializations
const VALID_PILATES_SPECIALIZATIONS = new Set([
  // Core Pilates methods
  'Pilates', 'Mat Pilates', 'Reformer', 'Reformer Pilates', 'Classical Pilates',
  'Authentic Pilates', 'Contemporary Pilates', 'Clinical Pilates', 'STOTT Pilates',
  'Polestar Pilates', 'BASI Pilates', 'Peak Pilates', 'Balanced Body',
  // Pilates equipment
  'Cadillac', 'Chair', 'Wunda Chair', 'Tower', 'Barrel', 'Spine Corrector',
  'Ladder Barrel', 'Arc Barrel', 'Trapeze Table', 'Ball', 'Ball Pilates',
  'Magic Circle', 'Pilates Ring', 'Foam Roller', 'Small Props',
  // Population specializations
  'Prenatal', 'Prenatal Pilates', 'Postnatal', 'Postnatal Pilates',
  'Embarazo', 'Postparto', 'Seniors', 'Adultos mayores', 'Older adults',
  'Kids', 'Niños', 'Men', 'Hombres', 'Athletes', 'Deportistas',
  // Therapeutic/clinical focus
  'Rehabilitation', 'Rehabilitación', 'Rehab', 'Physical Therapy', 'Fisioterapia',
  'Back Pain', 'Dolor de espalda', 'Scoliosis', 'Escoliosis', 'Injury Recovery',
  'Post-surgery', 'Postoperatorio', 'Pelvic Floor', 'Suelo pélvico', 'Core Stability',
  'Posture', 'Postura', 'Alignment', 'Alineación', 'Corrective Exercise',
  // Movement complementary to Pilates
  'Barre', 'Barré', 'Ballet', 'Dance', 'Danza', 'Gyrotonic', 'Gyrokinesis',
  'Yoga', 'Stretch', 'Stretching', 'Flexibility', 'Flexibilidad',
  'Conditioning', 'Physical Conditioning', 'Physical conditioning',
  'Functional Movement', 'Movimiento Funcional', 'Sports Science',
  // Training levels
  'Beginner', 'Principiante', 'Intermediate', 'Intermedio', 'Advanced', 'Avanzado',
  'Group Classes', 'Clases Grupales', 'Private Sessions', 'Sesiones Privadas',
  'Teacher Training', 'Formación de Instructores',
]);

// Normalize specialty for matching (case-insensitive)
const isValidPilatesSpecialization = (spec: string): boolean => {
  const normalized = spec.trim();
  // Check exact match first
  if (VALID_PILATES_SPECIALIZATIONS.has(normalized)) return true;
  // Check case-insensitive match
  const lowerSpec = normalized.toLowerCase();
  for (const valid of VALID_PILATES_SPECIALIZATIONS) {
    if (valid.toLowerCase() === lowerSpec) return true;
  }
  // Check if contains "pilates" in name
  if (lowerSpec.includes('pilates')) return true;
  return false;
};

interface Teacher {
  _id: string;
  slug: string;
  fullName: { value: string };
  citySlug: string;
  cityName: { value: string };
  bio?: { value: string };
  specializations: { value: string[] };
  isVerified: boolean;
  profilePhoto?: { value: { url?: string; storageId: string; source: string } };
  studios?: any[];
  social?: any;
}

const CityTeachers: React.FC = () => {
  const { city: citySlug } = useParams<{ city: string }>();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  React.useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const queryArgs = hasConvex && citySlug ? { citySlug: citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug } : 'skip';
  const teachersQuery = useQuery(
    api.teachers.getByCity,
    queryArgs
  ) as Teacher[] | undefined;

  // Loading state: Convex query is enabled but hasn't returned yet
  const isConvexLoading = hasConvex && queryArgs !== 'skip' && teachersQuery === undefined;

  const teachers = React.useMemo(() => {
    if (!citySlug) return [];
    const normalizedCitySlug = citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug;

    const seeds = getTeachersByCitySlug(normalizedCitySlug) as unknown as Teacher[];
    const live = Array.isArray(teachersQuery) ? teachersQuery : [];

    const byCanonicalSlug = new Map<string, Teacher>();
    const canonical = (t: Teacher) => normalizeTeacherSlugForUrl(t.slug, t.citySlug);

    // Prefer live data when available.
    for (const t of live) byCanonicalSlug.set(canonical(t), t);
    for (const t of seeds) {
      const key = canonical(t);
      if (!byCanonicalSlug.has(key)) byCanonicalSlug.set(key, t);
    }

    const merged = Array.from(byCanonicalSlug.values());
    merged.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      const aIsSeed = String(a._id || '').startsWith('teacher_');
      const bIsSeed = String(b._id || '').startsWith('teacher_');
      if (aIsSeed !== bIsSeed) return aIsSeed ? 1 : -1;
      return a.fullName.value.localeCompare(b.fullName.value, 'es');
    });
    return merged;
  }, [citySlug, teachersQuery]);

  const city = React.useMemo(() => {
    if (!citySlug) return null;
    const normalizedCitySlug = citySlug === 'cdmx' ? 'ciudad-de-mexico' : citySlug;
    if (teachers.length > 0) {
      return { _id: normalizedCitySlug, slug: normalizedCitySlug, name: teachers[0].cityName.value };
    }
    return getTeacherCities().find((c) => c.slug === normalizedCitySlug) || null;
  }, [citySlug, teachers]);

  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    teachers.forEach(t => t.specializations?.value?.forEach(s => {
      if (isValidPilatesSpecialization(s)) {
        specs.add(s);
      }
    }));
    return Array.from(specs).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (searchTerm && !t.fullName.value.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !t.specializations.value.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      if (selectedSpecs.length > 0 && !selectedSpecs.some(s => t.specializations.value.includes(s))) {
        return false;
      }
      return true;
    });
  }, [teachers, searchTerm, selectedSpecs]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const pageTitle = city ? `Instructores de Pilates en ${city.name}` : 'Instructores de Pilates';
  const pageDescription = city
    ? `Encuentra instructores de Pilates en ${city.name}. Perfiles, especialidades y enlaces de contacto.`
    : 'Directorio de instructores de Pilates en México.';

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="bg-[#EAE8E4]/50 border-b border-[#2A2624]/10 pt-24 pb-12 px-8 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] mb-4">
            <Link to="/" className="hover:text-[#2A2624]">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/instructores-pilates" className="hover:text-[#2A2624]">Instructores</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#2A2624] font-medium">{city?.name || citySlug}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif italic text-[#2A2624] mb-4">
            {city?.name ? `Instructores en ${city.name}` : 'Instructores de Pilates'}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
             <p className="text-[#5D5550] font-light text-lg">
               {isConvexLoading && teachers.length === 0 ? (
                 <span className="animate-pulse">Cargando profesionales...</span>
               ) : (
                 `${teachers.length} profesionales certificados encontrados`
               )}
             </p>
             
             <div className="md:hidden">
               <Sheet open={showFilters} onOpenChange={setShowFilters}>
                 <SheetTrigger asChild>
                   <Button variant="outline" className="gap-2 border-[#2A2624]">
                     <Filter className="w-4 h-4" /> Filtros
                   </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="w-[300px] flex flex-col h-full">
                   <SheetHeader>
                     <SheetTitle className="font-serif italic">Filtrar Instructores</SheetTitle>
                   </SheetHeader>
                   <div className="py-6 space-y-6 flex-1 overflow-y-auto">
                     <div className="relative">
                       <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5D5550]" />
                       <Input
                         placeholder="Buscar por nombre..."
                         className="pl-9 bg-white border-[#2A2624]/10"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                       />
                     </div>
                     <div>
                       <h3 className="text-sm font-medium mb-3 uppercase tracking-wider">Especialidad</h3>
                       <div className="space-y-2">
                         {allSpecializations.map(spec => (
                           <div key={spec} className="flex items-center space-x-2">
                             <Checkbox
                               id={`mobile-spec-${spec}`}
                               checked={selectedSpecs.includes(spec)}
                               onCheckedChange={() => toggleSpec(spec)}
                             />
                             <label
                               htmlFor={`mobile-spec-${spec}`}
                               className="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                             >
                               {spec}
                             </label>
                           </div>
                         ))}
                       </div>
                     </div>
                     {(searchTerm || selectedSpecs.length > 0) && (
                       <Button
                         variant="ghost"
                         className="w-full text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624]"
                         onClick={() => {
                           setSearchTerm('');
                           setSelectedSpecs([]);
                         }}
                       >
                         Limpiar Filtros
                       </Button>
                     )}
                   </div>
                 </SheetContent>
               </Sheet>
             </div>
          </div>
        </div>
      </div>

      <div className="px-8 md:px-24 py-12 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 sticky top-24 h-fit">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5D5550]" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9 bg-white border-[#2A2624]/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4 uppercase tracking-wider text-[#2A2624] border-b border-[#2A2624]/10 pb-2">
                Especialidad
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {allSpecializations.map(spec => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`spec-${spec}`} 
                      checked={selectedSpecs.includes(spec)}
                      onCheckedChange={() => toggleSpec(spec)}
                      className="border-[#2A2624]/30 data-[state=checked]:bg-[#2A2624] data-[state=checked]:text-white"
                    />
                    <label 
                      htmlFor={`spec-${spec}`}
                      className="text-sm text-[#5D5550] font-light leading-none cursor-pointer hover:text-[#2A2624]"
                    >
                      {spec}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {(searchTerm || selectedSpecs.length > 0) && (
              <Button 
                variant="ghost" 
                className="w-full text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624]"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecs([]);
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </aside>

          <div className="flex-grow">
            {filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredTeachers.map(teacher => (
                  <div key={teacher._id} className="h-[420px]">
                    <TeacherCard teacher={teacher} />
                  </div>
                ))}
              </div>
            ) : isConvexLoading && teachers.length === 0 ? (
              <div className="text-center py-24 bg-[#F9F9F9] rounded-lg border border-dashed border-[#2A2624]/10">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-[#2A2624]/10 rounded-full mx-auto mb-4" />
                  <p className="text-[#5D5550] text-lg font-light">Cargando instructores...</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-[#F9F9F9] rounded-lg border border-dashed border-[#2A2624]/10">
                <p className="text-[#5D5550] text-lg font-light mb-4">No se encontraron instructores con estos filtros.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecs([]);
                  }}
                  className="border-[#2A2624]/20"
                >
                  Ver todos los instructores
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default CityTeachers;
