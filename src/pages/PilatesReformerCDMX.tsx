import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateBreadcrumbSchema } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { MapPin, Building2, ShoppingBag, GraduationCap, ArrowRight, Phone } from 'lucide-react';

const PilatesReformerCDMX: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/pilates-reformer-cdmx`;
  const title = 'Pilates Reformer CDMX: Estudios, Clases y Dónde Comprar | 2025';
  const desc = 'Todo sobre Pilates Reformer en Ciudad de México: mejores estudios por zona, clases para principiantes, y dónde comprar reformers con entrega en CDMX.';

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'CAMA Pilates - Showroom CDMX',
    description: 'Showroom de reformers Edelweiss en Ciudad de México. Prueba antes de comprar.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Presidente Masaryk',
      addressLocality: 'Ciudad de México',
      addressRegion: 'CDMX',
      postalCode: '11560',
      addressCountry: 'MX'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.4326,
      longitude: -99.1332
    },
    areaServed: {
      '@type': 'City',
      name: 'Ciudad de México'
    },
    telephone: '+52-322-278-7690',
    url: url
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Dónde puedo tomar clases de Pilates Reformer en CDMX?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CDMX tiene estudios de pilates reformer en todas las zonas: Polanco, Condesa, Roma, Santa Fe, Coyoacán. Usa nuestro directorio para encontrar el más cercano.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta una clase de Pilates Reformer en CDMX?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Una clase individual cuesta entre $300-600 MXN. Paquetes mensuales van de $2,000-5,000 MXN dependiendo de la zona y el estudio.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Dónde comprar un reformer en Ciudad de México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Edelweiss Pilates entrega reformers en CDMX en 3 semanas. Contacta por WhatsApp para agendar visita al showroom o compra directo en línea.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Hay certificaciones de instructor de pilates en CDMX?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, hay múltiples escuelas certificadas en CDMX. Consulta nuestra guía de certificaciones para instructores en México.'
        }
      }
    ]
  };

  const zones = [
    { name: 'Polanco', studios: 12, priceRange: '$400-600' },
    { name: 'Condesa', studios: 8, priceRange: '$350-500' },
    { name: 'Roma', studios: 10, priceRange: '$300-450' },
    { name: 'Santa Fe', studios: 6, priceRange: '$400-550' },
    { name: 'Coyoacán', studios: 5, priceRange: '$280-400' },
    { name: 'Del Valle', studios: 7, priceRange: '$300-450' },
  ];

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="geo.region" content="MX-CMX" />
        <meta name="geo.placename" content="Ciudad de México" />
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Pilates Reformer CDMX' }
        ]))}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
            <MapPin className="w-4 h-4" /> Ciudad de México
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
            Pilates Reformer CDMX
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
            Encuentra estudios, clases y equipo de pilates reformer en Ciudad de México. Tu guía completa para 2025.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Link
            to="/estudios-de-pilates/cdmx"
            className="group p-8 bg-[#2A2624] text-[#EAE8E4] rounded-sm text-center hover:bg-[#3E2723] transition-colors"
          >
            <Building2 className="w-8 h-8 mx-auto mb-4" />
            <h2 className="text-xl font-serif italic mb-2">Estudios</h2>
            <p className="text-sm text-white/70 font-light mb-4">50+ estudios en CDMX</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest">
              Ver directorio <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
          
          <Link
            to="/shop"
            className="group p-8 bg-[#EAE8E4] rounded-sm text-center hover:bg-white transition-colors"
          >
            <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-[#3E2723]" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2">Comprar</h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">Entrega 3 sem en CDMX</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver reformers <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
          
          <Link
            to="/certificacion-pilates/cdmx"
            className="group p-8 border border-[#2A2624]/20 rounded-sm text-center hover:bg-[#EAE8E4] transition-colors"
          >
            <GraduationCap className="w-8 h-8 mx-auto mb-4 text-[#3E2723]" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2">Certificación</h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">Sé instructor certificado</p>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver cursos <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </section>

      {/* Studios by Zone */}
      <section className="py-20 px-8 md:px-24 bg-[#EAE8E4]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] text-center mb-4">
            Estudios por Zona
          </h2>
          <p className="text-center text-[#5D5550] font-light mb-12 max-w-xl mx-auto">
            Precio promedio por clase individual en cada zona de CDMX.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Link
                key={zone.name}
                to={`/estudios-de-pilates/cdmx?zona=${zone.name.toLowerCase()}`}
                className="group p-6 bg-white rounded-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-serif italic text-[#2A2624] group-hover:text-[#3E2723]">
                    {zone.name}
                  </h3>
                  <span className="text-xs bg-[#EAE8E4] px-2 py-1 rounded-full text-[#5D5550]">
                    {zone.studios} estudios
                  </span>
                </div>
                <p className="text-sm text-[#5D5550] font-light">
                  Clase: <span className="text-[#2A2624] font-medium">{zone.priceRange} MXN</span>
                </p>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/estudios-de-pilates/cdmx"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
            >
              Ver todos los estudios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Buy in CDMX */}
      <section className="py-20 px-8 md:px-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] bg-[#EAE8E4] rounded-sm overflow-hidden">
              <img
                src="/images/compare-home.png"
                alt="Reformer Edelweiss disponible en CDMX con entrega a domicilio"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            <div>
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-4 block">
                Compra en CDMX
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-6">
                Reformers con Entrega en Ciudad de México
              </h2>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-8">
                Entregamos tu reformer Edelweiss en cualquier punto de CDMX en 3 semanas. Agenda cita para probar en nuestro showroom.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-[#EAE8E4] rounded-sm">
                  <div className="w-12 h-12 bg-[#2A2624] rounded-full flex items-center justify-center text-[#EAE8E4]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2A2624]">Reformer Casa</p>
                    <p className="text-sm text-[#5D5550]">Desde $35,000 MXN</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-[#EAE8E4] rounded-sm">
                  <div className="w-12 h-12 bg-[#2A2624] rounded-full flex items-center justify-center text-[#EAE8E4]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2A2624]">Reformer Profesional</p>
                    <p className="text-sm text-[#5D5550]">Desde $50,000 MXN</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
                >
                  Ver Tienda
                </Link>
                <a
                  href="https://wa.me/523222787690?text=Hola,%20me%20interesa%20un%20reformer%20en%20CDMX"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-[#2A2624] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
                >
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif italic text-center mb-12">
            Preguntas sobre Pilates en CDMX
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Dónde puedo tomar clases de Pilates Reformer en CDMX?</h3>
              <p className="text-white/70 font-light">
                CDMX tiene estudios de pilates reformer en todas las zonas: Polanco, Condesa, Roma, Santa Fe, Coyoacán. Usa nuestro directorio para encontrar el más cercano.
              </p>
            </div>
            
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Cuánto cuesta una clase de Pilates Reformer en CDMX?</h3>
              <p className="text-white/70 font-light">
                Una clase individual cuesta entre $300-600 MXN. Paquetes mensuales van de $2,000-5,000 MXN dependiendo de la zona y el estudio.
              </p>
            </div>
            
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Dónde comprar un reformer en Ciudad de México?</h3>
              <p className="text-white/70 font-light">
                Edelweiss Pilates entrega reformers en CDMX en 3 semanas. Contacta por WhatsApp para agendar visita al showroom o compra directo en línea.
              </p>
            </div>
            
            <div className="pb-6">
              <h3 className="text-lg font-medium mb-3">¿Hay certificaciones de instructor de pilates en CDMX?</h3>
              <p className="text-white/70 font-light">
                Sí, hay múltiples escuelas certificadas en CDMX. Consulta nuestra guía de certificaciones para instructores en México.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Content */}
      <section className="py-20 px-8 md:px-24">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Más sobre Pilates en México</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/blog/pilates-reformer-cdmx" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Guía Completa Pilates CDMX
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Todo lo que necesitas saber.</p>
            </Link>
            
            <Link to="/estudios-de-pilates" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Directorio Nacional
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Estudios en todo México.</p>
            </Link>
            
            <Link to="/reformer-para-casa" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Reformer para Casa
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Practica en tu hogar.</p>
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default PilatesReformerCDMX;
