import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { CheckCircle2, MapPin, Calendar, MessageCircle, BookOpen, Hand, Users, Briefcase, Heart, GraduationCap } from 'lucide-react';
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

      {/* ========== EDELWEISS 400-HOUR PROGRAM SECTIONS ========== */}
      {/* Section A: The Why - Mastery Gap */}
      <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              La Diferencia Edelweiss
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-6">
              La Industria Se Ha Bifurcado.<br />
              <span className="not-italic font-light font-sans tracking-tight">Nosotros Construimos el Puente.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div className="bg-[#2A2624]/5 border border-[#2A2624]/10 rounded-sm p-8 md:p-12">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#5D5550] mb-6">El Problema de la Industria</h3>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-6">
                La educación actual te obliga a elegir: una <strong className="text-[#2A2624]">certificación express de fin de semana</strong> que carece de profundidad, 
                o un <strong className="text-[#2A2624]">programa integral de varios años</strong> que diluye tu enfoque entre todos los aparatos.
              </p>
              <ul className="space-y-3 text-[#5D5550] font-light">
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/40 flex-shrink-0"></span>
                  <span>Certificaciones de fin de semana: 40-60 horas, conocimiento superficial</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/40 flex-shrink-0"></span>
                  <span>Programas integrales: años de estudio, atención dispersa</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5D5550]/40 flex-shrink-0"></span>
                  <span>Ninguno produce verdaderos especialistas en Reformer</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/50 border border-[#3E2723]/20 rounded-sm p-8 md:p-12">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#3E2723] mb-6">La Solución Edelweiss</h3>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-6">
                Aplicamos el <strong className="text-[#2A2624]">rigor de una carrera universitaria completa</strong> exclusivamente al Reformer. 
                Al dedicar <strong className="text-[#3E2723]">400 horas a un solo aparato</strong>, formamos graduados con el razonamiento clínico 
                de un fisioterapeuta y la calidad de movimiento de un bailarín.
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-[#2A2624]/10">
                <div className="text-center">
                  <div className="text-3xl font-serif italic text-[#3E2723]">400</div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Horas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif italic text-[#3E2723]">1</div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Aparato</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif italic text-[#3E2723]">100%</div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Presencial</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: Somatic Promise - Anti-Online */}
      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/40 mb-6">
              La Promesa Somática
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic leading-tight mb-6">
              No Puedes Descargar<br />
              <span className="not-italic font-light font-sans tracking-tight">"El Tacto."</span>
            </h2>
            <p className="text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
              En una era de anatomía por Zoom y certificaciones híbridas, Edelweiss se mantiene firme: 
              Pilates es una práctica kinestésica. Algunas cosas simplemente no se pueden transmitir a través de una pantalla.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-white/10 rounded-sm p-8 hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white/80" />
              </div>
              <h3 className="text-xl font-serif italic mb-4">Empatía Somática</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Aprende a leer el sistema nervioso de tu cliente a través de su respiración y tono—habilidades 
                que no se pueden transmitir por una pantalla. Siente los cambios sutiles que indican 
                disposición, fatiga o liberación emocional.
              </p>
            </div>

            <div className="border border-white/10 rounded-sm p-8 hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Hand className="w-6 h-6 text-white/80" />
              </div>
              <h3 className="text-xl font-serif italic mb-4">Inteligencia Táctil</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Nuestros laboratorios de "Anatomía en 3D"—construyendo músculos en arcilla—y talleres 
                prácticos de asistencia aseguran que no solo memorices anatomía; la sientas. Tus manos 
                se convierten en herramientas diagnósticas.
              </p>
            </div>

            <div className="border border-white/10 rounded-sm p-8 hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white/80" />
              </div>
              <h3 className="text-xl font-serif italic mb-4">100% Presencial</h3>
              <p className="text-white/60 font-light leading-relaxed">
                Sin atajos en línea. Sin compromisos híbridos. Cada hora de tu programa de 400 horas 
                ocurre en el estudio, con cuerpos reales, resortes reales y retroalimentación 
                real de mentores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Curriculum - The 5 Pillars */}
      <section className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              El Plan de Estudios
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-6">
              400 Horas.<br />
              <span className="not-italic font-light font-sans tracking-tight">Cinco Pilares de Maestría.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Phase I */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#3E2723] transition-colors">
                  <BookOpen className="w-5 h-5 text-[#3E2723] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Fase I</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">50h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">La Ciencia</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Anatomía Aplicada y Kinesiología</li>
                <li>• Laboratorios 3D "Arcilla y Cadáver"</li>
                <li>• Biomecánica de Resortes</li>
                <li>• Evaluación Postural</li>
              </ul>
            </div>

            {/* Phase II */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#3E2723] transition-colors">
                  <GraduationCap className="w-5 h-5 text-[#3E2723] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Fase II</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">100h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">El Repertorio</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Ejercicios Esenciales a Archivales</li>
                <li>• Respiración de Percusión Fletcher</li>
                <li>• Secuencias de Acondicionamiento Atlético</li>
                <li>• Progresiones y Modificaciones</li>
              </ul>
            </div>

            {/* Phase III */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#3E2723] transition-colors">
                  <MessageCircle className="w-5 h-5 text-[#3E2723] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Fase III</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">30h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">El Arte de Enseñar</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Programación Neurolingüística (PNL)</li>
                <li>• Modulación de Voz e Instrucciones</li>
                <li>• Pedagogía Informada en Trauma</li>
                <li>• Flujo de Clase y Manejo de Energía</li>
              </ul>
            </div>

            {/* Phase IV */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#3E2723] transition-colors">
                  <Heart className="w-5 h-5 text-[#3E2723] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Fase IV</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">60h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Aplicación Clínica</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Patologías de la Columna Vertebral</li>
                <li>• Protocolos Pre/Post-Natales</li>
                <li>• Rehabilitación de Lesiones</li>
                <li>• Poblaciones Especiales</li>
              </ul>
            </div>

            {/* Phase V */}
            <div className="group border border-[#2A2624]/10 rounded-sm p-8 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723]/10 flex items-center justify-center group-hover:bg-[#3E2723] transition-colors">
                  <Briefcase className="w-5 h-5 text-[#3E2723] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#5D5550]">Fase V</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">20h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">El Negocio</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Educación Financiera para Instructores</li>
                <li>• Empleo vs. Emprendimiento</li>
                <li>• Psicología de Retención de Clientes</li>
                <li>• Construyendo Tu Marca</li>
              </ul>
            </div>

            {/* Residency */}
            <div className="group border-2 border-[#3E2723]/30 bg-[#3E2723]/5 rounded-sm p-8 hover:bg-[#3E2723]/10 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#3E2723] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#3E2723]">Residencia</div>
                  <div className="text-2xl font-serif italic text-[#3E2723]">140h</div>
                </div>
              </div>
              <h3 className="text-xl font-serif italic text-[#2A2624] mb-3">Experiencia Práctica</h3>
              <ul className="space-y-2 text-sm text-[#5D5550] font-light">
                <li>• Sesiones de Enseñanza por Segmentos</li>
                <li>• Horas de Clínica Comunitaria</li>
                <li>• Retroalimentación de Mentores en Tiempo Real</li>
                <li>• Estudios de Caso de Clientes</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-8 bg-[#2A2624] text-[#EAE8E4] px-12 py-6 rounded-sm">
              <div className="text-center">
                <div className="text-3xl font-serif italic">400</div>
                <div className="text-xs uppercase tracking-widest text-white/60">Horas Totales</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-serif italic">260h</div>
                <div className="text-xs uppercase tracking-widest text-white/60">Formación Base</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-serif italic">140h</div>
                <div className="text-xs uppercase tracking-widest text-white/60">Residencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section D: Residency Differentiator */}
      <section className="py-24 px-8 md:px-24 bg-white/40 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
                La Residencia
              </span>
              <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-6">
                No Solo Observación.<br />
                <span className="not-italic font-light font-sans tracking-tight">Un Modelo de Hospital Escuela.</span>
              </h2>
              <p className="text-lg text-[#5D5550] font-light leading-relaxed mb-8">
                La mayoría de los cursos requieren que te sientes al fondo y observes. En Edelweiss, trabajas. 
                Nuestra residencia de 140 horas sigue el modelo de hospital escuela de medicina—aprendes haciendo, 
                con supervisión experta en cada paso.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors"
              >
                Comienza Tu Camino
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-[#2A2624]/10 rounded-sm p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-serif italic text-[#3E2723]">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-serif italic text-[#2A2624] mb-2">Enseñanza por Segmentos</h3>
                    <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                      Enseña a clientes reales bajo supervisión de mentores. Comienza con ejercicios individuales, 
                      progresa a sesiones completas. Construye confianza a través de la repetición.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#2A2624]/10 rounded-sm p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-serif italic text-[#3E2723]">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-serif italic text-[#2A2624] mb-2">Clínicas Comunitarias</h3>
                    <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                      Atiende poblaciones diversas en sesiones comunitarias supervisadas. 
                      Experimenta el espectro completo de necesidades y adaptaciones de clientes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#2A2624]/10 rounded-sm p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#3E2723]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-serif italic text-[#3E2723]">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-serif italic text-[#2A2624] mb-2">Retroalimentación en Tiempo Real</h3>
                    <p className="text-sm text-[#5D5550] font-light leading-relaxed">
                      Cada hora de enseñanza incluye retroalimentación inmediata y accionable. 
                      Gradúate con experiencia, no solo con teoría.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ========== END EDELWEISS 400-HOUR PROGRAM SECTIONS ========== */}

      <PreRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        source="/certificacion-pilates"
      />
    </LuxuryLayout>
  );
};

export default CertificacionPilates;
