import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { MapPin, Users, Star, TrendingUp, Search, Building } from 'lucide-react';
import { hasConvex } from '@/lib/convexProvider';

const StudiosLanding: React.FC = () => {
  // SEO metadata
  const pageTitle = 'Directorio de Estudios de Pilates en México';
  const pageDescription = 'Encuentra los mejores estudios de Pilates en México. Directorio completo con reseñas, precios y horarios en Ciudad de México, Monterrey, Guadalajara y más ciudades.';

  // If Convex isn’t configured, render a safe fallback (avoid calling hooks)
  if (!hasConvex) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 text-center max-w-2xl">
              <Badge className="mb-4" variant="secondary">Próximamente</Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Estudios de Pilates</h1>
              <p className="text-gray-600 mb-6">El directorio de estudios requiere conexión a datos. Por favor configura el backend o vuelve más tarde.</p>
              <div className="flex gap-3 justify-center">
                <Button asChild><Link to="/">Volver al inicio</Link></Button>
                <Button variant="outline" asChild><Link to="/store">Ver tienda</Link></Button>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Fetch data from Convex (only when provider exists)
  const cities = useQuery(api.cities.getPriority, { limit: 10 }) || [];
  const featuredStudios = useQuery(api.studios.getFeatured, { limit: 6 }) || [];

  // Statistics (could be from Convex or calculated)
  const stats = {
    totalCities: cities.length,
    totalStudios: cities.reduce((sum, city) => sum + city.studioCount, 0),
    avgRating: 4.7,
    totalReviews: 12500,
  };

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
            '@type': 'WebPage',
            name: pageTitle,
            description: pageDescription,
            url: 'https://camadepilates.com/estudios-de-pilates',
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
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
                  <BreadcrumbPage>Estudios de Pilates</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4" variant="secondary">
                Directorio Nacional
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Encuentra tu Estudio de Pilates Ideal en México
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8">
                Descubre y compara los mejores estudios de Pilates cerca de ti.
                Reseñas verificadas, precios transparentes y toda la información que necesitas.
              </p>

              {/* Search CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/estudios-de-pilates/ciudad-de-mexico">
                    <Search className="w-5 h-5" />
                    Buscar en CDMX
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <Link to="#cities">
                    <MapPin className="w-5 h-5" />
                    Ver Todas las Ciudades
                  </Link>
                </Button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalCities}</div>
                  <div className="text-sm text-gray-600 mt-1">Ciudades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalStudios}+</div>
                  <div className="text-sm text-gray-600 mt-1">Estudios</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.avgRating}</div>
                  <div className="text-sm text-gray-600 mt-1">Calificación Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalReviews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">Reseñas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section id="cities" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Estudios de Pilates por Ciudad
              </h2>
              <p className="text-gray-600">
                Selecciona tu ciudad para explorar los estudios disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <Link
                  key={city._id}
                  to={`/estudios-de-pilates/${city.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-sm text-gray-500">{city.state}</p>
                        </div>
                        <Badge variant="secondary">
                          {city.studioCount} estudios
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{city.neighborhoods.length} colonias</span>
                        </div>
                        {city.averageRating && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-4 h-4" />
                            <span>{city.averageRating.toFixed(1)} calificación promedio</span>
                          </div>
                        )}
                      </div>

                      {/* Top neighborhoods */}
                      <div className="mt-4 flex flex-wrap gap-1">
                        {city.neighborhoods.slice(0, 3).map((neighborhood) => (
                          <Badge key={neighborhood} variant="outline" className="text-xs">
                            {neighborhood}
                          </Badge>
                        ))}
                        {city.neighborhoods.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{city.neighborhoods.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* More Cities Coming Soon */}
            <div className="mt-12 text-center">
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Más Ciudades Próximamente</h3>
                  <p className="text-gray-600 mb-4">
                    Estamos expandiendo nuestro directorio a más ciudades de México
                  </p>
                  <Button variant="outline" asChild>
                    <a href="mailto:soporte@camadepilates.com">
                      Solicitar mi ciudad
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Studios */}
        {featuredStudios.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Estudios Destacados
                </h2>
                <p className="text-gray-600">
                  Los estudios mejor calificados en nuestro directorio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredStudios.map((studio) => (
                  <Link
                    key={studio._id}
                    to={`/estudios-de-pilates/${studio.address.city.toLowerCase().replace(/\s+/g, '-')}/${studio.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                            {studio.name}
                          </h3>
                          {studio.isVerified && (
                            <Badge className="bg-green-500">
                              Verificado
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {studio.address.neighborhood && `${studio.address.neighborhood}, `}
                          {studio.address.city}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          {studio.metrics.googleRating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{studio.metrics.googleRating.toFixed(1)}</span>
                              <span className="text-gray-500">
                                ({studio.metrics.googleReviewCount})
                              </span>
                            </div>
                          )}
                        </div>

                        {studio.classTypes && studio.classTypes.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {studio.classTypes.slice(0, 2).map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Tienes un Estudio de Pilates?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Añade tu estudio a nuestro directorio de forma gratuita y conecta con nuevos clientes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="mailto:soporte@camadepilates.com">
                  Registrar mi Estudio
                </a>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                Más Información
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Búsqueda Inteligente</h3>
                <p className="text-gray-600">
                  Encuentra estudios por ubicación, tipo de clase, precio y más
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Reseñas Verificadas</h3>
                <p className="text-gray-600">
                  Lee opiniones reales de otros practicantes de Pilates
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comparación Fácil</h3>
                <p className="text-gray-600">
                  Compara precios, horarios y servicios de diferentes estudios
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StudiosLanding;
