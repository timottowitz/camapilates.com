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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MapPin, Filter, X, Map, List } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { hasConvex } from '@/lib/convexProvider';
import localData from '@/data/studios.json';
import { citySlug } from '@/utils/slug';
import { citySlug } from '@/utils/slug';

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

  // Fetch data from Convex or local fallback dataset
  const studios = hasConvex
    ? useQuery(api.studios.getByCity, { city: cityName })
    : (localData.studios as any[]).filter((s: any) => (s.address?.city || '').toLowerCase() === (cityName || '').toLowerCase());
  const cityData = hasConvex
    ? useQuery(api.cities.getBySlug, { slug: city || '' })
    : (localData.cities as any[]).find((c: any) => c.slug === (city || ''));

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
    let result = [...studios];

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
        (studio.metrics.googleRating || 0) >= filters.rating
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
        result.sort((a, b) => (b.metrics.googleRating || 0) - (a.metrics.googleRating || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.metrics.googleReviewCount || 0) - (a.metrics.googleReviewCount || 0));
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
    <>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/estudios-de-pilates">
                    Estudios de Pilates
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{cityName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-50 to-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Estudios de Pilates en {cityName}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encuentra el estudio perfecto para tu práctica de Pilates.
                {cityData && ` ${cityData.studioCount} estudios disponibles en ${cityData.neighborhoods.length} colonias.`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {filteredStudios.length} estudios encontrados
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:inline">Ordenar por:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Mejor calificación</SelectItem>
                      <SelectItem value="reviews">Más reseñas</SelectItem>
                      <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                      <SelectItem value="quality">Calidad de datos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.neighborhoods.map(n => (
                    <Badge key={n} variant="secondary">
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
                    <Badge variant="secondary">
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
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Mapa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  {/* Studios Grid */}
                  <StudioList
                    studios={filteredStudios}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    loading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  {/* Studios Map */}
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
                </TabsContent>
              </Tabs>

              {/* Load More / Pagination would go here */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CityDirectory;
