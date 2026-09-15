import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { requireRouteMeta } from '@/lib/routeMeta';
import { canonicalUrl } from '@/lib/seo';
import { Layers, GraduationCap, MapPin, Users, BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';

interface SitemapSection {
  title: string;
  description: string;
  icon: React.ElementType;
  links: {
    title: string;
    path: string;
    description: string;
    badge?: string;
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: 'Equipamiento & Camas de Pilates',
    description: 'Catálogo de camas Reformer profesionales, especificaciones técnicas, precios y paquetes para estudio.',
    icon: Layers,
    links: [
      {
        title: 'Camas de Pilates en México (Hub)',
        path: '/cama-de-pilates',
        description: 'Página principal de camas de Pilates con comparativa de modelos residenciales y comerciales.',
        badge: 'Pilar',
      },
      {
        title: 'Precios de Camas de Pilates 2026',
        path: '/cama-de-pilates/precio',
        description: 'Guía detallada de costos desde $29,700 MXN para casa y $42,400 MXN para estudios.',
        badge: 'Precios',
      },
      {
        title: 'Venta de Camas Reformer Entrega Rápida',
        path: '/cama-de-pilates/en-venta',
        description: 'Camas listas para entrega en 3 semanas con maderas nobles, acero y refacciones inmediatas.',
        badge: 'Express',
      },
      {
        title: 'Reformer para Casa',
        path: '/reformer-para-casa',
        description: 'Guía de compra para espacios residenciales y departamentos en México.',
      },
      {
        title: 'Reformer para Estudio',
        path: '/reformer-para-estudio',
        description: 'Equipamiento comercial de uso continuo y alta resistencia para estudios boutique.',
      },
      {
        title: 'Pack Estudio (8+ Camas con 20% Desc.)',
        path: '/packs/estudio',
        description: 'Paquetes de volumen para apertura de estudios de Pilates con envío coordinado.',
        badge: 'Ahorro',
      },
      {
        title: 'Estudio Reformer Monterrey (Pack Express)',
        path: '/packs/monterrey',
        description: 'Paquetes con logística express para San Pedro Garza García y Monterrey en 7 días.',
      },
      {
        title: 'Catálogo de Reformers en Tienda',
        path: '/shop/category/reformers',
        description: 'Compra en línea con checkout seguro y opciones de financiamiento.',
      },
    ],
  },
  {
    title: 'Certificaciones de Instructores',
    description: 'Programas de formación profesional avalados con sedes presenciales y campus virtual.',
    icon: GraduationCap,
    links: [
      {
        title: 'Certificación Pilates Reformer México',
        path: '/certificacion-pilates',
        description: 'Programa oficial de 28h básica o 48h completa con máquina individual garantizada.',
        badge: 'Aval Oficial',
      },
      {
        title: 'Sede Ciudad de México (CDMX)',
        path: '/certificacion-pilates/cdmx',
        description: 'Fechas, temario y registro para el cohort presencial en CDMX.',
      },
      {
        title: 'Sede Guadalajara (Jalisco)',
        path: '/certificacion-pilates/guadalajara',
        description: 'Formación presencial en Guadalajara con prácticas intensivas en estudio.',
      },
      {
        title: 'Sede Monterrey (Nuevo León)',
        path: '/certificacion-pilates/monterrey',
        description: 'Fechas y reservación para instructoras en Monterrey y zona metropolitana.',
      },
      {
        title: 'Sede Puebla',
        path: '/certificacion-pilates/puebla',
        description: 'Cohortes para la zona de Angelópolis y Puebla con certificación completa.',
      },
      {
        title: 'Sede Querétaro',
        path: '/certificacion-pilates/queretaro',
        description: 'Capacitación profesional en Querétaro con acceso a bolsa de trabajo.',
      },
      {
        title: 'Campus Virtual & Comunidad (Whop)',
        path: '/app',
        description: 'Acceso a masterclasses grabadas, material descargable y red de graduadas.',
      },
    ],
  },
  {
    title: 'Directorio de Estudios de Pilates',
    description: 'Directorio nacional de estudios de Pilates con perfiles, precios por clase y ubicaciones.',
    icon: MapPin,
    links: [
      {
        title: 'Directorio General de Estudios en México',
        path: '/estudios-de-pilates',
        description: 'Explora estudios de Pilates verificados en las principales ciudades del país.',
      },
      {
        title: 'Estudios de Pilates en CDMX',
        path: '/estudios-de-pilates/ciudad-de-mexico',
        description: 'Guía de estudios en Roma, Condesa, Polanco, Santa Fe, Coyoacán y Del Valle.',
      },
      {
        title: 'Estudios de Pilates en Monterrey',
        path: '/estudios-de-pilates/monterrey',
        description: 'Estudios en San Pedro Garza García, Valle Oriente, Cumbres y San Jerónimo.',
      },
      {
        title: 'Estudios de Pilates en Guadalajara',
        path: '/estudios-de-pilates/guadalajara',
        description: 'Estudios boutique en Providencia, Puerta de Hierro, Americana y Chapalita.',
      },
      {
        title: 'Pilates Reformer CDMX: Precios y Clases',
        path: '/pilates-reformer-cdmx',
        description: 'Precios de clases, modalidades boutique y comparativa de estudios en la capital.',
      },
    ],
  },
  {
    title: 'Directorio de Instructores Certificados',
    description: 'Perfiles verificados de maestras e instructores de Pilates en México.',
    icon: Users,
    links: [
      {
        title: 'Directorio de Instructores en México',
        path: '/instructores-pilates',
        description: 'Encuentra entrenadores personales certificados en Reformer, Mat y Rehabilitación.',
      },
      {
        title: 'Instructores en Ciudad de México',
        path: '/instructores-pilates/ciudad-de-mexico',
        description: 'Perfiles de instructores disponibles para sesiones privadas y sustituciones en CDMX.',
      },
      {
        title: 'Instructores en Monterrey',
        path: '/instructores-pilates/monterrey',
        description: 'Instructores con experiencia clínica y deportiva en Nuevo León.',
      },
      {
        title: 'Instructores en Guadalajara',
        path: '/instructores-pilates/guadalajara',
        description: 'Maestros con certificaciones internacionales en la zona metropolitana de Jalisco.',
      },
    ],
  },
  {
    title: 'The Journal & Guías Esenciales',
    description: 'Artículos editoriales, análisis de mercado, comparativas técnicas y tutoriales de entrenamiento.',
    icon: BookOpen,
    links: [
      {
        title: 'The Journal (Índice de Artículos)',
        path: '/blog',
        description: 'Todos los artículos publicados sobre técnica, negocios de estudio y salud.',
      },
      {
        title: 'Categoría: Guías de Compra',
        path: '/blog/category/guias-de-compra',
        description: 'Análisis detallados para seleccionar el Reformer adecuado según presupuesto y espacio.',
      },
      {
        title: 'Categoría: Comparativas de Equipos',
        path: '/blog/category/comparativas',
        description: 'Comparaciones cara a cara de modelos, marcas y configuraciones mecánicas.',
      },
      {
        title: 'Categoría: Ejercicios y Salud',
        path: '/blog/category/ejercicios-y-salud',
        description: 'Rutinas, postura, prevención de lesiones y control motor en la cama de Pilates.',
      },
      {
        title: 'Categoría: Equipo y Mantenimiento',
        path: '/blog/category/equipo-y-mantenimiento',
        description: 'Cuidado de resortes, cuerdas, rieles y lubricación para alargar la vida útil.',
      },
      {
        title: 'Cama de Pilates: Guía Definitiva de Compra',
        path: '/blog/cama-de-pilates-guia-de-compra',
        description: 'La guía canónica para adquirir tu primer Reformer en México sin cometer errores.',
      },
      {
        title: 'Cama de Pilates Cadillac vs Reformer',
        path: '/blog/reformer-vs-cadillac',
        description: 'Diferencias técnicas, medidas de techo y comparativa de inversión entre Cadillac y Reformer.',
      },
      {
        title: 'Accesorios Esenciales para Reformer',
        path: '/blog/accesorios-esenciales-reformer',
        description: 'Cajas (sitting box), jumpboards, correas y resortes adicionales indispensables.',
      },
    ],
  },
  {
    title: 'Tienda Online & Corporativo',
    description: 'Accesorios de entrenamiento, ropa especializada, servicios técnicos e información de la marca.',
    icon: ShoppingBag,
    links: [
      {
        title: 'Tienda Oficial CAMA Pilates',
        path: '/shop',
        description: 'Catálogo general de productos disponibles con envío a todo México.',
      },
      {
        title: 'Accesorios de Pilates',
        path: '/shop/category/accesorios',
        description: 'Sitting boxes, footstraps, almohadillas lumbares y complementos.',
      },
      {
        title: 'Ropa & Calcetines Antideslizantes',
        path: '/shop/category/ropa',
        description: 'Calcetines de agarre profesional para estudio y prendas deportivas.',
      },
      {
        title: 'Sobre Nosotros (Edelweiss Pilates)',
        path: '/about',
        description: 'Nuestra filosofía: ingeniería alemana combinada con maestría artesanal mexicana.',
      },
      {
        title: 'Servicios para Estudios',
        path: '/services',
        description: 'Diseño de layout de estudio, mantenimiento corporativo y asesoría técnica.',
      },
      {
        title: 'Garantía & Soporte al Cliente',
        path: '/soporte',
        description: 'Póliza de garantía de 1 año, refacciones inmediatas y asistencia por WhatsApp.',
      },
      {
        title: 'Términos y Condiciones',
        path: '/legal/terminos',
        description: 'Condiciones de venta, envíos nacionales y políticas de garantía.',
      },
      {
        title: 'Aviso de Privacidad',
        path: '/legal/privacidad',
        description: 'Protección de datos personales y políticas de seguridad.',
      },
    ],
  },
];

const SitemapHtml: React.FC = () => {
  const meta = requireRouteMeta('/mapa-del-sitio');
  const canonical = canonicalUrl('/mapa-del-sitio');

  const sitemapSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: canonical,
    inLanguage: 'es-MX',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://camadepilates.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Mapa del Sitio',
          item: canonical,
        },
      ],
    },
  };

  return (
    <LuxuryLayout headerTheme="light">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">
          {JSON.stringify(sitemapSchema)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-[#FDFBF7] text-[#2A2624] pt-32 pb-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Migas de pan" className="mb-8 text-xs text-[#5D5550] flex items-center space-x-2">
            <Link to="/" className="hover:text-[#2A2624] transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#2A2624] font-medium">Mapa del Sitio</span>
          </nav>

          {/* Header */}
          <header className="mb-16 border-b border-[#E5E0D8] pb-10">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C827A] block mb-3">
              Arquitectura de Información & Directorio de Contenidos
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2A2624] tracking-tight mb-4">
              Mapa del Sitio CAMA Pilates
            </h1>
            <p className="text-lg text-[#5D5550] max-w-3xl font-light leading-relaxed">
              Índice completo de páginas, modelos de Reformer, sedes de certificación, directorios locales y guías de compra de CAMA Pilates en México. Encuentra rápidamente la información que necesitas o explora nuestras categorías principales.
            </p>
          </header>

          {/* Sitemap Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapData.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.title}
                  className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-[#F4F1EA] text-[#2A2624]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-serif font-bold text-[#2A2624] tracking-tight">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-xs text-[#8C827A] mb-5 leading-relaxed font-light">
                      {section.description}
                    </p>

                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.path} className="border-t border-[#F4F1EA] pt-2.5 first:border-t-0 first:pt-0">
                          <Link
                            to={link.path}
                            className="group flex flex-col hover:text-[#000] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#2A2624] group-hover:text-[#8C5D3D] transition-colors">
                                {link.title}
                              </span>
                              {link.badge ? (
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#5D5550]">
                                  {link.badge}
                                </span>
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 text-[#C4BCB3] group-hover:text-[#8C5D3D] group-hover:translate-x-0.5 transition-all" />
                              )}
                            </div>
                            <p className="text-xs text-[#7A726C] mt-0.5 font-light line-clamp-2">
                              {link.description}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer Callout */}
          <div className="mt-16 p-8 rounded-2xl bg-[#EAE8E4] border border-[#DCD8D3] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-serif text-[#2A2624] mb-2">
                ¿Buscas asesoría personalizada para tu compra o estudio?
              </h3>
              <p className="text-sm text-[#5D5550] max-w-xl font-light">
                Nuestro equipo en Ciudad de México te ayuda a evaluar medidas de sala, cotizaciones por volumen y opciones de entrega en toda la República.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/cama-de-pilates/precio"
                className="px-5 py-2.5 rounded-full bg-[#2A2624] text-white text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
              >
                Ver Precios 2026
              </Link>
              <a
                href="https://wa.me/525548468190"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-white text-[#2A2624] border border-[#C4BCB3] text-xs uppercase tracking-wider font-semibold hover:bg-[#FDFBF7] transition-colors"
              >
                WhatsApp Asesoría
              </a>
            </div>
          </div>
        </div>
      </main>
    </LuxuryLayout>
  );
};

export default SitemapHtml;
