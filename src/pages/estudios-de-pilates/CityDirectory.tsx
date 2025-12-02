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
import { Filter, X, Map as MapIcon, List, ArrowLeft } from 'lucide-react';
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

  // Fetch data from Convex - always call hooks, use "skip" pattern with undefined args
  const convexStudios = useQuery(api.studios.getByCity, hasConvex && cityName ? { city: cityName } : 'skip');
  const convexCity = useQuery(api.cities.getBySlug, hasConvex && city ? { slug: city } : 'skip');

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
      classTypes: [],\n      equipment: [],
      amenities: [],
      maxPrice,
    };\n\n    studios.forEach(studio => {\n      if (studio.address.neighborhood) neighborhoods.add(studio.address.neighborhood);\n      studio.classTypes?.forEach(type => classTypes.add(type));\n      studio.equipment?.forEach(item => equipment.add(item));\n      studio.amenities?.forEach(amenity => amenities.add(amenity));\n      if (studio.pricing?.singleClassMax) {\n        maxPrice = Math.max(maxPrice, studio.pricing.singleClassMax);\n      }\n    });\n\n    return {\n      neighborhoods: Array.from(neighborhoods).sort(),\n      classTypes: Array.from(classTypes).sort(),\n      equipment: Array.from(equipment).sort(),\n      amenities: Array.from(amenities).sort(),\n      maxPrice,\n    };\n  }, [studios]);\n\n  // Filter studios\n  const filteredStudios = useMemo(() => {\n    if (!studios) return [];\n\n    // Deduplicate studios by ID/slug to prevent duplicate rendering\n    const uniqueStudios = Array.from(\n      new Map(\n        studios.map(studio => [\n          studio._id || studio.id || studio.slug,\n          studio\n        ])\n      ).values()\n    );\n\n    let result = [...uniqueStudios];\n\n    // Search filter\n    if (searchTerm) {\n      const term = searchTerm.toLowerCase();\n      result = result.filter(studio =>\n        studio.name.toLowerCase().includes(term) ||\n        studio.address.neighborhood?.toLowerCase().includes(term) ||\n        studio.classTypes?.some(type => type.toLowerCase().includes(term))\n      );\n    }\n\n    // Neighborhood filter\n    if (filters.neighborhoods.length > 0) {\n      result = result.filter(studio =>\n        studio.address.neighborhood &&\n        filters.neighborhoods.includes(studio.address.neighborhood)\n      );\n    }\n\n    // Price filter\n    result = result.filter(studio => {\n      if (!studio.pricing?.singleClassMin) return true;\n      return (\n        studio.pricing.singleClassMin >= filters.priceRange[0] &&\n        studio.pricing.singleClassMin <= filters.priceRange[1]\n      );\n    });\n\n    // Rating filter\n    if (filters.rating > 0) {\n      result = result.filter(studio =>\n        ((studio.metrics?.googleRating || 0) as number) >= filters.rating\n      );\n    }\n\n    // Class types filter\n    if (filters.classTypes.length > 0) {\n      result = result.filter(studio =>\n        studio.classTypes?.some(type => filters.classTypes.includes(type))\n      );\n    }\n\n    // Equipment filter\n    if (filters.equipment.length > 0) {\n      result = result.filter(studio =>\n        studio.equipment?.some(item => filters.equipment.includes(item))\n      );\n    }\n\n    // Amenities filter\n    if (filters.amenities.length > 0) {\n      result = result.filter(studio =>\n        studio.amenities?.some(amenity => filters.amenities.includes(amenity))\n      );\n    }\n\n    // Sort\n    switch (sortBy) {\n      case 'rating':\n        result.sort((a, b) => (b.metrics?.googleRating || 0) - (a.metrics?.googleRating || 0));\n        break;\n      case 'reviews':\n        result.sort((a, b) => (b.metrics?.googleReviewCount || 0) - (a.metrics?.googleReviewCount || 0));\n        break;\n      case 'price-low':\n        result.sort((a, b) => (a.pricing?.singleClassMin || 9999) - (b.pricing?.singleClassMin || 9999));\n        break;\n      case 'price-high':\n        result.sort((a, b) => (b.pricing?.singleClassMin || 0) - (a.pricing?.singleClassMin || 0));\n        break;\n      case 'quality':\n        result.sort((a, b) => b.dataQualityScore - a.dataQualityScore);\n        break;\n      default:\n        break;\n    }\n\n    return result;\n  }, [studios, searchTerm, filters, sortBy]);\n\n  // Count active filters\n  const activeFilterCount = useMemo(() => {\n    let count = 0;\n    if (filters.neighborhoods.length > 0) count += filters.neighborhoods.length;\n    if (filters.classTypes.length > 0) count += filters.classTypes.length;\n    if (filters.equipment.length > 0) count += filters.equipment.length;\n    if (filters.amenities.length > 0) count += filters.amenities.length;\n    if (filters.rating > 0) count++;\n    if (filters.priceRange[0] > 0 || filters.priceRange[1] < availableOptions.maxPrice) count++;\n    return count;\n  }, [filters, availableOptions.maxPrice]);\n\n  const resetFilters = () => {\n    setFilters({\n      neighborhoods: [],\n      priceRange: [0, availableOptions.maxPrice],\n      rating: 0,\n      classTypes: [],\n      equipment: [],\n      amenities: [],\n      distance: undefined,\n    });\n  };\n  \n  // Update city studio count based on actual fetched studios\n  const displayStudioCount = useMemo(() => {\n    if (!studios) return cityData?.studioCount || 0;\n    return studios.length;\n  }, [studios, cityData]);\n\n  // SEO metadata\n  const pageTitle = `Estudios de Pilates en ${cityName} - ${filteredStudios.length} Opciones`;\n  const pageDescription = `Encuentra los mejores estudios de Pilates en ${cityName}. Compara ${filteredStudios.length} estudios con reseñas, precios y ubicaciones. Clases de reformer, mat y más.`;\n  const citySlugNormalized = citySlug(cityName);\n\n  return (\n    <LuxuryLayout>\n      <Helmet>\n        <title>{pageTitle}</title>\n        <meta name=\"description\" content={pageDescription} />\n        <meta property=\"og:title\" content={pageTitle} />\n        <meta property=\"og:description\" content={pageDescription} />\n        <script type=\"application/ld+json\">\n          {JSON.stringify({\n            '@context': 'https://schema.org',\n            '@type': 'CollectionPage',\n            name: pageTitle,\n            description: pageDescription,\n            url: `https://camadepilates.com/estudios-de-pilates/${citySlugNormalized}`,\n            numberOfItems: filteredStudios.length,\n          })}\n        </script>\n      </Helmet>\n\n      <section className=\"relative pt-32 pb-12 px-8 md:px-24 max-w-[1800px] mx-auto\">\n        {/* Atmospheric background elements */}\n        <div className=\"absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#3E2723]/5 to-transparent rounded-full blur-3xl -z-10\" />\n        <div className=\"absolute bottom-20 left-0 w-64 h-64 bg-gradient-to-tr from-[#D9865B]/5 to-transparent rounded-full blur-3xl -z-10\" />\n\n        <button onClick={() => navigate('/estudios-de-pilates')} className=\"inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-12 transition-all hover:gap-3 group\">\n          <ArrowLeft className=\"w-3 h-3 transition-transform group-hover:-translate-x-1\" />\n          <span>Directorio</span>\n        </button>\n\n        <div className=\"text-center mb-16 relative\">\n          {/* Asymmetric decorative element */}\n          <div className=\"absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#3E2723] to-transparent\" />\n\n          <span className=\"inline-block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8 px-4 py-1.5 bg-[#EAE8E4]/50 rounded-full\">\n            Guía de la Ciudad\n          </span>\n\n          <h1 className=\"text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8 tracking-tight\">\n            {cityName}\n          </h1>\n\n          <p className=\"text-lg md:text-xl text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed mb-6\">\n            Encuentra el estudio perfecto para tu práctica de Pilates.\n          </p>\n\n          {cityData && (\n            <div className=\"flex items-center justify-center gap-8 text-sm text-[#5D5550]\">\n              <div className=\"flex items-center gap-2\">\n                <div className=\"w-2 h-2 bg-[#3E2723] rounded-full\" />\n                <span className=\"font-medium\">{displayStudioCount} estudios</span>\n              </div>\n              <div className=\"flex items-center gap-2\">\n                <div className=\"w-2 h-2 bg-[#D9865B] rounded-full\" />\n                <span className=\"font-medium\">{cityData.neighborhoods?.length ?? 0} colonias</span>\n              </div>\n            </div>\n          )}\n        </div>\n\n        <div className=\"max-w-3xl mx-auto mb-16\">\n          <StudioSearch\n            value={searchTerm}\n            onChange={setSearchTerm}\n            placeholder={`Buscar en ${cityName}...`}\n            suggestions={[\n              'Pilates reformer',\n              'Pilates mat',\n              'Clases grupales',\n              'Clases privadas',\n              ...availableOptions.neighborhoods.slice(0, 3),\n            ]}\n          />\n        </div>\n\n        <div className=\"lg:grid lg:grid-cols-4 lg:gap-12\">\n          {/* Desktop Filters */}\n          <div className=\"hidden lg:block\">\n            <StudioFilters\n              filters={filters}\n              onChange={setFilters}\n              availableOptions={availableOptions}\n              activeCount={activeFilterCount}\n              onReset={resetFilters}\n            />\n          </div>\n\n          {/* Studios List */}\n          <div className=\"lg:col-span-3\">\n            {/* Results Header */}\n            <div className=\"flex items-center justify-between mb-8 pb-6 border-b-2 border-[#2A2624]/10 relative\">\n              {/* Decorative accent */}\n              <div className=\"absolute bottom-0 left-0 w-24 h-0.5 bg-gradient-to-r from-[#3E2723] to-transparent\" />\n\n              <div className=\"flex items-center gap-4\">\n                <h2 className=\"text-2xl font-serif italic text-[#2A2624] tracking-tight\">\n                  <span className=\"font-bold\">{filteredStudios.length}</span> {filteredStudios.length === 1 ? 'Estudio' : 'Estudios'}\n                </h2>\n\n                {/* Mobile Filter Button */}\n                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>\n                  <SheetTrigger asChild>\n                    <Button variant=\"outline\" size=\"sm\" className=\"lg:hidden\">\n                      <Filter className=\"w-4 h-4 mr-2\" />\n                      Filtros\n                      {activeFilterCount > 0 && (\n                        <Badge variant=\"secondary\" className=\"ml-2\">\n                          {activeFilterCount}\n                        </Badge>\n                      )}\n                    </Button>\n                  </SheetTrigger>\n                  <SheetContent side=\"left\" className=\"w-[300px] sm:w-[400px]\">\n                    <SheetHeader>\n                      <SheetTitle>Filtros</SheetTitle>\n                    </SheetHeader>\n                    <div className=\"mt-6\">\n                      <StudioFilters\n                        filters={filters}\n                        onChange={setFilters}\n                        availableOptions={availableOptions}\n                        activeCount={activeFilterCount}\n                        onReset={resetFilters}\n                      />\n                    </div>\n                  </SheetContent>\n                </Sheet>\n              </div>\n\n              {/* Sort Dropdown */}\n              <div className=\"flex items-center gap-3\">\n                <span className=\"text-xs text-[#5D5550] hidden sm:inline uppercase tracking-widest\">Ordenar:</span>\n                <Select value={sortBy} onValueChange={setSortBy}>\n                  <SelectTrigger className=\"w-[180px] border-[#2A2624]/20 bg-white hover:bg-[#EAE8E4]/30 transition-colors\">\n                    <SelectValue />\n                  </SelectTrigger>\n                  <SelectContent>\n                    <SelectItem value=\"rating\">⭐ Mejor calificación</SelectItem>\n                    <SelectItem value=\"reviews\">💬 Más reseñas</SelectItem>\n                    <SelectItem value=\"price-low\">💰 Precio: menor a mayor</SelectItem>\n                    <SelectItem value=\"price-high\">💎 Precio: mayor a menor</SelectItem>\n                  </SelectContent>\n                </Select>\n              </div>\n            </div>\n\n            {/* Active Filters Display */}\n            {activeFilterCount > 0 && (\n              <div className=\"flex flex-wrap gap-2 mb-6\">\n                {filters.neighborhoods.map(n => (\n                  <Badge key={n} variant=\"secondary\" className=\"bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10\">\n                    {n}\n                    <button\n                      onClick={() => setFilters({\n                        ...filters,\n                        neighborhoods: filters.neighborhoods.filter(x => x !== n)\n                      })}\n                      className=\"ml-1\"\n                    >\n                      <X className=\"w-3 h-3\" />\n                    </button>\n                  </Badge>\n                ))}\n                {filters.rating > 0 && (\n                  <Badge variant=\"secondary\" className=\"bg-[#2A2624]/5 text-[#2A2624] hover:bg-[#2A2624]/10\">\n                    {filters.rating}+ ⭐\n                    <button\n                      onClick={() => setFilters({ ...filters, rating: 0 })}\n                      className=\"ml-1\"\n                    >\n                      <X className=\"w-3 h-3\" />\n                    </button>\n                  </Badge>\n                )}\n              </div>\n            )}\n\n            {/* View Tabs */}\n            <Tabs value={viewTab} onValueChange={(value: any) => setViewTab(value)} className=\"w-full\">\n              <TabsList className=\"grid w-full max-w-md grid-cols-2 mb-12 bg-gradient-to-r from-[#2A2624]/5 to-[#3E2723]/5 p-1 rounded-lg\">\n                <TabsTrigger\n                  value=\"list\"\n                  className=\"data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#3E2723]/10 rounded-md transition-all duration-300 font-sans\"\n                >\n                  <List className=\"w-4 h-4 mr-2\" />\n                  Lista\n                </TabsTrigger>\n                <TabsTrigger\n                  value=\"map\"\n                  className=\"data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#3E2723]/10 rounded-md transition-all duration-300 font-sans\"\n                >\n                  <MapIcon className=\"w-4 h-4 mr-2\" />\n                  Mapa\n                </TabsTrigger>\n              </TabsList>\n\n              {/* Only render active tab content to prevent duplication */}\n              {viewTab === 'list' && (\n                <div className=\"mt-0\">\n                  <StudioList\n                    studios={filteredStudios}\n                    viewMode={viewMode}\n                    onViewModeChange={setViewMode}\n                    loading={isLoading}\n                  />\n                </div>\n              )}\n\n              {viewTab === 'map' && (\n                <div className=\"mt-0\">\n                  <StudioMap\n                    studios={filteredStudios}\n                    center={\n                      cityName === 'Ciudad de México'\n                        ? { lat: 19.4326, lng: -99.1332 }\n                        : cityName === 'Guadalajara'\n                          ? { lat: 20.6597, lng: -103.3496 }\n                          : cityName === 'Monterrey'\n                            ? { lat: 25.6866, lng: -100.3161 }\n                            : { lat: 19.4326, lng: -99.1332 }\n                    }\n                    height=\"700px\"\n                    showControls={true}\n                    enableGeolocation={true}\n                    enableClustering={true}\n                    enableHeatmap={true}\n                    enableStreetView={true}\n                    onStudioClick={(studio) => {\n                      navigate(`/estudios-de-pilates/${citySlugNormalized}/${studio.slug}`);\n                    }}\n                  />\n                </div>\n              )}\n            </Tabs>\n          </div>\n        </div>\n      </section>\n    </LuxuryLayout>\n  );\n};\n\nexport default CityDirectory;\n
