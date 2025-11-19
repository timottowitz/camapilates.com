import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { CheckCircle2, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import PreRegistrationModal from '@/components/certification/PreRegistrationModal';

const CITIES = [
  { key: 'cdmx', name: 'Ciudad de México (CDMX)', kw: ['certificación pilates cdmx', 'certificación pilates reformer cdmx', 'certificación pilates mexico df'] },
  { key: 'guadalajara', name: 'Guadalajara (Jalisco)', kw: ['certificación de pilates en guadalajara jalisco', 'certificación pilates guadalajara'] },
  { key: 'monterrey', name: 'Monterrey (NL)', kw: ['certificación de pilates en monterrey', 'certificación pilates monterrey'] },
  { key: 'puebla', name: 'Puebla', kw: ['certificación pilates puebla'] },
  { key: 'queretaro', name: 'Querétaro', kw: ['certificación pilates querétaro'] },
];

const PRIMARY_WHATSAPP = 'https://wa.me/523222787690?text=Hola%20Edelweiss%2C%20quiero%20inscribirme%20a%20la%20certificaci%C3%B3n%20de%20Pilates';
const SUPPORT_EMAIL = 'mailto:valery@camadepilates.com?subject=Certificaci%C3%B3n%20de%20Pilates%20-%20Informaci%C3%B3n';

const CertificacionPilates: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const origin = getOrigin();
  const title = 'Certificación de Pilates (Reformer) en México — CDMX, Guadalajara y Monterrey';
  const desc = 'Conecta con certificaciones de Pilates Reformer y Mat en México. Sedes en CDMX, Guadalajara y Monterrey. Requisitos, duración, costos y registro.';

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
    <LuxuryLayout>
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

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-8">
              Education
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
              Master the Art <br />
              <span className="not-italic font-light font-sans tracking-tight">of Teaching.</span>
            </h1>
            <p className="text-lg text-[#5D5550] font-light max-w-xl leading-relaxed mb-8">
              Edelweiss te conecta con certificaciones de Pilates en México (Reformer y Mat). Sedes en CDMX, Guadalajara y Monterrey.
              Recibe asesoría sobre requisitos, duración, costos y próximas fechas.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={PRIMARY_WHATSAPP} className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors">
                Inscribirme
              </a>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#EAE8E4] transition-colors"
              >
                Pre-registro
              </button>
            </div>

            <ul className="mt-12 grid sm:grid-cols-2 gap-4">
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Reformer y Mat
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Programas 150–450 h
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Práctica supervisada
              </li>
              <li className="flex items-center gap-3 text-sm text-[#5D5550] font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723]"></span> Bolsa de trabajo
              </li>
            </ul>
          </div>

          <div className="bg-white/50 border border-[#2A2624]/10 p-8 md:p-12 rounded-sm backdrop-blur-sm">
            <h2 className="text-2xl font-serif italic text-[#2A2624] mb-8">Upcoming Locations</h2>
            <div className="space-y-4">
              {CITIES.slice(0, 3).map(c => (
                <a key={c.key} href={`#${c.key}`} className="group block border border-[#2A2624]/10 rounded-sm p-6 hover:bg-white transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-[#2A2624] flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#3E2723]" />
                      {c.name}
                    </div>
                    <span className="text-xs uppercase tracking-widest text-[#3E2723] opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                  </div>
                  <div className="text-xs text-[#5D5550] font-light flex items-center gap-2 ml-6">
                    <Calendar className="h-3 w-3" /> Fechas próximas
                  </div>
                </a>
              ))}
            </div>
            <p className="text-xs text-[#5D5550] mt-6 text-center font-light">También disponible en Puebla y Querétaro.</p>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-serif italic text-[#2A2624] mb-12 text-center">Locations & Registration</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {CITIES.map((c) => (
              <div key={c.key} id={c.key} className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white transition-colors duration-500">
                <h3 className="text-2xl font-serif italic text-[#2A2624] mb-4">
                  {c.name}
                </h3>
                <p className="text-sm text-[#5D5550] font-light mb-8 leading-relaxed">
                  Programas en fines de semana e intensivos. Modalidades Mat y Reformer con práctica supervisada. Cupo limitado.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={PRIMARY_WHATSAPP + `%20en%20${encodeURIComponent(c.name)}`} className="px-6 py-3 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors">
                    Inscribirme
                  </a>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-widest hover:bg-[#EAE8E4] transition-colors"
                  >
                    Pre-registro
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Requirements & Duration</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Edad 18+, experiencia básica en Pilates o movimiento.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Reformer: práctica supervisada y horas clínicas (observación, asistencia y enseñanza).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Duración estimada: 150–450 h totales según programa.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3E2723] flex-shrink-0"></span>
                <span>Evaluación teórica/práctica y proyecto final.</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-serif italic text-[#2A2624] mb-6">Choosing a Program</h2>
            <ul className="space-y-4 text-[#5D5550] font-light">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Revisa el plan de estudios (Mat/Reformer) y número de horas.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Confirma práctica clínica supervisada y mentoreo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Validez y avales (estándares internacionales cuando aplique).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/50 flex-shrink-0"></span>
                <span>Bolsa de trabajo y red de estudios afiliados.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif italic mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Puedo certificarme solo en Reformer?</h3>
              <p className="text-white/60 font-light leading-relaxed">Sí. Algunas escuelas ofrecen Reformer como módulo independiente; otras requieren base en Mat. Te guiamos según tu perfil.</p>
            </div>
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Existen opciones online?</h3>
              <p className="text-white/60 font-light leading-relaxed">La teoría puede ser online, pero la práctica del Reformer debe ser presencial para cumplir estándares y seguridad.</p>
            </div>
            <div className="border-b border-white/10 pb-8">
              <h3 className="font-serif italic text-xl mb-4">¿Qué costo debo considerar?</h3>
              <p className="text-white/60 font-light leading-relaxed">Matrícula + material + horas clínicas. Pregunta por planes de pago y descuentos por pronto pago.</p>
            </div>
          </div>
        </div>
      </section>

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        source="/certificacion-pilates"
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilates;
