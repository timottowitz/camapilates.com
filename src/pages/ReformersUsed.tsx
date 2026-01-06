import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { DEFAULTS, generateBreadcrumbSchema, getOrigin } from '@/lib/seo';
import BackLink from '@/components/ui/back-link';

const ReformersUsed: React.FC = () => {
  const origin = getOrigin();
  const title = 'Reformers usadas — Guía de compra en México';
  const desc = 'Checklist para comprar una reformer usada en México: qué revisar, rangos de precio, señales de desgaste y cómo negociar con seguridad.';

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Reformers', url: '/reformers/usadas' },
    { name: 'Usadas' },
  ]);

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${origin}/reformers/usadas`} />
        <meta property="og:site_name" content={DEFAULTS.siteName} />
        <meta property="og:locale" content={DEFAULTS.locale} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/reformers/usadas`} />
        <meta property="og:image" content={`${origin}${DEFAULTS.ogImage}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-6 md:px-10 py-10">
        <BackLink className="mb-6" fallbackTo="/reformers/nuevas" label="Volver" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#2A2624]">Reformers usadas</h1>
            <p className="mt-2 text-sm text-[#5D5550] max-w-2xl">Una guía práctica para comprar equipo usado con confianza: qué revisar, cuánto pagar y cuándo conviene mejor una nueva.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/reformers/nuevas" className="text-xs uppercase tracking-widest text-[#3E2723] hover:opacity-70">Ver nuevas</Link>
            <span className="text-[#2A2624]/20">•</span>
            <a href="https://wa.me/523222787690" className="text-xs uppercase tracking-widest text-[#3E2723] hover:opacity-70">Pedir checklist por WhatsApp</a>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <main className="lg:col-span-8 space-y-8">
            <section className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
              <h2 className="text-xl font-serif italic text-[#2A2624]">Checklist rápido (10 minutos)</h2>
              <ul className="mt-4 space-y-2 text-sm text-[#2A2624] list-disc pl-5">
                <li>Carro: deslizamiento suave, sin ruidos o saltos; revisa ruedas y rieles.</li>
                <li>Resortes: oxidación, tensión pareja, ganchos firmes; pide fotos cercanas.</li>
                <li>Cables/correas: desgaste, costuras, hebillas y puntos de fricción.</li>
                <li>Tapicería: hundimientos, grietas, mal olor (humedad) y roturas.</li>
                <li>Estructura: juego en uniones, tornillería, marcas de golpes o madera abierta.</li>
                <li>Accesorios: box, jumpboard, straps; verifica compatibilidad y faltantes.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
              <h2 className="text-xl font-serif italic text-[#2A2624]">¿Cuánto pagar?</h2>
              <p className="mt-3 text-sm text-[#2A2624]">Como regla práctica, el precio depende más del estado (ruedas/rieles, resortes y tapicería) que del año. Considera el costo de refacciones y mantenimiento antes de cerrar.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/compare" className="rounded-full bg-[#3E2723] text-white px-5 py-2 text-xs uppercase tracking-widest hover:opacity-90">Comparar antes de comprar</Link>
                <Link to="/blog" className="rounded-full border border-[#2A2624]/15 bg-white/40 px-5 py-2 text-xs uppercase tracking-widest text-[#2A2624] hover:bg-white/70">Leer guías</Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
              <h2 className="text-xl font-serif italic text-[#2A2624]">Señales para evitar</h2>
              <ul className="mt-4 space-y-2 text-sm text-[#2A2624] list-disc pl-5">
                <li>No hay fotos del carro/ruedas/rieles o se niegan a una prueba corta.</li>
                <li>Resortes mezclados (diferente largo/tensión) sin justificación.</li>
                <li>Vibración notable al mover el carro o ruidos metálicos constantes.</li>
                <li>Promesas vagas (“como nueva”) sin evidencia de mantenimiento.</li>
              </ul>
            </section>
          </main>

          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
                <div className="text-xs uppercase tracking-widest text-[#5D5550]">¿Quieres vender una usada?</div>
                <p className="mt-2 text-sm text-[#2A2624]">Escríbenos por WhatsApp con fotos y ciudad. Te decimos cómo listarla y qué información incluir.</p>
                <a href="https://wa.me/523222787690" className="mt-4 block rounded-full bg-[#3E2723] text-white px-5 py-2 text-xs uppercase tracking-widest text-center hover:opacity-90">Contactar</a>
              </div>

              <div className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
                <div className="text-xs uppercase tracking-widest text-[#5D5550]">Alternativa recomendada</div>
                <p className="mt-2 text-sm text-[#2A2624]">Si el costo de reparación + riesgo es alto, revisa las nuevas con filtros y cotización rápida.</p>
                <Link to="/reformers/nuevas" className="mt-4 block rounded-full border border-[#2A2624]/15 bg-white/40 px-5 py-2 text-xs uppercase tracking-widest text-center text-[#2A2624] hover:bg-white/70">Ver reformers nuevas</Link>
              </div>

              <div className="rounded-2xl border border-[#2A2624]/10 bg-white/60 p-6">
                <div className="text-xs uppercase tracking-widest text-[#5D5550]">Directorio</div>
                <p className="mt-2 text-sm text-[#2A2624]">¿Vas a practicar antes de comprar? Encuentra un estudio cerca de ti.</p>
                <Link to="/estudios-de-pilates" className="mt-4 block rounded-full border border-[#2A2624]/15 bg-white/40 px-5 py-2 text-xs uppercase tracking-widest text-center text-[#2A2624] hover:bg-white/70">Buscar estudios</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </LuxuryLayout>
  );
};

export default ReformersUsed;
