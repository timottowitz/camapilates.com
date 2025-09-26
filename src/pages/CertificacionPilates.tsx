import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Calendar, MessageCircle } from 'lucide-react';
import AirtableFormDialog from '@/components/ui/airtable-form-dialog';
import { Button } from '@/components/ui/button';

const CITIES = [
  { key: 'cdmx', name: 'Ciudad de México (CDMX)', kw: ['certificación pilates cdmx', 'certificación pilates reformer cdmx', 'certificación pilates mexico df'] },
  { key: 'guadalajara', name: 'Guadalajara (Jalisco)', kw: ['certificación de pilates en guadalajara jalisco', 'certificación pilates guadalajara'] },
  { key: 'monterrey', name: 'Monterrey (NL)', kw: ['certificación de pilates en monterrey', 'certificación pilates monterrey'] },
  { key: 'puebla', name: 'Puebla', kw: ['certificación pilates puebla'] },
  { key: 'queretaro', name: 'Querétaro', kw: ['certificación pilates querétaro'] },
];

const PRIMARY_WHATSAPP = 'https://wa.me/523222787690?text=Hola%20Edelweiss%2C%20quiero%20inscribirme%20a%20la%20certificaci%C3%B3n%20de%20Pilates';
const SUPPORT_EMAIL = 'mailto:valery@camadepilates.com?subject=Certificaci%C3%B3n%20de%20Pilates%20-%20Informaci%C3%B3n';
const CERT_FORM_URL = (import.meta as any).env?.VITE_AIRTABLE_CERT_FORM_URL || 'https://airtable.com';

const CertificacionPilates: React.FC = () => {
  const origin = getOrigin();
  const title = 'Certificación de Pilates (Reformer) en México — CDMX, Guadalajara y Monterrey';
  const desc = 'Conecta con certificaciones de Pilates Reformer y Mat en México. Sedes en CDMX, Guadalajara y Monterrey. Requisitos, duración, costos y registro.';

  // Structured Data: Service + ItemList (cities) + FAQPage
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Conexión con certificaciones de Pilates',
    provider: {
      '@type': 'Organization',
      name: 'Edelweiss / camadepilates.com',
      url: origin
    },
    areaServed: {
      '@type': 'Country',
      name: 'MX'
    },
    serviceType: 'Orientación e inscripción a certificaciones de Pilates (Reformer y Mat)'
  };

  const cityListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: CITIES.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Certificación de Pilates en ${c.name}`,
      url: `${origin}/certificacion-pilates#${c.key}`
    }))
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué modalidades existen (Mat vs Reformer)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La certificación puede ser en Mat (suelo) o Reformer (aparato). Muchas escuelas ofrecen rutas combinadas. Reformer requiere práctica supervisada en aparato y horas clínicas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuánto dura una certificación de Pilates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Desde fines de semana intensivos (40–60 h) hasta programas profesionales (150–450 h) con práctica, evaluación y clases observadas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuál es el costo estimado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Varía por escuela y alcance: $8,000–$25,000 MXN (módulos básicos) y $30,000–$80,000 MXN (profesional completo). Verifica temario, horas clínicas y certificación emitida.'
        }
      },
      {
        '@type': 'Question',
        name: '¿La certificación tiene validez internacional?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Depende del proveedor. Algunas certificaciones siguen estándares internacionales (p.ej., 450 h) y son aceptadas por estudios fuera de MX. Verifica avales y bolsa de trabajo.'
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/certificacion-pilates`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/certificacion-pilates`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(cityListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Certificación de Pilates (Reformer) en México</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Edelweiss te conecta con certificaciones de Pilates en México (Reformer y Mat). Sedes en CDMX, Guadalajara y Monterrey.
              Recibe asesoría sobre requisitos, duración, costos y próximas fechas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={PRIMARY_WHATSAPP} className="inline-flex items-center px-5 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"><MessageCircle className="h-4 w-4 mr-2" /> Quiero inscribirme</a>
              <a href={SUPPORT_EMAIL} className="inline-flex items-center px-5 py-3 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Solicitar información por correo</a>
              <AirtableFormDialog 
                title="Pre-inscripción a Certificación de Pilates"
                description="Completa el formulario y te contactaremos con fechas, sedes y requisitos"
                embedUrl={CERT_FORM_URL}
              >
                <Button className="px-5 py-3">Pre-inscripción</Button>
              </AirtableFormDialog>
            </div>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Reformer y Mat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Programas 150–450 h</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Práctica supervisada</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Bolsa de trabajo</li>
            </ul>
          </div>
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-3">Próximas sedes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CITIES.slice(0,3).map(c => (
                <a key={c.key} href={`#${c.key}`} className="block border rounded-md p-4 hover:border-primary/50">
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> {c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2"><Calendar className="h-3 w-3" /> Fechas próximas</div>
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">También disponible en Puebla y Querétaro. Pregunta por sedes adicionales.</p>
          </div>
        </div>
      </section>

      {/* City Sections with SEO headings */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Sedes y registro</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {CITIES.map((c) => (
              <div key={c.key} id={c.key} className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-semibold text-foreground">
                  Certificación de Pilates en {c.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={PRIMARY_WHATSAPP + `%20en%20${encodeURIComponent(c.name)}` } className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Inscribirme en {c.name.split(' ')[0]}</a>
                  <a href={SUPPORT_EMAIL} className="inline-flex items-center px-4 py-2 rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background">Solicitar temario</a>
                  <AirtableFormDialog 
                    title={`Pre-inscripción — ${c.name}`}
                    description="Completa el formulario y te contactaremos con fechas, sedes y requisitos"
                    embedUrl={CERT_FORM_URL}
                  >
                    <Button variant="outline" className="px-4 py-2">Pre-inscripción</Button>
                  </AirtableFormDialog>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Palabras clave: {c.kw.join(', ')}.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to choose / requirements */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Requisitos y duración</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
              <li>Edad 18+, experiencia básica en Pilates o movimiento.</li>
              <li>Reformer: práctica supervisada y horas clínicas (observación, asistencia y enseñanza).</li>
              <li>Duración estimada: 150–450 h totales según programa.</li>
              <li>Evaluación teórica/práctica y proyecto final.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Cómo elegir una certificación</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
              <li>Revisa el plan de estudios (Mat/Reformer) y número de horas.</li>
              <li>Confirma práctica clínica supervisada y mentoreo.</li>
              <li>Validez y avales (estándares internacionales cuando aplique).</li>
              <li>Bolsa de trabajo y red de estudios afiliados.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ for SEO */}
      <section className="bg-background border-t border-border" id="faq">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">¿Puedo certificarme solo en Reformer?</h3>
              <p className="text-sm text-muted-foreground">Sí. Algunas escuelas ofrecen Reformer como módulo independiente; otras requieren base en Mat. Te guiamos según tu perfil.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">¿Existen opciones online?</h3>
              <p className="text-sm text-muted-foreground">La teoría puede ser online, pero la práctica del Reformer debe ser presencial para cumplir estándares y seguridad.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">¿Qué costo debo considerar?</h3>
              <p className="text-sm text-muted-foreground">Matrícula + material + horas clínicas. Pregunta por planes de pago y descuentos por pronto pago.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CertificacionPilates;
