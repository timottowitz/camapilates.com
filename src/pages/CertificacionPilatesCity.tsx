import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import AirtableFormDialog from '@/components/ui/airtable-form-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, MessageCircle } from 'lucide-react';

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
const CERT_FORM_URL = (import.meta as any).env?.VITE_AIRTABLE_CERT_FORM_URL || 'https://airtable.com';

const CertificacionPilatesCity: React.FC = () => {
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
    <>
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

      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={wa} className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"><MessageCircle className="h-4 w-4 mr-2" /> Inscribirme en {cityName.split(' ')[0]}</a>
              <a href={email} className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Solicitar temario</a>
              <AirtableFormDialog 
                title={`Pre-inscripción — ${cityName}`}
                description="Completa el formulario y te contactaremos con fechas, sedes y requisitos"
                embedUrl={CERT_FORM_URL}
              >
                <Button className="px-5 py-3">Pre-inscripción</Button>
              </AirtableFormDialog>
            </div>
            <div className="mt-4 text-sm text-muted-foreground flex items-center gap-3">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {cityName}</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Próximas fechas</span>
            </div>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">Incluye</h2>
            <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Reformer y Mat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Práctica clínica y mentoreo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Evaluación teórica y práctica</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Bolsa de trabajo</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Variantes de búsqueda: {data.variants.join(', ')}.</p>
            <div className="mt-4 text-xs text-muted-foreground">
              <Link to="/certificacion-pilates" className="underline">Ver todas las sedes</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Requisitos</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
              <li>18+ y experiencia básica en Pilates o movimiento.</li>
              <li>Horas clínicas: observación, asistencia y enseñanza.</li>
              <li>Compromiso con práctica supervisada para Reformer.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Duración y costos</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
              <li>Rutas de 150–450 horas según alcance.</li>
              <li>Rangos orientativos: $8,000–$25,000 MXN (módulos) y $30,000–$80,000 MXN (programas profesionales).</li>
              <li>Planes de pago y descuentos por pronto pago (consulta sedes).</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default CertificacionPilatesCity;
