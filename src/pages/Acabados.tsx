import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { FeatureSplit } from '@/components/ui/feature-split';
import RibbonBanner from '@/components/ui/ribbon-banner';

const Acabados: React.FC = () => {
  const origin = getOrigin();
  const url = `${origin}/acabados`;
  const title = 'Acabados: Nogal, Blanco, Negro y Micelio (Sostenible)';
  const desc = 'Explora los acabados para tu cama de Pilates: nogal, blanco, negro y micelio (sostenible). Estética premium con materiales durables y mantenimiento simple.';

  return (
    <>
      <Helmet>
        <title>{title} | {DEFAULTS.siteName}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
      </Helmet>

      <RibbonBanner />

      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Acabados</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Cada acabado está pensado para integrarse con la estética de tu espacio: cálido nogal, luminoso blanco, elegante negro y micelio (sostenible) con un tacto refinado.</p>
        </div>
      </section>

      <FeatureSplit
        title="Nogal"
        copy="Madera de nogal con veta cálida y acabado protector que respira. Eleva la calidez del estudio y luce mejor con el tiempo."
        image={{ src: '/images/finish-walnut.jpg', alt: 'Acabado nogal en Reformer' }}
      />

      <FeatureSplit
        title="Blanco"
        copy="Superficie limpia y luminosa que multiplica la luz del espacio. Ideal para ambientes contemporáneos."
        image={{ src: '/images/finish-white.jpg', alt: 'Acabado blanco en Reformer' }}
      />

      <FeatureSplit
        title="Negro"
        copy="Elegante y sobrio. Oculta marcas de uso y aporta un carácter minimalista."
        image={{ src: '/images/finish-black.jpg', alt: 'Acabado negro en Reformer' }}
      />

      <FeatureSplit
        title="Micelio (sostenible)"
        copy="Alternativa de origen renovable con tacto cálido y estética refinada. Probada en flexión y abrasión para uso intensivo; resistente a la decoloración y fácil de mantener."
        image={{ src: '/images/finish-mycelium.webp', alt: 'Acabado micelio en Reformer' }}
        cta={{ href: '/product/reformer-profesional', label: 'Ver en Reformer de Estudio' }}
      />
    </>
  );
};

export default Acabados;
