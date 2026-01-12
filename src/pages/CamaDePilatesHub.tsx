import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DEFAULTS } from '@/lib/seo';
import LuxuryLayout from '@/components/layout/LuxuryLayout';
import { ArrowRight, BookOpen, ShoppingBag, DollarSign, Ruler, Package } from 'lucide-react';

const CamaDePilatesHub: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://camadepilates.com';
  const url = `${origin}/cama-de-pilates`;
  const title = 'Cama de Pilates: Guía, Precios y Dónde Comprar en México (2025)';
  const desc = 'Todo sobre la cama de Pilates (Reformer): tipos para casa y estudio, precios, dimensiones y dónde comprar en México con envío desde CDMX.';

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin },
      { '@type': 'ListItem', position: 2, name: 'Cama de Pilates', item: url },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cama de Pilates — Recursos',
    itemListElement: [
      { '@type': 'ListItem', position: 1, url: `${origin}/cama-de-pilates/en-venta`, name: 'Cama de Pilates en Venta' },
      { '@type': 'ListItem', position: 2, url: `${origin}/cama-de-pilates/precio`, name: 'Precio de Cama de Pilates' },
      { '@type': 'ListItem', position: 3, url: `${origin}/blog/dimensiones-cama-de-pilates`, name: 'Dimensiones de Cama de Pilates' },
      { '@type': 'ListItem', position: 4, url: `${origin}/product/reformer-profesional`, name: 'Reformer de Estudio' },
      { '@type': 'ListItem', position: 5, url: `${origin}/product/reformer-casa`, name: 'Reformer para Casa' },
      { '@type': 'ListItem', position: 6, url: `${origin}/packs/estudio`, name: 'Pack para Estudios (8+)' },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es una cama de Pilates (Reformer)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La cama de Pilates (Reformer) es un equipo con carro deslizante y resistencia por resortes que permite ejercicios para fuerza, control y movilidad. Se usa tanto en casa como en estudio.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta una cama de Pilates en México?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En México, una cama de Pilates para casa suele iniciar alrededor de MXN 25,000 y una de estudio ronda MXN 50,000, dependiendo de materiales, tolerancias, accesorios y garantía.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué diferencia hay entre un reformer para casa y uno profesional?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El reformer profesional prioriza rigidez estructural, estabilidad y uso diario intensivo; el reformer para casa busca un formato más compacto sin perder recorrido suave y seguro.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué espacio necesito para instalar una cama de Pilates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Además del largo del equipo, considera espacio lateral para entrar/salir y un margen en la parte trasera para accesorios. Revisa nuestra guía de dimensiones antes de comprar.',
        },
      },
    ],
  };

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
        <script type="application/ld+json">{JSON.stringify(faq)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto text-center">
        <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
          The Definitive Guide
        </span>
        <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
          Cama de Pilates
        </h1>
        <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed">
          En México, “cama de Pilates” y “Reformer” se usan para hablar del mismo equipo: la máquina con carro y resortes que se ve en estudios y también en casa.
          Aquí encuentras guía de compra, precios, dimensiones y dónde comprar tu cama de Pilates con envío desde CDMX.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/cama-de-pilates/en-venta" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2A2624] text-[#EAE8E4] text-xs uppercase tracking-widest hover:bg-[#3E2723] transition-colors">
            Cama de Pilates en venta <ArrowRight className="w-3 h-3" />
          </Link>
          <Link to="/cama-de-pilates/precio" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/70 border border-[#2A2624]/10 text-[#2A2624] text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Precio 2025
          </Link>
          <Link to="/products" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/70 border border-[#2A2624]/10 text-[#2A2624] text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Comparar modelos
          </Link>
          <Link to="/blog/dimensiones-cama-de-pilates" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/70 border border-[#2A2624]/10 text-[#2A2624] text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Dimensiones
          </Link>
        </div>

        <div className="mt-20 text-left max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-6">Qué revisar antes de comprar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <h3 className="text-lg font-semibold text-[#2A2624]">Silencio y recorrido</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">
                El “ruido” casi siempre viene de tolerancias flojas, ruedas y alineación. Si vas a usarla en departamento o estudio, prioriza estabilidad y un carro sin vibración.
              </p>
            </div>
            <div className="p-6 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <h3 className="text-lg font-semibold text-[#2A2624]">Materiales reales</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">
                Cuero genuino vs vinipiel, madera sólida (nogal) vs laminados, y acero estructural marcan durabilidad y sensación. Esto explica gran parte del precio.
              </p>
            </div>
            <div className="p-6 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <h3 className="text-lg font-semibold text-[#2A2624]">Para casa vs estudio</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">
                Para casa: tamaño y estética. Para estudio: rigidez, uso intensivo, repuestos y soporte. Si dudas, empieza en <Link to="/compare" className="underline decoration-[#2A2624]/30 hover:decoration-[#2A2624]">comparar modelos</Link>.
              </p>
            </div>
            <div className="p-6 border border-[#2A2624]/10 rounded-sm bg-white/50">
              <h3 className="text-lg font-semibold text-[#2A2624]">Entrega, garantía y repuestos</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">
                En México, la diferencia real está en logística: tiempos de entrega, garantía clara y repuestos. Verifica esto antes de decidir.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-left max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-6">Guías recomendadas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/blog/mejor-cama-de-pilates-para-casa" className="group p-6 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors">
              <h3 className="text-lg font-semibold text-[#2A2624] group-hover:text-[#3E2723]">Mejor cama de Pilates para casa</h3>
              <p className="mt-1 text-sm text-[#5D5550] font-light">Cómo elegir por espacio, presupuesto y accesorios.</p>
            </Link>
            <Link to="/blog/precio-cama-de-pilates-2025" className="group p-6 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors">
              <h3 className="text-lg font-semibold text-[#2A2624] group-hover:text-[#3E2723]">Precio de la cama de Pilates 2025</h3>
              <p className="mt-1 text-sm text-[#5D5550] font-light">Rangos reales en México y qué incluye cada nivel.</p>
            </Link>
            <Link to="/blog/mejores-marcas-cama-de-pilates" className="group p-6 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors">
              <h3 className="text-lg font-semibold text-[#2A2624] group-hover:text-[#3E2723]">Mejores marcas de cama de Pilates</h3>
              <p className="mt-1 text-sm text-[#5D5550] font-light">Criterios para comparar calidad, garantía y soporte.</p>
            </Link>
            <Link to="/blog/reformer-casa-vs-profesional" className="group p-6 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors">
              <h3 className="text-lg font-semibold text-[#2A2624] group-hover:text-[#3E2723]">Reformer para casa vs profesional</h3>
              <p className="mt-1 text-sm text-[#5D5550] font-light">Diferencias clave para decidir sin pagar de más.</p>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/cama-de-pilates/en-venta" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors text-left">
            <ShoppingBag className="w-6 h-6 text-[#3E2723] mb-4" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
              Modelos en Venta
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">
              Compra Reformers con entrega 3 semanas en México y garantía 1 año.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver opciones <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link to="/cama-de-pilates/precio" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors text-left">
            <DollarSign className="w-6 h-6 text-[#3E2723] mb-4" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
              Guía de Precios
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">
              Rangos 2025: MXN 25,000–50,000. Qué incluye y cómo comparar.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver precios <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link to="/blog/dimensiones-cama-de-pilates" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors text-left">
            <Ruler className="w-6 h-6 text-[#3E2723] mb-4" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
              Dimensiones
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">
              Medidas típicas, espacio lateral/trasero y consejos de instalación.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver guía <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link to="/product/reformer-profesional" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-[#2A2624] text-[#EAE8E4] hover:bg-[#3E2723] transition-colors text-left">
            <div className="w-6 h-6 mb-4 border border-[#EAE8E4] rounded-full flex items-center justify-center text-[10px]">P</div>
            <h2 className="text-xl font-serif italic text-[#EAE8E4] mb-2">
              Reformer de Estudio
            </h2>
            <p className="text-sm text-white/70 font-light mb-4">
              Silencio total, tolerancias precisas y estética premium.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#EAE8E4]">
              Ver Profesional <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link to="/product/reformer-casa" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-[#EAE8E4] hover:bg-white transition-colors text-left">
            <div className="w-6 h-6 mb-4 border border-[#2A2624] rounded-full flex items-center justify-center text-[10px] text-[#2A2624]">H</div>
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2">
              Reformer de Casa
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">
              Compacto y silencioso con cuero genuino. Entrega 3 semanas.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Ver Casa <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          <Link to="/packs/estudio" className="group p-8 border border-[#2A2624]/10 rounded-sm bg-white/50 hover:bg-white transition-colors text-left">
            <Package className="w-6 h-6 text-[#3E2723] mb-4" />
            <h2 className="text-xl font-serif italic text-[#2A2624] mb-2 group-hover:text-[#3E2723] transition-colors">
              Pack Estudios (8+)
            </h2>
            <p className="text-sm text-[#5D5550] font-light mb-4">
              20% de descuento, instalación coordinada y soporte.
            </p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2A2624]">
              Cotizar ahora <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

        <div className="mt-16 text-left max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif italic text-[#2A2624] mb-6">FAQ</h2>
          <div className="space-y-6">
            <div className="border border-[#2A2624]/10 rounded-sm bg-white/50 p-6">
              <h3 className="text-lg font-semibold text-[#2A2624]">¿Qué es una cama de Pilates (Reformer)?</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">Es un equipo con carro deslizante y resistencia por resortes que permite cientos de ejercicios para fuerza, control y movilidad, tanto en casa como en estudio.</p>
            </div>
            <div className="border border-[#2A2624]/10 rounded-sm bg-white/50 p-6">
              <h3 className="text-lg font-semibold text-[#2A2624]">¿Cuánto cuesta una cama de Pilates en México?</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">Como referencia, una opción para casa suele iniciar alrededor de MXN 25,000 y una de estudio ronda MXN 50,000 (varía por materiales, tolerancias, accesorios y garantía).</p>
            </div>
            <div className="border border-[#2A2624]/10 rounded-sm bg-white/50 p-6">
              <h3 className="text-lg font-semibold text-[#2A2624]">¿Qué diferencia hay entre un reformer para casa y uno profesional?</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">El profesional está pensado para uso intensivo diario y máxima estabilidad; el de casa busca un formato más compacto manteniendo seguridad y recorrido suave.</p>
            </div>
            <div className="border border-[#2A2624]/10 rounded-sm bg-white/50 p-6">
              <h3 className="text-lg font-semibold text-[#2A2624]">¿Qué espacio necesito para instalar una cama de Pilates?</h3>
              <p className="mt-2 text-sm text-[#5D5550] font-light leading-relaxed">Considera el largo del equipo más espacio lateral para entrar/salir y un margen trasero para accesorios. Revisa la guía de dimensiones antes de comprar.</p>
            </div>
          </div>
        </div>
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesHub;
