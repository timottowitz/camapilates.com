import React from 'react';
import { Award, Calendar, CheckCircle2, Globe, MapPin, Users } from 'lucide-react';
import {
  STOTT_COURSES,
  STOTT_EXAM_PROCESS,
  STOTT_PROVIDER,
  STOTT_STATUS_LABEL,
  STOTT_VENUE,
  formatMXN,
  type StottCourse,
} from '@/content/certification/stottCdmx';

interface StottPremiumProgramProps {
  onPreRegister: () => void;
  whatsappBase: string;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-[#3E2723]/10 text-[#3E2723]',
  lastSpots: 'bg-[#EB4C42]/10 text-[#EB4C42]',
  full: 'bg-[#2A2624]/10 text-[#5D5550]',
  soon: 'bg-[#2A2624]/5 text-[#5D5550]',
};

const CourseCard: React.FC<{
  course: StottCourse;
  onPreRegister: () => void;
  whatsappBase: string;
}> = ({ course, onPreRegister, whatsappBase }) => {
  const wa = `${whatsappBase}${encodeURIComponent(
    `Hola, quiero información sobre la certificación ${course.name} en CDMX`
  )}`;
  const soldOut = course.dates.every(d => d.status === 'full' || d.status === 'soon');

  return (
    <div
      className={`flex flex-col border rounded-sm p-8 transition-colors duration-500 ${
        course.featured
          ? 'border-2 border-[#3E2723]/40 bg-white shadow-sm'
          : 'border-[#2A2624]/10 bg-white/50 hover:bg-white'
      }`}
    >
      {course.featured && (
        <span className="self-start mb-4 px-3 py-1 bg-[#3E2723] text-[#EAE8E4] rounded-full text-[10px] uppercase tracking-[0.2em]">
          Curso Principal
        </span>
      )}
      <div className="text-xs uppercase tracking-widest text-[#5D5550] mb-2">{course.level}</div>
      <h3 className="text-2xl font-serif italic text-[#2A2624] mb-2">{course.shortName}</h3>
      <div className="text-xs uppercase tracking-widest text-[#3E2723] mb-4">{course.modality}</div>
      <p className="text-sm text-[#5D5550] font-light leading-relaxed mb-6">{course.tagline}</p>

      <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#2A2624]/10">
        <div>
          <div className="text-3xl font-serif italic text-[#3E2723]">
            {course.price ? formatMXN(course.price) : 'Por anunciar'}
          </div>
          {course.deposit && (
            <div className="text-xs text-[#5D5550] font-light mt-1">
              Apartado: {formatMXN(course.deposit)}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-serif italic text-[#2A2624]">{course.hours.total}h</div>
          <div className="text-xs uppercase tracking-widest text-[#5D5550]">Totales</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6 text-center">
        <div>
          <div className="text-lg font-serif italic text-[#3E2723]">{course.hours.instruccion}h</div>
          <div className="text-[10px] uppercase tracking-wider text-[#5D5550]">Instrucción</div>
        </div>
        <div>
          <div className="text-lg font-serif italic text-[#3E2723]">{course.hours.observacion}h</div>
          <div className="text-[10px] uppercase tracking-wider text-[#5D5550]">Observación</div>
        </div>
        <div>
          <div className="text-lg font-serif italic text-[#3E2723]">{course.hours.practicaPersonal}h</div>
          <div className="text-[10px] uppercase tracking-wider text-[#5D5550]">Práctica</div>
        </div>
        <div>
          <div className="text-lg font-serif italic text-[#3E2723]">{course.hours.ensenanza}h</div>
          <div className="text-[10px] uppercase tracking-wider text-[#5D5550]">Enseñanza</div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {course.dates.map(d => (
          <div key={d.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-[#5D5550] font-light">
              <Calendar className="w-3.5 h-3.5 text-[#3E2723]" /> {d.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${STATUS_STYLES[d.status]}`}>
              {STOTT_STATUS_LABEL[d.status]}
            </span>
          </div>
        ))}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {course.curriculum.map(item => (
          <li key={item} className="flex items-start gap-3 text-sm text-[#5D5550] font-light">
            <CheckCircle2 className="mt-0.5 w-3.5 h-3.5 text-[#3E2723] flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="text-xs text-[#5D5550] font-light mb-6 pt-4 border-t border-[#2A2624]/10">
        <strong className="text-[#2A2624] font-medium">Requisitos:</strong> {course.prerequisites}
        {course.priceNote && <span className="block mt-2">{course.priceNote}</span>}
      </div>

      <div className="flex items-center justify-between gap-3 mb-6 text-xs text-[#5D5550] font-light">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#3E2723]" /> Cupo: {course.capacity} personas
        </span>
        <span className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#3E2723]" /> {course.cecs.toFixed(1)} CECs Merrithew®
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={wa}
          className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-colors ${
            soldOut
              ? 'border border-[#2A2624]/20 text-[#5D5550] hover:bg-[#EAE8E4]'
              : 'bg-[#2A2624] text-[#EAE8E4] hover:bg-[#3E2723]'
          }`}
        >
          {soldOut ? 'Lista de espera' : 'Inscribirme'}
        </a>
        <button
          onClick={onPreRegister}
          className="px-6 py-3 border border-[#2A2624]/20 text-[#2A2624] rounded-full text-xs uppercase tracking-widest hover:bg-[#EAE8E4] transition-colors"
        >
          Pre-registro
        </button>
      </div>
    </div>
  );
};

const StottPremiumProgram: React.FC<StottPremiumProgramProps> = ({ onPreRegister, whatsappBase }) => {
  return (
    <>
      {/* Course catalog */}
      <section id="programa-stott" className="py-24 px-8 md:px-24 border-t border-[#2A2624]/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
              Programa Premium · Ciudad de México
            </span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2A2624] leading-tight mb-6">
              Certificación {STOTT_PROVIDER.method}<br />
              <span className="not-italic font-light font-sans tracking-tight">
                El Gold Standard de la industria<span className="text-[#EB4C42]">.</span>
              </span>
            </h2>
            <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
              {STOTT_PROVIDER.description} Impartida por {STOTT_PROVIDER.name}, con respaldo de{' '}
              {STOTT_PROVIDER.backing} y validez internacional en {STOTT_PROVIDER.countries}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {STOTT_COURSES.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onPreRegister={onPreRegister}
                whatsappBase={whatsappBase}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why STOTT + venue */}
      <section className="py-24 px-8 md:px-24 bg-[#2A2624] text-[#EAE8E4]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="block text-xs font-sans tracking-[0.3em] uppercase text-white/40 mb-6">
                La Sede
              </span>
              <h2 className="text-4xl md:text-5xl font-serif italic leading-tight mb-6">
                {STOTT_VENUE.name}<br />
                <span className="not-italic font-light font-sans tracking-tight">Santa Fe, CDMX.</span>
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                {STOTT_VENUE.status}. {STOTT_VENUE.equipment}: entrenas con los mismos reformers,
                Cadillacs y accesorios con los que se enseña el método en todo el mundo.
              </p>
              <div className="flex items-start gap-3 text-sm text-white/60 font-light mb-4">
                <MapPin className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                <span>{STOTT_VENUE.address}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-white/60 font-light">
                <Globe className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                <span>Certificación con reconocimiento en más de 100 países</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-serif italic mb-8">Ruta hacia tu Certificación Internacional</h3>
              <ol className="space-y-6">
                {STOTT_EXAM_PROCESS.map((step, idx) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-sm font-serif italic">
                      {idx + 1}
                    </span>
                    <p className="text-white/60 font-light leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-white/10 rounded-sm p-6 text-center">
              <div className="text-3xl font-serif italic mb-1">125h</div>
              <div className="text-xs uppercase tracking-widest text-white/50">Intensive Reformer</div>
            </div>
            <div className="border border-white/10 rounded-sm p-6 text-center">
              <div className="text-3xl font-serif italic mb-1">139</div>
              <div className="text-xs uppercase tracking-widest text-white/50">Ejercicios Reformer</div>
            </div>
            <div className="border border-white/10 rounded-sm p-6 text-center">
              <div className="text-3xl font-serif italic mb-1">12</div>
              <div className="text-xs uppercase tracking-widest text-white/50">Alumnos por grupo</div>
            </div>
            <div className="border border-white/10 rounded-sm p-6 text-center">
              <div className="text-3xl font-serif italic mb-1">100+</div>
              <div className="text-xs uppercase tracking-widest text-white/50">Países de validez</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StottPremiumProgram;
