import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import StudioList from '@/components/studios/StudioList';
import StudioFilters from '@/components/studios/StudioFilters';
import StudioSearch from '@/components/studios/StudioSearch';
import { StudioMap } from '@/components/maps/StudioMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Map, List, ArrowLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { hasConvex } from '@/lib/convexProvider';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';
import { ContextualImage } from '@/components/ContextualImage';
import LuxuryLayout from '@/components/layout/LuxuryLayout';

// City name mappings - normalize accents in slugs
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

const CityDirectory: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const cityName = city ? cityNameMap[city.toLowerCase()] || city : '';

  // Normalize city slug to ASCII (avoid diacritics in URL)
  React.useEffect(() => {
    if (!cityName) return;
    const normalized = citySlug(cityName);
    if (city && normalized && city !== normalized) {
      navigate(`/estudios-de-pilates/${normalized}` as any, { replace: true });
    }
  }, [city, cityName, navigate]);

  // Fetch data from Convex
  const convexStudios = hasConvex ? useQuery(api.studios.getByCity, { city: cityName }) : undefined;
  const convexCity = hasConvex ? useQuery(api.cities.getBySlug, { slug: city || '' }) : undefined;

  // Failover to local data if Convex is slow/unavailable
  const [failover, setFailover] = useState(false);
  useEffect(() => {
    setFailover(false);
    const t = setTimeout(() => setFailover(true), 3000);
    return () => clearTimeout(t);
  }, [cityName]);

  const fallbackStudios = (localData.studios as any[]).filter(
    (s: any) => (s.address?.city || '').toLowerCase() === (cityName || '').toLowerCase()
  );
  const fallbackCityData = (localData.cities as any[]).find((c: any) => c.slug === (city || ''));

  const remoteStudios = Array.isArray(convexStudios) ? convexStudios : undefined;
  const remoteCity = convexCity ?? null;

  const studios = hasConvex
    ? (remoteStudios && remoteStudios.length > 0
        ? remoteStudios
        : failover
          ? fallbackStudios
          : undefined)
    : fallbackStudios;

  const mergedRemoteCity = remoteCity
    ? {
        ...remoteCity,
        neighborhoods: remoteCity.neighborhoods?.length
          ? remoteCity.neighborhoods
          : fallbackCityData?.neighborhoods ?? [],
      }
    : null;

  const cityData = hasConvex
    ? (mergedRemoteCity
        ? mergedRemoteCity
        : failover
          ? fallbackCityData
          : undefined)
    : fallbackCityData;

  // Loading state
  const isLoading = studios === undefined;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewTab, setViewTab] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [filters, setFilters] = useState({
    neighborhoods: [],
    priceRange: [0, 2000] as [number, number],
    rating: 0,
    classTypes: [],
    equipment: [],
    amenities: [],
    distance: undefined as number | undefined,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Process available filter options from studios
  const availableOptions = useMemo(() => {
    const neighborhoods = new Set<string>();
    const classTypes = new Set<string>();
    const equipment = new Set<string>();
    const amenities = new Set<string>();
    let maxPrice = 2000;

    if (!studios) return {
      neighborhoods: [],
      classTypes: [],
      equipment: [],
      amenities: [],
      maxPrice,
    };

    studios.forEach(studio => {
      if (studio.address.neighborhood) neighborhoods.add(studio.address.neighborhood);
      studio.classTypes?.forEach(type => classTypes.add(type));
      studio.equipment?.forEach(item => equipment.add(item));
      studio.amenities?.forEach(amenity => amenities.add(amenity));
      if (studio.pricing?.singleClassMax) {
        maxPrice = Math.max(maxPrice, studio.pricing.singleClassMax);
      }
    });

    return {
      neighborhoods: Array.from(neighborhoods).sort(),
      classTypes: Array.from(classTypes).sort(),
      equipment: Array.from(equipment).sort(),
      amenities: Array.from(amenities).sort(),
      maxPrice,
    };
  }, [studios]);

  // Filter studios
  const filteredStudios = useMemo(() => {
    if (!studios) return [];

    // Deduplicate studios by ID/slug to prevent duplicate rendering
    const uniqueStudios = Array.from(
      new Map(
        studios.map(studio => [
          studio._id || studio.id || studio.slug,
          studio
        ])
      ).values()
    );

    let result = [...uniqueStudios];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(studio =>
        studio.name.toLowerCase().includes(term) ||
        studio.address.neighborhood?.toLowerCase().includes(term) ||
        studio.classTypes?.some(type => type.toLowerCase().includes(term))
      );
    }

    // Neighborhood filter
    if (filters.neighborhoods.length > 0) {
      result = result.filter(studio =>
        studio.address.neighborhood &&
        filters.neighborhoods.includes(studio.address.neighborhood)
      );
    }

    // Price filter
    result = result.filter(studio => {
      if (!studio.pricing?.singleClassMin) return true;
      return (
        studio.pricing.singleClassMin >= filters.priceRange[0] &&
        studio.pricing.singleClassMin <= filters.priceRange[1]
      );
    });

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter(studio =>
        ((studio.metrics?.googleRating || 0) as number) >= filters.rating
      );
    }

    // Class types filter
    if (filters.classTypes.length > 0) {
      result = result.filter(studio =>
        studio.classTypes?.some(type => filters.classTypes.includes(type))
      );
    }

    // Equipment filter
    if (filters.equipment.length > 0) {
      result = result.filter(studio =>
        studio.equipment?.some(item => filters.equipment.includes(item))
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter(studio =>
        studio.amenities?.some(amenity => filters.amenities.includes(amenity))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.metrics?.googleRating || 0) - (a.metrics?.googleRating || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.metrics?.googleReviewCount || 0) - (a.metrics?.googleReviewCount || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.pricing?.singleClassMin || 9999) - (b.pricing?.singleClassMin || 9999));
        break;
      case 'price-high':
        result.sort((a, b) => (b.pricing?.singleClassMin || 0) - (a.pricing?.singleClassMin || 0));
        break;
      case 'quality':
        result.sort((a, b) => b.dataQualityScore - a.dataQualityScore);
        break;
      default:
        break;
    }

    return result;
  }, [studios, searchTerm, filters, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.neighborhoods.length > 0) count += filters.neighborhoods.length;
    if (filters.classTypes.length > 0) count += filters.classTypes.length;
    if (filters.equipment.length > 0) count += filters.equipment.length;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.rating > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < availableOptions.maxPrice) count++;
    return count;
  }, [filters, availableOptions.maxPrice]);

  const resetFilters = () => {
    setFilters({
      neighborhoods: [],
      priceRange: [0, availableOptions.maxPrice],
      rating: 0,
      classTypes: [],
      equipment: [],
      amenities: [],
      distance: undefined,
    });
  };

  // SEO metadata
  const pageTitle = `Estudios de Pilates en ${cityName} - ${filteredStudios.length} Opciones`;
  const pageDescription = `Encuentra los mejores estudios de Pilates en ${cityName}. Compara ${filteredStudios.length} estudios con reseñas, precios y ubicaciones. Clases de reformer, mat y más.`;
  const citySlugNormalized = citySlug(cityName);

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
            '@type': 'CollectionPage',
            name: pageTitle,
            description: pageDescription,
            url: `https://camadepilates.com/estudios-de-pilates/${citySlugNormalized}`,
            numberOfItems: filteredStudios.length,
          })}
        </script>
      </Helmet>

      <section className="relative pt-32 pb-12 px-8 md:px-24 max-w-[1800px] mx-auto">
        {/* Atmospheric background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#3E2723]/5 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-gradient-to-tr from-[#D9865B]/5 to-transparent rounded-full blur-3xl -z-10" />

        <button onClick={() => navigate('/estudios-de-pilates')} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-12 transition-all hover:gap-3 group">
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          <span>Directorio</span>
        </button>

        <div className="text-center mb-16 relative">
          {/* Asymmetric decorative element */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#3E2723] to-transparent" />

          <span className="inline-block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 px-4 py-1.5 bg-[#EAE8E4]/50 rounded-full">
            Guía de la Ciudad
          </span>

          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8 tracking-tight">
            {cityName}
          </h1>

          <p className="text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed mb-6">
            Encuentra el estudio perfecto para tu práctica de Pilates.
          </p>

          {cityData && (
            <div className="flex items-center justify-center gap-8 text-sm text-[#5D5550]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#3E2723] rounded-full" />
                <span className="font-medium">{cityData.studioCount ?? 0} estudios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D9865B] rounded-full" />
                <span className="font-medium">{cityData.neighborhoods?.length ?? 0} colonias</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <StudioSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Buscar en ${cityName}...`}
            suggestions={[
              'Pilates reformer',
              'Pilates mat',
              'Clases grupales',
              'Clases privadas',
              ...availableOptions.neighborhoods.slice(0, 3),
            ]}
          />
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <StudioFilters
              filters={filters}
              onChange={setFilters}
              availableOptions={availableOptions}
              activeCount={activeFilterCount}
              onReset={resetFilters}
            />
          </div>

          {/* Studios List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#2A2624]/10 relative">
              {/* Decorative accent */}
              <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-[#3E2723] to-transparent" />

              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-serif italic text-[#2A2624] tracking-tight">
                  <span className="font-bold">{filteredStudios.length}</span> {filteredStudios.length === 1 ? 'Estudio' : 'Estudios'}
                </h2>

                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <StudioFilters
                        filters={filters}
                        onChange={setFilters}
                        availableOptions={availableOptions}
                        activeCount={activeFilterCount}
                        onReset={resetFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#5D5550] hidden sm:inline uppercase tracking-widest">Ordenar:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-[#2A2624]/20 bg-white hover:bg-[#EAE8E4]/30 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">⭐ Mejor calificación</SelectItem>
                    <SelectItem value="reviews">💬 Más reseñas</SelectItem>
                    <SelectItem value="price-low">💰 Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-high">💎 Precio: mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.neighborhoods.map(n => (
                  <Badge key={n} variant="secondary" className="bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10">
                    {n}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        neighborhoods: filters.neighborhoods.filter(x => x !== n)
                      })}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10">
                    {filters.rating}+ ⭐
                    <button
                      onClick={() => setFilters({ ...filters, rating: 0 })}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* View Tabs */}
            <Tabs value={viewTab} onValueChange={(value: any) => setViewTab(value)} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-12 bg-gradient-to-r from-[#2A2624]/5 to-[#3E2723]/5 p-1 rounded-lg">
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#3E2723]/10 rounded-md transition-all duration-300 font-sans"
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#3E2723]/10 rounded-md transition-all duration-300 font-sans"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Mapa
                </TabsTrigger>
              </TabsList>

              {/* Only render active tab content to prevent duplication */}
              {viewTab === 'list' && (
                <div className="mt-0">
                  <StudioList
                    studios={filteredStudios}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    loading={isLoading}
                  />
                </div>
              )}

              {viewTab === 'map' && (
                <div className="mt-0">
                  <StudioMap
                    studios={filteredStudios}
                    center={
                      cityName === 'Ciudad de México'
                        ? { lat: 19.4326, lng: -99.1332 }
                        : cityName === 'Guadalajara'
                          ? { lat: 20.6597, lng: -103.3496 }
                          : cityName === 'Monterrey'
                            ? { lat: 25.6866, lng: -100.3161 }
                            : { lat: 19.4326, lng: -99.1332 }
                    }
                    height="700px"
                    showControls={true}
                    enableGeolocation={true}
                    enableClustering={true}
                    enableHeatmap={true}
                    enableStreetView={true}
                    onStudioClick={(studio) => {
                      navigate(`/estudios-de-pilates/${citySlugNormalized}/${studio.slug}`);
                    }}
                  />
                </div>
              )}
            </Tabs>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CityDirectory;
