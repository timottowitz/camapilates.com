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

  return (
    <LuxuryLayout>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(itemList)}</script>
      </Helmet>

      <section className="relative pt-32 pb-20 px-8 md:px-24 max-w-[1800px] mx-auto text-center">
        <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#3E2723] mb-6">
          The Definitive Guide
        </span>
        <h1 className="text-5xl md:text-7xl font-serif italic text-[#2A2624] leading-[0.9] mb-8">
          Cama de Pilates
        </h1>
        <p className="text-lg text-[#5D5550] font-light max-w-2xl mx-auto leading-relaxed mb-16">
          Guía de compra, precios, dimensiones y dónde comprar tu cama de Pilates. Reformers silenciosos y precisos en cuero genuino, madera de nogal y acero.
        </p>

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
      </section>
    </LuxuryLayout>
  );
};

export default CamaDePilatesHub;
