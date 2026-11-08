import React from 'react';
import { Link } from 'react-router-dom';
import { STOTT_COURSES, STOTT_PROVIDER, STOTT_VENUE, formatMXN } from '@/content/certification/stottCdmx';

// The STOTT PILATES® program in Santa Fe is run by another school; we only point students to it.
const StottCdmxSection: React.FC = () => (
  <section className="py-16 px-6 bg-neutral-100/70 border-t border-neutral-200">
    <div className="max-w-7xl mx-auto">
      <div className="max-w-3xl mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
          // OTRA OPCIÓN EN MÉXICO · PROGRAMA ASOCIADO EXTERNO
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mt-2 mb-4">
          Certificación STOTT PILATES® en Ciudad de México (Santa Fe)
        </h2>
        <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
          Para alumnas radicadas en la Ciudad de México que buscan específicamente la ruta internacional
          STOTT PILATES® de Merrithew®, mantenemos vinculación académica con el centro anfitrión oficial{' '}
          <strong>{STOTT_PROVIDER.name}</strong> en <strong>{STOTT_VENUE.name}</strong> (Torre 300, Santa Fe).
          Toma en cuenta que esta alternativa cuenta con aranceles externos de certificación internacional
          ($38,000 a $60,000+ MXN) y su propia convocatoria independiente.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {STOTT_COURSES.map((course) => (
          <div
            key={course.id}
            className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                {course.level}
              </div>
              <div className="font-bold text-lg text-neutral-900 mb-2">{course.name}</div>
              <p className="text-xs text-neutral-600 mb-4 leading-relaxed line-clamp-3">
                {course.tagline}
              </p>
              <div className="text-2xl font-bold text-neutral-900 mb-1">
                {course.price ? formatMXN(course.price) : 'Por anunciar'}
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                {course.hours.total} horas totales · {course.modality}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-neutral-100 flex flex-col gap-2">
              <a
                href={`https://wa.me/525548468190?text=${encodeURIComponent(
                  `Hola, me interesa la información y requisitos para la certificación STOTT PILATES en Santa Fe (${course.name}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider text-center hover:bg-neutral-800 transition-colors"
              >
                Consultar por WhatsApp
              </a>
              <Link
                to="/certificacion-pilates/cdmx"
                className="w-full py-2 rounded-full border border-neutral-300 text-neutral-700 text-xs font-mono uppercase tracking-wider text-center hover:border-neutral-900 transition-colors"
              >
                Ver Sede CDMX →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 font-mono">
        <div>
          <strong>Ubicación Sede CDMX:</strong> {STOTT_VENUE.address}
        </div>
        <Link
          to="/certificacion-pilates/cdmx"
          className="text-neutral-900 font-bold hover:underline shrink-0"
        >
          Explorar Guía Completa de STOTT CDMX →
        </Link>
      </div>
    </div>
  </section>
);

export default StottCdmxSection;
