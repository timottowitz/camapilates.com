import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { getOrigin } from '@/lib/seo';
import {
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Award,
  Heart,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { WEBINAR_INFO, CERTIFICATION_COHORTS } from '@/content/certification/cohortsData';

type CohortChoice = 'queretaro-nov-2026' | 'monterrey-dec-jan-2026-2027' | 'both';

const COHORT_LABELS: Record<CohortChoice, string> = {
  'queretaro-nov-2026': 'Querétaro',
  'monterrey-dec-jan-2026-2027': 'Monterrey',
  both: 'Querétaro / Monterrey',
};

const FAQS = [
  {
    question: '¿Ya pasó el Info Day?',
    answer:
      'Sí. El Info Day del 26 de septiembre ya se realizó. Gracias a todas las personas que se conectaron y nos hicieron preguntas con Gabi y Laura Munive.',
  },
  {
    question: '¿Cómo funciona la lista de espera?',
    answer:
      'Déjanos tu nombre, correo y WhatsApp junto con la sede que te interesa. Cuando haya novedades de los próximos cursos en tu ciudad, te avisamos directamente por WhatsApp y correo.',
  },
  {
    question: '¿Tiene algún costo o compromiso?',
    answer:
      'No. Anotarte en la lista de espera es gratis y no te obliga a nada. Solo sirve para que seas de las primeras personas en enterarte.',
  },
  {
    question: '¿Qué pasa si mi ciudad no es Querétaro ni Monterrey?',
    answer:
      'Elige "Ambas sedes" y escríbenos por WhatsApp para contarnos desde dónde nos sigues. Tomamos en cuenta esas solicitudes al planear nuevas fechas.',
  },
];

export const CertificacionWebinar: React.FC = () => {
  const origin = getOrigin();
  const joinWaitlist = useMutation(api.certificationPreRegistrations.submitServiceWaitlist);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cohort, setCohort] = useState<CohortChoice>('queretaro-nov-2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const scrollToRegistro = () => {
    document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
  };

  const chooseCohortAndScroll = (choice: CohortChoice) => {
    setCohort(choice);
    scrollToRegistro();
  };

  useEffect(() => {
    if (window.location.hash === '#registro') {
      const timer = setTimeout(scrollToRegistro, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa tu nombre, correo y teléfono de WhatsApp.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Por favor ingresa un número de WhatsApp válido de 10 dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await joinWaitlist({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phoneDigits,
        cohort,
        serviceOrPlan: 'Lista de espera próximos cursos (post Info Day)',
        source: 'webinar-landing-waitlist',
      });
      setIsRegistered(true);
    } catch (err: unknown) {
      console.error('Waitlist submission failed:', err);
      setErrorMsg('No pudimos guardar tu registro. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canonicalUrl = `${origin}/certificacion-pilates/webinar`;
  const pageTitle = 'Gracias por asistir al Info Day | Lista de espera Certificación Pilates Reformer';
  const pageDescription =
    'El Info Day del 26 de septiembre ya terminó. Gracias por acompañarnos. Súmate a la lista de espera de los próximos cursos de certificación Pilates Reformer en Querétaro y Monterrey.';
  const whatsappUrl = `https://wa.me/${WEBINAR_INFO.whatsappSupportNumber}?text=${encodeURIComponent(
    `Hola Gabi y Laura, me anoté en la lista de espera de los próximos cursos. Mi nombre es ${fullName || 'aspirante'} y me interesa ${COHORT_LABELS[cohort]}.`
  )}`;

  const cohortCards = [
    { key: 'queretaro-nov-2026' as const, label: 'Querétaro · Noviembre 2026', data: CERTIFICATION_COHORTS.queretaro, cta: 'Anotarme para Querétaro' },
    { key: 'monterrey-dec-jan-2026-2027' as const, label: 'Monterrey · Dic 2026 – Ene 2027', data: CERTIFICATION_COHORTS.monterrey, cta: 'Anotarme para Monterrey' },
  ];

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${origin}/og/cama-de-pilates-venta-mexico.png`} />
      </Helmet>

      <div className="bg-[#2A2624] text-[#EAE8E4] py-2.5 px-4 text-center text-xs md:text-sm font-sans tracking-wide border-b border-[#3E2723]">
        <span className="inline-flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-[#D9865B]" />
          <strong>El Info Day del 26 de septiembre ya terminó.</strong> ¡Gracias por acompañarnos!
        </span>
      </div>

      <section className="relative pt-16 pb-20 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs uppercase tracking-[0.2em] font-medium mb-6">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Info Day finalizado
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif italic text-[#2A2624] leading-[1.08] mb-6">
            Gracias por ser parte del Info Day
          </h1>

          <p className="text-base sm:text-xl text-[#5D5550] font-light leading-relaxed max-w-3xl mx-auto">
            Agradecemos a todas las personas que se conectaron y compartieron sus preguntas con <strong>Gabi</strong> y <strong>Laura Munive</strong>. Si todavía quieres certificarte en Pilates Reformer, súmate a la <strong>lista de espera</strong> y te avisaremos primero sobre los próximos cursos en Querétaro y Monterrey.
          </p>
        </div>

        <div id="registro" className="max-w-3xl mx-auto">
          {!isRegistered ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#2A2624]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 via-[#D9865B] to-[#3E2723]"></div>

              <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold inline-block mb-2 border border-emerald-200">
                  Lista de espera
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-[#2A2624]">
                  Entérate primero de los próximos cursos
                </h2>
                <p className="text-sm text-[#5D5550] mt-2 max-w-xl mx-auto">
                  Déjanos tus datos y te escribiremos cuando haya novedades de fechas y sedes. Es gratis y sin compromiso.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2A2624] font-semibold mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Mariana Morales"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A2624] text-sm text-gray-800"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2A2624] font-semibold mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mariana@ejemplo.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A2624] text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2A2624] font-semibold mb-2">
                      WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="4421234567 ó 8181234567"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A2624] text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2A2624] font-semibold mb-2">
                    Sede de tu interés *
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {([
                      ['queretaro-nov-2026', 'Querétaro', 'Noviembre 2026 (Fines de semana)'],
                      ['monterrey-dec-jan-2026-2027', 'Monterrey', 'Dic 2026 – Ene 2027 (Fines de semana)'],
                      ['both', 'Ambas Sedes', 'Abierta a opciones / Por definir'],
                    ] as const).map(([value, title, detail]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCohort(value)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          cohort === value
                            ? 'border-[#2A2624] bg-[#2A2624] text-white shadow-md'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-sm">{title}</div>
                        <div className="text-xs opacity-80 mt-1">{detail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-xl bg-[#2A2624] hover:bg-[#3E2723] text-[#EAE8E4] font-medium text-sm md:text-base uppercase tracking-[0.18em] transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Guardando...'
                  ) : (
                    <>
                      <span>Unirme a la Lista de Espera</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Gratis y sin compromiso. Solo te escribiremos sobre los próximos cursos.</span>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-emerald-500/30 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider inline-block mb-3">
                ¡Ya estás en la lista de espera!
              </span>

              <h2 className="text-3xl font-serif italic text-[#2A2624] mb-4">
                Gracias, te avisaremos primero
              </h2>

              <p className="text-base text-[#5D5550] max-w-xl mx-auto mb-8">
                Hola <strong>{fullName}</strong>, anotamos tu interés en <strong>{COHORT_LABELS[cohort]}</strong>. Cuando haya novedades de los próximos cursos te escribiremos por WhatsApp y correo.
              </p>

              <div className="max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Saludar al equipo por WhatsApp</span>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
                ¿Dudas? Escríbenos a <a href="mailto:valery@camadepilates.com" className="underline">valery@camadepilates.com</a> o por WhatsApp al +52 55 4846 8190.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 lg:px-24 bg-[#EAE8E4]/40 border-t border-b border-[#2A2624]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#3E2723] font-semibold block mb-3">
              Tus Formadoras & Mentoras
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#2A2624]">
              Aprende con Gabi y Laura Munive
            </h2>
            <p className="text-base text-[#5D5550] font-light mt-4">
              Más de 15 años de trayectoria combinada en biomecánica clínica, docencia internacional y dirección de estudios boutique de alto rendimiento en México.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {WEBINAR_INFO.hosts.map((host) => (
              <div key={host.name} className="bg-white rounded-2xl p-8 shadow-sm border border-[#2A2624]/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#2A2624] text-[#EAE8E4] flex items-center justify-center font-serif text-2xl italic">
                    {host.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic text-[#2A2624]">{host.name}</h3>
                    <p className="text-xs uppercase tracking-wider text-[#D9865B] font-semibold">{host.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[#5D5550] leading-relaxed font-light">{host.bio}</p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <Award className="w-4 h-4 text-[#3E2723]" />
                  <span>Docente titular en las cohortes de Querétaro y Monterrey</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-serif italic text-center text-[#2A2624] mb-10">
          Próximas Cohortes Presenciales
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {cohortCards.map(({ key, label, data, cta }) => (
            <div key={key} className="border border-[#2A2624]/15 rounded-3xl p-8 bg-white/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-md bg-[#2A2624] text-[#EAE8E4] text-xs uppercase tracking-widest font-semibold mb-4">
                  {label}
                </div>
                <h3 className="text-2xl font-serif italic text-[#2A2624] mb-2">{data.fullDatesLabel}</h3>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.scheduleHours} · {data.location.neighborhood}
                </p>

                <div className="space-y-3 text-sm text-gray-700 mb-6">
                  {data.weekends.map((w) => (
                    <div key={w.weekendNumber} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="font-semibold text-[#2A2624] text-xs uppercase tracking-wide">
                        Fin de semana {w.weekendNumber}: {w.dates}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{w.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => chooseCohortAndScroll(key)}
                className="block w-full text-center py-3 rounded-xl bg-[#2A2624] text-white text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors"
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 md:px-16 lg:px-24 bg-white border-t border-[#2A2624]/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#3E2723] font-semibold block mb-2">
              Dudas Frecuentes
            </span>
            <h2 className="text-3xl font-serif italic text-[#2A2624]">
              Preguntas sobre la lista de espera
            </h2>
          </div>

          <div className="space-y-6">
            {FAQS.map(({ question, answer }) => (
              <div key={question} className="p-6 rounded-2xl bg-[#EAE8E4]/30 border border-[#2A2624]/10">
                <h3 className="font-serif text-lg text-[#2A2624] mb-2 font-semibold">{question}</h3>
                <p className="text-sm text-[#5D5550] font-light leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={scrollToRegistro}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#2A2624] text-[#EAE8E4] rounded-full text-xs uppercase tracking-[0.2em] hover:bg-[#3E2723] transition-colors shadow-lg"
            >
              <span>Unirme a la Lista de Espera</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CertificacionWebinar;
