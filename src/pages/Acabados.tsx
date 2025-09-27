import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULTS, getOrigin } from '@/lib/seo';
import { FeatureSplit } from '@/components/ui/feature-split';
import { ASSETS } from '@/lib/assets';
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

      <section className="bg-background">
        <div className="container mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-8 border border-border rounded-lg p-6 bg-card">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Edición Especial Mycelium (Mylo)</h2>
              <p className="mt-3 text-muted-foreground">
                Para quienes buscan una pieza única: ofrecemos una <strong>Edición Mycelium</strong> con material <em>Mylo</em> —una innovación de micelio con tacto refinado y origen renovable— por un suplemento de <strong>+$6,000 MXN</strong> sobre el modelo estándar.
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Conoce la tecnología detrás del material en el sitio de Bolt Threads (<a href="https://boltthreads.com/technology/mylo/" target="_blank" rel="noopener" className="text-primary hover:underline">Mylo</a>).
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a href="/product/reformer-mycelium" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Ver Edición Mycelium</a>
                <a href="https://boltthreads.com/technology/mylo/" target="_blank" rel="noopener" className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-foreground hover:text-background">Conocer Mylo</a>
              </div>
            </div>
            <div>
              <img src={ASSETS.myloSpecial} alt="Edición Especial Mycelium (Mylo)" className="w-full h-auto rounded-md border border-border" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Acabados;
