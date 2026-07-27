import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS, getOrigin, generateBreadcrumbSchema } from '@/lib/seo';
import { requireRouteMeta } from '@/lib/routeMeta';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { Home, Check, ArrowRight, Ruler, Volume2, Shield, Truck } from 'lucide-react';

const ReformerParaCasa: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/reformer-para-casa`;
  const { title, description: desc } = requireRouteMeta('/reformer-para-casa');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué espacio necesito para un reformer en casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Necesitas aproximadamente 3m x 1.5m de espacio libre. El reformer mide ~245cm de largo y ~70cm de ancho, más espacio para moverte alrededor.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta un reformer para casa en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Un reformer de calidad para casa en México cuesta entre $35,000 y $45,000 MXN. Modelos económicos desde $15,000 MXN sacrifican durabilidad y silencio.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Es difícil instalar un reformer en casa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, los reformers modernos vienen pre-ensamblados. Solo necesitas colocarlo en posición. Edelweiss incluye entrega a domicilio y guía de instalación.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Puedo practicar pilates en casa sin instructor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, pero recomendamos tomar algunas clases presenciales primero. Hay excelentes apps y videos para practicar en casa una vez domines los fundamentos.'
        }
      }
    ]
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Edelweiss Home Reformer',
    description: 'Reformer de pilates para casa con diseño compacto, sistema silencioso Whisper Glide y acabados premium en madera de nogal.',
    brand: { '@type': 'Brand', name: 'Edelweiss Pilates' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price: '35000',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'CAMA Pilates' }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '2'
    }
  };

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
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: 'Reformer para Casa' }
        ]))}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
            <Home className="w-4 h-4" /> Guía de Compra
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
            Reformer para Casa
          </h1>
          <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
            Transforma tu hogar en tu santuario de pilates. Todo lo que necesitas saber para elegir el reformer perfecto para tu espacio.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-6 bg-[#EAE8E4] rounded-sm text-center">
            <p className="text-2xl font-serif italic text-[#2A2624] mb-1">$35,000</p>
            <p className="text-xs uppercase tracking-widest text-[#5D5550]">Precio desde</p>
          </div>
          <div className="p-6 bg-[#EAE8E4] rounded-sm text-center">
            <p className="text-2xl font-serif italic text-[#2A2624] mb-1">245×70</p>
            <p className="text-xs uppercase tracking-widest text-[#5D5550]">cm dimensiones</p>
          </div>
          <div className="p-6 bg-[#EAE8E4] rounded-sm text-center">
            <p className="text-2xl font-serif italic text-[#2A2624] mb-1">3 sem</p>
            <p className="text-xs uppercase tracking-widest text-[#5D5550]">Entrega México</p>
          </div>
          <div className="p-6 bg-[#EAE8E4] rounded-sm text-center">
            <p className="text-2xl font-serif italic text-[#2A2624] mb-1">1 año</p>
            <p className="text-xs uppercase tracking-widest text-[#5D5550]">Garantía</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <Link
            to="/product/reformer-aluminio-riel-deslizante-a068"
            className="px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
          >
            Ver Reformer Aluminio
          </Link>
          <Link
            to="/products"
            className="px-8 py-4 border border-[#2A2624] text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#2A2624] hover:text-[#EAE8E4] transition-colors"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* What to Look For */}
      <section className="py-20 px-8 md:px-24 bg-[#EAE8E4]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] text-center mb-12">
            Qué buscar en un reformer para casa
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-sm">
              <Volume2 className="w-8 h-8 text-[#3E2723] mb-4" />
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Silencio</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Esencial para practicar sin molestar. Busca sistemas con ruedas de poliuretano y rieles pulidos.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-sm">
              <Ruler className="w-8 h-8 text-[#3E2723] mb-4" />
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Tamaño</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Mide tu espacio. Necesitas ~3m de largo libre. Algunos modelos son plegables pero sacrifican estabilidad.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-sm">
              <Shield className="w-8 h-8 text-[#3E2723] mb-4" />
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Calidad</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Invierte en materiales duraderos: madera sólida, acero estructural, cuero genuino. Durarán 10+ años.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-sm">
              <Truck className="w-8 h-8 text-[#3E2723] mb-4" />
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Entrega</h3>
              <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                Confirma que incluya envío a domicilio. Los reformers pesan 70-95kg y requieren manejo especializado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Recommendation */}
      <section className="py-20 px-8 md:px-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-4 block">
                Nuestra Recomendación
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-[#2A2624] mb-6">
                Edelweiss Home Reformer
              </h2>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-8">
                Diseñado específicamente para el hogar mexicano. Compacto, silencioso y con los mismos estándares de calidad que nuestro modelo profesional.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 shrink-0" />
                  <span className="text-[#5D5550]">Sistema Whisper Glide — silencio garantizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 shrink-0" />
                  <span className="text-[#5D5550]">Madera de nogal americano y cuero genuino</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 shrink-0" />
                  <span className="text-[#5D5550]">Entrega 3 semanas en todo México</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#3E2723] mt-0.5 shrink-0" />
                  <span className="text-[#5D5550]">Garantía 1 año + soporte WhatsApp</span>
                </li>
              </ul>
              
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl font-serif italic text-[#2A2624]">$35,000</span>
                <span className="text-sm text-[#5D5550]">MXN</span>
                <span className="text-xs text-[#3E2723] uppercase tracking-widest">o 12 MSI</span>
              </div>
              
              <Link
                to="/product/reformer-casa"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
              >
                Ver Detalles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="aspect-square bg-[#EAE8E4] rounded-sm overflow-hidden">
              <img
                src="/images/compare-home.webp"
                alt="Edelweiss Home Reformer - reformer de pilates para casa en madera de nogal"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif italic text-center mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Qué espacio necesito para un reformer en casa?</h3>
              <p className="text-white/70 font-light">
                Necesitas aproximadamente 3m x 1.5m de espacio libre. El reformer mide ~245cm de largo y ~70cm de ancho, más espacio para moverte alrededor.
              </p>
            </div>
            
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Cuánto cuesta un reformer para casa en México?</h3>
              <p className="text-white/70 font-light">
                Un reformer de calidad para casa en México cuesta entre $35,000 y $45,000 MXN. Modelos económicos desde $15,000 MXN sacrifican durabilidad y silencio.
              </p>
            </div>
            
            <div className="border-b border-white/20 pb-6">
              <h3 className="text-lg font-medium mb-3">¿Es difícil instalar un reformer en casa?</h3>
              <p className="text-white/70 font-light">
                No, los reformers modernos vienen pre-ensamblados. Solo necesitas colocarlo en posición. Edelweiss incluye entrega a domicilio y guía de instalación.
              </p>
            </div>
            
            <div className="pb-6">
              <h3 className="text-lg font-medium mb-3">¿Puedo practicar pilates en casa sin instructor?</h3>
              <p className="text-white/70 font-light">
                Sí, pero recomendamos tomar algunas clases presenciales primero. Hay excelentes apps y videos para practicar en casa una vez domines los fundamentos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Content */}
      <section className="py-20 px-8 md:px-24">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Guías Relacionadas</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/blog/mejor-cama-de-pilates-para-casa" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Mejor Cama de Pilates para Casa
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Comparativa detallada de opciones.</p>
            </Link>
            
            <Link to="/blog/dimensiones-cama-de-pilates" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Dimensiones y Espacio
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Guía completa de medidas.</p>
            </Link>
            
            <Link to="/cama-de-pilates/precio" className="group p-6 border border-[#2A2624]/10 rounded-sm hover:bg-[#EAE8E4] transition-colors">
              <h3 className="font-serif italic text-[#2A2624] group-hover:text-[#3E2723] mb-2">
                Guía de Precios 2025
              </h3>
              <p className="text-sm text-[#5D5550] font-light">Rangos y qué esperar por tu dinero.</p>
            </Link>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default ReformerParaCasa;
