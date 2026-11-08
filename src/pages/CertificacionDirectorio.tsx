import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import EdelweissNav from '@/components/layout/EdelweissNav';
import CityListicleNav from '@/components/certification/CityListicleNav';
import CertificationCityGrid from '@/components/certification/CertificationCityGrid';
import StottCdmxSection from '@/components/certification/StottCdmxSection';
import CTASection from '@/components/ui/cta-section';
import { STUDIO_CTA_DESCRIPTION, STUDIO_CTA_TITLE } from '@/components/blog/topicCta';
import { CERTIFICATION_CITIES, CERTIFICATION_PARTNERS } from '@/content/certification/certificationsData';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import routeMeta from '@/content/route-meta.json';

const FAQ = [
  {
    question: '¿Qué certificación de Pilates conviene más en México?',
    answer:
      'Depende del estilo que quieras enseñar. Las escuelas de linaje clásico (Romana Kryzanowska, The New York Pilates Studio) enseñan el método original; STOTT PILATES® de Merrithew es la ruta contemporánea con validez internacional; los avales SEP-CONOCER tienen valor curricular en México, y el examen NPCP certifica a nivel internacional. En el directorio puedes filtrar por cada una.',
  },
  {
    question: '¿Cuánto cuesta una certificación de Pilates Reformer en México?',
    answer:
      'Varía mucho entre escuelas y horas de formación. Los programas internacionales como STOTT PILATES® en Santa Fe van de $38,000 a más de $60,000 MXN. Pide precio y fechas actualizadas a cada academia del directorio.',
  },
  {
    question: '¿Edelweiss Pilates imparte cursos de certificación?',
    answer:
      'Por ahora no impartimos cursos propios. Reunimos en un solo lugar las academias que forman instructoras en México y equipamos con Reformers a quienes abren o hacen crecer su estudio.',
  },
  {
    question: '¿Qué necesito para abrir mi estudio después de certificarme?',
    answer:
      'Un espacio, tus Reformers y una forma de recibir reservas. Te ayudamos a calcular cuántas camas caben en tu local; a partir de 8 Reformers, el pack de estudio lleva 20% de descuento, instalación y calibración en tu estudio y garantía de 1 año.',
  },
];

const CertificacionDirectorio: React.FC = () => {
  const origin = getOrigin();
  const [query, setQuery] = useState('');
  const { title, description } = routeMeta['/certificacion-pilates'];
  const url = `${origin}/certificacion-pilates`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Certificaciones de Pilates', item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#0F0F0F] font-sans antialiased">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin}/og/cama-de-pilates-venta-mexico.png`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <EdelweissNav />

      <section id="directorio" className="pt-28 sm:pt-36 pb-20 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="max-w-4xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#D9865B] font-bold block mb-2">
            // DIRECTORIO NACIONAL DE CERTIFICACIONES
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-neutral-900 mb-4">
            Certificaciones de Pilates en México
          </h1>
          <p className="text-neutral-600 text-base md:text-lg font-light leading-relaxed mb-8">
            {CERTIFICATION_PARTNERS.length} escuelas formadoras, academias con validez oficial (NPCP, SEP-CONOCER,
            linajes clásicos de Romana Kryzanowska y The New York Pilates Studio, STOTT Merrithew) y Master Trainers
            en {CERTIFICATION_CITIES.length} ciudades. Elige tu ciudad y compara.
          </p>

          <label className="relative block max-w-xl mb-8">
            <span className="sr-only">Buscar certificación</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por ciudad, academia o certificación (ej. Puebla, Clásico, NPCP)…"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-300 rounded-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-sm"
            />
          </label>

          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-2 font-medium">
            Ciudades:
          </span>
          <CityListicleNav showAllOption={false} />
        </div>

        <CertificationCityGrid filterQuery={query} />
      </section>

      <StottCdmxSection />

      <section className="py-16 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <span className="block text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2">
            // DESPUÉS DE CERTIFICARTE
          </span>
          <CTASection
            variant="compact"
            className="my-0"
            title={STUDIO_CTA_TITLE}
            description={STUDIO_CTA_DESCRIPTION}
            whatsappMessage="Hola, vi el directorio de certificaciones en camadepilates.com y quiero cotizar Reformers para mi estudio."
            secondaryHref="/packs/estudio"
            secondaryLabel="Calcular mi pack"
          />
        </div>
      </section>

      <section className="py-16 px-6 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 mb-8">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQ.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none font-semibold text-neutral-900 flex justify-between gap-4">
                  {item.question}
                  <span className="text-neutral-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-neutral-500 font-mono">
          <div>© {new Date().getFullYear()} Edelweiss Pilates</div>
          <nav className="flex flex-wrap gap-6">
            <Link to="/shop" className="hover:text-black">Tienda</Link>
            <Link to="/packs/estudio" className="hover:text-black">Packs para estudio</Link>
            <Link to="/legal/terminos" className="hover:text-black">Términos</Link>
            <Link to="/legal/privacidad" className="hover:text-black">Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default CertificacionDirectorio;
