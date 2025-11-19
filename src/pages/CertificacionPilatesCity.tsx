import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';

type CityKey = 'cdmx' | 'guadalajara' | 'monterrey' | 'puebla' | 'queretaro';

const CITY_DATA: Record<CityKey, { name: string; variants: string[] }> = {
  cdmx: {
    name: 'Ciudad de México (CDMX)',
    variants: [
      'certificación pilates cdmx',
      'certificación pilates reformer cdmx',
      'certificación pilates mexico df',
      'certificación pilates ciudad de mexico'
    ]
  },
  guadalajara: {
    name: 'Guadalajara (Jalisco)',
    variants: [
      'certificación de pilates en guadalajara jalisco',
      'certificación pilates guadalajara'
    ]
  },
  monterrey: {
    name: 'Monterrey (NL)',
    variants: [
      'certificación de pilates en monterrey',
      'certificación pilates monterrey'
    ]
  },
  puebla: {
    name: 'Puebla',
    variants: [
      'certificación pilates puebla'
    ]
  },
  queretaro: {
    name: 'Querétaro',
    variants: [
      'certificación pilates querétaro'
    ]
  }
};

const PRIMARY_WHATSAPP = 'https://wa.me/523222787690?text=';
const SUPPORT_EMAIL = 'valery@camadepilates.com';

const CertificacionPilatesCity: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { city } = useParams();
  const origin = getOrigin();
  const key = (city || 'cdmx').toLowerCase() as CityKey;
  const data = CITY_DATA[key] || CITY_DATA.cdmx;

  const cityName = data.name;
  const title = `Certificación de Pilates (Reformer) en ${cityName}`;
  const desc = `Conecta con certificaciones de Pilates en ${cityName}. Reformer y Mat: requisitos, duración, costos y registro.`;

  const wa = `${PRIMARY_WHATSAPP}${encodeURIComponent(`Hola Edelweiss, quiero inscribirme a la certificación de Pilates en ${cityName}`)}`;
  const email = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Certificación de Pilates - ' + cityName)}&body=${encodeURIComponent('Hola, quisiera recibir el temario, fechas y costos para la certificación de Pilates en ' + cityName + '.')}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Certificación de Pilates', item: `${origin}/certificacion-pilates` },
      { '@type': 'ListItem', position: 2, name: cityName, item: `${origin}/certificacion-pilates/${key}` }
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Certificación de Pilates en ${cityName}`,
    areaServed: {
      '@type': 'City',
      name: cityName
    },
    provider: { '@type': 'Organization', name: 'Edelweiss / camadepilates.com', url: origin },
    serviceType: 'Orientación e inscripción a certificaciones de Pilates (Reformer y Mat)'
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates/${key}`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={`${title} | ${DEFAULTS.siteName}`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates/${key}`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <Link to="/certificacion-pilates" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#5D5550] hover:text-[#2A2624] mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to All Locations
        </Link>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              Teacher Training
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              {cityName}
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={wa} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                Inscribirme
              </a>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
              >
                Pre-registro
              </button>
            </div>

            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <MapPin className="h-4 w-4 text-[#3E2723]" /> {cityName}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <Calendar className="h-4 w-4 text-[#3E2723]" /> Próximas fechas disponibles
              </div>
            </div>
          </div>

          <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Program Includes</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Reformer y Mat
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Práctica clínica y mentoreo
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Evaluación teórica y práctica
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Bolsa de trabajo
              </li>
            </ul>
            <p className="text-xs text-[#5D5550]/60 mt-8 pt-8 border-t border-[#2A2624]/10">
              Keywords: {data.variants.join(', ')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requirements</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>18+ y experiencia básica en Pilates o movimiento.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Horas clínicas: observación, asistencia y enseñanza.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Compromiso con práctica supervisada para Reformer.</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Duration & Investment</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Rutas de 150–450 horas según alcance.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Rangos orientativos: $8,000–$25,000 MXN (módulos) y $30,000–$80,000 MXN (programas profesionales).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Planes de pago y descuentos por pronto pago (consulta sedes).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCity={cityName}
        source={`/certificacion-pilates/${key}`}
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilatesCity;
