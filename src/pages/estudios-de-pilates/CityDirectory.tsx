import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import StudioList from "@/components/studios/StudioList";
import StudioFilters, { FilterOptions } from "@/components/studios/StudioFilters";
import StudioSearch from "@/components/studios/StudioSearch";
import { StudioMap } from "@/components/maps/StudioMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Map as MapIcon, List, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { citySlug } from "@/utils/slug";
import LuxuryLayout from "@/components/layout/LuxuryLayout";
import { DEFAULTS, generateCityDirectorySchema, getOrigin } from "@/lib/seo";
import { hasConvex } from "@/lib/convexProvider";
import localData from "@/data/studios.json";

type StudioRecord = (typeof localData.studios)[number] & {
  contact?: {
    phone?: string;
    website?: string;
  };
};

// Simple city name mapping
const cityNameMap: Record<string, string> = {
  cdmx: "Ciudad de México",
  "ciudad-de-mexico": "Ciudad de México",
  queretaro: "Querétaro",
  puebla: "Puebla",
  monterrey: "Monterrey",
  guadalajara: "Guadalajara",
};

const certificationCityMap: Record<string, string> = {
  "ciudad-de-mexico": "cdmx",
  guadalajara: "guadalajara",
  monterrey: "monterrey",
  puebla: "puebla",
  queretaro: "queretaro",
};

const cityCenters: Record<string, { lat: number; lng: number }> = {
  "ciudad-de-mexico": { lat: 19.4326, lng: -99.1332 },
  guadalajara: { lat: 20.6597, lng: -103.3496 },
  monterrey: { lat: 25.6866, lng: -100.3161 },
};

function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const radians = Math.PI / 180;
  const latDelta = (to.lat - from.lat) * radians;
  const lngDelta = (to.lng - from.lng) * radians;
  const value =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(from.lat * radians) *
      Math.cos(to.lat * radians) *
      Math.sin(lngDelta / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(value));
}

const CityDirectory: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();

  // Get city name from URL slug
  const cityName = city ? cityNameMap[city.toLowerCase()] || city : "";
  const normalizedSlug = cityName ? citySlug(cityName) : city || "";
  const origin = getOrigin();
  const isMonterrey = normalizedSlug === "monterrey";
  const certificationCity = certificationCityMap[normalizedSlug];
  const mapCenter = cityCenters[normalizedSlug] || cityCenters["ciudad-de-mexico"];

  useEffect(() => {
    if (city && normalizedSlug && city !== normalizedSlug) {
      navigate(`/estudios-de-pilates/${normalizedSlug}`, { replace: true });
    }
  }, [city, navigate, normalizedSlug]);

  const remoteStudios = useQuery(api.studios.getByCity, hasConvex && cityName ? { city: cityName } : "skip");
  const remoteCityData = useQuery(api.cities.getBySlug, hasConvex && normalizedSlug ? { slug: normalizedSlug } : "skip");
  const fallbackStudios = useMemo(
    () => (localData.studios as StudioRecord[]).filter((studio) => citySlug(studio.address.city) === normalizedSlug),
    [normalizedSlug]
  );
  const fallbackCityData = useMemo(
    () => localData.cities.find((candidate) => candidate.slug === normalizedSlug),
    [normalizedSlug]
  );
  const validRemoteStudios = useMemo(() => {
    if (!Array.isArray(remoteStudios)) return [];
    const center = cityCenters[normalizedSlug];
    if (!center) return remoteStudios;
    return remoteStudios.filter((studio) => {
      const coordinates = studio.address?.coordinates;
      return coordinates && distanceKm(center, coordinates) <= 75;
    });
  }, [normalizedSlug, remoteStudios]);
  const studios = useMemo(() => {
    if (validRemoteStudios.length === 0) {
      return fallbackStudios;
    }

    const remoteKeys = new Set(validRemoteStudios.map((studio) => studio.slug));
    const missingFallbackStudios = fallbackStudios.filter((studio) => !remoteKeys.has(studio.slug));
    return [...validRemoteStudios, ...missingFallbackStudios];
  }, [fallbackStudios, validRemoteStudios]);
  const cityData = remoteCityData || fallbackCityData;

  // UI state for filters/search
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewTab, setViewTab] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    neighborhoods: [] as string[],
    priceRange: [0, 2000] as [number, number],
    rating: 0,
    classTypes: [] as string[],
    equipment: [] as string[],
    amenities: [] as string[],
  });

  const isLoading = hasConvex && remoteStudios === undefined && fallbackStudios.length === 0;

  // Process filter options from studios
  const availableOptions = useMemo(() => {
    if (!studios || !Array.isArray(studios)) {
      return { neighborhoods: [], classTypes: [], equipment: [], amenities: [], maxPrice: 2000 };
    }

    const neighborhoods = new Set<string>();
    const classTypes = new Set<string>();
    const equipment = new Set<string>();
    const amenities = new Set<string>();
    let maxPrice = 2000;

    studios.forEach((studio) => {
      if (studio.address?.neighborhood) neighborhoods.add(studio.address.neighborhood);
      studio.classTypes?.forEach((type: string) => classTypes.add(type));
      studio.equipment?.forEach((item: string) => equipment.add(item));
      studio.amenities?.forEach((amenity: string) => amenities.add(amenity));
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

  // Filter and sort studios
  const filteredStudios = useMemo(() => {
    if (!studios || !Array.isArray(studios)) return [];

    let result = [...studios];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((studio) =>
        (studio.name || "").toLowerCase().includes(term) ||
        (studio.address?.neighborhood || "").toLowerCase().includes(term)
      );
    }

    // Neighborhood filter
    if (filters.neighborhoods.length > 0) {
      result = result.filter((studio) =>
        filters.neighborhoods.includes(studio.address?.neighborhood || "")
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter((studio) =>
        (studio.metrics?.googleRating || 0) >= filters.rating
      );
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => (b.metrics?.googleRating || 0) - (a.metrics?.googleRating || 0));
        break;
      case "reviews":
        result.sort((a, b) => (b.metrics?.googleReviewCount || 0) - (a.metrics?.googleReviewCount || 0));
        break;
      case "price-low":
        result.sort((a, b) => (a.pricing?.singleClassMin || 9999) - (b.pricing?.singleClassMin || 9999));
        break;
      case "price-high":
        result.sort((a, b) => (b.pricing?.singleClassMin || 0) - (a.pricing?.singleClassMin || 0));
        break;
    }

    return result;
  }, [studios, searchTerm, filters, sortBy]);

  const activeFilterCount = filters.neighborhoods.length + (filters.rating > 0 ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      neighborhoods: [],
      priceRange: [0, 2000],
      rating: 0,
      classTypes: [],
      equipment: [],
      amenities: [],
    });
  };

  const handleViewTabChange = (value: string) => {
    if (value === "list" || value === "map") {
      setViewTab(value);
    }
  };

  // SEO
  const pageTitle = isMonterrey
    ? `Clases y Estudios de Pilates en Monterrey | ${DEFAULTS.siteName}`
    : `Estudios y Clases de Pilates en ${cityName} | ${DEFAULTS.siteName}`;
  const pageDescription = isMonterrey
    ? "Encuentra clases y estudios de Pilates en Monterrey. Compara ubicaciones, modalidades, reseñas y opciones de Reformer."
    : `Encuentra clases y estudios de Pilates en ${cityName}. Compara ubicaciones, modalidades, reseñas y opciones de Reformer.`;

  const cityDirectorySchema = generateCityDirectorySchema({
    cityName,
    citySlug: normalizedSlug,
    studioCount: filteredStudios.length,
    avgRating: cityData?.avgRating,
    studios: filteredStudios.map((s) => ({
      name: s.name,
      slug: s.slug,
      rating: s.metrics?.googleRating,
      reviewCount: s.metrics?.googleReviewCount,
    })),
  });

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${origin}/estudios-de-pilates/${normalizedSlug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/estudios-de-pilates/${normalizedSlug}`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">
          {JSON.stringify(cityDirectorySchema)}
        </script>
      </Helmet>

      <section className="relative pt-32 pb-12 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link
          to="/estudios-de-pilates"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-12"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Directorio</span>
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] mb-8">
            {isMonterrey ? "Clases y estudios de Pilates en Monterrey" : `Estudios y clases de Pilates en ${cityName}`}
          </h1>
          <p className="text-lg text-[#5D5550] mb-6">
            Encuentra el estudio perfecto para tu práctica de Pilates.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-[#5D5550]">
            <span className="font-medium">{filteredStudios.length} estudios encontrados</span>
            {cityData?.neighborhoods?.length && (
              <span className="font-medium">{cityData.neighborhoods.length} colonias</span>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <StudioSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Buscar en ${cityName}...`}
            suggestions={availableOptions.neighborhoods.slice(0, 5)}
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

          {/* Studios */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2A2624]/10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-serif italic text-[#2A2624]">
                  <span className="font-bold">{filteredStudios.length}</span> Estudios
                </h2>

                {/* Mobile Filters */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">⭐ Mejor calificación</SelectItem>
                  <SelectItem value="reviews">💬 Más reseñas</SelectItem>
                  <SelectItem value="price-low">💰 Precio: menor</SelectItem>
                  <SelectItem value="price-high">💎 Precio: mayor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.neighborhoods.map((n) => (
                  <Badge key={n} variant="secondary">
                    {n}
                    <button
                      onClick={() => setFilters({
                        ...filters,
                        neighborhoods: filters.neighborhoods.filter((x) => x !== n),
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
                    <button onClick={() => setFilters({ ...filters, rating: 0 })} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* View Tabs */}
            <Tabs value={viewTab} onValueChange={handleViewTabChange} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-12">
                <TabsTrigger value="list">
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapIcon className="w-4 h-4 mr-2" />
                  Mapa
                </TabsTrigger>
              </TabsList>

              {viewTab === "list" && (
                <StudioList
                  studios={filteredStudios}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  loading={isLoading}
                />
              )}

              {viewTab === "map" && (
                <StudioMap
                  studios={filteredStudios}
                  center={mapCenter}
                  height="700px"
                  showControls={true}
                  onStudioClick={(studio) => {
                    navigate(`/estudios-de-pilates/${normalizedSlug}/${studio.slug}`);
                  }}
                />
              )}
            </Tabs>
          </div>
        </div>
      </section>

      <section className="px-8 md:px-24 pb-24">
        <div className="max-w-4xl mx-auto border-t border-[#2A2624]/10 pt-12">
          <h2 className="text-2xl font-serif italic text-[#2A2624]">¿Buscas formación o equipo profesional?</h2>
          <p className="mt-3 text-[#5D5550] font-light">
            Las clases del directorio son para practicar Pilates. La certificación prepara instructores y el catálogo profesional reúne equipo para estudios.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {certificationCity && (
              <Link
                to={`/certificacion-pilates/${certificationCity}`}
                className="inline-flex items-center px-6 py-3 border border-[#2A2624]/20 rounded-full text-xs uppercase tracking-[0.15em] text-[#2A2624] hover:bg-white transition-colors"
              >
                Certificación en {cityName}
              </Link>
            )}
            <Link
              to="/reformer-para-estudio"
              className="inline-flex items-center px-6 py-3 border border-[#2A2624]/20 rounded-full text-xs uppercase tracking-[0.15em] text-[#2A2624] hover:bg-white transition-colors"
            >
              Reformers para estudio
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CityDirectory;
